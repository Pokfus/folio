# Citing the cards — batch plan

The World History › Prehistory deck is 109 cards, all written before the footnote system existed. This is
the plan for giving every one of them sources. Not part of the site.

## The bar

A citation qualifies only if it is **all four** of these:

1. **Academic or official.** A peer-reviewed paper or monograph, an excavation or museum report, or a
   record published by the body responsible for the thing (UNESCO World Heritage Centre, a national
   heritage agency, a national museum, the International Commission on Stratigraphy). Not a newspaper,
   not a blog, not an encyclopedia — **Wikipedia is where the research starts, never what a card stands
   on**, and Britannica is the same case one step up.
2. **Publicly reachable, with the landmark exception below.** Anyone can open it without a subscription.
   This is a real restriction and it is the point: it is what makes the page number checkable, by the
   reader and by whoever wrote the card.
3. **Stably linked.** A DOI where one exists, else a permalink that will not rot — a repository record, a
   UNESCO document URL, an agency page. Not a search result, not a link that carries a session id.
4. **Locatable.** An exact page range, figure, table or numbered section. "Somewhere in this 400-page
   book" is not a footnote.

### Paywalled landmark papers, and the access label

**Every citation ends in an access label** — `[Open access]` or `[Paywalled]` — after the URL, as part of
the stored string. A reader deciding whether to follow a link should be told before they click, and an
author adding a source has to make the access question explicit rather than let it slide.

A **paywalled landmark paper may be cited**: the defining publication for a find is often the only place a
claim exists, and refusing to name it serves nobody. But it is an exception, not a licence — **the majority
of any card's sources must be open**, and a paywalled work earns its place only by being the paper the
claim is actually built on. Prefer, in order: an open deposit of the same paper (PMC, HAL, a university
repository, an official repository like NSF PAR), an open journal covering the same finding, the official
site record, and only then the paywalled DOI.

**Cite the copy you opened.** Where a paper is paywalled at the publisher but open in a repository, the URL
in the citation is the repository's, because that is the link that works. Where only the abstract could be
opened, the register says so in as many words — a claim taken from an abstract is honestly sourced, and
pretending otherwise is the failure mode this whole apparatus exists to prevent.

### Language

**Sources in any language qualify**, and an English card may cite a French, German, Spanish or Italian
work where that work carries detail no English source does — which for European prehistory is often, since
the excavation reports, the site monographs and the ministry records are written where the site is.
**English is preferred where it serves equally well**: most readers of the English card can check an
English source themselves, and being able to check it is the whole point. So the test is not the language
but whether the reader gains anything — cite `Bulletin de la Société préhistorique française` over an
English summary of it when the Bulletin has the stratigraphy and the summary does not, and the other way
round when they say the same thing.

Cite it as it is published, in its own language, without translating the title; a citation names a work
that exists, and a translated title names one that does not. Where the language is not obvious from the
title, Chicago allows a bracketed gloss after it, and that is worth adding for a reader deciding whether
to open it.

### Form

Chicago **note** form, ending in the URL, which is stored as **plain text** — the page turns it into a
link, so the href and the visible text can never disagree.

```
Jean-Jacques Hublin et al., “New Fossils from Jebel Irhoud, Morocco and the Pan-African Origin of
<i>Homo sapiens</i>,” <i>Nature</i> 546, no. 7657 (2017): 289–92,
https://doi.org/10.1038/nature22336. [Paywalled]

Sonia Harmand et al., “3.3-Million-Year-Old Stone Tools from Lomekwi 3, West Turkana, Kenya,”
<i>Nature</i> 521, no. 7552 (2015): 310–15, https://hal.science/hal-04379924. [Open access]

UNESCO World Heritage Centre, “Archaeological Site of Atapuerca,” accessed 30 July 2026,
https://whc.unesco.org/en/list/989/. [Open access]
```

The label sits **after** the closing period, outside the sentence, and is stored in the citation string
exactly as written above. On the page it is **not** printed as bracketed text: `linkifySrcItem` lifts it
into a small chip — green for open, amber for paywalled, both from theme tokens so it follows every theme
and both modes. A paywall is a fact about the link, not a mistake, so it is amber and never red. The URL
pattern stops before the closing period and excludes `[`, so the two passes cannot collide; the chip's four strings are localised through `t()` rather than the walker, because `.src-list`
carries `notranslate`. Write the label in English in the data — the translation happens at render.

All four helper scripts refuse a citation with no link.

## Per-card work

1. **Find** 2–4 qualifying sources.
2. **Open each one** and confirm it supports the specific claim. Record the exact locator.
3. **Reconcile the abstract against what the sources actually say.** Anything they do not support gets
   corrected, softened, or cut. The house rules still bind: 10 sentences in 2 blocks of 5, 270–330 words,
   upper-secondary register, no parentheticals, one `<b>` on the answer term.
4. **Mark** the English abstract: one `<sup class="fn" data-fn="N"></sup>` per source, empty, at the end of
   the sentence that source carries. Every source must be marked at least once, and the tooling enforces
   it.
5. **Apply** with `node .claude/add-sources.js <batch>.json`.

Expect step 3 to turn up errors. That is a benefit of the exercise, not a setback — budget for it, and say
so in the changelog rather than quietly fixing dates.

## Translations

`sources` are not translated. **Markers are.**

- A card whose abstract is **rewritten** must be re-translated into all 9 languages **in the same batch**
  — otherwise a Spanish reader is left reading a claim the English no longer makes, which is worse than
  the state we started in. `add-sources.js` takes the translated abstracts in the same batch file.
- A card that only **gains markers** may defer. `add-sources.js` warns for each language whose marker
  count differs from the English, and that language shows the full linked source list with no in-text
  superscripts — degraded, but not wrong.

So: **pass 1** is citations + English markers across all twelve batches; **pass 2** syncs markers into the
nine languages afterwards, which is mechanical. Doing pass 2 per batch would triple each batch's length
for the least valuable part of it.

**Batch 0 did both at once, and the next batch should too.** The prehistory abstracts are exactly two
blocks of five sentences in *every* language, so markers can be spliced into the translations **by sentence
index** rather than retyped — a short script that locates sentence spans, inserts the same markers at the
same positions, and asserts the marker count matches across all ten languages. What actually costs anything
is translating a *corrected* sentence, and there were only two of those. Doing it inline avoids leaving a
documented backlog behind, so the "defer" clause above is now a fallback, not the plan.

## Batches

Grouped so a batch shares a source spine — one landmark paper often serves three or four cards, which is
both cheaper and keeps a batch's citations consistent.

The named works below are **candidates chosen from what the batch is about, not verified citations.** Each
is confirmed to exist, to be open, and to say what the card needs at the page cited when its batch is
worked. Nothing goes into `data.js` unopened.

### Batch 0 · Pilot (6 cards) — **DONE (2026-07-31)**
`wh-014` Lomekwi · `wh-045` Jebel Irhoud · `wh-069` Venus of Hohle Fels · `wh-005` Stone Age ·
`wh-009` Hunter-gatherer · `wh-011` Ice age

Deliberately mixed. The first three were the easy case — each rests on a single landmark paper, and they
settled the house conventions. The last three were the hard case: definitional cards with no one paper
behind them, where the bar above was most likely to bite. **The pilot existed to find out whether
definitional cards can meet the bar before 100 more are attempted**, not to make progress.

**They can** — 20 sources, 17 of them open, and two factual errors found and fixed along the way. See the
Pilot log below for how, and read it before starting batch 12, which is the rest of the definitional cards.

### Batch 1 · The oldest toolmakers (10) — **6 of 9 DONE (2026-07-31)**
**Cited:** `wh-008` knapping · `wh-015` Oldowan · `wh-021` Wonderwerk Cave · `wh-022` Acheulean ·
`wh-023` hand axe · `wh-098` control of fire. (`wh-014` was taken in the pilot.)

**Deferred to a later batch:** `wh-013` Australopithecus · `wh-016` Homo habilis · `wh-017` Olduvai Gorge.
See the Batch 1 log below for why; the short version is that all three rest on paywalled 1925–2007 papers
plus discovery-history detail for which no open source was found in the time available, and half-citing
them is worse than leaving them until a pass that can do it properly.

Spine as worked: Li et al. 2022 on knapping mechanics and Skertchly 1879 on the Brandon gunflint trade;
Plummer et al. 2025 and Braun et al. 2019 on the earliest Oldowan; de la Torre 2016 on the origins of the
Acheulean; Key & Lycett 2017 on handaxe form, function and the history of their recognition; Horwitz &
Chazan 2015 with Chazan 2015 on Wonderwerk as a site, Berna et al. 2012 and Marin-Monfort et al. 2026 on
its fire; Roebroeks & Villa 2011, Sorensen et al. 2018 and Davis et al. 2025 on the control of fire.
Lepre et al. 2011 and Leakey, Tobias & Napier 1964 are closed everywhere and were not needed: de la Torre
carries the Kokiselei date, and *H. habilis* moved to the deferred set.

### Batch 2 · *Homo erectus* across the Old World (10) — **3 of 10 DONE (2026-07-31)**
**Cited:** `wh-018` Homo erectus · `wh-028` Homo antecessor · `wh-030` Homo heidelbergensis.

**Deferred:** `wh-019` Homo ergaster · `wh-020` Turkana Boy · `wh-024` Dmanisi · `wh-025` Java Man ·
`wh-026` Peking Man · `wh-027` Zhoukoudian · `wh-029` Atapuerca. See the Batch 2 log below.

Spine as worked: Antón et al. 2016 on what varies in *H. erectus*; Rizal et al. 2020 on the Ngandong last
appearance; Bastir et al. 2020 on the shape of the *erectus* trunk; Curran et al. 2025 for how early
hominins were in Eurasia; Welker et al. 2020 on the *antecessor* dental proteome with Campaña et al. 2016
on the TD6 layer; Roksandic et al. 2021 on the muddle in the middle, with Schoetensack's own 1908 monograph
for the Mauer jaw. The originally planned spine did not survive contact with the paywalls: **Lordkipanidze
et al. 2013, Ferring et al. 2011, Shen et al. 2009, Wagner et al. 2010 and Bermúdez de Castro et al. 1997
are all closed with no open deposit**, and the UNESCO records remain unreachable (see the pilot log).

### Batch 3 · Middle Palaeolithic: technique and the other humans (10) — **6 of 10 DONE (2026-07-31)**
**Cited:** `wh-035` Denisovans · `wh-036` Denisova Cave · `wh-037` Homo naledi ·
`wh-038` Homo floresiensis · `wh-039` Liang Bua · `wh-041` Neanderthal extinction.

**Deferred:** `wh-032` Levallois · `wh-033` Mousterian · `wh-034` Neanderthal · `wh-040` Homo luzonensis.
See the Batch 3 log below.

Spine as worked: Reich et al. 2010, Slon et al. 2018, Huerta-Sánchez et al. 2014 and Harvati &
Reyes-Centeno 2022 on the Denisovans, with Fu et al. 2025 (twice, paywalled) for Harbin; Slon et al. 2017,
Zavala et al. 2021, Jacobs et al. 2019 and Douka et al. 2019 on the cave itself; the four open eLife
papers on *naledi* plus the two 2025 Versions of Record and their assessments; Brown et al. 2004,
Kubo et al. 2013, Sutikna et al. 2016, Baab et al. 2016 and Kaifu et al. 2024 on Flores, with Meijer
et al. 2017 and 2022, Sutikna et al. 2018 and Gagan et al. 2025 on Liang Bua; Higham et al. 2014,
Wood et al. 2013, Skov et al. 2022, Slimak et al. 2024 and Vaesen et al. 2019 on the extinction.
Krause et al. 2010 and Détroit et al. 2019 were not needed: the open review carries the Denisovan
naming question, and Luzon moved to the deferred set.

### Batch 4 · The origin of *Homo sapiens* (10) — **4 of 9 DONE (2026-07-31)**
**Cited:** `wh-043` Homo sapiens · `wh-044` Omo remains · `wh-047` Mitochondrial Eve · `wh-048` Y-chromosomal Adam.
(`wh-045` Jebel Irhoud was taken in the pilot.) The same batch also cleared **`wh-034` Neanderthal**, deferred from
batch 3 — see the Batch 4 log.

**Deferred:** `wh-046` Homo sapiens idaltu (Herto) — a discovery card, and its two 2003 *Nature* founding papers
(White et al., Clark et al.) have no open deposit anywhere, the batch-2/3 wall exactly.

**Remaining:** `wh-031` Middle Stone Age · `wh-042` Toba catastrophe theory · `wh-049` Skhul and Qafzeh · `wh-050`
Aterian — the record-and-industry cards, tractable, held for a later batch.

Spine as worked: McDougall et al. 2005 and Vidal et al. 2022 on the age of Omo I; Cann, Stoneking & Wilson 1987
with Fu et al. 2013 and Hernández 2023 on Mitochondrial Eve; Mendez et al. 2013 and Karmin et al. 2015 on the
Y-chromosome coalescent; Linnaeus 1758, Stringer 2016, Neubauer et al. 2018, Meneganzin et al. 2022, Hershkovitz
et al. 2018 and Clarkson et al. 2017 across the `wh-043` survey; King 1864, Green et al. 2010, Jaubert et al. 2016,
Boule 1911, Higham et al. 2014 and Vaesen et al. 2019 for the Neanderthal. Reich et al. 2010, Neubauer 2018,
Meneganzin 2022, Higham 2014 and Vaesen 2019 were already in the register from earlier batches.

**Original planned spine that did not survive contact:** Richter et al. 2017 and White et al. 2003 are closed
(Herto deferred); Poznik et al. 2013 (*Science*) has no open deposit and was not needed — Mendez and Karmin carry
the Y-chromosome cards between them.

### Batch 4 · (unworked cards, for reference)
`wh-031` Middle Stone Age · `wh-042` Toba catastrophe theory · `wh-046` Homo sapiens idaltu ·
`wh-049` Skhul and Qafzeh · `wh-050` Aterian

Spine: Hublin et al. 2017 and Richter et al. 2017 on Jebel Irhoud; McDougall, Brown & Fleagle 2005 on Omo;
White et al. 2003 on Herto; Poznik et al. 2013 and Karmin et al. 2015 on the Y-chromosome coalescent;
Hershkovitz et al. 2018 on Misliya; McBrearty & Brooks 2000 for the MSA framing. **`wh-047` and `wh-048`
need care** — the dates have moved repeatedly, and the cards should be checked against the current
estimates rather than cited to whatever was true when they were written.

### Batch 5 · The southern African record and modern behaviour (8) — **3 of 8 DONE (2026-07-31)**
**Cited:** `wh-052` Howiesons Poort · `wh-053` Sibudu Cave · `wh-054` Border Cave.

**Deferred:** `wh-051` Blombos Cave · `wh-055` Klasies River Caves · `wh-056` Pinnacle Point · `wh-057` ochre ·
`wh-058` behavioural modernity. See the Batch 5 log below — the same open-access wall, in a new place.

Spine: Henshilwood et al. 2002 and 2011 on Blombos; Marean et al. 2007 on Pinnacle Point; Wadley on Sibudu;
d'Errico on ochre and engraving; McBrearty & Brooks 2000 for the "revolution that wasn't" framing that
`wh-058` should be reconciled against. South African Heritage Resources Agency records where a site card
needs an official one.

### Batch 6 · Out of Africa: Sahul and the Americas (10) — **10 of 10 DONE (2026-07-31)**
**Cited:** `wh-059` Madjedbebe · `wh-060` Lake Mungo remains · `wh-061` Beringia · `wh-062` Settlement of the
Americas · `wh-063` Paleo-Indians · `wh-091` Clovis culture · `wh-092` Clovis point · `wh-093` Folsom
tradition · `wh-094` Monte Verde · `wh-095` Meadowcroft Rockshelter. Nothing deferred.

Spine as worked: Clarkson et al. 2017 with the 2018 reply and O'Connell et al. 2018 (the critique), Florin
et al. 2020 and Malaspinas et al. 2016 for `wh-059`; Bowler et al. 2003, Adcock et al. 2001 with Heupink et
al. 2016, Gillespie 2002 and Brumm & Moore 2005 for `wh-060`; Farmer et al. 2023, Jakobsson et al. 2017,
Hoffecker et al. 2023, Tamm et al. 2007, Llamas et al. 2016 and Schroeder et al. 2007 for `wh-061`;
Moreno-Mayar et al. 2018, Waters et al. 2020, Davis et al. 2022, Shillito et al. 2020, Bennett et al. 2021
with Holliday et al. 2025, Lesnek et al. 2018 and Rasmussen et al. 2014 for `wh-062`; Roberts 1940 read in
full, Chatters et al. 2024, Koch & Barnosky 2006, Cordell 1976 and Slade 2021 for `wh-063`; Waters et al.
2020, Grayson/Meltzer/Breslawski 2021, Story et al. 2019 and the two Eren papers for `wh-091`; Byram et al.
2024, Thulman et al. 2023, Slade 2021 and Waitt 2016 for `wh-092`; Buchanan et al. 2021, Jackson 1997,
Bement et al. 1997, Figgins 1927, Cordell 1976 and Thomas et al. 2017 for `wh-093`; Pino & Dillehay 2023,
Dillehay et al. 2015, Surovell et al. 2026 and the three 2026 eLetters for `wh-094`; the NPS landmark
nomination, Madsen et al. 2025, Rosencrance et al. 2026 and Adovasio et al. 1990 for `wh-095`.

### Batch 6 log — Sahul and the Americas
All ten cards shipped 2026-07-31. Seventy-three citation slots across the ten cards, drawn from **67
distinct works, 57 of them open** — every card's list majority-open, and `wh-063`, `wh-091` and `wh-092`
fully open. Coverage went from `cards 47/109` to `cards 57/109`. Network access was available and every
source was opened before it was written down.

**The plan called this "the most contested batch in the deck" and that was right, but not in the way it
expected.** The prediction was that the disputed *peopling dates* would be the problem. They were the easy
part: White Sands, Clovis, Folsom, Monte Verde and Madjedbebe all have published Bayesian models, and the
cards' hedges survived contact with them almost intact. What did not survive was the **quiet, confident
detail around the dates** — twenty-five corrections, far more than any previous batch, and most of them in
sentences nobody would have thought to check:

- **`wh-063`'s central historiographical claim was backwards.** The card said Frank H. H. Roberts Jr. coined
  "Paleo-Indian" in 1940 *for a class of stone tools rather than for a people*. Roberts 1940 was read in
  full: he never defines the term at all, and every one of his four uses denotes people or a period, closing
  with "there actually was a Paleo-Indian." Rewritten to say he used the name without defining it. This is
  the clearest case yet for the rule that a citation must be read, not matched — a plausible-looking
  reference to Roberts 1940 would have *anchored* the error.
- **Numbers that had drifted from a maximum into a minimum, or from one quantity into another.**
  `wh-095`'s "at least 16,000 years ago" was the single oldest of five dates running down to 13,240, against
  the excavators' own 14,000–14,500 radiocarbon years; the same card used 16,000 for the occupation *span*
  in one sentence and the *age of the deepest layer* in the next. `wh-093`'s "23 points" was the old *bison*
  count, and its end date of 11,900 fell outside even the 95% interval of the current model.
- **Figures that trace to no published count at all.** `wh-091`'s "10,000 Clovis points from 1,500 places"
  and "more such finds than anywhere else on earth"; `wh-092`'s "most forged artefacts in North America";
  `wh-095`'s "four laboratories" (the record names two) and "largest collection from eastern North America".
  Each reads like scholarship and is press or encyclopedia material. All dropped.
- **A recurring shared error across three cards:** Clovis and Folsom points "seated in a split shaft."
  The open hafting literature points to a bone or ivory socket, and Slade 2021 leaves the question open.
  Fixed identically in `wh-063`, `wh-091` and `wh-092` — when the same phrasing recurs across a deck, one
  card's correction is every card's correction.

**Two working rules this batch adds.** First, **a source that supports a claim may still not support the
sentence**: `wh-061` cited the standstill to Tamm et al., which gives 15,000 years and never mentions ice
sheets, and stated a critique of the hypothesis that appears only in a news summary — Hoffecker et al.'s
actual objection is different and better. Second, **check the date line as well as the prose.** The
`answerDate` repeats the abstract's figures, and `add-sources.js` does not touch it, so three cards would
have shipped corrected prose above a wrong date line. `.claude/fix-field.js` was written for exactly this
and refuses to write unless every find string is present.

**`wh-094`'s 2026 dispute is real and was verified.** Surovell et al., *Science*, 19 March 2026 exists, and
the three May 2026 eLetters answering it (30 authors between them) were read in full via institutional
mirrors. What did not survive is the card's "outcrops up to 4 kilometres away": no distance figure appears
in any of the three critiques — it is a Dillehay remark to *El Ciudadano*. Note also that both data DOIs the
eLetters point at are **dead** (figshare `EntityNotFound`; the Zenodo record tombstoned 2026-05-18), so the
mirrors are the only citable location.

**One card kept an uncitable sentence on purpose.** `wh-093`'s George McJunkin — the Black cowboy, born into
slavery, who found the Folsom bones in 1908 and died before anyone would look — appears in no peer-reviewed
source that could be opened; Figgins 1927 credits Howarth and Schwachheim. The story is not contradicted,
merely unreachable, and it is the heart of the card. It stays, without a marker. Absence of a citation is
not a reason to delete a true thing; it is a reason not to claim one.

### Batch 7 · Upper Palaeolithic Europe: the industries (9) — **9 of 9 DONE (2026-07-31)**
**Cited:** `wh-064` Cro-Magnon · `wh-065` Châtelperronian · `wh-066` Aurignacian · `wh-071` Gravettian ·
`wh-077` Solutrean · `wh-079` Magdalenian · `wh-080` microlith · `wh-081` spear-thrower · `wh-082` bow and
arrow. Nothing deferred.

Spine as worked: Henry-Gambier 2002 with the PALEO 2013 attribution, Fu 2016 and Haak 2015 for `wh-064`;
Djakovic/Roussel/Soressi 2024 with Welker 2016, Higham 2010 *and* Caron 2011, Gravina 2018, Gicqueau 2023
and Narr 2021 for `wh-065`; Lyell 1863 and Lartet & Christy 1875 with Kitagawa & Conard 2020, Marín-Arroyo
2018, Haws 2020 and Rhodes 2019 for `wh-066`; Posth 2023, Farbstein & Nowell 2024, Weber 2022, Wren & Burke
2019 and Maier 2023 for `wh-071`; Cascalheira & Bicho 2015, Cascalheira 2019, Bachellerie 2025, Gilligan
2024, Turner 1999 and the Rasmussen/Eren pair for `wh-077`; Fu 2016 with Posth 2023, García-Diez 2013, Bello
2021, Needham 2022, Breuil 1954 and de Mortillet 1885 for `wh-079`; Larsson 2016, Way 2022, Will & Conard
2020, Wedage 2019, Groman-Yaroslavski 2020 and Fasser & Fontana 2026 for `wh-080`; Bebber 2023, Cattelain &
Pétillon 2015 and Coppe 2023 for `wh-081`; Langley 2020, Metz 2023, Meadows 2018, Junkmanns 2019, Kooi &
Bergman 1997 and Shea & Sisk 2010 for `wh-082`.

### Batch 7 log — the industries
All nine cards shipped 2026-07-31. Seventy-nine citation slots across the nine cards, drawn from **77
distinct works, 65 of them open**, every card's list majority-open. Coverage went from `cards 57/109` to
`cards 66/109`. **Forty-six sentence corrections — double batch 6, itself the previous record.**

**This batch found errors of a new kind: cards contradicting OTHER FOLIO CARDS, and markers resting on
sources that do not say the thing.** Two cards shipped in earlier batches had to be corrected:

- **`wh-084` Chauvet** (batch 9) credited Quiles et al. 2016 with "an **Aurignacian** phase … and a
  **Gravettian** one". Fetching that paper directly: it gives the two phases and their dates exactly, and
  assigns **no archaeological culture at all** — "Gravettian" appears nowhere in it. The Chauvet–Aurignacian
  attribution is separately contested in print (Pettitt & Bahn 2015). The dates stand; the labels are gone.
- **`wh-053` Sibudu** (batch 5) called the arrowhead "a **slender** bone point," cited to Backwell et al.
  2008. That paper's abstract, read directly: "A **slender** point is consistent with a **pin or needle-like
  implement**, while a **larger** point … parallels large un-poisoned bone **arrow** points." The two objects
  were swapped.

Three more contradictions were *within* the batch: `wh-080` dated Howiesons Poort backed pieces to ~70,000
where our cited `wh-052` says 64,800–59,500 (the 71 ka figure belongs to Pinnacle Point, which its source
sets *against* the Howiesons Poort); `wh-071` claimed almost all Ice Age art is Gravettian, which our cited
`wh-084` and `wh-085` refute; and `wh-065` and `wh-071` both credited Garrod with a 1938 naming, true for the
Châtelperronian and unverified for the Gravettian.

**→ Add a sibling-card consistency check to the per-card workflow.** When a card names a date, a culture or a
site that another card also names, the two must agree, and the shared claim must be checked once rather than
twice. Four instances in two batches is a pattern, not a coincidence.

**→ And a standing "which clock is this on?" check.** Uncalibrated radiocarbon written as calendar years has
now appeared **five times**: `wh-086` Lascaux, `wh-093` Folsom, `wh-095` Meadowcroft, and in this batch both
`wh-077` Solutrean (22,000–17,000 → 25,000–19,000 cal BP) and `wh-079` Magdalenian (17,000–12,000 →
21,000–14,000). These never look wrong — they look like round, confident numbers — which is exactly why they
survive ordinary fact-checking. Ask of every date which scale it is on.

**Two predictions made when the batch was dispatched were wrong, and both are worth recording.** `wh-080`
microlith was called the likely defer as "definitional technique material"; it proved fully sourceable and
was the card that caught the `wh-052` contradiction. And the Aurignacian's discovery story — a workman, a
slab, seventeen skeletons, a mayor reburying them, the graves then lost — was flagged as probable folklore;
**Lyell 1863 documents every element of it, straight from Lartet's own account.** Vividness is not evidence
of invention, and an instinct for which claims are soft is not a substitute for opening the source.

Other substantive corrections: the Cro-Magnon skeletons were found during **road** works in 1868, not
railway works (the railway had cut the talus years earlier), and the skull's forehead lesion is a contested
NF1/NF2 diagnosis that the Smithsonian still calls a fungal infection; Breuil **defined** the Châtelperronian
in **1909** and filed it *as* Early Aurignacian, with Garrod supplying the name in 1938 — the card had this
backwards — and Welker et al. 2016 did not persuade the doubters, who published further challenges after it;
the Aurignacian's end date was 26,000 where the Bayesian models give ~33,000, and its "bone" points are
antler; the Gravettian's ceramics superlative overshot its own sources; the Solutré horse-stampede debunking
rested on two physical specifics no openable source states; and Combe Saunière is **not** the oldest securely
dated spear-thrower — the specialists explicitly excluded it, and the card's "17,500" is a figure lifted from
a sentence about different objects. The spear-thrower's "two-thirds more velocity" figure, flagged in advance
as suspicious, turned out to be **correct** (65%, from 2,160 launches) — but the sentence around it was wrong,
comparing a 200 g dart to an 800 g javelin as though they were "the same shafts".

### Batch 8 · Upper Palaeolithic art: portable (8) — **7 of 8 DONE (2026-07-31)**
**Cited:** `wh-070` Divje Babe flute · `wh-075` Sungir · `wh-076` Mal'ta-Buret' culture (batch 8a) ·
`wh-067` Lion-man · `wh-068` Hohle Fels · `wh-072` Venus figurines · `wh-073` Venus of Willendorf (batch 8b).
(`wh-069` Venus of Hohle Fels was taken in the pilot.)

**Deferred:** `wh-074` Dolní Věstonice alone. Vandiver et al. 1989 on the fired ceramics and Formicola et al.
2001 on the triple burial are both closed with no open deposit, the Moravian Museum's Anthropos pages carry
no object records, and the card's whole second block — the triple burial, the woman under the mammoth
scapulae, the ivory head and its 2018 facial reconstruction — rests on them. Farbstein & Nowell 2024 (open)
covers the ceramics alone, which is one sentence of ten.

Spine as worked (8b): the Museum Ulm catalogue record and the Blaubeuren state-museum site records for
`wh-067` and `wh-068`, with the official World Heritage portal for the inscription, Bataille & Conard 2018
for the excavation history, the Blaubeuren object record for the flute, and Conard 2003 and 2009 as the
paywalled landmarks; Weber 2022, Morriss-Kay 2013, Floss 2015, Lbova 2021 and Farbstein & Nowell 2024 for
`wh-072`, and the same four plus the NHM Vienna research record for `wh-073`.

Spine as worked (8a): Turk/Turk/Otte 2020 and Turk & Bastiani 2020 for the proponents' case, Diedrich 2015 for
the sceptics', Turk & Turk 2023 for the stratigraphy and the National Museum of Slovenia's own object record
for `wh-070`; Trinkaus & Buzhilova 2018 with Marom 2012 and Nalawade-Chavan 2014 on the dating, Sikora 2017
on the genomes and Nowell 2020 on the children and the bead labour for `wh-075`; Raghavan 2014 and Lbova
2021 with Uchiyama 2020, plus Weber 2022 and Moreno-Mayar 2018 from earlier batches, for `wh-076`. The
originally planned spine did not survive contact: **Conard 2003, Conard 2009a, Conard/Malina/Münzel 2009 and
Higham 2012 are all closed with no open deposit**, Kind et al. 2014 is open at Heidelberg but behind an
Anubis wall, and the UNESCO record remains unreachable (see the pilot log).

**`wh-070`'s hedge was checked, as the plan asked, and it needed work in the opposite direction from the
one expected** — not that the card read as settled, but that it gave the proponents' strongest argument
without the published answer to it. See the log.

### Batch 8 log — portable art, the flute and the Siberian graves

#### 2026-07-31 — three cards cited, five deferred

Fifteen citation slots across `wh-070`, `wh-075` and `wh-076`, drawn from **13 distinct works, every one of
them open** — the first batch of the pass that needed no paywalled landmark at all. Coverage went from
`cards 66/109` to `cards 69/109`. Network access was available and every source was opened before it was
written down.

**The batch was cut by subject and, for the fifth time, subject did not predict the source landscape.** It
split exactly along the line batches 2 and 3 drew:

- The three that shipped rest on **published results** — a date, a genome, a measured object, a museum
  accession. Their scholarship sits in MDPI, PMC, PLOS, *Evolutionary Human Sciences*, an open Slovenian
  stratigraphy journal, and two university green deposits (eScholarship) of otherwise paywalled *Nature* and
  *Science* papers.
- **`wh-067` Lion-man and `wh-068` Hohle Fels are the batch-2 wall in a new place.** Everything load-bearing
  about the Swabian Jura is closed: Conard 2003 (*Nature*), Conard 2009a (the Hohle Fels Venus), Conard,
  Malina & Münzel 2009 (the flutes) and Higham et al. 2012 (the Geißenklösterle chronology) have no open
  deposit anywhere, and Kind et al. 2014 — the restoration paper that carries the 31.1 cm height, the ~200
  refitted fragments and the 2012 rebuild — is nominally open in *Quartär* at Heidelberg but sits behind an
  **Anubis proof-of-work wall**, the `hal.science` pattern one host further on. Floss 2015 and Morriss-Kay
  2013 are open and carry a good deal, but not enough to keep a list majority-open for a card whose specific
  numbers all come from Kind.
- **`wh-072`, `wh-073` and `wh-074` were left for time, not for sources**, and are the first three to take
  next. Weber et al. 2022 (open, and already in the register) carries almost all of Willendorf, the NHM
  Vienna record carries the discovery, and Lbova 2021 and Farbstein & Nowell 2024 cover the Siberian and
  Moravian ends of the figurine corpus. What is still missing for `wh-073` is an open source for the
  cord-and-netting impressions in Moravia (Adovasio, Soffer & Klíma 1996 is closed), and for `wh-074`
  Vandiver et al. 1989 on the fired ceramics is closed with no deposit.

**Three findings worth carrying forward.**

**1. The hedge check the plan ordered for `wh-070` found the opposite problem.** The card was asked to be
checked for reading as settled; it does not. What it did instead was give the proponents' clinching
argument — "no hyena was found among the animal bones at the site at all" — with no sign that it has a
published answer. Diedrich 2015 addresses it directly: a cave bear ulna *from Divje Babe itself* "is one of
the best examples of bone crushing by hyena premolar teeth," so "his final arguments that 'hyenas are
absent' at this site … are none." The sentence now carries both halves. **A hedge can be intact and the
argument beneath it still one-sided**, and only the sceptic's own paper shows that.

**2. Two of the three cards had the same date written on two clocks.** `wh-075` said Sungir was "lived in
roughly 34,000 to 30,000 years ago" — but Marom et al. 2012 give the burials as **30.1 ± 0.3 ka BP, i.e.
34.1–35.2 ka cal BP**. The card's "range" was one date in radiocarbon years and the same date in calendar
years, presented as a span of four thousand years. This is the sixth appearance of the uncalibrated-14C
problem the batch-7 log flagged, and the first where it manufactured a *duration* rather than a wrong year.
Ask of every range whether its two ends are on the same scale.

**3. A correction is not finished when the abstract is fixed — check the QUESTION POOL.** Every card carries
three phrasings, and they repeat the abstract's figures exactly as the date line does. `wh-075`'s third
phrasing said in as many words that none of the Sungir dead "proved more closely related than second
cousins" — the very error being corrected — and would have shipped as the cloze question above a corrected
background. Five phrasings across the two cards had to be rewritten in all ten languages
(`add-questions.js` for the extras, `fix-field.js` for the main `question`, which is a string it can reach).
**The batch-6 rule "check the date line as well as the prose" now extends to the question pool**, and the
question is the more visible of the two.

**Seven other corrections**, made in English and all nine languages:

- **`wh-075`** put the man's fox teeth in "a cap stitched with fox teeth" and gave him "ivory bracelets."
  Trinkaus & Buzhilova 2018 (9–10) record "Twelve pierced fox canines … on the forehead" and "25 mammoth
  ivory arm bands." The cap is an interpretation, and the counts were absent. Corrected to what the
  excavation records.
- **`wh-075`** had the spears "each straightened out of a curved mammoth tusk by a method nobody has
  convincingly reconstructed." The straightening puzzle is real but appears in no source that could be
  opened; what the paper gives is 16 spears, "five of which are double-pointed," 0.27–2.47 m. Rewritten to
  that, and the same claim removed from the card's first question phrasing.
- **`wh-075`** said each bead "took the better part of an hour to carve and drill, so the two children went
  into the ground under years of somebody's work." The only published figure that could be opened is
  Soffer's, quoted by Nowell 2020: the beads of Sunghir 1–3 represent **more than 2,500 person hours** — an
  order of magnitude away from 10,000 beads at an hour each. Replaced with the published estimate, and
  "years" softened to "months."
- **`wh-075`** said quarrymen cutting clay for a factory struck the site in 1955. No source that could be
  opened carries the quarry, the clay or the year; Nalawade-Chavan et al. say only "discovered in the
  1950s." Softened, in the abstract, the date line and a question phrasing.
- **`wh-075`** placed Sungir "about 190 kilometres east of Moscow"; the published figure is **197 km**.
  Raised to 200.
- **`wh-076`** said "Gerasimov found the burial of a boy of about four." Lbova 2021 is explicit that it is
  **the burial of two children** — the second known from teeth — and that the 3–4-year-old is one of them.
  Corrected; the genome is still his.
- **`wh-076`** described houses "sunk partly into the ground, walled with large animal bones and roofed on a
  frame of reindeer antler under skins." That reconstruction is Gerasimov's and circulates chiefly through
  tertiary sources; nothing openable states it. Replaced with what Lbova does record — dwelling remains in
  the camp's floors, with most of the carved ivory found inside them — in the abstract, the date line and a
  question phrasing. The card's "main occupations fall roughly between 24,000 and 15,000 years ago" went the
  same way: Raghavan gives 24,423–23,891 cal BP for MA-1 and nothing supports the 15,000 end.

**On the mechanism.** Marker splicing by sentence index worked a seventh time, and the batch-1 warning bit
again: the shipped **Japanese `wh-076`** ran the English sentences 3 and 4 together, so its ten sentences
mapped 1:1 by count but not by content, and a marker placed by index would have landed on the wrong claim.
Because sentence 3 was being rewritten anyway, the Japanese 3 and 4 were re-cut to match the English
structure, and every marker position was then eyeballed across all ten languages before applying. All three
cards round-tripped 5+5 in every language first.

### Batch 8b log — the Swabian Jura and the Venus figurines

#### 2026-07-31 — four more cards cited, one deferred

Twenty-one citation slots across `wh-067`, `wh-068`, `wh-072` and `wh-073`, drawn from **14 distinct works,
12 of them open**; `wh-072` and `wh-073` are fully open. Coverage went from `cards 69/109` to `cards 73/109`.

**The finding of this batch is a correction to the batch-8a log, and it is the most useful thing in this
whole pass so far: `wh-067` and `wh-068` were deferred as unsourceable, and they were not.** 8a recorded
them as the batch-2 wall — Conard 2003, Conard 2009a, Conard/Malina/Münzel 2009 and Higham 2012 all closed,
Kind et al. 2014 open in *Quartär* but behind an Anubis wall — and concluded that no majority-open list could
be built. That was true of the *journal* literature and false of the card, because the specific facts those
cards state are **object facts**, and object facts live in museum catalogues:

- The Lion Man's height, material, find date, fragment count, restoration history **and its sex** are all in
  Museum Ulm's own catalogue record, with an inventory number.
- The Hohle Fels flute's length, its four surviving finger holes and its bevelled mouthpiece are in the
  Blaubeuren museum's object record for the flute.
- The World Heritage inscription is on the property's official portal, which is openable where
  `whc.unesco.org` is not.

**→ Search the holding institution before concluding a card cannot be cited.** A museum record is not a
consolation prize for a card whose papers are paywalled: for a card *about an object* it is frequently the
better source, because it is maintained by the people who hold the thing and it states measurements the
journal article assumed its readers already knew. Five of this batch's eight new sources are museum or
government records, and without them two cards would have been deferred twice.

**Twelve corrections**, made in English and all nine languages:

- **`wh-067`'s disputed sex is no longer disputed.** The card had "one prehistorian reading the marks at its
  groin as male and another as female." Museum Ulm's record, after the 2012/13 rebuild: "Aufgrund eines
  dreieckigen, vormals rechteckigen Elfenbeinstücks im Schambereich der Figur … Mit hoher Wahrscheinlichkeit
  nach handelt es sich bei dem Löwenmenschen um ein männliches Wesen." The argument was real; the
  reconstruction settled it. **This is the second correction in the pass caused by time rather than
  carelessness** (after `wh-037`'s *naledi* papers), and both were on cards reporting a live dispute.
- **`wh-067`** had the fragments sitting "in a box that sat in the Museum Ulm for thirty years." They sat
  with the excavation's sponsor Robert Wetzel and reached the museum only after his death in **1962**.
- **`wh-067`** dated the rebuild to 2012; it ran 2012/13, and Blaubeuren dates the reassembly to 2013.
  Height given as 31.1 cm, per the catalogue.
- **`wh-067`'s date line contradicted its own abstract**: the abstract said Völzing found it "on the last day
  of the dig," the date line "the day before the dig was broken off." The museum record settles it — the dig
  was broken off on 25 August 1939 itself.
- **`wh-067`'s 400-hour carving experiment could not be opened.** Hein and Wehrberger published it in the
  print yearbook *Experimentelle Archäologie in Europa*. Softened to "hundreds of hours" and left
  **deliberately unmarked**, on the `wh-093` precedent.
- **`wh-068`'s flute had five finger holes and twelve fragments.** The museum's object record gives **four
  preserved holes**, with the lower end "an einem fünften Loch abgebrochen," and describes the flute as
  nearly complete without a fragment count. Corrected; the 21.7 cm length and the bevelled notch both hold.
- **`wh-068`'s "70 centimetres away"** — the distance between the figurine and the flute — is in
  Conard/Malina/Münzel 2009's full text, which is closed, and in no openable source. Removed from the
  abstract and from the card's main question.
- **`wh-068`** dated the figurine's discovery to "September 2008" and counted "six pieces of ivory"; the
  openable sources give the year and no piece count. Both softened.
- **`wh-072`'s "more than 200" figurines** trace to no openable catalogue. Dropped from the abstract, the
  date line and the question.
- **`wh-072`'s Brassempouy head** was dated "about 25,000 years old." The Musée d'Archéologie nationale's
  object record 503'd on every attempt, and the museum's own Gravettian bracket for the piece is
  31,500–28,500 cal BP, so the figure is likely too young as well as unsourceable. The sentence was replaced
  with the Hohle Fels figurine, which is sourced and makes the same point about exceptions.
- **`wh-073` credited Josef Szombathy with finding the Venus of Willendorf.** He directed the excavation; the
  NHM Vienna record says she was "discovered by a worker on the site, **Johann Veran**, as he carefully
  sifted through the earth." Corrected in the abstract, the date line and two question phrasings.
- **`wh-073`'s "seven bands"** round the head and its "she cannot stand" are both unsourceable from anything
  openable — Weber 2022 says only "a sophisticated headdress or hairdo." The count went; the cannot-stand
  sentence was replaced with Weber's iron-oxide concretions and the navel cavity, which is sourced and more
  interesting. The Moravian cord-and-netting impressions went the same way (Adovasio, Soffer & Klíma 1996 is
  closed), replaced by the fitted fur coveralls on the Mal'ta figurines, which Lbova 2021 does carry.

**On the mechanism.** Two splitter findings. First, a **day-ordinal before a month name** breaks the
sentence splitter: German "am 25. August 1939" and "am 7. August 1908" split after the "25." because the
month is capitalised and the bare-ordinal guard from batch 4 does not cover it. Fixed with a month-name
lookahead, which is worth keeping for every later batch that touches a European excavation date. Second,
the Arabic `wh-067` genuinely runs **5+6**: it renders the English "Whether it is a god … there is no way to
tell" as two sentences. That is the batch-1 warning again, and it was handled with an explicit
English-index → language-index map in the builder rather than by forcing the translation to match.

### Batch 9 · Upper Palaeolithic art: rock and cave (6) — **5 of 6 DONE (2026-07-31)**
**Cited:** `wh-083` cave painting · `wh-084` Chauvet Cave · `wh-085` Cave of Altamira ·
`wh-087` Cosquer Cave · `wh-097` petroglyph. **Deferred:** `wh-086` Lascaux (see below).

Spine as worked: Brumm et al. 2021 and Oktaviana et al. 2024 (Sulawesi, the 45,500/51,200 dates),
Pike et al. 2012 (El Castillo U-series) and Quiles et al. 2016 (Chauvet) for `wh-083`; Quiles 2016 with the
French Ministry of Culture's Chauvet pages (discovery, bear hollows) and Sadier et al. 2012 (the rockfall
sealing) for `wh-084`; García-Díez et al. 2013 (Altamira U-series, open full text), Cartailhac 1902 (the
recant) and Moro Abadía 2015 (reception history) for `wh-085`; Valladas et al. 2017 (the 33,000–20,000 cal BP
range, HAL deposit), Etxepare & Irurtzun 2021 (the missing-finger debate), Clottes et al. 1992 (the two phases,
Persée) and the Ministry's DRASSM Cosquer page for `wh-087`; Lingappa et al. 2021 (rock varnish, PNAS) and
Aubry & Sampaio 2007 (Côa open-air Palaeolithic, Antiquity) for `wh-097`.

### Batch 9 log — Upper Palaeolithic art
`wh-083` `wh-084` `wh-085` `wh-087` `wh-097` shipped 2026-07-31 (`wh-086` Lascaux deferred). Twenty citations,
**nineteen open** (only Pike 2012 in `wh-083` is paywalled, beside three open), every card's list majority-open.
Coverage went from `cards 42/109` to `cards 47/109`. Network access was available and every source was opened
before it was written down; the two Ministry-of-Culture heritage pages and the French journal deposits
(Persée, HAL) clear the plan's bar as authoritative open records.

**This batch is the "official sources carry the most weight" batch as predicted — but the peer-reviewed
dating literature carried more.** The load-bearing claim on every card is a *date* or a *composition*, and
those go through: García-Díez 2013, Valladas 2017, Quiles 2016, Sadier 2012, Pike 2012, Brumm 2021,
Oktaviana 2024 and Lingappa 2021 are all reachable (Valladas only via its HAL green-OA copy; Cambridge is
paywalled). Six factual corrections turned up in the check, all of the "prose outran the source" kind:
- `wh-084` Chauvet — "195 skulls" → "about 190" (the Ministry / cave-bear MNI figure is ~190; no source for 195).
- `wh-085` Altamira — the card had a rockfall "clos[ing] the mouth some 13,000 years ago" as part of the
  U-series sentence. García-Díez 2013 dates the ceiling but places the only roof collapse it mentions
  *before the Gravettian*, tens of millennia earlier; the 13,000-year sealing is a conservation/museum figure,
  not from the dating paper. Reworded to keep the (sourced) 20,000-year U-series span and drop the unsupported
  13,000-year date, so the García-Díez marker sits only on what García-Díez bears out.
- `wh-087` Cosquer — the tunnel is "150 metres" not 175, the LGM sea "about 120 metres lower" not 100 (both from
  the Ministry's DRASSM page, which also disagrees with the Wikipedia-level 175 m), and "most of the cave"
  drowned rather than a precise "four-fifths" (tertiary only). The 65-hands / 44+21 split and the 33,000–20,000
  range both hold.
- `wh-097` petroglyph — the Côa engravings reworded to "open-air Palaeolithic engravings … found during the dam
  survey," dropping the "late 1980s" coming-to-light (the survey began then; the art was recognised in 1991),
  which is also what lets the Aubry & Sampaio marker attach to a claim that paper actually makes.

**`wh-086` Lascaux is deferred**, the one card of the six whose spine will not open: only ~4 of its 10 claims
have qualifying open scholarship (Ducasse & Langlais 2019 on the chronology; Martin-Sánchez 2014 on the mould),
while the galleries, the discovery, the scaffolding-and-lamps decline and the visitor history rest on the
Aujoulat monograph and museum records. It also carries two errors to fix when it is worked: the date
("about 17,000 years ago, some estimates 19,000") is the uncalibrated 14C age read as calendar years —
Ducasse & Langlais 2019 puts the occupations at ~21,000 cal BP — and the Great Bull is ~5.6 m, not "5.2 metres"
(Jouteau 2023). Recorded for a later Lascaux pass, not papered over now.

### Batch 10 · Ice-age climate and megafauna (8) — **7 of 7 DONE (2026-07-31)**
**Cited:** `wh-010` Pleistocene · `wh-012` Last Glacial Period · `wh-078` Last Glacial Maximum ·
`wh-088` woolly mammoth · `wh-089` Quaternary extinction event · `wh-090` Younger Dryas · `wh-096` Doggerland.
(`wh-011` Ice age was taken in the pilot.) The batch plan called this "the easiest batch of the set" and it was:
every card cleared, every list majority-open.

Spine as worked: Gibbard & Head 2010 and Walker et al. 2009 on the GSSPs, Hays/Imbrie/Shackleton 1976 on the
Milankovitch pacing, Spratt & Lisiecki 2016 on the sea-level stack, Jakobsson et al. 2017 on Beringia and
Svenning et al. 2024 on the megafauna for `wh-010`; Batchelor et al. 2019 (ice sheets), Spratt & Lisiecki 2016,
Quiles et al. 2016 (Chauvet) and Walker 2009 for `wh-012`; Clark et al. 2009, Moreno-Parada et al. 2023
(Laurentide 4 km), Tierney et al. 2020 (LGM cooling), Bereiter et al. 2015 (CO2) and Villalba-Mouco et al. 2023
(the 23 ka Malalmuerzo genome) for `wh-078`; van der Valk et al. 2021, Larramendi 2016, MacDonald et al. 2012,
Dehasque et al. 2024 and Graham et al. 2016 for `wh-088`; Koch & Barnosky 2006, Sandom et al. 2014, Gill et al.
2009, Rule et al. 2012, Broughton & Weitzel 2018, Stewart et al. 2025, Guimarães et al. 2008 and Doughty et al.
2016 for `wh-089`; Walker 2009, Buizert et al. 2014, McManus et al. 2004, Murton et al. 2010 and Meltzer et al.
2014 for `wh-090`; Walker et al. 2020, Gaffney/Thomson/Fitch 2007 (Mapping Doggerland) and Weninger et al. 2008
for `wh-096`. Clark 2009 is cited paywalled (landmark) with four open sources beside it; McManus 2004's open WHOI
PDF is what keeps `wh-090` majority-open. The originally planned spine did not fully survive: Rasmussen 2014 and
Stuart 2015 are Elsevier-paywalled with no open deposit and were not needed (Walker 2009 carries the Greenland
event dates; Koch & Barnosky 2006 carries the extinction chronology), and Coles 1998 was dropped for `wh-096`
because Walker 2020 (open) confirms the naming attribution the card needed.

### Batch 10 log — ice-age climate and megafauna

#### 2026-07-31 — seven cards cited

Network access was available; every source was opened before being written down. Coverage went from
`cards 29/109` to `cards 36/109`. This was the tractable-by-source-type batch the batch-2 lesson predicted:
the claims are dates, measurements, ice-core records, genomes and stratigraphic definitions, and the
scholarship for them lives in open stratigraphy journals (Climate of the Past, The Cryosphere, Episodes,
the GTS Foundation deposit of Walker 2009), open-access reviews and PMC.

**Eight corrections**, all made in English and all nine languages in the same batch:

- **wh-010 / wh-012** said the sea fell "as much as 120 metres" / "some 120 metres" at glacial maximum. The
  GIA-constrained LGM estimate is **−130 to −134 m** (Spratt & Lisiecki 2016, quoting Clark 2009 and Lambeck
  2014) — the same correction the pilot already made to `wh-011`. Both raised to 130.
- **wh-078** said "**Land** temperatures averaged some 6 degrees Celsius colder." Tierney et al. 2020's −6.1 °C
  is a **global mean**, not a land figure (land cooled more). Corrected to "Global temperatures."
- **wh-078** gave LGM CO2 as "roughly 180 parts per million." Bereiter et al. 2015's composite puts the LGM at
  ~187–190 ppm and IPCC AR6 states ~190; "180" is the classic glacial-minimum figure but low for the LGM proper.
  Corrected to 190, in the abstract and the date line.
- **wh-088** said mammoth teeth held "the oldest DNA yet sequenced." As of 2021 (van der Valk) it was the oldest
  from any organism, but ~2-million-year-old **environmental** DNA (Kjær et al. 2022) is older. Qualified to "the
  oldest DNA yet sequenced from any animal."
- **wh-089** said Africa lost "under a fifth" of its large genera. Koch & Barnosky 2006 (Table 2) give **21%** —
  marginally over a fifth. Corrected to "about a fifth."
- **wh-090** said the warming the Younger Dryas interrupted was "more than two thousand years" old. The
  Bølling–Allerød ran ~14.7–12.9 ka, i.e. **~1,800 years**. Corrected to "nearly two thousand years," in the
  abstract and the date line.
- **wh-090** gave the Greenland cooling as "10 to 15 degrees." Buizert et al. 2014 give the abrupt central-Greenland
  change as **9–14 °C**; the "15" upper bound is not stated. Corrected to "10 to 14 degrees."
- **wh-096** told the 1931 Doggerland harpoon find with a "skipper struck a lump of peat with his shovel" and a
  "Norfolk trawler." The shovel-blow is a popular retelling with no scholarly source, and the trawler *Colinda* was
  Lowestoft-registered. Reworded to the checkable facts: a North Sea trawler's net, 1931, a lump of peat that broke
  open to reveal a barbed antler point.

**Two source-type findings worth keeping.** First, *the open copy is often not at the DOI* — Walker 2009 and
McManus 2004 are paywalled at the publisher but fully open at the GTS Foundation and WHOI respectively, and
those deposits are what make `wh-010`/`wh-012` and `wh-090` majority-open. Fetch the institutional file, not just
the DOI. Second, *a candidate source can support human causation and still contradict the specific claim*: van
der Kaars et al. 2017 was the planned Australian Sporormiella citation for `wh-089`, but its own record shows
vegetation change **preceding** the megafaunal collapse by ~27,000 years — the opposite of the "spores drop
before vegetation" ordering the card states. Rule et al. 2012 (Lynch's Crater) carries that ordering; van der
Kaars was dropped for it.

**On the mechanism.** Marker splicing by sentence index worked a sixth time, and for once with no CJK remap
needed: all seven cards are exactly 5+5 sentences in every one of the ten languages, verified by a split/join
round-trip before any marker was placed, and every marker position was eyeballed across all ten languages per
the batch-1 warning.

### Batch 11 · After the ice (11) — **6 of 11 DONE (2026-07-31)**
**Cited:** `wh-102` Holocene · `wh-105` Atlantic period · `wh-106` Blytt–Sernander sequence ·
`wh-107` Holocene climatic optimum · `wh-108` post-glacial rebound · `wh-109` 8.2-kiloyear event.

**Deferred:** `wh-103` Preboreal, `wh-104` Boreal (their defining pollen-zone vegetation content rests on
paywalled palynology), and `wh-099` Mesolithic, `wh-100` Epipaleolithic, `wh-101` Nordic Stone Age (the
culture-historical/definitional cards, which belong with batch 12). See the Batch 11 log.

Spine as worked: the ICS Subcommission on Quaternary Stratigraphy "Major Divisions" page and Walker et al. 2018
(subdivision) and its Anthropocene working-group page for `wh-102`; Walanus & Nalepka 2010 (calibrated Mangerud
boundaries), Seppä et al. 2009 (N-European Holocene temperatures), Yu 2003 (Littorina transgression) and Parker
et al. 2002 (elm decline) for `wh-105`; Marchal et al. 2002 and Walker et al. 2012 for `wh-106`; Kaufman et al.
2020, Cartapanis et al. 2022, Tierney et al. 2017 (Green Sahara) and IPCC AR6 for `wh-107`; Whitehouse 2018,
Sella et al. 2007, Poutanen & Steffen 2014 and Bradley et al. 2009 for `wh-108`; Alley et al. 1997, Matero et al.
2017, Thomas et al. 2007, Walker et al. 2020, Weninger et al. 2006 and Walker et al. 2018 for `wh-109`. The
planned spine did not survive contact: **Mangerud et al. 1974 (Boreas) is paywalled with no open deposit**, and
Peltier and the Danish/Swedish heritage records were not needed.

### Batch 11 log — after the ice

#### 2026-07-31 — six cards cited, five deferred

Coverage went from `cards 36/109` to `cards 42/109`. Every source was opened before being written down.

**This is the batch-2 source-type lesson, one more time.** Batch 11 as planned held eleven cards, and they split
by *where the load-bearing scholarship lives*, not by subject:

- The six that shipped are **stratigraphy, climate and geophysics** — the Holocene GSSP and its subdivision, the
  Holocene thermal maximum, glacial isostatic adjustment, the 8.2 ka event, the Atlantic chronozone, and the
  Blytt–Sernander scheme itself. Their claims are dates, GSSPs, measured uplift rates, ice-core signals and
  temperature reconstructions, and that work sits in open stratigraphy journals (Episodes, *Climate of the Past*,
  *Earth Surface Dynamics*, *The Cryosphere*), the ICS's own maintained pages, and open institutional deposits
  (the WHOI PDF of Marchal 2002, the GTS-Foundation deposit of Walker 2009).
- **The two chronozone cards deferred — `wh-103` Preboreal and `wh-104` Boreal — turn on their defining
  vegetation**: the pollen-zone palynology (birch zone IV; the hazel rise and the "hazel-pine forest"). That
  literature (Mangerud 1974, Holst 2010, the *Corylus*-expansion papers) is paywalled with no open deposit, so
  the very content that makes those cards what they are could not be sourced. `wh-099`/`wh-100`/`wh-101` are the
  Mesolithic culture-history cards and belong with batch 12's definitional set.

**The key that rescued `wh-105` and `wh-106`:** Mangerud et al. 1974, the primary for every chronozone boundary,
is closed — but its boundaries are *quoted and attributed* in the open Marchal et al. 2002 and Walker et al. 2012,
and the open Walanus & Nalepka 2010 reproduces and calibrates its table. So the chronozone cards whose OTHER
content is open (the Atlantic's warmth and Littorina transgression; the scheme's own historiography and critique)
go through by citing those; the ones whose other content is *also* closed (Preboreal, Boreal) do not.

**Seven corrections**, made in English and all nine languages:

- **`wh-105`** said northern-European summers at the Holocene optimum ran "up to 2 degrees warmer." Seppä et al.
  2009's northern-Europe stack gives a **summer anomaly of ~1.5 °C** (the ~2.0–2.5 °C figure is the *annual*
  mean, which the card already uses for the 2.5 °C cooling since). Corrected to "about one and a half degrees."
- **`wh-106`** gave the Atlantic chronozone as "8,000 to 5,000 years before the present." Those are **radiocarbon
  years** (Mangerud's units); in calendar years they are ~8,900–5,700 cal BP. Marked as radiocarbon years so the
  span reads on the same clock as the figures around it.
- **`wh-107`** said the Green Sahara covered "some 9 million square kilometres." That figure — the modern area of
  the Sahara — appears only in the press, in no source that could be opened. Softened to "much of the Sahara."
- **`wh-107`** had the African Humid Period drying "earlier in the north and east." The open evidence
  (Shanahan's latitudinal pattern) supports **north before south**, not an east–west axis. Corrected.
- **`wh-109`** put "something like 160,000 cubic kilometres" of freshwater into the 8.2 ka flood. That classic
  figure is Barber et al. 1999's, which could not be opened, and neither Matero 2017 nor Aguiar 2021 restates it
  as a volume, so it was dropped rather than cited to a number nobody here could check.
- **`wh-109`** said the drowning of Doggerland "was completed about now, helped by the Storegga landslide." Walker
  et al. 2020 — the very source — argues the opposite: the inexorable sea-level rise, not the wave, took the last
  of it, and much of the land survived the tsunami. Reworded (the same correction batch 10 made to `wh-096`).
- **`wh-109`** had the Pre-Pottery Neolithic B collapse "its long-distance trade in stone and shell breaking off."
  Weninger et al. 2006 supports the site abandonment across the Levant, Syria and Anatolia; the trade-collapse
  clause is unverified, and was dropped.

**On the mechanism.** The splitter needed one addition this batch: the calendar-date cards write BCE with a
period ("v. Chr.", "a. C.", "av. J.-C."), and the internal abbreviation dot was splitting sentences in five
languages. A rule that never breaks on a lowercase continuation (German "v. Chr. entspricht") plus a targeted
guard for the era abbreviations fixed it, and all six cards then round-tripped 5+5 in every language before any
marker was placed. `test-sources.js` also needed a robustness fix: its "a card with no citations shows no
Sources fold" check studied the date-seeded card of the day, which the pass has now cited — it strips sources on
that one page so it tests the mechanism rather than leaning on an uncited card.

### Batch 13 · The deferred set, re-cut by source type (2 of 2 attempted) — **DONE (2026-07-31)**
**Cited:** `wh-024` Dmanisi · `wh-050` Aterian.

Not a subject batch. This is the first pass that went at the **deferred pile** rather than at a theme, and
it picked its two cards by asking which of the thirty-six remaining are built on *published results* rather
than on discovery history — the test batch 2 arrived at and batches 3, 5 and 8a all confirmed.

Spine as worked: Nery et al. 2025 (the open PLOS ONE crown-area study that is the card's own closing claim),
Lordkipanidze et al. 2013 and 2005 as the two paywalled landmarks, Zollikofer et al. 2024 and Curran et al.
2025 open for the dating and for the Eurasian-presence claim, for `wh-024`; Bergmann et al. 2022, Campmas
et al. 2026, Bouzouggar et al. 2007, Hallett et al. 2021 and Ait Brahim et al. 2023 — **all five open** —
for `wh-050`.

### Batch 13 log — Dmanisi and the Aterian

#### 2026-07-31 — two cards cited, four triaged and left

Ten citation slots from **10 distinct works, 8 of them open**; `wh-050` is fully open. Coverage went from
`cards 73/109` to `cards 75/109`.

**What this batch was really for was the triage**, and the triage is the part worth keeping. The session
started on the batch-2 discovery-and-site set — `wh-024` Dmanisi, `wh-025` Java Man, `wh-026` Peking Man,
`wh-027` Zhoukoudian, `wh-029` Atapuerca — on the theory that batch 8b's museum-record method would unblock
them the way it unblocked the Swabian Jura. **It does not, and the reason is worth writing down: the
Swabian institutions publish object records, and these do not.** Museum Ulm and the Blaubeuren state museum
maintain per-object catalogue entries with inventory numbers, measurements and find histories. What the
equivalent institutions publish is:

- **Georgian National Museum** — an institutional site with no Dmanisi object records reachable.
- **Naturalis** (the Dubois collection) — a bioportal that serves an Angular application, not a citable
  record; the `dubois-collection` page 404s.
- **Fundación Atapuerca / Museo de la Evolución Humana** — project and visitor pages naming the sites and
  species, with no fossil counts, no Sima de los Huesos figures and no Excalibur.
- **Moravian Museum (Anthropos)** — visitor pages only, which is also why `wh-074` stays deferred.

So the method is real but not general: **it works where a museum runs a catalogue, and a catalogue is a
different thing from a website.** Check for one; do not assume it.

**What is genuinely available for the four left, so the next pass does not re-do this search:**

- **`wh-025` Java Man** is the closest to ready. **Dubois 1894 is public domain and legible** — the
  archive.org scan (`Pithecanthropus00Dubo`) OCRs into usable German, with Trinil and Ngawi at line 616 and
  the braincase discussion around line 2218 — and Dubois 1898's English *Pithecanthropus erectus: A Form
  from the Ancestral Stock of Mankind* is there too (`b24880814`). Two further open works exist but **both
  hosts were down when tried**: Alink et al. 2016, "The Homo erectus Site of Trinil: Past, Present and
  Future of a Historic Place," *AMERTA* 34 (gold OA, `10.24832/amt.v34i2.150` — the Indonesian ministry host
  does not resolve), and Gruwier et al. 2025 on Trinil palaeoenvironments (green at VUB, persistent 503).
  Retry those two and the card is done.
- **`wh-026`/`wh-027` Zhoukoudian** — Weidenreich's *The Skull of Sinanthropus pekinensis* (Palaeontologia
  Sinica) is on archive.org and public domain, which covers the casts-and-descriptions claim that is the
  heart of `wh-026`. Shen et al. 2009 (the 770 ka date) and Binford & Ho 1985 (the hyena reinterpretation)
  are both closed.
- **`wh-029` Atapuerca** — the worst of the four. Arsuaga et al. 2014 is green only at `cnrs.hal.science`,
  behind the Anubis wall; the 2025 "Pink" *Nature* paper is closed with no deposit; the Sima de los Huesos
  literature is almost entirely Elsevier and Wiley.

**Three corrections**, made in English and all nine languages:

- **`wh-024` gave Dmanisi's age as "between 1.85 and 1.77 million years ago."** The 1.85 end is Ferring et
  al. 2011 (*PNAS*, closed, no deposit); every openable source gives "around 1.8 Ma" (Nery et al. 2025) or
  "at least 1.77" (Zollikofer et al. 2024). Softened to about 1.8 million years, in the abstract and the
  date line.
- **`wh-024` said the Dmanisi brains "ran from about 550 to 730 cubic centimetres."** 546 cc is published
  for D4500; the 730 upper bound appears in nothing openable. Rewritten to the sourced figure.
- **`wh-050` had the Aterian persisting "until roughly 20,000 years ago" and bone tools at Contrebandiers
  "between about 122,000 and 96,000."** Bergmann et al. 2022 give the industry as 145–30 ka BP, and
  Hallett et al. 2021 date the bone assemblage to 120,000–90,000 in their own title. Both corrected.

Two smaller repairs went with them: `wh-024`'s "differ no more than five modern people do" is a popular
gloss on Lordkipanidze et al. 2013 and not in the paper, so it now says the variation is no wider than
within a single population; and its unsourced site setting ("a promontory above the meeting of two rivers")
was dropped to make room for the Curran et al. 2025 nuance — **Dmanisi has the oldest human *fossils*
outside Africa, while cut-marked bone in Romania is now claimed to show an earlier *presence*.** Fossils and
traces are different evidence, and the card now says which it means.

The `wh-024` sentence naming the Oldowan tools carries **no marker** and is deliberately unsourced: no
openable work describes the Dmanisi lithic assemblage directly. It follows the `wh-093` precedent.

**On the mechanism.** Nothing new broke. Both cards round-tripped 5+5 in all ten languages on the first
try, with the month-name guard from batch 8b already in place, and **neither card's question pool needed a
correction** — the first time in three batches, and only because the pools happened not to repeat the
figures that moved.

### Batch 12 · The framework itself (8)
`wh-001` Paleolithic · `wh-002` Lower Paleolithic · `wh-003` Middle Paleolithic · `wh-004` Upper Paleolithic ·
`wh-005` Stone Age (if not in the pilot) · `wh-006` Three-age system · `wh-007` Prehistory ·
`wh-009` Hunter-gatherer (if not in the pilot)

Last on purpose. These are historiographic rather than empirical — they are about how the past has been
divided up, not about the past — and the pilot will have shown what actually works for them. Lubbock's
*Pre-historic Times* (1865) is public domain and coins two of these terms, so it can be cited to an exact
page in a scanned copy; the three-age system has a literature on its own history. Where a period
definition genuinely has no single authority, saying so in the card is better than manufacturing one.

## Pilot log — batch 0

### Attempt 1 (2026-07-30) — blocked

**Stopped at step 2, "open each one." Not a content problem — a network one.** That session's egress policy
refused every scholarly host with a proxy 403, leaving search snippets as the only evidence. Snippets cannot
establish that a link is reachable, that a page number is right, or that a work says what a card claims, so
**no citations were written** and `data.js` was untouched. The environment allowlist recorded below was the
fix; the notes it produced about paywalled landmark papers are superseded by attempt 2.

### Attempt 2 (2026-07-31) — done, all six cards cited

Network access was available. All 20 sources were opened before being written down, and every link in the
batch was re-checked after the fact. Coverage went from `cards 0/109` to `cards 6/109`.

**The pilot's actual question — can definitional cards meet the bar? — is answered yes**, and the shape of
the answer was not the one attempt 1 guessed at. Searching "Stone Age" or "hunter-gatherer" surfaces
tertiary encyclopedias, which is what made these look hard. The route through is to stop looking for a
source *about the term* and cite the specific claims the card actually makes:

- **wh-005 Stone Age.** The card says Lubbock coined "Palaeolithic" and "Neolithic" in 1865 — so cite
  Lubbock, page 2 and page 3 of the first edition, which is public domain and scanned. It says the scheme
  fits much of the world poorly — Lubbock says so himself on the same page, "for the present, I only apply
  this classification to Europe". The three-age system's origins have their own peer-reviewed history
  (Rowley-Conwy 2004, in a fully open journal). The 2.6 Ma opening date and the 12,000-year Neolithic
  transition are both empirical claims with ordinary papers behind them.
- **wh-009 Hunter-gatherer.** Same move. "Diets varied with latitude" is a quantitative claim (Zhu et al.
  2021). "Permanent villages, stored food and inherited rank arose without farming" is the subject of a
  PNAS paper on the North Pacific coast (Smith & Codding 2021). Neither needed a source that defines the
  word.
- **wh-011 Ice age.** The most tractable of the three, as expected: Cryogenian dates and the Snowball Earth
  debate from an open *Science Advances* review, orbital forcing from the PAGES interglacials review, LGM
  sea level from an open *Climate of the Past* paper.

So the guidance for batch 12, which is the rest of the definitional cards: **decompose the card into its
claims and cite those.** A period definition rarely has one authority, and looking for one is the trap.

**What step 3 turned up.** Two errors, both corrected in this batch, in English and all nine languages:

- **wh-011** said the sea fell "roughly 120 metres" at the Last Glacial Maximum. The GIA-constrained
  estimates are **−130 to −134 m** (Spratt & Lisiecki 2016, 1080, citing Clark et al. 2009 and Lambeck et
  al. 2014). Corrected to 130.
- **wh-045** said Jebel Irhoud's stone tools are "the oldest well-dated Middle Stone Age assemblage
  anywhere". Richter et al.'s own abstract claims something weaker — "**one of the earliest directly dated**
  Middle Stone Age assemblages" — and notes that the earliest MSA assemblages come from eastern and southern
  Africa. Corrected to match the paper.

Nothing else needed changing, which is a genuinely useful result for a first batch: the prehistory prose
survived contact with its sources.

**On paywalls.** Three of the twenty sources are paywalled, and all three are the landmark defining paper
for their card — Harmand's Lomekwi paper turned out to have the publisher's PDF openly deposited in HAL, but
Hublin 2017, Richter 2017 and Conard 2009 have no open full text anywhere. They are cited from their public
abstracts, which is recorded as such in the register. The other seventeen are open, so every card's list is
majority-open. The bar now carries an explicit rule for this, and every citation carries an access label.

**On locators.** The clause attempt 1 predicted was needed is needed, and slightly differently. Three
sources here are not the publisher's typeset copy — the NSF PAR deposit of Plummer et al. 2025 and the
Europe PMC author manuscript of Zhu et al. 2021 both carry non-journal pagination, and PMC full texts have
no pagination at all. Those are located **by named section**, with the published pagination given for
identification. A page number that only exists in a copy the reader cannot open is not a locator.

**Translations.** All six cards' markers went into all nine languages in this batch, not deferred. The
mechanism is worth reusing: the abstracts are all exactly two blocks of five sentences in every language, so
markers can be spliced by sentence index rather than retyped, and a marker-count check across the ten
languages catches any drift. Only the two corrected sentences needed real translation.

## Batch 1 log — the oldest toolmakers

### 2026-07-31 — six cards cited, three deferred

Network access was available. All 18 citations across the six cards were opened before being written down —
14 works newly verified, plus Plummer et al. 2025 already in the register from the pilot — and every link
was re-checked afterwards. 17 of the 18 are open; the one paywalled entry is Davis et al. 2025 on Barnham,
cited from its abstract as the defining publication for the find. Coverage went from `cards 6/109` to
`cards 12/109`, which is 39 citations in all, 35 of them open.

**What step 3 turned up.** Five corrections, all made in English and all nine languages in the same batch:

- **wh-021** said Wonderwerk's deposits are "up to 7 metres deep". **7 m is the cave's HEIGHT**
  (Horwitz & Chazan 2015, 596: "ca. 140 m long, 3–7 m high, 11–26 m wide"); Beaumont's excavation
  "reached a total depth of 4 m below the surface of the cave" (Chazan 2015, under "Context"). Corrected
  in the abstract *and* in the card's date line, which carried the same figure.
- **wh-022** credited the oldest Acheulean to Kokiselei alone and said its dating "pushed the tradition
  back some 350,000 years". De la Torre 2016 (§4a) reports "nearly identical ages ca 1.76–1.74 Ma" for
  Kokiselei 4 *and* Konso KGA6-A1, against a previous limit of 1.4–1.5 Myr. Corrected to name both sites
  and ~300,000 years.
- **wh-023** had hand axes used "to dig for roots and water" as a finding. Key & Lycett 2017 say the
  opposite about the evidence: "experiments examining the suitability of handaxes for digging appear to
  have been largely overlooked". Softened to a proposal; butchery and woodworking, which the use-wear
  literature does carry, stayed as findings.
- **wh-023** also called Prestwich and Evans "two British geologists" hurrying to photograph a hand axe in
  situ. Evans was an antiquary, Lyell was on the trip too, and the photograph is not in the source.
  Rewritten to the visit Key & Lycett 2017 (70–71) actually describe, from which the three "all came away
  convinced".
- **wh-098** said the Barnham team reported "clay baked in place above 700 degrees". That figure is in the
  press coverage, not in Davis et al. 2025's abstract, which is all that can be opened. Rewritten to what
  the abstract states: heated sediment, fire-cracked handaxes, and two fragments of locally rare iron
  pyrite, brought in deliberately.

**Why three cards were deferred.** `wh-013`, `wh-016` and `wh-017` are the batch's *fossil and site
history* cards, and they behave differently from the technology cards. Their load-bearing claims are the
founding announcements — Dart 1925, Johanson 1976, Leakey, Tobias & Napier 1964, Leakey 1959, Leakey,
Evernden & Curtis 1961, Spoor et al. 2007 — every one of which is closed with no open deposit, and none of
which is a *landmark for a claim no open work carries*: a review would serve as well, but the specific
figures the cards use (the 750→600 cc threshold change, the 1.75 Ma potassium-argon date, the gorge's
dimensions and its ~70 hominin fossils) were not found in one. Enough was gathered to start them — Kuhn et
al. 2016 on Taung, Masao et al. 2016 on the Laetoli footprints, Gunz et al. 2020 on *A. afarensis*
endocranial volumes, Tattersall 2026 on the *H. habilis* type specimen, de la Torre & Mora 2018 on the
Oldowan of Olduvai Beds I–II — and one correction is already waiting: **wh-013 calls australopiths
"barely a metre and a half tall"**, where Masao et al. 2016 estimate the tallest Laetoli trackmaker at
about 165 cm, "greatly exceed[ing] those previously reconstructed for Au. afarensis". Pick these up as a
group; they are one coherent piece of work, not three loose ends.

**On the mechanism.** Marker splicing by sentence index worked again, with one wrinkle worth recording:
**a matching sentence COUNT does not prove a matching sentence MAPPING.** The Chinese wh-022 abstract
splits the English opening sentence in two and merges English sentences 4 and 5 into one — five sentences
per block in both languages, aligned differently. Splicing by index alone would have put two markers on
the wrong claims. Check the alignment at each marker position, not just the count; a numeral or a proper
name in the sentence makes this quick to eyeball across ten languages.

## Batch 2 log — *Homo erectus* across the Old World

### 2026-07-31 — three cards cited, seven deferred

Eight citations, **all eight open**, across `wh-018`, `wh-028` and `wh-030`. Coverage went from
`cards 12/109` to `cards 15/109` — 47 citations in all, 43 of them open.

**Three corrections**, made in English and all nine languages:

- **wh-018** said *H. erectus* was "the first of our relatives to be built like us below the neck, with
  long legs, short arms and a narrow waist". Bastir et al. 2020's three-dimensional reconstruction of the
  Turkana Boy's rib cage finds "a short, mediolaterally wide and anteroposteriorly deep thorax … that
  differs considerably from the much shallower thorax of *H. sapiens*", and argues for "a recent
  evolutionary origin of fully modern human body shape". The limbs stand; the narrow waist does not.
- **wh-018** likewise had the Turkana Boy "tall and lean like a modern tropical human". Same paper, same
  problem: tall and long-limbed, but broad through the chest.
- **wh-030** said the 2021 proposal put the *heidelbergensis* and *rhodesiensis* fossils "under a new one,
  *Homo bodoensis*". Roksandic et al. propose no such thing: the African fossils go to *bodoensis*, and the
  western European ones — the Mauer type jaw included — go to *H. neanderthalensis*.

**Why seven cards were deferred, and what it says about the batch plan.** This batch was grouped by
subject, and the subject turned out not to predict the source landscape at all. Its ten cards split cleanly
in two:

- The three that shipped are **taxonomic and comparative** — what a species is, what varies within it, what
  a name is doing. That literature lives in review journals and in *Nature*'s open-access tier, and it was
  all reachable.
- The seven deferred are **discovery-and-site** cards, and every one of them turns on a founding
  announcement that is closed with no open deposit: Dubois 1894, Black 1927, Bermúdez de Castro et al.
  1997, Ferring et al. 2011, Lordkipanidze et al. 2013, Shen et al. 2009, Wagner et al. 2010, plus the 2025
  Sima del Elefante face. `wh-025` is worse than paywalled: its closing claim — that the Trinil fossils
  flew to Jakarta in December 2025 — is a repatriation reported in the press, and there is no scholarly
  source to cite for it at all.

**This is the same wall batch 1 hit**, and with the same shape: `wh-013`, `wh-016` and `wh-017` were
deferred for exactly this reason. That is now ten cards waiting on one problem rather than a scatter of
loose ends, and the plan should stop pretending they are distributed across batches. **The remaining
batches should be re-cut by source type, not by subject** — one pass over the empirical and comparative
cards, which are tractable, and a separate pass for the discovery-history cards, which needs a different
method: the founding papers are largely pre-1930 and therefore public domain (Dubois 1894 and Black 1927
are both old enough to be scanned somewhere, as Schoetensack 1908 and Lubbock 1865 already proved), while
the modern site chronologies need an open re-publication or a museum record rather than the original
*Nature* letter. Do not attempt them one at a time between other work.

## Batch 3 log — the other humans

### 2026-07-31 — six cards cited, four deferred

Thirty-three citations across `wh-035`, `wh-036`, `wh-037`, `wh-038`, `wh-039` and `wh-041` — 32 distinct
works, 24 of them open, and every card's list majority-open. Coverage went from `cards 15/109` to
`cards 21/109`.

**Batch 2's advice held, and this is what it looks like applied.** The instruction was to re-cut by source
type rather than subject, and the six that shipped are the ones whose load-bearing claims are *results* —
a genome, a date, a measurement, a model — while the four deferred are the ones built on *technique
history* and *naming history*. It is the same split as batches 1 and 2, one level up: not
discovery-vs-comparative but published-result-vs-published-argument.

**Eleven corrections**, made in English and all nine languages:

- **wh-036** put Denisovans in the cave "from at least 200,000 years ago". Douka et al. 2019's modelled
  estimate is **195,000** at 95.4% probability. Corrected, and the sentence rebuilt around Jacobs et al.
  2019's actual finding — occupation reconstructed from around 300,000 to 20,000 years ago.
- **wh-036** said reading DNA straight out of cave sediment was "first demonstrated here in 2017". Slon et
  al. 2017 screened **four Eurasian caves at once**; Denisova is where the *Denisovan* DNA came from, not
  where the method was first shown alone.
- **wh-037** had the Rising Star chute "averaging 20 centimetres across, pinching to 18". Dirks et al. 2015
  say "a ~12 m vertical climb down, with squeezes as tight as ~20 cm" — 20 cm is the tightest point, and
  the paper carries no 18 cm at all. That figure is from press coverage.
- **wh-037** said "more than 1,550 pieces". Berger et al. 2015 count exactly 1550.
- **wh-037** said the reviewers were unanimous that the burial and engraving evidence fell short and that
  the papers "are still being revised". **Both reached Versions of Record in eLife in 2025**, and the
  burial assessment says the opposite of unanimous: "one of the reviewers concludes that the findings
  convincingly demonstrate intentional burial practices, while another considers evidence for such an
  unambiguous conclusion to be incomplete". The engravings were assessed "important" but "incomplete".
  Rewritten to the published verdicts. **This one was not an error when written — the world moved.** It is
  the first correction in the pass caused by time rather than by carelessness, and it is worth expecting
  more of them: a card that reports an argument in progress has a shelf life the rest do not.
- **wh-038** gave LB1 as 1.06 m. Brown et al. 2004 say "approximating 1 m", and no openable source carries
  1.06. Corrected in the background and the date line.
- **wh-038** gave the braincase as "roughly 400 cubic centimetres" — which is precisely the loose figure
  Kubo, Kono & Kaifu 2013 exist to replace: "the ECV of LB1 thus measured, 426 cc, is larger than the
  commonly cited figure in previous studies (400 cc)". Corrected in both places.
- **wh-038** said the 2024 Mata Menge arm bone "came from an adult barely a metre tall, the smallest in the
  human fossil record". Kaifu et al. 2024 report a *bone*, not a stature: an adult humerus 9–16% shorter
  than LB1's and "smaller than any other Plio-Pleistocene adult hominin humeri hitherto reported".
- **wh-038** claimed "fragments of at least 13 more individuals". Nothing that could be opened supports a
  count of 14 for the cave; the published lower-limb minimum is nine individuals in all. Softened to
  "several other individuals", which is what the sources bear.
- **wh-039** said the 2025 study "shifts the blame away from us and onto the weather". Gagan et al. 2025
  conclude the opposite of an either/or: "progressive landscape aridification, **and** intensified
  human-faunal competition for dwindling resources, culminated in abandonment of Liang Bua."
- **wh-041** credited the 2014 dating programme with demolishing the claim that Neanderthals held out at
  Gibraltar until 28,000 years ago. Higham et al. 2014's abstract does not mention Gibraltar. The southern
  Iberian late dates were undone by **Wood et al. 2013**, a separate study of eleven sites of which only
  Jarama VI and Zafarraya could be reliably dated. Rewritten to what that paper actually shows.

**Why four cards were deferred.**

- **`wh-032` Levallois and `wh-033` Mousterian** are *technique* cards, and their load-bearing claims are
  historiographic: where the name comes from, who dug the type site, what the Bordes–Binford debate was
  about. That literature is in JSTOR and in Cambridge's journals, and the one open experimental paper found
  (Eren & Lycett 2012, on predetermination) covers a single sentence of one card. Worse, `wh-032`'s
  strongest empirical claim — Nor Geghi, and independent invention — rests on **Adler et al. 2014**
  (*Science*), which OpenAlex confirms has no open deposit anywhere and whose publisher refuses
  non-browser clients, so not even the abstract could be opened from here.
- **`wh-034` Neanderthal** is close to workable and was left out on time, not on sources: Green et al. 2010
  is open in PMC, King 1864 and Boule 1911 are public domain, and only Jaubert et al. 2016 on Bruniquel is
  closed. Take it first next time.
- **`wh-040` Homo luzonensis** likewise: Larena et al. 2021 on Ayta Denisovan ancestry is open in PMC and
  Détroit et al. 2019 has green deposits at Griffith and Zenodo, but neither was opened, and an unopened
  deposit is not a citation.

**A rule worth writing down, since it nearly went wrong twice.** *An index saying a paper is closed is not
evidence that it is.* Europe PMC marks Wood et al. 2013 as not open access; its full text is free in PMC,
and citing it as paywalled would have been a false label on an open work. The same check the other way
saved the Auckland deposit of Sutikna et al. 2016 from being cited as open when it is behind a JavaScript
challenge nobody without a browser can pass. **Fetch the thing before labelling it**, in both directions.

**On the mechanism.** Marker splicing by sentence index worked for a third time, now with a written
splitter (`sent.js` in the working directory, not shipped) that refuses to split on an abbreviation
period — German ordinals ("im 18. Jahrhundert"), initials ("R. P. Soejono", Arabic "ر. ب.") and, the one
that bit, a French sentence ending "…la trisomie 21." All sixty abstracts were asserted to be exactly
5+5 sentences and to round-trip losslessly through split-and-join before a single marker was inserted,
and every marker position was eyeballed across all ten languages first, per the batch 1 warning.

## Batch 4 log — the origin of *Homo sapiens*, and the Neanderthal

### 2026-07-31 — five cards cited, one deferred

Twenty-four citations across `wh-043`, `wh-044`, `wh-047`, `wh-048` and `wh-034` — every card's list
majority-open. Coverage went from `cards 21/109` to `cards 26/109`. Network access was available and every
source was opened before being written down.

**This is the batch-3 lesson holding for a fourth time.** The four origin-of-*sapiens* cards that shipped are
all built on *results* — a date (Omo, Vidal 2022), a genome or a coalescent (Mitochondrial Eve, Y-chromosomal
Adam), a survey of dated fossils (`wh-043`). The one deferred, `wh-046` Herto, is a *discovery* card: found
1997, named 2003, and both its founding *Nature* letters (White et al. 2003, Clark et al. 2003) are closed with
no open deposit — the same wall as Dubois, Black and Bermúdez de Castro in batch 2. `wh-034` Neanderthal was the
batch-3 pickup flagged "take it first," and it went through cleanly: King 1864 and Boule 1911 are public domain,
Green et al. 2010 is open in PMC, and only Jaubert 2016 (Bruniquel) and Higham 2014 are paywalled, both cited
from abstracts that carry the exact claim.

**One correction**, made in English and all nine languages:

- **`wh-048`** said the 2013 discovery of the A00 lineage "pushed the common ancestor back by roughly a hundred
  thousand years." Mendez et al. 2013 give a Y-chromosome TMRCA of **338 kya (95% CI 237–581)** against previous
  estimates of "∼60–140 thousand years ago" — a jump of roughly **two hundred** thousand years, not one.
  Corrected. This is the whole batch's only factual error, which is a good result: the origin-of-*sapiens* prose
  survived contact with its sources, and the two dates that have "moved repeatedly" (`wh-047`/`wh-048` were
  flagged for exactly this) held up — Fu 2013's 157 ka and Karmin 2015's 254 ka both sit inside the ranges the
  cards already gave.

**Two labelling calls worth recording**, both following the "fetch before labelling" rule:

- **Clarkson et al. 2017** (Madjedbebe, the 65 ka Australia date) is bronze OA per OpenAlex, but the full text
  redirects to an authentication wall from here and only the abstract could be opened. Cited as `[Paywalled]`
  from the abstract, which carries the 65 ka claim in its title — an honest under-claim, not an open copy passed
  off as reachable.
- **Hershkovitz et al. 2018** (Misliya, ~180 ka) has a green deposit at Griffith, but it sits behind a
  JavaScript challenge (the `hal.science`/`digital.csic.es` pattern). Cited `[Paywalled]` from the Science
  abstract, which states 177–194 ka.

**On the mechanism.** Marker splicing by sentence index worked a fourth time, with one splitter bug worth
recording for the next batch: an abbreviation-protection regex must not treat the last letter of an
all-caps word as an initial (`DNA.` is a sentence end, not `D. N. A.`), and a bare-ordinal guard
(`17.` → protect) must exclude the trailing digits of a grouped number (`233,000.` is a sentence end). Both
were caught by the per-block "exactly five sentences" assertion before any marker was placed, and every marker
position was eyeballed across all ten languages, per the batch-1 warning.

## Batch 5 log — the southern African record

### 2026-07-31 — three cards cited, five deferred

Twelve citations across `wh-052`, `wh-053` and `wh-054` (ten distinct works, Jacobs 2008 and Backwell 2008
each serving two cards), nine of the ten open, and every card's list majority-open. Coverage went from
`cards 26/109` to `cards 29/109`.

**This batch is the batch-2 wall, moved one region south.** The advice from batches 2–4 was to re-cut by
source type, and this batch is what that looks like when a whole *subject* — the southern African Middle
Stone Age — turns out to sit almost entirely in closed journals. The three that shipped are the ones whose
load-bearing papers happen to be open: **Sibudu and Border Cave rest on PNAS papers** (Wadley 2009,
d'Errico 2012, Texier 2010), which are free in PMC six months after publication, plus two green deposits
(Jacobs 2008 at the ANU repository, Wadley 2020 at HAL) and one gold-OA *Scientific Reports* paper
(d'Errico 2022). The five deferred are the ones built on closed landmarks with no open deposit anywhere:

- **`wh-051` Blombos** turns on Henshilwood 2002 (engraved ochre), Henshilwood 2011 (the ochre workshop) and
  d'Errico 2005 (the *Nassarius* beads) — all *Science*/JHE, all closed, OpenAlex `oa_status: closed` with no
  deposit. Only Henshilwood 2018 (the silcrete drawing) is green (HAL). Two open against three closed: the
  list would be minority-open, so it fails the bar. Blombos is the flagship site of the whole batch and the
  most frustrating to leave, but half-citing it to a majority-paywalled list is worse.
- **`wh-056` Pinnacle Point** is the same story with different papers: Marean 2007 (the 164 ka shellfish),
  Brown 2009 (heat treatment) and Brown 2012 (the PP5-6 sequence) are all closed with no deposit; only
  Bar-Matthews 2010 (the Crevice Cave climate record) is green. One open against three closed.
- **`wh-057` ochre** and **`wh-058` behavioural modernity** are the batch's two concept cards, and they
  belong with the definitional set in batch 12, not here. Their spines are Barham 2002, McBrearty & Brooks
  2000, Klein, Powell 2009 and Shea 2011 — Curr. Anthropol. and *Science*, all closed; only Hoffmann 2018
  (Cueva de los Aviones, verified this session at 115–120 ka) and d'Errico & Stringer 2011 are open. Decompose
  them into claims, per the pilot's lesson, when batch 12 is worked.
- **`wh-055` Klasies River** rests on Singer & Wymer's 1982 monograph, Deacon and Wurz — older, closed, and
  book-length; the cannibalism and archaic/modern claims need care a later pass can give them.

**Three corrections**, made in English and all nine languages:

- **`wh-053`** said layers around 61 ka held "a bone point whose heat and impact damage matches arrowheads
  shot in modern experiments, and a bone needle, the oldest examples of either yet reported." Backwell,
  d'Errico & Wadley 2008 report **two points and a polished spatula, not a needle** — the slender point is
  only "consistent with a pin or needle-like implement," and there is no "oldest needle" claim; "heat" damage
  belongs to a later CT study, not this paper. Rewritten to the arrow point (read as such from form and wear)
  plus the double-bevelled bone wedges of d'Errico 2022, whose wear matches debarking trees and digging soil.
- **`wh-054`** said the Middle Stone Age record "reaches back beyond 227,000 years." The 2022 archive paper's
  own figure is ~227 ka, so "beyond" overstated it; changed to "to about 227,000 years."
- No correction was needed for `wh-052` or for the rest of `wh-054` — the beeswax "oldest" superlative held
  (d'Errico 2012, 13217, states it in as many words), the 29-notch fibula, the Conus infant burial, the 270
  engraved eggshells and the Jacobs 2008 dates all matched their sources exactly.

**On access, two calls worth recording.** Backwell 2008 is labelled `[Paywalled]` although its full text was
read and verified: OpenAlex lists no clean open deposit (the HAL-SHS record is behind the Anubis wall), so
the honest label is paywalled even though the claim was checked against the full paper. Backwell 2022 (the
227 ka archive) is the thinnest verification in the pass so far — **the claim is stated in the paper's title,
which is all that could be opened** (the QSR DOI is paywalled, the HAL deposit is Anubis-walled, and neither
Crossref nor Semantic Scholar carries an abstract). It is cited because the title *is* the claim, and flagged
here so a later pass can upgrade it if the abstract becomes reachable.

**On the mechanism.** Marker splicing by sentence index worked a fifth time, and the batch-1 warning bit
again exactly as predicted: the Japanese `wh-053` abstract splits two English sentences in two (bedding, and
the adhesive), giving 6+7 `。`-delimited sentences against the English 5+5. Caught by the per-block
"exactly five sentences" assertion, which failed loudly for `ja` alone; a small index remap for that one
card-language put the four markers on the right sentences, verified by printing every target sentence's tail
across all ten languages before applying.

**New host.** `openresearch-repository.anu.edu.au` (the ANU Open Research repository) carried the open Jacobs
2008 deposit and was not on the allowlist; add it. `cnrs.hal.science` is a HAL sub-host, already covered by
the `*.hal.science` wildcard.

### Unblocking: the cloud environment's allowlist

Kept for the next session that lands somewhere restricted. Network access is a property of the *cloud
environment*, not of the repo or the session. Set it at [claude.ai/code](https://claude.ai/code) → the cloud
icon above the message box → **Add cloud environment**, or hover an existing one and open its gear. In the
dialog set **Network access** to **Custom**, paste the list below into **Allowed domains**, and **tick "Also
include default list of common package managers"** — without it npm, apt and PyPI stop working and the test
tooling can no longer be installed.

Three caveats: the change applies to **sessions started afterwards**, not to a running one; changing the
allowed hosts re-runs the setup script and rebuilds the environment cache; and each environment has its
own list, so there is no org-wide allowlist to push to everyone. Docs:
https://code.claude.com/docs/en/cloud-environments#allow-specific-domains

```
doi.org
www.nature.com
www.science.org
www.pnas.org
pubmed.ncbi.nlm.nih.gov
pmc.ncbi.nlm.nih.gov
www.ncbi.nlm.nih.gov
europepmc.org
www.ebi.ac.uk
elifesciences.org
journals.plos.org
link.springer.com
www.sciencedirect.com
onlinelibrary.wiley.com
www.tandfonline.com
academic.oup.com
www.cambridge.org
royalsocietypublishing.org
www.frontiersin.org
www.mdpi.com
journals.uchicago.edu
www.jstor.org
www.persee.fr
journals.openedition.org
www.cairn.info
hal.science
*.hal.science
api.crossref.org
api.openalex.org
openalex.org
api.semanticscholar.org
www.semanticscholar.org
core.ac.uk
zenodo.org
osf.io
*.figshare.com
biorxiv.org
www.biorxiv.org
archive.org
biostor.org
web.archive.org
babel.hathitrust.org
catalog.hathitrust.org
www.biodiversitylibrary.org
whc.unesco.org
unesdoc.unesco.org
www.unesco.org
www.icomos.org
openarchive.icomos.org
stratigraphy.org
quaternary.stratigraphy.org
humanorigins.si.edu
www.si.edu
www.nps.gov
www.nhm.ac.uk
australian.museum
www.sahra.org.za
www.culture.gouv.fr
archeologie.culture.gouv.fr
www.culturaydeporte.gob.es
www.britishmuseum.org
www.eva.mpg.de
www.mpg.de
uni-tuebingen.de
*.uni-tuebingen.de
paleoanthro.org
par.nsf.gov
www.clim-past.net
cp.copernicus.org
archaeologybulletin.org
www.isita-org.com
www.folklore.ee
utoronto.scholaris.ca
openresearch-repository.anu.edu.au
hdl.handle.net
digital.csic.es
discovery.ucl.ac.uk
eprints.bbk.ac.uk
sajs.co.za
journals.iaepan.pl
api.crossref.org
en.wikipedia.org
```

Six hosts were added after attempt 2: `paleoanthro.org`, `par.nsf.gov`, `www.clim-past.net`,
`cp.copernicus.org` and `archaeologybulletin.org` all carried sources this batch needed, and none was on the
original list. Batch 1 added seven more of the same kind — `www.isita-org.com` (Journal of Anthropological
Sciences), `www.folklore.ee`, the institutional repositories `utoronto.scholaris.ca`,
`discovery.ucl.ac.uk` and `eprints.bbk.ac.uk` with the `hdl.handle.net` resolver in front of them, and
`sajs.co.za`. Expect the list to keep growing — open scholarship is scattered across small journal hosts
and university repositories, not concentrated in the big five publishers.

**Two of the most useful hosts have since put up a proof-of-work wall.** `hal.science` and
`digital.csic.es` now serve an Anubis challenge to non-browser clients, so the deposits behind them — which
is where several *open* copies of paywalled papers live, including the HAL copies this project already
cites for Harmand 2015 and PAGES 2016 — cannot be fetched with `curl` any more. They are still open to a
reader with a browser, so the existing citations stand; but when a batch needs one, look for the same paper
in PMC, in a university repository, or on the publisher's own site first. Driving a headless Chromium past
the challenge was tried and does not work here: the sandboxed browser cannot reach the session's egress
proxy, so it has no network at all.

The last line is deliberate and needs saying: **Wikipedia is for navigation, never for citation.** It is
the fastest way to find which paper a claim came from, and the bar still excludes it as a source. Every
other host on the list is a publisher, an index, a repository or an official body.

**Two hosts stayed unreachable even with access**, and both were worked around rather than fought:
`whc.unesco.org` and several publisher front-ends (science.org, pnas.org, wiley, annualreviews) sit behind
Cloudflare bot protection that refuses non-browser clients. Where the paper was open, the PMC or HAL or NSF
copy served instead; where it was UNESCO, the claim was carried by open journal articles and the UNESCO
record was not needed. If a future batch genuinely needs UNESCO, fetch it through a real browser.

If a needed host turns out to be missing mid-batch, the cheaper fix is switching that environment to
**Full** for the duration of the citation work rather than editing the list per site.

## Working notes

- **Keep a register.** `.claude/sources-register.md` (not shipped): every citation once verified, in final
  form, with what it was verified to support. McBrearty & Brooks will be wanted by six cards; verify it
  once, paste it six times, and the formatting cannot drift.
- **One batch, one commit.** Then `node .claude/check-style.js`, `node --check app.js`,
  `node .claude/test-sources.js`, and open one card of the batch in a browser.
- **Changelog.** One line per day, raising its count — "Sources added to N cards in the World History
  prehistory deck" — with its nine translations, per the house rule. Corrections found along the way get
  their own line, and should name what changed.
- **Coverage** is reported by `add-sources.js` on every run (`cards 75/109`), which is how the pass is
  tracked across sessions.
