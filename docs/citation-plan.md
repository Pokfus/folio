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

### Batch 1 · The oldest toolmakers (10)
`wh-008` knapping · `wh-013` Australopithecus · `wh-015` Oldowan · `wh-016` Homo habilis ·
`wh-017` Olduvai Gorge · `wh-021` Wonderwerk Cave · `wh-022` Acheulean · `wh-023` hand axe ·
`wh-098` control of fire · (`wh-014` if not taken in the pilot)

Spine: Harmand et al. 2015 on Lomekwi 3; Leakey, Tobias & Napier 1964 on *H. habilis*; Berna et al. 2012
(PNAS, open) on Wonderwerk; Lepre et al. 2011 on the earliest Acheulean; UNESCO's Ngorongoro/Olduvai
record; Smithsonian Human Origins for the genus-level cards.

### Batch 2 · *Homo erectus* across the Old World (10)
`wh-018` Homo erectus · `wh-019` Homo ergaster · `wh-020` Turkana Boy · `wh-024` Dmanisi ·
`wh-025` Java Man · `wh-026` Peking Man · `wh-027` Zhoukoudian · `wh-028` Homo antecessor ·
`wh-029` Atapuerca · `wh-030` Homo heidelbergensis

Spine: Lordkipanidze et al. 2013 on Dmanisi skull 5; Shen et al. 2009 on Zhoukoudian dating; Rizal et al.
2020 on Ngandong; Bermúdez de Castro et al. 1997 on *antecessor*; the UNESCO records and Advisory Body
evaluations for Zhoukoudian, Sangiran and Atapuerca — official, paginated PDFs with permanent URLs, and an
unusually good fit for the site cards.

### Batch 3 · Middle Palaeolithic: technique and the other humans (10)
`wh-032` Levallois · `wh-033` Mousterian · `wh-034` Neanderthal · `wh-035` Denisovans ·
`wh-036` Denisova Cave · `wh-037` Homo naledi · `wh-038` Homo floresiensis · `wh-039` Liang Bua ·
`wh-040` Homo luzonensis · `wh-041` Neanderthal extinction

Spine: Reich et al. 2010 and Krause et al. 2010 on Denisova; Slon et al. 2018; Berger et al. 2015 (eLife,
fully open) on *naledi*; Brown et al. 2004 and Sutikna et al. 2016 on Flores; Détroit et al. 2019 on
Luzon; Higham et al. 2014 on the Neanderthal disappearance.

### Batch 4 · The origin of *Homo sapiens* (10)
`wh-031` Middle Stone Age · `wh-042` Toba catastrophe theory · `wh-043` Homo sapiens · `wh-044` Omo remains ·
`wh-045` Jebel Irhoud (if not taken in the pilot) · `wh-046` Homo sapiens idaltu · `wh-047` Mitochondrial Eve ·
`wh-048` Y-chromosomal Adam · `wh-049` Skhul and Qafzeh · `wh-050` Aterian

Spine: Hublin et al. 2017 and Richter et al. 2017 on Jebel Irhoud; McDougall, Brown & Fleagle 2005 on Omo;
White et al. 2003 on Herto; Poznik et al. 2013 and Karmin et al. 2015 on the Y-chromosome coalescent;
Hershkovitz et al. 2018 on Misliya; McBrearty & Brooks 2000 for the MSA framing. **`wh-047` and `wh-048`
need care** — the dates have moved repeatedly, and the cards should be checked against the current
estimates rather than cited to whatever was true when they were written.

### Batch 5 · The southern African record and modern behaviour (8)
`wh-051` Blombos Cave · `wh-052` Howiesons Poort · `wh-053` Sibudu Cave · `wh-054` Border Cave ·
`wh-055` Klasies River Caves · `wh-056` Pinnacle Point · `wh-057` ochre · `wh-058` behavioural modernity

Spine: Henshilwood et al. 2002 and 2011 on Blombos; Marean et al. 2007 on Pinnacle Point; Wadley on Sibudu;
d'Errico on ochre and engraving; McBrearty & Brooks 2000 for the "revolution that wasn't" framing that
`wh-058` should be reconciled against. South African Heritage Resources Agency records where a site card
needs an official one.

### Batch 6 · Out of Africa: Sahul and the Americas (10)
`wh-059` Madjedbebe · `wh-060` Lake Mungo remains · `wh-061` Beringia · `wh-062` Settlement of the Americas ·
`wh-063` Paleo-Indians · `wh-091` Clovis culture · `wh-092` Clovis point · `wh-093` Folsom tradition ·
`wh-094` Monte Verde · `wh-095` Meadowcroft Rockshelter

Spine: Clarkson et al. 2017 on Madjedbebe; Bowler et al. 2003 on Mungo; Dillehay et al. 2008 on Monte
Verde; Waters & Stafford 2007 on Clovis chronology; Adovasio on Meadowcroft; the UNESCO Willandra Lakes
record; National Park Service records for the American type sites, which are official and permanent.
**This batch is the most contested in the deck** — the peopling dates are actively disputed, and the
cards' hedges need to survive contact with the sources rather than be sharpened by them.

### Batch 7 · Upper Palaeolithic Europe: the industries (9)
`wh-064` Cro-Magnon · `wh-065` Châtelperronian · `wh-066` Aurignacian · `wh-071` Gravettian ·
`wh-077` Solutrean · `wh-079` Magdalenian · `wh-080` microlith · `wh-081` spear-thrower · `wh-082` bow and arrow

Spine: Higham et al. 2011 on the earliest Aurignacian; Hublin et al. 2012 on the Châtelperronian
attribution; Nigst et al. 2014; Banks et al. on Solutrean/Magdalenian ranges; Sano et al. 2019 and
Backwell & d'Errico on projectile technology. French heritage-ministry records for the eponymous sites.

### Batch 8 · Upper Palaeolithic art: portable (9)
`wh-067` Lion-man · `wh-068` Hohle Fels · `wh-069` Venus of Hohle Fels (if not in the pilot) ·
`wh-070` Divje Babe flute · `wh-072` Venus figurines · `wh-073` Venus of Willendorf ·
`wh-074` Dolní Věstonice · `wh-075` Sungir · `wh-076` Mal'ta-Buret' culture

Spine: Conard 2003 and 2009 on the Swabian Jura figurines; Conard, Malina & Münzel 2009 on the flutes;
Kurat/Antl-Weiser via the Naturhistorisches Museum Wien for Willendorf; Trinkaus on Sungir; Raghavan et al.
2014 on the Mal'ta genome; the UNESCO Swabian Jura Caves record. **`wh-070` needs its hedge checked** —
whether the Divje Babe object is a flute at all is disputed, and the card must not read as settled.

### Batch 9 · Upper Palaeolithic art: rock and cave (6)
`wh-083` cave painting · `wh-084` Chauvet Cave · `wh-085` Cave of Altamira · `wh-086` Lascaux ·
`wh-087` Cosquer Cave · `wh-097` petroglyph

Spine: Quiles et al. 2016 on the Chauvet chronology; Aubert et al. 2014 and 2021 on Sulawesi, which
`wh-083`'s "at least 45,500 years ago" rests on; Pike et al. 2012 on uranium-series dates. UNESCO records
for Altamira, the Vézère valley and the Côa Valley — the last is directly what `wh-097` describes. This is
the batch where official sources carry the most weight.

### Batch 10 · Ice-age climate and megafauna (8)
`wh-010` Pleistocene · `wh-011` Ice age (if not in the pilot) · `wh-012` Last Glacial Period ·
`wh-078` Last Glacial Maximum · `wh-088` woolly mammoth · `wh-089` Quaternary extinction event ·
`wh-090` Younger Dryas · `wh-096` Doggerland

Spine: the ICS International Chronostratigraphic Chart and the Gibbard/Cohen GSSP papers; Clark et al. 2009
on the LGM; Rasmussen et al. 2014 on the Greenland event stratigraphy; Stuart on megafaunal extinction
chronology; Gaffney et al. on Doggerland. Mostly open, and much of it official stratigraphy — the easiest
batch of the set.

### Batch 11 · After the ice (11)
`wh-099` Mesolithic · `wh-100` Epipaleolithic · `wh-101` Nordic Stone Age · `wh-102` Holocene ·
`wh-103` Preboreal · `wh-104` Boreal · `wh-105` Atlantic period · `wh-106` Blytt–Sernander sequence ·
`wh-107` Holocene climatic optimum · `wh-108` post-glacial rebound · `wh-109` 8.2-kiloyear event

Spine: Walker et al. 2009 and 2018 on the Holocene GSSP and its subdivision (open, and official for the
epoch cards); Alley et al. 1997 and Thomas et al. 2007 on the 8.2 ka event; Peltier on glacial isostatic
adjustment; Danish and Swedish national heritage records for the Nordic sequence.

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
en.wikipedia.org
```

Six hosts were added after attempt 2: `paleoanthro.org`, `par.nsf.gov`, `www.clim-past.net`,
`cp.copernicus.org` and `archaeologybulletin.org` all carried sources this batch needed, and none was on the
original list. Expect the list to keep growing — open scholarship is scattered across small journal hosts,
not concentrated in the big five publishers.

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
- **Coverage** is reported by `add-sources.js` on every run (`cards 34/109`), which is how the pass is
  tracked across sessions.
