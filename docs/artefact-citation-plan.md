# Citing the artefacts

**The bar: at least three citations on every artefact's description, each ending in a URL a reader can
open, and each pointed at by a marker in the prose.** `ARTEFACT_SRC_TARGET = 3` lives in app.js beside
`SRC_TARGET` (a card's five) and `GLOSS_SRC_TARGET` (a glossary term's two), and the tooling slices it out
of that file rather than writing it down again, so the bar cannot be raised in one place and left standing
in another.

Three is between the other two for the reason those two differ from each other: an artefact description is
five sentences, where a glossary term is three and a card's background is ten.

Unlike a card's target this one is a **refusal**, not something the editor reports against. The pool is
being cited in one pass rather than backfilled over months, so there is no under-cited backlog for a chip
to describe — `add-artefacts.js` will not write a new artefact below the bar and Admin → Artefacts will not
save one.

## Where it stands

**56 of 100 artefacts are cited** (batches 1–8). `node .claude/add-artefact-sources.js` reports coverage on
every run, and `.claude/test-artefacts.js` prints it and holds everything already cited to the shape rules.

| batch | what | artefacts |
|---|---|---|
| 1 | stone and bone tools | acheulean-hand-axe, levallois-core, flint-scraper, microlith-blade, barbed-tanged-arrowhead, polished-stone-axe, bone-awl, antler-pick |
| 2 | bronze tools and pottery | bronze-flat-axe, bronze-palstave, socketed-bronze-axe, corded-ware-beaker, bell-beaker-vessel, jomon-sherd, black-glaze-skyphos, terra-sigillata-bowl, dressel-20-amphora, delftware-tile |
| 3 | Roman small finds | roman-oil-lamp, glass-unguentarium, rotary-quern, ceramic-loom-weight, spindle-whorl, roman-bow-fibula, roman-bone-hairpin, roman-bronze-ring, roman-tweezers, roman-iron-nail, caliga-hobnail, tegula-animal-print, mosaic-tessera |
| 4 | Egypt | scarab-amulet, bes-amulet, faience-shabti, book-of-the-dead-papyrus, cartonnage-mummy-mask, inscribed-ostracon |
| 5 | Mesopotamia | cuneiform-tablet, mesopotamian-clay-cone, mesopotamian-stamp-seal, lapis-cylinder-seal |
| 6 | named objects, first five | rosetta-stone, mask-of-agamemnon, mask-of-tutankhamun, code-of-hammurabi-stele, nebra-sky-disc |
| 7 | Greek and Roman arms and vessels, first four | gladius, corinthian-helmet, panathenaic-amphora, bucchero-kantharos |
| 8 | Asia, Africa and the Americas, first six | haniwa-warrior, han-bronze-mirror, maya-cylinder-vessel, benin-plaque, nok-terracotta-head, sancai-camel |

**Still to do — 44**, in the families they are most cheaply worked in:

| family | artefacts |
|---|---|
| coins | roman-aureus, roman-denarius, roman-as, greek-drachm, byzantine-follis, ban-liang-coin, kangxi-tongbao, medieval-silver-penny, cowrie-shell-money |
| medieval and later | medieval-iron-key, medieval-horseshoe, pilgrim-badge, illuminated-psalter-leaf, clay-tobacco-pipe, lead-musket-ball, pewter-spoon, bone-dice, glass-trade-bead, garnet-disc-brooch, mjolnir-pendant, ulfberht-sword |
| Greek and Roman arms and vessels | boars-tusk-helmet, cavalry-parade-mask, achaemenid-rhyton, scythian-stag-plaque, celtic-gold-torc, gold-lunula, cycladic-figurine |
| Asia, Africa and the Americas | ming-blue-and-white-vase, olmec-jade-celt, inca-gold-llama, islamic-astrolabe |
| named objects | bust-of-nefertiti, sutton-hoo-helmet, standard-of-ur, cyrus-cylinder, gundestrup-cauldron, derveni-krater, portland-vase, trundholm-sun-chariot, sanxingdui-bronze-mask, sipan-ear-ornaments, ishtar-gate-lion, oseberg-cart |

## The workflow

1. **Read the five sentences** and decide what each one actually claims. A marker goes on a sentence a
   source carries; a sentence no source carries is left unmarked rather than given a marker that points at
   something else. Not every sentence needs one.
2. **Find real works.** `.claude/`-adjacent one-liners used throughout this pass:
   · Crossref for bibliographic truth — `api.crossref.org/works?query.bibliographic=…` returns authors,
     journal, volume, pages and DOI. **Never compose a citation from what the prose sounded like**; the
     metadata comes from the record.
   · Unpaywall — `api.unpaywall.org/v2/<doi>?email=…` — for open status and an open landing page.
   · Europe PMC — `ebi.ac.uk/europepmc/webservices/rest/search` for open-access life-science-indexed
     archaeology, and `…/rest/<PMCID>/fullTextXML` to **grep the claim** before marking it.
   · Museum collection APIs: Cleveland (`openaccess-api.clevelandart.org`) and the V&A
     (`api.vam.ac.uk/v2/objects/search`) both return real records with accession numbers and URLs.
3. **Verify every URL resolves** before writing it. A guessed accession number or a guessed museum path is
   the commonest way to produce a citation that looks perfect and 404s.
4. **Write a plan** — `{ "<id>": { "sources": [...], "marks": { "1": [1], "3": [2,3] } } }` — and run
   `node .claude/mark-artefact-sources.js <plan.json> <batch.json>` to place the markers, then
   `node .claude/add-artefact-sources.js <batch.json>` to write them in. Hand-editing a 200-word HTML
   string is how a marker ends up inside a tag.
5. **Correct the prose where a source does not bear it out**, in the same pass: the plan takes an optional
   `desc`, so the correction and its markers land in one diff.

## What is reachable from this sandbox

Measured, not assumed, on 2026-08-08. This is a fact about the sandbox rather than about the works.

**Open and usable:** `doi.org` → PLOS (10.1371), Scientific Reports and Nature (10.1038), Frontiers
(10.3389), **Persée (10.3406 — an enormous open French archaeological corpus)**, OpenEdition (10.4000),
Internet Archaeology (10.11141), **Proceedings of the Society of Antiquaries of Scotland (10.9750 — open,
and rich in Roman and prehistoric small finds)**, Archaeological Textiles Review (10.7146), Cambridge Core
(10.1017), OeAW (10.1553), Estonian Journal of Archaeology (10.3176); `europepmc.org`; `archive.org`;
`perseus.tufts.edu`; `clevelandart.org`; `collections.vam.ac.uk`; `collections.louvre.fr`; `getty.edu`;
`rijksmuseum.nl`; `ashmolean.org`; `samlinger.natmus.dk`; `namuseum.gr`; `intarch.ac.uk`.

**Not reachable here** (a bot wall or a 403, which is a different fact from a paywall and must not be
recorded as one): `britishmuseum.org`, `si.edu`, `penn.museum`, `finds.org.uk` (the Portable Antiquities
Scheme — a real loss for small finds), `historicengland.org.uk`, `nms.ac.uk`, `jstor.org`,
`tandfonline.com`, `sciencedirect.com`, `onlinelibrary.wiley.com`, `link.springer.com`, `mdpi.com`,
`pnas.org`, `science.org`, `numismatics.org`, `metmuseum.org` (429; its **API** answers, but a machine
route is not what a reader should be sent to).

**Two routes worth remembering.** Where a paper sits behind a wall here, its **Europe PMC copy** usually
does not — cite `europepmc.org/article/PMC/PMC…`. And where a modern synthesis is closed, the **standard
19th- and early-20th-century monograph is open on archive.org and is often the origin of the type name**
(Evans on stone and bronze implements, Petrie on tools, weapons and objects of daily use, Walters on vases
and lamps). Use it for typology and naming; a modern date or a scientific result needs a modern source.

## Findings so far

· **A false positive is easy and a grep is cheap.** The Acheulean hand axe's "1.76 million years" was
  nearly marked to a paper whose only "1.76" is a software version number. Read the match, not the count.
· **A source can be right about the object and wrong for the sentence.** d'Errico et al. 2022 gives
  Blombos's awls as "shaped by scraping and grinding"; the artefact said "carefully ground and polished",
  and the sentence was rewritten to what the source says rather than the marker being moved.
· **Never guess an accession number.** A guessed Rijksmuseum number resolved to a lace sheet.
· **A citation must not be filler.** Three drafts of the named-object batch reached the bar by adding a work
  that had nothing to do with the object — a Louvre cuneiform tablet under the Rosetta Stone, a Greek cup
  under the Mask of Agamemnon. They were thrown away and the artefacts researched properly. Where a third
  work cannot be found, the artefact waits for the next batch rather than being padded to the bar; this is
  why `bust-of-nefertiti` and `standard-of-ur` are still on the to-do list beside their own batch-mates.
· **Coins are the thin spot.** `numismatics.org` (the ANS, and with it OCRE and CRRO) does not answer here,
  and museum coin records are patchy outside the aureus, the drachm and Qing cash. That family will need a
  different route — the Revue numismatique on Persée carries specific studies but few type overviews.
· **Unpaywall's "not OA" is about the licence, not about whether a reader can open it** — Persée reports
  closed and serves the full text.

Not part of the site.
