# Ancient Rome — the 1000-card plan

The running order for the `col-40` Ancient Rome collection. Every card has a number, a topic and a
deck, fixed in advance, so the collection can be grown one card at a time across many sessions without
anyone having to remember where it had got to.

Not part of the site.

## How to use this (the whole point of the file)

**"Generate the next Ancient Rome card" means: take the lowest `rm-NNN` that is not yet in `data.js`,
read its topic and deck from the list below, research it, and add it.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));
      for(let i=1;i<=1000;i++){const id='rm-'+String(i).padStart(3,'0');
      if(!h.has(id)){console.log('next:',id);break}}"

There is deliberately **no separate progress file**. `data.js` is the record of what exists, this file
is the record of what is planned, and the next card is whatever falls between them — so the two can
never disagree about where the work has got to.

Then write the card to the rules in CLAUDE.md ("Generating cards & glossary entries") and add it with:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** `add-card.js` falls back to the first leaf in the whole tree when it is
omitted, which is `cn-myth`, in the China collection.

Note that the numbering runs past 999, so ids are **not** all the same length: `rm-001` … `rm-999`,
then `rm-1000`. The command above pads to three digits, which is right for every id but the last.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `rm-218 Battle of Cannae` is already an answer term; `rm-028 Etruscan religion` is an area, and
the card's actual answer — the word that gets blanked — is chosen while writing it, from what the
sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** Some will turn out
to be thinner than they look, and a few will turn out to be two cards. When that happens, change the
line here in the same commit as the card, and say so — this file is only useful while it is true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

Card ids run `rm-001` … `rm-1000`, in the order below. Numbering follows the tree, and the first four
decks follow chronology, so their running order is roughly chronological — which also means an early
card and a late card in the same deck sort together on the study page, since cards are ordered by
`cardYears(answerDate)` and not by id. The last three decks are thematic and their order is a reading
order rather than a claim about dates: `rm-901 The Vestal Virgins` is older than most of the deck it
sits in.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Early Rome | Italy before Rome | 45 | rm-001–045 |
| | Rome under the kings | 45 | rm-046–090 |
| The Roman Republic | The early Republic | 50 | rm-091–140 |
| | The conquest of Italy | 40 | rm-141–180 |
| | The Punic Wars | 55 | rm-181–235 |
| | Rome and the Mediterranean | 40 | rm-236–275 |
| | The Republic in crisis | 45 | rm-276–320 |
| | The fall of the Republic | 50 | rm-321–370 |
| The Principate | Augustus | 45 | rm-371–415 |
| | The Julio-Claudians | 40 | rm-416–455 |
| | Civil war and the Flavians | 35 | rm-456–490 |
| | The high empire | 45 | rm-491–535 |
| | The Severans and the third-century crisis | 30 | rm-536–565 |
| Late Antiquity | Diocletian and Constantine | 30 | rm-566–595 |
| | The Christian empire | 25 | rm-596–620 |
| | The end of the western empire | 20 | rm-621–640 |
| How Rome Worked | The Roman army | 55 | rm-641–695 |
| | Government, law and citizenship | 55 | rm-696–750 |
| | Provinces and frontiers | 35 | rm-751–785 |
| Roman Life | Family, household and slavery | 40 | rm-786–825 |
| | The Roman city and daily life | 40 | rm-826–865 |
| | Spectacle and leisure | 25 | rm-866–890 |
| Religion, Letters and the Arts | Roman religion and myth | 40 | rm-891–930 |
| | Latin literature and thought | 40 | rm-931–970 |
| | Art, architecture and engineering | 30 | rm-971–1000 |

Deck totals: Early Rome 90 · The Roman Republic 280 · The Principate 195 · Late Antiquity 75 ·
How Rome Worked 145 · Roman Life 105 · Religion, Letters and the Arts 110. **1000.**

## What the weighting is arguing

**The Republic gets 280 and the Principate 195**, which is the opposite of the popular weighting —
emperors sell, and a Rome course written to demand is a queue of Caesars. The Republic is where Rome's
institutions were made, stretched and broken, and almost every question worth asking about Rome as a
state is asked in those four and a half centuries. The empire's interest, by contrast, is mostly not in
the succession of reigns at all: it is in the army, the provinces, the law and the cities, and those
have decks of their own further down.

**A third of the collection — 360 cards — sits outside the narrative altogether.** Rome's distinctive
mark on the world is institutional and material rather than biographical: a legal system still taught,
an army that was also an engineering corps, a road network, an urban form, a citizenship that could be
granted. A course that spends all thousand cards on who fought whom teaches none of it.

**Early Rome keeps 90 cards, half of them before Rome.** Rome did not begin in a vacuum, and the usual
compression of Etruscan and Italic Italy into a paragraph before Romulus is both bad history and the
reason the regal period reads as legend rather than as a period. Forty-five cards on Italy before Rome
is the argument that the Etruscans are a subject and not a prologue.

**Late Antiquity gets 75 and stops at the West.** The collection is *Ancient Rome*; the eastern empire
survived it by a thousand years and is a different course. See the note on the coda below.

**The Punic Wars get 55, the largest single subdeck outside the institutions.** They are the pivot: a
central-Italian power that entered them became a Mediterranean empire that could not go back to being
governed as a city-state, and every crisis in `rm-crisis` traces to something that happened in them.

## Five decisions this plan forced on the tree

Written down because they were made here, not in the tree, and the reasoning is invisible from the
tree itself.

**Monuments live with their builders; techniques live in `rm-arts`.** The Colosseum is `rm-475`, under
the Flavians; the Pantheon is `rm-508`, under Hadrian; Trajan's Column is `rm-497`. A Roman public
building is a political act by a named man in a named year, and filing it under architecture makes it
a style instead. What `rm-arts` carries is the things no reign owns — concrete, the arch, the vault,
verism, the four Pompeian styles, road construction, surveying. This is the same rule Greece uses when
it puts the Parthenon in `gr-athenian-empire` rather than in its culture subdeck.

**Latin literature is ONE subdeck, where Greece has three period ones.** Greek literature is written in
period dialects for period institutions, so the Archaic and Classical culture subdecks work; Latin
literature is taught, and read, as a single canon running from Plautus to Ammianus, and splitting it
across `rm-republic` and `rm-principate` would put Cicero four decks from Tacitus for no gain. The
authors and works live in `rm-literature`; the events live in the narrative decks. Virgil is
cross-listed to `rm-augustus`, Caesar's *Commentaries* to `rm-fall-republic`.

**There is no myth deck, and Greece has one of 120 cards.** Greek myth is a body of stories with its
own internal logic, told for centuries by people who were not writing history. Rome's legends are
foundation legends: Romulus, Lucretia, the Horatii, Cincinnatus, Horatius at the bridge are told *in
order to explain an institution*, and separating them from the institution is what makes them read as
fairy tales. They stay in `rm-kings` and `rm-early-republic`, beside the constitutional facts they are
there to justify. `rm-religion` therefore gets the cult and not the tales — the interesting thing about
Jupiter at Rome is the Capitoline temple and the priesthood, not his genealogy.

**The Roman army gets its own 55-card subdeck rather than being spread through the wars.** A battle
card teaches a battle; the legion, the auxiliary, the marching camp, the career and the discharge
diploma are a system that outlasted every one of them, and they were reaching every narrative subdeck
at one card each and being taught nowhere.

**The eastern empire is a coda of three cards, not a deck.** `rm-637` the survival of the East,
`rm-638` Justinian's reconquest and `rm-640` the legacy of Rome are the whole of it, and the reader
going onward is served by `wh-byzantium` in World History. A Byzantium subdeck here would be either
dishonestly short or the beginning of a second collection.

## History, not archaeology — and the two other pulls

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Do not restate either here; what follows is only
what is specific to this collection.

The archaeology pull is real but narrow. It bites on `rm-italy`, where the Etruscans are known largely
through tombs and the reachable sources are excavation reports, and on the Vesuvius cards
(`rm-477`–`rm-480`), where the temptation is to write about the digging of Pompeii rather than about
the town. Elsewhere Rome is the best-documented ancient state there is and the sources are texts.

Two pulls are stronger here than the archaeological one, and both are worth watching for by name:

**Commemoration.** Rome wrote its own history as a moral pageant, and the accessible sources are that
pageant. A card on Cincinnatus that says a good man laid down power has repeated Livy rather than
described a tradition; a card on the *Pax Romana* that says the world was at peace has repeated the
Ara Pacis. State what happened, what it was for, and what it cost, and where the story is a story, say
that it is one — `rm-176 The Roman triumph` and `rm-108 Cincinnatus` are the two to get right early,
because the register they establish is the one the rest of the collection is read in.

**Great men.** This collection cannot avoid named individuals the way a world survey can: for six
centuries Rome dated its own years by two men's names, and a reign genuinely is a unit of periodisation.
The safeguard is not a quota but a rule — **no person is the subject of a run of cards.** Where several
cards carry one name (Caesar, Augustus, Hannibal, Cicero) they are events, offices and works, not
episodes of a biography, and the thematic third of the collection has almost no personal names in it at
all. Before writing a person onto a line that does not have one, ask what process the card would
otherwise have taught.

**Modern scholars are capped at two in the thousand and the plan spends none of them.** Greece spends
four because the Bronze Age Aegean was *discovered* — Evans named a civilisation, the decipherment of
Linear B changed what the mainland had spoken. Nothing equivalent happened to Rome, which was never
lost. The one place a scholar was nearly earned is the argument about the fall, and `rm-639 Explaining
the fall of Rome` is deliberately about the question rather than about Gibbon: the debate runs from
Ammianus and Augustine through the eighteenth century to the present, and naming one participant in the
answer term would misrepresent it. Two slots stay unspent in case the research says otherwise.

## Living beside the other collections

Folio has separate collections for **Ancient Greece** (`col-13`) and **World History** (`col-8`), and
both overlap this one on purpose.

**World History is the survey and never waits for this collection.** Rome gets 40 cards there
(`wh-336`–`wh-375`) against 1000 here. The rule in `docs/world-history-card-plan.md` cuts both ways:
ten sentences on the Roman Republic is a different card from ten sentences on the Conflict of the
Orders, and neither should quietly become the other.

**Greece and Rome meet head-on in the second century BCE, and both sides of it are written.** Greece's
`gr-under-rome` covers the Roman conquest from the Greek end; `rm-mediterranean` covers it from Rome's.
This is not duplication, it is the same events in two registers, and the pairs to write deliberately
differently are:

| event | in Greece | in Rome |
|---|---|---|
| Pyrrhus | `gr-846`, `gr-847` — the last Hellenistic king to fight in the West | `rm-164`–`rm-168` — the first Hellenistic army Rome beat |
| Cynoscephalae | `gr-853` — the end of Macedonian independence | `rm-241` — how Rome came to govern the East |
| the sack of Corinth | `gr-864` — the end of Greek political freedom | `rm-256` — what Rome did with a city that resisted |
| Actium | `gr-874` — the end of the Hellenistic age | `rm-387` — the end of the Roman civil wars |
| Cleopatra VII | `gr-876` — the last Ptolemy | `rm-384`, `rm-388` — Rome's annexation of Egypt |

Write the card its own collection needs. A reader who has both will meet the pair and see two histories
of one afternoon, which is the point.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `rm-949 Virgil`, `rm-950 The Aeneid` → also `rm-augustus`
- `rm-351 Caesar's Commentaries`, `rm-956 Livy` → also their narrative decks
- `rm-399 The praetorian guard` → also `rm-army`
- `rm-155 Maniple`, `rm-295 The Marian reforms` → also `rm-army`
- `rm-545 The Antonine Constitution` → also `rm-government`, which is where citizenship is taught
- `rm-478 Pompeii`, `rm-479 Herculaneum` → also `rm-daily-life`, which is largely written from them
- `rm-475 The Colosseum` → also `rm-spectacle`

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`). The glossary has essentially nothing Roman — of its
671 terms, `Latin` and `Italy` are the whole of it — so this collection is open ground from `rm-001`,
exactly as Greece was. Write the terms **cited from the start**, at the `GLOSS_SRC_TARGET` bar of 2,
rather than opening a backlog to be closed later.

Rome is the friendliest sourcing ground on the site. Perseus carries the Latin corpus with commentaries;
the British Museum, the Met, the Capitoline and the Vatican publish object records; `penelope.uchicago.edu`
hosts out-of-copyright Loebs and *Lacus Curtius*; the epigraphic corpora are open; and the whole
nineteenth-century reference literature is on the Internet Archive. The two thin patches are worth
knowing in advance: **Etruscan studies**, where much of the current work is in Italian journals behind
paywalls, and **late antiquity**, where the theological controversies are better served by confessional
sites than by scholarship and the cited source has to be chosen with care.

---

# The list

## Early Rome

### Italy before Rome — `rm-italy`

    rm-001  Ancient Italy
    rm-002  The geography of Italy
    rm-003  The Tiber
    rm-004  Latium
    rm-005  The Alban Hills
    rm-006  Bronze Age Italy
    rm-007  Terramare culture
    rm-008  Villanovan culture
    rm-009  Italic peoples
    rm-010  Latins
    rm-011  The Latin League
    rm-012  Sabines
    rm-013  Samnites
    rm-014  Oscan
    rm-015  Umbrians
    rm-016  Iguvine Tablets
    rm-017  Volsci and Aequi
    rm-018  Ligurians
    rm-019  Veneti
    rm-020  Messapians
    rm-021  Gauls in Italy
    rm-022  Etruscan civilisation
    rm-023  The origins of the Etruscans
    rm-024  Etruscan cities
    rm-025  The Etruscan league
    rm-026  Etruscan language
    rm-027  Pyrgi Tablets
    rm-028  Etruscan religion
    rm-029  Haruspicy
    rm-030  Etrusca disciplina
    rm-031  Etruscan tomb painting
    rm-032  Tarquinia
    rm-033  Caere
    rm-034  Banditaccia necropolis
    rm-035  Veii
    rm-036  Vulci
    rm-037  Etruscan bronzework
    rm-038  Bucchero
    rm-039  Apollo of Veii
    rm-040  Etruscan expansion into Campania
    rm-041  Etruscan sea power
    rm-042  Battle of Alalia
    rm-043  Magna Graecia
    rm-044  Cumae
    rm-045  Etruscan Italy and the rise of Rome

### Rome under the kings — `rm-kings`

    rm-046  The Roman Kingdom
    rm-047  Forum Boarium
    rm-048  The Seven Hills of Rome
    rm-049  Palatine Hill
    rm-050  Capitoline Hill
    rm-051  The casa Romuli and the Iron Age huts
    rm-052  The foundation of Rome
    rm-053  Romulus and Remus
    rm-054  Capitoline Wolf
    rm-055  Aeneas in Roman legend
    rm-056  Alba Longa
    rm-057  Ab urbe condita
    rm-058  The rape of the Sabine women
    rm-059  Titus Tatius
    rm-060  Romulus
    rm-061  Numa Pompilius
    rm-062  The calendar of Numa
    rm-063  Tullus Hostilius
    rm-064  Horatii and Curiatii
    rm-065  Ancus Marcius
    rm-066  Tarquinius Priscus
    rm-067  Cloaca Maxima
    rm-068  Circus Maximus
    rm-069  Servius Tullius
    rm-070  The Servian constitution
    rm-071  Comitia centuriata
    rm-072  Servian Wall
    rm-073  The Roman census
    rm-074  Tarquinius Superbus
    rm-075  Temple of Jupiter Optimus Maximus
    rm-076  Sibylline Books
    rm-077  Lucretia
    rm-078  The expulsion of the kings
    rm-079  Lucius Junius Brutus
    rm-080  Rex sacrorum
    rm-081  Comitia curiata
    rm-082  The early Senate
    rm-083  Patricians
    rm-084  Plebeians
    rm-085  Gens
    rm-086  Roman naming conventions
    rm-087  Pomerium
    rm-088  Roman Forum
    rm-089  Lapis Niger
    rm-090  The sources for regal Rome

## The Roman Republic

### The early Republic — `rm-early-republic`

    rm-091  Roman Republic
    rm-092  The consulship
    rm-093  Fasti Consulares
    rm-094  Imperium
    rm-095  Fasces
    rm-096  Annuality and collegiality
    rm-097  Horatius Cocles
    rm-098  Lars Porsenna
    rm-099  Battle of Lake Regillus
    rm-100  Foedus Cassianum
    rm-101  Conflict of the Orders
    rm-102  The first secession of the plebs
    rm-103  Tribune of the plebs
    rm-104  Sacrosanctity
    rm-105  Concilium plebis
    rm-106  The aedileship
    rm-107  Coriolanus
    rm-108  Cincinnatus
    rm-109  Roman dictator
    rm-110  Twelve Tables
    rm-111  The decemvirate
    rm-112  Appius Claudius Crassus
    rm-113  Verginia
    rm-114  The Valerio-Horatian laws
    rm-115  Lex Canuleia
    rm-116  Consular tribunes
    rm-117  The censorship
    rm-118  The quaestorship
    rm-119  The early Roman legion
    rm-120  Siege of Veii
    rm-121  Marcus Furius Camillus
    rm-122  The introduction of military pay
    rm-123  Battle of the Allia
    rm-124  The Gallic sack of Rome
    rm-125  Brennus
    rm-126  The geese of the Capitol
    rm-127  Aius Locutius
    rm-128  Licinio-Sextian laws
    rm-129  Lex Genucia
    rm-130  Nobiles
    rm-131  Cursus honorum
    rm-132  The praetorship
    rm-133  Lex Ovinia
    rm-134  Lex Poetelia
    rm-135  Lex Hortensia
    rm-136  Lex Ogulnia
    rm-137  Appius Claudius Caecus
    rm-138  Via Appia
    rm-139  Aqua Appia
    rm-140  Aes grave

### The conquest of Italy — `rm-conquest-italy`

    rm-141  Roman expansion in Italy
    rm-142  Latin War
    rm-143  Feriae Latinae
    rm-144  Praefectura
    rm-145  Latin rights
    rm-146  Municipium
    rm-147  Civitas sine suffragio
    rm-148  Colonia
    rm-149  Latin colony
    rm-150  Ager publicus
    rm-151  Samnite Wars
    rm-152  First Samnite War
    rm-153  Second Samnite War
    rm-154  Caudine Forks
    rm-155  Maniple
    rm-156  Third Samnite War
    rm-157  Battle of Sentinum
    rm-158  Roman conquest of Etruria
    rm-159  Roman conquest of Umbria and Picenum
    rm-160  Senones
    rm-161  Battle of Telamon
    rm-162  Roman conquest of Cisalpine Gaul
    rm-163  Tarentum
    rm-164  Pyrrhus of Epirus
    rm-165  Battle of Heraclea
    rm-166  Battle of Asculum
    rm-167  Pyrrhic victory
    rm-168  Battle of Beneventum
    rm-169  Siege of Tarentum
    rm-170  The Roman confederation
    rm-171  Socii
    rm-172  Formula togatorum
    rm-173  Via Flaminia
    rm-174  Via Aemilia
    rm-175  Roman roads in Italy
    rm-176  Roman triumph
    rm-177  Evocatio
    rm-178  The Romanisation of Italy
    rm-179  The spread of Latin in Italy
    rm-180  Roman Italy

### The Punic Wars — `rm-punic-wars`

    rm-181  Carthage
    rm-182  The Carthaginian empire
    rm-183  The Carthaginian constitution
    rm-184  The Carthaginian navy
    rm-185  The Roman–Carthaginian treaties
    rm-186  First Punic War
    rm-187  Mamertines
    rm-188  Messana
    rm-189  Hiero II of Syracuse
    rm-190  Siege of Agrigentum
    rm-191  The first Roman fleet
    rm-192  Corvus
    rm-193  Battle of Mylae
    rm-194  Battle of Cape Ecnomus
    rm-195  The African expedition of 256 BCE
    rm-196  Marcus Atilius Regulus
    rm-197  Siege of Lilybaeum
    rm-198  Hamilcar Barca
    rm-199  Battle of the Aegates Islands
    rm-200  The Treaty of Lutatius
    rm-201  The Roman annexation of Sicily
    rm-202  The first Roman province
    rm-203  Mercenary War
    rm-204  The seizure of Sardinia and Corsica
    rm-205  The Barcid conquest of Spain
    rm-206  New Carthage
    rm-207  The Ebro treaty
    rm-208  Saguntum
    rm-209  Second Punic War
    rm-210  Hannibal
    rm-211  Hannibal's crossing of the Alps
    rm-212  War elephant
    rm-213  Battle of the Ticinus
    rm-214  Battle of the Trebia
    rm-215  Battle of Lake Trasimene
    rm-216  Fabius Maximus
    rm-217  Fabian strategy
    rm-218  Battle of Cannae
    rm-219  Double envelopment
    rm-220  Rome after Cannae
    rm-221  The defection of Capua
    rm-222  Siege of Syracuse
    rm-223  The Spanish campaigns of the Scipios
    rm-224  Scipio Africanus
    rm-225  The capture of New Carthage
    rm-226  Battle of Ilipa
    rm-227  Hasdrubal's march into Italy
    rm-228  Battle of the Metaurus
    rm-229  Scipio's African campaign
    rm-230  Masinissa
    rm-231  Battle of Zama
    rm-232  The peace of 201 BCE
    rm-233  The Hannibalic War and the Italian countryside
    rm-234  Third Punic War
    rm-235  The destruction of Carthage

### Rome and the Mediterranean — `rm-mediterranean`

    rm-236  Conference of Naupactus
    rm-237  Illyrian Wars
    rm-238  First Macedonian War
    rm-239  Philip V of Macedon
    rm-240  Second Macedonian War
    rm-241  Battle of Cynoscephalae
    rm-242  Titus Quinctius Flamininus
    rm-243  The freedom of the Greeks
    rm-244  Antiochus III
    rm-245  Roman–Seleucid War
    rm-246  Battle of Thermopylae, 191 BCE
    rm-247  Battle of Magnesia
    rm-248  Treaty of Apamea
    rm-249  Third Macedonian War
    rm-250  Perseus of Macedon
    rm-251  Battle of Pydna
    rm-252  Lucius Aemilius Paullus
    rm-253  The settlement of Macedonia
    rm-254  Day of Eleusis
    rm-255  Achaean War
    rm-256  The sack of Corinth, 146 BCE
    rm-257  The province of Macedonia
    rm-258  The province of Asia
    rm-259  The bequest of Attalus III
    rm-260  The revolt of Aristonicus
    rm-261  The Roman conquest of Spain
    rm-262  Celtiberian Wars
    rm-263  Lusitanian War
    rm-264  Viriathus
    rm-265  Numantine War
    rm-266  Scipio Aemilianus
    rm-267  The Roman provincial system
    rm-268  Publicani
    rm-269  Provincial taxation under the Republic
    rm-270  The wealth of empire
    rm-271  Greek influence on Roman culture
    rm-272  Roman philhellenism
    rm-273  Cato the Elder
    rm-274  The Bacchanalian affair
    rm-275  Roman sumptuary law

### The Republic in crisis — `rm-crisis`

    rm-276  The crisis of the Roman Republic
    rm-277  Latifundium
    rm-278  The decline of the Italian smallholder
    rm-279  Slavery in Italian agriculture
    rm-280  First Servile War
    rm-281  Tiberius Gracchus
    rm-282  Lex Sempronia agraria
    rm-283  The Gracchan land commission
    rm-284  The death of Tiberius Gracchus
    rm-285  Gaius Gracchus
    rm-286  Lex frumentaria
    rm-287  Equestrian order
    rm-288  The extortion court
    rm-289  Senatus consultum ultimum
    rm-290  The death of Gaius Gracchus
    rm-291  Optimates and populares
    rm-292  Jugurthine War
    rm-293  Jugurtha
    rm-294  Gaius Marius
    rm-295  The Marian reforms
    rm-296  Capite censi
    rm-297  The Cimbri and the Teutones
    rm-298  Battle of Arausio
    rm-299  Battle of Aquae Sextiae
    rm-300  Battle of Vercellae
    rm-301  The consulships of Marius
    rm-302  Saturninus
    rm-303  Second Servile War
    rm-304  Marcus Livius Drusus the Younger
    rm-305  Social War
    rm-306  The Italian demand for citizenship
    rm-307  Lex Julia of 90 BCE
    rm-308  The enfranchisement of Italy
    rm-309  Sulla
    rm-310  First Mithridatic War
    rm-311  Mithridates VI
    rm-312  Asiatic Vespers
    rm-313  Sulla's march on Rome
    rm-314  Cinna
    rm-315  The Marian terror
    rm-316  The civil war of 83 BCE
    rm-317  Battle of the Colline Gate
    rm-318  Proscription
    rm-319  Sulla's dictatorship
    rm-320  The Sullan constitution

### The fall of the Republic — `rm-fall-republic`

    rm-321  The fall of the Roman Republic
    rm-322  The revolt of Lepidus
    rm-323  Sertorius
    rm-324  Sertorian War
    rm-325  Pompey the Great
    rm-326  Marcus Licinius Crassus
    rm-327  Spartacus
    rm-328  Third Servile War
    rm-329  The consulship of 70 BCE
    rm-330  The restoration of the tribunate
    rm-331  Cilician piracy
    rm-332  Lex Gabinia
    rm-333  Third Mithridatic War
    rm-334  Lucullus
    rm-335  Pompey's settlement of the East
    rm-336  Cicero
    rm-337  The trial of Verres
    rm-338  The consulship of Cicero
    rm-339  Catiline
    rm-340  Catilinarian conspiracy
    rm-341  The debate on the conspirators
    rm-342  Cato the Younger
    rm-343  Julius Caesar
    rm-344  First Triumvirate
    rm-345  Caesar's consulship of 59 BCE
    rm-346  Publius Clodius Pulcher
    rm-347  The exile of Cicero
    rm-348  Political violence in the late Republic
    rm-349  The conference at Luca
    rm-350  Gallic Wars
    rm-351  Caesar's Commentaries
    rm-352  Vercingetorix
    rm-353  Siege of Alesia
    rm-354  Caesar's British expeditions
    rm-355  Crassus' Parthian campaign
    rm-356  Battle of Carrhae
    rm-357  The death of Clodius
    rm-358  Pompey's sole consulship
    rm-359  The crossing of the Rubicon
    rm-360  Caesar's Civil War
    rm-361  Battle of Dyrrhachium
    rm-362  Battle of Pharsalus
    rm-363  The death of Pompey
    rm-364  Alexandrian War
    rm-365  Battle of Thapsus
    rm-366  Battle of Munda
    rm-367  Caesar's dictatorship
    rm-368  Julian calendar
    rm-369  Ides of March
    rm-370  Marcus Junius Brutus

`rm-370` was planned as *Brutus and Cassius* and renamed when it was written: a card has one answer
term, and *Brutus and Cassius* is not a term the glossary could head. Both men are in the card; the
answer is Brutus, whose descent and praetorship are what the sources argue about, and Cassius takes
his own entry when `rm-377 Battle of Philippi` is written.

## The Principate

### Augustus — `rm-augustus`

    rm-371  Augustus
    rm-372  Octavian's inheritance
    rm-373  War of Mutina
    rm-374  Second Triumvirate
    rm-375  The proscriptions of 43 BCE
    rm-376  The death of Cicero
    rm-377  Battle of Philippi
    rm-378  Perusine War
    rm-379  Pact of Brundisium
    rm-380  Sextus Pompey
    rm-381  Battle of Naulochus
    rm-382  Marcus Agrippa
    rm-383  Mark Antony in the East
    rm-384  Antony and Cleopatra
    rm-385  Donations of Alexandria
    rm-386  The propaganda war of the 30s BCE
    rm-387  Battle of Actium
    rm-388  The annexation of Egypt
    rm-389  The first settlement of 27 BCE
    rm-390  Clipeus virtutis
    rm-391  Princeps
    rm-392  The second settlement of 23 BCE
    rm-393  Tribunicia potestas
    rm-394  Imperium proconsulare maius
    rm-395  Principate
    rm-396  Res Gestae Divi Augusti
    rm-397  Imperial province
    rm-398  Discharge gratuity
    rm-399  Praetorian Guard
    rm-400  Aerarium militare
    rm-401  Temple of Apollo Palatinus
    rm-402  Forum of Augustus
    rm-403  Ara Pacis
    rm-404  Mausoleum of Augustus
    rm-405  Augustus of Prima Porta
    rm-406  Ludi saeculares
    rm-407  Ius trium liberorum
    rm-408  Julia the Elder
    rm-409  Lares Augusti
    rm-410  Princeps iuventutis
    rm-411  Livia
    rm-412  Agrippa Postumus
    rm-413  Nero Claudius Drusus
    rm-414  Battle of the Teutoburg Forest
    rm-415  Divus Augustus

Three of the first ten lines named a subject rather than an answer term, and the cards were written to
the term the sources will carry. **`rm-372 Octavian's inheritance`** is answered by the **will of Julius
Caesar**, which is the document Suetonius reports in full and the thing a reader meets again; the line
described what the will did to one man rather than naming anything the glossary could head.
**`rm-375 The proscriptions of 43 BCE`** is answered by **triumviral proscription**, because the general
practice is already `rm-318`'s answer and its glossary term is Sullan — a second card on the bare word
would have re-carded the first. And **`rm-376 The death of Cicero`** takes the shape `rm-363` established
for the *death of Pompey*, since Cicero himself is a cited term from the citation pass and the line had
no term of its own left to teach.

Two things the batch settled that the plan had deferred. **Cassius has his own glossary entry now**, as
the note under `rm-370` said he would when `rm-377` was written. And **`rm-380 Sextus Pompey` carries no
death year**: nothing openable from here dates it, Appian giving Miletus without a year and Dio a capture
at Midaeum in Phrygia inside a book spanning four of them, so the date line stops at the Sicilian command
and the abstract reports both accounts. **`rm-375` also ships without a picture** — the only candidates
Commons offers are a Victorian illustration imagining the scene and a schoolbook plate, which are the
event's reception rather than the event.

**`rm-390` was planned as *The title Augustus* and is now *Clipeus virtutis*, and the reason is the
ANSWER STRING rather than the subject.** The title is already `rm-371`'s answer in this very deck and
the whole subject of `wh-357` in World History, so a second card here would have been a reader meeting
the answer "Augustus" twice in one deck — measured over the corpus, only seven of 3,235 cards share an
answer term with another card in their own collection, and six of those are forced (a city-state whose
country and capital have one name). The shield was voted in the same act as the name, so the card keeps
the session and the decree and takes the one object that came out of it; the naming itself is carried by
`rm-389`, whose sources describe the same meeting. **`imperator` has no line anywhere in this plan**,
which is worth knowing: it was the obvious alternative here and was left alone because titulature belongs
with `rm-391 Princeps` and the 55 cards of `rm-government`, not scattered through a narrative deck.

Four further notes from the batch. **`rm-383 Mark Antony in the East` takes the man himself as its
answer**, because the glossary held no Antony at all across 3,749 terms while dozens of cards named him,
and the plan gives him no other line. **`rm-384 Antony and Cleopatra` takes `Cleopatra VII`**, which the
overlap table assigns to Greece's `gr-876`: the term is written deck-agnostically, as the last Ptolemy
rather than as Rome's adversary, so `gr-876` reuses it when Greece reaches it — the pairing rule is
satisfied by a term that already exists. **`rm-386 The propaganda war of the 30s BCE` is answered by the
`will of Mark Antony`**, the one document the campaign turned on and a sibling of `rm-372`'s. And
**`rm-390` states no Arles provenance in its prose**: the marble copy is the card's picture and the
Commons file documents it, but nothing openable from here cites it, so the abstract rests on the
Res Gestae for the wording and says only that the gold shield is lost.

**Two more lines were retitled writing `rm-391`–`rm-400`, and both for the reason the deck keeps
giving: the obvious term is already spent.** **`rm-397 The Augustan settlement of the provinces`** is
answered by **`imperial province`**, because `rm-751 Roman province` and `rm-740 Roman provincial
governor` both have lines of their own further on and the settlement itself is `rm-389`'s; what this
card has left to teach is the class of province the emperor kept. **`rm-398 The Augustan army reforms`**
is answered by **`discharge gratuity`**, which is the Loeb's own word in Res Gestae 17 and needs no
unverified Latin — every other term the line might have taken is spent later in the plan (`rm-642`
legion, `rm-648` sacramentum, `rm-649` legionary pay, `rm-651` auxilia, `rm-653` urban cohorts, `rm-654`
vigiles, `rm-655` navy, `rm-682` veteran settlement, `rm-745` aerarium, and `rm-400` the aerarium
militare on the very next line). **Grep the running order for a candidate term before researching it**,
which is the rule the Second World War plan states and which this deck has now proved four times.

Three things the batch settled. **Only `rm-396` takes a locator**: the other nine answer terms are
powers, offices and funds, which have no place a reader could stand, and a dot on Rome for all of them
would say nothing — the Res Gestae has one because the fullest surviving text is cut into a temple
wall at Ancyra. **`rm-393 tribunicia potestas` ships without a picture**, recorded rather than skipped:
the power is abstract, nothing openable from here shows an Augustan inscription or coin carrying
`TRIB POT` legibly, and the near misses were all a picture of something else — a later Rostra, an
imperial-cult altar, a 16th-century costume plate imagining a tribune. And **`rm-396`'s third citation
is Shipley's own introduction rather than the text**: the claim it carries is that the fullest copy is
the Monumentum Ancyranum, which the Res Gestae itself does not state and the Loeb's front matter does.

**Six of the ten lines were retitled writing `rm-401`–`rm-410`, and four of the six for the reason
this deck keeps giving: the obvious term is spent further down the running order.** **`rm-409 The cult
of the emperor under Augustus`** is answered by **`Lares Augusti`**, because `rm-528 Imperial cult` and
`rm-925 Roman imperial cult` both have lines of their own and a third card on the bare institution
would re-card them; what this card has left to teach is the form the cult actually took at Rome, where
Dio says no emperor dared accept divine honours in his lifetime and the wards were given the princeps's
own household gods instead. **`rm-410 The Augustan succession`** is answered by **`princeps
iuventutis`**, since `rm-798 Adoption in ancient Rome` and `rm-412 The adoption of Tiberius`
between them own the adoption, and what is left is the honour the knights invented to name an heir in a
state with no lawful word for one. (`rm-493` was the third line in that group until it was retitled
`Plotina`; the `rm-491`-`rm-500` batch note below says why.) **`rm-407 The Julian marriage laws`**
takes **`ius trium liberorum`**: neither statute is a term a reader meets again, where the right of three children turns up
in Pliny, in the jurists and on inscriptions for three centuries, and Dio's account of it being granted
to the childless — and to gods, so that they could take legacies — is the whole argument in one
sentence. **`rm-406`** and **`rm-408`** were only tightened onto the terms their sources carry,
**`ludi saeculares`** and **`Julia the Elder`**.

**`rm-401 The Augustan building programme` is the sixth and a different case: the line named a programme,
and a programme has no answer term.** Suetonius' boast about brick and marble is a sentence rather than a
word, `Campus_Martius` was already a cited glossary entry before this batch opened, and the Forum, the Ara
Pacis and the Mausoleum are the next three lines. What was left unspent was the **Temple of Apollo
Palatinus**, which is the programme's opening act, the building Augustus put against his own front door,
and the place the Sibylline books were moved to from the Capitol — so the line now names it and the card
still teaches the programme in its ten sentences. **Grep the running order for a candidate term before
researching it**; this deck has now proved that rule five times.

Three things the batch settled. **Five of the ten take a locator** — the four monuments, and `rm-408`,
which is marked at Pandateria rather than at Rome because the island is what the card is half about; a
law, a festival, a street cult and a title have no place a reader could stand. **`rm-406 ludi saeculares`
ships without a picture**, recorded rather than skipped: Commons holds no photograph of the Acta of the
games, and the one picture of the right subject, M. Sanquinius' denarius of 17 BCE, is 800 pixels on its
long side against the 900 the pass requires. And **the Ara Pacis supplies two of the batch's nine
pictures**, which is deliberate and not an oversight — `rm-403` takes the screen with its procession and
scrollwork, and `rm-407` takes the children in that procession, who are the marriage legislation's own
argument in marble and the only Augustan image of it there is.

**Five of the ten lines were retitled writing `rm-411`–`rm-420`, and the reason is the one the deck
keeps giving with a new face: the line named an EVENT, and an event wants the thing it made or the
person it turned on.** **`rm-412 The adoption of Tiberius`** is answered by **`Agrippa Postumus`** —
Augustus adopted TWO men on 27 June 4 CE and the other one is the half of the act nobody remembers, the
last of his own blood, disowned within three years and killed in the first days of the next reign, so the
card teaches the adoption with the man it discarded as its term. **`rm-413 The German campaigns of Drusus
and Tiberius`** names two commanders and a card has one answer, which is `rm-370`'s rule again: it takes
**`Nero Claudius Drusus`**, who reached the Elbe, died on the way back and left the family the name
Germanicus, with his brother's campaigns in the card's own sentences. **`rm-415 The death of Augustus`**
takes **`Divus Augustus`**, the thing the death made; `rm-926 Apotheosis` and `rm-528 Imperial cult` own
the general institutions, and what is left here is the first man Rome ever made a god of having ruled it.
**`rm-420 The mutinies of 14 CE`** takes **`Percennius`**, the claque-leader turned private soldier whose
speech Tacitus makes the manifesto of the rising — `rm-648 Sacramentum`, `rm-649 Legionary pay`,
`rm-665 Vexillum` and `rm-685 Donative` between them own every term the grievances are made of, which is
the grep-first rule paying for itself a sixth time.

**`rm-418 The accession of Tiberius` is the fifth and the one worth reading before the next batch, because
the obvious answer could not be SOURCED.** The term every account reaches for is *recusatio imperii*, and
it is not in anything openable from here: Cambridge and Oxford serve a bot wall, OpenEdition serves
Anubis, and Furneaux's commentary — the batch's own modern leg — uses only Tacitus's own `specie
recusantis`. The line is answered by **`dies imperii`** instead, which Furneaux does use, in terms, for
Octavian's receipt of the fasces on 7 January 43 BCE. It is also the better card: Tiberius gave the
praetorians the watchword as Imperator on the day Augustus died and let the consuls move first for a
month, so the gap between the two dates IS the accession, and the term names the gap. **An answer term
has to be carried by a source you can open, and checking that is part of choosing it.**

Four things this batch settled. **Seven of the ten take a locator**, which is high for this deck and is
what a batch full of deaths does: Planasia, Mogontiacum, Kalkriese, Nola, Misenum, Antioch and the
Porticus Liviae on the Oppian — and `rm-411`'s is the one to know about, since **the Porticus of Livia
has a Wikipedia article and no published coordinate**, so the dot is fetched from `Oppian Hill` and
labelled with the building that stood on it. A dynasty, a concept and a mutineer have no place a reader
could stand. **`rm-420 Percennius` ships without a picture**, recorded rather than skipped: there is no
portrait of a private soldier, and the honest alternatives — a reconstructed legionary, a battle
painting — would be pictures of somebody's idea rather than of him. **The ten paired glossary terms ship
without pictures too**, which is this deck's standing practice (the `rm-401`–`rm-410` terms did as well,
and the glossary as a whole runs about two-thirds illustrated): the card beside each carries the picture,
and a second photograph of the same bust is a duplicate the reader meets in one place. And **the modern
leg of this batch is Furneaux's 1896 commentary on the Annals**, on archive.org with full OCR, which
carries the technical vocabulary, the Amiternum calendar's date for the consecration of Augustus and the
flat statement that the identification of the Teutoburg Forest is most uncertain — the sentence that lets
`rm-414` set the Kalkriese excavation against the ancient name honestly, with an open German review of the
Oberesch find distributions for what the ground does and does not show.

**Six of the ten lines were retitled writing `rm-421`–`rm-430`, and five of them for the reason this deck
keeps giving: the line named an EVENT, and an event wants the thing it made or the person it turned on.**
**`rm-421 The German campaigns of Germanicus`** takes **`Arminius`**, who is what those campaigns were
about and who has no other line anywhere in the thousand — `rm-414 Battle of the Teutoburg Forest` gives
him one sentence of its ten, so the card is his own and the campaigns of 14–16 CE are its middle five.
**`rm-422 The death of Germanicus`** takes **`Gnaeus Calpurnius Piso`**: `rm-419 Germanicus` already ends
on the poison and the condemnation, so what is left to teach is the man, the quarrel, the attempt to
retake Syria by force and the bronze decree from Baetica that lets the Senate's own version be set beside
Tacitus's. **`rm-424 The fall of Sejanus`** takes **`Macro`**, who did it and then stayed, so one card
carries the letter, the camp and the smothering at Misenum. **`rm-428 Caligula and the Senate`** takes
**`Incitatus`** — the anecdote is the relationship's emblem, and carding it properly is the point, since
neither Suetonius nor Dio says the consulship happened and both are quoted here saying what they do say.
**`rm-429 The assassination of Caligula`** takes **`Cassius Chaerea`**, who first appears in Tacitus as a
young officer in the mutiny `rm-420` cards, so the deck's own ends meet.

**The sixth is `rm-425 Tiberius on Capri`, and it is a SOURCING refusal of exactly `rm-418`'s kind.** The
obvious answer is *Villa Jovis*, and it cannot be had from here: the name is a modern one for the ruin on
the island's north-eastern point, the excavation literature is Krause's monograph and the Italian
conference volume behind it, and the two open reviews of that work sit behind an Anubis challenge
(Göttinger Forum für Altertumswissenschaft) and a publisher's catalogue page. The ancient sources give
the ISLAND — Tacitus's twelve villas with twelve names, Suetonius's single small beach and sheer cliffs —
and never the building's modern name, so the card is answered by **`Capreae`**, which they carry in every
line. **An answer term has to be carried by a source you can open, and checking that is part of choosing
it** — the rule `rm-418` produced, applied a second time and reaching the same way.

**The batch's modern leg is DOAJ, and the search order that worked is the one the artefact plan records:
DOAJ finds the article, Crossref confirms the byline and the year, the DOI is opened and read.** Seven
journals carried it, all open and all reachable — *Histos* (Shannon on the Livian allusion in Tacitus's
Angrivarian battle), *Eugesta* (Gladhill on how Suetonius assembles the Capri narrative out of ordinary
Roman material), *Keria* (Lovenjak on the senatus consultum de Cn. Pisone patre against Tacitus's
account), *Myrtia* (Rodriguez Horrillo on Dio's books LIX–LX being built round categories of the good
emperor), *Salduie* (López Sánchez on the end of the western civic coinages under Gaius and Claudius),
*Studia Ceranea* (Dyjakowska on confiscation under the treason charge as revenue) and *Vestnik NSU*
(Guskov on the praetorian officers' political ties to senators). **Two were measured shut and are worth
not re-trying**: `emerita.revistas.csic.es` fails TLS verification from this sandbox, and Heidelberg's
`journals.ub.uni-heidelberg.de` serves Anubis. Perseus answered 503 throughout, so Josephus was done
without and Suetonius plus Dio carried the assassination between them.

**Two cards ship WITHOUT a picture, recorded rather than skipped.** **`rm-422 Gnaeus Calpurnius Piso`**:
no portrait of him is known, Commons holds no photograph of the bronze decree, and the only pictures of
Celenderis are Hellenistic coins and a sarcophagus lid from its necropolis, neither of which depicts
anything the card is about. **`rm-424 Macro`**: likewise no portrait, and the one candidate a name search
returns — the amphitheatre at Alba Fucens, which an inscription links to him — carries nothing on its own
Commons page to say so, so captioning it would be asserting from memory. **Two more were fetched, looked
at and rejected**, which is the contact-sheet rule doing its work without a sheet: the Castra Praetoria
"round corner" is a car park with road signs, and the Alinari photograph of the Palatine is a scan of a
mounted archival print with library stamps and handwriting across it.

**`rm-427`'s locator could not be fetched from an article title and needed a Wikidata id.** *Antium* has
an enwiki article and no published primary coordinate, and *Anzio* redirects in a way that yields none
either; `Q241717` gives it. The route is already in `add-locators.js`'s header and is the first time this
collection has needed it.

**Six of the ten lines were retitled writing `rm-431`–`rm-440`, and the reasons are the four this deck
keeps producing.**

**An EVENT wants the thing it made.** **`rm-431 The accession of Claudius`** takes **`Donativum`**:
`rm-430` is already `Claudius`, and what the January of 41 CE actually produced was a price on the
guard's assent — 15,000 sesterces a man, which Suetonius calls the first purchase of a Roman army's
loyalty, and which every later claimant had to promise. **`rm-432 The Claudian invasion of Britain`**
takes **`Camulodunum`**, the town Claudius came in person to take and the colony planted on it, which is
also the word a reader meets again at `rm-442` and `rm-443`.

**A TERM THE GLOSSARY ALREADY HOLDS leaves the line nothing to teach**, which is `ww2-133`'s rule twice
over. **`rm-434 The imperial freedmen`** could not be answered by `Freedmen`, which is `rm-808`, so it
takes **`Pallas`**, Claudius's treasurer — and NOT `Narcissus`, who is the actor in `rm-437 Messalina`
and would have done the same work twice. **`rm-435 Claudius and the citizenship`** could not be answered
by `Roman_citizenship`, `Citizenship` or `Latin_rights`, all cited terms already, so it takes **`The Lyon
Tablet`**, the bronze that carries the speech itself and lets Tacitus's version be set beside it.
**`rm-439 Nero`** could not be answered by `Nero`, a cited term since `wh-366`; it takes
**`Britannicus`**, who is what the succession actually turned on and whom the deck would otherwise never
card.

**A LINE NAMING TWO MEN is a line with no answer term.** **`rm-440 Seneca and Burrus`** takes
**`Burrus`** alone, `Seneca the Younger` being `rm-959` and `Seneca` a Philosophy line besides.

**The batch's modern leg is Histos plus the out-of-copyright commentaries, and the DOAJ route came up
nearly empty this time.** DOAJ has almost nothing on Claudian Rome: searches on Claudius, Britannicus,
Burrus, Caratacus, Camulodunum and the aqueducts returned Racine criticism, Sicilian pig breeds and
cardiac defibrillator trials. What carried the batch instead was **Histos**, which is fully open and whose
REVIEWS are on point — Letta on Malloch's critical edition of the Tabula Lugdunensis (`histos653`),
Bartera on Malloch's *Annals* 11 (`histos353`), Millett on Braund's *Ruling Roman Britain* (`histos169`),
Wardle on *Suetonius the Biographer* (`histos352`) — together with three public-domain works on
archive.org and LacusCurtius: **Furneaux's second volume** (*Annals* 11–16, 1907), **Henderson's
*Life and Principate of the Emperor Nero*** (1903) and **Platner and Ashby**. Two hosts were measured
and refused: `revistas.usal.es` and `ras.jes.su` both fail TLS verification here, which is a refusal
rather than a wall, and `revistas.uned.es` answered 503 on two attempts an hour apart.

**A HISTOS PDF IS READABLE, and the trick is its own ToUnicode map.** The galleys are typeset with
subsetted fonts whose glyph codes start at 1 in order of first appearance, so a naive stream extract
returns line noise and no fixed offset decodes it — `.claude`-style offset hunting finds nothing. Every
one of them carries a `/ToUnicode` CMap in a compressed object; merging the `beginbfchar` and
`beginbfrange` blocks and mapping each byte through it gives clean text. `pdftxt2.py` in the scratchpad
is that reader. **Do not conclude a Histos review is unreadable because the first extraction is garbage.**

**Two cards ship WITHOUT a picture, recorded rather than skipped.** **`rm-434 Pallas`**: no portrait of
him is identified, and a Commons search returns a Hungarian encyclopedia binding, a Rembrandt Athena and
a baseball pitcher. **`rm-440 Burrus`**: likewise none, the only hit being a 19th-century Swedish drawing
captioned *Burrhus, Nero's Tutor* — a scene that never happened and a role that was Seneca's. **The ten
glossary terms ship without pictures too**, on the previous batches' rule: every free picture of these
subjects is now on the paired card, and putting the same photograph on the term as well shows one reader
the same image twice and makes `check-image-free.js` report a collision that is not one.

**`rm-433 Caratacus` ships with no locator, which is a decision.** Tacitus names no identifiable site for
the last battle and the Victorian identifications are conjecture; the places his story can be pinned to —
the praetorian camp and Cartimandua's court — are `rm-431`'s dot and an unlocated one respectively.
**`rm-434 Pallas` has none for the same kind of reason**: a freedman who ran the finances stood
everywhere in Rome and nowhere in particular.

**Claiming the bare surface `Pallas` cost one edit outside this batch, and it was worth making.** Five
cards in the corpus carry the word; four are this freedman and the fifth is `gr-133`, which quotes
*Pallas Athene* as a Homeric formula. Rather than deny the alias — the `Neville_Chamberlain` answer — the
existing `Athena` term was given the aliases **Pallas Athene** and **Pallas Athena**, which are correct on
their own account and which `buildGlossIndex`'s longest-surface-first rule makes win on that card. Verified
by resolving the sentence against the real index: the Greek line links to `Athena` and the four Roman ones
to `Marcus_Antonius_Pallas`.

## `rm-441`–`rm-450`: the murder of Agrippina to Nero's Greek tour — what this batch found

**FOUR LINES WERE RETITLED, AND EVERY ONE OF THE FOUR IS `ww2-133`'s RULE**: a line named after a person
or a thing the glossary already holds has no term of its own left to teach, so it wants the MOMENT rather
than the man. `Agrippina the Younger` shipped as a cited term with `rm-438` and `Nero` has been one since
`wh-366`, which between them account for all four. **`rm-441 The murder of Agrippina`** takes **`Anicetus`**,
the freedman who designed the collapsing ship, led the marines who killed her and was used again three
years later to perjure himself against Octavia — a man Tacitus names three times and Suetonius never.
**`rm-448 Nero and the Christians`** takes **`Neronian persecution`** and **`rm-450 Nero's Greek tour`**
takes **`periodonikes`**, the victor of the four crown games, which is the thing the tour was FOR and which
Dio's own text and the Loeb note on it supply. **`rm-445 The Armenian settlement of 63 CE`** is the other
half of the rule — a description rather than a term — and takes **`Rhandeia`**, the camp on the Arsanias
where the capitulation of 62 and the settlement of 63 both happened. **Tacitus describes that place and
never names it; the name is Dio's** (62.21, where it is spelled Rhandea), which is worth knowing before
searching the Annals for it.

**`rm-442` AND `rm-443` WERE KEPT AS A PAIR AND THAT WAS A DECISION.** The revolt and the queen look like
one card written twice, and the test that settles it is whether each has a term of its own: `Boudican
revolt` and `Boudica` are both free, both are what the glossary would head, and the two cards were written
to different questions — the revolt gets the causes, the three towns and the suppression, and Boudica gets
the woman and the evidence problem (two Roman authors, two speeches neither could have heard, two
incompatible deaths, and no grave, coin or likeness).

**THE LOEB YEAR ON EVERY TACITUS CITATION IN THE COLLECTION WAS WRONG AND IS NOW FIXED.** Jackson's
Annals is three Loeb volumes — III (books 1–3, **1931**), IV (books 4–6 and 11–12, **1937**) and V (books
13–16, **1937**) — and the helper that writes these citations defaulted to 1931 for all of them, so **36
citations across 14 cards** (`rm-423`–`rm-440`) named a volume that does not exist. **Nothing in the
pipeline could see it**: `add-card.js` checks that a citation ends in a URL, `source-audit.js` counts them
and `check-citations.js` needs a DOI, so a wrong publication year on an out-of-copyright translation passes
every gate and the URL opens perfectly. **The LacusCurtius page for each book states its own volume and
year in its header**, which is where the right answer came from and where the next one should.

**THE HOSTS, MEASURED THIS BATCH.** `histos.org` carries the batch again (Rimell on Closs, *While Rome
Burned*, and Bettenworth on Malik, *The Nero-Antichrist*), and `tidsskrift.dk`, `scriptaclassica.org`,
`journal.fi` and the AOSIS journals all answer. **Three that did not**: `ejournals.eu` (Electrum, which
carries Gregoratti's *Corbulo versus Vologases* and Kéfélian on Armenian numismatics) **fails TLS
verification from here** — its chain is missing an intermediate — and TLS is never disabled, so both
articles were dropped; `journals.openedition.org` (Pallas, which has Pailler's *Néron, l'incendie de Rome
et les chrétiens*) returns **200 behind an Anubis bot wall**, the `WALL` outcome, so the article could not
be read and was not cited; and `filolog.rs.ba` returns an **empty body** to curl. **A 200 is not a
readable article**, and a source that cannot be opened is not cited however exactly it matches.

**WIKIMEDIA'S ARBITRARY-WIDTH THUMBNAILS ARE GONE, which breaks the obvious way of writing a picture `src`.**
`…/thumb/<shard>/<file>/1200px-<file>` now returns **400 with "Use thumbnail sizes listed on
https://w.wiki/GHai"**; only the standard widths (320, 640, 800, 1024, **1280**, **1920**, 2560) are served.
Two of this batch's pictures were written at 1200 and 1600 and had to be re-cut to 1280. **And
`api.php` was rate-limited for the whole batch** while the file pages served perfectly, so the metadata was
read from **`/wiki/File:<name>?action=raw`** (which gives `|Author=` and the licence template as wikitext)
and the original URL off the rendered page — the route CLAUDE.md records, one endpoint further in.

**THREE OF NINE CANDIDATE PICTURES WERE REJECTED ON THE CONTACT SHEET**, which is the rate the geography
pass measured: a Baiae "seafront" that is a modern promenade with motor boats and a lamp post, a Domus Aurea
"panorama" that is a warped 360° strip, and an Olympia view that is a gravel path full of tourists. **And
one was rejected for saying the wrong thing rather than showing it**: the Hermitage bust catalogued as
`Bust of a Roman Domitius Corbulo` carries a Russian description reading *портрет Домиция Корбулона,
атрибуция отведена* — the museum has WITHDRAWN the identification — so **`rm-444` ships with no picture**,
there being no securely identified likeness of Corbulo. The other near miss is the Rijksmuseum face-mask
helmet whose file NAME places it in the Corbulo canal at Matilo while its own description places it in the
Peel marsh near Deurne: two different famous Dutch finds, and a caption cannot be written over a
contradiction. **`rm-445` has no locator either** — Tacitus does not name Rhandeia and the Loeb note calls
the exact site of the camp doubtful, so there is no coordinate to fetch that would not be an assertion.

## `rm-541`–`rm-550`: the Severan army to the crisis of the third century — what this batch found

All ten are in `rm-third-century`, with nine new glossary terms. **Three lines are answered by a term they
do not contain**: `rm-541` *Severan military reform* by **`Legio II Parthica`**, the legion quartered on the
Alban Mount being the one reform Dio describes in concrete terms, not a paraphrase of the policy; `rm-543` *Severus in Britain* by
**`Eboracum`**, where the court sat from 208 and Severus died in 211; and `rm-549` *The end of the Severan
dynasty* by **`Julia Mamaea`**, whose murder with her son in 235 is the end. `rm-550` *Crisis of the Third
Century* needed **no new term**: `Crisis_of_the_Third_Century` was already `wh-370`'s, cited, and was reused
untouched.

**Neither Dio nor Herodian names Eboracum.** The Severan court's residence there rests on the *Historia
Augusta*, Eutropius, the rescript of 5 May 210 and the RCHME and VCH surveys, and the card says which. The
two surveys disagree on Constantius's death, 305 against 306, and the card follows RCHME's 306.

**Two locators were refused.** `rm-549` would have put Mamaea's death at Mogontiacum, which rests on an
editor's footnote rather than on any ancient source the card cites. `rm-545` carries no locator either,
the grant applying across the empire and its papyrus being of unknown provenance. The papyrus's
publication year was also dropped from `rm-545`'s date line, a modern event on a card about 212.

**The wrong-link traps met this time**, each avoided in the prose rather than keyed: *Marcus Aurelius
Antoninus*, Caracalla's official name, links the earlier emperor, so the card says *Antoninus*; bare
*Carrhae* links the battle of 53 BCE; the legate *Claudius Hieronymianus* would link the emperor Claudius;
*Julia Augusta*, Dio's name for Julia Domna, is already an alias of Livia's term; and *sophists* links the
Greek term, so the card says "men of learning". The **Syria** and **Greece** country terms still take the
adjectives *Syrian* and *Greek*, which is how 174 shipped Rome cards already link.

Several dates rest on Magie's Loeb notes to the *Historia Augusta*, and Herodian is cited by the page
numbers of Hart's 1749 translation, read off the scans. **No figure for the Alexandrian massacre of 215–216
is given**, Dio giving none. **Legio II Parthica's founding is dated "c. 197" and hedged as "probably"**,
the year resting on one paper. Commons rate-limited the picture fetches heavily throughout, and two glossary
pictures are the 960px thumbnail for that reason.

## `rm-531`–`rm-540`: the equestrian career to the Battle of Lugdunum — what this batch found

`rm-531`–`rm-535` close `rm-high-empire` and `rm-536`–`rm-540` open `rm-third-century`, with eleven new
glossary terms. **Six lines are answered by a term they do not contain**: `rm-531` *The equestrian career*
by **`procurator`** (`Equestrian_order` being `rm-287`'s), `rm-532` *The emperor and the cities* by
**`curator rei publicae`** (no English Wikipedia article exists, so the key is the slug form of the term),
`rm-533` *Panegyric and the ideal emperor* by **`Dio Chrysostom`** (Pliny's *Panegyricus* still has no
public-domain English translation reachable from here, where Cohoon's Loeb Dio is on Thayer), `rm-534` *The
economy of the high empire* by **`Monte Testaccio`**, `rm-535` *Rome at its height* by **`Forma Urbis
Romae`**, and `rm-540` *The civil wars of 193–197* by **`Battle of Lugdunum`**. `Lugdunum` the city stays
`rm-760`'s and no city term was made.

**THE PESCENNIUS NIGER TRAP, AND A TERM TO CLOSE IT.** `Niger` is the glossary key of the modern country,
so "Pescennius Niger" linked its second word there; a `Pescennius_Niger` term now wins on the full name.
**Never write him bare.** The same batch found **"Year of the Five Emperors" linking to the Chinese
`Three_Sovereigns_and_Five_Emperors`** until its own term existed, **"Claudius Pompeianus" linking the
emperor Claudius**, and **the Roman provinces of Germany linking the modern country** — written now as
*Germania* and *Germania Inferior*, which claim no surface.

**`dio chrysostom` joined `check-cards.js`'s `ANCIENT` list**, the drop set being this batch's two cards;
the agent had held him to two citations of his own speeches to stay under the modern-author cap. `rm-534`
carries two Spanish sources, the Barcelona team that excavates the hill publishing in Spanish, and rule 6 did
not fire on it, so no `SAME_LANGUAGE_OK` row was needed.

**No figure for the total number of amphorae in Monte Testaccio could be sourced** — the popular "53
million" appears in nothing openable from here, the CEIPAC site answering 404 — so the card gives none.
Several of the 193 dates come from Magie's Loeb notes, Herodian is cited by Hart's 1749 page numbers where
that edition prints no chapters, and the Commons upload host returned 429 for the Albinus denarius on
`rm-540` throughout the final check (its address was read from the API).

## `rm-521`–`rm-530`: the Aurelian Column to the emperor's council — what this batch found

All ten are in `rm-high-empire`. **Six lines are answered by a term they do not contain**, and the reason
is that four later lines already hold the obvious answer: `rm-650` is the military diploma, `rm-738` the
imperial rescripts, `rm-764` Leptis Magna and `rm-545` the Antonine Constitution. So `rm-523` *Commodus in
the arena* is answered by **`secutor`**, the gladiator type he fought as; `rm-524` *The assassination of
Commodus* by **`Marcia`**, who organised it (keyed `Marcia_(mistress_of_Commodus)`, with the narrow alias
*concubine Marcia* only — a bare alias would have linked World History's sentence on the Aqua Marcia and
three citations of a living scholar); `rm-526` *The prosperity of the second century* by **`Herodes
Atticus`**; `rm-527` *The cities of the high empire* by **`Timgad`**; `rm-529` *Roman citizenship in the
second century* by **`honestiores`** (key `Honestiores_and_humiliores`), the legal line that came to
matter more than citizenship; and `rm-530` *Imperial administration under the Antonines* by **`consilium
principis`**. **The plan's own lines are unchanged.**

**`rm-525 Pax Romana` is a deliberate pair with `wh-359`** and reuses `Pax_Romana`; it shares no citation
with the World History card, taking the Janus gate from Suetonius, Calgacus from a different translation,
and building the rest on Pliny's phrase and Aelius Aristides' *To Rome*.

**A SECOND WRONG LINK OF THE `Historia Augusta` KIND WAS CAUGHT BEFORE IT SHIPPED**: "Aelius Aristides"
would have linked its second word to **Aristides the Just**, the fifth-century Athenian. The fix was again a
term, `Aelius_Aristides`, whose longer surface wins. **Ask of every two-word name whether its last word is
already somebody else's glossary term.** `Philostratus`, `Herodian` and `Aelius Aristides` also joined
`check-cards.js`'s `ANCIENT` list, the drop set being this batch's four cards and nothing else.

**Two pictures were declined.** `rm-524`'s draft carried Pelez's *La Mort de Commode* of 1879 — an
imagining that does not depict its subject, refused on the Antonine Plague's reasoning — and no reliable
portrait of Marcia exists. `rm-527` first carried Cagnat in three of five sources, over the two-per-author
cap; one citation was merged and a milestone of 100 CE naming Trajan's legate (Dessau, *ILS* 284) added.
Several dates rest on Magie's Loeb notes rather than the ancient text (Cleander's fall, Lucilla's plot), and
Commodus's birth year of 161 CE is derived from the consular date and Dio's length of life.

## `rm-512`–`rm-520`: Aelia Capitolina to the *Meditations* — what this batch found

All nine are in `rm-high-empire`, each with a new glossary term. **One line is answered by a term it does
not contain**: `rm-515` *Marcus Aurelius* is answered by **`Avidius Cassius`**, on `ww2-133`'s rule —
`Marcus_Aurelius` has been a cited term, with its own World History card `wh-369`, since long before this
batch, so the line had no term of its own left to teach. The usurpation of 175 CE is the moment the reign
is remembered by. `rm-517`'s answer carries **en dashes** (`Roman–Parthian War of 161–166`), matching the
slug; the hyphenated spelling is an alias, and `normAnswer` strips both when grading.

**TWO ANCIENT WRITERS WERE MISSING FROM `check-cards.js`'s `ANCIENT` LIST, and the drop set was measured.**
`rm-520` cites the *Meditations* by its author three times and was reported OVER-CITED as a modern scholar;
`rm-512` quotes Justin Martyr in a question and `card-focus.js` reported **Martyr** as a researcher, the
list's bare `justin` covering only part of the name. `marcus aurelius` and `justin martyr` now lead the
alternation. Measured over the whole corpus, the change moves exactly these two findings and `wh-369`
(whose Marcus quotation had been read as a scholar's), and rule 1 still fires on three other cards.

**Two cards carry no picture, each for a stated reason.** Commons holds no portrait, coin or inscription of
**Avidius Cassius**, whose category is a single map; and nothing from the period shows the **Antonine
Plague**, the one ready candidate being a painting of about 1871 and the other a plaque whose link to the
plague is only an uploader's caption. A 19th-century imagining was judged worse than no picture.

**`rm-520` carries the collection's first `card.quote` from the Library** — *Meditations* 1.7, Rusticus and
the *Memoirs of Epictetus* — checked word for word against `books/marcus-aurelius-meditations.js`. 2.1 was
not used, `wh-369` already quoting it. **`Meditations` is `caseSensitive`**, the ordinary word occurring in
the corpus in a Buddhist sense, and the Philosophy collection's later Descartes card must take its own
full-title key.

Four wrong links were found by reading the rendered cards and reworded away: "Lucius Aelius **Caesar**"
linked the dictator, "the **German** provinces" linked the modern country, "all **Asia**" the continent and
the bare legion name "Second **Augusta**" the capital of Maine. **Two sources were cited from their abstract
alone** (Mittag's *Electrum* article on the 900th anniversary, and the Starinar paper on the cult of
Antinous in the previous batch) and each carries one sentence paraphrasing what that abstract says. Most
dates for the Parthian war and Verus's career come from Magie's Loeb notes rather than the ancient text, and
a Serbian paper of 2023 (Vukadinović and Tošović) is the only modern source for both the war and Avidius
Cassius — no open English work on either was found.

## `rm-502`–`rm-511`: the empire at its widest to the Bar Kokhba revolt — what this batch found

All ten are in `rm-high-empire` and carry Hadrian's reign. **Four lines are answered by a term the line
does not contain**, and each for a reason already in this file. `rm-502` *The greatest extent of the Roman
Empire* is a description, so it is answered by **`Arabia Petraea`**, annexed in 106 CE and the one part of
Trajan's expansion Hadrian kept. `rm-504` *Hadrian's abandonment of the eastern conquests* had been spent
by `rm-501`, which already tells the withdrawal, so it is answered by **`Parthamaspates`**, the client king
the abandonment turned on (key `Parthamaspates_of_Parthia`, the real slug). `rm-505` *Hadrian's travels*
is answered by **`Panhellenion`**, the league the travels founded. And `rm-507` *Hadrian's frontier
policy* is answered by **`Lambaesis`**, because `rm-752` is *Limes*: the policy is told through the
inscribed address to the African army of 1 July 128 CE. **The plan's own lines are unchanged.**

**`rm-506 Hadrian's Wall` is a deliberate pair with `wh-368`**, which already holds the answer term and
the glossary entry `Hadrians_Wall`. The World History card is built from the building inscriptions; this
one is the design, the change of plan, the argument over purpose, the Antonine interlude and the end, and
the two share no source.

**`Pantheon,_Rome` is `caseSensitive`**, keyed on the real slug with `Pantheon` as its alias: the ordinary
word "pantheon" (a people's gods) occurs about 20 times in the corpus and must not link to a building in
Rome. **`Hadrian` had no glossary term at all until this batch**, which is why every earlier card naming
him linked nothing.

**A LONG-STANDING WRONG LINK WAS FOUND HERE: "<i>Historia Augusta</i>" auto-linked its second word to
`Augusta`, the capital of Maine.** Fifteen Rome passages cite or name the work. The fix is a new term,
`Historia_Augusta`, whose two-word surface wins because `buildGlossIndex` sorts longest-first — the
`Sarmizegetusa_Regia` lesson from `rm-496` again. It was seen only by reading the rendered links in a
browser. **The bare `Augusta` (an empress's title) will still link to Maine** where a card uses it alone.

Findings about sources. **Encyclopaedia Iranica, UNESCO's World Heritage pages, `villae.cultura.gov.it`,
`degruyter.com` and the SpringerOpen article pages all refused from here**, and DOAJ answered 502 during
the batch. The Panhellenion rests on Dio, the *Historia Augusta*, Pausanias and two out-of-copyright
biographies of Hadrian (Gregorovius 1898, Henderson 1923), no open modern article being readable; its
founding year is inferred from the Olympieion's dedication and the card says so. `rm-511` leans on the
ERC *Judaism and Rome* database for four of its seven sources, by three different authors. `rm-503`'s
birth and death days are derived: 24 January 76 CE from the consular date in *Historia Augusta* 1.3 and
10 July 138 CE from 25.6.

## `rm-501`: Trajan's Parthian campaign — what this card found

One card, in `rm-high-empire`, answered by the plan's own words, with a new glossary term
`Trajan's_Parthian_campaign`. `Crassus_Parthian_campaign` already claims the bare alias
`Parthian campaign`; the new key's longer surface wins wherever the full phrase appears, so the
two do not collide.

**It carries NO war block, deliberately.** The block says who won, and this war's outcome is the
card's own subject: Ctesiphon fell and three provinces were made, then the conquests revolted,
Hatra held out and Hadrian gave everything beyond the Euphrates back. A green Rome over
Mesopotamia would state a victory the card spends five sentences taking apart.

**The two ancient accounts disagree about Parthamasiris and the card says so**: Dio 68.20 has
him sent away under escort, Eutropius 8.3 has him put to death. Neither is preferred.

**The modern source is in Russian** — V. N. Parfyonov's 2025 article in the *RUDN Journal of World
History*, open access and read whole — and is cited under the English title the journal itself
publishes and Crossref holds, with a `[in Russian]` chip, so `check-citations.js` can match it.
It carries the Armenian background since the settlement of 63 CE, the Parthian civil war, the
surrender of Ctesiphon in 116 CE and the reading of Eutropius's "Red Sea" as the Persian Gulf.
**Two hosts refused**: `iranicaonline.org` answers 403 on every article, and the Aristonothos
paper on the Antioch earthquake of 115 CE (`riviste.unimi.it`) reset the connection.

The card's picture is the REX PARTHIS DATVS sestertius of 116–117 CE and the term's the REGNA
ADSIGNATA aureus, both CNG photographs on Commons; the locator is Ctesiphon.

## `rm-491`-`rm-500`: Nerva to the alimenta — what this batch found

All ten are in `rm-high-empire`, and they carry the collection from the murder of Domitian to Trajan's
maintenance grants for the children of Italy. **Two lines were retitled and a third answer was ruled
out by the glossary rather than by the plan.**

**`rm-494 Trajan` is answered by `optimus princeps`**, on `ww2-133`'s rule: a line named after a person
the glossary already holds wants the moment, not the man. `Trajan` has been a cited glossary term for
months, so the pairing rule was already satisfied and the line had no term of its own left to teach.
What it has instead is the honorific Dio says he prized above Dacicus and Parthicus because it spoke of
his character rather than his arms - and which the alimentary tablets of 101 and 103 CE were already
using thirteen years before the Senate voted it.

**`rm-493 Adoption and the imperial succession` is answered by `Plotina`, and the route there is worth
recording because three obvious terms were each closed off in a different way.** Adoption itself is
`rm-798 Adoption in ancient Rome` and `rm-412 The adoption of Tiberius`. `tribunicia potestas`, the
constitutional grant that actually made an heir a colleague, is `rm-393`. And **`Caesar` could not be the
answer at all, for a reason no plan line can show: `Julius_Caesar` claims the bare surface `Caesar`
across the whole corpus**, so every occurrence of the title in this card's own prose would auto-link to
the dictator - a wrong link on the card's own answer term, which a parenthetical key (`Caesar_(title)`)
does not fix, since such a key claims no bare name and the dictator's alias still does. **Check who owns
a one-word answer term's surface before researching it**, which is one query against
`GLOSSARY_ALIASES`. What is left to teach about the imperial succession is the one adoption the sources
say was manufactured and the woman they say manufactured it: Dio, whose father governed the province
where Trajan died, writes that Hadrian was never adopted at all and that the last dispatches to the
Senate went out over Plotina's signature. The key is **`Pompeia_Plotina` with `Plotina` as an alias**,
the article being under the full name.

**`eutropius` was missing from `check-cards.js`'s `ANCIENT` list**, exactly as `statius` was last batch,
so three citations of a fourth-century breviarist on `rm-491` reported as a modern scholar over-cited.
**The drop set was measured and is one card - this batch's own**: the whole-corpus `--report` is
otherwise byte-identical, no new ancient over-citation note appears, and the `one-witness` heading still
fires on 464 cards, so the ancient branch is alive rather than merely quiet.

**AND A JOURNAL CAN PRINT A DOI IT HAS NEVER REGISTERED.** `10.14795/jaha.12.1.2025.1225` is what the
JAHA article page's own `citation_doi` meta tag carries for the 2025 paper on the terraces at
Sarmizegetusa Regia, and it resolves **404**; the journal's older `10.14795/j.vNiN.NNN` identifiers all
resolve. `check-citations.js` caught it - Crossref has no record - and the citation now points at the
article's landing page instead. **Take a DOI off the page and then RESOLVE it**; the metadata tag is not
evidence that anything was deposited.

**Two hosts were found and not used, and both are 200-status walls.** The *RIHA Journal* article on the
sixteenth-century drawings of the Column sits behind an Anubis proof-of-work challenge, so it was
located, could not be read, and was therefore not cited - a citation composed from a search result's
title is the fabrication the rules forbid. `revistas.uexternado.edu.co` refuses the same way, which
closed off the open-access paper on the Ligures Baebiani tablet. **And Pliny's *Panegyricus* has no
public-domain English translation this sandbox can reach at all**: archive.org's copies are Latin
editions or the in-copyright Loeb, and attalus.org carries the letters and not the speech. So `rm-500`
rests on Dio, on Pliny's own letters about his private foundation at Comum, and on Caroline Barron's two
commentaries in the ERC *Judaism and Rome* database, rather than on the one contemporary source that
describes the scheme at length.

Three smaller things. **`rm-491` carries no modern scholarship and that is the honest answer**: the
dynasty as a unit is a modern label, and what can be cited for it is the ancient sequence - Dio for the
accession, Eutropius for the reigns, the *Historia Augusta* for the adoptions, and Ammianus for the line
still being used as a standard of praise two centuries later. **`rm-499` is the one card here whose
subject is an argument about the evidence**, and both halves of it come from the same institution: the
Sovraintendenza Capitolina's own pages say that the clearance of 1926-34 read every room as a shop and
that the complex is better understood as offices and record stores serving the forum. Two museum pages
out of six sources keeps it inside `check-cards.js`'s one-institution note. And **`rm-500`'s locator is
`Veleia (Italy)`**, because the bare `Veleia` article is a disambiguation page with no coordinate and
`Velleia` is a genus of Australian herbs; `rm-495` takes **Trajan's Bridge**, `Tapae` being `rm-483`'s.

**The answer term of `rm-491` carries an EN DASH**, matching the Wikipedia slug and the glossary key
`Nerva–Antonine_dynasty`. A later card writing the hyphen will not auto-link to it.

**AN ELEVENTH GLOSSARY TERM WAS ADDED BECAUSE THE BROWSER SHOWED A WRONG LINK.** Reading the rendered
`rm-496` it turned out that "Sarmizegetusa Regia" was auto-linking its second word to **`Regia`**, the
priest's house in the Roman Forum - a whole-word match the index is right to make and a wrong link
nobody would report. The fix was neither a reword nor an alias but **a new term, `Sarmizegetusa_Regia`**,
because `buildGlossIndex` sorts surfaces longest-first, so the two-word key wins wherever the phrase
appears and the place gets an entry it deserved anyway. **A card is not verified until it has been
looked at in a browser**; `check-gloss-links.js` reports the cross-REGION shape and had nothing to say
about this one, both terms being tagged `rome`.

## `rm-481`–`rm-490`: Domitian to the end of the Flavians — what this batch found

All ten are in `rm-flavians`, and they carry the collection from Domitian's accession to the
Senate's vote erasing his name. **Four lines were retitled**, every one of them for the reason
`ww2-107` and `ww2-144` give: an earlier or later line had already spent the obvious answer, or
the line was a description rather than a term.

**`rm-482` *Domitian and the Senate* → `Delator`.** The obvious answers were all taken: `maiestas`
is `rm-426`, `censorship` is `rm-117`, `Roman censor` is `rm-710`, `Roman Stoicism` is `rm-960`. The
professional accuser is what the relationship actually ran on, is a word a reader meets again across
the whole principate, and is anchored to this reign by Suetonius' own line that an emperor who does
not punish informers eggs them on (*Domitian* 9.3) and by the *Agricola*'s roll of them. It also
leaves *dominus et deus* free to be stated on `rm-481`, where it belongs.

**`rm-483` *Domitian's Dacian wars* → `Domitian's Dacian War`**, singular, which is the Wikipedia
article title and the form the literature uses.

**`rm-486` *The Roman conquest of Britain* → `Inchtuthil`.** This is the spent-answer rule at its
sharpest: `rm-432` already cards *The Claudian invasion of Britain* and `rm-757` is *Roman Britain*,
so a third card on the conquest would have had nothing of its own to teach. Sitting between Mons
Graupius and the Flavian palace, what the slot is really about is the conquest completed and given
up, and the legionary fortress demolished by its own garrison is that in one object.

**`rm-489` *The assassination of Domitian* → `Stephanus`, keyed `Stephanus_(freedman)` with no bare
alias.** Measured first: the corpus's only two "Stephanus" surfaces are *Stephanus of Byzantium*
(`gr-218`, `rm-040`), and Philosophy cites Plato by Stephanus pagination, so a bare key would have
claimed the word wrongly twice and stood in the way of a third use. A parenthetical key claims no
bare name, so the term is reached by the aliases *freedman Stephanus* and *Stephanus the freedman*,
which is how the cards' own prose names him.

**`Agricola` claims the bare word and pays for one wrong link, knowingly.** The glossary key is the
article title `Gnaeus_Julius_Agricola`, with *Agricola* as an alias. Measured over the shipped corpus
the bare word occurs exactly once outside this batch — `rm-443`, "In the <i>Agricola</i>", which is
Tacitus' book rather than the man. That link is a near miss rather than a wrong one (the book is his
biography and the entry says so), and it buys correct links on every card in this batch and every
later one. This is the `Titus` trade of the previous batch at a hundredth of the cost.

**Two lines that shipped without a locator or a picture, and the reasons.** `rm-485` Mons Graupius
takes **no locator**: the site has never been agreed, and a dot would assert what the card's own
last sentence says nobody can. `rm-482` *delator* and `rm-489` *Stephanus* take **no picture**:
nothing openable depicts an informer or an imperial steward, and a generic courtroom or a Roman
dagger would illustrate the idea while depicting neither. Five of the ten glossary terms likewise
ship with no picture (`Delator`, `Domitian's_Dacian_War`, `Damnatio_memoriae`, `Stephanus_(freedman)`,
`Flavian_dynasty`) — the last because `check-image-free.js` caught the obvious candidate, the Berlin
case of Flavian coins, already sitting on `rm-467`.

**The batch found two faults in the tooling, both of them real.** `card-focus.js` reported five of
the ten for naming a researcher in a question, and every finding traced back to ONE malformed
citation: the `histos()` helper interpolates its title raw, so a REVIEW passed through it read
`Phoebe Garrett, Deconstructing Nero and Domitian? (on V. Schulz, ...)` with no quotation marks, and
the name extraction took *Domitian* out of what looked like an author field. Rewritten as a proper
review citation (`review of <i>Deconstructing Imperial Representation</i>, by Verena Schulz`) the
finding vanished from four cards. The fifth was **`Statius`, genuinely missing from `check-cards.js`'s
`ANCIENT` list** — he is an ancient author on any reading, the list already carries Martial, Horace,
Ovid and Quintilian, and the corpus had simply never cited him before. Adding him was verified to
have a drop set of exactly this batch: `Statius` occurs nowhere else in `data-extra/` or
`glossary-extra.js`.

**`rm-483` states no campaign years, and that is a decision rather than an omission.** The
conventional dating (85–89) could not be tied to anything openable from this sandbox: neither Dio
nor Suetonius nor Eutropius gives a year, the Perseus copy of Smith's *Dictionary* answered 503, and
the one paper that would have carried it — **Soria Molina, "Quadi, Marcomanni and the Suebian
Confederation in Domitian's and Trajan's Dacian Wars", *Studia Historica: Historia Antigua* 35
(2017) — sits on `revistas.usal.es`, whose TLS chain will not verify from here**, so it could be
neither read nor cited. The card says "the middle years of his reign" and its date line carries the
reign, which is what the sources bear. **The same host blocks Escámez de Vera's two Flavian papers**;
record it and do not re-derive it.

**`rm-483` carries NO `war` block, and that is the war-card rule working rather than an oversight.**
The block says who won, and this war ended in a negotiated peace in which Rome crowned Decebalus'
brother and sent back money and craftsmen after being beaten in Pannonia. A war whose outcome the
sources will not settle gets no block rather than a guess in two colours. `rm-485` Mons Graupius is a
BATTLE and is excluded by the same rule's own terms.

**Where the rest of the batch's sources came from.** The Scotland cards rest on the **Proceedings of
the Society of Antiquaries of Scotland**, which is open end to end at `journals.socantscot.org` with
DOIs and PDFs — Breeze 1988 and 1990, Jarrett 1985, Southern 1996, Hind 1983 and Burn 1953 between
them carry the Agricola dating dispute, the Inchtuthil demolition coins, the Danube transfer and the
battlefield hunt. **Hanson 1977–78 (PSAS 109) is image-only with no text layer** and was therefore
not cited. The palace rests on **Platner & Ashby** and **Lanciani** (both open, both out of
copyright), on **Statius' *Silvae* 4.2 in Slater's 1908 translation** on archive.org and on Martial
7.56 and 8.36 in the Bohn prose version; **no open modern work on the Palatine palace could be found**
— DOAJ, Crossref and the ISPRS archives all came back empty or paywalled, and Zanker's British
Academy chapter is 403 at OUP. **GRBS** (`grbs.library.duke.edu`) and **Histos** and the **Journal of
Ancient History and Archaeology** are all open and all answered.

**Two Bohn cautions.** The 1897 Bohn Martial is badly OCR'd — *Rabirius* comes out as "Babirins" — so
the citations point at the volume and the prose paraphrases rather than quotes. And Bohn renders
*domini deique nostri* at *Epigrams* 5.8 as "our supreme lord and ruler", so **the title cannot be
quoted from that translation**; `rm-481` takes it from Suetonius *Domitian* 13.2 and Dio 67.4.7 and
67.13.4, which say it outright.

## `rm-471`–`rm-480`: Titus to Pliny the Elder — what this batch found

All ten are in `rm-flavians`, and the batch carries the collection from the accession of Titus in June 79
to the man who died watching the mountain that ends it.

**TWO LINES WERE RETITLED, BOTH BY `ww2-133`'s RULE.** `rm-476` was *The inaugural games of the Colosseum*,
which is an event rather than a term, and every term the games might have taught is already spoken for two
hundred cards later — `rm-871 Munus`, `rm-873 Venatio`, `rm-875 Naumachia`. What the hundred days actually
left behind is a BOOK, so the line is **`Liber Spectaculorum`**, Martial's epigrams on the amphitheatre;
the card's ten sentences are still the games. `rm-477` was *Eruption of Mount Vesuvius in 79*, and the
eruption's own name is a date rather than a word a reader meets again: it is **`Plinian eruption`**, the
class of eruption the letters founded the study of, with 79 CE as its type example. **GREP THE WHOLE
RUNNING ORDER FOR A CANDIDATE TERM BEFORE RETITLING**, which is the lesson the `rm-746` collision left in
the note below, and which is what found the three spectacle lines here.

**`Colosseum` AND `Pompeii` WERE ALREADY CITED GLOSSARY TERMS, AND THAT IS THE PAIRING RULE WORKING RATHER
THAN A GAP.** A term is deck-agnostic by house rule, so `rm-475` and `rm-478` reuse what the glossary
already holds and the batch ships EIGHT new terms rather than ten. Neither line was retitled for it: the
Colosseum and Pompeii have to be carded under their own names in a Rome collection, and `ww2-133`'s rule
asks for the moment instead of the man only where the line has no term of its own left to teach.

**`Titus` CLAIMS THE BARE WORD AND PAYS FOR SEVEN WRONG LINKS, WHICH IS THE `Cell_(biology)` TRADE AND IS
RECORDED HERE RATHER THAN DISCOVERED LATER.** Measured over the corpus, "Titus" occurs 50 times; the longer
surfaces `Titus Tatius`, `Titus Flavius Sabinus`, `Titus Quinctius Flamininus`, `Titus Livius` and
`Titus Annius Milo` are all glossary terms already and win, being sorted longest-first. What is left is
**seven occurrences on six cards** — `rm-097` and `rm-099` (Titus Herminius), `rm-099` (Titus Aebutius),
`rm-109` (Titus Lartius), `rm-367` (Titus Ampius), `rm-453` and `rm-457` (Titus Vinius) — where the
praenomen now links to the emperor. None of those five men has a term of its own, so the three usual fixes
all come to nothing; the ratio is 34 bare uses right against 7 wrong and it improves with every Flavian
card written. **A praenomen is an ordinary English word one language over: ask the corpus before keying
one.**

**THE PICTURE PASS REJECTED FOUR CANDIDATES AND EACH IS A DIFFERENT FAULT.** The Athens head NAMA 348 is
labelled Titus in German and "probably Caligula, reworked" in Italian on the same file page — a contested
identification, which is the right-name-wrong-person trap with the evidence sitting in a language nobody
reads first. `Arch of Titus Menorah 22.jpg` is a modern CAST at Beth Hatefutsoth rather than the arch. The
1938 aerial of Masada is **printed left to right reversed**, which its own file page says and which nothing
in the image would tell you. And the Thevet engraving captioned "Pline Second" is Pliny the YOUNGER, as its
own text says. **Read the file page, not only the file name**; two of the four were only visible there.

**A PICTURE UNDER 900 PIXELS PASSES EVERY CHECK AND IS STILL TOO SMALL.** `Ausbruch des Pinatubo 1991.jpg`
is 665 by 790, and `thumb.php?width=900` hands back the original at its own size, so the contact copy
looked full-sized. **Ask the API for the dimensions, not the thumbnail for its bytes.** It was replaced,
after installation, by the Mount St Helens column of 22 July 1980.

**`add-images.js` REFUSES MARKUP IN A TEXT FIELD, INCLUDING `<i>`.** A caption naming the *Natural History*
in italics was turned away; the picture's `desc` is plain text where a card's prose is not.

**TWO CARDS SHIP WITH NO LOCATOR AND ONE WITH NO PICTURE.** `rm-473` *fiscus Iudaicus* is a tax and has
nowhere a reader could stand, and nothing openable on Commons depicts it — there is no Nerva
`FISCI IVDAICI CALVMNIA SVBLATA` coin there, which was checked twice under two search interfaces, and the
Judaea Capta sestertius is about the conquest rather than the levy. `rm-476` *Liber Spectaculorum* is a
book; the amphitheatre it is about is `rm-475`'s dot, and a second dot on the same pixel would be the
duplicate `locatorSiblings` groups away.

**WHERE THE SOURCES CAME FROM.** Suetonius' *Titus* and *Domitian* and Dio LXV, LXVI and LXVIII on
LacusCurtius; Josephus *BJ* 7.5, 7.6, 7.8 and 7.9 on Perseus; Pliny the Younger's *Epistulae* 3.5, 6.16 and
6.20 in the Latin on Perseus, because the Melmoth English is renumbered and cannot carry a book-and-letter
reference; the Bostock and Riley *Natural History* for the dedication and for Campania; Platner and Ashby
for the Amphitheatrum Flavium and the Arcus Titi; Dessau's *ILS* nos. 264 and 265 for the two arches'
inscriptions; and Bohn's 1897 prose Martial, whose heading is **"Martial on the public shows of
Domitian"** — the older attribution, which is itself the evidence that the book names no emperor.

**FIVE MODERN WORKS CARRIED THE REST AND ALL FIVE ARE OPEN.** Krausz in *HiMA* 14 (2026) for the Masada
siegeworks, which measures the wall, the camps and the ramp in weeks of labour rather than years; Petrone
and others in *PLOS ONE* 13 (2018) for the Herculaneum waterfront victims and the surge temperatures;
Alapont and others in *PLOS ONE* 18 (2023) for the Pompeii casts and asphyxia; Paone in IntechOpen's
*Forecasting Volcanic Eruptions* (2020) for the eruption's phases and the autumn date; Fowler in
*Manuscript and Text Cultures* 3 (2025) for the Villa dei Papiri. **Yarden's 1983 piece on the spoils
relief is behind an Anubis proof-of-work wall at doi.org AND at `journal.fi` and was dropped**; Canciani
and others, ISPRS Annals II-5/W1 (2013), carries the Circus Maximus arch instead and is open.

**THE DPLA MANUSCRIPT PAGE IS THE ONE PICTURE WORTH KNOWING ABOUT.** Boston Public Library's Martial,
written in Lombardy in 1453, opens at `Marci Valerii Martialis Epigrammaton liber primus` with *Barbara
pyramidum sileant miracula Memphis* and the two poems after it — so the card on the *Liber Spectaculorum*
is illustrated with the text it quotes rather than with the building.

## `rm-461`–`rm-470`: Cremona to the Second Temple — what this batch found

All ten are in `rm-flavians`, and the batch carries the collection from the night battle outside Cremona
to the burning of the temple at Jerusalem.

**…AND A FOURTH LINE MOVED BECAUSE THE RETITLE COLLIDED WITH ONE 280 CARDS AWAY.** `rm-746` was already
*Fiscus*, in the administration deck between *Aerarium* and *Roman currency*, and `test-card-plans.js`
caught the duplicate topic the moment `rm-467` took the word. The card that was written wins, so `rm-746`
is now **`Patrimonium`** — the emperor's inherited private property, the third Roman treasury and a real
gap in that run rather than a substitute found in a hurry. **Grep the whole running order for a candidate
term before retitling a line**, which costs one command and would have saved a round here.

**THREE LINES WERE RETITLED, ALL BY `ww2-133`'s RULE — A LINE NAMED AFTER A THING THE GLOSSARY ALREADY
HOLDS WANTS SOMETHING ELSE.** `rm-462` was *The burning of the Capitol*, and both `Capitoline_Hill` and
`Temple_of_Jupiter_Optimus_Maximus` have been cited glossary terms since `rm-050` and `rm-075`, so the
pairing rule was already satisfied and the line had no term of its own left to teach. It is answered by
**`Titus Flavius Sabinus`** instead — Vespasian's elder brother, twelve years prefect of the city, the man
who held the Capitol and was butchered on the palace steps — which keeps the card about the burning while
giving the reader a name they meet again. `rm-467` was *Flavian finance*, a topic rather than a term, and is
answered by **`fiscus`**: the emperor's own treasury is the word a reader meets again, `rm-473` builds the
*fiscus Iudaicus* straight onto it, and Vespasian's reign is simply where the institution becomes visible.
`rm-468` was *The Flavian censorship*, and `censorship` is `rm-117`'s answer term; the thing the Flavian
censorship actually DID is **`adlectio`**, the enrolment of a man into the senate at a rank he never stood
for, which is both narrower and more useful.

**AN ANCIENT WITNESS UNDER 50% IS THE BAR, AND IT IS EASY TO MISCOUNT BY ONE.** `rm-461` and `rm-462` both
shipped a first draft with FOUR Tacitus citations in eight, which is exactly 50% and raises
`check-cards.js`'s one-witness note. The fix in both cases was to MERGE two adjacent Tacitus references
rather than to add a source — `3.15-18` and `3.8-9` became `3.8-18`, `3.69` and `3.70` became `3.69-70` —
which is the right answer when the two ranges are a continuous passage anyway. **Count the citations before
writing the markers**, since renumbering them afterwards is the fiddly part.

**THE LOEB VOLUME YEAR HAS TO BE READ OFF THE PAGE FOR EVERY AUTHOR, NOT JUST DIO.** Last batch's repair
taught this for Cassius Dio; this one needed it again for Frontinus's *Stratagems* and for Tacitus's
*Histories*, both of which are 1925. The LacusCurtius header states the volume and year on every page, so
the rule is one curl per new work rather than a guess carried across from a neighbour.

**THE `Histories` PAGE NAMES ARE `1A`…`5B` AND BOOK IV IS FOUR PAGES.** A first attempt used Thayer's
letter-only scheme (`D*`, `E*`) and 404ed on all three; the real shape is `4A*` (chapters 1-37), `4B*`
(38-53), `4C*` (54-79) and `4D*` (80-86), with book V split `5A*` (1-13) and `5B*` (14-26). Worth recording
because the 404 looks exactly like the text not being there.

**WHERE THE LATIN TEXT OF AN INSCRIPTION COMES FROM.** `rm-466` rests on the tablet itself, and the openable
editions are **Bruns, *Fontes iuris Romani antiqui*, 7th ed. 1909, no. 56** and **Dessau, *ILS* 244**, both
on archive.org with usable OCR. The two are worth having together: Bruns prints Mommsen's discussion of
whether the thing is a law or a senatorial decree, and Dessau heads it *Fragmentum legis quae dicitur de
imperio Vespasiani* — "the law which is SAID to be" — which is the same doubt in three words. `db.edcs.eu`
answers 200 but serves a search form rather than a record, and `droitromain.univ-grenoble-alpes.fr` is 403
from this sandbox.

**GREENIDGE'S `Roman Public Life` CARRIED FOUR OF THESE CARDS AND IS WORTH INDEXING.** Pages 342-48 are the
powers of the princeps, including the lex de imperio and the imperial censorship; 365 and 373 define
*adlectio* and its grades; 395 defines the *fiscus* against the *aerarium*; 368 has Nerva's fiscal praetor.
It is 1901 and says so, but on Roman constitutional machinery it states what the inscriptions state.

**TWO CARDS SHIP WITH NO PICTURE AND TWO WITH NO LOCATOR, AND EACH ABSENCE IS A DECISION.** `rm-463`
*arcanum imperii*, `rm-467` *fiscus* and `rm-468` *adlectio* are concepts and institutions with no place a
reader could stand, so `rm-463` and `rm-467` take no locator at all rather than a dot on the Forum that
would assert something the card does not. `rm-468` has no picture either: nothing openable on Commons
depicts an adlection, and the inscriptions that record one are catalogue text rather than photographs.

**A LOCATOR CAN BE FETCHED THROUGH THE MODERN TOWN WHEN THE ROMAN NAME HAS NO ARTICLE.** `Vetera` carries no
primary coordinate on Wikipedia and `add-locators.js` correctly refused it; the fortress stood at Birten
beside **Xanten**, whose article does carry one, so the batch names Xanten and labels the dot *Vetera*. The
coordinate is still fetched and never typed, which is the rule the script exists for.

## `rm-451`–`rm-460`: the Jewish revolt to the death of Vitellius — what this batch found

**THIS BATCH CROSSES FROM ONE DECK TO ANOTHER**: `rm-451`–`rm-455` close `rm-julio-claudians` and
`rm-456`–`rm-460` are the first cards ever written into `rm-flavians`, so the second half sets that deck's
`category` string, which is its own title.

**THREE LINES WERE RETITLED AND ALL THREE ARE `ww2-133`'s RULE** — a line named after a person or a thing
the glossary already holds has no term of its own left to teach. `Nero` and `Julio-Claudian_dynasty` were
already cited terms, and `Galba` was about to be spent by `rm-457`, so: **`rm-453 The revolt of Galba`**
takes **`Nymphidius Sabinus`**, the praetorian prefect who bought the guard for Galba with a largess that
was never paid and then tried to take the throne himself; **`rm-454 The death of Nero`** takes **`hostis`**,
the senate's declaration of a public enemy, which is the thing that actually reached Nero at Phaon's villa
and the thing that made his death a legal event rather than a mood; and **`rm-455 The end of the
Julio-Claudians`** takes **`Verginius Rufus`**, who beat Vindex, refused the empire three times and had it
put on his own tomb that he claimed the imperial power *non sibi sed patriae*.

**`rm-452` KEEPS ITS PLAN LINE AND NOT ITS WORDING**: the line reads *The revolt of Vindex* and the card is
answered by **`Vindex`**, which is the term rather than the description. It needed no retitle, the
strict answer-must-match check being the geography plans' rule alone, but it is recorded here because the
glossary key is `Gaius_Julius_Vindex` with `Vindex` as an alias, on the pattern `Gnaeus_Domitius_Corbulo`
set in the batch before.

**A LOEB YEAR FAULT OF THE SAME CLASS AS THE TACITUS ONE WAS FOUND AND FIXED, AND IT WAS BIGGER.** Last
batch corrected 36 citations that named the wrong volume of Jackson's Annals. The `dio()` helper had the
same shape of bug and had been carrying it far longer: it defaulted to **1917**, which is right for Loeb
volumes V and VI (books 46–55) and wrong for VII (56–60, **1924**) and VIII (61–70, **1925**). **52
citations across 30 cards** named a volume that does not exist — every citation of books 56 to 63 in the
Rome corpus. Nothing in the pipeline can see it: `add-card.js` checks a citation ends in a URL,
`source-audit.js` counts them, `check-citations.js` needs a DOI, and the LacusCurtius page opens either way.
**The page header states its own volume and year**, which is the same method that settled the Tacitus
fault; all 22 cited books were read rather than inferred, and the helper now DERIVES the year from the book
number instead of taking a default. Re-measured afterwards: 137 Dio citations, 0 wrong.

**A `#` FRAGMENT MAY NOT CONTAIN A SPACE, WHICH IS A CITATION FAULT AND NOT A TIDINESS ONE.** `suet()`
appends the section to the URL as an anchor, so `suet("Galba","20, 23")` produced `…Galba*.html#20, 23` —
and `SRC_URL_RX` stops at whitespace, so the visible link text would have been truncated at `#20,` and the
address dead. A RANGE is safe (`20-23` yields `#20`); a comma-separated list is not. Caught by curling
every citation URL in the batch, which is what that rule is for.

**THE PLINY CITATIONS ARE THE LATIN TEXT ON PERSEUS, DELIBERATELY.** The obvious English — Melmoth revised
by Bosanquet, on Project Gutenberg — **renumbers the letters**, so its "XVII to Voconius Romanus" is what
everyone else calls 2.1 and a citation reading `Letters 2.1` pointed at that page would send a reader to a
different letter. Attalus carries Firth's 1900 translation in the standard numbering but says on its own
banner that words and phrases have been modified. Perseus's `1999.02.0139` is structured `book:letter` and
is the text the epitaph was read off, so `plinl()` cites `<i>Epistulae</i> 6.10` and points there.

**AN ITALIAN ARTICLE WAS CITED FROM ITS PUBLISHED ABSTRACT AND THE REASON IS WORTH RECORDING.** Bellomo's
*L'Italia settentrionale e le guerre civili del 68-69 d.C.* is open access and exactly on this subject, but
**its PDF is glyph-ciphered**: the subset fonts carry per-font ToUnicode maps that the local extractor
merges into one, so the body comes out as private-use punctuation. The journal's own article page carries
the full Italian abstract, which states the findings cited here — Verginius Rufus of Milanese origin, twice
refusing the purple; the two decisive battles at Bedriacum; Cremona destroyed for its disputed loyalty —
and nothing beyond it was claimed. **A per-font CMap extractor would unlock the whole article** and is the
thing to build before the next batch that wants an OJS PDF.

**TWO CARDS SHIP WITH NO PICTURE AND ONE MORE NEARLY DID.** **`rm-455`** has none because no likeness of
Verginius Rufus survives and the single Commons candidate, `Tomb of Lucius Verginius Rufus.png`, carries no
source, no description and no authority beyond its uploader's file name — a concrete drum behind a modern
railing, which the card would have to assert is his tomb. **`rm-459`** has none because the battlefield is
unlocated farmland and the only candidate is a user-drawn map in German that carries a typo (*Mondena*) and
dates the battle 14 April where the card follows Henderson's 15th; the card already has a locator globe at
Bedriacum doing the map's work. **`rm-460` nearly took the Grimani bust**, which Commons itself files as
*Pseudo-Vitellius*, and **`rm-458` nearly took a Rijksmuseum "Otho"** that is a lead GARDEN STATUE cast
after Bartholomeus Eggers some time after 1674. The coins were the right answer for all three emperors:
a legend round a portrait is the one identification that cannot be argued with.

**AND THE MONTAGE ON `rm-456` IS BUILT FROM THE SAME CNG PHOTOGRAPHS**, one of which is the Galba aureus a
first draft gave `rm-457`. `check-cards.js` compares file NAMES and would not have reported it, so the
Galba card took the American Numismatic Society's own CC0 close-up instead — a different file, a better
picture, and no coin met twice in one deck.

**`upload.wikimedia.org` WAS 429 THROUGHOUT AND `commons.wikimedia.org/w/thumb.php` WAS NOT**, which is the
BUSY state CLAUDE.md records rather than a wall: `Special:FilePath` and the plain upload path both refused
while `thumb.php?f=<FILE>&width=N` served every file, and `?action=raw` on the file page gave the licence
and author the whole time.

### The Julio-Claudians — `rm-julio-claudians`

    rm-416  Julio-Claudian dynasty
    rm-417  Tiberius
    rm-418  Dies imperii
    rm-419  Germanicus
    rm-420  Percennius
    rm-421  Arminius
    rm-422  Gnaeus Calpurnius Piso
    rm-423  Sejanus
    rm-424  Macro
    rm-425  Capreae
    rm-426  Maiestas
    rm-427  Caligula
    rm-428  Incitatus
    rm-429  Cassius Chaerea
    rm-430  Claudius
    rm-431  Donativum
    rm-432  Camulodunum
    rm-433  Caratacus
    rm-434  Pallas
    rm-435  The Lyon Tablet
    rm-436  Aqua Claudia
    rm-437  Messalina
    rm-438  Agrippina the Younger
    rm-439  Britannicus
    rm-440  Burrus
    rm-441  Anicetus
    rm-442  Boudican revolt
    rm-443  Boudica
    rm-444  Corbulo
    rm-445  Rhandeia
    rm-446  Great Fire of Rome
    rm-447  Domus Aurea
    rm-448  Neronian persecution
    rm-449  Pisonian conspiracy
    rm-450  Periodonikes
    rm-451  First Jewish–Roman War
    rm-452  The revolt of Vindex
    rm-453  Nymphidius Sabinus
    rm-454  Hostis
    rm-455  Verginius Rufus

### Civil war and the Flavians — `rm-flavians`

    rm-456  Year of the Four Emperors
    rm-457  Galba
    rm-458  Otho
    rm-459  First Battle of Bedriacum
    rm-460  Vitellius
    rm-461  Second Battle of Bedriacum
    rm-462  Flavius Sabinus
    rm-463  Arcanum imperii
    rm-464  Revolt of the Batavi
    rm-465  Vespasian
    rm-466  Lex de imperio Vespasiani
    rm-467  Fiscus
    rm-468  Adlectio
    rm-469  Siege of Jerusalem
    rm-470  The destruction of the Second Temple
    rm-471  Titus
    rm-472  Masada
    rm-473  Fiscus Iudaicus
    rm-474  Arch of Titus
    rm-475  Colosseum
    rm-476  Liber Spectaculorum
    rm-477  Plinian eruption
    rm-478  Pompeii
    rm-479  Herculaneum
    rm-480  Pliny the Elder
    rm-481  Domitian
    rm-482  Delator
    rm-483  Domitian's Dacian War
    rm-484  Agricola
    rm-485  Battle of Mons Graupius
    rm-486  Inchtuthil
    rm-487  Flavian Palace
    rm-488  Damnatio memoriae
    rm-489  Stephanus
    rm-490  The Flavian dynasty

### The high empire — `rm-high-empire`

    rm-491  Nerva–Antonine dynasty
    rm-492  Nerva
    rm-493  Plotina
    rm-494  Optimus princeps
    rm-495  Trajan's Dacian Wars
    rm-496  Decebalus
    rm-497  Trajan's Column
    rm-498  Forum of Trajan
    rm-499  Trajan's Market
    rm-500  Alimenta
    rm-501  Trajan's Parthian campaign
    rm-502  The greatest extent of the Roman Empire
    rm-503  Hadrian
    rm-504  Hadrian's abandonment of the eastern conquests
    rm-505  Hadrian's travels
    rm-506  Hadrian's Wall
    rm-507  Hadrian's frontier policy
    rm-508  Pantheon
    rm-509  Hadrian's Villa
    rm-510  Antinous
    rm-511  Bar Kokhba revolt
    rm-512  Aelia Capitolina
    rm-513  Antoninus Pius
    rm-514  Antonine Wall
    rm-515  Marcus Aurelius
    rm-516  Lucius Verus
    rm-517  The Parthian war of 161–166
    rm-518  Antonine Plague
    rm-519  Marcomannic Wars
    rm-520  Meditations
    rm-521  Column of Marcus Aurelius
    rm-522  Commodus
    rm-523  Commodus in the arena
    rm-524  The assassination of Commodus
    rm-525  Pax Romana
    rm-526  The prosperity of the second century
    rm-527  The cities of the high empire
    rm-528  Imperial cult
    rm-529  Roman citizenship in the second century
    rm-530  Imperial administration under the Antonines
    rm-531  The equestrian career
    rm-532  The emperor and the cities
    rm-533  Panegyric and the ideal emperor
    rm-534  The economy of the high empire
    rm-535  Rome at its height

### The Severans and the third-century crisis — `rm-third-century`

    rm-536  Year of the Five Emperors
    rm-537  Pertinax
    rm-538  Didius Julianus
    rm-539  Septimius Severus
    rm-540  The civil wars of 193–197
    rm-541  Severan military reform
    rm-542  Julia Domna
    rm-543  Severus in Britain
    rm-544  Caracalla
    rm-545  Antonine Constitution
    rm-546  Baths of Caracalla
    rm-547  Elagabalus
    rm-548  Severus Alexander
    rm-549  The end of the Severan dynasty
    rm-550  Crisis of the Third Century
    rm-551  Maximinus Thrax
    rm-552  The soldier emperors
    rm-553  Sasanian Empire
    rm-554  Shapur I
    rm-555  The capture of Valerian
    rm-556  The Gothic invasions of the third century
    rm-557  Debasement
    rm-558  Third-century inflation
    rm-559  Gallic Empire
    rm-560  Postumus
    rm-561  Palmyrene Empire
    rm-562  Zenobia
    rm-563  Aurelian
    rm-564  Aurelian Walls
    rm-565  The recovery of the empire

## Late Antiquity

### Diocletian and Constantine — `rm-dominate`

    rm-566  Diocletian
    rm-567  Tetrarchy
    rm-568  Dominate
    rm-569  Diocletian's provincial reform
    rm-570  Roman diocese
    rm-571  Diocletian's tax reform
    rm-572  Edict on Maximum Prices
    rm-573  Diocletianic Persecution
    rm-574  The abdication of Diocletian
    rm-575  Diocletian's Palace
    rm-576  The collapse of the Tetrarchy
    rm-577  Constantine the Great
    rm-578  Battle of the Milvian Bridge
    rm-579  The conversion of Constantine
    rm-580  Edict of Milan
    rm-581  Licinius
    rm-582  The reunification of the empire in 324
    rm-583  First Council of Nicaea
    rm-584  Nicene Creed
    rm-585  Arianism
    rm-586  The foundation of Constantinople
    rm-587  Solidus
    rm-588  The late Roman army
    rm-589  Comitatenses and limitanei
    rm-590  The late Roman bureaucracy
    rm-591  Colonate
    rm-592  Constantine's church building
    rm-593  Old St Peter's Basilica
    rm-594  Arch of Constantine
    rm-595  The sons of Constantine

### The Christian empire — `rm-christian-empire`

    rm-596  Constantius II
    rm-597  Julian
    rm-598  Julian's pagan restoration
    rm-599  Julian's Persian campaign
    rm-600  Valentinian and Valens
    rm-601  The Gothic crossing of the Danube
    rm-602  Battle of Adrianople
    rm-603  Theodosius I
    rm-604  The Gothic settlement of 382
    rm-605  Edict of Thessalonica
    rm-606  The end of public paganism
    rm-607  The Altar of Victory dispute
    rm-608  Ambrose
    rm-609  Massacre of Thessalonica
    rm-610  The division of the empire in 395
    rm-611  The Christianisation of the Roman Empire
    rm-612  The rise of the bishop
    rm-613  Early Christian monasticism
    rm-614  Vulgate
    rm-615  Augustine of Hippo
    rm-616  The City of God
    rm-617  Donatism
    rm-618  Council of Chalcedon
    rm-619  The papacy in late antiquity
    rm-620  Pope Leo I

### The end of the western empire — `rm-fall-west`

    rm-621  Fall of the Western Roman Empire
    rm-622  Stilicho
    rm-623  Alaric I
    rm-624  Sack of Rome, 410
    rm-625  The Rhine crossing of 406
    rm-626  Visigothic Kingdom
    rm-627  The Vandal conquest of Africa
    rm-628  Genseric
    rm-629  Flavius Aetius
    rm-630  Attila
    rm-631  Battle of the Catalaunian Plains
    rm-632  The Vandal sack of Rome, 455
    rm-633  The last western emperors
    rm-634  Romulus Augustulus
    rm-635  Odoacer
    rm-636  Ostrogothic Kingdom
    rm-637  The survival of the eastern empire
    rm-638  Justinian's reconquest
    rm-639  Explaining the fall of Rome
    rm-640  The legacy of Rome

## How Rome Worked

### The Roman army — `rm-army`

    rm-641  Roman army
    rm-642  Roman legion
    rm-643  Cohort
    rm-644  Centurion
    rm-645  The cohortal legion
    rm-646  Legionary
    rm-647  Legionary recruitment
    rm-648  Sacramentum
    rm-649  Legionary pay
    rm-650  Roman military diploma
    rm-651  Auxilia
    rm-652  Auxiliary cavalry
    rm-653  Urban cohorts
    rm-654  Vigiles
    rm-655  Roman navy
    rm-656  Classis
    rm-657  Gladius
    rm-658  Pilum
    rm-659  Scutum
    rm-660  Lorica segmentata
    rm-661  Galea
    rm-662  Caligae
    rm-663  Roman military standards
    rm-664  Aquila
    rm-665  Vexillum
    rm-666  Roman marching camp
    rm-667  Legionary fortress
    rm-668  Roman siege warfare
    rm-669  Roman artillery
    rm-670  Siege tower
    rm-671  Circumvallation
    rm-672  Testudo formation
    rm-673  Roman battle tactics
    rm-674  Roman military engineering
    rm-675  Roman military bridge building
    rm-676  Roman military discipline
    rm-677  Decimation
    rm-678  Roman military decorations
    rm-679  Corona civica
    rm-680  Ovation
    rm-681  The legionary's career
    rm-682  Veteran settlement
    rm-683  Soldiers' families
    rm-684  The army and the emperor
    rm-685  Donative
    rm-686  The army and the provincial economy
    rm-687  Roman military medicine
    rm-688  Roman military supply
    rm-689  Vindolanda tablets
    rm-690  The army on the frontiers
    rm-691  Barbarians in the Roman army
    rm-692  Late Roman cavalry
    rm-693  Roman military manuals
    rm-694  Vegetius
    rm-695  The Roman army and Roman success

### Government, law and citizenship — `rm-government`

    rm-696  The Roman constitution
    rm-697  Roman Senate
    rm-698  Senatus consultum
    rm-699  Senatorial order
    rm-700  The Roman assemblies
    rm-701  Comitia tributa
    rm-702  Roman voting procedure
    rm-703  Roman elections
    rm-704  Ambitus
    rm-705  Roman magistrate
    rm-706  Roman consul
    rm-707  Praetor
    rm-708  Aedile
    rm-709  Quaestor
    rm-710  Roman censor
    rm-711  Promagistrate
    rm-712  Auctoritas
    rm-713  Dignitas
    rm-714  Patronage in ancient Rome
    rm-715  Novus homo
    rm-716  Roman citizenship
    rm-717  The rights of a Roman citizen
    rm-718  The grant of citizenship
    rm-719  Peregrinus
    rm-720  Roman law
    rm-721  Ius civile
    rm-722  Ius gentium
    rm-723  The praetor's edict
    rm-724  Roman legal procedure
    rm-725  Roman jurists
    rm-726  Institutes of Gaius
    rm-727  Ulpian
    rm-728  Papinian
    rm-729  Digest
    rm-730  Codex Justinianus
    rm-731  Roman property law
    rm-732  Roman contract law
    rm-733  Roman inheritance law
    rm-734  Roman criminal law
    rm-735  Quaestio perpetua
    rm-736  Roman punishment
    rm-737  Crucifixion
    rm-738  Roman imperial rescripts
    rm-739  The emperor as judge
    rm-740  Roman provincial governor
    rm-741  The governor's staff
    rm-742  Roman taxation
    rm-743  Tributum
    rm-744  The provincial census
    rm-745  Aerarium
    rm-746  Patrimonium
    rm-747  Roman currency
    rm-748  Denarius
    rm-749  Roman public finance
    rm-750  Corruption and its control

### Provinces and frontiers — `rm-provinces`

    rm-751  Roman province
    rm-752  Limes
    rm-753  The Rhine frontier
    rm-754  The Danube frontier
    rm-755  Germania Inferior and Superior
    rm-756  Agri Decumates
    rm-757  Roman Britain
    rm-758  Londinium
    rm-759  Roman Gaul
    rm-760  Lugdunum
    rm-761  Hispania
    rm-762  Africa Proconsularis
    rm-763  Roman Carthage
    rm-764  Leptis Magna
    rm-765  Roman Egypt
    rm-766  Alexandria under Rome
    rm-767  The grain supply of Rome
    rm-768  Roman Syria
    rm-769  Palmyra
    rm-770  Judaea
    rm-771  Herod the Great
    rm-772  Rome and Parthia
    rm-773  Parthian Empire
    rm-774  Roman Asia Minor
    rm-775  Achaea
    rm-776  The Danubian provinces
    rm-777  Roman Dacia
    rm-778  Roman Sicily
    rm-779  Provincial self-government
    rm-780  Ius Italicum
    rm-781  Roman urbanism in the provinces
    rm-782  Romanisation
    rm-783  Resistance to Roman rule
    rm-784  Roman trade beyond the frontiers
    rm-785  Rome and the Silk Road

## Roman Life

### Family, household and slavery — `rm-society`

    rm-786  Roman society
    rm-787  Familia
    rm-788  Paterfamilias
    rm-789  Patria potestas
    rm-790  Marriage in ancient Rome
    rm-791  Manus marriage
    rm-792  Roman dowry
    rm-793  Divorce in ancient Rome
    rm-794  Women in ancient Rome
    rm-795  Women and property at Rome
    rm-796  Childhood in ancient Rome
    rm-797  Toga virilis
    rm-798  Adoption in ancient Rome
    rm-799  Roman education
    rm-800  Grammaticus
    rm-801  Rhetorical education
    rm-802  Slavery in ancient Rome
    rm-803  The sources of Roman slaves
    rm-804  The Roman slave market
    rm-805  Household slaves
    rm-806  Slavery in agriculture and mining
    rm-807  Manumission
    rm-808  Freedmen
    rm-809  Slave resistance at Rome
    rm-810  The Roman social orders
    rm-811  The equestrian order under the empire
    rm-812  Plebs urbana
    rm-813  Collegium
    rm-814  Salutatio
    rm-815  Cura annonae
    rm-816  Poverty at Rome
    rm-817  Roman dress
    rm-818  Toga
    rm-819  Roman food and drink
    rm-820  Roman banquet
    rm-821  Medicine in ancient Rome
    rm-822  Galen
    rm-823  Roman demography
    rm-824  Roman funerary commemoration
    rm-825  Death and burial at Rome

### The Roman city and daily life — `rm-daily-life`

    rm-826  Ancient Rome as a city
    rm-827  The population of ancient Rome
    rm-828  The fourteen regions of Rome
    rm-829  Insula
    rm-830  Domus
    rm-831  Atrium
    rm-832  Roman villa
    rm-833  Roman garden
    rm-834  Roman streets
    rm-835  Fire at Rome
    rm-836  The floods of the Tiber
    rm-837  Roman sanitation
    rm-838  Roman latrines
    rm-839  Water supply in the city of Rome
    rm-840  The Roman day
    rm-841  Roman timekeeping
    rm-842  Roman markets
    rm-843  Roman shops and workshops
    rm-844  Roman crafts
    rm-845  Roman trade
    rm-846  Roman merchant shipping
    rm-847  Ostia
    rm-848  Portus
    rm-849  Amphora
    rm-850  Terra sigillata
    rm-851  Roman glass
    rm-852  Roman prices and wages
    rm-853  Roman banking
    rm-854  Literacy in the Roman world
    rm-855  The graffiti of Pompeii
    rm-856  Roman writing materials
    rm-857  Travel in the Roman world
    rm-858  Cursus publicus
    rm-859  Roman inns and taverns
    rm-860  Roman agriculture
    rm-861  The Roman farm
    rm-862  Roman viticulture
    rm-863  Olive oil in the Roman world
    rm-864  Roman mining
    rm-865  Roman brick and tile

### Spectacle and leisure — `rm-spectacle`

    rm-866  Roman spectacle
    rm-867  Ludi
    rm-868  Gladiator
    rm-869  Gladiator school
    rm-870  Types of gladiator
    rm-871  Munus
    rm-872  Roman amphitheatre
    rm-873  Venatio
    rm-874  Executions in the arena
    rm-875  Naumachia
    rm-876  Roman chariot racing
    rm-877  Roman circus
    rm-878  Circus factions
    rm-879  Roman charioteers
    rm-880  Roman theatre building
    rm-881  Pantomimus
    rm-882  Roman mime
    rm-883  Roman baths
    rm-884  The great imperial baths
    rm-885  Roman board games and gambling
    rm-886  Exercise and the palaestra
    rm-887  The Roman festival calendar
    rm-888  Bread and circuses
    rm-889  The emperor at the games
    rm-890  Roman criticism of the games

## Religion, Letters and the Arts

### Roman religion and myth — `rm-religion`

    rm-891  Religion in ancient Rome
    rm-892  Pax deorum
    rm-893  Roman sacrifice
    rm-894  Roman temple
    rm-895  Roman priesthoods
    rm-896  Pontifex maximus
    rm-897  College of Pontiffs
    rm-898  Augur
    rm-899  Auspices
    rm-900  Haruspex
    rm-901  Vestal Virgin
    rm-902  Flamen
    rm-903  Arval Brethren
    rm-904  Jupiter
    rm-905  Juno
    rm-906  Minerva
    rm-907  Capitoline Triad
    rm-908  Mars
    rm-909  Venus
    rm-910  Vesta
    rm-911  Janus
    rm-912  Saturn
    rm-913  Lares and Penates
    rm-914  Genius
    rm-915  Roman household religion
    rm-916  The Roman religious calendar
    rm-917  Saturnalia
    rm-918  Lupercalia
    rm-919  Parentalia
    rm-920  Prodigies and expiation
    rm-921  The importation of foreign cults
    rm-922  Magna Mater
    rm-923  The cult of Isis at Rome
    rm-924  Mithraism
    rm-925  Roman imperial cult
    rm-926  Apotheosis
    rm-927  Judaism in the Roman world
    rm-928  The rise of Christianity
    rm-929  Persecution of Christians in the Roman Empire
    rm-930  Roman attitudes to superstition

### Latin literature and thought — `rm-literature`

    rm-931  Latin literature
    rm-932  Latin
    rm-933  Livius Andronicus
    rm-934  Ennius
    rm-935  Roman comedy
    rm-936  Plautus
    rm-937  Terence
    rm-938  Roman satire
    rm-939  Lucilius
    rm-940  Early Roman historiography
    rm-941  Cicero's speeches
    rm-942  Cicero's letters
    rm-943  Cicero's philosophical works
    rm-944  Roman rhetoric
    rm-945  Lucretius
    rm-946  Catullus
    rm-947  Neoteric poets
    rm-948  Sallust
    rm-949  Virgil
    rm-950  Aeneid
    rm-951  Eclogues and Georgics
    rm-952  Horace
    rm-953  Ovid
    rm-954  Metamorphoses
    rm-955  The exile of Ovid
    rm-956  Livy
    rm-957  Propertius and Tibullus
    rm-958  Latin love elegy
    rm-959  Seneca the Younger
    rm-960  Roman Stoicism
    rm-961  Lucan
    rm-962  Petronius
    rm-963  Martial
    rm-964  Juvenal
    rm-965  Quintilian
    rm-966  Tacitus
    rm-967  Suetonius
    rm-968  Apuleius
    rm-969  Ammianus Marcellinus
    rm-970  The transmission of Latin literature

### Art, architecture and engineering — `rm-arts`

    rm-971  Roman art
    rm-972  Roman portraiture
    rm-973  Verism
    rm-974  Roman historical relief
    rm-975  Roman copies of Greek sculpture
    rm-976  Roman wall painting
    rm-977  The four Pompeian styles
    rm-978  Roman mosaic
    rm-979  Ancient Roman architecture
    rm-980  Roman concrete
    rm-981  The Roman arch
    rm-982  Barrel vault and dome
    rm-983  The Roman architectural orders
    rm-984  Basilica
    rm-985  The Roman forum as a building type
    rm-986  Triumphal arch
    rm-987  Roman column monument
    rm-988  Roman aqueduct
    rm-989  Pont du Gard
    rm-990  Roman water engineering
    rm-991  Roman roads
    rm-992  Roman road construction
    rm-993  Roman bridges
    rm-994  Roman surveying
    rm-995  Groma
    rm-996  Vitruvius
    rm-997  The Roman building trades
    rm-998  Roman machines
    rm-999  Roman harbour engineering
    rm-1000 The afterlife of Roman architecture
