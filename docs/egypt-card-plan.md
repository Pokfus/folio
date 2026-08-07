# Ancient Egypt — the 1000-card plan

The running order for the `egypt` collection. Every card has a number, a topic and a deck, fixed in
advance, so the collection can be grown one card at a time across many sessions without anyone having
to remember where it had got to.

Not part of the site.

**This plan created its collection.** Rome, Russia and India were empty nodes waiting for a tree; China
had a tree already; Ancient Egypt had nothing at all, so the collection itself, its tree and its
signature colour ship with this file. What that involved is set out under "Making the collection" below.

## How to use this (the whole point of the file)

**"Generate the next Ancient Egypt card" means: take the lowest `eg-NNN` that is not yet in `data.js`,
read its topic and deck from the list below, research it, and add it.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));
      for(let i=1;i<=1000;i++){const id='eg-'+String(i).padStart(3,'0');
      if(!h.has(id)){console.log('next:',id);break}}"

There is deliberately **no separate progress file**. `data.js` is the record of what exists, this file
is the record of what is planned, and the next card is whatever falls between them — so the two can
never disagree about where the work has got to.

Then write the card to the rules in CLAUDE.md ("Generating cards & glossary entries") and add it with:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** `add-card.js` falls back to the first leaf in the whole tree when it is
omitted, which is `cn-myth`, in the China collection.

Note that the numbering runs past 999, so ids are **not** all the same length: `eg-001` … `eg-999`,
then `eg-1000`. The command above pads to three digits, which is right for every id but the last.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `eg-266 Battle of Megiddo` is already an answer term; `eg-027 Badarian culture` is a topic whose
answer is settled and `eg-114 How the pyramids were built` is an area, and the card's actual answer —
the word that gets blanked — is chosen while writing it, from what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** Some will turn out
to be thinner than they look, and a few will turn out to be two cards. When that happens, change the
line here in the same commit as the card, and say so — this file is only useful while it is true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

Card ids run `eg-001` … `eg-1000`, in the order below. Numbering follows the tree, and the first six
decks follow chronology, so their running order is roughly chronological — which also means an early
card and a late card in the same deck sort together on the study page, since cards are ordered by
`cardYears(answerDate)` and not by id. The last three decks are thematic and their order is a reading
order rather than a claim about dates.

## Making the collection

Four things had to be decided because nothing existed to inherit them from.

**The collection id is `egypt`, not `col-44`.** `china` set the precedent for a readable collection id,
and the `col-N` sequence is a poor place to add one: `col-1`–`col-39` are China's internal decks, and
`col-44`–`col-64` were a set of empty World History period decks removed on 2026-08-04. Reusing a number
that recently meant something else is a trap for whoever next greps for it.

**The card prefix is `eg-`**, matching the two-letter country-code convention `gr-` / `ru-` / `in-`
already use. Deck ids are `eg-*` too; there is no collision, since cards and nodes live in different
maps, and the pattern is the one Greece already runs (`gr-001` beside `gr-crete`).

**The signature hue is `#1F6F5C`, a malachite green**, added to `COLL_THEME`. It was **measured rather
than picked**: the green quarter of the colour space was entirely unused, and in CIELAB this sits
**33.3 from its nearest neighbour** (Greece's Aegean blue) against a tightest existing pair of 12.9
(China's vermilion against Russia's lacquer red). It happens also to be the right colour — malachite was
Egypt's green pigment and its eye paint — but the numbers led there first. A collection with no
`COLL_THEME` row renders on the generic indigo fallback, so this is one line and worth it.

**There is deliberately NO entry in `COLLECTION_NUMERALS`.** Egyptian hieroglyphic numerals are a real
additive system and the obvious thing to reach for, and reaching for it would be a mistake: no
hieroglyphic webfont is loaded, and CLAUDE.md's font note is explicit that none should be added lightly.
A level badge that renders as a row of tofu boxes on most machines is worse than a digit. Egypt uses
Western numerals, like World History and the United States. If a hieroglyphic font is ever shipped for
another reason, this is a five-line addition to `numeralIn`.

## What this collection is about

**The Nile valley from the Palaeolithic to the Arab conquest of 641 CE**, and the ending is the
decision worth arguing.

Most courses stop at 30 BCE, when Rome annexed Egypt, and treat everything after as somebody else's
history. That is wrong for this collection in a specific way: **Egyptian religion, Egyptian writing and
Egyptian temple building all outlive Egyptian independence by centuries.** Roman emperors are shown as
pharaohs on temple walls they paid for. The last dated hieroglyphic inscription is of 394 CE, at Philae,
and Philae's temple was still working into the sixth century. A collection that ends at Cleopatra ends
three hundred years before its subject does.

So Ptolemaic, Roman and Christian Egypt get 100 cards between them, and the collection closes where
ancient Egyptian religion actually closes — with `eg-655 The end of the Egyptian temples`, `eg-656 The
last hieroglyphic inscription`, `eg-657 The closing of Philae` and `eg-660 What survived of ancient
Egypt`. It does not attempt Islamic or modern Egypt, which are a different course.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Before the Pharaohs | The Nile before the pharaohs | 25 | eg-001–025 |
| | Predynastic Egypt | 30 | eg-026–055 |
| The Old Kingdom | Early Dynastic Egypt | 35 | eg-056–090 |
| | The Old Kingdom | 50 | eg-091–140 |
| | The First Intermediate Period | 30 | eg-141–170 |
| The Middle Kingdom | The Middle Kingdom | 50 | eg-171–220 |
| | The Second Intermediate Period | 30 | eg-221–250 |
| The New Kingdom | The early Eighteenth Dynasty | 45 | eg-251–295 |
| | Akhenaten and Amarna | 40 | eg-296–335 |
| | The Ramesside age | 55 | eg-336–390 |
| | Thebes, Karnak and the royal tombs | 50 | eg-391–440 |
| The Later Periods | The Third Intermediate Period | 35 | eg-441–475 |
| | Kush and the Twenty-fifth Dynasty | 30 | eg-476–505 |
| | The Late Period | 55 | eg-506–560 |
| Greco-Roman Egypt | Ptolemaic Egypt | 45 | eg-561–605 |
| | Roman Egypt | 35 | eg-606–640 |
| | Christian Egypt and the end | 20 | eg-641–660 |
| Gods and the Dead | Gods and religion | 50 | eg-661–710 |
| | Myth and cosmology | 30 | eg-711–740 |
| | Death, burial and the afterlife | 50 | eg-741–790 |
| Kingship, State and Society | Kingship and the state | 35 | eg-791–825 |
| | Society and everyday life | 40 | eg-826–865 |
| | Land, trade and the economy | 25 | eg-866–890 |
| Writing, Art and Knowledge | Writing and literature | 40 | eg-891–930 |
| | Art and architecture | 40 | eg-931–970 |
| | Science, medicine and technology | 30 | eg-971–1000 |

Deck totals: Before the Pharaohs 55 · The Old Kingdom 115 · The Middle Kingdom 80 ·
The New Kingdom 190 · The Later Periods 120 · Greco-Roman Egypt 100 · Gods and the Dead 130 ·
Kingship, State and Society 100 · Writing, Art and Knowledge 110. **1000.**

## What the weighting is arguing

**The New Kingdom takes 190 and that is the one allocation nobody will argue with** — it is where the
evidence, the monuments and the teaching weight all sit, and it is what most readers arrive for. What
they may not expect is that Amarna gets 40 of it and the Ramesside age 55: the seventeen years of
Akhenaten produce more argument per year than any other stretch of Egyptian history, and Ramesses II
alone reigned for sixty-six.

**Everything before the Middle Kingdom keeps 170 cards.** The Predynastic and Early Dynastic are
usually a paragraph on the way to the pyramids, and they are where the Egyptian state, Egyptian writing
and Egyptian kingship were actually invented. Fifty-five cards run before the First Dynasty.

**Kush gets a subdeck of its own.** See the decisions below; it is the collection's version of the
argument the Russia, India and China plans each make in their own terms.

**A third of the collection — 340 cards — sits outside the narrative.** For Egypt that is not a
generosity to "culture": religion, mortuary practice, writing and art *are* the subject, and the
political narrative is comparatively thin. There are stretches of Egyptian history where almost nothing
is known but a king list and a building programme.

**Death gets 50 cards, which is not morbid — it is where the evidence is.** See the decisions.

## Six decisions this plan forced on the tree

**Death is 50 cards because the record is a record of the dead, and that bias is itself a card.**
Egyptian tombs were built of stone in the desert and Egyptian towns of mud brick on the floodplain,
which the river has been rebuilding on top of ever since — so what survives is overwhelmingly funerary,
and a course that simply follows the evidence will teach a civilisation apparently obsessed with dying.
`eg-789 Why the Egyptian record is a record of the dead` exists so the reader is told this outright, and
`eg-440` makes the same point about Thebes. It also governs how the daily-life cards are written: they
lean on Deir el-Medina, the papyri and Amarna precisely because those are the exceptions.

**Kush gets 30 cards and Nubia runs through the collection.** The standard treatment makes Nubia a
place Egypt raided for gold and the Twenty-fifth Dynasty an interruption to be got past. Egypt was ruled
from Napata for the better part of a century by kings who restored its temples and copied its Old
Kingdom art more carefully than the Egyptians had; Kerma was a rival state powerful enough to make the
Second Intermediate Period a war on two fronts. `eg-kush` covers the Kushite kingdom on its own terms
and follows it past Egypt to Meroë. Same argument as `ru-peoples`, India's south and China's conquest
dynasties.

**Monuments live with their builders; technique lives in `eg-art`.** The Great Pyramid is `eg-104`,
under Khufu; Abu Simbel is `eg-349`, under Ramesses II; Karnak has fifty cards of its own because it was
built and rebuilt for two thousand years and belongs to no single reign. What `eg-art` carries is what
no reign owns — the canon of proportions, sunk and raised relief, the column, the pylon, mudbrick,
surveying. This is the rule the Rome plan states and Greece follows for the Parthenon.

**Thebes is a subdeck, and it is the one place-deck in the collection.** Karnak, Luxor, the Valley of
the Kings, Deir el-Bahari, the Tombs of the Nobles and Deir el-Medina are one continuous monumental and
documentary complex, they are almost entirely a New Kingdom phenomenon, and between them they are the
single largest body of evidence Egypt has left. Splitting them across three reign-decks would bury the
one place a reader most wants to understand.

**Amarna is a subdeck, not a chapter of the Eighteenth Dynasty.** Forty cards for seventeen years is
out of all proportion to the time and exactly in proportion to the argument: whether Atenism was
monotheism, what happened to the empire, who Smenkhkare and Neferneferuaten were, what Tutankhamun's
tomb does and does not prove. `eg-313 Was Atenism monotheism?` is written as a question because it is
one.

**The Ptolemies appear as pharaohs, not as Greeks in Egypt.** `eg-568 The Ptolemies as pharaohs`,
`eg-591 The Memphis decrees and the priestly synods` and the temple cards from Edfu to Philae are the
point of the Ptolemaic subdeck: the dynasty that built more surviving Egyptian temple than any other was
Macedonian. The Greek side of the same three centuries — Alexandria's Library, the Museum, the Syrian
Wars, Cleopatra as the last Hellenistic monarch — belongs to `col-13` and is written there. See the
pairs table below.

## History, not archaeology — and this is the collection where that bites hardest

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Do not restate either here; what follows is
only what is specific to this collection, and it needs saying more firmly than anywhere else on the
site.

**Everything known about Egypt arrived through excavation and decipherment, and the popular literature
is about the arriving.** Carter at the tomb, Champollion and the stone, Belzoni and the battering ram —
these are the stories the accessible sources tell, and a card written from them will be about
nineteenth-century Europeans rather than about Egypt. The test is the one the house rule sets: **the
question must be answerable from the past, not from the dig.**

Concretely: **Tutankhamun gets cards and Howard Carter does not.** `eg-321`, `eg-325`, `eg-326`,
`eg-327` and `eg-328` are a king, a tomb, its contents, a mask and what the assemblage tells us about a
royal burial — the last of those being the historically valuable one, because Tutankhamun matters far
less as a king than as the only royal burial to survive substantially intact.

**Modern scholars are capped at two in the thousand and this plan spends ONE.** `eg-899 The decipherment
of Egyptian hieroglyphs` earns its place on the same ground as Greece's `gr-075` and China's oracle
bones: before 1822 a civilisation that wrote continuously for three and a half thousand years was mute,
and the recovery of its voice is the event, not the biography of the man who managed it. **The second
slot is deliberately left unspent**, and that is a signal rather than an oversight — in a collection
where the pull towards excavation history is this strong, an empty slot is a standing reminder that the
bar was not lowered.

Two other pulls:

**Mystification.** Egypt attracts pseudo-archaeology more than any subject on the site — lost
civilisations, impossible construction, alignments that carry messages. The plan's answer is to card the
real questions properly, because they are more interesting than the invented ones: `eg-114 How the
pyramids were built` and `eg-115 The Diary of Merer` (a genuine logbook kept by a man who hauled
limestone to Giza), `eg-963 Egyptian surveying and orientation` and `eg-964 The astronomical alignment
of Egyptian monuments`, written from the archaeology and the papyri. A card that debunks is a card about
the nonsense; a card that explains is a card about Egypt.

**Race and Egypt.** Egypt's population, and the relationship between Egypt and the rest of Africa, have
been argued about for two centuries in terms that were usually about the arguer. `eg-023 Egypt and its
African context` and the Kush subdeck are written from the archaeology, the linguistics and the ancient
DNA, and they state what the evidence supports and where it runs out. Neither a nineteenth-century
framing nor its mirror image is the register here.

## Dates, names and spellings

**Dates are approximate, and Egyptian chronology is a construct rather than a record.** It is built from
king lists, regnal-year notations, a handful of astronomical observations and radiocarbon, and reputable
scholars date the Old Kingdom decades apart. **Use one published conventional chronology, say that it is
conventional, and give ranges.** Never present a single year for anything before the Late Period as
though it were fixed. Two related cards exist for this: `eg-054 The Egyptian king lists` and `eg-055
Manetho and the dynasties` — the dynasties themselves are a scheme devised in Greek in the third century
BCE, which is worth a reader knowing before the tree files everything by them.

**Names.** The Egyptian script wrote no vowels, so every familiar name is a modern convention. **Use the
Egyptian form as the head word and the Greek or Latin form as an alias** — Khufu not Cheops, Djoser not
Zoser, Amenhotep not Amenophis — except where the Greek form is overwhelmingly the English one
(Thebes, Memphis, Osiris, Isis, the Nile). Ramesses is the spelling used here, with Rameses and Ramses as
aliases. **Alias rows are mandatory the day a term ships**; this collection will need almost as many as
China's.

**Places take the name the scholarship uses, and the card says which is which.** Modern Arabic names
(Giza, Saqqara, Amarna, Deir el-Medina) are the site names; ancient names (Waset, Akhetaten, Men-nefer)
are the Egyptian ones; and Greek names (Thebes, Memphis, Heliopolis) are the ones a reader has met. Where
the choice carries weight, say so in a clause rather than making the point by orthography.

## Sourcing

Egypt is exceptionally well served by open scholarship, and the reason is worth knowing: the field's
foundational corpora are out of copyright and its museums publish. Three notes.

**Reach for museum object records first.** The British Museum, the Metropolitan, the Egyptian Museum in
Cairo, the Petrie Museum, Turin, Leiden and Berlin all publish per-object records with measurements,
provenance and inventory numbers — and for an `object` card that record is usually better than a journal
article, because it is kept by the people holding the thing. This is the site's own batch-8b rule, and
Egypt is where it pays best.

**The nineteenth-century corpora are open and still cited.** The *Description de l'Égypte*, Lepsius's
*Denkmäler*, Petrie's excavation reports and Breasted's *Ancient Records of Egypt* are on archive.org in
full. They are indispensable and they are also period pieces: cite them for what they record — a wall
now lost, an object as found — and not for what they conclude.

**Two kinds of number need a range rather than a figure.** Dates, for the reason above; and population,
where estimates for pharaonic Egypt vary by a factor of two or more between scholars working from
different assumptions about arable land and yield.

## Living beside the other collections

**World History is the survey and never waits for this collection.** Ancient Egypt gets 30 cards there
(`wh-201`–`wh-230`), at survey altitude. Ten sentences on the Old Kingdom is a different card from ten
sentences on the Fifth Dynasty sun temples.

**Egypt meets Greece and Rome head-on in its last four centuries, and both sides are already planned.**
These are the pairs to write deliberately differently:

| subject | in Greece / Rome | here |
|---|---|---|
| Alexander in Egypt | `gr-719`, `gr-721` — the campaign, and an oracle that told a Macedonian he was a god | `eg-562`, `eg-563` — the arrival of a liberator from Persia, and a pharaoh crowned at Memphis |
| Alexandria | `gr-720`, `gr-801`–`gr-804` — a Greek city, its Library and its Museum | `eg-564`, `eg-571` — a capital that governed Egypt and never quite belonged to it |
| the Ptolemies | `gr-766`, `gr-767` — a Macedonian successor kingdom | `eg-565`, `eg-568` — a dynasty of pharaohs who built more surviving temple than any other |
| Cleopatra VII | `gr-876` — the last Hellenistic monarch; `rm-384` — Antony's ally | `eg-603`, `eg-604` — the last pharaoh, and the first Ptolemy said to have learned Egyptian |
| the annexation | `rm-388` — Rome acquires a province | `eg-607` — Egypt acquires an owner, and keeps its temples |
| the grain fleet | `rm-767` — how Rome was fed | `eg-610` — what Egypt was made to grow, and for whom |

Write the card its own collection needs. A reader who has both meets the pair and sees one set of years
from two ends, which is the point.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `eg-127 Pyramid Texts`, `eg-156 Coffin Texts`, `eg-764 Book of the Dead` → each other's decks; the
  three are one tradition and the reader should meet them together
- `eg-159`–`eg-163`, the First Intermediate Period literature → also `eg-writing`
- `eg-181 The Story of Sinuhe`, `eg-377 The Report of Wenamun` → also `eg-writing`
- `eg-419`–`eg-425`, Deir el-Medina → also `eg-society`, which is largely written from it
- `eg-590 Rosetta Stone` → also `eg-writing`, beside the decipherment
- `eg-753 Mummification` → also `eg-971`'s neighbours in `eg-science`, for the chemistry

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`).

The glossary has **`Egypt` and nothing else** — one country term, written and cited in Phase 3 of the
citation pass. There is no `Pharaoh`, no `Hieroglyph`, no `Mummy`, no `Nile`. Write those **cited from
the start**, at the `GLOSS_SRC_TARGET` bar of 2, rather than opening a backlog to be closed later.

Three traps. **Alias rows are mandatory** — see the naming rule above, and note that the Greek and
Egyptian forms of the same king are both surfaces a reader will type. **A term whose surface is an
ordinary English word** (`Set`, `Nut`, `Ba`, `Ka`, `Aten`, `Maat`) needs `GLOSSARY_CASESENSITIVE` or a
narrower head word, and this collection has a bad case of it: `Set` and `Nut` are gods whose names are
common English words, and `Ba` and `Ka` are two-letter surfaces that would match inside other words
entirely. **And a two-letter or three-letter term should probably not be a head word at all** — prefer
`Ba (Egyptian soul)` or the fuller phrase, and let the short form be an alias only if it can be made
safe.
---

# The list

## Before the Pharaohs

### The Nile before the pharaohs — `eg-prehistory`

    eg-001  Ancient Egypt
    eg-002  The Nile
    eg-003  The Nile flood
    eg-004  Upper and Lower Egypt
    eg-005  The Nile Delta
    eg-006  The Faiyum
    eg-007  The Egyptian deserts
    eg-008  The Eastern Desert and the Red Sea
    eg-009  The oases of the Western Desert
    eg-010  The African Humid Period
    eg-011  The drying of the Sahara
    eg-012  Palaeolithic Egypt
    eg-013  The Nile terraces and the earliest stone tools
    eg-014  Saharan rock art
    eg-015  Nabta Playa
    eg-016  The first cattle herders of the Sahara
    eg-017  The Neolithic in Egypt
    eg-018  The Faiyum Neolithic
    eg-019  Merimde Beni Salama
    eg-020  The origins of Egyptian agriculture
    eg-021  Emmer and barley on the Nile
    eg-022  The domestic animals of ancient Egypt
    eg-023  Egypt and its African context
    eg-024  Egypt and the Levant before the pharaohs
    eg-025  Why a state arose on the Nile

### Predynastic Egypt — `eg-predynastic`

    eg-026  Predynastic Egypt
    eg-027  Badarian culture
    eg-028  Naqada culture
    eg-029  Naqada I
    eg-030  Naqada II
    eg-031  Naqada III
    eg-032  Predynastic burial
    eg-033  Predynastic pottery
    eg-034  Predynastic figurines
    eg-035  The Gebelein predynastic mummies
    eg-036  Hierakonpolis
    eg-037  The Painted Tomb at Hierakonpolis
    eg-038  Naqada
    eg-039  Abydos before the kings
    eg-040  Buto and the Delta cultures
    eg-041  Maadi
    eg-042  Predynastic trade with the Levant
    eg-043  Egypt and Mesopotamia in the fourth millennium
    eg-044  Predynastic stoneworking
    eg-045  Egyptian faience
    eg-046  The origins of Egyptian writing
    eg-047  The Abydos labels
    eg-048  Scorpion Macehead
    eg-049  Egyptian ceremonial palettes
    eg-050  Narmer Palette
    eg-051  Narmer
    eg-052  The unification of Egypt
    eg-053  Dynasty 0
    eg-054  The Egyptian king lists
    eg-055  Manetho and the dynasties

## The Old Kingdom

### Early Dynastic Egypt — `eg-early-dynastic`

    eg-056  Early Dynastic Period of Egypt
    eg-057  First Dynasty of Egypt
    eg-058  Hor-Aha
    eg-059  Djer
    eg-060  Den
    eg-061  Merneith
    eg-062  The royal tombs at Abydos
    eg-063  Umm el-Qa'ab
    eg-064  Retainer sacrifice in the First Dynasty
    eg-065  Mastaba
    eg-066  Saqqara in the Early Dynastic period
    eg-067  Second Dynasty of Egypt
    eg-068  Peribsen and Khasekhemwy
    eg-069  Shunet el-Zebib
    eg-070  Memphis
    eg-071  The Two Lands
    eg-072  Ancient Egyptian royal titulary
    eg-073  Serekh
    eg-074  The Horus name
    eg-075  The Red Crown and the White Crown
    eg-076  Sed festival
    eg-077  Early Dynastic administration
    eg-078  Egyptian sealings and the early bureaucracy
    eg-079  Nome
    eg-080  Egyptian stone vessels
    eg-081  Early Dynastic ivory carving
    eg-082  Palermo Stone
    eg-083  Egyptian annals and the counting of cattle
    eg-084  The Egyptian calendar
    eg-085  Nilometer
    eg-086  The earliest Egyptian boats
    eg-087  The Abydos boat graves
    eg-088  Egypt's earliest quarries
    eg-089  Sinai and the turquoise expeditions
    eg-090  Egypt at the end of the Second Dynasty

### The Old Kingdom — `eg-old-kingdom`

    eg-091  Old Kingdom of Egypt
    eg-092  Third Dynasty of Egypt
    eg-093  Djoser
    eg-094  Pyramid of Djoser
    eg-095  Imhotep
    eg-096  The Saqqara step pyramid complex
    eg-097  Sekhemkhet and the unfinished pyramids
    eg-098  Fourth Dynasty of Egypt
    eg-099  Sneferu
    eg-100  Meidum Pyramid
    eg-101  Bent Pyramid
    eg-102  Red Pyramid
    eg-103  Khufu
    eg-104  Great Pyramid of Giza
    eg-105  Giza pyramid complex
    eg-106  Khufu ship
    eg-107  Djedefre
    eg-108  Khafre
    eg-109  Pyramid of Khafre
    eg-110  Great Sphinx of Giza
    eg-111  Menkaure
    eg-112  Pyramid of Menkaure
    eg-113  The pyramid builders' settlement at Giza
    eg-114  How the pyramids were built
    eg-115  Diary of Merer
    eg-116  Hetepheres I
    eg-117  Old Kingdom queens
    eg-118  Fifth Dynasty of Egypt
    eg-119  Userkaf
    eg-120  The sun temples of Abu Gurab
    eg-121  The rise of the cult of Ra
    eg-122  Sahure
    eg-123  Abusir
    eg-124  Abusir Papyri
    eg-125  Nyuserre and the Fifth Dynasty court
    eg-126  Unas
    eg-127  Pyramid Texts
    eg-128  Sixth Dynasty of Egypt
    eg-129  Teti
    eg-130  Pepi I
    eg-131  Pepi II
    eg-132  Harkhuf
    eg-133  The expeditions to Yam
    eg-134  Weni
    eg-135  Old Kingdom provincial government
    eg-136  The rise of the nomarchs
    eg-137  Old Kingdom tomb decoration
    eg-138  The mastaba fields of Giza and Saqqara
    eg-139  The 4.2-kiloyear event and Egypt
    eg-140  The collapse of the Old Kingdom

### The First Intermediate Period — `eg-first-intermediate`

    eg-141  First Intermediate Period of Egypt
    eg-142  Dating the First Intermediate Period
    eg-143  Seventh and Eighth Dynasties of Egypt
    eg-144  The Herakleopolitan kings
    eg-145  Ninth and Tenth Dynasties of Egypt
    eg-146  The rise of Thebes
    eg-147  Eleventh Dynasty of Egypt
    eg-148  The Intef kings
    eg-149  The war between Thebes and Herakleopolis
    eg-150  Ankhtifi
    eg-151  The nomarchs' autobiographies
    eg-152  Famine in the First Intermediate Period
    eg-153  Was there a collapse?
    eg-154  Provincial art of the First Intermediate Period
    eg-155  The democratisation of the afterlife
    eg-156  Coffin Texts
    eg-157  First Intermediate Period burial
    eg-158  The soldiers' tomb at Deir el-Bahari
    eg-159  Egyptian pessimistic literature
    eg-160  Admonitions of Ipuwer
    eg-161  The Dialogue of a Man with His Ba
    eg-162  Instructions of Merikare
    eg-163  The Eloquent Peasant
    eg-164  Local temples and local gods
    eg-165  Egypt's foreign contacts in the First Intermediate Period
    eg-166  Nubia in the First Intermediate Period
    eg-167  C-Group culture
    eg-168  Mentuhotep II
    eg-169  The reunification of Egypt
    eg-170  What the First Intermediate Period changed

## The Middle Kingdom

### The Middle Kingdom — `eg-middle-kingdom`

    eg-171  Middle Kingdom of Egypt
    eg-172  The Eleventh Dynasty after the reunification
    eg-173  The mortuary temple of Mentuhotep II
    eg-174  Mentuhotep III and Mentuhotep IV
    eg-175  Twelfth Dynasty of Egypt
    eg-176  Amenemhat I
    eg-177  Itjtawy
    eg-178  The assassination of Amenemhat I
    eg-179  The Instruction of Amenemhat
    eg-180  Senusret I
    eg-181  Story of Sinuhe
    eg-182  The White Chapel of Senusret I
    eg-183  Amenemhat II
    eg-184  Senusret II
    eg-185  The Faiyum irrigation works
    eg-186  Lahun
    eg-187  The Lahun papyri
    eg-188  Senusret III
    eg-189  The Middle Kingdom administrative reform
    eg-190  The end of the great nomarchs
    eg-191  The Middle Kingdom conquest of Nubia
    eg-192  The Second Cataract fortresses
    eg-193  Buhen
    eg-194  Semna
    eg-195  The Semna dispatches
    eg-196  Amenemhat III
    eg-197  Hawara and the Labyrinth
    eg-198  Middle Kingdom royal portraiture
    eg-199  Sobekneferu
    eg-200  Thirteenth Dynasty of Egypt
    eg-201  Middle Kingdom literature
    eg-202  The Tale of the Shipwrecked Sailor
    eg-203  Middle Egyptian
    eg-204  Beni Hasan
    eg-205  Middle Kingdom coffins
    eg-206  Shabti
    eg-207  Middle Kingdom jewellery
    eg-208  The Middle Kingdom in the Levant
    eg-209  Execration texts
    eg-210  Byblos and Egypt
    eg-211  Punt and the Middle Kingdom
    eg-212  Egyptian mining expeditions of the Middle Kingdom
    eg-213  Middle Kingdom towns
    eg-214  Middle Kingdom temples
    eg-215  The cult of Osiris at Abydos
    eg-216  The Abydos pilgrimage
    eg-217  Middle Kingdom kingship and its ideology
    eg-218  Middle Kingdom art
    eg-219  Egypt's population in the Middle Kingdom
    eg-220  The end of the Twelfth Dynasty

### The Second Intermediate Period — `eg-second-intermediate`

    eg-221  Second Intermediate Period of Egypt
    eg-222  The fragmentation of the Thirteenth Dynasty
    eg-223  Fourteenth Dynasty of Egypt
    eg-224  Avaris
    eg-225  The Asiatic settlement in the Delta
    eg-226  Hyksos
    eg-227  The Hyksos question
    eg-228  Fifteenth Dynasty of Egypt
    eg-229  Apepi
    eg-230  Hyksos rule in Egypt
    eg-231  What the Hyksos brought
    eg-232  The chariot in Egypt
    eg-233  The composite bow
    eg-234  Bronze working in the Second Intermediate Period
    eg-235  The Sixteenth and Abydos Dynasties
    eg-236  Seventeenth Dynasty of Egypt
    eg-237  Theban resistance to the Hyksos
    eg-238  Seqenenre Tao
    eg-239  The mummy of Seqenenre Tao
    eg-240  Kamose
    eg-241  The Kamose stelae
    eg-242  Kingdom of Kerma
    eg-243  Kerma and Egypt
    eg-244  The Western Deffufa
    eg-245  Egypt between Avaris and Kerma
    eg-246  Ahmose I
    eg-247  The expulsion of the Hyksos
    eg-248  Ahmose son of Ibana
    eg-249  The siege of Sharuhen
    eg-250  The making of the New Kingdom

## The New Kingdom

### The early Eighteenth Dynasty — `eg-early-18th`

    eg-251  New Kingdom of Egypt
    eg-252  Eighteenth Dynasty of Egypt
    eg-253  Ahmose-Nefertari
    eg-254  Amenhotep I
    eg-255  Thutmose I
    eg-256  The first Egyptian campaigns to the Euphrates
    eg-257  Thutmose II
    eg-258  Hatshepsut
    eg-259  Hatshepsut's assumption of kingship
    eg-260  Mortuary Temple of Hatshepsut
    eg-261  The expedition to Punt
    eg-262  Senenmut
    eg-263  Hatshepsut's obelisks
    eg-264  The erasure of Hatshepsut
    eg-265  Thutmose III
    eg-266  Battle of Megiddo
    eg-267  The Annals of Thutmose III
    eg-268  The Egyptian empire in Syria and Palestine
    eg-269  Egyptian imperial administration in the Levant
    eg-270  The Egyptian conquest of Nubia
    eg-271  Viceroy of Kush
    eg-272  Amenhotep II
    eg-273  Thutmose IV
    eg-274  Dream Stele
    eg-275  Amenhotep III
    eg-276  Malkata
    eg-277  Colossi of Memnon
    eg-278  Tiye
    eg-279  Amenhotep son of Hapu
    eg-280  Egyptian diplomacy in the fourteenth century BCE
    eg-281  Amarna letters
    eg-282  Mitanni and Egypt
    eg-283  The Hittites and Egypt
    eg-284  Egypt and the Aegean in the New Kingdom
    eg-285  Egyptian gold and international exchange
    eg-286  The New Kingdom army
    eg-287  The Egyptian soldier
    eg-288  New Kingdom temple building
    eg-289  The wealth of Amun
    eg-290  The High Priests of Amun
    eg-291  God's Wife of Amun
    eg-292  The Egyptian royal harem
    eg-293  Foreigners in Egyptian art
    eg-294  New Kingdom art before Amarna
    eg-295  Egypt at the height of empire

### Akhenaten and Amarna — `eg-amarna`

    eg-296  Akhenaten
    eg-297  The early reign of Amenhotep IV
    eg-298  Aten
    eg-299  Atenism
    eg-300  Great Hymn to the Aten
    eg-301  The founding of Akhetaten
    eg-302  Amarna
    eg-303  The boundary stelae of Akhetaten
    eg-304  The city of Akhetaten
    eg-305  The Great Temple of the Aten
    eg-306  Nefertiti
    eg-307  Nefertiti Bust
    eg-308  The Amarna royal family
    eg-309  Amarna art
    eg-310  The Amarna body
    eg-311  Amarna and the older gods
    eg-312  The closing of the temples under Akhenaten
    eg-313  Was Atenism monotheism?
    eg-314  The empire under Akhenaten
    eg-315  The Amarna workmen's village
    eg-316  The health of Amarna's people
    eg-317  The royal tomb at Amarna
    eg-318  Kiya
    eg-319  Smenkhkare
    eg-320  Neferneferuaten
    eg-321  Tutankhamun
    eg-322  The restoration under Tutankhamun
    eg-323  The return to Thebes
    eg-324  The death of Tutankhamun
    eg-325  KV62
    eg-326  The contents of Tutankhamun's tomb
    eg-327  Mask of Tutankhamun
    eg-328  What an intact royal burial shows
    eg-329  Ay
    eg-330  The Hittite prince affair
    eg-331  Horemheb
    eg-332  The Edict of Horemheb
    eg-333  The dismantling of Akhetaten
    eg-334  The erasure of Akhenaten
    eg-335  The Amarna period in Egyptian memory

### The Ramesside age — `eg-ramesside`

    eg-336  Nineteenth Dynasty of Egypt
    eg-337  Ramesses I
    eg-338  Seti I
    eg-339  Temple of Seti I at Abydos
    eg-340  Abydos King List
    eg-341  The tomb of Seti I
    eg-342  The campaigns of Seti I
    eg-343  Ramesses II
    eg-344  Battle of Kadesh
    eg-345  The Kadesh inscriptions
    eg-346  Egyptian–Hittite peace treaty
    eg-347  The Hittite marriage of Ramesses II
    eg-348  Pi-Ramesses
    eg-349  Abu Simbel
    eg-350  Ramesseum
    eg-351  Nefertari
    eg-352  The tomb of Nefertari
    eg-353  The children of Ramesses II
    eg-354  KV5
    eg-355  The building programme of Ramesses II
    eg-356  Usurped monuments and the reuse of stone
    eg-357  Merneptah
    eg-358  Merneptah Stele
    eg-359  The Libyan wars of Merneptah
    eg-360  The end of the Nineteenth Dynasty
    eg-361  Twosret
    eg-362  Twentieth Dynasty of Egypt
    eg-363  Setnakhte
    eg-364  Ramesses III
    eg-365  Medinet Habu
    eg-366  The Sea Peoples in Egyptian records
    eg-367  The Libyan invasions under Ramesses III
    eg-368  The Deir el-Medina strike
    eg-369  The harem conspiracy
    eg-370  The later Ramesside kings
    eg-371  Egypt and the Late Bronze Age collapse
    eg-372  The loss of the Asiatic empire
    eg-373  The tomb robbery papyri
    eg-374  The Ramesside economy and rising prices
    eg-375  The rise of the Amun priesthood
    eg-376  Herihor
    eg-377  Story of Wenamun
    eg-378  The end of the New Kingdom
    eg-379  Ramesside literature
    eg-380  Tale of Two Brothers
    eg-381  Egyptian love poetry
    eg-382  Ramesside letters
    eg-383  Ostraca as historical sources
    eg-384  Ramesside art
    eg-385  Ramesside temples
    eg-386  The Egyptian temple as an economic institution
    eg-387  Papyrus Harris I
    eg-388  Ramesside Nubia
    eg-389  Turin Papyrus Map
    eg-390  The Ramesside legacy

### Thebes, Karnak and the royal tombs — `eg-thebes`

    eg-391  Thebes, Egypt
    eg-392  Karnak
    eg-393  Precinct of Amun-Re
    eg-394  The Great Hypostyle Hall
    eg-395  The obelisks of Karnak
    eg-396  The sacred lake and the temple economy at Karnak
    eg-397  The temple wall as historical record
    eg-398  Luxor Temple
    eg-399  Opet Festival
    eg-400  The avenue of sphinxes
    eg-401  Precinct of Mut
    eg-402  Montu and the Theban gods
    eg-403  Theban Necropolis
    eg-404  Valley of the Kings
    eg-405  The design of an Egyptian royal tomb
    eg-406  The decoration of the royal tombs
    eg-407  Amduat
    eg-408  Book of Gates
    eg-409  The later netherworld books
    eg-410  KV20 and the earliest royal tombs
    eg-411  Valley of the Queens
    eg-412  The mortuary temples of western Thebes
    eg-413  The mortuary temple of Amenhotep III
    eg-414  Deir el-Bahari
    eg-415  Tombs of the Nobles
    eg-416  The tomb of Rekhmire
    eg-417  Theban tomb painting
    eg-418  Theban tomb autobiographies
    eg-419  Deir el-Medina
    eg-420  The workmen of Deir el-Medina
    eg-421  The village of Deir el-Medina
    eg-422  The Deir el-Medina ostraca
    eg-423  Daily life at Deir el-Medina
    eg-424  Women at Deir el-Medina
    eg-425  Justice and the oracle at Deir el-Medina
    eg-426  The tools and methods of the tomb builders
    eg-427  Egyptian quarrying and stone transport
    eg-428  Unfinished obelisk
    eg-429  Egyptian ramps, levelling and lifting
    eg-430  The Deir el-Bahari royal cache
    eg-431  The reburial of the royal mummies
    eg-432  The royal mummies as evidence
    eg-433  The Theban festivals of the dead
    eg-434  Beautiful Festival of the Valley
    eg-435  Medinet Habu as a fortified enclosure
    eg-436  Western Thebes as a town
    eg-437  Thebes after the New Kingdom
    eg-438  The God's Wives of Amun at Thebes
    eg-439  Thebes under the Ptolemies and Romans
    eg-440  Why so much of Egypt's record comes from Thebes

## The Later Periods

### The Third Intermediate Period — `eg-third-intermediate`

    eg-441  Third Intermediate Period of Egypt
    eg-442  Twenty-first Dynasty of Egypt
    eg-443  Tanis
    eg-444  Smendes
    eg-445  The divided rule of Tanis and Thebes
    eg-446  Pinedjem I
    eg-447  Psusennes I
    eg-448  The royal tombs of Tanis
    eg-449  The silver coffin of Psusennes I
    eg-450  The Libyan settlement in Egypt
    eg-451  Meshwesh
    eg-452  Twenty-second Dynasty of Egypt
    eg-453  Shoshenq I
    eg-454  The Levantine campaign of Shoshenq I
    eg-455  Bubastite Portal
    eg-456  Osorkon II
    eg-457  The fragmentation of the Twenty-second Dynasty
    eg-458  The Twenty-third and Twenty-fourth Dynasties
    eg-459  The Egyptian principalities of the eighth century
    eg-460  Thebes under the God's Wives
    eg-461  The Theban priestly state
    eg-462  Third Intermediate Period burial practice
    eg-463  Bab el-Gasus
    eg-464  Third Intermediate Period coffins
    eg-465  The Book of the Dead in the Third Intermediate Period
    eg-466  Egyptian bronze statuary
    eg-467  Egypt, Israel and Judah
    eg-468  Egypt and Phoenicia
    eg-469  Egypt and Assyria before the invasions
    eg-470  The Egyptian oracle and the decline of royal authority
    eg-471  Animal cults in the Third Intermediate Period
    eg-472  Serapeum of Saqqara
    eg-473  Apis
    eg-474  Egyptian archaism
    eg-475  Egypt on the eve of the Kushite conquest

### Kush and the Twenty-fifth Dynasty — `eg-kush`

    eg-476  Nubia
    eg-477  Lower and Upper Nubia
    eg-478  A-Group culture
    eg-479  Egypt and Nubia through the pharaonic period
    eg-480  Kerma as the first Kushite state
    eg-481  Egyptian colonial Nubia in the New Kingdom
    eg-482  The Egyptianisation of Nubia
    eg-483  Kingdom of Kush
    eg-484  Napata
    eg-485  Jebel Barkal
    eg-486  The Kushite cult of Amun
    eg-487  Alara and Kashta
    eg-488  Piye
    eg-489  The Victory Stele of Piye
    eg-490  The Kushite conquest of Egypt
    eg-491  Twenty-fifth Dynasty of Egypt
    eg-492  Shabaka
    eg-493  Shabaka Stone
    eg-494  Taharqa
    eg-495  The building programme of the Kushite kings
    eg-496  Kushite royal ideology
    eg-497  Nubian pyramids
    eg-498  Kushite art and the return to Old Kingdom models
    eg-499  Kush, Egypt and Assyria
    eg-500  The Assyrian invasions of Egypt
    eg-501  The sack of Thebes in 663 BCE
    eg-502  Tantamani and the Kushite withdrawal
    eg-503  Meroë
    eg-504  The Meroitic kingdom after Egypt
    eg-505  Meroitic script

### The Late Period — `eg-late-period`

    eg-506  Late Period of ancient Egypt
    eg-507  Twenty-sixth Dynasty of Egypt
    eg-508  Psamtik I
    eg-509  The reunification of Egypt under Sais
    eg-510  Sais
    eg-511  Greek and Carian mercenaries in Egypt
    eg-512  Naucratis
    eg-513  Greek trade with Saite Egypt
    eg-514  Necho II
    eg-515  The canal from the Nile to the Red Sea
    eg-516  The circumnavigation of Africa
    eg-517  Egypt and the fall of Assyria
    eg-518  Battle of Carchemish
    eg-519  Psamtik II
    eg-520  The Abu Simbel graffiti
    eg-521  Apries
    eg-522  Amasis II
    eg-523  The Saite renaissance
    eg-524  Saite art and archaism
    eg-525  Saite administration
    eg-526  The Saite temple economy
    eg-527  Demotic
    eg-528  Late Period animal cults
    eg-529  The animal necropolises
    eg-530  Animal mummy
    eg-531  The Achaemenid conquest of Egypt
    eg-532  Cambyses II in Egypt
    eg-533  Twenty-seventh Dynasty of Egypt
    eg-534  Egypt as a Persian satrapy
    eg-535  Darius I and Egypt
    eg-536  The codification of Egyptian law under Darius
    eg-537  Temple of Hibis
    eg-538  Udjahorresnet
    eg-539  Egyptian revolts against Persia
    eg-540  Herodotus in Egypt
    eg-541  Herodotus as a source for Egypt
    eg-542  Elephantine papyri
    eg-543  The Jewish garrison at Elephantine
    eg-544  The Twenty-eighth and Twenty-ninth Dynasties
    eg-545  Amyrtaeus
    eg-546  Thirtieth Dynasty of Egypt
    eg-547  Nectanebo I
    eg-548  The temple building of the Thirtieth Dynasty
    eg-549  Nectanebo II
    eg-550  The last native pharaoh
    eg-551  The second Persian conquest of Egypt
    eg-552  Greek soldiers in Late Period Egypt
    eg-553  Late Period votive bronzes
    eg-554  Late Period statuary
    eg-555  Late Period wisdom literature
    eg-556  Egyptian healing statues
    eg-557  Egyptian identity under foreign rule
    eg-558  The Late Period priesthood
    eg-559  Egypt's reputation in the Greek world
    eg-560  The arrival of Alexander

## Greco-Roman Egypt

### Ptolemaic Egypt — `eg-ptolemaic`

    eg-561  Ptolemaic Kingdom
    eg-562  Alexander in Egypt
    eg-563  The oracle of Ammon at Siwa
    eg-564  The founding of Alexandria
    eg-565  Ptolemy I Soter
    eg-566  The seizure of Alexander's body
    eg-567  Ptolemaic kingship
    eg-568  The Ptolemies as pharaohs
    eg-569  Serapis
    eg-570  Serapeum of Alexandria
    eg-571  Alexandria
    eg-572  Library of Alexandria
    eg-573  Lighthouse of Alexandria
    eg-574  The population of Ptolemaic Alexandria
    eg-575  Greeks and Egyptians in Ptolemaic Egypt
    eg-576  Ptolemaic administration
    eg-577  The Ptolemaic tax system
    eg-578  Ptolemaic coinage
    eg-579  The Faiyum under the Ptolemies
    eg-580  Zenon Archive
    eg-581  Ptolemaic land tenure
    eg-582  Ptolemy II Philadelphus
    eg-583  Arsinoe II
    eg-584  The Syrian Wars and Egypt
    eg-585  Ptolemy III Euergetes
    eg-586  Canopus Decree
    eg-587  Ptolemy IV and the Battle of Raphia
    eg-588  The revolts of Upper Egypt
    eg-589  Hugronaphor and the rebel pharaohs
    eg-590  Rosetta Stone
    eg-591  The Memphis decrees and the priestly synods
    eg-592  Ptolemaic temple building
    eg-593  Temple of Edfu
    eg-594  Dendera Temple complex
    eg-595  Philae
    eg-596  Kom Ombo
    eg-597  The temple as a repository of Egyptian learning
    eg-598  Manetho
    eg-599  The Jews of Ptolemaic Egypt
    eg-600  Ptolemaic decline
    eg-601  Rome and the Ptolemies
    eg-602  Ptolemy XII
    eg-603  Cleopatra
    eg-604  Cleopatra and Rome
    eg-605  The end of the Ptolemaic Kingdom

### Roman Egypt — `eg-roman`

    eg-606  Egypt (Roman province)
    eg-607  The Roman annexation of Egypt
    eg-608  Egypt as the emperor's private province
    eg-609  Prefect of Egypt
    eg-610  The Egyptian grain supply of Rome
    eg-611  Roman taxation in Egypt
    eg-612  The Roman census in Egypt
    eg-613  Status and privilege in Roman Egypt
    eg-614  The Greek cities of Roman Egypt
    eg-615  Alexandria under Rome
    eg-616  The Jews of Roman Alexandria
    eg-617  The Jewish revolt of 115–117 in Egypt
    eg-618  Roman Egypt and the Red Sea trade
    eg-619  Berenice Troglodytica
    eg-620  The Eastern Desert quarries
    eg-621  Mons Claudianus
    eg-622  The Roman army in Egypt
    eg-623  Egyptian temples under Roman rule
    eg-624  Roman emperors as pharaohs
    eg-625  The decline of the Egyptian priesthood
    eg-626  Fayum mummy portraits
    eg-627  Roman-period burial in Egypt
    eg-628  Oxyrhynchus
    eg-629  Oxyrhynchus Papyri
    eg-630  Everyday life in the papyri
    eg-631  Egyptian magic in the Roman period
    eg-632  Greek Magical Papyri
    eg-633  Hermeticism
    eg-634  Greco-Egyptian alchemy
    eg-635  Egyptian cults in the Roman Empire
    eg-636  Isis outside Egypt
    eg-637  The Antonine Plague in Egypt
    eg-638  The third-century crisis in Egypt
    eg-639  Zenobia and Egypt
    eg-640  Diocletian in Egypt

### Christian Egypt and the end — `eg-late-antique`

    eg-641  Christianity in Roman Egypt
    eg-642  Church of Alexandria
    eg-643  The Diocletianic persecution in Egypt
    eg-644  Coptic language
    eg-645  Coptic literature
    eg-646  Nag Hammadi library
    eg-647  Gnosticism in Egypt
    eg-648  Egyptian monasticism
    eg-649  Anthony the Great
    eg-650  Pachomius
    eg-651  Desert Fathers
    eg-652  Athanasius of Alexandria
    eg-653  Cyril of Alexandria
    eg-654  Coptic Orthodox Church
    eg-655  The end of the Egyptian temples
    eg-656  The last hieroglyphic inscription
    eg-657  The closing of Philae
    eg-658  Byzantine Egypt
    eg-659  The Muslim conquest of Egypt
    eg-660  What survived of ancient Egypt

## Gods and the Dead

### Gods and religion — `eg-religion`

    eg-661  Ancient Egyptian religion
    eg-662  The Egyptian pantheon
    eg-663  Ra
    eg-664  Amun
    eg-665  Amun-Ra
    eg-666  Ptah
    eg-667  Osiris
    eg-668  Isis
    eg-669  Horus
    eg-670  Set (deity)
    eg-671  Nephthys
    eg-672  Anubis
    eg-673  Thoth
    eg-674  Hathor
    eg-675  Sekhmet
    eg-676  Bastet
    eg-677  Sobek
    eg-678  Khnum
    eg-679  Nut and Geb
    eg-680  Shu and Tefnut
    eg-681  Maat
    eg-682  Bes and Taweret
    eg-683  Egyptian household religion
    eg-684  Egyptian temple
    eg-685  The sanctuary and the cult image
    eg-686  The daily temple ritual
    eg-687  Ancient Egyptian priesthood
    eg-688  The lector priest
    eg-689  Purity and the priestly life
    eg-690  Ancient Egyptian festivals
    eg-691  The portable barque and the divine procession
    eg-692  Egyptian oracles
    eg-693  The Egyptian offering formula
    eg-694  Votive offerings in Egypt
    eg-695  Sacred animals of ancient Egypt
    eg-696  The sacred bulls of Egypt
    eg-697  Egyptian amulets
    eg-698  Scarab
    eg-699  Ancient Egyptian magic
    eg-700  Heka
    eg-701  Egyptian magical spells and their uses
    eg-702  Egyptian dream interpretation
    eg-703  Egyptian personal piety
    eg-704  Egyptian ethics and the ideal life
    eg-705  The temple as a model of the cosmos
    eg-706  Egyptian solar theology
    eg-707  Egyptian syncretism
    eg-708  Egyptian religion and the state
    eg-709  Foreign gods in Egypt
    eg-710  How Egyptian religion changed over three thousand years

### Myth and cosmology — `eg-myth`

    eg-711  Ancient Egyptian creation myths
    eg-712  Nu
    eg-713  The primeval mound
    eg-714  Ennead
    eg-715  The Heliopolitan cosmogony
    eg-716  Memphite theology
    eg-717  Ogdoad
    eg-718  Atum
    eg-719  Osiris myth
    eg-720  The murder of Osiris
    eg-721  The conception of Horus
    eg-722  The Contendings of Horus and Set
    eg-723  Eye of Horus
    eg-724  Eye of Ra
    eg-725  The Destruction of Mankind
    eg-726  Book of the Heavenly Cow
    eg-727  The solar barque
    eg-728  Apep
    eg-729  Duat
    eg-730  Egyptian conceptions of the sky
    eg-731  The Egyptian cosmos
    eg-732  Egyptian sacred geography
    eg-733  Egyptian myths of kingship
    eg-734  The king as Horus and son of Ra
    eg-735  Egyptian tales of the gods
    eg-736  The myth of the Distant Goddess
    eg-737  Myth and the temple wall
    eg-738  Egyptian myth in Greek and Roman writers
    eg-739  Plutarch on Isis and Osiris
    eg-740  The problem of writing Egyptian mythology

### Death, burial and the afterlife — `eg-death`

    eg-741  Ancient Egyptian funerary practices
    eg-742  Egyptian conceptions of the person
    eg-743  Ka
    eg-744  Ba
    eg-745  Akh
    eg-746  The name and the shadow
    eg-747  Egyptian ideas of the afterlife
    eg-748  Field of Reeds
    eg-749  The weighing of the heart
    eg-750  The judgement of the dead
    eg-751  The negative confession
    eg-752  Ammit
    eg-753  Mummification
    eg-754  The stages of embalming
    eg-755  Natron
    eg-756  The Egyptian embalmers
    eg-757  Canopic jar
    eg-758  Opening of the Mouth ceremony
    eg-759  The Egyptian funeral procession
    eg-760  Egyptian coffins
    eg-761  Anthropoid coffins
    eg-762  Egyptian sarcophagi
    eg-763  Egyptian funerary masks
    eg-764  Book of the Dead
    eg-765  The spells of the Book of the Dead
    eg-766  The Egyptian netherworld books
    eg-767  Egyptian tomb architecture
    eg-768  The pyramid as a tomb form
    eg-769  The Egyptian rock-cut tomb
    eg-770  The tomb chapel and the false door
    eg-771  Egyptian funerary stelae
    eg-772  The funerary offering cult
    eg-773  The purpose of Egyptian tomb decoration
    eg-774  Scenes of daily life in Egyptian tombs
    eg-775  Egyptian grave goods
    eg-776  The duties of the shabti
    eg-777  Egyptian tomb models
    eg-778  Egyptian animal burials
    eg-779  The burial of the Egyptian poor
    eg-780  Egyptian cemeteries and their organisation
    eg-781  Tomb robbery in ancient Egypt
    eg-782  The reuse of tombs and coffins
    eg-783  What mummies show about Egyptian health
    eg-784  Disease and life expectancy in ancient Egypt
    eg-785  Egyptian mourning
    eg-786  Letters to the dead
    eg-787  Egyptian ancestor cults
    eg-788  The dead in Egyptian daily life
    eg-789  Why the Egyptian record is a record of the dead
    eg-790  Egyptian funerary religion after the pharaohs

## Kingship, State and Society

### Kingship and the state — `eg-kingship`

    eg-791  Pharaoh
    eg-792  Egyptian royal ideology
    eg-793  The five names of the Egyptian king
    eg-794  Cartouche
    eg-795  Egyptian royal regalia
    eg-796  Crowns of Egypt
    eg-797  Uraeus
    eg-798  The king as guarantor of maat
    eg-799  The smiting scene
    eg-800  Egyptian royal women
    eg-801  Female pharaohs
    eg-802  Royal succession in ancient Egypt
    eg-803  Egyptian coregency
    eg-804  The Egyptian royal court
    eg-805  Vizier (Ancient Egypt)
    eg-806  Ancient Egyptian administration
    eg-807  The Egyptian scribal bureaucracy
    eg-808  The Egyptian treasury and granaries
    eg-809  Taxation in ancient Egypt
    eg-810  The Egyptian census and the corvée
    eg-811  Ancient Egyptian law
    eg-812  Egyptian courts and legal documents
    eg-813  Punishment in ancient Egypt
    eg-814  The nome and provincial government
    eg-815  Egyptian towns and their governance
    eg-816  Egyptian frontier control
    eg-817  Egyptian fortresses
    eg-818  The Egyptian army through time
    eg-819  Egyptian weapons and warfare
    eg-820  Egyptian naval activity
    eg-821  Egyptian diplomacy and treaties
    eg-822  Egyptian tribute and foreign policy
    eg-823  The royal monument as propaganda
    eg-824  Reading royal claims critically
    eg-825  Continuity and change in Egyptian kingship

### Society and everyday life — `eg-society`

    eg-826  Ancient Egyptian society
    eg-827  The Egyptian social order
    eg-828  Egyptian peasants and agricultural labour
    eg-829  Egyptian craftsmen
    eg-830  Dependent labour in ancient Egypt
    eg-831  Slavery in ancient Egypt
    eg-832  Women in ancient Egypt
    eg-833  Marriage in ancient Egypt
    eg-834  Egyptian divorce and property
    eg-835  Childhood in ancient Egypt
    eg-836  Egyptian education
    eg-837  Egyptian names and naming
    eg-838  Egyptian houses
    eg-839  Egyptian towns and villages
    eg-840  Egyptian furniture
    eg-841  Ancient Egyptian cuisine
    eg-842  Bread and beer in Egypt
    eg-843  Egyptian brewing and baking
    eg-844  Ancient Egyptian clothing
    eg-845  Egyptian wigs and hairstyles
    eg-846  Egyptian cosmetics
    eg-847  Egyptian jewellery
    eg-848  Music in ancient Egypt
    eg-849  Dance in ancient Egypt
    eg-850  Egyptian games and toys
    eg-851  Senet
    eg-852  Hunting and fishing in ancient Egypt
    eg-853  Animals in ancient Egypt
    eg-854  Cats in ancient Egypt
    eg-855  Egyptian gardens
    eg-856  Egyptian boats and river travel
    eg-857  Desert travel and the Egyptian roads
    eg-858  Festivals in Egyptian daily life
    eg-859  Egyptian feasting
    eg-860  Egyptian humour and satire
    eg-861  Egyptian personal letters
    eg-862  Village disputes and local justice
    eg-863  Resident foreigners in Egypt
    eg-864  Egyptian population and settlement
    eg-865  What a lifetime looked like in ancient Egypt

### Land, trade and the economy — `eg-economy`

    eg-866  The economy of ancient Egypt
    eg-867  Ancient Egyptian agriculture
    eg-868  Basin irrigation
    eg-869  The Egyptian agricultural year
    eg-870  Shaduf
    eg-871  Land tenure in ancient Egypt
    eg-872  Egyptian temple estates
    eg-873  Egyptian grain and its storage
    eg-874  Rations and payment in kind
    eg-875  Egyptian weights and values
    eg-876  Deben
    eg-877  Egypt before coinage
    eg-878  Egyptian markets and exchange
    eg-879  Egyptian craft workshops
    eg-880  Egyptian linen production
    eg-881  Papyrus as a product
    eg-882  Egyptian pottery production
    eg-883  Egyptian quarries
    eg-884  Egyptian mining expeditions
    eg-885  Egyptian gold mining
    eg-886  Egyptian copper and metalworking
    eg-887  Egyptian trade with the Levant
    eg-888  Land of Punt
    eg-889  Egyptian trade with Nubia
    eg-890  Egypt in the Bronze Age world economy

## Writing, Art and Knowledge

### Writing and literature — `eg-writing`

    eg-891  Egyptian language
    eg-892  Egyptian hieroglyphs
    eg-893  How hieroglyphs work
    eg-894  Determinatives and phonograms
    eg-895  Hieratic
    eg-896  Demotic script
    eg-897  Coptic alphabet
    eg-898  The stages of the Egyptian language
    eg-899  The decipherment of Egyptian hieroglyphs
    eg-900  Egyptian writing materials
    eg-901  Papyrus
    eg-902  Ostracon
    eg-903  The Egyptian scribe
    eg-904  Scribal training in ancient Egypt
    eg-905  Literacy in ancient Egypt
    eg-906  Ancient Egyptian literature
    eg-907  Egyptian wisdom literature
    eg-908  Maxims of Ptahhotep
    eg-909  Instruction of Any
    eg-910  Instruction of Amenemope
    eg-911  Egyptian narrative fiction
    eg-912  Tale of the Doomed Prince
    eg-913  Egyptian travel narrative
    eg-914  Egyptian poetry
    eg-915  Egyptian hymns
    eg-916  Hymn to the Nile
    eg-917  Egyptian love songs
    eg-918  Egyptian laments
    eg-919  Egyptian autobiography
    eg-920  The Egyptian royal inscription as a genre
    eg-921  Egyptian letters as a form
    eg-922  Egyptian technical texts
    eg-923  Egyptian onomastica
    eg-924  House of Life
    eg-925  The copying and transmission of Egyptian texts
    eg-926  The Egyptian book
    eg-927  Demotic literature
    eg-928  The Setne stories
    eg-929  Egyptian literature in the Greco-Roman period
    eg-930  What survives of Egyptian literature, and why

### Art and architecture — `eg-art`

    eg-931  Ancient Egyptian art
    eg-932  The conventions of Egyptian art
    eg-933  The Egyptian canon of proportions
    eg-934  Egyptian relief carving
    eg-935  Sunk and raised relief
    eg-936  Egyptian painting
    eg-937  Egyptian pigments
    eg-938  Egyptian statuary
    eg-939  Egyptian royal statuary
    eg-940  Egyptian private statues
    eg-941  Egyptian colossal sculpture
    eg-942  Sphinx
    eg-943  Figured ostraca and artists' sketches
    eg-944  Egyptian woodwork
    eg-945  Egyptian metalwork
    eg-946  Egyptian glass
    eg-947  Egyptian glazed ware
    eg-948  Egyptian furniture as art
    eg-949  The Egyptian artist and the workshop
    eg-950  Style and change in Egyptian art
    eg-951  Ancient Egyptian architecture
    eg-952  Egyptian mudbrick building
    eg-953  Egyptian stone architecture
    eg-954  The Egyptian column
    eg-955  Pylon
    eg-956  Hypostyle hall
    eg-957  Egyptian obelisks
    eg-958  Egyptian temple plans and their meaning
    eg-959  Egyptian rock-cut architecture
    eg-960  Egyptian palaces
    eg-961  Egyptian fortress architecture
    eg-962  Egyptian building techniques
    eg-963  Egyptian surveying and orientation
    eg-964  The astronomical alignment of Egyptian monuments
    eg-965  Ornament and meaning in Egyptian decoration
    eg-966  Egyptian colour symbolism
    eg-967  Amarna art reconsidered
    eg-968  Egyptian art under foreign rule
    eg-969  Egyptian influence on later art
    eg-970  Egyptomania

### Science, medicine and technology — `eg-science`

    eg-971  Ancient Egyptian mathematics
    eg-972  Egyptian numerals
    eg-973  Egyptian fraction
    eg-974  Rhind Mathematical Papyrus
    eg-975  Moscow Mathematical Papyrus
    eg-976  Egyptian geometry and land measurement
    eg-977  Ancient Egyptian units of measurement
    eg-978  Cubit
    eg-979  Egyptian astronomy
    eg-980  The Egyptian civil calendar
    eg-981  Sothic cycle
    eg-982  Decan
    eg-983  Egyptian star clocks and water clocks
    eg-984  Timekeeping in ancient Egypt
    eg-985  Ancient Egyptian medicine
    eg-986  Egyptian physicians
    eg-987  Edwin Smith Papyrus
    eg-988  Ebers Papyrus
    eg-989  Egyptian surgery
    eg-990  Egyptian pharmacology
    eg-991  Dentistry in ancient Egypt
    eg-992  Magic and medicine in Egypt
    eg-993  Egyptian technology
    eg-994  Egyptian tools
    eg-995  Egyptian woodworking and joinery
    eg-996  Egyptian shipbuilding
    eg-997  Egyptian glassmaking
    eg-998  Egyptian materials and their working
    eg-999  Egyptian knowledge and its transmission
    eg-1000 What the Egyptians knew
