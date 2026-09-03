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
| C1 Islam and Byzantium | 8 | `lustreware-bowl`, `mamluk-mosque-lamp`, `byzantine-ivory-panel`, `byzantine-silk`; `islamic-star-tile`, `glass-coin-weight`, `fustat-paper`, `byzantine-lead-seal` | `collections.louvre.fr`, the V&A API, Cleveland's open API, Dumbarton Oaks, OpenEdition — all reachable and all rich here |
| C2 Africa and the Arctic | 5 | `great-zimbabwe-bird`, `ife-head`, `thule-harpoon-head`; `ostrich-eggshell-bead`, `manilla` | archive.org (Randall-MacIver, Caton-Thompson, Thurstan Shaw), PLOS and *Scientific Reports* for isotope and provenance work, *Arctic* (open, Calgary) |
| C3 The Americas | 5 | `moche-portrait-vessel`, `mississippian-shell-gorget`, `clovis-point`; `wampum-bead`, `obsidian-blade` | *Latin American Antiquity* via Cambridge, PLOS, Europe PMC, archive.org (Squier and Davis, Moorehead) |

### Europe's everyday, and the periods the pool stops short of

| batch | n | artefacts | spine |
|---|---|---|---|
| D1 Medieval everyday | 8 | `novgorod-birch-bark-letter`; `seal-matrix`, `bone-ice-skate`, `green-glazed-jug`, `wax-tablet`, `turnshoe`, `antler-comb`, `bodkin-arrowhead` | *Internet Archaeology* (open), Persée, `tidsskrift.dk`, archive.org |
| D2 Prehistory's everyday, worldwide | 9 | `palaeolithic-bone-flute`; `antler-spearthrower`, `saddle-quern`, `sickle-blade`, `bone-fishhook`, `ochre-crayon`, `eyed-bone-needle`, `oak-coffin-textile`, `amber-bead` | PLOS, *Scientific Reports*, Europe PMC, Antiquity, Persée, archive.org (Evans) |
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
  Francis, both shut. The way in is archive.org's early monographs plus modern isotope and
  provenance work in PLOS and *Scientific Reports* — the "who has analysed it" move that rescued the
  Sipán ear ornaments.
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
