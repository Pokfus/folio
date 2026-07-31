# Sources register

Every citation, once **verified**, in its final form — so a work wanted by six cards is verified once and
pasted six times, and the formatting cannot drift between them. Not shipped; not loaded by the site.

Two sections, and the line between them is the whole point of the file.

---

## VERIFIED

*Nothing yet.* A citation moves here only after someone has opened it, confirmed it says what the card
claims, and recorded where. Entry format:

```
### <short key>
<the citation exactly as it goes into `sources`, URL last, plain text>
- opened: <date> · <publisher PDF | accepted manuscript | official record>
- supports: <the claim, and the page/figure/section it is on>
- used by: wh-0xx, wh-0yy
```

---

## CANDIDATES — NOT VERIFIED, DO NOT PASTE INTO `data.js`

Bibliographic metadata gathered by **web search only** during the blocked batch-0 attempt of 2026-07-30
(see `docs/citation-plan.md`, "Pilot log"). Author, title, journal, volume, pages and DOI were each seen
in two or more independent results, so they are probably right — but **nothing here has been opened**, no
link is confirmed reachable, and no page is confirmed to support anything. This section exists to save the
next session the search step, not the verification step.

### wh-014 · Lomekwi
- Sonia Harmand et al., "3.3-Million-Year-Old Stone Tools from Lomekwi 3, West Turkana, Kenya,"
  *Nature* 521, no. 7552 (2015): 310–15, doi:10.1038/nature14464.
  Paywalled at the publisher. An open deposit appears to exist in **HAL** (`hal.science`, record
  hal-04379924) — confirm whether it is the publisher's PDF or the accepted manuscript, since that decides
  whether a page number or a section is the honest locator.
- Still needed: a source for the **contrary view**. The card ends by saying the claim is disputed, and that
  sentence needs its own citation or it is the card's opinion. Look for the published critiques of the
  LOM3 dating and of natural fracture (Domínguez-Rodrigo, Proffitt, and others).

### wh-045 · Jebel Irhoud
- Jean-Jacques Hublin et al., "New Fossils from Jebel Irhoud, Morocco and the Pan-African Origin of
  *Homo sapiens*," *Nature* 546, no. 7657 (2017): 289–92, doi:10.1038/nature22336.
  Paywalled at the publisher; full text apparently deposited in the **Kent Academic Repository**
  (`kar.kent.ac.uk/62267/`).
- Daniel Richter et al., "The Age of the Hominin Fossils from Jebel Irhoud, Morocco, and the Origins of the
  Middle Stone Age," *Nature* 546, no. 7657 (2017): 293–96, doi:10.1038/nature22335.
  This is the companion dating paper and is what the card's "about 315,000 years ago" and its
  thermoluminescence claim actually rest on — the card should cite it, not Hublin, for the date.

### wh-069 · Venus of Hohle Fels
- Nicholas J. Conard, "A Female Figurine from the Basal Aurignacian of Hohle Fels Cave in Southwestern
  Germany," *Nature* 459, no. 7244 (2009): 248–52, doi:10.1038/nature07995.
  Paywalled at the publisher; no open deposit found yet. If none exists, the fallback for the card's
  measurements and find circumstances is the **UNESCO record for the Caves and Ice Age Art in the Swabian
  Jura** (whc.unesco.org/en/list/1527/) plus its ICOMOS evaluation, which is official, paginated and open.
- Note for verification: the card gives "59.7 mm" and "33.3 g" and says "at least 35,000 years old". Check
  each against the paper — these are exactly the kind of figures that drift in retelling.

### wh-005 · Stone Age, wh-009 · Hunter-gatherer, wh-011 · Ice age
No qualifying candidate found. Search returns tertiary encyclopedias and teaching pages, which the bar
excludes. These are the pilot's actual question and it stays open. Directions worth trying with real
access:

- **wh-005** — Lubbock's *Pre-historic Times* (1865) is public domain and coins "Palaeolithic" and
  "Neolithic"; a scanned copy gives an exact page for that claim. For Thomsen and the three-age system,
  look for a peer-reviewed history-of-archaeology article rather than a textbook.
- **wh-011** — the card's framework claims (an ice age is a state not a period; the Quaternary is ongoing;
  Milankovitch cycles pace glacials but do not start ice ages) should map onto the **ICS** chart and the
  Quaternary GSSP literature, which is open and official. "Snowball Earth" and the Cryogenian have their
  own open literature.
- **wh-009** — hardest of the three. The Pacific Northwest Coast material and the "not a window into the
  deep past" point are both defensible from published ethnography and from the critical literature on
  forager analogy, but neither is a single obvious open work. May end up cited to two or three papers
  rather than one.
