# A second hundred artefacts

**Read before writing any artefact in this expansion, and before deciding a batch is finished.** It
holds the rarity budget and why it is what it is, the one measured finding that should be acted on
*before* any prose is written, the fifteen batches with their source spines, and the reachability
survey for the regions the second hundred opens up — measured on 2026-09-03, not assumed.

It is the sibling of `artefact-citation-plan.md`, which cited the FIRST hundred and whose
reachable-host survey and findings still stand: read that one too, and treat this file as the part
that is new. Not part of the site.

## What this is

The pool a level-up chest draws from is 100 artefacts. This plans a second hundred, taking it to 200.
Every rule the first hundred was written under holds without exception — five sentences, 180–220
words, three citations each ending in an openable URL with a marker pointing at it, metric first with
the imperial in brackets, a credit line on every picture, and **nothing invented**. `add-artefacts.js`
refuses anything that breaks them, so a batch either meets the bar or does not ship.

## Where the first hundred is thin

Measured over the shipped pool rather than guessed at. Roman material is 19 artefacts; Greek and
Aegean 8; Egypt 9; Mesopotamia and Persia 9; northern Europe and the Viking world 10. Against that:

| region or subject | in the first hundred |
|---|---|
| South Asia | **0** |
| Southeast Asia | **0** |
| Korea | **0** |
| Oceania and the Pacific | **0** |
| North America | **0** |
| Arctic | **0** |
| Byzantium | 1 (a coin) |
| The Islamic world | 1 (an astrolabe) |
| Japan | 2 |
| Sub-Saharan Africa | 2 |
| The Americas | 4 |
| China | 6 |

The same gap read against the site's own shelves is sharper still: **Folio has sixteen planned
collections, and the artefact pool serves none of India, Korea, Russia, the United States or the
Second World War at all.** There is also a gap in *period* — the pool effectively stops around 1800,
with five post-medieval commons and nothing from the industrial age or the twentieth century — and in
*kind*: one scientific instrument, no printing, no photography, no medicine, two textile objects, and
no musical instrument.

**So the second hundred is weighted the opposite way from the first.** Rome, Greece and Egypt get
nothing new. That is the organising principle, and it is the reason the batches below are grouped by
region rather than by material.

## The rarity budget: 60 common / 25 rare / 12 epic / 3 legendary

Not a guess, and not free choice. `rollArtefact` renormalises the drop odds (60 / 25 / 12 / 3) over
whatever rarities **still hold something the reader has not got**, so a rarity that runs out is
dropped from the roll altogether. If the pool's own shape does not match the odds, one tier empties
long before the others and the chests quietly stop feeling the way they were designed to feel — a
failure a reader would experience and never report, exactly as the exhausted-pool case is.

The first hundred is 56 / 27 / 13 / 4 against odds of 60 / 25 / 12 / 3, so it already does this.
Adding 60 / 25 / 12 / 3 takes the pool to **116 / 52 / 25 / 7**, which holds the same proportions.
**Keep the budget per batch as well as in total** — a batch that spends all three legendaries early
leaves the rest of the pass with nothing to reach for.

What each tier is *for* also follows from the gap analysis above. **A common is a KIND of object** — a
Roman oil lamp, a bone awl — and that is where a whole missing region is cheapest to fill, because
every culture has its everyday things and everyday things are what the pool lacks outside Rome. **A
named singular object is naturally epic or legendary.** Rare sits between: a distinctive class that
belongs to one tradition (a Goryeo celadon, an oracle bone, a Đông Sơn drum).

## Batch 0 — the split, and it comes first  ✅ SHIPPED (Sep 2026)

**`artefacts.js` is on the EAGER load path**, between `glossary-wikipedia.js` and `lang-decks.js`, so
every visitor downloads all of it before flipping a card. It is 0.26 MB raw / 0.08 MB gzipped today,
which doubles with this pass.

Measured over the shipped file:

| field | bytes |
|---|---|
| index (`id`, `name`, `rarity`, `date`, `origin`) | 14.1 KB |
| `desc` | 120.2 KB |
| `sources` | 62.1 KB |
| `image` | 55.2 KB |
| **heavy (`desc` + `sources` + `image`)** | **237.5 KB — 94% of the payload** |

**Nothing reads any of that 94% until a chest opens or the Reliquary page is visited.** The only
boot-adjacent reader is `progStats`, which counts legendaries and therefore needs `rarity` alone —
which is in the 14 KB index. This is `glossary-extra.js`'s case exactly, one file over: 54% of
`glossary.js` was citations and pictures that nothing read until a popup opened, and moving them cut
the eager path by 1.29 MB.

So **split `artefacts.js` the same way before writing a word of prose**, and doubling the pool costs
the eager path about 14 KB rather than 260. The existing split is the model to copy rather than
redesign, and its two hard-won rules carry over:

· **Stage onto a QUEUE, never assign.** `glossary-extra.js` pushes onto `window.GLOSSARY_EXTRA_IN`
  and a hook drains it, because app.js snapshots its revert baselines at boot — which is *before* a
  lazy file lands — so a plain assignment leaves Admin → Artefacts' "Revert" restoring an empty
  description. The hook must re-seed the baseline and then **re-apply the overlay on top**, the rule
  the `atlas` bundle follows for `window.TIMELINE`.
· **Every helper goes through one I/O module**, as `gloss-io.js` is for the glossary. Requiring
  `artefacts.js` alone would hand a reader empty descriptions — which reads as *the pool is
  uncited* — and hand a writer a file it will re-serialise 240 KB shorter without erroring.

Warm it at idle, as `glossExtra` is: a chest is opened at a moment of celebration and should not wait
on a fetch, but it has no business blocking first paint. `serializeArtefacts`, `autoSaveFiles`,
`adminExport`, `folioSave.files`, `add-artefacts.js`, `add-artefact-sources.js`,
`mark-artefact-sources.js` and `check-style.js` (rule 4 sweeps an artefact's prose *and* its picture
text) all touch the file and all need pointing at the split.

**DONE, on request.** `artefacts.js` went **262.8 KB → 19.2 KB** and `artefacts-extra.js` carries the
rest, so the second hundred costs the eager path about 14 KB rather than 260. Three things it turned up
that were not predicted here and are worth carrying into the batches:
· **`test-artefacts.js` reported `0 of 100 cited` while 81 assertions passed** — it read `artefacts.js`
  alone, so every citation-shape check ran over an empty list. That is `gloss-io.js`'s warning arriving
  one shelf over, and it is the reason eleven scripts were repointed at `.claude/artefact-io.js` rather
  than two. **A reader script that reaches past the merge does not fail, it lies.**
· **The shared serializer closed a live bug.** `add-artefact-sources.js` carried a private copy that
  emitted an image as `{ src, credit, alt }`, written before the viewer's `title` and `desc` existed —
  so one run of the citation tool would have stripped the caption off all 100 pictures.
· **The revert baseline was checked in a browser, not reasoned about**: edit through the overlay,
  reload, drop the delta, reload, and assert the shipped 1,446-character description comes back whole.

## The three legendaries

Only three slots, so they must be objects of genuinely world-famous stature that the pool has not
got, and each should open a region rather than deepen one:

| id | object | what it opens |
|---|---|---|
| `terracotta-warrior` | A soldier of the Terracotta Army, c. 210 BCE, Lintong | China — 6 artefacts against Rome's 19 |
| `antikythera-mechanism` | c. 150–100 BCE, the Antikythera wreck | Science and instruments — the pool has one astrolabe |
| `great-isaiah-scroll` | c. 125 BCE, Qumran | The Levant and the ancient book — both absent |

**Reserves, named so the choice is arguable rather than assumed:** the Venus of Willendorf (planned
as an epic below, and promotable — the pool has no Palaeolithic *art* at all, only tools, which on a
site whose largest collection began as prehistory is a defensible case for promotion), the Bayeux
Tapestry, and the Book of Kells.

## The fifteen batches

Fifteen, as the first hundred was. Each batch shares a source spine, because a family shares its
literature — which is what made batches 15 and 8 of the first pass cheap and batch 6 expensive.

### Named objects

| batch | n | artefacts | spine |
|---|---|---|---|
| A1 | 3 | `terracotta-warrior`, `antikythera-mechanism`, `great-isaiah-scroll` | `namuseum.gr` (open, and holds the mechanism), Antiquity and Nature via `doi.org`, archive.org, Qumran literature in open journals |
| A2 | 5 | `venus-of-willendorf`, `bayeux-tapestry`, `book-of-kells`, `lewis-chessmen`, `vindolanda-tablets` | `nhm-wien.ac.at` (server-rendered, confirmed), `digitalcollections.tcd.ie`, `bayeuxmuseum.com`, Vindolanda Tablets Online at Oxford, Persée |
| A3 | 7 | `pazyryk-carpet`, `dancing-girl-mohenjo-daro`, `golden-crown-of-silla`, `jade-burial-suit`, `aztec-sun-stone`, `igbo-ukwu-bronze`, `enigma-machine` | archive.org (Marshall, Rudenko), J-Stage, Cambridge via `doi.org`, INAH, cryptologic history |

### Region by region

| batch | n | artefacts | spine |
|---|---|---|---|
| B1 South Asia | 10 | `indus-seal`, `gandhara-buddha-head`, `chola-nataraja`, `mughal-miniature`; `indus-weight`, `harappan-toy-cart`, `nbpw-sherd`, `punch-marked-coin`, `etched-carnelian-bead`, `glass-bangle` | **Marshall's *Mohenjo-daro and the Indus Civilization* I–III and *Taxila* are all open on archive.org** (identifiers verified), ASI reports, Persée's *Arts Asiatiques*, Cambridge |
| B2 China | 7 | `oracle-bone`, `bronze-ding`; `han-tomb-brick`, `inkstone`, `bamboo-slip`, `longquan-celadon-bowl`, `crossbow-trigger` | archive.org (Laufer, Terrien de Lacouperie), J-Stage, *Arts Asiatiques*, Cambridge |
| B3 Japan and Korea | 7 | `samurai-katana`, `dotaku`, `ukiyo-e-print`, `goryeo-celadon`; `magatama`, `jomon-dogu`, `buncheong-bowl` | **J-Stage** (Japan's national journal platform — answers with real content), museum bulletins on archive.org, Cambridge |
| B4 Southeast Asia and the Pacific | 6 | `dong-son-drum`, `lapita-pottery`; `ban-chiang-pot`, `sumatralith`, `shell-adze`, `palm-leaf-folio` | *Journal of Indo-Pacific Archaeology*, PLOS, Antiquity via `doi.org`. **The highest-risk batch — see below** |
| C1 Islam and Byzantium | 8 | `lustreware-bowl`, `mamluk-mosque-lamp`, `byzantine-ivory-panel`, `byzantine-silk`; `islamic-star-tile`, `glass-coin-weight`, `fustat-paper`, `byzantine-lead-seal` | the V&A API, Cleveland's open API, Dumbarton Oaks, DOAJ, *'Atiqot* — all measured open (`collections.louvre.fr` 429s here); the five Dumbarton Oaks seal catalogue volumes are whole on archive.org |
| C2 Africa and the Arctic | 5 | `great-zimbabwe-bird`, `ife-head`, `thule-harpoon-head`; `ostrich-eggshell-bead`, `manilla` | archive.org (Randall-MacIver, Caton-Thompson, Thurstan Shaw), PLOS and *Scientific Reports* for isotope and provenance work, *Arctic* (open, Calgary) |
| C3 The Americas | 5 | `moche-portrait-vessel`, `mississippian-shell-gorget`, `clovis-point`; `wampum-bead`, `obsidian-blade` | *Latin American Antiquity* via Cambridge, PLOS, Europe PMC, archive.org (Squier and Davis, Moorehead) |

### Europe's everyday, and the periods the pool stops short of

| batch | n | artefacts | spine |
|---|---|---|---|
| D1 Medieval everyday | 8 | `novgorod-birch-bark-letter`; `seal-matrix`, `bone-ice-skate`, `green-glazed-jug`, `wax-tablet`, `turnshoe`, `antler-comb`, `bodkin-arrowhead` | *Internet Archaeology* (open), Persée, `tidsskrift.dk`, archive.org |
| D2 Prehistory's everyday, worldwide | 9 | `palaeolithic-bone-flute`; `spear-thrower` (planned as `antler-spearthrower`), `saddle-quern`, `sickle-blade`, `bone-fishhook`, `ochre-crayon`, `eyed-bone-needle`, `oak-coffin-textile`, `amber-bead` | PLOS, *Scientific Reports*, Europe PMC, Antiquity, Persée, archive.org (Evans) |
| E1 Arms, antiquity to the twentieth century | 7 | `sling-bullet`, `mail-fragment`, `flintlock-musket`, `iron-cannonball`, `socket-bayonet`, `trench-art-shell-case`, `identity-disc` | archive.org (Ffoulkes), *Post-Medieval Archaeology*, PSAS. **`iwm.org.uk` is 403 here** |
| E2 Instruments of knowledge | 8 | `gutenberg-bible-leaf`; `portable-sundial`, `mariners-astrolabe`, `albarello`, `type-sort`, `slide-rule`, `daguerreotype`, `telegraph-key` | Getty, Rijksmuseum, archive.org, *International Journal of Nautical Archaeology* |
| E3 The industrial everyday | 5 | `phonograph-cylinder`, `transferware`, `bartmann-jug`, `thimble`, `steel-pen-nib` | *Post-Medieval Archaeology*, *Historical Archaeology*, archive.org |

3 + 5 + 7 + 10 + 7 + 7 + 6 + 8 + 5 + 5 + 8 + 9 + 7 + 8 + 5 = **100**, of which 60 common, 25 rare,
12 epic and 3 legendary.

## What is reachable, measured on 2026-09-03

New measurements for the regions this pass opens. `artefact-citation-plan.md`'s survey still stands
for everything the first hundred needed and is not repeated.

**The finding that changes how three batches must be sourced: the East Asian and Israeli national
museum sites answer 200 and serve their object pages through JavaScript**, so they have no citable
per-object URL from here — the same fault `samlinger.natmus.dk`, `historiska.se` and `ashmolean.org`
already showed. Measured by fetching a real object page and grepping the HTML for a word the object's
own record must contain:

| host | status | usable? |
|---|---|---|
| `emuseum.nich.go.jp` (Japan, e-Museum) | 200, 23 KB | **No** — 0 hits for the object's own terms |
| `museum.go.kr` (National Museum of Korea) | 200, 73 KB | **No** — 0 hits |
| `deadseascrolls.org.il` | 200, 29 KB | **No** — 0 hits for "Isaiah" on the Great Isaiah Scroll's own page |
| `nhm-wien.ac.at` | 200 | **Yes** — server-rendered |
| `archives.gov` | 200 | **Yes** — server-rendered, 27 hits |
| `digitalcollections.tcd.ie` | 200 | Yes |
| `bayeuxmuseum.com` | 200 | Yes |
| `tnm.jp` | 200 | Probe the specific record before relying on it |
| `awm.gov.au`, `nps.gov` | 200 | Yes |
| `jstage.jst.go.jp` | 200, 86 KB | **Yes — the route that carries Japan and much of East Asia** |
| `persee.fr/collection/arasi` (*Arts Asiatiques*) | 200, 76 KB | Yes |
| `s-space.snu.ac.kr`, `openarchive.icomos.org`, `journals.openedition.org` | 200 | Yes |
| `iwm.org.uk`, `loc.gov`, `teara.govt.nz`, `collections.museumsvictoria.com.au`, `antiquity.ac.uk` | 403 | No |
| `hermitagemuseum.org`, `jps.auckland.ac.nz`, `kci.go.kr` | no answer | No |
| `asi.nic.in` | answers, very slow | Marginal — prefer archive.org's ASI reports |

Antiquity itself is 403 at `antiquity.ac.uk` and reachable through Cambridge Core at `doi.org/10.15184/…`.
**A 403 is a different fact from a paywall and must not be recorded as one.**

**Two routes confirmed again.** archive.org holds the ASI's own excavation reports — Marshall's
*Mohenjo-daro and the Indus Civilization*, all three volumes, and *Taxila* — so South Asia is served
by the same "the standard early monograph is open and is often the origin of the type name" rule that
carried the coins. And J-Stage is Japan's equivalent of what Persée is for France: an enormous open
national corpus, and the answer to three museum sites that will not serve a record.

## The risks, named rather than discovered later

· **B4 (Southeast Asia and the Pacific) is the batch most likely to come back short.** The Pacific's
  literature is largely in hosts that are shut here (`teara.govt.nz` 403, the *Journal of the
  Polynesian Society* refuses the connection, Museums Victoria 403) and much of the material is in the
  British Museum and the Smithsonian, both unreachable. **The first pass's rule applies without
  softening: where a third work cannot be found, the artefact waits for a later batch rather than
  being padded to the bar.** Three drafts of the first pass's named-object batch reached three
  citations by adding a work that had nothing to do with the object, and all three were thrown away.
· **C2 (Africa) is second.** *African Archaeological Review* is Springer and *Azania* is Taylor &
  Francis, both shut **at the publisher — but `Azania` is open at Europe PMC** (measured in C3/C2;
  see the batch log), so ask there before writing a title off. Beyond that the way in is archive.org's
  early monographs plus modern isotope and provenance work in PLOS and *Scientific Reports* — the
  "who has analysed it" move that rescued the Sipán ear ornaments.
· **B3's museums are JS-driven** (above), so Japan and Korea rest on J-Stage and archive.org rather
  than on the obvious institutional page.
· **`wampum-bead` and `manilla` both touch living communities and painful history** — wampum is held
  and used by Haudenosaunee nations today, and the manilla was a currency of the Atlantic slave
  trade. Both belong in the pool and both are written the way the site's own rules already require:
  no state's or collector's account repeated as established fact, contested figures given as ranges
  with whose they are, and the present tense where a practice is still living. If either cannot be
  written that way from openable sources, it waits.
· **A moai was considered for the Pacific and set aside** — not because a monument is inadmissible
  (the Ishtar Gate lion relief is already in the pool) but because the sourcing here is thin enough
  that it would likely be padded. It is a reserve.

## Two decisions, and why

Both answered, Sep 2026, on request — recorded because the reasoning behind each still binds.

1. **A 100-artefact badge was added** — `art100`, "Antiquary Royal". The ladder stopped at 50 while the
   pool was 100, so its top rung was half the Reliquary; at 200 it would have been a quarter.
2. **The split was done first**, so the second hundred never costs the eager path anything.

## The batch log

| batch | shipped | deferred |
|---|---|---|
| A1 | `terracotta-warrior`, `antikythera-mechanism`, `great-isaiah-scroll` | — |
| A2 | `venus-of-willendorf` | `bayeux-tapestry`, `book-of-kells`, `lewis-chessmen`, `vindolanda-tablets` |
| B1 | `indus-seal`, `indus-weight`, `harappan-toy-cart` | `gandhara-buddha-head`, `chola-nataraja`, `mughal-miniature`, `nbpw-sherd`, `punch-marked-coin`, `etched-carnelian-bead`, `glass-bangle` |
| D2 | `oak-coffin-textile`, `amber-bead`, `ochre-crayon` | `palaeolithic-bone-flute`, `antler-spearthrower`, `saddle-quern`, `sickle-blade`, `bone-fishhook`, `eyed-bone-needle` |
| D2b | `spear-thrower`, `saddle-quern`, `sickle-blade`, `eyed-bone-needle` | `palaeolithic-bone-flute`, `bone-fishhook` |
| C3/C2 | `clovis-point`, `obsidian-blade`, `ostrich-eggshell-bead` | — |
| C1 | `byzantine-lead-seal`, `lustreware-bowl`, `glass-coin-weight` | — |
| C1b | `islamic-star-tile`, `byzantine-silk` | `fustat-paper`, `mamluk-mosque-lamp` |
| D1 | `antler-comb`, `bone-ice-skate` | `novgorod-birch-bark-letter` (held, see below) |

**A1's finding is that a legendary artefact's third work is often a CORRECTION, and it is worth looking
for one.** The Terracotta Army rests partly on Martinón-Torres et al. 2019, which shows the chromium film
on the buried weapons is not a Qin anti-rust technology two millennia ahead of its time but contamination
from the lacquer on the figures — a story most popular accounts still repeat. A plate that states the
current standing of the thing a reader half-remembers is doing more work than one that recites the
half-memory. The Great Isaiah Scroll's 2025 radiocarbon-plus-style programme is the same shape.

**D1's finding is that `check-citations.js` earns its keep on a name nothing else could have caught.**
The comb's first citation was written **Steven P. Ashby**, off the article's own byline, and Crossref
answered **Stephen**. That is not a typo to wave through: it is one letter, both spellings are ordinary
English names, and no reader would ever query it. The **ORCID on the byline** settles it —
0000-0003-1420-2108 registers *Steven Paul Ashby*, and Crossref itself spells him Steven on the Salme
paper under that same ORCID — so the row is declared in `CROSSREF_WRONG` with that reasoning, the
twelfth such row and the first found by an artefact batch. **When Crossref and a byline disagree on a
given name, the ORCID is the tie-breaker**, and it is usually one click away on the article page.

**Its content finding is that a humble object can carry a live scholarly argument, and that is worth
more than a superlative.** A bone skate is a horse or ox long bone with one face worn flat, and whether
those objects are skates *at all* is genuinely contested: they have been read as hide scrapers, as
burnishers, and as net weights, and an influential use-wear study rejected the skating reading outright
for unperforated pieces. Against that, micro- and macroscopic work on the Gniezno finds concluded that
in a waterlogged town skating really was ordinary life, transport and recreation both. **Three sources
that disagree make a better plate than three that agree**, and a common — a kind of object rather than
a named one — is where that is easiest to find, because the kind is what gets argued about.

**`novgorod-birch-bark-letter` is HELD rather than deferred, and the distinction is worth keeping.**
Three works were found and read — Vovin on birch bark giving way to parchment as paper spread, Kalugina
on what the letters record about cloth, Petrukhin on the disputed reading of letter no. 724 — and every
one is about what the letters SAY. Not one describes what the object physically is, so the plate's
first sentence would have rested on nothing. That is a different failure from A2's and B1's (no
reachable field) and from C1b's two (no reachable work at all): here the works are open and read, and
what is missing is a source for the obvious. **Look for the source of the first sentence before
collecting sources for the rest.**

**C1b came back SHORT, and it is the D2 kind of short rather than the A2 kind.** Neither deferral is
a region problem. **`fustat-paper`** has no reachable source for the period that matters: the standard
article on the adoption of paper serves an HTML landing page rather than its PDF, the one open study
of Islamic paper's material properties is about **18th–20th-century** papers, and the BioResources
papyrus-to-paper article extracts to nothing. **`mamluk-mosque-lamp`** has superb V&A records and no
scholarship — DOAJ has one Mamluk-glass hit and it 404s, and archive.org's only matches on Islamic
glass are auction catalogues. Both are one open article away, so they belong with D2's six rather than
with A2's eleven; and neither was padded, which is the rule this file exists to hold.

**Its correction is to a recorded finding about a HOST, and it matters beyond this batch.** This file
and `CLAUDE.md` both record `nature.com` as unreachable — 303ing to an identity-provider cookie
endpoint, with Europe PMC as the way in. That is true of **WebFetch**, which will not follow a
cross-host redirect, and false of **`curl -L` with a browser user-agent**, which completes the cookie
handshake and lands on the full article: the Byzantine silk's provenance study came back as 86,000
characters of readable text, and Europe PMC has no record of it at all. **Springer Open journals —
*Heritage Science* above all — are therefore open to this pass**, which is a large body of exactly the
archaeometry these batches need. Retest a host with curl before trusting a WebFetch refusal.
Against that, **OpenEdition's Anubis wall is back** (`journals.openedition.org` served the bot
challenge again), reversing what N3 recorded.

**And the look-at-the-picture rule caught a subtler thing than usual: a Commons file whose TITLE
contradicts the museum text inside its own record.** `File:Probably Byzantium - Samite fragments with
double-headed eagles …` is captioned by the Cleveland Museum of Art's own description as belonging to
"a group of **Spanish** silks that emulated the great silks being produced at that time in Byzantium".
The title asserts what the description denies, in one record, and taking the title would have shipped
a Spanish imitation as the Byzantine original — on the one card where that distinction is the point.
**Read the description, not the file name.** A second candidate was rejected for a plainer reason: it
was a photograph of a printed book plate, an engraving of a textile rather than the textile.

**One mechanical note worth carrying.** The star tile's Commons page URL contains `(Tiled Kiosk)`, and
`SRC_URL_RX` stops at `)`, so both the picture and its credit link would have shipped truncated.
Percent-encoding the parentheses (`%28`/`%29`) survives the class and is the fix — better than
rejecting a good picture, which is what the rule in `CLAUDE.md` suggests doing.

**C1 found the pass's best *reason*, and it is a fact about a material rather than about an object.**
Islamic glass coin weights are glass and not metal because glass cannot be altered invisibly: any
reduction, enlargement or knock to a finished disc shows at once, so a standard that has been shaved
announces itself. That is the whole argument for the object's existence in one sentence, and it is the
kind of thing a plate is for — **when researching a humble object, look for the property that made it
that material**, which is usually stated once, in a paragraph nothing indexes.

**Two access findings.** *'Atiqot*, the Israel Antiquities Authority's journal, is fully open at
`publications.iaa.org.il` — Hebrew articles with English summaries, and the summary is often enough for
one dated claim; and the **DOAJ API** (`doaj.org/api/search/articles/…`) is the right index for this
half of the pass where Europe PMC is the right one for the science batches. DOAJ found all three of the
glass weight's works in one query, including a PLOS ONE study of 275 Byzantine glass weights that turns
out to be the Islamic object's own ancestor. Against that, `doi.org/10.1021/…` is **403** (ACS is shut
here), so the ACS Nano citation is written to its Europe PMC copy — the route this file already records
for `academic.oup.com`, now confirmed for a second publisher.

**Its cautionary finding is a Commons file whose NAME is right and whose CONTENTS are another
civilisation.** `File:Coin Weight MET 5328.jpg` is a photograph of three Attic lekythoi — the number is
an old Metropolitan negative reference, not an accession — and it is 4,000 px, CC0 and the top hit for
a glass-weight search, so every automatic test passes it. It would have shipped Greek pottery on a card
about Islamic metrology. **This is the third region in which the look-at-the-picture rule has caught
something no filter could**, and the shape is always the same: the metadata is not lying, it is simply
about something else.

**C3/C2's finding corrects a note this file already carries: *Azania* IS reachable, at Europe PMC.**
B1 recorded the etched carnelian bead as deferred partly because "their literature is in … *Azania*,
none reachable" — measured against Taylor & Francis, which is shut here. But Moffett & Haour 2024 on
West African bead production is open at `europepmc.org/article/PMC/PMC11649215`, and it carries the
ostrich eggshell bead's third work. **A journal is not shut because its publisher is**: Europe PMC
indexes far outside biomedicine, so ask it before writing a title off. That does not un-defer the
carnelian bead, whose problem is Indus-specific, but it removes one of the two reasons given for it.

**Its other finding is that a common artefact's third work is often the one that says the KIND matters.**
`obsidian-blade` and `ostrich-eggshell-bead` are both kinds of object rather than named things, and for
both the strongest citation is a provenancing study — Ucareo obsidian reaching the Templo Mayor across
rival polities, Melian obsidian in Cycladic graves, a shared bead diameter range spanning 3,000 km of
southern and eastern Africa. **A kind of object earns a plate when its distribution is the fact**, which
is also why these are the cheapest artefacts in the pass to source: the papers exist because somebody
wanted to know where the material came from. `clovis-point` is the counter-example and the more
interesting one — its third work is A1's correction shape (Eren et al. 2026 finding that "Clovis atlatl
use is not supported", against the spear-thrower every museum caption assumes), so the rule that a
legendary's third work is often a correction turns out to hold for a **rare** as well, wherever a reader
arrives already holding a half-memory.

**D2b PICKED UP FOUR OF D2's SIX DEFERRALS AND CONFIRMS THAT A DEFERRAL FOR WANT OF A THIRD WORK IS
CHEAP, WHILE ONE FOR WANT OF A REACHABLE FIELD IS NOT.** A2's and B1's eleven deferrals are still
deferred; D2's six each had an open paper already in hand, and four of them were finished in a single
pass. **When a batch comes back short, record WHICH kind of short it is** — the two look identical in a
table and behave completely differently when they are picked up again.

**`antler-spearthrower` SHIPPED AS `spear-thrower`, and the rename is the plans' own rule at work.** The
open literature is about the WEAPON SYSTEM — impact fractures on flint points, launch velocities — and
not about the carved antler hooks the planned name asserts; those hooks are what survives, but nothing
reachable here says so. A plan line is a subject to research rather than a fact to assert, so the line
was renamed in the same commit as the artefact.

**Three of the four carry a correction, and one of them corrects the artefact's own reputation.** The
eyed bone needle is traditionally *the* evidence for the invention of tailoring, and Gilligan et al.
2024 qualifies that: bone awls across Africa and Eurasia were already making fitted garments, so what the
needle adds is finer and faster sewing rather than the idea of a fitted garment. What the needles were
made OF was not established until 2024 either — canid, felid and hare bone at La Prele, chosen for size.
The spear-thrower's own correction is social rather than technical: 2,160 launches by 108 people show it
equalises female and male dart velocity where a hand-thrown javelin does not, which its authors read as
a reason to interpret male and female burials with such weapons alike.

**`sickle-blade` ships without a picture**, the third to do so, and for a reason worth naming because it
will recur: **a class of object defined by a microscopic trait is hard to photograph.** What identifies a
used sickle blade is the gloss along its edge, which does not read at web size, and Commons has no image
of a hafted Neolithic sickle clearing the bar. The other three were looked at before use.

**D2 IS THE FIRST BATCH WHERE SOURCING WAS NOT THE CONSTRAINT.** Prehistory's everyday things are
studied by natural scientists, so they are published in PLOS ONE, *Scientific Reports* and *Science
Advances* and are all open — every one of D2's nine topics returned open literature on the first sweep,
against four of five in A2 and three of ten in B1. **The pattern across four batches is now clear and is
worth using to order the remaining ones: what limits this pass is not the subject or the region but
whether its literature lives in journals or in books.** Archaeology and archaeometry are reachable;
art history and medieval studies are not.

**All three of D2's shipped artefacts carry a correction, and that is a property of the field rather
than of the selection.** The oak-coffin textile's strontium evidence for a long-distance Bronze Age
marriage is undercut by agricultural lime raising the modern Danish baseline, so the Egtved and
Skrydstrup women most plausibly came from near where they were buried. The amber bead's own analysts
moved the arrival of Baltic amber in Iberia back by more than a millennium between their 2018 review and
their 2023 find. And the ochre crayon's excavators say the word *crayon* is itself misleading, since
seven Blombos pieces turn out to be retouchers for pressure-flaking stone rather than anything used to
make a mark. **Where a subject is being actively worked on, the third source is usually the one that
revises the first two** — which is A1's finding arriving again from a different direction.

**AND THE AUTHOR CHECK PAID, CONFIRMING RATHER THAN REFUTING.** The amber citations needed a given name
that neither Crossref nor Europe PMC carries for that paper — both give `A. Martín Cólliga` — which is
exactly where the glossary pass's fabricated author (N4) hid. **The route that resolved it: search
Crossref for the author's OTHER works.** The same registry spells "Araceli Martín Cólliga" in full on
four of them, and on a second record of the amber paper itself. Do that before either writing an
expansion or settling for an initial; an initial is honest, but a verified full name is better and is
usually one query away.

**`ochre-crayon` ships without a picture**, the second to do so. Commons has no photograph of a worked
Middle Stone Age ochre piece that clears the bar, and the glossary's own `Ochre` illustration is a
modern pigment powder, which on an artefact plate would show a reader the wrong object entirely.

**B1 CONFIRMS THE ASI ROUTE AND ADDS THE FILENAME TRAP THAT HIDES IT.** Marshall's *Mohenjo-daro and
the Indus Civilization* volumes 1 and 2 and Vats's *Excavations at Harappa* are all on archive.org with
full OCR — 1.67 MB, 1.17 MB and 1.54 MB of readable text — and between them they carry the seals'
classes and animals, the weights' shapes and ratios and Hemmy's 13.71 g modal value, and the toy carts.
**But the standard one-liner finds none of it.** On these DLI-sourced scans the OCR file is named after
the item's TITLE rather than its identifier (`15269-Mohenjo-daro And The Indus Civilization
Vol-i_djvu.txt`), so `archive.org/stream/<id>/<id>_djvu.txt` returns **0 bytes** and reads exactly like
the "a 200 is not a readable book" case `artefact-citation-plan.md` warns about — a book that is right
there. **Ask `archive.org/metadata/<id>` for the real filename before concluding an item has no text.**

Its other finding is about the ASI reports' limits rather than their reach. They are excellent on
typology, form and measurement and silent on anything modern, so each artefact pairs them with an open
paper reached through **Europe PMC** for the dating and the current reading — Parikh and Petrie 2019 for
the Indus script being unread and the seals working as access control, Suryanarayan et al. 2021 for the
Mature Harappan span of c. 2600–1900 BCE. Both are published in journals shut here (*World Archaeology*
at Taylor & Francis, *JAS* at Elsevier) and both are open at Europe PMC, which is now the route that has
paid in three batches running.

**One clause was written and cut, and it is the fault to watch for on a source this old.** The toy cart's
draft said the carts are "among the reasons the Indus plain is argued over in any account of where the
wheel was first put to work" — which Marshall does not say and which is a summary reaching one step past
its record, the exact shape the glossary pass names. What he does say is that they are roughly
contemporary with the chariot on a stone slab at Ur and with a model wagon from Anau, so that is what the
sentence says now. **A 1931 excavation report invites this**, because its prose is confident and its
conclusions are ninety years old; quote what it records, not what it seems to imply.

**`harappan-toy-cart` ships without a picture, stated rather than quietly skipped.** Commons has no
photograph of an Indus toy cart that clears the 900px bar — there is no category for them, the Met's open
collection returns one Indus object with an image and it is a copper head, and four plausible filenames
404. The other two carry pictures looked at before use.

**The seven deferrals are one sourcing problem in two halves.** `gandhara-buddha-head`, `chola-nataraja`
and `mughal-miniature` are art-historical rather than archaeological, and their literature is in book
chapters and in *Artibus Asiae* and *Ars Orientalis*, none reachable; `etched-carnelian-bead`,
`nbpw-sherd`, `punch-marked-coin` and `glass-bangle` each have one good source and no third. Two routes
found while looking and worth trying first when they are picked up: **Beck's own bead report is a chapter
of Vats 1940** and carries the etching chemistry, and **Allan's British Museum *Catalogue of the Coins of
Ancient India* is on archive.org**, which is the coins rule from the first pass holding for India too.
`journals.uchicago.edu`, `royalsocietypublishing.org` and — newly — **`journals.openedition.org` behind
the Anubis bot wall again** (the first pass had recorded it as cleared) are all shut.

**A2 IS THE FIRST BATCH TO COME BACK SHORT, and the reason is a class of host rather than a class of
object.** The plan named B4 and C2 as the likely thin spots; A2 was expected to be easy, and four of its
five could not reach three readable works. The Bayeux Tapestry, the Book of Kells and the Lewis chessmen
are all extremely well studied, and their scholarship sits almost entirely in book chapters from Boydell,
Brepols and Routledge, none of which answer here. Newly measured on 2026-09-03 and added to the
unreachable list:

| host | what it holds | status |
|---|---|---|
| `journals.uchicago.edu` | *Current Anthropology* — Soffer et al. on the figurines' woven headgear | **403** |
| `royalsocietypublishing.org` | *Proc. B* — Star et al. on walrus-ivory provenance, the Lewis chessmen's obvious route | **403** |
| `vindolanda.csad.ox.ac.uk` | Vindolanda Tablets Online, Oxford — the tablets' own edition | **connection reset** |
| `romaninscriptionsofbritain.org` | RIB's Vindolanda tablets | **500** |
| `puvodni.mzm.cz` | *Anthropologie* (Brno) — Antl-Weiser on the Willendorf figurines | **502 through the proxy** |
| `digitalcollections.tcd.ie` | the Book of Kells | answers, but JavaScript-driven (4.6 KB, no content) |

**The rule held rather than being bent**: nothing was padded to the bar. The Bayeux Tapestry could have
been given three pages of its own museum's website, which would have passed every check and taught a
reader nothing three clicks would not — that is precisely the filler the first pass threw away three
drafts of. All four wait for a batch that can source them.

**The routes to try when they are picked up again**, in order: the **Europe PMC copy** (which is what
rescued the Venus's third work when `academic.oup.com` returned 403 on the DOI — cite
`europepmc.org/article/PMC/PMC…`, the route `artefact-citation-plan.md` already records); **archive.org's
early monographs**, which for the Book of Kells means Westwood and the Palaeographical Society facsimiles
and for the Lewis hoard means Madden's 1832 *Archaeologia* paper; and **Cambridge Core via `doi.org`**,
which is open here and carries *Antiquity*, *Britannia* and the *Proceedings of the Society of Antiquaries
of Scotland* — the last of which is the natural home for the Lewis chessmen.

## The per-artefact workflow

Unchanged from the first pass, and `artefact-citation-plan.md` states it in full. In short: research
the object, read what each of the five sentences actually claims, find three real works and **verify
every URL resolves before writing it**, place the markers with `mark-artefact-sources.js` rather than
by hand, and run `node .claude/add-artefacts.js <batch.json>`, which refuses anything under the bar.
Then `node .claude/test-artefacts.js` and `node .claude/check-style.js`.

**A new artefact ships with a picture or with a stated reason why not** — `add-artefacts.js` calls
`suggest-image.js` and prints candidates with their licences; it suggests and never installs, and the
standing rule is to **look at the picture before using it**. The three faults that pass kept finding
were the right name and the wrong person, an unlabelled plaster cast standing in for the object, and
a modern reproduction sold as the ancient thing.

Not part of the site.
