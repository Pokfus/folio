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
| A2 | 5 | `venus-of-willendorf`, `bayeux-tapestry`, `book-of-kells`, `lewis-chessmen`, `vindolanda-tablets` | `nhm-wien.ac.at` (server-rendered, confirmed), `digitalcollections.tcd.ie`, `bayeuxmuseum.com`, Persée. **Vindolanda Tablets Online at Oxford refuses the connection — use `romaninscriptionsofbritain.org/tabvindol/`, which carries the whole corpus** |
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
| A2 | `venus-of-willendorf` | ~~`bayeux-tapestry`, `book-of-kells`, `lewis-chessmen`~~ (all three shipped in A2c), ~~`vindolanda-tablets`~~ (shipped in A2b) |
| B1 | `indus-seal`, `indus-weight`, `harappan-toy-cart` | ~~`gandhara-buddha-head`, `chola-nataraja`~~ (shipped in B1c), `mughal-miniature`, `nbpw-sherd`, ~~`punch-marked-coin`, `etched-carnelian-bead`~~ (shipped in B1b), `glass-bangle` |
| D2 | `oak-coffin-textile`, `amber-bead`, `ochre-crayon` | `palaeolithic-bone-flute`, `antler-spearthrower`, `saddle-quern`, `sickle-blade`, `bone-fishhook`, `eyed-bone-needle` |
| D2b | `spear-thrower`, `saddle-quern`, `sickle-blade`, `eyed-bone-needle` | ~~`palaeolithic-bone-flute`, `bone-fishhook`~~ (both shipped in D2c) |
| C3/C2 | `clovis-point`, `obsidian-blade`, `ostrich-eggshell-bead` | — |
| C1 | `byzantine-lead-seal`, `lustreware-bowl`, `glass-coin-weight` | — |
| C1b | `islamic-star-tile`, `byzantine-silk` | `fustat-paper`, `mamluk-mosque-lamp` |
| D1 | `antler-comb`, `bone-ice-skate` | `novgorod-birch-bark-letter` (held, see below) |
| D1b/C2 | `seal-matrix`, `manilla` | — |
| A2b/E1 | `vindolanda-tablets` (UN-DEFERRED), `sling-bullet` | — |
| D2c | `palaeolithic-bone-flute`, `bone-fishhook` (both UN-DEFERRED — **D2's list is now empty**) | — |
| B1b | `punch-marked-coin`, `etched-carnelian-bead` (both UN-DEFERRED) | — |
| B1c | `chola-nataraja`, `gandhara-buddha-head` (both UN-DEFERRED) | — |
| A2c | `book-of-kells`, `bayeux-tapestry`, `lewis-chessmen` (all three UN-DEFERRED — **A2's list is now empty**) | — |
| A3a | `aztec-sun-stone`, `enigma-machine`, `dancing-girl-mohenjo-daro` | — |
| B2a | `oracle-bone`, `bamboo-slip`, `crossbow-trigger` | ~~`longquan-celadon-bowl`~~ (shipped in B2b), `inkstone`, `igbo-ukwu-bronze`, `pazyryk-carpet` |
| B2b | `bronze-ding`, `longquan-celadon-bowl` (UN-DEFERRED), `wax-tablet` | `han-tomb-brick` |
| B3a | `samurai-katana`, `ukiyo-e-print`, `goryeo-celadon` | — |
| B3b | `daguerreotype`, `jomon-dogu`, `magatama` (**B3's list is now empty but for `dotaku`**) | `dotaku` (needs a third openable work) |
| B4a | `dong-son-drum`, `lapita-pottery`, `palm-leaf-folio` | `ban-chiang-pot` |
| C2a | `thule-harpoon-head`, `great-zimbabwe-bird` (**two, not three — see below**) | — |
| D3a | `dotaku` (UN-DEFERRED), `mississippian-shell-gorget` | — (a deferral sweep that cleared one of eight) |
| E2a | `type-sort`, `slide-rule`, `portable-sundial` | — |
| E3a | `transferware`, `socket-bayonet`, `flintlock-musket` | `steel-pen-nib` (one work only) |
| E1a | `mail-fragment`, `telegraph-key`, `iron-cannonball` | — |

**A1's finding is that a legendary artefact's third work is often a CORRECTION, and it is worth looking
for one.** The Terracotta Army rests partly on Martinón-Torres et al. 2019, which shows the chromium film
on the buried weapons is not a Qin anti-rust technology two millennia ahead of its time but contamination
from the lacquer on the figures — a story most popular accounts still repeat. A plate that states the
current standing of the thing a reader half-remembers is doing more work than one that recites the
half-memory. The Great Isaiah Scroll's 2025 radiocarbon-plus-style programme is the same shape.

**B1c TAKES SOUTH ASIA'S DEFERRAL LIST FROM SEVEN TO THREE, AND BOTH ITS ARTEFACTS TURN ON A
CORRECTION TO WHAT THE READER ALREADY BELIEVES.** A Chola Nataraja is popularly cast in *pañcaloha*,
the five-metal alloy; x-ray fluorescence on the Rijksmuseum bronze gives an alloy consistent with other
Chola-period work and **not** that recipe, which the study reads as a modern tradition. And a Gandhara
Buddha head is popularly Greek; the nineteenth-century premise that a Graeco-Roman influence was
*needed* before the Buddha could be shown in human form — bound up with the aniconism theory — was
undone by twentieth-century work, and the taste for reading the sculpture as more Greek than Indian is
now understood as a product of the European scholarship that formed it. **A1 found that a legendary's
third work is often a correction; four batches on, the pattern is that ANY artefact a reader arrives
holding a belief about has one, and it is the fact worth leading with.**

**The Nataraja also shows what a museum bulletin can carry that a journal will not.** The Rijksmuseum's
own study is art history and analytical chemistry in one paper, and its last finding is a provenance:
Indian soil still on the bronze and burial corrosion say it never went back into a temple before a
Parisian dealer sold it in 1935. **A museum publishing on its own object will say where the object came
from**, which is a question the plate should not dodge and which no technical paper would have raised.

**And the pass's third route to a broken subject is the OUT-OF-COPYRIGHT CLASSIC, used for iconography
rather than for facts.** Coomaraswamy's *The Dance of Śiva* (1918) is on archive.org and gives the
reading of the pose that every later account rests on — the five activities, the dwarf Muyalaka, the
golden hall at Chidambaram. B1b used the same route for Cunningham and for Beck; here it supplies not
data but a MEANING, which is the one thing the analytical literature does not.

**B1b BREAKS INTO SOUTH ASIA, WHICH HAD LOOKED LIKE THE PASS'S HARDEST REGION, AND BOTH ROUTES WERE
ALREADY WRITTEN DOWN HERE.** B1 deferred seven; two of them are now shipped on exactly the routes this
file recorded and nobody had walked: **Allan's British Museum *Catalogue of the Coins of Ancient India*
is on archive.org**, as is **Cunningham 1891**, which names the type outright — "as all these pieces
are stamped with several dies or punches … they have received the descriptive name of punch-marked
coins" — and gives the Sanskrit *purāṇa* and *kārshāpaṇa* with the mentions in Manu and Pāṇini; and
**H. C. Beck's bead report is a chapter of Vats's *Excavations at Harappa* (1940)**, also on
archive.org, which carries the etching chemistry in one sentence: the design is drawn in carbonate of
soda and the stone heated till red hot. **A route recorded and not taken is worth as much as a
deferral** — read the plan's own notes before searching again.

**Its access finding is a SIXTH variety of unusable 200.** `ancient-asia-journal.com` answers 200 on a
correctly-formed article URL and returns **zero bytes**. That is worse than a 404, because
`add-artefacts.js` checks that a citation ends in a URL and a 200 satisfies every automatic test; only
reading the body catches it. It is why `nbpw-sherd` stays deferred — its one open work is published in
that journal, whose DOIs 404 at Ubiquity and whose new host serves nothing.

**AND THE SAME MISTAKE OF MINE HAS NOW BEEN CAUGHT THREE BATCHES RUNNING, SO IT IS A WORKFLOW RULE
RATHER THAN AN INCIDENT.** `check-citations.js` found *Giulia* for Giovanna in A2b, and here found
**six fabricated given names in two citations** — Anand for Amit, Nishant for Neeraj, Ram for Rajiv,
Miao for Meiting, Jia for Jiancheng, Cun for Chunlei. Every one came from expanding Europe PMC's
`authorString`, which prints initials (`Upadhyay AK`, `Yan M`), and every expansion was plausible,
resolvable and wrong. **Take author names from CROSSREF, or from the article's own byline — never from
an index's author string**, and run the checker before committing rather than after.

**D2c EMPTIES THE D2 DEFERRAL LIST, and it confirms the cheap/expensive distinction D2b proposed.**
D2 deferred six for want of a third work; D2b shipped four and D2c the last two, so every one of them
came back — against A2's and B1's, where the problem is the field rather than the count. **The two
that took longest were the two that needed the newly-open hosts**: `nature.com` (readable by curl, as
C1b established) for the Hohle Fels flute, and both Europe PMC *and* DOAJ for the fishhook, which DOAJ
alone would have left at one source.

**The flute's finding is that a contested object is worth more than a certain one, and it should be
carded with BOTH sides cited.** The Divje Babe I bear femur is either a Neanderthal flute or a bone a
carnivore punctured, and `Arheološki vestnik` has published the argument from both directions and left
them open: Albrecht and colleagues hold that every Middle Palaeolithic 'flute' is a pseudo-artefact,
while Turk and colleagues' computed tomography counts four holes, finds a carnivore could have made at
most one, and reads the rest as cut with tools from the site. **A plate that names one side and hides
the other is worse than one that says the question is open** — and the same journal carrying both is
what makes it citable at all.

**Its access finding is that a PAYWALLED landmark is sometimes the right citation, and the label is
the honest part.** Conard, Malina and Münzel's *Nature* paper is the primary publication of the Swabian
Jura flutes and its abstract carries the claims the plate makes; the full text is behind the paywall,
so it is marked `[Paywalled]` and sits beside two open works. The plan's rule holds — a paywalled work
earns its place only as the landmark for a claim nothing open carries — and this is that case.

**And a line drawing is refused on the same ground as a book plate.** The best-titled Commons match for
`bone-fishhook` was an archaeological illustration of a needle and a hook with a scale bar: accurate,
useful, and not a photograph of the object, exactly like C1b's engraving of a Byzantine silk. What
shipped instead is nine hooks on a museum board whose own label states the line-groove and the unbaited
lure — **a picture that carries its own caption is worth looking for.**

**A2b UN-DEFERS THE VINDOLANDA TABLETS, and the reason is that a dead host had a live successor.**
A2 deferred them because `vindolanda.csad.ox.ac.uk` — Vindolanda Tablets Online — refuses the
connection here, and it still does. But **`romaninscriptionsofbritain.org` now carries the whole
Vindolanda corpus** at `/tabvindol/`, tablet by tablet at `/inscriptions/TabVindol<n>`, with the Latin,
the translation, the commentary and the dating; and that host was itself recorded as **500** in an
earlier batch of this pass. Two lessons, and they point the same way: **a corpus can move**, so look
for the edition rather than the site you remember; and **re-test a host that failed**, because two of
this batch's three standing "unreachable" records were wrong by the time they were used.

**Its cautionary finding is that `check-citations.js` caught TWO fabrications in one citation, both
mine.** I wrote *Giulia* Vasco off Europe PMC's "Vasco G" — the paper's own byline says **Giovanna** —
and I listed Alessandro Buccolieri as the fifth author when the article's XML files him under
`contrib-group content-type="editor"`. Neither would have been visible to a reader: the DOI resolves,
the paper is real, the other three names are right. And a third error came out of the same check —
every given name in the Orr et al. citation was my invention, because *Scientific Reports* published
that paper with **initials throughout** (`Orr, C. H.`), so the citation now reads as published. **Read
the byline in the article, not the author string in the index**: Europe PMC abbreviates, and expanding
its abbreviation is guessing with a plausible answer.

**And the sling bullet is the pass's best argument for a common.** Three of its five sentences rest on
what is written *on* the object: a bullet from south-western Bulgaria carries a thunderbolt and the
letters ΦΙ, the abbreviation used for Philip V on his own coinage, tying it to his siege of Petra in
181 BCE; bullets naming Demetrius, a commander under Philip II, run from Selymbria to the west coast
of the Black Sea and put him on campaigns no surviving author mentions. **A cheap mass-produced object
can be a primary historical source when the mould carries a name**, and that is a better fact than any
superlative about a famous one. Two of its four candidate sources were unreachable
(`impactum-journals.uc.pt` 500, `ejournals.eu` refuses the connection) and the batch still made the bar
from a third host — **check reachability before drafting, not after**.

**D1b's finding is which INDEX to ask, and it is not one index.** Three searches in this batch came
back empty from DOAJ and full from Europe PMC, or the reverse, on subjects a page apart: DOAJ found
every medieval European everyday object (combs, skates, seal matrices, sealing wax) and returned
literally nothing for `manilla`, for Moche pottery, for Mississippian shell or for Thule harpoons;
Europe PMC found the manilla's key paper as its first hit. The split is not by discipline but by
PUBLISHER — DOAJ indexes the small national and institutional archaeology journals (Starinar,
Archaeologia Polona, Slavia Antiqua, Dissertationes Archaeologicae, *'Atiqot*, Internet Archaeology),
Europe PMC indexes PLOS, PNAS, Nature portfolio and Springer Open. **Ask both before concluding a
subject has no literature**; a batch that asks one is half-searching.

**Its content finding is that the best fact about a common is often a MISIDENTIFICATION.** The bone
skate's plate turned on whether those objects are skates at all; the seal matrix's turns on an object
found on Rudnik mountain in 2015, published as the seal die of Prince Lazar, and shown by a fresh
reading of its own inscription to be a mould for a medallion in the foot of a goblet — a correction the
same two authors published against themselves five years later. **A named object's third work is often
a correction of a popular belief** (A1); a common's is often a correction of the identification itself,
because a class of object is what gets confused with another class.

**And the `(FindID …)` parenthesis is now the second Commons URL in three batches to need percent-
encoding.** The Portable Antiquities Scheme names every one of its files that way, and PAS is the
richest open source of photographs of English medieval everyday objects — which is most of batch D1 —
so `%28`/`%29` is not an occasional fix here but the standing form for that whole family.

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
| `romaninscriptionsofbritain.org` | RIB's Vindolanda tablets | **200 as of Sep 2026** — it was 500 when first measured; it carries the whole Vindolanda corpus, and is what replaces the dead Oxford site |
| `puvodni.mzm.cz` | *Anthropologie* (Brno) — Antl-Weiser on the Willendorf figurines | **502 through the proxy** |
| `digitalcollections.tcd.ie` | the Book of Kells | answers, but JavaScript-driven (4.6 KB, no content) |

**The rule held rather than being bent**: nothing was padded to the bar. The Bayeux Tapestry could have
been given three pages of its own museum's website, which would have passed every check and taught a
reader nothing three clicks would not — that is precisely the filler the first pass threw away three
drafts of. All four wait for a batch that can source them. *(All four have since shipped — the tablets in
A2b and the other three in A2c, whose finding is below.)*

**The routes to try when they are picked up again**, in order: the **Europe PMC copy** (which is what
rescued the Venus's third work when `academic.oup.com` returned 403 on the DOI — cite
`europepmc.org/article/PMC/PMC…`, the route `artefact-citation-plan.md` already records); **archive.org's
early monographs**, which for the Book of Kells means Westwood and the Palaeographical Society facsimiles
and for the Lewis hoard means Madden's 1832 *Archaeologia* paper; and **Cambridge Core via `doi.org`**,
which is open here and carries *Antiquity*, *Britannia* and the *Proceedings of the Society of Antiquaries
of Scotland* — the last of which is the natural home for the Lewis chessmen.

**A2c CLEARS A2's LIST AND SHOWS THAT ITS DIAGNOSIS WAS RIGHT ABOUT THE HOSTS AND WRONG ABOUT THE
CONCLUSION.** A2 was correct that the modern scholarship on these three objects sits in Boydell, Brepols
and Routledge chapters that do not answer here, and it drew from that the conclusion that the objects
could not be sourced. They can: all three were written from OPEN JOURNALS AND NINETEENTH-CENTURY
MONOGRAPHS, and **the three routes A2 itself listed as "to try when they are picked up again" are the
three that worked**, which is the most useful thing a deferral can leave behind. The corrections to
those routes are worth as much as the routes:

· **PSAS is open at `journals.socantscot.org`, not through Cambridge Core.** A2 predicted the
  *Proceedings of the Society of Antiquaries of Scotland* would be the natural home for the Lewis
  chessmen and predicted it would be reached through `doi.org` at Cambridge. The journal is right and
  the door is wrong: the Society publishes its own whole back catalogue, every article carrying a
  `10.9750/PSAS.…` DOI and a free PDF, and its own OJS search found F. W. L. Thomas's 1863 notice in
  three requests. **The prediction was right about the journal and wrong about the door**, which is the
  cheaper half to get wrong.
· **`Archaeologia` volume 24 is NOT on archive.org** — A2 named Madden's 1832 paper as the Lewis route
  and no volume of that series from the 1830s is there under any identifier tried. It did not matter,
  because Murray 1913 quotes and dates Madden's argument and Wilson 1851 answers it. **A work you cannot
  open may still be reachable through the two works that argue with it**, and on a plate that describes a
  dispute, the two answers are what the sentence needs anyway.
· **A nineteenth-century monograph is not a fallback for these three, it is the better source.** Fowke
  1913 counts the tapestry's figures (623 people, 202 horses, 41 ships — 1,512 objects), Sullivan 1920
  gives the Book of Kells' 339 leaves against Ussher's tally of 344 in 1621, and Murray 1913 inventories
  the Lewis hoard piece by piece. Those are exactly the physical facts a plate is made of, and they are
  precisely what the modern art-historical literature assumes rather than states. This is batch 25's rule
  from the first pass — *a 19th-century figure is his own best institutional record* — turned round onto
  objects.
· **The correction pattern held for all three, and in all three it is the SAME correction: the popular
  NAME.** The Bayeux Tapestry is not a tapestry, and Matilda did not make it; the Book of Kells' blue is
  woad rather than the lapis lazuli every account gave it until the 2004–7 analysis; the Lewis chessmen
  are not Viking. **Where a reader arrives holding a name, the correction is usually inside the name** —
  which is a sharper form of A1's finding and cost no extra searching at all, since each one falls out of
  the first source read.
· **Two of the four usable Lewis pictures were traps, and the look-at-it rule caught both.** One is a
  REPLICA in a chess museum in Baku whose own label reads "walrus ivory, replica" and "probably made by
  Vikings" — the myth this artefact's plate exists to correct, printed under a copy of the thing. The
  other is a group shot through display glass carrying half a dozen visitors' reflections and a scarlet
  board. Neither is detectable from a file name, a licence or a pixel count.

Measured 2026-09-03/04 and worth adding to the survey: `journals.socantscot.org` **200 with full PDFs**;
`exarc.net`, `ride.i-d-e.de`, `historia.scribere.at` and `journals.lub.lu.se` all **200 with real
content**; `bayeuxmuseum.com` 200 but too thin to cite; `britishmuseum.org` and `nms.ac.uk` **403**;
`archaeologydataservice.ac.uk` answers at the root and **403s on `/archives/view/…`**;
`journals.openedition.org` is still behind the Anubis wall, returning exactly **5,261 bytes** for all
three of DOAJ's Bayeux candidates, which is the same constant B1 recorded; `api.openalex.org` **429s
from this container with or without a polite user-agent**, so it is not an index to plan on here; and
`pmc.ncbi.nlm.nih.gov` answers 200 for *Phil. Trans. A* records that carry **no deposited full text**,
which reads as an article and is a landing page.

**A3a's finding is that the FOUNDING DESCRIPTION of a famous object is usually open, and it is usually
the one that made the mistake everybody now repeats.** All three of this batch turn on a document written
by the person who first published the thing, and in each the modern correction is a correction of that
document rather than of the object:

· **Antonio de León y Gama saw the Sun Stone lifted out of the Plaza Mayor on 17 December 1790** and
  published his *Descripción histórica y cronológica de las dos piedras* two years later, reading it as a
  calendar. Stuart's point is that the reading had a physical consequence: because it was taken for a
  calendrical instrument it was mounted UPRIGHT in the outer wall of the cathedral, and it has been shown
  vertically in every museum and reproduction since — of a disc that was carved as a horizontal surface.
  **The interpretation changed the object's posture, and the posture now teaches the interpretation.**
· **John Marshall named the Dancing Girl**, and Ernest Mackay guessed her a temple dancer on the strength
  of a resemblance to a second bronze. Nothing in the object says she is dancing; the name is a 1931
  reading that has been the object's identity for a century, and both excavators described her in the
  racial vocabulary of their decade. This is the A2c rule again — *where a reader arrives holding a name,
  the correction is usually inside the name* — arriving from a completely different literature two
  batches later, which is what makes it a rule rather than a coincidence.
· **Enigma's founding account is the popular one**, that Bletchley Park broke it. The Science Museum
  Group Journal's own conversation with Dermot Turing states what the British had before Pyry in July
  1939 — no wiring, no way into a plugboard Enigma — and that the Poles handed over two
  reverse-engineered machines five weeks before the war.

Three routes it establishes, all measured:

· **`journals.socantscot.org`'s Mexican equivalent is `nahuatl.historicas.unam.mx`** — *Estudios de
  Cultura Náhuatl*, UNAM's own OJS, open, DOIs from 2023 on, and its search answered "Piedra del Sol"
  with the two papers that carry the live disputes (the central face, and whether the stone is a
  *cuauhxicalli* or a *temalacatl*). `revistas.unam.mx` itself is **403**, so go to the institute's host
  rather than the university's portal.
· **`mesoweb.com` publishes peer-reviewed Mesoamerican monographs open, in full**, in English and
  Spanish — David Stuart's *King and Cosmos* is 22 MB of readable PDF. It is the single best open source
  the pass has found for central Mexico, and nothing in the plan's survey named it.
· **`archive.org` carries Marshall 1931 and Mackay 1938 AND 1935**, but under Digital Library of India
  identifiers (`in.ernet.dli.2015.69817`, `.70071`, `.70456`) rather than readable slugs, and **the
  readable-slug copies are lending-restricted**: `frozentombsofsib00rude` returns 401 where the
  user-uploaded duplicate is open. **Search the DLI identifiers before concluding a book is closed** —
  and note the corollary, that an open duplicate of an in-copyright book is not a licence to cite it;
  Rudenko 1970 was dropped from this batch for that reason and the Pazyryk carpet waits.

Two cautions. **`api.openalex.org` 429s from this container** whatever user-agent is sent, so it is not
an index to plan on here; DOAJ and Europe PMC both answer. And **Crossref has transposed given and
family names for both authors of the Borowska and Rzeszutko paper**, which `check-citations.js` reported
as a mismatch — the journal's own article page and its own How-to-Cite block settle it, and the pair are
declared in `CROSSREF_WRONG` with that reasoning. That is the fifth and sixth row of a table that exists
because a checker which cries wolf is a checker nobody runs.

**B2a's finding is that CHINA IS THE PASS'S BEST-SOURCED REGION, and the reason is a class of paper
nobody planned for: the MACHINE-LEARNING DATASET.** The plan's B2 spine named archive.org, J-Stage,
Persée and Cambridge, and none of them was needed. What carried all three of this batch is open science
publishing in two forms — *Heritage Science* and *Mechanical Sciences* for the archaeometry and the
mechanics, and *Scientific Data* and *PLOS ONE* for the corpora. **A dataset paper is written to be
cited and so states its own numbers plainly**: OBIMD gives 10,077 oracle-bone images across five phases
of the Shang and 93,652 annotated characters, DeepJiandu 7,416 images and 99,852 characters in 2,242
forms, and each opens by explaining, for a reader outside the field, what the object is and why it is
hard to read. That is exactly the material an artefact plate needs, and it is the one genre of paper
that is reliably open.

· **The corrections are all in those papers' own framing.** Oracle bones: fewer than half the known
  inscriptions are securely deciphered, and the bones were deliberately drilled and heat-cracked, so
  they are too fragile to handle and the field works from rubbings. Crossbow triggers: the marks on the
  Qin locks are MATCHING marks, and parts made in one workshop cell stayed together through assembly —
  so the popular story of interchangeable parts two millennia early is the wrong reading, exactly as
  A1's chromium finding was on the same site. **Two corrections now come out of the terracotta army,
  and both are of the same shape: a modern industrial idea read back into a bureaucratic one.**
· **Three hosts confirmed, one lost.** `heritagesciencejournal.springeropen.com` and `ms.copernicus.org`
  both serve complete articles here, which settles the Springer Open finding recorded in CLAUDE.md;
  `journals.uni-lj.si` (*Asian Studies*) and `ocula.it` answer. **`quod.lib.umich.edu` / `doi.org/10.3998`
  — Michigan's *Ars Orientalis* — is behind the ANUBIS WALL**, which is the fourth host to join that
  list and the reason `longquan-celadon-bowl` is deferred at two sources rather than three: the two
  Heritage Science papers on it (10.1186/s40494-021-00583-4 and 10.1186/s40494-024-01352-9) are both
  open and both are about shipwreck corrosion, and the third work has to come from somewhere else.
  `mdpi.com` remains 403, which costs this batch three otherwise-usable candidates.
· **The Commons API rate-limits before `upload.wikimedia.org` does**, and the way round is the same one
  CLAUDE.md records for the files: **the ordinary file DESCRIPTION page keeps answering**, and it
  carries the licence, the author, the source and the description in readable HTML. Use
  `commons.wikimedia.org/wiki/File:<name>` when `api.php` says "too many requests".
· **And the replica trap fired again, one batch after the Lewis chessmen.** The first bamboo-slip
  candidate is a set of pristine, crisply inked slips with new binding cord, credited to an audit
  museum in Nantong — a replica of the Shuihudi laws, not the Shuihudi laws. The picture that shipped
  is the Hubei Provincial Museum's own display of the real 201 slips, whose label is legible in the
  photograph and states the tomb, the year and the count. **Where a famous object has a famous replica,
  assume the first good picture is of the replica.**

**B2b's finding is that a DEFERRAL ONE BATCH OLD IS THE CHEAPEST WORK ON THE LIST, and the reason is
that the search that failed has already told you what shape the missing source is.** `longquan-celadon-bowl`
was deferred in B2a at two open Heritage Science papers, both about shipwreck corrosion, with the third
(Michigan's *Ars Orientalis*) behind the Anubis wall. One DOAJ query later — `"Longquan kiln" OR
"Longquan ware" OR "Longquan celadons"` rather than `"Longquan celadon"` — turned up an *npj Materials
Degradation* paper on the same Dalian Island wreck, which is Nature portfolio and open. **The deferral
cost about four minutes to clear and the batch that deferred it had spent twenty minutes failing.** It is
worth re-querying with the object's other names before writing a deferral down.

· **All three of Longquan's sources being about shipwrecks is not a weakness of the plate, it is the
  subject.** Longquan was an export ware; 603 pieces came out of one Yuan wreck off Pingtan alone, and
  what the literature is about is what the sea did to the glaze. A plate whose three works agree on a
  setting is describing the object honestly, not padding.
· **`wax-tablet` came out of the batch's one deliberate constraint: it must not become the Vindolanda
  tablets**, which are already in the pool. The best modern paper found for it — a 2026 multianalytical
  study of the Vindolanda wooden tablets in the *Journal of Analytical Methods in Chemistry* — was
  therefore set aside as well as being 403 at Wiley, and the plate is built instead on Thompson's 1912
  *Palaeography* for the Roman triptych as a sealed legal instrument, an EXARC reconstruction for how a
  tablet is actually cut and waxed, and a 2025 Lithuanian restoration case study for how few survive.
  **When a new artefact overlaps one already written, the constraint is a content rule and it changes
  which sources are usable, not just which sentences are.**
· **Two more hosts join the Anubis list** — `journals.ub.uni-heidelberg.de` (*Pylon*), which cost the
  wax tablet its best schoolbook paper, and `quod.lib.umich.edu`, recorded in B2a. Both return the same
  4.7–5.3 KB proof-of-work page that `journals.openedition.org` does. **`mdpi.com` remains 403 and is
  now the single most expensive closure in this pass**, having cost B2a and B2b about eight otherwise
  usable candidates between them.
· **Where a picture needs a museum's own object photograph, Cleveland and the Met are the two open
  collections that answer here**, both CC0 and both with the object shot against grey and lit properly —
  which for a bowl or a bronze is worth more than a gallery view. The Met's ding shows the vertical
  mould seams down each face, which is the plate's own casting point visible in the picture.

**B3a's finding is that J-STAGE IS AN ENGINEERING ARCHIVE FIRST, and that is what makes it useful
here.** The plan named it as Japan's national journal platform and expected it to carry archaeology; what
it actually carries in quantity is materials science, and for an artefact that is better. The katana's
three works are *Tetsu-to-Hagane* on tatara furnace operation, *ISIJ International* on the microstructure
of a cutting edge, and *Scientific Reports* on neutron tomography through a finished blade — all open,
all with free PDFs, and between them they describe how the steel was made, what the edge is made of and
what is inside the sword, which is the whole of what a plate about a sword needs. **Search J-Stage for
the MATERIAL rather than for the object's culture**; `Japanese sword tamahagane` returned twenty usable
articles where `Silla crown` returned an unrelated list.

· **Two of the three plates in this batch turn on a correction that only measurement could make, and both
  invert something a reader already believes.** The Muromachi blade has MORE fine pearlite in its edge
  than a modern one, so it is SOFTER there — and yet stronger in tension, the reverse of how ordinary
  carbon steel behaves. And the story that cheap aniline dyes arrived from the West in the 1860s and
  swept the older Japanese colours away does not survive Raman analysis: the change was gradual and
  selective, and most late Edo colorants stayed in use through Meiji. **Where a popular account contains
  the words "cheap", "garish" or "suddenly", there is usually an analytical paper disagreeing with it.**
· **The ukiyo-e plate needed the fact that a print is a RUN, not an object**, which is the sort of thing
  that changes what the plate can honestly claim: `Red Fuji` and its rarer `Pink Fuji` are the same
  design and different objects, and Korenberg et al. show the pink was pulled first. The picture chosen
  is that exact print, so the plate's argument is visible in its own illustration — the third time in
  this pass that has been worth arranging (the Met ding's mould seams and the Han trigger's inscription
  rubbing were the others).
· **`ekoreajournal.net` and `koreascience.kr` both refuse the connection here**, so Korea has no national
  platform reachable from this sandbox; what carried `goryeo-celadon` instead was Heritage Science twice
  and a Copernicus ISPRS Archives paper on the inter-Korean excavation at Manwoldae. **The Copernicus
  archives series is worth remembering for any object with a survey or GIS angle** — it is fully open and
  has answered every path tried in this pass.
· One naming caution: the Commons description page for the Met's katana spells the smith **Muntesugu**,
  which is a typo for Munetsugu. A file page is not a catalogue, and its prose is worth reading with the
  same suspicion as any other uncredited caption.

**B3b's finding is that A COMMONS LICENCE MUST BE READ OFF THE "LICENSING" SECTION, NEVER GREPPED OFF
THE PAGE.** A file description page mentions several licence names in its footer, its upload log and its
sister-project boxes, so grepping the HTML for `CC0` or `public domain` returns a hit on files that carry
neither: `Magatamas.JPG` grepped as CC0 and is **CC BY-SA 3.0 (Kakidai)**, and `Dogu_Miyagi_1000_BCE_400_BCE.jpg`
the same, by World Imaging. Both are perfectly usable — the pass's bar takes CC BY-SA — but the CREDIT
would have shipped without the attribution the licence requires, which is the one failure a reader cannot
see and the author cannot be told about. **Find the Licensing heading and read the box under it.** This is
the third fault in this pass that comes of trusting a page's chrome rather than its content (the katana's
misspelt smith and the two replicas were the others), and all three were caught by looking rather than by
matching.

· **Check PMC before writing a paper off.** `mdpi.com` and `pnas.org` are both 403 here, which two batches
  ago would have cost this plate two of its three works; both papers have open PMC copies
  (`PMC10181581`, `PMC6628667`) and are cited at those addresses. The mirror caution goes with it: a PMCID
  guessed from a neighbouring number is a different paper, and `PMC10180958` — one off the daguerreotype
  paper's real id — is about the ripening of raspberries.
· **Crossref has no record of the `nihonkokogaku1994` or `gsjapan` DOIs**, which resolve perfectly and are
  simply not deposited; those three citations are therefore UNCHECKED rather than passing, exactly as
  `check-citations.js`'s own rule says. An older Japanese society journal digitised onto J-Stage is the
  same case as a society digitising its back catalogue with no print date — the record is thin, and the
  eye is what is left.
· **The correction is inside the name again, for the fourth time in this pass.** Japanese jade was believed
  to have been carried from China until jadeite was actually identified in Japanese rock in 1939, and
  Itoigawa turns out to have supplied one of the oldest jadeitite-working traditions in the world. The
  daguerreotype's is of the same shape and runs the other way: the plate is not a picture ON silver but a
  scattering of plasmonic nanoparticles, so what looks like the most primitive photography is describable
  only in the physics of the last thirty years.
· **A batch of three commons is the cheapest kind left to write**, and the reason is worth stating for the
  32 still to come: a common is a KIND of object, so its literature is materials science and there is
  always some — the plate about daguerreotypes never has to identify a particular plate, and the one about
  magatama never has to date a particular bead.

**B4a's finding is that THE BATCH NAMED AS MOST LIKELY TO COME BACK SHORT CAME BACK FULL, and the
reason is that the Pacific and Southeast Asia have their own open journals rather than none.** The risk
was written from the hosts a search engine offers first, which are shut here — `teara.govt.nz`, the
*Journal of the Polynesian Society*, Museums Victoria, the British Museum and the Smithsonian — and every
one of those is beside the point. **Four venues answered and between them carried all three artefacts.**
The **Journal of Pacific Archaeology** (`pacificarchaeology.org`) is diamond open access and carried two
of Lapita's three works; **ANU Press** (`press.anu.edu.au`, the whole *Terra Australis* series) serves
complete born-digital PDFs of the standard Pacific conference volumes and carried the third; **Persée**
holds the *Bulletin de l'École française d'Extrême-Orient* back to 1901, which is the founding literature
of Đông Sơn and carried that plate outright; and the **Bulletin of the Indo-Pacific Prehistory
Association** and the **Journal of Indo-Pacific Archaeology** (both `journals.lib.washington.edu`) are
open and are where the Southeast Asian argument is actually conducted. **Look for the region's own
journal before concluding the region has no literature.**

· **PERSÉE SERVES ITS TEXT PAGE BY PAGE AND NOT AS A PDF.** `/docAsPDF/<id>.pdf` is **403** and the
  article page itself carries only the citation block, so the OCR is reached at
  `/doc/<id>?pageId=T1_<n>`, one page per request, everything after the string `RIS (ProCite, Endnote, …)`
  being that page's prose. Forty-six pages of Goloubew 1929 came out that way. It rate-limits at about
  fifteen requests, so pause between them and expect an occasional connection reset.
· **A SCANNED OPEN JOURNAL IS NOT A READABLE ONE, and BIPPA is the case.** Its PDFs are page images with
  no text layer at all — `pypdf` returns zero characters from four pages — so an article that is open,
  free and exactly on the subject cannot be read from here without OCR. That, not paywalls, is why
  `ban-chiang-pot` is deferred: the three works on Ban Chiang's chronology are open and readable
  (Higham, Douka and Higham in PLOS ONE and in JIPA), and **nothing openable is about the painted pottery
  itself**, which is what the artefact is. The AUP figshare archive of Ban Chiang painted pottery answers
  **202 with an empty body**. A plate about a pot that talked about bronze chronology would be an artefact
  described from the literature that happens to exist rather than from itself.
· **THE CORRECTION IS INSIDE THE NAME A FIFTH TIME, and here it is inside the founding paper.** Hirth held
  the metal drum to be a Chinese invention of the first century CE, made during campaigns against the
  southern tribes; Parmentier's comparison of the drums' engraved boats, deer and figures with the same
  scenes on locally made bronze axes and daggers is what argued them into being a local industry, and
  Goloubew's pit graves on the Sông Mã — extended bodies, bronzes, iron and pottery, unlike the Chinese
  brick tombs of the region — are what settled it. Goudineau's 2000 survey is the honest close: after a
  century the ornament has been read as a solar cult, as Central Asian shamanism, as water ritual and as
  funerary ceremony, and **the argument is a nationalist one as much as an archaeological one**, which a
  plate has to say rather than pick a side in.
· **`add-artefacts.js` REFUSED THE DRUM AT 227 WORDS**, and the two clauses cut to reach the bar were both
  padding round a claim rather than a claim — "quite unlike … found across the region" and "a nationalist
  one as much as an archaeological one". The refusal is doing its job: at 227 words a five-sentence plate
  has started explaining itself twice.
· Two smaller access notes. **`ojs.bioresources.com` serves gzip that must be asked for** — without
  `curl --compressed` the body arrives as binary and reads as a broken host. And **`degruyterbrill.com`
  answers 202 with an empty body**, joining figshare as a second of that shape; `mdpi.com` is 403 as
  before, and neither *Chemosensors* nor *Religions* has a PMC copy, so C1b's "check PMC first" does not
  rescue an MDPI journal outside the life sciences.

**C2a's finding is that THE OUT-OF-COPYRIGHT MONOGRAPH IS NOT A LAST RESORT, IT IS THE BEST SOURCE
THERE IS FOR A VICTORIAN EXCAVATION — and that a whole plate can be built from three of them.** The
Zimbabwe Bird rests on Bent 1892, Hall and Neal 1904 and Randall-MacIver 1906, all whole on archive.org
with clean OCR, and between them they give the object (the one intact beak, the ruled feathers, the
necklace with its brooch, the rosette eyes, what each bird perches on), the whole roll-call of Victorian
speculation, and the 1905 excavation that ended it — *nothing more than a few centuries old, and nothing
that was not either a medieval import or characteristically African*. **No modern paper could have
carried that plate**, because the argument the artefact is famous for happened in those books: `Azania`
is Taylor & Francis and 403 here, the *South African Archaeological Bulletin* is on JSTOR, and neither
is where the mistake was made. The same route carried the Thule harpoon head, whose typology is
Mathiassen's 1930 Fifth Thule Expedition volume, open in full.

· **THE BATCH IS TWO ARTEFACTS AND NOT THREE, AND THE THIRD WAS A SELF-INFLICTED WOUND.** `obsidian-blade`
  was researched to three open sources — Buck's 1982 surgical paper, the Templo Mayor pXRF study and the
  Keros sourcing study — and then refused by `add-artefacts.js` because **it is already in the pool**. The
  plan's own row lists it, the diff of plan against pool did not, and the id was chosen from the row. **Read
  the DIFF, never the plan row**: one command answers what is actually missing
  (`node -e` over `artefact-io.js` against the plan's tables), and it is the only thing that knows what has
  shipped. The research is not wasted so much as unspendable — the existing entry is at the bar already.
· **A NEW ARTEFACT MAY SHIP WITHOUT A PICTURE, AND THIS ONE DOES.** Commons has no photograph of an
  archaeological Thule harpoon head: `Category:Thule culture` holds house ruins, food caches and
  distribution maps, the searches return modern Inuit hunting gear, a Smithsonian plate of toggle harpoons
  from everywhere at once, and — the trap worth recording — a Met file whose title says harpoon and whose
  record says **Japan**. A modern head captioned as an ancient one would be the replica fault in another
  coat, so the entry ships with none.
· **`journals.openedition.org` IS BEHIND THE ANUBIS WALL AGAIN**, which retires N3's note that it had
  dropped it. That closes the one open source found for `phonograph-cylinder` (a *Gradhiva* paper on the
  1907–09 South Cameroon cylinders), and E3 is now the batch to worry about rather than B4: **the
  industrial everyday's literature is in *Post-Medieval Archaeology* (403) and *Historical Archaeology*
  (Springer, paywalled, and the curl route that opens *Heritage Science* does not open a closed Springer
  article — it returns a 3,038-byte stub)**, and Crossref's open alternatives for transferware, Bartmann
  jugs and wax cylinders came to one usable work apiece. Expect to write E3 from archive.org or to defer
  most of it.
· Two smaller notes. **`id.erudit.org` is CONNECT-rejected here**, so an Érudit DOI cannot be followed even
  though `www.erudit.org` answers 200 — try the article path directly. And **`pmc.ncbi.nlm.nih.gov` throws
  an occasional reCAPTCHA page**; it clears on a retry and is not a fact about the article.

**D3a SWEPT THE WHOLE DEFERRAL LIST AND CLEARED ONE OF EIGHT, and the negative result is the useful
half.** B2b's rule — that a deferral one batch old is the cheapest work on the list — was tested against
every standing deferral in one pass, and seven of them are not cheap at all: `mamluk-mosque-lamp` has
exactly ONE openable work and it is a very good one (the Brooklyn Museum's enamelled lamp, analysed to
decide whether it is Mamluk or a 19th-century European copy), `fustat-paper` has one, `inkstone` one,
`igbo-ukwu-bronze` one, `han-tomb-brick`, `ban-chiang-pot`, `mughal-miniature`, `nbpw-sherd` and
`glass-bangle` none that is about the object rather than around it. **A deferral is cheap to RE-TRY and
usually still fails; what makes it worth a sweep is that one of them clears** — `dotaku` did, on three
works none of which existed in B3b's search because none was found by searching for the culture.

· **THE THREE THAT CLEARED `dotaku` NAME THREE DIFFERENT ROUTES, AND NONE IS "SEARCH FOR THE OBJECT".**
  *Materia Japan* on J-Stage is a METALLURGY journal and carries the lead-isotope history (found by
  searching for the material, B3a's own rule); the *Japanese Journal of Religious Studies* is open at
  Nanzan and carries the deposition and the iconography (found by searching for what the object was FOR);
  and MedCrave's *Journal of Historical Archaeology & Anthropological Sciences* carries a comparison with
  Malaysian bronze bells (found by searching for the object beside something else). **When a subject
  search fails, search the material, the purpose, and the comparison.**
· **THE CORRECTION IS INSIDE THE METAL.** Japanese archaeology argued for decades between native copper
  and imported metal, and lead isotope ratios settled it in a way neither side expected: the earliest
  bells are on Korean metal and the later ones on lead from Han China, so the source MOVED over the three
  centuries the bells were made. The bells moved the other way — bigger, more ornate, and no longer
  depicting the farming year — which one Japanese archaeologist put as the change from bells for
  listening to into bells for looking at.
· **`Index of Texas Archaeology` IS AN OPEN GREY-LITERATURE REPOSITORY AND IT IS A REAL SOURCE.** Three of
  its notes carried the shell gorget — the trade in conch shell cups into the Caddo country, the style
  series and its iconography, and a child's burial at the Gilbreath site with a gorget on the chest —
  where *Southeastern Archaeology* is Taylor & Francis and shut. Its Crossref records carry no volume or
  pages, so the citations give the year alone, which is honest rather than incomplete.
· **A LANDING PAGE'S `citation_firstpage` CAN DISAGREE WITH THE PUBLISHER'S OWN HOW-TO-CITE BLOCK, AND THE
  BLOCK WINS.** MedCrave's meta tags give the Jusoh paper as 62–65 and its own citation line as 46–52,
  which is also what Crossref holds. **Read the How-to-Cite block; the meta tags are generated and can be
  wrong about the same article.**
· One access note: **`id.erudit.org` and `journals.openedition.org` remain shut**, `koreascience.kr`
  refuses, and the Korean art-history journals (`kjah`, `jkaahe`, `dah`, `jshs`) resolve to closed
  aggregators — so `buncheong-bowl` has no route yet either.

**E2a's finding is the answer to C2a's warning that E1–E3 are shut: THE INSTRUMENTS AND THE
INDUSTRIAL EVERYDAY ARE THE ONE PART OF THIS POOL BEST SERVED BY OUT-OF-COPYRIGHT BOOKS, because the
people who made and used them wrote manuals about it and those manuals are on archive.org whole.**
Three artefacts, nine works, not one journal article: Moxon 1683 and De Vinne 1900 and Legros and Grant
1916 for the type sort; Cajori's *William Oughtred* of 1916, Kentish 1864 and Dunlop and Jackson for the
slide rule; Lewis Evans's chapter in Gatty's *Book of Sun-Dials* of 1900, Cajori again and Leadbetter
1756 for the portable dial. **A trade manual is a better source for an everyday object than a modern
paper is**, because it was written for someone who had to make the thing: De Vinne names the ten parts of
a sort and explains that the punch-cutter's first tool is a counter-punch bearing the letter's HOLE, and
Legros and Grant give the point as 0.3515 mm and then note that the British and American inches the
founders worked from differ from one another.

· **THE BATCH CAME OUT OF ONE SHARED QUARREL, AND THAT WAS NOT PLANNED.** Cajori's Oughtred was fetched
  for the slide rule and turns out to record that the priority dispute with Oughtred's own pupil Richard
  Delamain was over the circular rule AND *a horizontal instrument or portable sun-dial* — so the two
  E2 artefacts written this batch are two ends of one seventeenth-century argument, and the same work
  cites both. **Read a book fetched for one artefact with the rest of the batch in mind.**
· **THE `_djvu.txt` IS NAMED AFTER THE PRIMARY FILE, NOT THE ITEM ID.** `archive.org/download/<id>/<id>_djvu.txt`
  404s on any item whose uploaded file has a different name — which is most user uploads — and
  `archive.org/metadata/<id>` lists the true name. Two of this batch's books were briefly written off on
  that 404 before the metadata was asked. This is `artefact-citation-plan.md`'s "a 200 from archive.org is
  not a readable book" with the failure one step earlier.
· **AN ARCHIVE.ORG ITEM CAN BE A MODERN RE-SET EDITION OF A PUBLIC-DOMAIN BOOK, NOT A SCAN OF IT.** The
  only copy of Cajori's *History of the Logarithmic Slide Rule* (1909) reachable here is a re-typeset
  photocopy edition posted by a slide-rule museum, whose own editor's foreword says the pagination is
  different, the index is gone and it "should be regarded as for general interest". Citing it as the 1909
  original would misdescribe it, so the plate uses Cajori's 1916 *William Oughtred* instead, which is a
  true scan. **Read the item's own front matter before citing a page.**
· **E3 STILL HAS NO ROUTE and this is where it will come from.** The journals are shut (*Post-Medieval
  Archaeology* 403, *Historical Archaeology* behind a Springer stub, OpenEdition behind Anubis), but
  Jewitt's *Ceramic Art of Great Britain*, Greener's *The Gun and Its Development* and the Edison-era
  phonograph manuals are all the same kind of book as this batch's nine. **Write E1 and E3 from the trade
  literature, not from the archaeology.**
· One honest note about `slide-rule`'s illustration: no photograph of a seventeenth- or
  eighteenth-century rule could be found on Commons, so the plate shows a modern one, which is the same
  instrument and is captioned as what it is rather than dressed as an antique.

**E3a's finding is that THREE TRADE BOOKS DISAGREEING WITH EACH OTHER IS A BETTER PLATE THAN ONE
AUTHORITY AGREEING WITH ITSELF.** Every artefact in this batch rests on a contradiction between its own
three sources, and each is a real historical dispute rather than an error: transferware is given to Dr
Wall at Worcester by an 1854 encyclopedia, called a claim made by several places by the standard ceramic
history of 1878, and traced to Sadler and Green at Liverpool by the 1907 monograph on the process; the
flintlock is Spanish and pre-1630 in Greener, Dutch and Charles II's reign in the Birmingham survey of
1866; and Bayonne's bayonets are dated 1640 by one and 1641 by another. **A plate that says who thinks
what is more honest and more interesting than one that picks a winner**, and it is only possible because
these books are open in full and can be read against one another.

· **THE E1–E3 ROUTE IS NOW PROVEN TWICE OVER: the trade literature, not the archaeology.** Six books
  carried this batch — Grose 1786, Tomlinson 1854, Timmins 1866, Jewitt 1878, Turner 1907, Greener 1910 —
  and three of them serve two artefacts each, which is not padding but the shape of the sources: Greener's
  *The Gun and Its Development* has a chapter on the story of the bayonet as well as on the lock, and
  Timmins's Birmingham survey covers the gun trade and the bayonet in the same paragraph.
· **A USER UPLOAD OF AN IN-COPYRIGHT BOOK IS NOT A SOURCE, AND `steel-pen-nib` IS DEFERRED ON THAT.**
  Timmins 1866 carries the whole early history of the Birmingham steel-pen trade — Gillott, Perry and
  Josiah Mason, the collapse from twelve shillings a dozen to pence a gross, and the 1849 census of twelve
  factories, 300 men and boys against 1,560 women and girls, 65,000 gross of pens a week — but the only
  other openable item found is A. A. S. Charles's *The Steel Pen Trade 1930–1980*, published about 1983
  and uploaded whole. B2a dropped Rudenko 1970 on that ground and this goes the same way. **One superb
  source is still one source.**
· **THE COMMONS `api.php` RATE-LIMITS AFTER A SESSION'S SEARCHES, AND ITS 429 IS PLAIN TEXT.** A JSON
  parser reports that as a syntax error, which reads like a bug in the search script rather than a limit
  on the account. `commons.wikimedia.org/w/index.php?search=…&ns6=1` keeps working and returns the file
  titles in its HTML — **use the HTML search when the API starts throwing parse errors**, and note this is
  a third Wikimedia limit alongside `upload.wikimedia.org`'s 429 on files and the earlier one on the
  description pages.
· One naming caution of the kind the katana's Commons page produced: Tomlinson's *Cyclopaedia* and
  Jewitt's *Ceramic Art* were both published by Virtue, but the scans' own title pages do not state it
  plainly enough to be sure which Virtue, so those two citations give the place and year alone rather
  than a publisher guessed from memory.

**E1a's finding is that THE TRADE MANUAL CARRIES THE PHYSICS, NOT JUST THE PRACTICE — and that is what
makes an everyday object worth a plate.** Simpson's 1862 *Ordnance and Naval Gunnery* does not merely
tabulate windage, it explains why windage ruins a shot: the powder's force escapes past the ball, and the
ball rattles from side to side down the bore instead of running parallel to the axis, so it leaves the
muzzle spinning and in a direction that depends on where it last struck. That is the whole of why a
smoothbore is inaccurate, written by a man teaching gunners, and no modern secondary source states it as
plainly. Ffoulkes does the same for mail — wire-drawing was not practised until the 14th century, so the
wire was hammered from a bar, wound round a core and cut into rings — and Maver does it for the telegraph
key, which exists to make and break one circuit and nothing else.

· **A TRADE MANUAL ALSO CARRIES A READY-MADE AUTHENTICITY TEST, and that is the second reason to reach
  for one.** Ffoulkes 1909: a piece of mail whose rings are merely BUTTED together rather than riveted or
  welded is generally either an imitation or was made for ceremony, because the join is too insecure to
  wear. That is the replica rule this pass keeps meeting — the Lewis chess replica, the pristine bamboo
  slips — stated for a whole class of object by someone who handled thousands.
· **THE THREE PERIODS OF A TRADE ARE THREE DIFFERENT BOOKS, AND THE PLATE WANTS ALL THREE.** The telegraph
  key rests on Vail's 1847 description of the original apparatus (where the key is called "the key or
  correspondent" beside the register), Prescott's 1860 survey (which shows the rival twenty-eight-key
  keyboard instruments the single lever beat), and Maver's 1909 encyclopedia (which records that operators'
  preferences displaced keys already in service, because a key that suited the hand was worth five to ten
  messages an hour). **Early description, mid-century survey, late encyclopedia** is a shape worth
  reaching for whenever an object had a working life of a century.
· **A MUSEUM RECORD CAN CONTRADICT ITSELF, AND THE FIGURES ARE WHERE IT SHOWS.** The Portable Antiquities
  record for this batch's round shot gives it as "roughly 12lbs" and as 530 g in the same sentence — a
  factor of ten out — so the plate states the diameter and the weight and not the poundage. **Read a
  record's numbers against each other before repeating any of them**; this is C4's read-both rule inside a
  single source.
· One archive.org note to add to E2a's two: **an item id that resolves for volume 1 need not resolve for
  volume 2**. `militaryantiquit01gros` serves Grose's first volume in full; `militaryantiquit02gros`
  returns a 503, so his artillery volume was not opened and the cannonball plate uses Simpson and Adye for
  the ordnance instead. Search for the second volume by title rather than by incrementing the number.

## The per-artefact workflow

Unchanged from the first pass, and `artefact-citation-plan.md` states it in full. In short: research
the object, read what each of the five sentences actually claims, find three real works and **verify
every URL resolves before writing it**, place the markers with `mark-artefact-sources.js` rather than
by hand, and run `node .claude/add-artefacts.js <batch.json>`, which refuses anything under the bar.
Then `node .claude/test-artefacts.js` and `node .claude/check-style.js`.

**NAMES COME FROM CROSSREF, NEVER FROM AN INDEX'S AUTHOR STRING.** Europe PMC and PubMed print
`Surname AB`; expanding those initials produces a name that reads perfectly and is wrong, and it has
been caught in three consecutive batches. Query `api.crossref.org/works/<doi>` for the author list, or
read the byline in the article itself, and run `node .claude/check-citations.js --artefacts` BEFORE
committing.

**A new artefact ships with a picture or with a stated reason why not** — `add-artefacts.js` calls
`suggest-image.js` and prints candidates with their licences; it suggests and never installs, and the
standing rule is to **look at the picture before using it**. The three faults that pass kept finding
were the right name and the wrong person, an unlabelled plaster cast standing in for the object, and
a modern reproduction sold as the ancient thing.

Not part of the site.
