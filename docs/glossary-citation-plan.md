# Citing the glossary — batch plan

The glossary is **333 terms and not one of them carries a source**. `window.GLOSSARY_SOURCES` is an empty
table; the fold at the foot of a gloss popup never appears. This is the plan for filling it. Not part of
the site.

It is the sibling of `docs/citation-plan.md`, which took the 109 prehistory cards from nothing to five
sources each over 27 batches. Everything that plan learned about *finding* sources applies here unchanged
and is not restated — read its logs before working a batch. What follows is what is **different** about the
glossary, and the batches.

## How many

**At least two citations per term.** A glossary description is exactly three sentences; two works behind
three sentences is an honest apparatus, where two works behind a card's ten-sentence abstract was not — which
is why the card bar was raised to five and this one is not.

Two is a floor, not a target. Where a term's three sentences genuinely rest on three or four separable
claims — a date, a measurement, a naming — cite what they rest on and let the list run to four or five.
Where one authoritative work carries all three sentences, cite it and one corroborating work rather than
padding to a number.

## What counts as a source

Per the request, a citation qualifies if it is **academic or scholarly, a museum, a government body, or a
reputable NGO or intergovernmental organisation** — and, as on the cards, it must also be:

1. **Publicly reachable.** Anyone can open it without a subscription. A paywalled landmark paper may be
   cited when it is the defining publication for the claim, but **the majority of a term's list must be
   open**, exactly as on the cards. With a two-source list that means at most one paywalled work.
2. **Stably linked.** A DOI, a repository record, an agency permalink. Not a search result.
3. **Locatable.** A page range, a numbered section, a named heading. "Somewhere on this site" is not a
   footnote.
4. **Not an encyclopedia.** Wikipedia is where the research starts, never what a term stands on, and
   Britannica is the same case one step up. See the note under Phase 3 for where this rule meets the CIA
   World Factbook, which is the one genuinely contested case in the whole pass.

Form is Chicago **note** form ending in the URL as plain text, with an `[Open access]` or `[Paywalled]`
label after the closing period — identical to the cards, and `add-sources.js` enforces the link.

## What is different from the card pass

Four things, and three of them make this pass cheaper per term.

**Markers are optional.** On a card every source must be pointed at by a `<sup class="fn" data-fn="N">`
marker and the tooling refuses a card that breaks it. On a term the list alone is honest — three sentences
drawn from two reference works are fully described by naming them. `add-sources.js` only refuses a marker
that points *past* the end of the list.

**So the default is: no markers, no prose change, no translation work.** That is the whole economy of this
pass. A term whose description survives reconciliation untouched costs two citations and nothing else.

**A corrected description costs nine translations.** Glossary descriptions live per-language in
`i18n/gloss-<lang>.js`, and `add-sources.js` does not touch them — it writes the English description and the
sources, and nothing else. So a term whose prose has to change needs a **second command in the same batch**:

```
node .claude/add-sources.js  <batch>.json     # sources (+ the corrected English description)
node .claude/add-lang.js     <lang>.json      # the same correction in es/fr/de/it/nl/ru/ar/zh/ja
```

Leaving that out strands nine languages on a claim the English no longer makes, which is worse than the
state we started in. Budget for it: on the cards, every batch produced corrections, and the count went up
rather than down as the pass got better at looking.

**A description is shared across every deck and must stay deck-agnostic.** The house rule in CLAUDE.md — a
gloss popup defines a term on its own terms, never within the context of one card or culture — binds a
*corrected* sentence exactly as it binds a new one. Reconciliation is not a licence to make a term specific.

## Per-term work

1. **Search the register first** (`.claude/sources-register.md`, 309 verified works). For Phase 1 this is
   most of the job — the prehistory terms restate claims the prehistory cards already make, and the works
   are already opened, formatted and labelled.
2. **Find** two qualifying sources, or one plus a corroborating record.
3. **Open each one.** Confirm it supports the specific sentences. Record the locator in the register.
4. **Reconcile the three sentences against what the sources actually say.** Correct, soften, or cut what
   they do not bear out. If the prose changes, the nine translations change with it.
5. **Apply** with `node .claude/add-sources.js <batch>.json`, then `add-lang.js` if anything moved.
6. **Log** the batch below, including what could not be sourced and what was dropped.

## Tooling — batch G0, before anything else

Three small gaps, none of them blocking but all of them cheap:

- **`.claude/gloss-source-audit.js` does not exist.** The cards have `source-audit.js`; the glossary has no
  way to ask where the pass stands beyond `Object.keys(GLOSSARY_SOURCES).length`. Write the mirror: per-term
  count, open/paywalled split, and the terms below the bar, with `--all` and `--csv` like its sibling.
- **The bar is not a constant anywhere.** `SRC_TARGET = 5` in app.js is the card bar and every script slices
  it out by text so they cannot disagree. Add **`const GLOSS_SRC_TARGET = 2;`** beside it and have the new
  audit and `add-sources.js` read it the same way. Without it, "two" lives only in this document.
- **`add-sources.js` does not warn a short term.** It warns a card under `SRC_TARGET`; the glossary path has
  no equivalent. One line, once the constant exists.

Optional and worth doing once Phase 1 is under way: paint the **admin glossary list** with the same coverage
chip the card list carries, so the pass can be worked straight down the list.

## Reachability, measured 2026-08-01

The card pass's pilot was stopped dead by an egress policy that blocked every scholarly host, so this was
checked before the batches were cut rather than after. From this sandbox:

| host | | notes |
|---|---|---|
| `humanorigins.si.edu` | **200** | the Smithsonian species and fossil records — the spine of Phase 1 |
| `www.ncbi.nlm.nih.gov/pmc`, `www.ebi.ac.uk/europepmc` | **200** | the open-access corpus, and the `fullTextXML` route |
| `api.crossref.org`, `doi.org` | **200** | metadata and abstracts for paywalled landmarks |
| `archive.org`, `gutenberg.org` | **200** | the public-domain founding literature |
| `stratigraphy.org` | **200** | the ICS chart — Phase 1's geological-time batch |
| `millercenter.org` | **200** | UVA's presidential biographies — the spine of Phase 2 |
| `archives.gov`, `founders.archives.gov`, `history.state.gov`, `history.house.gov`, `senate.gov` | **200** | the US government record |
| `whitehousehistory.org` | **200** | NGO, useful as a second source on the early presidencies |
| `cia.gov/the-world-factbook` | **200** | see the Phase 3 note |
| `data.un.org`, `unstats.un.org`, `api.worldbank.org`, `data.worldbank.org` | **200** | country figures and membership |
| `noaa.gov`, `earthobservatory.nasa.gov`, `bas.ac.uk`, `ats.aq` | **200** | Phase 4's physical geography |
| `fs.usda.gov`, `natmus.dk`, `ccthita.org` | **200** | forest service, National Museum of Denmark, Tlingit & Haida |
| `whc.unesco.org` | 403 | **blocked here.** Cited freely by the card pass from another sandbox; do not plan a batch around it |
| `loc.gov`, `www.usgs.gov`, `www.si.edu` (root), `un.org` (root) | 403 | subdomains often work where the root does not — `humanorigins.si.edu` and `data.un.org` both do |
| `pnas.org`, `royalsocietypublishing.org`, `jfklibrary.org`, `powo.science.kew.org` | 403 | publisher-side blocks; reach the same papers through PMC / Europe PMC / a repository |
| `sahris.sahra.org.za` | no response | the South African heritage record, unreachable, as batch 20 found |

**A 403 is a fact about this sandbox, not about the source.** Record it in the log when it costs a citation,
the way batch 21 recorded the Anubis walls, so the next pass does not re-run the same fetch.

## The shape of the glossary

| group | terms | |
|---|---|---|
| prehistory, palaeoanthropology and geological time | 66 | Phase 1 · batches G1–G8 |
| Indigenous peoples, and the odds and ends | 8 | Phase 1 · batch G9 |
| continents, oceans and physical geography | 17 | Phase 1 · batch G10 |
| US presidents | 45 | Phase 2 · batches P1–P7 |
| countries and states of the world | 197 | Phase 3 · batches C0–C12 |
| **total** | **333** | |

## Order, and why

**Phase 1 first (91 terms).** Three reasons. It is where the register pays — most of these terms restate
claims the cited prehistory cards already make, so a large share of the citations exist in final form and
need no fetch at all. It is where the gap is most visible — a reader who follows a gold `data-new` term out
of a fully-cited card lands in a popup with no apparatus, which reads as the citations stopping at the card
edge. And it is where reconciliation is most likely to turn up real errors, because these are the terms
making datable, measurable claims.

**Phase 2 second (45 terms).** One clean spine, one era-shaped second source, no research spiral. It is the
batch to run when the register is exhausted and Phase 1 has slowed down.

**Phase 3 last (197 terms).** Sixty percent of the glossary and the least sensitive to *which* source is
picked, since a country's three sentences are geography, economy and a compressed national history — the
kind of claim official statistics and national records exist to support. Long, mechanical, and safe to
interleave with other work.

Phase 4 does not exist: the physical-geography and peoples terms are folded into Phase 1 as G9 and G10
rather than left to the end, because they are small and they are the terms most likely to need care rather
than volume.

---

# Phase 1 · Prehistory, science, peoples and geography (91 terms, 10 batches)

The register is the first stop for every one of these. Where a batch names a work below, it is a
**candidate** — chosen from what the terms claim, not yet verified for this use. Nothing goes into
`glossary.js` unopened, and a register entry is re-read before it is extended to a new claim (batch 25's
warning: two correctly-recorded entries could not be re-opened, and a top-up that cannot re-read its own
source should say so rather than guess).

### G1 · The genus records (8 terms)
`Homo` · `Hominini` · `Genus` · `Australopithecus` · `Homo_habilis` · `Homo_erectus` · `Homo_sapiens` ·
`Neanderthal`

Spine: the **Smithsonian Human Origins species records**, which batch 19 established are open by policy,
locatable, and carry exactly what these terms claim — spans, brain volumes, discoverers, type specimens.
In the register already: `si-habilis`, `si-erectus`, `si-afarensis`, `si-africanus`, `cela-conde-ayala-2003`
(the genera and who belongs in them), `anton-2016`, `stringer-2016`, `linnaeus-1758`, `king-1864`,
`green-2010`, `kimbel-villmoare-2016`. **`Genus` is the odd one out** and the batch's real work: it is a
nomenclatural term, so the source is the code that governs it — the ICZN's *International Code of Zoological
Nomenclature*, whose text is published online by the Commission itself.

### G2 · The species and the specimens (9 terms)
`Australopithecus_afarensis` · `Australopithecus_africanus` · `Ardipithecus_kadabba` ·
`Ardipithecus_ramidus` · `Kenyanthropus_platyops` · `Lucy_(Australopithecus)` · `Taung_Child` ·
`KNM-WT_40000` · `Laetoli_footprints`

Same spine, plus the register's `falk-2012` (the Taung endocast measured) and `masao-2016` (the trackway
dated). **Three terms need new work**: both *Ardipithecus* species — White et al. 2009 and Haile-Selassie
2001 are closed, so look for the Smithsonian records and the open review literature first — and
`KNM-WT_40000`, whose founding paper (Leakey et al. 2001) is closed and whose best open restatement is
likely to be a paper *citing* it as a comparison, per batch 20's rule.

### G3 · Industries and technique (6 terms)
`Oldowan` · `Acheulean` · `Mousterian` · `Lomekwian` · `Levallois` · `Knapping`

Almost entirely register: `braun-2019`, `plummer-2025`, `torre-2016`, `key-lycett-2017`, `harmand-2015`,
`li-2022`, `muller-2022`. **`Mousterian` and `Levallois` are the gap** — batch 16 found one 2024 open review
that states the Bordes–Binford debate and Dibble's reduction thesis; check whether it also carries the
definitions, and if not, the Levallois method has a substantial open experimental literature.

### G4 · The three-age scheme and the people who built it (8 terms)
`Three-age_system` · `Stone_Age` · `Bronze_Age` · `Iron_Age` · `Prehistory` ·
`Christian_Jürgensen_Thomsen` · `John_Lubbock,_1st_Baron_Avebury` · `National_Museum_of_Denmark`

This is batch 17a's ground and the register holds all of it: `thomsen-ellesmere-1848` (the founding text in
English), `rowley-conwy-2004`, `kanjanajuntorn-2020`, `lubbock-1865`, `cooper-grebnev-2023` (where the
Bronze Age does not apply), `mackenthun-mucher-2021` (what the word "prehistory" does), `woods-2010`.
**`National_Museum_of_Denmark` is the batch's one institutional term** — the museum's own published account
of its collections is the body-responsible source, and `natmus.dk` is reachable.

Carry batch 17a's corrections into the terms: Thomsen ordered a museum's collection, he did not prove the
sequence, and Worsaae tested it in the ground. If any of these three descriptions says otherwise, it is
wrong in the same way the card was.

### G5 · The Palaeolithic divisions and what follows (7 terms)
`Paleolithic` · `Lower_Paleolithic` · `Middle_Paleolithic` · `Upper_Paleolithic` · `Mesolithic` ·
`Neolithic` · `Neolithic_Revolution`

Register: `lubbock-1865` (the coinage of two of them), `westropp-1866` and `westropp-1872` (the coinage of
the third, and the fact that his 1866 triad ended in *Kainolithic*), `elliott-griffiths-2018`,
`larson-2014` (the start of farming), `stiner-2001`. **Run the sibling-consistency check across all seven
before citing any of them** — batch 12's finding was that definitional entries are wrong against each other
before they are wrong against the literature, and seven period terms sharing four boundaries is exactly that
shape. The Holocene base is 11,700 b2k = 9700 BCE, per `walker-2018`; anything here saying 9600 BCE or
10,000 BCE is carrying the pre-GSSP convention.

### G6 · Geological time (6 terms)
`Quaternary` · `Pleistocene` · `Holocene` · `Cryogenian` · `Ice_Age` · `Milankovitch_cycles`

Register: `gibbard-head-2010` (the Pleistocene GSSP), `walker-2009` and `walker-2018` (the Holocene GSSP and
its subdivision), `ics-major-divisions`, `hoffman-2017` (Snowball Earth), `hays-imbrie-shackleton-1976` (the
pacemaker of the ice ages), `pages-2016`, `batchelor-2019`. The **ICS chart** at `stratigraphy.org` is
reachable and is the body-responsible record for every boundary date these six state. NASA's Earth
Observatory feature on Milankovitch is reachable and is a government science-communication piece — usable as
a second source, but the 1976 paper is the one the claim rests on.

### G7 · The type sites (12 terms)
`Lomekwi` · `Lomekwi_3` · `Olduvai_Gorge` · `Dmanisi` · `Hadar,_Ethiopia` · `Gona,_Ethiopia` · `Taung` ·
`Le_Moustier` · `Saint-Acheul` · `Afar_Region` · `Lake_Turkana` · `Awash_River`

Register: `harmand-2015`, `dominguez-rodrigo-alcala-2016`, `plummer-2025`, `gentry-1995` (Olduvai's name and
its discovery), `ncaa-olduvai` (the site-managing authority), `mercader-2020`, `mercader-2021`. **The gaps
are the European and Georgian sites**: batch 13 established that the Georgian National Museum publishes no
per-object catalogue, so Dmanisi has to come from the open literature — Ferring et al. 2011 in PNAS is the
obvious candidate and PNAS is 403 here, so route through PMC. `Le_Moustier` and `Saint-Acheul` are French
type sites and the French culture ministry's scholarly portal carried two whole cards in batch 21; check it
before the journals. `Afar_Region`, `Lake_Turkana` and `Awash_River` are geographical rather than
archaeological terms and may be better served by geological survey and lake-science literature than by
palaeoanthropology.

### G8 · Ways of life, the disciplines, and the researchers (10 terms)
`Hunter-gatherer` · `Nomadism` · `Megafauna` · `Mosaic_evolution` · `Archaeology` · `Anatomy` · `Badlands` ·
`Raymond_Dart` · `Sonia_Harmand` · `Jason_E._Lewis`

**The hardest batch of Phase 1, and it should be worked last of the eight.** Two distinct problems.

*The definitional terms* — `Archaeology`, `Anatomy`, `Mosaic_evolution`, `Nomadism` — are the glossary's
equivalent of the definitional cards, and the pilot's lesson applies: there is no source "about
archaeology", there are sources behind each specific claim the description makes. Expect to cite a
disciplinary handbook or a society's own statement of scope alongside a paper for the substantive claim.
`Hunter-gatherer` and `Megafauna` are easier and already in the register (`zhu-2021`,
`smith-codding-2021`, `svenning-2024`).

*The three people* are a different problem again. Dart is dead and his 1925 paper is closed, so the
Smithsonian record and the open review literature carry him — batch 19 did exactly this. **Harmand and Lewis
are living scholars**, and the honest sources for a living person are their own landmark publication
(`harmand-2015`, already in the register, with both as authors) and an institutional record from the body
that employs them. Do not cite a news profile, and do not state anything about a living person that the
institutional record does not.

`Badlands` is a landform term and belongs with G10's physical geography in everything but the batch roster;
the US National Park Service publishes per-park geology records, though the exact URLs move.

### G9 · Indigenous peoples, and the odds and ends (8 terms)
`Hadza_people` · `San_peoples` · `Haida` · `Tlingit` · `Pacific_Northwest_Coast` · `Cedar` · `Sima_Qian` ·
`Johannesburg`

**The four peoples terms get a rule of their own, and it is not negotiable: a people's own institutions come
first.** The Council of the Haida Nation and the Central Council of the Tlingit & Haida Indian Tribes of
Alaska publish their own accounts of who they are, and `ccthita.org` is reachable; a nation's own record is
a governmental source in the most direct sense and it outranks an outside ethnography on questions of
identity, descent and territory. Pair it with peer-reviewed anthropology or archaeology for the historical
and material claims. For the Hadza and the San, where the corpus is dominated by outside researchers, prefer
recent work by or with those communities and say in the register when a source is an outside account.

`Cedar` is botanical: Kew's Plants of the World Online is 403 here, so the USDA Forest Service's *Silvics of
North America* and the tree-search repository are the reachable route for the North American species, plus a
taxonomic treatment for *Cedrus* itself. `Sima_Qian` is the last surviving China-collection term and its
sources are scholarly translations and studies of the *Shiji*. `Johannesburg` is a city and its two sources
are the municipality's or Statistics South Africa's record and an academic urban history.

### G10 · Continents, oceans and physical geography (17 terms)
`Africa` · `Europe` · `Asia` · `Americas` · `North_America` · `South_America` · `Antarctica` · `Arctic` ·
`Greenland` · `Sicily` · `Sahara` · `Near_East` · `Fertile_Crescent` · `Pacific_Ocean` · `Equator` ·
`Northern_Hemisphere` · `Southern_Hemisphere`

Reachable spines: **NOAA** (ocean facts, with per-page sources), **NASA Earth Observatory**, the **British
Antarctic Survey** and the **Antarctic Treaty Secretariat** (`ats.aq` — the treaty text itself is the source
for Antarctica's governance), and the **IHO**'s published limits of oceans and seas. USGS is 403 here.

Two warnings. The **continent terms are conventions, not natural kinds**, and the honest source for "Europe
is a continent" is a geographical body stating the convention, not a physical measurement — do not cite a
measurement for a definition. And `Near_East` and `Fertile_Crescent` are **historiographic terms with
contested extents**; cite the scholarship that discusses the term, as `mackenthun-mucher-2021` does for
"prehistory", rather than a source that simply uses it.

---

# Phase 2 · The US presidents (45 terms, 7 batches)

Every one of these descriptions has the same three-sentence shape: who he was and when he served, the
defining act or crisis of the presidency, and what came after. So the recipe is the same for all 45 and the
batches are cut only by which *second* source covers that era.

**Spine: the Miller Center at the University of Virginia**, whose presidential biographies are written by
named academic historians, are per-president permalinks, and are open. That is one source for all 45 and it
is a scholarly one.

**Second source, by claim type** — all reachable, all US government or established NGO:
- **Founders Online** (National Archives) for the first six, where the documentary record is the papers.
- **National Archives milestone documents** for the acts a presidency is remembered for.
- **The Senate Historical Office** and **House History, Art & Archives** for impeachments, treaties,
  contested elections and the vice-presidential successions — four of these men reached the office by
  succession and the congressional record is the body-responsible source for that.
- **The Office of the Historian, US Department of State** for foreign policy and for the presidents whose
  defining act was a treaty or a war.
- **The White House Historical Association** (NGO) where the claim is about the office rather than a policy.
- **The presidential libraries**, which are National Archives facilities, for the modern presidencies —
  though `jfklibrary.org` is 403 here and others may be, so check before planning a batch around one.

**One standing warning for this phase.** These forty-five descriptions compress contested history into three
sentences, and the recent ones compress live politics. Reconciliation here means checking that each sentence
states what the record states, in the record's own terms, and **softening or cutting an assessment the
sources do not make**. A citation attached to a characterisation the cited work does not offer is precisely
the failure this apparatus exists to prevent. Expect the last batch to be the slowest for this reason, not
the fastest.

| batch | presidents | second-source spine |
|---|---|---|
| **P1** | Washington, J. Adams, Jefferson, Madison, Monroe, J. Q. Adams (6) | Founders Online; State Dept. Office of the Historian |
| **P2** | Jackson, Van Buren, W. H. Harrison, Tyler, Polk (5) | NARA milestone documents; House and Senate records (Tyler's succession) |
| **P3** | Taylor, Fillmore, Pierce, Buchanan, Lincoln, A. Johnson (6) | NARA milestone documents; Senate impeachment record |
| **P4** | Grant, Hayes, Garfield, Arthur, Cleveland, B. Harrison, McKinley (7) | House election statistics; Senate records; NARA |
| **P5** | T. Roosevelt, Taft, Wilson, Harding, Coolidge, Hoover (6) | State Dept. Office of the Historian; NARA |
| **P6** | F. D. Roosevelt, Truman, Eisenhower, Kennedy, L. B. Johnson, Nixon (6) | presidential libraries (NARA); Office of the Historian |
| **P7** | Ford, Carter, Reagan, G. H. W. Bush, Clinton, G. W. Bush, Obama, Trump, Biden (9) | presidential libraries; NARA; congressional record |

---

# Phase 3 · The countries (197 terms, 13 batches)

197 terms, 394 citations at the floor. Every description has the same three-sentence shape — where the
country is and what it is made of; its landscape and economy; a compressed history ending at the present
constitutional order — so, as with the presidents, one recipe serves all of them.

### The recipe, and the one contested source

**Source A — an official country profile.** The **CIA World Factbook** is the obvious candidate: a US
government publication, per-country permalinks, named sections (Geography, Economy, Government, Background)
that satisfy the locatable rule, and it is reachable here. **This is a judgment call and it should be made
explicitly rather than slid into.** The card plan's bar excludes encyclopedias, and the Factbook is in
substance a government-published encyclopedia of countries; the request for this pass names government
sources as acceptable, which it plainly is. The position taken here: **the Factbook qualifies as one of the
two, and never as both.** A term whose entire apparatus is one general profile has not been cited, it has
been labelled.

Alternatives and supplements, all reachable: **UNdata** and **UN Statistics** country records, the **World
Bank** country data and its open API, and the country's **own government or national statistics office**,
which is the body-responsible source and is better than any of them where it can be read.

**Source B — carries the historical or constitutional sentence.** This is the one that has to be chosen per
country, and it is where the batch's time goes: an academic regional history, an open journal article, a
national archive or museum record, a UN or Commonwealth record of independence, a treaty text. The third
sentence of most of these descriptions is the one making a datable claim, and the profile does not carry it.

### Batch C0 · the recipe pilot (6 terms)

`France` · `Tuvalu` · `Kosovo` · `South_Sudan` · `State_of_Palestine` · `Vatican_City`

Chosen to break the recipe before 191 terms are run through it: a large state with a long history, a
micro-state whose description is mostly climate exposure, a state of limited recognition, the newest state,
a non-member observer state, and a theocratic city-state that is in none of the usual statistical series.
If the recipe survives these six it will survive the rest. **Do not start the regional batches until C0 is
logged.**

### Batches C1–C12 · by region

| batch | region | terms | |
|---|---|---|---|
| **C1–C3** | Europe | 47 | Albania → Vatican City, plus Greece, France, Georgia, Denmark, Russia, less the three in C0 |
| **C4–C6** | Asia | 43 | Afghanistan → Yemen, plus India, China, Japan, less State of Palestine |
| **C7–C9** | Africa | 53 | Algeria → Zimbabwe, plus Kenya and Tanzania, less South Sudan |
| **C10** | Oceania | 13 | New Zealand → Tuvalu, plus Australia, less Tuvalu |
| **C11–C12** | the Americas | 35 | Canada → Uruguay, plus Brazil |
| | | **191** | the 197, less the six worked in C0 |

Roughly 16 terms a batch. The twelve countries written earlier and at greater length — Greece, Kenya,
Tanzania, France, Georgia, Denmark, Australia, India, Russia, China, Japan, Brazil — are folded into their
regions rather than batched together, because their extra length is extra *claims*, and a batch of twelve of
them would be twelve times the hardest kind of work with no shared spine.

Work a region in one sitting where possible: the second source for one country in a region is very often the
second source for its neighbours, and the regional historiography is the same literature.

---

## Tracking

```
node .claude/gloss-source-audit.js          # once G0 has written it
node .claude/add-sources.js <batch>.json    # reports running glossary coverage on every run
```

Every batch gets a log section in this file, in the style of `docs/citation-plan.md`: what was cited, what
was corrected, what could not be sourced and was dropped, and any tooling finding. **The corrections are the
most valuable output of the pass** — say so in the changelog rather than quietly fixing dates.

**The changelog rule applies to every shipped batch**: one line per day for this kind of change, raising the
count rather than adding a second line ("Sources listed on 34 more glossary terms"), with its nine
translations added through a `.claude/add-lang.js` chrome batch.

**Re-run `node .claude/test-sources.js` after any batch that changes a description**, and
`node .claude/check-style.js` after any batch at all — it masks citations before applying the house rules,
so a real paper's title will not be reported as a violation, but a corrected sentence still has to pass.
