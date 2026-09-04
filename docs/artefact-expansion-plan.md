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
| A3 | 7 | `pazyryk-carpet`, `dancing-girl-mohenjo-daro`, `golden-crown-of-silla`, ~~`jade-burial-suit`~~ (cleared and shipped in A3d), `aztec-sun-stone`, ~~`igbo-ukwu-bronze`~~ (dropped in C2b; `benin-bronze-plaque` shipped in its place), `enigma-machine` | archive.org (Marshall, Rudenko), J-Stage, Cambridge via `doi.org`, INAH, cryptologic history |

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
| D2 Prehistory's everyday, worldwide | 9 | `palaeolithic-bone-flute`; `spear-thrower` (planned under the name antler-spearthrower), `saddle-quern`, `sickle-blade`, `bone-fishhook`, `ochre-crayon`, `eyed-bone-needle`, `oak-coffin-textile`, `amber-bead` | PLOS, *Scientific Reports*, Europe PMC, Antiquity, Persée, archive.org (Evans) |
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
| B1 | `indus-seal`, `indus-weight`, `harappan-toy-cart` | ~~`gandhara-buddha-head`, `chola-nataraja`~~ (shipped in B1c), `mughal-miniature`, ~~nbpw-sherd~~ (cleared and shipped in B1e), ~~`punch-marked-coin`, `etched-carnelian-bead`~~ (shipped in B1b), ~~glass-bangle~~ (cleared and shipped in B1f) |
| D2 | `oak-coffin-textile`, `amber-bead`, `ochre-crayon` | `palaeolithic-bone-flute`, ~~antler-spearthrower~~ (shipped in D2b as `spear-thrower`), `saddle-quern`, `sickle-blade`, `bone-fishhook`, `eyed-bone-needle` |
| D2b | `spear-thrower`, `saddle-quern`, `sickle-blade`, `eyed-bone-needle` | ~~`palaeolithic-bone-flute`, `bone-fishhook`~~ (both shipped in D2c) |
| C3/C2 | `clovis-point`, `obsidian-blade`, `ostrich-eggshell-bead` | — |
| C1 | `byzantine-lead-seal`, `lustreware-bowl`, `glass-coin-weight` | — |
| C1b | `islamic-star-tile`, `byzantine-silk` | `fustat-paper`, ~~mamluk-mosque-lamp~~ (cleared and shipped in C1d) |
| D1 | `antler-comb`, `bone-ice-skate` | ~~`novgorod-birch-bark-letter`~~ (held; released and shipped in D1c) |
| D1b/C2 | `seal-matrix`, `manilla` | — |
| A2b/E1 | `vindolanda-tablets` (UN-DEFERRED), `sling-bullet` | — |
| D2c | `palaeolithic-bone-flute`, `bone-fishhook` (both UN-DEFERRED — **D2's list is now empty**) | — |
| B1b | `punch-marked-coin`, `etched-carnelian-bead` (both UN-DEFERRED) | — |
| B1c | `chola-nataraja`, `gandhara-buddha-head` (both UN-DEFERRED) | — |
| A2c | `book-of-kells`, `bayeux-tapestry`, `lewis-chessmen` (all three UN-DEFERRED — **A2's list is now empty**) | — |
| A3a | `aztec-sun-stone`, `enigma-machine`, `dancing-girl-mohenjo-daro` | — |
| B2a | `oracle-bone`, `bamboo-slip`, `crossbow-trigger` | ~~`longquan-celadon-bowl`~~ (shipped in B2b), ~~inkstone~~ (cleared and shipped in B2d), ~~igbo-ukwu-bronze~~ (dropped in C2b), ~~pazyryk-carpet~~ (cleared and shipped in A3c) |
| B2b | `bronze-ding`, `longquan-celadon-bowl` (UN-DEFERRED), `wax-tablet` | ~~han-tomb-brick~~ (cleared and shipped in B2c) |
| B3a | `samurai-katana`, `ukiyo-e-print`, `goryeo-celadon` | — |
| B3b | `daguerreotype`, `jomon-dogu`, `magatama` (**B3's list is now empty but for `dotaku`**) | `dotaku` (needs a third openable work) |
| B4a | `dong-son-drum`, `lapita-pottery`, `palm-leaf-folio` | ~~ban-chiang-pot~~ (cleared and shipped in B4c) |
| C2a | `thule-harpoon-head`, `great-zimbabwe-bird` (**two, not three — see below**) | — |
| D3a | `dotaku` (UN-DEFERRED), `mississippian-shell-gorget` | — (a deferral sweep that cleared one of eight) |
| E2a | `type-sort`, `slide-rule`, `portable-sundial` | — |
| E3a | `transferware`, `socket-bayonet`, `flintlock-musket` | ~~steel-pen-nib~~ (one work only; cleared and shipped in E3e) |
| E1a | `mail-fragment`, `telegraph-key`, `iron-cannonball` | — |
| E2b/E3b/D1c | `albarello`, `phonograph-cylinder`, `green-glazed-jug` | — |
| E3c/C1c/E2c | `bartmann-jug`, `byzantine-ivory-panel`, `gutenberg-bible-leaf` | — |
| C3b/E3d | `wampum-bead`, `thimble` (**two, not three — see below**) | ~~moche-portrait-vessel~~ (cleared and shipped in C3c), `bodkin-arrowhead` |
| B1d | `mughal-miniature` (UN-DEFERRED; **one, not three — see below**) | ~~glass-bangle~~ (cleared and shipped in B1f), ~~mariners-astrolabe~~ (cleared and shipped in E2d), `turnshoe` |
| B4b | `shell-adze` | ~~sumatralith~~ ("no openable work uses the term" — wrong; cleared and shipped in B4c) |
| D1c | `novgorod-birch-bark-letter` (**UN-HELD — D1's list is now empty**) | — |
| E3e | `steel-pen-nib` (UN-DEFERRED — **E3's list is now empty**) | — |
| C1d | `mamluk-mosque-lamp` (UN-DEFERRED) | — |
| C3c | `moche-portrait-vessel` (UN-DEFERRED — **C3's list is now empty**) | — |
| B2c/B3c | `han-tomb-brick`, `buncheong-bowl` (both UN-DEFERRED — **B3's list is now empty**) | — |
| A3a/B2d | `golden-crown-of-silla`, `inkstone` (UN-DEFERRED — **B2's list is now empty**) | — |
| E2d | `mariners-astrolabe` (UN-DEFERRED; **one, not three — see below**) | `trench-art-shell-case`, `identity-disc`, ~~ban-chiang-pot~~ (cleared in B4c) |
| A3c | `pazyryk-carpet` (UN-DEFERRED; **one, not three — see below**) | `turnshoe` again, ~~nbpw-sherd~~ (cleared and shipped in B1e), `identity-disc` again |
| B1e | `nbpw-sherd` (UN-DEFERRED; **one, not three — see below**) | `ife-head`, ~~igbo-ukwu-bronze~~ (dropped in C2b), `bodkin-arrowhead` again, `fustat-paper` again |
| B4c | `ban-chiang-pot`, `sumatralith` (both UN-DEFERRED — **B4's list is now empty**) | — |
| B1f | `glass-bangle` (UN-DEFERRED, and **shipped with no picture** — see below; **B1's list is now empty**) | ~~jade-burial-suit~~ (cleared and shipped in A3d), `bodkin-arrowhead` again |
| S1 | **nothing — a search batch, see below** | `identity-disc` (one work found), `turnshoe` again, `trench-art-shell-case`, `fustat-paper` again |
| C2b | `benin-bronze-plaque` (**SUBSTITUTED for `igbo-ukwu-bronze` — see below**) | — |
| A3d | `jade-burial-suit` (UN-DEFERRED; **A3's list is now empty**) | — |

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
that journal, whose DOIs 404 at Ubiquity and whose new host serves nothing. **(Cleared in B1e — the
*Ancient Asia* paper was never needed; *Asian Perspectives* and *Current Science* carry the whole plate.)**

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
  itself**, which is what the artefact is. **(Cleared in B4c — van Esterik's 1973 analysis of the painted
  pottery is in *Asian Perspectives* and reads perfectly.)** The AUP figshare archive of Ban Chiang painted
  pottery answers **202 with an empty body**. A plate about a pot that talked about bronze chronology would be an artefact
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
  aggregators — so `buncheong-bowl` has no route yet either. **(Cleared in B3c, from a museum's own
  records and a 1929 survey — the journals were never the way in.)**

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

**E2b/E3b/D1c's finding is that THREE SOURCES A GENERATION APART BEAT ONE AUTHORITY, and the shape is
the same one E1a named.** All three of its plates are built out of trade and museum literature spanning
decades, and in each the works say different things because they were written at different moments.
The phonograph cylinder is Prescott's 1878 account of the tinfoil machine (a brass drum grooved about
2.5 mm apart, a stylus denting the foil to depths that varied with the voice), Edison's own words in
1888 ("instead of tin-foil, I now use a cylinder of wax", incised in lines hardly visible to the naked
eye, with a turning tool to pare off what was said before), and the National Phonograph Company's 1900
shop manual (the Standard shipped complete with a sapphire shaving knife, a hearing tube, a brass horn
and an oak case, advertised as "will record, will reproduce, will shave off"). That is one object
described three times across twenty-two years, and the plate can therefore say what CHANGED rather than
what the thing was.
· **A SOURCE THAT REFUTES ANOTHER SOURCE IN THE SAME PLATE IS WORTH MORE THAN EITHER.** `green-glazed-jug`
  cites Jewitt 1878, who dug the Burley Hill kiln himself and calls its 41 cm pitcher "the finest and
  most interesting fictile remain of the Norman period in existence" — and Hobson's 1903 British Museum
  catalogue, which answers in a footnote that Jewitt's Norman attribution "was based on insufficient
  evidence". The plate therefore ends on the dating problem rather than on the Norman claim, which is
  what the two sources together actually support. **Read the later catalogue's footnotes for the earlier
  excavator's name**; this is the citation passes' sibling-consistency check applied inside one artefact.
· **THE TRADE LITERATURE ROUTE HOLDS FOR CERAMICS TOO.** E1/E2/E3 were opened by out-of-copyright trade
  manuals; the same shelf carries the connoisseurs' catalogues, and they are better than the manuals
  because a catalogue states the PROCESS as well as the object. Fortnum's *Maiolica* (1892) gives the
  whole tin-glaze recipe in one paragraph — siliceous glass, oxide of lead for translucency, oxide of tin
  for an opaque white of great purity, milled to the consistency of cream, dipped and fired again — which
  is what makes an albarello plate about a technology rather than about a shape.
· **AN OBJECT'S ORIGIN IS OFTEN THE THING THE OLD SOURCE ALREADY SETTLED.** Wallis 1904 dismisses the
  "various fanciful suggestions" about where the Italian albarello came from as unnecessary to discuss
  "now that we are aware it was a common form of vase in Eastern use", and records albarelli imported from
  Persia, Syria and Egypt into Sicily and Moresco ones from Spain. A 1904 book can be current on a
  question a modern popular account still gets wrong.
· Two access notes. **`archive.org/download/<id>/<id>_djvu.txt` can return an empty body where the
  node-specific host serves the file** — `ia801605.us.archive.org/0/items/<id>/<id>_djvu.txt` and
  `archive.org/stream/<id>/<id>_djvu.txt` both worked for the same id that `download` returned 0 bytes
  for, so try the alternates from `archive.org/metadata/<id>` before concluding a text derivative is
  missing. And **`upload.wikimedia.org` 429s while `commons.wikimedia.org` does not**, so a URL sweep of a
  picture batch will report a 429 that is this container's rate limit rather than a broken path — confirm
  against the file's own Commons page, and fetch the picture itself through
  `commons.wikimedia.org/w/thumb.php?f=<FILE>&width=<n>`, which answers when `Special:FilePath` hands back
  HTML.

**E3c/C1c/E2c's finding is that THE CATALOGUE OF A GREAT COLLECTION IS THE BEST SINGLE SOURCE THIS PASS
HAS FOUND, and its refusals are worth as much as its facts.** All three plates lean on one — Hobson's
*English Pottery* (1903), Dalton's *Ivory Carvings of the Christian Era* (1909), and the British Museum's
*Catalogue of Books Printed in the XVth Century* (1908) — and each is out of copyright, whole on
archive.org, and written by a curator describing objects in front of him. What a trade manual gives is a
process; what a catalogue gives is a MEASURED OBJECT with its attribution argued, and the two together
are most of what a 200-word plate needs.
· **BMC I DOES NOT NAME GUTENBERG, and that is the fact the plate is built on.** The British Museum files
  the 42-line Bible under "Printer, or Printers, of the 42-line Bible and 30-line Indulgence" — the book
  carries no printer, place or date, and De Vinne records that by the 16th century the tradition that
  Gutenberg made it was entirely lost, the attribution reviving only when a copy was identified in
  Cardinal Mazarin's library. Pollard adds that bibliographers settled on "the 42-line Bible" precisely as
  "a safe uncontroversial title". **When the standard catalogue declines to attribute, say so**: a plate
  that names the printer flatly is asserting what its own best source refuses to.
· **A CATALOGUE ENTRY IS ALSO A COLLATION, which is where the process shows.** BMC's entry gives 643
  leaves, two columns, 42 lines at 292×198 mm — and then 40-line and 41-line pages, the type filed down
  twice so that 42 of the smaller lines take slightly less room than 40 of the old, six presses working at
  once, and a mid-run decision to enlarge the edition that forced already-printed pages to be reset. It
  also dates the book from the OUTSIDE: Heinrich Cremer finished rubricating and binding his copy on 24
  August 1456, so copies were on sale weeks before. **Read the collation, not the headnote.**
· **THE OBJECT'S OWN NAME CAN BE THE DISAGREEMENT.** Solon (1892) calls the Rhenish jug the *Bartmann*,
  after the bearded face under its spout, and never uses "Bellarmine"; Hobson and Rhead call the same
  thing a Greybeard or Bellarmine. Rhead then goes further and doubts the English ever made the ordinary
  sort at all, preferring "to let the bellarmines go by default of evidence" — against Hobson's record of
  three separate petitions for the monopoly (William Simpson under Elizabeth, Rous and Cullen in 1626,
  David Ramsay in 1636), each claiming to have solved the mystery of producing stoneware as in Germany.
  Three works, two names and one open question, from one shelf.
· **A QUESTION THE SOURCES CANNOT ANSWER IS STILL A FACT WORTH CARDING.** Maskell (1876) records that
  nobody can explain how the largest ivory slabs were obtained — one British Museum piece runs to 41 by
  14 cm — and gives both standing theories, a lost method of softening and flattening ivory, or tusks
  larger than the modern animal yields. Beside it Dalton's *Byzantine Art and Archaeology* supplies the
  two things a reader forgets about ivories: that they were painted and gilded, inscriptions picked out in
  red and some stained the imperial purple, and that the consular series is COUNTABLE — 49 known, 37 named
  by inscription or monogram and 12 anonymous, ending with Basilius in 541 when Justinian abolished the
  office.
· One access note to add to E2b's: **`archive.org/advancedsearch.php` is the way to find these**, since a
  catalogue's title is long and its author is often the institution rather than the curator (Hobson's and
  Dalton's BM catalogues are both filed under the British Museum). Search the TITLE, not the person.

**C3b/E3d's finding is a bookkeeping one, and it is that PROSE DOES NOT FIX A MACHINE-READABLE ROW.**
That `antler-spearthrower` shipped as `spear-thrower` has been written in this file since D2b, in a
finding of its own — and the id went on being counted as outstanding anyway, because it survived in
BACKTICKS in two rows the plan-versus-pool diff reads: the region table's parenthetical "(planned as
`antler-spearthrower`)" and the batch log's D2 deferred column. Both are now de-backticked and struck, and
the outstanding count drops by one. **Where a planned id ships under another name, take the id out of
every row that carries it**; a paragraph explaining the rename is for the reader, and the diff cannot read
paragraphs.
· **TWO PLATES, NOT THREE, AND THE REASON IS `moche-portrait-vessel`.** Kroeber's *Ancient Pottery from
  Trujillo* (Field Museum, 1926) is open, excellent and carries the whole subject — including the fact that
  the style was called **Proto-Chimu** before it was called Moche, that the stirrup-mouth is the form most
  characteristic of Trujillo, and that the stirrup often occurs attached to a modelled human head — but
  nothing else openable joins it. Joyce's *South American Archaeology* (1912) uses Truxillo vase scenes as
  evidence for hunting, fishing and warfare and never describes the portrait vessels; Squier's *Peru*
  (1877) is about Tiahuanaco and the Inca; Mead's two Peruvian leaflets run to 30 KB and say nothing;
  `escholarship.org` answers **202 with an empty body**, which takes the UC-PAAE Moche reports with it;
  and **Persée's search page is JavaScript-driven**, so its `Journal de la Société des Américanistes` run
  cannot be searched from here even though its documents are served. Deferred at one work.
· **`bodkin-arrowhead` IS DEFERRED ON A WORD, NOT ON A HOST.** Hewitt's *Ancient Armour and Weapons in
  Europe* (1855) contains the string "bodkin" **zero times** across both volumes, and so does the first
  volume of Grose; Ffoulkes has none either. The term is a modern antiquarian and archaeological label
  rather than a medieval one, so the 19th-century arms literature that opens every other E1 subject is
  blind to it. **Grep for the object's period name before concluding a shelf is silent.**
· **THE PLATE'S BEST FACT IS OFTEN THE ONE THE SOURCES REFUSE.** `wampum-bead` ends on the money question
  because Holmes reasons that shells traded far from the sea would naturally become a currency and then
  quotes Morgan's flat denial that the Iroquois ever made wampum one in any sense, "having no common
  standard of value until they found it in our currency". Beauchamp supplies the physical tell that goes
  with it: **a steel drill leaves a nearly uniform bore where the earlier Indian bead tapers to the centre
  from each end**, which is how colonial-made wampum is told from Indian-made — a distinction only a source
  that watched both being made could give.
· **AND A TRADE-LITERATURE PLATE CAN BE HONEST ABOUT ITS OWN DATE.** `thimble` is dated *19th century* and
  no wider, because Ure, Tomlinson and Timmins describe the Victorian object and nothing cited reaches
  further back. Ure is the find: his *Dictionary* gives the definition in one sentence, both kinds (closed
  and open), and the whole Rouy and Berthier process from red-hot disks to the gold leaf held on by
  pressure alone. **A date field is a claim like any other** — write the span the sources carry, not the
  span the object had.
· One access note: **`finds.org.uk` is now behind a Cloudflare interstitial** (403, "Just a moment…") on
  its search paths, so the Portable Antiquities Scheme is not a route from here at present.

**B1d's finding is the cost of the deferral list: a batch spent almost entirely on searching, and one
plate to show for it.** Six subjects were opened and five closed, and the five failures are each worth
recording, because every one of them was a plausible-looking route that does not exist.
· **`mariners-astrolabe` has one usable work and two unreadable ones.** **(Cleared in E2d: the other two
  works are museum records, not period manuals.)** Markham's Hakluyt Society edition
  of *The Voyages and Works of John Davis* (1880) is excellent and carries the plate's best fact — Davis,
  in *The Seaman's Secrets* of 1595, calls the compass, chart and cross-staff "instruments sufficient for
  the seaman's vse, the Astrolabie and Quadrant being instruments very vncertaine for Sea observations",
  so the instrument everyone pictures as the navigator's was the one the best English navigator of his
  generation distrusted. But the period manuals beside it will not read: the archive.org scan of
  **Cortés's *Arte of Nauigation* (1589) yields zero hits for "astrolab"** and so does **Edward Wright's
  *Certaine Errors in Navigation* (1599)**, both being blackletter with OCR that is not merely poor but
  useless, and **Hues's *Tractatus de Globis* (Hakluyt, 1889), which reads perfectly, never mentions the
  instrument.** **Test a period scan by grepping for the subject word before planning a plate on it.**
· **`glass-bangle` has the sources and no picture.** **(Half right: it now has THREE sources and still no
  picture, and shipped that way in B1f.)** Marshall's *Taxila* vol. 2 has a whole section on
  them — 232 specimens, 38 from the Bhir Mound and 194 from Sirkap, the earliest from a fifth-century-BCE
  stratum, blue the favourite colour throughout from copper and from cobalt, black glass "very like
  obsidian" made there from an early period, specific gravity 2.3–2.6 showing little or no lead — but it
  is one work, Beck's *Beads from Taxila* is not on archive.org, and the Indus reports cannot help because
  Marshall himself says the Indus peoples had no true glass. **And Commons has no photograph of an ancient
  South Asian glass bangle at all**: the search returns modern Hyderabad bazaar stock and Celtic examples
  from Manching, which is the right-name-wrong-place trap in its purest form.
· **`turnshoe` fails on the word, like `bodkin-arrowhead` before it.** A turnshoe is defined by its
  CONSTRUCTION — sewn inside out and turned — and the Victorian shelf that covers medieval dress
  (Fairholt's *Costume in England*, Wright's *Domestic Manners*) describes shoes as DEPICTED in manuscripts
  and monuments, never as made. Costume history is not construction history; the term is 20th-century
  leather archaeology, and the 19th century cannot answer for it.
· **`han-tomb-brick` and `inkstone` were probed and left.** **(The brick was cleared in B2c — the one
  Laufer fact turned out to be enough as a THIRD work beside two museum records; the inkstone was
  cleared in B2d, on a residue-analysis paper in *Heritage Science* rather than on any book.)** Laufer's *Beginnings of Porcelain in China*
  (1917) carries one real fact about them — "the bricks and tiles of the Han and Wei periods, as far as we
  know them, are all unglazed" — and no more; Bushell's *Chinese Art* mentions ink-stones only in a list of
  crafts. Both need a source class this pass has not found.
· **A JOURNAL THAT CHANGES PUBLISHER CAN TAKE ITS BACK CATALOGUE'S DOIs WITH IT.** *Ancient Asia* is open,
  alive and exactly the right venue for South Asian archaeology — but it moved from Ubiquity Press, and
  every **`10.5334/aa.*`** DOI now resolves to a 404 on the new site, so nothing it published before 2022
  is citable from here. Its current articles carry a `10.47509/aa.*` prefix and work. **Resolve the DOI
  before planning a batch around a journal's archive.**
· What the one plate is worth is a reminder of why the batches are shaped this way. `mughal-miniature`
  rests on Percy Brown (1924), Vincent Smith (1911) and **Blochmann's translation of the *A'in-i-Akbari*
  (1873) — the primary source Brown quotes**, which is the better third work every time it can be reached:
  it names Daswanth and Basawan, records that the week's painting went before Akbar himself, and gives the
  emperor's own answer to the charge that image-making is forbidden. It also disagrees with Brown about
  the *Hamzanama*: twelve volumes of a hundred folios is 1,200 pictures, and the *A'in* counts
  illustrations to 1,400 passages. **Where a survey quotes a primary source, cite both and let them
  differ.**

**B4b's finding is an ACCESS WIN large enough to change how the Pacific and Southeast Asian batches are
planned: ANU PRESS PDFs EXTRACT CLEANLY, and Terra Australis is open.** The whole series — 58 volumes of
Pacific, Australian and Island Southeast Asian archaeology — is free at `press-files.anu.edu.au`, one PDF
per chapter, each with its own DOI under the **`10.22459`** prefix, and the text comes out of them with an
ordinary zlib-and-`Tj` extractor. That matters because **the Journal of Pacific Archaeology's own PDFs do
NOT**: its 2010 Szabó review of Lapita shell-working is a subset-font scan that yields byte codes, the
same failure the plan records for older Copernicus articles. **Search the ANU prefix rather than the
journal**: `api.crossref.org/prefixes/10.22459/works?query.bibliographic=…` returns chapter titles and
DOIs, and `doi.org` redirects straight to the PDF.
· Two extraction notes for that shelf. The text arrives with **`en-GB` language tags interleaved into
  every run** and with ligatures as raw control bytes (`\035` for *fi*, `\037` for *Th*), so strip
  `en-GB` and the C0 range before grepping or a plain `grep -c` reports the file as binary. And an
  **abstract page carries the whole chapter's argument**, which is often enough to decide whether the
  chapter is worth reading in full.
· **`sumatralith` was the batch's target and it fails on the WORD, for the third time in three batches.**
  **(WRONG, and cleared in B4c: Soejono's 1971 survey in *Asian Perspectives* uses the term four times
  and defines it, and Li et al. 2021 in the same journal builds a whole operational sequence on it. The
  search had not reached ScholarSpace.)**
  Forestier's chapter in Terra Australis 56 (*Quaternary Palaeontology and Archaeology of Sumatra*, 2024)
  is open, readable and describes the object in detail — van Stein Callenfels excavating the Saentis shell
  midden near Medan, the Sukajadi midden at 7,340 ± 360 BP, unifacial limestone and andesite pebble tools
  at Tögi Ndrawa on Nias and at Gua Pandan, the southernmost Hoabinhian site — but **it never uses the term
  "Sumatralith" once**, and the two papers that do are shut: a 2024 *Prehistoric Archaeology* article
  serves a 3 KB JavaScript shell at `sciengine.com`, and the Indonesian *Berkala Arkeologi Sangkhakala*
  paper's DOI 302s to an `http` URL that returns nothing. With `bodkin-arrowhead` and `turnshoe` that is
  three subjects lost the same way. **The rule is now standing: grep the candidate source for the
  artefact's own NAME before planning a plate on it** — a source that describes the object without naming
  it can support the prose but cannot establish that the object is called that.
· **The plate itself is built the way this pass keeps finding works best: archaeology beside ethnography,
  with the ethnography explaining WHY.** Te Rangi Hiroa's *Ethnology of Tongareva* (Bishop Museum Bulletin
  92, 1932) says it in one sentence — "As suitable stone was not available adzes (toki) were made of
  Tridacna shell" — and then measures one: 90 mm long, the nacreous inner face ground flat at butt and
  edge to take the concavity out, the outer face ground only to strip its black layer, the shell 7–8 mm
  thick where the blade is 11. Szabó supplies what a dig adds: at Golo Cave each giant clam adze is cut
  from a single rib of one valve, and the polls are polished by a haft rubbing rather than by design.
  **The Bishop Museum bulletins are a shelf worth remembering** — Hiroa, Handy and Emory on Tongareva,
  Manihiki, Samoa and the Society Islands, all whole on archive.org with clean OCR.
· **And a source that says "this does not fit" is worth more than one that tidies up.** Szabó reports a
  direct AMS date of 9,580 ± 70 uncal. BP on a *Cassis cornuta* adze that is "clearly at odds with its
  stratigraphic position", and Hiroa reports three STONE adzes from Rakahanga, where by his own argument
  none should exist. Both went into the plate as they stand.

**D1c releases the pass's only HELD artefact, and it is the hold's own finding cashed in.** D1 recorded
that three open works on the Novgorod letters had been read and every one was about what the letters SAY,
so the plate's first sentence — what the object physically is — would have rested on nothing, and it said:
**look for the source of the first sentence before doing the rest.** That source exists and is
authoritative: **`gramoty.ru`**, the birch-bark corpus published by HSE University and the Institute of
Slavic Studies of the Russian Academy of Sciences, carries A. A. Zaliznyak's own general overview from
*Древненовгородский диалект* as a server-rendered page. It gives the whole first half of the plate —
sheets usually trimmed at the edges and most often 15–40 cm by 2–8 cm, letters pressed in with a metal or
bone stylus, only two of the corpus (nos. 13 and 496) in ink, most written on the darker inner side
because the outer flakes and curls up against the stylus, the two longest at 176 and 166 words and most
complete letters under twenty, and a corpus of 1,209 from thirteen towns by the end of 2017.
· **THE BEST FACT IN IT IS ABOUT THE DAMAGE.** Only about a quarter survive whole, and the commonest
  cause is not fire or decay: the recipient **tore or cut the letter up when he had finished with it so
  that nobody else could read it.** A source describing how an object was DESTROYED is doing something no
  catalogue of survivals can.
· **A DATABASE RECORD IS A CITABLE WORK, and it is what lets a plate name one object.** The same site's
  entry for letter no. 531 gives city, three separate datings (conventional, stratigraphic and
  extra-stratigraphic), preservation, excavation and estate, genre, repository and the full text in the
  original and word-divided — enough to say that no. 531 is Anna writing to her brother because a man has
  stood surety against her sister and called her a cow. **Cite the record as well as the essay**; they are
  different works by different hands.
· Three access notes from the same site, all of which cost a fetch each. Its **linked PDFs 404**
  (`/bundles/birchbarkdocuments/pdf/janin01.pdf` and its Zaliznyak companion are both dead), and its
  **library scans of the NGB excavation volumes are image-only** — NGB I comes back as 8 KB of junk from a
  10 MB file. What works is the HTML: the overview page and the per-letter records. And **a Russian
  journal PDF may extract only its Latin-script bibliography**: Vovin's 2026 article on birch bark giving
  way to parchment yields its REFERENCES in full and not one word of its Cyrillic body, which reads at a
  glance like a successful extraction and is not one. **Grep an extraction for a word the body must
  contain before believing it.**

**E3e clears E3's last deferral, and it cost one grep of files already on disk.** `steel-pen-nib` was
deferred in E3a with Timmins's 1866 Birmingham survey as its only work. The two that complete it had been
downloaded for OTHER artefacts and never searched for this one: **Ure's *Dictionary* has a full "Pens,
Steel, and of Other Metals" article** (fetched for `thimble`) and **Tomlinson's *Cyclopaedia* has "Pens"**
(fetched for `transferware`). **Before deferring a subject, grep the trade literature already fetched** —
a Victorian dictionary of manufactures has an article on nearly everything the industrial everyday
contains, and the marginal cost of asking is nil.
· **THE THREE WORKS DIVIDE BY WHAT EACH KIND OF BOOK IS FOR, which is why the plate holds together.**
  Timmins is a TRADE survey and gives the history and the economics — the earliest known pens of about
  1809 were steel bent into a tube with the junction of its edges forming the nib, highly polished, five
  shillings each and given as presents; the modern trade goes back no further than 1829, when hand-made
  pens gave way to the press; twelve Birmingham makers turned out 98,000 gross a week from ten tons of
  Sheffield steel. Ure is a DICTIONARY OF MANUFACTURES and gives the process, one pen through a dozen
  hands at Gillott's works, 600 of them and four-fifths women. Tomlinson is an ENCYCLOPEDIA and gives
  what the thing replaced: 22,024,000 goose quills entered for home consumption in 1840, 27 million from
  St Petersburg in a single year, a wing yielding about five good ones.
· **AND URE QUOTES TIMMINS AT LENGTH**, which is B1d's rule met again from the other side: where a survey
  quotes a primary source, cite both. Here the primary source is the one this pass already had, and the
  survey is what makes its figures checkable — Ure reprints Timmins's returns and adds the sixteen-year
  increase behind them, which is a second author vouching for a first.
· A small content note. **The plate's best sentence is about the thing that WENT AWAY.** A steel nib is
  hard to make interesting on its own terms; the quill trade it destroyed is not, and Tomlinson happens
  to have counted it. **When an industrial artefact reads flat, look for what it displaced** — the
  displaced thing is usually better documented, because somebody was still measuring it when it died.

**C1d clears `mamluk-mosque-lamp`, and it is E3e's rule applied one shelf over: the 19th-century MUSEUM
CATALOGUE is to Islamic art what the dictionary of manufactures is to the industrial everyday.** C1b
deferred this artefact for want of reachable work. What was needed was two books, both whole on
archive.org: **Stanley Lane-Poole's *The Art of the Saracens in Egypt* (1886)**, whose glass chapter says
that most surviving Egyptian glass of the 14th century is mosque lamps and then diagrams one band by band
— A on the neck, B at the junction of neck and body, C round the body **interrupted by the glass loops
the silver chains fastened to**, D on the lower curve, E on the foot — and gives the main inscription as
the Verse of Light with its letters in cobalt and the shading in red; and **Alexander Nesbitt's
*Descriptive Catalogue of the Glass Vessels in the South Kensington Museum* (1878)**, which supplies the
judgement Lane-Poole quotes: the glass is "badly made, full of bubbles, of a smoky tinge, and rather
horny texture" while the gilding and enamelling, learnt probably from the Byzantines, is expert.
· **THE TWO BOOKS ARE JOINED BY THEIR AUTHORS, WHICH IS WORTH NOTICING BEFORE CITING EITHER.** Nesbitt's
  catalogue prints Lane-Poole's own transcriptions and translations of the Arabic on its lamps, and
  Lane-Poole's book in turn quotes Nesbitt on the quality of the metal. That is the same shape as E3e's
  Ure-quoting-Timmins and B1d's Brown-quoting-the-*A'in*: **where two open works cite each other, the
  pair is stronger than either**, and the plate can take the technical verdict from one and the reading of
  the inscription from the other.
· **THE V&A's API IS A WORKING THIRD SOURCE and it is a database record, exactly as gramoty.ru's was.**
  `api.vam.ac.uk/v2/objects/search?q=…` returns real records, and `api.vam.ac.uk/v2/museumobject/<id>`
  returns one in full — for lamp O804: gilt and enamelled glass blown with an applied foot, 40.7 cm high,
  lotus flowers and peonies in red outline reserved against a blue ground, Egypt 1347–1361, probably made
  for Sultan al-Nasir Hasan, with an object history tying it to a Wallace Collection lamp bearing an
  amir's blazon. Cite the public page (`collections.vam.ac.uk/item/<id>/…`), which also answers 200.
· The lesson to carry to the deferral list: **the C1, B1 and B2 deferrals were all made looking for modern
  scholarship, and the 19th-century institutional shelf was never asked.** Lane-Poole, Nesbitt, Migeon,
  Bushell, Marshall, Hiroa, Beauchamp and Holmes have now each carried a plate; the museums that
  published them are the same museums whose APIs supply the third source.

**C3c clears `moche-portrait-vessel`, which C3b deferred at one work, and it does it with MUSEUM RECORDS
carrying real curatorial prose.** The distinction matters, because not every collection API is worth
citing. The **Met's** records are FIELDS ONLY — title, culture, date, medium, dimensions, credit line —
useful for a measurement and nothing else. **Cleveland's carry a written note**, and Cleveland's note on
its portrait vessels is the plate's best material: "The Moche were unique in ancient Peru in creating
realistic human portraits… such vessels represent more than 750 individuals; identities are unclear but
most are elite men, some probably rulers," and, of a second head, that it "may represent an important
captive who, like some Moche prisoner figures, wears double earrings and a hank of hair over the
forehead." **Ask what a museum API RETURNS before planning a plate around it**; a record with an essay is
a source, a record with only fields is a caption.
· **`metmuseum.org` IS RATE-LIMITED FROM HERE and its API is not.** `collectionapi.metmuseum.org` answers
  200 and serves full object records; the public page `metmuseum.org/art/collection/search/<id>` answers
  **429**, with a browser user-agent and on retry. A citation has to end in a URL a reader can open, and
  one that cannot be verified from here does not qualify — so a Met record drafted into this plate was
  swapped for a second Cleveland one, which also supplied the size and the captive reading. **Sweep a
  museum URL before writing the sentence that rests on it**, not after.
· The third work is Kroeber's 1926 Field Museum report, and what it contributes is the HISTORIOGRAPHY the
  museum records cannot: **when the style was first classified it was not called Moche at all.** Kroeber
  files it as *Proto-Chimu*, with Uhle's excavation at the Huaca de la Luna as its touchstone because that
  was "the only described series with grave proveniences". A plate that can say what a thing used to be
  called is doing something a catalogue entry never does.
· This is the third deferral in three batches cleared by the same manoeuvre — **19th- or early-20th-century
  institutional monograph, plus a museum's own record of one object** — after `steel-pen-nib` and
  `mamluk-mosque-lamp`. The remaining deferrals were all made looking for modern journal literature; work
  the pair before deferring again.

**B2c/B3c IS THE FOURTH DEFERRAL PAIR CLEARED BY THE SAME MANOEUVRE, AND ITS OWN FINDING IS THAT
BOTH BOOKS WERE ALREADY ON DISK.** `han-tomb-brick` was deferred in B2b because Laufer's *Beginnings of
Porcelain in China* (1917) "carries one real fact about them and no more", and `buncheong-bowl` in C2a
because every Korean art-history journal resolves to a closed aggregator. Neither needed anything new:
the Laufer text was fetched for that very probe and Eckardt's *A History of Korean Art* (1929) for an
earlier one, and both were still in the scratch directory. **A single fact is not too little for a THIRD
work** — Laufer's one sentence, that the bricks and tiles of the Han and Wei periods are so far as they
are known all unglazed, is exactly the kind of claim no museum record makes, and it carries the plate's
last sentence on its own. The deferral was made by asking whether a book could carry a plate rather than
whether it could carry a sentence.
· **CLEVELAND'S API IS THE OTHER HALF, AND ITS `description` FIELD IS A CURATORIAL ESSAY.** C3c recorded
  that a Cleveland record carries a written note where the Met's carries fields; B2c and B3c are both
  built on it. `1915.66` supplies the whole second sentence of the Han plate — the change from
  rammed-earth graves to chambers lined with decorated brick, and the ceramic stoves, houses, servants
  and pets set inside them — and `1962.153` and `1921.649` supply buncheong's definition, its two kinds
  of kiln and the Goryeo ancestry of its techniques. **Two records of the same doorway are two works and
  not one**: `1915.69` is the lintel above the column and is cited for its own measurement, exactly as
  C3c cited two Moche heads.
· **A COMPANION RECORD CAN REPEAT ITS SIBLING'S ESSAY WORD FOR WORD.** Cleveland's note on `1915.69` is
  the same paragraph as `1915.66`'s, because the two objects are halves of one doorway. That is a reason
  to cite the second record for the fact only IT holds — here 137.2 cm of lintel — rather than for the
  prose both share, and a reason not to let a marker on a shared claim point at it.
· **THE WARE'S OWN NAME IS THE PLATE'S LAST SENTENCE, and it came out of the 1929 book rather than the
  museum.** Eckardt files these pots under the Japanese trade names *Mishima-de* and *Hakeme-yaki* and
  records that "whether the Koreans ever had for it a popular name of their own has not been
  ascertained" — which is a fact about the scholarship, checkable, and better than an unsourced claim
  that *buncheong* is a modern coinage. He also describes the technique the picture shows: points and
  lines punched into the greyish ground, filled with white earth, rubbed smooth and then glazed.
· **A KOGL LICENCE IS NOT ON THE PIPELINE'S LIST, whatever it permits.** The best-resolution buncheong
  bowls on Commons are the National Museum of Korea's, at 3000 × 2000 and under **KOGL Type 1** — which
  allows commercial use and derivatives, and which `licenceClass` in `fetch-images.js` classes as
  "other", so `suggest-image.js` would refuse it. The bar is public domain, CC BY or CC BY-SA, and a
  hand-picked file is held to it exactly as a searched one is. The Met's own buncheong bowl (17.175.17)
  is CC0 and was looked at and rejected on the picture instead: a 1917 black-and-white record shot with
  the accession number inked on the foot. What shipped is a CC BY-SA 4.0 photograph of a stamped lidded
  bowl in the Horim Museum.

**A3a/B2d'S FINDING IS THAT THE OPEN-ACCESS DIRECTORIES ARE A BETTER FIRST MOVE THAN A HOST SURVEY,
AND `doaj.org/api` IS THE ONE TO REACH FOR.** Every earlier batch has opened by asking which HOSTS answer
from here; this one opened by asking which ARTICLES are open, which is a different question and a much
shorter list. Two calls to the DOAJ article API found the *Heritage Science* residue paper that carries
the whole first half of the inkstone plate, and a Crossref bibliographic query found the *Journal of Korean
Art and Archaeology* — the National Museum of Korea's own journal, CC BY-NC-ND and free — which is the one
work that describes what a Silla crown physically IS. C2a had recorded that "the Korean art-history
journals resolve to closed aggregators" and that is true of the four it named; it is not true of the
museum's own.
· **A MACHINE-GENERATED ABSTRACT IS NOT THE ARTICLE, AND THE JKAA SAYS SO ON ITS FACE.** Its abstract
  block is headed "This abstract was automatically generated using ChatGPT 4o." Everything the plate takes
  — more than eighty crowns, all of the fifth and sixth centuries, three tree-shaped uprights and two
  antler-shaped, the intersecting bands whose purpose "remains unknown", the skull fragments still stuck to
  the bronze crown from Chuam-dong — was read out of the BODY, and the abstract was used only to find the
  paragraphs. **Check whether a journal's abstract is generated before quoting from it.**
· **A KOREAN OR CHINESE BYLINE PRINTED SURNAME-FIRST READS AS A MISMATCH.** `check-citations.js` compared
  the article page's own "Gu Moon-gyoung" against Crossref's given "Moon-gyoung" and family "Gu" and
  reported a wrong surname. Crossref is not wrong here and no `CROSSREF_WRONG` row belongs: the record
  parses the name correctly and merely renders it in Western order, so the citation was rewritten to
  **"Moon-gyoung Gu"**, which is Chicago note form anyway. **Write the name in the order the given/family
  fields give**, not the order the page prints.
· **THE ANUBIS WALL COMES AND GOES, IN BOTH DIRECTIONS.** N3 recorded that `journals.openedition.org` had
  dropped it; it is back, serving a proof-of-work challenge page **with a 200 status** — a sixth variety of
  200-status error document — which cost this batch the two OpenEdition articles on the Ile-Ife
  excavations and is why `ife-head` is not in it. **Re-test a host rather than trusting a recorded state,
  favourable or not.**
· **A COMMONS FILE NAMED FOR A SITE IS OFTEN A PHOTOGRAPH OF THE SITE, NOT OF WHAT CAME OUT OF IT.**
  `Geumgwanchong 01.JPG` is public domain, 3648 × 2736 and the top hit for the Gold Crown Tomb; it is a
  photograph of a grassy mound. The picture that shipped is `Royal crown GNM Bongwan 9435 n01.jpg`, whose
  name says nothing about Silla at all. **Look at the file; the name is not the subject.** The free
  high-resolution photographs of these crowns are scarce for the reason B3c recorded — the National Museum
  of Korea's own images are KOGL Type 1, which the pipeline's licence list does not accept — and three of
  the obvious CC candidates are under 900 px and would be refused on size.

**E2d'S FINDING IS THAT A MUSEUM RECORD CAN CARRY A WHOLE PLATE, AND B1D SPENT ITS EFFORT ON THE WRONG
SHELF.** That batch looked for `mariners-astrolabe` among the period manuals and found blackletter OCR
that will not read — Cortés 1589 and Wright 1599 both return zero hits for "astrolab" — and deferred it
with one usable work. The instrument is fully described by **Royal Museums Greenwich**, whose object pages
answer 200 and carry a curatorial essay rather than a caption: NAV0022, the Greenwich (Valentia)
astrolabe, gives the date it came into use, why the disc is cut away and weighted, how it was sighted by
night and by day, where it was found in 1845, and the reading that its blank scale means it was never
finished. **Search the museum before the library**; B1d's three failures were all attempts to read a book.
· **A SECOND RECORD OF THE SAME COLLECTION IS THE CHEAPEST THIRD WORK THERE IS, and here it is the best
  sentence in the plate.** NAV0026 is an electrotype copy of NAV0022 cast in 1981 **for Mike Richey to
  evaluate the instrument at sea on a transatlantic voyage in *Jester***, which pairs exactly with John
  Davis's judgement of 1595 that the astrolabe and quadrant are "very vncertaine for Sea observations" —
  four hundred years between a navigator's complaint and somebody going out to test it.
· **AN IMAGE `src` PATH MUST BE READ FROM THE API AND NEVER COMPOSED.** Commons stores a file under two
  hash directories derived from the name, and a plausible-looking guess (`/commons/8/85/…` for a file that
  lives at `/commons/4/4f/…`) returns **404**. Nothing in the pipeline catches it: `add-artefacts.js`
  checks that a `src` has a `credit`, and in the browser the delegated `error` listener quietly marks the
  figure `.media-dead` and shows a reader nothing at all. Take the `url` field from
  `prop=imageinfo&iiprop=url`. **A sweep of the finished file is NOT the check** — `upload.wikimedia.org`
  answers **429** to a run of requests from here, so a 429 says nothing either way.
· **THE TWO FIRST WORLD WAR ARTEFACTS ARE DEFERRED AND THE REASON IS A WALL OF 403s.** `trench-art-shell-case`
  and `identity-disc` need a collection that describes what it holds, and of the obvious ones only the
  **Canadian War Museum** and the **National Army Museum** answer at all: `iwm.org.uk` is 403 (as the
  plan already recorded), `aucklandmuseum.com` 403, `collection.sciencemuseumgroup.org.uk` 403, and the
  Australian War Memorial's collection search is a 404 on the path its own pages use. The scholarship is
  worse: Saunders's *Trench Art* is Routledge, and the one open article DOAJ returns —
  *Museum & Society*'s "Contested Objects: Curating Soldier Art" — is about **Victorian military
  patchwork**, which is a deliberate widening of the term rather than a source for a shell case. Commons
  has good public-domain photographs of both (a 16th (Irish) Division vase engraved HULLUCH · LOOS ·
  GUILLEMONT · GINCHY among them); it is the words that are missing, which is the opposite of
  `glass-bangle`'s problem and worth remembering when picking the next batch.

**A3c'S FINDING IS THE LIMIT OF E2d'S RULE: SEARCH THE MUSEUM FIRST — UNLESS THE MUSEUM IS UNREACHABLE,
AND FOR THIS OBJECT IT IS.** The Pazyryk carpet is in the **Hermitage**, and `hermitagemuseum.org` does not
answer at all from here (a refused connection on `www`, bare and `http` alike — not a 403, not a wall,
nothing), so the one collection that could describe it is out. What carried the plate instead was the
scientific literature, found the way B2d found its own: two calls to `doaj.org/api` and one to Crossref.
**`nature.com` serves Scientific Reports in full to `curl -L` with a browser user-agent**, exactly as C1b
recorded for Springer, so Späth et al. 2021 supplies the size, the knot count, the date, the ice lens and
the finding that the fermentation dyeing it shows is two thousand years older than the technique had been
traced.
· **THE RUSSIAN OPEN-ACCESS ARCHAEOLOGY JOURNALS ANSWER, AND THEY ARE WHERE THIS SUBJECT LIVES.**
  `archaeologie.pro` (*Povolzhskaya Arkheologiya*, CC BY-SA) and `journal.archaeology.nsc.ru`
  (*Archaeology, Ethnology & Anthropology of Eurasia*) both serve full articles; `elibrary.ru` is 403.
  Tsareva's paper on the fifth Pazyryk kurgan's imported Syrian and Egyptian textiles is the second work
  and is the one that puts the carpet in a tomb full of cloth from the far west of the Persian empire —
  a context no museum caption would have given.
· **A SOURCE CAN BE WRONG ABOUT A DATE THE PLATE DOES NOT NEED.** Späth et al. say the carpet was found
  "by Russian archaeologists in 1947"; the excavation of the fifth Pazyryk barrow is conventionally dated
  1949. The plate names no discovery year — everything else in that paper is measurement — and the point
  is general: **where an open source's one weak fact is also the one the plate can do without, drop the
  fact rather than the source.**
· **CROSSREF'S YEAR FOR A JOURNAL THAT DEPOSITS LATE IS THE DEPOSIT YEAR, AND THE BY-EYE TIER IS DOING ITS
  JOB.** `check-citations.js` reports Polosmak's "The Pazyryk Style" as 2022 against the citation's 2021;
  the journal's own page reads "Vol 49, No 4 (2021)" and the DOI string carries 2021. No correction, and
  no `CROSSREF_YEAR_WRONG` row — this is precisely the case that rule already covers.
· **THREE MORE COLLECTIONS PROBED AND ALL THREE FAILED DIFFERENTLY, which is worth recording because each
  looked promising.** The **London Museum** answers and its medieval leather shoes carry real descriptions
  (cordwainers, poulaines, the No. 1 Poultry drawstring shoe) — **but it uses the word "turnshoe" only of
  19th-century boots**, so `turnshoe` still has no source for the construction that defines it, and the
  open leather literature is about species identification rather than sewing (the Borgund ZooMS paper
  contains no "turned" at all). **Te Papa** answers with a Next.js shell: a search page whose results are
  not in the HTML, so nothing can be grepped — a seventh variety of content-free 200. And **Cleveland has
  six Ban Chiang jars and not one description**, which is C3c's rule biting the other way: a record with
  only fields is a caption, and the museum that carried three plates this week cannot carry this one.

**B1e'S FINDING IS THAT A DEFERRAL CAN OUTLIVE ITS OWN REASON.** `nbpw-sherd` was deferred twice on the
same fact — that its one open work is in *Ancient Asia*, whose old DOIs 404 and whose new host serves an
empty 200 — and that fact is true and was never the point. Northern Black Polished Ware is covered by
**two journals that are wholly open and were not looked at**: *Asian Perspectives*, whose back issues sit
in **ScholarSpace** at the University of Hawai'i, and **`currentscience.ac.in`**, which serves every issue
as a free PDF. Between them they carry the dating, the distribution, the forerunner argument, the British
Museum laboratory's reading of the surface and the elemental work — three works, no gaps. **When a
deferral names one unreachable journal, the question is not whether that journal has reopened.**
· **SCHOLARSPACE IS A DSPACE 7 AND ITS REST API IS THE WAY IN, NOT ITS SEARCH PAGE.**
  `/server/api/discover/search/objects?query=` returns JSON hits, `/server/api/core/items/<uuid>` gives
  the handle and metadata, and `/server/api/core/items/<uuid>/bundles` → bitstreams gives the PDF. Cite
  the **handle** (`https://hdl.handle.net/10125/…`), which is the persistent address; the article's own
  DOI is a Project MUSE one and MUSE is shut here.
· **A JOURNAL PDF THAT EXTRACTS AS ONE LETTER PER TOKEN IS STILL READABLE.** Both *Current Science* and
  the *Asian Perspectives* offprint come out of the zlib-stream extractor with a space between almost
  every character; `re.sub(r'(?<=\S) (?=\S)', '', text)` puts them back and the prose is then greppable.
  **Do not write a PDF off on the first look at its extraction** — that is a different failure from the
  subset-font case (Szabó 2010, Vovin 2026, and the *Yoruba Studies Review* PDF met in this same batch),
  where the bytes are not letters at all and nothing can be recovered.
· **`link.springer.com` SERVES A "CLIENT CHALLENGE" WITH A 200 — AN EIGHTH VARIETY.** C1b's rule that
  Springer answers `curl -L` with a browser user-agent holds for **nature.com**, which is where the
  BMC and SpringerOpen journals live (*Heritage Science*, *Scientific Reports*); it does **not** hold for
  `link.springer.com`, which is where *African Archaeological Review* and *Archaeologies* are. That is
  what stops `igbo-ukwu-bronze`: the modern metallography of Igbo Isaiah is there, and the only other
  openable work DOAJ finds is a conference abstract whose PDF link returns XML.
· **`ife-head` HAS ONE MAGNIFICENT SOURCE AND NO SECOND, AND THE ONE IS THE PROBLEM.** Frobenius's
  *The Voice of Africa* (1913) is open on archive.org and describes the Olokun head being lifted out of a
  sack in the grove at Ife in his own words — followed immediately by his declaration that it is "Atlantic
  Africa's Poseidon", a "remnant of the erstwhile Lord and Ruler of the Empire of Atlantis", and by his
  contempt for the "degenerate and feeble-minded posterity" who kept it. **A plate resting on that alone
  would be reporting a racist misattribution with nothing beside it to answer with**, and the answers are
  all shut: the British Museum 403, the Smithsonian 403, both OpenEdition articles on the Ita Yemoo
  excavations behind the Anubis wall, *Yoruba Studies Review*'s PDFs subset-encoded, and neither Cleveland
  nor the Met holds an Ife head. It waits for a second work, not for a better first one.

**B4c EMPTIES SOUTHEAST ASIA'S LIST, AND BOTH ITS ARTEFACTS WERE DEFERRED ON STATEMENTS THAT WERE
SIMPLY UNTRUE.** B4b recorded that "no openable work uses the term" *Sumatralith*; Soejono's 1971 survey
in *Asian Perspectives* uses it four times and defines it outright — "flat monofacial-worked pebbles with
elongated oval shapes" — and Li et al. 2021, in the same journal, build an entire operational sequence
around it. B4a recorded that "nothing openable is about the painted pottery itself"; van Esterik's 1973
analysis of Ban Chiang painted pottery is in the same journal too. **One archive answered both, and it is
the one B1e found the day before**: *Asian Perspectives* on ScholarSpace covers the whole Asia-Pacific,
runs from 1957 to now, and is free. Three deferrals in two batches have now been cleared by a source that
was always there. **When a batch fails, record what was searched, not only what was missing.**
· **THE JOURNAL'S OWN CITATION STRING WINS, AND SCHOLARSPACE OFTEN CARRIES IT.** For older *Asian
  Perspectives* issues the printed running head, the `dc.date.issued` field and the `dc.identifier.citation`
  string can give three different years — Soejono's paper runs its head as "XII, 1969", is issued as 1971,
  and is cited by the journal as "Asian Perspectives 12 (1): 69–91" of 1971 — because the journal ran years
  behind. Use `dc.identifier.citation` where the record has one (Soejono, Bronson and Asmar) and the
  printed running head where it does not (van Esterik, Folan and Hyde, Higham). It is the MedCrave rule
  already in this plan: read the how-to-cite block, not the generated metadata.
· **A DEFERRED ARTEFACT'S PLATE CAN BE BETTER THAN AN EASY ONE'S, because the reason it was hard is
  usually the story.** Ban Chiang's pots surfaced in the late 1960s beside an American military base, and
  the publicity brought looting heavy enough to put vessels on the New York and London art markets;
  thermoluminescence then returned a date of about 7,000 years ago, the excavators put the first bronze at
  about 3600 BCE, and *Time* ran it as "Turning the Clock Back". None of that survives, and what replaced
  it is **still contested** — the site's excavator puts the first bronze between about 2100 and 1500 BCE
  and Higham's Bayesian analysis of 54 bone-collagen dates puts it about 1000 BCE. The plate gives both,
  named, which is the plan's own rule about a contested figure and not a hedge.
· **THE PICTURE CHOICE IS EDITORIAL WHERE THE PLATE IS ABOUT LOOTING.** Commons offers good CC0
  photographs of Ban Chiang pots in LACMA, the Met and Honolulu; what shipped is a CC BY-SA photograph of
  a jar in the **National Museum, Bangkok**. A plate whose second sentence is about vessels leaving
  Thailand should not illustrate itself with one that left. The LACMA record also dates its pot to the
  "3rd millennium B.C.", which is the chronology the plate's own sources overturned.

**B1f IS THE FIRST ARTEFACT OF THIS PASS TO SHIP WITH NO PICTURE, AND THAT IS THE FINDING.** B1d recorded
`glass-bangle` as having "the sources and no picture"; the first half was wrong — it had ONE source — and
the second half has now been tested three times. *Asian Perspectives* supplies the two works Marshall could
not: Kanungo's 2004 survey of glass across India, and Lankton's review of the Kopia excavation, which is
where the plate's best fact comes from — **a solid glass rod is what tells an excavator that bangles were
MADE on a site, because a bangle is worked from a rod where a bead is worked from a tube.** But Commons
still holds no photograph of an ancient South Asian glass bangle: searches on the object, on Taxila, on
Sirkap and on the Taxila Museum return Victorian travel books and Cleveland's Gandharan metalwork. **Five
of the first hundred artefacts already ship without one** (`sipan-ear-ornaments`, `harappan-toy-cart`,
`ochre-crayon`, `sickle-blade`, `thule-harpoon-head`), so the plate renders correctly; the rule that an
artefact ships with a picture **or with a stated reason** is what this is, and the reason is stated here
rather than left looking like an oversight.
· **A FIGURE IN A 1951 EXCAVATION REPORT IS IN INCHES, AND THE HOUSE RULE IS METRIC FIRST.** Marshall gives
  the commonest Sirkap ring as "1·2 to 2·35 in. in diameter, about 0·35 in. in width"; the plate leads with
  30 to 60 mm and 9 mm and puts the inches in brackets, which is the units rule read the way round it is
  actually written rather than copied from the source.
· **`doaj.org` WAS DOWN FOR THIS BATCH — a 502 on every query, including the API root.** It has been the
  first move for three batches running, so it is worth writing down that the fallbacks work: **ScholarSpace's
  DSpace search covers the whole Asia-Pacific**, and Crossref's `query.bibliographic` covers everything, with
  the resolution test done afterwards. Two subjects were carried entirely on those.
· **A LEAD LEFT WARM FOR `jade-burial-suit`.** Margarete Prüch's review of Allison Miller's *Kingly
  Splendor* (*Asian Perspectives* 61, no. 1, 2022, handle `10125/108254`) carries a real argument about the
  object: Miller holds that the jade suit was **not** the natural development of a Neolithic tradition of
  jade in burial, but a form that became popular in a particular historical moment, when Western Han trade
  and technology made high-quality jade reachable. That is one work of three; the other two were not found
  in this batch, and neither `link.springer.com`'s chapters nor MDPI's *Religions* can supply them.
· **THE MEDIEVAL DEFERRALS LOST ANOTHER ROUTE.** Jessop's "A New Artefact Typology for the Study of
  Medieval Arrowheads" — the work `bodkin-arrowhead` actually needs — is in *Medieval Archaeology* and so
  on Taylor & Francis, which is 403; the **Archaeology Data Service** answers on its root and **403s on
  every `library/` path**; and `intarch.ac.uk` answers but exposes no issue index or search that can be
  fetched. The London Museum record naming "London Museum type 7" remains the only work in hand.

**S1 SHIPPED NOTHING, AND ITS FINDING IS THE MOST DANGEROUS 200 THIS PASS HAS MET.**
**`archive.org` SERVES ITS HTML DETAILS PAGE, WITH A 200, AT `download/<id>/<id>_djvu.txt` FOR AN ITEM
THAT HAS NO TEXT LAYER.** That matters more here than anywhere else a content-free 200 has turned up,
because the method for a scanned book is to download that file and grep it: the grep returns zero, and
zero reads as **"the book does not mention the subject"** when in fact no book was downloaded. Two of this
batch's downloads were that page — the 1911 *Field Service Pocket Book* and *Casualties and Medical
Statistics of the Great War* — and both came back as byte-identical HTML of 137,595 bytes under different
identifiers, which is what gave it away. **Check the first bytes for `<!DOCTYPE html>` before grepping a
`_djvu.txt`, and treat a suspiciously round or repeated file size as the signature.** It also puts a
question mark over every earlier "the scan yields zero hits" note.
· **AND THE ONE THAT MATTERED MOST WAS RE-TESTED AND STANDS.** B1d deferred `mariners-astrolabe` partly
  because "the archive.org scan of Cortés's *Arte of Nauigation* (1589) yields zero hits for 'astrolab'"
  and the same for Wright's *Certaine Errors*. Both were downloaded again: real text files of 369 KB and
  922 KB, no HTML, and genuinely **zero** occurrences. The blackletter OCR really is useless, and that
  finding is now measured rather than assumed.
· **ALL THREE OPEN-ACCESS AGGREGATORS WERE DOWN OR WALLED ON THE SAME DAY.** `doaj.org` returned **502**
  on every query including the API root (second batch running); **`api.openalex.org` now BILLS PER
  REQUEST** and answers 429 with a price attached — *"This request costs $0.001 but you only have $0
  remaining"* — which is a new kind of wall and not a rate limit that waiting fixes;
  `api.semanticscholar.org` 429s without a key; and `api.core.ac.uk` answered the first query and
  rate-limited after it. **Crossref's `query.bibliographic`, ScholarSpace's DSpace API and archive.org
  carried everything**, and are the three to reach for first.
· **`identity-disc` HAS ITS FIRST WORK AND IT IS A GOOD ONE.** The *Field Service Pocket Book, 1914*
  (archive.org `b28998558`, a real 768 KB scan) lists **"Disc, identity, with cord"** in the field-kit
  tables for mounted officers, dismounted officers and mounted men, at a quarter of an ounce — the disc as
  an issued item, priced into the weight a man carried. That is E2a's rule again: an official manual is a
  better source for an everyday object than a modern paper. What is still missing is the 1916 change to
  two discs; the Canadian official medical history is a real 860 KB scan containing the phrase **zero**
  times, `cwgc.org` is 403, and both Fromelles papers are behind Intellect and the OpenEdition wall —
  which is on **`books.openedition.org` as well as `journals.`**, tested this batch.
· **`turnshoe` LOST TWO MORE ROUTES.** The *Encyclopedia of Medieval Dress and Textiles* has a "Turnshoe"
  entry, and it is Brill — 403, and barred as an encyclopedia by the pass's own rule in any case. And the
  shoe-trade literature, which E2a's rule would predict, does not describe the construction: *Modern
  Shoemaking* (1916) uses "turned shoes" exactly once, in an advertisement for a Louis-heel slipper, and
  *Shoes and Shoemaking Illustrated* (1897) not at all. The London Museum's two records — a 13th-century
  ankle-shoe and a Regency boot described as "Turnshoe construction" — remain the only works in hand.

**C2b's finding is that a BLOCKED LINE CAN BE ANSWERED BY A DIFFERENT OBJECT, and that the plan is
allowed to say so.** `igbo-ukwu-bronze` had been deferred three times (B2a, B1e, and again here) for one
reason each time: the metallography of Igbo Isaiah is on `link.springer.com`, which serves a "Client
Challenge" with a 200 status, and the second and third works are behind the same wall or on
`journals.openedition.org`, which is back behind Anubis. A fourth search found nothing new. What it did
find is that the OBJECT the line stands for — a West African copper-alloy casting, made by people who
were importing their metal — is served just as well, and with three openable works, by a **Benin bronze
plaque**. CLAUDE.md's rule for the card plans applies here word for word: *a plan line is a subject to
research, not a fact to assert; rename, split or drop a line when the research says so, in the same
commit.* So the line is struck rather than deferred a fourth time, and the region keeps its
representation. **`ife-head` stays on the list** — it is a different thing (a naturalistic royal head,
not a relief), and dropping both would have thinned West Africa rather than substituted within it.

**Its second finding is the one that made the substitution worth making rather than merely possible: the
plaque carries a CORRECTION.** Skowronek et al. 2023 ran ICP-MS and lead isotopes on manillas raised from
16th–19th-century shipwrecks and identify **Germany** as the principal source of the brass traded into
West Africa between the 15th century and the 18th, the rings cast in the Rhineland between Cologne and
Aachen on local calamine and lead. The metal of the Benin bronzes is not Nigerian, and the plate says so
— which is A1's rule about a legendary's third work (look for the correction) paying out on an epic. It
also **cross-references the pool's existing `manilla`**, so the two artefacts now explain each other: one
is the currency, the other is what the currency was melted into.

**Third: a museum record can carry the provenance a paper will not.** The Cleveland Museum of Art's two
plaque records handle 1897 directly and without euphemism — 1999.1's says the number inked at the bottom
left corner is the British Museum's, "It entered their collection in 1898, one year after British troops
took it from a palace storeroom during the Siege of Benin" — and that sentence is visible IN the
photograph the plate ships. 1953.425 carries the technical half (modelled in wax, moulds pushing out the
general shapes with detail added by hand, the quatrefoil *ebe-amẹn* 'river leaves' identified with
Olókun, and the bent sides that fixed the plate to a palace beam). Two records from one museum, both open,
both specific: **B1d's "search the museum before the library" rule at full strength.**

**And an access finding, which is why the fourth Igbo-Ukwu search failed: Persée serves only PAGE ONE.**
`persee.fr` answers 200 and really does hold the French archaeology journals, so it reads as a way in —
but an article's page returns the first page of text and nothing else, `docAsPDF` is 403, and
`?pageId=N` hands back the same landing text rather than page N. **A host that answers with the opening
of the article is not a host that answers**, and the failure looks like a short article rather than a
paywall. Recorded so the next batch does not spend a search on it.

**A3d's finding is the aggregator that should have been tried nine batches ago: OpenAIRE.** The warm
lead left for `jade-burial-suit` was one work (Prüch's review of Miller in *Asian Perspectives*), and
Crossref, DOAJ and ScholarSpace between them added nothing — the subject lives in books and in
Chinese-language journals. **`api.openaire.eu/search/publications?keywords=…&format=json` answers, is
free and unmetered, and indexes REPOSITORIES rather than publishers**, which is exactly the half
Crossref cannot see: a search for *jade burial suit Han* returned five records, of which two were the
work the batch needed — a Ljubljana thesis and, decisively, **Jie Shi's University of Chicago
dissertation on the Mancheng tombs**, open, 300 pages, supervised by Wu Hung, and carrying every
measured figure the plate wanted. It is the DOAJ/Crossref pair's missing third leg, and it belongs in
the standing search order from here on. (`base-search.net` refuses this IP outright, so BASE is not the
alternative.)

**Its second finding is that a subset-font PDF is not always lost — it is often a SUBSTITUTION CIPHER,
and it can be solved.** The dissertation extracts as byte codes, the failure recorded against the
Yoruba Studies Review in B1e. But the codes are *consistent*: `:0'/0` is *which*, `:23` is *was*,
`-,23*.3` is *reasons*. Twenty guessed letters make the text readable, and the rest fall out of it.
**The digits are the part to be careful about**, because a wrong one is a plausible number rather than
a visible failure: the first solve read Liu Sheng's suit as 2,293 pieces, and the map was only pinned
by cross-checking numbers whose values are known independently — Dou Wan's tomb is stated to be *over
10% larger* than her husband's, which fixes 3,000 against 2,700 and so fixes two digits at once, and
"the Mancheng tombs, seven years later" after an excavation dated X fixes another, since Mancheng is
1968. With the map pinned the count reads **2,498**, which is the published figure. **Solve the cipher
on words, pin the digits on arithmetic, and never cite a number the arithmetic has not confirmed.**

**Third: the correction is the object's own failure.** Han writers held that gold and jade in the nine
orifices stop a corpse decaying, and the suits are the belief built at full size — and Shi records that
Dou Wan's flesh and bones "had long vanished" before the excavation, leaving the jade holding the shape
of a body no longer in it. Beside that, **Laufer's 1912 Field Museum catalogue supplies the
historiography for nothing**: he knew the practice from texts alone and had to write that of these jade
cases "none has as yet come to light", fifty-six years before one was lifted out of Mancheng. That is
batch 25's rule again — the early-20th-century institutional monograph — used not for a fact but for a
DATE at which the fact was still unknown.

**And a note on the rarity: this is a `rare`, not an epic, and the budget decided it.** A jade suit is
a named-sounding thing and the instinct is to reach for epic — but the target shape is 116 / 52 / 25 / 7
and epic and legendary were already full at 25 and 7 before this batch, so the last seven slots are
four commons and three rares. The plan's own definition settles it without strain: rare is "a
distinctive class that belongs to one tradition", which a jade suit, of which several dozen have been
excavated, exactly is.

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
