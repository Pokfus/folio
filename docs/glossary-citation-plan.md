# Citing the glossary — batch plan

> **Card ids here are the PRE-2026-08-04 numbering.** The World History collection was replanned from
> scratch on that date and its cards renumbered into the new running order, with twenty retired;
> `docs/world-history-card-plan.md` holds the old→new table and the retirement list. This file was
> deliberately **not** rewritten — it is a record of work done under the old ids, and a rewritten log is
> a worse log. Read a `wh-NNN` here through that table.

The glossary was **333 terms and not one of them carried a source**. `window.GLOSSARY_SOURCES` was an empty
table; the fold at the foot of a gloss popup never appeared. This is the plan for filling it. Not part of
the site. **As of 2026-08-02, 333 of the 333 are cited and at the bar** — batches G1–G11, P1–P7 with the P-topup, and C0–C12 with D1–D3, five of which also
corrected cards; run `node .claude/gloss-source-audit.js` for the live figure. All 333 carry in-text
markers, in all ten languages, after the rule changed from optional to required on 2026-08-01 (see "What
is different from the card pass"). G5 also settled the start of prehistory across the glossary, the deck
and every date line: **2.6 Mya**, with the disputed 3.3 Ma Lomekwi claim hedged rather than adopted; G6
found the pass's third wrong marker, on a card, and the rule it produced governs every batch that reuses
the register: **a source reused is reused for the claim the register records, and a new claim needs a
re-read.**

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
4. **An encyclopedia only if that encyclopedia cites its sources** (relaxed on request, 2026-08-03; it
   read "not an encyclopedia" before). Wikipedia is still where the research starts and never what a term
   stands on. The test is **per article, for that article's own claims** — a named author is not enough,
   and neither is a publisher's general reputation: the page must carry a bibliography or source list for
   what it asserts. Measured in batch N9, Dansk Biografisk Leksikon passes and both Britannica and Store
   norske leksikon fail. See the note under Phase 3 for where this rule meets the CIA World Factbook,
   which is the one genuinely contested case in the whole pass.

Form is Chicago **note** form ending in the URL as plain text, with an `[Open access]` or `[Paywalled]`
label after the closing period — identical to the cards, and `add-sources.js` enforces the link.

## What is different from the card pass

Three things, and one of them makes this pass cheaper per term.

**Markers are REQUIRED, exactly as on a card** — changed on request on 2026-08-01, after batches G1–G4 had
shipped 31 terms without them. Every source must be pointed at by a `<sup class="fn" data-fn="N">` marker,
every marker must have an entry behind it, and `add-sources.js` now refuses a term that breaks either rule,
the way it always has for cards. The markers must sit on the **same claims in all ten languages**;
`add-lang.js` warns when a translation's set differs from the English, and
`node .claude/gloss-source-audit.js` reports it standing, under "MARKERS ADRIFT FROM THE ENGLISH".

<details><summary>Why it was optional, and why that did not survive</summary>

The original reasoning was that three sentences drawn from two reference works are fully described by
naming them, where a card's ten-sentence abstract over five sources is not — so the default was **no
markers, no prose change, no translation work**, and a term whose description survived reconciliation
untouched cost two citations and nothing else. That was the whole economy of the pass, and it is why G1–G4
could cite 31 terms while touching prose on only the 13 that were actually wrong.

Two things retired it. Lists here do not stay at two: `Christian_Jürgensen_Thomsen` carries six sources and
`Three-age_system` five, and at that size a reader genuinely cannot tell which work carries the 1816
appointment and which the 1836 guidebook — the list has stopped explaining itself. And the inconsistency is
visible from the reader's side: someone who follows a gold `data-new` term out of a fully-marked card lands
in a popup where the numbers simply vanish, which reads as the apparatus giving up rather than as a
considered choice. The economy was real, but it was being paid for by the reader.

</details>

**A corrected description costs nine translations, and so does a marker.** Glossary descriptions live per-language in
`i18n/gloss-<lang>.js`, and `add-sources.js` does not touch them — it writes the English description and the
sources, and nothing else. So a term whose prose has to change needs a **second command in the same batch**:

```
node .claude/add-sources.js  <batch>.json     # sources (+ the corrected English description)
node .claude/add-lang.js     <lang>.json      # the same correction in es/fr/de/it/nl/ru/ar/zh/ja
```

Leaving that out strands nine languages on a claim the English no longer makes, which is worse than the
state we started in. Budget for it: on the cards, every batch produced corrections, and the count went up
rather than down as the pass got better at looking.

Markers ride the same road, and there is a tool for it: **`split-abstract.js` exports `pieces()` and
`mark()`**, so a term can be split into its three sentences in each language and the SAME map of sentence
index → source numbers applied to all ten at once. That is only safe when every language splits into
exactly three sentences, which is what `pieces()` is for — **check it before placing anything**, and if a
language splits differently, repair the splitter rather than writing a per-language map (batch 23's rule).

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

## Tooling — batch G0 — **DONE (2026-08-01)**

Four gaps, none of them blocking, all of them cheap, and all four closed before any citation was written:

- **`const GLOSS_SRC_TARGET = 2;`** now sits beside `SRC_TARGET` in app.js, with the reason for the lower
  bar written next to it. Everything else slices it out of app.js by text, exactly as the card scripts slice
  `SRC_TARGET`, so this file, the site and the scripts cannot disagree about what the bar is. Without it,
  "two" would have lived only in this document.
- **`.claude/gloss-source-audit.js`** is the mirror of `source-audit.js`: per-term count, open/paywalled
  split, the terms below the bar, `--all`, `--csv`, and `--tag=<tag>` to work one group at a time. It also
  reports two things the card audit does not need to — the terms whose list is **not majority-open**, and the
  terms carrying a citation with **no access label at all**, which is the failure mode a two-source list
  makes easy.
- **`add-sources.js` warns a short term** and its running coverage line now reports the glossary against the
  bar, not merely as cited/uncited.
- **The admin glossary list carries the coverage chip**, so the pass can be worked straight down the list the
  way the card pass was. Two states rather than the cards' three: there is no `sourcesBlocked` equivalent on
  a term, because five qualifying works for one card is a research finding worth recording on the card and
  two for a three-sentence description is not — a term that genuinely cannot reach the bar belongs in a batch
  log below, in prose. **Deck terms are skipped**: the bar is Folio's editorial standard for its own
  glossary, and a stranger's deck is not held to it.

The chip **leads** the tags column rather than trailing it, because that column truncates with an ellipsis
and a chip at its end is the first thing lost on a term with many tags — which is every country term.

`test-sources.js` (67) and `test-admin-editor.js` both pass; the only console output on `file://` is the
pre-existing TTS manifest fetch, identical before and after.

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
| prehistory, palaeoanthropology and geological time | 66 | Phase 1 · batches G1–G8 — **all done** |
| Indigenous peoples, and the odds and ends | 8 | Phase 1 · batch G9 — **done** |
| the poles, the desert, the sea and two names | 7 | Phase 1 · batch G10 — **done** |
| the continents, the island and the constants | 10 | Phase 1 · batch G11 — **done** |
| US presidents | 45 | Phase 2 · batches P1–P7 — **ALL DONE (2026-08-02)** |
| countries and states of the world | 197 | Phase 3 · batches C0–C12 — **C0–C12, D1, D2 and D3 done — **COMPLETE** (2026-08-02)**; 15 European and 35 Asian terms deferred with reasons (see the C3 and C5 logs); **Africa and Oceania are COMPLETE** |
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

### G1 · The genus records (8 terms) — **DONE (2026-08-01)**
`Homo` · `Hominini` · `Genus` · `Australopithecus` · `Homo_habilis` · `Homo_erectus` · `Homo_sapiens` ·
`Neanderthal`

Spine: the **Smithsonian Human Origins species records**, which batch 19 established are open by policy,
locatable, and carry exactly what these terms claim — spans, brain volumes, discoverers, type specimens.
In the register already: `si-habilis`, `si-erectus`, `si-afarensis`, `si-africanus`, `cela-conde-ayala-2003`
(the genera and who belongs in them), `anton-2016`, `stringer-2016`, `linnaeus-1758`, `king-1864`,
`green-2010`, `kimbel-villmoare-2016`. **`Genus` is the odd one out** and the batch's real work: it is a
nomenclatural term, so the source is the code that governs it — the ICZN's *International Code of Zoological
Nomenclature*, whose text is published online by the Commission itself.

### Batch G1 log — the register carries a glossary batch almost whole

#### 2026-08-01 — eight terms, 26 citations, three corrections

**Coverage went from 0/333 to 8/333, all eight at the bar.** Nineteen distinct works, **eighteen of them
open**; the one paywalled entry is Hublin et al. 2017, standing beside five open works on `Homo_sapiens`.

**The premise held, and it is the number to plan the rest of Phase 1 around: fifteen of the nineteen works
came out of `.claude/sources-register.md` with no new fetch.** A glossary term restates, in three sentences,
what a card spends ten on — so the works are already opened, already in final form and already labelled.
Only four had to be found, and three of those were needed because the terms are *not* about fossils.

**The four new works say something about which terms are hard, and it is not the ones the batch expected.**
The six species and genus terms were the easy half; the general terms were the work.
- **`Hominini`** needed a statement of the hominid/hominin shift. The usual scholarly citation for it,
  Wood & Richmond 2000 in *Journal of Anatomy*, is closed with no deposit anywhere. What carried it was
  **a museum explainer** — the Australian Museum's, which gives both definitions, names the same four
  genera the term names, and explains that "tribe" is a rank between subfamily and genus. Batch 18's rule
  for cards generalises to the glossary intact: **when the paper is shut, ask the institution.**
- **`Genus`** needed the naming rules, so the source is the body that writes them — the ICZN's *Code*. But
  **the Commission's own Code Online cannot be read from this sandbox**: `code.iczn.org` resets the
  connection, and the `iczn.org` and `nhm.ac.uk` pages that appear to carry the Code are iframe shells
  around that same host. The printed 4th edition is scanned in full on the Internet Archive with usable
  OCR, so **that is the copy opened and therefore the copy cited**. Recorded here because the next pass
  should not re-run those three fetches.
- **`Homo_sapiens`** and **`Neanderthal`** took the two remaining Smithsonian species records, which are
  simply the continuation of batch 19.

**Three corrections**, in English and all nine languages:

- **`Homo_habilis` was 2.3 to 1.5 million years ago, and the Smithsonian record says 2.4 to 1.4.** This is
  the *same error batch 19 corrected on `wh-016` on 31 July*, still sitting in the glossary a day later —
  which is batch 26's finding arriving from the other direction: **a correction does not travel between
  surfaces on its own, any more than it travels between cards.** Fixed in the description and on the date
  line, so the term and the card now agree. **The lesson for every later batch: when a card has been
  corrected, grep the glossary for the same figure.**
- **Its brain was "well under half the modern average," which the sources contradict.** Kimbel & Villmoare
  give Spoor's reconstruction of the type specimen itself at 729–824 ml, against a modern mean near 1,350 —
  half, not well under it. The term now gives the reconstructed volume of OH 7 and says it falls far short
  of a modern human's, which is both checkable and more informative than a fraction.
- **`Hominini` said "some schemes place chimpanzees inside Hominini as well."** This is a real position in
  the literature, but nothing openable states it, and the batch's own source puts gorillas, chimpanzees and
  humans on three separate tribes. **The clause was withdrawn rather than re-sourced** — batch 25's rule for
  a "who named it" clause applies to a "some scholars say" clause just as well. What replaced it is what the
  museum does state: that hominid once carried almost exactly the meaning hominin now has.

A fourth change is not a correction but a trade. **`Genus` said "a genus may hold a single species or
several hundred"**, which is true, uncontroversial and in none of the term's sources. It was swapped for the
Code's actual rules — the capital letter of article 5.1, and recommendation B6's different type face,
usually italics — which say something a reader can check and which the term was going to cite anyway.

**On the mechanism, two notes for G2.**
- **A prose change costs nine translations and `add-sources.js` will not tell you.** It writes the English
  description and the sources and nothing else; the nine `i18n/gloss-<lang>.js` files are a separate
  `add-lang.js` run per language. Three corrected terms meant 27 translated descriptions, edited from the
  shipped ones so only the changed clause moved. Budget for this, and prefer a correction that touches one
  clause over a rewrite that touches three.
- **`GLOSSARY_DATES` has no helper at all.** The date line on `Homo_habilis` had to be edited in
  `glossary.js` directly, since `add-sources.js` does not touch dates and `add-glossary.js` would have meant
  rewriting the whole entry with all nine translations. It re-parses clean, and the audit and the tests
  cover the result — but a term whose date line is wrong is exactly what a citation pass keeps turning up
  (it was `answerDate` on the cards, and `fix-field.js` exists for that reason). **If a second batch needs
  it, write the helper.**

Also worth recording: the Japanese `Hominini` translation read ヒト族族 — the tribe suffix doubled — in two
places. One sat in the sentence being corrected and the other did not; both were fixed, since the whole
description is resubmitted anyway.

### G2 · The species and the specimens (9 terms) — **DONE (2026-08-01)**
`Australopithecus_afarensis` · `Australopithecus_africanus` · `Ardipithecus_kadabba` ·
`Ardipithecus_ramidus` · `Kenyanthropus_platyops` · `Lucy_(Australopithecus)` · `Taung_Child` ·
`KNM-WT_40000` · `Laetoli_footprints`

Same spine, plus the register's `falk-2012` (the Taung endocast measured) and `masao-2016` (the trackway
dated). **Three terms need new work**: both *Ardipithecus* species — White et al. 2009 and Haile-Selassie
2001 are closed, so look for the Smithsonian records and the open review literature first — and
`KNM-WT_40000`, whose founding paper (Leakey et al. 2001) is closed and whose best open restatement is
likely to be a paper *citing* it as a comparison, per batch 20's rule.

### Batch G2 log — one open table, four terms

#### 2026-08-01 — nine terms, 27 citations, six corrected

**Coverage 8/333 → 17/333, all seventeen at the bar.** Eighteen distinct works, **every one of them open**;
twelve are new, six came out of the register. Batch G1's dividend held but at a lower rate, and the reason
is worth carrying: G1's terms were about *taxa*, which the register was full of, while these are about
*specimens*, which each need their own record.

**The batch's best return was a single open table.** Tattersall's 2023 survey of endocranial volumes
tabulates *Ardipithecus ramidus* at 300–350 ml, *A. afarensis* at 446, *A. africanus* at 461 and
contemporary *H. sapiens* at 1,330 — settling the brain figure on four terms in one fetch, **and correcting
two of them**. Batch 24's lesson for cards was that a debate attracts a review that covers several cards at
once; the glossary equivalent is a *comparative table*, and the terms that need one are the ones stating a
measurement. Look for the table before the paper.

**The Smithsonian's FOSSIL records are a distinct seam from its species records**, and they are what carried
this batch: `al-288-1`, `taung-child` and `knm-wt-40000` each give a Site, a Year of Discovery, a
Discovered by, an Age and a Species as catalogue fields, which is exactly the shape of a specimen term's
first sentence. Batch 19 found the species pages; these are the other half.

**Six terms corrected**, in English and all nine languages:

- **`Australopithecus afarensis`'s brain was 430 cc; the table says 446.** And "several hundred fossils"
  became "the remains of more than 300 individuals", which is what the museum states.
- **`Australopithecus africanus`'s was 450 cc; the table says 461.**
- **`Ardipithecus kadabba`'s canines were "a very ape-like pattern."** Both sources contradict it: the
  Smithsonian says they "resemble those in later hominins" and Rowan & Wood give "a partially functional
  C/p3 honing complex similar to that seen in female apes". *Partially* functional is the whole point of the
  fossil, and the term said the opposite. Rowan & Wood also define the honing complex in plain words, which
  is what let the sentence be rewritten rather than cut. The 2004 naming now credits Gen Suwa and Tim White
  alongside Haile-Selassie, as the museum does.
- **`Lucy` was found "by Donald Johanson and Tom Gray."** The Smithsonian's record says "Donald Johanson and
  Maurice Taieb". Both names circulate — Gray was the student with Johanson at the moment of the find, Taieb
  the expedition's co-director — and the term now says "a team led by Donald Johanson and Maurice Taieb",
  which is what the institution's record supports. Her "roughly two-fifths of one individual" is in nothing
  openable either; Wiseman 2023 gives "one of the most complete hominin skeletons" and a height of
  "approximately 1.05 m", which replaced "little over a metre".
- **`KNM-WT 40000` was "swollen by mineral crystals that grew inside the bone."** A specific mechanism no
  opened source states. The record says the cranium "was found in two pieces, with the braincase separated
  from the face" and "is considerably distorted", which is checkable and no less vivid. Its molars became
  the record's "small, thickly-enameled teeth" and its "cheekbones set well forward" its "high cheekbones".
- **`Laetoli footprints` had "a raised arch."** The Smithsonian's record gives the big toe in line and the
  heel-strike/toe-off gait and says nothing about an arch, so the arch went and the toe-off came in. Its
  vague "one of them treading in another's tracks" is now what Masao et al. record — G1 walking beside the
  larger G2 while G3 "superimposed its feet over those of G2" — and the second walker at the nearby locality
  is now McNutt et al.'s cross-stepping hominin, named as such.

**The working rule this batch settled, and it should govern the rest of the pass.** G1 swapped a true but
unsourced clause in `Genus` for one the Code carries. Doing that everywhere would strip the glossary of
correct information for the sake of the apparatus. The rule adopted here: **correct where a source
contradicts the term; leave where nothing contradicts it and the claim is uncontroversial; swap only when
the replacement is strictly better and the term was citing that work anyway.** So `A. africanus` keeps
Makapansgat and Gladysvale, which no source opened here names and none disputes, while `Lucy` loses Tom Gray,
whom the record actively contradicts.

**Two tooling findings.**
- **`pmc.ncbi.nlm.nih.gov` began serving a reCAPTCHA partway through this batch** — the same wall batches 23
  and 24 hit. `https://www.ebi.ac.uk/europepmc/webservices/rest/PMC<id>/fullTextXML` still works and is what
  the six journal citations link to, because it is the copy that was opened.
- **The nine translations were applied as asserted clause substitutions, not rewrites** — 99 find/replace
  pairs, each required to match exactly once or the run aborts, on the model of `fix-field.js`. It is the
  only way six terms across nine languages stays reviewable, and it caught nothing silently: what it did
  not catch was a Japanese replacement that turned one sentence into two, found by the sentence-count check
  afterwards. **Count the sentences per language after substituting**, exactly as `split-abstract.js`
  asserts 5+5 after marking.

### G3 · Industries and technique (6 terms) — **DONE (2026-08-01)**
`Oldowan` · `Acheulean` · `Mousterian` · `Lomekwian` · `Levallois` · `Knapping`

Almost entirely register: `braun-2019`, `plummer-2025`, `torre-2016`, `key-lycett-2017`, `harmand-2015`,
`li-2022`, `muller-2022`. **`Mousterian` and `Levallois` are the gap** — batch 16 found one 2024 open review
that states the Bordes–Binford debate and Dibble's reduction thesis; check whether it also carries the
definitions, and if not, the Levallois method has a substantial open experimental literature.

### Batch G3 log — the batch that corrected the cards

#### 2026-08-01 — six terms, 23 citations, four corrected, and two cards changed

**Coverage 17/333 → 23/333, all twenty-three at the bar.** Seventeen distinct works, **fifteen of them
open**; ten came out of `.claude/sources-register.md` and only one, Gennai 2024, is new to the project.
The prediction above held — the Mousterian and the Levallois were where the work was — but not for the
reason given. Both had sources; both had errors in the prose those sources sat next to.

**The finding: this batch corrected the CARDS, not just the terms.** Batch G1 established that a
correction does not travel between surfaces on its own, and read it one way — a card is fixed, so grep
the glossary. G3 is the same rule running backwards, and it is the more valuable direction, because a
term is three sentences and a card is ten, so the term is where a bad figure is quickest to spot and the
card is where it does the most damage.

- **The `Mousterian` began 160,000 years ago, and nothing openable says so.** Gennai 2024, the one open
  source that states the industry's span, gives "approximately 300/250 thousand years Before the Present
  … to around 40 thousand years calibrated Before the Present". Worse, 160,000 contradicted the term's own
  parent: `Middle_Paleolithic` opens at 300,000, `wh-003` opens at 300,000, and the Mousterian is the
  Middle Palaeolithic's industry. **`wh-033` carried the same figure in its abstract AND on its date line,
  in ten languages**, with the sentence marked to Bordes 1961 — a 1961 *Science* paper that cannot be the
  source of a figure in b2k. Both surfaces now say 300,000, the card's first sentence points at Gennai as
  well as Bordes, and `wh-033` goes from eight sources to nine.
- **`wh-032` pointed a marker at a paper arguing the opposite of the sentence it marked.** The card's
  "many specialists argue it was worked out more than once rather than invented once and carried outwards"
  cited Soriano & Villa 2017 — who argue for "a rapid diffusion over wide geographic spaces of this
  innovation", which is the other position. Batch 23 found the pass's first wrong marker on `wh-098`; this
  is the second, and it was found the same way, by re-reading a source for a different surface. The marker
  moved onto the claim they do make, the 295–290 ka Italian Levallois, one sentence earlier. **Adler 2014
  carries the independent-invention argument alone**, which is what the sentence now says.
- **The `Acheulean` ended "between 200,000 and 130,000 years ago"** — the identical error batch 23
  corrected on `wh-022` a week earlier, still in the glossary, in ten languages and on the date line.
  De la Torre gives "ca 1.75 to 0.125 Myr". Now 125,000, matching the card.
- **The `Lomekwian` had the passive hammer the wrong way round.** It said the knappers rested the block on
  an anvil and struck downwards; Plummer et al. describe the core "held in both hands and struck downward
  onto a stationary block on the ground". The block moves and the anvil does not — which is the whole
  reason the technique is called *passive* hammer, and the term described it as if it were the active one.
  Its "single assemblage" also became "single excavated assemblage", which is what the review states.
- **`Levallois` said the method "yields thin, sharp-edged flakes."** Eren & Lycett 2012 — the source cited
  for the method, the naming, the tortoise core and the 300 ka horizon — measured exactly this and found
  the opposite: preferential Levallois flakes are "on average thicker across their surface area (as a
  whole) than debitage flakes", with an unusually *even* thickness and much less variability. The term now
  says what they measured. **A source cited for four claims is worth reading for the fifth**; the wrong
  one had been sitting beside four right ones.

**Two things about the works.** Batch 20's rule — when the founding paper is shut, find the paper that
cites it as a comparison — has a quieter cousin that carried three of these six terms: **the review
written for the neighbouring industry.** Plummer et al. 2025 is a Lomekwian paper and it defines the
Oldowan's span; de la Torre 2016 is an Acheulean paper and it is where Louis Leakey's Olduvai report is
restated. And **Gennai 2024 was found by searching Europe PMC for `TITLE:"Mousterian" AND OPEN_ACCESS:y`
sorted by citations** — a regional excavation report whose introduction happens to define the whole
technocomplex. For a term needing a definition rather than a result, the introduction of any open paper
in the field is a better bet than a search for a paper *about* the definition.

**Three tooling notes.**
- **`.claude/fix-gloss-date.js` now exists**, as batch G1's log said it should if a second batch needed
  it. It is `fix-field.js`'s glossary sibling: asserted find-and-set on `window.GLOSSARY_DATES`, rewriting
  only that block of `glossary.js`. Two of this batch's four corrections were on the date line, which is
  where a citation pass keeps finding them.
- **`link.springer.com` now 303s to `idp.springer.com/authorize`** for both the article and the PDF path,
  so Shott 2024 — open access, and opened by batch 16 — could not be re-read. Cited for exactly what the
  register records and no further, with the Crossref abstract confirming the one clause it carries here.
  **`hal.science`'s `/document` file path is now walled too** (batch 21 found the landing pages walled),
  so Schmidt et al. 2024 was reached through Europe PMC instead.
- **A sentence-count check needs the same guards as `split-abstract.js`.** A naive count of the nine
  translations reported four and five sentences where there were three, because `200.000` and `12,5` and
  `19. Jahrhundert` all end a sentence if you only look for a full stop. The three-sentence rule is worth
  asserting after every substitution — G2 was caught by it — but assert it with the splitter's guards, not
  without them.

### G4 · The three-age scheme and the people who built it (8 terms) — **DONE (2026-08-01)**
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

### Batch G4 log — ask the institution, and ask the man's own century

#### 2026-08-01 — eight terms, 34 citations, five corrected, and one finding for G5

**Coverage 23/333 → 31/333, all thirty-one at the bar.** Eighteen distinct works, **every one of them
open**, which is a first for this pass. Seven came out of the register unopened. Of the eleven new ones,
**nine are not journal articles at all**: six museum records, two out-of-copyright books and a
nineteenth-century translation. Batch 18's rule — when the paper is shut, ask the body responsible — and
batch 25's — a nineteenth-century idea's author is out of copyright, so he is openable — turn out to be
the same rule when the subject is the history of a discipline. There is no modern open literature on who
Thomsen was; there is a museum that still employs his arrangement and says so on its own website, and a
1914 biography that anyone can read.

**The batch's find: Thomsen did not devise the three-age system.** The Nationalmuseet's own history says
so plainly. Thomsen referred to the division in an 1825 letter, but as *"den gamle Tanke om de tre
Tidsaldre"* — the **old** idea of the three ages; L. S. Vedel Simonsen had put the theory forward ten
years earlier, and other antiquaries before and around him had theorised the same development; and
*"Thomsens fortjeneste er nok snarest, at han anvendte den i forbindelse med det unge museums samlinger"*
— his merit is rather that he applied it to the young museum's collections. Both `Three-age_system` ("he
worked it out") and `Christian_Jürgensen_Thomsen` ("who devised the three-age system") said otherwise, and
so did `wh-006`'s date line, which read "devised by". All three now credit him with establishing it rather
than inventing it. This is batch 17a's correction arriving from one step further back: that batch found
Thomsen did not *prove* the sequence, and the museum's record adds that he did not *originate* it either.

**Four more corrections.**
- **`John_Lubbock` did not carry the Ancient Monuments Act.** He carried the Bank Holidays Act — Hutchinson
  quotes his own diary getting it through at two in the morning — but Hutchinson also records that his
  ancient monuments bill "had gone to a second reading no less than seven times", that it "was thrown out
  in the House of Lords", and Lord Eversley's own words: "I was myself responsible for the framing of the
  Ancient Monuments Act of 1882. It need not be pointed out that Lord Avebury was the originator of the
  policy which led to it." Eversley then rejected the central provision of Lubbock's bill and wrote a
  different measure. The term credited him with both acts; it now credits him with one and with the
  policy behind the other, which is a better sentence as well as a true one.
- **`Stone_Age` ended "around 4000 to 2000 BCE" as societies entered the Bronze Age**, which no Bronze Age
  anywhere begins early enough to satisfy — its own date line said 3300 BCE, `Bronze_Age` says the Near
  Eastern Bronze Age opens about 3300 BCE, and `wh-005` says the same. Batch 12's rule again: a
  definitional term is wrong against its siblings before it is wrong against the literature.
- **`National_Museum_of_Denmark`'s collection did not open to the public in 1819**, or at least nothing on
  the museum's own site says so, and the pass does not keep a date it cannot open a source for. What the
  museum does state is better: the collection began in the loft above Trinitatis Church, and the
  antiquities reached Prinsens Palæ **in 1855**, not vaguely "the middle of the 19th century".
- The register itself carried **1835–43** where Rowley-Conwy writes **1836–43**, a batch-17a transcription
  slip, corrected in place.

**The finding this batch could not act on, and G5 must.** Folio speaks with two voices about when
prehistory begins. Every glossary term says **3.3 million years ago** — `Prehistory`, `Stone_Age`'s date
line, `Paleolithic`, `Lower_Paleolithic` — and every card says **2.6 million**, with Lomekwi 3 named as a
contested earlier claim (`wh-005`, `wh-007`). Both are defensible; what is not defensible is the glossary
stating flatly, as the start of the Stone Age, a date the glossary's own `Lomekwian` term describes as
debated. **G5 owns `Paleolithic`, `Lower_Paleolithic`, `Prehistory`'s siblings and the boundaries between
them, so G5 is where this is settled — for all four terms and their date lines at once.** Fixing half of
it here would have replaced a cross-surface inconsistency with an internal one, which is worse. Do not
close G5 without it.

**Two tooling notes.**
- **The sentence-count check now slices `split-abstract.js`'s own `pieces()` out of the file** instead of
  re-implementing it. G3's log said to assert the three-sentence rule with the splitter's guards; a
  hand-rolled counter reported four and five sentences for perfectly good Spanish, French, German, Italian
  and Russian, because `3300 a. C.`, `av. J.-C.`, `v. Chr.` and `до н. э.` all end a sentence if you only
  look for a full stop. **One gap remains**: a German ordinal before a capitalised noun — "der **1.**
  Baron Avebury" — still splits, because the splitter holds `19. Jahrhundert` and `25. August` by name and
  cannot generalise without swallowing real sentence ends. The batch therefore asserted that each
  substitution left the count **unchanged**, which is the honest invariant for a patch.
- **Rowley-Conwy 2004's PDF is a substitution cipher, not a uniform shift.** Batch G3 met a subset font
  whose glyphs were the ASCII codes shifted by a constant; this one maps each glyph separately, so the
  offset trick produces confident gibberish. Solve it from cribs (`the`, `Three`, `English`, `versions`)
  before believing a word of it.

### Batch GM — the markers, retrofitted

#### 2026-08-01 — 159 markers on 31 terms, in ten languages

Asked where the tiny numbers were in the gloss popups, and the honest answer was that there were none: the
plan had made markers optional and G1–G4 had shipped 31 cited terms without a single one. **The rule is now
required**, matching the cards, and the 31 have been marked retrospectively.

**Placement came out of the register, not out of the prose.** Each work's entry records what it was opened
for — `tattersall-2023` the brain volumes, `si-taung` the discovery year and the eagle-predation reading,
`hutchinson-1914` the Bank Holidays Act — so assigning a sentence to a source was mostly lookup rather than
judgement. That is the register paying for itself a third way, after batch 12's "the framework cards needed
no new sources" and G1's "fifteen of nineteen works came out of it unopened".

**One source was dropped rather than marked**, which is the new rule working as intended. `Knapping` cited
Muller, Shipton & Clarkson 2022 for a claim about how long the skill takes to learn — a claim the term does
not make. It was kept, but moved onto the sentence it does support (that knapping produced handaxes and
blades, which is what the paper compares); had it supported nothing in the term, the rule would have
required dropping it. **A source no sentence rests on is a reading list, and the marker rule is what makes
that visible.**

**The mechanism, which is reusable and should be reused.** `split-abstract.js` already exported `pieces()`
and `mark()` for the cards. A glossary description is a single block of three sentences, so one map of
sentence index → source numbers applies to all ten languages at once — provided every language really
splits into three. Thirty of the thirty-one did; the thirty-first was **German `John_Lubbock`, split in
half by "ab 1900 der **1.** Baron Avebury"**. Per batch 23's rule the splitter was repaired rather than
routed around: it already held `19. Jahrhundert` and `25. August` by naming the following noun, which
cannot generalise, so the new guard keys off the **preceding determiner** instead — a sentence never ends
on *der*, so a number after one is always an ordinal. Verified not to swallow a real sentence end
("…entstand 1892. Der Bau begann…"), and all 109 cards still split 5+5 in all ten languages afterwards.

Each insertion was asserted to change the text **only** by the markers it added, so no translation could be
silently reflowed. Rendering was then checked in a browser on all 31: every marker prints its number in
reading order, none blank, none past the end of its list, and a marker click opens the fold on the entry it
names.

### G5 · The Palaeolithic divisions and what follows (7 terms) — **DONE (2026-08-01)**
`Paleolithic` · `Lower_Paleolithic` · `Middle_Paleolithic` · `Upper_Paleolithic` · `Mesolithic` ·
`Neolithic` · `Neolithic_Revolution`

Register: `lubbock-1865` (the coinage of two of them), `westropp-1866` and `westropp-1872` (the coinage of
the third, and the fact that his 1866 triad ended in *Kainolithic*), `elliott-griffiths-2018`,
`larson-2014` (the start of farming), `stiner-2001`. **Run the sibling-consistency check across all seven
before citing any of them** — batch 12's finding was that definitional entries are wrong against each other
before they are wrong against the literature, and seven period terms sharing four boundaries is exactly that
shape. The Holocene base is 11,700 b2k = 9700 BCE, per `walker-2018`; anything here saying 9600 BCE or
10,000 BCE is carrying the pre-GSSP convention.

**G5 must also settle the start of prehistory, which G4 found and deliberately did not half-fix.** The
glossary says **3.3 million years ago** in `Paleolithic`, `Lower_Paleolithic`, `Prehistory` and
`Stone_Age`'s date line; the cards say **2.6 million** with Lomekwi 3 named as a contested earlier claim
(`wh-005`, `wh-007`). The glossary's own `Lomekwian` term calls that 3.3 Ma assemblage debated, so the
glossary contradicts itself as well as the deck. Pick one convention — the cards' hedged form is the
better-reviewed one — and apply it to all four terms, their date lines and their nine translations in a
single pass. **Do not close G5 without it.**

**Batch G5 log (2026-08-01).** Nine terms, 38 citation slots: the seven above, plus `Prehistory` and
`Stone_Age` re-marked because the batch moved the figure they open on. **All 333 terms now split into three
sentences in every language and 38 are at the two-source bar.**

**The mandate was carried out, and the whole chain now lines up.** Prehistory starts at **2.6 Mya** in
`Paleolithic`, `Lower_Paleolithic`, `Prehistory` and `Stone_Age`, with the disputed 3.3 Ma Lomekwi claim
kept as a hedge where a sentence has room and left standing alone on `Lomekwian` and `Lomekwi_3`, which is
where it belongs. The Palaeolithic now ends at **9700 BCE** (11,700 b2k) rather than 10,000, and the
Mesolithic begins there; `Upper_Paleolithic` ends at 11,700 BP rather than 12,000; `Neolithic` ends at 3300
BCE rather than 3000, which is where `Stone_Age` already ended and where `Bronze_Age` already begins. Seven
date lines moved. The sibling check the plan asked for is what found the last two of those: neither was in
the batch's brief, and both were wrong only against their own neighbours.

**The finding, and it is a caution about how this pass has been reading its own sources.** The `Neolithic`
term said the first clear signs of social ranking appear in that phase. It was contradicted twice over —
by `wh-009` (Smith & Codding: rank does not need farming) and by `fuller-stevens-2019`, which puts land
ownership and inherited rank with the *scaling up* to urbanism, not with the farming villages. The clause
was **withdrawn rather than re-sourced** and replaced with the reopened passage graves of
`schulz-paulsson-2019`, which the term can stand behind. But the neighbouring `Neolithic_Revolution` term
lists "private property and inherited rank" among the transition's consequences and that was **kept**,
because it is precisely Fuller and Stevens's argument and makes no claim to be the first of its kind. The
two look inconsistent and are not; the difference is the word *first*, and a batch that harmonises on
sight rather than on reading would have flattened one into the other.

**A source's title can read as a refutation of the sentence it is meant to support** — `eren-lycett-2012`,
"Why Levallois? … 'Preferential' Levallois Flakes versus Debitage Flakes", was opened for that reason
before being attached to `Middle_Paleolithic`'s "more standardized flakes", and it confirms the claim
outright. The habit is cheap and the failure it prevents is expensive: a citation whose own abstract
disputes the sentence above it is worse than no citation, because a reader who follows it learns that the
apparatus is not to be trusted.

**Two tooling gaps, both the same shape as batch 24's, both fixed rather than routed around.**
`split-abstract.js` held a run of initials but not a lone one, so "the archaeologist **V.** Gordon Childe"
split `Neolithic_Revolution` in half in English and five translations, and the Arabic clause had the same
`{2,}` bound, which broke it on "**ف.** غوردون تشايلد" and "جيسون **إ.** لويس". Both now hold a single
initial — in Latin script by requiring a following capitalised word, and in Arabic, which has no case, by
requiring a lone letter between whitespace and the stop. Re-checked against the whole corpus: **all 109
cards still split 5+5 in all ten languages**, and the only glossary terms that do not split into three are
genuinely four-sentence entries outside this pass.

**Twenty-six of the 38 slots needed no new reading** — batch 12's finding, and stronger here than on the
cards, because a period term makes no claim that some site or specimen term does not already make. Four
works were opened for the first time (`watkins-2017`, `lhote-2024`, `fuller-stevens-2019`,
`eren-lycett-2012`) and three shipped on cards without ever being registered were read and registered now
(`groucutt-2019`, `gilligan-2024`, `larsson-2016`).

**And the card sweep batch 26 asked for paid again.** `wh-001` carried "3.3 to 2.6 million years ago" as a
flat range — reading as though toolmaking spans it, where 3.3 is the disputed end — in its date line *and*
its abstract, and closed the Ice Age at "around 10,000 BCE" while its own abstract said 11,700 years ago.
Both were fixed in all ten languages. `wh-002` already had the hedged form, in all ten, and was the model
the glossary wording was lifted from; grepping for the FIGURE rather than the term is what turned up the
sibling that had it right.

### G6 · Geological time (6 terms) — **DONE (2026-08-01)**
`Quaternary` · `Pleistocene` · `Holocene` · `Cryogenian` · `Ice_Age` · `Milankovitch_cycles`

Register: `gibbard-head-2010` (the Pleistocene GSSP), `walker-2009` and `walker-2018` (the Holocene GSSP and
its subdivision), `ics-major-divisions`, `hoffman-2017` (Snowball Earth), `hays-imbrie-shackleton-1976` (the
pacemaker of the ice ages), `pages-2016`, `batchelor-2019`. The **ICS chart** at `stratigraphy.org` is
reachable and is the body-responsible record for every boundary date these six state. NASA's Earth
Observatory feature on Milankovitch is reachable and is a government science-communication piece — usable as
a second source, but the 1976 paper is the one the claim rests on.

### Batch G6 log — the batch that read its own sources for the count

#### 2026-08-01 — six terms, 30 citations, five corrected, and one card

**Coverage 38/333 → 44/333, all forty-four at the bar.** Sixteen distinct works, **fifteen of them
open**; the one paywalled entry is Hays, Imbrie & Shackleton 1976, standing beside three open works on
`Milankovitch_cycles`. **Ten of the sixteen came out of `.claude/sources-register.md` with no new
fetch** — the rate G1 predicted and G5 confirmed, and for the same reason: a period term makes no claim
that some card about a site, a specimen or a climate does not already make.

**The finding, and it is the pass's third wrong marker.** `wh-011` said "Earth has passed through at
least five major ice ages across its history" and pointed the marker at Hoffman et al. 2017. **That
paper does not say five, or any number.** It names the Neoproterozoic pair, "at least one such episode
in the early Paleoproterozoic era", and plots the record since 3.0 Ga in a figure that counts nothing.
The `Ice_Age` term carried the same claim, unmarked. The familiar five — Huronian, Cryogenian,
Andean-Saharan, Karoo, Quaternary — is a textbook enumeration and **nothing openable from here states
it**, so both surfaces now say what Hoffman supports: several such intervals over the past 2.4 billion
years. Batch 23 found the first wrong marker on `wh-098`, batch G3 the second on `wh-032`, and all
three were found the same way — **by re-reading a registered source for a different surface.** The rule
that follows is worth stating plainly: **a source reused from the register is reused for the claim the
register records, and a batch that wants it for a new claim has to re-read it.** Ten of this batch's
sixteen works were reused; the one that was stretched is the one that broke.

**Four more corrections.**
- **`Milankovitch_cycles` dated Milanković's work "in the 1920s and 1930s."** NASA's Earth Observatory
  feature — the only openable account of him — dates nothing: it gives his Belgrade chair from 1909, the
  65°N latitude that Köppen suggested, and "for about 50 years, Milankovitch's theory was largely
  ignored" before 1976. The decade was **withdrawn** rather than re-sourced, batch 25's rule for a "who
  named it" clause applied to a "when did he do it" clause, and what replaced it says more: the latitude
  and the fifty years of neglect, both quotable. Nothing else in the term moved — the 22.1–24.5° range is
  NASA's, the 19,000–23,000-year precession is straight out of the 1976 abstract, and PAGES 2016 carries
  the closing caveat outright ("eccentricity … does not appear in the spectrum of regional insolation
  changes; it merely modulates the amplitude").
- **`Ice_Age` put the last glacial's "coldest point around 20,000 years ago."** Its own sibling `wh-078`
  already gave the LGM as "roughly 26,000 to 19,000 years ago", cited; Batchelor gives c. 26.5 ka and
  Spratt & Lisiecki 21 ka. The term now gives the range, which agrees with the card and with both papers,
  and adds the sea level Spratt & Lisiecki measured. **The sibling check found this, not the sources** —
  batch 12's rule again.
- **`Pleistocene` said the epoch "saw the rise of large mammals such as mammoths, many of which later
  went extinct."** Mammoths arose in the Pliocene, and "many" is not a figure anyone can check. Svenning
  et al.'s abstract has one: "only 11 out of 57 species of megaherbivores (body mass ≥1,000 kg) survived
  to the present."
- **`Cryogenian`'s thaws were "followed within tens of millions of years by the first large and complex
  multicellular life."** Carlisle et al. 2024 states the checkable version — "unequivocal animal fossils
  first occur in the Ediacaran", with rangeomorphs at 574 Ma, some sixty million years after the Marinoan
  — so the term now says the first unmistakable animal fossils. `Holocene`'s "several parts of the world"
  likewise became "at least eleven", which is Larson et al.'s count of independent centres.

**One thing was deliberately left alone.** `Holocene` says the Meghalayan boundary is fixed in "a
stalagmite from a cave in north-eastern India". The ICS calls KM-A a **speleothem**, and so do the two
other open papers checked; nothing anywhere contradicts "stalagmite", and Walker et al. 2018 cannot be
opened from here to settle it. Batch G2's rule governs: correct where a source contradicts, leave where
nothing does. It is recorded in the register so a later batch can finish the job rather than rediscover
the question.

**Three tooling notes.**
- **Episodes is unreachable from this sandbox.** `doi.org/10.18814/epiiugs/…` times out, the publisher's
  PDF host `pdf.medrang.co.kr` fails DNS resolution, and `episodes.org` does not respond, so neither
  `gibbard-head-2010` nor `walker-2018-subdivision` could be re-read. Both are cited only for what the
  register records — and **both claims were independently confirmed from the SQS's own "Major divisions"
  page**, which is open and says the same in the same words. That page is the find of the batch: it is
  the whole GSSP inventory, not the Holocene note already registered, and it carried the Monte San
  Nicola ratification date, the NGRIP2 depth, the 99-year counting error and the Mawmluh speleothem
  between them.
- **`api.crossref.org/works/<doi>` paid again** (batch 22's route): science.org is 403 here, and Crossref
  serves the whole structured abstract of Hays, Imbrie & Shackleton 1976, including the sentence that
  supplies the 19,000–23,000-year precession pair.
- **`hal.science`'s `/document` path worked today**, where batch G3 recorded it walled behind Anubis, and
  so did the landing page. Worth re-testing rather than assuming; the walls come and go.

### G7 · The type sites (12 terms) — **DONE (2026-08-01)**
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

### Batch G7 log — the register pays for taxa, not for places

#### 2026-08-01 — twelve terms, 39 citations, eight corrected, and the pass's fourth wrong-figure sweep

**Coverage 44/333 → 56/333, all fifty-six at the bar.** Thirty-two distinct works, **every one of them
open** — the second batch after G4 with no paywalled entry at all. Seventeen came out of
`.claude/sources-register.md` unopened; **fifteen are new**, and that ratio is the batch's first finding.

**The register carries terms about taxa and periods; it does not carry places.** G1 predicted the register
would pay for most of Phase 1, and through G6 it did — ten of sixteen works in G6, twenty-six of
thirty-eight slots in G5. A type site breaks the pattern, and the reason is structural rather than bad
luck: a site's three sentences are **a location, an excavation history and a find**, and only the find is a
claim some card already makes. The palaeoanthropology came free; the geography, the administrative facts
and the dig histories all had to be found. Expect the same of G9 and G10, which are peoples and physical
geography and have no cards behind them at all.

**Eight terms corrected**, in English and all nine languages, and two of the eight are the same failure the
pass keeps finding.

- **`Olduvai_Gorge` was "about 48 km long", and the card that says otherwise was corrected in batch 17.**
  Gentry gives a main gorge of about 37 km joined by a side gorge and another nine to the Balbal
  depression — about 46 in all — and `wh-017` has said 46 in its abstract *and* on its date line since 31
  July. This is batch 26's finding arriving for the third time, and it is worth stating as a standing rule
  rather than a recurring surprise: **when a card is corrected, grep the glossary for the figure the same
  day.** Nothing else does it.
- **`Lomekwi_3` described the oldest known stone tools as being made the wrong way round** — the identical
  error batch G3 corrected on the `Lomekwian` term, still sitting on its sibling. The term said the stone
  was rested on an anvil and struck downwards; Plummer et al. describe the core "held in both hands and
  struck downward onto a stationary block on the ground". The block is the passive element and the core is
  the moving one, which is the whole reason the technique is called *passive hammer*. Two terms describe
  one industry and only one of them was fixed, which is the same lesson one level down: **a correction does
  not travel between siblings either.**
- **`Hadar`'s deposits were "between about 3.8 and 2.9 million years ago"; the Hadar Formation is
  ~3.45–2.95 Ma** (Rowan et al., in the abstract and again in the geological setting). The date line moved
  with it, from "deposits c. 3.8 – 2.9 Mya" to "Hadar Formation c. 3.45 – 2.95 Mya", and its early *Homo*
  maxilla went from "about 2.3" to **about 2.35 million years**, which is the Bouroukie Tuff 3 age.
- **`Lake_Turkana` had "more than nine-tenths" of its water from the Omo.** Hodbod et al. give 90% in one
  sentence and account for the rest — "with the remaining water balance coming from the Turkwell River" —
  so nine-tenths is the figure, not a floor under it. The same sentence settled the term's other two
  superlatives, the largest permanent desert lake and the largest alkaline lake, which `gownaris-2015`
  carries only the first of.
- **`Awash_River` was "about 1,200 km"; Tilahun et al. give 1,250.**
- **`Dmanisi` was "roughly 90 km southwest of Tbilisi"; Medin et al. give 85.**
- **`Le_Moustier` was "excavated from the 1860s onward."** Nothing openable supports it, and the one source
  that narrates the shelter's excavation history contradicts it: Pitarch Martí et al. say the Lower Shelter
  "was first excavated by Otto Hauser and then by Denis Peyrony", and Schmidt et al. date Hauser's work to
  1907. The sentence now says early 20th century and names both men, which is a better sentence as well as
  a defensible one. Batch 25's rule for a "who named it" clause covers a "when was it dug" clause exactly.
- **`Taung`'s "ancient cave deposits" states one side of a live argument as fact.** Parker, Hopley and Kuhn
  argue the hominin-bearing pink calcrete is of **pedogenic** origin, against the reading of the Dart and
  Hrdlička pinnacles as cave infill; Rowan and Wood, writing on the same locality in the same decade, still
  say "the cave sediments at Taung". **This is a case the pass had not met before — not a source
  contradicting the term, but two sources contradicting each other over a claim the term makes flatly.**
  The rule adopted: where the sources disagree and the term has no room to hedge, **say what both carry** —
  here "ancient tufa and calcrete deposits", which is Parker's own description of the deposits and which
  Rowan and Wood do not dispute. The question is recorded in the register rather than decided in a gloss.

**What could not be sourced, and was kept unmarked rather than dropped.** Four claims, each uncontradicted
and none marked: Dmanisi's medieval town and its volcanic and lake deposits (batch 13's finding confirmed a
second time — the Georgian National Museum publishes no per-object catalogue, and `museum.ge` redirects
while `dmanisi.ge` does not resolve); Saint-Acheul's archaeological garden, listed 1947 and opened 1998;
Gona's ~500 km², its six million years of deposits and its *Ardipithecus* fossils; and the Afar's
"purpose-built" Semera. Nothing was withdrawn this batch — a first — because in every case the sources were
silent rather than opposed.

**Three tooling findings.**
- **The French culture ministry's portal is half open from here.** Batch 21 built two whole cards on it, and
  its notice pages still work — `pop.culture.gouv.fr/notice/merimee/<ref>` returns the full record as
  embedded JSON, and `culture.gouv.fr` and `archeologie.culture.gouv.fr` are both 200. But **its search is
  blocked**: `api.pop.culture.gouv.fr` serves a "Requête bloquée" interstitial and the search URL 404s. So
  the portal is **usable if you already know the reference and unsearchable if you do not**, which is a
  different limitation from a 403 and worth planning around rather than rediscovering.
- **A non-OA flag in Europe PMC is not a verdict, but neither is a PMCID.** Batch 24 established that
  `isOpenAccess: N` often still has full text. Ferring et al. 2011 on Dmanisi has a PMCID (PMC3127884) and
  the `fullTextXML` route returns an **empty body** — not a captcha, not an error, nothing. Check the length
  of what comes back, not just the status code.
- **`api.crossref.org` was not needed once**, and neither was any paywalled work. Every one of the batch's
  thirty-two sources opened through Europe PMC's REST route, the Smithsonian, a conservation authority or a
  publisher's own gold-OA copy.

**A note on `si-afarensis` for whoever works G8.** It is marked on `Hadar` for naming "the sites of Hadar,
Ethiopia ('Lucy', AL 288-1 and the 'First Family', AL 333)". Its "more than 300 individuals" is the
**species** total across Hadar, Dikika and Laetoli — not Hadar's — so the term's "hundreds of *A. afarensis*
fossils" and its "at least 13 individuals" at AL 333 rest on nothing opened here. Both are uncontroversial
and both are kept; neither is marked. G6's rule again: a registered source is reused for what the register
records.

### G8 · Ways of life, the disciplines, and the researchers (10 terms) — **DONE (2026-08-01)**
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

### Batch G8 log — the batch that corrected nothing, and why that is a warning

#### 2026-08-01 — ten terms, 24 citations, **no corrections**, and the thinnest apparatus of the pass

**Coverage 56/333 → 66/333, all sixty-six at the bar.** Twenty-two distinct works, **every one of them
open**. Twelve came out of `.claude/sources-register.md` unopened; ten are new. Phase 1's prehistory,
palaeoanthropology and geological-time group is now complete — 66 of its 66 terms cited.

**This is the first batch in the whole pass, cards and glossary together, in which no source contradicted
anything.** Twenty-seven card batches and seven glossary batches had produced corrections every time, and
the count had been going *up* as the pass got better at looking. So the honest question is whether G8's
terms are unusually sound or whether this batch simply could not check them — and the answer is the second.

**The same batch has the highest count of unmarked, unsourceable clauses of any so far.** Nine claims across
seven terms are kept unmarked because nothing opened states them, and none is contradicted either: the size
of a forager band and the survival of such communities today; the whole of `Nomadism`'s third sentence on
portable wealth; `Megafauna`'s 10 kg lower bound; the word *anatomist* and veterinary anatomy; the French
and Lakota etymology of *badlands*; and — three in one term — Raymond Dart's Australian birth, his
retirement in 1958, and the osteodontokeratic hunting hypothesis that "has not been sustained". **A term
whose list shows two open sources looks exactly the same to a reader whether every sentence rests on them or
only one clause does.** That is the failure mode this batch discovered, and it is invisible from the audit,
which counts citations rather than covered claims.

The reason is structural and the plan half-predicted it. **A definitional term makes few datable claims, and
a biographical term about a living person makes claims no journal publishes.** There is no paper reporting
that Sonia Harmand took over the West Turkana Archaeological Project in 2012; there is no open work stating
where Dart was born. G7 found that the register pays for taxa and not for places; G8 adds that **the
literature itself pays for results and not for definitions or biographies**, which is a harder limit than a
sandbox's egress policy.

**Two routes did work, and both are reusable.**
- **A discipline's own statement of scope.** The plan predicted `Archaeology` would need "a disciplinary
  handbook or a society's own statement of scope", and the Society for American Archaeology's *What Is
  Archaeology?* carried the entire term, including its third sentence — "Prehistoric archaeological sites are
  those without a written record" against "Historical archaeology sites are those where archaeologists can
  use writing to aid their research".
- **The canonical textbook, out of copyright.** There is no modern open work that simply says what anatomy
  is. **Gray's *Anatomy of the Human Body* (20th ed., 1918) is on the Internet Archive in full**, and its
  Introduction defines the subject, the naked-eye/dissection sense, histology as "the minute structure of the
  various component parts of the body", comparative anatomy as "a consideration of adult forms in the line of
  human ancestry", and applied anatomy as the application "to the various pathological conditions which may
  occur". This is batch G4's rule — a nineteenth-century idea's author is out of copyright, so he is
  openable — applied to a *discipline* rather than a man. **G9 and G10 should reach for it early:** an
  encyclopedia is barred by the plan's own rules, but a founding textbook is not an encyclopedia.

**The find that cost nothing, and the rule it produces.** `Megafauna` turns on the 44 kg threshold. A search
produced Lauer et al. 2023, which states it — but `wh-089` **already marks that exact figure** to Koch &
Barnosky 2006, and the register already recorded them as supporting "megafauna defined as ≥44 kg" plus the
casualty roll-call, the two-hypothesis debate and the 50–10 ka timing. Three of the term's four claims, in a
work the deck already stands on. So: **search the deck's own markers for the FIGURE before searching the
literature for it.** This is batch 12's register economy with a sharper index — the register lists what a
work supports, but the cards' markers say which sentence already rests on it.

**A living scholar, half-sourced.** The plan's rule is a landmark publication plus an institutional record
from the employing body. The publications were easy — `harmand-2015` for both, `lewis-2011` for the Morton
re-measurement, `plummer-2025` for Harmand's continuing work on the Lomekwian. The institutional record could
not be reached at all: `turkanabasin.org`, `stonybrook.edu`, `cnrs.fr` and `wits.ac.za` all answer at the
root and every staff path 404s, with no searchable directory exposed. What stood in for it is **the author
affiliations printed in `harmand-2015` itself**, which give Harmand at the Turkana Basin Institute, Stony
Brook and at CNRS UMR 7055, and Lewis at the Turkana Basin Institute and the West Turkana Archaeological
Project — precisely the two terms' second sentences. A peer-reviewed byline is an institutional record, and
it is openable when the institution's website is not.

**One tooling note.** `pmc.ncbi.nlm.nih.gov` is captcha-walled again, and this time the Europe PMC
`fullTextXML` fallback returned an **empty body** for `smith-codding-2021` rather than an error — the same
silent-empty failure batch G7 met on Ferring et al. 2011. Check the length of what comes back. Because it
could not be re-read, it was **not** stretched from the North Pacific exception it is registered for to the
egalitarian-band default the term needed; `plana-2023` was found instead. G6's rule doing its job.

### G9 · Indigenous peoples, and the odds and ends (8 terms) — **DONE (2026-08-02)**
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

### Batch G9 log — the batch that had to say what its sources say, not what everyone knows

#### 2026-08-02 — eight terms, 29 citations, seven corrected, and one word dropped on principle

**Coverage 66/333 → 74/333, all seventy-four at the bar.** Twenty-six distinct works, **every one of them
open** — the third batch after G4 and G7 with no paywalled entry at all. Only **two** came out of
`.claude/sources-register.md`, and one of those had never been registered, only shipped.

**G7's finding is now a law of this pass, and G9 is its extreme case.** G7 found the register pays for taxa
and not for places, because a site's three sentences are a location, a dig history and a find, and only the
find is a claim some card already makes. G9's terms are four peoples, a coastline, a tree, a city and a Han
historian — subjects on which the prehistory deck makes **no claim at all** — so twenty-four of the
twenty-six works were new. Plan G10 on the same assumption: the register will not pay for continents and
oceans either.

**The plan's own rule for this batch worked, and it worked better than the journals.** "A people's own
institutions come first" produced the batch's single most useful source: **Sealaska Heritage Institute's
grade-6 curriculum unit on clans and moieties**, which is the Tlingit, Haida and Tsimshian cultural
institute's own teaching material and which carries, in plain declarative sentences, both peoples' moiety
names in their own languages, the matrilineal reckoning ("This is done on the mother's side of the family"),
the clan ownership of crests, names, songs and land, the clan houses, and the red cedar the poles are carved
from. One PDF did the second sentence of two terms. The Central Council of the Tlingit and Haida Indian
Tribes of Alaska supplied the territorial claim; Parks Canada, co-managing Gwaii Haanas with the Haida
Nation, supplied the monuments and the collapse.

**The finding, and it cost a word: "potlatch" is not in any source this sandbox can open.** Both the Haida
and the Tlingit terms turned on it — rank "publicly confirmed at potlatches", clans that "confirm their
standing at potlatches where property is formally given away". The word is beyond doubt in the literature
and the ceremonies are real; what could not be produced was a qualifying source that **uses it**.
Sealaska's own unit describes exactly those ceremonies — a clan hires the opposite moiety to build its
house and pays them at a ceremony, "Different goods were used as currency" — without naming them.
`amnh.org` is 403 here; the Canadian Museum of History has withdrawn its Haida exhibit to a "page removed"
notice; the Pitt Rivers booklet on the Star House Pole is an image-only PDF. So **both terms now say what
the cited source says** — names conferred and obligations to the opposite half settled at ceremonies where
goods change hands — and the word was dropped rather than left standing over a citation that does not
contain it. This is the pass's rule for a "who named it" clause (batch 25) applied to a term of art:
**a familiar word is a claim like any other, and a citation that does not use it does not support it.**

**Seven terms corrected**, in English and all nine languages.

- **The Hadza were "about 1,200 to 1,300"; there are about 1,000.** Smith et al.: "Approximately 1,000
  people speak Hadzane and identify as Hadza, but only about 300 still obtain a majority of their calories
  from foraged goods." The term's vague "several hundred" became that 300, its "small camps that shift every
  few weeks" became O'Connell's measured "short-term base camps occupied by 25–75 individuals", and its "no
  formal chiefs" became Fedurek's "neither structured hierarchy nor formal leadership".
- **And the Hadza clause that had to go.** The term explained the scholarly interest by saying "they descend
  from foraging populations present in the region long before farming and herding arrived". O'Connell says
  the opposite of the framing: "**Neither group is nor has been an isolate. Both have interacted with
  surrounding pastoral and agricultural populations for centuries**", and Shriner's own paper reports ~22%
  Niger-Congo and ~6% Cushitic ancestry among the Hadza. What is defensible is that **the language** is an
  isolate — "no undisputed phylogenetic relationship to any other extant language" — and that their ancestry
  "emerged early". The term now says those two things and not the third.
- **The San were "roughly 160,000"; the fullest regional survey counts 88,025.** Suzman's table 1.1, from
  the EU-funded five-country assessment, gives Botswana 47,675, Namibia 32,000, South Africa 4,350, Zimbabwe
  2,500, Angola 1,200 and Zambia 300, against Hitchcock 1996's 107,071 — so "fewer than 110,000" brackets
  both, and **Zambia was missing from the term's list of countries entirely.**
- **"San is itself an outside label" was right but incomplete, and the completion matters.** Suzman:
  "Almost all labels referring to San collectively were coined by non-San and are etymologically pejorative"
  — *and* that at the 1993 Common Access to Development Conference "San delegates agreed that the term 'San'
  should be used for the meantime, as it was considered the most neutral". A term about a contested name
  should say who chose it, and the answer is that they did.
- **The Haida sentence about the collapse had no figures; now it has the institution's.** Parks Canada gives
  "at least 20,000 Haida … in the late 1700s" falling to "fewer than 600 … by the late 1800s", from
  "smallpox, measles and tuberculosis" — better than "a devastating population collapse from introduced
  disease". Its "ocean-going canoes" went with the rewrite, unsourced; the great longhouses and the
  crest-bearing poles stayed, because Parks Canada names both.
- **Sima Qian did not choose "mutilation over death".** Chavannes has him **condemned to castration**, not
  to death — and unable to buy the commutation the code allowed, because "sa famille n'avait pas de fortune
  et tous ses amis l'abandonnèrent". The choice his own Letter to Ren An records is a different one, between
  submitting and taking his own life: "j'aurais regretté de ne pas achever ma tâche; c'est pourquoi j'ai
  subi le plus terrible des supplices sans m'en irriter." The term also called him "the father of Chinese
  historiography", where Chavannes says something narrower and checkable — he is "considéré comme le premier
  d'entre eux" *because* his method is the one the canonical historians adopted.
- **Johannesburg's Cradle of Humankind "some 50 km to the north-west" lost its distance.** No opened source
  gives one; Malherbe et al. place the Cradle "in the northeast of the Gauteng province" and call it "the
  single richest source of hominin fossils for over ninety years", which is what the term now says. Its "not
  one of the national capitals" gained the reason it is worth saying — gov.za names all three — and the
  Constitutional Court gained its actual seat, Constitution Hill in Braamfontein.

**A tooling finding, and it would have scattered markers.** `Sima_Qian` **did not split into three sentences
in six of the ten languages** — en, es, fr, de, nl and ru all came back as four, because `pieces()` breaks on
"c. 145", "v. 145", "ca. 145", "ок. 145". The splitter holds a lone *capital* initial before a capitalised
word; a lowercase `c.` before a digit is a different shape, and generalising to it would swallow real
sentence ends after any lowercase abbreviation. It was not fixed. The parenthetical was **removed from the
prose** instead — the date line already carries the years, and it now reads `c. 145 – c. 86 BCE` rather than
`c. 145–86 BCE`, since Chavannes and L'Haridon both treat the death date as inferred. **Every G9 term now
splits 3 in all ten languages with identical markers.** The general rule for authors: *do not put an era or
approximation abbreviation followed by a numeral into a glossary description.*

**A judgement recorded rather than slid past.** `Sima_Qian`'s second source is a signed entry by Béatrice
L'Haridon in the Presses de l'Inalco *Encyclopédie des historiographies*. The plan bars encyclopedias; this
is cited anyway, because what the plan bars is a general tertiary summary and this is a peer-reviewed
scholarly reference work from a university press with named specialist authors — the category the plan
itself endorses when it accepts a disciplinary handbook for `Archaeology`. It stands beside Chavannes on
every claim and alone on none.

**A drafting failure worth naming, because it nearly shipped.** Six of the batch's citations were written
from memory of the search results rather than from the record, and **six were wrong** — an author list
attributed to the wrong pair (`PMC8117426` is Pakendorf and Stoneking, not Vicente and Schlebusch), a
single-author paper given as "et al.", two wrong article numbers, and one work placed in the wrong journal
entirely. Every one was caught by re-querying Europe PMC for the metadata before applying the batch. **Query
the record for author, journal, volume and article number; do not write a citation from the memory of having
read it.**

**What was kept unmarked, and it is more than any batch since G8.** Nine clauses across five terms:
the Pacific Northwest Coast's whole first sentence (its southern-Alaska-to-northern-California extent, the
fjords, the thousands of islands — geography, in nothing opened); the Tlingit food list; Johannesburg's
"largest city in South Africa" and its 1,750 m; and `Cedar`'s yellow-cedar, incense-cedars, Japanese sugi
and burning as incense. G8's warning applies again and should be read as standing: **a fold showing three
open sources looks the same to a reader whether every sentence rests on them or only the marked ones do.**

**Three access notes for G10.** `doi.org` is **403 from this sandbox today**, for every DOI tried, so every
citation here links to the copy actually opened. `powo.science.kew.org`, `iucnredlist.org`, `gbif.org` and
`worldfloraonline.org` are all 403 or unresolvable, and `efloras.org` answers at the search but 503s on the
genus page — **there is no reachable botanical authority here**, which is why `Cedrus` had to be sourced from
the introductions of two applied papers. And `statssa.gov.za` responds but its municipality pages are
JavaScript shells that return nothing to a fetch, while `joburg.org.za` does not resolve at all.

### G10 · The poles, the desert, the sea, and two names (7 terms) — **DONE (2026-08-02)**
`Antarctica` · `Arctic` · `Greenland` · `Sahara` · `Pacific_Ocean` · `Near_East` · `Fertile_Crescent`

Spines, all reachable and all used: **NOAA** (the National Ocean Service's ocean facts and the agency's own
repository copy of a CC BY paper), the **National Snow and Ice Data Center**, the **Australian Antarctic
Division**, the **British Antarctic Survey**, the **Antarctic Treaty Secretariat**, **Statistics Greenland**,
Copernicus's **The Cryosphere**, and the **Internet Archive** for two out-of-copyright books.

### Batch G10 log — the batch that split in half, and the line it split on

#### 2026-08-02 — seven terms, 26 citations, seven corrected, and ten terms handed to G11

**Coverage 74/333 → 81/333, all eighty-one at the bar.** Twenty distinct works, **every one of them open** —
the fourth batch after G4, G7 and G9 with no paywalled entry at all. Only **two** came out of
`.claude/sources-register.md` unopened, which is G7's law holding at full strength for the third batch
running: the register carries taxa and periods, and an ice sheet, a desert and an ocean are none of those.

**The finding, and it re-cuts the rest of Phase 1. The planned G10 was seventeen terms, and it split cleanly
down a line the plan half-saw: a term whose claims are MEASURED RESULTS could be cited from here, and a term
whose claims are CONVENTIONS OR CONSTANTS could not.** Antarctica's ice thickness, Greenland's population,
the Sahara's extent, the Challenger Deep's depth and the date the Norse reached the southern fjords are all
results — deposited, indexed, openable, and in this batch every one of them turned out to be openable from
an agency or a gold-OA journal. The six continents, `Equator`, `Northern_Hemisphere` and `Southern_Hemisphere`
are not: "Europe is a continent" is a convention, the equator's 40,075 km is a defined ellipsoid parameter,
and the hemispheres' land fractions and Coriolis behaviour are textbook constants. This is batch 2's finding
in a new dress — **subject does not predict reachability; the KIND of claim does** — and it is why those ten
terms are now G11 rather than a rushed second half of this one. What actually blocked them is recorded in the
register: NASA's NSSDC fact sheets now 307 to the site shell, `weather.gov` is 403, and the UN's own
macro-geographic scheme (M49) **cannot supply a continent's area at all**, because it assigns whole countries
to regions and therefore puts every hectare of Russia in Europe and none in Asia. A batch built on it would
have shipped 22.1 million km² for Europe.

**Seven terms corrected**, in English and all nine languages.

- **Antarctica is not "98% ice-covered"; the measured figure is 99.8%.** Burton-Johnson et al. mapped the
  whole continent from Landsat 8 and found "exposed rock forms **0.18 % (21 745 km²) of the total land area
  of Antarctica: half of previous estimates**" — and says so in the abstract, in those words. The familiar
  98% is a textbook number that the satellite record halved twice over. The term now gives the exposure
  rather than the coverage, which is the figure that was actually measured. Its "about 14.2 million km²"
  went to 14 (Bedmap2's 13.924 including ice shelves) and its "most of the world's fresh water" gained the
  British Antarctic Survey's 60%.
- **The Pacific was "about 165 million km²" and holding "nearly half" of the world's water.** NOAA's own
  page gives 155 million km² and "**more than half** of the free water on Earth" — the term was over on the
  area and under on the water. Its "roughly 10,900 m" became Greenaway et al.'s measured 10,935 m (±6 m),
  and "European ships first entered it in the 16th century" became Magellan's fleet in November 1520, which
  is where the name comes from and which the same NOAA page carries.
- **And NOAA contradicts itself on that area**, which is worth recording as a method note: `biggestocean.html`
  says "approximately 63 million square miles" (~163 × 10⁶ km²) while `pacific.html` and NOAA Ocean
  Exploration both say 155 × 10⁶ km² / 59–60 million square miles. **Two pages agree and one does not**, so
  the term takes the two and the outlier page is marked for the claims it is alone in carrying — the
  largest-and-deepest and the Ring of Fire. When an agency disagrees with itself, cite it for what it says
  consistently.
- **The Fertile Crescent was not named in 1916.** The phrase is already in print in Breasted's *Outlines of
  European History*, Part I (1914) — "a fertile crescent having the mountains on one side and the desert on
  the other … **This great semicircle, for lack of a name, may be called the … fertile crescent**" — two
  years before *Ancient Times* capitalises it into a proper name. Both books are out of copyright and both
  are on the Internet Archive in full. This is batch G4's rule paying a third time: **when a term dates a
  19th- or early-20th-century idea, the author is out of copyright, so go and read him.** The term now says
  he put the phrase into print in 1914 and made it a proper name two years later.
- **Its "wheat, barley, lentils, sheep, goats, cattle and pigs were FIRST brought under human control"
  there.** All seven were brought under control there; *first* is the word that fails, since `larson-2014` —
  a source the register already held — counts at least eleven independent centres, and pigs and zebu cattle
  were domesticated in two of the others. The word went and the eleven centres came in, which loses nothing
  and states the thing that makes the crescent interesting.
- **Greenland's Norse "died out or left some five centuries later".** Jackson et al. put the arrival of
  agriculture in the **late tenth century** and Zhao et al. put the abandonment in the **early fifteenth** —
  about four and a half, and the term now names the two centuries instead of counting between them.
  Statistics Greenland's own annual booklet then corrected four more figures in one page: 2.17 → 2.2 million
  km², "about four-fifths" → 81%, "fewer than 60,000" → about 57,000, and Nuuk gained its ~19,000.
- **The Arctic's tree line and its 10 °C summer isotherm are not two alternative boundaries.** The term
  offered them as a choice; NSIDC gives one line described two ways — the tree line "broadly corresponds to
  where the average July summer temperature does not rise above 10 °C". Its "inhabited for thousands of
  years" also gained a subject: Flegontov et al. speak for the **American** Arctic, first settled about
  5,000 years ago, with the ancestors of today's Inuit and Yup'ik spreading across it a thousand years ago.
  The Eurasian Arctic is far older and no source opened here covers it, so the term now says which Arctic it
  means.
- **The Sahara's 9.2 million km² became Liu and Xue's measured 9.5.** Not a contradiction — the desert's
  margin is a matter of which index draws it — but the register already warned, on `wh-107`, that the
  Sahara's area figures circulate in press releases rather than papers, and this is the openable measurement.

**Two source disagreements were recorded rather than settled**, per G7's rule. Salem et al. 2025 give the
African Humid Period as 14,500–5,000 BP where `tierney-2017` gives ~11,000–5,000; the term keeps Tierney's
range, which is what the register records and what `wh-107` already says. And the NOAA area split above.

**One route worth reusing, and one to stop trying.** The **Smithsonian's Global Volcanism Program**
(`volcano.si.edu`) is a per-volcano catalogue in exactly the shape batches 18–19 found in the Human Origins
records — Etna's elevation, coordinates, last known eruption and the note that "Recorded eruptions date back
to 1500 BCE" are all on one page — which is most of `Sicily` waiting for G11. And **the IHO's *Limits of
Oceans and Seas* is reachable and useless**: the 1953 third edition PDF at `iho.int` opens, but it is a scan
with no text layer, so the formal limits of the Pacific could not be quoted.

### G11 · The continents, the island and the constants (10 terms) — **DONE (2026-08-02)**
`Africa` · `Europe` · `Asia` · `Americas` · `North_America` · `South_America` · `Sicily` · `Equator` ·
`Northern_Hemisphere` · `Southern_Hemisphere`

Deferred out of G10 for the reason logged above: these are conventions and constants, not results.
Three leads, all found while working G10 and none yet used.

- **A continent is a convention, and the honest source says so.** Mortimer et al., "Zealandia: Earth's Hidden
  Continent," *GSA Today* 27, no. 3 (2017) — open access, and it sets out the geological criteria for calling
  something a continent precisely because it is arguing a contested case. Cite the criteria, not a
  measurement, for "Europe is a continent"; then cite figures separately, and **not** from the UN's M49
  scheme, which puts all of Russia in Europe.
- **The Americas' naming is out of copyright.** The 1907 facsimile edition of Waldseemüller's *Cosmographiae
  Introductio* (United States Catholic Historical Society) is on the Internet Archive in full, with both the
  Latin — "quarta orbis pars (quam quia Americus invenit, Amerigen quasi Americi terram sive Americam
  nuncupare licet)", pp. 25 and 30 — and the editor's note that "**By America, of course, he meant the South
  American continent of to-day**". That is the term's third sentence exactly, and it also says the map was
  printed at Saint-Dié rather than anywhere one would call German.
- **`Sicily` is already half done**: the Smithsonian's Global Volcanism Program record for Etna
  (`volcano.si.edu/volcano.cfm?vn=211060`) gives 3,357 m, 37.748°N 14.999°E, a last known eruption in 2026
  and recorded eruptions back to 1500 BCE. What is missing is the island's area and population — ISTAT's
  `demo.istat.it` is a JavaScript shell that returns nothing to a fetch, so find another route — and a
  scholarly source for the succession of rulers in its third sentence.

### Batch G11 log — one paper for six terms, and the figure no authority will give you

#### 2026-08-02 — ten terms, 26 citations, five corrected, and Phase 1 closed

**Coverage 81/333 → 91/333, all ninety-one at the bar, and Phase 1 is complete: all 91 of its terms are
cited.** Fourteen distinct works, **every one of them open** — the fifth batch after G4, G7, G9 and G10 with
no paywalled entry at all. Only four came out of `.claude/sources-register.md`, which is G7's law holding for
a fourth batch running: the register carries taxa and periods, and a continent, an island and a line of
latitude are none of those.

**The finding, and it vindicates the split G10 made.** These ten terms were deferred because their claims
are conventions and constants rather than measured results, and that is exactly how the batch went: **every
convention was citable and every constant was not.** The plan's first lead did the heavy lifting —
Mortimer et al.'s Zealandia paper has to state the criteria for calling something a continent because it is
arguing a contested case, and it names *"the six commonly recognized geological continents (Africa,
**Eurasia**, North America, South America, Antarctica, and Australia)"*. That one open paper carries a
sentence on six of the ten terms, and it settles the thing the `Europe` and `Asia` terms most needed
settling: the Urals line is a boundary of custom and not of geology. The constants went the other way and
are recorded in the register as unmarked — the hemispheres' land fractions and population shares, the
ocean gyres' rotation, Everest and the Dead Sea as the highest and lowest points on land.

**And the figure no reachable authority will give you is a continent's AREA.** The obvious source is not
merely missing, it is wrong: the UN's own Demographic Yearbook follows the M49 scheme, which assigns whole
countries to regions and therefore puts every hectare of Russia in Europe — its Table 1 gives **Europe 22.1
and Asia 31.0 million km² of land**, against the conventional 10.2 and 44.5. G10 predicted this and it is
worse than predicted, because the table is otherwise excellent: it carried the populations of Africa, Asia,
Europe and South America and the three regional rows behind North America's. **Cite that table for people,
never for area.** Every continental area in these ten terms is therefore unmarked and says so in the
register — which is the honest state, and better than a marked figure the source does not contain.

**Five terms corrected**, in English and all nine languages.

- **The Americas were named on "a German map of 1507".** Waldseemüller was German; the book and its two
  maps were printed at **Saint-Dié, in Lorraine**, and the 1907 facsimile's introduction opens on exactly
  that — "on the 25th of April, 1507, there appeared in a little out-of-the-way Vosges village, St. Dié,
  in Lorraine, a little book". The same introduction settles the term's other clause outright: *"By
  America, of course, he meant the South American continent of to-day."* This is G4's rule paying a fourth
  time — when a term dates an early idea, the edition is out of copyright, so go and read it.
- **Its peopling date was re-anchored rather than kept.** "At least 15,000 years ago" is the familiar
  figure and no opened source states it; Hoffecker et al. state that the ancestors of living First Peoples
  "already had spread widely in the Americas" less than 14,000 years ago. The term now says that, which is
  supported, consistent with `wh-062`'s 16,000 and with the White Sands footprints, and does not rest on a
  number nobody could check.
- **Etna "rises above 3,300 m and erupts almost every year."** The Smithsonian's Global Volcanism Program
  gives **3,357 m** and notes that "Recorded eruptions date back to 1500 BCE" — a better sentence as well
  as a checkable one, since the frequency claim is in nothing openable. Sicily's "roughly 5 million
  inhabitants" became Eurostat's 4,787,390, and its 25,700 km² turned out to be right to the hundred: the
  region's land area is 25,702.
- **Asia held "about 4.7 billion people"** where the UN's 2023 figure is 4,778.0 million, and **South
  America "roughly 440 million"** where it is 433.0.
- **Africa's rift "preserves an unrivalled fossil record."** An unsourceable superlative, and the rift is
  the East African Rift rather than the Great Rift Valley in the literature that describes it. Rowan et al.
  give the checkable version: the crust along the axis has thinned to about 13 km, "eastern Africa is
  primed for continental breakup", and the necking "facilitated the accumulation of Turkana's world-famous
  fossil record of human evolution".

**Two clauses were ADDED rather than corrected**, which is unusual for this pass and worth naming: `Europe`
and `Asia` now say that the line between them is a convention and that geologists count Eurasia as one
continent. Neither term was wrong; both were incomplete in a way a reader cannot detect, since "Europe is a
continent" and "Asia is a continent" are stated everywhere and qualified nowhere.

**Three tooling and access notes.**
- **`doi.org` answered for every DOI tried today**, where G10 recorded it 403 for all of them, and
  `pmc.ncbi.nlm.nih.gov` served article HTML with no challenge. **`weather.gov` also answers now** — G10
  recorded it 403, and that 403 is what cost the two hemisphere terms their batch — but the JetStream
  Coriolis page it used to serve has moved to `noaa.gov/jetstream` and no longer exists there. NOAA's
  National Ocean Service currents tutorial and NESDIS carry the same two statements and are what is cited.
  **Re-test a host that blocked a previous batch; the walls move in both directions.**
- **A PDF's digits can be trustworthy when its letters are not.** The Demographic Yearbook's table is a
  subset-font substitution cipher on extraction — "Algeria" comes out as "Alg.03-" — but every numeral
  survives intact, and Algeria's 2,381,741 km² is exactly right. Where a citation rests only on figures,
  a ciphered PDF is still readable; where it rests on wording, it is not, and the NGA's WGS 84
  standardization document had to be abandoned for the agency's HTML page for that reason.
- **`split-abstract.js`'s documented limit bit five languages at once**, exactly as its header warns: a
  sentence that ENDS on the era abbreviation has no terminator left, so a Sicily sentence closing on
  "1500 a. C." / "av. J.-C." / "v. Chr." / "до н. э." merged with the next one in es, fr, it, nl and ru.
  The fix is the authoring rule, not the splitter — the clauses were reordered so the sentence closes on
  the summit height instead. All ten terms split into three sentences in all ten languages afterwards, with
  identical marker counts.

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

### Batch P1 log — the batch that had almost nothing to correct

#### 2026-08-02 — six terms, 21 citations, one corrected clause

**Coverage 91/333 → 97/333, all ninety-seven at the bar.** Twenty distinct works, **every one of them open**,
and — for the first time in the pass — **not one of them came out of `.claude/sources-register.md`**. Phase 2
shares no ground at all with the prehistory pass, so the register's dividend is zero here and will stay zero
through P7. What replaces it is the spine the plan predicted: the **Miller Center's presidential essays**,
one per president, by named academic historians, open by policy, and long enough that a single essay carries
most of a three-sentence term. Its *Life in Brief* essay alone covered five or six claims on every one of
these six.

**The finding is a near-negative one, and it is worth stating plainly: six terms produced one corrected
clause.** G8 established that a batch which corrects nothing is itself a result; P1 is the second such
batch and the reason is the same in reverse. These descriptions were written from the same kind of
institutional record the pass now cites — a national archive, a university's presidential biographies, a
government department's own history — where the prehistory terms were written from summaries of a
contested literature. **Where a term and its citation come from the same kind of source, reconciliation
finds little.** The corollary for P2–P7 is that the plan's standing warning is better aimed at the recent
presidencies, where the record is still argued over, than at the first six.

**The one correction.** `James_Madison` said the War of 1812 was "a conflict in which the new capital was
burned in 1814", which reads as the city having burned. The National Archives' note on the Treaty of Ghent
is precise: "the British Army's burning of the Capitol, the President's house, and other public buildings in
Washington on August 24 and 25, 1814". The term now names the two buildings, which is both what the source
says and more informative. The same page settles the term's closing clause from the treaty itself — Article
the First restores "All territory, places, and possessions whatsoever taken by either party from the other
during the war" — so one NARA page carries the whole of Madison's third sentence.

**Two smaller notes on how the six were sourced.** Where the Miller Center's essay stopped short, the
answer was the body responsible, exactly as batches 18–21 found for the cards: the **National Park Service**
supplied the Lewis and Clark expedition's reaching the Pacific and Jefferson's architecture, **whitehouse.gov**
supplied John Adams as the first occupant of the White House, and the **House Office of the Historian**
supplied the gag rule in the words of the rule itself. And **a statute is its own best citation**: the
NARA milestone page for the Alien and Sedition Acts carries all four transcripts, so the term's
"restricted immigrants and punished criticism of the government" is footnoted to the Alien Act's power to
expel and to the Sedition Act's punishment of "any false, scandalous and malicious writing … against the
government of the United States".

**Three access findings, all of which will shape P2–P7 and Phase 3.**
- **A URL containing a closing parenthesis cannot be cited.** `SRC_URL_RX` in app.js stops at `)`, so the
  congressional Biographical Directory entry
  `history.house.gov/People/Listing/A/ADAMS,-John-(A000039)/` would have rendered as a link to a truncated
  address. Every bioguide URL is parenthesised, so **check a candidate URL against that regex before
  planning a batch around such a host** — this one was replaced by a Miller Center essay carrying the same
  two facts.
- **`senate.gov` returns its 404 page with a 200 status**, so a reachability check by status code alone will
  say the Senate Historical Office's vice-presidential biographies are fine when they are not; they have
  moved to `cop.senate.gov`, which does not connect at all from here. Check the body, not the code.
- **`monticello.org` and `founders.archives.gov` are both closed to this sandbox** — 403 under every user
  agent tried, and 202 with an empty body respectively. That cost `Thomas_Jefferson` its "more than 600
  enslaved people over the course of his life", which is left unmarked rather than swapped for the Miller
  Center's "over 150", a figure at a moment rather than over a life. **Founders Online is named as P1's
  second-source spine in the table above and is not usable; the milestone documents and the Office of the
  Historian replaced it, and P2 and P3 should assume the same.**

### Batch P2 log — the recipe holds, and the sources start disagreeing with each other

#### 2026-08-02 — five terms, 20 citations, one corrected clause

**Coverage 97/333 → 102/333.** Fifteen distinct works, **every one of them open**, and again **none from the
register**. P1's recipe held without modification: the Miller Center essay carries the spine, and where it
stops short the answer is the body responsible — the **National Archives** for the statutes and treaties,
the **National Park Service** for the ground, the **Office of the Historian** for the diplomacy. Two claims
none of them made were carried by a **university project** and an **NGO**, both named in the plan as
acceptable and both used here for the first time.

**The one correction is a category slip rather than a wrong number.** `William_Henry_Harrison` had him as
"the commander who fought Native American forces at Tippecanoe in 1811 and at the Thames in 1813". At the
Thames the enemy was not Native American forces: the Miller Center's essay says he "engaged a **combined
British and Indian force** of 1,700 men", and Tecumseh died there fighting alongside the British. The term
now names Tecumseh's confederacy at Tippecanoe and a combined British and Native American force at the
Thames, which is both what the source says and the more interesting fact.

**A party platform is its own best citation**, which is P1's "a statute is its own best citation" in a new
dress. The term's claim that the Free Soil Party "opposed extending slavery into the western territories"
has no reachable government source — `senate.gov`'s party-history pages return the Senate's 404 shell with
a 200 status — but the **1848 platform itself** is hosted in full by the American Presidency Project at UC
Santa Barbara, and its resolutions say it outright: "the only safe means of preventing the extension of
Slavery into Territory now Free, is to prohibit its extension in all such Territory by an act of Congress",
and "no more Slave States and no more Slave Territory."

**The batch's real finding is that the sources have started disagreeing with each other, and with
themselves.** Two cases, both recorded in the register rather than silently resolved:
- **Harrison served 31 days or 32**, depending on who is counting. The White House Historical Association
  says "after only thirty-one days in office"; the Miller Center says "only thirty-two days". Both follow
  from 4 March to 4 April 1841 — elapsed against inclusive. The term keeps 31, because that is what the
  source cited beside it says, and the disagreement is recorded. This is G10's NOAA rule again: when two
  accounts differ on a countable, cite the one you actually opened for the figure you actually print.
- **The Miller Center's Harrison essay contains two slips of its own** — it calls his post "governor of the
  Indian Territory" where its own gloss says "present day Indiana and Illinois", and it places Tippecanoe
  "in the Ohio River Valley" where its own next paragraph puts it at Tippecanoe Creek. **Neither was
  followed.** A spine source is not infallible, and the check that catches this is reading the whole essay
  rather than only the sentence that matches.

**One tooling note for P3–P7.** `history.house.gov`'s Historical Highlights are reachable by the **numeric**
path `/HistoricalHighlight/Detail/<id>` and NOT by the human-readable
`/Historical-Highlights/<period>/<slug>/` form, which returns the site's error document with a 200 status.
Two candidate citations were lost to this before the numeric form was found; P1's gag-rule citation already
uses it.

### Batch P3 log — where the Life in Brief runs out, and the documents take over

#### 2026-08-02 — six terms, 25 citations, one corrected clause

**Coverage 102/333 → 108/333.** Twenty distinct works, **every one of them open**, and again none from the
register. This is the batch where the Miller Center's *Life in Brief* stops being sufficient on its own:
**five of the six terms needed a second or third essay from the same author**, because a three-sentence
description of a president between 1849 and 1869 names a statute, a treaty, a battle date or a trial, and
the brief essay names none of them. `Franklin_Pierce`'s is the shortest of the forty-five — two paragraphs —
and carried exactly one of that term's claims; its Campaigns, Foreign Affairs and Domestic Affairs essays
carried the rest. **Budget two to four Miller Center essays per president from here on, not one.**

**A primary document did the work a summary could not, for the third batch running.** P1 found that a
statute is its own best citation and P2 that a party platform is; P3 adds a **trial record** and a
**statute the summary paraphrases away**:
- `Millard_Fillmore` says the Fugitive Slave Act "obliged citizens across the country to assist in the
  capture of escaped slaves". The National Archives' page on the Compromise of 1850 says only that "both
  federal and local law enforcement in all states … were required to enforce the legislation", which is
  narrower — so the clause is cited to **the Act's own §5** at Yale Law School's Avalon Project: "all good
  citizens are hereby commanded to aid and assist in the prompt and efficient execution of this law". The
  alternative was to soften a true sentence to match a summary, which is the wrong direction.
- `Andrew_Johnson`'s "the Senate acquitted him by a single vote" is cited to **the Senate's own account of
  the trial**: "the tally fell one vote short of the necessary two-thirds majority to convict", with the
  roll at 35 to 19.

**The one correction is a sequence, not a figure.** `Abraham_Lincoln` had it that "his election prompted
eleven southern states to secede and form the Confederacy, beginning the Civil War". Eleven is the eventual
total, but it compresses away the thing that matters: the Miller Center's first sentence is "When Abraham
Lincoln was elected President in 1860, **seven** slave states left the Union to form the Confederate States
of America, and **four more joined when hostilities began**." Four of the eleven left after Fort Sumter,
not because of the election. The term now says seven, with four more once the fighting began.

**A refinement to P1's and P2's `senate.gov` finding, which matters because Phase 2 will keep wanting that
host.** It is not uniformly broken: its **impeachment** pages are real and substantial, while its
party-history and vice-president paths return the 404 shell with a 200 status. **The shell is a constant
37,523 bytes** — a size check tells the two apart instantly, and is the cheapest form of "check the body,
not the status code".

### Batch P4 log — the warning arrives, exactly as the plan wrote it

#### 2026-08-02 — seven terms, 27 citations, two corrected clauses

**Coverage 108/333 → 115/333.** Twenty-three distinct works, **every one of them open**, none from the
register. P3 said to budget two to four Miller Center essays per president; P4 shows that was understated.
**Only two of the seven terms were carried by the *Life in Brief* alone.** Grant needed four essays, Hayes
and McKinley three each, and Benjamin Harrison's Dependent Pension Act and six new states are in **none of
his essays at all** — they came from the Miller Center's **Key Events** timeline, which is a dated list of
exactly the kind of claim a three-sentence description makes. **Reach for Key Events when the essays go
quiet.**

**Both corrections are on `Rutherford_B._Hayes`, and both are the plan's Phase 2 warning arriving exactly as
written** — "softening or cutting an assessment the sources do not make":
- The term had him taking office after the 1876 election was settled "by a special electoral commission
  **and an informal bargain with southern politicians**". The Miller Center's Campaigns and Elections essay
  addresses that claim directly and rejects it: "That southern Democrats and Hayes's friends negotiated is a
  virtual certainty, but **that they struck any 'deal,' 'bargain,' or compromise that offered anything beyond
  what Hayes promised to do in his letter of acceptance is doubtful**." The term now says the commission
  settled it and that whether a bargain went with it is still argued over — which is the state of the
  question rather than one side of it.
- The term said he "**withdrew** the last federal troops enforcing Reconstruction in the South". He did not
  withdraw them: "Hayes **ordered those federal troops to their barracks**", and the governments they had
  been protecting were by then only the two in New Orleans and Columbia. The term now says so. A verb was
  doing more work than the record supports, which is the same failure in a smaller frame.

**A slip in a spine source, recorded and not followed** — the third such in Phase 2, after P2's two in the
Harrison essay. The Miller Center's Garfield *Life in Brief* dates the shooting "a mere 100 days after he
assumed office"; 4 March to 2 July 1881 is 120 days. The term counts the whole term instead, "about six
months", which its own Death of the President essay supports with two dates. **Read the specialist essay
before trusting a round number in the summary.**

**And a statute corrected a summary, for the second batch running.** The Miller Center says the Chinese
Exclusion Act banned "Chinese immigration for ten years and forbidding Chinese citizenship". The National
Archives, quoting the Act, says it "provided an absolute 10-year ban on **Chinese laborers** immigrating" —
which is what `Chester_A._Arthur` already said. The clause is cited to the Act, not to the essay, and the
term stands unchanged. P3 met this from the other side, where the summary was narrower than the statute;
here it is broader. **Either way, cite the document.**

**One access note.** Three Office of the Historian slugs that look obvious are 404 —
`/milestones/1866-1898/treaty-of-paris`, `/milestones/1866-1898/hawaii` and
`/milestones/1861-1865/alabama-claims`. Each subject is folded into a larger page or into a Miller Center
essay; check the milestone index rather than guessing a slug.

### Batch P5 log — the two corrections are one statute, found by the sibling check

#### 2026-08-02 — six terms, 28 citations, two corrected clauses

**Coverage 115/333 → 121/333.** Twenty-two distinct works, **every one of them open**, none from the
register. P4's rule held without exception: **not one of the six was carried by the *Life in Brief*
alone.** Theodore Roosevelt needed four Miller Center essays, Harding three, and Wilson, Coolidge and
Hoover two each.

**What is new in P5 is the second spine.** From 1901 the presidencies turn on treaties and conferences, and
the State Department's **Office of the Historian** carried five claims no presidential essay states —
Portsmouth, the Fourteen Points, the League fight, the Washington Naval Conference and the Smoot-Hawley
tariff. Phase 2's earlier batches leaned on NARA milestone documents because the claims were statutes; from
here they are foreign policy, and the milestone pages that answer them are State's, not the Archives'.

**Both corrections are the same statute seen from two sides, and the sibling-consistency check is what
found them.** The Budget and Accounting Act of 1921 sits between Taft and Harding, and each term had it
slightly wrong in the opposite direction:
- `William_Howard_Taft` said he "created a federal budget system". He did not. The Miller Center's Domestic
  Affairs essay: "Taft promoted an administrative innovation whereby the President … would submit a budget
  to Congress. **Congress prohibited that action**, but Taft's effort foreshadowed the creation of the
  executive budget in the Budget and Accounting Act of 1921." The term now says he **pressed for a
  presidential budget that Congress refused him** — which is both what happened and why he is worth
  mentioning in the same breath as the Act.
- `Warren_G._Harding` said he "created the federal budget bureau". The Bureau of the Budget is real and the
  1921 Act did create it, but **no reachable source here says so** — `gao.gov` is 403 and `whitehouse.gov/omb`
  carries no institutional history. What the cited essay does state is the thing that actually changed:
  the Act "allowed the President to present a unified budget for the first time (rather than have each
  cabinet secretary submit a budget to Congress)". The term now says that.

Neither was a factual error of the kind a source refutes; both were a summary reaching one step past what
any openable work supports. **Two terms twenty years apart shared one claim, and only reading them against
each other showed that neither had it right.**

**A route worth remembering, and the batch's cheapest find.**
`archives.gov/milestone-documents/indian-citizenship-act` is 404 and there is no NARA milestone page for
that act — but **DocsTeach, the National Archives' own document-teaching site, carries the record itself**,
with its statute citation (Act of June 2, 1924, PL 68-175, 43 Stat. 253) and its NARA identifier. G4 found
that a museum publishes its own history where the literature does not; this is the same shape one
institution over. **When a milestone slug 404s, try `docsteach.org` before writing the Archives off.**
Two other slugs that look obvious are likewise 404 and were not guessable:
`history.state.gov/milestones/1899-1913/dollar-diplomacy` (the phrase is in Taft's own Life in Brief) and
`archives.gov/milestone-documents/federal-reserve-act`.

**And a gap recorded rather than filled.** Neither Theodore Roosevelt source gives the **year** of his Nobel
Peace Prize; both state that he won it. The term's "in 1906" is left unmarked and uncontradicted rather than
pointed at a work that does not carry it — the same discipline G6's wrong marker taught, applied before the
marker was placed instead of after.

### Batch P6 log — the batch that corrected the five batches before it

#### 2026-08-02 — six terms, 36 citations, three corrected clauses

**Coverage 121/333 → 127/333.** Twenty-two distinct works, **every one of them open**, none from the
register.

**P6's first finding is about P1–P5, and it is the reason a top-up batch is now owed.** Every presidential
term opens on the same sentence shape — "the Nth president of the United States, in office from X to Y" —
and P1–P5 marked it to the Miller Center's *Life in Brief*. **Most of those essays state neither the
ordinal nor the term dates.** The Hoover essay contains no "thirty-first" and neither "1929" nor "1933";
Lincoln's, McKinley's and Coolidge's are the same. The marker was not WRONG in the way batch 23's Wrangham
marker was wrong — the essay is unmistakably about that presidency — but the two specific numbers the
sentence asserts were resting on a page that does not carry them. That is G8's unmarked-clause problem
wearing a marker, and **the audit cannot see it**, because it counts citations rather than covered claims.

The fix was already published and nobody had looked: **the Miller Center's landing page for each president
carries a Fast Facts block** giving `President Number`, `Inauguration Date` and `Date Ended` outright. All
six P6 terms cite it. **The thirty terms of P1–P5 want the same one-citation top-up**, and that is recorded
here as a job rather than smuggled into this batch. **Reach for Fast Facts whenever a term opens on an
ordinal.**

**Two corrections on `Dwight_D._Eisenhower`, and the presidential library found both.**
- The term made him "**Supreme Allied Commander in Europe**" for the invasion of France in June 1944.
  That is the **NATO** post, and he took it six years later. The Eisenhower Presidential Library's own
  chronology is unambiguous on both dates: "December 1943: Appointed **Supreme Commander, Allied
  Expeditionary Forces**. June 6, 1944: Commanded forces of Normandy invasion" … "**December 16, 1950:
  Named Supreme Allied Commander, North Atlantic Treaty Organization, Europe**." The term now gives the
  wartime title, and the invasion is Normandy's, which is what the Library's Army Years page says he spent
  1943 planning.
- The term said he "**kept military spending in check** while relying on nuclear deterrence". The cited
  Foreign Affairs essay refutes the first half in the same sentence in which it supplies a better second:
  his defense policies "**cut spending on conventional forces while increasing the budget for the Air Force
  and for nuclear weapons**. Even though **national security spending remained high—it never fell below 50
  percent of the budget** during Eisenhower's presidency—Eisenhower did balance three of the eight federal
  budgets." The term now says what he actually did to the budget rather than what the shape of the New Look
  suggests he did to its total.

**A third clause was withdrawn rather than re-sourced.** `Richard_Nixon` had him reaching the White House
"promising **order at home** and an end to the war in Vietnam". The first half is in nothing openable — not
the *Life in Brief*, not *Campaigns and Elections*, not *Life Before the Presidency*, not *Domestic
Affairs* — so the sentence was rebuilt on what the Office of the Historian does state: that ending the war
was the expectation on him from the day he took the oath. This is G6's rule applied **before** the marker
was placed instead of after.

**On the plan's own prediction for this batch.** P6 was to lean on the **presidential libraries (NARA)**,
and they are only half-reachable from here: `eisenhowerlibrary.gov` and `fdrlibrary.org` answer,
**`jfklibrary.org` is 403**, and the obvious biography paths on `trumanlibrary.gov`, `lbjlibrary.org` and
`nixonlibrary.gov` are all 404 with no guessable alternative. Exactly one library paid — and it paid for
both corrections, which is the whole argument for trying them first in P7 rather than writing them off.
`ssa.gov` is likewise 403, so the Social Security Administration's history pages are closed and the Social
Security Act is cited to the Miller Center.

**A smaller find worth carrying into P7: check the byline.** The LBJ essays carry **no named author**,
where FDR's are Leuchtenburg's, Truman's Hamby's, Eisenhower's Pach's, Kennedy's Selverstone's and Nixon's
Hughes's. Cite the institution when there is no byline; do not assume the essay has one.

### Batch P-topup log — thirty claims checked for the first time, and all thirty held

#### 2026-08-02 — thirty terms, thirty citations, no corrections

**Coverage unchanged at 127/333** — every one of these terms was already at the bar. This batch adds one
citation to each of P1–P5's thirty presidents and nothing else, because **P6 found that the sentence every
presidential term opens with was resting on a page that does not make its claim.**

**The result is a negative one and it is the point of the batch.** The thirty ordinals and sixty term dates
had never been checked against a source that states them — the *Life in Brief* essays mostly do not — and
checking them against the Miller Center's Fast Facts blocks found **nothing wrong**. After twelve batches
that turned up an error in almost every one, that is worth recording as loudly as a correction: this is the
one place in the pass where the prose was already exactly right, thirty times over.

**What the citation actually covers is more than the ordinal.** `Date Ended` for a president who died in
office is his death date, and his successor's `Inauguration Date` is that day or the next — so one marker on
sentence 1 now carries Taylor's, Lincoln's, McKinley's and Harding's deaths in office, and the succession
claims on Tyler, Fillmore, Andrew Johnson, Arthur and Coolidge as well.

**Two earlier findings moved from recorded to resolved.**
- **P2's Harrison discrepancy.** P2 logged that the White House Historical Association says Harrison served
  "thirty-one days" and the Miller Center's essay says "thirty-two", and took 31. The Miller Center's own
  **Fast Facts** gives March 4 → April 4, 1841 — **exactly 31**. The institution disagrees with itself, its
  structured data sides with the WHHA, and the term's number now has a citation behind it.
- **P4's Garfield slip.** P4 logged that the Garfield *Life in Brief* calls the shooting "a mere 100 days
  after he assumed office" when March 4 to July 2 is 120 days, and that the term counts the whole term as
  "about six months" instead. Fast Facts gives March 4 → **September 19, 1881**, 199 days. The term is right;
  the essay's round number is not.

**One parsing trap, recorded for anyone reading these blocks again.** **Cleveland's Fast Facts carries two
of everything** — two inauguration dates, two end dates and two president numbers, 22 and 24. A reader (or a
script) that takes the first value after each label silently loses the second presidency, which is exactly
the half of his term the glossary sentence also asserts. Read the whole block.

**Method note.** No prose changed in any of the ten languages. Each term's existing marker map was read back
out of its own marked text, the new source number appended to sentence 1, and the text re-marked from the
stripped original — so the diff is markers and one citation per term, and the ten languages could not drift
apart in the process.

### Batch P7 log — Phase 2 complete, and the corrections are all one shape

#### 2026-08-02 — nine terms, 50 citations, four corrected clauses

**Coverage 127/333 → 136/333. This finishes the 45 US presidents.** Twenty-nine distinct works, **every one
of them open**, none from the register.

**Four corrections, and each is the same failure wearing different clothes: a clause claiming an
ACHIEVEMENT where the cited essay describes an ATTEMPT, or naming a specific the source never states.**
This is P5's Taft finding at scale, and it is what a batch of recent presidents produces — the nearer the
subject to living memory, the more the prose reaches for the familiar summary instead of the record.
- **`Ronald_Reagan` "loosened regulation".** The cited essay says he "took office in 1981 **promising** to
  curb the growth of government regulations" and that court challenges "**forced the administration to
  retreat from many of its deregulatory efforts. As a result, most of the Nixon, Ford, and Carter-era
  regulations … remain in place**." Now: **pressed to roll back federal regulation.**
- **`Bill_Clinton`, two clauses in one sentence.** "A large expansion of tax credits for low-paid workers"
  is in no Clinton essay at all, and the 1996 law is described not as "time-limited assistance" but as
  having "**replaced the long standing Aid to Families with Dependent Children (AFDC) program with a system
  of block grants to individual states**". The essay's only "five years" is about *legal immigrants'
  eligibility* — a different thing, and precisely the near-miss that a hurried reading turns into a wrong
  citation. Now: **a rise in the minimum wage** (which the essay does give, at $5.15) **and block grants to
  the states.**
- **`Barack_Obama` "taught constitutional law".** The essay says he was "**a lecturer at the University of
  Chicago Law School**" — the institution, not the subject. Now: **taught law at the University of
  Chicago.**
- **`Donald_Trump` "raising tariffs and cutting regulation" as his 2016 programme.** The essay gives the
  programme as "restricting immigration, strengthening public infrastructure, **reducing taxes, and
  repealing the Affordable Care Act**"; tariffs arrive later as the trade war, and deregulation is not in
  the campaign list. Now: **restricting immigration, cutting taxes and repealing the Affordable Care Act.**

**A new route, and it is about superlatives.** `Ronald_Reagan`'s "at 69, the oldest person elected to the
office up to that time" is in nothing in the Reagan corpus, and `Joe_Biden`'s "the oldest person to take
the office" is in nothing in the Biden corpus. Both are in the **Trump** *Life in Brief*, which dates the
record because Trump broke it twice: "surpassing a record set by **Ronald Reagan, who was 69 when he took
office in 1981**" and "**Joseph Biden, re-set the record for oldest president** … shortly after his 78th
birthday". **When a superlative is about a sequence, look at the essay on the person who broke it.**

**A figure that looks like it must be in the presidential essays may be in none of them.** No Miller Center
essay gives a Carter-era inflation rate; the only percentage anywhere in the Carter corpus is the "nearly
eight percent" of 1976, in the *Campaigns* essay, about Ford. "Double-digit inflation" is sourced instead to
**Federal Reserve History's "The Great Inflation"** — "reached more than 14 percent in 1980" — which then
serves `Ronald_Reagan`'s tight-money clause and his deep recession as well. **Reach outside the biography
for an economic figure.**

**Reachable is not the same as citable — batch 13's museum-catalogue finding, one field over.** P6 found
most presidential libraries unreachable; here **six of them answer** (`fordlibrarymuseum.gov`,
`reaganlibrary.gov`, `jimmycarterlibrary.gov`, `clintonlibrary.gov`, `georgewbushlibrary.gov`,
`obamalibrary.gov`) **and not one carries a usable biography** — the Ford life page is a JavaScript
timeline with no prose, the Reagan page a media gallery, the Carter and Clinton biography paths 404. The
Miller Center carried all nine presidencies either way. The exception that paid was the **Nobel
Foundation's biographical page for Carter**, the highest-yield single source in the batch, which supplies
the Panama treaties, Camp David, the Egypt–Israel treaty, the Departments of Energy and Education, ANILCA
and Habitat for Humanity — six claims in two sentences, where the presidential essays give three.

**A third variety of 200-status error document, and two more closed hosts.** `state.gov` and
`2009-2017.state.gov` both serve a page titled "**Technical Difficulties**" with a 200 status — after
senate.gov's constant 37,523-byte shell (P3) and history.house.gov's readable-slug form (P2).
`whitehouse.gov/about-the-white-house/presidents/<name>/` is **404 for all nine** and returns a 225 KB
error document. `bls.gov` is 403 and `fred.stlouisfed.org` refuses the connection, so no primary
statistical series is reachable from here; `ssa.gov` is still 403. **Check the body, not the status code**
now has three shapes to recognise.

**And Trump's Fast Facts carries two of everything** — 45 and 47, two inauguration dates, one end date —
exactly as Cleveland's does. P-topup recorded that trap in the morning and it recurred the same day.

| batch | presidents | second-source spine |
|---|---|---|
| **P1** | Washington, J. Adams, Jefferson, Madison, Monroe, J. Q. Adams (6) — **DONE (2026-08-02)** | NARA milestone documents; State Dept. Office of the Historian; NPS |
| **P2** | Jackson, Van Buren, W. H. Harrison, Tyler, Polk (5) — **DONE (2026-08-02)** | NARA milestone documents; NPS; White House Historical Association (Tyler's succession) |
| **P3** | Taylor, Fillmore, Pierce, Buchanan, Lincoln, A. Johnson (6) — **DONE (2026-08-02)** | NARA milestone documents; Senate impeachment record; the Avalon Project |
| **P4** | Grant, Hayes, Garfield, Arthur, Cleveland, B. Harrison, McKinley (7) — **DONE (2026-08-02)** | NARA milestone documents; the Miller Center's Key Events timelines |
| **P5** | T. Roosevelt, Taft, Wilson, Harding, Coolidge, Hoover (6) — **DONE (2026-08-02)** | State Dept. Office of the Historian; NARA DocsTeach |
| **P6** | F. D. Roosevelt, Truman, Eisenhower, Kennedy, L. B. Johnson, Nixon (6) — **DONE (2026-08-02)** | the Eisenhower Presidential Library (NARA); Office of the Historian; NARA milestone documents |
| **P7** | Ford, Carter, Reagan, G. H. W. Bush, Clinton, G. W. Bush, Obama, Trump, Biden (9) — **DONE (2026-08-02)** | the Miller Center throughout; the Nobel Foundation; Federal Reserve History |
| **P-topup** | P1–P5's thirty terms (6+5+6+7+6) — **DONE (2026-08-02)**, no corrections | the Miller Center's Fast Facts landing pages, one citation per term, for the ordinal and the term dates their *Life in Brief* markers do not carry |

---

# Phase 3 · The countries (197 terms, 13 batches)

197 terms, 394 citations at the floor. Every description has the same three-sentence shape — where the
country is and what it is made of; its landscape and economy; a compressed history ending at the present
constitutional order — so, as with the presidents, one recipe serves all of them.

### The recipe, and the one contested source

**Source A — an official country profile.** ⚠ **C0 SETTLED THIS AND THE ANSWER IS NOT THE FACTBOOK — see the C0 log below: every path on `cia.gov` serves one 498,366-byte JavaScript shell with no country content. Source A is UNdata (`data.un.org/en/iso/<cc>.html`).** The paragraph that follows is the original reasoning, kept because the judgment call it describes was a real one. The **CIA World Factbook** is the obvious candidate: a US
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

### Batch C0 log — the pilot broke the recipe, which is what it was for

#### 2026-08-02 — six terms, 16 citations, two corrections, and a long unmarked list

**Coverage 136/333 → 142/333.** Twelve distinct works, every one open. C0 was chosen to break the recipe
before 191 countries went through it, and it did.

**The Factbook is unusable.** Every path under `cia.gov` returns the **identical 498,366-byte JavaScript
shell** — the same byte count for France, Tuvalu, Kosovo, South Sudan, the West Bank and the Holy See, for
the Gatsby `page-data` JSON route, and for a nonsense path. The word "France" appears zero times in the
HTML served for France. The plan chose the Factbook deliberately and argued the case for it in this
document; the argument is moot, because the content never reaches the client. **Source A has to be
replaced.**

**UNdata replaces it, and is better.** `data.un.org/en/iso/<cc>.html` is server-rendered, per-country, and
carries Region, Population, Density, Capital, Surface area and — the field that pays for the whole phase —
the **UN membership date**, which dates the independence of every modern state at no research cost, from
the body that admitted it. France 24 October 1945, Tuvalu 5 September 2000, South Sudan 14 July 2011.

**And it fails on exactly the case the pilot existed to test.** Kosovo has no ISO 3166-1 code, so
`data.un.org/en/iso/xk.html` is a **500**, and a state of limited recognition gets nothing from Source A.
Kosovo shipped on its history alone — the ICJ for the declaration of 17 February 2008 and for Security
Council resolution 1244, NATO for the 78-day air campaign — with every geographic and demographic clause
unmarked. **Plan the Balkan batch knowing this.**

**`un.org` is reachable path by path, not as a host.** The Charter text and UNISPAL serve real content; the
Security Council pages return a **CloudFront "Request blocked" page with a 200 status** (a fourth variety
of 200-status error document) and `un.org/press` a **JavaScript "Client Challenge", also 200** (a fifth).
`documents.un.org` serves resolution PDFs directly. **So cite the Charter, not the membership page** — the
treaty text is both openable and the better source.

**Two corrections.**
- **`Vatican_City` 0.49 → 0.44 km².** The state's own governorate says the territory "covers a surface area
  of **0.44 km2 (44 hectares)**". This is the plan's Source-B principle at its cleanest: ask the government
  of the place. Its pages are not at guessable paths — `/en/state-and-government.html` and
  `/en/state-and-government/history.html` are 404 — and the working ones under
  `/en/state-and-government/general-informations/` had to be read out of the homepage's own navigation.
- **`South_Sudan` 11 → 12 million.** UNdata gives 12,189 thousand for 2025. Not an error when written, but
  a figure time moved past — **the shape of correction Phase 3 will produce most often, since every country
  term opens on a population. Re-read the population before marking it, every time.**

**One correction avoided, and it names a source.** UNdata rounds Tuvalu to "10" thousand, which would have
made the term's "roughly 11,000" look wrong. The **Commonwealth Secretariat's** country page gives
**11,790 (2022)** and confirms it. For any state small enough that UNdata's thousands round the answer
away, the Commonwealth is the right source — and it covers 56 states, most of Phase 3's Oceania, Caribbean
and African batches.

**The unmarked list is the batch's other honest output**, and it is recorded in full in the register: all
of France's physical geography and pre-modern history, all of Tuvalu's climate sentence, the whole of
Kosovo's first two sentences, most of South Sudan's, and the interiors of the Palestine and Vatican
descriptions. The pattern behind it is sharp enough to plan against: **where a claim is an act of state —
a treaty, a resolution, a court ruling, an accession — it is citable and usually easy; where it is
landscape or long history, it usually is not.** France is the hardest country in Phase 3 for the inverse of
P7's reason: the older and more familiar the history, the less of it any single openable institutional page
states.

**Budget for that list.** These six average two citations and roughly half their prose marked. A Phase 3
batch reporting "16 terms, all at the bar" without saying what it left unmarked is reporting a number, not
a state of affairs.

### Batch C1 log — the recipe holds, and sixteen figures held with it

#### 2026-08-02 — fifteen terms, 33 citations, no corrections, one deferral

**Coverage 142/333 → 157/333.** The first batch run on the C0 recipe, and it worked: **the whole batch used
three works** — UNdata's country profiles, the EU's own country pages and NATO's member-countries table —
at **two fetches per country**.

**The EU country page is the second source the recipe was missing.**
`european-union.europa.eu/principles-countries-history/eu-countries/<slug>_en` carries Capital,
Geographical size, Population and **"EU Member State : since <date>"** in one block. That last field dates
the accession clause in the third sentence of every EU country's description — usually the only datable
claim in that sentence. **C2 and C3 should be worked exactly this way; the European batches are the
cheapest in the plan.**

**Sixteen areas and sixteen populations checked against two official sources, and every one held.** After
C0 corrected a population by a million, this batch checked every figure and corrected nothing: **every area
is within 0.6% of both official figures and most within 0.05%**, which is the ordinary spread between land
area and total area and is not a contradiction. **A term's figure is wrong when a source contradicts it,
not when a source rounds differently.**

**Two divergences that look like errors and are not, and both are lessons for C2.**
- **Cyprus**: the EU gives 979,865 people, UNdata 1,371 thousand. The EU counts only the
  government-controlled area; UNdata the whole island. The term describes the island and its division since
  1974, so UNdata is right. **Cite UNdata, not the EU, for a divided state's population.**
- **Czechia**: UNdata gives 10,609 thousand against the EU's 10,909,500 and the term's "roughly 10.9
  million" — here the EU agrees with the term and UNdata is the outlier. **Where two official sources
  disagree by more than rounding, read both before assuming the prose is wrong.** C0's South Sudan
  correction rested on UNdata alone; with a second source it would have been checked against one.

**Greece was dropped from the batch and deferred to C2.** Its description states no area, no population and
no capital, and its EU accession is not in its third sentence — so neither of the batch's two works carries
anything it says. Citing them anyway would have produced two sources that nothing in the prose points at,
which `add-sources.js` refuses and which would be decoration in any case. **A country term written without
figures is invisible to this recipe**, and that is worth knowing before the twelve long-form countries
(Greece, Kenya, Tanzania, Georgia, Denmark, Australia, India, Russia, China, Japan, Brazil) are folded into
their regional batches as the plan intends. Several of them are likely to be the same shape.

**The unmarked list is long and is recorded in full in the register**: all of the physical geography, all of
the pre-modern history, and the linguistic claims on Estonian, Finnish, Hungarian, Latvian and Lithuanian.
The shape is exactly what C0 predicted and this batch measures at scale: **two institutional profiles carry
a country's present and its accessions, and nothing of its landscape or its past.** A pass that wants those
needs a different class of source and should be planned as its own, not as an extension of this one.

### Batch C2 log — the batch that would have made three wrong corrections on one source

#### 2026-08-02 — ten terms, 21 citations, no corrections, six deferrals

**Coverage 157/333 → 167/333.** Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia,
Slovenia, Spain, Sweden, on C1's two-fetch recipe unchanged.

**C1 raised the Czechia caution tentatively; C2 makes it a rule, and nearly paid for it.** On **Malta,
Portugal and Spain the EU country page's population would have made the term look wrong, and UNdata
confirms it**. Spain is the sharpest: the EU gives 49,077,984, which does not round to the term's "roughly
48 million" — but UNdata gives 47,890 thousand, which does. **A batch run on the EU page alone would have
produced three corrections, every one of them an error introduced rather than removed.** So: **read both
official sources before concluding a term's figure is wrong, and expect the disagreement between the two to
be larger than the term's error.**

**One wide area spread, and it is not a contradiction.** The Netherlands: the term's 41,850 km² against the
EU's 37,391 km², about 12%, which is total area against land area for a country a fifth of which is water.
Nothing in C1 came close to that gap. **Expect it again on the next water-heavy country and do not correct
it.**

**Six terms planned for this batch were deferred, each for a stated reason, and the pattern is the recipe's
own limit.**
- **`Greece`**, a second time: it states no area, no population and no capital, and its EU accession is not
  in its third sentence, so neither work carries anything it says. `mfa.gr` is 403, closing the obvious
  route to the London Protocol of 1830.
- **`Albania`**, on a genuine conflict rather than a gap: the term says "roughly 2.4 million", **UNdata says
  2,772 thousand** — a 15% divergence far outside anything else in C1 or C2, almost certainly the UN's
  projection against Albania's own 2023 census. **INSTAT's census pages do not carry the figure in their
  served HTML.** Marking sentence 1 to UNdata would point a marker at a work that contradicts the sentence
  it marks; correcting to UNdata risks introducing an error against Albania's own count. It waits.
- **`Iceland`, `Norway`, `Switzerland`, `Andorra`**: UNdata confirms every figure in all four, but **UNdata
  alone is one source and the bar is two**, and the natural second for a non-EU European state is shut —
  **`efta.int` 403, `coe.int` 403**. They need a second source found, not invented.

**That is six deferrals across two batches and always the same shape: the recipe is two institutional
profiles, and it reaches exactly as far as a country's description states figures those profiles publish.**
C3 is therefore the harder half of Europe — the non-EU states, the Balkans, the microstates and Greece —
and should be planned as its own problem rather than as more of the same.

### Batch C3 log — outside the EU the recipe has one leg, and fifteen of nineteen wait

#### 2026-08-02 — four terms, 8 citations, no corrections, fifteen deferrals

**Coverage 167/333 → 171/333.** Bosnia and Herzegovina, North Macedonia, Norway, Ukraine. C2 predicted C3
would be the harder half of Europe; it is harder than predicted, and the ratio — four shipped, fifteen
waiting — is the finding.

**Outside the EU there is no second institutional profile, and every natural substitute is shut here**
(measured 2026-08-02): **`efta.int` 403, `coe.int` 403, `admin.ch` and `eda.admin.ch` 403, `althingi.is`
403, `mfa.gr` 403.** UNdata answers for all nineteen and confirms every figure in all nineteen — but UNdata
alone is one source and the bar is two.

**So the second source is per country, per claim, and it exists only where the third sentence names a
datable act.** The four that shipped are exactly those four:
- **Bosnia and Herzegovina** on the OSCE's own Dayton Peace Agreement page (November 1995, signed in Paris
  14 December 1995, the Constitution as Annex 4);
- **North Macedonia** on NATO's member table (2020), which is what "opened the way to NATO membership"
  turns on;
- **Norway** on Norges Bank Investment Management, which calls the Government Pension Fund Global "one of
  the world's largest funds" and dates it to the North Sea oil discovery — the term's whole closing clause
  from the body that runs the fund;
- **Ukraine** on General Assembly resolution **ES-11/1, "Aggression against Ukraine"** (2 March 2022),
  which records the 24 February 2022 "special military operation" declaration and operations "on a scale
  that the international community has not seen in Europe in decades".

**The rule for C4 onward: read the third sentence first and ask what ACT it names.** A treaty, an accession,
a resolution or a founding has a source; a dynasty, a language family or a mountain confederation does not,
and the term waits. The fifteen deferrals are almost all of the second kind — Andorra's co-principality of
1278, Liechtenstein's princely purchase, the Grimaldis, San Marino's traditional 301, Swiss neutrality since
1815, the Althing of 930, Russia from Moscow to the USSR.

**Two deferrals are different in kind and are flagged rather than filed.**
- **`Belarus`** cannot be dated by UNdata at all: the term says "a Soviet republic until independence in
  1991", and UNdata's UN membership date is **24 October 1945**, because Byelorussia was a founding member
  of the UN in its own right. The field that has carried an independence clause all through Phase 3 gives
  the wrong answer here. **Check what the UN membership date actually means before marking it** — for the
  Soviet founding republics it dates the USSR's seat, not the country's independence. Ukraine has the same
  1945 date, which is why its marker is on the 2022 resolution and not on UNdata's membership field.
- **`United_Kingdom`** is deferred on a TOOLING fault, not a sourcing one: **its Japanese translation splits
  into four sentences where the other nine split into three.** Markers placed by sentence index would land
  on different claims in Japanese. The prose has to be repaired first, exactly as batch 24 repaired the
  deck's 5+5 splits — and this is the first time the country pass has hit that failure, so **run
  `split-abstract.js` over a batch's terms before planning its markers**, which C0–C2 did by luck rather
  than by rule.

**`Greece` has now been deferred three times** and should not be carried a fourth. It states no area, no
population and no capital, its EU accession is not in its third sentence, and `mfa.gr` is 403. It needs
either a rewrite that states a figure or a class of source this pass has not found.

### Batch C4 log — the Commonwealth is Asia's EU country page

#### 2026-08-02 — seven terms, 14 citations, no corrections

**Coverage 171/333 → 178/333.** Bangladesh, India, Malaysia, Maldives, Pakistan, Singapore, Sri Lanka —
**chosen as a group because they share a second source**, which is C3's rule applied in advance instead of
discovered halfway through.

**The Commonwealth Secretariat's country pages are the bloc profile the recipe needs outside Europe.** The
Key Facts block carries Population, Area, Capital city **and the year of joining with its independence
context in the same line**: India "1947, following independence from Britain"; Pakistan "1947, on partition
from India"; Sri Lanka "1948, following independence from Britain"; Malaysia "1957, following the Federation
of Malaya's independence from Britain"; Singapore "1965, on leaving the Federation of Malaysia and becoming
an independent state". **That is the same shape as the EU's "EU Member State : since <date>", from a body
covering 56 states across Asia, Africa, Oceania and the Caribbean** — most of the rest of Phase 3.

**But the joining line is not always the independence line.** Bangladesh's gives **1972**, the year it
joined; the term says independence came **in 1971**, after the war. The Commonwealth supports "independence
from Pakistan" and not the year, and UNdata's UN membership date (17 September 1974) is later still —
**both institutional dates postdate the independence they follow**, so Bangladesh's third sentence is left
unmarked and the term is cited on its first alone. **Read the joining line before marking to it.**

**Two official sources 10% apart on one country, and neither wrong.** Pakistan's area: **UNdata 796,095
km², the Commonwealth 882,000 km², the term "about 881,900"**. That is the Kashmir question — UNdata
excludes the Pakistani-administered territories and the Commonwealth includes them — and it is the widest
divergence in Phase 3 so far. The term agrees with the Commonwealth and **no correction was made**. This is
the case to remember when the African and Middle Eastern batches meet a disputed border: the disagreement
is a political fact, not a measurement convention.

**And India went the other way in the same batch.** The Commonwealth gives 3,166,391 km², UNdata
**3,287,263**, and the term's "about 3.3 million" matches UNdata. **A batch run on the Commonwealth alone
would have made a wrong correction on India, exactly as C2's on the EU page would have on Spain.** Two
official sources disagreeing in opposite directions on two neighbouring countries in a single batch puts
the read-both rule beyond argument.

**For C5 and C6: probe `asean.org`, the Gulf Cooperation Council and the Arab League first.** If any
publishes a member profile in the shape of the EU's or the Commonwealth's, the rest of Asia is cheap; if
none does, the remaining thirty-nine Asian terms are C3 again — UNdata alone unless the third sentence
names a datable act.

### Batch C5 log — the bloc probe C4 ordered, and its answer is no

#### 2026-08-02 — four terms, 8 citations, no corrections, thirty-five deferrals

**Coverage 178/333 → 182/333.** Israel, East Timor, North Korea, South Korea.

**C4 named three blocs to probe before planning this batch. All of them fail.** `asean.org` returns **307 on
every path including the root**, with no followable Location; the OIC's member-states page is a news feed
with no per-country profiles; the Gulf Cooperation Council and the League of Arab States publish none
either. **There is no Asian equivalent of the EU country page or the Commonwealth Key Facts block**, so
Asia outside the Commonwealth is C3's position one continent over: UNdata answers for all thirty-nine and
confirms every figure, and is one source against a bar of two.

**C3's rule selected all four that shipped, and three of the four second sources are UN instruments** —
served by `documents.un.org` and UNISPAL where `un.org`'s own topic sections are CloudFront-blocked:
General Assembly resolution **181 (II)** of 1947 for Israel ("The Mandate for Palestine shall terminate …
not later than 1 August 1948"); Security Council resolution **1272 (1999)** for East Timor, establishing
UNTAET with "overall responsibility for the administration of East Timor"; and the Office of the Historian's
**Korean War** milestone for both Koreas, which carries the 38th parallel, June 1950 and the 1953 truce.
**That one page cites two countries is the only economy of scale the batch found.**

**A divergence recorded rather than corrected, and it sets a rule.** The **United Arab Emirates**: UNdata
gives **71,024 km²** against the term's **83,600**, the UAE's own official figure — a **17% gap, the widest
in Phase 3**, ahead of Pakistan's 10% Kashmir gap and the Netherlands' 12% land-versus-total gap. The UAE is
not a Commonwealth member and there was no second official source to break the tie, so the term was left
alone and deferred. **When UNdata is the only profile and it disagrees with the term by more than a
rounding, defer — do not correct on one source.** That is C0's South Sudan correction restated as a rule
rather than a regret.

**One deferral is a lesson about relevance rather than reach.** `China`'s figures match UNdata almost
exactly and the UN Charter names it a permanent member of the Security Council — but **the term's third
sentence does not mention the Security Council**, so the Charter cannot be cited for anything the term says.
A source that is open, authoritative and about the right country is still not a source for a claim the term
does not make.

**And `Taiwan` is the second SPLIT fault in three batches**, after `United_Kingdom` in C3: its Japanese
translation runs to four sentences where the other nine run to three, so markers placed by sentence index
would land on different claims. Two in three batches settles it — **run `split-abstract.js` over a batch's
whole term list before planning its markers.**

### Batch C6 log — the split check pays on its first use, and the joining line is measured

#### 2026-08-02 — thirteen terms, 26 citations, no corrections, four deferrals

**Coverage 182/333 → 195/333** — the largest country batch of Phase 3 so far, and it confirms C4's finding
at scale: the Commonwealth is the bloc profile outside Europe.

**C5's up-front split check earned its place immediately.** Run over the whole term list before any marker
was planned, it caught **`Lesotho` splitting into four sentences in Italian** and **`Malawi` into four in
Japanese**, where the other nine split into three. Both were removed from the batch before any work was done
on them — where `United_Kingdom` and `Taiwan` were each caught late, after their research was already done.
**Four split faults in four batches makes this a standing step, not a precaution.**

**The Commonwealth joining line is the independence line eleven times in thirteen, and the two exceptions
have a shape.** Ghana 1957, Nigeria 1960, Sierra Leone 1961, Uganda 1962, Zambia 1964, Botswana 1966,
Mauritius 1968, Seychelles 1976 and Namibia 1990 all match their terms' independence years exactly and were
marked. **Mozambique (joined 1995, "following its first democratic elections", independent 1975) and Rwanda
(joined 2009, independent 1962) are states that joined without ever having been British**, so their joining
line dates an accession and not an independence — the case C4 warned about, now met twice.

**Cameroon is the subtler one and is why the check has to be per country.** The years agree — the
Commonwealth says 1960 and the term says 1960 — but the term describes a French portion independent in 1960
and a British portion in 1961 joining together, which the Commonwealth's single line does not describe. **A
marker was withheld on a near-match rather than placed on one.** South Africa is the same in a different
direction: joined 1931, left 1961, rejoined 1994, against the term's Union of 1910.

**Fourteen countries' figures checked against both sources, and no corrections.** Seven areas match exactly
or to within a few km² (Nigeria 923,769 against 923,768; Rwanda and South Africa exact), and every area is
within 0.7% of both sources. **The populations are the interesting part: they sit consistently BETWEEN the
Commonwealth's 2022 figures and UNdata's 2025 ones** — Uganda's "roughly 48 million" between 45.7 and 51.4,
Zambia's "roughly 20 million" between 18.38 and 21.9, Seychelles' "roughly 120,000" between 98,462 and
133,000. That is what a term written from a recent-but-not-current estimate looks like, and on either source
alone several would have looked wrong in one direction or the other.

**`Kenya` is the Greece shape, and its recurrence is the finding to carry forward.** Its description states
no area, no population and no capital, so UNdata carries nothing it says and it would ship on the
Commonwealth alone. **Greece and Kenya are both among the twelve countries this plan describes as "written
earlier and at greater length" — and that extra length is extra PROSE, not extra FIGURES**, which is exactly
what makes them invisible to a recipe built on statistical profiles. **Expect the remaining ten of that
twelve — Tanzania, France, Georgia, Denmark, Australia, India, Russia, China, Japan, Brazil — to behave the
same way**, and note that France, India, Denmark and China have already been shipped or deferred on
precisely that pattern.

**And `Tanzania` was deferred on a missing slug**: `/our-member-countries/tanzania`,
`/united-republic-of-tanzania` and `/tanzania-united-republic` are all 404 and the site offers no readable
index. A trivial obstacle, but not one to guess past — a citation must point at a page that exists.

## Batch C7 log — Africa: the rest of the Commonwealth, and the guide that covers everywhere (2026-08-02)

**DONE.** Eleven terms — Eswatini, Eritrea, Gabon, The Gambia, Kenya, Lesotho, Malawi, Morocco, Somalia,
Tanzania, Togo — 26 citations, **one correction**. Coverage 195 → **206 of 333**. Three deferred: Egypt,
Ethiopia, Libya.

**The finding is a source, and it changes what the rest of Phase 3 costs.** The Office of the Historian's
**`history.state.gov/countries/<slug>`** — *A Guide to the United States' History of Recognition,
Diplomatic, and Consular Relations, by Country, since 1776* — exists for **every state in the world** and
its Recognition section states, in prose, when a country became independent and from whom. C3 concluded
that outside the EU there is no second European profile and C5 that Asia outside the Commonwealth has none;
both remain true of *statistical* profiles and are now largely beside the point, because **the third
sentence of a country term is almost always an independence date** and this guide carries it everywhere.
It gave Somalia two of its three historical claims from one page (the British-and-Italian union of 1960 and
the 1991 collapse of central government), both halves of Kenya's "British control in the late 19th century
… independent in 1963" (it dates the colonial rule to 1895), and the old colonial names — Basutoland,
Nyasaland, Tanganyika, Togoland — that several terms turn on. Caveat: it is written from the United States'
point of view, so a date is often a *recognition* date; cite it only where the page states the event beside
it, which on this batch it always did.

**The line this batch draws on what a marker may rest on.** UNdata's Region field ("Eastern Africa") is a
real fact, and `Kenya` and `Tanzania` — both figure-less, the Greece shape — could have been marked to it.
They were not: their opening sentences also assert a highland plateau, the Rift Valley, Lake Victoria,
Kilimanjaro and the Zanzibar archipelago, and a marker at a sentence end vouches for the sentence. **Where a
profile carries a term's FIGURES, marking the figure sentence to it is the practice of C1–C6 and continues;
where it carries only a region name, it has not earned the sentence.** Both ship on the Commonwealth and the
recognition guide instead, with UNdata absent from their lists — which is how **Kenya, deferred three
times, finally shipped**: not by finding a figure for it, but by dropping the source that had nothing to say
about it.

**The one correction** is `Togo`'s population, "roughly 9 million" → **"roughly 8.6 million"**, and it is
correct precisely because it is *not* a single-source call: UNdata gives 8,592 thousand and the
Commonwealth 8.645 million, and the two agree against the term. By the same rule **`Gabon` (2.4 against
2.593) and `Somalia` (18 against 19.655) were NOT corrected** — each has only UNdata, so following C5's UAE
rule the figure stands, the opening sentence goes unmarked, and the term is carried by its third sentence.
C0's South Sudan correction on UNdata alone is the exception, not the precedent.

**Two Commonwealth slugs recovered, and the rule behind them: the slug follows the member's FORMAL name.**
`Tanzania` is `united-republic-tanzania` — C6 deferred it after `tanzania`, `united-republic-of-tanzania`
and `tanzania-united-republic` all 404'd — and `Eswatini` is `kingdom-eswatini`. Also: **a member admitted
recently has a page but not a profile**. Gabon's says only that it joined in June 2022 at the Kigali CHOGM,
with "No data found" where the population belongs, and Togo's joining line carries no independence context
because Togo was never British — the Mozambique/Rwanda shape C6 named.

**The three deferrals are all one shape**: a figure diverging from UNdata with no second profile to break
the tie, over a third sentence the recognition guide cannot reach. `Egypt` — "roughly 107 million" against
118,366 thousand, a **10.6% gap, the widest population divergence in Phase 3**, and a live disagreement
between the UN's estimate and Egypt's own rather than an error in the term; its history is pre-dynastic and
Pharaonic. `Ethiopia` — 130 against 135.5 million, its history Aksum and the Solomonic monarchy. `Libya` —
area 1,759,540 km² against 1,676,198, a 5.0% gap. **A note for whoever returns to Libya:** its term says
"an Italian colony from **1911**" where the guide says the Ottoman cession was the Treaty of Ouchy of
**October 1912**. Both are defensible, but a marker beside "1911" pointing at that page would point at a
work that says otherwise — reword or leave unmarked.

### Tooling: the whole-glossary split audit, and both faults it found

Run over all 333 terms in all ten languages before any research, per the C5/C6 rule, this batch's check
went wider than its own list and found **seven faults, of two kinds — and both are now fixed, leaving the
glossary at 0 of 333.**

**Five were the same authoring fault in Chinese: an English semicolon rendered as a full stop.** Every
country term whose second or third sentence joins two clauses with `;` had that joint translated as `。` in
zh, turning three sentences into four — `United_Kingdom`, `Taiwan`, `Malawi`, `New_Zealand`,
`Papua_New_Guinea`, and nothing else in the glossary. Repaired to `；`, claim for claim identical. This
**unblocks `United_Kingdom` (deferred in C3) and `Taiwan` (C5)** and clears two Oceania terms before C10
reaches them. **Check a term whose English uses a semicolon.**

**Two were a splitter gap, in German: a regnal ordinal.** German writes a monarch's number as a Roman
numeral with a trailing period — "König Leopold **II.** von Belgien", "Moshoeshoe **I.** in den 1820er
Jahren" — which `split-abstract.js` read as a sentence end, breaking `Democratic_Republic_of_the_Congo` and
`Lesotho` in half. The existing German guard could not see it: a Roman numeral is not `\d`, and no
determiner precedes it. A new clause holds a Roman numeral that **follows a capitalised name and is
followed by a lowercase word** — which is what distinguishes a mid-sentence regnal number from a sentence
that genuinely ends on one ("…the reign of Henry VIII. The next…" is untouched). Verified against all 109
cards in all ten languages: still 5+5, exact round-trip, no regressions.

**The audit is worth running over the whole glossary rather than a batch's own list.** Both faults were
invisible to the batches that shipped beside them, and four of the five Chinese ones sat in terms nobody
had reached yet — where they would have been discovered, as `United_Kingdom` and `Taiwan` were, only after
the research had been done.

## Batch C8 log — Africa outside the Commonwealth, and the populations that were merely old (2026-08-02)

**DONE.** Fourteen terms — Algeria, Angola, Benin, Burkina Faso, Burundi, Central African Republic, Chad,
DR Congo, Republic of the Congo, Djibouti, Egypt, Equatorial Guinea, Guinea, Guinea-Bissau — 28 citations,
**fourteen corrections across thirteen terms**. Coverage 206 → **220 of 333**. One deferred: Comoros.

**C7's find is now a recipe: UNdata plus the Office of the Historian's recognition guide, two fetches,
anywhere in the world.** None of these fourteen states is in the EU or the Commonwealth, the African Union
publishes no country pages, and `afdb.org` and `oecd.org` are 403 — this is precisely the position C3 and
C5 called sourceless, and it is now a routine batch. The guide gave more than the independence year:
Algeria's French conquest of 1830, Burkina Faso's renaming from Upper Volta in 1984, Egypt's British
protectorate of 1882 *and* its continuing nominal place in the Ottoman Empire, the Belgian trusteeship over
Ruanda-Urundi, Dahomey's 1975 renaming to Benin.

### The finding: a population that disagrees with UNdata is usually STALE, not contested — and you can prove which

Thirteen of the fourteen terms opened on a population several per cent below UNdata's 2025 figure. Under
C5's rule — a single-source divergence is deferred, never corrected — nearly every opening sentence would
have gone unmarked and the batch would have been half a batch. **The World Bank's API settles it:**

```
api.worldbank.org/v2/country/<ISO3>/indicator/SP.POP.TOTL?format=json&date=2015:2025
```

returns the whole series, and **every term's figure is an earlier point on that same series** — Egypt's
"107 million" is the 2019 value to two decimal places, Chad's "18 million" the 2022 value, DR Congo's "105
million" the 2023 value. The terms were not disputing UNdata; they were written from it, some years ago.
All thirteen were updated to the 2025 figure in all ten languages. **The Central African Republic alone
needed nothing** — its 5.5 million is current.

**This is not the thing C2 and C5 warned against.** Their danger was concluding a term is wrong when a
*rival* official source would have vindicated it — Spain at 49.1 million on the EU's page against 47.9
million at UNdata. Here there is no rival: the two figures are the same series read at different dates, and
the series says which date. **The rule to carry forward: before deferring on a population, ask the World
Bank series when the term's figure WAS true. If it names a year, the figure is stale and updating it is
safe; if it names none, the figure is contested and C5's rule stands.**

**The caution that goes with it: the World Bank is NOT a second source for a population.** `SP.POP.TOTL`
relays the UN's own estimate — 21,003,705 for Chad against UNdata's 21,004 thousand, the same number — so
citing both for one figure would be false corroboration. It is a diagnostic and appears in no source list.

**It also revises C7's Egypt deferral, which is worth saying plainly.** C7 read 107-against-118 million as
a live disagreement between the UN's estimate and Egypt's own. It is not: 107 million is the 2019 value of
the same series. The deferral was wrong on its reason, and Egypt is cited here.

**The one correction that is not a figure** is `Djibouti`: "it was French Somaliland until independence in
1977" becomes "it was ruled by France, latterly as the French Territory of the Afars and the Issas, until
independence in 1977". The guide names that territory at the moment of independence; French Somaliland was
the name only until 1967, so the term named the wrong entity at the date it gave. The 1967 rename is in
nothing openable here, so the new wording claims only what the citation carries.

**`Comoros` is deferred for two reasons at once**, and both are instructive. Its area of 1,861 km² counts
the three islands it governs where UNdata's 2,235 km² counts the archipelago **including Mayotte** — the
Cyprus case of C1 in reverse, with the profile counting the claimed territory and the term the controlled
one. And the recognition guide, which carried every other term in this batch, records U.S. recognition in
**1977**, two years after the independence the term gives, with nothing about French rule: **a recognition
date is not an independence date, and where the two differ the guide cannot be cited for the latter.**

**Two Congo slugs worth writing down**: `congo-democratic-republic` and `congo-republic`. Neither
`democratic-republic-of-the-congo`, `republic-of-the-congo`, `congo` nor `zaire` exists. The index at
`history.state.gov/countries` resolves any slug in doubt.

## Batch C9 log — the last of Africa, and a second source for AREA (2026-08-02)

**DONE, and AFRICA IS COMPLETE: 56 of 56.** Fourteen terms — Comoros, Ethiopia, Ivory Coast, Liberia,
Libya, Madagascar, Mali, Mauritania, Niger, São Tomé and Príncipe, Senegal, Sudan, Tunisia, Zimbabwe — 29
citations, **fifteen corrections across thirteen terms**, nothing deferred. Coverage 220 → **234 of 333**.

### The finding: the World Bank IS an independent second source — for AREA, not for population

C8 established that `SP.POP.TOTL` relays the UN's own estimate and is a diagnostic rather than a citation.
**`AG.SRF.TOTL.K2` is a different series**, reaching the World Bank through the FAO rather than the UN
Statistics Division, and it disagrees with UNdata exactly where the disagreement is informative:

```
api.worldbank.org/v2/country/<A>;<B>;<C>/indicator/AG.SRF.TOTL.K2?format=json&date=2022
```

(A semicolon-separated country list in one request, which is also the way around the API's habit of
returning an empty body under rapid repeated single fetches.)

**It resolved both standing deferrals at once, and in the same direction: the term was right and UNdata was
the outlier.** `Libya`, deferred in C7 on a 5.0% area gap, states **1,759,540 km²** — the World Bank's
figure exactly, against UNdata's 1,676,198. `Comoros`, deferred in C8 because UNdata's 2,235 km² counts
Mayotte, states **1,861 km²** — again the World Bank's figure exactly. Both now cite the World Bank for the
area and UNdata for the population and capital. **When UNdata's area looks wrong, ask `AG.SRF.TOTL.K2`
before deferring — and never use `SP.POP.TOTL` the same way, because that one is the UN's own number.**

Elsewhere the two agree closely, which is what makes the two exceptions meaningful: Mauritania, Niger and
Tunisia are identical in both, and Madagascar, Zimbabwe, Liberia, Mali and São Tomé differ by under 0.05%.
**The line adopted: correct an area only when the term falls OUTSIDE the spread of the two sources.**
`Ivory_Coast` (322,463 against 322,462 and 322,460) falls inside and was left; `Senegal` (196,722 against
196,712 and 196,710) falls outside and was corrected.

### Corrections
Thirteen populations, every one diagnosed by C8's method as an earlier point on the same series — Sudan 48
→ 52 m (its 2021 value), Ethiopia 130 → 135 m, Niger 26 → 28 m, Mali 23 → 25 m, and nine more. **`Tunisia`
alone was left**, at "roughly 12 million" against 12,349 thousand, which rounds correctly. One area
(`Senegal`). And one date narrowed: **`Madagascar`'s "France conquered it in 1897" → "in the 1890s"**,
because the recognition guide states "In 1890, France assumed sovereignty over Madagascar as a colony" —
1890 is the protectorate and 1897 the annexation, two different acts, and batch 16's rule says narrow to
what the source will bear rather than pick one.

### What the guide gave beyond the independence year, on this batch
`Zimbabwe` supplied all three of its term's historical claims from one page — Southern Rhodesia, the 1965
UDI by "the colony's minority white government" which the United States never recognised, and independence
in 1980. `Liberia` gave 1822 and the American Colonization Society and the 1847 republic. `Sudan` gave the
Anglo-Egyptian condominium. `Tunisia` gave a section headed "Tunisia under French Control, 1881-1956" with
the Treaty of Bardo. And `Mali`'s page carries both its own third sentence and `Senegal`'s, the Federation
of Mali having contained them both.

**Four UN membership dates do NOT corroborate an independence year and were not marked**: Mauritania (1961
against 1960, a Soviet veto), Libya (1955 against 1951, the same Cold War deadlock), Liberia (1945) and
Ethiopia (1945). C3 found this for the Soviet founding republics; the Cold War admissions deadlock is the
other family of cases, and it is worth checking the date rather than assuming it.

**One gap with no source at all: `Sudan`'s UNdata profile has no Surface area field**, the only profile in
Phase 3 so far that omits one, so its 1,861,484 km² rests on nothing openable here and the World Bank's
1,878,000 is a different convention. Recorded, not corrected.

## Batch C10 log — Oceania, and why it needed almost no corrections (2026-08-02)

**DONE, and OCEANIA IS COMPLETE.** Thirteen terms — Australia, New Zealand, Papua New Guinea, Fiji,
Solomon Islands, Vanuatu, Samoa, Tonga, Kiribati, Nauru, Palau, Marshall Islands, Federated States of
Micronesia — 35 citations, **four corrections**, nothing deferred. Coverage 234 → **247 of 333**.
(Tuvalu was cited in C0.)

**The recipe reaches its densest form here: UNdata + Commonwealth + Office of the Historian, three
sources on most terms.** Ten of the thirteen are Commonwealth members and all thirteen have a
recognition-guide page. The three do genuinely different jobs — UNdata the current figures, the
Commonwealth the 2022 figures and the joining line, the guide the colonial history neither of the others
carries — and on `Australia` that difference is the whole point: the guide states "On January 1, **1901**,
six colonies were joined together to create the Commonwealth of Australia", which is the term's third
sentence, while the Commonwealth's own joining line dates membership to **1931** and the Statute of
Westminster. `Tonga` came through best of all, the guide giving the 1845 unification, the 1875
constitution, the 1900 protectorship and the 1970 withdrawal — the term's entire third sentence including
"from 1900 to 1970".

### The finding: Oceania needed three population corrections where Africa needed twenty-six

C8 and C9 updated twenty-six stale populations between them. **This batch updated three.** Fiji's
930,000 against 933,154, Vanuatu's 330,000 against 335,169, Samoa's 220,000 against 219,306, Nauru's
12,000 against 12,025, Australia's 27 million against 26.97 — all current. The reason is arithmetic, not
editorial care: **a figure rounded to two significant figures survives a decade of slow growth**, and
these populations are small and flat or declining where the African ones are large and growing at 2–3% a
year. **Run the series before assuming either way**; and note that `Marshall Islands` is the batch's
instructive case — its 40,000 was stale by being **too HIGH** (48,800 in 2015 falling to 36,282 in 2025
as people leave under the Compact), so "out of date" must not be read as "too low".

### A refinement to C9's area rule
C9 said: correct an area only when the term falls outside the spread of the two sources. Oceania forces
one qualification — **the World Bank rounds small areas to the nearest 10 km²** (Tonga 750, Kiribati 810,
Nauru 20), so its figure states an interval rather than a point. `Fiji` was corrected from 18,274 to
**18,272** because that is what UNdata *and* the Commonwealth both give precisely, and 18,274 is outside
18,270 ± 5 as well. Nothing else in the batch falls outside once the rounding is allowed for.

### Three disagreements between the three sources, and which was believed
- **`Kiribati`'s area**: UNdata **726 km²** against the Commonwealth's **811**, the World Bank's 810 and
  the term's 811. UNdata is the outlier by 10%, so **UNdata is not cited on this term at all** — the first
  time in Phase 3 that the pass's Source A has been dropped outright.
- **`Solomon Islands`' area**: the Commonwealth's **30,407 km²** against UNdata's, the World Bank's and
  the term's ~28,896. Here the Commonwealth is the outlier, so its citation carries only the third
  sentence.
- **`Palau`'s capital**: the term says **Ngerulmud**, UNdata says **Melekeok**. Ngerulmud is the seat of
  government and stands in Melekeok State — a town-against-state naming difference, recorded not
  corrected.

And **the Commonwealth's populations run low throughout** (Fiji 896,400, Kiribati 119,400, Nauru 10,000,
all 2022), with every term's figure sitting between theirs and UNdata's: C6's pattern, one ocean over.

### Unmarked and recorded
`Australia` "the sixth-largest country in the world"; `New_Zealand`'s **Treaty of Waitangi of 1840** (the
guide begins at the 1907 Dominion, which is what carries "self-governing since the early 20th century");
`Nauru`'s German annexation of 1888; `Kiribati`'s "heavy fighting at Tarawa in 1943"; and — the largest
gap in the batch — `Marshall Islands`' **67 nuclear tests at Bikini and Enewetak between 1946 and 1958**,
which the recognition guide does not mention at all, giving the Compact and continued U.S. use of
Kwajalein instead.

## Batch C11 log — North America, Central America and the Caribbean (2026-08-02)

**DONE.** Twenty terms — Canada, United States, Guatemala, Belize, El Salvador, Honduras, Panama, Cuba,
Haiti, Dominican Republic, Jamaica and the nine Commonwealth Caribbean states — 44 citations, **eight
corrections**. Coverage 247 → **267 of 333**. Three deferred: Mexico, Costa Rica, Nicaragua.

### The finding: the recognition guide dates by RECOGNITION, and in Spanish America that is not independence

The guide carried Africa and Oceania because there recognition followed independence within days. In this
region it lags by years or decades — Mexico recognised in **1822** against independence in 1821, the
Central American states through the Federation in **1824** and individually in 1844–1853, Haiti in
**1862** against 1804, the Dominican Republic in **1866** against 1844. **Where a page happens to state
the independence year separately it still works** (Guatemala's "Following its independence from Spain in
1821", Honduras's "its 1821 independence from Spain", Haiti's "won independence from France in 1804",
the Dominican Republic's "declared itself an independent nation from neighboring Haiti in 1844"), **and
where it does not, it cannot carry the term's date**. Grepping the saved HTML for the year is the
two-second check: `oh-Mexico.html`, `oh-Costa_Rica.html` and `oh-Nicaragua.html` contain no "1821" at all.

**`Costa Rica` is the case that must not be papered over**: its page does not merely omit 1821, it says
Costa Rica "did not formally declare its independence until **August 30, 1848**". Both dates are
defensible — 1821 is independence from Spain, which Costa Rica keeps as its national day, and 1848 the
declaration of a separate republic — but citing that page beside "1821" would be exactly the selective
quotation P2 warned about. **It needs a prose reconciliation, not a citation**, so it is deferred with
`Mexico` and `Nicaragua`. For Nicaragua a route exists and was deliberately left for later: the guide's
**El Salvador** page states 1821 for "the other Central American provinces" as a group, which does cover
it — but a citation headed "…: El Salvador" sitting on the Nicaragua term reads like a mistake, and that
is a judgement worth making deliberately rather than in passing.

**The United States has no page in the guide** — it is written from the United States outward — so its
third sentence is carried by **NARA's Milestone Document for the Declaration of Independence (1776)** and
**the guide's Milestone on the Treaty of Paris, 1783**, which speaks of "a settlement that would provide
the thirteen states with some measure of American independence".

### The World Bank's area series contains outright errors
C9 made `AG.SRF.TOTL.K2` an independent second source for area. This batch found it is not always a
*correct* one: **Canada is listed at 15,634,410 km²** against the true 9,984,670, and **the Dominican
Republic at 146,839 km²** from 2019 onwards against 48,671 — with its own 2018 value at 48,670, so the
series broke partway through. Neither is a land-versus-total or disputed-territory convention; they are
wrong. **Apply a plausibility check before letting it adjudicate.** Where it agreed with the term against
UNdata (Libya, Comoros in C9; the Bahamas here) it was right; where it disagrees with everything, the term
stands.

### Corrections
Five stale populations by C8's method — Guatemala 18 → 19 m, Honduras 10 → 11 m, Haiti 11 → 12 m,
Dominican Republic 11 → 12 m, Belize 410,000 → 420,000. Two more where the term was simply low or the
population is falling: **Barbados 270,000 → 280,000** (283,000 at UNdata, 282,623 at the World Bank and
287,370 at the Commonwealth — all three above the term) and **Saint Vincent and the Grenadines 110,000 →
100,000**, which is the C10 Marshall Islands pattern *with the corroboration attached*, since the
Commonwealth's 2022 figure of 110,900 shows the term's number was right when written. And one area:
**Panama 75,417 → 75,320 km²**, which UNdata and the World Bank both give.

### The diagnostic said "do not touch" for the first time
**`Cuba`.** The term says 9.4 million where UNdata says 10,937 thousand — a 14% gap, the kind that has
produced a correction in every batch since C8. But the World Bank series **never passes through 9.4
million**: it runs 11.23 million in 2018 down to 10.94 million in 2025. By C8's own test the figure is
**contested, not stale** — Cuba's population is genuinely disputed after the emigration of the 2020s — so
it was left alone and recorded. That is what the rule was for, and it is the first time it has fired in
the withholding direction.

Two more where UNdata is the outlier and the term stands: **Trinidad and Tobago** (UNdata 1,511 thousand
against the World Bank's 1,367,764 and the Commonwealth's "1.4 million"), and **Canada** and the **United
States**, where UNdata runs above the national estimates the World Bank uses and the terms sit with the
World Bank.

### A slug note that cost several 404s
**The two sites spell the same states differently.** The Commonwealth writes `st-kitts-and-nevis`,
`st-vincent-and-grenadines` and `saint-lucia`; the recognition guide writes `saint-kitts-nevis`,
`saint-vincent-grenadines`, `saint-lucia` and `antigua-barbuda`. Both publish an index —
`thecommonwealth.org/our-member-countries` and `history.state.gov/countries` — and grepping it beats
guessing.

## Batch C12 log — South America, and the sentence before the recognition paragraph (2026-08-02)

**DONE.** Twelve terms — Colombia, Venezuela, Guyana, Suriname, Ecuador, Peru, Brazil, Bolivia, Paraguay,
Chile, Argentina, Uruguay — 24 citations, **five corrections**, nothing deferred. Coverage 267 → **279 of
333**. The Americas are complete but for C11's three.

### C11's warning needed refining, not repeating

C11 concluded that the recognition guide is unusable for Spanish America because it dates by U.S.
recognition. **In South America the same guide states the independence year outright on nine of twelve
pages** — Colombia "by 1819", Peru "in July 1821 under General San Martin", Bolivia "on August 6, 1825",
Paraguay "on May 15, 1811", Argentina "in 1816", Uruguay "in 1828", Ecuador's withdrawal from the
Colombian federation "in 1830", Suriname's Dutch colony "dating from 1667" and independence "in 1975".
The difference is structural: **these pages open with a sentence of CONTEXT before the recognition
paragraph, and that sentence carries the date.** Mexico's, Costa Rica's and Nicaragua's have no such
sentence. So the rule is not "the guide fails in Latin America" but **"the recognition date is not an
independence date — read the summary paragraph, which often gives the real one"**, with grepping the
saved HTML for the year as the check.

**`Venezuela` is saved by a preposition, and it is worth noticing why.** The guide says independence was
achieved "**by 1819**" where the term says "**by 1821**". A source saying a thing was achieved by 1819
entails that it was achieved by 1821, so the marker is sound — where "in 1819" against "in 1821" would
have been exactly the Cameroon near-match C6 withheld on. The preposition is doing real work.

### Two terms with no history source that still reached the bar
- **`Brazil`** — the guide recognises "the Kingdom of Brazil" in 1824 and never states 1822, with nothing
  on 1500, 1889 or the plantation economy. Its third sentence is left **unmarked** and the term is carried
  by its FIGURES instead: UNdata and the World Bank's area series both give ~8.51 million km², and those
  two are independent for area. **A term can reach the bar on its first sentence alone when the second
  source is a different measurement rather than the same one relayed.**
- **`Chile`** — the country page gives the 1810 declaration and Monroe's 1822 conclusion but no 1818. What
  carried it was a **Milestone**: "The Allende Years and the Pinochet Coup, 1969–1973". **When a country
  page will not date the independence, look for a Milestone on the term's other claim.**

### Corrections
Four stale populations — Guyana 800,000 → 840,000, Suriname 620,000 → 640,000, Bolivia 12 → 12.6 million,
Paraguay 6.8 → 7 million. And **the largest single area correction of Phase 3: `Ecuador` 283,561 →
257,217 km²**, UNdata giving 257,217 and the World Bank 256,370 — the two within 0.3% of each other and
the term 10% above both. A plausible explanation is that 283,561 predates the 1998 Brasilia settlement of
the Ecuador–Peru border, but **neither source says so; it is recorded as a hypothesis and not cited**, and
the correction rests only on the two figures.

### UNdata is the outlier three times out of four
`Venezuela`'s 916,445 km² sits between UNdata's 929,690 and the World Bank's 912,050; `Argentina`'s
2,780,400 is the World Bank's figure exactly against UNdata's 2,796,427; `Uruguay`'s 176,215 matches the
World Bank against UNdata's 173,626; only `Chile` matches UNdata against the World Bank. **Source A is a
source, not an authority** — which is the same lesson C10 drew from Kiribati and C9 from Libya, now
arriving three times in one batch.

## Batch D1 log — the European deferrals, cleared (2026-08-02)

**DONE, and EUROPE IS COMPLETE.** Nineteen terms — Greece, Georgia, Russia, Albania, Andorra, Armenia,
Azerbaijan, Belarus, Iceland, Liechtenstein, Moldova, Monaco, Montenegro, San Marino, Serbia,
Switzerland, Turkey, United Kingdom and Cape Verde — 40 citations, **four corrections including two
rewrites**, nothing deferred. Coverage 279 → **298 of 333**. The standing European deferral list is
empty.

### First, a correction to this pass's own bookkeeping
**C9 claimed Africa complete at 56 of 56 and it was 55.** `Cape_Verde` never appeared in any batch's
list, because the country lists used from C7 onwards were written with the UN's spelling **Cabo Verde**
while the glossary key is **`Cape_Verde`**. It matched nothing and was never noticed. It is cited here
and Africa is now genuinely complete. **Derive a batch's list from the glossary's own keys — from
`gloss-source-audit.js`'s uncited list — and never from an outside list of country names.**

### Why nineteen deferrals cleared at once
Every one was deferred in C2, C3 or C5 for want of a second source, and **the tools that clear them did
not exist then**: the recognition guide (found in C7) and the World Bank's two series (C9, C11). Twelve
ship on the guide — it states "1991" for all six post-Soviet terms, the 1815 Congress of Vienna "re-
established the independence and neutrality of Switzerland", Andorra's co-principality with the Bishop of
Urgell and the French president almost word for word, Liechtenstein's yielding of its foreign affairs to
Switzerland, Iceland 1944, Montenegro and Serbia 2006, Cape Verde 1975, and Hoxha's Albania as "one of
the most diplomatically isolated nations in the world".

### The finding: `SP.POP.TOTL` is not always the UN's number, which revises C8
C8 established that the World Bank's population series relays the UN's estimate and so cannot corroborate
it — measured on Chad, where the two agree to the person. **That is not universally true.** Where a
country runs its own well-established statistical service the World Bank uses that instead:

| | UNdata | World Bank | the term |
|---|---|---|---|
| Albania | 2,772,000 | **2,349,580** | 2.4 million |
| Moldova | 2,996,000 | **2,360,527** | 2.4 million |

**In both, the term matches the World Bank and UNdata is the outlier** — which is exactly why C2 deferred
Albania, reading a 13.4% gap as the term being wrong. It was not. Both ship citing the World Bank for
figures and the guide for history, with **UNdata not cited at all**, as Kiribati did in C10. **Check
whether the two actually agree before treating the World Bank's population as a relay; where they differ
it is an independent source.**

### The two rewrites — the Greece shape, retired
`Greece` had been deferred **four times** and `Georgia` was heading the same way: country terms stating no
area, no population and no capital, so no statistical profile can carry anything they say. Rather than
defer a fifth time, each opening sentence now states the figures its 195 siblings state. `Greece` gains
**131,957 km²** and **Athens**; `Georgia` gains **69,700 km²**, **roughly 3.8 million** and **Tbilisi**.
**No population was added to Greece**, because UNdata gives 9,939 thousand against the World Bank's
10,413,962 and choosing between them would have been arbitrary — the omission is deliberate. These are
editorial changes, not corrections: nothing either term said was wrong, and they are logged as rewrites
so no later reader mistakes them for findings. **This is the answer to the Greece shape**, and it applies
to any term that turns up in the same state.

### The two corrections, and a third World Bank area error
`Switzerland` 41,285 → **41,291 km²** (both sources give it precisely) and `United Kingdom` 244,376 →
**243,610 km²** (UNdata 242,495, the World Bank 243,610, the term above both). And after C11's Canada and
Dominican Republic, **`Monaco` is listed by the World Bank at 75 km²** against the true ~2 — the third
outright error in that series, and the third time C11's plausibility check has paid.

## Batch D2 log — the Asian deferrals, cleared; four terms left in the whole glossary (2026-08-02)

**DONE.** Thirty-one terms — China, Japan and every remaining Asian state but Taiwan — 62 citations,
**seventeen corrections across fifteen terms**. Coverage 298 → **329 of 333**. One deferred: Taiwan.

**Thirty of the thirty-one ship on the same two fetches.** C5 concluded that "Asia outside the
Commonwealth has no bloc profile" and deferred thirty-two terms on it. That was true and is now beside
the point: UNdata plus `history.state.gov/countries/<slug>` carries all of them, exactly as C8 found for
non-Commonwealth Africa. Only `Bhutan` has no page in the guide and ships on UNdata plus the World Bank's
area series — C12's `Brazil` pattern, figures alone with the third sentence unmarked. Slugs: **Myanmar is
`burma`**; Taiwan and Bhutan have no page.

### C5's UAE deferral resolved, by the rule C5 itself wrote
C5 deferred `United_Arab_Emirates` on a 17% area gap — UNdata's 71,024 km² against the term's 83,600 —
calling it "the widest in Phase 3" and applying its own new rule: never correct on one source. **The
World Bank gives 98,648 km²**, so the term sits *between* the two and stands. The instinct was right; the
second source arrived four batches later. Nothing about the term needed changing.

### The diagnostic withheld a second time, and again on a contested population
Twelve populations were corrected, every one an earlier point on the same series: **`Yemen` 34 → 42
million**, its 2018 value and the largest population correction of the pass; `Syria` 23 → 26 (2023);
`UAE` 10 → 11 (2022); `Afghanistan` 42 → 44; `Iran` 89 → 92; `Kazakhstan` 20 → 21; `Tajikistan` 10 → 11;
`Turkmenistan` 7 → 7.6; `Oman` 5 → 5.5; `Jordan` 11 → 12; `Cambodia` 17 → 18; `Bahrain` 1.5 → 1.6.

**`Lebanon` was left alone.** Its "roughly 5.5 million" sits 6.4% below both sources — a gap that would
have been corrected in any other batch — but the series **never passes through 5.5 million**: 6.5 million
in 2015, down to 5.7 in 2020–22, back to 5.8. Contested, not stale. After C11's Cuba this is the second
withholding, and both are countries whose population is argued about rather than merely counted.

### `Taiwan` is deferred for a reason worth stating precisely
It has **no UNdata profile** (a 500, as Kosovo's `xk` gives), **no page in the recognition guide** and
**no World Bank series**. All three of Phase 3's sources are organised around UN membership, and a state
outside the UN system is invisible to every one of them. This is not a research failure that more
searching fixes — it needs a different class of source, a government statistics office or a work about
the island rather than about states.

### Five areas corrected, and the widest source disagreement of the pass
`Indonesia` 1,904,569 → **1,910,931**, `Iraq` 438,317 → **435,052**, `Jordan` 89,342 → **89,318**,
`Nepal` 147,516 → **147,181**, `Tajikistan` 143,100 → **141,400**. Left alone as inside the spread:
**`Iran`, whose two sources differ by 7%** — UNdata 1,630,848 against the World Bank's 1,745,150 — with
the term's 1,648,195 between them.

## Batch D3 log — the last four, and the pass is COMPLETE (2026-08-02)

**DONE. 333 of 333.** Four terms — Mexico, Costa Rica, Nicaragua, Taiwan — 10 citations, one rewrite.
Coverage 329 → **333 of 333**. `node .claude/gloss-source-audit.js` reports `citations to find 0`.

**`Costa Rica` got the prose reconciliation C11 said it needed**, not a citation. Its own page says the
country "did not formally declare its independence until August 30, 1848" against the term's 1821; both
are true of different events, so the clause now reads **"independence from Spain came with the rest of
Central America in 1821 and Costa Rica declared itself a separate republic in 1848"**, with each half
cited — 1848 to Costa Rica's page, 1821 to the guide's **El Salvador** page, which states "In 1821, El
Salvador and the other Central American provinces declared their independence from Spain".

**That El Salvador route was the one C11 saw and left**, on the ground that a citation headed "…: El
Salvador" on a Nicaragua term reads like a filing error. It is used here for both Nicaragua and Costa
Rica, because the sentence it carries is explicitly about "the other Central American provinces" and the
appearance is the smaller problem. The register says so, so a later reader does not take it for a slip.

**`Mexico` is cited on its figures with the independence clause unmarked** — C12's `Brazil` pattern. No
source opened in this pass dates Mexican independence to 1821: the guide recognises "an independent
Mexico" in 1822, NARA's Guadalupe Hidalgo page begins at the 1846–48 war, the Milestones for 1801–1829
contain no Latin American independence entry, and `loc.gov` is 403 here. **Its World Bank citation names
the year 2019** because that series gives 1,964,380 for 2018–19 and drifts to 1,957,194 by 2023 with no
explanation — the same unexplained movement that proved to be outright error for Canada, the Dominican
Republic and Monaco. The later values are recorded so the choice of year is visible rather than
convenient.

**`Taiwan` was cited without any of Phase 3's three sources.** D2 deferred it precisely: no UNdata
profile, no page in the recognition guide, no World Bank series, because all three are organised around
UN membership. The way in was the guide's **Milestones**, which are about EVENTS rather than states —
"The Chinese Revolution of 1949" ("the United States continued to recognize the Republic of China,
located on Taiwan, as China's true government") and "The Taiwan Strait Crises: 1954–55 and 1958" ("the
officials and part of the Nationalist Army fled to the island of Taiwan"). Its figures stay **unmarked**:
`taiwan.gov.tw` is 403 and the reachable Taiwanese statistical sites serve their indicators through
JavaScript. **A term can be cited on its history alone when its figures have no openable source** — the
mirror of `Brazil`, cited on its figures alone when its history had none.

### Batches C1–C12 · by region

| batch | region | terms | |
|---|---|---|---|
| **C1–C3 + D1 DONE** | Europe | 47 | Albania → Vatican City, plus Greece, France, Georgia, Denmark, Russia, less the three in C0. **C1 DONE (2026-08-02)**: Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, Germany, Hungary, Ireland, Italy, Latvia, Lithuania — **Greece deferred to C2**, its description carrying no figure either source states. **C2 DONE (2026-08-02)**: Luxembourg, Malta, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden — **six deferred to C3**: Greece again, Albania (UNdata contradicts its population), and Iceland, Norway, Switzerland, Andorra (UNdata alone is one source; `efta.int` and `coe.int` are 403 here) |
| **C4–C6 + D2 DONE** | Asia | 43 | Afghanistan → Yemen, plus India, China, Japan, less State of Palestine |
| **C7–C9 DONE** | Africa | 53 | Algeria → Zimbabwe, plus Kenya and Tanzania, less South Sudan. **C8 DONE (2026-08-02)**: Algeria, Angola, Benin, Burkina Faso, Burundi, Central African Republic, Chad, both Congos, Djibouti, Egypt, Equatorial Guinea, Guinea, Guinea-Bissau — fourteen on the two-fetch recipe, thirteen stale populations updated; **Comoros deferred** (its area counts Mayotte and the guide gives a 1977 recognition against a 1975 independence). **C9 DONE (2026-08-02)**: Comoros, Ethiopia, Ivory Coast, Liberia, Libya, Madagascar, Mali, Mauritania, Niger, São Tomé and Príncipe, Senegal, Sudan, Tunisia, Zimbabwe — **AFRICA COMPLETE, 56 of 56**, with Libya and Comoros unblocked by the World Bank's area series. **C7 DONE (2026-08-02)**: Eswatini, Eritrea, Gabon, The Gambia, Kenya, Lesotho, Malawi, Morocco, Somalia, Tanzania, Togo — the rest of Commonwealth Africa plus the first four carried by the Office of the Historian's recognition guide. **Three deferred**: Egypt, Ethiopia and Libya, each a figure diverging from UNdata with no second profile |
| **C10 DONE** | Oceania | 13 | **DONE (2026-08-02)**: all thirteen — Australia, New Zealand, Papua New Guinea, Fiji, Solomon Islands, Vanuatu, Samoa, Tonga, Kiribati, Nauru, Palau, Marshall Islands, Micronesia — most on THREE sources, four corrections, nothing deferred |
| **C11–C12** | the Americas | 35 | Canada → Uruguay, plus Brazil. **C11 DONE (2026-08-02)**: North America, Central America and the Caribbean — twenty terms, eight corrections; **Mexico, Costa Rica and Nicaragua deferred**, the recognition guide dating by U.S. recognition rather than independence . **C12 DONE (2026-08-02)**: all twelve South American states, five corrections, nothing deferred — the guide's summary paragraph gives the independence year on nine of the twelve |
| | | **191** | the 197, less the six worked in C0 |

Roughly 16 terms a batch. The twelve countries written earlier and at greater length — Greece, Kenya,
Tanzania, France, Georgia, Denmark, Australia, India, Russia, China, Japan, Brazil — are folded into their
regions rather than batched together, because their extra length is extra *claims*, and a batch of twelve of
them would be twelve times the hardest kind of work with no shared spine.

Work a region in one sitting where possible: the second source for one country in a region is very often the
second source for its neighbours, and the regional historiography is the same literature.

---

## THE PASS IS COMPLETE — 333 of 333 (2026-08-02)

Every glossary term carries at least `GLOSS_SRC_TARGET` (2) citations, every citation is referenced by at
least one in-text marker, and the markers are identical across English and all nine translations.
`node .claude/gloss-source-audit.js` reports `citations to find 0`. With the card pass finished at 109 of
109 in batch 26, **`country-sources.js` — the Atlas place panels — is the only surface in Folio that still
shows no sources.**

**It has STAYED complete through the N-batches, and that is the point of them** — 487 of 487 as of
2026-08-04. A term added after the pass joins at the bar rather than reopening a backlog, so the audit has
never gone back above zero.

### Batch N11 — the Leakey circle, two Oldowan sites, Clark's modes and Latin (2026-08-04)

Ten terms on request: `Paranthropus`, `Ledi-Geraru`, `Nyayanga`, `Louis_Leakey`, `Mary_Leakey`,
`Phillip_Tobias`, `John_Napier`, `Grahame_Clark`, `Mode_1`, `Latin`. `Younger_Dryas` was asked for with
them and already existed, at the bar, on four sources — **check the glossary before researching a
requested term**, which cost nothing here and would have cost a batch's work.

Its findings are in full in `.claude/sources-register.md`; three are worth carrying:

- **A British Academy Biographical Memoir is an ENCRYPTED PDF, not an unreachable one.** The root domain
  is 403 and the `/documents/<id>/<vol>p<page>.pdf` paths are 200, but the streams will not inflate,
  because the trailer carries `/Encrypt` — the standard handler with an empty user password. Decrypting it
  is about forty lines of RC4. This matters beyond one term: the Memoirs are the canonical scholarly life
  of every Fellow, which is exactly the class of source G8 found the literature does not otherwise pay for.
  Ligatures extract badly (fi/fl have no `/ToUnicode` map), so read numbers carefully.
- **N9's encyclopedia test passes for a foundation's own history page.** The Leakey Foundation's carries a
  numbered footnote to J. Desmond Clark's British Academy memoir of Louis Leakey — tested per article, as
  N9 requires, and it clears where Britannica and SNL did not.
- **`John_Napier` ships with no date line and no job title**, because nothing openable here carries them:
  his *Journal of Anatomy* obituary is on PMC and is not open access, and Europe PMC's affiliation field is
  empty for every pre-1988 record, which kills the one trick that would have supplied his post. The term
  describes his work instead. Do not promote him to "British anatomist" later without a source.

And a cheap way to pick the next batch: **every one of the ten already appeared in shipped card prose**
(`wh-016` alone names six of them), so all ten began auto-linking on arrival. Grep the deck for
capitalised surfaces that resolve to no term.

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
