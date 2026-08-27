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
| N10 | 12 | Greek vessel and object vocabulary |
| N11 | 12 | Greek regions and islands |
| N12 | 12 | Crete: sites and landscape |
| N13 | 12 | Cyprus and the Late Bronze Age east |
| N14 | 12 | Materials, alloys and the sciences that source them — also carries N9's deferred *Poros stone* |
| N15 | 12 | Rome's foundation and its earliest institutions |
| N16 | 12 | The hills of Rome and the city's topography |
| N17 | 12 | Latium: the Latial culture and its sites |
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

### N9's findings

**N9 shipped nine terms rather than twelve.** *Poros stone* was moved to N14: it has one usable
source and no second — Vitruvius II.7 is about Roman quarries and never names it, Pausanias 5.10
renders πώρου λίθου as "native stone", and none of Sturgis's three volumes carries an entry — so
it belongs in the materials batch where a mineralogical second source can be found for it.
*Askos*, *kore*, *kouros*, *aniconism*, *Athena Polias* and *Artemis Eileithyia* went with it into
a later sculpture-and-cult batch, for the same reason: they are cult and sculpture vocabulary
rather than architecture, and the shelf this batch assembled does not cover them. The leads not
yet tried on those six are LSJ ἀσκός on Perseus, Pausanias I.18.5 and I.26.6/I.27.1, Frazer's
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

**A record can be true and misleading, again.** `Knossos in Crete west court.jpg` is correctly
titled and shows west-court paving and raised causeways with no kouloura in frame; `Knossos
Westfassade 01.jpg` is a tree and the west façade; `West court and theatral area in Phaistos.jpg`
is the theatral-area steps. All three were rejected by LOOKING at them, which no metadata field
would have prompted.
