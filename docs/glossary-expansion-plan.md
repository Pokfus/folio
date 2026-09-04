# The glossary audit and expansion (Aug 2026, on request)

Three jobs asked for together, and they are kept apart here because they fail differently and
finish at different times.

1. **AUDIT** — every description must be a GENERAL INTRODUCTION to its own term, written for a
   reader who knows nothing about it beforehand. `Tin` was named as the example.
2. **REMOVE** four terms, and correct two auto-linking faults.
3. **ADD** the requested terms. Once the five "add all X" groups are expanded this is about
   **400 terms**, which is the largest single content pass this glossary has had.

---

## 1. The audit

### The rule

**A gloss popup is met cold.** The reader has tapped a word in the middle of somebody else's
sentence and may never have heard of it, so the FIRST sentence has to say what the thing IS —
its class, and what separates it from the other things of that class. Only then may the
remaining two sentences say anything about it.

What this pass hunts is the description that opens on a SPECIFIC CONTEXT, a piece of research,
or one famous example, and never gets round to the definition. `Tin` is the case the request
names:

> Tin travelled a long way to reach the places that used it, and where it came from is one of the
> standing questions of Bronze Age archaeology; earlier attempts to fingerprint the metal all
> failed…

Every word of that is true and none of it says tin is a soft silvery metal that alloys with
copper to make bronze — which is the one thing a reader meeting the word needs. The three
sentences are a research summary standing where a definition should be.

**The corollary is that the SPECIFICS are not the enemy.** A description with no dates, no
figures and no named finds is a worse description, not a safer one — the house rules already
demand a term be impartial, self-contained and cited. What is being corrected is the ORDER and
the PROPORTION: define first, then illustrate, and never let one dig, one wreck or one
laboratory method stand in for the term itself.

### The measure

`node .claude/gloss-general.js [--list] [--tag=<kind>] [--term=<slug>]`

It takes each description's first sentence, asks whether it predicates something of the TERM
ITSELF with a copula or a naming verb, and reports everything else. **It is a prompt to read,
never a verdict** — it cannot tell a good definition from a bad one, and it has false positives
on terms whose subject genuinely opens another way.

Two things about it are worth knowing before touching it.

**IT REUSES `split-abstract.js`'s SPLITTER RATHER THAN CARRYING A SECOND COPY.** Written with a
naive full-stop rule it reported "Jason E." as a whole sentence and flagged fourteen presidents
and palaeoanthropologists for having initials in their names — 46 flagged against a true 20.

**AND ITS VERB LIST MAY CONTAIN NOTHING USABLE AS A NOUN.** It briefly carried `places?`, for
"the technique places the figures…", which matched the NOUN in *"Tin travelled a long way to
reach the **places** that used it"* — silencing the one term the whole audit was written for,
with nothing on the report to show that it had. `set`, `works`, `records`, `leaves`, `stores`,
`marks`, `forms` and `measures` are the same trap. **Prefer reading a false positive to widening
the list.**

### Batches

| batch | scope | state |
|---|---|---|
| **A1** | the terms the measure flags | shipped |
| **A2** | a directed read of the general kinds — `object`, `concept`, `practice`, `animal`, `plant`, `technology`, `industry` — whose subjects are the ones most easily replaced by a case study | shipped |
| **A3** | sentences 2 and 3 across the corpus: a term that defines well and then spends its remaining two thirds on one site | shipped |

A2 and A3 cannot be automated the way A1 is. A1 asks whether a sentence has a definition in it,
which is a shape; A2 and A3 ask whether a description is ABOUT its term, which is a judgement.

**A2's finding is that the failures cluster in two kinds and nowhere else.** Reading the first
sentence of every `object`, `concept`, `practice`, `animal`, `plant`, `technology` and `industry`
term turned up twelve — seven materials (`Bronze`, `Chert`, `Gold`, `Iron`, `Ivory`, `Marble`,
`Clovis_point`) and five animals (`Cattle`, `Goat`, `Horse`, `Mammoth`, `Woolly_mammoth`) — and
`concept`, `practice`, `industry` and `plant` came back clean. The shape is always the same: the
opening states the most interesting thing known about the subject rather than what the subject is.
`Horse` was the worst, opening on a bone count from one French rock shelter; `Iron` opened on the
bloomery process and never said iron is a metal; `Gold` opened on ore-deposit geochemistry.

**The blocker was sourcing, and it turned out not to be one.** A definitional opening wants a
work that says what the material IS, and neither the USGS Mineral Commodity Summaries (which
carry a properties sentence for silver and none for gold or iron ore) nor the papers already
cited on those terms supply one — Petrella 2022, Baron 2019 and Prochaska 2023 all open on
provenance and deposit science. What settles it is the corpus's own convention, measured:
**1,115 of 1,120 terms already open on an UNMARKED first sentence.** The house shape is define
first, unmarked, then cite the substantive claims — so the rewrites needed no new citation at
all, and every existing source kept its marker on the sentence it actually carries.

**A3 discharges on measurement rather than on reading.** The question is whether an entry defines
its term and then spends its remaining two thirds on one named case, so the test is whether EVERY
sentence after the first is case-bound — naming a site, specimen or document and pinning it with a
figure. Swept over the whole glossary that is **0 of 1,120**: every entry has at least one general
sentence after its first. A looser measure (a tail that never returns to the term's own surface
and carries two or more proper nouns) flags 647, which is not a finding but a measure with no
precision — proper nouns are what evidence looks like. Recorded so nobody re-runs the loose one
and reads its output as a backlog.

---

## 2. Removals and corrections

**Removed on request:** `Wheel`, `Burial`, `Village`, `City`.

**`cist` is no longer an alias of `Cist_grave`.** A cist is a stone box, which is a thing in its
own right and turns up in contexts that are not graves; the alias made every one of them link to
a burial type. `cist tomb` and `slab-built cist` stay, both being unambiguous.

**`Shun` is case-sensitive.** Lower-case *shun* is an ordinary English verb, and the alias linked
it to the second Chinese sage-king wherever a card said somebody shunned something. This is the
`Afar` and `Boreal` rule for the third time: **ask of every short key whether it is also an
ordinary English word.**

---

## 3. The additions

### What the "add all X" groups actually cost

| group | terms | note |
|---|---|---|
| Minoan chronology | ~24 | EM/MM/LM, majors and the sub-phases the request names |
| Helladic chronology | ~14 | EH/MH/LH |
| Troy levels | ~11 | Troy I–IX with VIIa / VIIb |
| Hills of Rome | 7 | Palatine named separately in the request |
| **Italian provinces** | **107** | Italy's provinces and metropolitan cities |

So 244 named terms plus ~163 = **about 400**.

**The chronology groups are the ones to get right rather than the ones to get through.** The
request says outright: *ensure it is clear for each what sets them apart from the others.* A
phase description that says only "the second phase of Early Minoan, about 2650–2200 BCE" has
told the reader nothing they could not have guessed from the name. Each needs its own
**diagnostic** — the pottery, the architecture, the burial form or the destruction horizon that
is why the phase was cut where it was.

### The sourcing spine, measured 2026-08-21

Reachable, and what each is for:

| host | for |
|---|---|
| `perseus.tufts.edu` | the ancient authors, in translation and in the original |
| `chs.harvard.edu` | Center for Hellenic Studies monographs, open in full |
| `journals.openedition.org`, `persee.fr` | French archaeology of Greece, Italy and the Aegean |
| `doi.org` | resolves; a paywalled landmark is still citable where it is the landmark |
| `europepmc.org` | the genetics, the isotopes, the palaeoenvironment |
| `istat.it` | **the Italian provinces** — the national statistical office, per province |
| `namuseum.gr` | the National Archaeological Museum's own object records |
| `openarchaeologydata.metajnl.com` | open excavation datasets |

Shut here: `britannica.com` (403, and it fails the cites-its-sources test the plan already
applies), `whc.unesco.org` (403 — reach UNESCO properties through the state party's own record),
`ascsa.edu.gr` (no answer).

### Batches

Grouped so the research is shared — one body of scholarship serves a whole batch.

| batch | terms | subject |
|---|---|---|
| N1 | 6 | Bronze and Iron Age tripartite divisions (Early / Middle / Late, both) — **shipped**, all six pictured |
| N2 | 11 | Minoan chronology I — Early Minoan and Middle Minoan — **shipped** |
| N3 | 8 | Minoan chronology II — Late Minoan — **shipped**, all eight pictured |
| N4 | 14 | Helladic chronology — **shipped**, 10 of 14 pictured |
| N5 | 11 | Troy levels — **shipped**, 8 of 11 pictured |
| N6 | 12 | Aegean prehistorians and museums — **shipped**, 7 of 12 pictured |
| N7 | 12 | Athens topography — **shipped**, all twelve pictured |
| N8 | 11 | Mycenaean tombs and grave circles — **shipped**, all eleven pictured (Tomb N deferred, see below) |
| N9 | 9 | Greek architecture and its orders — **shipped**, 7 of 9 pictured (see below) |
| N10 | 12 | Greek vessel and object vocabulary — **shipped**, all twelve pictured |
| N11 | 12 | Greek regions and islands — **shipped**, all twelve pictured |
| N12 | 12 | Crete: sites and landscape — **shipped**, all twelve pictured |
| N13 | 12 | Cyprus and the Late Bronze Age east — **shipped**, all twelve pictured |
| N14 | 12 | Materials, alloys and the sciences that source them — **shipped**, 10 of 12 pictured; clears N9's deferred *Poros stone* |
| N15 | 12 | Rome's foundation and its earliest institutions — **shipped**, 8 of 12 pictured |
| N16 | 12 | The hills of Rome and the city's topography — **shipped**, 6 of 12 pictured |
| N17 | 12 | Latium: the Latial culture and its sites — **shipped**, 7 of 12 pictured |
| N18 | 12 | The Italic peoples — Samnites, Sabines, Umbrians |
| N19 | 12 | Umbria and its sanctuaries |
| N20 | 12 | Italian landscape and geology |
| N21 | 12 | Tanzania, the Serengeti and African mammal groups |
| N22 | 12 | Olduvai beds, palaeoanthropology's institutions |
| N23 | 12 | Amarna and Egypt |
| N24–N32 | ~107 | **the Italian provinces**, by region |

**N3 shipped eight terms rather than twelve, and the missing four are one deferral and one
fold.** *Subminoan* is deferred: Rutter's Chronology Overview gives it a single sentence — "The
following Subminoan period is the earliest phase of the Iron Age" — `chs.harvard.edu` returns no
results for it and Crossref offers only paywalled items, so nothing reachable can carry three
sentences at the bar; and Rutter classes it as **Iron Age**, not a Minoan Bronze Age level, so it
does not belong in a Minoan-chronology batch anyway. *LM IIIA1* and *LM IIIA2* are **aliases of
`Late_Minoan_IIIA`** rather than terms of their own — N2's rule, applied to the same evidence:
Rutter treats LM IIIA in one section, says it is "sometimes further subdivided", and gives a
distinct diagnostic only for IIIA2. The same call was made for MM IIA/IIB.

**N4's finding is that the guard has to check the SOURCE COUNT, not only the prose.** `build.js`
verifies sentences, words, the unmarked first sentence, marker overrun and every-source-referenced —
and NOT the ≥2-citation bar — so it reported "all ready: 14" on a batch in which **eight of the
fourteen carried one citation**, which `add-glossary.js` would have refused entry by entry. The
second source was then wired into each of the eight by finding a claim the entry actually makes in
another Rutter lesson and either marking the sentence that already carried it (six) or appending a
short clause carrying it (three, folded in with a **semicolon** so the sentence count stays three).
No source list was padded. **A build guard that stops short of the tool it feeds is a guard that
reports a pass the tool will refuse**; the batch is now verified twice, once by the build and once by
an independent check of `src>=2 && allref`.

**And the alias rule bit twice in one batch, which makes it three instances in this pass.**
`Mycenaean_Greece` held `"Late Helladic"` and `Postpalatial_Greece` held `"Late Helladic IIIC"` —
both written before those keys existed, and the second an EXACT tie that `buildGlossIndex`'s
longest-first sort cannot resolve. Both removed. **Sweep the corpus for a collision after adding any
key whose surface a sibling might already be claiming**, and note that fixing the first collision is
what made the second visible.

**Ten of the fourteen are pictured and the four without say why.** `Helladic_chronology` is a dating
framework rather than a thing, so a chart would be somebody's own reconstruction rather than a
photograph; `Early_Helladic_I` has no free image of Eutresis-culture material at the ~900px bar;
`Middle_Helladic` has none either — every free photograph of Minyan ware and of Aegina matt-painted
ware found is about 500px on the long side (Minyan ware 01, the Minyan kylix at Thebes, the Minyan
amphoriskos, the Troizen stemmed goblet, the Aegina storage jar), which is the whole diagnostic of
the phase unavailable at the bar; and `Late_Helladic`'s emblematic objects are all spoken for by its
own subdivisions.

**The provinces are their own phase and should be worked last**, for two reasons: they are a
quarter of the whole pass, and they are the only part of it that is a table rather than a
subject — one authoritative source per term, one shape of sentence, no argument to weigh. Doing
them first would spend the pass's best attention on its least interesting terms.

### Batch log

**N6 — Aegean prehistorians and museums (shipped).** The batch was planned as twelve people and
institutions and shipped as ten, plus `thalassocracy` and `Berlin` in place of two that could not be
written. **Florian Ruppenstein is DEFERRED with a stated reason**: G8's rule is that the literature
pays for results rather than for living people, and no reachable page states his affiliation —
DOAJ, Europe PMC, Gnomon, OAPEN, Propylaeumdok and Freiburg's own site are each shut, walled or
404 from here, so the two-source bar cannot honestly be met for him. Come back to it when one of
those opens rather than citing a publisher's contributor blurb.

Three faults it turned up are worth carrying. **A DOI carried forward in working notes is a DOI
nobody read**: the Historika citation had been noted with Girau's DOI and no author at all, and the
right pair (Elisabetta Bianco, `10.13135/2039-4985/1908`) came out of the page's own
`citation_*` metadata, which is far more reliable than scraping the prose. **A page that returns 200
may still be navigation**: the Wits ESI page is 2,529 characters of menus and carries none of the
Taung or *sediba* facts it was chosen for, so the term was rewritten around the university's own
history page instead. And **a name must be READ rather than completed**: the museum's source gives
its benefactor as "E. Tositsa" and the description names no first name.

**Its pictures are 7 of 12.** Five have none and each has a reason rather than a gap: `Sturt
Manning`, `Jeremy Rutter` and `John Papadopoulos` are living scholars with no freely licensed
portrait on Commons (the searches return radiocarbon diagrams and unrelated namesakes), and
`monograph` and `thalassocracy` are abstract, which the picture pass already records as the
commonest honest reason for none. `Ludwig Borchardt`'s is a Max Liebermann oil portrait digitised
at only 287 x 360, below the pass's ~900px bar and taken anyway: it is the only free image of him,
the popup slot caps at 150px, and a stated trade beats no picture at all.

**N7 — Athens, Attica and the mainland's sanctuaries (shipped, all twelve pictured).** Pompeion,
Dipylon Gate, Pelargikon, Cape Sounion, Mount Pentelicus, Mount Hymettus, Salamis, Corinthia,
Kalapodi, Orchomenos, Krisa, Mantineia. Four sourcing findings are worth carrying. **A remembered
citation is not a citation**: Pausanias 8.8 returns Nestane and the Untilled Plain rather than the
battles an earlier note recalled, and Herodotus 8.83 is Themistocles' speech and says nothing
identifying Salamis — 8.40, the fleet putting in so Attica could be evacuated, is what the term
cites. **Persee serves a "document does not exist" page with a 200-shaped body**, so a composed URL
reads as a real page; the Te Riele reference was found by searching rather than by guessing. And
**a superseded framework is not repeated for the sake of one usable fact**: Berard is cited for the
wall, the two spellings and the late date of the stork pun, and not for his Dorian-invasion
chronology.

Its alias finding is the pass's own trap arriving on schedule. **A bare `Dipylon` alias was
refused**: the surface occurs 38 times in the glossary for the Dipylon Master, Painter and Amphora,
so it would have mis-linked all of them to the gate. `Salamis` is keyed as the Saronic island and
the Cypriot city takes a disambiguated key when Cyprus is reached (N13); `Cirrha` is not an alias
of `Krisa`, being a different place downhill.

**N8 — Mycenaean tombs and grave circles (shipped, eleven of twelve, all eleven pictured).** Tomb
of the Lions, Tomb of Aegisthus, Tomb of Clytemnestra, Grave Gamma, Shaft Grave V, dromos, stele,
corbel, vestibule, citadel, scabbard, diadem.

**`Tomb N` is DEFERRED with a stated reason.** No openable source identifies it: Rutter's lessons,
which carry the nine Mycenae tholoi and both grave circles, contain no tomb of that name, and three
searches turned up nothing that could be cited. Every scholarly host that might settle it is shut
from here — all the Wace BSA articles are paywalled, `mycenae-excavations.org` and `mycenae.gr` are
empty shells, `chs.harvard.edu`'s search is JavaScript-driven and `culture.gov.gr` is 403. Come back
to it when one of those opens rather than guessing which tomb the request meant.

Two findings about the shaft graves are worth carrying, and both are about not repeating a number.
**Schliemann's numbering is not the modern one** — Grave IV is his no. 4 and Grave V his no. 1 — so
the masked triple burial appears in his own book under "the first sepulchre", and a page cited from
memory would file it under the wrong grave. And **the tomb Schuchhardt says was "excavated by Mrs.
Schliemann" is deliberately NOT asserted to be the Tomb of Clytemnestra**: his architectural
description corroborates Rutter's, he never uses the name, and identifying it here would be
composing an attribution, so he is not among the citations.

**Its pictures cost more than any batch so far and three findings came out of the looking.** **A
record can describe a diadem and show none**: the Louvre's `Greek diadem Louvre Bj119`, titled and
described as a funerary diadem, holds three detached gold fragments on a slate slab — two rosettes
and a sprig — with no band or fillet anywhere in the frame, which is precisely what the entry
defines. Four further searches returned only Getty hairnets and 19th-century coin-catalogue scans.
What answered is the badge itself rather than an object: a tetradrachm of Demetrios I Poliorketes,
whose obverse shows the plain flat band tied round the head with its end hanging behind. **Ask what
would SHOW the definition, not what shares its name.** **The scabbard ships as a replica and says
so** — seven searches found only book scans, medieval chapes and the Carnuntum replica of the Sword
of Tiberius, whose original is in the British Museum — which is the documented cast-and-replica
rule. And **the uploader's own correction outranks the file name**: the Demetrios file is titled
Berlin and its record states Munich, so the caption follows the record.

### The standing rules a new term is held to

Unchanged, and this pass does not relax them:

- **three sentences, 90–110 words** (`gloss-length.js`);
- **at least two citations**, each ending in an openable URL, each pointed at by an empty
  `<sup class="fn">` marker (`add-glossary.js` refuses less);
- **at least three tags**, reusing the established vocabulary;
- **impartial, deck-agnostic and self-contained** — no "unlike X", no framing the term inside one
  collection's story;
- **a picture, or a stated reason there is none**;
- and now, from this pass: **the first sentence defines the term.**

### The alias trap this pass will keep meeting

Half the requested terms are short, and several are ordinary English words or the names of other
things entirely — `honey`, `fig`, `slate`, `lava`, `karst`, `deme`, `Perseus`, `Salamis`,
`Arcadia`, `Berlin`, `Genoa`, `Messina`, `Foglia`, `Maa`, `Kea`, `Bed I`. Three rules, all of
them already recorded here and all of them learned the hard way:

- **ask whether the surface is also an ordinary word** — `Shun`, `Afar`, `Boreal`;
- **ask what a new key will match once the OTHER collections are written**, not only what it
  matches today — `Perseus` is a Greek hero AND a digital library this glossary cites;
- **an alias list written before its sibling term exists will contain that sibling's name** —
  `Arcadia` is requested twice in the same list, once as a Greek region and once as the Arcadian
  homeland of Evander in Rome's foundation legend.

### N17's findings

**N17 — Latium: the Latial culture and its sites (shipped, 7 of 12 pictured).** The Latial culture,
Lavinium, Gabii, Tusculum, Aricia, Ardea, Praeneste, Satricum, Crustumerium, Ficana, Fidenae and the
grove of Ferentina.

**THE SPINE MOVES ONE VOLUME ALONG: SMITH'S *GEOGRAPHY* HAS AN ENTRY FOR EVERY SITE IN LATIUM.** N16's
Platner and Ashby is the topography of the CITY and stops at the walls; the country outside it is covered
by Smith's *Dictionary of Greek and Roman Geography* (Perseus text id `1999.04.0064`, `-geo` slugs),
which N13 had already used for Cyprus and the Levant. Eleven of the twelve terms take a Smith entry, and
every entry is substantial and cites its ancient authorities by name — which is also what lets it pass
the plan's own encyclopedia test. **Livy carries the second source for ten of them**, so the batch is
again two works and a choice of chapter. Where a place's Smith slug does not exist the failure is loud:
`ferentina-geo` returns the 1,877-byte error page, so the grove takes **two Livy chapters instead**, 1.50
for Turnus Herdonius denouncing Tarquin there and 1.51 for his drowning in the spring under a weighted
hurdle.

**AND THE 1,877-BYTE AND 66,664-BYTE PERSEUS PAGES CARRY THE SAME WORDS.** N16 recorded them as two
distinct failure modes; they are one message — "we were unable to find a document matching your query" —
served at two sizes depending on how much navigation the surrounding page carries. **The size is not the
diagnostic and neither is the status; the body is.**

**A MODERN SECOND SOURCE FOR THE CULTURE ITSELF WAS ALREADY IN THE GLOSSARY.** `Latial_culture` is the
one term in the batch that a 19th-century geography cannot carry alone, and Fulminante, Prignano, Morer
and Lozano's 2017 paper on the Latin road network — cited already by `Latins`, `Latium` and `rm-010` —
states the periodisation outright, mapping Latial IIA through IVB against the Iron Age sequence and
saying that Latium vetus was organised in proto-urban centres and then city-states with a common material
culture. **Read the register before searching**: Europe PMC returned nothing usable for "Latial culture"
in three queries, and the work that answers had been sitting in the corpus for months.

**THE REGISTER'S OWN CITATION OF THAT PAPER IS WRONG IN TWO WAYS, AND THE PAGE SAYS SO.** It is filed as
"Francesca Fulminante et al." with a colon in the title; the article's own metadata gives four authors —
Fulminante, Prignano, Morer and Lozano — and a title punctuated with a **full stop**, "Coordinated
Decisions and Unbalanced Power. How Latin Cities Shaped Their Terrestrial Transportation Network". The
new citation is written from the metadata. This is N4's fabricated-author finding in its mildest form and
it is worth restating: **a citation inherited from the register is inherited, not verified.**

**PERSÉE ANSWERS FOR METADATA AND REFUSES THE TEXT.** Its article record pages are open and carry
`citation_author`, `citation_firstpage`, `citation_lastpage` and `citation_doi` in full — Bourdin's
"Ardée et les Rutules", MEFRA 117.2 (2005): 585–631, was confirmed that way in seconds — but
`persee.fr/docAsPDF/…` is **403** here and the record page carries no body text, so the article cannot be
read. Under the rule that a source is cited for a claim someone has actually read, a Persée article
verified this way is a bibliographic fact and not yet a citation.

**ONE KEY WAS REFUSED ON A GENUS COLLISION AND ONE WAS KEPT, ON THE SAME MEASUREMENT.** N15's rule is to
ask what a bare surface will match once the other collections are written. `Ardea` is also the heron
genus, certain to appear in the planned Biology and Dinosaurs collections, and `Aricia` is a lycaenid
butterfly genus that is not. Both were measured: today every corpus use of either is the Latin town, so
the balance favours keeping both, and the difference between them is only how likely the modern sense is
to arrive — **which is a judgement, recorded here rather than hidden in a key**. If a bio card ever
writes *Ardea cinerea*, `check-gloss-links.js` will not see it (the checker compares geography tags and
neither term carries one), so this paragraph is the record.

**THE PICTURE PASS CAUGHT THE NAME-IN-THE-WRONG-PLACE TRAP FOR THE THIRD BATCH RUNNING, AND CATEGORY
MEMBERSHIP IS WHAT CAUGHT IT.** `Latial_culture` wanted a hut urn, and Commons offers a fine bronze one
captioned "dalla necropoli dell'osteria" — which is **Vulci**, not Osteria dell'Osa in Latium: the file's
own categories read "Antiquities from Vulci" and "Etruscan funerary urns". A Villanovan urn illustrating
the Latial culture would have been wrong in exactly the way the term exists to prevent, and no reading of
the title would have shown it. **Read the categories, not the caption.** No Latium-provenance hut urn was
found, so the term ships unpictured.

**FIVE SHIP WITHOUT A PICTURE AND THE REASONS DIFFER.** `Crustumerium` has an empty Commons category and
`Lucus_Ferentinae` none at all; `Ficana`'s only namesake is a modern village in the Marche; `Fidenae`
offers a museum case of human remains, which is not what a place term should show; and `Latial_culture`
is the Vulci case above. The seven that shipped divide into **sites** — the Thirteen Altars at Lavinium,
a temple wall at Gabii, the ridge at Tusculum, the tufa wall of Ardea, the terraces of Fortuna Primigenia
at Praeneste — and **objects from a site**, an antefix from Satricum and a votive head from the Aricia
sanctuary. Where a Latin town survives only as a name in Pliny's list of extinct cities, there is nothing
to photograph, and that is a fact about the subject rather than a gap in the pass.

### N16's findings

**N16 — The hills of Rome and the city's topography (shipped, 6 of 12 pictured).** The Aventine, the
Caelian, the Esquiline, the Quirinal, the Viminal, the Janiculum, the Campus Martius, the Velabrum, the
Argiletum, the Comitium, the Regia and the Rostra.

**THE SPINE IS PLATNER AND ASHBY, AND IT IS ALREADY IN THE GLOSSARY UNDER A URL NOBODY HAD WRITTEN DOWN.**
*A Topographical Dictionary of Ancient Rome* (1929) is the standard reference for exactly this subject, it
is out of copyright, and it has an entry for every place a Rome batch will want. It is reachable **twice**:
on **Perseus** at text id `1999.04.0054` with lower-case hyphenated slugs (`aventinus-mons`,
`quirinalis-collis`), and on **LacusCurtius** under
`penelope.uchicago.edu/…/PLATOP*/<Entry_Name>.html`. `Cloaca_Maxima` was already citing the LacusCurtius
copy, which is the form to follow, because **LacusCurtius states the page range on the page itself** —
"Article on pp134‑137" — so a Chicago citation gets its page numbers for free where the Perseus copy shows
none.

**THE TWO COPIES DO NOT HOLD THE SAME ENTRIES, AND THE SLUGS ARE NOT PREDICTABLE.** LacusCurtius has not
transcribed AVENTINUS MONS at all — its `A.html` index page is a stub marked NOTYET — so `Aventine_Hill`
is cited to the Perseus copy while its eleven siblings are cited to LacusCurtius. And the LacusCurtius
slug is the entry's own heading with the case it happens to carry: `Caelius_Mons` and `Esquiliae` resolve,
`Aventinus_Mons` and `Quirinalis_collis` 404, while `Quirinalis`, `Viminalis` and `Janiculum` do — the
Latin `Ianiculum` does not. **Probe the slug; do not derive it.**

**THE SECOND SOURCE IS LIVY FOR SEVEN OF THE TWELVE, AND FOUR CHAPTERS CARRY ALL SEVEN.** Livy 1.30 adds
the Caelian, 1.33 the Aventine and the Janiculum, 1.44 the Quirinal, the Viminal, the Esquiline **and** the
Campus Martius census muster, and 1.36 puts the statue of Attus Navius in the Comitium. That is N15's
finding holding at one remove: for early Rome one ancient narrative and one reference work between them
carry a batch, and the work is choosing which chapter rather than hunting a source per term.

**BUT ROBERTS DOES NOT TRANSLATE `ARGILETUM`, AND THE PAGE STILL LOOKS RIGHT.** Platner cites Livy 1.19.2
for the Argiletum, and Perseus's Roberts translation of that very sentence renders *ad infimum Argiletum*
as "at the foot of the Aventine" — so a citation placed on Platner's authority would have pointed a reader
at a page that does not contain the word, on a URL that answers 200 with the right chapter. **When a
reference work cites an ancient passage, grep the translation you are actually citing for the term before
citing it.** The Argiletum's second source is Martial 1.3 instead, whose *Argiletanas … tabernas* is the
epigram Platner cites for the street's shops.

**THREE PERSEUS FAILURE MODES, ALL 200, AND THEY ARE DIFFERENT SIZES.** A wrong dictionary entry slug
serves the **1,877-byte** page N13 recorded (`argiletum-geo`, `velabrum-geo` — neither exists in Smith's
*Geography*). A wrong TEXT id serves a **66,664-byte** "We're sorry, but we were unable to find a document
matching your query" page, which is large enough to pass any byte-count sanity check (`1999.02.0161` for
Livy's Latin, `2008.01.0461` for an English Martial). And a rapid sequence of legitimate requests is
refused with a **275-byte 429**, which clears with 12-second gaps. Three sizes, one status code: **check
the body, not the code, and not the length alone.** Plutarch's Lives are one text id per Life and the ids
are not sequential by subject — `2008.01.0063` is *Solon* and `2008.01.0065` is *Tiberius Gracchus*, so
*Numa* was never found and the `Regia`'s second source is Smith's Antiquities entry instead.

**THE OWNERSHIP PROBLEM WAS INSIDE THE BATCH AND IT WAS THE SERVIUS SENTENCE.** Four terms cite Livy 1.44
and three of them opened by narrating the same addition, which measured as shared eight-word runs between
`Esquiline_Hill`, `Quirinal_Hill` and `Viminal_Hill`. Assigning ownership fixed it in one pass — the
Quirinal owns the addition itself, the Esquiline owns Servius *living* on it, the Viminal owns being
named with the Quirinal — and a second run ("of the traditional seven hills of Rome") was Platner's own
formula repeated verbatim in two first sentences. **When several terms in a batch share one chapter,
decide who owns which clause before drafting, not after.**

**A HILL INSIDE A MODERN CITY HAS ALMOST NO HONEST PICTURE, AND THAT IS WHY THIS BATCH SHIPS SIX.** Every
one of Rome's hills is built over, so what Commons offers is the buildings standing on it rather than the
hill: the Quirinal returns a telephoto of rooftops with the palace tower among them, the Caelian a hazy
panorama of umbrella pines, the Esquiline a Villa Giulia ceiling in which the hill is a small inset panel,
the Janiculum a view over twentieth-century apartment blocks with a green ridge along the top edge. All
were looked at and all were refused. **The one that worked is the one where the hill itself is the
subject**: Piranesi's *Veduta degli avanzi di antiche fabbriche alle falde dell'Aventino*, which is about
the Aventine rising above the Marmorata. The Forum terms have no such difficulty — the Regia, the Rostra,
the Comitium and the ground under the Colonnacce are all excavated and all photographed.

**AND ONE CANDIDATE WAS REFUSED FOR BEING POSSIBLY THE WRONG HILL.** `Caelian Hill from Aventine Hill.jpg`
is titled for the Caelian, but its foreground is plainly the floor of the Circus Maximus and the wooded
ridge behind it could as easily be the Palatine, which `Palatine_Hill` already illustrates from almost the
same viewpoint. A title is a claim by an uploader, not a fact; where the picture cannot be told apart from
one of a neighbouring subject, it is not usable. Two more were refused for what was IN the frame rather
than for the subject — a Rostra shot carrying a burnt-in camera date stamp, and a Curia façade with a
coach party filling the lower fifth.

### N15's findings

**N15 — Rome's foundation and its earliest institutions (shipped, 8 of 12 pictured).** Rhea Silvia,
Numitor, the Lupercal, Quirites, the Roman Senate, the curia, the pontifex maximus, the Vestal Virgin,
the lictor, the interrex, the auspices, the Roman dictator.

**THE BATCH'S SOURCE SPINE IS TWO WORKS AND ONLY TWO, AND THAT IS THE FINDING TO CARRY INTO N16–N20.**
Every one of the twenty-four citations is either a chapter of **Livy** or an entry in **Smith's
*Dictionary of Greek and Roman Antiquities***, both on Perseus, both openable, both free. Where the
Aegean batches needed a new work per term — N7 recorded fifteen of thirty-two works new, and N13 and
N14 went further afield still — early Rome is a subject where one ancient narrative and one
19th-century reference work between them carry a whole batch. The reason is structural: these terms are
*Roman institutions described by Romans*, so the ancient text states the fact and the dictionary states
the office. **Reach for Livy and Smith first for anything in N16–N19**, and only go looking when the
subject is archaeological rather than institutional.

**A SMITH ENTRY MAY BE A CROSS-REFERENCE STUB, AND IT ANSWERS 200 WITH REAL CONTENT.** N13 recorded
that a wrong Smith slug serves a 1,877-byte error page, which is easy to spot. This is the subtler
failure: `quirites-cn` and `auspicium-cn` are *real entries* that consist of nothing but a pointer —
"QUIRITES, QUIRITIUM JUS. [JUS]" and "AUSPICIUM [AUGUR]" — so the fetch succeeds, the page is large,
and the citation would name a work that says nothing about the claim. **Grep the fetched entry for a
sentence, not just for a status code.** `Quirites` was re-sourced to Livy 1.13 plus Smith's CURIA.

**AND THE STUB DECIDED WHICH TWELFTH TERM WAS WRITTEN.** `Augur` was on the list and was dropped,
because with `auspicium-cn` a stub both `Augur` and `Auspices` would have rested on the same AUGUR
entry — two terms citing one work for two different definitions, which is the shape L10 recorded as
duplication that cannot be deleted. `Vestal_Virgin` took the slot instead and has its own entry.

**THE BARE SURFACE `dictator` WAS MEASURED AND REFUSED; THE KEY IS `Roman_dictator`.** This is the
`Boreal` case in a form the existing rule did not quite cover — not an everyday word that happens to
be capitalised differently, but one whose ancient and modern senses are both lowercase, so
`caseSensitive` cannot separate them. Measured over the shipped corpus: the singular **dictator** is
Roman in all seven of its occurrences, and the plural **dictators**, which `pluralForms` would register
automatically, is *modern in six of its seven* — `gw-006` Nigeria, `gw-015` DR Congo, `gw-022`
Tanzania, `gw-026` Kenya, `gw-030` Sudan and `gw-031` Uganda all say "ruled by dictators or military
juntas for decades". Seven right links against six wrong ones is not a trade worth making, and the
wrong side is the side that will grow: Russia, the Second World War, China and the United States are
all planned collections that will use the word in its modern sense. So the key follows the
`Roman_Senate` precedent set earlier in the same batch — a qualified head word, an alias of "Roman
dictator", and **no bare surface at all**, which means the term auto-links nowhere today and is
reachable from the glossary page and the search. **A term that links to nothing is better than one that
links to the wrong century.**

**`Auspices` WAS MEASURED THE SAME WAY AND KEPT, AND THE ASYMMETRY IS THE POINT.** Its bare surface is
Roman in six places and modern in exactly one — `gw-155` Timor-Leste, "a popular referendum held under
United Nations auspices" — and that one sits in a *finished* collection, where the modern "dictators"
sit in collections barely begun. The balance decides it, not the mere existence of a modern sense.
The one mis-link is recorded here rather than fixed, because `check-gloss-links.js` cannot see it:
that checker compares a card's geography tags against the term's, and `Auspices` carries none.

**`Roman_Senate` LIKEWISE TAKES NO BARE "Senate" ALIAS.** The word splits three ways in the corpus —
three Rome cards, five in *The world* and five in the United States geography deck — because the
geography collections use it of modern legislatures.

**FOUR TERMS SHIP WITHOUT A PICTURE AND EACH REFUSAL IS DIFFERENT.** `Numitor` and `Interrex` have no
Commons category of the right subject at all — the searches return a US Navy repair ship, a 1720 Walsh
opera score, four skipper butterflies and a series of Polish primates who served as interrex. `Curia`
has candidates and none of them is the term's subject: the Curia Iulia is the *senate house*, and the
entry is about the thirty divisions of the citizen body, so a photograph of it would illustrate a
different curia from the one being defined. `Quirites` was offered the **Togatus Barberini**, which is
the canonical statue of a Roman in the toga and was still refused — its subject is the *imagines*, the
ancestral portrait busts the figure carries, which is a claim about patrician descent rather than about
citizens in their civil capacity, and `Patrician` already carries its own picture.

**THE EIGHT THAT DID SHIP WERE FOUND BY CATEGORY, NEVER BY NAME.** `add-glossary.js`'s own name-match
suggestions were wrong for nearly every term in this batch — Charlie Chaplin's *The Great Dictator* for
`Roman_dictator`, the minesweeper USS *Augury* for `Auspices`, five plates of a Handel-era opera for
`Numitor`, and five paintings by the 16th-century Neapolitan **Francesco Curia** for `Curia` — which is
the "suggest, never install" rule earning its keep in a single run. Searching Commons *categories*
first (`cats.js` against namespace 14) then listing that category's files produced a right answer for
every subject that had one, and two of them are exact: `Category:Mattei sarcophagus of Mars and Rhea
Silvia` gives an ancient relief of the batch's first term, and **Bernhard Rode's 1768 engraving *Ein
Augur*** carries a Commons description that is the `Auspices` entry's own third sentence — "An augur
stands behind the covered body of Numa Pompilius at an auspicium ceremony to look at the sign from the
birds".

**AND CHECK WHAT THE SIBLING TERMS ALREADY USE BEFORE CHOOSING.** `Fasces` already carries the Verona
lictor relief and `Sabines` already carries *The Intervention of the Sabine Women*, so `Lictor` took a
bronze statuette instead and the Sabine-peace route was closed to `Quirites` before it was tried. Read
`GLOSSARY_IMAGES` for the neighbours at the same time as reading their prose for duplication.

**PERSEUS RATE-LIMITS A RAPID SEQUENCE WITH A 275-BYTE 429.** Verifying nineteen citation URLs back to
back had seven of them refused; the same seven answered with 12-second gaps. It is not a dead slug and
it is not a wrong document — check the byte count before rewriting a citation.

### N14's findings

**N14 — Materials, alloys and the sciences that source them (shipped, 10 of 12 pictured).** Limestone,
sandstone, granite, poros stone, provenance, faience, carnelian, smelting, slag, alloy, lead isotope
analysis, X-ray fluorescence.

**N9'S DEFERRED *POROS STONE* IS CLEARED, AND THE MINERALOGICAL SECOND SOURCE SAYS THE TERM HAS NO
MINERALOGY.** N9 sent it here because "a mineralogical second source can be found for it"; the source
found is de Vals and Moretti's survey of the Gulf of Corinth in *Comptes Rendus Géoscience*, and what
it says is that pôros "lack[s] geological meaning" and that they decline to use the word — covering
recently consolidated sediments of medium to low density, usually not conglomerates, though the finest
of those are called poros too. **A deferral can be closed by a source that refuses the question rather
than answering it**, and that refusal is the most interesting thing the term has to say.

**THE SHELF FOR A MATERIALS BATCH IS PMC, USGS AND THE DIAMOND OA JOURNALS — AND MDPI IS SHUT.** Europe
PMC's REST API (`ebi.ac.uk/europepmc/webservices/rest/search?query=…AND OPEN_ACCESS:Y AND IN_EPMC:Y`)
is the right instrument here: it is scriptable, it reports hit counts, and it found open papers for
carnelian, faience, slag, bronze alloys, lead isotopes and XRF in a few minutes. **`usgs.gov` answers
here** (P6 recorded it 403; it is 200 now) and its FAQ pages define the rock classes plainly. But
**`mdpi.com` serves its ARTICLE pages as a 2,208-byte Google-Tag-Manager shell** while journal landing
pages come back at half a megabyte — so an MDPI paper is citable only through its PMC copy, which is
how both faience sources are cited.

**PMC HAS A reCAPTCHA WALL AND IT IS A CONSTANT 21,35x BYTES.** Four of eleven article fetches in one
burst came back as a 200-status page titled "Checking your browser - reCAPTCHA"; all four succeeded on
a retry twenty-five seconds later. That is the eighth variety of 200-status error document this pass
has recorded, and like `senate.gov`'s shell it has a near-constant size, so a size check catches it.
**Space PMC fetches out and check the byte count**, since the wall is indistinguishable from a paper
in the exit status.

**THE TWELFTH TERM CHANGED BECAUSE OF THE SOURCE RULE, NOT THE MEASUREMENT.** `Alabaster` has seven
corpus uses against `Provenance`'s four and would have won on the corpus measurement the batches are
picked by — but Europe PMC has exactly one open paper about it (the sourcing of Herod the Great's
calcite-alabaster bathtubs) and the USGS gypsum commodity summary is about wallboard. **`Alabaster` is
deferred with its one source recorded**; `Provenance` took the slot and is the better keystone for a
batch about the sciences that source materials. When the corpus measurement and the two-source bar
disagree, the bar decides.

**TWO CLAIMS WERE CAUGHT REACHING PAST THEIR SOURCE, AND ONE WAS A COMPOSED NAME.** The draft of
`Lead_isotope_analysis` credited the method's standing to "Noël Gale and Zofia Stos-Gale" — the paper
says only "Gale and Stos-Gale", and the given names were mine. N4's rule applied: the names came out
rather than being guessed at. The draft of `Granite` had the Unfinished Obelisk "still lying in its
bed", which is true and is not what the cited paper says; it says cracks, joint intersections and
mafic enclaves halted the extraction, so that is what the entry says now. And `Faience` was narrowed
from "the bowls of Ptolemaic Egypt" to the seven bowls from Tell Atrib the paper actually studied.

**TWO TERMS SHIP WITHOUT A PICTURE AND THE REASON IS THE SAME FOR BOTH: THE SUBJECT IS A PROCESS OR AN
INSTRUMENT, AND COMMONS PHOTOGRAPHS NEITHER.** For `Smelting` the candidates were a museum diorama
with painted toy figures and two Timna landscapes in which the smelting camp is invisible at a popup's
150px; for `X-ray_fluorescence`, a Mars rover's PIXL instrument, a cluttered out-of-focus sample-prep
bench, and PAS records of the brooches an analysis was run on but not of the analyser. **A term whose
subject is a technique is the hardest kind to illustrate**, and the honest outcome is to say so rather
than to hang a laboratory stock photograph on it. The ten that are pictured include two that solve the
same problem sideways: `Lead_isotope_analysis` shows galena, the ore the ratios are compared against,
and `Provenance` shows Melian obsidian, a material whose source is legible in its chemistry.

### N13's findings

**N13 — Cyprus and the Late Bronze Age east (shipped, all twelve pictured).** Enkomi, Alashiya,
Cypro-Minoan, Cape Gelidonya, the oxhide ingot, Kition, Salamis in Cyprus, Idalion, Paphos, Tyre,
Sidon, Byblos.

**THE SPINE IS <i>BRYN MAWR CLASSICAL REVIEW</i>, AND IT WAS ALREADY IN THE GLOSSARY.** Three shipped
terms — `Cypriot_city-kingdoms`, `Cypriot_syllabary`, `Arcadocypriot` — were cited to BMCR reviews, so
the reachable-host survey for Cyprus had been done and nobody had noticed it was a spine rather than a
one-off. A BMCR review states substantive claims in its own voice about the book under review, its
back catalogue reaches to 1990, it is fully open, and a search of it returns 16 to 20 hits for each of
Enkomi, Kition, Idalion, Kourion and Cypro-Minoan. **Search the glossary's own citations before
surveying hosts**: the batch before you may have found the answer and filed it under one term.

**AND THE SECOND SPINE IS THE ONE THE CARD PASS ALREADY USES.** Rutter's Lesson 22, *Aspects of
Mycenaean Trade*, carries Cape Gelidonya at nine mentions and oxhide ingots at eleven — the wreck's
depth, the ingots' size and weight, the stacking, the findspots from Sardinia to Syria, and the two
12th-century BCE Cypriot works on which such ingots are shown. **Rutter's course has no Cyprus lesson**
and Cyprus is nonetheless well covered, inside the trade and post-palatial lessons; the lesson titles
are the `<h2>` after the `<h1>` on each narrative page, not the page `<title>`, which is generic.

**A PARENTHETICAL KEY REALLY DOES STAND DOWN FROM ITS BARE NAME, AND THIS BATCH IS THE PROOF.**
`Salamis` has been the Saronic island since N7, which recorded that the Cypriot city would take a
disambiguated key when Cyprus was reached. `Salamis_(Cyprus)` ships with **no aliases at all** and
`check-gloss-links.js` reports the same 112 links to check by eye before and after the batch, with no
competing-surface finding — so the two keys coexist and the island keeps the surface. **A term that
wants the bare name has to ask for it with an alias**; nothing is inherited from the key.

**THE MOST USEFUL THING THE BATCH FOUND IS A DISAGREEMENT BETWEEN TWO GOOD SOURCES, TWICE.** Strabo
16.2.23 says Tyre is **wholly an island** joined to the mainland by Alexander's mound; Smith's TYRUS
says it was built **partly on an island and partly on the mainland**. Both are cited and the sentence
now says which says which, rather than blending them. And on Byblos the two contradict each other on
plain geography — Strabo's coastal order runs Byblos, then the river Adonis, where Smith puts Byblos
"a little S. of the Adonis" — so **the river was dropped from the locator entirely** and the entry
places the city between Sidon and Theoprosopon, which both carry. **Where two sources disagree, say
what both carry or attribute each half; never average them.**

**A CLAIM THAT IS IN THE MODERN SUMMARY IS NOT ALWAYS IN THE ANCIENT SECTION IT SUMMARISES.** Smith's
SIDON reports that "Strabo places it 400 stadia S. of Berytus, 200 N. of Tyre"; Strabo 16.2.22 gives
only the 400. A draft sentence marked the whole clause to Strabo and would have pointed at a section
that carries half of it. Likewise the draft had Salamis "reached from the mainland by a crossing of
seventy stadia" — Strabo's seventy stadia is the crossing of the ISLAND at its narrow point, not from
Anatolia. **Read the ancient passage itself for every figure a modern account attributes to it.**

**FIVE OF TWELVE FIRST-CHOICE PICTURES WERE REJECTED BY LOOKING**, and two of the five are new kinds.
**A MUSEUM CASE**: the best-named oxhide ingot photograph is a dim vitrine with reflections, two
ingots and a poster, unreadable small — replaced by a studio shot of a single ingot with its incised
mark showing. **A DIG PHOTOGRAPH**: the only Idalion site pictures on Commons are the Swedish Cyprus
Expedition's monochrome trench records of the 1920s, which are the excavation rather than the place —
`docs/history-focus-plan.md`'s rule in picture form — so the term takes the Idalion tablet instead.
The other three were an empty gravel foreground for Paphos, a lighthouse with a light leak for Cape
Gelidonya, and a crop too tight to place Byblos.

**A COMMONS FILE NAME WITH AN APOSTROPHE NEEDS THE SAME TREATMENT AS ONE WITH BRACKETS.** N12 recorded
percent-encoding `(js)` in a credit URL; this batch has `dall'acropoli di idalion` and a name carrying
double quotes, and `SRC_URL_RX` stops at `'`, `"` and `)` alike. Encode `%27`, `%22`, `%28`, `%29`
in the credit and check the page still resolves.

**AND THE 429 IS ON ORIGINAL FILE PATHS, NOT ON `upload.wikimedia.org` AS A WHOLE.** Eleven of the
twelve pictures verified first time on their `/commons/thumb/…/1920px-…` paths while the twelfth,
whose file is under 1920px and so takes the original `/commons/5/58/…` path, answered 429 through
thirty seconds of backoff and kept doing so. The same file's thumb path answered 200 at once. **When a
picture 429s, ask for a thumb before assuming the host is throttling you** — and note that a
`?utm_source=…` query rides on every URL the Commons API hands back and must be stripped, since no
shipped image in the glossary carries one.

### N12's findings

**N12 — Crete: sites and landscape (shipped, all twelve pictured).** Mount Ida, Mount Dikte, the
Psychro cave, Lasithi, Kommos, Praisos, Ierapetra, Mount Juktas, Amnisos, Gortyn, Archanes,
Anemospilia.

**THE TWO SPINES ARE SMITH'S <i>GEOGRAPHY</i> AND RUTTER'S <i>AEGEAN PREHISTORIC ARCHAEOLOGY</i>**,
and the division of labour is clean because the terms fall into two kinds. A place the ancient
authors describe — Gortyn, Ierapetra, Praisos, Ida, Dikte — is carried by Smith with Strabo,
Pausanias or Herodotus behind him; a place known only because it was dug — Anemospilia, Archanes,
Kommos, Amnisos, the Juktas peak sanctuary — is carried by Rutter's lessons. Six terms take one of
each, which is the shape to aim for: the ancient testimony for what the place was, the excavation
report for what is there.

**SMITH'S <i>GEOGRAPHY</i> HAS A CRETAN ENTRY FOR ALMOST EVERY NAME IN GREECE, AND THAT IS THE TRAP.**
N11 recorded that `arcadia-geo` is a town in Crete rather than the Peloponnesian region; one batch
later the same fault waited in the opposite direction — **`ida-geo` is Mount Ida in PHRYGIA**, the
mountain above Troy, not the Cretan one, which is `ide-geo`. `gortys-geo` is the Arcadian city and
`gortyn-geo` the Cretan. **Grep the fetched entry for a word the right place must contain** before
citing it; the headword alone settles nothing, and both wrong entries read perfectly.

**AND SMITH IS SOMETIMES CITING A SUPERSEDED IDENTIFICATION.** His DICTE entry equates Dicte with
Juktas, which was Evans's own early view and is not where the Diktaean cave or the mountain are now
placed. Smith is therefore NOT cited for Dikte's location; Strabo 10.4.12 is, which says only what it
says. A source open, authoritative and about the right name can still be arguing a case its own
century settled differently — read what the entry claims, not just that it exists.

**FIVE RUTTER LESSON TITLES IN THE DRAFT WERE COMPOSED RATHER THAN READ, AND THE AUDIT THAT FOLLOWED
FOUND FOUR ALREADY SHIPPED.** A lesson's title is long and its opening words are memorable, so a
citation written from memory ends at the colon and looks finished: "Lesson 14: Late Minoan Painting
and Other Representational Art" is really "…: Pottery, Frescoes, Steatite Vases, Ivories, and
Bronzes", and "Neopalatial Minoan Influence in the Aegean and Eastern Mediterranean" is really
"…and Eastern Mediterranean Worlds". Checked against the lessons index, **4 of the 218 Rutter
citations already in the glossary carried a truncated title** and were corrected in this batch.
`check-citations.js` cannot see this — Rutter has no DOI — so the check is the index page, and it
costs one fetch for a whole batch.

**THE SIBLING-DUPLICATION MEASURE PAID AGAIN, AND ITS TARGET WAS NOT IN THE BATCH.** `Archanes` shared
two eight-word runs with the shipped `Palaikastro`: both had been written from Rutter's house-tomb
typology and both were reciting it. Archanes was rebuilt around what it owns — the palatial building,
the Phourni cemetery and its Late Minoan IIIA tholos with its Treasury of Atreus parallel — and the
measure now reads 0. **Run the measure against the nearest EXISTING terms as well as within the
batch**; the term a new one duplicates is usually the one already written about the same subject.

**TWO CORRECTIONS THE SOURCES MADE TO THE DRAFT.** Anemospilia said three people died; Rutter says
four skeletons were found and three were killed by the collapse, the fourth being the youth on the
platform. And Gortyn's wall: **Smith says Ptolemy Philopator carried it eighty stadia and Strabo says
the same**, where an intermediate reading had it at eight — a figure that is defensible until it is
read beside the city's own ninety stadia from the sea. An unsourced isthmus width and a "gulf of
Mirabello" came out of `Ierapetra` for the same reason.

**HALF THE FIRST-CHOICE PICTURES WERE REJECTED BY LOOKING — SIX OF TWELVE**, against four of twelve in
N11, and the failures group into three kinds worth naming. **A SIGNBOARD**: the file named
`Praisos 1. Akropolis 01.jpg` is the site's entrance notices, and `Yuchtas top 9246337.JPG` is a gate
and a brown sign. **A MUSEUM CASE**: `Juktas 1.JPG` is offering tables from the peak sanctuary behind
glass in Heraklion — genuine material from the right place, and not a picture of the mountain.
**A DETAIL WHERE A VIEW WAS WANTED**: an odeon's brick piers in receding perspective for Gortyn, a
painted house front for Ierapetra, a distant hillside for Anemospilia. A fourth was the name in the
wrong place a third time — `Πάνω πόλη Κανλί Καστέλι - Γιούχτας` names the MUNICIPALITY of Juktas and
photographs a different mountain. The rule stands as the geography pass wrote it: **the search finds a
subject's pictures and cannot judge one.**

**A COMMONS FILE NAME WITH PARENTHESES IS STILL USABLE, PERCENT-ENCODED.** The best Psychro cave
picture is `Cave Dikti12(js).jpg`, and its description page URL would ship truncated at the `(`
through `SRC_URL_RX`; `File:Cave_Dikti12%28js%29.jpg` resolves and carries no bare bracket. Encode
the credit rather than settling for a worse picture — but check it resolves, since only the file
path is encodable this way.

### N11's findings

**N11 — Greek regions and islands (shipped, all twelve pictured).** Thrace, Paros, Thasos, Delos, Kea,
Siphnos, Chios, Kythera, Corcyra, Arcadia, Elis, Phocis.

**THE SPINE IS SMITH'S <i>DICTIONARY OF GREEK AND ROMAN GEOGRAPHY</i> (1854) ON PERSEUS**, which has an
entry for every region and island a Greek batch is likely to want and cites its ancient authorities line
by line, so it passes the plan's per-article encyclopedia test on every one of them. Perseus's text id is
`1999.04.0064` and the slugs take the LATIN head word with a `-geo` suffix — `cythera-geo`,
`thracia-geo`, `ceos-geo`, `corcyra-geo` — which is why a search for the modern name finds nothing. The
second source is the ancient author the entry itself points at, also on Perseus: Herodotus for Thrace,
Thasos, Siphnos and Kea, Thucydides for Delos, Chios, Kythera and Corcyra, Pausanias for Phocis, Strabo
for Elis. **Twelve terms, three works and one lexicon-shaped source: the research really is shared.**

**AND ITS ONE TRAP IS THAT `arcadia-geo` IS A TOWN IN CRETE.** The slug resolves, the entry is real, and
it is about a Cretan city that disputed Mount Ida's claim to be Zeus's birthplace — nothing to do with
the Peloponnesian region. Smith's Geography as digitised on Perseus has no second ARCADIA entry, so
Arcadia is the one term in the batch built on ancient authors alone (Strabo 8.8 and Pausanias 8.1, which
between them give the mountainous interior, Kyllene, the Azanes and Parrhasians, and the ring of coastal
peoples). **A resolving slug is not a verified subject** — read the entry's first line before citing it.

**THE TWELVE WERE MEASURED OUT OF THE CORPUS, as in N10**, and the measurement removed two candidates
that a list would have kept. **`Macedonia` was dropped** although it is the most-used un-keyed name in
the corpus (19 occurrences): those uses split between the ancient region in `gr-112` and `gr-169` and the
MODERN naming dispute in `gw-152`, so a `Macedonia` term would auto-link inside a sentence about
North Macedonia's recognition — the wrong link, in the one place where getting it wrong is a political
claim. `Macedon`, the alternative key, occurs zero times and would link nothing. It wants a deliberate
decision rather than a slot in a batch. **`Poros` was dropped** for the opposite reason: the
case-insensitive count of 8 was entirely *poros stone*, which N9 deferred to N14, and the island itself
never appears.

**Two of the twelve have a Bronze Age sibling already on the shelf and the split was decided before
drafting** — `Minoan_Kythera` owns the Cretan settlement at Kastri, `Kythera` the island; `Ayia_Irini`
owns the Bronze Age town, `Kea` the island. L9's eight-word-run measure over the batch plus its ten
nearest siblings (`Cyclades`, `Siphnian_Treasury`, `Euboea`, `Phylakopi`, `Krisa`, `Kalapodi` and the
rest) returns **0 shared runs between every pair**, which is what deciding ownership first buys.
`Siphnos` is the case that needed most care: `Siphnian_Treasury` already carries the mines, the "richest
of the islanders" and the tenth sent to Delphi, so the island term states the mines in its own register —
what they were worth, that the workings were faced in Parian marble, and Pausanias's story that the gods
drowned them when the tenth stopped coming. **"Siphnian" was refused as an alias** for the same reason:
the treasury owns that surface.

**SMITH MIS-CITES HERODOTUS ONCE IN THIS BATCH**, and it is the kind of error a second-hand citation
carries forward silently: the Kythera entry gives Demaratus' advice to Xerxes as "Hdt. 8.235", which is
7.235. Nothing was cited from it — Thucydides 4.53 carries the Judge of Kythera and the Athenian capture
instead — but **a reference read out of another work is a reference to check, not to copy.**

**The pictures are a region's landmark or its landscape, and four of twelve were rejected by looking.**
Two Paros marble-quarry photographs are dark cave mouths, one with a magenta cast, showing no marble at
all; the Arcadia candidate that ranked first is a shepherds' washing line in front of Mount Kyllini, so
the subject reads as laundry; a 6,000-pixel "Parikia harbour" is a row of modern motorboats. What
answered was the plainest thing in each case — the Nestos gorge for Thrace, the Terrace of the Lions for
Delos, the rock-cut Lion of Kea, Parnassus for Phocis, an Arcadian upland flooded into a karst lake.
**Four of the twelve are medieval or later monuments** (Ekatontapiliani, Nea Moni, Kastro, the castle at
Chora) and that is the honest answer for an island whose ancient remains are slight: the geography pass's
rule asks for the most significant landmark, not the most ancient one.

### N10's findings

**N10 — Greek vessel and object vocabulary (shipped, all twelve pictured).** Krater, kylix, hydria,
lekythos, alabastron, aryballos, skyphos, kantharos, pyxis, rhyton, olpe, oinochoe.

**THE TWELVE WERE CHOSEN BY MEASURING THE CORPUS, NOT BY LISTING THE SHAPES.** The plan names the
subject and the count and not the terms, so the list was derived by grepping every card and every
glossary description for vessel vocabulary: eleven of the twelve occur in shipped prose (krater in 9
cards, rhyton in 5, kylix, hydria, lekythos and alabastron in 2 each), and the twelfth, *oinochoe*, was
added because the olpe is a kind of it and because `Dipylon_oinochoe` was already an alias with no term
behind it. **A substring grep lies and the check is two minutes**: `pelike` appeared to occur in
`wh-004` and the word was *apelike*; `dinos` in `geo-018` was *dinosaur*. **And the corpus writes these
plurals in Greek** — rhyta 9, kraters 7, kylikes 5, lekythoi 5, pyxides 3, hydriae 3 — which
`pluralForms` cannot make from any of the singulars except *kraters*, so ten of the twelve needed an
alias to auto-link at all.

**`kotyle` was NOT made an alias of `Skyphos`, and reading the source is why.** The two are treated as
one shape often enough that the alias looked free; Walters distinguishes them outright — the skyphos
"is of the same type as the kotyle, but the body tapers below and has a higher foot, while the handles
are placed lower down and bent upwards" — so the alias would have pointed `rm-038`'s kotyle at a term
that is about a different cup. **N2's rule in a new dress: before adding a synonym alias, ask whether
the source treats the two names as the same thing.**

**The spine is one 1905 monograph, one lexicon and one university teaching site, and each does a
different job.** H. B. Walters's *History of Ancient Pottery* vol. 1 (archive.org, full OCR) has a
chapter — "Uses and Shapes of Greek Vases", pp. 131–201 — that describes every one of the twelve with a
page to itself, which is the artefact plan's rule paying again: where the modern synthesis is closed,
the standard older monograph is open and is often where the type name was fixed. **LSJ on Perseus
carries the Greek word**, which is what a first sentence defining a term wants and what no
archaeological description supplies. And **Rutter's Aegean site carries the Bronze Age half** — its own
Glossary defines krater, kylix, alabastron, kantharos, pyxis and rhyton out of Warren, Biers and
Pedley, and the lesson narratives carry the claims (the goblet becoming the kylix in LH IIIA, the
alabastron among the commonest LH IIIA2 tomb vases, kantharoi in the Shaft Graves' gold, the Marine
Style rhyta). **Walters is cited only for form and ancient testimony**, never for the parts he has been
overtaken on: his "the name aryballos has been used for a later variety of the lekythos" is not
repeated, and neither is his reading of the shape names as unfixable.

**PERSEUS SERVES A "NO DOCUMENT FOUND" PAGE WITH A 200**, which makes it the seventh variety of
200-status error document this project records. Two of the twelve headwords were composed from the
obvious beta code and both were wrong — ἀλάβαστρον is filed under **`a)la/bastos`**, and ῥυτόν has no
entry of its own but sits as sense II of **`r(uto/s3`** — so the saved "entry" for each was the error
page, and a URL check would have passed it. **Grep a fetched Perseus page for `unable to find a
document` before citing it.** Beta code with a breathing also has to be **percent-encoded**: `SRC_URL_RX`
stops at `)`, so a citation ending `entry=a)ru/ballos` would ship truncated, where `%29` is safe.

**The picture pass found the shape rather than the subject, and that is a different search.** A whole
vessel on a plain ground says what a shape is; a detail of its painting does not, and a name match
cannot tell them apart — the top-ranked krater candidate was a **Martian crater**, the first kantharos
was a close crop of the figures with both handles out of frame, and a "Kantharos" search returned an
Etruscan scarab. **The Walters Art Museum series is the answer for eight of the twelve**: it photographs
whole vessels on a plain ground, in the public domain, and its old monochrome plates show a profile
better than a colour three-quarter view in a display case does — the Nikosthenes eye-cup is the only
kylix found whose stem, bowl and both handles read at 150px.

**And a picture that contradicts the prose is a correction to the PROSE.** Every olpe photographed —
Attic, Protocorinthian, Etruscan — has a swelling ovoid body, where the draft said "almost cylindrical"
on Walters's authority. He is describing one Attic black-figure type rather than the shape at large, so
the sentence now says what the shape has (a tall handle, no marked neck, a plain or trefoil lip) and
gives the cylindrical form as the Attic case it is. **Look at the picture before trusting the sentence,
not only the other way round.**

**One thing outside the batch and left alone:** the whole-corpus split audit reports `Santa_Fe` as **two
sentences rather than three**, its second joined by a semicolon. It is a real breach of the
three-sentence rule from an earlier pass, not a splitter gap, and re-cutting cited prose is its own
small job.

### N9's findings

**N9 shipped nine terms rather than twelve.** *Poros stone* was moved to N14: it has one usable
source and no second — Vitruvius II.7 is about Roman quarries and never names it, Pausanias 5.10
renders πώρου λίθου as "native stone", and none of Sturgis's three volumes carries an entry — so
it belongs in the materials batch where a mineralogical second source can be found for it.
*Askos*, *aniconism*, *Athena Polias* and *Artemis Eileithyia* went with it into
a later sculpture-and-cult batch, for the same reason: they are cult and sculpture vocabulary
rather than architecture, and the shelf this batch assembled does not cover them. **`Kore` and
`Kouros` were deferred with them and have since been written on main**, so four remain rather than
six — check the shipped glossary before reopening a deferral, since another branch may have closed
it. The leads not yet tried on those four are LSJ ἀσκός on Perseus, Pausanias I.18.5 and I.26.6/I.27.1, Frazer's
commentary on Pausanias (`in.ernet.dli.2015.282571`) and Jane Harrison's *Mythology and Monuments
of Ancient Athens* (1890).

**`insource:` regex search, on the PLURAL, is what finds a picture whose subject is a technical
term.** Keyword search for the Knossos *kouloures* failed on every phrasing tried — "Knossos
kouloura", "Knossos circular pit", "Knossos granary pit", "Knossos silo" — because uploaders do
not describe a pit that way, and the singular `insource:/[Kk]ouloura/` returns Greek bread,
koulourakia biscuits and Corfu beaches. `insource:/[Kk]ouloures/` returned the pits at once. It is
"search the vocabulary, not the subject" met on Commons rather than in a book.

**Two terms ship with no picture and it is not for want of looking.** *Shipshed* and *plinth* each
defeated six distinct strategies: `insource:/[Ss]hip.?shed/` returns airship and Zeppelin sheds,
`insource:/neosoikoi|neoria|νεώσοικ/` a Piraeus plan and a Venetian arsenal at Chania, category
searches for Zea and Mounichia only `Category:Mikrolimano harbour`, `insource:/[Zz]ea/
insource:/shed/` New Zealand woolsheds, `insource:/plinth/ insource:/[Ii]onic/` American
neoclassical libraries and state capitols, and keyword search for an Ionic column base scanned
books. A plinth is also the hardest kind of subject to photograph *as itself* — it is the part of
a base nobody frames alone.

**A merge can supersede a batch's own work, and the collision may not be textual.** N9's *Doric
order*, *Ionic order* and *Aeolic order* were written here and independently on main while this
branch was open; git's union merge sees two appends and keeps both, so the literal ended with two
`Doric_order` keys — and **a duplicate key in a JS object literal silently keeps the LAST one**,
which meant main's had already won without a word. Mine were dropped from all four tables rather
than reconciled: main's are the better descriptions and were already pictured. The third is the
one no diff could have found — my *Aeolic order* and main's *Aeolic capital* are the same subject
under two keys, and main's is the better name, the Aeolic not being properly an order at all. It
carries "Aeolic order" as an alias so the name this branch introduced the concept under still
resolves. **Sweep the merged literal for duplicate keys**, and read the two sides' key lists for
synonyms as well.

**A record can be true and misleading, again.** `Knossos in Crete west court.jpg` is correctly
titled and shows west-court paving and raised causeways with no kouloura in frame; `Knossos
Westfassade 01.jpg` is a tree and the west façade; `West court and theatral area in Phaistos.jpg`
is the theatral-area steps. All three were rejected by LOOKING at them, which no metadata field
would have prompted.
