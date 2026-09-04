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
applies), `ascsa.edu.gr` (no answer), `ich.unesco.org` (a CAPTCHA served with a 200, on element and
state pages alike), `vocab.getty.edu` (403 — the TGN's own web interface at `getty.edu/vow/` works).
**`whc.unesco.org` HAS REOPENED** — it was recorded 403 here and worked around for the whole pass,
and it now answers on the state-party page, on every property and on the Tentative List; so has
`main.un.org/securitycouncil/`, which the citation pass recorded as a blocked 200. **Re-probe a host
this list calls shut before working around it.**

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
| N18 | 12 | The Italic peoples — Samnites, Sabines, Umbrians — **shipped**, 6 of 12 pictured |
| N19 | 12 | Umbria and its sanctuaries — **shipped**, 10 of 12 pictured |
| N20 | 12 | Italian landscape and geology — **shipped**, 11 of 12 pictured |
| N21 | 12 | Tanzania, the Serengeti and African mammal groups — **shipped**, all twelve pictured |
| N22 | 12 | Olduvai beds, palaeoanthropology's institutions and dating methods — **shipped**, 11 of 12 pictured |
| N23 | 12 | Amarna and Egypt — **shipped**, all twelve pictured |
| N24 | 12 | **The Italian provinces I** — the twelve a World Heritage property names twice — **shipped**, all twelve pictured |
| N25 | 12 | **The international order** — the institutions a country term names, and the principle they rest on — **shipped**, 11 of 12 pictured |
| N26 | 12 | **The vocabulary of diplomacy** — the words on nearly every card of the World collection — **shipped**, 9 of 12 pictured |
| N27 | 12 | **The forms of government** — the words every collection uses about who rules — **shipped**, 8 of 12 pictured |
| N28–N35 | ~95 | the remaining Italian provinces — **blocked on sourcing**, see N24's findings |

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

### N27's findings

**N27 — the forms of government (shipped, 8 of 12 pictured).** The twelve are `Constitution`, `Council`,
`Colony`, `Republic`, `Senate`, `Monarchy`, `Tyranny`, `Democracy`, `Citizenship`, `Magistrate`,
`Aristocracy` and `Oligarchy`, measured out of the corpus like the three batches before them and with
weights that dwarf most of the pass: `constitution` 152, `council` 118, `colony` 108, `republic` 66,
`senate` 53, `monarchy` 41, `tyranny` 31, `democracy` 25, `citizenship` 20, `magistrate` 20,
`aristocracy` 13, `oligarchy` 8. **These are the words EVERY collection uses**, not one deck's
vocabulary — Greece, Rome, China, Russia, the United States and the World collection all describe who
holds power, and none of them had a term to click.

**THE SPINE IS THE CANON PLUS AN ENCYCLOPEDIA THAT CITES ITS SOURCES, AND BOTH ARE OPEN.** Aristotle's
*Politics*, Polybius VI and Herodotus III are on **Perseus** — a stable citation by book and Bekker or
chapter number, in an out-of-copyright translation, which is exactly what the philosophy plan's rule
about standard divisions asks for. The **Stanford Encyclopedia of Philosophy** carries the modern half,
and passes the pass's own encyclopedia test outright, every entry ending in a bibliography. Aristotle
3.1279a–b gives the sixfold classification in one page — kingship, aristocracy and constitutional
government against tyranny, oligarchy and democracy, sorted by how many rule and in whose interest —
which carries six of the twelve on its own.

**THE SEP TOLD US NOT TO CITE ONE OF ITS OWN ENTRIES, AND THAT IS THE FINDING TO CARRY.** CLAUDE.md
already says to read `plato.stanford.edu/cgi-bin/encyclopedia/archinfo.cgi?entry=<slug>` for the exact
title, authors and archive edition rather than composing them. It says something else too: for
`republicanism` it answers that **the latest version "is not yet archived and may change before it is
archived in the Fall 2026 edition. You should wait for the Fall 2026 archived edition of the
Encyclopedia to quote or cite this version."** A source can tell you it is not yet citable, and only the
metadata page says so — the entry itself reads exactly like the other four. `Republic` took Polybius and
Aristotle instead. **Ask the archinfo page before citing an SEP entry, not only for the edition but for
whether there is one.**

**Its second finding is the keyword verifier catching a claim BEFORE it shipped.** The `Colony` draft
said the practice was "as old as recorded history while the systematic European form dates from the 15th
century" — plausible, conventional, and **not what the cited entry says**. Kohn and Reddy's difficulty is
that the word is used as a synonym for imperialism, and their distinction is that colonialism names
places held by a large population of permanent settlers while imperialism names a territory administered
without much settlement. The sentence was rewritten to that. **N4 caught a fabricated author this way;
this is the same check catching a fabricated CLAIM**, and it costs one line in `keywords.json` per
citation.

**And a picture named after a building can be a 3D model of it.** `File:Curia Julia.jpg` is a computer
reconstruction, rendered against a flat sand-coloured plane — the correct subject, the correct name, and
not a photograph of anything. It was rejected by looking, which is the only thing that catches it; a
real photograph of the Curia took its place. Add it to the family the geography pass records: after a
picture from orbit, a map, a montage and the right name in the wrong place, **a rendering**.

**Four terms ship without a picture.** `Republic`, `Aristocracy` and `Oligarchy` are forms of rule rather
than things, and any photograph of a particular republic or ruling class illustrates that instance and
quietly asserts it is typical; `Colony` is worse, since every candidate was a colonial-era view whose
framing is itself the argument the term is about. The eight that are pictured are all objects or places
the concept can be shown BY — a written constitution, a council house, a senate house, a crown, the
tyrant-slayers, the speaker's platform on the Pnyx, a bronze grant of citizenship, and a lictor with the
fasces.

### N26's findings

**N26 — the vocabulary of diplomacy (shipped, 9 of 12 pictured).** The twelve are `Embassy`, `Legation`,
`Ambassador`, `Envoy`, `Chargé_d'affaires`, `Diplomatic_relations`, `Accreditation`,
`Letter_of_credence`, `Consulate`, `Consul_general`, `Exequatur` and `Treaty` — measured out of the
corpus as N23 and N25 were, and the weights are large: `embassy` 197, `treaty` 157, `credentials` 120,
`diplomatic relations` 115, `ambassador` 103, `legation` 86, `consulate` 66, `chargé d'affaires` 61,
`accredited` 41, `consul general` 28, `envoy` 25. **N25 defined the bodies a country card names and this
defines the words it uses**, both out of the same fact: 470 cards of the World collection are written
from the Office of the Historian's recognition guide, in that guide's own vocabulary, and a reader met
`chargé d'affaires ad interim` sixty-one times with nothing to click.

**THE BATCH IS BUILT ON PRIMARY LAW, AND `legal.un.org` SERVES IT AS PDFs.** The Vienna Conventions on
Diplomatic Relations (1961), on Consular Relations (1963) and on the Law of Treaties (1969), and the 1975
convention on representation at international organisations, are all open at
`legal.un.org/ilc/texts/instruments/english/conventions/`. **They are PDFs, and nothing in this sandbox
reads a PDF** — no `pdftotext`, no `pypdf`, no PIL. A 30-line extractor (inflate every stream, take the
text-showing operators) reads all four cleanly, and is the thing to reach for the next time a source is
a PDF rather than treating the format as a wall. Its output mangles accented characters and curly
quotes, which does not matter for reading and would matter for quoting.

**AND THE SECOND SOURCE FOR EACH IS A NAMED SCHOLARLY ESSAY ON THE SAME HOST.** The UN's Audiovisual
Library of International Law publishes an **introductory note** for each instrument, by a named author —
Eileen Denza on the diplomatic convention, Juan Manuel Gómez Robledo on the consular one, Karl Zemanek
on the law of treaties — and each is a proper historical essay: Denza carries the Congress of Westphalia
in 1648, the 1815 Regulation of the Congress of Vienna, Grotius, Bynkershoek and Vattel, and reciprocity
as the sanction behind diplomatic law; Gómez Robledo carries the medieval consul, Colbert's *Ordonnance
de la Marine* of 1681 and the League of Nations' failed attempt; Zemanek carries the twenty-year
codification and its four rapporteurs. **A convention plus its introductory note is a two-source pair
that satisfies the bar without straining**, and it is the shape to reuse for any term of international
law.

**ITS FINDING IS A REFUSAL: `Diplomatic_recognition` WAS MEASURED, RESEARCHED AND LEFT OUT.** The word
`recognition` is in 102 shipped cards and terms — the second-largest surface in the family, and the one
the whole World collection turns on, since the guide it is written from is *A Guide to the United States'
History of Recognition, Diplomatic, and Consular Relations*. **Nothing openable here defines it.** The
Vienna Convention deliberately does not: its Article 2 makes the establishment of relations a matter of
mutual consent and says nothing about recognising a state, which is exactly why a state can recognise
another and keep no mission there. Denza's note never uses the word. The ILC's *Fundamental Rights and
Duties of States* summary uses it only in another sense. `history.state.gov`'s own front matter lists its
countries and defines nothing. **A term whose subject an instrument avoids on purpose cannot be carried
by that instrument**, and the honest outcome is a deferral rather than two citations that do not say it.
It also could not have taken the obvious alias: `recognition` is an ordinary English word in this corpus
— *a recognition that hardship is necessary*, *social recognition*, *recognition rates* on oracle-bone
variants, the recognition that the Odyssey turns on — so even a shipped term would have had to go
without it.

**Three terms ship without a picture, for one reason each.** `Envoy` and `Chargé_d'affaires` are ranks
rather than things, and a photograph of a particular holder illustrates the person and not the office;
`Diplomatic_relations` is a relation between states, and the only candidates were a parties map, which
this pass refuses. The nine that are pictured include four documents that are the terms themselves —
Edward VII's 1905 letter of credence raising his mission at Tokyo to an embassy, Roosevelt's 1938
exequatur for the French consul general at New York, the authentication page of the North Atlantic
Treaty, and the 1815 Congress of Vienna, whose Regulation settled the classes `Ambassador` describes.
**Where a term is an instrument, the picture is the instrument**; that is a better answer than a
building, and Commons has more of them than the search terms suggest.

### N25's findings

**N25 — the international order (shipped, 11 of 12 pictured).** The twelve are `United_Nations`,
`United_Nations_General_Assembly`, `United_Nations_Security_Council`, `World_Trade_Organization`,
`General_Agreement_on_Tariffs_and_Trade`, `World_Bank`, `European_Union`, `Commonwealth_of_Nations`,
`NATO`, `World_Heritage_Site`, `United_Nations_trust_territories` and `Sovereignty`.

**IT IS NOT THE BATCH THE PLAN NAMED, BECAUSE THE PLAN'S NEXT BATCH IS BLOCKED AND THE CORPUS HAD A
LOUDER ANSWER.** N24 established that the remaining Italian provinces cannot be written at the bar from
here, so the plan's own running order had nothing unblocked left in it. The batch was derived instead by
N23's method — measure the shipped cards and terms for the surfaces that carry no entry — and the
measurement is not close: **`United Nations` is named in 314 of them**, against N23's `Nile` at 48, which
was the largest the expansion had met until now. Behind it come `World Trade Organization` at 151,
`World Bank` at 130, `General Agreement on Tariffs and Trade` at 122, `General Assembly` at 105,
`Commonwealth` at 79, `European Union` at 58 and `Security Council` at 50. **The World geography
collection is what produces those numbers**: 470 of its cards state when a country joined the United
Nations and what it belongs to, so the vocabulary of the international order was the single most-used
and least-defined thing on the site.

**AN UNBLOCKING ATTEMPT WAS MADE FIRST AND IS RECORDED RATHER THAN SKIPPED.** N24 listed three routes to
the provinces and all three were probed. A **reachable NUTS classification**: Eurostat's RAMON
nomenclature server is 404 and the NUTS overview page is an overview, naming no province. **ISTAT's
*Annuario statistico italiano* as a citable PDF**: the file path is 404 and `istat.it` still publishes no
per-province page. **A per-province spine like the Commonwealth's Key Facts**: the nearest thing that
answers is the **Getty Thesaurus of Geographic Names**, whose web interface at
`getty.edu/vow/TGNServlet` works (`vocab.getty.edu` is 403) and whose full record gives a province's
hierarchy, coordinates, name variants and — the plan's own test — its **Sources and Contributors**. It
passes the encyclopedia rule where Treccani failed it. **What it cannot do is carry a SENTENCE**: a TGN
record states that Bergamo is a second-level subdivision of Lombardy and nothing else, which is the
first sentence of the term and the one sentence that must go unmarked, so it makes a second citation
that stands behind no claim. **A source that confirms the definition is not a source for the term**, and
that is why the provinces are still blocked with the gazetteer in hand.

**TWO HOSTS THE PASS HAD WRITTEN OFF ARE OPEN, WHICH MAKES THE RE-PROBE RULE A STANDING ONE.** N24 found
`whc.unesco.org` alive after the plan had recorded it 403 for the whole pass; N25 found
**`main.un.org/securitycouncil/` serving a real 181 KB page**, where C0 of the citation pass recorded
`un.org/securitycouncil/*` as a CloudFront "Request blocked" document with a 200 status. It is a
different HOST for the same section, which is the shape to try: **when a path on `www.` is walled, try
the application host before concluding the section is shut.** Set against that, `ich.unesco.org` — the
obvious sibling of the World Heritage list, and a per-place spine for the blocked provinces — is a
**CAPTCHA wall served with a 200**, on its element pages and its state pages alike, which is a sixth
variety of 200-status non-content document after C0's two and P3's, P7's and N24's.

**ITS OWN FINDING IS THAT L10's RE-REGISTERING RULE APPLIES TO PRIMARY INSTRUMENTS TOO.** Five of the
twelve rest on the UN Charter, and the eight-word-run measure found exactly one pair —
`United_Nations` and `Sovereignty`, both quoting *the sovereign equality of all its Members*, because
both are entitled to it: the Charter says it about the organisation and it is the definition of the
principle. Deleting the clause from either is wrong, so each states it in the register it owns — the
organisation "rests on" it, the principle appears as its members "standing as sovereign equals" — which
took the pair to 0 with no marker lost. **Where a batch shares one founding document, expect the run
measure to fire on the document's own words**, and re-register rather than cut.

**Two smaller things.** The alias rule fired again, in its case-sensitivity form: `Commonwealth` is the
association in 77 of the 79 places the corpus uses the word and an ordinary noun in the other two
(`rm-025`'s Etruscan *rasnal*, `gw-042`'s Polish-Lithuanian commonwealth), so the alias ships with
`caseSensitive: true` — the capital letter is exactly the distinction. And **`General_Agreement_on_Tariffs_and_Trade`
ships without a picture**: it was an agreement rather than a place, its Geneva home is the building the
WTO term already shows, and Commons has no photograph of it that is a photograph of anything — a
search returns congressional reports, EEC accession protocols and an actor named Gatt.

### N24's findings

**N24 — the Italian provinces I (shipped, all twelve pictured).** The twelve are `Florence`, `Venice`,
`Siena`, `Naples`, `Ferrara`, `Milan`, `Genoa`, `Palermo`, `Padua`, `Pisa`, `Salerno` and `Brescia`, each
a province or metropolitan city of Italy and the city that heads it, and each carried by two World
Heritage property pages. **The plan's row said "by region" and this batch is not by region**, for the
reason below; the row is split rather than abandoned.

**THE FINDING IS THAT THE ITALIAN PROVINCES CANNOT BE WRITTEN AT THE BAR FROM THIS SANDBOX ON A
STATISTICAL SPINE, and the plan named one that does not exist.** The row was written against
`istat.it`, "the national statistical office, per province". Measured:

- **ISTAT publishes no readable per-province page.** Its administrative-units classification
  (`istat.it/classificazione/codici-dei-comuni-delle-province-e-delle-regioni/`) is 200 and names not one
  province in its HTML; the successor portal **SITUAS** is a hash-routed single-page app served as a 3.9 KB
  shell; and `demo.istat.it`'s population app answers **only to POST** — a GET with the same parameters
  returns 73 bytes — while its per-province downloads are ZIP files. None of those is a work a reader can
  open and check.
- **Treccani fails the plan's own encyclopedia test.** The rule since N9 is that an encyclopedia may be
  cited if that article cites its sources, tested per article. `treccani.it` is reachable, but the online
  encyclopedia's article on Bergamo carries **no bibliography, no sources and no further reading**, and the
  Enciclopedia Italiana article behind the same search is the **1931** text, Fascist-era prose describing
  buildings "per opera del Fascismo". Britannica failed this test in N9; Italy's national encyclopedia
  fails it the same way.
- **EUR-Lex answers 202 with a zero-byte body**, which rules out the NUTS regulation — the EU instrument
  that legally names every Italian province as a NUTS-3 region and would have been one work for all 110.
  That is the same shape N23 recorded for `escholarship.org`, and it is worth naming as a family: **a 202
  with nothing in it is a wall, not an empty resource.** Eurostat's data browser is an SPA shell,
  `citypopulation.de` answers "Check for Humans", and **Ramsar's site information service answers 418
  "Checking you are not a bot"** — an eighth variety of non-content response, after the five 200-status
  error documents, the 202/0 and the 429 checkpoint.
- **The Italian public web is largely shut from here.** 503 on `lombardiabeniculturali.it`,
  `catalogo.beniculturali.it`, `dati.beniculturali.it`, `arpalombardia.it`,
  `turismo.regione.lombardia.it`, `unesco.cultura.gov.it`, `egymonuments.gov.eg`'s Italian counterpart
  `italia.it`, and three of the eleven Lombardy provincial sites (`provincia.bergamo.it`,
  `provincia.como.it`, `provincia.mb.it`). What does answer — a provincial or municipal homepage — is a
  service portal carrying no description of the territory.

**WHAT IS OPEN IS UNESCO, AND `whc.unesco.org` HAS REOPENED.** The plan recorded it as 403 and reached
UNESCO properties "through the state party's own record"; it now answers 200 on the Italy state-party
page, on every one of Italy's 62 property pages, and on `ich.unesco.org`. **Re-probe a host the plan
records as shut before working around it** — this one had been worked around for the whole pass.

**So the spine for the provinces is the World Heritage list, and the batch is cut by what it covers.**
Fetching all 62 Italian property pages and scanning their brief syntheses and locality lines gives a
measurable, checkable criterion: **44 provinces are named by at least one property and 14 by two or more**,
of which `Rome` and `Bologna` already exist as terms — leaving exactly twelve. Two things about that scan
are worth keeping. Each property page carries a **locality line** after its dossier number naming the
province and region outright ("Province of Milano, Lombardy"; "City and Province of Verona, Veneto
Region"; "Provinces of Caserta and Benevento, Campania"), which is the cleanest per-province statement
this pass found anywhere. And **a name in the page is not a fact about the place**: of the pairs the first
scan proposed, `Verona`'s second was the painter *Jacopo da Verona*, `Milan`'s the *Bishop of Milan*
supporting a shrine in Piedmont, and `Pisa`'s a remark about Siena's rivals — the first was dropped and
`Brescia` took its slot. **Grep the synthesis, then read the sentence.**

**Its other finding is L9's lever firing on a formula rather than on shared research.** Twelve
administrative units defined in the same shape produced **15 pairs sharing an eight-word run** on the
first draft — "and the seat of the metropolitan city that", "italy and the city that is its capital" —
with no duplicated content at all behind it. Rewriting each opening sentence to say something particular
about the place (Genoa "pressed between mountains and sea", Brescia "at the foot of the Alps", Padua "a
university city on the Venetian plain") took it to 0. **Where a batch's terms share a grammatical shape,
expect the run measure to fire on the shape**, and fix it by making each definition specific rather than
by shortening it.

**N25–N32 are blocked until a per-province source exists.** What would unblock them, in order of promise:
a reachable mirror of the NUTS classification; ISTAT's *Annuario statistico italiano* as a citable PDF
with page numbers; or a per-province spine like the Commonwealth Secretariat's Key Facts blocks that
carried Phase 3 of the citation pass. Twenty-two of the remaining provinces are named by exactly one
World Heritage property and would need only a second work each.

### N23's findings

**N23 — Amarna and Egypt (shipped, all twelve pictured).** The twelve are `Nile`, `Amarna`, `Amun`,
`Aten`, `Nefertiti`, `Memphis_(Egypt)`, `Saqqara`, `Giza`, `Ptah`, `Horus`, `Demotic` and `Obelisk`,
derived as usual by measuring the corpus rather than by listing what an Egypt batch ought to contain:
`Nile` alone was named **48 times across the shipped cards and terms with no entry behind it**, the
largest uncovered surface the expansion has met.

**ITS FIRST FINDING IS AN ACCESS REGRESSION IN CONTENT ALREADY SHIPPED, and it was found by reading the
existing terms' citations rather than by looking for it.** `egymonuments.gov.eg`, the Egyptian Ministry
of Tourism and Antiquities' *Discover Egypt's Monuments*, is **503 on every path from this sandbox** —
the root, Saqqara, Karnak, Tell el-Amarna, the Giza Plateau — and it is cited on **seven shipped
glossary terms** (`Mummification`, `Karnak`, `Valley_of_the_Kings`, `Great_Pyramid_of_Giza`,
`Old_Kingdom_of_Egypt`, `Great_Sphinx_of_Giza`, `Pyramid_of_Djoser`). Those citations were written when
the host answered; nothing in the pipeline re-checks a URL after it ships, so a citation can rot in
place and every audit still reports the term at the bar. **Read the neighbouring terms' source lists
before starting a batch in a subject the glossary already covers** — it is where the reusable sources
are (G6's economy) and it is the only place this kind of decay is visible. N23 used none of that host.

**Its second finding is the reachable spine for Egyptology, measured rather than assumed.** Almost every
museum is walled: `britishmuseum.org` and `rmo.nl` serve Cloudflare's "Just a moment…", `penn.museum`
403, `smarthistory.org` 403, and **`metmuseum.org` answers 429 with a Vercel Security Checkpoint**.
`escholarship.org` — which is where the peer-reviewed **UCLA Encyclopedia of Egyptology** actually
lives, the UEE's own site being a notice pointing at it — returns **202 with a zero-byte body**, a
seventh variety of non-content response to add to the five 200-status error documents already recorded.
What does answer, and carried the whole batch: **PMC open access** for the science, **the American
Research Center in Egypt's topic articles** (authored and affiliated — Ola el Aguizy of Cairo
University on Saqqara, Anna Stevens of Cambridge and Monash on the Aten, Steve Vinson of Indiana and
Marina Escolano-Poveda of Liverpool on Demotic), **Digital Egypt for Universities** at UCL, **the
Theban Mapping Project**, **the Amarna Project** and **`isac.uchicago.edu`**, whose Oriental Institute
PDFs the corpus already cites.

**Its third finding is that a compact reference list can carry a definitional term where a monograph
cannot, which is G8's rule seen from the other side.** Three gods — `Amun`, `Ptah`, `Horus` — looked
like the terms the literature does not pay for, and the first plan was to source them from Erman (1907)
and Breasted (1912) on archive.org. Digital Egypt's *Gods and Goddesses in Ancient Egypt: The Main Names
at the Main Places* states each in a clause: Amun "god of universal power (his name means 'the hidden
one')", Ptah "god of material creation, crafts. Main deity at Memphis", Horus "god of kingship,
celestial power", with the towns and the absorptions listed. **A page organised as a list of definitions
is worth looking for before a book that argues** — N22 found the same in the ICZN's code.

**Two decisions about surfaces are worth carrying.** `Memphis_(Egypt)` **is keyed with a parenthetical
and deliberately does NOT claim the bare name**: of the corpus's nineteen "Memphis"es, sixteen are
Egyptian and **three are Tennessee** (`geo-034`, `geo-534` and the `Tennessee` term), so an alias would
mislink one in six — the fault `check-gloss-links.js` exists to report. The cost is that a real and
important term links from nothing, and that is the honest price of the rule. `Kush` was **dropped from
the batch for the same reason and did not survive it**: two of its six corpus hits are the **Hindu
Kush**, and until a `Hindu_Kush` term exists to win the longer surface, a Nubian kingdom would be
attached to an Afghan mountain range.

**`Upper_Egypt` is deferred, at 12 corpus hits the highest-reach term this batch left behind, and the
reason is principled rather than practical.** It is a conventional division — the southern half of a
country, named as such — and nothing among the reachable hosts states it as a claim; G8's rule holds and
N22's exception does not apply, because no body maintains "Upper Egypt" the way the ICZN maintains
*holotype*. It wants a source that describes the division as a historical fact rather than using it as a
label; `Lower Egypt` (2 hits) waits with it.

Its picture pass rejected four on the standing rules: **an ISS photograph of Memphis from orbit** and a
**Nile basin map**, both diagrams of a place rather than views of it; a Petrie Museum Aten stela whose
incised disc is invisible at the size the popup draws; and a Ptah model tower with the museum's typed
catalogue label intruding along the bottom edge. The `Granite` term already carries the **Unfinished
Obelisk**, so `Obelisk` took Hatshepsut's at Karnak instead — **check what a sibling already shows before
choosing**, since the obvious picture for a term is often already spent.

### N22's findings

**N22 — Olduvai beds, palaeoanthropology's institutions and dating methods (shipped, 11 of 12 pictured).**
The twelve are `Type_specimen`, `Laetoli`, `Nariokotome`, `Koobi_Fora`, `Sterkfontein`,
`Cradle_of_Humankind`, `Turkana_Basin_Institute`, `Olduvai_Beds`, `Argon_dating`, `Taphonomy`,
`Magnetostratigraphy` and `Little_Foot`. Nineteen works, every one open and every one verified by
fetching the URL and grepping the body for a phrase the work must contain.

**Its finding is that G8's rule — the literature pays for RESULTS, not for definitions or for living
people — has an exception, and the exception is a DEFINING BODY'S OWN CODE.** `Type_specimen` looked
like exactly the term G8 said would go uncited: it is a definition, and the definition is a convention
rather than a measurement. But zoological nomenclature has a rule-book that states its own terms
outright, and `code.iczn.org/glossary/` gives *name-bearing type*, *holotype*, *lectotype*, *neotype*,
*paratype*, *syntype*, *type locality* and *type horizon* in the Commission's own words — "the objective
standard of reference whereby the application of the name of a nominal taxon can be determined". **Where
a term is a convention, ask which body MAINTAINS the convention before deciding it cannot be cited**;
the ICZN, the ICS and the IAU each publish theirs, and a published code is not an encyclopedia.

**Its second finding is the shape a batch of adjacent SITE terms takes, and it had to be settled before
drafting.** Six of the twelve are places in two clusters — Laetoli and Nariokotome and Koobi Fora in East
Africa, Sterkfontein and the Cradle of Humankind and Little Foot in South Africa — and the same three
facts (a dating dispute, a list of eight radiometrically dated sites, an attribution to
<i>Australopithecus prometheus</i>) would have served any of the six. Ownership was assigned first:
**Sterkfontein takes the dating dispute, the Cradle takes the eight-site list, Little Foot takes the
attribution**, and each of the three then needed a second source of its own, which is what sent the batch
looking for Martin et al. 2025 ("The StW 573 Little Foot Fossil Should Not Be Attributed to
<i>Australopithecus prometheus</i>"). The 8-word-run measure came back at **0 shared runs** across the
twelve and against their nearest existing siblings — but only because the assignment was made in advance;
the first draft of `Olduvai_Beds` shared eleven consecutive words with the shipped `Proboscidea`, which is
L9's lever catching a duplication that had not been written yet.

**A third finding is about the corpus rather than the sources: the batch found a term being made to carry
a whole subject, of the kind N8 found in `Smilodon`.** `Turkana_Boy` had held the aliases and the
narrative for the SKELETON and there was no term for the PLACE, so four card and glossary mentions of "from
Nariokotome" — every one of them about the locality — resolved to the boy. `Nariokotome` is now the site
and its tuffs, `Turkana_Boy` is untouched, and the alias "Nariokotome Boy" still beats the bare place name
because `buildGlossIndex` sorts longest-first. **When a place is only ever named as the findspot of one
fossil, check whether the place has a term at all.**

Three smaller things worth keeping. **`Bed I` and `Bed II` are registered `caseSensitive`**, as
`Little_Foot` is: "bed I" and "little foot" are both ordinary English word sequences, and the flag is the
cheapest guard against a future abstract linking "the bed I slept in" to a Tanzanian stratigraphic unit.
**A PMC page served at 20,454 bytes is a rate limit, not a citation fault** — three of the nineteen URLs
came back that size on one pass and 233–438 KB after a wait, so a verifier must check the BODY SIZE before
believing a keyword miss. And **strip tags to a SINGLE space before grepping a fetched page**: PMC wraps
`18 Ma` and `3.6 Ma` in markup, so a naive tag-strip leaves `18   Ma` and the keyword check reports a good
citation as bad.

**`Turkana_Basin_Institute` ships without a picture, and the reason is worth recording.** Commons has no
free photograph of the institute's facilities at Ileret, Turkwel or Nairobi; what it holds under the name
is four conference portraits of Richard Leakey, which illustrate a person rather than an institution, and
the best of them has a stranger's pointing hand across the frame. Three candidates were rejected elsewhere
in the batch on the standing rules — Sibiloi National Park as **satellite imagery** (a diagram of a place,
not a view of it), a 1973 Olduvai slide with a heavy magenta cast and a scanned film border, and the
Nairobi and New York museum cases for `Nariokotome` and `Little_Foot`, both cluttered with interpretation
panels and gallery reflections.

### N21's findings

**N21 — Tanzania, the Serengeti and African mammal groups (shipped, all twelve pictured).** The Great
Rift Valley, savanna, grassland, the soda lake, Kilimanjaro, the wildebeest, the zebra, the giraffe, the
gazelle, the antelope, the hyena and the African buffalo. `Serengeti`, `Ngorongoro_Conservation_Area`,
`Tanzania`, `Maasai`, `Hadza_people`, `Olduvai_Gorge`, `Laetoli_footprints`, `Elephant`, `Hippopotamus`
and `Rhinoceros` were terms already, so the batch is the country and the animals around them.

**A THIRD SPINE HAS CLOSED, AND THE REPLACEMENT IS BETTER THAN THE ONE THAT SHUT.** The **IUCN Red
List** — the obvious authority for a batch of species — answers a Cloudflare 403 on `iucnredlist.org`
and on its API host alike, joining N20's Global Volcanism Program and USGS. What replaced it is the
**Animal Diversity Web** (`animaldiversity.org`), the University of Michigan Museum of Zoology's
account series, which is open, has a per-species page for everything this batch needed **and a family
page for Bovidae**, and passes N9's per-article encyclopedia test outright: every account carries a
named author with an institution, named editors, and a full references list of journal papers.

**AN ADW ACCOUNT MUST BE READ, NOT ASSUMED — FOUR DRAFTED CLAUSES WERE WRONG AGAINST IT.** Writing the
mammal terms from general knowledge and marking them to ADW produced a wildebeest "light behind" and
with a muzzle "suited to cropping short grass", a hyena with "jaws and teeth able to break and digest
bone", a buffalo whose horn boss both sexes carry, and a bovid family with "unbranched horns of bone
sheathed in keratin that are never shed" — **none of which the accounts say.** What they do say is
better: broad shoulders and bracket-shaped horns, one Kalahari study finding **70 per cent** of the
hyena's diet to be its own kills, a boss on the males of some subspecies, and a family of **more than
140 living and some 300 extinct species whose very monophyly is argued over**. The correction improved
every one of the four; the lesson is N4's, one level down from a fabricated author — **do not compose a
sentence and then look for a source that will bear it.**

**AND A GUESSED PMC IDENTIFIER RESOLVED TO A DIFFERENT PAPER, WITH A 200.** The Serengeti grasses
checklist is cited on two existing terms and its identifier was reconstructed from memory as
`PMC4837038`; that URL is live and is somebody else's article. The corpus's own citation gives
`PMC4867701`. **Copy an identifier from the existing citation, never from recall** — and the check that
caught it is the batch's URL verifier grepping each page for a word the work must contain, which a bare
status check cannot do.

**THE MOST-USED SURFACE IN THE BATCH WAS THE ONE NOT WRITTEN.** *Lion* has 28 corpus hits, more than any
other candidate — and only about four are the living animal: the rest are the Lion Gate, the Lion-man,
the Sphinx's body, Lydian coin types, a stone lion in the Forum, and Taung's Setswana etymology, with
one that is a **different species**, the cave lion. A `Lion` term would have auto-linked into all of
them, so the slot went to `Hyena`, which has none. N20's tufa rule in a new dress: **count what a
surface would actually catch before keying it.** `Savanna` was keyed without a *savannah* alias for the
same reason — two of that spelling's three hits are the city in Georgia — and `Great_Rift_Valley` DOES
claim the bare *Rift Valley*, because its 12 hits include the Jordan Rift and the term is written to
cover the whole system, which is the honest way to earn them.

**Two terms rest on a paper that was already in the corpus, and both were re-opened first.** Duporge et
al. 2025 is cited on `Serengeti` for the wildebeest count; `Wildebeest` takes that clause and `Zebra`
takes a different one, the paper's own admission that its figure is an overestimate because zebras
travel with the herds and could not be told apart. Rowan et al. 2026 is cited on `Africa` and carries
the Turkana crustal thinning here. G6's rule, applied before drafting rather than after.

**All twelve are pictured, which is the pass's first clean sweep since N13, and the reason is that
African wildlife photography on Commons is unusually good.** Three candidates were still refused on
inspection: a Featured-picture wildebeest **caked in mud**, which hides the mane, beard and shoulder
stripes the term names; a rift-valley viewpoint with a **bare arm and bangles** filling the foreground;
and a "savanna" that is a **palm-lined river**. A fourth was reassigned rather than refused — the
Serengeti kopje is a fine photograph of a rock and no kind of grassland.

### N20's findings

**N20 — Italian landscape and geology (shipped, 11 of 12 pictured).** Tuff, the caldera, lava, karst,
Vesuvius, the Campi Flegrei, Etna, the Gran Sasso, pozzolana, travertine, the Tyrrhenian Sea and the
Aniene. `Apennines`, `Alban_Hills`, `Po_valley`, `Limestone`, `Marble`, `Obsidian`, `Pumice` and `Tiber`
were terms already, so the batch is the rock, the volcanoes and the water between them.

**TWO SPINES THE GLOSSARY ALREADY CITES ARE NOW SHUT HERE, WHICH IS N19'S FINDING TWICE OVER.** The
Smithsonian's **Global Volcanism Program** — cited on `Alban_Hills` and `Minoan_eruption` — answers a
Cloudflare **403** on every path and with every user agent tried, and **`usgs.gov`**, cited on
`Limestone` and `Pumice`, answers a CloudFront **403**. Both were the obvious first reach for a batch
like this. What replaced them: **INGV's own observatory pages**, which are open and per-volcano
(`ov.ingv.it` for Vesuvius, the Campi Flegrei and Ischia, `ct.ingv.it` for Etna and the Aeolian
islands), and **`nps.gov`**, whose *Karst Landscapes* and *Lava Flows* pages carry exactly the
definitional prose USGS used to. **Re-probe a host before planning a batch around it**; the register
records what answered on the day it was written.

**AND A SOURCE REUSED FROM THE REGISTER MUST BE OPENED FOR THE NEW CLAIM.** G6's rule fired here in its
cleanest form: Cowie et al. 2017 is cited on `Apennines` for the uplift that drives central Italian
faulting, and reads like the natural second source for `Gran_Sasso` — but the paper **never mentions the
Gran Sasso**, so it could carry nothing about it. De Luca, Di Carlo and Tallini 2018, on the massif's
own groundwater before and after the 2016 Amatrice earthquake, is what the term needed.

**THE CORPUS SPELLS ONE ROCK TWO WAYS AND USES ONE OF THOSE SPELLINGS FOR A DIFFERENT ROCK.** Measured
before drafting: *tuff* appears three times and *tufa* ten, and the ten are **not one thing** — six are
Italian volcanic rock (the cappellaccio of the Servian Wall, the plateaux of Veii and Caere), three are
the poros limestone of Delphi, and one is the calcareous tufa at Taung. So `Tuff` ships with **`tufo` as
its only alias and no claim on the surface `tufa`**, which would have auto-linked to the wrong rock in
four terms and on two continents. **When one surface is used of two materials, claim neither by alias
and say so in the prose.**

**A BARE DEMONYM-SHAPED ALIAS CATCHES THE PEOPLE AS WELL AS THE PLACE.** *Tyrrhenian* alone has 18
corpus hits against six for *Tyrrhenian Sea* — but one of the eighteen is Livy's "the Tyrrhenian
general", meaning an Etruscan. The aliases are **`Tyrrhenian coast` and `Tyrrhenian side`**, which pick
up seven of the good cases and can never reach the general. N7's `United_Kingdom` finding, one adjective
further on.

**A DEFINITIONAL TERM WANTS A DEFINITIONAL SOURCE, AND THE LITERATURE SEARCH WILL NOT SUPPLY ONE.**
Europe PMC on *karst* returns nothing but case studies — an Algerian spring, a Shandong basin, a Chinese
coalfield — none of which says what karst is. The agency page does, in one sentence, and the paper then
carries the second half of the term. **Reach for a national agency or park service for the definition
and for the literature for the instance**, which is the shape ten of these twelve took.

**Two terms were written ahead of the cards that will use them.** `Pozzolana` and `Travertine` have
**zero** corpus hits today — no shipped card or term mentions either — and both were kept because Rome
is built of them and the sources are unusually good: two Dilaria papers tracing Neapolitan pozzolan to
Aquileia and to a Roman structure in the Venice lagoon, and a *Scientific Reports* paper reading the
travertine crusts inside the Anio Novus back as the speed and depth of its water. A batch weighted only
by reach would have written neither.

**`Tyrrhenian_Sea` ships unpictured, and the reason is a rule rather than a gap.** A sea can be
photographed three ways and the picture pass refuses all three: a bathymetric chart is a **map**, an ISS
or Sentinel frame is **spaceborne**, and a coastal view is a photograph of a coast. Four more candidates
were refused on inspection: a night lava flow carrying a photographer's **signature watermark**, the
best-lit Etna picture on Commons being a **Sentinel scene with a burnt-in caption bar** — which the skip
patterns missed because the file says *Sentinel* with no digit after it — a Vesuvius crater rim that is
a bare silhouette against an orange sky, and a Naples "Tyrrhenian Sea" shot whose subject is graffiti on
breakwater blocks.

### N19's findings

**N19 — Umbria and its sanctuaries (shipped, 10 of 12 pictured).** The Umbrian language, Iguvium, the
Atiedian Brotherhood, the Clitumnus, the Via Flaminia, Spoletium, Tuder, Mevania, Hispellum, Ocriculum,
Carsulae and Sentinum. `Umbrians`, `Iguvine_Tables`, `Apennines` and `Tiber` were terms already, so the
batch is the country around them.

**ONE SECTION OF STRABO IS A WHOLE-BATCH SECOND SPINE, AND IT IS THE ECONOMY N18 FOUND IN LIVY AT LARGER
SCALE.** Strabo 5.2.10 names Sentinum, Ocriculum, Narnia, Carsulae, Mevania, Interamna, Spoletium,
Asisium, Ameria, Tuder, Hispellum, Iguvium and the Flaminian Way — ten of this batch's twelve in one
section. Four terms cite it, each on a **different clause**, assigned before drafting exactly as N18
assigned its Livy chapters: the road owns the thirteen hundred and fifty stadia from Ariminum to
Ocriculum, Spoletium the towns to the right of the Way, Tuder the parenthesis *a well-fortified city*,
Iguvium *near the passes that lead over the mountain*. Livy 9.41 carries two more, Mevania the forced
march and Ocriculum the treaty. **Cite the corpus's own preferred edition**: the glossary already cites
Strabo in Jones's Loeb through LacusCurtius (`Strabo/5C*.html` on `Seven_Hills_of_Rome`), and book 5 is
at `5B*.html` — Perseus's `1999.01.0198` (Jones) has no book 5, and its `1999.01.0239` is the older
Hamilton and Falconer translation.

**N15'S CROSS-REFERENCE STUB HAS A WORSE FORM: THE STUB POINTS AT A DIFFERENT PLACE.** N15 recorded that
a Smith entry may be a pointer with no content of its own (`quirites-cn` → "[JUS]"). `ameria-geo` is a
pointer to **CABIRA**, a city of Pontus that also bore the name Ameria — so the fetch succeeds, the page
is 69 KB, and a citation would send a reader to Asia Minor for a town in Umbria. `nequinum-geo` is the
benign form of the same shape, pointing correctly at NARNIA. Ameria was dropped from the batch for want
of an entry. **Grep the fetched entry for the term's own subject, not just for a sentence.**

**THE OUT-OF-COPYRIGHT GRAMMAR CARRIED THE TERM NO MODERN WORK WOULD.** `Atiedian_Brotherhood` needed a
description of the college itself rather than of the tablets, and the standard modern work (Poultney,
1959) is borrow-only on archive.org while `chs.harvard.edu` answered 503 on every attempt. **Buck's
*Grammar of Oscan and Umbrian* (1904) and Conway's *Italic Dialects* (1897) are both in full view and
carry different halves of it** — Buck the business of the brotherhood (the purification of the sacred
mount, the lustration of the people, the auspices, the priests' perquisites, the contributions of ten
gentes) and Conway the officers (the *adfertor* or flamen, the *uhtur*, the drinking that belonged to
Atiedian as to Arval assemblies). N6's rule about the canonical textbook, applied to a priesthood.

**A WORK ALREADY CITED IN THE CORPUS IS NOT AUTOMATICALLY OPENABLE NOW.** Negro et al. 2024 on Gubbio is
cited on card `rm-015` and is in *Land*, an MDPI journal: `mdpi.com` answers **403** here, so it could
not be used and `Iguvium` took Strabo instead. Zapelloni Pavia's *Continuity and Change in Ancient
Umbrian Cult Places*, cited on two cards, is on OAPEN, which N18 recorded as 403. **Re-open a work
before reusing its citation**; the register records what was reachable on the day it was written.

**A PERSEUS TEXT MAY STATE NO EDITION AT ALL.** The Latin Pliny (`1999.02.0139`) carries only "Letters.
Pliny the Younger." — no editor, no publisher, no year — so a citation of it could name nothing. Project
Gutenberg's Melmoth translation, revised by Bosanquet, states all three and carries the whole of *Letters*
8.8, which is the description of the Clitumnus sanctuary that Smith's own entry is built on. **When a
Perseus text has no edition statement, look for a translation that does.**

**THE SIBLING PAIR TO SETTLE BEFORE DRAFTING WAS `Clitumnus` AND `Hispellum`**, which Smith and Pliny
both tie together: Augustus gave the grove and temple of Clitumnus to the people of Hispellum. It went to
`Clitumnus`, whose sanctuary it is, and `Hispellum` took the two colonial titles and the Constantinian
rescript instead. The measured duplication over the batch and its neighbours is **0 shared eight-word
runs**, after one repair: `Umbrian_language`'s first draft shared "from the Etruscans and later in the
Latin one" with `Iguvine_Tables`, and was rewritten to PRIN's own register — an *epichoric* script
derived from the Etruscan.

**AND THE SIBLING CHECK CAUGHT A CLAIM BEFORE IT WAS MADE.** Card `rm-015` says that "whether the
Umbrians fought at Sentinum in 295 is doubtful: Livy and Polybius report them absent", so a term asserting
their presence would have contradicted the deck. Livy 10.27 states it outright — had the Etruscans and
Umbrians been present the Romans must have been beaten — and the term says so, with Livy's own admission
that no source explains where they were. **Read the neighbouring card before writing a term about a
battle it already hedges.** Two figures were deliberately left out for the same reason: the Iguvine
Tables' word count is 4,000 in the glossary and about 4,500 at Mnamon, and the short Umbrian inscriptions
are "some thirty" in two existing terms, so `Umbrian_language` states neither and names the *kinds* of
text instead.

**Two terms ship unpictured.** `Atiedian_Brotherhood` has no illustration that is not the Iguvine Tables,
which the tablets' own term already carries; `Sentinum` has almost nothing photographed at all, and the
one usable object — a Roman mosaic of a rider, now in Munich — is shot with a plastic sheet across the
corner and illustrates the town rather than the battle the term is about. Four further candidates were
refused on inspection: the Ocriculum site twice (weeds, wooden fencing and an interpretation panel filling
the frame), a Bevagna "amphitheatre" that is a **restaurant** fitted into its substructures, a Todi
panorama whose subject is a Garibaldi statue, and a Carsulae panorama at dusk carrying the photographer's
shadow across the middle.

### N18's findings

**N18 — The Italic peoples (shipped, 6 of 12 pictured).** Samnium, Sabellic, the Aequi, the Hernici, the
Marsi, the Paeligni, the Marrucini, the Vestini, the Frentani, the Picentes, the Lucanians and the
Campanians. The three peoples in the batch's own title — Samnites, Sabines, Umbrians — were already terms,
so the batch is the ones around them.

**SMITH'S *GEOGRAPHY* HAS AN ENTRY FOR EVERY ITALIC PEOPLE, AND THE SLUG IS THE LATIN SPELLING SMITH USES,
NOT THE ENGLISH ONE.** Eleven of the twelve take a Smith entry, and every entry opens by fixing the
people's borders against their neighbours, which is exactly the second sentence a term of this kind wants.
The one 404 is instructive: `paeligni-geo` does not exist because Smith heads the article **PELIGNI**.
N17's rule with the diacritic taken off — probe the slug, do not derive it.

**FOUR LIVY CHAPTERS COVER SEVEN PEOPLES, WHICH IS THE ECONOMY AND ALSO THE HAZARD.** Livy 8.29 names the
Vestini, Marsi, Paeligni and Marrucini in one breath, and 9.45 has the Aequi destroyed and then the
Marrucini, Marsi, Paeligni and Frentani suing for peace together — so three terms of this batch cite the
same chapter. **Where several terms share a chapter, hand each a different clause of it before drafting**:
the Aequi own the war and the thirty-one towns taken in a fortnight, the Marrucini own being first named
among the four who obtained a treaty, the Frentani own being last. Measured afterwards, no two of the
twelve share an eight-word run.

**A MNAMON CITATION LOOKED WRONG AND WAS RIGHT, AND THE CHECK IS WORTH KEEPING.** Reading the register's
Oscan citation in a truncated print, its `id=5` seemed to point at Mnamon's **Egyptian** page — which
`index.php?page=Lingua&id=5` really does serve. Auditing all 34 Mnamon citations in the corpus against the
site's own language index showed every one correct: Oscan is **id=56**, and the register's line had simply
been cut off mid-URL in the printout. Two things came out of it. **Mnamon's ids are per PAGE TYPE** — a
`page=Lingua` id and a `page=Scrittura` id are different number spaces, so `id=59` is Elymian as a language
and Lepontic as a writing system, and an audit that ignores the page parameter reports false faults.
And the general rule: **verify before repairing.** A "fix" would have rewritten 34 sound citations.

**THE REGISTER IS THE FIRST PLACE TO LOOK AND THE PLACES IT POINTS ARE OFTEN SHUT.** `Latial_culture`'s
lesson from N17 held again — Ravasini's 2024 Picene genomics paper, already cited by `Italic_peoples`,
carries the whole third sentence of `Picentes` — but three works the register names cannot be opened from
here at all: Fontana's 2022 lidar mapping of Samnium (`tandfonline` 403), Fontana and de Neef 2024
(`cambridge.org` 403) and Stek's *Cult Places and Cultural Change in Republican Italy* (OAPEN 403 on both
the handle and the bitstream). **A citation in the register is not proof the work is still reachable**;
`Samnium` therefore takes Livy's description of the Caudine Forks as its second source instead, and
`Pietrabbondante` — which those three works would have carried — was dropped from the batch and replaced
by the Frentani.

**AND CITE THE COPY YOU READ.** Ravasini's DOI resolves to Springer Nature Link, which answers 200 but
whose body does not extract; the **PMC copy** at `PMC11580440` reads cleanly. The register's line points at
the DOI, the new one points at PMC.

**`Category:Picene` IS A CHEMICAL.** Picene is a polycyclic aromatic hydrocarbon, so the obvious Commons
category for the people of Picenum returns ball-and-stick molecule diagrams. The name-in-the-wrong-place
trap has now appeared in three consecutive batches — as a caption in N17, as a title in N16 and here as a
**category name**, which is the layer the previous two batches recommended trusting. The way through was a
free-text search for the Novilara stele, whose North Picene inscription is the thing worth showing.

**SIX SHIP UNPICTURED BECAUSE A PEOPLE IS HARDER TO PHOTOGRAPH THAN A PLACE.** The six that shipped each
had one concrete thing to show — the Samnite theatre at Pietrabbondante, the Agnone Tablet, the polygonal
wall of the Hernican citadel at Alatri, the Warrior of Capestrano, the Novilara stele, a Lucanian tomb
painting from Paestum — and the six that did not are peoples whose material record is not gathered under
their own name. Two were refused after being looked at: the Marsic sanctuary at Lucus Angitiae is a real
site photographed under corrugated shelters with a power line across the sky, and the only Campanian
candidate is a museum case whose top half is an Italian wall panel. **A picture of the right subject can
still be a picture of the display.**

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
