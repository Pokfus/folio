# India — the 1000-card plan

The running order for the `col-43` India collection. Every card has a number, a topic and a deck,
fixed in advance, so the collection can be grown one card at a time across many sessions without
anyone having to remember where it had got to.

Not part of the site.

## How to use this (the whole point of the file)

**"Generate the next India card" means: take the lowest `in-NNN` that is not yet in `data.js`, read
its topic and deck from the list below, research it, and add it.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));
      for(let i=1;i<=1000;i++){const id='in-'+String(i).padStart(3,'0');
      if(!h.has(id)){console.log('next:',id);break}}"

There is deliberately **no separate progress file**. `data.js` is the record of what exists, this file
is the record of what is planned, and the next card is whatever falls between them — so the two can
never disagree about where the work has got to.

Then write the card to the rules in CLAUDE.md ("Generating cards & glossary entries") and add it with:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** `add-card.js` falls back to the first leaf in the whole tree when it is
omitted, which is `cn-myth`, in the China collection.

Note that the numbering runs past 999, so ids are **not** all the same length: `in-001` … `in-999`,
then `in-1000`. The command above pads to three digits, which is right for every id but the last.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `in-510 Battle of Plassey` is already an answer term; `in-027 Indus religion` is an area, and
the card's actual answer — the word that gets blanked — is chosen while writing it, from what the
sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** Some will turn out
to be thinner than they look, and a few will turn out to be two cards. When that happens, change the
line here in the same commit as the card, and say so — this file is only useful while it is true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

Card ids run `in-001` … `in-1000`, in the order below. Numbering follows the tree, and the first seven
decks follow chronology, so their running order is roughly chronological — which also means an early
card and a late card in the same deck sort together on the study page, since cards are ordered by
`cardYears(answerDate)` and not by id. The last two decks are thematic and their order is a reading
order rather than a claim about dates.

## What this collection is about

**Before 1947 the subject is the subcontinent; after 1947 it is the Republic of India.** This has to
be stated because it is not obvious and because getting it wrong is the commonest fault in a course
called "India". The Indus cities are almost all in modern Pakistan. Gandhara is in Pakistan and
Afghanistan. Lahore was a Mughal capital, Dhaka a Mughal provincial one, and the Bengal whose
partition set off the Swadeshi movement is now two countries. A collection that quietly treats all of
that as the early history of one modern state has made a political claim without noticing.

So the cards before Partition describe the polities and regions that existed, under their own names,
and `in-682 Partition of India` is a hinge rather than a footnote — with the road to it and its human
cost carded properly, and the successor states named as what they became. After 1947 the collection
follows India, because that is the collection's subject and Pakistan and Bangladesh have their own
histories that this file does not attempt.

The same restraint applies at the edges. **Sri Lanka, Nepal, Bhutan and Myanmar appear where they
intersect** — Ashoka's mission, the Chola expeditions, the Anglo-Burmese wars, the Indian intervention
of the 1980s — and their own histories are not attempted here.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Ancient India | Prehistory and the Indus cities | 40 | in-001–040 |
| | The Vedic period | 40 | in-041–080 |
| | The Mahajanapadas and the new religions | 35 | in-081–115 |
| | The Mauryan Empire | 35 | in-116–150 |
| | After the Mauryas | 25 | in-151–175 |
| | The Gupta age | 25 | in-176–200 |
| Early Medieval India | The northern kingdoms | 30 | in-201–230 |
| | The Deccan: Chalukyas and Rashtrakutas | 25 | in-231–255 |
| | The Tamil south and the Cholas | 45 | in-256–300 |
| Sultanates and Successor States | The Delhi Sultanate | 40 | in-301–340 |
| | Vijayanagara | 25 | in-341–365 |
| | The Deccan sultanates and the regional kingdoms | 35 | in-366–400 |
| The Mughals | Babur to Akbar | 40 | in-401–440 |
| | Jahangir to Aurangzeb | 35 | in-441–475 |
| | The successor states | 25 | in-476–500 |
| Company and Crown | The East India Company | 40 | in-501–540 |
| | The Raj | 35 | in-541–575 |
| | Colonial rule and its consequences | 30 | in-576–605 |
| Nationalism and Independence | The rise of nationalism | 30 | in-606–635 |
| | Gandhi and mass politics | 35 | in-636–670 |
| | Independence and Partition | 25 | in-671–695 |
| India since 1947 | The Nehru years | 25 | in-696–720 |
| | India since 1964 | 30 | in-721–750 |
| Religion and Philosophy | Hindu traditions | 45 | in-751–795 |
| | Buddhism and Jainism | 30 | in-796–825 |
| | Islam, Sikhism and India's other faiths | 35 | in-826–860 |
| Society, Economy and Culture | Caste, family and society | 30 | in-861–890 |
| | Land, trade and the economy | 25 | in-891–915 |
| | Languages and literatures | 40 | in-916–955 |
| | Art, architecture and music | 30 | in-956–985 |
| | Science, mathematics and medicine | 15 | in-986–1000 |

Deck totals: Ancient India 200 · Early Medieval India 100 · Sultanates and Successor States 100 ·
The Mughals 100 · Company and Crown 105 · Nationalism and Independence 90 · India since 1947 55 ·
Religion and Philosophy 110 · Society, Economy and Culture 140. **1000.**

## What the weighting is arguing

**Ancient India keeps 200 cards and the colonial period gets 195.** Those two numbers together are the
argument of the file. A syllabus written in Britain gives the Company and the Raj most of the room
because that is where its own sources are; one written to answer it gives the ancient world most of
the room because that is where the greatness is. Both are reactions to the same colonial framing.
Twenty per cent each, and the two thousand years in between — which is where most of what India
actually was got made — keep 300.

**The south gets 130 cards of its own** across `in-south-early`, `in-deccan-early`, `in-vijayanagara`
and `in-deccan-sultanates`. The standard course runs a spine through the north — Indus, Vedic,
Mauryas, Guptas, Delhi, Mughals, Calcutta — and hangs the Cholas, Vijayanagara and the Deccan off it
as excursions. The Cholas ran a maritime empire that reached Sumatra and left the most detailed
administrative record in Indian history; Vijayanagara was the largest city in the world outside China
in its day. Neither is an excursion.

**Religion gets 110 cards and is not a narrative of conflict.** Four religions with a following today
were founded in India and two more have been there since antiquity, and the interesting questions
about all of them are doctrinal, institutional and social rather than communal. Communalism itself is
a card (`in-859`) with a history and a date.

**India since 1947 gets 55 for eighty years**, which is less than a reader expects. It is the best
documented and most argued-over stretch, it is the part most likely to swell, and the collection's job
is the whole of the past rather than the recent part of it.

## Six decisions this plan forced on the tree

Written down because they were made here, not in the tree, and the reasoning is invisible from the
tree itself.

**The tree rejects the Hindu / Muslim / British periodisation, and that is why it looks as it does.**
James Mill divided Indian history into a Hindu period, a Muslim period and a British one in 1817, and
that scheme — a religious label for a political era — is still the default shape of the subject. It
does real damage: it makes a dynasty's faith the salient fact about its rule, it hands eight centuries
to a category rather than a state, and it is the ancestor of the communal historiography that both
colonial administrators and later nationalists found useful. This tree periodises by **polity and
region** instead: Mauryas, Guptas, the northern kingdoms, the Cholas, the Delhi Sultanate,
Vijayanagara, the Deccan sultanates, the Mughals, the Company. Religion has its own deck, where the
questions can be asked properly.

**Caste is periodised, not assumed.** `in-061 Varna` sits in the Vedic deck, `in-863 Varna and jati`
in the society deck, and **`in-867 The making of caste under colonial rule` and `in-596 Colonial
ethnography and the making of caste categories` are both deliberate**: a great deal of what is
presented as an ancient and unchanging system was hardened, enumerated and given legal force by the
colonial census and the codes. A card that describes caste as a timeless four-fold order has repeated
a nineteenth-century administrative document. The rule is that a card says which century's caste it is
describing.

**Literature is one subdeck but it is emphatically plural.** The Rome plan gives Latin a single
subdeck because Latin literature is one canon in one language. India's is not: `in-languages` carries
Sanskrit, Pali and Prakrit, Tamil from the Sangam age onward, Kannada, Telugu, Malayalam, Marathi,
Bengali, Braj, Awadhi, Urdu, Persian and English, and the **vernacular turn is itself a card**
(`in-224`) because the moment regional languages became literary is one of the real turning points in
the subcontinent's history.

**The Indus cities get 30 cards and no invented continuity.** The script is undeciphered, so anything
about Indus religion, language or political structure is inference from material remains, and the card
says so. `in-029 The Ghaggar-Hakra and the Sarasvati question` and `in-033 The Aryan migration debate`
exist so that those arguments are had openly, in cards about the arguments, rather than settled
silently in a sentence somewhere else.

**Gandhi gets a subdeck and Ambedkar gets a card in it, not a footnote.** `in-652 B. R. Ambedkar`,
`in-653 Poona Pact` and `in-654 The Dalit movement` are in the nationalism deck because the argument
between Gandhi and Ambedkar about separate electorates for the depressed classes is one of the central
political arguments of the period, and a national movement told only from the Congress's side is not
the movement that happened. `in-698 Constitution of India` is Ambedkar's too.

**India since 1947 is two subdecks with the break at 1964**, Nehru's death, rather than one flat deck:
the first is state-building — a constitution, linguistic states, planning, land reform — and the second
is a different kind of history, in which the state is a given and the arguments are about who controls
it.

## History, not archaeology — and the two other pulls

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Do not restate either here; what follows is
only what is specific to this collection.

The archaeology pull is concentrated and severe. **`in-prehistory` is the worst case anywhere on the
site**: a civilisation of a thousand settlements with no readable text, so every card is written from
material evidence and the prose slides towards who excavated which mound in which season. Write about
the cities, not the digs.

**`in-033 The Aryan migration debate` is this collection's Normanist controversy** — the exact
counterpart of `ru-031` in the Russia plan. Whether Indo-Aryan speakers migrated into the subcontinent
in the second millennium BCE has been argued for two centuries, the argument has been political
throughout, and the genetics has moved substantially since 2018. The card is about the evidence and
about the argument; it does not settle it, and a card that quietly picks a side while sounding neutral
is worse than one that picks openly. `in-034 Ancient DNA and South Asian ancestry` carries the recent
work and must be written to what the papers claim rather than to what either side reports them as
claiming.

Two other pulls:

**Devotional and national registers.** A great deal of the accessible English-language writing on
ancient India is devotional, and a great deal on the modern period is written to settle a present-day
score. Neither is the register here. The Ramayana is a card about a text and a tradition, not a card
about events; `in-738 The Ram Janmabhoomi movement` and `in-739 The demolition of the Babri Masjid`
are cards about a political movement and a specific day, written from the scholarship and the legal
record. Where a claim is contested, the card says who contests it.

**Great men.** The rule the Rome and Russia plans use holds here: **no person is the subject of a run
of cards.** Where several cards carry one name — Ashoka, Akbar, Gandhi — they are edicts, policies,
campaigns and arguments, not episodes of a biography.

**Modern scholars are capped at two in the thousand and this plan spends BOTH**, which is a departure
from Rome and Russia and is deliberate. `in-134 The decipherment of Brahmi` and `in-920 The discovery
of the Indo-European family` are not biographies but events with consequences on the scale of the
Linear B decipherment that earns Greece's `gr-075`. Ashoka — the most consequential ruler of ancient
India — was entirely forgotten until his script was read in 1837, and the recognition that Sanskrit,
Greek and Latin descend from a common ancestor created the category "Aryan" that `in-033` is still
dealing with. Both are cards about what changed, not about who changed it.

## Dates, names and spellings

**Dates.** BCE/CE throughout, and **Indian chronology has real and unresolved uncertainty** — the date
of the Buddha's death moves by more than a century between scholarly schemes, the composition of the
Rigveda is a range and not a year, and dynastic dates before the Guptas are often argued to within
decades. **Give the range the scholarship gives and say it is a range.** Do not silently adopt a
traditional date, and do not silently adopt the earliest or latest one available.

**Names.** Plain English forms without diacritics — Ashoka, Chandragupta, Shivaji, Vijayanagara — since
the glossary matches on the surface a reader will type. Variant spellings go in `GLOSSARY_ALIASES` the
day the term ships, and there are a lot of them here.

**Places.** Use the name current at the time for a historical event and the modern name for the place,
saying which where it matters: the Bombay of the Company, the Mumbai of today; Calcutta in 1905 and
Kolkata now; Madras and Chennai; Benares, Banaras and Varanasi. As in the Russia plan, **a spelling is
not an argument and must not be made to do one silently.**

## Sourcing

South Asian history is well served in English, and much of the best of it is open: university
repositories, the Digital Library of India and archive.org for the out-of-copyright shelf, the
Archaeological Survey of India's own publications, museum records at the British Museum, the V&A, the
Met and the Indian national museums, and inscription corpora — the Cholas alone left tens of thousands
of inscriptions, and *Epigraphia Indica* is out of copyright. Three cautions.

**The colonial archive is most of what is digitised for 1757–1947, and it is a party to what it
describes.** Gazetteers, settlement reports, census volumes and official histories are indispensable
and are not neutral: they were written to administer, and their categories became facts. Cite them for
what they record and not for what they conclude.

**Ancient India attracts advocacy more than any other period on this site.** For the Indus, the Vedas
and the Aryan question in particular, a search returns devotional sites, nationalist sites and outright
fringe theory alongside the scholarship, and some of it is dressed as scholarship. The site's citation
bar is the defence: a peer-reviewed or institutional source, opened and read, or the claim does not
ship.

**Numbers for the colonial period are contested and the disagreements are large** — famine mortality,
the scale of deindustrialisation, the size of any drain of wealth, and the death toll of Partition all
have live scholarly ranges. Give the range and name whose it is. This is the same rule the Russia plan
sets for Soviet statistics, and for the same reason.

## Living beside the other collections

**World History is the survey and never waits for this collection.** Ancient India gets 20 cards there
(`wh-376`–`wh-395`) and South and Southeast Asia 20 more in the post-classical deck, at survey
altitude. The rule in `docs/world-history-card-plan.md` cuts both ways: ten sentences on the Mughal
Empire is a different card from ten sentences on the mansabdari system.

**Two pairs will need the Greece-and-Rome treatment when their partners are written.** Alexander's
Indian campaign is `in-111` here and `gr-738` in the Greece plan — the same months from opposite ends,
one about the limit of a Macedonian army's reach and one about what arrived on the Indus. And the
British side of the Company and the Raj belongs to a Britain collection that does not yet exist; when
it does, the pairs are Plassey, 1857 and Partition.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `in-097 The Buddha`, `in-104 Mahavira`, `in-105 Jainism` → also `in-buddhism-jainism`
- `in-125 Ashoka`, `in-129 Edicts of Ashoka` → also `in-buddhism-jainism`
- `in-267 The Bhakti movement in the Tamil country` → also `in-hinduism`, where `in-792` is the
  movement at large
- `in-467 The Sikh gurus and the Mughals`, `in-469 Guru Gobind Singh` → also `in-other-faiths`
- `in-652 B. R. Ambedkar` → also `in-society`, which is where caste is taught
- `in-583 Indigo and the indigo revolt` → also `in-economy`
- `in-189 Kalidasa`, `in-948 Rabindranath Tagore` → each other's decks

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`).

The glossary has the region's **eight modern countries and nothing else** — India, Pakistan,
Bangladesh, Nepal, Bhutan, Sri Lanka, the Maldives and Myanmar, all written and cited in Phase 3 of the
citation pass. Everything else is open ground: there is no `Dharma`, no `Varna`, no `Stupa`, no
`Mughal_Empire`. Write those **cited from the start**, at the `GLOSS_SRC_TARGET` bar of 2, rather than
opening a backlog to be closed later.

Three glossary traps this collection will hit harder than any before it. **Variant spellings are the
rule and not the exception** — Ashoka/Asoka/Aśoka, Vijayanagara/Vijayanagar, Mahabharata/Mahābhārata —
so every term needs its aliases the day it ships. **A term whose surface is an ordinary English word**
(`Raj`, `Company`, `Congress`, `Partition`, `Emergency`) needs `GLOSSARY_CASESENSITIVE` or a narrower
head word, or it will link inside sentences that do not mean it. And **a word that is a religious term
in one tradition and an everyday word in another** — `dharma`, `karma`, `guru`, `avatar` — has a
description that must not be written from one tradition's usage alone.

---

# The list

## Ancient India

### Prehistory and the Indus cities — `in-prehistory`

    in-001  The Indian subcontinent
    in-002  The prehistory of South Asia
    in-003  Bhimbetka rock shelters
    in-004  The South Asian Neolithic
    in-005  Mehrgarh
    in-006  Indus Valley Civilisation
    in-007  The discovery of the Indus cities
    in-008  Harappa
    in-009  Mohenjo-daro
    in-010  The Great Bath
    in-011  Dholavira
    in-012  Rakhigarhi
    in-013  Lothal
    in-014  Kalibangan
    in-015  Indus town planning
    in-016  Indus drainage and water management
    in-017  Indus craft production
    in-018  Indus seals
    in-019  The Pashupati seal
    in-020  Indus script
    in-021  Dancing Girl
    in-022  Priest-King
    in-023  Indus weights and measures
    in-024  Indus agriculture
    in-025  Indus trade with Mesopotamia
    in-026  Meluhha
    in-027  Indus religion
    in-028  The absence of palaces and temples in the Indus cities
    in-029  The Ghaggar-Hakra and the Sarasvati question
    in-030  The decline of the Indus cities
    in-031  The Late Harappan period
    in-032  Ochre Coloured Pottery culture
    in-033  The Aryan migration debate
    in-034  Ancient DNA and South Asian ancestry
    in-035  Indo-Aryan languages
    in-036  Dravidian languages
    in-037  Munda languages
    in-038  South Indian megaliths
    in-039  The South Asian Chalcolithic
    in-040  The coming of iron to India

### The Vedic period — `in-vedic`

    in-041  Vedic period
    in-042  Vedas
    in-043  Rigveda
    in-044  Vedic Sanskrit
    in-045  The oral transmission of the Vedas
    in-046  The dating of the Vedas
    in-047  The Vedic pastoral economy
    in-048  The Vedic tribes
    in-049  Battle of the Ten Kings
    in-050  Sapta Sindhu
    in-051  Historical Vedic religion
    in-052  Indra
    in-053  Agni
    in-054  Varuna
    in-055  Soma
    in-056  The Vedic sacrifice
    in-057  Yajna
    in-058  Ashvamedha
    in-059  The Vedic priesthood
    in-060  Purusha Sukta
    in-061  Varna
    in-062  The later Vedic period
    in-063  The eastward movement into the Ganges plain
    in-064  Iron and the clearing of the Ganges forests
    in-065  Painted Grey Ware culture
    in-066  Kuru kingdom
    in-067  Panchala
    in-068  Videha
    in-069  Vedic kingship
    in-070  The sabha and the samiti
    in-071  Yajurveda and Samaveda
    in-072  Atharvaveda
    in-073  Brahmanas
    in-074  Aranyakas
    in-075  Upanishads
    in-076  Brahman and atman
    in-077  Karma
    in-078  Samsara
    in-079  Moksha
    in-080  The Vedic legacy

### The Mahajanapadas and the new religions — `in-mahajanapadas`

    in-081  Mahajanapadas
    in-082  The second urbanisation
    in-083  Magadha
    in-084  Rajagriha
    in-085  Kosala
    in-086  Vatsa and Avanti
    in-087  Vajji
    in-088  The gana-sangha republics
    in-089  Bimbisara
    in-090  Ajatashatru
    in-091  The rise of Pataliputra
    in-092  The Shishunaga and Nanda dynasties
    in-093  Northern Black Polished Ware
    in-094  Punch-marked coins
    in-095  Shreni
    in-096  The sramana movement
    in-097  The Buddha
    in-098  The life of the Buddha
    in-099  Four Noble Truths
    in-100  Noble Eightfold Path
    in-101  The first sermon at Sarnath
    in-102  Sangha
    in-103  Early Buddhist monasticism
    in-104  Mahavira
    in-105  Jainism
    in-106  Ahimsa
    in-107  Anekantavada
    in-108  Ajivika
    in-109  Materialist and sceptical schools in ancient India
    in-110  The Achaemenid provinces in the Indus
    in-111  Alexander's Indian campaign
    in-112  Battle of the Hydaspes
    in-113  Porus
    in-114  Greek accounts of India
    in-115  The Indian world in 400 BCE

### The Mauryan Empire — `in-mauryas`

    in-116  Maurya Empire
    in-117  Chandragupta Maurya
    in-118  Chanakya
    in-119  Arthashastra
    in-120  The Mauryan seizure of Magadha
    in-121  The treaty with Seleucus
    in-122  Megasthenes
    in-123  Indica
    in-124  Bindusara
    in-125  Ashoka
    in-126  Kalinga War
    in-127  Ashoka's conversion
    in-128  Ashoka's dhamma
    in-129  Edicts of Ashoka
    in-130  The rock edicts
    in-131  The pillar edicts
    in-132  Pillars of Ashoka
    in-133  Lion Capital of Ashoka
    in-134  The decipherment of Brahmi
    in-135  Brahmi script
    in-136  Kharosthi
    in-137  Ashoka's Buddhist missions
    in-138  Third Buddhist council
    in-139  The mission to Sri Lanka
    in-140  Mauryan administration
    in-141  The Mauryan provinces
    in-142  Mauryan revenue
    in-143  Mauryan roads
    in-144  Pataliputra under the Mauryas
    in-145  Mauryan art
    in-146  Didarganj Yakshi
    in-147  Mauryan stupas
    in-148  Sanchi
    in-149  The fall of the Mauryas
    in-150  Ashoka in modern India

### After the Mauryas — `in-after-mauryas`

    in-151  Shunga Empire
    in-152  Pushyamitra Shunga
    in-153  Bharhut
    in-154  The gateways of Sanchi
    in-155  Indo-Greek Kingdom
    in-156  Menander I
    in-157  Milinda Panha
    in-158  Indo-Greek coinage
    in-159  Indo-Scythians
    in-160  Indo-Parthian Kingdom
    in-161  Kushan Empire
    in-162  Kanishka
    in-163  Fourth Buddhist council
    in-164  Mahayana
    in-165  Greco-Buddhist art
    in-166  Mathura art
    in-167  The first images of the Buddha
    in-168  Satavahana dynasty
    in-169  The Deccan under the Satavahanas
    in-170  Sangam period
    in-171  The Chera, Chola and Pandya kingdoms of the Sangam age
    in-172  Roman trade with India
    in-173  Periplus of the Erythraean Sea
    in-174  The monsoon trade of the Indian Ocean
    in-175  Merchant guilds in early India

### The Gupta age — `in-guptas`

    in-176  Gupta Empire
    in-177  Chandragupta I
    in-178  Samudragupta
    in-179  Allahabad pillar inscription
    in-180  Chandragupta II
    in-181  Gupta administration
    in-182  Gupta land grants
    in-183  Faxian
    in-184  Gupta coinage
    in-185  Iron pillar of Delhi
    in-186  Gupta temple architecture
    in-187  Ajanta Caves
    in-188  Gupta sculpture
    in-189  Kalidasa
    in-190  Abhijnanashakuntalam
    in-191  Aryabhata
    in-192  Varahamihira
    in-193  Nalanda
    in-194  Puranas
    in-195  The Gupta golden age question
    in-196  Alchon Huns
    in-197  The fall of the Guptas
    in-198  Harsha
    in-199  Xuanzang
    in-200  The end of the classical age

## Early Medieval India

### The northern kingdoms — `in-north-kingdoms`

    in-201  Early medieval India
    in-202  The tripartite struggle for Kanauj
    in-203  Gurjara-Pratihara dynasty
    in-204  Pala Empire
    in-205  Buddhism under the Palas
    in-206  Vikramashila
    in-207  Rashtrakuta intervention in the north
    in-208  Rajput
    in-209  Chahamanas of Shakambhari
    in-210  Prithviraj Chauhan
    in-211  Chandela dynasty
    in-212  Khajuraho
    in-213  Paramara dynasty
    in-214  Chaulukya dynasty
    in-215  Dilwara Temples
    in-216  Kashmir under the Karkotas and the Loharas
    in-217  Rajatarangini
    in-218  Sena dynasty
    in-219  Eastern Ganga dynasty
    in-220  Konark Sun Temple
    in-221  The feudalism debate in early medieval India
    in-222  The temple as an institution
    in-223  Brahmadeya
    in-224  The vernacular turn
    in-225  Mahmud of Ghazni
    in-226  The raid on Somnath
    in-227  Al-Biruni
    in-228  Muhammad of Ghor
    in-229  Battles of Tarain
    in-230  Ahom kingdom

### The Deccan: Chalukyas and Rashtrakutas — `in-deccan-early`

    in-231  The Deccan in the early medieval period
    in-232  Vakataka dynasty
    in-233  Chalukya dynasty
    in-234  Pulakeshin II
    in-235  Badami cave temples
    in-236  Aihole and Pattadakal
    in-237  Rashtrakuta dynasty
    in-238  Krishna I of the Rashtrakutas
    in-239  Kailasa temple
    in-240  Ellora Caves
    in-241  Elephanta Caves
    in-242  Western Chalukya Empire
    in-243  Seuna dynasty
    in-244  Kakatiya dynasty
    in-245  Rudrama Devi
    in-246  Warangal
    in-247  Hoysala Empire
    in-248  Hoysala architecture
    in-249  Belur and Halebidu
    in-250  The trade routes of the Deccan
    in-251  Basava
    in-252  Lingayatism
    in-253  The Deccan ports and the Indian Ocean
    in-254  Jainism in the Deccan
    in-255  The Deccan in 1300

### The Tamil south and the Cholas — `in-south-early`

    in-256  The Tamil country
    in-257  Pallava dynasty
    in-258  Mahendravarman I
    in-259  Narasimhavarman I
    in-260  Mamallapuram
    in-261  Shore Temple
    in-262  Kanchipuram
    in-263  Pallava rock-cut architecture
    in-264  The Pallava–Chalukya wars
    in-265  Pandya dynasty
    in-266  Madurai
    in-267  The bhakti movement in the Tamil country
    in-268  Alvars
    in-269  Nayanars
    in-270  Tevaram
    in-271  The decline of Buddhism and Jainism in the Tamil country
    in-272  Chola dynasty
    in-273  Vijayalaya Chola
    in-274  Rajaraja I
    in-275  Brihadisvara Temple
    in-276  Rajendra I
    in-277  The Chola expedition to the Ganges
    in-278  The Chola raid on Srivijaya
    in-279  Gangaikonda Cholapuram
    in-280  Chola bronzes
    in-281  Nataraja
    in-282  Chola administration
    in-283  The Chola village assembly
    in-284  Uttiramerur inscriptions
    in-285  The Chola temple economy
    in-286  Chola inscriptions as a historical source
    in-287  The nadu and the nagaram
    in-288  Tamil merchant guilds overseas
    in-289  The Cholas and Sri Lanka
    in-290  The Cholas and Southeast Asia
    in-291  Indian influence in Southeast Asia
    in-292  The decline of the Cholas
    in-293  The later Pandyas
    in-294  Foreign travellers in south India
    in-295  Ramanuja
    in-296  Vishishtadvaita
    in-297  Madhvacharya
    in-298  Sri Vaishnavism
    in-299  The south Indian temple town
    in-300  The south on the eve of the sultanates

## Sultanates and Successor States

### The Delhi Sultanate — `in-delhi-sultanate`

    in-301  Delhi Sultanate
    in-302  Qutb al-Din Aibak
    in-303  Mamluk dynasty of Delhi
    in-304  Qutb Minar
    in-305  Quwwat-ul-Islam Mosque
    in-306  Iltutmish
    in-307  Razia Sultana
    in-308  The Forty
    in-309  Balban
    in-310  The Mongol threat to the Delhi Sultanate
    in-311  Khalji dynasty
    in-312  Alauddin Khalji
    in-313  Alauddin Khalji's market controls
    in-314  Alauddin Khalji's revenue reforms
    in-315  The Khalji conquests in Gujarat and Rajasthan
    in-316  The siege of Chittorgarh, 1303
    in-317  Malik Kafur's southern campaigns
    in-318  Tughlaq dynasty
    in-319  Muhammad bin Tughlaq
    in-320  The transfer of the capital to Daulatabad
    in-321  The token currency of Muhammad bin Tughlaq
    in-322  Firuz Shah Tughlaq
    in-323  Iqta
    in-324  The administration of the Delhi Sultanate
    in-325  The army of the Delhi Sultanate
    in-326  The coinage of the Delhi Sultanate
    in-327  Indo-Islamic architecture
    in-328  Amir Khusrau
    in-329  Persian in India
    in-330  The Sufi orders in India
    in-331  Chishti order
    in-332  Nizamuddin Auliya
    in-333  Timur's invasion of India
    in-334  The sack of Delhi in 1398
    in-335  Sayyid dynasty
    in-336  Lodi dynasty
    in-337  Ibrahim Lodi
    in-338  The regional sultanates
    in-339  Bengal Sultanate
    in-340  The Gujarat and Malwa sultanates

### Vijayanagara — `in-vijayanagara`

    in-341  Vijayanagara Empire
    in-342  The founding of Vijayanagara
    in-343  Hampi
    in-344  The city of Vijayanagara
    in-345  Vijayanagara architecture
    in-346  Virupaksha Temple
    in-347  Vittala Temple
    in-348  Vijayanagara kingship
    in-349  The nayaka system
    in-350  Amara-nayaka
    in-351  Deva Raya II
    in-352  Krishnadevaraya
    in-353  Amuktamalyada
    in-354  Vijayanagara and the horse trade
    in-355  The Vijayanagara army
    in-356  Foreign travellers at Vijayanagara
    in-357  Domingo Paes and Abdur Razzaq
    in-358  Vijayanagara and the Deccan sultanates
    in-359  Battle of Talikota
    in-360  The sack of Vijayanagara
    in-361  Aravidu dynasty
    in-362  The nayaka kingdoms
    in-363  Madurai Nayak dynasty
    in-364  The Ashtadiggajas
    in-365  The Vijayanagara legacy

### The Deccan sultanates and the regional kingdoms — `in-deccan-sultanates`

    in-366  Bahmani Sultanate
    in-367  Mahmud Gawan
    in-368  Gulbarga and Bidar
    in-369  The breakup of the Bahmani Sultanate
    in-370  Deccan sultanates
    in-371  Ahmadnagar Sultanate
    in-372  Adil Shahi dynasty
    in-373  Gol Gumbaz
    in-374  Golconda
    in-375  Qutb Shahi dynasty
    in-376  Charminar
    in-377  Chand Bibi
    in-378  Malik Ambar
    in-379  Deccani painting
    in-380  Dakhini
    in-381  The Rajput states
    in-382  Mewar
    in-383  Rana Kumbha
    in-384  Rana Sanga
    in-385  Marwar and Amber
    in-386  Kashmir under Zain-ul-Abidin
    in-387  The Gajapati kingdom
    in-388  The Ahom expansion in Assam
    in-389  Kerala before the Portuguese
    in-390  Zamorin of Calicut
    in-391  The Malabar pepper trade
    in-392  The Jewish and Christian communities of Kerala
    in-393  The arrival of Vasco da Gama
    in-394  Portuguese India
    in-395  Goa under the Portuguese
    in-396  Afonso de Albuquerque
    in-397  The cartaz system
    in-398  Estado da India
    in-399  The Indian Ocean in the sixteenth century
    in-400  India on the eve of the Mughals

## The Mughals

### Babur to Akbar — `in-early-mughals`

    in-401  Mughal Empire
    in-402  Babur
    in-403  First Battle of Panipat
    in-404  Battle of Khanwa
    in-405  Baburnama
    in-406  Humayun
    in-407  Sher Shah Suri
    in-408  Sur Empire
    in-409  Sher Shah Suri's administration
    in-410  Grand Trunk Road
    in-411  The rupee
    in-412  Humayun's exile and return
    in-413  Humayun's Tomb
    in-414  Akbar
    in-415  Second Battle of Panipat
    in-416  Bairam Khan
    in-417  Akbar's conquests
    in-418  The siege of Chittorgarh, 1568
    in-419  Akbar and the Rajputs
    in-420  Battle of Haldighati
    in-421  Maharana Pratap
    in-422  The abolition of the jizya
    in-423  Mansabdar
    in-424  Zabt
    in-425  Todar Mal
    in-426  Akbar's administration
    in-427  Subah
    in-428  Din-i Ilahi
    in-429  Ibadat Khana
    in-430  Sulh-i kul
    in-431  Abu'l-Fazl
    in-432  Akbarnama
    in-433  Ain-i-Akbari
    in-434  Fatehpur Sikri
    in-435  Mughal painting under Akbar
    in-436  The Mughal translation bureau
    in-437  The Navaratnas of Akbar's court
    in-438  Tansen
    in-439  Akbar and the Jesuits
    in-440  Akbar in retrospect

### Jahangir to Aurangzeb — `in-high-mughal`

    in-441  Jahangir
    in-442  The revolt of Khusrau
    in-443  Nur Jahan
    in-444  Jahangirnama
    in-445  Mughal painting under Jahangir
    in-446  The embassy of Thomas Roe
    in-447  Shah Jahan
    in-448  Taj Mahal
    in-449  Mumtaz Mahal
    in-450  Shahjahanabad
    in-451  Red Fort
    in-452  Peacock Throne
    in-453  Mughal architecture under Shah Jahan
    in-454  The Mughal campaigns in the Deccan
    in-455  The Deccan famine of 1630–1632
    in-456  Dara Shikoh
    in-457  The Mughal war of succession of 1657
    in-458  Aurangzeb
    in-459  Aurangzeb's religious policy
    in-460  The reimposition of the jizya
    in-461  Aurangzeb's Deccan wars
    in-462  Shivaji
    in-463  The founding of the Maratha state
    in-464  Maratha guerrilla warfare
    in-465  Sambhaji
    in-466  The Maratha war of independence
    in-467  The Sikh gurus and the Mughals
    in-468  The execution of Guru Tegh Bahadur
    in-469  Guru Gobind Singh
    in-470  The Jat and Satnami risings
    in-471  The Mughal nobility
    in-472  The jagirdari crisis
    in-473  The Mughal economy at its height
    in-474  The death of Aurangzeb
    in-475  Explaining the Mughal decline

### The successor states — `in-mughal-successors`

    in-476  The later Mughals
    in-477  The Mughal succession crises after 1707
    in-478  The Sayyid brothers
    in-479  Nader Shah's invasion of India
    in-480  The sack of Delhi in 1739
    in-481  Ahmad Shah Durrani
    in-482  Third Battle of Panipat
    in-483  Maratha Empire
    in-484  Peshwa
    in-485  Baji Rao I
    in-486  The Maratha confederacy
    in-487  Chauth and sardeshmukhi
    in-488  Nizam of Hyderabad
    in-489  The Nawabs of Bengal
    in-490  Murshid Quli Khan
    in-491  Awadh
    in-492  The Rohillas
    in-493  Hyder Ali
    in-494  Tipu Sultan
    in-495  Sikh Empire
    in-496  Ranjit Singh
    in-497  The Rajput states in the eighteenth century
    in-498  The eighteenth century: decline or transition
    in-499  The regional courts of the eighteenth century
    in-500  India in 1750

## Company and Crown

### The East India Company — `in-company`

    in-501  East India Company
    in-502  The founding of the East India Company
    in-503  Surat and the first factories
    in-504  Madras, Bombay and Calcutta
    in-505  The Company and the Mughal court
    in-506  The Anglo-French rivalry in India
    in-507  Joseph François Dupleix
    in-508  Carnatic Wars
    in-509  Robert Clive
    in-510  Battle of Plassey
    in-511  Siraj ud-Daulah
    in-512  Battle of Buxar
    in-513  The grant of the diwani
    in-514  The dual government of Bengal
    in-515  Bengal famine of 1770
    in-516  Regulating Act 1773
    in-517  Warren Hastings
    in-518  The impeachment of Warren Hastings
    in-519  Pitt's India Act
    in-520  Charles Cornwallis
    in-521  Permanent Settlement
    in-522  The ryotwari and mahalwari settlements
    in-523  Anglo-Mysore Wars
    in-524  Siege of Seringapatam
    in-525  Anglo-Maratha Wars
    in-526  Subsidiary alliance
    in-527  Richard Wellesley
    in-528  Doctrine of lapse
    in-529  The annexation of Awadh
    in-530  Anglo-Sikh Wars
    in-531  The annexation of Punjab
    in-532  The Company army and the sepoys
    in-533  The Company's revenue state
    in-534  Company rule and Indian merchants
    in-535  Charter Act of 1813
    in-536  Charter Act of 1833
    in-537  The end of the Company's monopoly
    in-538  Anglo-Burmese Wars
    in-539  The Company's Indian empire in 1856
    in-540  How the Company conquered India

### The Raj — `in-raj`

    in-541  Indian Rebellion of 1857
    in-542  The greased cartridges
    in-543  Mangal Pandey
    in-544  The siege of Delhi
    in-545  Bahadur Shah Zafar
    in-546  The siege of Lucknow
    in-547  Rani of Jhansi
    in-548  Tantia Tope
    in-549  The suppression of the rebellion
    in-550  Interpreting 1857
    in-551  Government of India Act 1858
    in-552  British Raj
    in-553  Viceroy of India
    in-554  Indian Civil Service
    in-555  Princely state
    in-556  The Indian Army after 1857
    in-557  Martial race
    in-558  Indian railways under the Raj
    in-559  The telegraph and the post in India
    in-560  Census of India
    in-561  Colonial law and the Indian codes
    in-562  English education in India
    in-563  Macaulay's Minute on Indian Education
    in-564  The Indian universities
    in-565  The Indian press under the Raj
    in-566  Lord Curzon
    in-567  Delhi Durbar
    in-568  The late Victorian famines in India
    in-569  Famine policy and its critics
    in-570  Indian indenture
    in-571  The Indian diaspora
    in-572  Indian soldiers in Britain's wars
    in-573  India in the First World War
    in-574  India in the Second World War
    in-575  Bengal famine of 1943

### Colonial rule and its consequences — `in-colonial-impact`

    in-576  The economic impact of colonial rule on India
    in-577  Drain of wealth
    in-578  Dadabhai Naoroji
    in-579  Deindustrialisation in colonial India
    in-580  The Indian handloom weavers
    in-581  The Lancashire trade and Indian cloth
    in-582  Plantation agriculture in India
    in-583  Indigo and the indigo revolt
    in-584  Opium and the China trade
    in-585  The commercialisation of Indian agriculture
    in-586  Rural indebtedness in colonial India
    in-587  Indian industry under the Raj
    in-588  The Tata enterprises
    in-589  Colonial urbanisation in India
    in-590  Public health and epidemics in colonial India
    in-591  The plague of 1896 and its policing
    in-592  Colonial forestry in India
    in-593  Great Trigonometrical Survey
    in-594  Orientalism and Indology
    in-595  Asiatic Society
    in-596  Colonial ethnography and the making of caste categories
    in-597  Criminal Tribes Act
    in-598  Personal law in colonial India
    in-599  Sati and its abolition
    in-600  Widow remarriage and social reform legislation
    in-601  The Age of Consent Act
    in-602  Christian missionaries in colonial India
    in-603  Colonial architecture in India
    in-604  New Delhi
    in-605  What colonial rule left behind

## Nationalism and Independence

### The rise of nationalism — `in-nationalism`

    in-606  Indian nationalism
    in-607  Bengal Renaissance
    in-608  Ram Mohan Roy
    in-609  Brahmo Samaj
    in-610  Ishwar Chandra Vidyasagar
    in-611  Arya Samaj
    in-612  Dayananda Saraswati
    in-613  Ramakrishna and Vivekananda
    in-614  Aligarh Movement
    in-615  Syed Ahmad Khan
    in-616  Jyotirao Phule
    in-617  The non-Brahmin movements
    in-618  Indian National Congress
    in-619  The Congress moderates
    in-620  Gopal Krishna Gokhale
    in-621  Bal Gangadhar Tilak
    in-622  Swadeshi movement
    in-623  Partition of Bengal, 1905
    in-624  The revolutionary movement in India
    in-625  All-India Muslim League
    in-626  Morley-Minto Reforms
    in-627  Separate electorates
    in-628  The annulment of the partition of Bengal
    in-629  Ghadar Party
    in-630  Home Rule movement
    in-631  Annie Besant in India
    in-632  Lucknow Pact
    in-633  Montagu-Chelmsford Reforms
    in-634  Rowlatt Act
    in-635  Jallianwala Bagh massacre

### Gandhi and mass politics — `in-gandhi`

    in-636  Mahatma Gandhi
    in-637  Gandhi in South Africa
    in-638  Satyagraha
    in-639  Champaran and Kheda
    in-640  The Ahmedabad mill strike
    in-641  Khilafat Movement
    in-642  Non-cooperation movement
    in-643  Chauri Chaura incident
    in-644  Swaraj Party
    in-645  Simon Commission
    in-646  Bhagat Singh
    in-647  Hindustan Socialist Republican Association
    in-648  Purna Swaraj
    in-649  Salt March
    in-650  Civil Disobedience Movement
    in-651  Round Table Conferences
    in-652  B. R. Ambedkar
    in-653  Poona Pact
    in-654  The Dalit movement
    in-655  Government of India Act 1935
    in-656  The provincial elections of 1937
    in-657  Jawaharlal Nehru
    in-658  Subhas Chandra Bose
    in-659  Indian National Army
    in-660  Congress and the Second World War
    in-661  The August Offer and the Cripps Mission
    in-662  Quit India Movement
    in-663  Gandhi's constructive programme
    in-664  Khadi
    in-665  Gandhi and untouchability
    in-666  Gandhi and Hindu-Muslim unity
    in-667  Women in the Indian national movement
    in-668  Sarojini Naidu
    in-669  The peasant and workers' movements
    in-670  Communist Party of India

### Independence and Partition — `in-partition`

    in-671  Muhammad Ali Jinnah
    in-672  Two-nation theory
    in-673  Lahore Resolution
    in-674  Direct Action Day
    in-675  The Calcutta killings
    in-676  Cabinet Mission
    in-677  The interim government of 1946
    in-678  Louis Mountbatten
    in-679  The Mountbatten Plan
    in-680  Indian Independence Act 1947
    in-681  Radcliffe Line
    in-682  Partition of India
    in-683  The partition of Punjab
    in-684  The partition of Bengal, 1947
    in-685  The Partition refugees
    in-686  Violence against women in the Partition
    in-687  The human cost of Partition
    in-688  Indian Independence Day
    in-689  The integration of the princely states
    in-690  Vallabhbhai Patel
    in-691  The accession of Hyderabad
    in-692  The accession of Junagadh
    in-693  The accession of Jammu and Kashmir
    in-694  The assassination of Gandhi
    in-695  Explaining Partition

## India since 1947

### The Nehru years — `in-nehru`

    in-696  Dominion of India
    in-697  Constituent Assembly of India
    in-698  Constitution of India
    in-699  Fundamental Rights and Directive Principles
    in-700  Indian federalism
    in-701  Reservation in India
    in-702  The abolition of untouchability
    in-703  Hindu Code Bills
    in-704  Indo-Pakistani War of 1947–1948
    in-705  The first Indian general election
    in-706  The Five-Year Plans of India
    in-707  The big dams of independent India
    in-708  The Indian public sector
    in-709  Land reform in India
    in-710  States Reorganisation Act
    in-711  The linguistic states movement
    in-712  Non-Aligned Movement
    in-713  Bandung Conference
    in-714  Panchsheel
    in-715  The annexation of Goa
    in-716  Sino-Indian War
    in-717  The death of Nehru
    in-718  Lal Bahadur Shastri
    in-719  Indo-Pakistani War of 1965
    in-720  Green Revolution in India

### India since 1964 — `in-modern`

    in-721  Indira Gandhi
    in-722  The Congress split of 1969
    in-723  Bank nationalisation and the privy purses
    in-724  India and the Bangladesh Liberation War
    in-725  Indo-Pakistani War of 1971
    in-726  Smiling Buddha
    in-727  The Emergency
    in-728  The sterilisation campaign
    in-729  The Janata government
    in-730  Operation Blue Star
    in-731  The assassination of Indira Gandhi
    in-732  The anti-Sikh riots of 1984
    in-733  Bhopal disaster
    in-734  Rajiv Gandhi
    in-735  The Indian intervention in Sri Lanka
    in-736  Mandal Commission
    in-737  The rise of the Bharatiya Janata Party
    in-738  The Ram Janmabhoomi movement
    in-739  The demolition of the Babri Masjid
    in-740  The Indian economic reforms of 1991
    in-741  Manmohan Singh
    in-742  Liberalisation and its results
    in-743  The Indian information technology industry
    in-744  Pokhran-II
    in-745  Kargil War
    in-746  The Kashmir conflict
    in-747  Naxalism
    in-748  Coalition politics in India
    in-749  Narendra Modi
    in-750  India in the twenty-first century

## Religion and Philosophy

### Hindu traditions — `in-hinduism`

    in-751  Hinduism
    in-752  The word Hindu
    in-753  Dharma
    in-754  Purushartha
    in-755  Ashrama
    in-756  Sanatana dharma
    in-757  Vedanta
    in-758  Adi Shankara
    in-759  Advaita Vedanta
    in-760  Samkhya
    in-761  Yoga
    in-762  Yoga Sutras of Patanjali
    in-763  Nyaya and Vaisheshika
    in-764  Mimamsa
    in-765  The six darshanas
    in-766  Vishnu
    in-767  Dashavatara
    in-768  Shiva
    in-769  Lingam
    in-770  Devi
    in-771  Durga
    in-772  Kali
    in-773  Ganesha
    in-774  Hanuman
    in-775  Krishna
    in-776  Rama
    in-777  Ramayana
    in-778  Mahabharata
    in-779  Bhagavad Gita
    in-780  Vaishnavism
    in-781  Shaivism
    in-782  Shaktism
    in-783  Tantra
    in-784  Puja
    in-785  Murti and temple worship
    in-786  Pilgrimage in India
    in-787  Kumbh Mela
    in-788  Varanasi
    in-789  The Ganges as a sacred river
    in-790  The Hindu calendar
    in-791  Diwali and Holi
    in-792  Bhakti movement
    in-793  Kabir
    in-794  Mirabai
    in-795  Hindu reform movements and Hindutva

### Buddhism and Jainism — `in-buddhism-jainism`

    in-796  Buddhism
    in-797  Buddhist texts
    in-798  Pali Canon
    in-799  Theravada
    in-800  The Buddhist councils
    in-801  Buddhist monasticism in India
    in-802  Stupa
    in-803  Buddhist cave monasteries of India
    in-804  Amaravati and the Andhra Buddhist sites
    in-805  Bodh Gaya
    in-806  The Bodhi tree
    in-807  Nagarjuna
    in-808  Madhyamaka
    in-809  Yogachara
    in-810  Vajrayana
    in-811  The Buddhist universities of eastern India
    in-812  The spread of Buddhism beyond India
    in-813  Buddhism in Sri Lanka and Southeast Asia
    in-814  The decline of Buddhism in India
    in-815  Navayana
    in-816  Jain cosmology
    in-817  Tirthankara
    in-818  Parshvanatha
    in-819  Digambara and Svetambara
    in-820  Jain monasticism
    in-821  Jain literature
    in-822  Jain temples and art
    in-823  Gommateshwara
    in-824  Jain merchants and Indian commerce
    in-825  Jainism today

### Islam, Sikhism and India's other faiths — `in-other-faiths`

    in-826  Islam in India
    in-827  The Arab conquest of Sindh
    in-828  Muslim traders on the Malabar coast
    in-829  Conversion to Islam in South Asia
    in-830  Sufism in India
    in-831  Dargah
    in-832  Moinuddin Chishti
    in-833  The Suhrawardi, Qadiri and Naqshbandi orders in India
    in-834  Islamic scholarship in India
    in-835  Darul Uloom Deoband
    in-836  The Barelvi movement
    in-837  Urdu and Muslim culture in India
    in-838  Mosque architecture in India
    in-839  Sikhism
    in-840  Guru Nanak
    in-841  The ten Sikh gurus
    in-842  Guru Granth Sahib
    in-843  Gurdwara and langar
    in-844  Golden Temple
    in-845  Khalsa
    in-846  The Five Ks
    in-847  The Singh Sabha movement
    in-848  Christianity in India
    in-849  Saint Thomas Christians
    in-850  Catholic missions in India
    in-851  Protestant missions and Indian Christianity
    in-852  Zoroastrianism
    in-853  Parsis
    in-854  Jewish communities in India
    in-855  Folk religion in India
    in-856  Adivasi religion
    in-857  Shared shrines and syncretic traditions
    in-858  Religious conversion and its politics in India
    in-859  Communalism
    in-860  Secularism in India

## Society, Economy and Culture

### Caste, family and society — `in-society`

    in-861  Indian society
    in-862  Caste
    in-863  Varna and jati
    in-864  Untouchability
    in-865  Dalit
    in-866  Adivasi
    in-867  The making of caste under colonial rule
    in-868  Caste and politics in modern India
    in-869  The Indian family
    in-870  The joint family
    in-871  Marriage in India
    in-872  Dowry
    in-873  Women in Indian history
    in-874  Purdah
    in-875  Devadasi
    in-876  The Indian women's movement
    in-877  Childhood and schooling in India
    in-878  Indian cuisine
    in-879  Vegetarianism in India
    in-880  Indian clothing
    in-881  The Indian village
    in-882  Indian cities
    in-883  The population history of India
    in-884  Migration within India
    in-885  Indian healing traditions
    in-886  Ayurveda
    in-887  Unani medicine
    in-888  Indian sports and games
    in-889  Festivals and public life in India
    in-890  Indian social change since 1947

### Land, trade and the economy — `in-economy`

    in-891  The economic history of India
    in-892  Indian agriculture
    in-893  Irrigation in India
    in-894  Land tenure in India
    in-895  The Indian peasantry
    in-896  Indian textiles
    in-897  Cotton in India
    in-898  Indian silk and wool
    in-899  Indian dyes and printed cloth
    in-900  The Indian spice trade
    in-901  Indian metallurgy
    in-902  Wootz steel
    in-903  Indian shipbuilding
    in-904  Indian ports
    in-905  Coinage in India
    in-906  Banking and credit in pre-colonial India
    in-907  Hundi
    in-908  Indian merchant communities
    in-909  Indian craft production
    in-910  Indian labour history
    in-911  Industrialisation in independent India
    in-912  Licence Raj
    in-913  Poverty in India and its measurement
    in-914  The Indian informal economy
    in-915  India in the world economy

### Languages and literatures — `in-languages`

    in-916  Languages of India
    in-917  Sanskrit
    in-918  Panini
    in-919  Ashtadhyayi
    in-920  The discovery of the Indo-European family
    in-921  Prakrit
    in-922  Pali
    in-923  Apabhramsha
    in-924  Sanskrit literature
    in-925  Sanskrit drama
    in-926  Sanskrit poetics
    in-927  Panchatantra
    in-928  Jataka tales
    in-929  Tamil language
    in-930  Sangam literature
    in-931  Tirukkural
    in-932  Tamil devotional literature
    in-933  Kannada literature
    in-934  Telugu literature
    in-935  Malayalam literature
    in-936  Marathi literature
    in-937  Bengali literature
    in-938  Hindi
    in-939  Braj and Awadhi literature
    in-940  Tulsidas
    in-941  Urdu literature
    in-942  Mirza Ghalib
    in-943  Persian literature in India
    in-944  Historical writing in pre-colonial India
    in-945  Print and publishing in India
    in-946  The Indian novel
    in-947  Bankim Chandra Chattopadhyay
    in-948  Rabindranath Tagore
    in-949  Premchand
    in-950  Indian writing in English
    in-951  Progressive Writers' Movement
    in-952  Dalit literature
    in-953  Indian women writers
    in-954  Indian literature since independence
    in-955  Translation and the Indian literary world

### Art, architecture and music — `in-arts`

    in-956  Indian art
    in-957  Indian sculpture
    in-958  Indian bronze casting
    in-959  Hindu temple architecture
    in-960  Nagara and dravida
    in-961  Indian rock-cut architecture
    in-962  Indian painting
    in-963  Indian mural painting
    in-964  The Mughal atelier
    in-965  Rajput painting
    in-966  Pahari painting
    in-967  Company painting
    in-968  Bengal School of Art
    in-969  Modern Indian art
    in-970  Indian calligraphy
    in-971  Indian jewellery
    in-972  Indian metalwork and inlay
    in-973  Mughal gardens
    in-974  Indian classical music
    in-975  Raga
    in-976  Tala
    in-977  Hindustani classical music
    in-978  Carnatic music
    in-979  Indian musical instruments
    in-980  Indian devotional music
    in-981  Indian classical dance
    in-982  Bharatanatyam
    in-983  Kathak
    in-984  Indian theatre
    in-985  Cinema of India

### Science, mathematics and medicine — `in-science`

    in-986  Indian mathematics
    in-987  Hindu-Arabic numeral system
    in-988  Zero
    in-989  Brahmagupta
    in-990  Bhaskara II
    in-991  Kerala school of astronomy and mathematics
    in-992  Indian astronomy
    in-993  Jantar Mantar
    in-994  Indian alchemy and chemistry
    in-995  Sushruta Samhita
    in-996  Indian logic
    in-997  Indian linguistics as a science
    in-998  The westward transmission of Indian science
    in-999  Science in colonial India
    in-1000 Science in independent India
