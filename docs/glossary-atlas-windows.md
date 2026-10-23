# Glossary Atlas windows — the analysis before anything is built (2026-10-23)

**What this is.** An owner's request, examined and costed, with nothing built yet: *"adding Atlas windows for glossary
pop-ups … no buttons in them, but allowed to move and zoom within the window; the glossary topic the only location on the
map."* The first half says how such a window would sit on what already exists; the second half is the whole glossary
(6,695 terms) sorted by how easily each term's place can be found. The analysis script is not committed (it was a one-off
read of `gloss-io.js`, `card-io.js`, `places-registry.js` and `glossary-places.js`); its rules are stated below so it can
be rebuilt in a few lines.

## 1. What the window would be

**The contract, as asked.** Inside a glossary popup (`.gloss-win`, 375 px wide on a desktop, a sheet on a phone), a map
window showing ONE place — the term's own — with its name; the reader can drag and pinch or wheel-zoom it; it carries no
buttons at all (no zoom pill, no home, no globe button). The Atlas pin that already stands in the popup's bar is a bar
button, not a window button, and can stay or go: that is the one decision the request leaves open.

**Everything it needs already exists in `atlas/atlas-embed.js`.**

* `AtlasEmbed.view(canvas, opts)` is the interaction every card window shares — one finger or the mouse drags, two fingers
  pinch, the wheel zooms about the centre, the arrow keys and `+` / `−` work when the canvas is focused — and it is pure
  canvas: the zoom buttons of a card window are the HOST's markup (`.mc-zoom .mc-btn`), which a glossary window simply
  omits. "No buttons but move and zoom" is therefore the default, not a new mode.
* The hub draws no names and no marks of its own (`atlas-embed.js`: "a window names what it marks itself"), so a window
  that draws one gold mark and one name shows the glossary topic and nothing else. A point term is drawn as the locator
  window draws its dot; a term that is a country, a province, a state, a people or a culture is drawn as a shaded FACE
  (`spec.highlights`, the selection gold `TINT_SEL`, as a map card does) — a gazetteer country row carries its face id
  (`geom`, e.g. `adm0:fra` → `f21`), and a `pol:` entity is drawn at a year the way a war window draws a side.
* A past polity needs a year: the term's `GLOSSARY_DATES` start year when it falls inside the entity's `span`, else the
  span's midpoint. A present-day country needs none.
* The fallbacks are the card windows' (`test-window-fallbacks.js`): no WebGL2 → the still Canvas 2D path (`v2-2d`, zoom
  held at 5 km/px); the bundle refused or the engine failing → for a popup, **no window at all** rather than the card
  window's plain sentence (a popup with a missing map is the popup of today).

**What is new, and small.**

1. **The data.** `atlas/data/glossary-places.js` carries registry IDS only (211 terms, 5.5 KB, lazy bundle `atlas2gloss`),
   and the hub never loads the gazetteer (592 KB), so a window cannot look a coordinate up at run time. The generator
   (`build-glossary-places.js`) would write a format 2 with, per term, the id, `at` (lon, lat), the face id where the row
   has one, and a span for a polity — about 45 bytes a term, so some 2,000 terms stay near 100 KB, still lazy. The inputs
   widen from `glossary-places-input.json` to the joins of §2 (the cards' heavy `places` and `locator`, the registry's
   names) — every rule a pure function of committed files, so `check-places.js` keeps failing when it lags.
2. **The popup.** One `<canvas>` (about 375 × 180 px; full width on the sheet) between the dates line and the
   description, mounted by the same path that mounts card windows (`startCardGlobe` → `atlas-windows.js`), with a new
   window kind beside map / locator / war: no host buttons, one mark, one name. Up to four popups on a desktop are up
   to four windows on the one context, which the hub was built for.
3. **The phone sheet.** `makeGlossSheetDraggable` takes a `pointerdown` ANYWHERE on the sheet to shift it, except on
   `GLOSS_NODRAG` (`button, a[href], input, textarea, select, .ttip, .card-img`): the canvas joins that list and gets
   `touch-action: none`, or the first pan of the map drags the sheet instead. `wireGlossDoubleTap` needs the same
   exclusion.
4. **A map over the Atlas.** A glossary popup can open on the Atlas page itself (the place popup's cards, the search):
   the Atlas's own card popup already strips the locator block (`mountCardBack`'s `noLocator`), and a glossary window
   should follow that precedent — no map in a popup over the map.
5. **Cost on first use.** The first popup with a window loads `atlas2embed` and creates the hub (topology LOD 0 from
   IndexedDB; the page's idle warm-up already creates it on a capable device, and skips cellular, save-data and light
   mode). A glossary popup opens from any card's text, so this is the first time the engine can be woken from a page
   that has no map — worth measuring with `.claude/measure-atlas-embed.js` before deciding whether a popup should wait
   for the hub or draw its text first and let the map arrive (the second is what the card page does).
6. **Tests.** A new `test-gloss-atlas-window.js` (the window mounts, no `.mc-btn` inside it, drag and wheel change
   `view()`, the sheet does not move when the map is panned, no window over the Atlas page, every fallback), plus the
   existing `test-atlas-embed.js`, `test-window-fallbacks.js`, `test-admin-editor.js` (it opens gloss popups) and
   `test-glossary-page.js`.

## 2. Which terms, and how easily each one's place is found

**The method.** Every term's title (its slug, underscores to spaces) and aliases were folded (`places-registry.js`'s
`fold`) and joined four ways, taking the first that answers:

* **A** — the term is already in `atlas/data/glossary-places.js` (a registry id).
* **B** — a card whose ANSWER is the term, or whose `locator.name` is the term, carries registry ids in its heavy `places`
  (`data-extra/`): the id NAMED for the term when there is one (`B` "named"), else the id every such card shares
  (`B` "shared" — the term lies within the card's place); two candidates farther than 25 km apart are `B?`.
* **C** — such a card has only a `locator.at` coordinate and no `places`.
* **D** — the title, an alias or the slug read as a Wikipedia title is exactly one registry row of a place kind; `D!`
  when the term's tags say it is not a place (a name clash).
* **F** — tagged a place, a people or a state, and nothing joins.

Then **what the term is** decides whether a window would show *its* location: a place (the tags `place`, `city`,
`capital`, `building`, `site`, `battle`, `region`, `state`, a fossil find…), a group (`people`, `dynasty`, `empire`,
`polity`, `culture` — a face) or an event (a battle, a war) is TOPICAL; a person, a concept or an object whose card has
a place is not — the window would show the card's place, not the glossary topic. Those are Tier 7, listed but excluded.

**The result, sorted by effort.**

| tier | how the place is found | terms | drawn as a face / a dot | effort |
|---|---|---|---|---|
| 1 | already in `glossary-places.js` | 211 | 181 / 30 | none: the generator adds the coordinate or face |
| 2 | a card answered by the term carries a registry id named for the term | 717 | 308 / 409 | none: one generator rule |
| 3 | the same, but the id is the card's place, or two candidates (`B?` 72) | 996 | 347 / 580 | a glance each; the 72 need a pick |
| 4 | a card's `locator.at` coordinate, no registry id | 318 | 0 / 318 | none to draw a dot; `migrate-places.js` for an id |
| 5 | a name match in the registry, no card | 94 | 15 / 79 | a glance each |
| 5.5 | the same, but a name clash (Cedar the lake, Copper the river) | 9 | — | reject |
| 6 | tagged a place or a people, nothing joins | 621 | — | a Wikidata lookup each (the slug IS a Wikipedia title, so the migration's title resolver can try them all; continents, hemispheres, ice sheets and most peoples will fail) |
| 7 | a person's, concept's or object's card has a place | 708 | — | excluded: not the term's own place |
| — | nothing joins and the tags name no place | 3,021 | — | not relevant |

**Reading it.** Tiers 1 and 2 are **928 terms with no research at all**, and Tier 4 adds **318 dots the window could draw
today** from a coordinate the cards already hold: about 1,250 glossary windows from a generator change alone. Tier 3's
996 are the same mechanism with a human reading the list once (a palace shown on Crete, a battle shown at its
polity's face), and the 72 `B?` rows each need one pick. Tier 6's 621 are the real cost — one Wikidata resolution
each, most of them automatic through the title resolver that `migrate-places.js` already has, and some (continents,
"Western Europe", the Arctic) honestly unplaceable: the present rule that "a term that is neither a point nor a country
shows no marker, which is honest" (`glossPlaceId`'s comment) should hold for them.

**Caveats of the join.** A card's `places` are the card's, not the term's, so Tier 3 is right in spirit (the term is
within the place) but a few will be wrong in kind — e.g. an event joined to the face of one side. Tier 2 is clean because
the id's own name is the term's. The `D` rows were not checked by hand; the 9 `D!` rows show what an unchecked name
match does. Nothing here was guessed into a data file: no file changed.

## 3. The lists

Every term of Tiers 1–7, grouped by tier, then by class and name. "place" is the registry id (or `lon,lat` for Tier 4);
"window" says whether it would be a shaded face or a dot; "cards" are the cards the join went through. The remaining
3,021 terms, not listed, are those with no join and no place-like tag.

### Tier 1 — Ready now (211)

already in `atlas/data/glossary-places.js` (a registry id); the generator only has to add the coordinate or face.

| term | class | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|---|
| Afar_Region | place | glossary-places.js | pl:q193494 | region | dot |  |
| Afghanistan | place | glossary-places.js | adm0:afg | country | face |  |
| Alaska | place | glossary-places.js | reg:1159104349 | region | dot |  |
| Albania | place | glossary-places.js | adm0:alb | country | face |  |
| Algeria | place | glossary-places.js | adm0:dza | country | face |  |
| Andorra | place | glossary-places.js | adm0:and | country | face |  |
| Angola | place | glossary-places.js | adm0:ago | country | face |  |
| Antarctica | place | glossary-places.js | adm0:ata | country | face |  |
| Argentina | place | glossary-places.js | adm0:arg | country | face |  |
| Armenia | place | glossary-places.js | adm0:arm | country | face |  |
| Australia | place | glossary-places.js | adm0:aus | country | face |  |
| Austria | place | glossary-places.js | adm0:aut | country | face |  |
| Awash_River | place | glossary-places.js | pl:q782845 | river | dot |  |
| Azerbaijan | place | glossary-places.js | adm0:aze | country | face |  |
| Bahrain | place | glossary-places.js | adm0:bhr | country | face |  |
| Bangladesh | place | glossary-places.js | adm0:bgd | country | face |  |
| Barbados | place | glossary-places.js | adm0:brb | country | face |  |
| Belarus | place | glossary-places.js | adm0:blr | country | face |  |
| Belgium | place | glossary-places.js | adm0:bel | country | face |  |
| Belize | place | glossary-places.js | adm0:blz | country | face |  |
| Benin | place | glossary-places.js | adm0:ben | country | face |  |
| Bhutan | place | glossary-places.js | adm0:btn | country | face |  |
| Blombos_Cave | place | glossary-places.js | pl:q884971 | site | dot |  |
| Bolivia | place | glossary-places.js | adm0:bol | country | face |  |
| Botswana | place | glossary-places.js | adm0:bwa | country | face |  |
| Brazil | place | glossary-places.js | adm0:bra | country | face |  |
| Brunei | place | glossary-places.js | adm0:brn | country | face |  |
| Bulgaria | place | glossary-places.js | adm0:bgr | country | face |  |
| Burkina_Faso | place | glossary-places.js | adm0:bfa | country | face |  |
| Burundi | place | glossary-places.js | adm0:bdi | country | face |  |
| Cambodia | place | glossary-places.js | adm0:khm | country | face |  |
| Cameroon | place | glossary-places.js | adm0:cmr | country | face |  |
| Canada | place | glossary-places.js | adm0:can | country | face |  |
| Cave_of_Altamira | place | glossary-places.js | pl:q133575 | site | dot |  |
| Chad | place | glossary-places.js | adm0:tcd | country | face |  |
| Chauvet_Cave | place | glossary-places.js | pl:q374096 | site | dot |  |
| Chile | place | glossary-places.js | adm0:chl | country | face |  |
| China | place | glossary-places.js | adm0:chn | country | face |  |
| Colombia | place | glossary-places.js | adm0:col | country | face |  |
| Comoros | place | glossary-places.js | adm0:com | country | face |  |
| Costa_Rica | place | glossary-places.js | adm0:cri | country | face |  |
| Croatia | place | glossary-places.js | adm0:hrv | country | face |  |
| Cuba | place | glossary-places.js | adm0:cub | country | face |  |
| Cyprus | place | glossary-places.js | adm0:cyp | country | face |  |
| Czech_Republic | place | glossary-places.js | adm0:cze | country | face |  |
| Denmark | place | glossary-places.js | adm0:dnk | country | face |  |
| Djibouti | place | glossary-places.js | adm0:dji | country | face |  |
| Dmanisi | place | glossary-places.js | pl:q261243 | city | dot |  |
| Doggerland | place | glossary-places.js | pl:q1138308 | region | dot |  |
| Dominica | place | glossary-places.js | adm0:dma | country | face |  |
| Ecuador | place | glossary-places.js | adm0:ecu | country | face |  |
| Egypt | place | glossary-places.js | adm0:egy | country | face |  |
| El_Salvador | place | glossary-places.js | adm0:slv | country | face |  |
| Eritrea | place | glossary-places.js | adm0:eri | country | face |  |
| Estonia | place | glossary-places.js | adm0:est | country | face |  |
| Eswatini | place | glossary-places.js | adm0:swz | country | face |  |
| Ethiopia | place | glossary-places.js | adm0:eth | country | face |  |
| Fennoscandia | place | glossary-places.js | pl:q604496 | region | dot |  |
| Fertile_Crescent | place | glossary-places.js | pl:q170526 | region | dot |  |
| Fiji | place | glossary-places.js | adm0:fji | country | face |  |
| Finland | place | glossary-places.js | adm0:fin | country | face |  |
| France | place | glossary-places.js | adm0:fra | country | face |  |
| Gabon | place | glossary-places.js | adm0:gab | country | face |  |
| Georgia_(country) | place | glossary-places.js | adm0:geo | country | face |  |
| Germany | place | glossary-places.js | adm0:deu | country | face |  |
| Ghana | place | glossary-places.js | adm0:gha | country | face |  |
| Gona,_Ethiopia | place | glossary-places.js | pl:q12314119 | site | dot |  |
| Great_Britain | place | glossary-places.js | reg:1159104133 | island | dot |  |
| Greece | place | glossary-places.js | adm0:grc | country | face |  |
| Greenland | place | glossary-places.js | adm0:grl | country | face |  |
| Grenada | place | glossary-places.js | adm0:grd | country | face |  |
| Guatemala | place | glossary-places.js | adm0:gtm | country | face |  |
| Guinea | place | glossary-places.js | adm0:gin | country | face |  |
| Guinea-Bissau | place | glossary-places.js | adm0:gnb | country | face |  |
| Guyana | place | glossary-places.js | adm0:guy | country | face |  |
| Hadar,_Ethiopia | place | glossary-places.js | pl:q1567353 | site | dot |  |
| Haiti | place | glossary-places.js | adm0:hti | country | face |  |
| Honduras | place | glossary-places.js | adm0:hnd | country | face |  |
| Hungary | place | glossary-places.js | adm0:hun | country | face |  |
| Iceland | place | glossary-places.js | adm0:isl | country | face |  |
| India | place | glossary-places.js | adm0:ind | country | face |  |
| Indonesia | place | glossary-places.js | adm0:idn | country | face |  |
| Iran | place | glossary-places.js | adm0:irn | country | face |  |
| Iraq | place | glossary-places.js | adm0:irq | country | face |  |
| Ireland | place | glossary-places.js | adm0:irl | country | face |  |
| Israel | place | glossary-places.js | adm0:isr | country | face |  |
| Italy | place | glossary-places.js | adm0:ita | country | face |  |
| Jamaica | place | glossary-places.js | adm0:jam | country | face |  |
| Japan | place | glossary-places.js | adm0:jpn | country | face |  |
| Johannesburg | place | glossary-places.js | city:1159151515 | capital | dot |  |
| Jordan | place | glossary-places.js | adm0:jor | country | face |  |
| Kazakhstan | place | glossary-places.js | adm0:kaz | country | face |  |
| Kenya | place | glossary-places.js | adm0:ken | country | face |  |
| Kiribati | place | glossary-places.js | adm0:kir | country | face |  |
| Kosovo | place | glossary-places.js | adm0:kos | country | face |  |
| Kuwait | place | glossary-places.js | adm0:kwt | country | face |  |
| Kyrgyzstan | place | glossary-places.js | adm0:kgz | country | face |  |
| Lake_Turkana | place | glossary-places.js | pl:q182719 | lake | dot |  |
| Laos | place | glossary-places.js | adm0:lao | country | face |  |
| Lascaux | place | glossary-places.js | pl:q172125 | site | dot |  |
| Latvia | place | glossary-places.js | adm0:lva | country | face |  |
| Le_Moustier | place | glossary-places.js | pl:q602572 | site | dot |  |
| Lebanon | place | glossary-places.js | adm0:lbn | country | face |  |
| Lesotho | place | glossary-places.js | adm0:lso | country | face |  |
| Liberia | place | glossary-places.js | adm0:lbr | country | face |  |
| Libya | place | glossary-places.js | adm0:lby | country | face |  |
| Liechtenstein | place | glossary-places.js | adm0:lie | country | face |  |
| Lithuania | place | glossary-places.js | adm0:ltu | country | face |  |
| Lomekwi | place | glossary-places.js | pl:q19833854 | site | dot |  |
| Luxembourg | place | glossary-places.js | adm0:lux | country | face |  |
| Madagascar | place | glossary-places.js | adm0:mdg | country | face |  |
| Malawi | place | glossary-places.js | adm0:mwi | country | face |  |
| Malaysia | place | glossary-places.js | adm0:mys | country | face |  |
| Maldives | place | glossary-places.js | adm0:mdv | country | face |  |
| Mali | place | glossary-places.js | adm0:mli | country | face |  |
| Malta | place | glossary-places.js | adm0:mlt | country | face |  |
| Mauritania | place | glossary-places.js | adm0:mrt | country | face |  |
| Mauritius | place | glossary-places.js | adm0:mus | country | face |  |
| Mexico | place | glossary-places.js | adm0:mex | country | face |  |
| Moldova | place | glossary-places.js | adm0:mda | country | face |  |
| Monaco | place | glossary-places.js | adm0:mco | country | face |  |
| Mongolia | place | glossary-places.js | adm0:mng | country | face |  |
| Montenegro | place | glossary-places.js | adm0:mne | country | face |  |
| Morocco | place | glossary-places.js | adm0:mar | country | face |  |
| Mozambique | place | glossary-places.js | adm0:moz | country | face |  |
| Myanmar | place | glossary-places.js | adm0:mmr | country | face |  |
| Namibia | place | glossary-places.js | adm0:nam | country | face |  |
| Nauru | place | glossary-places.js | adm0:nru | country | face |  |
| Near_East | place | glossary-places.js | pl:q48214 | region | dot |  |
| Nepal | place | glossary-places.js | adm0:npl | country | face |  |
| Netherlands | place | glossary-places.js | adm0:nld | country | face |  |
| New_Zealand | place | glossary-places.js | adm0:nzl | country | face |  |
| Nicaragua | place | glossary-places.js | adm0:nic | country | face |  |
| Niger | place | glossary-places.js | adm0:ner | country | face |  |
| Nigeria | place | glossary-places.js | adm0:nga | country | face |  |
| North_Korea | place | glossary-places.js | adm0:prk | country | face |  |
| North_Macedonia | place | glossary-places.js | adm0:mkd | country | face |  |
| Norway | place | glossary-places.js | adm0:nor | country | face |  |
| Olduvai_Gorge | place | glossary-places.js | pl:q217043 | site | dot |  |
| Oman | place | glossary-places.js | adm0:omn | country | face |  |
| Pakistan | place | glossary-places.js | adm0:pak | country | face |  |
| Palau | place | glossary-places.js | adm0:plw | country | face |  |
| Panama | place | glossary-places.js | adm0:pan | country | face |  |
| Papua_New_Guinea | place | glossary-places.js | adm0:png | country | face |  |
| Paraguay | place | glossary-places.js | adm0:pry | country | face |  |
| Peru | place | glossary-places.js | adm0:per | country | face |  |
| Philippines | place | glossary-places.js | adm0:phl | country | face |  |
| Poland | place | glossary-places.js | adm0:pol | country | face |  |
| Portugal | place | glossary-places.js | adm0:prt | country | face |  |
| Qafzeh_Cave | place | glossary-places.js | pl:q2121357 | site | dot |  |
| Qatar | place | glossary-places.js | adm0:qat | country | face |  |
| Romania | place | glossary-places.js | adm0:rou | country | face |  |
| Russia | place | glossary-places.js | adm0:rus | country | face |  |
| Rwanda | place | glossary-places.js | adm0:rwa | country | face |  |
| Sahara | place | glossary-places.js | reg:1159104337 | region | dot |  |
| Saint_Lucia | place | glossary-places.js | adm0:lca | country | face |  |
| Saint-Acheul | place | glossary-places.js | pl:q670003 | town | dot |  |
| Samoa | place | glossary-places.js | adm0:wsm | country | face |  |
| San_Marino | place | glossary-places.js | adm0:smr | country | face |  |
| São_Tomé_and_Príncipe | place | glossary-places.js | adm0:stp | country | face |  |
| Saudi_Arabia | place | glossary-places.js | adm0:sau | country | face |  |
| Senegal | place | glossary-places.js | adm0:sen | country | face |  |
| Serbia | place | glossary-places.js | adm0:srb | country | face |  |
| Seychelles | place | glossary-places.js | adm0:syc | country | face |  |
| Siberia | place | glossary-places.js | reg:1159104351 | region | dot |  |
| Sicily | place | glossary-places.js | pl:q1460 | region | dot |  |
| Sierra_Leone | place | glossary-places.js | adm0:sle | country | face |  |
| Singapore | place | glossary-places.js | adm0:sgp | country | face |  |
| Skhul_Cave | place | glossary-places.js | pl:q287341 | site | dot |  |
| Slovakia | place | glossary-places.js | adm0:svk | country | face |  |
| Slovenia | place | glossary-places.js | adm0:svn | country | face |  |
| Somalia | place | glossary-places.js | adm0:som | country | face |  |
| South_Africa | place | glossary-places.js | adm0:zaf | country | face |  |
| South_Korea | place | glossary-places.js | adm0:kor | country | face |  |
| Spain | place | glossary-places.js | adm0:esp | country | face |  |
| Sri_Lanka | place | glossary-places.js | adm0:lka | country | face |  |
| State_of_Palestine | place | glossary-places.js | adm0:psx | country | face |  |
| Sudan | place | glossary-places.js | adm0:sdn | country | face |  |
| Sulawesi | place | glossary-places.js | reg:1159103785 | island | dot |  |
| Sungir | place | glossary-places.js | pl:q1779534 | site | dot |  |
| Suriname | place | glossary-places.js | adm0:sur | country | face |  |
| Swabian_Jura | place | glossary-places.js | pl:q159589 | range | dot |  |
| Sweden | place | glossary-places.js | adm0:swe | country | face |  |
| Switzerland | place | glossary-places.js | adm0:che | country | face |  |
| Syria | place | glossary-places.js | adm0:syr | country | face |  |
| Taiwan | place | glossary-places.js | adm0:twn | country | face |  |
| Tajikistan | place | glossary-places.js | adm0:tjk | country | face |  |
| Tanzania | place | glossary-places.js | adm0:tza | country | face |  |
| Taung | place | glossary-places.js | pl:q2096879 | town | dot |  |
| Thailand | place | glossary-places.js | adm0:tha | country | face |  |
| Togo | place | glossary-places.js | adm0:tgo | country | face |  |
| Tonga | place | glossary-places.js | adm0:ton | country | face |  |
| Trinidad_and_Tobago | place | glossary-places.js | adm0:tto | country | face |  |
| Tunisia | place | glossary-places.js | adm0:tun | country | face |  |
| Turkey | place | glossary-places.js | adm0:tur | country | face |  |
| Turkmenistan | place | glossary-places.js | adm0:tkm | country | face |  |
| Tuvalu | place | glossary-places.js | adm0:tuv | country | face |  |
| Uganda | place | glossary-places.js | adm0:uga | country | face |  |
| Ukraine | place | glossary-places.js | adm0:ukr | country | face |  |
| United_Arab_Emirates | place | glossary-places.js | adm0:are | country | face |  |
| United_Kingdom | place | glossary-places.js | adm0:gbr | country | face |  |
| United_States | place | glossary-places.js | adm0:usa | country | face |  |
| Uruguay | place | glossary-places.js | adm0:ury | country | face |  |
| Uzbekistan | place | glossary-places.js | adm0:uzb | country | face |  |
| Vanuatu | place | glossary-places.js | adm0:vut | country | face |  |
| Vatican_City | place | glossary-places.js | adm0:vat | country | face |  |
| Venezuela | place | glossary-places.js | adm0:ven | country | face |  |
| Vietnam | place | glossary-places.js | adm0:vnm | country | face |  |
| Yemen | place | glossary-places.js | adm0:yem | country | face |  |
| Zambia | place | glossary-places.js | adm0:zmb | country | face |  |
| Zimbabwe | place | glossary-places.js | adm0:zwe | country | face |  |

### Tier 2 — Automatic from the cards (717)

a card answered by this term carries a registry id NAMED for the term in its heavy `places` — a generator rule, no research.

| term | class | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|---|
| Battle_of_Dyrrhachium | event | a card's places (named for the term) | city:1159144543 | town | dot | rm-361 rm-347 |
| Battle_of_Lake_Regillus | event | a card's places (named for the term) | pl:q17051922 | lake | dot | rm-099 |
| Battles_of_Khalkhin_Gol | event | a card's places (named for the term) | pl:q993299 | town | dot | ww2-101 |
| Caudine_Forks | event | a card's places (named for the term) | pl:q1357977 | site | dot | rm-154 |
| Dunkirk_evacuation | event | a card's places (named for the term) | pl:q911972 | site | dot | wh-921 |
| Marco_Polo_Bridge_Incident | event | a card's places (named for the term) | pl:q1060121 | site | dot | ww2-095 cnh-635 |
| Siege_of_Eion | event | a card's places (named for the term) | pl:q1268859 | site | dot | gr-456 gr-544 |
| Treaty_of_Tordesillas | event | a card's places (named for the term) | pl:q286004 | town | dot | wh-662 |
| Zunyi_Conference | event | a card's places (named for the term) | pl:q28994 | city | dot | cnh-611 |
| Badarian_culture | group | a card's places (named for the term) | pl:q798844 | site | dot | eg-027 |
| Etruscan_civilisation | group | a card's places (named for the term) | pol:etruscans | polity | face | rm-022 wh-337 rm-023 rm-024 +9 |
| Folsom_tradition | group | a card's places (named for the term) | pl:q1435589 | town | dot | wh-103 |
| Huns | group | a card's places (named for the term) | pol:huns | people | face | wh-589 ru-012 |
| Liangzhu_culture | group | a card's places (named for the term) | pl:q1204909 | region | dot | cnh-048 cnh-049 |
| Longshan_culture | group | a card's places (named for the term) | pol:longshan | culture | face | wh-148 cnh-050 |
| Magyars | group | a card's places (named for the term) | pol:magyars | people | face | ru-019 |
| Ming_dynasty | group | a card's places (named for the term) | pol:ming | polity | face | wh-711 cnh-503 |
| Mycenaean_Greece | group | a card's places (named for the term) | pol:mycenaean | polity | face | wh-263 gr-056 |
| Parthian_Empire | group | a card's places (named for the term) | pl:q1986139 | region | dot | rm-773 |
| Qing_dynasty | group | a card's places (named for the term) | pol:qing | polity | face | wh-716 cnh-535 |
| Shang_dynasty | group | a card's places (named for the term) | pol:shang | polity | face | wh-245 cnh-066 cnh-068 |
| Song_dynasty | group | a card's places (named for the term) | pol:song | polity | face | wh-528 cnh-421 |
| Sui_dynasty | group | a card's places (named for the term) | pol:sui | polity | face | wh-521 cnh-343 |
| Sumer | group | a card's places (named for the term) | pol:sumer | polity | face | wh-172 |
| Tang_dynasty | group | a card's places (named for the term) | pol:tang | polity | face | wh-523 cnh-355 |
| Yangshao_culture | group | a card's places (named for the term) | pol:yangshao | culture | face | wh-147 cnh-045 |
| Zagwe_dynasty | group | a card's places (named for the term) | pol:zagwe | polity | face | wh-581 |
| Abbasid_Caliphate | place | a card's places (named for the term) | pol:abbasid | polity | face | wh-469 |
| Abu_Gorab | place | a card's places (named for the term) | pl:q2038886 | site | dot | eg-120 |
| Abu_Rawash | place | a card's places (named for the term) | pl:q335278 | site | dot | eg-107 |
| Abusir | place | a card's places (named for the term) | pl:q336098 | site | dot | eg-123 eg-118 |
| Academy | place | a card's places (named for the term) | pl:q19283711 | town | dot | gr-678 gr-908 |
| Achaemenid_Empire | place | a card's places (named for the term) | pol:achaemenid | polity | face | gr-381 wh-301 |
| Acharnae | place | a card's places (named for the term) | pl:q576319 | town | dot | gr-532 |
| Acropolis | place | a card's places (named for the term) | pl:q2336187 | town | dot | gr-173 gr-986 |
| Addis_Ababa | place | a card's places (named for the term) | city:1159151549 | capital | dot | gw-510 ww2-042 |
| Adygea | place | a card's places (named for the term) | adm1:rus:ru-ad | admin1 | face | gru-073 |
| Aegean_Sea | place | a card's places (named for the term) | sea:1159117123 | sea | dot | gr-001 |
| Aegina | place | a card's places (named for the term) | pl:q191082 | island | dot | gr-196 |
| Ai-Khanoum | place | a card's places (named for the term) | pl:q857845 | site | dot | gr-782 |
| Akkadian_Empire | place | a card's places (named for the term) | pol:akkad | polity | face | wh-185 |
| Alabama | place | a card's places (named for the term) | adm1:usa:us-al | admin1 | face | geo-037 |
| Åland | place | a card's places (named for the term) | adm0:ald | country | face | gw-217 fl-217 fd-217 |
| Alba_Longa | place | a card's places (named for the term) | pl:q335070 | site | dot | rm-056 rm-063 |
| Alban_Hills | place | a card's places (named for the term) | pl:q1129380 | range | dot | rm-005 |
| Alexandria | place | a card's places (named for the term) | city:1159151349 | city | dot | gr-801 rm-766 wh-335 gr-720 +14 |
| Alexandria_Eschate | place | a card's places (named for the term) | city:1159146327 | town | dot | gr-748 |
| American_Samoa | place | a card's places (named for the term) | adm0:asm | country | face | gw-207 fl-207 fd-207 |
| Amphipolis | place | a card's places (named for the term) | pl:q217414 | site | dot | gr-542 gr-543 gr-998 |
| Amsterdam | place | a card's places (named for the term) | city:1159151519 | capital | dot | gw-572 wh-676 eep-041 |
| Angkor_Wat | place | a card's places (named for the term) | pl:q43473 | site | dot | wh-557 |
| Anguilla | place | a card's places (named for the term) | adm0:aia | country | face | gw-219 fl-219 fd-219 |
| Anhui | place | a card's places (named for the term) | adm1:chn:cn-ah | admin1 | face | gc-009 |
| Antigua_and_Barbuda | place | a card's places (named for the term) | adm0:atg | country | face | gw-197 fl-197 fd-197 |
| Antioch | place | a card's places (named for the term) | city:1159113499 | town | dot | gr-780 rm-419 rm-596 |
| Anuradhapura | place | a card's places (named for the term) | city:1159148171 | town | dot | wh-562 |
| Apennines | place | a card's places (named for the term) | pl:q1285 | range | dot | rm-002 |
| Appian_Way | place | a card's places (named for the term) | pl:q189417 | site | dot | rm-138 |
| Aqua_Marcia | place | a card's places (named for the term) | pl:q622943 | site | dot | rm-988 |
| Ara_Pacis | place | a card's places (named for the term) | pl:q623612 | site | dot | rm-403 |
| Arch_of_Constantine | place | a card's places (named for the term) | pl:q5786 | site | dot | rm-594 |
| Arch_of_Titus | place | a card's places (named for the term) | pl:q723887 | site | dot | rm-474 |
| Argos | place | a card's places (named for the term) | pl:q13533353 | site | dot | gr-195 |
| Arizona_(state) | place | a card's places (named for the term) | adm1:usa:us-az | admin1 | face | geo-025 |
| Arkansas | place | a card's places (named for the term) | adm1:usa:us-ar | admin1 | face | geo-036 |
| Arkhangelsk | place | a card's places (named for the term) | adm1:rus:ru-ark | admin1 | face | gru-550 |
| Aruba | place | a card's places (named for the term) | adm0:abw | country | face | gw-192 fl-192 fd-192 |
| Ascra | place | a card's places (named for the term) | pl:q936920 | site | dot | gr-143 |
| Ashanti_Empire | place | a card's places (named for the term) | pol:ashanti | polity | face | wh-738 |
| Assinarus | place | a card's places (named for the term) | pl:q2292234 | river | dot | gr-560 |
| Astrakhan | place | a card's places (named for the term) | adm1:rus:ru-ast | admin1 | face | gru-554 |
| Atapuerca_Mountains | place | a card's places (named for the term) | pl:q48782131 | region | dot | wh-033 |
| Athens | place | a card's places (named for the term) | city:1159151545 | capital | dot | gw-594 wh-317 gr-805 gr-838 +12 |
| Athos_canal | place | a card's places (named for the term) | pl:q974205 | river | dot | gr-416 |
| Attalid_dynasty | place | a card's places (named for the term) | pol:pergamon | polity | face | gr-789 |
| Attica | place | a card's places (named for the term) | pl:q122443 | region | dot | gr-276 |
| Auschwitz_concentration_camp | place | a card's places (named for the term) | pl:q7342 | city | dot | wh-935 |
| Austria-Hungary | place | a card's places (named for the term) | pol:austria_hungary | polity | face | wh-807 |
| Aventine_Hill | place | a card's places (named for the term) | pl:q194103 | hill | dot | rm-084 rm-449 |
| Aztec_Empire | place | a card's places (named for the term) | pol:aztec | polity | face | wh-605 |
| Babylon | place | a card's places (named for the term) | pl:q5684 | site | dot | wh-191 wh-288 gr-723 gr-747 +1 |
| Baekdudaegan | place | a card's places (named for the term) | pl:q705583 | range | dot | ko-004 |
| Baekje | place | a card's places (named for the term) | pol:baekje | polity | face | jp-054 |
| Baghdad | place | a card's places (named for the term) | city:1159151547 | capital | dot | gw-534 wh-470 wh-597 ru-068 |
| Banditaccia_necropolis | place | a card's places (named for the term) | pl:q859735 | site | dot | rm-034 |
| Bangkok | place | a card's places (named for the term) | city:1159151509 | capital | dot | gw-520 wh-864 |
| Banpo | place | a card's places (named for the term) | pl:q806929 | site | dot | cnh-046 |
| Bashkortostan | place | a card's places (named for the term) | adm1:rus:ru-ba | admin1 | face | gru-007 |
| Baths_of_Diocletian | place | a card's places (named for the term) | pl:q836108 | site | dot | rm-884 |
| Battle_of_Abritus | place | a card's places (named for the term) | pl:q331488 | site | dot | rm-556 |
| Battle_of_Berlin | place | a card's places (named for the term) | pl:q154182 | site | dot | wh-939 |
| Battle_of_Cannae | place | a card's places (named for the term) | pl:q568611 | site | dot | wh-347 rm-218 |
| Battle_of_Gaixia | place | a card's places (named for the term) | pl:q109412796 | site | dot | cnh-218 |
| Battle_of_Heraclea | place | a card's places (named for the term) | pl:q52327 | town | dot | rm-165 rm-834 |
| Battle_of_Himera | place | a card's places (named for the term) | pl:q1111219 | site | dot | gr-446 |
| Battle_of_Lade | place | a card's places (named for the term) | pl:q1799887 | island | dot | gr-396 |
| Battle_of_Midway | place | a card's places (named for the term) | pl:q47863 | region | dot | wh-931 |
| Battle_of_Raphia | place | a card's places (named for the term) | pl:q172343 | city | dot | gr-794 |
| Battle_of_Sentinum | place | a card's places (named for the term) | pl:q683244 | site | dot | rm-157 |
| Battle_of_the_Allia | place | a card's places (named for the term) | pl:q369581 | river | dot | rm-123 |
| Battle_of_Thermopylae | place | a card's places (named for the term) | pl:q194450 | site | dot | wh-321 gr-422 rm-246 |
| Battle_of_Wuhan | place | a card's places (named for the term) | pl:q2038907 | site | dot | cnh-638 |
| Belgorod | place | a card's places (named for the term) | adm1:rus:ru-bel | admin1 | face | gru-531 |
| Belgrade | place | a card's places (named for the term) | city:1159151079 | capital | dot | gw-610 wh-981 |
| Beringia | place | a card's places (named for the term) | pl:q190927 | region | dot | wh-097 us-003 |
| Berlin | place | a card's places (named for the term) | city:1159151529 | capital | dot | gw-519 ww2-103 ww2-104 ww2-125 +10 |
| Berlin_Wall | place | a card's places (named for the term) | pl:q5086 | site | dot | wh-959 |
| Bermuda | place | a card's places (named for the term) | adm0:bmu | country | face | gw-203 fl-203 fd-203 |
| Bhimbetka_rock_shelters | place | a card's places (named for the term) | pl:q331603 | site | dot | wh-110 |
| Bir_Kiseiba | place | a card's places (named for the term) | pl:q28162746 | site | dot | eg-016 |
| Borobudur | place | a card's places (named for the term) | pl:q42798 | site | dot | wh-561 |
| Bosnia_and_Herzegovina | place | a card's places (named for the term) | adm0:bih | country | face | gw-136 fl-136 fd-136 |
| Bosporan_Kingdom | place | a card's places (named for the term) | pol:bosporus | polity | face | ru-010 |
| Bridgetown | place | a card's places (named for the term) | city:1159150339 | capital | dot | gw-681 wh-727 wh-730 |
| British_Virgin_Islands | place | a card's places (named for the term) | adm0:vgb | country | face | gw-212 fl-212 fd-212 |
| Brussels | place | a card's places (named for the term) | city:1159151465 | capital | dot | gw-582 wh-989 eep-034 |
| Bryansk | place | a card's places (named for the term) | adm1:rus:ru-bry | admin1 | face | gru-541 |
| Bucharest | place | a card's places (named for the term) | city:1159151263 | capital | dot | gw-567 gga-119 |
| Buenos_Aires | place | a card's places (named for the term) | city:1159151559 | capital | dot | gw-535 wh-858 |
| Buhen | place | a card's places (named for the term) | pl:q1002656 | site | dot | eg-193 |
| Buto | place | a card's places (named for the term) | pl:q739278 | site | dot | eg-040 |
| Byzantium | place | a card's places (named for the term) | pl:q16869 | city | dot | gr-219 |
| Caere | place | a card's places (named for the term) | pl:q2914373 | site | dot | rm-033 rm-147 |
| Cahokia | place | a card's places (named for the term) | pl:q333661 | site | dot | us-018 wh-618 |
| Cairo | place | a card's places (named for the term) | city:1159151603 | capital | dot | gw-513 wh-570 |
| Calauria | place | a card's places (named for the term) | pl:q1443132 | island | dot | gr-757 |
| California | place | a card's places (named for the term) | adm1:usa:us-ca | admin1 | face | geo-001 us-033 |
| Calleva_Atrebatum | place | a card's places (named for the term) | pl:q1027253 | site | dot | rm-781 |
| Campus_Martius | place | a card's places (named for the term) | pl:q242839 | region | dot | rm-826 rm-071 rm-073 rm-114 +9 |
| Camulodunum | place | a card's places (named for the term) | pl:q630604 | site | dot | rm-432 rm-442 |
| Cao_Wei | place | a card's places (named for the term) | pol:cao_wei | polity | face | cnh-277 |
| Cape_Sounion | place | a card's places (named for the term) | pl:q1136637 | cape | dot | gr-892 |
| Cape_Verde | place | a card's places (named for the term) | adm0:cpv | country | face | gw-174 fl-174 fd-174 |
| Capitoline_Hill | place | a card's places (named for the term) | pl:q34925 | hill | dot | rm-050 rm-076 rm-126 rm-140 |
| Capri | place | a card's places (named for the term) | pl:q173292 | island | dot | rm-425 |
| Caracas | place | a card's places (named for the term) | city:1159151493 | capital | dot | gw-553 wh-770 |
| Carthage | place | a card's places (named for the term) | pl:q6343 | site | dot | rm-181 rm-763 wh-295 rm-627 |
| Çatalhöyük | place | a card's places (named for the term) | pl:q192522 | site | dot | wh-125 |
| Cayman_Islands | place | a card's places (named for the term) | adm0:cym | country | face | gw-200 fl-200 fd-200 |
| Central_African_Republic | place | a card's places (named for the term) | adm0:caf | country | face | gw-122 fl-122 fd-122 |
| Chaco_Canyon | place | a card's places (named for the term) | pl:q49786970 | region | dot | us-023 wh-620 |
| Chalcis | place | a card's places (named for the term) | pl:q200133 | city | dot | gr-197 |
| Chang'an | place | a card's places (named for the term) | pl:q6501000 | site | dot | jp-088 wh-524 cnh-367 cnh-220 +10 |
| Chechnya | place | a card's places (named for the term) | adm1:rus:ru-ce | admin1 | face | gru-030 |
| Chelyabinsk | place | a card's places (named for the term) | adm1:rus:ru-che | admin1 | face | gru-510 |
| Chen_dynasty | place | a card's places (named for the term) | pol:chen | polity | face | cnh-329 |
| Chengdu | place | a card's places (named for the term) | city:1159151533 | city | dot | gc-505 wh-529 cnh-255 cnh-280 +6 |
| Chicago | place | a card's places (named for the term) | city:1159151491 | city | dot | geo-721 ww2-133 |
| Chichen_Itza | place | a card's places (named for the term) | pl:q5859 | site | dot | wh-603 |
| Chita | place | a card's places (named for the term) | adm1:rus:ru-zab | admin1 | face | gru-551 |
| Chola_dynasty | place | a card's places (named for the term) | pol:chola | polity | face | wh-547 |
| Chongqing | place | a card's places (named for the term) | adm1:chn:cn-cq | admin1 | face | gc-019 |
| Chu_(state) | place | a card's places (named for the term) | pol:chu | polity | face | cnh-154 |
| Chukotka_Autonomous_Okrug | place | a card's places (named for the term) | adm1:rus:ru-chu | admin1 | face | gru-082 |
| Circus_Maximus | place | a card's places (named for the term) | pl:q207808 | site | dot | rm-068 rm-428 rm-446 |
| Cloaca_Maxima | place | a card's places (named for the term) | pl:q746102 | site | dot | rm-067 |
| Colonus | place | a card's places (named for the term) | pl:q1235930 | town | dot | gr-567 |
| Colorado_(state) | place | a card's places (named for the term) | adm1:usa:us-co | admin1 | face | geo-045 |
| Colosseum | place | a card's places (named for the term) | pl:q10285 | site | dot | wh-362 rm-475 |
| Comitium | place | a card's places (named for the term) | pl:q1114895 | site | dot | rm-700 |
| Connecticut | place | a card's places (named for the term) | adm1:usa:us-ct | admin1 | face | geo-040 |
| Constantinople | place | a card's places (named for the term) | pl:q16869 | city | dot | wh-437 rm-586 ru-043 ru-044 +2 |
| Cook_Islands | place | a card's places (named for the term) | adm0:cok | country | face | gw-221 fl-221 fd-221 |
| Corinth | place | a card's places (named for the term) | pl:q1363688 | site | dot | gr-189 gr-323 gr-864 gr-935 +1 |
| Crimean_Khanate | place | a card's places (named for the term) | pol:crimean_khanate | polity | face | wh-710 |
| Croton | place | a card's places (named for the term) | pl:q13526919 | site | dot | gr-213 |
| Cumae | place | a card's places (named for the term) | pl:q243456 | site | dot | gr-215 rm-044 rm-179 gr-994 |
| Curaçao | place | a card's places (named for the term) | adm0:cuw | country | face | gw-187 fl-187 fd-187 |
| Cusco | place | a card's places (named for the term) | city:1159150611 | town | dot | wh-613 |
| Cyrene | place | a card's places (named for the term) | pl:q44112 | site | dot | gr-206 gr-777 gr-807 |
| Dadu_(Beijing) | place | a card's places (named for the term) | city:1159151595 | capital | dot | cnh-502 cnh-487 cnh-496 |
| Dagestan | place | a card's places (named for the term) | adm1:rus:ru-da | admin1 | face | gru-011 |
| Dahshur | place | a card's places (named for the term) | pl:q685414 | site | dot | eg-099 eg-101 eg-102 eg-183 +2 |
| Damascus | place | a card's places (named for the term) | city:1159151269 | capital | dot | wh-466 gw-557 |
| Dardanelles | place | a card's places (named for the term) | sea:1159119155 | strait | dot | gr-105 gr-710 |
| Delaware_(state) | place | a card's places (named for the term) | adm1:usa:us-de | admin1 | face | geo-039 |
| Delhi_Sultanate | place | a card's places (named for the term) | pol:delhi_sultanate | polity | face | wh-548 |
| Delos | place | a card's places (named for the term) | pl:q173148 | island | dot | gr-867 |
| Delphi | place | a card's places (named for the term) | pl:q75459 | site | dot | gr-164 gr-345 gr-787 gr-861 +9 |
| Democratic_Republic_of_the_Congo | place | a card's places (named for the term) | adm0:cod | country | face | gw-015 fl-015 fd-015 |
| Dendera | place | a card's places (named for the term) | pl:q29019 | site | dot | eg-154 |
| Denisova_Cave | place | a card's places (named for the term) | pl:q1029322 | site | dot | wh-039 |
| Dholavira | place | a card's places (named for the term) | pl:q9468 | site | dot | wh-236 |
| Diolkos | place | a card's places (named for the term) | pl:q1226902 | site | dot | gr-190 |
| Djibouti_(city) | place | a card's places (named for the term) | adm0:dji | country | face | gw-161 gw-661 fl-161 fd-161 |
| Dodona | place | a card's places (named for the term) | pl:q382317 | site | dot | gr-982 rm-164 gr-977 |
| Dominican_Republic | place | a card's places (named for the term) | adm0:dom | country | face | gw-085 fl-085 fd-085 |
| Domus_Aurea | place | a card's places (named for the term) | pl:q622438 | site | dot | rm-447 |
| Dreros | place | a card's places (named for the term) | pl:q5306985 | site | dot | gr-171 |
| East_Timor | place | a card's places (named for the term) | adm0:tls | country | face | gw-155 fl-155 fd-155 |
| Eastern_Desert | place | a card's places (named for the term) | reg:1159103265 | region | dot | eg-008 |
| Eastern_Han | place | a card's places (named for the term) | pl:q1147037 | region | dot | cnh-253 |
| Eastern_Wei | place | a card's places (named for the term) | pol:eastern_wei | polity | face | cnh-338 |
| Eastern_Wu | place | a card's places (named for the term) | pol:eastern_wu | polity | face | cnh-284 |
| Eboracum | place | a card's places (named for the term) | pl:q958954 | site | dot | rm-543 |
| Eion | place | a card's places (named for the term) | pl:q1268859 | site | dot | gr-544 |
| El_Lahun | place | a card's places (named for the term) | pl:q56924 | site | dot | eg-186 eg-184 eg-187 |
| Eleusis | place | a card's places (named for the term) | pl:q11918833 | site | dot | gr-991 gr-893 gr-990 |
| Elis | place | a card's places (named for the term) | pl:q1063649 | region | dot | gr-844 |
| Empire_of_Japan | place | a card's places (named for the term) | pol:japan | polity | face | ww2-081 |
| Emporion | place | a card's places (named for the term) | pl:q93335904 | site | dot | gr-217 |
| Epidamnus | place | a card's places (named for the term) | city:1159144543 | town | dot | gr-524 |
| Epidaurus | place | a card's places (named for the term) | pl:q233576 | site | dot | gr-996 gr-995 gr-997 |
| Equatorial_Guinea | place | a card's places (named for the term) | adm0:gnq | country | face | gw-150 fl-150 fd-150 |
| Erechtheion | place | a card's places (named for the term) | pl:q242741 | site | dot | gr-502 |
| Etna | place | a card's places (named for the term) | pl:q16990 | mountain | dot | gr-914 |
| Eurasian_Steppe | place | a card's places (named for the term) | pl:q77120 | region | dot | ru-001 |
| Faiyum_Oasis | place | a card's places (named for the term) | city:1159149857 | town | dot | eg-006 eg-185 |
| Falkland_Islands | place | a card's places (named for the term) | adm0:flk | country | face | gw-229 fl-229 fd-229 |
| Famen_Temple | place | a card's places (named for the term) | pl:q614916 | site | dot | cnh-387 |
| Faroe_Islands | place | a card's places (named for the term) | adm0:fro | country | face | gw-205 fl-205 fd-205 |
| Fatimid_Caliphate | place | a card's places (named for the term) | pol:fatimid | polity | face | wh-478 |
| Federated_States_of_Micronesia | place | a card's places (named for the term) | adm0:fsm | country | face | gw-191 fl-191 fd-191 |
| First_Bulgarian_Empire | place | a card's places (named for the term) | pol:bulgaria_first | polity | face | wh-449 |
| Flavian_Palace | place | a card's places (named for the term) | pl:q529806 | site | dot | rm-487 rm-489 |
| Florence | place | a card's places (named for the term) | city:1159149751 | city | dot | wh-623 wh-624 gr-880 rm-729 |
| Florida | place | a card's places (named for the term) | adm1:usa:us-fl | admin1 | face | geo-003 |
| Forbidden_City | place | a card's places (named for the term) | pl:q80290 | site | dot | wh-713 cnh-512 cnh-550 cnh-552 +1 |
| Former_Qin | place | a card's places (named for the term) | pol:former_qin | polity | face | cnh-308 |
| Former_Yan | place | a card's places (named for the term) | pol:former_yan | polity | face | cnh-307 |
| Forum_Boarium | place | a card's places (named for the term) | pl:q283650 | site | dot | rm-047 |
| Forum_of_Augustus | place | a card's places (named for the term) | pl:q770797 | site | dot | rm-402 |
| Forum_Romanum | place | a card's places (named for the term) | pl:q180212 | site | dot | rm-088 rm-984 rm-986 rm-078 +34 |
| Free_City_of_Danzig | place | a card's places (named for the term) | city:1159149707 | town | dot | ww2-130 |
| French_Polynesia | place | a card's places (named for the term) | adm0:pyf | country | face | gw-182 fl-182 fd-182 |
| Fujian | place | a card's places (named for the term) | adm1:chn:cn-fj | admin1 | face | gc-015 wh-533 |
| Gabii | place | a card's places (named for the term) | pl:q614510 | site | dot | rm-074 |
| Gallic_Empire | place | a card's places (named for the term) | pol:gallic_empire | polity | face | rm-559 |
| Gansu | place | a card's places (named for the term) | adm1:chn:cn-gs | admin1 | face | gc-022 |
| Gebel_Ramlah | place | a card's places (named for the term) | pl:q85762876 | site | dot | eg-015 |
| Gebelein | place | a card's places (named for the term) | pl:q1496830 | site | dot | eg-152 |
| Gela | place | a card's places (named for the term) | pl:q39971 | town | dot | gr-210 gr-974 |
| Ghana_Empire | place | a card's places (named for the term) | pol:ghana_empire | polity | face | wh-566 |
| Giant_Wild_Goose_Pagoda | place | a card's places (named for the term) | pl:q1047061 | site | dot | cnh-964 cnh-388 |
| Gibraltar | place | a card's places (named for the term) | adm0:gib | country | face | gw-213 fl-213 fd-213 |
| Gisr_el-Mudir | place | a card's places (named for the term) | pl:q1527638 | site | dot | eg-090 |
| Giza | place | a card's places (named for the term) | city:1159146947 | city | dot | wh-212 eg-103 eg-104 eg-105 +10 |
| Gla | place | a card's places (named for the term) | pl:q636506 | site | dot | gr-071 |
| Gnyozdovo | place | a card's places (named for the term) | pl:q13424755 | town | dot | ru-033 |
| Göbekli_Tepe | place | a card's places (named for the term) | pl:q214944 | site | dot | wh-123 |
| Golden_Horde | place | a card's places (named for the term) | pol:golden_horde | polity | face | wh-598 ru-100 |
| Goryeo | place | a card's places (named for the term) | pol:goryeo | polity | face | wh-540 |
| Gournia | place | a card's places (named for the term) | pl:q1540236 | site | dot | gr-014 |
| Great_Mosque_of_Xi'an | place | a card's places (named for the term) | pl:q820842 | site | dot | cnh-788 |
| Great_Zimbabwe | place | a card's places (named for the term) | pl:q209217 | site | dot | wh-579 |
| Green_Island,_Taiwan | place | a card's places (named for the term) | pl:q701689 | island | dot | pea-139 |
| Guam | place | a card's places (named for the term) | adm0:gum | country | face | gw-186 fl-186 fd-186 |
| Guangdong | place | a card's places (named for the term) | adm1:chn:cn-gd | admin1 | face | gc-001 |
| Guangxi | place | a card's places (named for the term) | adm1:chn:cn-gx | admin1 | face | gc-011 |
| Guangzhou | place | a card's places (named for the term) | city:1159151331 | city | dot | gc-501 wh-531 wh-719 wh-840 +1 |
| Guernsey | place | a card's places (named for the term) | adm0:ggy | country | face | gw-201 fl-201 fd-201 |
| Guizhou | place | a card's places (named for the term) | adm1:chn:cn-gz | admin1 | face | gc-017 |
| Gupta_Empire | place | a card's places (named for the term) | pol:gupta | polity | face | wh-393 |
| Hadrian's_Villa | place | a card's places (named for the term) | pl:q272777 | site | dot | rm-509 |
| Hagia_Sophia | place | a card's places (named for the term) | pl:q12506 | site | dot | wh-440 wh-688 |
| Hainan | place | a card's places (named for the term) | adm1:chn:cn-hi | admin1 | face | gc-028 |
| Hall_of_Mental_Cultivation | place | a card's places (named for the term) | pl:q5642706 | site | dot | cnh-728 cnh-551 |
| Han-Zhao | place | a card's places (named for the term) | pol:han_zhao | polity | face | cnh-305 |
| Hangzhou | place | a card's places (named for the term) | city:1159151387 | city | dot | gc-508 cnh-405 cnh-448 cnh-449 +2 |
| Hatnub | place | a card's places (named for the term) | pl:q922009 | site | dot | eg-170 |
| Havana | place | a card's places (named for the term) | city:1159151347 | capital | dot | gw-587 wh-960 |
| Hawaii | place | a card's places (named for the term) | adm1:usa:us-hi | admin1 | face | geo-006 |
| Hebei | place | a card's places (named for the term) | adm1:chn:cn-he | admin1 | face | gc-006 |
| Heilongjiang | place | a card's places (named for the term) | adm1:chn:cn-hl | admin1 | face | gc-020 |
| Helsinki | place | a card's places (named for the term) | city:1159151419 | capital | dot | gw-617 eep-043 gga-110 |
| Henan | place | a card's places (named for the term) | adm1:chn:cn-ha | admin1 | face | gc-003 |
| Heracleopolis_Magna | place | a card's places (named for the term) | pl:q249480 | site | dot | eg-141 |
| Heraion_of_Samos | place | a card's places (named for the term) | pl:q841207 | site | dot | gr-165 |
| Herculaneum | place | a card's places (named for the term) | pl:q178813 | site | dot | rm-479 |
| Hexi_Corridor | place | a card's places (named for the term) | reg:1159103735 | region | dot | cnh-231 |
| Hierakonpolis | place | a card's places (named for the term) | pl:q278988 | site | dot | eg-036 eg-030 eg-048 eg-050 |
| Hong_Kong | place | a card's places (named for the term) | adm0:hkg | country | face | gw-104 fl-104 fd-104 |
| Hubei | place | a card's places (named for the term) | adm1:chn:cn-hb | admin1 | face | gc-010 |
| Hunan | place | a card's places (named for the term) | adm1:chn:cn-hn | admin1 | face | gc-007 |
| Idaean_Cave | place | a card's places (named for the term) | pl:q935991 | site | dot | gr-055 |
| Idaho | place | a card's places (named for the term) | adm1:usa:us-id | admin1 | face | geo-012 |
| Iguvium | place | a card's places (named for the term) | pl:q3792526 | site | dot | rm-016 |
| Illinois | place | a card's places (named for the term) | adm1:usa:us-il | admin1 | face | geo-021 |
| Inca_Empire | place | a card's places (named for the term) | pol:inca | polity | face | wh-612 |
| Inchtuthil | place | a card's places (named for the term) | pl:q2309575 | site | dot | rm-486 |
| Indiana | place | a card's places (named for the term) | adm1:usa:us-in | admin1 | face | geo-032 |
| Indo-Greek_Kingdom | place | a card's places (named for the term) | pol:indo_greeks | polity | face | gr-784 wh-390 |
| Ingushetia | place | a card's places (named for the term) | adm1:rus:ru-in | admin1 | face | gru-069 |
| Inner_Mongolia | place | a card's places (named for the term) | adm1:chn:cn-nm | admin1 | face | gc-025 |
| Ionia | place | a card's places (named for the term) | pl:q620874 | region | dot | gr-200 |
| Iowa | place | a card's places (named for the term) | adm1:usa:us-ia | admin1 | face | geo-050 |
| Irkutsk | place | a card's places (named for the term) | adm1:rus:ru-irk | admin1 | face | gru-521 |
| Isfahan | place | a card's places (named for the term) | city:1159150971 | city | dot | wh-697 wh-696 |
| Isle_of_Man | place | a card's places (named for the term) | adm0:imn | country | face | gw-198 fl-198 fd-198 |
| Ivanovo | place | a card's places (named for the term) | adm1:rus:ru-iva | admin1 | face | gru-555 |
| Ivory_Coast | place | a card's places (named for the term) | adm0:civ | country | face | gw-050 fl-050 fd-050 |
| Jamestown,_Virginia | place | a card's places (named for the term) | pl:q323813 | town | dot | gw-727 wh-679 |
| Jericho | place | a card's places (named for the term) | pl:q2402267 | site | dot | wh-124 |
| Jersey | place | a card's places (named for the term) | adm0:jey | country | face | gw-195 fl-195 fd-195 |
| Jiahu | place | a card's places (named for the term) | pl:q1688860 | site | dot | cnh-044 |
| Jiangsu | place | a card's places (named for the term) | adm1:chn:cn-js | admin1 | face | gc-004 |
| Jiangxi | place | a card's places (named for the term) | adm1:chn:cn-jx | admin1 | face | gc-013 |
| Jilin | place | a card's places (named for the term) | adm1:chn:cn-jl | admin1 | face | gc-024 |
| Jin_(state) | place | a card's places (named for the term) | pol:jin_state | polity | face | cnh-153 |
| Jin_dynasty_(266–420) | place | a card's places (named for the term) | pol:western_jin | polity | face | cnh-293 |
| Jinan | place | a card's places (named for the term) | city:1159151379 | city | dot | gc-502 cnh-442 |
| Kabardino-Balkaria | place | a card's places (named for the term) | adm1:rus:ru-kb | admin1 | face | gru-056 |
| Kabul | place | a card's places (named for the term) | city:1159151561 | capital | dot | gw-536 wh-700 |
| Kaifeng | place | a card's places (named for the term) | pl:q208471 | city | dot | cnh-425 wh-532 cnh-397 cnh-398 +7 |
| Kaliningrad | place | a card's places (named for the term) | adm1:rus:ru-kgd | admin1 | face | gru-549 |
| Kaluga | place | a card's places (named for the term) | adm1:rus:ru-klu | admin1 | face | gru-548 |
| Kamakura_shogunate | place | a card's places (named for the term) | pol:kamakura | polity | face | wh-545 |
| Kamchatka_Krai | place | a card's places (named for the term) | adm1:rus:ru-kam | admin1 | face | gru-077 |
| Kanem–Bornu_Empire | place | a card's places (named for the term) | pol:kanem_bornu | polity | face | wh-573 |
| Kansas_(state) | place | a card's places (named for the term) | adm1:usa:us-ks | admin1 | face | geo-046 |
| Karnak | place | a card's places (named for the term) | pl:q522862 | site | dot | wh-228 eg-182 |
| Kazan | place | a card's places (named for the term) | adm1:rus:ru-ta | admin1 | face | gru-508 |
| Kemerovo | place | a card's places (named for the term) | adm1:rus:ru-kem | admin1 | face | gru-517 |
| Kentucky | place | a card's places (named for the term) | adm1:usa:us-ky | admin1 | face | geo-033 |
| Kerameikos | place | a card's places (named for the term) | pl:q630974 | site | dot | gr-123 gr-999 |
| Keros | place | a card's places (named for the term) | pl:q546109 | island | dot | gr-004 |
| Khabarovsk | place | a card's places (named for the term) | adm1:rus:ru-kha | admin1 | face | gru-534 |
| Khabarovsk_Krai | place | a card's places (named for the term) | adm1:rus:ru-kha | admin1 | face | gru-034 |
| Khanty-Mansi_Autonomous_Okrug | place | a card's places (named for the term) | adm1:rus:ru-khm | admin1 | face | gru-028 |
| Khanty-Mansiysk | place | a card's places (named for the term) | adm1:rus:ru-khm | admin1 | face | gru-528 |
| Kharga_Oasis | place | a card's places (named for the term) | pl:q428570 | region | dot | eg-009 |
| Khazars | place | a card's places (named for the term) | pol:khazaria | people | face | wh-592 ru-016 |
| Khmer_Empire | place | a card's places (named for the term) | pol:khmer | polity | face | wh-556 |
| Kievan_Rus' | place | a card's places (named for the term) | pol:rus | polity | face | wh-448 ru-036 |
| Kigali | place | a card's places (named for the term) | city:1159149385 | capital | dot | gw-577 wh-992 |
| Kilwa_Kisiwani | place | a card's places (named for the term) | pl:q1741475 | island | dot | wh-578 |
| Kingdom_of_Aksum | place | a card's places (named for the term) | pol:aksum | polity | face | wh-418 |
| Kingdom_of_Galicia–Volhynia | place | a card's places (named for the term) | pol:galicia_volhynia | polity | face | ru-083 |
| Kingdom_of_Georgia | place | a card's places (named for the term) | pol:georgia | polity | face | wh-454 |
| Kingdom_of_Kongo | place | a card's places (named for the term) | pol:kongo | polity | face | wh-580 |
| Kingdom_of_Kush | place | a card's places (named for the term) | pol:kush | polity | face | wh-416 |
| Kingston | place | a card's places (named for the term) | city:1159150855 | capital | dot | gw-641 wh-729 |
| Kirov,_Kirov_Oblast | place | a card's places (named for the term) | adm1:rus:ru-kir | admin1 | face | gru-542 |
| Knossos | place | a card's places (named for the term) | pl:q173527 | site | dot | gr-008 gr-010 gr-017 gr-023 +5 |
| Komi_Republic | place | a card's places (named for the term) | adm1:rus:ru-ko | admin1 | face | gru-061 |
| Kostroma | place | a card's places (named for the term) | adm1:rus:ru-kos | admin1 | face | gru-568 |
| Krasnodar | place | a card's places (named for the term) | adm1:rus:ru-kda | admin1 | face | gru-503 |
| Krasnodar_Krai | place | a card's places (named for the term) | adm1:rus:ru-kda | admin1 | face | gru-003 |
| Krasnoyarsk | place | a card's places (named for the term) | adm1:rus:ru-kya | admin1 | face | gru-515 |
| Krasnoyarsk_Krai | place | a card's places (named for the term) | adm1:rus:ru-kya | admin1 | face | gru-015 |
| Kuk_Swamp | place | a card's places (named for the term) | pl:q1165562 | site | dot | wh-155 |
| Kurgan | place | a card's places (named for the term) | adm1:rus:ru-kgn | admin1 | face | ru-007 gru-560 |
| Kursk | place | a card's places (named for the term) | adm1:rus:ru-krs | admin1 | face | gru-544 |
| Kushan_Empire | place | a card's places (named for the term) | pol:kushan | polity | face | wh-391 |
| Kyiv | place | a card's places (named for the term) | city:1159151495 | capital | dot | gw-541 ru-038 ru-041 ru-042 +13 |
| Kythera | place | a card's places (named for the term) | pl:q114571906 | site | dot | gr-049 |
| Lacedaemon | place | a card's places (named for the term) | pl:q5690 | site | dot | gr-233 |
| Laconia | place | a card's places (named for the term) | pl:q11723836 | region | dot | gr-232 |
| Lalibela | place | a card's places (named for the term) | pl:q207590 | town | dot | wh-582 |
| Lambaesis | place | a card's places (named for the term) | pl:q1309744 | site | dot | rm-507 |
| Lapis_Niger | place | a card's places (named for the term) | pl:q841388 | site | dot | rm-089 |
| Las_Médulas | place | a card's places (named for the term) | pl:q696803 | site | dot | rm-864 |
| Lavinium | place | a card's places (named for the term) | pl:q1352586 | site | dot | rm-055 |
| Lefkandi | place | a card's places (named for the term) | pl:q634655 | site | dot | gr-116 gr-117 |
| Leptis_Magna | place | a card's places (named for the term) | pl:q191504 | site | dot | rm-764 |
| Lesbos | place | a card's places (named for the term) | reg:1159102825 | island | dot | gr-356 |
| Lhasa | place | a card's places (named for the term) | city:1159150879 | town | dot | gc-531 cnh-384 cnh-548 |
| Liang_dynasty | place | a card's places (named for the term) | pol:liang | polity | face | cnh-326 |
| Liaoning | place | a card's places (named for the term) | adm1:chn:cn-ln | admin1 | face | gc-014 |
| Lima | place | a card's places (named for the term) | city:1159151511 | capital | dot | gw-548 wh-667 |
| Lingqu | place | a card's places (named for the term) | pl:q966140 | river | dot | cnh-204 |
| Lion_Gate | place | a card's places (named for the term) | pl:q1450403 | site | dot | gr-059 |
| Lipetsk | place | a card's places (named for the term) | adm1:rus:ru-lip | admin1 | face | gru-543 |
| Lisbon | place | a card's places (named for the term) | city:1159151273 | capital | dot | gw-590 wh-656 eep-047 |
| Liu_Song_dynasty | place | a card's places (named for the term) | pol:liu_song | polity | face | cnh-324 |
| Londinium | place | a card's places (named for the term) | pl:q927198 | site | dot | rm-758 |
| London | place | a card's places (named for the term) | city:1159151577 | capital | dot | gw-521 ww2-120 ww2-114 ww2-121 +11 |
| Longmen_Grottoes | place | a card's places (named for the term) | pl:q273834 | site | dot | cnh-336 |
| Lothal | place | a card's places (named for the term) | pl:q9443 | site | dot | wh-237 |
| Louisiana | place | a card's places (named for the term) | adm1:usa:us-la | admin1 | face | geo-008 |
| Lu_(state) | place | a card's places (named for the term) | pol:lu | polity | face | cnh-156 |
| Ludus_Magnus | place | a card's places (named for the term) | pl:q1232473 | site | dot | rm-869 |
| Lugdunum | place | a card's places (named for the term) | pl:q665 | site | dot | rm-760 rm-430 rm-435 rm-540 |
| Luoyang | place | a card's places (named for the term) | city:1159147063 | city | dot | cnh-256 cnh-259 cnh-260 cnh-261 +17 |
| Luxembourg_(city) | place | a card's places (named for the term) | adm0:lux | country | face | gw-168 gw-668 fl-168 fd-168 |
| Lydia | place | a card's places (named for the term) | pol:lydia | polity | face | wh-297 gr-383 |
| Maadi | place | a card's places (named for the term) | pl:q589934 | town | dot | eg-041 |
| Macau | place | a card's places (named for the term) | adm0:mac | country | face | gw-167 fl-167 fd-167 |
| Machu_Picchu | place | a card's places (named for the term) | pl:q676203 | site | dot | wh-614 |
| Madrid | place | a card's places (named for the term) | city:1159151503 | capital | dot | gw-532 ww2-112 ww2-111 wh-735 |
| Magadan | place | a card's places (named for the term) | adm1:rus:ru-mag | admin1 | face | gru-581 |
| Maine | place | a card's places (named for the term) | adm1:usa:us-me | admin1 | face | geo-009 |
| Majapahit | place | a card's places (named for the term) | pol:majapahit | polity | face | wh-555 |
| Makuria | place | a card's places (named for the term) | pol:makuria | polity | face | wh-585 |
| Malacca_Sultanate | place | a card's places (named for the term) | pol:malacca | polity | face | wh-565 |
| Mali_Empire | place | a card's places (named for the term) | pol:mali | polity | face | wh-568 |
| Malia | place | a card's places (named for the term) | pl:q1887316 | site | dot | gr-012 |
| Mamluk_Sultanate | place | a card's places (named for the term) | pol:mamluk_egypt | polity | face | wh-485 |
| Manchester_(New_Hampshire) | place | a card's places (named for the term) | city:1159149119 | city | dot | geo-741 wh-788 |
| Manila | place | a card's places (named for the term) | city:1159151525 | capital | dot | gw-514 wh-678 |
| Mantineia | place | a card's places (named for the term) | pl:q1160195 | site | dot | gr-548 |
| Maratha_Empire | place | a card's places (named for the term) | pol:maratha | polity | face | wh-707 |
| Marathon_tumuli | place | a card's places (named for the term) | pl:q17276497 | site | dot | gr-407 |
| Marshall_Islands | place | a card's places (named for the term) | adm0:mhl | country | face | gw-215 fl-215 fd-215 |
| Maryland | place | a card's places (named for the term) | adm1:usa:us-md | admin1 | face | geo-014 |
| Masada | place | a card's places (named for the term) | pl:q186312 | site | dot | rm-472 |
| Massachusetts | place | a card's places (named for the term) | adm1:usa:us-ma | admin1 | face | geo-019 |
| Massalia | place | a card's places (named for the term) | city:1159150037 | city | dot | gr-216 gr-837 |
| Maurya_Empire | place | a card's places (named for the term) | pol:maurya | polity | face | wh-383 |
| Mausoleum_of_Augustus | place | a card's places (named for the term) | pl:q770847 | site | dot | rm-404 |
| Megalopolis | place | a card's places (named for the term) | pl:q36024972 | site | dot | gr-674 gr-863 gr-865 |
| Megara_Hyblaea | place | a card's places (named for the term) | pl:q1457477 | site | dot | gr-209 |
| Mehrgarh | place | a card's places (named for the term) | pl:q242148 | site | dot | wh-150 |
| Meidum | place | a card's places (named for the term) | pl:q13444093 | site | dot | eg-100 |
| Memphis_(Egypt) | place | a card's places (named for the term) | pl:q5715 | site | dot | gr-719 gr-753 eg-070 |
| Menelaion | place | a card's places (named for the term) | pl:q23069794 | site | dot | gr-260 |
| Mesa_Verde | place | a card's places (named for the term) | pl:q49693597 | site | dot | us-025 wh-619 |
| Mesopotamia | place | a card's places (named for the term) | reg:1159104115 | region | dot | wh-171 |
| Messana | place | a card's places (named for the term) | pl:q13666 | city | dot | rm-188 |
| Mevania | place | a card's places (named for the term) | pl:q17051264 | site | dot | rm-159 |
| Mexico_City | place | a card's places (named for the term) | city:1159151587 | capital | dot | gw-511 wh-861 |
| Michigan | place | a card's places (named for the term) | adm1:usa:us-mi | admin1 | face | geo-007 |
| Midea | place | a card's places (named for the term) | pl:q502897 | site | dot | gr-070 |
| Milan | place | a card's places (named for the term) | city:1159151315 | city | dot | rm-580 |
| Miletus | place | a card's places (named for the term) | pl:q169460 | site | dot | gr-098 gr-199 gr-712 gr-397 |
| Minnesota | place | a card's places (named for the term) | adm1:usa:us-mn | admin1 | face | geo-017 |
| Minsk | place | a card's places (named for the term) | city:1159151149 | capital | dot | gw-599 gga-121 |
| Mississippi_(state) | place | a card's places (named for the term) | adm1:usa:us-ms | admin1 | face | geo-038 |
| Missouri_(state) | place | a card's places (named for the term) | adm1:usa:us-mo | admin1 | face | geo-035 |
| Mitanni | place | a card's places (named for the term) | pol:mitanni | polity | face | wh-200 |
| Mochlos | place | a card's places (named for the term) | pl:q25094151 | island | dot | gr-038 |
| Mohenjo-daro | place | a card's places (named for the term) | pl:q5725 | site | dot | wh-233 |
| Mongol_Empire | place | a card's places (named for the term) | pol:mongol | polity | face | wh-594 ru-091 |
| Montana | place | a card's places (named for the term) | adm1:usa:us-mt | admin1 | face | geo-043 |
| Monte_Testaccio | place | a card's places (named for the term) | pl:q781595 | site | dot | rm-534 |
| Monte_Verde | place | a card's places (named for the term) | pl:q975775 | site | dot | wh-099 us-008 |
| Montserrat | place | a card's places (named for the term) | adm0:msr | country | face | gw-228 fl-228 fd-228 |
| Mordovia | place | a card's places (named for the term) | adm1:rus:ru-mo | admin1 | face | gru-058 |
| Moscow | place | a card's places (named for the term) | city:1159151585 | capital | dot | gw-509 gru-001 ww2-126 ww2-127 +6 |
| Moscow_Oblast | place | a card's places (named for the term) | adm1:rus:ru-mow | admin1 | face | gru-002 |
| Mount_Ida | place | a card's places (named for the term) | pl:q1127771 | range | dot | gr-942 |
| Mount_Olympus | place | a card's places (named for the term) | pl:q80344 | mountain | dot | gr-905 |
| Mughal_Empire | place | a card's places (named for the term) | pol:mughal | polity | face | wh-699 |
| Murmansk | place | a card's places (named for the term) | adm1:rus:ru-mur | admin1 | face | gru-565 |
| Muziris | place | a card's places (named for the term) | pl:q2974112 | site | dot | rm-784 |
| Mycenae | place | a card's places (named for the term) | pl:q132564 | site | dot | gr-058 gr-945 gr-955 |
| Mycenaean_Thebes | place | a card's places (named for the term) | pl:q11225429 | site | dot | gr-069 gr-705 gr-903 gr-938 |
| Mytilene | place | a card's places (named for the term) | pl:q189059 | city | dot | gr-536 |
| Nabta_Playa | place | a card's places (named for the term) | pl:q1535226 | site | dot | wh-154 |
| Nairobi | place | a card's places (named for the term) | city:1159151597 | capital | dot | gw-526 wh-850 |
| Nanjing | place | a card's places (named for the term) | city:1159151385 | city | dot | gc-504 wh-712 cnh-285 cnh-292 +20 |
| Nanyue | place | a card's places (named for the term) | pol:nanyue | polity | face | cnh-232 |
| Naqada | place | a card's places (named for the term) | pl:q959859 | site | dot | eg-038 eg-029 |
| Naucratis | place | a card's places (named for the term) | pl:q137721 | site | dot | gr-221 |
| Naxos | place | a card's places (named for the term) | pl:q188527 | island | dot | gr-930 |
| Nebraska_(state) | place | a card's places (named for the term) | adm1:usa:us-ne | admin1 | face | geo-047 |
| Nenets_Autonomous_Okrug | place | a card's places (named for the term) | adm1:rus:ru-nen | admin1 | face | gru-083 |
| Neo-Assyrian_Empire | place | a card's places (named for the term) | pol:neo_assyria | polity | face | wh-282 |
| Neo-Babylonian_Empire | place | a card's places (named for the term) | pol:neo_babylonia | polity | face | wh-286 |
| Nevada_(state) | place | a card's places (named for the term) | adm1:usa:us-nv | admin1 | face | geo-015 |
| New_Caledonia | place | a card's places (named for the term) | adm0:ncl | country | face | gw-180 |
| New_Carthage | place | a card's places (named for the term) | pl:q2727884 | site | dot | rm-206 rm-457 |
| New_Hampshire | place | a card's places (named for the term) | adm1:usa:us-nh | admin1 | face | geo-041 |
| New_Jersey | place | a card's places (named for the term) | adm1:usa:us-nj | admin1 | face | geo-018 |
| New_Mexico | place | a card's places (named for the term) | adm1:usa:us-nm | admin1 | face | geo-026 |
| Newgrange | place | a card's places (named for the term) | pl:q339503 | site | dot | wh-143 |
| Nichoria | place | a card's places (named for the term) | pl:q1595514 | site | dot | gr-118 |
| Nile | place | a card's places (named for the term) | river:1159121589 | river | dot | eg-002 |
| Nile_Delta | place | a card's places (named for the term) | reg:1159103505 | region | dot | eg-005 |
| Nineveh | place | a card's places (named for the term) | city:1159150087 | city | dot | wh-283 |
| Ningxia | place | a card's places (named for the term) | adm1:chn:cn-nx | admin1 | face | gc-029 |
| Niue | place | a card's places (named for the term) | adm0:niu | country | face | gw-231 fl-231 fd-231 |
| Nizhny_Novgorod | place | a card's places (named for the term) | adm1:rus:ru-niz | admin1 | face | gru-513 |
| Norfolk_Island | place | a card's places (named for the term) | adm0:nfk | country | face | gw-230 fl-230 fd-230 |
| Normandy_landings | place | a card's places (named for the term) | pl:q16470 | site | dot | wh-937 |
| North_Carolina | place | a card's places (named for the term) | adm1:usa:us-nc | admin1 | face | geo-029 |
| North_Dakota | place | a card's places (named for the term) | adm1:usa:us-nd | admin1 | face | geo-049 |
| Northern_Mariana_Islands | place | a card's places (named for the term) | adm0:mnp | country | face | gw-209 fl-209 fd-209 |
| Northern_Wei | place | a card's places (named for the term) | pol:northern_wei | polity | face | cnh-330 |
| Northern_Zhou | place | a card's places (named for the term) | pol:northern_zhou | polity | face | cnh-339 |
| Novgorod_Republic | place | a card's places (named for the term) | pol:novgorod | polity | face | ru-076 |
| Novosibirsk | place | a card's places (named for the term) | adm1:rus:ru-nvs | admin1 | face | gru-516 |
| Odeon_of_Pericles | place | a card's places (named for the term) | pl:q2704249 | site | dot | gr-506 |
| Ohio | place | a card's places (named for the term) | adm1:usa:us-oh | admin1 | face | geo-020 |
| Oklahoma | place | a card's places (named for the term) | adm1:usa:us-ok | admin1 | face | geo-010 |
| Olbia | place | a card's places (named for the term) | pl:q1143233 | site | dot | gr-220 ru-009 |
| Old_Temple_of_Athena | place | a card's places (named for the term) | pl:q683988 | site | dot | gr-317 |
| Olympia | place | a card's places (named for the term) | pl:q38888 | site | dot | gr-163 geo-523 gr-342 rm-450 +3 |
| Olympia_(Washington) | place | a card's places (named for the term) | pl:q38888 | site | dot | gr-163 geo-523 gr-342 rm-450 +3 |
| Omsk | place | a card's places (named for the term) | adm1:rus:ru-oms | admin1 | face | gru-526 |
| Orchomenos | place | a card's places (named for the term) | pl:q543895 | town | dot | gr-869 |
| Oregon | place | a card's places (named for the term) | adm1:usa:us-or | admin1 | face | geo-024 |
| Orenburg | place | a card's places (named for the term) | adm1:rus:ru-ore | admin1 | face | gru-525 |
| Oryol | place | a card's places (named for the term) | adm1:rus:ru-orl | admin1 | face | gru-562 |
| Ostia_Antica | place | a card's places (named for the term) | pl:q1012797 | site | dot | rm-847 rm-065 rm-997 |
| Ottoman_Empire | place | a card's places (named for the term) | pol:ottoman | polity | face | wh-687 |
| Padua | place | a card's places (named for the term) | pl:q617 | city | dot | wh-651 |
| Pagan_Kingdom | place | a card's places (named for the term) | pol:pagan | polity | face | wh-558 |
| Palace_of_Nestor | place | a card's places (named for the term) | pl:q7263152 | city | dot | gr-068 gr-109 gr-539 gr-964 +1 |
| Palaikastro | place | a card's places (named for the term) | pl:q941860 | town | dot | gr-040 |
| Palatine_Hill | place | a card's places (named for the term) | pl:q200642 | hill | dot | rm-049 rm-429 wh-338 |
| Palmyra | place | a card's places (named for the term) | pl:q5747 | site | dot | rm-769 rm-562 |
| Palmyrene_Empire | place | a card's places (named for the term) | pol:palmyra | polity | face | rm-561 |
| Panama_Canal_Zone | place | a card's places (named for the term) | pl:q498979 | region | dot | pea-218 |
| Panionion | place | a card's places (named for the term) | pl:q1310950 | site | dot | gr-201 |
| Pannonian_Avars | place | a card's places (named for the term) | pol:avars | people | face | ru-013 |
| Pantheon,_Rome | place | a card's places (named for the term) | pl:q99309 | site | dot | rm-508 |
| Paris | place | a card's places (named for the term) | city:1159151613 | capital | dot | gw-523 wh-511 ww2-109 wh-645 +7 |
| Parthenon | place | a card's places (named for the term) | pl:q10288 | site | dot | wh-325 gr-495 |
| Pennsylvania | place | a card's places (named for the term) | adm1:usa:us-pa | admin1 | face | geo-030 |
| Penza | place | a card's places (named for the term) | adm1:rus:ru-pnz | admin1 | face | gru-535 |
| Perachora | place | a card's places (named for the term) | pl:q2973204 | town | dot | gr-166 |
| Perm_Krai | place | a card's places (named for the term) | adm1:rus:ru-per | admin1 | face | gru-018 |
| Persepolis | place | a card's places (named for the term) | pl:q129072 | site | dot | wh-302 gr-725 gr-726 |
| Petras | place | a card's places (named for the term) | pl:q3901049 | site | dot | gr-041 |
| Phaistos | place | a card's places (named for the term) | pl:q249707 | site | dot | gr-011 gr-021 |
| Philadelphia | place | a card's places (named for the term) | city:1159151243 | city | dot | geo-730 wh-753 wh-754 wh-756 |
| Philippi | place | a card's places (named for the term) | pl:q379652 | site | dot | gr-873 rm-377 |
| Piraeus | place | a card's places (named for the term) | pl:q58976 | city | dot | gr-487 |
| Pitcairn_Islands | place | a card's places (named for the term) | adm0:pcn | country | face | gw-233 fl-233 fd-233 |
| Pompeii | place | a card's places (named for the term) | pl:q43332 | site | dot | wh-365 rm-478 rm-872 rm-976 |
| Pontic-Caspian_steppe | place | a card's places (named for the term) | reg:1730073981 | region | dot | ru-002 |
| Portuguese_Empire | place | a card's places (named for the term) | pol:portuguese_empire | polity | face | wh-675 |
| Portus | place | a card's places (named for the term) | pl:q2037271 | site | dot | rm-848 |
| Potidaea | place | a card's places (named for the term) | pl:q81248 | site | dot | gr-526 |
| Potosí | place | a card's places (named for the term) | city:1159144841 | town | dot | wh-671 |
| Poverty_Point | place | a card's places (named for the term) | pl:q964745 | site | dot | wh-159 us-013 |
| Prague | place | a card's places (named for the term) | city:1159151359 | capital | dot | gw-588 ww2-122 wh-646 wh-965 |
| Praisos | place | a card's places (named for the term) | pl:q11942554 | site | dot | gr-054 |
| Primorsky_Krai | place | a card's places (named for the term) | adm1:rus:ru-pri | admin1 | face | gru-027 |
| Principality_of_Chernigov | place | a card's places (named for the term) | pol:chernigov | polity | face | ru-085 |
| Principality_of_Polotsk | place | a card's places (named for the term) | pol:polotsk | polity | face | ru-084 |
| Pseira | place | a card's places (named for the term) | pl:q473606 | island | dot | gr-039 |
| Pskov | place | a card's places (named for the term) | adm1:rus:ru-psk | admin1 | face | gru-566 |
| Ptolemaic_Egypt | place | a card's places (named for the term) | pol:ptolemaic | polity | face | gr-767 |
| Puerto_Rico | place | a card's places (named for the term) | adm0:pri | country | face | gw-135 fl-135 fd-135 |
| Pyongyang | place | a card's places (named for the term) | city:1159151303 | capital | dot | gw-556 ko-011 pea-114 pea-115 +3 |
| Pyramid_of_Djoser | place | a card's places (named for the term) | pl:q192418 | site | dot | eg-093 wh-211 |
| Qaw_el-Kebir | place | a card's places (named for the term) | pl:q548283 | town | dot | eg-157 |
| Qi_(state) | place | a card's places (named for the term) | pol:qi | polity | face | cnh-152 |
| Qin_(state) | place | a card's places (named for the term) | pol:qin | polity | face | cnh-155 |
| Qinghai | place | a card's places (named for the term) | adm1:chn:cn-qh | admin1 | face | gc-030 |
| Rashidun_Caliphate | place | a card's places (named for the term) | pol:rashidun | polity | face | wh-462 |
| Republic_of_Karelia | place | a card's places (named for the term) | adm1:rus:ru-kr | admin1 | face | gru-071 |
| Republic_of_the_Congo | place | a card's places (named for the term) | adm0:cog | country | face | gw-113 fl-113 fd-113 |
| Rhode_Island | place | a card's places (named for the term) | adm1:usa:us-ri | admin1 | face | geo-004 |
| Roman_Empire | place | a card's places (named for the term) | pl:q2277 | region | dot | wh-358 |
| Rome | place | a card's places (named for the term) | city:1159151593 | capital | dot | gw-525 rm-052 rm-053 rm-058 +65 |
| Ruijin | place | a card's places (named for the term) | pl:q1025459 | town | dot | cnh-607 |
| Ryazan | place | a card's places (named for the term) | adm1:rus:ru-rya | admin1 | face | gru-545 |
| Safavid_Empire | place | a card's places (named for the term) | pol:safavid | polity | face | wh-695 |
| Saint_Barthélemy | place | a card's places (named for the term) | adm0:blm | country | face | gw-224 fl-224 fd-224 |
| Saint_Helena | place | a card's places (named for the term) | adm0:shn | country | face | gw-227 fl-227 fd-227 |
| Saint_Kitts_and_Nevis | place | a card's places (named for the term) | adm0:kna | country | face | gw-206 fl-206 fd-206 |
| Saint_Martin | place | a card's places (named for the term) | adm0:maf | country | face | gw-218 |
| Saint_Petersburg | place | a card's places (named for the term) | city:1159151291 | city | dot | gru-004 wh-811 |
| Saint_Pierre_and_Miquelon | place | a card's places (named for the term) | adm0:spm | country | face | gw-226 fl-226 fd-226 |
| Saint_Vincent_and_the_Grenadines | place | a card's places (named for the term) | adm0:vct | country | face | gw-196 fl-196 fd-196 |
| Sakha_Republic | place | a card's places (named for the term) | adm1:rus:ru-sa | admin1 | face | gru-047 |
| Sakhalin_Oblast | place | a card's places (named for the term) | adm1:rus:ru-sak | admin1 | face | gru-075 |
| Salamis | place | a card's places (named for the term) | pl:q202422 | island | dot | gr-430 gr-950 |
| Salamis_(Cyprus) | place | a card's places (named for the term) | pl:q202422 | island | dot | gr-430 gr-950 |
| Samara | place | a card's places (named for the term) | adm1:rus:ru-sam | admin1 | face | gru-512 |
| Samnium | place | a card's places (named for the term) | pl:q463459 | region | dot | rm-013 |
| Samos | place | a card's places (named for the term) | pl:q156882 | island | dot | gr-826 |
| San_Marino_(city) | place | a card's places (named for the term) | adm0:smr | country | face | gw-216 gw-716 fl-216 fd-216 |
| Santo_Domingo | place | a card's places (named for the term) | city:1159151401 | capital | dot | gw-585 wh-673 |
| Saqqara | place | a card's places (named for the term) | pl:q192134 | site | dot | eg-066 wh-211 eg-119 eg-128 |
| Sarajevo | place | a card's places (named for the term) | city:1159151177 | capital | dot | gw-636 wh-873 |
| Sardis | place | a card's places (named for the term) | pl:q232615 | site | dot | wh-304 gr-395 |
| Sarkel | place | a card's places (named for the term) | pl:q1068190 | site | dot | ru-049 wh-592 |
| Sarmizegetusa_Regia | place | a card's places (named for the term) | pl:q739802 | site | dot | rm-496 |
| Sasanian_Empire | place | a card's places (named for the term) | pol:sasanian | polity | face | rm-553 |
| Satricum | place | a card's places (named for the term) | pl:q2137162 | site | dot | rm-017 |
| Scyros | place | a card's places (named for the term) | pl:q208566 | island | dot | gr-457 |
| Second_Battle_of_El_Alamein | place | a card's places (named for the term) | pl:q153376 | site | dot | wh-933 |
| Seleucid_Empire | place | a card's places (named for the term) | pol:seleucid | polity | face | gr-769 |
| Selinus | place | a card's places (named for the term) | pl:q952173 | site | dot | gr-211 |
| Seljuk_Empire | place | a card's places (named for the term) | pol:seljuk | polity | face | wh-483 |
| Semna_(Nubia) | place | a card's places (named for the term) | pl:q1485667 | site | dot | eg-194 |
| Sentinum | place | a card's places (named for the term) | pl:q683244 | site | dot | rm-157 |
| Seoul | place | a card's places (named for the term) | city:1159151523 | capital | dot | gw-529 ko-010 wh-725 |
| Servian_Wall | place | a card's places (named for the term) | pl:q281330 | site | dot | rm-072 |
| Shaanxi | place | a card's places (named for the term) | adm1:chn:cn-sn | admin1 | face | gc-016 |
| Shandong | place | a card's places (named for the term) | adm1:chn:cn-sd | admin1 | face | gc-002 |
| Shanghai | place | a card's places (named for the term) | city:1159151605 | city | dot | gc-023 cnh-590 cnh-636 cnh-676 |
| Shanhai_Pass | place | a card's places (named for the term) | pl:q1048381 | site | dot | cnh-722 |
| Shaoshan | place | a card's places (named for the term) | pl:q838542 | town | dot | wh-954 |
| Shenzhen | place | a card's places (named for the term) | city:1159151215 | city | dot | pea-008 wh-990 |
| Shu_Han | place | a card's places (named for the term) | pol:shu_han | polity | face | cnh-279 |
| Sichuan | place | a card's places (named for the term) | adm1:chn:cn-sc | admin1 | face | gc-005 |
| Sijilmasa | place | a card's places (named for the term) | pl:q1334331 | site | dot | wh-567 |
| Sint_Maarten | place | a card's places (named for the term) | adm0:sxm | country | face | gw-210 fl-210 fd-210 |
| Siphnian_Treasury | place | a card's places (named for the term) | pl:q1754028 | site | dot | gr-344 |
| Skara_Brae | place | a card's places (named for the term) | pl:q816437 | site | dot | wh-142 |
| Smolensk | place | a card's places (named for the term) | adm1:rus:ru-smo | admin1 | face | gru-557 |
| Solomon_Islands | place | a card's places (named for the term) | adm0:slb | country | face | gw-165 fl-165 fd-165 |
| Song_(state) | place | a card's places (named for the term) | pol:song_state | polity | face | cnh-157 |
| Songhai_Empire | place | a card's places (named for the term) | pol:songhai | polity | face | wh-572 |
| South_Carolina | place | a card's places (named for the term) | adm1:usa:us-sc | admin1 | face | geo-028 |
| South_Dakota | place | a card's places (named for the term) | adm1:usa:us-sd | admin1 | face | geo-048 |
| South_Sudan | place | a card's places (named for the term) | adm0:sds | country | face | gw-081 fl-081 fd-081 |
| Southern_Qi | place | a card's places (named for the term) | pol:southern_qi | polity | face | cnh-325 |
| Spanish_Empire | place | a card's places (named for the term) | pol:spanish_empire | polity | face | wh-674 |
| Sparta | place | a card's places (named for the term) | pl:q5690 | site | dot | gr-231 wh-316 gr-854 |
| Sphacteria | place | a card's places (named for the term) | pl:q1303524 | island | dot | gr-540 |
| Springfield_(Illinois) | place | a card's places (named for the term) | city:1159146271 | town | dot | geo-521 wh-813 |
| Srivijaya | place | a card's places (named for the term) | pol:srivijaya | polity | face | wh-554 |
| Star_Carr | place | a card's places (named for the term) | pl:q2299200 | site | dot | wh-109 |
| Staraya_Ladoga | place | a card's places (named for the term) | pl:q216794 | town | dot | ru-032 |
| Stavropol_Krai | place | a card's places (named for the term) | adm1:rus:ru-sta | admin1 | face | gru-014 |
| Stoa_Poikile | place | a card's places (named for the term) | pl:q936234 | site | dot | gr-515 |
| Stonehenge | place | a card's places (named for the term) | pl:q39671 | site | dot | wh-139 |
| Strait_of_Hormuz | place | a card's places (named for the term) | pl:q79883 | strait | dot | gga-161 |
| Susa | place | a card's places (named for the term) | pl:q180773 | site | dot | gr-724 gr-744 |
| Sybaris | place | a card's places (named for the term) | pl:q220583 | site | dot | gr-212 |
| Syracuse | place | a card's places (named for the term) | pl:q13670 | city | dot | gr-208 gr-811 gr-819 gr-821 +1 |
| Taebaek_Mountains | place | a card's places (named for the term) | pl:q562098 | range | dot | ko-003 |
| Taipei | place | a card's places (named for the term) | city:1159151567 | capital | dot | gw-560 cnh-627 pea-204 |
| Taiwan_Strait | place | a card's places (named for the term) | sea:1159116947 | strait | dot | pea-144 |
| Taiyuan | place | a card's places (named for the term) | city:1159151365 | city | dot | gc-518 cnh-356 cnh-401 cnh-410 |
| Taj_Mahal | place | a card's places (named for the term) | pl:q9141 | site | dot | wh-703 |
| Tambov | place | a card's places (named for the term) | adm1:rus:ru-tam | admin1 | face | gru-553 |
| Taras | place | a card's places (named for the term) | pl:q13498 | city | dot | gr-214 rm-163 rm-169 gr-847 +1 |
| Tarentum | place | a card's places (named for the term) | pl:q13498 | city | dot | rm-163 rm-169 gr-847 rm-933 +1 |
| Tarquinia | place | a card's places (named for the term) | pl:q179999 | town | dot | rm-032 rm-066 |
| Tatarstan | place | a card's places (named for the term) | adm1:rus:ru-ta | admin1 | face | gru-008 |
| Tehran | place | a card's places (named for the term) | city:1159151551 | capital | dot | gw-517 wh-863 wh-984 |
| Telesterion | place | a card's places (named for the term) | pl:q1819712 | site | dot | gr-507 |
| Tell_el-Farkha | place | a card's places (named for the term) | pl:q135678492 | site | dot | eg-081 |
| Tell_es-Sakan | place | a card's places (named for the term) | pl:q7697545 | site | dot | eg-042 |
| Temple_of_Apollo_Palatinus | place | a card's places (named for the term) | pl:q1236860 | site | dot | rm-401 |
| Temple_of_Athena_Nike | place | a card's places (named for the term) | pl:q384813 | site | dot | gr-504 |
| Temple_of_Castor_and_Pollux | place | a card's places (named for the term) | pl:q380530 | site | dot | rm-894 |
| Temple_of_Jupiter_Optimus_Maximus | place | a card's places (named for the term) | pl:q586468 | site | dot | rm-075 |
| Temple_of_Saturn | place | a card's places (named for the term) | pl:q746721 | site | dot | rm-912 rm-118 rm-122 rm-745 |
| Tennessee | place | a card's places (named for the term) | adm1:usa:us-tn | admin1 | face | geo-034 |
| Tenochtitlan | place | a card's places (named for the term) | pl:q13695 | city | dot | wh-606 wh-666 |
| Texas | place | a card's places (named for the term) | adm1:usa:us-tx | admin1 | face | geo-002 |
| The_Bahamas | place | a card's places (named for the term) | adm0:bhs | country | face | gw-177 fl-177 fd-177 |
| The_Gambia | place | a card's places (named for the term) | adm0:gmb | country | face | gw-142 fl-142 fd-142 |
| The_Hague | place | a card's places (named for the term) | city:1159149457 | city | dot | gw-758 gga-072 |
| Thera | place | a card's places (named for the term) | pl:q129296 | island | dot | wh-264 gr-043 gr-045 |
| Thessaloniki | place | a card's places (named for the term) | city:1159150955 | town | dot | wh-865 gr-871 gr-862 rm-609 |
| Thessaly | place | a card's places (named for the term) | pl:q166919 | region | dot | gr-872 |
| Tiananmen_Square | place | a card's places (named for the term) | pl:q164055 | site | dot | pea-001 cnh-684 |
| Tianjin | place | a card's places (named for the term) | adm1:chn:cn-tj | admin1 | face | gc-027 |
| Tiber | place | a card's places (named for the term) | river:1159120541 | river | dot | rm-003 |
| Tiber_Island | place | a card's places (named for the term) | pl:q545404 | island | dot | rm-921 rm-993 |
| Tibet | place | a card's places (named for the term) | adm1:chn:cn-xz | admin1 | face | gc-031 |
| Tikal | place | a card's places (named for the term) | pl:q181172 | site | dot | wh-601 |
| Timbuktu | place | a card's places (named for the term) | pl:q9427 | city | dot | wh-571 |
| Timgad | place | a card's places (named for the term) | pl:q459629 | site | dot | rm-527 |
| Tiryns | place | a card's places (named for the term) | pl:q217379 | site | dot | gr-067 gr-273 |
| Tiwanaku | place | a card's places (named for the term) | pl:q61750 | site | dot | wh-611 |
| Tokugawa_shogunate | place | a card's places (named for the term) | pol:tokugawa | polity | face | wh-723 |
| Tomsk | place | a card's places (named for the term) | adm1:rus:ru-tom | admin1 | face | gru-546 |
| Trajan's_Column | place | a card's places (named for the term) | pl:q192784 | site | dot | rm-497 |
| Trajan's_Forum | place | a card's places (named for the term) | pl:q211295 | site | dot | rm-498 |
| Trajan's_Market | place | a card's places (named for the term) | pl:q478642 | site | dot | rm-499 |
| Treasury_of_Atreus | place | a card's places (named for the term) | pl:q1262524 | site | dot | gr-065 |
| Troy | place | a card's places (named for the term) | pl:q22647 | site | dot | gr-102 gr-103 gr-104 gr-106 +4 |
| Tunnel_of_Eupalinos | place | a card's places (named for the term) | pl:q955894 | site | dot | gr-193 |
| Turks_and_Caicos_Islands | place | a card's places (named for the term) | adm0:tca | country | face | gw-208 fl-208 fd-208 |
| Tuva | place | a card's places (named for the term) | adm1:rus:ru-ty | admin1 | face | gru-076 |
| Tver | place | a card's places (named for the term) | adm1:rus:ru-tve | admin1 | face | gru-536 |
| Tyre | place | a card's places (named for the term) | pl:q3991738 | site | dot | wh-293 gr-717 rm-727 |
| Tyumen | place | a card's places (named for the term) | adm1:rus:ru-tyu | admin1 | face | gru-509 |
| Ulyanovsk | place | a card's places (named for the term) | adm1:rus:ru-uly | admin1 | face | gru-538 |
| Umayyad_Caliphate | place | a card's places (named for the term) | pol:umayyad | polity | face | wh-465 |
| Umm_El_Qa'ab | place | a card's places (named for the term) | pl:q853955 | site | dot | eg-063 eg-039 eg-058 eg-059 +1 |
| United_States_Virgin_Islands | place | a card's places (named for the term) | adm0:vir | country | face | gw-193 fl-193 fd-193 |
| Ur | place | a card's places (named for the term) | pl:q5699 | site | dot | wh-180 wh-177 wh-181 wh-186 |
| Urartu | place | a card's places (named for the term) | pol:urartu | polity | face | wh-296 |
| Uruk | place | a card's places (named for the term) | pl:q168518 | site | dot | wh-173 |
| Utah | place | a card's places (named for the term) | adm1:usa:us-ut | admin1 | face | geo-016 |
| Valley_of_the_Kings | place | a card's places (named for the term) | pl:q133423 | site | dot | wh-227 |
| Varna_necropolis | place | a card's places (named for the term) | pl:q946052 | site | dot | wh-144 |
| Veii | place | a card's places (named for the term) | pl:q677935 | site | dot | rm-035 rm-120 rm-177 |
| Venice | place | a card's places (named for the term) | city:1159150277 | town | dot | wh-536 |
| Vermont | place | a card's places (named for the term) | adm1:usa:us-vt | admin1 | face | geo-042 |
| Vesuvius | place | a card's places (named for the term) | pl:q524 | mountain | dot | rm-327 rm-477 |
| Vienna | place | a card's places (named for the term) | city:1159151563 | capital | dot | gw-598 ww2-116 wh-691 wh-766 |
| Vijayanagara_Empire | place | a card's places (named for the term) | pol:vijayanagara | polity | face | wh-549 |
| Virginia_(state) | place | a card's places (named for the term) | adm1:usa:us-va | admin1 | face | geo-022 |
| Vladimir-Suzdal | place | a card's places (named for the term) | pol:vladimir_suzdal | polity | face | ru-079 |
| Volga_Bulgaria | place | a card's places (named for the term) | pol:volga_bulgaria | polity | face | ru-015 |
| Volgograd | place | a card's places (named for the term) | adm1:rus:ru-vgg | admin1 | face | gru-519 |
| Vologda | place | a card's places (named for the term) | adm1:rus:ru-vlg | admin1 | face | gru-540 |
| Voronezh | place | a card's places (named for the term) | adm1:rus:ru-vor | admin1 | face | gru-522 |
| Vulci | place | a card's places (named for the term) | pl:q931172 | site | dot | rm-036 |
| Wadi_Hammamat | place | a card's places (named for the term) | pl:q1479250 | site | dot | eg-088 eg-174 |
| Wadi_Kubbaniya | place | a card's places (named for the term) | pl:q109535880 | site | dot | eg-012 |
| Wadi_Maghareh | place | a card's places (named for the term) | pl:q1548813 | site | dot | eg-089 |
| Wallis_and_Futuna | place | a card's places (named for the term) | adm0:wlf | country | face | gw-223 fl-223 fd-223 |
| Warsaw | place | a card's places (named for the term) | city:1159151299 | capital | dot | gw-542 ww2-145 wh-952 |
| Washington_(state) | place | a card's places (named for the term) | city:1159151573 | capital | dot | geo-023 ww2-131 ww2-132 wh-814 +3 |
| Weimar_Republic | place | a card's places (named for the term) | pol:weimar | polity | face | ww2-015 wh-905 |
| West_Lake | place | a card's places (named for the term) | pl:q502371 | lake | dot | cnh-449 cnh-393 |
| West_Virginia | place | a card's places (named for the term) | adm1:usa:us-wv | admin1 | face | geo-013 |
| Western_Desert | place | a card's places (named for the term) | reg:1159104061 | region | dot | eg-007 |
| Western_Sahara | place | a card's places (named for the term) | adm0:sah | country | face | gw-171 |
| White_Horse_Temple | place | a card's places (named for the term) | pl:q1264618 | site | dot | cnh-267 |
| Wiman_Joseon | place | a card's places (named for the term) | pol:wiman_joseon | polity | face | ko-054 |
| Wisconsin_(state) | place | a card's places (named for the term) | adm1:usa:us-wi | admin1 | face | geo-031 |
| Wonderwerk_Cave | place | a card's places (named for the term) | pl:q2543042 | site | dot | wh-030 |
| Wuhan | place | a card's places (named for the term) | city:1159151367 | city | dot | gc-510 wh-999 |
| Wyoming | place | a card's places (named for the term) | adm1:usa:us-wy | admin1 | face | geo-044 |
| Xi'an | place | a card's places (named for the term) | city:1159151363 | city | dot | gc-516 cnh-340 cnh-343 cnh-344 +10 |
| Xin_dynasty | place | a card's places (named for the term) | pol:xin | polity | face | cnh-245 |
| Xinjiang | place | a card's places (named for the term) | adm1:chn:cn-xj | admin1 | face | gc-021 |
| Xuzhou | place | a card's places (named for the term) | city:1159149147 | city | dot | cnh-437 cnh-624 cnh-882 |
| Yamalo-Nenets_Autonomous_Okrug | place | a card's places (named for the term) | adm1:rus:ru-yan | admin1 | face | gru-072 |
| Yan'an | place | a card's places (named for the term) | pl:q515388 | city | dot | cnh-612 |
| Yaroslavl | place | a card's places (named for the term) | adm1:rus:ru-yar | admin1 | face | gru-537 |
| Yekaterinburg | place | a card's places (named for the term) | adm1:rus:ru-sve | admin1 | face | gru-505 |
| Yinchuan | place | a card's places (named for the term) | city:1159150889 | town | dot | gc-529 cnh-465 cnh-472 |
| Yinxu | place | a card's places (named for the term) | pl:q464904 | site | dot | wh-247 cnh-069 |
| Yuan_dynasty | place | a card's places (named for the term) | pol:yuan | polity | face | wh-535 cnh-483 |
| Yue_(state) | place | a card's places (named for the term) | pol:yue | polity | face | cnh-158 |
| Yungang_Grottoes | place | a card's places (named for the term) | pl:q308805 | site | dot | cnh-335 |
| Yunnan | place | a card's places (named for the term) | adm1:chn:cn-yn | admin1 | face | gc-012 |
| Zabaykalsky_Krai | place | a card's places (named for the term) | adm1:rus:ru-zab | admin1 | face | gru-051 |
| Zagora | place | a card's places (named for the term) | pl:q140345 | site | dot | gr-119 |
| Zakros | place | a card's places (named for the term) | pl:q60218 | site | dot | gr-013 |
| Zhejiang | place | a card's places (named for the term) | adm1:chn:cn-zj | admin1 | face | gc-008 |
| Zhoukoudian | place | a card's places (named for the term) | pl:q13659137 | town | dot | wh-026 wh-025 |

### Tier 3 — Automatic from the cards, one glance each (996)

the place is the card's, not named for the term (the term lies within it, e.g. a palace on Crete), or two candidates must be told apart (`B?`).

| term | class | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|---|
| 1938_Yellow_River_flood | event | a card's places (every card of it) | pl:q4567858 | town | dot | cnh-642 |
| 1st_National_Congress_of_the_Chinese_Communist_Party | event | a card's places (every card of it) | city:1159151605 | city | dot | cnh-590 |
| 2019_Prince_Edward_station_attack | event | a card's places (every card of it) | pl:q1669492 | site | dot | pea-179 |
| 2019_Yuen_Long_attack | event | a card's places (every card of it) | pl:q842071 | site | dot | pea-178 |
| AB-Aktion | event | a card's places (every card of it) | pl:q3117935 | town | dot | ww2-153 |
| Abyssinia_Crisis | event | a card's places (every card of it) | city:1159151505 | city | dot | ww2-108 |
| Accession_of_Alexander | event | a card's places (every card of it) | pl:q213679 | site | dot | gr-704 |
| Achaean_War | event | a card's places — several candidates — pol:achaean_league Achaean League; pol:rome Rome | pol:achaean_league, pol:rome |  |  | rm-255 |
| Agamemnon | event | a card's places (every card of it) | pl:q132564 | site | dot | gr-945 |
| American_Civil_War | event | a card's places (every card of it) | pl:q737517 | site | dot | wh-812 |
| American_entry_into_World_War_I | event | a card's places (every card of it) | city:1159151573 | capital | dot | wh-891 |
| American_Revolution | event | a card's places (every card of it) | city:1159151243 | city | dot | wh-753 |
| American_Revolutionary_War | event | a card's places (every card of it) | pl:q938699 | town | dot | wh-755 |
| An_Lushan | event | a card's places (every card of it) | pl:q75336 | city | dot | cnh-377 |
| Anglo-French_Summit_(Saint-Malo) | event | a card's places (every card of it) | pl:q163108 | town | dot | eep-042 |
| Anglo-French-Soviet_negotiations | event | a card's places (every card of it) | city:1159151585 | capital | dot | ww2-126 |
| Anglo-Polish_alliance | event | a card's places (every card of it) | city:1159151577 | capital | dot | ww2-123 |
| Anglo-Zulu_War | event | a card's places (every card of it) | pl:q3782078 | site | dot | wh-831 |
| Annexation_of_Egypt | event | a card's places (every card of it) | pl:q1145715 | site | dot | rm-388 |
| Anschluss | event | a card's places (every card of it) | city:1159151563 | capital | dot | ww2-116 |
| Anthesteria | event | a card's places (every card of it) | city:1159151545 | capital | dot | gr-989 |
| Anti-Comintern_Pact | event | a card's places (every card of it) | city:1159151529 | capital | dot | ww2-103 |
| Apollo_11 | event | a card's places (every card of it) | pl:q193401 | cape | dot | wh-963 |
| Arab_Revolt | event | a card's places (every card of it) | city:1159151279 | city | dot | wh-888 |
| Archelaus_(general) | event | a card's places (every card of it) | pl:q543895 | town | dot | gr-869 |
| Ares | event | a card's places (every card of it) | pl:q202487 | hill | dot | gr-899 |
| Arminius | event | a card's places (every card of it) | river:1159122705 | river | dot | rm-421 |
| Armistice_of_11_November_1918 | event | a card's places (every card of it) | pl:q180871 | town | dot | ww2-002 wh-892 |
| Asiatic_Vespers | event | a card's places (every card of it) | pl:q47611 | site | dot | rm-312 |
| Assassination_of_Archduke_Franz_Ferdinand | event | a card's places (every card of it) | city:1159151177 | capital | dot | wh-873 |
| Assassination_of_Philip_II | event | a card's places (every card of it) | pl:q16963755 | site | dot | gr-703 |
| Atlantic_slave_trade | event | a card's places (every card of it) | pl:q968662 | town | dot | wh-726 |
| Aurangzeb | event | a card's places (every card of it) | pl:q1025625 | city | dot | wh-704 |
| Avidius_Cassius | event | a card's places (every card of it) | pl:q536924 | site | dot | rm-515 |
| Babur | event | a card's places (every card of it) | city:1159151561 | capital | dot | wh-700 |
| Bai_Hu_Tong | event | a card's places (every card of it) | city:1159147063 | city | dot | cnh-854 |
| Ban_Chao | event | a card's places (every card of it) | pl:q1328546 | region | dot | cnh-257 |
| Bar_Kokhba_revolt | event | a card's places (every card of it) | pl:q637954 | site | dot | rm-511 |
| Battle_of_Actium | event | a card's places (every card of it) | pl:q216551 | cape | dot | rm-387 gr-874 |
| Battle_of_Aegospotami | event | a card's places (every card of it) | pl:q404513 | site | dot | gr-577 |
| Battle_of_Alalia | event | a card's places (every card of it) | pl:q2830434 | site | dot | rm-042 |
| Battle_of_Arginusae | event | a card's places (every card of it) | pl:q23822737 | island-group | dot | gr-574 |
| Battle_of_Cyzicus | event | a card's places (every card of it) | pl:q615449 | site | dot | gr-572 |
| Battle_of_Munychia | event | a card's places (every card of it) | pl:q1611219 | hill | dot | gr-584 |
| Battle_of_Naulochus | event | a card's places (every card of it) | pl:q2449559 | site | dot | rm-381 |
| Battle_of_Philippi | event | a card's places (every card of it) | pl:q379652 | site | dot | rm-377 |
| Battle_of_Vienna | event | a card's places (every card of it) | pl:q697119 | mountain | dot | wh-694 |
| Bayan_of_the_Baarin | event | a card's places (every card of it) | city:1159151387 | city | dot | cnh-486 |
| Berlin_Conference | event | a card's places (every card of it) | city:1159151529 | capital | dot | wh-828 |
| Bewegungskrieg | event | a card's places (every card of it) | city:1159151529 | capital | dot | ww2-136 |
| Bombing_of_Guernica | event | a card's places (every card of it) | pl:q189848 | town | dot | ww2-113 |
| Boudica | event | a card's places (every card of it) | pl:q1407535 | site | dot | rm-443 |
| Boudican_revolt | event | a card's places (every card of it) | pl:q630604 | site | dot | rm-442 |
| Brennus_(leader_of_the_Senones) | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-125 |
| British_Agricultural_Revolution | event | a card's places (every card of it) | pl:q656999 | town | dot | wh-777 |
| British_rearmament | event | a card's places (every card of it) | city:1159151577 | capital | dot | ww2-135 |
| Burning_of_Persepolis | event | a card's places (every card of it) | pl:q129072 | site | dot | gr-726 |
| Caesars_first_consulship | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-345 |
| Calling_of_the_Varangians | event | a card's places (every card of it) | pl:q1135534 | town | dot | ru-039 |
| Cao_Cao | event | a card's places (every card of it) | pl:q404529 | city | dot | cnh-274 |
| Capitoline_geese | event | a card's places (every card of it) | pl:q34925 | hill | dot | rm-126 |
| Carthaginian_invasion_of_Sicily | event | a card's places — several candidates — pol:carthage Carthage; pol:ext_sicilian_greeks Sicilian Greeks | pol:carthage, pol:ext_sicilian_greeks |  |  | gr-448 |
| Cassius_Chaerea | event | a card's places (every card of it) | pl:q200642 | hill | dot | rm-429 |
| Catilinarian_conspiracy | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-340 |
| Causeway_Bay_Books_disappearances | event | a card's places (every card of it) | pl:q564732 | town | dot | pea-172 |
| Celtiberian_Wars | event | a card's places — several candidates — pol:ext_celtiberians Celtiberians; pol:rome Rome | pol:ext_celtiberians, pol:rome |  |  | rm-262 |
| Chinese_Communist_Revolution | event | a card's places (every card of it) | city:1159151595 | capital | dot | wh-953 |
| Chinese_Labour_Corps | event | a card's places (every card of it) | pl:q489451 | town | dot | cnh-582 |
| Christianization_of_Kievan_Rus' | event | a card's places (every card of it) | city:1159151495 | capital | dot | ru-053 |
| Chu–Han_Contention | event | a card's places (every card of it) | pl:q1360089 | town | dot | cnh-214 |
| Classis_Misenensis | event | a card's places (every card of it) | pl:q19900818 | site | dot | rm-656 |
| Claw_of_Archimedes | event | a card's places (every card of it) | pl:q13670 | city | dot | gr-821 |
| Colonia_(Roman) | event | a card's places (every card of it) | pl:q944515 | site | dot | rm-148 |
| Comitia_centuriata | event | a card's places (every card of it) | pl:q242839 | region | dot | rm-071 |
| Conference_at_Luca | event | a card's places (every card of it) | pl:q13373 | city | dot | rm-349 |
| Conference_of_Carnuntum | event | a card's places (every card of it) | pl:q508815 | site | dot | rm-576 |
| Conference_of_Naupactus | event | a card's places (every card of it) | pl:q782278 | city | dot | rm-236 |
| Congress_of_Vienna | event | a card's places (every card of it) | city:1159151563 | capital | dot | wh-766 |
| Conquest_of_Wu_by_Jin | event | a card's places — several candidates — pol:eastern_wu Eastern Wu; pol:western_jin Western Jin | pol:eastern_wu, pol:western_jin |  |  | cnh-295 |
| Consulship_of_70_BCE | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-329 |
| Consulship_of_Cicero | event | a card's places (every card of it) | pl:q242839 | region | dot | rm-338 |
| Council_of_Liubech | event | a card's places (every card of it) | pl:q76561 | town | dot | ru-071 |
| Counter-Reformation | event | a card's places (every card of it) | city:1159139597 | town | dot | wh-642 |
| COVID-19_pandemic | event | a card's places (every card of it) | city:1159151367 | city | dot | wh-999 |
| Crimean_War | event | a card's places (every card of it) | city:1159150561 | town | dot | wh-809 |
| Crossing_of_the_Hellespont | event | a card's places (every card of it) | sea:1159119155 | strait | dot | gr-710 |
| Cuban_Missile_Crisis | event | a card's places (every card of it) | pl:q559801 | city | dot | wh-961 |
| Cuban_Revolution | event | a card's places (every card of it) | city:1159151347 | capital | dot | wh-960 |
| Death_of_Alexander_the_Great | event | a card's places (every card of it) | pl:q5684 | site | dot | gr-747 |
| Debate_on_the_conspirators | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-341 |
| Decebalus | event | a card's places (every card of it) | pl:q739802 | site | dot | rm-496 |
| Decelean_War | event | a card's places — several candidates — pol:ext_athens_and_its_empire Athens and its empire; pol:peloponnesian_league Peloponnesian League | pol:ext_athens_and_its_empire, pol:peloponnesian_league |  |  | gr-561 |
| Demetrius_I_Poliorcetes | event | a card's places (every card of it) | pl:q1150349 | site | dot | gr-762 |
| Destruction_of_the_Minoan_palaces | event | a card's places (every card of it) | reg:1159102805 | island | dot | gr-050 |
| Destruction_of_Thebes | event | a card's places (every card of it) | pl:q11225429 | site | dot | gr-705 |
| Diocletianic_Persecution | event | a card's places (every card of it) | city:1159135147 | town | dot | rm-573 |
| Disaster_of_Yongjia | event | a card's places (every card of it) | city:1159147063 | city | dot | cnh-301 |
| Domitian's_Dacian_War | event | a card's places (every card of it) | pl:q7684406 | town | dot | rm-483 |
| Donations_of_Alexandria | event | a card's places (every card of it) | city:1159151349 | city | dot | rm-385 |
| Dong_Zhuo | event | a card's places (every card of it) | city:1159147063 | city | dot | cnh-270 |
| Early_Muslim_conquests | event | a card's places — several candidates — pol:byzantium Eastern Roman Empire; pol:rashidun Rashidun Caliphate; pol:sasanian Sasanian Empire | pol:byzantium, pol:rashidun, pol:sasanian |  |  | wh-463 |
| Eleusinian_Mysteries | event | a card's places (every card of it) | pl:q11918833 | site | dot | gr-990 |
| Emperor_Taizong_of_Tang | event | a card's places (every card of it) | city:1159151363 | city | dot | cnh-357 |
| Emperor_Wu_of_Song | event | a card's places (every card of it) | city:1159151385 | city | dot | cnh-322 |
| English_Reformation | event | a card's places (every card of it) | pl:q189960 | town | dot | wh-640 |
| Euromaidan | event | a card's places (every card of it) | pl:q863759 | site | dot | eep-204 |
| Evocatio | event | a card's places (every card of it) | pl:q677935 | site | dot | rm-177 |
| Exile_of_Cicero | event | a card's places (every card of it) | city:1159144543 | town | dot | rm-347 |
| Expulsion_of_the_kings | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-078 |
| Fall_of_Tenochtitlan | event | a card's places (every card of it) | pl:q13695 | city | dot | wh-666 |
| Fall_of_the_Achaemenid_Empire | event | a card's places — several candidates — pol:achaemenid Achaemenid Empire; pol:macedon Macedon | pol:achaemenid, pol:macedon |  |  | wh-310 |
| Fall_of_the_Berlin_Wall | event | a card's places (every card of it) | city:1159151529 | capital | dot | wh-970 |
| Fall_of_the_Ming_dynasty | event | a card's places (every card of it) | city:1159151595 | capital | dot | wh-715 |
| Fall_of_the_Qin | event | a card's places (every card of it) | city:1159148455 | city | dot | cnh-212 |
| Fall_of_the_Roman_Republic | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-321 |
| Fall_of_the_Shang | event | a card's places — several candidates — pol:ext_zhou Zhou; pol:shang Shang; pol:zhou Zhou | pol:ext_zhou, pol:shang, pol:zhou |  |  | cnh-103 |
| Fall_Weiss | event | a card's places (every card of it) | pl:q517081 | region | dot | ww2-141 |
| First_Council_of_Nicaea | event | a card's places (every card of it) | pl:q739037 | site | dot | wh-374 rm-583 |
| First_Crusade | event | a card's places (every card of it) | city:1159151203 | capital | dot | wh-507 |
| First_Fleet | event | a card's places (every card of it) | pl:q1756937 | gulf | dot | wh-853 |
| First_Jewish–Roman_War | event | a card's places (every card of it) | pl:q1615560 | city | dot | rm-451 |
| First_Macedonian_War | event | a card's places (every card of it) | pl:q781463 | site | dot | rm-238 |
| First_Messenian_War | event | a card's places — several candidates — pol:ext_messenia Messenia; pol:ext_sparta Sparta | pol:ext_messenia, pol:ext_sparta |  |  | gr-236 |
| First_Mithridatic_War | event | a card's places — several candidates — pl:q950952 Dardanus (city); pol:pontus Pontus; pol:rome Rome | pl:q950952, pol:pontus, pol:rome |  |  | rm-310 |
| First_Punic_War | event | a card's places — several candidates — pol:carthage Carthage; pol:rome Rome | pol:carthage, pol:rome |  |  | rm-186 |
| First_Samnite_War | event | a card's places — several candidates — pl:q1228725 Saticula; pol:ext_samnium Samnium; pol:rome Rome | pl:q1228725, pol:ext_samnium, pol:rome |  |  | rm-152 |
| First_Triumvirate | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-344 |
| Formula_togatorum | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-172 |
| Francisco_Pizarro | event | a card's places (every card of it) | city:1159151511 | capital | dot | wh-667 |
| Franco-Prussian_War | event | a card's places (every card of it) | pl:q184371 | town | dot | wh-806 |
| French_Revolution | event | a card's places (every card of it) | city:1159151613 | capital | dot | wh-757 |
| Fubing_system | event | a card's places (every card of it) | city:1159151363 | city | dot | cnh-340 |
| Gaius_Julius_Vindex | event | a card's places (every card of it) | city:1159130531 | town | dot | rm-452 |
| Gallic_invasion_of_the_Balkans | event | a card's places (every card of it) | pl:q75459 | site | dot | gr-787 |
| Gallic_Wars | event | a card's places — several candidates — pol:ext_gallic_tribes Gallic tribes; pol:rome Rome | pol:ext_gallic_tribes, pol:rome, pl:q38060 |  |  | wh-354 rm-350 |
| General_Government | event | a card's places (every card of it) | city:1159149709 | town | dot | ww2-151 |
| German_reunification | event | a card's places (every card of it) | city:1159151529 | capital | dot | wh-988 |
| German-Soviet_Frontier_Treaty | event | a card's places (every card of it) | city:1159151585 | capital | dot | ww2-147 |
| Germanicus | event | a card's places (every card of it) | city:1159113499 | town | dot | rm-419 |
| Gigantomachy | event | a card's places (every card of it) | pl:q2625955 | region | dot | gr-913 |
| Giulio_Douhet | event | a card's places (every card of it) | city:1159151593 | capital | dot | ww2-138 |
| Giuseppe_Garibaldi | event | a card's places (every card of it) | pl:q481514 | town | dot | wh-803 |
| Gleiwitz_incident | event | a card's places (every card of it) | pl:q105084 | city | dot | ww2-142 |
| Gnaeus_Domitius_Corbulo | event | a card's places (every card of it) | pl:q111565756 | site | dot | rm-444 |
| Gnaeus_Julius_Agricola | event | a card's places (every card of it) | pl:q3078607 | site | dot | rm-484 |
| Gnaeus_Marcius_Coriolanus | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-107 |
| Goguryeo–Sui_War | event | a card's places (every card of it) | pl:q75203 | city | dot | cnh-351 |
| Great_Fire_of_Rome | event | a card's places (every card of it) | pl:q207808 | site | dot | rm-446 |
| Great_Purge | event | a card's places (every card of it) | city:1159151585 | capital | dot | wh-904 |
| Greco-Persian_Wars | event | a card's places — several candidates — pol:achaemenid Achaemenid Empire; pol:ext_greek_allies Greek allies | pol:achaemenid, pol:ext_greek_allies |  |  | wh-319 |
| Guan_Yu | event | a card's places (every card of it) | pl:q1159699 | town | dot | cnh-286 |
| Gwangju_Uprising | event | a card's places (every card of it) | city:1159149597 | city | dot | pea-063 |
| Haitian_Revolution | event | a card's places (every card of it) | city:1159135037 | town | dot | wh-767 |
| Han_founding_settlement | event | a card's places (every card of it) | pl:q113491323 | region | dot | cnh-219 |
| Han–Xiongnu_wars | event | a card's places — several candidates — pol:han Han dynasty; pol:xiongnu Xiongnu | pol:han, pol:xiongnu |  |  | cnh-224 |
| Hector | event | a card's places (every card of it) | pl:q22647 | site | dot | gr-949 |
| Hernán_Cortés | event | a card's places (every card of it) | pl:q60130 | region | dot | wh-665 |
| Hoare-Laval_Pact | event | a card's places (every card of it) | city:1159151613 | capital | dot | ww2-109 |
| Horatius_Cocles | event | a card's places (every card of it) | pl:q1466700 | site | dot | rm-097 |
| Hou_Jing_rebellion | event | a card's places (every card of it) | city:1159151385 | city | dot | cnh-328 |
| Hu_Weiyong_case | event | a card's places (every card of it) | city:1159151385 | city | dot | cnh-506 |
| Huan_Wen | event | a card's places (every card of it) | pl:q71247 | city | dot | cnh-318 |
| Huang_Chao_rebellion | event | a card's places (every card of it) | city:1159151363 | city | dot | cnh-395 |
| Hundred_Years'_War | event | a card's places — several candidates — pol:england England; pol:france France | pol:england, pol:france |  |  | wh-518 |
| Huo_Qubing | event | a card's places (every card of it) | pl:q533432 | city | dot | cnh-228 |
| Illyrian_Wars | event | a card's places — several candidates — pol:illyria Illyrian kingdom; pol:rome Rome | pol:illyria, pol:rome |  |  | rm-237 |
| Immigration_to_Argentina | event | a card's places (every card of it) | city:1159151559 | capital | dot | wh-858 |
| Indian_Ocean_slave_trade | event | a card's places (every card of it) | city:1159150789 | town | dot | wh-739 |
| Indian_Rebellion_of_1857 | event | a card's places (every card of it) | city:1159149181 | city | dot | wh-838 |
| International_Brigades | event | a card's places (every card of it) | city:1159151503 | capital | dot | ww2-112 |
| Iranian_Revolution | event | a card's places (every card of it) | city:1159151551 | capital | dot | wh-984 |
| Italian_invasion_of_Albania | event | a card's places (every card of it) | city:1159144543 | town | dot | ww2-124 |
| Jingkang_incident | event | a card's places (every card of it) | pl:q208471 | city | dot | cnh-446 |
| Joan_of_Arc | event | a card's places (every card of it) | city:1159142017 | town | dot | wh-519 |
| José_de_San_Martín | event | a card's places (every card of it) | city:1159151093 | town | dot | wh-771 |
| Judgement_of_Paris | event | a card's places (every card of it) | pl:q1127771 | range | dot | gr-942 |
| Jugurthine_War | event | a card's places — several candidates — pol:numidia Numidia; pol:rome Rome | pol:numidia, pol:rome |  |  | rm-292 |
| Julian's_Persian_expedition | event | a card's places (every card of it) | pl:q192541 | site | dot | rm-599 |
| Katyn_massacre | event | a card's places (every card of it) | pl:q4217543 | region | dot | ww2-155 |
| Knights_Templar | event | a card's places (every card of it) | pl:q193163 | hill | dot | wh-508 |
| Lamian_War | event | a card's places — several candidates — pl:q192980 Lamia (city); pol:athenian_coalition Athenian Coalition; pol:macedon Macedon | pl:q192980, pol:athenian_coalition, pol:macedon |  |  | gr-755 |
| Lars_Porsena | event | a card's places (every card of it) | pl:q843729 | city | dot | rm-098 |
| Latin_colony | event | a card's places (every card of it) | pl:q2026618 | site | dot | rm-149 |
| Latin_War | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-142 |
| Leges_Genuciae | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-129 |
| Lex_Canuleia | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-115 |
| Lex_Hortensia | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-135 |
| Lex_Ogulnia | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-136 |
| Lex_Ovinia | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-133 |
| Lex_Poetelia_Papiria | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-134 |
| Li_Zicheng | event | a card's places (every card of it) | city:1159151363 | city | dot | cnh-533 |
| Licinio-Sextian_rogations | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-128 |
| Liu_Bei | event | a card's places (every card of it) | city:1159151533 | city | dot | cnh-280 |
| Longzhong_Plan | event | a card's places (every card of it) | city:1159148459 | city | dot | cnh-282 |
| Lucius_Cornelius_Cinna | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-314 |
| Lucius_Quinctius_Cincinnatus | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-108 |
| Lucius_Verginius_Rufus | event | a card's places (every card of it) | pl:q4735811 | site | dot | rm-455 |
| Lucretia | event | a card's places (every card of it) | pl:q1108919 | site | dot | rm-077 |
| Lushan_Conference | event | a card's places (every card of it) | pl:q622616 | mountain | dot | cnh-667 |
| Lusitanian_War | event | a card's places — several candidates — pol:ext_lusitanians Lusitanians; pol:rome Rome | pol:ext_lusitanians, pol:rome |  |  | rm-263 |
| Lysimachus | event | a card's places (every card of it) | pl:q134960293 | site | dot | gr-771 |
| Maastricht_Treaty | event | a card's places (every card of it) | city:1159115953 | town | dot | eep-038 |
| Maniple_(military_unit) | event | a card's places (every card of it) | pl:q242839 | region | dot | rm-155 |
| Marcomannic_Wars | event | a card's places (every card of it) | pl:q508815 | site | dot | rm-519 |
| Marcus_Agrippa | event | a card's places (every card of it) | pl:q290097 | city | dot | rm-382 |
| Marcus_Furius_Camillus | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-121 |
| Marcus_Licinius_Crassus | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-326 |
| Marian_terror | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-315 |
| Massacre_of_Thessalonica | event | a card's places (every card of it) | city:1159150955 | town | dot | rm-609 |
| Maximinus_Thrax | event | a card's places (every card of it) | pl:q53216 | town | dot | rm-551 |
| May_Fourth_Movement | event | a card's places (every card of it) | pl:q83973 | site | dot | cnh-585 |
| Meiji_Restoration | event | a card's places (every card of it) | city:1159149967 | city | dot | wh-844 |
| Messenian_Wars | event | a card's places — several candidates — pol:ext_messenia Messenia; pol:ext_sparta Sparta | pol:ext_messenia, pol:ext_sparta |  |  | gr-235 |
| Mexican_Revolution | event | a card's places (every card of it) | city:1159151587 | capital | dot | wh-861 |
| Mexican_War_of_Independence | event | a card's places (every card of it) | pl:q17487868 | town | dot | wh-772 |
| Middle_Passage | event | a card's places (every card of it) | city:1159150339 | capital | dot | wh-727 |
| Minoan_eruption | event | a card's places (every card of it) | pl:q129296 | island | dot | wh-264 gr-043 |
| Minsk_agreements | event | a card's places (every card of it) | city:1159151149 | capital | dot | gga-121 |
| Mithridates_VI_Eupator | event | a card's places (every card of it) | pl:q107557833 | site | dot | rm-311 |
| Mongol_conquest_of_Western_Xia | event | a card's places (every card of it) | city:1159150889 | town | dot | cnh-472 |
| Mongol_invasion_of_Java | event | a card's places (every card of it) | pl:q11443 | city | dot | cnh-494 |
| Mongol_invasion_of_Kievan_Rus' | event | a card's places (every card of it) | pl:q196678 | town | dot | ru-095 |
| Mongol_invasions_of_Japan | event | a card's places (every card of it) | pl:q2344806 | gulf | dot | wh-537 |
| Moscow_Peace_Treaty | event | a card's places (every card of it) | pl:q14657 | town | dot | ww2-160 |
| Munich_Agreement | event | a card's places (every card of it) | city:1159151357 | city | dot | ww2-118 |
| Nero_Claudius_Drusus | event | a card's places (every card of it) | pl:q571790 | site | dot | rm-413 |
| Neronian_persecution | event | a card's places (every card of it) | pl:q676074 | site | dot | rm-448 |
| Neutrality_Acts_of_the_1930s | event | a card's places (every card of it) | city:1159151573 | capital | dot | ww2-132 |
| New_Deal | event | a card's places (every card of it) | city:1159151573 | capital | dot | wh-909 |
| New_Fourth_Army_Incident | event | a card's places (every card of it) | pl:q1152195 | region | dot | cnh-646 |
| NKVD | event | a card's places (every card of it) | pl:q176761 | town | dot | ww2-156 |
| Norman_Conquest | event | a card's places — several candidates — pl:q29245 Hastings; pol:england England; pol:normandy Normandy | pl:q29245, pol:england, pol:normandy |  |  | wh-504 |
| Northwest_Indian_War | event | a card's places — several candidates — pol:ext_western_confederacy Western Confederacy; pol:usa United States | pol:ext_western_confederacy, pol:usa |  |  | us-072 |
| Numantine_War | event | a card's places — several candidates — pol:ext_celtiberians Celtiberians; pol:rome Rome | pol:ext_celtiberians, pol:rome |  |  | rm-265 |
| Nurhaci | event | a card's places (every card of it) | pl:q842950 | town | dot | cnh-536 |
| Occupy_Central_with_Love_and_Peace | event | a card's places (every card of it) | pl:q14767 | town | dot | pea-169 |
| Odysseus | event | a card's places (every card of it) | pl:q187471 | island | dot | gr-951 |
| Operation_Artemis | event | a card's places (every card of it) | pl:q648298 | city | dot | eep-046 |
| Opium_Wars | event | a card's places (every card of it) | city:1159151331 | city | dot | wh-840 |
| Pact_of_Brundisium | event | a card's places (every card of it) | pl:q103155084 | site | dot | rm-379 |
| Pact_of_Steel | event | a card's places (every card of it) | city:1159151529 | capital | dot | ww2-125 |
| Panathenaia | event | a card's places (every card of it) | pl:q2336187 | town | dot | gr-986 |
| Panzer_division | event | a card's places (every card of it) | city:1159151529 | capital | dot | ww2-137 |
| Partition_of_Babylon | event | a card's places (every card of it) | pl:q5684 | site | dot | gr-752 |
| Peace_of_Phoenice | event | a card's places (every card of it) | pl:q781463 | site | dot | gr-850 |
| Peace_of_Westphalia | event | a card's places (every card of it) | pl:q2742 | city | dot | wh-647 |
| Perusine_War | event | a card's places (every card of it) | pl:q1130478 | site | dot | rm-378 |
| Phoney_War | event | a card's places (every card of it) | city:1159140613 | town | dot | ww2-149 |
| Polish_Armed_Forces_in_the_West | event | a card's places (every card of it) | city:1159149575 | town | dot | ww2-158 |
| Polish_government-in-exile | event | a card's places (every card of it) | city:1159151577 | capital | dot | ww2-157 |
| Pompey | event | a card's places (every card of it) | pl:q11907359 | site | dot | rm-325 |
| Prague_Spring | event | a card's places (every card of it) | city:1159151359 | capital | dot | wh-965 |
| Probus_(emperor) | event | a card's places (every card of it) | pl:q833060 | site | dot | rm-565 |
| Protectorate_General_to_Pacify_the_West | event | a card's places (every card of it) | pl:q1328546 | region | dot | cnh-366 |
| Punic_Wars | event | a card's places — several candidates — pol:carthage Carthage; pol:rome Rome | pol:carthage, pol:rome |  |  | wh-345 |
| Pyrrhic_War | event | a card's places (every card of it) | pl:q13498 | city | dot | gr-847 |
| Qin_conquest_of_the_six_states | event | a card's places — several candidates — pol:chu Chu; pol:han_state Han (state); pol:qi Qi; pol:qin Qin; pol:wei Wei; pol:yan Yan; pol:zhao Zhao | pol:chu, pol:han_state, pol:qi |  |  | cnh-188 |
| Qin_conquest_of_the_south | event | a card's places — several candidates — pol:ext_yue_peoples the Yue peoples; pol:qin Qin | pol:ext_yue_peoples, pol:qin |  |  | cnh-205 |
| Quarantine_Speech | event | a card's places (every card of it) | city:1159151491 | city | dot | ww2-133 |
| Quintus_Sertorius | event | a card's places (every card of it) | pl:q100707898 | site | dot | rm-323 |
| Red_Turban_Rebellions | event | a card's places (every card of it) | pl:q10566197 | region | dot | cnh-501 |
| Reign_of_Terror | event | a card's places (every card of it) | city:1159151613 | capital | dot | wh-760 |
| Remilitarisation_of_the_Rhineland | event | a card's places (every card of it) | city:1159148451 | city | dot | ww2-110 |
| Restoration_of_the_tribunate | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-330 |
| Retreat_of_the_government_of_the_Republic_of_China_to_Taiwan | event | a card's places (every card of it) | city:1159151567 | capital | dot | cnh-627 |
| Retrocession_Day | event | a card's places (every card of it) | pl:q6145247 | site | dot | cnh-692 |
| Revolt_of_Lepidus | event | a card's places (every card of it) | pl:q242839 | region | dot | rm-322 |
| Revolt_of_the_Batavi | event | a card's places (every card of it) | pl:q532466 | site | dot | rm-464 |
| Revolutions_of_1848 | event | a card's places (every card of it) | city:1159151613 | capital | dot | wh-773 |
| Roman_confederation | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-170 |
| Roman_conquest_of_Cisalpine_Gaul | event | a card's places — several candidates — pl:q729978 Mediolanum; pol:ext_cisalpine_gauls Cisalpine Gauls; pol:rome Rome | pl:q729978, pol:ext_cisalpine_gauls, pol:rome |  |  | rm-162 |
| Roman_conquest_of_Etruria | event | a card's places — several candidates — pol:etruscans Etruria; pol:rome Rome | pol:etruscans, pol:rome |  |  | rm-158 |
| Roman_conquest_of_Greece | event | a card's places — several candidates — pol:achaean_league Achaean League; pol:aetolian_league Aetolian League; pol:macedon Macedon; pol:rome Rome | pol:achaean_league, pol:aetolian_league, pol:macedon |  |  | wh-349 |
| Roman_conquest_of_Spain | event | a card's places — several candidates — pol:ext_celtiberians_and_lusitanians the Celtiberians and Lusitanians; pol:rome Rome | pol:ext_celtiberians_and_lusitanians, pol:rome |  |  | rm-261 |
| Roman_conquest_of_Umbria_and_Picenum | event | a card's places — several candidates — pl:q17051264 Mevania; pol:ext_umbria_and_picenum Umbria and Picenum; pol:rome Rome | pl:q17051264, pol:ext_umbria_and_picenum, pol:rome |  |  | rm-159 |
| Roman_expansion_in_Italy | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-141 |
| Roman_military_diploma | event | a card's places (every card of it) | pl:q2034500 | town | dot | rm-650 |
| Roman_triumph | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-176 |
| Roman-Seleucid_War | event | a card's places — several candidates — pol:rome Rome; pol:seleucid Seleucid Empire | pol:rome, pol:seleucid |  |  | rm-245 |
| Roman–Parthian_War_of_161–166 | event | a card's places (every card of it) | pl:q1136681 | site | dot | rm-517 |
| Rus'–Byzantine_Treaty | event | a card's places (every card of it) | pl:q16869 | city | dot | ru-043 |
| Russo-Japanese_War | event | a card's places (every card of it) | pl:q623329 | town | dot | wh-847 |
| Rwandan_genocide | event | a card's places (every card of it) | city:1159149385 | capital | dot | wh-992 |
| Sack_of_Kiev_(1169) | event | a card's places (every card of it) | city:1159151495 | capital | dot | ru-081 |
| Sack_of_Rome_(390_BC) | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-124 |
| Samnite_Wars | event | a card's places — several candidates — pl:q11909916 Bovianum; pol:ext_samnium Samnium; pol:rome Rome | pl:q11909916, pol:ext_samnium, pol:rome |  |  | rm-151 |
| Secessio_plebis | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-102 |
| Second_Italo-Ethiopian_War | event | a card's places — several candidates — adm0:eth Ethiopia; adm0:ita Italy; city:1159151549 Addis Ababa; pol:ethiopia Ethiopian Empire; pol:italian_africa Italian Africa; pol:italy  | adm0:eth, adm0:ita, city:1159151549 |  |  | ww2-042 |
| Second_Macedonian_War | event | a card's places — several candidates — pol:macedon Macedon; pol:rome Rome | pol:macedon, pol:rome |  |  | rm-240 |
| Second_Messenian_War | event | a card's places — several candidates — pol:ext_messenia Messenia; pol:ext_sparta Sparta | pol:ext_messenia, pol:ext_sparta |  |  | gr-237 |
| Second_Punic_War | event | a card's places — several candidates — pol:carthage Carthage; pol:rome Rome | pol:carthage, pol:rome |  |  | rm-209 |
| Second_Samnite_War | event | a card's places — several candidates — city:1159151313 Naples; pol:ext_samnium Samnium; pol:rome Rome | city:1159151313, pol:ext_samnium, pol:rome |  |  | rm-153 |
| Sejanus | event | a card's places (every card of it) | pl:q1049836 | site | dot | rm-423 |
| Sengoku_period | event | a card's places (every card of it) | city:1159149967 | city | dot | wh-721 |
| September_11_attacks | event | a card's places (every card of it) | pl:q20445370 | site | dot | wh-995 |
| Servian_constitution | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-070 |
| Shanghai_massacre | event | a card's places (every card of it) | pl:q197124 | region | dot | cnh-595 |
| Shapur_I | event | a card's places (every card of it) | pl:q648705 | site | dot | rm-554 |
| Shi_Shouxin | event | a card's places (every card of it) | pl:q208471 | city | dot | cnh-423 |
| Sicilian_Expedition | event | a card's places — several candidates — pol:ext_athens_and_its_empire Athens and its empire; pol:ext_syracuse Syracuse | pol:ext_athens_and_its_empire, pol:ext_syracuse |  |  | gr-552 |
| Siege_of_Abydos | event | a card's places (every card of it) | pl:q336446 | site | dot | gr-852 |
| Siege_of_Ambracia | event | a card's places (every card of it) | pl:q661559 | site | dot | gr-856 |
| Siege_of_Gaza | event | a card's places (every card of it) | city:1159150445 | town | dot | gr-718 |
| Siege_of_Halicarnassus | event | a card's places (every card of it) | pl:q5843680 | site | dot | gr-713 |
| Siege_of_Kiev_(1240) | event | a card's places (every card of it) | city:1159151495 | capital | dot | ru-098 |
| Siege_of_Miletus | event | a card's places (every card of it) | pl:q169460 | site | dot | gr-712 |
| Siege_of_Rhodes | event | a card's places (every card of it) | pl:q188731 | town | dot | gr-763 |
| Siege_of_Tyre | event | a card's places (every card of it) | pl:q3991738 | site | dot | gr-717 |
| Siege_of_Veii | event | a card's places (every card of it) | pl:q677935 | site | dot | rm-120 |
| Siege_of_Vienna | event | a card's places (every card of it) | city:1159151563 | capital | dot | wh-691 |
| Siege_of_Vladimir | event | a card's places (every card of it) | city:1159148121 | town | dot | ru-097 |
| Sima_Yi | event | a card's places (every card of it) | city:1159147063 | city | dot | cnh-289 |
| Simón_Bolívar | event | a card's places (every card of it) | city:1159151493 | capital | dot | wh-770 |
| Six-party_talks | event | a card's places (every card of it) | pl:q183033 | site | dot | pea-120 |
| Slave_rebellion | event | a card's places (every card of it) | pl:q265115 | city | dot | wh-733 |
| Socii | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-171 |
| Sonderaktion_Krakau | event | a card's places (every card of it) | city:1159149709 | town | dot | ww2-152 |
| Soviet-Japanese_border_conflicts | event | a card's places — several candidates — adm0:jpn Japan; adm0:mng Mongolia; adm0:rus Russia; pol:japan Empire of Japan; pol:mongolia_pr Mongolian People's Republic; pol:ussr Soviet  | adm0:jpn, adm0:mng, adm0:rus |  |  | ww2-100 |
| Spanish_American_wars_of_independence | event | a card's places (every card of it) | city:1159146413 | town | dot | wh-769 |
| Spanish_Civil_War | event | a card's places (every card of it) | city:1159151503 | capital | dot | ww2-111 |
| Spanish_conquest_of_the_Inca_Empire | event | a card's places (every card of it) | pl:q827432 | site | dot | wh-668 |
| Spartacus | event | a card's places (every card of it) | pl:q524 | mountain | dot | rm-327 |
| St._Bartholomew's_Day_massacre | event | a card's places (every card of it) | city:1159151613 | capital | dot | wh-645 |
| Stephanus_(freedman) | event | a card's places (every card of it) | pl:q529806 | site | dot | rm-489 |
| Stipendium | event | a card's places (every card of it) | pl:q746721 | site | dot | rm-122 |
| Storming_of_the_Bastille | event | a card's places (every card of it) | pl:q778784 | site | dot | wh-758 |
| Sui_conquest_of_Chen | event | a card's places (every card of it) | city:1159151385 | city | dot | cnh-345 |
| Sulla's_dictatorship | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-319 |
| Sullivan_Expedition | event | a card's places — several candidates — pol:ext_seneca_and_cayuga Seneca and Cayuga; pol:usa United States | pol:ext_seneca_and_cayuga, pol:usa |  |  | us-071 |
| Sun_Quan | event | a card's places (every card of it) | city:1159151385 | city | dot | cnh-285 |
| Sunflower_Student_Movement | event | a card's places (every card of it) | pl:q715869 | site | dot | pea-155 |
| Surrender_of_Babylon | event | a card's places (every card of it) | pl:q5684 | site | dot | gr-723 |
| Susa_weddings | event | a card's places (every card of it) | pl:q180773 | site | dot | gr-744 |
| Sviatoslav_I | event | a card's places (every card of it) | pl:q4163154 | river | dot | ru-048 |
| Sykes–Picot_Agreement | event | a card's places (every card of it) | city:1159151577 | capital | dot | wh-889 |
| Syrian_Wars | event | a card's places (every card of it) | pl:q1123749 | region | dot | gr-793 |
| Taiping_Rebellion | event | a card's places (every card of it) | city:1159151385 | city | dot | wh-842 cnh-564 |
| Tarquinius_Superbus | event | a card's places (every card of it) | pl:q614510 | site | dot | rm-074 |
| The_Rape_of_the_Sabine_Women | event | a card's places (every card of it) | city:1159151593 | capital | dot | rm-058 |
| Third_Macedonian_War | event | a card's places — several candidates — pol:macedon Macedon; pol:rome Rome | pol:macedon, pol:rome |  |  | rm-249 |
| Third_Messenian_War | event | a card's places — several candidates — pol:ext_messenia Messenia; pol:ext_sparta Sparta | pol:ext_messenia, pol:ext_sparta |  |  | gr-461 |
| Third_Mithridatic_War | event | a card's places — several candidates — pl:q337381 Chalcedon; pol:pontus Pontus; pol:rome Rome | pl:q337381, pol:pontus, pol:rome |  |  | rm-333 |
| Third_Punic_War | event | a card's places — several candidates — pol:carthage Carthage; pol:rome Rome | pol:carthage, pol:rome |  |  | rm-234 |
| Third_Samnite_War | event | a card's places — several candidates — pl:q1130478 Perusia; pol:ext_samnium Samnium; pol:rome Rome | pl:q1130478, pol:ext_samnium, pol:rome |  |  | rm-156 |
| Third_Taiwan_Strait_Crisis | event | a card's places (every card of it) | sea:1159116947 | strait | dot | pea-144 |
| Thirty_Years'_War | event | a card's places (every card of it) | city:1159151359 | capital | dot | wh-646 |
| Titus | event | a card's places (every card of it) | pl:q383071 | site | dot | rm-471 |
| Trajan's_Dacian_Wars | event | a card's places (every card of it) | pl:q849786 | site | dot | rm-495 |
| Trajan's_Parthian_campaign | event | a card's places (every card of it) | pl:q192541 | site | dot | rm-501 |
| Trans-Saharan_slave_trade | event | a card's places (every card of it) | pl:q526822 | city | dot | wh-740 |
| Treaty_of_Amsterdam | event | a card's places (every card of it) | city:1159151519 | capital | dot | eep-041 |
| Treaty_of_Lisbon | event | a card's places (every card of it) | city:1159151273 | capital | dot | eep-047 |
| Treaty_of_Nerchinsk | event | a card's places (every card of it) | pl:q146043 | town | dot | cnh-546 |
| Treaty_of_Nice | event | a card's places (every card of it) | pl:q33959 | city | dot | eep-044 |
| Trial_of_Verres | event | a card's places (every card of it) | pl:q180212 | site | dot | rm-337 |
| Tripartite_Pact | event | a card's places (every card of it) | city:1159151529 | capital | dot | ww2-104 |
| Trojan_War | event | a card's places (every card of it) | pl:q22647 | site | dot | gr-944 |
| Tullus_Hostilius | event | a card's places (every card of it) | pl:q335070 | site | dot | rm-063 |
| Umbrella_Movement | event | a card's places (every card of it) | pl:q3270129 | region | dot | pea-170 |
| Unification_of_Italy | event | a card's places (every card of it) | city:1159151593 | capital | dot | wh-802 |
| Unification_of_Japan | event | a card's places (every card of it) | pl:q267258 | city | dot | wh-722 |
| Valerian_(emperor) | event | a card's places (every card of it) | city:1159146389 | town | dot | rm-555 |
| Valerio-Horatian_Laws | event | a card's places (every card of it) | pl:q242839 | region | dot | rm-114 |
| Varangian_Guard | event | a card's places (every card of it) | pl:q16869 | city | dot | ru-089 |
| Vietnam_War | event | a card's places (every card of it) | pl:q105076326 | city | dot | wh-964 |
| War_of_Mutina | event | a card's places (every card of it) | pl:q11786862 | site | dot | rm-373 |
| War_of_the_Eight_Princes | event | a card's places (every card of it) | city:1159147063 | city | dot | cnh-297 |
| War_of_the_Pacific | event | a card's places (every card of it) | city:1159150929 | town | dot | wh-859 |
| Warsaw_Pact | event | a card's places (every card of it) | city:1159151299 | capital | dot | wh-952 |
| Wehrmacht | event | a card's places (every card of it) | city:1159151529 | capital | dot | ww2-139 |
| Western_European_Union | event | a card's places (every card of it) | city:1159151465 | capital | dot | eep-034 |
| Whampoa_Military_Academy | event | a card's places (every card of it) | city:1159151331 | city | dot | cnh-592 |
| Winter_War | event | a card's places — several candidates — adm0:fin Finland; adm0:rus Russia; pl:q209010 Karelian Isthmus; pol:finland Finland; pol:ussr Soviet Union | adm0:fin, adm0:rus, pl:q209010 |  |  | ww2-159 |
| Xuanwu_Gate_Incident | event | a card's places (every card of it) | city:1159151363 | city | dot | cnh-358 |
| Young_Turk_Revolution | event | a card's places (every card of it) | city:1159150955 | town | dot | wh-865 |
| Yuan_Shao | event | a card's places (every card of it) | pl:q1274372 | site | dot | cnh-271 |
| Yuwen_Huaji | event | a card's places (every card of it) | pl:q57906 | city | dot | cnh-354 |
| Zhuge_Liang | event | a card's places (every card of it) | city:1159151533 | city | dot | cnh-281 |
| Zu_Ti | event | a card's places (every card of it) | pl:q1198543 | region | dot | cnh-317 |
| Abbas_the_Great | group | a card's places (every card of it) | city:1159150971 | city | dot | wh-696 |
| Ancient_Rome | group | a card's places (every card of it) | city:1159151593 | capital | dot | wh-336 |
| Askold_and_Dir | group | a card's places (every card of it) | city:1159151495 | capital | dot | ru-042 |
| Birch_bark_manuscript | group | a card's places (every card of it) | city:1159146503 | town | dot | ru-065 |
| Boris_and_Gleb | group | a card's places (every card of it) | pl:q1004257 | city | dot | ru-056 |
| Cycladic_civilisation | group | a card's places — several candidates — pol:cyclades Cyclades; reg:1159102965 Cyclades | pol:cyclades, reg:1159102965 |  |  | gr-002 |
| Epigoni | group | a card's places (every card of it) | pl:q11924352 | site | dot | gr-941 |
| Fifth_Dynasty_of_Egypt | group | a card's places (every card of it) | pl:q336098 | site | dot | eg-118 |
| Flavian_dynasty | group | a card's places (every card of it) | city:1159151593 | capital | dot | rm-490 |
| Galatians | group | a card's places (every card of it) | pol:galatia | people | face | gr-788 |
| House_of_Medici | group | a card's places (every card of it) | city:1159149751 | city | dot | wh-624 |
| Huizhou_merchants | group | a card's places (every card of it) | pl:q1197997 | region | dot | cnh-524 |
| Kassites | group | a card's places (every card of it) | pl:q622719 | site | dot | wh-198 |
| Keftiu | group | a card's places — several candidates — pol:crete Crete; reg:1159102805 Crete | pol:crete, reg:1159102805 |  |  | gr-047 |
| Ligurians | group | a card's places (every card of it) | pl:q1256 | region | dot | rm-018 |
| Luddite | group | a card's places (every card of it) | pl:q41262 | city | dot | wh-791 |
| Mal'ta-Buret'_culture | group | a card's places (every card of it) | pl:q35464055 | site | dot | wh-096 |
| Maroons | group | a card's places (every card of it) | pl:q4672706 | town | dot | wh-734 |
| Mehmed_II | group | a card's places (every card of it) | pl:q12506 | site | dot | wh-688 |
| Merya | group | a card's places (every card of it) | pl:q193342 | town | dot | ru-027 |
| Messapians | group | a card's places (every card of it) | pl:q735628 | region | dot | rm-020 |
| Minoan_civilisation | group | a card's places (every card of it) | pol:crete | culture | face | gr-006 wh-262 |
| Nerva–Antonine_dynasty | group | a card's places (every card of it) | city:1159151593 | capital | dot | rm-491 |
| Nobiles | group | a card's places (every card of it) | pl:q180212 | site | dot | rm-130 |
| Northern_Yuan | group | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-502 |
| Patrician | group | a card's places (every card of it) | city:1159151593 | capital | dot | rm-083 |
| Phoenicians | group | a card's places (every card of it) | pl:q3991738 | site | dot | wh-293 |
| Plebeian | group | a card's places (every card of it) | pl:q194103 | hill | dot | rm-084 |
| Qin_dynasty | group | a card's places (every card of it) | pol:qin | polity | face | wh-405 cnh-191 |
| Red_Eyebrows | group | a card's places (every card of it) | pl:q1198076 | region | dot | cnh-251 |
| Russian_conquest_of_Siberia | group | a card's places (every card of it) | pl:q168782 | town | dot | wh-682 |
| Russkiy_Mir_Foundation | group | a card's places (every card of it) | city:1159151585 | capital | dot | eep-127 |
| Samnites | group | a card's places (every card of it) | pl:q463459 | region | dot | rm-013 |
| Saqaliba | group | a card's places (every card of it) | city:1159151547 | capital | dot | ru-068 |
| Scythians | group | a card's places (every card of it) | pol:scythia | people | face | ru-005 |
| Sixth_Dynasty_of_Egypt | group | a card's places (every card of it) | pl:q192134 | site | dot | eg-128 |
| Sogdian_Whirl_dance | group | a card's places (every card of it) | city:1159150569 | town | dot | cnh-370 |
| Suleiman_the_Magnificent | group | a card's places (every card of it) | city:1159151579 | city | dot | wh-690 |
| Thervingi | group | a card's places (every card of it) | pl:q431280 | site | dot | rm-601 |
| Toltec | group | a card's places (every card of it) | pl:q1353133 | town | dot | wh-604 |
| Umbrians | group | a card's places (every card of it) | pl:q1280 | region | dot | rm-015 |
| Uyghur_Khaganate | group | a card's places (every card of it) | pl:q2475401 | site | dot | cnh-385 |
| Veneti | group | a card's places (every card of it) | city:1159150277 | town | dot | rm-019 |
| Volsci | group | a card's places (every card of it) | pl:q2137162 | site | dot | rm-017 |
| Wu_Zhou | group | a card's places (every card of it) | city:1159147063 | city | dot | cnh-372 |
| Yangzhou_salt_merchants | group | a card's places (every card of it) | pl:q57906 | city | dot | cnh-822 |
| Yuezhi | group | a card's places (every card of it) | pl:q319114 | town | dot | wh-588 |
| Zhou_dynasty | group | a card's places (every card of it) | pol:zhou | polity | face | cnh-111 |
| Abidjan | place | a card's places (every card of it) | adm0:civ | country | face | gw-755 |
| Abu_Dhabi | place | a card's places (every card of it) | adm0:are | country | face | gw-586 |
| Abuja | place | a card's places (every card of it) | adm0:nga | country | face | gw-506 |
| Accra | place | a card's places (every card of it) | adm0:gha | country | face | gw-547 |
| Adamstown,_Pitcairn_Islands | place | a card's places (every card of it) | adm0:pcn | country | face | gw-733 |
| Aelia_Capitolina | place | a card's places (every card of it) | city:1159151203 | capital | dot | rm-512 |
| Aetolian_League | place | a card's places (every card of it) | pl:q26857 | region | dot | gr-795 |
| Albany_(New_York) | place | a card's places (every card of it) | adm1:usa:us-ny | admin1 | face | geo-511 |
| Albuquerque | place | a card's places (every card of it) | adm1:usa:us-nm | admin1 | face | geo-726 |
| Algiers | place | a card's places (every card of it) | adm0:dza | country | face | gw-533 |
| Alofi | place | a card's places (every card of it) | adm0:niu | country | face | gw-731 |
| Amman | place | a card's places (every card of it) | adm0:jor | country | face | gw-584 |
| Amphitheatre | place | a card's places (every card of it) | pl:q43332 | site | dot | rm-872 |
| Amur_Oblast | place | a card's places (every card of it) | adm1:rus:ru-amu | admin1 | face | gru-059 |
| Anadyr | place | a card's places (every card of it) | adm1:rus:ru-chu | admin1 | face | gru-582 |
| Anchorage_(Alaska) | place | a card's places (every card of it) | adm1:usa:us-ak | admin1 | face | geo-705 |
| Ancient_Greek_temple | place | a card's places (every card of it) | city:1159151545 | capital | dot | gr-968 |
| Ancient_Israel_and_Judah | place | a card's places — several candidates — pol:israel Kingdom of Israel; pol:judah Kingdom of Judah | pol:israel, pol:judah |  |  | wh-290 |
| Ancient_Italy | place | a card's places (every card of it) | pl:q145694 | region | dot | rm-001 |
| Andorra_la_Vella | place | a card's places (every card of it) | adm0:and | country | face | gw-699 |
| Ankara | place | a card's places (every card of it) | adm0:tur | country | face | gw-518 |
| Annapolis | place | a card's places (every card of it) | adm1:usa:us-md | admin1 | face | geo-514 |
| Antananarivo | place | a card's places (every card of it) | adm0:mdg | country | face | gw-549 |
| Antigonid_dynasty | place | a card's places (every card of it) | pol:macedon | polity | face | gr-770 |
| Apia | place | a card's places (every card of it) | adm0:wsm | country | face | gw-684 |
| Aqua_Appia | place | a card's places (every card of it) | pl:q1632777 | site | dot | rm-139 |
| Aqua_Claudia | place | a card's places (every card of it) | pl:q751318 | site | dot | rm-436 |
| Arabia_Petraea | place | a card's places (every card of it) | pl:q127429784 | site | dot | rm-502 |
| Arkhangelsk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-ark | admin1 | face | gru-050 |
| Artemis_Orthia | place | a card's places (every card of it) | pl:q5690 | site | dot | gr-261 |
| Ashgabat | place | a card's places (every card of it) | adm0:tkm | country | face | gw-605 |
| Asmara | place | a card's places (every card of it) | adm0:eri | country | face | gw-632 |
| Astana | place | a card's places (every card of it) | adm0:kaz | country | face | gw-564 |
| Astrakhan_Oblast | place | a card's places (every card of it) | adm1:rus:ru-ast | admin1 | face | gru-054 |
| Asukadera | place | a card's places (every card of it) | pl:q17173672 | town | dot | jp-062 |
| Asunción | place | a card's places (every card of it) | adm0:pry | country | face | gw-608 |
| Atil | place | a card's places (every card of it) | pl:q4406882 | site | dot | ru-018 |
| Atlanta | place | a card's places (every card of it) | adm1:usa:us-ga | admin1 | face | geo-527 |
| Augusta | place | a card's places (every card of it) | adm1:usa:us-me | admin1 | face | geo-509 |
| Augusta_Emerita | place | a card's places (every card of it) | pl:q31918813 | city | dot | rm-682 |
| Aurelian_Walls | place | a card's places (every card of it) | city:1159151593 | capital | dot | rm-564 |
| Austin | place | a card's places (every card of it) | adm1:usa:us-tx | admin1 | face | geo-502 |
| Avarua | place | a card's places (every card of it) | adm0:cok | country | face | gw-721 |
| Baku | place | a card's places (every card of it) | adm0:aze | country | face | gw-595 |
| Baltimore | place | a card's places (every card of it) | adm1:usa:us-md | admin1 | face | geo-714 |
| Balts | place | a card's places (every card of it) | pl:q19658174 | region | dot | ru-028 |
| Bamako | place | a card's places (every card of it) | adm0:mli | country | face | gw-558 |
| Bandar_Seri_Begawan | place | a card's places (every card of it) | adm0:brn | country | face | gw-675 |
| Bangui | place | a card's places (every card of it) | adm0:caf | country | face | gw-622 |
| Banjul | place | a card's places (every card of it) | adm0:gmb | country | face | gw-642 |
| Basilica_Aemilia | place | a card's places (every card of it) | city:1159151593 | capital | dot | rm-984 |
| Basseterre | place | a card's places (every card of it) | adm0:kna | country | face | gw-706 |
| Baths_of_Caracalla | place | a card's places (every card of it) | city:1159151593 | capital | dot | rm-546 |
| Baton_Rouge | place | a card's places (every card of it) | adm1:usa:us-la | admin1 | face | geo-508 |
| Battle_of_Adrianople | place | a card's places (every card of it) | pl:q7101665 | site | dot | rm-602 |
| Battle_of_Adwa | place | a card's places (every card of it) | pl:q380096 | city | dot | wh-833 |
| Battle_of_Amphipolis | place | a card's places (every card of it) | pl:q217414 | site | dot | gr-543 |
| Battle_of_Beneventum_(275_BC) | place | a card's places (every card of it) | pl:q105706880 | site | dot | rm-168 |
| Battle_of_Caishi | place | a card's places (every card of it) | city:1159139721 | city | dot | cnh-453 |
| Battle_of_Chrysopolis | place | a card's places (every card of it) | pl:q3515347 | site | dot | rm-582 |
| Battle_of_Crannon | place | a card's places (every card of it) | pl:q56427665 | site | dot | gr-756 |
| Battle_of_Cynoscephalae | place | a card's places (every card of it) | pl:q8777773 | site | dot | rm-241 gr-853 |
| Battle_of_Fei_River | place | a card's places (every card of it) | pl:q1349884 | region | dot | cnh-310 |
| Battle_of_France | place | a card's places (every card of it) | pl:q184371 | town | dot | wh-920 |
| Battle_of_Gaoliang_River | place | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-416 |
| Battle_of_Guandu | place | a card's places (every card of it) | pl:q113491852 | region | dot | cnh-275 |
| Battle_of_Huangtiandang | place | a card's places (every card of it) | pl:q57958 | city | dot | cnh-447 |
| Battle_of_Issus | place | a card's places (every card of it) | pl:q1360503 | site | dot | gr-715 |
| Battle_of_Kadesh | place | a card's places (every card of it) | pl:q15982250 | town | dot | wh-226 |
| Battle_of_Lugdunum | place | a card's places (every card of it) | pl:q665 | site | dot | rm-540 |
| Battle_of_Magnesia | place | a card's places (every card of it) | city:1159135165 | town | dot | rm-247 |
| Battle_of_Mantinea | place | a card's places (every card of it) | pl:q1160195 | site | dot | gr-548 |
| Battle_of_Marathon | place | a card's places (every card of it) | pl:q212150 | town | dot | wh-320 gr-403 |
| Battle_of_Penghu | place | a card's places (every card of it) | pl:q918799 | island-group | dot | cnh-544 |
| Battle_of_Plassey | place | a card's places (every card of it) | pl:q3346548 | town | dot | wh-836 |
| Battle_of_Plataea | place | a card's places (every card of it) | pl:q742538 | site | dot | gr-435 |
| Battle_of_Pylos | place | a card's places (every card of it) | pl:q7263152 | city | dot | gr-539 |
| Battle_of_Sepeia | place | a card's places (every card of it) | pl:q217379 | site | dot | gr-273 |
| Battle_of_Stalingrad | place | a card's places (every card of it) | city:1159150697 | town | dot | wh-926 |
| Battle_of_Talas | place | a card's places (every card of it) | city:1159150145 | town | dot | cnh-376 |
| Battle_of_the_Bzura | place | a card's places (every card of it) | pl:q250485 | city | dot | ww2-144 |
| Battle_of_the_Champions | place | a card's places (every card of it) | pl:q3036391 | site | dot | gr-272 |
| Battle_of_the_Colline_Gate | place | a card's places (every card of it) | city:1159151593 | capital | dot | rm-317 |
| Battle_of_the_Fetters | place | a card's places (every card of it) | pl:q645234 | site | dot | gr-271 |
| Battle_of_the_Milvian_Bridge | place | a card's places (every card of it) | pl:q1127325 | site | dot | rm-578 |
| Battle_of_the_Somme | place | a card's places (every card of it) | pl:q30940 | town | dot | wh-880 |
| Battle_of_the_Teutoburg_Forest | place | a card's places (every card of it) | pl:q60176450 | town | dot | rm-414 |
| Battle_of_Verdun | place | a card's places (every card of it) | pl:q154748 | town | dot | wh-879 |
| Battle_of_Xiangyang | place | a card's places (every card of it) | city:1159148459 | city | dot | cnh-463 |
| Beijing | place | a card's places — several candidates — city:1159151595 Beijing; adm1:chn:cn-bj Beijing | city:1159151595, adm1:chn:cn-bj, adm0:chn |  |  | gc-026 gw-502 cnh-511 wh-713 +18 |
| Beijing_Ancient_Observatory | place | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-983 |
| Beirut | place | a card's places (every card of it) | adm0:lbn | country | face | gw-616 |
| Belgorod_Oblast | place | a card's places (every card of it) | adm1:rus:ru-bel | admin1 | face | gru-031 |
| Belmopan | place | a card's places (every card of it) | adm0:blz | country | face | gw-676 |
| Bent_Pyramid | place | a card's places (every card of it) | pl:q685414 | site | dot | eg-101 |
| Bern | place | a card's places (every card of it) | adm0:che | country | face | gw-600 |
| Billings_(Montana) | place | a card's places (every card of it) | adm1:usa:us-mt | admin1 | face | geo-743 |
| Bishkek | place | a card's places (every card of it) | adm0:kgz | country | face | gw-607 |
| Bismarck_(North_Dakota) | place | a card's places (every card of it) | adm1:usa:us-nd | admin1 | face | geo-549 |
| Bissau | place | a card's places (every card of it) | adm0:gnb | country | face | gw-648 |
| Blagoveshchensk | place | a card's places (every card of it) | adm1:rus:ru-amu | admin1 | face | gru-559 |
| Bloemfontein | place | a card's places (every card of it) | adm0:zaf | country | face | gw-753 |
| Bogotá | place | a card's places (every card of it) | adm0:col | country | face | gw-528 |
| Boise | place | a card's places (every card of it) | adm1:usa:us-id | admin1 | face | geo-512 |
| Boston | place | a card's places (every card of it) | adm1:usa:us-ma | admin1 | face | geo-519 |
| Brades | place | a card's places (every card of it) | adm0:msr | country | face | gw-728 |
| Brasília | place | a card's places (every card of it) | adm0:bra | country | face | gw-507 |
| Bratislava | place | a card's places (every card of it) | adm0:svk | country | face | gw-620 |
| Brazzaville | place | a card's places (every card of it) | adm0:cog | country | face | gw-613 |
| Bridgeport_(Connecticut) | place | a card's places (every card of it) | adm1:usa:us-ct | admin1 | face | geo-740 |
| Bridgewater_Canal | place | a card's places (every card of it) | pl:q1617033 | town | dot | wh-787 |
| Bryansk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-bry | admin1 | face | gru-041 |
| Budapest | place | a card's places (every card of it) | adm0:hun | country | face | gw-597 |
| Bujumbura | place | a card's places (every card of it) | adm0:bdi | country | face | gw-762 |
| Burlington_(Vermont) | place | a card's places (every card of it) | adm1:usa:us-vt | admin1 | face | geo-742 |
| Byzantine_Empire | place | a card's places — several candidates — pol:byzantium Eastern Roman Empire; pl:q16869 Constantinople | pol:byzantium, pl:q16869 |  |  | wh-436 rm-637 gr-219 |
| Canberra | place | a card's places (every card of it) | adm0:aus | country | face | gw-554 |
| Cape_Route | place | a card's places (every card of it) | pl:q4092 | cape | dot | wh-659 |
| Cape_Town | place | a card's places (every card of it) | adm0:zaf | country | face | gw-752 |
| Carson_City | place | a card's places (every card of it) | adm1:usa:us-nv | admin1 | face | geo-515 |
| Carthaginian_empire | place | a card's places (every card of it) | pol:carthage | polity | face | rm-182 |
| Casa_Romuli | place | a card's places (every card of it) | city:1159151593 | capital | dot | rm-051 |
| Castries | place | a card's places (every card of it) | adm0:lca | country | face | gw-685 |
| Cemetery_U | place | a card's places (every card of it) | pl:q853955 | site | dot | eg-039 |
| Changchun | place | a card's places (every card of it) | adm1:chn:cn-jl | admin1 | face | gc-524 |
| Changsha | place | a card's places (every card of it) | adm1:chn:cn-hn | admin1 | face | gc-507 |
| Charlotte_(North_Carolina) | place | a card's places (every card of it) | adm1:usa:us-nc | admin1 | face | geo-729 |
| Charlotte_Amalie | place | a card's places (every card of it) | adm0:vir | country | face | gw-693 |
| Chelyabinsk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-che | admin1 | face | gru-010 |
| Chengjia | place | a card's places (every card of it) | city:1159151533 | city | dot | cnh-255 |
| Cheyenne_(Wyoming) | place | a card's places (every card of it) | adm1:usa:us-wy | admin1 | face | geo-544 |
| Chișinău | place | a card's places (every card of it) | adm0:mda | country | face | gw-645 |
| Church_of_the_Intercession_on_the_Nerl | place | a card's places (every card of it) | pl:q762099 | town | dot | ru-088 |
| Church_of_the_Tithes | place | a card's places (every card of it) | city:1159151495 | capital | dot | ru-055 |
| Classical_Athens | place | a card's places (every card of it) | city:1159151545 | capital | dot | wh-317 |
| Cockburn_Town | place | a card's places (every card of it) | adm0:tca | country | face | gw-708 |
| Colombo | place | a card's places (every card of it) | adm0:lka | country | face | gw-756 |
| Columbia_(South_Carolina) | place | a card's places (every card of it) | adm1:usa:us-sc | admin1 | face | geo-528 |
| Columbus_(Ohio) | place | a card's places (every card of it) | adm1:usa:us-oh | admin1 | face | geo-520 |
| Column_of_Marcus_Aurelius | place | a card's places (every card of it) | pl:q63785 | site | dot | rm-521 |
| Compass | place | a card's places (every card of it) | city:1159151331 | city | dot | wh-531 |
| Conakry | place | a card's places (every card of it) | adm0:gin | country | face | gw-575 |
| Concord | place | a card's places (every card of it) | adm1:usa:us-nh | admin1 | face | geo-541 |
| Congo_Free_State | place | a card's places (every card of it) | pl:q223917 | city | dot | wh-829 |
| Copenhagen | place | a card's places (every card of it) | adm0:dnk | country | face | gw-615 |
| Cotonou | place | a card's places (every card of it) | adm0:ben | country | face | gw-759 |
| Crete | place | a card's places — several candidates — reg:1159102805 Crete; pol:crete Crete | reg:1159102805, pol:crete |  |  | gr-005 gr-006 gr-009 gr-015 +17 |
| Cro-Magnon | place | a card's places (every card of it) | pl:q57506528 | town | dot | wh-068 |
| Cross-in-square | place | a card's places (every card of it) | city:1159151495 | capital | dot | ru-087 |
| Cyclades | place | a card's places — several candidates — pol:cyclades Cyclades; reg:1159102965 Cyclades | pol:cyclades, reg:1159102965 |  |  | gr-002 |
| Cypriot_city-kingdoms | place | a card's places (every card of it) | reg:1159103411 | island | dot | gr-158 |
| Da_Qi | place | a card's places (every card of it) | pl:q208471 | city | dot | cnh-477 |
| Đại_Việt | place | a card's places — several candidates — pl:q430309 Đại Việt; pol:dai_viet Dai Viet | pl:q430309, pol:dai_viet |  |  | wh-559 |
| Dakar | place | a card's places (every card of it) | adm0:sen | country | face | gw-569 |
| Dar_es_Salaam | place | a card's places (every card of it) | adm0:tza | country | face | gw-751 |
| Denver | place | a card's places (every card of it) | adm1:usa:us-co | admin1 | face | geo-545 |
| Des_Moines | place | a card's places (every card of it) | adm1:usa:us-ia | admin1 | face | geo-550 |
| Destruction_of_Pylos | place | a card's places (every card of it) | pl:q2047396 | site | dot | gr-109 |
| Detinets | place | a card's places (every card of it) | pl:q1277545 | site | dot | ru-067 |
| Detroit | place | a card's places (every card of it) | adm1:usa:us-mi | admin1 | face | geo-707 |
| Dhaka | place | a card's places (every card of it) | adm0:bgd | country | face | gw-508 |
| Dili | place | a card's places (every card of it) | adm0:tls | country | face | gw-655 |
| Diocletian's_Palace | place | a card's places (every card of it) | city:1159140363 | town | dot | rm-575 |
| Dodoma | place | a card's places (every card of it) | adm0:tza | country | face | gw-522 |
| Doha | place | a card's places (every card of it) | adm0:qat | country | face | gw-640 |
| Dover | place | a card's places (every card of it) | adm1:usa:us-de | admin1 | face | geo-539 |
| Drainage_of_Lake_Copais | place | a card's places (every card of it) | pl:q1234240 | lake | dot | gr-099 |
| Dublin | place | a card's places (every card of it) | adm0:irl | country | face | gw-621 |
| Dura-Europos_church | place | a card's places (every card of it) | pl:q464266 | site | dot | rm-928 |
| Dushanbe | place | a card's places (every card of it) | adm0:tjk | country | face | gw-591 |
| Earth's_circumference | place | a card's places (every card of it) | city:1159149859 | town | dot | gr-825 |
| Eastern_Jin | place | a card's places (every card of it) | pol:western_jin | polity | face | cnh-313 |
| Elam | place | a card's places — several candidates — pl:q2369687 Susiana; pol:elam Elam | pl:q2369687, pol:elam |  |  | wh-199 |
| Empire_of_China_(1915–1916) | place | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-579 |
| Eratosthenes | place | a card's places (every card of it) | city:1159151349 | city | dot | gr-824 |
| Etruscan_Campania | place | a card's places (every card of it) | pl:q1438 | region | dot | rm-040 |
| Fargo_(North_Dakota) | place | a card's places (every card of it) | adm1:usa:us-nd | admin1 | face | geo-749 |
| First_Battle_of_the_Marne | place | a card's places (every card of it) | pl:q207620 | town | dot | wh-878 |
| Former_Shu | place | a card's places (every card of it) | city:1159151533 | city | dot | cnh-404 |
| Founding_of_Alexandria | place | a card's places (every card of it) | city:1159151349 | city | dot | gr-720 |
| Frankfort | place | a card's places (every card of it) | adm1:usa:us-ky | admin1 | face | geo-533 |
| Freetown | place | a card's places (every card of it) | adm0:sle | country | face | gw-601 |
| Funafuti | place | a card's places (every card of it) | adm0:tuv | country | face | gw-725 |
| Gaborone | place | a card's places (every card of it) | adm0:bwa | country | face | gw-644 |
| Gallia_Narbonensis | place | a card's places (every card of it) | pl:q11938382 | site | dot | rm-759 |
| Gallipoli_campaign | place | a card's places (every card of it) | pl:q192860 | region | dot | wh-881 |
| Garden_of_Epicurus | place | a card's places (every card of it) | city:1159151545 | capital | dot | gr-843 |
| Gatchina | place | a card's places (every card of it) | adm1:rus:ru-len | admin1 | face | gru-524 |
| Genghis_Khan | place | a card's places (every card of it) | pl:q1010335 | mountain | dot | wh-593 ru-092 |
| Georgetown,_Guyana | place | a card's places (every card of it) | adm0:guy | country | face | gw-664 |
| Georgia_(state) | place | a card's places — several candidates — adm1:usa:us-ga Georgia; adm0:geo Georgia | adm1:usa:us-ga, adm0:geo |  |  | geo-027 gw-131 fl-131 fd-131 |
| Germania_Superior | place | a card's places (every card of it) | pl:q571790 | site | dot | rm-755 |
| Gitega | place | a card's places (every card of it) | adm0:bdi | country | face | gw-578 |
| Giza_pyramid_complex | place | a card's places (every card of it) | city:1159146947 | city | dot | eg-105 |
| Giza_West_Field | place | a card's places (every card of it) | city:1159146947 | city | dot | eg-138 |
| Göktürks | place | a card's places (every card of it) | pl:q1453235 | region | dot | wh-591 |
| Gothic_architecture | place | a card's places (every card of it) | pl:q160506 | town | dot | wh-510 |
| Grave_Circle_A | place | a card's places (every card of it) | pl:q132564 | site | dot | gr-060 |
| Grave_Circle_B | place | a card's places (every card of it) | pl:q132564 | site | dot | gr-061 |
| Great_Pyramid_of_Giza | place | a card's places (every card of it) | city:1159146947 | city | dot | wh-212 |
| Greco-Bactrian_Kingdom | place | a card's places — several candidates — pl:q132646 Bactria; pol:bactria Graeco-Bactria | pl:q132646, pol:bactria |  |  | gr-783 |
| Grozny | place | a card's places (every card of it) | adm1:rus:ru-ce | admin1 | face | gru-530 |
| Guatemala_City | place | a card's places (every card of it) | adm0:gtm | country | face | gw-570 |
| Guiyang | place | a card's places (every card of it) | adm1:chn:cn-gz | admin1 | face | gc-517 |
| Gustavia | place | a card's places (every card of it) | adm0:blm | country | face | gw-724 |
| Hagåtña | place | a card's places (every card of it) | adm0:gum | country | face | gw-686 |
| Haikou | place | a card's places (every card of it) | adm1:chn:cn-hi | admin1 | face | gc-528 |
| Han_dynasty | place | a card's places — several candidates — pol:han Han dynasty; pl:q1147037 Eastern Han | pol:han, pl:q1147037 |  |  | wh-408 cnh-213 cnh-253 |
| Hanging_Gardens_of_Babylon | place | a card's places (every card of it) | pl:q5684 | site | dot | wh-288 |
| Hanoi | place | a card's places (every card of it) | adm0:vnm | country | face | gw-516 |
| Harappa | place | a card's places (every card of it) | pl:q2418927 | region | dot | wh-232 |
| Harare | place | a card's places (every card of it) | adm0:zwe | country | face | gw-574 |
| Harbin | place | a card's places (every card of it) | adm1:chn:cn-hl | admin1 | face | gc-520 |
| Harrisburg | place | a card's places (every card of it) | adm1:usa:us-pa | admin1 | face | geo-530 |
| Hartford | place | a card's places (every card of it) | adm1:usa:us-ct | admin1 | face | geo-540 |
| Hattusa | place | a card's places (every card of it) | pl:q848800 | town | dot | wh-267 |
| Hausa_Kingdoms | place | a card's places (every card of it) | city:1159151297 | city | dot | wh-574 |
| Hefei | place | a card's places (every card of it) | adm1:chn:cn-ah | admin1 | face | gc-509 |
| Heit_el-Ghurab | place | a card's places (every card of it) | city:1159146947 | city | dot | eg-113 |
| Helena_(Montana) | place | a card's places (every card of it) | adm1:usa:us-mt | admin1 | face | geo-543 |
| Hittites | place | a card's places (every card of it) | pl:q181007 | site | dot | wh-266 |
| Hohhot | place | a card's places (every card of it) | adm1:chn:cn-nm | admin1 | face | gc-525 |
| Honiara | place | a card's places (every card of it) | adm0:slb | country | face | gw-665 |
| Honolulu | place | a card's places (every card of it) | adm1:usa:us-hi | admin1 | face | geo-506 |
| House_of_the_Vettii | place | a card's places (every card of it) | pl:q43332 | site | dot | rm-976 |
| Houston | place | a card's places (every card of it) | adm1:usa:us-tx | admin1 | face | geo-702 |
| Huaihai_campaign | place | a card's places (every card of it) | city:1159149147 | city | dot | cnh-624 |
| Huntsville_(Alabama) | place | a card's places (every card of it) | adm1:usa:us-al | admin1 | face | geo-737 |
| Indianapolis | place | a card's places (every card of it) | adm1:usa:us-in | admin1 | face | geo-532 |
| Inebu-hedj | place | a card's places (every card of it) | pl:q5715 | site | dot | eg-070 |
| Irkutsk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-irk | admin1 | face | gru-021 |
| Islamabad | place | a card's places (every card of it) | adm0:pak | country | face | gw-505 |
| Isthmian_wall | place | a card's places (every card of it) | pl:q215200 | region | dot | gr-101 |
| Italian_city-states | place | a card's places — several candidates — pol:florence Florence; pol:genoa Genoa; pol:milan Milan; pol:papal_states Papal States; pol:pisa Pisa; pol:savoy Savoy; pol:venice Venice | pol:florence, pol:genoa, pol:milan |  |  | wh-622 |
| Ivanovo_Oblast | place | a card's places (every card of it) | adm1:rus:ru-iva | admin1 | face | gru-055 |
| Jackson_(Mississippi) | place | a card's places (every card of it) | adm1:usa:us-ms | admin1 | face | geo-538 |
| Jacksonville_(Florida) | place | a card's places (every card of it) | adm1:usa:us-fl | admin1 | face | geo-703 |
| Jakarta | place | a card's places (every card of it) | adm0:idn | country | face | gw-504 |
| James_Cook | place | a card's places (every card of it) | reg:1159103831 | island-group | dot | wh-683 |
| Jefferson_City | place | a card's places (every card of it) | adm1:usa:us-mo | admin1 | face | geo-535 |
| Jiangnan | place | a card's places (every card of it) | city:1159149145 | city | dot | cnh-806 |
| Jiangxi_Soviet | place | a card's places (every card of it) | pl:q1025459 | town | dot | cnh-607 |
| Jiankang | place | a card's places (every card of it) | city:1159151385 | city | dot | cnh-314 |
| Juba | place | a card's places (every card of it) | adm0:sds | country | face | gw-581 |
| Juneau | place | a card's places (every card of it) | adm1:usa:us-ak | admin1 | face | geo-505 |
| Kaliningrad_Oblast | place | a card's places (every card of it) | adm1:rus:ru-kgd | admin1 | face | gru-049 |
| Kaluga_Oblast | place | a card's places (every card of it) | adm1:rus:ru-klu | admin1 | face | gru-048 |
| Kampala | place | a card's places (every card of it) | adm0:uga | country | face | gw-531 |
| Kansas_City_(Missouri) | place | a card's places (every card of it) | adm1:usa:us-mo | admin1 | face | geo-735 |
| Kathmandu | place | a card's places (every card of it) | adm0:npl | country | face | gw-551 |
| Kemerovo_Oblast | place | a card's places (every card of it) | adm1:rus:ru-kem | admin1 | face | gru-017 |
| Khartoum | place | a card's places (every card of it) | adm0:sdn | country | face | gw-530 |
| Kingdom_of_Benin | place | a card's places (every card of it) | city:1159149127 | city | dot | wh-575 |
| Kingdom_of_Dahomey | place | a card's places (every card of it) | pl:q189685 | city | dot | wh-737 |
| Kingstown | place | a card's places (every card of it) | adm0:vct | country | face | gw-696 |
| Kinshasa | place | a card's places (every card of it) | adm0:cod | country | face | gw-515 |
| Kirov_Oblast | place | a card's places (every card of it) | adm1:rus:ru-kir | admin1 | face | gru-042 |
| Kostroma_Oblast | place | a card's places (every card of it) | adm1:rus:ru-kos | admin1 | face | gru-068 |
| Kuala_Lumpur | place | a card's places (every card of it) | adm0:mys | country | face | gw-544 |
| Kunming | place | a card's places (every card of it) | adm1:chn:cn-yn | admin1 | face | gc-512 |
| Kurgan_Oblast | place | a card's places (every card of it) | adm1:rus:ru-kgn | admin1 | face | gru-060 |
| Kursk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-krs | admin1 | face | gru-044 |
| Kuwait_City | place | a card's places (every card of it) | adm0:kwt | country | face | gw-628 |
| Kyzyl | place | a card's places (every card of it) | adm1:rus:ru-ty | admin1 | face | gru-576 |
| La_Paz | place | a card's places (every card of it) | adm0:bol | country | face | gw-760 |
| Labyrinth_of_Egypt | place | a card's places (every card of it) | pl:q26237 | site | dot | eg-197 |
| Laetoli_footprints | place | a card's places (every card of it) | pl:q672146 | site | dot | wh-011 |
| Lake_Moeris | place | a card's places (every card of it) | city:1159149857 | town | dot | eg-185 |
| Lansing | place | a card's places (every card of it) | adm1:usa:us-mi | admin1 | face | geo-507 |
| Lanzhou | place | a card's places (every card of it) | adm1:chn:cn-gs | admin1 | face | gc-522 |
| Las_Vegas | place | a card's places (every card of it) | adm1:usa:us-nv | admin1 | face | geo-715 |
| Later_Liang_(Five_Dynasties) | place | a card's places (every card of it) | pl:q208471 | city | dot | cnh-398 |
| Later_Tang | place | a card's places (every card of it) | city:1159147063 | city | dot | cnh-399 |
| Later_Zhao | place | a card's places (every card of it) | pl:q58576 | city | dot | cnh-306 |
| Later_Zhou | place | a card's places (every card of it) | pl:q208471 | city | dot | cnh-402 |
| Legionary_fortress | place | a card's places (every card of it) | pl:q532466 | site | dot | rm-667 |
| Leningrad_Oblast | place | a card's places (every card of it) | adm1:rus:ru-len | admin1 | face | gru-024 |
| Libreville | place | a card's places (every card of it) | adm0:gab | country | face | gw-643 |
| Lighthouse_of_Alexandria | place | a card's places (every card of it) | pl:q2696558 | island | dot | gr-804 |
| Lilongwe | place | a card's places (every card of it) | adm0:mwi | country | face | gw-562 |
| Lincoln_(Nebraska) | place | a card's places (every card of it) | adm1:usa:us-ne | admin1 | face | geo-547 |
| Lipetsk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-lip | admin1 | face | gru-043 |
| Little_Rock | place | a card's places (every card of it) | adm1:usa:us-ar | admin1 | face | geo-536 |
| Ljubljana | place | a card's places (every card of it) | adm0:svn | country | face | gw-649 |
| Lobamba | place | a card's places (every card of it) | adm0:swz | country | face | gw-761 |
| Lomé | place | a card's places (every card of it) | adm0:tgo | country | face | gw-602 |
| Los_Angeles | place | a card's places (every card of it) | adm1:usa:us-ca | admin1 | face | geo-701 |
| Louisville_(Kentucky) | place | a card's places (every card of it) | adm1:usa:us-ky | admin1 | face | geo-733 |
| Lower_city_of_Troy | place | a card's places (every card of it) | pl:q22647 | site | dot | gr-104 |
| Luanda | place | a card's places (every card of it) | adm0:ago | country | face | gw-540 |
| Lucy_(Australopithecus) | place | a card's places (every card of it) | pl:q1567353 | site | dot | wh-010 |
| Lusaka | place | a card's places (every card of it) | adm0:zmb | country | face | gw-563 |
| Madison | place | a card's places (every card of it) | adm1:usa:us-wi | admin1 | face | geo-531 |
| Magadan_Oblast | place | a card's places (every card of it) | adm1:rus:ru-mag | admin1 | face | gru-081 |
| Magas | place | a card's places (every card of it) | adm1:rus:ru-in | admin1 | face | gru-569 |
| Magellan_expedition | place | a card's places (every card of it) | pl:q210887 | town | dot | wh-663 |
| Maginot_Line | place | a card's places (every card of it) | pl:q22640 | town | dot | ww2-134 |
| Maison_Carrée | place | a card's places (every card of it) | pl:q42807 | city | dot | rm-979 |
| Majuro | place | a card's places (every card of it) | adm0:mhl | country | face | gw-715 |
| Makhachkala | place | a card's places (every card of it) | adm1:rus:ru-da | admin1 | face | gru-511 |
| Malabo | place | a card's places (every card of it) | adm0:gnq | country | face | gw-650 |
| Malé | place | a card's places (every card of it) | adm0:mdv | country | face | gw-673 |
| Managua | place | a card's places (every card of it) | adm0:nic | country | face | gw-609 |
| Manama | place | a card's places (every card of it) | adm0:bhr | country | face | gw-654 |
| Mao_Kun_map | place | a card's places (every card of it) | city:1159151385 | city | dot | cnh-981 |
| Maputo | place | a card's places (every card of it) | adm0:moz | country | face | gw-546 |
| Mariehamn | place | a card's places (every card of it) | adm0:ald | country | face | gw-717 |
| Marigot,_Saint_Martin | place | a card's places (every card of it) | adm0:maf | country | face | gw-718 |
| Maseru | place | a card's places (every card of it) | adm0:lso | country | face | gw-647 |
| Mata-Utu | place | a card's places (every card of it) | adm0:wlf | country | face | gw-723 |
| Maykop | place | a card's places (every card of it) | adm1:rus:ru-ad | admin1 | face | gru-573 |
| Mbabane | place | a card's places (every card of it) | adm0:swz | country | face | gw-660 |
| Medes | place | a card's places (every card of it) | city:1159150133 | town | dot | wh-299 |
| Memorial_Hall_of_the_Victims_in_Nanjing_Massacre_by_Japanese_Invaders | place | a card's places (every card of it) | city:1159151385 | city | dot | cnh-655 |
| Milliarium_Aureum | place | a card's places (every card of it) | pl:q180212 | site | dot | rm-991 |
| Milwaukee | place | a card's places (every card of it) | adm1:usa:us-wi | admin1 | face | geo-731 |
| Minneapolis | place | a card's places (every card of it) | adm1:usa:us-mn | admin1 | face | geo-717 |
| Minoan_Kythera | place | a card's places (every card of it) | pl:q114571906 | site | dot | gr-049 |
| Minoan_palace | place | a card's places (every card of it) | reg:1159102805 | island | dot | gr-009 |
| Minoan_road | place | a card's places (every card of it) | reg:1159102805 | island | dot | gr-036 |
| Minoan_water_management | place | a card's places (every card of it) | reg:1159102805 | island | dot | gr-037 |
| MMA_507 | place | a card's places (every card of it) | pl:q373909 | site | dot | eg-158 |
| Mogadishu | place | a card's places (every card of it) | adm0:som | country | face | gw-568 |
| Monrovia | place | a card's places (every card of it) | adm0:lbr | country | face | gw-618 |
| Montevideo | place | a card's places (every card of it) | adm0:ury | country | face | gw-634 |
| Montgomery_(Alabama) | place | a card's places (every card of it) | adm1:usa:us-al | admin1 | face | geo-537 |
| Montpelier | place | a card's places (every card of it) | adm1:usa:us-vt | admin1 | face | geo-542 |
| Moroni | place | a card's places (every card of it) | adm0:com | country | face | gw-663 |
| Murmansk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-mur | admin1 | face | gru-065 |
| Muromachi_period | place | a card's places (every card of it) | city:1159149967 | city | dot | wh-538 |
| Muscat | place | a card's places (every card of it) | adm0:omn | country | face | gw-625 |
| Mycenaean_Knossos | place | a card's places (every card of it) | pl:q173527 | site | dot | gr-051 |
| Mycenaean_Miletus | place | a card's places (every card of it) | pl:q169460 | site | dot | gr-098 |
| N'Djamena | place | a card's places (every card of it) | adm0:tcd | country | face | gw-565 |
| Nalchik | place | a card's places (every card of it) | adm1:rus:ru-kb | admin1 | face | gru-556 |
| Nanchang | place | a card's places (every card of it) | adm1:chn:cn-jx | admin1 | face | gc-513 |
| Nanning | place | a card's places (every card of it) | adm1:chn:cn-gx | admin1 | face | gc-511 |
| Nanzhao | place | a card's places (every card of it) | pl:q855228 | town | dot | cnh-386 |
| Naryan-Mar | place | a card's places (every card of it) | adm1:rus:ru-nen | admin1 | face | gru-583 |
| Nashville | place | a card's places (every card of it) | adm1:usa:us-tn | admin1 | face | geo-534 |
| Nassau | place | a card's places (every card of it) | adm0:bhs | country | face | gw-677 |
| National_Diet | place | a card's places (every card of it) | pl:q1338856 | site | dot | pea-037 |
| National_People's_Congress | place | a card's places (every card of it) | pl:q72891 | site | dot | pea-013 |
| Naypyidaw | place | a card's places (every card of it) | adm0:mmr | country | face | gw-527 |
| New_Delhi | place | a card's places (every card of it) | adm0:ind | country | face | gw-501 |
| New_France | place | a card's places (every card of it) | city:1159151065 | town | dot | wh-681 |
| New_Orleans | place | a card's places (every card of it) | adm1:usa:us-la | admin1 | face | geo-708 |
| New_York_(state) | place | a card's places — several candidates — adm1:usa:us-ny New York; city:1159151575 New York City | adm1:usa:us-ny, city:1159151575 |  |  | geo-011 wh-907 |
| New_York_City | place | a card's places (every card of it) | adm1:usa:us-ny | admin1 | face | geo-711 |
| Newark_(New_Jersey) | place | a card's places (every card of it) | adm1:usa:us-nj | admin1 | face | geo-718 |
| Ngerulmud | place | a card's places (every card of it) | adm0:plw | country | face | gw-720 |
| Niamey | place | a card's places (every card of it) | adm0:ner | country | face | gw-555 |
| Nicosia | place | a card's places — several candidates — adm0:cnm Cyprus No Mans Area; adm0:cyn Northern Cyprus; adm0:cyp Cyprus | adm0:cnm, adm0:cyn, adm0:cyp |  |  | gw-658 |
| Nizhny_Novgorod_Oblast | place | a card's places (every card of it) | adm1:rus:ru-niz | admin1 | face | gru-013 |
| Northern_Han | place | a card's places (every card of it) | city:1159151365 | city | dot | cnh-410 |
| Nouakchott | place | a card's places (every card of it) | adm0:mrt | country | face | gw-626 |
| Nouméa | place | a card's places (every card of it) | adm0:ncl | country | face | gw-680 |
| Novgorod_Oblast | place | a card's places (every card of it) | adm1:rus:ru-ngr | admin1 | face | gru-067 |
| Novosibirsk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-nvs | admin1 | face | gru-016 |
| Nubia | place | a card's places (every card of it) | pl:q1107569 | site | dot | wh-229 |
| Nuku'alofa | place | a card's places (every card of it) | adm0:ton | country | face | gw-694 |
| Nuuk | place | a card's places (every card of it) | adm0:grl | country | face | gw-704 |
| Oklahoma_City | place | a card's places (every card of it) | adm1:usa:us-ok | admin1 | face | geo-510 |
| Old_St._Peter's_Basilica | place | a card's places (every card of it) | pl:q1053000 | hill | dot | rm-593 |
| Omaha | place | a card's places (every card of it) | adm1:usa:us-ne | admin1 | face | geo-747 |
| Omsk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-oms | admin1 | face | gru-026 |
| Oracle_of_Ammon | place | a card's places (every card of it) | pl:q2008735 | region | dot | gr-721 |
| Oranjestad | place | a card's places (every card of it) | adm0:abw | country | face | gw-692 |
| Orenburg_Oblast | place | a card's places (every card of it) | adm1:rus:ru-ore | admin1 | face | gru-025 |
| Oryol_Oblast | place | a card's places (every card of it) | adm1:rus:ru-orl | admin1 | face | gru-062 |
| Oslo | place | a card's places (every card of it) | adm0:nor | country | face | gw-619 |
| Ottawa | place | a card's places (every card of it) | adm0:can | country | face | gw-537 |
| Ouagadougou | place | a card's places (every card of it) | adm0:bfa | country | face | gw-559 |
| Pago_Pago | place | a card's places (every card of it) | adm0:asm | country | face | gw-707 |
| Pagoda_of_Fogong_Temple | place | a card's places (every card of it) | pl:q1197322 | region | dot | cnh-418 |
| Palikir | place | a card's places (every card of it) | adm0:fsm | country | face | gw-691 |
| Panama_City | place | a card's places (every card of it) | adm0:pan | country | face | gw-629 |
| Papeete | place | a card's places (every card of it) | adm0:pyf | country | face | gw-682 |
| Paramaribo | place | a card's places (every card of it) | adm0:sur | country | face | gw-669 |
| Peking_Man | place | a card's places (every card of it) | pl:q13659137 | town | dot | wh-025 |
| Penza_Oblast | place | a card's places (every card of it) | adm1:rus:ru-pnz | admin1 | face | gru-035 |
| Pereyaslavets | place | a card's places (every card of it) | pl:q182428 | city | dot | ru-050 |
| Perm | place | a card's places (every card of it) | adm1:rus:ru-per | admin1 | face | gru-518 |
| Petropavlovsk-Kamchatsky | place | a card's places (every card of it) | adm1:rus:ru-kam | admin1 | face | gru-577 |
| Petrozavodsk | place | a card's places (every card of it) | adm1:rus:ru-kr | admin1 | face | gru-571 |
| Philipsburg | place | a card's places (every card of it) | adm0:sxm | country | face | gw-710 |
| Phnom_Penh | place | a card's places (every card of it) | adm0:khm | country | face | gw-573 |
| Phoenicia | place | a card's places (every card of it) | pl:q3991738 | site | dot | wh-293 |
| Phoenix_(Arizona) | place | a card's places (every card of it) | adm1:usa:us-az | admin1 | face | geo-525 |
| Pierre_(South_Dakota) | place | a card's places (every card of it) | adm1:usa:us-sd | admin1 | face | geo-548 |
| Pingjin_campaign | place | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-625 |
| Podgorica | place | a card's places (every card of it) | adm0:mne | country | face | gw-670 |
| Pomerium | place | a card's places (every card of it) | city:1159151593 | capital | dot | rm-087 |
| Pons_Fabricius | place | a card's places (every card of it) | pl:q545404 | island | dot | rm-993 |
| Pont_du_Gard | place | a card's places (every card of it) | pl:q379644 | town | dot | rm-989 |
| Port_Louis | place | a card's places (every card of it) | adm0:mus | country | face | gw-659 |
| Port_Moresby | place | a card's places (every card of it) | adm0:png | country | face | gw-592 |
| Port_Vila | place | a card's places (every card of it) | adm0:vut | country | face | gw-679 |
| Port-au-Prince | place | a card's places (every card of it) | adm0:hti | country | face | gw-583 |
| Port-of-Spain | place | a card's places (every card of it) | adm0:tto | country | face | gw-657 |
| Porto-Novo | place | a card's places (every card of it) | adm0:ben | country | face | gw-576 |
| Praia | place | a card's places (every card of it) | adm0:cpv | country | face | gw-674 |
| Pretoria | place | a card's places (every card of it) | adm0:zaf | country | face | gw-524 |
| Pristina | place | a card's places (every card of it) | adm0:kos | country | face | gw-653 |
| Protectorate_of_Bohemia_and_Moravia | place | a card's places (every card of it) | city:1159151359 | capital | dot | ww2-122 |
| Providence | place | a card's places (every card of it) | adm1:usa:us-ri | admin1 | face | geo-504 |
| Pskov_Oblast | place | a card's places (every card of it) | adm1:rus:ru-psk | admin1 | face | gru-066 |
| Putrajaya | place | a card's places (every card of it) | adm0:mys | country | face | gw-754 |
| Pyramid_of_Khafre | place | a card's places (every card of it) | city:1159146947 | city | dot | eg-109 |
| Pyramid_of_Menkaure | place | a card's places (every card of it) | city:1159146947 | city | dot | eg-112 |
| Pytheas | place | a card's places (every card of it) | city:1159150037 | city | dot | gr-837 |
| Qajar_Iran | place | a card's places (every card of it) | city:1159151551 | capital | dot | wh-863 |
| Qin_after_Shang_Yang | place | a card's places (every card of it) | pol:qin | polity | face | cnh-170 |
| Quito | place | a card's places (every card of it) | adm0:ecu | country | face | gw-571 |
| Rabat | place | a card's places (every card of it) | adm0:mar | country | face | gw-539 |
| Raleigh | place | a card's places (every card of it) | adm1:usa:us-nc | admin1 | face | geo-529 |
| Red_Pyramid | place | a card's places (every card of it) | pl:q685414 | site | dot | eg-102 |
| Reykjavík | place | a card's places (every card of it) | adm0:isl | country | face | gw-678 |
| Rhodes | place | a card's places — several candidates — pl:q188731 Rhodes (city); reg:1159102803 Rhodes | pl:q188731, reg:1159102803 |  |  | gr-763 gr-764 gr-809 gr-831 |
| Richmond | place | a card's places (every card of it) | adm1:usa:us-va | admin1 | face | geo-522 |
| Riga | place | a card's places (every card of it) | adm0:lva | country | face | gw-651 |
| Riyadh | place | a card's places (every card of it) | adm0:sau | country | face | gw-545 |
| Road_Town | place | a card's places (every card of it) | adm0:vgb | country | face | gw-712 |
| Roman_Dacia | place | a card's places (every card of it) | pl:q12725121 | town | dot | rm-777 |
| Roman_Italy | place | a card's places (every card of it) | city:1159151593 | capital | dot | rm-180 |
| Roseau | place | a card's places (every card of it) | adm0:dma | country | face | gw-702 |
| Rostov_Oblast | place | a card's places (every card of it) | adm1:rus:ru-ros | admin1 | face | gru-006 |
| Rostov-on-Don | place | a card's places (every card of it) | adm1:rus:ru-ros | admin1 | face | gru-506 |
| Route_from_the_Varangians_to_the_Greeks | place | a card's places (every card of it) | pl:q4163154 | river | dot | ru-034 |
| Ryazan_Oblast | place | a card's places (every card of it) | adm1:rus:ru-rya | admin1 | face | gru-045 |
| Sacramento | place | a card's places (every card of it) | adm1:usa:us-ca | admin1 | face | geo-501 |
| Saint_George's | place | a card's places (every card of it) | adm0:grd | country | face | gw-690 |
| Saint_John's | place | a card's places (every card of it) | adm0:atg | country | face | gw-697 |
| Saint_Peter_Port | place | a card's places (every card of it) | adm0:ggy | country | face | gw-701 |
| Saint_Sophia_Cathedral,_Kyiv | place | a card's places (every card of it) | city:1159151495 | capital | dot | ru-059 |
| Saint-Pierre,_Saint_Pierre_and_Miquelon | place | a card's places (every card of it) | adm0:spm | country | face | gw-726 |
| Salekhard | place | a card's places (every card of it) | adm1:rus:ru-yan | admin1 | face | gru-572 |
| Salem | place | a card's places (every card of it) | adm1:usa:us-or | admin1 | face | geo-524 |
| Salt_Lake_City | place | a card's places (every card of it) | adm1:usa:us-ut | admin1 | face | geo-516 |
| Samara_Oblast | place | a card's places (every card of it) | adm1:rus:ru-sam | admin1 | face | gru-012 |
| San_José | place | a card's places (every card of it) | adm0:cri | country | face | gw-627 |
| San_Juan | place | a card's places (every card of it) | adm0:pri | country | face | gw-635 |
| San_Salvador | place | a card's places (every card of it) | adm0:slv | country | face | gw-612 |
| Sana'a | place | a card's places (every card of it) | adm0:yem | country | face | gw-538 |
| Santa_Fe | place | a card's places (every card of it) | adm1:usa:us-nm | admin1 | face | geo-526 |
| Santiago | place | a card's places (every card of it) | adm0:chl | country | face | gw-566 |
| São_Tomé | place | a card's places (every card of it) | adm0:stp | country | face | gw-683 |
| Saransk | place | a card's places (every card of it) | adm1:rus:ru-mo | admin1 | face | gru-558 |
| Saratov | place | a card's places — several candidates — adm1:rus:ru-sar Saratov; city:1159149575 Saratov | adm1:rus:ru-sar, city:1159149575 |  |  | gru-520 ww2-158 |
| Saratov_Oblast | place | a card's places (every card of it) | adm1:rus:ru-sar | admin1 | face | gru-020 |
| Second_Battle_of_Bedriacum | place | a card's places (every card of it) | pl:q6231 | city | dot | rm-461 |
| Second_Temple | place | a card's places (every card of it) | pl:q193163 | hill | dot | rm-470 |
| Seven_Hills_of_Rome | place | a card's places (every card of it) | city:1159151593 | capital | dot | rm-048 |
| Seven_warring_states | place | a card's places — several candidates — pol:chu Chu; pol:han_state Han (state); pol:qi Qi; pol:qin Qin; pol:wei Wei; pol:yan Yan; pol:zhao Zhao | pol:chu, pol:han_state, pol:qi |  |  | cnh-164 |
| Shenyang | place | a card's places (every card of it) | adm1:chn:cn-ln | admin1 | face | gc-514 |
| Shijiazhuang | place | a card's places (every card of it) | adm1:chn:cn-he | admin1 | face | gc-506 |
| Siege_of_Baghdad | place | a card's places (every card of it) | city:1159151547 | capital | dot | wh-597 |
| Siege_of_Jerusalem_(70_CE) | place | a card's places (every card of it) | city:1159151203 | capital | dot | rm-469 |
| Siege_of_Tarentum_(272_BC) | place | a card's places (every card of it) | pl:q13498 | city | dot | rm-169 |
| Siege_of_Warsaw_(1939) | place | a card's places (every card of it) | city:1159151299 | capital | dot | ww2-145 |
| Sioux_Falls | place | a card's places (every card of it) | adm1:usa:us-sd | admin1 | face | geo-748 |
| Sixteen_Prefectures | place | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-400 |
| Skhul_and_Qafzeh_hominins | place | a card's places (every card of it) | pl:q2121357 | site | dot | wh-087 |
| Skopje | place | a card's places (every card of it) | adm0:mkd | country | face | gw-652 |
| Smolensk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-smo | admin1 | face | gru-057 |
| Sofia | place | a card's places (every card of it) | adm0:bgr | country | face | gw-611 |
| Solarium_Augusti | place | a card's places (every card of it) | pl:q242839 | region | dot | rm-841 |
| Southern_Ming | place | a card's places (every card of it) | city:1159151385 | city | dot | cnh-539 |
| Southern_Tang | place | a card's places (every card of it) | city:1159151385 | city | dot | cnh-406 |
| Soviet_Union | place | a card's places (every card of it) | city:1159151585 | capital | dot | wh-900 |
| Spice_trade | place | a card's places (every card of it) | pl:q739411 | island-group | dot | wh-563 |
| Sri_Jayawardenepura_Kotte | place | a card's places (every card of it) | adm0:lka | country | face | gw-561 |
| St._Paul | place | a card's places (every card of it) | adm1:usa:us-mn | admin1 | face | geo-517 |
| Stanley,_Falkland_Islands | place | a card's places (every card of it) | adm0:flk | country | face | gw-729 |
| Stavropol | place | a card's places (every card of it) | adm1:rus:ru-sta | admin1 | face | gru-514 |
| Stockholm | place | a card's places (every card of it) | adm0:swe | country | face | gw-593 |
| Sucre | place | a card's places (every card of it) | adm0:bol | country | face | gw-579 |
| Sudetenland | place | a card's places (every card of it) | pl:q384544 | city | dot | ww2-117 |
| Suez_Canal | place | a card's places (every card of it) | city:1159149855 | town | dot | wh-800 |
| Sugar_plantations_in_the_Caribbean | place | a card's places (every card of it) | city:1159150339 | capital | dot | wh-730 |
| Sui_long_walls | place | a card's places (every card of it) | pl:q515712 | city | dot | cnh-352 |
| Suva | place | a card's places (every card of it) | adm0:fji | country | face | gw-662 |
| Sverdlovsk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-sve | admin1 | face | gru-005 |
| Swahili_coast | place | a card's places (every card of it) | city:1159150829 | town | dot | wh-577 |
| Syktyvkar | place | a card's places (every card of it) | adm1:rus:ru-ko | admin1 | face | gru-561 |
| Tallahassee | place | a card's places (every card of it) | adm1:usa:us-fl | admin1 | face | geo-503 |
| Tallinn | place | a card's places (every card of it) | adm0:est | country | face | gw-656 |
| Tambov_Oblast | place | a card's places (every card of it) | adm1:rus:ru-tam | admin1 | face | gru-053 |
| Tarawa | place | a card's places (every card of it) | adm0:kir | country | face | gw-688 |
| Tashkent | place | a card's places (every card of it) | adm0:uzb | country | face | gw-543 |
| Tbilisi | place | a card's places (every card of it) | adm0:geo | country | face | gw-631 |
| Tegucigalpa | place | a card's places (every card of it) | adm0:hnd | country | face | gw-589 |
| Temple_of_Hera,_Olympia | place | a card's places (every card of it) | pl:q38888 | site | dot | gr-342 |
| The_Valley,_Anguilla | place | a card's places (every card of it) | adm0:aia | country | face | gw-719 |
| Theatre_of_Pompey | place | a card's places (every card of it) | pl:q242839 | region | dot | rm-880 |
| Thimphu | place | a card's places (every card of it) | adm0:btn | country | face | gw-666 |
| Three_Fanzhen_of_Hebei | place | a card's places (every card of it) | pl:q59898 | region | dot | cnh-379 |
| Throne_Room_at_Knossos | place | a card's places (every card of it) | pl:q173527 | site | dot | gr-010 |
| Tianyi_Pavilion | place | a card's places (every card of it) | city:1159149925 | city | dot | cnh-938 |
| Tibetan_Empire | place | a card's places (every card of it) | city:1159150879 | town | dot | cnh-384 |
| Timur | place | a card's places (every card of it) | city:1159150569 | town | dot | wh-599 |
| Tirana | place | a card's places (every card of it) | adm0:alb | country | face | gw-646 |
| Tokyo | place | a card's places (every card of it) | adm0:jpn | country | face | gw-512 |
| Tomb_of_Eurysaces_the_Baker | place | a card's places (every card of it) | pl:q751318 | site | dot | rm-971 |
| Tomsk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-tom | admin1 | face | gru-046 |
| Topeka | place | a card's places (every card of it) | adm1:usa:us-ks | admin1 | face | geo-546 |
| Tórshavn | place | a card's places (every card of it) | adm0:fro | country | face | gw-705 |
| Toumba_building | place | a card's places (every card of it) | pl:q634655 | site | dot | gr-117 |
| Treasuries_at_Delphi | place | a card's places (every card of it) | pl:q75459 | site | dot | gr-345 |
| Trenton | place | a card's places (every card of it) | adm1:usa:us-nj | admin1 | face | geo-518 |
| Tripoli | place | a card's places (every card of it) | adm0:lby | country | face | gw-606 |
| Troy_VIIa | place | a card's places (every card of it) | pl:q22647 | site | dot | gr-103 |
| Tula_Oblast | place | a card's places (every card of it) | adm1:rus:ru-tul | admin1 | face | gru-032 |
| Tula,_Russia | place | a card's places — several candidates — adm1:rus:ru-tul Tula; pl:q1353133 Tula de Allende, Hidalgo | adm1:rus:ru-tul, pl:q1353133 |  |  | gru-532 wh-604 |
| Tunis | place | a card's places (every card of it) | adm0:tun | country | face | gw-580 |
| Tver_Oblast | place | a card's places (every card of it) | adm1:rus:ru-tve | admin1 | face | gru-036 |
| Tyumen_Oblast | place | a card's places (every card of it) | adm1:rus:ru-tyu | admin1 | face | gru-009 |
| Ufa | place | a card's places (every card of it) | adm1:rus:ru-ba | admin1 | face | gru-507 |
| Uganda_Railway | place | a card's places (every card of it) | city:1159151597 | capital | dot | wh-850 |
| Ulaanbaatar | place | a card's places (every card of it) | adm0:mng | country | face | gw-633 |
| Ulyanovsk_Oblast | place | a card's places (every card of it) | adm1:rus:ru-uly | admin1 | face | gru-038 |
| Urbanisation | place | a card's places (every card of it) | city:1159149119 | city | dot | wh-788 |
| Ürümqi | place | a card's places (every card of it) | adm1:chn:cn-xj | admin1 | face | gc-521 |
| Vaduz | place | a card's places (every card of it) | adm0:lie | country | face | gw-711 |
| Valletta | place | a card's places (every card of it) | adm0:mlt | country | face | gw-672 |
| Valparaíso | place | a card's places (every card of it) | adm0:chl | country | face | gw-757 |
| Vandal_Kingdom | place | a card's places (every card of it) | pl:q6343 | site | dot | rm-627 |
| Veliky_Novgorod | place | a card's places — several candidates — city:1159146503 Veliky Novgorod; adm1:rus:ru-ngr Novgorod | city:1159146503, adm1:rus:ru-ngr |  |  | gru-567 ru-040 ru-058 ru-065 +1 |
| Via_Domiziana | place | a card's places (every card of it) | pl:q1349926 | site | dot | rm-992 |
| Via_Egnatia | place | a card's places (every card of it) | city:1159150955 | town | dot | gr-862 |
| Via_Flaminia | place | a card's places (every card of it) | city:1159151593 | capital | dot | rm-173 |
| Vientiane | place | a card's places (every card of it) | adm0:lao | country | face | gw-603 |
| Villa_Romana_del_Casale | place | a card's places (every card of it) | pl:q56208 | town | dot | rm-978 |
| Vilnius | place | a card's places (every card of it) | adm0:ltu | country | face | gw-639 |
| Vinland | place | a card's places (every card of it) | pl:q189113 | site | dot | wh-501 |
| Virginia_Beach | place | a card's places (every card of it) | adm1:usa:us-va | admin1 | face | geo-722 |
| Vladimir_Oblast | place | a card's places (every card of it) | adm1:rus:ru-vla | admin1 | face | gru-033 |
| Vladivostok | place | a card's places (every card of it) | adm1:rus:ru-pri | admin1 | face | gru-527 |
| Volgograd_Oblast | place | a card's places (every card of it) | adm1:rus:ru-vgg | admin1 | face | gru-019 |
| Vologda_Oblast | place | a card's places (every card of it) | adm1:rus:ru-vlg | admin1 | face | gru-040 |
| Voronezh_Oblast | place | a card's places (every card of it) | adm1:rus:ru-vor | admin1 | face | gru-022 |
| Washington,_D.C. | place | a card's places (every card of it) | adm0:usa | country | face | gw-503 |
| Weiyang_Palace | place | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-242 |
| Wellington | place | a card's places (every card of it) | adm0:nzl | country | face | gw-623 |
| West_Market_(Chang'an) | place | a card's places (every card of it) | city:1159151363 | city | dot | cnh-368 |
| Western_Xia | place | a card's places (every card of it) | city:1159150889 | town | dot | cnh-465 |
| White_Chapel | place | a card's places (every card of it) | pl:q522862 | site | dot | eg-182 |
| Wichita | place | a card's places (every card of it) | adm1:usa:us-ks | admin1 | face | geo-746 |
| Willemstad | place | a card's places (every card of it) | adm0:cuw | country | face | gw-687 |
| Wilmington_(Delaware) | place | a card's places (every card of it) | adm1:usa:us-de | admin1 | face | geo-739 |
| Wilusa | place | a card's places (every card of it) | pl:q22647 | site | dot | gr-106 |
| Windhoek | place | a card's places (every card of it) | adm0:nam | country | face | gw-638 |
| Wuyue | place | a card's places (every card of it) | city:1159151387 | city | dot | cnh-405 |
| Xining | place | a card's places (every card of it) | adm1:chn:cn-qh | admin1 | face | gc-530 |
| Yakutsk | place | a card's places (every card of it) | adm1:rus:ru-sa | admin1 | face | gru-547 |
| Yamoussoukro | place | a card's places (every card of it) | adm0:civ | country | face | gw-550 |
| Yan_(state) | place | a card's places — several candidates — pl:q6192085 Ji (Beijing); pol:yan Yan | pl:q6192085, pol:yan |  |  | ko-056 |
| Yangtze_River_Crossing_campaign | place | a card's places (every card of it) | city:1159151385 | city | dot | cnh-626 |
| Yaoundé | place | a card's places (every card of it) | adm0:cmr | country | face | gw-552 |
| Yaren | place | a card's places (every card of it) | adm0:nru | country | face | gw-722 |
| Yaroslavl_Oblast | place | a card's places (every card of it) | adm1:rus:ru-yar | admin1 | face | gru-037 |
| Yehuling_Campaign | place | a card's places (every card of it) | city:1159147043 | city | dot | cnh-481 |
| Yerevan | place | a card's places (every card of it) | adm0:arm | country | face | gw-637 |
| Yugra | place | a card's places (every card of it) | adm1:rus:ru-khm | admin1 | face | ru-078 |
| Yuzhno-Sakhalinsk | place | a card's places (every card of it) | adm1:rus:ru-sak | admin1 | face | gru-575 |
| Zagreb | place | a card's places (every card of it) | adm0:hrv | country | face | gw-630 |
| Zhang_Qian | place | a card's places (every card of it) | pl:q515573 | city | dot | cnh-229 |
| Zhengzhou | place | a card's places (every card of it) | adm1:chn:cn-ha | admin1 | face | gc-503 |
| Ziggurat | place | a card's places (every card of it) | pl:q5699 | site | dot | wh-177 |

### Tier 4 — A coordinate, no registry id (318)

a card answered by this term (or whose locator is named for it) has a `locator.at`; the window can draw the dot today, a registry id needs `migrate-places.js`.

| term | class | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|---|
| 1989_Tiananmen_Square_protests_and_massacre | event | a card's locator coordinate — wh-986 | 116.3917,39.9033 | coordinate | dot | wh-986 |
| 2019_Hong_Kong_Polytechnic_University_campus_conflict | event | a card's locator coordinate — pea-185 | 114.18,22.305 | coordinate | dot | pea-185 |
| Ajax_the_Great | event | a card's locator coordinate — gr-950 | 23.5,37.9333 | coordinate | dot | gr-950 gr-598 |
| Alexander_the_Great | event | a card's locator coordinate — gr-701 | 22.5211,40.7547 | coordinate | dot | wh-333 gr-701 |
| Algerian_War | event | a card's locator coordinate — wh-978 | 3.0872,36.7325 | coordinate | dot | wh-978 |
| An_Lushan_Rebellion | event | a card's locator coordinate — wh-527 cnh-378 | 116.3975,39.9067 | coordinate | dot | wh-527 cnh-378 |
| Assassination_of_Julius_Caesar | event | a card's locator coordinate — wh-356 | 12.4769,41.8953 | coordinate | dot | wh-356 rm-369 |
| Atomic_bombings_of_Hiroshima_and_Nagasaki | event | a card's locator coordinate — wh-940 | 132.4519,34.3914 | coordinate | dot | wh-940 |
| Bacchanalian_affair | event | a card's locator coordinate — rm-274 | 16.5083,38.9458 | coordinate | dot | rm-274 |
| Battle_of_Cynossema | event | a card's locator coordinate — gr-571 | 26.3878,40.1424 | coordinate | dot | gr-571 |
| Battle_of_Lepanto | event | a card's locator coordinate — wh-692 | 21.25,38.25 | coordinate | dot | wh-692 |
| Battle_of_Shanghai | event | a card's locator coordinate — cnh-636 | 121.4692,31.2325 | coordinate | dot | ww2-097 cnh-636 |
| Berlin_Blockade | event | a card's locator coordinate — wh-950 | 13.405,52.52 | coordinate | dot | wh-950 |
| Bombard | event | a card's locator coordinate — wh-686 | 28.9233,41.0181 | coordinate | dot | wh-686 |
| Bombing_of_Chongqing | event | a card's locator coordinate — cnh-640 | 106.5504,29.5637 | coordinate | dot | cnh-640 |
| Boxer_Rebellion | event | a card's locator coordinate — wh-843 cnh-572 | 116.3975,39.9067 | coordinate | dot | wh-843 cnh-572 |
| Callimachus_(polemarch) | event | a card's locator coordinate — gr-807 | 21.8625,32.8225 | coordinate | dot | gr-807 gr-405 |
| Central_Military_Commission_(China) | event | a card's locator coordinate — pea-009 | 116.321,39.9075 | coordinate | dot | pea-009 |
| Cilician_piracy | event | a card's locator coordinate — rm-331 | 32.8026,36.0243 | coordinate | dot | rm-331 |
| Civil_war_of_83_BCE | event | a card's locator coordinate — rm-316 | 17.9333,40.6333 | coordinate | dot | rm-316 |
| Classic_Maya_collapse | event | a card's locator coordinate — wh-602 | -89.9,16.9 | coordinate | dot | wh-602 |
| Cocoliztli | event | a card's locator coordinate — wh-670 | -97.4833,17.5167 | coordinate | dot | wh-670 |
| Conflict_of_the_Orders | event | a card's locator coordinate — rm-101 | 12.4828,41.8933 | coordinate | dot | wh-343 rm-101 |
| Council_of_Chalcedon | event | a card's locator coordinate — rm-618 | 29.0272,40.9844 | coordinate | dot | rm-618 |
| Crossing_of_the_Rhine | event | a card's locator coordinate — rm-625 | 8.2736,49.9994 | coordinate | dot | rm-625 |
| Death_of_Cicero | event | a card's locator coordinate — rm-376 | 13.5667,41.2167 | coordinate | dot | rm-376 |
| Destruction_of_Carthage | event | a card's locator coordinate — wh-348 | 10.3239,36.8522 | coordinate | dot | wh-348 rm-235 |
| Di_Qing | event | a card's locator coordinate — cnh-429 | 108.3275,22.8167 | coordinate | dot | cnh-429 |
| Diocletian | event | a card's locator coordinate — rm-566 | 29.9175,40.7625 | coordinate | dot | wh-371 rm-566 |
| Dissolution_of_the_Soviet_Union | event | a card's locator coordinate — wh-987 | 23.95,52.6167 | coordinate | dot | wh-987 |
| Double_Tenth_Agreement | event | a card's locator coordinate — cnh-620 | 106.5504,29.5637 | coordinate | dot | cnh-620 |
| Emperor_Wu_of_Han | event | a card's locator coordinate — cnh-223 | 108.8583,34.3083 | coordinate | dot | ko-058 cnh-223 |
| Etruscan_sea_power | event | a card's locator coordinate — rm-041 | 11.8389,42.2279 | coordinate | dot | rm-041 |
| Feast_at_Hong_Gate | event | a card's locator coordinate — cnh-217 | 109.2177,34.3754 | coordinate | dot | cnh-217 |
| February_28_incident | event | a card's locator coordinate — pea-136 | 121.5147,25.0417 | coordinate | dot | cnh-693 pea-136 |
| First_Servile_War | event | a card's locator coordinate — rm-280 | 14.2761,37.5633 | coordinate | dot | rm-280 |
| First_Sino-Japanese_War | event | a card's locator coordinate — the cards disagree — wh-846 cnh-570 | 130.9414,33.9578 | coordinate | dot | wh-846 cnh-570 |
| Foedus_Cassianum | event | a card's locator coordinate — rm-100 | 12.7,41.73 | coordinate | dot | rm-100 |
| Founding_of_Rome | event | a card's locator coordinate — rm-052 wh-338 | 12.4869,41.8883 | coordinate | dot | rm-052 wh-338 |
| Greek_fire | event | a card's locator coordinate — ru-044 | 28.98,41.0125 | coordinate | dot | wh-443 ru-044 |
| Handover_of_Hong_Kong | event | a card's locator coordinate — cnh-689 | 114.2,22.3 | coordinate | dot | cnh-689 |
| Heilongjiang_hand_cannon | event | a card's locator coordinate — cnh-979 | 126.9671,45.5368 | coordinate | dot | cnh-979 |
| Herero_and_Nama_genocide | event | a card's locator coordinate — wh-834 | 17.2167,-20.4167 | coordinate | dot | wh-834 |
| Hungarian_Revolution_of_1956 | event | a card's locator coordinate — wh-958 | 19.0514,47.4925 | coordinate | dot | wh-958 |
| Hyperinflation_in_the_Weimar_Republic | event | a card's locator coordinate — wh-906 | 13.405,52.52 | coordinate | dot | ww2-019 wh-906 |
| Invasion_of_Poland | event | a card's locator coordinate — wh-918 | 21.0111,52.23 | coordinate | dot | wh-918 |
| Julius_Caesar | event | a card's locator coordinate — rm-343 | 12.4828,41.8933 | coordinate | dot | wh-353 rm-343 |
| Korean_War | event | a card's locator coordinate — wh-955 | 126.665,37.96 | coordinate | dot | wh-955 |
| Legio_II_Parthica | event | a card's locator coordinate — rm-541 | 12.6667,41.7333 | coordinate | dot | rm-541 |
| Liberation_of_Messenia | event | a card's locator coordinate — gr-673 | 21.92,37.175 | coordinate | dot | gr-673 |
| Liberation_of_Thebes | event | a card's locator coordinate — gr-666 | 23.3178,38.3208 | coordinate | dot | gr-666 |
| Lindisfarne_raid | event | a card's locator coordinate — wh-499 | -1.8025,55.68 | coordinate | dot | wh-499 |
| Macartney_Embassy | event | a card's locator coordinate — wh-720 cnh-556 | 117.9634,40.9515 | coordinate | dot | wh-720 cnh-556 |
| Machtergreifung | event | a card's locator coordinate — wh-913 | 13.405,52.52 | coordinate | dot | ww2-054 wh-913 |
| Ming_treasure_voyages | event | a card's locator coordinate — cnh-515 | 119.55,25.9167 | coordinate | dot | cnh-515 |
| Modu_Chanyu | event | a card's locator coordinate — cnh-226 | 113.367,40.097 | coordinate | dot | cnh-226 |
| Molotov-Ribbentrop_Pact | event | a card's locator coordinate — ww2-127 | 37.6173,55.7558 | coordinate | dot | ww2-127 wh-917 |
| Mongol_invasion_of_Europe | event | a card's locator coordinate — ru-099 | 20.9131,47.9778 | coordinate | dot | ru-099 |
| Naevius_Sutorius_Macro | event | a card's locator coordinate — rm-424 | 12.4847,41.8933 | coordinate | dot | rm-424 |
| Nanjing_Massacre | event | a card's locator coordinate — wh-928 cnh-637 | 118.7789,32.0608 | coordinate | dot | ww2-098 wh-928 cnh-637 |
| NATO | event | a card's locator coordinate — the cards disagree — wh-951 eep-035 | -77.0164,38.9047 | coordinate | dot | wh-951 eep-035 |
| Naumachia | event | a card's locator coordinate — rm-875 | 13.5472,41.995 | coordinate | dot | rm-875 |
| Nian_Rebellion | event | a card's locator coordinate — cnh-566 | 116.2703,33.5086 | coordinate | dot | cnh-566 |
| Pax_Romana | event | a card's locator coordinate — rm-525 | 12.4756,41.9064 | coordinate | dot | wh-359 rm-525 |
| People's_Liberation_Army | event | a card's locator coordinate — pea-005 | 116.321,39.9075 | coordinate | dot | pea-005 |
| Pisonian_conspiracy | event | a card's locator coordinate — rm-449 | 12.4833,41.8833 | coordinate | dot | rm-449 |
| Pyrrhus_of_Epirus | event | a card's locator coordinate — the cards disagree — rm-164 gr-846 | 20.7878,39.5464 | coordinate | dot | rm-164 gr-846 |
| Rebellion_of_the_Seven_States | event | a card's locator coordinate — cnh-222 | 115.656,34.415 | coordinate | dot | cnh-222 |
| Reform_and_opening_up | event | a card's locator coordinate — wh-990 | 114.0544,22.5467 | coordinate | dot | wh-990 cnh-680 |
| Roman_legion | event | a card's locator coordinate — rm-119 | 12.4772,41.8978 | coordinate | dot | wh-344 rm-642 rm-119 |
| Russian_Revolution | event | a card's locator coordinate — wh-896 | 30.3086,59.9375 | coordinate | dot | wh-896 |
| Sack_of_Corinth | event | a card's locator coordinate — gr-864 | 22.8802,37.9053 | coordinate | dot | rm-256 gr-864 |
| Sack_of_Rome_(455) | event | a card's locator coordinate — rm-632 | 12.4828,41.8933 | coordinate | dot | rm-632 |
| Seizure_of_the_Cadmea | event | a card's locator coordinate — gr-665 | 23.3178,38.3208 | coordinate | dot | gr-665 |
| Shandong_Problem | event | a card's locator coordinate — cnh-584 | 120.3827,36.0669 | coordinate | dot | cnh-584 ww2-030 |
| Shaqiu_plot | event | a card's locator coordinate — cnh-211 | 115.1426,37.0747 | coordinate | dot | cnh-211 |
| Siege_of_Athens_(404_BCE) | event | a card's locator coordinate — gr-870 | 23.7281,37.9842 | coordinate | dot | gr-578 gr-870 |
| Siege_of_Athens_(87-86_BCE) | event | a card's locator coordinate — gr-870 | 23.7281,37.9842 | coordinate | dot | gr-578 gr-870 |
| Siege_of_Leningrad | event | a card's locator coordinate — wh-925 | 30.3086,59.9375 | coordinate | dot | wh-925 |
| Siege_of_Ryazan | event | a card's locator coordinate — ru-096 | 40.4277,54.3971 | coordinate | dot | ru-096 |
| Social_War_(357–355_BCE) | event | a card's locator coordinate — rm-305 | 13.8352,42.1174 | coordinate | dot | gr-676 rm-305 |
| Social_War_(91–87_BCE) | event | a card's locator coordinate — rm-305 | 13.8352,42.1174 | coordinate | dot | gr-676 rm-305 |
| Soviet_invasion_of_Poland | event | a card's locator coordinate — ww2-146 | 23.6569,52.1347 | coordinate | dot | ww2-146 |
| Suez_Crisis | event | a card's locator coordinate — wh-977 | 32.3061,31.2625 | coordinate | dot | wh-977 |
| Sulla's_march_on_Rome | event | a card's locator coordinate — rm-313 | 12.4828,41.8933 | coordinate | dot | rm-313 ww2-038 |
| The_Blitz | event | a card's locator coordinate — wh-923 | -0.1275,51.5072 | coordinate | dot | wh-923 |
| Third_Servile_War | event | a card's locator coordinate — the cards disagree — rm-328 rm-327 | 15.6619,38.1114 | coordinate | dot | wh-352 rm-328 rm-327 |
| Titus_Flavius_Sabinus | event | a card's locator coordinate — rm-462 | 12.4831,41.8933 | coordinate | dot | rm-462 |
| Trail_of_Tears | event | a card's locator coordinate — wh-817 | -84.9086,34.5394 | coordinate | dot | us-079 wh-817 |
| Treaty_of_Apamea | event | a card's locator coordinate — gr-858 | 30.1656,38.0717 | coordinate | dot | rm-248 gr-858 |
| Treaty_of_Versailles | event | a card's locator coordinate — wh-893 | 2.1203,48.8047 | coordinate | dot | ww2-004 wh-893 |
| Treaty_of_Waitangi | event | a card's locator coordinate — wh-854 | 174.08,-35.2661 | coordinate | dot | wh-854 |
| Uluburun_shipwreck | event | a card's locator coordinate — wh-271 | 29.6858,36.1286 | coordinate | dot | gr-094 wh-271 |
| Unification_of_Germany | event | a card's locator coordinate — wh-804 | 2.1203,48.8047 | coordinate | dot | wh-804 |
| Unit_731 | event | a card's locator coordinate — cnh-650 | 126.6284,45.6033 | coordinate | dot | cnh-650 |
| Venezuelan_crisis_of_1902–1903 | event | a card's locator coordinate — pea-217 | -65,7 | coordinate | dot | pea-217 |
| Wall_Street_Crash_of_1929 | event | a card's locator coordinate — wh-907 | -74.0111,40.7069 | coordinate | dot | ww2-033 wh-907 |
| Wild_Lily_student_movement | event | a card's locator coordinate — cnh-697 pea-143 | 121.5217,25.0344 | coordinate | dot | cnh-697 pea-143 |
| Xi'an_Incident | event | a card's locator coordinate — cnh-617 | 109.2072,34.365 | coordinate | dot | cnh-617 |
| Xiang_Yu | event | a card's locator coordinate — cnh-215 | 118.275,33.963 | coordinate | dot | cnh-215 |
| Xinhai_Revolution | event | a card's locator coordinate — cnh-574 | 114.3404,30.5619 | coordinate | dot | cnh-574 |
| Yellow_Turban_Rebellion | event | a card's locator coordinate — cnh-268 | 115.1426,37.0747 | coordinate | dot | cnh-268 |
| Yue_Fei | event | a card's locator coordinate — cnh-450 | 114.358,35.924 | coordinate | dot | cnh-450 |
| Zapad_(military_exercise) | event | a card's locator coordinate — eep-285 | 27,53 | coordinate | dot | eep-285 |
| Zhuge_Liang's_Northern_Expeditions | event | a card's locator coordinate — cnh-283 | 107.3833,34.35 | coordinate | dot | cnh-283 |
| Ancestral_Puebloans | group | a card's locator coordinate — wh-619 | -108.4887,37.1838 | coordinate | dot | us-022 wh-619 |
| Bell_Beaker_culture | group | a card's locator coordinate — wh-273 | -3.6183,40.1592 | coordinate | dot | wh-273 |
| Chavín_culture | group | a card's locator coordinate — wh-432 | -77.1785,-9.5928 | coordinate | dot | wh-432 |
| Cimmerians | group | a card's locator coordinate — ru-004 | 44.5301,48.3565 | coordinate | dot | ru-004 |
| Clovis_culture | group | a card's locator coordinate — wh-101 | -103.3246,34.2779 | coordinate | dot | wh-101 us-006 |
| Cumans | group | a card's locator coordinate — ru-074 | 44.1323,47.4346 | coordinate | dot | ru-074 |
| Desert_Fathers | group | a card's locator coordinate — rm-613 | 30.3333,30.5833 | coordinate | dot | rm-613 |
| El_Omari_culture | group | a card's locator coordinate — eg-017 | 31.3333,29.8453 | coordinate | dot | eg-017 |
| Erlitou_culture | group | a card's locator coordinate — wh-243 cnh-062 | 112.689,34.693 | coordinate | dot | wh-243 cnh-062 |
| Garamantes | group | a card's locator coordinate — wh-421 | 13.064,26.544 | coordinate | dot | wh-421 |
| Goths | group | a card's locator coordinate — ru-011 | 30.2167,48.75 | coordinate | dot | ru-011 wh-488 |
| Hemudu_culture | group | a card's locator coordinate — cnh-803 | 121.15,30.05 | coordinate | dot | cnh-803 |
| Hongshan_culture | group | a card's locator coordinate — cnh-047 | 118.8825,42.255 | coordinate | dot | cnh-047 |
| Linear_Pottery_culture | group | a card's locator coordinate — wh-137 | 8.9564,48.9328 | coordinate | dot | wh-137 |
| Mississippian_culture | group | a card's locator coordinate — wh-617 | -83.6083,32.8367 | coordinate | dot | us-017 wh-617 |
| Mumun_pottery_culture | group | a card's locator coordinate — jp-033 | 127.0305,36.2678 | coordinate | dot | jp-033 |
| Naqada_culture | group | a card's locator coordinate — wh-203 | 32.7167,25.9 | coordinate | dot | wh-203 |
| Natufian_culture | group | a card's locator coordinate — wh-116 | 35.0436,31.9819 | coordinate | dot | wh-116 |
| Nok_culture | group | a card's locator coordinate — wh-419 | 9.0833,9.5667 | coordinate | dot | wh-419 |
| Norte_Chico_civilisation | group | a card's locator coordinate — wh-435 | -77.5203,-10.8936 | coordinate | dot | wh-435 |
| Pechenegs | group | a card's locator coordinate — ru-020 | 32.625,46.6425 | coordinate | dot | ru-020 |
| Romanisation | group | a card's locator coordinate — rm-178 | 12.4964,41.9028 | coordinate | dot | rm-178 rm-782 |
| Rus'_people | group | a card's locator coordinate — ru-030 | 8.0564,49.9747 | coordinate | dot | ru-030 |
| Sabines | group | a card's locator coordinate — rm-012 | 12.8667,42.4 | coordinate | dot | rm-012 |
| Sarmatians | group | a card's locator coordinate — ru-008 | 44.5301,48.3565 | coordinate | dot | ru-008 |
| Sclaveni | group | a card's locator coordinate — ru-022 | 28.4917,45.27 | coordinate | dot | ru-022 |
| Senones | group | a card's locator coordinate — rm-160 | 13.2167,43.7167 | coordinate | dot | rm-160 |
| Seven_Sages_of_the_Bamboo_Grove | group | a card's locator coordinate — cnh-300 | 113.448,35.224 | coordinate | dot | cnh-300 |
| Terramare_culture | group | a card's locator coordinate — rm-007 | 10.93,44.62 | coordinate | dot | rm-007 |
| Tuoba | group | a card's locator coordinate — cnh-331 | 111.828,40.379 | coordinate | dot | cnh-331 |
| Únětice_culture | group | a card's locator coordinate — wh-274 | 14.3542,50.15 | coordinate | dot | wh-274 |
| Villanovan_culture | group | a card's locator coordinate — rm-008 | 11.46,44.5 | coordinate | dot | rm-008 |
| Vyatichi | group | a card's locator coordinate — ru-024 | 36.2223,52.3624 | coordinate | dot | ru-024 |
| Western_Zhou | group | a card's locator coordinate — wh-251 | 108.72,34.21 | coordinate | dot | wh-251 cnh-112 |
| Wokou | group | a card's locator coordinate — cnh-520 | 122.1,29.73 | coordinate | dot | cnh-520 |
| Xia_dynasty | group | a card's locator coordinate — cnh-012 | 113.0253,34.4553 | coordinate | dot | wh-244 cnh-054 cnh-012 |
| Yamnaya_culture | group | a card's locator coordinate — wh-258 | 35.1667,47.8333 | coordinate | dot | wh-258 |
| 'Ain_Ghazal | place | a card's locator coordinate — wh-126 | 35.976,31.988 | coordinate | dot | wh-126 |
| Akrotiri | place | a card's locator coordinate — gr-042 gr-044 | 25.4036,36.3514 | coordinate | dot | gr-042 gr-044 |
| Al_Mina | place | a card's locator coordinate — gr-149 | 35.9871,36.0804 | coordinate | dot | gr-149 |
| Al-Azhar | place | a card's locator coordinate — wh-479 | 31.2627,30.0457 | coordinate | dot | wh-479 |
| Ancient_Agora_of_Athens | place | a card's locator coordinate — gr-514 gr-1000 | 23.7225,37.975 | coordinate | dot | gr-514 gr-1000 |
| Anglo-Saxon_England | place | a card's locator coordinate — wh-490 | -1.38,53.13 | coordinate | dot | wh-490 |
| Antonine_Wall | place | a card's locator coordinate — rm-514 | -3.856,55.9978 | coordinate | dot | rm-514 |
| Arch_of_Septimius_Severus | place | a card's locator coordinate — rm-986 | 12.4847,41.8928 | coordinate | dot | rm-986 |
| Archbasilica_of_Saint_John_Lateran | place | a card's locator coordinate — rm-592 | 12.5062,41.8859 | coordinate | dot | rm-592 |
| Ardipithecus | place | a card's locator coordinate — wh-008 | 40.5,10.2833 | coordinate | dot | wh-008 |
| Artemision_at_Ephesus | place | a card's locator coordinate — gr-202 | 27.3639,37.9497 | coordinate | dot | gr-202 |
| Asia | place | a card's locator coordinate — rm-258 | 27.1842,39.1325 | coordinate | dot | rm-258 |
| Ayia_Triada | place | a card's locator coordinate — gr-033 | 24.7925,35.0589 | coordinate | dot | gr-033 |
| Barbegal_aqueduct_and_mills | place | a card's locator coordinate — rm-998 | 4.7214,43.7025 | coordinate | dot | rm-998 |
| Battle_of_Aquae_Sextiae | place | a card's locator coordinate — rm-299 | 5.45,43.53 | coordinate | dot | rm-299 |
| Battle_of_Arausio | place | a card's locator coordinate — rm-298 | 4.8,44.1333 | coordinate | dot | rm-298 |
| Battle_of_Artemisium | place | a card's locator coordinate — gr-426 | 23.2269,39.0125 | coordinate | dot | gr-426 |
| Battle_of_Asculum | place | a card's locator coordinate — rm-166 | 15.5619,41.2183 | coordinate | dot | rm-166 |
| Battle_of_Cape_Ecnomus | place | a card's locator coordinate — rm-194 | 13.9,37.05 | coordinate | dot | rm-194 |
| Battle_of_Chaeronea | place | a card's locator coordinate — gr-699 | 22.8475,38.495 | coordinate | dot | gr-699 |
| Battle_of_Cnidus | place | a card's locator coordinate — gr-660 | 27.375,36.6858 | coordinate | dot | gr-660 |
| Battle_of_Coronea | place | a card's locator coordinate — gr-659 | 22.9667,38.35 | coordinate | dot | gr-659 |
| Battle_of_Corupedium | place | a card's locator coordinate — gr-772 | 27.6178,38.5465 | coordinate | dot | gr-772 |
| Battle_of_Gaugamela | place | a card's locator coordinate — gr-722 | 43.44,36.56 | coordinate | dot | gr-722 |
| Battle_of_Ilipa | place | a card's locator coordinate — rm-226 | -5.9363,37.5488 | coordinate | dot | rm-226 |
| Battle_of_Ipsus | place | a card's locator coordinate — gr-765 | 30.99,38.95 | coordinate | dot | gr-765 |
| Battle_of_Kunyang | place | a card's locator coordinate — cnh-252 | 113.35,33.49 | coordinate | dot | cnh-252 |
| Battle_of_Lake_Trasimene | place | a card's locator coordinate — rm-215 | 12.085,43.1975 | coordinate | dot | rm-215 |
| Battle_of_Leuctra | place | a card's locator coordinate — gr-671 | 23.1743,38.2647 | coordinate | dot | gr-671 |
| Battle_of_Manzikert | place | a card's locator coordinate — wh-450 | 42.59,39.1 | coordinate | dot | wh-450 |
| Battle_of_Mycale | place | a card's locator coordinate — gr-437 | 27.1506,37.6611 | coordinate | dot | gr-437 |
| Battle_of_Mylae | place | a card's locator coordinate — rm-193 | 15.2333,38.2167 | coordinate | dot | rm-193 |
| Battle_of_Nemea | place | a card's locator coordinate — gr-658 | 22.7103,37.8089 | coordinate | dot | gr-658 |
| Battle_of_Pydna | place | a card's locator coordinate — rm-251 | 22.6131,40.3653 | coordinate | dot | rm-251 |
| Battle_of_Salamis | place | a card's locator coordinate — wh-322 gr-430 | 23.5667,37.9514 | coordinate | dot | wh-322 gr-430 |
| Battle_of_Sardis | place | a card's locator coordinate — gr-664 | 28.0403,38.4883 | coordinate | dot | gr-664 |
| Battle_of_Sybota | place | a card's locator coordinate — gr-525 | 20.25,39.4 | coordinate | dot | gr-525 |
| Battle_of_Telamon | place | a card's locator coordinate — rm-161 | 11.1339,42.5533 | coordinate | dot | rm-161 |
| Battle_of_the_Aegates_Islands | place | a card's locator coordinate — rm-199 | 12.2,37.97 | coordinate | dot | rm-199 |
| Battle_of_the_Bulge | place | a card's locator coordinate — wh-938 | 5.72,50.0042 | coordinate | dot | wh-938 |
| Battle_of_the_Eurymedon | place | a card's locator coordinate — gr-458 | 31.1722,36.9389 | coordinate | dot | gr-458 |
| Battle_of_the_Granicus | place | a card's locator coordinate — gr-711 | 27.3,40.3833 | coordinate | dot | gr-711 |
| Battle_of_the_Great_Harbour | place | a card's locator coordinate — gr-558 | 15.2931,37.0594 | coordinate | dot | gr-558 |
| Battle_of_the_Hydaspes | place | a card's locator coordinate — gr-739 | 73.6389,32.8278 | coordinate | dot | gr-739 |
| Battle_of_the_Kalka_River | place | a card's locator coordinate — ru-093 | 37.4956,47.2508 | coordinate | dot | ru-093 |
| Battle_of_the_Metaurus | place | a card's locator coordinate — rm-228 | 13.0145,43.7824 | coordinate | dot | rm-228 |
| Battle_of_the_Ticinus | place | a card's locator coordinate — rm-213 | 9.2367,45.1439 | coordinate | dot | rm-213 |
| Battle_of_the_Trebia | place | a card's locator coordinate — rm-214 | 9.5674,44.9885 | coordinate | dot | rm-214 |
| Battle_of_Thermopylae_(191_BCE) | place | a card's locator coordinate — wh-321 gr-422 rm-246 | 22.5628,38.8053 | coordinate | dot | wh-321 gr-422 rm-246 |
| Battle_of_Tours | place | a card's locator coordinate — wh-467 | 0.5406,46.7811 | coordinate | dot | wh-467 |
| Battle_of_Vercellae | place | a card's locator coordinate — rm-300 | 8.4167,45.3167 | coordinate | dot | rm-300 |
| Battle_of_Waterloo | place | a card's locator coordinate — wh-765 | 4.3979,50.7175 | coordinate | dot | wh-765 |
| Battle_of_Yamen | place | a card's locator coordinate — cnh-464 | 113.031,22.5281 | coordinate | dot | cnh-464 |
| Battle_of_Zama | place | a card's locator coordinate — rm-231 | 9.4492,36.2989 | coordinate | dot | rm-231 |
| Belitung_shipwreck | place | a card's locator coordinate — cnh-817 | 107.9167,-2.8333 | coordinate | dot | cnh-817 |
| Bithynia_and_Pontus | place | a card's locator coordinate — rm-774 | 29.9175,40.7625 | coordinate | dot | rm-774 |
| Bulgars | place | a card's locator coordinate — the cards disagree — ru-014 ru-035 | 37,46 | coordinate | dot | ru-014 ru-035 |
| Castellum_aquae | place | a card's locator coordinate — rm-839 | 14.4861,40.75 | coordinate | dot | rm-839 |
| Chen_Clan_Ancestral_Hall | place | a card's locator coordinate — cnh-757 | 113.2405,23.1298 | coordinate | dot | cnh-757 |
| Circus_of_Maxentius | place | a card's locator coordinate — rm-877 | 12.5207,41.8548 | coordinate | dot | rm-877 |
| City_Wall_of_Nanjing | place | a card's locator coordinate — cnh-767 | 118.7765,32.0147 | coordinate | dot | cnh-767 |
| Column_of_Antoninus_Pius | place | a card's locator coordinate — rm-987 | 12.4761,41.9017 | coordinate | dot | rm-987 |
| Curatores_alvei_Tiberis | place | a card's locator coordinate — rm-836 | 12.2334,41.7405 | coordinate | dot | rm-836 |
| Danubian_Limes | place | a card's locator coordinate — rm-754 | 16.8614,48.1133 | coordinate | dot | rm-754 |
| Dazu_Rock_Carvings | place | a card's locator coordinate — cnh-892 | 105.7167,29.7 | coordinate | dot | cnh-892 |
| Dujiangyan | place | a card's locator coordinate — cnh-992 | 103.6053,31.0017 | coordinate | dot | cnh-992 |
| Egesta | place | a card's locator coordinate — gr-553 | 12.8322,37.9414 | coordinate | dot | gr-553 |
| Eridu | place | a card's locator coordinate — wh-178 | 45.9961,30.8158 | coordinate | dot | wh-178 |
| Etruscan_cities | place | a card's locator coordinate — rm-024 | 11.8389,42.2279 | coordinate | dot | rm-024 |
| Fangmatan | place | a card's locator coordinate — cnh-975 | 106.1,34.4 | coordinate | dot | cnh-975 |
| First_Battle_of_Bedriacum | place | a card's locator coordinate — rm-459 | 10.4417,45.1286 | coordinate | dot | rm-459 |
| Four_Commanderies_of_Han | place | a card's locator coordinate — cnh-233 | 125.7475,39.0167 | coordinate | dot | cnh-233 |
| Fujian_tulou | place | a card's locator coordinate — cnh-962 | 116.732,24.724 | coordinate | dot | cnh-962 |
| Fuzhou | place | a card's locator coordinate — cnh-862 | 116.358,27.949 | coordinate | dot | gc-515 cnh-862 |
| Gedrosia | place | a card's locator coordinate — gr-742 | 62.5,26.5 | coordinate | dot | gr-742 |
| Gojoseon | place | a card's locator coordinate — ko-046 | 125.7475,39.0167 | coordinate | dot | ko-046 |
| Grand_Canal | place | a card's locator coordinate — the cards disagree — wh-522 cnh-350 | 120.2239,30.2614 | coordinate | dot | wh-522 cnh-350 |
| Great_Mosque_of_Córdoba | place | a card's locator coordinate — wh-477 | -4.7797,37.8792 | coordinate | dot | wh-477 |
| Great_Wall_of_China | place | a card's locator coordinate — wh-407 | 116.0069,40.3542 | coordinate | dot | wh-407 |
| Hadrians_Wall | place | a card's locator coordinate — wh-368 rm-506 | -2.2833,55.0167 | coordinate | dot | wh-368 rm-506 |
| Hangu_Pass | place | a card's locator coordinate — cnh-837 | 110.92,34.63 | coordinate | dot | cnh-837 |
| Hankou | place | a card's locator coordinate — cnh-812 | 114.2642,30.6029 | coordinate | dot | cnh-812 |
| Heb-sed_court | place | a card's locator coordinate — eg-096 | 31.2167,29.8711 | coordinate | dot | eg-096 |
| Hellespont_bridges | place | a card's locator coordinate — gr-415 | 26.405,40.1953 | coordinate | dot | gr-415 |
| Homo_naledi | place | a card's locator coordinate — wh-041 | 27.7092,-26.0204 | coordinate | dot | wh-041 |
| Hyphasis | place | a card's locator coordinate — gr-741 | 75.5,31.4 | coordinate | dot | gr-741 |
| Indo-Islamic_architecture | place | a card's locator coordinate — wh-552 | 77.1854,28.5244 | coordinate | dot | wh-552 |
| International_Humanitarian_City | place | a card's locator coordinate — gga-181 | 55.0711,24.8952 | coordinate | dot | gga-181 |
| Java_Man | place | a card's locator coordinate — wh-024 | 111.3578,-7.3743 | coordinate | dot | wh-024 |
| Jebel_Irhoud | place | a card's locator coordinate — wh-043 | -8.8725,31.855 | coordinate | dot | wh-043 |
| Jeongok-ri | place | a card's locator coordinate — ko-022 | 127.0638,38.0116 | coordinate | dot | ko-022 |
| Jiangnan_Examination_Hall | place | a card's locator coordinate — cnh-704 | 118.7904,32.0219 | coordinate | dot | cnh-704 |
| Jin_dynasty_(1115–1234) | place | a card's locator coordinate — the cards disagree — cnh-293 cnh-473 | 112.4539,34.6197 | coordinate | dot | cnh-293 cnh-473 |
| Kalchyk_(river) | place | a card's locator coordinate — wh-595 ru-093 | 37.4956,47.2508 | coordinate | dot | wh-595 ru-093 |
| Khara-Khoto | place | a card's locator coordinate — cnh-471 | 100.318,41.7456 | coordinate | dot | cnh-471 |
| Lake_Mungo_remains | place | a card's locator coordinate — wh-094 | 143.0833,-33.75 | coordinate | dot | wh-094 |
| Land_of_Punt | place | a card's locator coordinate — wh-422 | 43.3333,12.5833 | coordinate | dot | wh-422 |
| Latium | place | a card's locator coordinate — rm-004 rm-100 | 12.7167,41.9 | coordinate | dot | rm-004 rm-100 |
| Laurion | place | a card's locator coordinate — gr-318 | 24.05,37.7 | coordinate | dot | gr-318 gr-411 |
| Library_of_Pergamon | place | a card's locator coordinate — gr-791 | 27.1842,39.1325 | coordinate | dot | gr-791 |
| Lomekwi_3 | place | a card's locator coordinate — wh-014 | 35.7508,3.8742 | coordinate | dot | wh-014 |
| Long_Walls | place | a card's locator coordinate — gr-488 | 23.7,37.95 | coordinate | dot | gr-488 |
| Lower_Germanic_Limes | place | a card's locator coordinate — rm-753 | 5.8625,51.8475 | coordinate | dot | rm-753 |
| Lyceum | place | a card's locator coordinate — gr-683 | 23.7435,37.9741 | coordinate | dot | gr-683 |
| Madjedbebe | place | a card's locator coordinate — wh-093 | 132.8833,-12.5 | coordinate | dot | wh-093 |
| Magna_Graecia | place | a card's locator coordinate — rm-043 | 17.2769,39.885 | coordinate | dot | gr-223 rm-043 |
| Mahajanapadas | place | a card's locator coordinate — wh-376 | 81.3929,25.339 | coordinate | dot | wh-376 |
| Mausoleum_of_the_First_Qin_Emperor | place | a card's locator coordinate — cnh-208 | 109.2539,34.3817 | coordinate | dot | cnh-208 |
| Merimde_Beni_Salama | place | a card's locator coordinate — eg-019 | 30.85,30.316 | coordinate | dot | eg-019 |
| Meroë | place | a card's locator coordinate — wh-417 | 33.7264,16.9333 | coordinate | dot | wh-417 |
| Mesara | place | a card's locator coordinate — gr-035 | 24.8461,35.0372 | coordinate | dot | gr-035 |
| Mesoamerica | place | a card's locator coordinate — wh-425 | -98.8667,19.6667 | coordinate | dot | wh-425 |
| Mirgissa | place | a card's locator coordinate — eg-192 | 30.97,21.48 | coordinate | dot | eg-192 |
| Mogao_Caves | place | a card's locator coordinate — cnh-893 cnh-937 | 94.6639,40.1411 | coordinate | dot | cnh-893 cnh-937 |
| Mongol_conquests | place | a card's locator coordinate — wh-595 | 37.4956,47.2508 | coordinate | dot | wh-595 |
| Monte_Albán | place | a card's locator coordinate — wh-427 | -96.7678,17.0439 | coordinate | dot | wh-427 |
| Mount_Wutai | place | a card's locator coordinate — cnh-894 | 113.2553,38.7283 | coordinate | dot | cnh-894 |
| Mycenaean_road_network | place | a card's locator coordinate — gr-100 | 22.9375,37.5936 | coordinate | dot | gr-100 |
| Nanchan_Temple | place | a card's locator coordinate — cnh-963 | 113.2553,38.7283 | coordinate | dot | cnh-963 |
| New_England | place | a card's locator coordinate — wh-680 | -70.6678,41.9583 | coordinate | dot | wh-680 |
| Omo_remains | place | a card's locator coordinate — wh-044 | 35.9671,4.8004 | coordinate | dot | wh-044 |
| Pannonia | place | a card's locator coordinate — rm-776 | 19.6106,44.9661 | coordinate | dot | rm-776 |
| Pergamon_Altar | place | a card's locator coordinate — gr-790 | 27.1842,39.1325 | coordinate | dot | gr-790 |
| Pingcheng | place | a card's locator coordinate — cnh-334 cnh-895 | 113.367,40.097 | coordinate | dot | cnh-334 cnh-895 |
| Piraeus_wall | place | a card's locator coordinate — gr-445 | 23.6559,37.9406 | coordinate | dot | gr-445 |
| Pithekoussai | place | a card's locator coordinate — gr-148 | 13.8833,40.75 | coordinate | dot | gr-148 |
| Portus_Julius | place | a card's locator coordinate — rm-999 | 14.0947,40.8283 | coordinate | dot | rm-999 |
| Propylaea | place | a card's locator coordinate — gr-501 | 23.7251,37.9717 | coordinate | dot | gr-501 |
| Province_of_Asia | place | a card's locator coordinate — rm-258 | 27.1842,39.1325 | coordinate | dot | rm-258 |
| Province_of_Macedonia | place | a card's locator coordinate — rm-257 | 22.9356,40.6403 | coordinate | dot | rm-257 |
| Pulvinar_(Roman) | place | a card's locator coordinate — rm-889 | 12.4857,41.8859 | coordinate | dot | rm-889 |
| Puticuli | place | a card's locator coordinate — rm-816 | 12.4967,41.8956 | coordinate | dot | rm-816 |
| Republic_of_China_(1912–1949) | place | a card's locator coordinate — cnh-577 | 118.7789,32.0608 | coordinate | dot | cnh-577 pea-131 |
| Roman_gardens | place | a card's locator coordinate — rm-833 | 12.4969,41.9081 | coordinate | dot | rm-833 |
| Roman_roads | place | a card's locator coordinate — rm-175 | 12.4964,41.9028 | coordinate | dot | wh-360 rm-175 |
| Roman_Senate | place | a card's locator coordinate — rm-697 | 12.4854,41.8929 | coordinate | dot | wh-341 rm-697 |
| Royal_Cemetery_at_Ur | place | a card's locator coordinate — wh-181 | 46.1061,30.9615 | coordinate | dot | wh-181 |
| Royal_Road | place | a card's locator coordinate — wh-304 | 28.0403,38.4883 | coordinate | dot | gr-388 wh-304 |
| Saguntum | place | a card's locator coordinate — rm-208 | -0.2783,39.68 | coordinate | dot | rm-208 |
| Sahelanthropus | place | a card's locator coordinate — wh-006 | 18,17 | coordinate | dot | wh-006 |
| Sahul | place | a card's locator coordinate — wh-092 | 142.5,-9.8333 | coordinate | dot | wh-092 |
| Sanxingdui | place | a card's locator coordinate — wh-250 | 104.2,30.993 | coordinate | dot | wh-250 cnh-053 |
| Second_Battle_of_Mantinea | place | a card's locator coordinate — gr-675 | 22.4,37.6 | coordinate | dot | gr-675 |
| Seleucia_on_the_Tigris | place | a card's locator coordinate — gr-781 gr-768 | 44.5222,33.0944 | coordinate | dot | gr-781 gr-768 |
| Serdab | place | a card's locator coordinate — eg-094 | 31.2167,29.8711 | coordinate | dot | eg-094 |
| Shanghai_International_Settlement | place | a card's locator coordinate — cnh-600 | 121.4861,31.238 | coordinate | dot | cnh-600 |
| Shunet_El_Zebib | place | a card's locator coordinate — eg-069 | 31.9078,26.1894 | coordinate | dot | eg-069 |
| Siege_of_Agrigentum | place | a card's locator coordinate — rm-190 | 13.575,37.3125 | coordinate | dot | rm-190 |
| Siege_of_Lilybaeum | place | a card's locator coordinate — rm-197 | 12.4342,37.7981 | coordinate | dot | rm-197 |
| Silk_Road | place | a card's locator coordinate — cnh-230 | 94.6639,40.1411 | coordinate | dot | wh-409 cnh-230 |
| Six_Garrisons | place | a card's locator coordinate — cnh-337 | 108.2676,41.0884 | coordinate | dot | cnh-337 |
| Sogdiana | place | a card's locator coordinate — gr-736 | 66.9758,39.6547 | coordinate | dot | gr-736 |
| Stupa | place | a card's locator coordinate — wh-389 | 77.7397,23.4792 | coordinate | dot | wh-389 |
| Sutton_Hoo | place | a card's locator coordinate — wh-491 | 1.3389,52.0897 | coordinate | dot | wh-491 |
| Taung_Child | place | a card's locator coordinate — wh-012 | 24.7481,-27.5625 | coordinate | dot | wh-012 |
| Tea_Horse_Road | place | a card's locator coordinate — cnh-816 | 101.9569,29.9985 | coordinate | dot | cnh-816 |
| Temple_of_Agriculture | place | a card's locator coordinate — cnh-729 | 116.3862,39.8766 | coordinate | dot | cnh-729 |
| Teotihuacan | place | a card's locator coordinate — wh-431 | -98.8439,19.6925 | coordinate | dot | wh-431 |
| Theatre_of_Dionysus | place | a card's locator coordinate — gr-612 | 23.7278,37.9703 | coordinate | dot | gr-612 |
| Themistoclean_Wall | place | a card's locator coordinate — gr-444 | 23.7189,37.9783 | coordinate | dot | gr-444 |
| Third_Dynasty_of_Ur | place | a card's locator coordinate — wh-186 | 46.1051,30.9617 | coordinate | dot | wh-186 |
| Tomb_100 | place | a card's locator coordinate — eg-037 | 32.7794,25.0972 | coordinate | dot | eg-037 |
| Tomb_U-j | place | a card's locator coordinate — eg-046 | 31.9083,26.175 | coordinate | dot | eg-046 |
| Turkana_Boy | place | a card's locator coordinate — wh-021 | 36.1167,3.5833 | coordinate | dot | wh-021 |
| Ugarit | place | a card's locator coordinate — wh-268 | 35.7856,35.6019 | coordinate | dot | wh-268 |
| Via_Aemilia | place | a card's locator coordinate — rm-174 | 11.3426,44.4949 | coordinate | dot | rm-174 |
| Visigothic_Kingdom | place | a card's locator coordinate — rm-626 | 1.444,43.6045 | coordinate | dot | rm-626 |
| Volga_trade_route | place | a card's locator coordinate — ru-035 | 49.0564,54.9789 | coordinate | dot | ru-035 |
| Wari_Empire | place | a card's locator coordinate — wh-610 | -74.1989,-13.0606 | coordinate | dot | wh-610 |
| White_Cloud_Temple | place | a card's locator coordinate — cnh-880 | 116.36,39.91 | coordinate | dot | cnh-880 |
| Wu_Liang_Shrine | place | a card's locator coordinate — cnh-966 | 116.342,35.408 | coordinate | dot | cnh-966 |
| Yodok_concentration_camp | place | a card's locator coordinate — pea-124 | 126.8514,39.6742 | coordinate | dot | pea-124 |
| Yu_ji_tu | place | a card's locator coordinate — cnh-726 | 108.9528,34.2525 | coordinate | dot | cnh-726 |
| Yu_the_Great | place | a card's locator coordinate — cnh-012 | 113.0253,34.4553 | coordinate | dot | cnh-012 |
| Zhaozhou_Bridge | place | a card's locator coordinate — cnh-990 | 114.7633,37.7203 | coordinate | dot | cnh-990 |
| Zhengguo_Canal | place | a card's locator coordinate — cnh-804 | 108.843,34.527 | coordinate | dot | cnh-804 |

### Tier 5 — A name match in the registry, no card (94)

the term's title, alias or Wikipedia title is exactly one registry row; a glance confirms it.

| term | class | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|---|
| Wa_(Japan) | group | name = one registry row | adm1:usa:us-wa | admin1 | face | ko-097 jp-041 |
| Xiongnu | group | Wikipedia title = registry row | pol:xiongnu | polity | face | cnh-225 |
| Africa | place | Wikipedia title = registry row | reg:1159104365 | region | dot |  |
| Africa_(Roman_province) | place | name = one registry row | reg:1159104365 | region | dot | rm-762 |
| Alps | place | Wikipedia title = registry row | reg:1159104297 | range | dot |  |
| Altai_Republic | place | Wikipedia title = registry row | adm1:rus:ru-al | admin1 | face | gru-079 |
| Amiens | place | Wikipedia title = registry row | city:1159142053 | town | dot |  |
| Anatolia | place | Wikipedia title = registry row | reg:1159104259 | region | dot |  |
| Aswan | place | Wikipedia title = registry row | city:1159149859 | town | dot |  |
| Atbarah_River | place | Wikipedia title = registry row | river:1159115347 | river | dot |  |
| Atlantic_Ocean | place | Wikipedia title = registry row | sea:1159115057 | ocean | dot |  |
| Balkans | place | Wikipedia title = registry row | reg:1159104241 | region | dot |  |
| Barnaul | place | Wikipedia title = registry row | city:1159150711 | town | dot | gru-523 |
| Black_Sea | place | Wikipedia title = registry row | sea:1159115171 | sea | dot |  |
| Blue_Nile | place | Wikipedia title = registry row | river:1159126701 | river | dot |  |
| Bologna | place | Wikipedia title = registry row | city:1159139461 | town | dot |  |
| British_Raj | place | Wikipedia title = registry row | pol:british_raj | polity | face | wh-837 |
| Buryatia | place | Wikipedia title = registry row | adm1:rus:ru-bu | admin1 | face | gru-052 |
| Caspian_Sea | place | Wikipedia title = registry row | sea:1159115461 | sea | dot |  |
| Central_Valley_(California) | place | Wikipedia title = registry row | reg:1159103751 | region | dot |  |
| Charleston_(South_Carolina) | place | name = one registry row | city:1159149297 | town | dot | geo-513 geo-728 |
| Charleston_(West_Virginia) | place | name = one registry row | city:1159149297 | town | dot | geo-513 geo-728 |
| Cheboksary | place | Wikipedia title = registry row | city:1159146557 | town | dot | gru-539 |
| Cherkessk | place | Wikipedia title = registry row | city:1159137059 | town | dot | gru-574 |
| Chuvashia | place | Wikipedia title = registry row | adm1:rus:ru-cu | admin1 | face | gru-039 |
| Crimea | place | Wikipedia title = registry row | reg:1159103999 | region | dot |  |
| Damietta | place | Wikipedia title = registry row | city:1159140385 | town | dot |  |
| Danube | place | Wikipedia title = registry row | river:1159115307 | river | dot |  |
| Elista | place | Wikipedia title = registry row | city:1159148145 | town | dot | gru-578 |
| Europe | place | Wikipedia title = registry row | reg:1159104603 | region | dot |  |
| Genoa | place | Wikipedia title = registry row | city:1159148297 | town | dot |  |
| Gilf_Kebir | place | Wikipedia title = registry row | reg:1159103215 | region | dot | eg-014 |
| Great_Basin_peoples | place | name = one registry row | reg:1159104161 | region | dot | us-034 |
| Great_Plains | place | Wikipedia title = registry row | reg:1159104319 | region | dot | us-035 |
| Great_Rift_Valley | place | Wikipedia title = registry row | reg:1159103991 | region | dot |  |
| Hamilton,_Bermuda | place | Wikipedia title = registry row | city:1159151185 | capital | dot |  |
| Hokkaido | place | Wikipedia title = registry row | reg:1159103801 | island | dot |  |
| Honshu | place | Wikipedia title = registry row | reg:1159104129 | island | dot |  |
| Iberia | place | name = one registry row | reg:1159104343 | region | dot |  |
| Izhevsk | place | Wikipedia title = registry row | city:1159148141 | town | dot | gru-529 |
| Jeju_Island | place | name = one registry row | city:1159135293 | town | dot | ko-018 |
| Jewish_Autonomous_Oblast | place | Wikipedia title = registry row | adm1:rus:ru-yev | admin1 | face | gru-080 |
| Kalmykia | place | Wikipedia title = registry row | adm1:rus:ru-kl | admin1 | face | gru-078 |
| Karachay-Cherkessia | place | Wikipedia title = registry row | adm1:rus:ru-kc | admin1 | face | gru-074 |
| Khakassia | place | Wikipedia title = registry row | adm1:rus:ru-kk | admin1 | face | gru-070 |
| Korea | place | name = one registry row | reg:1159103669 | region | dot | ko-001 |
| Korean_Peninsula | place | Wikipedia title = registry row | reg:1159103669 | region | dot | ko-002 |
| Kunlun | place | name = one registry row | reg:1159104187 | range | dot | cnh-019 |
| Kurgan,_Kurgan_Oblast | place | Wikipedia title = registry row | city:1159146527 | town | dot |  |
| Kyushu | place | Wikipedia title = registry row | reg:1159103795 | island | dot |  |
| Laetoli | place | Wikipedia title = registry row | pl:q672146 | site | dot |  |
| Larisa_(Argos) | place | name = one registry row | city:1159142201 | town | dot |  |
| Levant | place | name = one registry row | reg:1730072159 | region | dot |  |
| Liao_River | place | Wikipedia title = registry row | river:1159114785 | river | dot | ko-050 |
| Mari_El | place | Wikipedia title = registry row | adm1:rus:ru-me | admin1 | face | gru-064 |
| Mediterranean | place | name = one registry row | sea:1159115321 | sea | dot |  |
| Mississippi_River | place | Wikipedia title = registry row | river:1159119147 | river | dot |  |
| Missouri_River | place | Wikipedia title = registry row | river:1159128481 | river | dot |  |
| Naples | place | Wikipedia title = registry row | city:1159151313 | city | dot |  |
| Navajo | place | name = one registry row | lake:9298 | lake | dot |  |
| New_Guinea | place | Wikipedia title = registry row | reg:1159104121 | island | dot |  |
| North_America | place | Wikipedia title = registry row | reg:1159104607 | region | dot |  |
| North_Ossetia–Alania | place | Wikipedia title = registry row | adm1:rus:ru-se | admin1 | face | gru-063 |
| Okinawa_Island | place | Wikipedia title = registry row | reg:1730072495 | island-group | dot |  |
| Ordos_Plateau | place | name = one registry row | reg:1159103649 | region | dot | cnh-777 |
| Pacific_Ocean | place | Wikipedia title = registry row | sea:1159115079 | ocean | dot |  |
| Palermo | place | Wikipedia title = registry row | city:1159150805 | town | dot |  |
| Peloponnese | place | Wikipedia title = registry row | reg:1730071111 | island | dot |  |
| Pisa | place | name = one registry row | pol:pisa | polity | face |  |
| Portland_(Maine) | place | name = one registry row | city:1159150487 | city | dot | geo-724 geo-709 |
| Portland_(Oregon) | place | name = one registry row | city:1159150487 | city | dot | geo-724 geo-709 |
| Quanzhou | place | Wikipedia title = registry row | city:1159149791 | city | dot | cnh-455 |
| Rijeka | place | Wikipedia title = registry row | city:1159130051 | town | dot |  |
| Scandinavia | place | Wikipedia title = registry row | reg:1159104329 | region | dot |  |
| Sea_of_Japan | place | Wikipedia title = registry row | sea:1159115305 | sea | dot |  |
| Seattle | place | Wikipedia title = registry row | city:1159151223 | city | dot | geo-723 |
| Serengeti | place | Wikipedia title = registry row | reg:1159103293 | region | dot |  |
| Shanxi | place | Wikipedia title = registry row | adm1:chn:cn-sx | admin1 | face | gc-018 |
| Shikoku | place | Wikipedia title = registry row | reg:1159103797 | island | dot |  |
| Sidon | place | Wikipedia title = registry row | city:1159129477 | town | dot |  |
| Sierra_Nevada | place | Wikipedia title = registry row | reg:1159103951 | range | dot |  |
| Sobat_River | place | Wikipedia title = registry row | river:1159123459 | river | dot |  |
| South_America | place | Wikipedia title = registry row | reg:1159104361 | region | dot |  |
| Tyrrhenian_Sea | place | Wikipedia title = registry row | sea:1159116377 | sea | dot |  |
| Udmurtia | place | Wikipedia title = registry row | adm1:rus:ru-ud | admin1 | face | gru-029 |
| Ulan-Ude | place | Wikipedia title = registry row | city:1159149623 | town | dot | gru-552 |
| Victoria,_Seychelles | place | Wikipedia title = registry row | city:1159151191 | capital | dot |  |
| Vladikavkaz | place | Wikipedia title = registry row | city:1159137065 | town | dot | gru-563 |
| Vladimir,_Russia | place | Wikipedia title = registry row | city:1159148121 | town | dot |  |
| White_Nile | place | Wikipedia title = registry row | river:1159113335 | river | dot |  |
| White_Sands_National_Park | place | name = one registry row | reg:1730070773 | region | dot |  |
| Yam_(Nubia) | place | name = one registry row | lake:1130 | lake | dot | eg-133 |
| Yellow_Sea | place | Wikipedia title = registry row | sea:1159115999 | sea | dot | ko-007 |
| Yoshkar-Ola | place | Wikipedia title = registry row | city:1159137563 | town | dot | gru-564 |

### Tier 6 — Needs a Wikidata lookup (621)

tagged a place, a people or a state and nothing in Folio joins it: the slug is a Wikipedia title, so `migrate-places.js`'s title resolver can try each; continents, hemispheres and peoples will mostly fail.

| term | class | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|---|
| Aamu | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-165 |
| Achaeans | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Aeolians | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Agiads_and_Eurypontids | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-246 |
| Alcmaeonids | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-304 |
| Algonquian_languages | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-038 |
| Argonauts | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-933 |
| Athabaskan_migration | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-030 |
| Attic_orators | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-690 |
| Baiyue | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-793 |
| Benshengren | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | pea-147 |
| Booi_Aha | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-749 |
| Chinese_Empire | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-701 |
| Choctaw_code_talkers | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-094 |
| Cimbri_and_the_Teutones | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-297 |
| Cisalpine_Gauls | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-021 |
| Comanche | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-046 |
| Consecratio | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-926 |
| Datis | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-401 |
| Decolonization | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-971 |
| Diadochi | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-751 |
| Dorians | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Eighteenth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Eighth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-143 |
| Eleventh_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-147 |
| End_of_the_Zhou | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-190 |
| Ephors | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-248 |
| Fifteenth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| First_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-057 |
| Five_Barbarians | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-304 |
| Five_kings_of_Wa | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-060 |
| Five_Tribes | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-080 |
| Floating_population | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-687 |
| Four_Lords_of_the_Warring_States | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-184 |
| Fourteenth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Fourth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-098 |
| Gladiator | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-868 |
| God-fearer | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-927 |
| Gracchi_brothers | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-350 rm-281 rm-285 |
| Great_Law_of_Peace | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-037 |
| Griot | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-583 |
| Han_Chinese | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-774 |
| Haudenosaunee_Confederacy | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-036 |
| Hektemoroi | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-285 |
| Helots | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-239 |
| Heracleidae | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-234 |
| Hippeis | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-257 |
| Horatii | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-064 |
| Hui_people | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-787 |
| Hyksos | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-219 |
| Indian_independence_movement | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-972 |
| Indonesian_National_Revolution | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-975 |
| Ionians | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Italic_peoples | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-009 |
| Jews | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Julio-Claudian_dynasty | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-416 |
| Jurchen_people | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-474 |
| Khitan_people | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-412 |
| Kotjebi | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | pea-111 |
| Laeti | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-691 |
| Lakota | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-048 |
| Landed_gentry_in_China | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Latins | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-010 |
| Legionary | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-646 |
| Liao_dynasty | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-411 |
| Libertus | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-808 |
| Linear_B_scribe | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Maasai | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mahan | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-068 |
| Mamertines | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-187 |
| Manchu_people | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-782 |
| Mandan | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mardonius | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-399 gr-434 |
| Marius_and_Sulla | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-351 rm-294 rm-309 |
| Medjay | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-166 |
| Menfa | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-298 |
| Miao_people | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-790 |
| Mithraic_mysteries | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-924 |
| Munitionette | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-886 |
| Nineteenth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ninth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Okjeo | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-066 |
| Order_of_succession | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | pea-126 |
| Overseas_Chinese | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-857 |
| Paleo-Indians | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-100 us-005 |
| Perioikoi | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-240 |
| Phrynichus_(tragic_poet) | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-398 |
| Picentes | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Plebs_urbana | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-812 |
| Potlatch | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-032 |
| Red_Guards | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-671 |
| Retiarius | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-870 |
| Roman_matron | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-794 |
| Romani_people | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Rouran_Khaganate | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-779 |
| Samhan | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-067 |
| Samurai | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-544 |
| Sea_Peoples | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-108 wh-278 |
| Second_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-067 |
| Semu | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-490 |
| Seres | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-785 |
| Seventeenth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Seventh_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-142 |
| Shang_royal_women | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-101 |
| Shanxi_merchants | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-747 |
| Shatuo | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-780 |
| Sixteenth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Spartan_women | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-253 |
| Spartiates | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-241 |
| Swingjugend | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-080 |
| Taiwanese_indigenous_peoples | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | pea-159 |
| Tangut_people | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-466 |
| Tenth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-145 |
| Third_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-092 |
| Thirteenth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-200 |
| Thirtieth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Thirty-first_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Three_Sovereigns_and_Five_Emperors | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-002 |
| Tibetans | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-784 |
| Toraijin | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-055 |
| Twelfth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-175 |
| Twentieth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-eighth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-fifth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-first_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-fourth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-ninth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-second_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-seventh_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-sixth_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-third_Dynasty_of_Egypt | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Uyghurs | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-786 |
| Varangians | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ru-029 |
| Verna_(slave) | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-805 |
| Vikings | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-498 |
| Waishengren | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | pea-148 |
| Xianbei | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-082 |
| Xianyun | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-131 |
| Xie_clan_of_Chen_Commandery | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-315 |
| Yemaek | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-051 |
| Yi_people | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-792 |
| Zhuang_people | group | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-791 |
| 14_regions_of_Augustan_Rome | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-828 |
| 4.2-kiloyear_event | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-139 |
| Acragas | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Aeolic_capital | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-348 |
| Aequi | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Agora | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-174 |
| Agri_Decumates | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-756 |
| Ahhiyawa | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-095 |
| Al-Andalus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-468 |
| Alashiya | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Alaska_Natives | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Altai_Krai | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gru-023 |
| Amarna | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Americas | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Amnisos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Amnok_River | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-017 |
| Amsa-dong | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-026 |
| Amyclae | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Anemospilia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Aniene | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Arcadia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Archaic_temple | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-338 |
| Archanes | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Archipelago | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Architrave | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Arctic | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ardea | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Argiletum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Argolid | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Aricia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ashlar | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Aspis_hill | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Atoll | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Atrium_(architecture) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-831 |
| Attack_on_Pearl_Harbor | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-929 |
| Avulsion_(river) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-250 |
| Ayia_Irini | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Badlands | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Bangudae | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-041 |
| Barrel_vault | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-982 |
| Battle_of_Britain | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-922 |
| Battle_of_Carrhae | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-356 |
| Battle_of_Changping | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-181 |
| Battle_of_Chengpu | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-150 |
| Battle_of_Fallen_Timbers | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-073 |
| Battle_of_Haoshuichuan | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-470 |
| Battle_of_Hubudagang | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-476 |
| Battle_of_Maling | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-180 |
| Battle_of_Mons_Graupius | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-485 |
| Battle_of_Oriskany | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-069 |
| Battle_of_Red_Cliffs | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-276 |
| Battle_of_Taierzhuang | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-641 |
| Battle_of_Tangdao | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-461 |
| Battle_of_the_Catalaunian_Plains | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-631 |
| Battle_of_Yinshan | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-365 |
| Bering_Strait | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Birobidzhan | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gru-580 |
| Boeotia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Border_Cave | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Brescia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Broca's_area | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ps-031 |
| Burma_Road | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-647 |
| Buyeo | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-064 |
| Byblos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Caelian_Hill | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Caesar's_Rhine_bridges | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-675 |
| Caldera | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Calypso | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-962 |
| Campanians | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Campi_Flegrei | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Canaba | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-683 |
| Canton_(country_subdivision) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cape_Gelidonya | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Capitol_Hill,_Saipan | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Carsulae | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Carthaginian_constitution | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-183 |
| Castle | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-509 |
| Cella | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cemetery | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Central_Plain | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-052 |
| Centuriation | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-994 |
| Changma | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-005 |
| Chania | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Channel_Islands_National_Park | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Chengzhou | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-121 |
| Chinese_flood_myth | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-013 |
| Chinggisids | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-600 |
| Chios | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Chora | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-172 |
| Citadel | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Classic_of_Mountains_and_Seas | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-028 |
| Clitumnus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Columbarium | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-825 |
| Columbian_exchange | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-041 wh-669 |
| Comancheria | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-047 |
| Composite_order | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-983 |
| Corbel | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Corcyra | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Corinthia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Corinthian_order | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cosquer_Cave | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cowrie_shell | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-097 |
| Cradle_of_Humankind | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cretan_cult_cave | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Crown_Dependency | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Crustumerium | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cueva_de_El_Castillo | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cueva_de_las_Manos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | art-024 |
| Curia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Daepyeong | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-031 |
| Daisenryō_Kofun | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-049 |
| Death_Valley | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Deerskin_trade | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-066 |
| Depopulation | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-115 |
| Dhaskalio | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dhow | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-564 |
| Dian_kingdom | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-789 |
| Didyma | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dipylon_Gate | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Diyu | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-031 |
| Dodecanese | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dolmen | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-033 |
| Dolní_Věstonice | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Domus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-830 |
| Doric_order | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-339 |
| Douglas,_Isle_of_Man | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dromos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dzungar_Khanate | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-547 |
| Earthen_fortress | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-081 |
| East_Africa | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| East_Asia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| East_Slavs | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ru-023 |
| Echinus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ecumene | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-836 |
| Egyptian_pyramids | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-091 |
| Eight_Provinces_of_Korea | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-009 |
| Emirate | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Enclave | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Enkomi | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Entasis | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Equator | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Eretria | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-402 |
| Ergastulum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-806 |
| Erlitou_site | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-063 |
| Esquiline_Hill | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Euboea | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Eurasia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Exclusive_economic_zone | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Fennoscandian_ice_sheet | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ferrara | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ficana | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Fidenae | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Flooding_of_the_Nile | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Forica | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-838 |
| Forum_(Roman) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-985 |
| Free_China_(Second_Sino-Japanese_War) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-639 |
| Frentani | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Fujiwara-kyō | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-079 |
| Fullonica | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-844 |
| Funadomari | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-024 |
| George_Town,_Cayman_Islands | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Gochang_Dolmen_Site | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Gonggong | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-018 |
| Gorno-Altaysk | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gru-579 |
| Gortyn | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Goryeo_long_wall | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-016 |
| Gran_Sasso | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Grassland | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Grave_Gamma | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Great_house_(Chacoan) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-024 |
| Greek_underworld | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-920 |
| Hadza_people | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Haida | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Hall_of_the_Bulls | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | art-016 |
| Han_River_(Korea) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-012 |
| Hecataeus_of_Miletus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-379 |
| Heijō-kyō | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-087 |
| Hephaisteion | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-505 |
| Hernici | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Hispania | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-761 |
| Hispellum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Hohle_Fels | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Holy_Roman_Empire | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-497 |
| Horreum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-688 |
| Hōryū-ji | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-067 |
| Hundred_Regiments_Offensive | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-644 |
| Ibn_Battuta | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-481 |
| Idalion | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ierapetra | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Imperial_province | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-397 |
| Inca_road_system | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-616 |
| Indian_Ocean_trade | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-553 |
| Indian_reservation | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-084 |
| Indian_Territory | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-081 |
| Insula_(building) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-829 |
| Ionic_order | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-340 |
| Ios | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ithome | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Itinerarium | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-857 |
| Itjtawy | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-177 |
| Ius_Italicum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-780 |
| Jamestown,_Saint_Helena | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Janiculum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Japanese_archipelago | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-002 |
| Japanese_colonial_empire | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-082 |
| Jin-Cha-Ji_Border_Region | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-645 |
| Jochi | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Joshua_Tree_National_Park | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Judaea_(Roman_province) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-770 |
| Kalapodi | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kanagawa_Prefecture | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Karaca_Dağ | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Karakorum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Karst | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kavos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kea | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kemet | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-001 |
| Kilimanjaro | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kingston,_Norfolk_Island | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kition | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Klasies_River_Caves | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kofun | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-048 |
| Kokiselei | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kokubunji | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-093 |
| Kom_K_and_Kom_W | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-020 |
| Kommos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Konso | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Koobi_Fora | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Koreans | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-013 |
| Kouloura | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Krisa | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kuafu | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-016 |
| Lake_Chad | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Landlocked_country | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lasithi | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lassen_Volcanic_National_Park | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Laterculus_Veronensis | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-569 |
| Laurentide_ice_sheet | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Leang_Bulu'_Sipong_4 | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Leang_Tedongnge | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lebensraum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-050 |
| Ledi-Geraru | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Leipzig | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lelang | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-072 |
| Levantine_corridor | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-024 |
| Liancourt_Rocks | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-019 |
| Liang_Bua | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Liaodong | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-043 |
| Liaoshen_campaign | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-623 |
| Limes_(Roman_Empire) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-752 |
| Limnae | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Liptako-Gourma | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gga-270 |
| Louisiana_Purchase | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lucanians | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lucus_Ferentinae | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lupercal | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Macellum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-842 |
| Manchukuo | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-089 cnh-633 |
| Manchuria | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-006 |
| Marrucini | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Marsi | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mastaba | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-065 |
| Maya_civilisation | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-428 |
| Meadowcroft_Rockshelter | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Megalith | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-138 |
| Megara | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Megaron | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-072 |
| Melos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mercator_projection | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-685 |
| Mesara_tholos_tomb | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Messenia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Metope | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-347 |
| Ming_Great_Wall | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-518 |
| Mingtang | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-875 |
| Mission_San_José_(Texas) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Moated_settlement | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-037 |
| Monks_Mound | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-019 |
| Moundville | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-021 |
| Mount_Dikte | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mount_Hymettus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mount_Juktas | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mount_Pentelicus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mountain_fortress | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-094 |
| Myrtos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Myrtos_Fournou_Korifi | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Nariokotome | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Nation_state | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-801 |
| Nationalist_government | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-597 |
| Native_Americans_in_the_United_States | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-001 |
| Nazi_concentration_camps | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-063 |
| Nazlet_Khater | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-013 |
| Ngorongoro_Conservation_Area | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Nilometer | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-085 |
| Noguni_shell_middens | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-022 |
| Nomadism | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Nome_(Egypt) | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-079 |
| North_American_fur_trade | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-050 |
| Northeast_Asia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-042 |
| Northern_Hemisphere | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Northern_Qi | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Nyayanga | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Oceania | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ocriculum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Odai_Yamamoto_I | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-007 |
| Ohio_Country | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-065 |
| Opisthodomos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ostrogothic_Kingdom | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-636 |
| Pacific_Northwest_Coast | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-031 |
| Paeligni | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Palaestra | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-886 |
| Panhellenic_sanctuary | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-228 |
| Panlongcheng | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-090 |
| Paphos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Paros | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pastoral_nomadism | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ru-003 |
| Pastoralism | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pausanias | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pax_Mongolica | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-596 |
| Peak_sanctuary | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pediment | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-346 |
| Pelargikon | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Penglai | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-021 |
| Peopling_of_Europe | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-095 |
| Peripteros | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-341 |
| Persia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-441 |
| Phocaea | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Phocis | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Phylakopi | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Picuris_Pueblo,_New_Mexico | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pinnacle_Point | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pit_dwelling | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-009 ko-025 |
| Pit-house | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-025 |
| Plinth | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Po_valley | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Polish_Corridor | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-007 |
| Pompeion | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Popina | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-859 |
| Praeneste | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Praying_town | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-055 |
| Prefecture | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Principality | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pronaos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Psychro_Cave | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pueblo_peoples | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-029 |
| Qin_long_walls | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-207 |
| Qin_road_system | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-203 |
| Quartier_Mu | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Quirinal_Hill | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ramesses_II | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-225 |
| Rashid | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Regia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Regionary_Catalogues | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-827 |
| Rise_of_Wei | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-165 |
| Roman_aqueduct | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-361 |
| Roman_Britain | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-757 |
| Roman_diocese | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-570 |
| Roman_Egypt | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-765 |
| Roman_provincial_taxation | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-269 |
| Roman_Syria | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-768 |
| Roman_villa | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-832 |
| Rostra | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Rubicon | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-359 |
| Sack_of_Haojing | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-138 |
| Salerno | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| San_peoples | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Sanctuary | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Sannai-Maruyama | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-010 |
| Satrapy | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-387 wh-305 |
| Savanna | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Scylla | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-961 |
| Settlement | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Shaft_Grave_V | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Shang_capitals | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-088 |
| Shipshed | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Shōsōin | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-096 |
| Sibudu_Cave | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Siege_of_Caizhou | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-482 |
| Siege_of_Changchun | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-630 |
| Siena | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Siheyuan | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-766 |
| Silicon_Valley | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Siphnos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Skarkos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Skene | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-614 |
| Soda_lake | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Songgungni | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-036 |
| South_Asia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Southern_dispersal_route | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-088 |
| Southern_Hemisphere | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Southwest_Asia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Special_economic_zone | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-682 |
| Sphere_of_influence | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-128 eep-003 |
| Spoletium | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Sterkfontein | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Stoa | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Stone_circle | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-018 |
| Strabo | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Stucco | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Stylobate | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Stymphalus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Sumerian_city-state | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-179 |
| Swabia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Taberna | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-843 |
| Tachikawa_Loam | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-029 |
| Taygetus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Temple | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Temple_of_Artemis,_Corfu | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Temple_of_Isis_and_Serapis | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-923 |
| Thasos | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| The_Travels_of_Marco_Polo | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-495 |
| Theatron | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-613 |
| Thermae | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-883 |
| Thespiae | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-425 |
| Thinis | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-169 |
| Tholos_tomb | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-064 |
| Thornax | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-269 |
| Thrace | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Three_Kingdoms | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-414 cnh-273 |
| Tlingit | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tōdai-ji | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-090 |
| Tomb | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tomb_of_Aegisthus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tomb_of_Clytemnestra | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tomb_of_Dangun | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-062 |
| Tomb_of_Fu_Hao | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-075 |
| Tomb_of_the_Lions | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Trans-Saharan_trade | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-423 |
| Treaty_of_Rhandeia | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-445 |
| Tribute_of_Yu | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-056 |
| Triglyph | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Triparadisus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-759 |
| Troy_I | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_II | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_III | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_IV | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_IX | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_V | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VI | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VII | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VIIb1 | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VIIb2 | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VIII | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Trust_territory | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tuder | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tumu_Crisis | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-517 |
| Tuscany | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tusculum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ulus | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Upper_and_Lower_Egypt | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-004 |
| Urban_agglomeration | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Valetudinarium | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-687 |
| Vasiliki | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Velabrum | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Vestibule | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Vestini | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Villa_rustica | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-861 |
| Viminal_Hill | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Volute | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Voussoir | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-981 |
| Wang_Jingwei_regime | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-643 |
| Wanggeom-seong | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-059 |
| Warring_States_cities | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-177 |
| Wawat | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-191 |
| Wernicke's_area | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ps-032 |
| West_Liao_River | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-014 |
| West_Turkana | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Western_Europe | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Western_Wei | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Willow_Palisade | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-795 |
| World_Heritage_Site | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Xibeigang | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-080 |
| Xuantu_Commandery | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-079 |
| Yamatai | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-044 |
| Yamato_polity | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-051 |
| Yoshinogari | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-038 |
| Yurt | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-587 |
| Zhengzhou_Shang_City | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-089 |
| Zhou_move_east | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-139 |
| Zoo_Rock | place | tagged a place, no join (needs a Wikidata lookup) |  |  |  | art-023 |

### Tier 7 — Not the term's own place (excluded) (708)

a person, a concept or an object whose card has a place: the window would show the card's place, not the glossary topic — listed so the choice is visible.

| term | class | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|---|
| Abolitionism | other | a card's places (every card of it) | city:1159151577 | capital | dot | wh-741 |
| Abusir_Papyri | other | a card's places (every card of it) | pl:q1609149 | site | dot | eg-124 |
| Abydos_boats | other | a card's locator coordinate — eg-087 | 31.9189,26.185 | coordinate | dot | eg-087 |
| Achaea_(Roman_province) | other | a card's places (named for the term) | pl:q2495811 | region | dot | gr-877 rm-775 |
| Achaean_League | other | a card's places (every card of it) | pl:q60790078 | site | dot | gr-796 |
| Aedile | other | a card's locator coordinate — rm-106 | 12.4828,41.8933 | coordinate | dot | rm-708 rm-106 |
| Aegean_Bronze_Age | other | a card's places (every card of it) | sea:1159117123 | sea | dot | gr-001 |
| Aerarium | other | a card's places (every card of it) | pl:q746721 | site | dot | rm-745 |
| Aes_grave | other | a card's places (every card of it) | pl:q34925 | hill | dot | rm-140 |
| Age_of_Discovery | other | a card's places (every card of it) | city:1159151273 | capital | dot | wh-656 |
| Age_of_Enlightenment | other | a card's places (every card of it) | city:1159151613 | capital | dot | wh-746 |
| Ager_publicus | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-150 |
| Alimenta | other | a card's places (every card of it) | pl:q2511513 | town | dot | rm-500 |
| Along_the_River_During_the_Qingming_Festival | other | a card's places (every card of it) | pl:q208471 | city | dot | cnh-443 |
| Altar_of_Victory | other | a card's locator coordinate — rm-607 | 12.4854,41.8929 | coordinate | dot | rm-607 |
| Amban | other | a card's places (every card of it) | city:1159150879 | town | dot | cnh-548 |
| Ancient_Greek_funeral_and_burial_practices | other | a card's places (every card of it) | pl:q630974 | site | dot | gr-999 |
| Annales_maximi | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-090 |
| Antikythera_mechanism | other | a card's places (every card of it) | pl:q213730 | island | dot | gr-835 |
| Apollo_of_Veii | other | a card's locator coordinate — rm-039 | 12.3897,42.0233 | coordinate | dot | rm-039 |
| Areopagus | other | a card's places (named for the term) | pl:q202487 | hill | dot | gr-280 gr-899 |
| Asiento_de_Negros | other | a card's places (every card of it) | city:1159151503 | capital | dot | wh-735 |
| ASML_Holding | other | a card's places (every card of it) | pl:q9875 | town | dot | gga-060 |
| Augustus_of_Prima_Porta | other | a card's places (every card of it) | pl:q1760467 | town | dot | rm-405 |
| Autobiography_of_Harkhuf | other | a card's places (every card of it) | pl:q1518125 | mountain | dot | eg-132 |
| Autobiography_of_Weni | other | a card's places (every card of it) | pl:q192268 | site | dot | eg-134 |
| Ayia_Triada_sarcophagus | other | a card's locator coordinate — gr-033 | 24.7925,35.0589 | coordinate | dot | gr-033 |
| Aztec_religion | other | a card's locator coordinate — wh-607 | -98.7075,19.4073 | coordinate | dot | wh-607 |
| Aztec_society | other | a card's places (every card of it) | pl:q796347 | city | dot | wh-608 |
| Balfour_Declaration | other | a card's places (every card of it) | city:1159151577 | capital | dot | wh-890 |
| Bamboo_Texts_of_Guodian | other | a card's locator coordinate — cnh-838 | 112.199,31.0354 | coordinate | dot | cnh-838 |
| Baopuzi | other | a card's locator coordinate — cnh-878 | 114,23.3 | coordinate | dot | cnh-878 |
| Behistun_Inscription | other | a card's places (every card of it) | pl:q740141 | town | dot | wh-307 |
| Beiyang_government | other | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-581 |
| Benin_Bronzes | other | a card's places (every card of it) | city:1159149127 | city | dot | wh-576 |
| Bessemer_process | other | a card's places (every card of it) | city:1159127645 | city | dot | wh-784 |
| Blue_and_white_pottery | other | a card's places (every card of it) | pl:q34405 | city | dot | cnh-957 |
| Book_of_Han | other | a card's places (every card of it) | city:1159147063 | city | dot | cnh-260 |
| Bretton_Woods_system | other | a card's places (named for the term) | pl:q911049 | town | dot | gga-253 |
| Bull-leaping_fresco | other | a card's places (every card of it) | pl:q173527 | site | dot | gr-023 |
| Cancelleria_Reliefs | other | a card's locator coordinate — rm-974 | 12.4715,41.8967 | coordinate | dot | rm-974 |
| Canton_System | other | a card's locator coordinate — wh-719 cnh-557 | 113.2644,23.1291 | coordinate | dot | wh-719 cnh-557 |
| Caoyun | other | a card's places (every card of it) | city:1159149921 | city | dot | cnh-813 |
| Caravel | other | a card's places (every card of it) | pl:q35710384 | city | dot | wh-658 |
| Carved_lacquer | other | a card's locator coordinate — cnh-959 | 120.8889,30.9472 | coordinate | dot | cnh-959 |
| Centaur | other | a card's locator coordinate — gr-919 | 23.0464,39.4386 | coordinate | dot | gr-919 |
| Chariot_racing | other | a card's locator coordinate — rm-876 | 12.4857,41.8859 | coordinate | dot | rm-876 |
| Child_labour | other | a card's places (every card of it) | pl:q201970 | town | dot | wh-789 |
| Chinampa | other | a card's places (every card of it) | pl:q643026 | region | dot | wh-609 |
| Chinchorro_mummies | other | a card's places (every card of it) | city:1159150047 | town | dot | wh-161 |
| Chondoist_Chongu_Party | other | a card's places (every card of it) | city:1159151303 | capital | dot | pea-199 |
| Civitas_sine_suffragio | other | a card's places (every card of it) | pl:q2914373 | site | dot | rm-147 |
| Coal_mining | other | a card's locator coordinate — wh-783 | -1.513,54.972 | coordinate | dot | wh-783 |
| Cognomen | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-086 |
| Collective_security | other | a card's places (every card of it) | city:1159151505 | city | dot | ww2-106 |
| Collegiality | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-096 |
| Colonus_(person) | other | a card's places (named for the term) | pl:q1235930 | town | dot | gr-567 rm-591 |
| Colossus_of_Rhodes | other | a card's places (every card of it) | pl:q188731 | town | dot | gr-764 |
| Comitia_Curiata | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-081 |
| Constitution_of_the_United_States | other | a card's places (every card of it) | city:1159151243 | city | dot | wh-756 |
| Constitutional_Democratic_Party_of_Japan | other | a card's locator coordinate — pea-056 | 139.7403,35.6788 | coordinate | dot | pea-056 |
| Consul | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-092 |
| Consular_tribune | other | a card's places (every card of it) | pl:q242839 | region | dot | rm-116 |
| Coptos_Decrees | other | a card's places (every card of it) | pl:q935454 | site | dot | eg-140 |
| Corinthian_pottery | other | a card's places (every card of it) | pl:q1363688 | site | dot | gr-323 |
| Court_of_Justice_of_the_European_Union | other | a card's places (every card of it) | pl:q583718 | town | dot | eep-071 |
| Creolization | other | a card's locator coordinate — wh-744 | -77.851,18.0256 | coordinate | dot | wh-744 |
| Cult_image | other | a card's places (every card of it) | pl:q38888 | site | dot | gr-969 |
| Curator_rei_publicae | other | a card's places (every card of it) | pl:q739037 | site | dot | rm-532 |
| Curse_tablet | other | a card's locator coordinate — gr-1000 | 23.7225,37.975 | coordinate | dot | gr-1000 |
| Cursus_honorum | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-131 |
| Damnatio_memoriae | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-488 |
| De_Ceremoniis | other | a card's places (every card of it) | pl:q16869 | city | dot | ru-047 |
| Decemviri | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-111 |
| Declaration_of_the_Rights_of_Man_and_of_the_Citizen | other | a card's locator coordinate — wh-759 | 2.1203,48.8047 | coordinate | dot | wh-759 |
| Declaration_of_war | other | a card's places (every card of it) | city:1159151577 | capital | dot | ww2-148 |
| Delator | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-482 |
| Delphic_amphictyony | other | a card's places (every card of it) | pl:q75459 | site | dot | gr-983 |
| Delphic_maxims | other | a card's places (every card of it) | pl:q75459 | site | dot | gr-980 |
| Delphic_oracle | other | a card's places (every card of it) | pl:q75459 | site | dot | gr-978 |
| Democratic_Party_of_Japan | other | a card's locator coordinate — pea-042 | 139.7403,35.6788 | coordinate | dot | pea-042 |
| Democratic_Party_of_Korea | other | a card's locator coordinate — pea-087 | 126.9267,37.5239 | coordinate | dot | pea-087 |
| Democratic_Progressive_Party | other | a card's locator coordinate — pea-152 | 121.5164,25.0317 | coordinate | dot | pea-152 |
| Diamond_Sutra | other | a card's places (every card of it) | pl:q319114 | town | dot | cnh-976 |
| Digest_(Roman_law) | other | a card's places (every card of it) | city:1159149751 | city | dot | rm-729 |
| Ding_ware | other | a card's locator coordinate — cnh-955 | 114.745,38.6222 | coordinate | dot | cnh-955 |
| Dingjun_Mountain_(film) | other | a card's locator coordinate — cnh-972 | 106.6614,33.115 | coordinate | dot | cnh-972 |
| Dionysian_Mysteries | other | a card's places (every card of it) | pl:q243456 | site | dot | gr-994 |
| Discourses_on_Salt_and_Iron | other | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-235 |
| Dissection | other | a card's places (every card of it) | city:1159151349 | city | dot | gr-834 |
| Divus_Augustus | other | a card's places (every card of it) | pl:q72288 | town | dot | rm-415 |
| Domesday_Book | other | a card's places (every card of it) | pl:q172157 | city | dot | wh-505 |
| Donativum | other | a card's locator coordinate — rm-431 | 12.506,41.9059 | coordinate | dot | rm-431 rm-685 |
| Donglin_movement | other | a card's places (every card of it) | city:1159149149 | city | dot | cnh-531 |
| Donkey | other | a card's places (every card of it) | pl:q192268 | site | dot | eg-022 |
| Dunhuang_Star_Chart | other | a card's places (every card of it) | pl:q319114 | town | dot | cnh-982 |
| Dutch_East_India_Company | other | a card's places (every card of it) | city:1159151519 | capital | dot | wh-676 |
| Early_Minoan_Crete | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-005 |
| East_India_Company | other | a card's places (every card of it) | city:1159151577 | capital | dot | wh-677 |
| Eastern_Zhou | other | a card's locator coordinate — wh-396 | 112.4245,34.6587 | coordinate | dot | wh-396 cnh-141 |
| Edict_of_Milan | other | a card's places (every card of it) | city:1159151315 | city | dot | rm-580 |
| Edict_on_Maximum_Prices | other | a card's places (every card of it) | pl:q618495 | site | dot | rm-572 |
| Electoral_programma | other | a card's locator coordinate — rm-855 | 14.4861,40.75 | coordinate | dot | rm-855 |
| Electrical_telegraph | other | a card's places (every card of it) | pl:q137975214 | town | dot | wh-798 |
| Emancipation_Proclamation | other | a card's places (every card of it) | city:1159151573 | capital | dot | wh-814 |
| Emancipation_reform_of_1861 | other | a card's places (every card of it) | city:1159151291 | city | dot | wh-811 |
| Encomienda | other | a card's places (every card of it) | city:1159151401 | capital | dot | wh-673 |
| Encyclopédie | other | a card's places (every card of it) | city:1159151613 | capital | dot | wh-751 |
| Epicureanism | other | a card's places (every card of it) | city:1159151545 | capital | dot | gr-841 |
| Equal-field_system | other | a card's places (every card of it) | city:1159146991 | city | dot | cnh-332 |
| Eteocretan | other | a card's places (every card of it) | pl:q11942554 | site | dot | gr-054 |
| Etrusca_disciplina | other | a card's locator coordinate — rm-030 | 11.8389,42.2279 | coordinate | dot | rm-030 |
| Etruscan_bronzework | other | a card's locator coordinate — rm-037 | 11.8389,42.2279 | coordinate | dot | rm-037 |
| Etruscan_influence_on_Rome | other | a card's locator coordinate — rm-045 | 11.8389,42.2279 | coordinate | dot | rm-045 |
| Etruscan_language | other | a card's locator coordinate — rm-026 | 11.8389,42.2279 | coordinate | dot | rm-026 |
| Etruscan_league | other | a card's locator coordinate — rm-025 | 11.8389,42.2279 | coordinate | dot | rm-025 |
| Etruscan_origins | other | a card's locator coordinate — rm-023 | 11.8389,42.2279 | coordinate | dot | rm-023 |
| Etruscan_religion | other | a card's locator coordinate — rm-028 | 11.8389,42.2279 | coordinate | dot | rm-028 |
| Etruscan_tomb_painting | other | a card's locator coordinate — rm-031 | 11.8389,42.2279 | coordinate | dot | rm-031 |
| Eurasian_Economic_Union | other | a card's places (every card of it) | city:1159151585 | capital | dot | eep-203 |
| European_Council | other | a card's locator coordinate — eep-080 | 4.3808,50.8425 | coordinate | dot | eep-080 |
| European_Defence_Agency | other | a card's locator coordinate — eep-045 | 4.3588,50.8354 | coordinate | dot | eep-045 |
| European_External_Action_Service | other | a card's locator coordinate — eep-086 | 4.3856,50.8425 | coordinate | dot | eep-086 |
| European_Union | other | a card's places (every card of it) | city:1159151465 | capital | dot | wh-989 |
| Executive_Council_of_Hong_Kong | other | a card's locator coordinate — pea-166 | 114.1651,22.2815 | coordinate | dot | pea-166 |
| Fabri_tignarii | other | a card's places (every card of it) | pl:q1012797 | site | dot | rm-997 |
| Factory_Acts | other | a card's places (every card of it) | pl:q189960 | town | dot | wh-790 |
| Falernian_wine | other | a card's locator coordinate — rm-862 | 14.0008,41.1308 | coordinate | dot | rm-862 |
| Farnese_Hercules | other | a card's locator coordinate — rm-975 | 12.4931,41.8794 | coordinate | dot | rm-975 |
| Fasces | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-095 |
| Fasti_Consulares | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-093 |
| Feng_Shan | other | a card's locator coordinate — cnh-874 | 117.1075,36.2558 | coordinate | dot | cnh-874 |
| Feriae_Latinae | other | a card's places (every card of it) | pl:q1729630 | mountain | dot | rm-143 |
| Five_Dynasties_and_Ten_Kingdoms_period | other | a card's places (every card of it) | pl:q208471 | city | dot | cnh-397 |
| Flotilla_fresco | other | a card's locator coordinate — gr-044 | 25.4036,36.3514 | coordinate | dot | gr-044 |
| Forma_Urbis_Romae | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-535 |
| Gens | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-085 |
| Golden_Fleece | other | a card's places (every card of it) | pl:q378091 | site | dot | gr-934 |
| Golden_Urn | other | a card's places (every card of it) | pl:q735914 | site | dot | cnh-783 |
| Gordian_Knot | other | a card's places (every card of it) | pl:q542854 | site | dot | gr-714 |
| Government-General_of_Taiwan | other | a card's places (every card of it) | pl:q55601 | site | dot | cnh-691 |
| Grand_Council_(Qing_dynasty) | other | a card's places (every card of it) | pl:q80290 | site | dot | cnh-550 |
| Great_Sphinx_of_Giza | other | a card's places (every card of it) | pl:q3613336 | site | dot | wh-213 |
| Greco-Roman_mysteries | other | a card's places (every card of it) | pl:q203175 | island | dot | gr-992 |
| Greek_altar | other | a card's places (every card of it) | pl:q38888 | site | dot | gr-970 |
| Greek_priesthood | other | a card's places (every card of it) | pl:q39971 | town | dot | gr-974 |
| Grivna | other | a card's places (every card of it) | pl:q162677 | city | dot | ru-069 |
| Guan_ware | other | a card's places (every card of it) | city:1159151387 | city | dot | cnh-456 |
| Guilty_Men | other | a card's places (every card of it) | city:1159151577 | capital | dot | ww2-120 |
| Haijin | other | a card's locator coordinate — wh-714 | 121.544,29.8683 | coordinate | dot | wh-714 cnh-521 |
| Han_commanderies | other | a card's locator coordinate — cnh-233 | 125.7475,39.0167 | coordinate | dot | ko-071 cnh-233 |
| Hangul | other | a card's places (every card of it) | city:1159151523 | capital | dot | wh-725 |
| Hanseatic_League | other | a card's places (every card of it) | pl:q2843 | city | dot | wh-515 |
| Haruspicy | other | a card's locator coordinate — rm-029 | 11.8389,42.2279 | coordinate | dot | rm-029 |
| Hecatomb | other | a card's places (every card of it) | pl:q7263152 | city | dot | gr-972 |
| Heian_period | other | a card's places (every card of it) | city:1159149967 | city | dot | wh-542 |
| Hellenistic_sculpture | other | a card's places (every card of it) | pl:q18986 | site | dot | gr-845 |
| Helsinki_Accords | other | a card's places (every card of it) | city:1159151419 | capital | dot | gga-110 |
| Heraclean_Tablets | other | a card's places (every card of it) | pl:q52327 | town | dot | rm-834 |
| Hero_cult | other | a card's locator coordinate — gr-998 | 23.84,40.8183 | coordinate | dot | gr-998 gr-126 |
| History_of_opium_in_China | other | a card's locator coordinate — cnh-559 | 113.8036,22.4128 | coordinate | dot | cnh-559 |
| Hong_Kong_Civil_Service | other | a card's locator coordinate — pea-189 | 114.1651,22.2815 | coordinate | dot | pea-189 |
| Hong_Kong_Police_Force | other | a card's locator coordinate — pea-190 | 114.168,22.2787 | coordinate | dot | pea-190 |
| Horns_of_consecration | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-030 |
| Hossbach_Memorandum | other | a card's places (every card of it) | city:1159151529 | capital | dot | ww2-140 |
| Hostis | other | a card's places (every card of it) | pl:q1144514 | site | dot | rm-454 |
| Household_responsibility_system | other | a card's places (every card of it) | pl:q8044256 | town | dot | cnh-681 |
| Howiesons_Poort | other | a card's locator coordinate — wh-059 | 26.5267,-33.31 | coordinate | dot | wh-059 |
| Iguvine_Tables | other | a card's places (every card of it) | pl:q3792526 | site | dot | rm-016 |
| Imperial_cult_of_ancient_Rome | other | a card's places (every card of it) | city:1159150845 | city | dot | rm-528 |
| Imperium | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-094 |
| Incitatus | other | a card's places (every card of it) | pl:q207808 | site | dot | rm-428 |
| Incubation_(ritual) | other | a card's places (every card of it) | pl:q233576 | site | dot | gr-997 |
| Indian_National_Congress | other | a card's places (every card of it) | city:1159151611 | city | dot | wh-839 |
| Institutes_(Gaius) | other | a card's places (every card of it) | pl:q2028 | city | dot | rm-726 |
| International_Commission_on_Missing_Persons | other | a card's places (every card of it) | city:1159149457 | city | dot | gga-072 |
| Islam_in_India | other | a card's places (every card of it) | pl:q491993 | site | dot | wh-551 |
| Isolationism | other | a card's places (every card of it) | city:1159151573 | capital | dot | ww2-131 |
| Jade_burial_suit | other | a card's locator coordinate — cnh-954 | 115.322,38.949 | coordinate | dot | cnh-954 |
| Jesuit_China_missions | other | a card's places (every card of it) | pl:q59164 | city | dot | cnh-526 |
| Jiaozi_(currency) | other | a card's places (every card of it) | city:1159151533 | city | dot | cnh-436 |
| Kahun_Papyri | other | a card's places (every card of it) | pl:q56924 | site | dot | eg-187 |
| Kaihuang_Code | other | a card's places (every card of it) | city:1159151363 | city | dot | cnh-346 |
| Kamares_ware | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-025 |
| Khafre_Enthroned | other | a card's places (every card of it) | city:1159146947 | city | dot | eg-110 |
| Khufu_ship | other | a card's places (every card of it) | city:1159146947 | city | dot | eg-106 |
| King_of_Na_gold_seal | other | a card's places (every card of it) | pl:q3077260 | island | dot | cnh-799 |
| Knossos_Linear_B_archive | other | a card's places (every card of it) | pl:q173527 | site | dot | gr-052 |
| Komeito | other | a card's locator coordinate — pea-053 | 139.7227,35.6811 | coordinate | dot | pea-053 |
| Korean_People's_Army | other | a card's places (every card of it) | city:1159151303 | capital | dot | pea-115 |
| Kraak_ware | other | a card's places (every card of it) | pl:q34405 | city | dot | cnh-525 |
| Kunqu | other | a card's locator coordinate — cnh-970 | 120.985,31.322 | coordinate | dot | cnh-970 |
| Kuomintang | other | a card's locator coordinate — pea-151 | 121.5164,25.0317 | coordinate | dot | cnh-598 pea-151 |
| Kyiv_Pechersk_Lavra | other | a card's places (named for the term) | pl:q242711 | site | dot | ru-061 |
| Labrys | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-031 |
| Larnax | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-034 |
| Latin | other | a card's places (every card of it) | pl:q243456 | site | dot | rm-179 |
| Latin_League | other | a card's locator coordinate — rm-011 | 12.7,41.71 | coordinate | dot | rm-011 |
| Latin_rights | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-145 |
| League_of_Nations | other | a card's locator coordinate — wh-894 | 6.1469,46.2017 | coordinate | dot | ww2-012 wh-894 |
| Legislative_Council_of_Hong_Kong | other | a card's places (every card of it) | pl:q13643095 | site | dot | pea-167 |
| Legislative_Yuan | other | a card's places (named for the term) | pl:q715869 | site | dot | pea-160 pea-155 |
| Lei_Áurea | other | a card's places (every card of it) | city:1159151619 | city | dot | wh-862 |
| Lernaean_Hydra | other | a card's places (every card of it) | pl:q1236078 | site | dot | gr-925 |
| Lex_de_imperio_Vespasiani | other | a card's places (every card of it) | pl:q333906 | site | dot | rm-466 |
| Lex_Gabinia | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-332 |
| Lex_Hieronica | other | a card's places (every card of it) | pl:q13670 | city | dot | rm-778 |
| Liangzhu_jade | other | a card's places (every card of it) | pl:q1204909 | region | dot | cnh-049 |
| Liberal_Democratic_Party_(Japan) | other | a card's locator coordinate — pea-041 | 139.7403,35.6788 | coordinate | dot | pea-041 |
| Library_of_Alexandria | other | a card's places (every card of it) | city:1159151349 | city | dot | wh-335 gr-802 |
| Linear_perspective | other | a card's places (every card of it) | pl:q732511 | site | dot | wh-629 |
| Lingbao_School | other | a card's locator coordinate — cnh-837 | 110.92,34.63 | coordinate | dot | cnh-876 cnh-837 |
| Lion-man | other | a card's locator coordinate — wh-069 | 10.1725,48.5492 | coordinate | dot | wh-069 |
| Lodged_commanderies | other | a card's places (every card of it) | pl:q57958 | city | dot | cnh-311 |
| Longquan_celadon | other | a card's locator coordinate — cnh-956 | 119.1208,28.075 | coordinate | dot | cnh-956 |
| Ludi_Romani | other | a card's locator coordinate — rm-867 | 12.4857,41.8859 | coordinate | dot | rm-867 |
| Lyon_Tablet | other | a card's places (every card of it) | pl:q665 | site | dot | rm-435 |
| Magna_Carta | other | a card's places (every card of it) | pl:q1483542 | region | dot | wh-513 |
| Maiestas | other | a card's places (every card of it) | pl:q1144514 | site | dot | rm-426 |
| Manila_galleon | other | a card's places (every card of it) | city:1159151525 | capital | dot | wh-678 |
| Mao_Gong_ding | other | a card's locator coordinate — cnh-953 | 107.6997,34.4114 | coordinate | dot | cnh-953 |
| Marine_Style | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-026 |
| Medea_(play) | other | a card's locator coordinate — gr-935 | 22.8802,37.9053 | coordinate | dot | gr-601 gr-935 |
| Medieval_university | other | a card's places (every card of it) | city:1159151613 | capital | dot | wh-511 |
| Metal_movable_type | other | a card's places (every card of it) | city:1159151523 | capital | dot | wh-541 |
| Metropolis_of_Kyiv | other | a card's places (every card of it) | city:1159151495 | capital | dot | ru-060 |
| Minoan_frescoes | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-022 |
| Minoan_palace_economy | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-018 |
| Minoan_religion | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-032 |
| Minoan_sealstone | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-027 |
| Minotaur | other | a card's places (every card of it) | pl:q173527 | site | dot | gr-929 |
| MINUSMA | other | a card's places (every card of it) | adm0:mli | country | face | gga-037 |
| Monument_of_Aemilius_Paullus | other | a card's places (every card of it) | pl:q75459 | site | dot | gr-861 |
| Mouseion | other | a card's places (every card of it) | city:1159151349 | city | dot | gr-803 |
| Movable_type | other | a card's places (every card of it) | pl:q208471 | city | dot | wh-532 |
| Nanjing_decade | other | a card's places (every card of it) | city:1159151385 | city | dot | cnh-596 |
| Napoleonic_Code | other | a card's places (every card of it) | city:1159151613 | capital | dot | wh-764 |
| Naqada_I | other | a card's places (every card of it) | pl:q959859 | site | dot | eg-029 |
| Naqada_II | other | a card's places (every card of it) | pl:q278988 | site | dot | eg-030 |
| Narmer_Palette | other | a card's locator coordinate — eg-050 | 32.7794,25.0972 | coordinate | dot | wh-204 eg-050 |
| National_Assembly_(South_Korea) | other | a card's places (every card of it) | pl:q488748 | site | dot | pea-085 |
| Nazca_Lines | other | a card's locator coordinate — wh-433 | -75.135,-14.6975 | coordinate | dot | wh-433 |
| Nebra_sky_disc | other | a card's locator coordinate — wh-275 | 11.52,51.2839 | coordinate | dot | wh-275 |
| Nemean_lion | other | a card's places (every card of it) | pl:q748108 | site | dot | gr-924 |
| Neo-Confucianism | other | a card's locator coordinate — wh-533 | 118.1,26.1 | coordinate | dot | wh-533 cnh-460 |
| Neopalatial_period | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-016 |
| Night_Revels_of_Han_Xizai | other | a card's places (every card of it) | city:1159151385 | city | dot | cnh-949 |
| Ninety-five_Theses | other | a card's places (every card of it) | pl:q6837 | city | dot | wh-637 |
| Non-Aligned_Movement | other | a card's places (every card of it) | city:1159151079 | capital | dot | wh-981 |
| Non-Intervention_Committee | other | a card's places (every card of it) | city:1159151577 | capital | dot | ww2-114 |
| Northern_Renaissance | other | a card's places (every card of it) | city:1159132155 | town | dot | wh-632 |
| Nvidia | other | a card's places (every card of it) | pl:q159260 | city | dot | gga-205 |
| Nymph | other | a card's places (every card of it) | pl:q187471 | island | dot | gr-918 |
| OCP_Group | other | a card's places (every card of it) | city:1159151521 | city | dot | gga-271 |
| Omphalos | other | a card's places (every card of it) | pl:q75459 | site | dot | gr-981 |
| On_the_Origin_of_Species | other | a card's places (every card of it) | city:1159151577 | capital | dot | wh-823 |
| Optimus_princeps | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-494 |
| Oracle | other | a card's places (every card of it) | pl:q382317 | site | dot | gr-977 |
| Orphism_(religion) | other | a card's places (every card of it) | pl:q602564 | city | dot | gr-993 |
| Palaikastro_Kouros | other | a card's places (every card of it) | pl:q941860 | town | dot | gr-040 |
| Panhellenion | other | a card's places (every card of it) | pl:q1123019 | site | dot | rm-505 |
| Paper_money | other | a card's places (every card of it) | city:1159151533 | city | dot | wh-529 cnh-436 |
| Partnership_for_Peace | other | a card's locator coordinate — gga-115 | 4.425,50.8792 | coordinate | dot | gga-115 |
| Patres | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-082 |
| People_Power_Party | other | a card's locator coordinate — pea-086 | 126.9267,37.5239 | coordinate | dot | pea-086 |
| Periodonikes | other | a card's places (every card of it) | pl:q38888 | site | dot | rm-450 |
| Phaistos_Disc | other | a card's places (every card of it) | pl:q249707 | site | dot | gr-021 |
| Pithos | other | a card's places (every card of it) | pl:q173527 | site | dot | gr-017 |
| Plan_Colombia | other | a card's locator coordinate — gga-198 | -72,4 | coordinate | dot | gga-198 |
| Plantation_economy | other | a card's places (every card of it) | city:1159150855 | capital | dot | wh-729 |
| Platform_Sutra | other | a card's locator coordinate — cnh-890 | 113.597,24.811 | coordinate | dot | cnh-890 |
| Plebeian_council | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-105 |
| Plinian_eruption | other | a card's places (every card of it) | pl:q524 | mountain | dot | rm-477 |
| Polis_religion | other | a card's places (every card of it) | city:1159151545 | capital | dot | gr-967 |
| Politburo_Standing_Committee_of_the_Chinese_Communist_Party | other | a card's locator coordinate — pea-010 | 116.3805,39.9113 | coordinate | dot | pea-010 |
| Political_violence_in_the_late_Roman_Republic | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-348 |
| Porcelain | other | a card's places (every card of it) | pl:q34405 | city | dot | wh-534 |
| Portorium | other | a card's places (every card of it) | pl:q47611 | site | dot | rm-742 |
| Postpalatial_Crete | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-053 |
| Praefectura | other | a card's places (every card of it) | pl:q58477 | town | dot | rm-144 |
| Praetor | other | a card's locator coordinate — rm-132 | 12.4853,41.8925 | coordinate | dot | rm-707 rm-132 |
| Primary_Chronicle | other | a card's places (every card of it) | city:1159151495 | capital | dot | ru-038 |
| Printing_press | other | a card's places (every card of it) | city:1159122449 | town | dot | wh-630 |
| Proscription | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-318 |
| Protectorate_of_the_Western_Regions | other | a card's places (every card of it) | reg:1159104093 | region | dot | cnh-258 |
| Protestantism | other | a card's places (every card of it) | pl:q6829 | city | dot | wh-638 |
| Protopalatial_period | other | a card's places (every card of it) | reg:1159102805 | island | dot | gr-015 |
| Pyramid_Texts | other | a card's places (every card of it) | pl:q1478801 | site | dot | eg-127 |
| Pyrgi_Tablets | other | a card's places (every card of it) | pl:q1724661 | site | dot | rm-027 |
| Pyrrhonism | other | a card's places (every card of it) | pl:q1063649 | region | dot | gr-844 |
| Pythia | other | a card's places (every card of it) | pl:q75459 | site | dot | gr-979 |
| Quaestor | other | a card's locator coordinate — rm-118 | 12.4842,41.8925 | coordinate | dot | rm-709 rm-118 |
| Rail_transport | other | a card's locator coordinate — wh-785 | -1.5526,54.527 | coordinate | dot | wh-785 |
| Reformation | other | a card's places (every card of it) | pl:q2749 | city | dot | wh-635 |
| Reichsgau | other | a card's places (every card of it) | city:1159139065 | town | dot | ww2-150 |
| Renaissance_humanism | other | a card's places (every card of it) | pl:q6247 | town | dot | wh-625 |
| Res_Gestae_Divi_Augusti | other | a card's locator coordinate — rm-396 | 32.8583,39.9443 | coordinate | dot | rm-396 |
| Rex_Sacrorum | other | a card's places (every card of it) | pl:q180212 | site | dot | rm-080 |
| Riace_bronzes | other | a card's locator coordinate — gr-646 | 16.4811,38.4181 | coordinate | dot | gr-646 |
| Rodong_Sinmun | other | a card's places (every card of it) | city:1159151303 | capital | dot | pea-194 |
| Roman_assemblies | other | a card's places (every card of it) | pl:q1114895 | site | dot | rm-700 |
| Roman_censor | other | a card's locator coordinate — rm-117 | 12.4772,41.8978 | coordinate | dot | rm-710 rm-117 |
| Roman_census | other | a card's places (every card of it) | pl:q242839 | region | dot | rm-073 |
| Roman_dictator | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-109 |
| Roman_Kingdom | other | a card's places (named for the term) | pol:roman_kingdom | polity | face | rm-046 wh-339 |
| Roman_Republic | other | a card's places — several candidates — pol:roman_kingdom Roman Kingdom; pol:rome Rome | pol:roman_kingdom, pol:rome |  |  | rm-091 wh-340 |
| Rome-Berlin_Axis | other | a card's places (every card of it) | city:1159151593 | capital | dot | ww2-115 |
| Rossotrudnichestvo | other | a card's locator coordinate — eep-128 | 37.6056,55.7528 | coordinate | dot | eep-128 |
| Rota_system | other | a card's places (every card of it) | city:1159151495 | capital | dot | ru-070 |
| Royal_African_Company | other | a card's places (every card of it) | pl:q1254826 | site | dot | wh-736 |
| Royal_Society | other | a card's locator coordinate — wh-655 | -0.1098,51.5175 | coordinate | dot | wh-655 |
| Rule_of_Wen_and_Jing | other | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-221 |
| Russkaya_Pravda | other | a card's places (every card of it) | city:1159146503 | town | dot | ru-058 |
| Sacrosanctity | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-104 |
| Sakoku | other | a card's places (every card of it) | city:1159150893 | town | dot | wh-724 |
| Scorpion_Macehead | other | a card's places (every card of it) | pl:q278988 | site | dot | eg-048 |
| Secret_succession | other | a card's places (every card of it) | pl:q7126241 | site | dot | cnh-732 |
| Secutor | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-523 |
| Seleucid_colonisation | other | a card's places (every card of it) | pl:q464266 | site | dot | gr-779 |
| Sermon_on_Law_and_Grace | other | a card's places (every card of it) | city:1159151495 | capital | dot | ru-062 |
| Shanghai_Communiqué | other | a card's places (every card of it) | city:1159151605 | city | dot | cnh-676 |
| Shanghai_Cooperation_Organisation | other | a card's places (every card of it) | city:1159151595 | capital | dot | gga-011 |
| Shu_brocade | other | a card's places (every card of it) | city:1159151533 | city | dot | cnh-815 |
| Shuihudi_Qin_bamboo_texts | other | a card's locator coordinate — cnh-201 | 113.754,31.021 | coordinate | dot | cnh-201 |
| Sibylline_Books | other | a card's places (every card of it) | pl:q34925 | hill | dot | rm-076 |
| Sikhism | other | a card's places (every card of it) | city:1159150975 | city | dot | wh-706 |
| Siku_Quanshu | other | a card's places (every card of it) | pl:q80290 | site | dot | cnh-552 |
| Slave_codes | other | a card's places (every card of it) | city:1159129911 | town | dot | wh-732 |
| Slave_Trade_Act_1807 | other | a card's places (every card of it) | pl:q189960 | town | dot | wh-743 |
| Snake_Goddess_figurines | other | a card's places (every card of it) | pl:q173527 | site | dot | gr-024 |
| Socialism | other | a card's places (every card of it) | pl:q743108 | town | dot | wh-795 |
| Society_of_Jesus | other | a card's places (every card of it) | city:1159151593 | capital | dot | wh-643 |
| Sogdian_Ancient_Letters | other | a card's places (every card of it) | pl:q319114 | town | dot | cnh-814 |
| Sovietization | other | a card's locator coordinate — ww2-154 | 24.0297,49.8397 | coordinate | dot | ww2-154 |
| Spinning_jenny | other | a card's locator coordinate — wh-781 | -2.393,53.743 | coordinate | dot | wh-781 |
| State_Affairs_Commission_of_North_Korea | other | a card's places (every card of it) | city:1159151303 | capital | dot | pea-117 |
| Steam_engine | other | a card's places (every card of it) | pl:q578855 | town | dot | wh-779 |
| Steamship | other | a card's places (every card of it) | pl:q24826 | city | dot | wh-799 |
| Stephenson's_Rocket | other | a card's places (every card of it) | pl:q2429969 | town | dot | wh-786 |
| Stoicism | other | a card's places (every card of it) | city:1159151545 | capital | dot | gr-838 |
| Stone_Drums | other | a card's locator coordinate — cnh-905 | 107.4206,34.56 | coordinate | dot | cnh-905 |
| Successor_state | other | a card's places — several candidates — pol:austria_1918 Republic of Austria; pol:czechoslovakia Czechoslovakia; pol:estonia_1918 Estonia; pol:finland Finland; pol:hungary_1918 Hun | pol:austria_1918, pol:czechoslovakia, pol:estonia_1918 |  |  | ww2-008 |
| Sullan_constitution | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-320 |
| Supreme_People's_Assembly | other | a card's places (every card of it) | pl:q337875 | site | dot | pea-197 |
| SWIFT | other | a card's places (every card of it) | pl:q670407 | town | dot | gga-059 |
| Symploke | other | a card's places (every card of it) | pl:q782278 | city | dot | gr-848 |
| Taiwan_People's_Party | other | a card's places (every card of it) | city:1159151567 | capital | dot | pea-204 |
| Taixue | other | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-239 |
| Tanite_sphinxes | other | a card's places (every card of it) | pl:q210598 | site | dot | eg-198 |
| Tanzimat | other | a card's places (every card of it) | city:1159151579 | city | dot | wh-808 |
| Temple_of_Confucius | other | a card's locator coordinate — cnh-833 | 116.9862,35.5819 | coordinate | dot | cnh-833 |
| Terracotta_Army | other | a card's places (named for the term) | pl:q47672 | site | dot | wh-406 cnh-209 |
| The_Communist_Manifesto | other | a card's places (every card of it) | city:1159151577 | capital | dot | wh-794 |
| The_Tale_of_Genji | other | a card's places (every card of it) | city:1159149967 | city | dot | wh-543 |
| The_Tale_of_Igor's_Campaign | other | a card's places (every card of it) | pl:q147758 | city | dot | ru-086 |
| Theran_tephra | other | a card's places (every card of it) | pl:q129296 | island | dot | gr-045 |
| Three_Departments_and_Six_Ministries | other | a card's places (every card of it) | city:1159151363 | city | dot | cnh-347 |
| Toba_catastrophe_theory | other | a card's places (every card of it) | pl:q183360 | lake | dot | wh-064 |
| Transatlantic_telegraph_cable | other | a card's locator coordinate — wh-868 | -53.3644,47.8703 | coordinate | dot | wh-868 |
| Triangular_trade | other | a card's places (every card of it) | pl:q24826 | city | dot | wh-728 |
| Tribune_of_the_plebs | other | a card's places (every card of it) | city:1159151593 | capital | dot | rm-103 |
| Tristia | other | a card's places (every card of it) | city:1159149397 | town | dot | rm-955 |
| Trojan_Horse | other | a card's places (every card of it) | pl:q22647 | site | dot | gr-952 |
| TSMC | other | a card's places (every card of it) | city:1159146175 | town | dot | gga-204 |
| Tuntian | other | a card's places (every card of it) | pl:q404529 | city | dot | cnh-287 |
| Twelve_Tables | other | a card's locator coordinate — rm-110 | 12.4852,41.8922 | coordinate | dot | wh-342 rm-110 |
| Typhon | other | a card's places (every card of it) | pl:q16990 | mountain | dot | gr-914 |
| United_States_Declaration_of_Independence | other | a card's places (every card of it) | city:1159151243 | city | dot | wh-754 |
| Veche | other | a card's places (every card of it) | city:1159146503 | town | dot | ru-077 |
| Venus_of_Willendorf | other | a card's locator coordinate — wh-072 | 15.4047,48.3225 | coordinate | dot | wh-072 art-011 |
| Vestal_Virgin | other | a card's locator coordinate — rm-901 | 12.4867,41.8914 | coordinate | dot | rm-901 |
| Vindolanda_tablets | other | a card's locator coordinate — rm-689 | -2.3608,54.9911 | coordinate | dot | rm-689 |
| Votive_dedication | other | a card's locator coordinate — gr-976 | 22.5013,38.4823 | coordinate | dot | gr-167 gr-976 |
| Vulgate | other | a card's places (every card of it) | pl:q5776 | city | dot | rm-614 |
| Wen_Xuan | other | a card's places (every card of it) | city:1159151385 | city | dot | cnh-342 |
| Woodblock_printing | other | a card's places (every card of it) | pl:q319114 | town | dot | wh-526 |
| Workers'_Party_of_Korea | other | a card's places (every card of it) | city:1159151303 | capital | dot | pea-114 |
| World_Trade_Organization | other | a card's places (every card of it) | city:1159151505 | city | dot | gga-093 |
| Xi'an_Stele | other | a card's places (every card of it) | city:1159151363 | city | dot | cnh-899 |
| Xiling_Seal_Society | other | a card's locator coordinate — cnh-952 | 120.1442,30.2469 | coordinate | dot | cnh-952 |
| Xiping_Stone_Classics | other | a card's places (every card of it) | city:1159147063 | city | dot | cnh-852 |
| Yellow_Registers | other | a card's places (every card of it) | pl:q7361660 | lake | dot | cnh-715 |
| Yue_ware | other | a card's places (every card of it) | pl:q42666 | city | dot | cnh-408 |
| Yunnan_copper | other | a card's locator coordinate — cnh-823 | 103.1878,26.0829 | coordinate | dot | cnh-823 |
| Zen | other | a card's places (every card of it) | city:1159149967 | city | dot | wh-539 |
| Zhenguan | other | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-359 |
| Abraham_Lincoln | person | a card's places (every card of it) | city:1159146271 | town | dot | wh-813 |
| Adolf_Hitler | person | a card's locator coordinate — wh-912 | 13.0353,48.2583 | coordinate | dot | ww2-044 wh-912 |
| Aeneas | person | a card's locator coordinate — the cards disagree — rm-055 gr-965 | 12.4784,41.6616 | coordinate | dot | rm-055 gr-965 |
| Agrippa_Postumus | person | a card's locator coordinate — rm-412 | 10.0783,42.5822 | coordinate | dot | rm-412 |
| Agrippina_the_Younger | person | a card's places (every card of it) | city:1159148451 | city | dot | rm-438 |
| Aius_Locutius | person | a card's places (every card of it) | pl:q180212 | site | dot | rm-127 |
| Akbar | person | a card's places (every card of it) | pl:q179046 | city | dot | wh-701 |
| Ambrose | person | a card's places (every card of it) | pl:q1071570 | site | dot | rm-608 |
| Amenemhat_II | person | a card's places (every card of it) | pl:q685414 | site | dot | eg-183 |
| Amenemhat_III | person | a card's places (every card of it) | pl:q26237 | site | dot | eg-196 |
| Amphiaraus | person | a card's places (every card of it) | pl:q663353 | town | dot | gr-940 |
| An_Shigao | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-883 |
| Ancus_Marcius | person | a card's places (every card of it) | pl:q1012797 | site | dot | rm-065 |
| Andrey_Bogolyubsky | person | a card's places (every card of it) | pl:q762099 | town | dot | ru-080 |
| Anicetus_(freedman) | person | a card's places (every card of it) | pl:q811456 | site | dot | rm-441 |
| Anna_Porphyrogenita | person | a card's places (every card of it) | pl:q638445 | site | dot | ru-054 |
| Antigonus_I_Monophthalmus | person | a card's places (every card of it) | pl:q1163924 | city | dot | gr-761 |
| Antinous | person | a card's places (every card of it) | pl:q124281 | site | dot | rm-510 |
| Antiochus_III_the_Great | person | a card's locator coordinate — gr-792 | 27.4333,38.6167 | coordinate | dot | rm-244 gr-792 |
| Antipater | person | a card's places (every card of it) | pl:q213679 | site | dot | gr-754 |
| Antoninus_Pius | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-513 |
| Aphrodite | person | a card's locator coordinate — gr-900 | 32.5734,34.7074 | coordinate | dot | gr-900 |
| Apollo | person | a card's places (every card of it) | pl:q75459 | site | dot | gr-897 |
| Apollonius_of_Perga | person | a card's places (every card of it) | pl:q719815 | site | dot | gr-822 |
| Apollonius_of_Rhodes | person | a card's places (every card of it) | reg:1159102803 | island | dot | gr-809 |
| Appius_Claudius_Caecus | person | a card's places (every card of it) | pl:q180212 | site | dot | rm-137 |
| Appius_Claudius_Crassus_Inregillensis_Sabinus | person | a card's places (every card of it) | pl:q180212 | site | dot | rm-112 |
| Aratus_of_Sicyon | person | a card's places (every card of it) | pl:q368628 | site | dot | gr-797 |
| Archimedes | person | a card's places (every card of it) | pl:q13670 | city | dot | gr-819 |
| Ariadne | person | a card's places (every card of it) | pl:q188527 | island | dot | gr-930 |
| Aristarchus_of_Samos | person | a card's places (every card of it) | pl:q156882 | island | dot | gr-826 |
| Aristarchus_of_Samothrace | person | a card's places (every card of it) | pl:q203175 | island | dot | gr-815 |
| Arsinoe_II | person | a card's places (every card of it) | city:1159151349 | city | dot | gr-776 |
| Artemis | person | a card's places (every card of it) | pl:q475497 | site | dot | gr-898 |
| Asclepius | person | a card's places (every card of it) | pl:q233576 | site | dot | gr-995 |
| Athena | person | a card's places (every card of it) | city:1159151545 | capital | dot | gr-896 |
| Attalus_III | person | a card's places (every card of it) | pl:q18986 | site | dot | gr-868 |
| Augustine_of_Hippo | person | a card's places (every card of it) | pl:q858024 | site | dot | rm-615 |
| Bai_Juyi | person | a card's places (every card of it) | pl:q502371 | lake | dot | cnh-393 |
| Ban_Gu | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-259 |
| Ban_Zhao | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-261 |
| Bellerophon | person | a card's places (every card of it) | pl:q464936 | site | dot | gr-936 |
| Benito_Mussolini | person | a card's locator coordinate — wh-911 | 11.9833,44.1 | coordinate | dot | ww2-037 wh-911 |
| Berenice_II | person | a card's places (every card of it) | pl:q44112 | site | dot | gr-777 |
| Britannicus | person | a card's places (every card of it) | pl:q242839 | region | dot | rm-439 |
| Caesarion | person | a card's places (every card of it) | city:1159151349 | city | dot | gr-875 |
| Cai_Lun | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-262 |
| Caligula | person | a card's places (every card of it) | pl:q16010710 | site | dot | rm-427 |
| Callimachus_(poet) | person | a card's places (every card of it) | pl:q44112 | site | dot | gr-807 |
| Cao_Pi | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-278 |
| Carneades | person | a card's places (every card of it) | city:1159151545 | capital | dot | gr-878 |
| Cassander | person | a card's places (every card of it) | pl:q81248 | site | dot | gr-760 |
| Catiline | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-339 |
| Cato_the_Younger | person | a card's places (every card of it) | pl:q27102003 | site | dot | rm-342 |
| Cecil_Rhodes | person | a card's places (every card of it) | city:1159148011 | town | dot | wh-830 |
| Chai_Rong | person | a card's places (every card of it) | pl:q1363661 | town | dot | cnh-403 |
| Charles_Darwin | person | a card's locator coordinate — wh-822 | 0.0533,51.3314 | coordinate | dot | ps-038 wh-822 |
| Chongzhen_Emperor | person | a card's places (every card of it) | pl:q734499 | site | dot | cnh-534 |
| Christopher_Columbus | person | a card's places (every card of it) | pl:q622030 | town | dot | wh-661 |
| Chrysippus | person | a card's places (every card of it) | city:1159151545 | capital | dot | gr-840 |
| Chulalongkorn | person | a card's places (every card of it) | city:1159151509 | capital | dot | wh-864 |
| Cicero | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-336 |
| Claudius | person | a card's places (every card of it) | pl:q665 | site | dot | rm-430 |
| Cleomenes_III | person | a card's places (every card of it) | pl:q15709786 | town | dot | gr-798 |
| Cleopatra_VII | person | a card's locator coordinate — the cards disagree — rm-384 gr-876 | 34.8951,36.9165 | coordinate | dot | rm-384 gr-876 |
| Clytemnestra | person | a card's places (every card of it) | pl:q132564 | site | dot | gr-955 |
| Constantine_the_Great | person | a card's locator coordinate — rm-577 | -1.0806,53.9617 | coordinate | dot | wh-372 rm-577 |
| Constantius_II | person | a card's places (every card of it) | city:1159113499 | town | dot | rm-596 |
| Ctesibius | person | a card's places (every card of it) | city:1159151349 | city | dot | gr-830 |
| Daedalus | person | a card's places (every card of it) | pl:q173527 | site | dot | gr-931 |
| Dazhbog | person | a card's places (every card of it) | city:1159151495 | capital | dot | ru-052 |
| Demeter | person | a card's places (every card of it) | pl:q11918833 | site | dot | gr-893 |
| Demetrius_of_Phalerum | person | a card's places (every card of it) | city:1159151545 | capital | dot | gr-805 |
| Den_(pharaoh) | person | a card's places (every card of it) | pl:q853955 | site | dot | eg-060 |
| Deucalion | person | a card's places (every card of it) | pl:q105261 | mountain | dot | gr-912 |
| Dharmarakṣa | person | a card's places (every card of it) | pl:q319114 | town | dot | cnh-884 |
| Diaeus | person | a card's places (every card of it) | pl:q36024972 | site | dot | gr-863 |
| Dio_Chrysostom | person | a card's places (every card of it) | city:1159149373 | city | dot | rm-533 |
| Dionysus | person | a card's places (every card of it) | pl:q11225429 | site | dot | gr-903 |
| Djedefre | person | a card's places (every card of it) | pl:q335278 | site | dot | eg-107 |
| Djehutihotep | person | a card's places (every card of it) | pl:q1157646 | site | dot | eg-190 |
| Djer | person | a card's places (every card of it) | pl:q853955 | site | dot | eg-059 |
| Djoser | person | a card's places (every card of it) | pl:q192418 | site | dot | eg-093 |
| Domitian | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-481 |
| Dong_Zhongshu | person | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-237 |
| Dongyue_Dadi | person | a card's locator coordinate — cnh-870 | 117.1075,36.2558 | coordinate | dot | cnh-870 |
| Dorgon | person | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-540 |
| Du_Fu | person | a card's places (every card of it) | pl:q4390891 | site | dot | cnh-392 |
| Du_Shi | person | a card's places (every card of it) | city:1159149135 | city | dot | cnh-993 |
| Emperor_Gaozong_of_Song | person | a card's places (every card of it) | city:1159151387 | city | dot | cnh-448 |
| Emperor_Gaozu_of_Han | person | a card's locator coordinate — cnh-216 | 116.919,34.716 | coordinate | dot | cnh-216 |
| Emperor_Gaozu_of_Tang | person | a card's places (every card of it) | city:1159151365 | city | dot | cnh-356 |
| Emperor_Guangwu_of_Han | person | a card's places (every card of it) | city:1159149135 | city | dot | cnh-254 |
| Emperor_Huizong_of_Song | person | a card's places (every card of it) | pl:q208471 | city | dot | cnh-445 |
| Emperor_Min_of_Jin | person | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-302 |
| Emperor_Shizong_of_Jin | person | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-480 |
| Emperor_Taiwu_of_Northern_Wei | person | a card's locator coordinate — cnh-895 | 113.367,40.097 | coordinate | dot | cnh-895 |
| Emperor_Taizu_of_Song | person | a card's places (every card of it) | pl:q208471 | city | dot | cnh-422 |
| Emperor_Wen_of_Sui | person | a card's places (every card of it) | city:1159151363 | city | dot | cnh-344 |
| Emperor_Wu_of_Jin | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-294 |
| Emperor_Wu_of_Liang | person | a card's places (every card of it) | pl:q2624443 | site | dot | cnh-327 |
| Emperor_Xian_of_Han | person | a card's places (every card of it) | pl:q404529 | city | dot | cnh-272 |
| Emperor_Xiaowen_of_Northern_Wei | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-333 |
| Emperor_Xuanzong_of_Tang | person | a card's places (every card of it) | pl:q1158530 | site | dot | cnh-373 |
| Emperor_Yang_of_Sui | person | a card's places (every card of it) | pl:q57906 | city | dot | cnh-349 |
| Empress_Dowager_Feng | person | a card's places (every card of it) | city:1159146991 | city | dot | cnh-733 |
| Empress_Lü | person | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-220 |
| Ennius | person | a card's places (every card of it) | pl:q1540716 | site | dot | rm-934 |
| Epicurus | person | a card's places (every card of it) | city:1159151545 | capital | dot | gr-842 |
| Erasistratus | person | a card's places (every card of it) | city:1159151349 | city | dot | gr-833 |
| Erasmus | person | a card's places (every card of it) | city:1159135709 | town | dot | wh-633 |
| Euclid | person | a card's places (every card of it) | city:1159151349 | city | dot | gr-817 |
| Eumenes_II | person | a card's places (every card of it) | pl:q18986 | site | dot | gr-857 |
| Eumenes_of_Cardia | person | a card's places (every card of it) | pl:q965581 | site | dot | gr-758 |
| Fazang | person | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-888 |
| Fotudeng | person | a card's places (every card of it) | pl:q1274372 | site | dot | cnh-312 |
| François_Xavier_d'Entrecolles | person | a card's places (every card of it) | pl:q34405 | city | dot | cnh-958 |
| Fu_Jian_(337–385) | person | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-309 |
| Gaia | person | a card's places (every card of it) | pl:q75459 | site | dot | gr-884 |
| Gaius_Lucilius | person | a card's places (every card of it) | pl:q119240047 | site | dot | rm-939 |
| Galba | person | a card's places (every card of it) | pl:q2727884 | site | dot | rm-457 |
| Galen | person | a card's places (every card of it) | pl:q18986 | site | dot | rm-822 |
| Galerius | person | a card's places (every card of it) | city:1159135147 | town | dot | rm-574 |
| Galileo_Galilei | person | a card's places (every card of it) | pl:q617 | city | dot | wh-651 |
| Gnaeus_Calpurnius_Piso_(consul_7_BC) | person | a card's places (every card of it) | pl:q1738167 | site | dot | rm-422 |
| Gu_Kaizhi | person | a card's places (every card of it) | city:1159149149 | city | dot | cnh-321 |
| Guo_Shoujing | person | a card's places (every card of it) | pl:q58576 | city | dot | cnh-493 |
| Han_Yu | person | a card's places (every card of it) | pl:q59227 | city | dot | cnh-394 |
| Harsha | person | a card's places (every card of it) | pl:q614890 | town | dot | wh-546 |
| Helen_of_Troy | person | a card's places (every card of it) | pl:q15940498 | site | dot | gr-943 |
| Hemiunu | person | a card's places (every card of it) | city:1159146947 | city | dot | eg-104 |
| Henry_the_Navigator | person | a card's places (every card of it) | pl:q49364942 | town | dot | wh-657 |
| Henry_VIII | person | a card's places (every card of it) | pl:q205666 | site | dot | wh-641 |
| Hephaestion | person | a card's places (every card of it) | city:1159150133 | town | dot | gr-746 |
| Hephaestus | person | a card's places (every card of it) | pl:q192483 | island | dot | gr-901 |
| Hera | person | a card's places (every card of it) | pl:q1607754 | site | dot | gr-891 |
| Hermes | person | a card's locator coordinate — gr-902 | 22.3969,37.9397 | coordinate | dot | gr-902 |
| Herod_the_Great | person | a card's places (every card of it) | pl:q319242 | site | dot | rm-771 |
| Herodes_Atticus | person | a card's places (every card of it) | city:1159151545 | capital | dot | rm-526 |
| Herophilus | person | a card's places (every card of it) | city:1159151349 | city | dot | gr-832 |
| Hetepheres_I | person | a card's places (every card of it) | city:1159146947 | city | dot | eg-116 |
| Hipparchus_of_Nicaea | person | a card's places (every card of it) | pl:q739037 | site | dot | gr-828 |
| Hong_Xiuquan | person | a card's locator coordinate — cnh-565 | 113.21,23.39 | coordinate | dot | cnh-565 |
| Hongwu_Emperor | person | a card's places (every card of it) | city:1159151385 | city | dot | cnh-504 |
| Hor-Aha | person | a card's places (every card of it) | pl:q853955 | site | dot | eg-058 |
| Horace | person | a card's places (every card of it) | pl:q2513101 | site | dot | rm-952 |
| Hua_Sui | person | a card's places (every card of it) | city:1159149149 | city | dot | cnh-977 |
| Huang_Daopo | person | a card's locator coordinate — cnh-824 | 121.2333,31.0058 | coordinate | dot | cnh-824 |
| Huang_Quan | person | a card's places (every card of it) | city:1159151533 | city | dot | cnh-948 |
| Huang_Zongxi | person | a card's locator coordinate — cnh-865 | 121.15,30.05 | coordinate | dot | cnh-865 |
| Igor_of_Kiev | person | a card's places (every card of it) | pl:q158904 | city | dot | ru-045 |
| Isaac_Newton | person | a card's places (every card of it) | pl:q3316008 | site | dot | wh-653 |
| James_Watt | person | a card's places (every card of it) | pl:q2297905 | town | dot | wh-780 |
| Jason_(mythology) | person | a card's places (every card of it) | city:1159130689 | town | dot | gr-932 |
| Jean-Jacques_Rousseau | person | a card's places (every card of it) | city:1159151505 | city | dot | wh-750 |
| Johannes_Gutenberg | person | a card's places — several candidates — city:1159122449 Mainz; city:1159147229 Strasbourg | city:1159122449, city:1159147229 |  |  | wh-631 |
| Johannes_Kepler | person | a card's places (every card of it) | city:1159145093 | town | dot | wh-652 |
| John_Calvin | person | a card's places (every card of it) | city:1159151505 | city | dot | wh-639 |
| John_Locke | person | a card's places (every card of it) | pl:q34217 | city | dot | wh-747 |
| John_of_Montecorvino | person | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-496 |
| Julia_Domna | person | a card's places (every card of it) | pl:q2548027 | site | dot | rm-542 |
| Julia_the_Elder | person | a card's locator coordinate — rm-408 | 13.43,40.7975 | coordinate | dot | rm-408 |
| Julian_(emperor) | person | a card's places (every card of it) | pl:q270273 | site | dot | rm-597 |
| Kangxi_Emperor | person | a card's locator coordinate — wh-717 | 116.3972,39.9163 | coordinate | dot | wh-717 cnh-545 |
| Karl_Marx | person | a card's places (every card of it) | pl:q3138 | city | dot | wh-793 |
| Kawit | person | a card's places (every card of it) | pl:q373909 | site | dot | eg-173 |
| Khafre | person | a card's places (every card of it) | city:1159146947 | city | dot | eg-108 |
| Khentkaus_I | person | a card's places (every card of it) | city:1159146947 | city | dot | eg-117 |
| Khety_I_(nomarch) | person | a card's places (every card of it) | city:1159149863 | town | dot | eg-151 |
| Khnumhotep_III | person | a card's places (every card of it) | pl:q685414 | site | dot | eg-189 |
| Khufu | person | a card's places (every card of it) | city:1159146947 | city | dot | eg-103 |
| Kublai_Khan | person | a card's places (every card of it) | pl:q471765 | site | dot | cnh-485 |
| Kumārajīva | person | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-885 |
| Leonardo_da_Vinci | person | a card's places (every card of it) | pl:q30031896 | town | dot | wh-627 |
| Li_Bai | person | a card's places (every card of it) | pl:q1159662 | region | dot | cnh-391 |
| Li_Qingzhao | person | a card's places (every card of it) | city:1159151379 | city | dot | cnh-442 |
| Li_Yu_(Southern_Tang) | person | a card's places (every card of it) | city:1159151385 | city | dot | cnh-407 |
| Liang_Ji | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-265 |
| Lin_Zexu | person | a card's places (every card of it) | pl:q477137 | strait | dot | cnh-560 |
| Liu_Ying_(prince) | person | a card's places (every card of it) | city:1159149147 | city | dot | cnh-882 |
| Livia | person | a card's locator coordinate — rm-411 | 12.4965,41.8934 | coordinate | dot | rm-411 |
| Livius_Andronicus | person | a card's places (every card of it) | pl:q13498 | city | dot | rm-933 |
| Livy | person | a card's locator coordinate — rm-956 | 11.8733,45.4078 | coordinate | dot | rm-956 |
| Lu_Jiuyuan | person | a card's locator coordinate — cnh-862 | 116.358,27.949 | coordinate | dot | cnh-862 |
| Lucius_Junius_Brutus | person | a card's places (every card of it) | pl:q180212 | site | dot | rm-079 |
| Lushan_Huiyuan | person | a card's places (every card of it) | pl:q622616 | mountain | dot | cnh-889 |
| Mansa_Musa | person | a card's places (every card of it) | city:1159151603 | capital | dot | wh-570 |
| Manuel_Chrysoloras | person | a card's places (every card of it) | city:1159149751 | city | dot | gr-880 |
| Mao_Zedong | person | a card's locator coordinate — wh-954 | 112.5267,27.915 | coordinate | dot | wh-954 cnh-608 |
| Marco_Polo | person | a card's places (every card of it) | city:1159150277 | town | dot | wh-536 |
| Martin_Luther | person | a card's places (every card of it) | pl:q151545 | site | dot | wh-636 |
| Mary_Wollstonecraft | person | a card's places (every card of it) | pl:q123219 | town | dot | wh-819 |
| Maxim_Litvinov | person | a card's places (every card of it) | city:1159151585 | capital | dot | ww2-129 |
| Maximilien_Robespierre | person | a card's places (every card of it) | city:1159151613 | capital | dot | wh-761 |
| Medea_(mythology) | person | a card's locator coordinate — gr-935 | 22.8802,37.9053 | coordinate | dot | gr-601 gr-935 |
| Meketre | person | a card's places (every card of it) | pl:q373909 | site | dot | eg-172 |
| Menander_I | person | a card's places (every card of it) | pl:q1069204 | site | dot | gr-785 |
| Menkaure | person | a card's places (every card of it) | city:1159146947 | city | dot | eg-111 |
| Mentuhotep_II | person | a card's places (every card of it) | pl:q373909 | site | dot | eg-168 |
| Mentuhotep_IV | person | a card's places (every card of it) | pl:q1479250 | site | dot | eg-174 |
| Messalina | person | a card's places (every card of it) | pl:q550215 | hill | dot | rm-437 |
| Michelangelo | person | a card's places (every card of it) | pl:q2943 | site | dot | wh-628 |
| Montesquieu | person | a card's places (every card of it) | pl:q244712 | town | dot | wh-748 |
| Mstislav_I_of_Kiev | person | a card's places (every card of it) | city:1159151495 | capital | dot | ru-075 |
| Muses | person | a card's places (every card of it) | pl:q215516 | mountain | dot | gr-915 |
| Nabis | person | a card's places (every card of it) | pl:q5690 | site | dot | gr-854 |
| Napoleon | person | a card's places (every card of it) | pl:q189153 | town | dot | wh-762 |
| Nearchus | person | a card's locator coordinate — gr-743 | 57.08,27.15 | coordinate | dot | gr-743 |
| Nerva | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-492 |
| Neville_Chamberlain | person | a card's places (every card of it) | city:1159151577 | capital | dot | ww2-121 |
| Niccolò_Machiavelli | person | a card's places (every card of it) | pl:q271928 | site | dot | wh-634 |
| Nicolaus_Copernicus | person | a card's places (every card of it) | pl:q497115 | city | dot | wh-650 |
| Numa_Pompilius | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-061 |
| Nymphidius_Sabinus | person | a card's places (every card of it) | pl:q1049836 | site | dot | rm-453 |
| Nyuserre_Ini | person | a card's places (every card of it) | pl:q1751693 | site | dot | eg-125 |
| Oedipus | person | a card's places (every card of it) | pl:q11225429 | site | dot | gr-938 |
| Olaudah_Equiano | person | a card's places (every card of it) | city:1159151577 | capital | dot | wh-742 |
| Oleg_the_Wise | person | a card's places (every card of it) | city:1159151495 | capital | dot | ru-041 |
| Olga_of_Kiev | person | a card's places (every card of it) | pl:q1004257 | city | dot | ru-046 |
| Orestes | person | a card's places (every card of it) | pl:q645234 | site | dot | gr-956 |
| Otho | person | a card's places (every card of it) | pl:q3645134 | site | dot | rm-458 |
| Otto_von_Bismarck | person | a card's places (every card of it) | city:1159151529 | capital | dot | wh-805 |
| Ötzi | person | a card's places (every card of it) | pl:q697937 | mountain | dot | wh-140 |
| Ouyang_Xiu | person | a card's places (every card of it) | pl:q114045 | city | dot | cnh-428 |
| Ovid | person | a card's places (every card of it) | pl:q20108952 | site | dot | rm-953 |
| Pan_Jixun | person | a card's places (every card of it) | city:1159147109 | city | dot | cnh-805 |
| Penelope | person | a card's places (every card of it) | pl:q187471 | island | dot | gr-963 |
| Pepi_I_Meryre | person | a card's places (every card of it) | pl:q1536118 | site | dot | eg-130 |
| Perdiccas_(regent) | person | a card's places (every card of it) | pl:q5715 | site | dot | gr-753 |
| Perseus_(mythology) | person | a card's locator coordinate — the cards disagree — gr-860 gr-926 | 25.5875,40.45 | coordinate | dot | rm-250 gr-860 gr-926 |
| Perun | person | a card's places (every card of it) | pl:q4359567 | site | dot | ru-026 |
| Petrarch | person | a card's places (every card of it) | pl:q34638 | town | dot | wh-626 |
| Philip_the_Arab | person | a card's locator coordinate — rm-552 | 36.6292,32.8542 | coordinate | dot | rm-552 |
| Philip_V_of_Macedon | person | a card's locator coordinate — rm-239 gr-851 | 22.5211,40.7547 | coordinate | dot | rm-239 gr-851 |
| Philo_of_Byzantium | person | a card's places (every card of it) | pl:q188731 | town | dot | gr-831 |
| Plautus | person | a card's places (every card of it) | pl:q99956 | town | dot | rm-936 |
| Pliny_the_Elder | person | a card's places (every card of it) | pl:q19900818 | site | dot | rm-480 |
| Polybius | person | a card's places (every card of it) | pl:q36024972 | site | dot | gr-865 |
| Pompeia_Plotina | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-493 |
| Poseidon | person | a card's places (every card of it) | pl:q1136637 | cape | dot | gr-892 |
| Postumus | person | a card's places (every card of it) | city:1159148451 | city | dot | rm-560 |
| Prometheus | person | a card's places (every card of it) | pl:q19283711 | town | dot | gr-908 |
| Ptolemy_I_Soter | person | a card's places (every card of it) | city:1159151349 | city | dot | gr-766 |
| Publius_Clodius_Pulcher | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-346 |
| Puyi | person | a card's places (every card of it) | pl:q80290 | site | dot | cnh-576 |
| Qianlong_Emperor | person | a card's locator coordinate — wh-718 cnh-551 | 116.3972,39.9163 | coordinate | dot | wh-718 cnh-551 |
| Quintus_Fabius_Pictor | person | a card's places (every card of it) | pl:q75459 | site | dot | rm-940 |
| Rhea_(mythology) | person | a card's places (every card of it) | pl:q1001533 | site | dot | gr-889 |
| Romulus | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-060 |
| Romulus_and_Remus | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-053 |
| Sahure | person | a card's places (every card of it) | pl:q131820 | site | dot | eg-122 |
| Sekhemkhet | person | a card's places (every card of it) | pl:q135318 | site | dot | eg-097 |
| Seleucus_I_Nicator | person | a card's locator coordinate — gr-768 | 44.5222,33.0944 | coordinate | dot | gr-768 |
| Senusret_I | person | a card's places (every card of it) | pl:q287779 | site | dot | eg-180 |
| Senusret_II | person | a card's places (every card of it) | pl:q56924 | site | dot | eg-184 |
| Senusret_III | person | a card's places (every card of it) | pl:q685414 | site | dot | eg-188 |
| Septimius_Severus | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-539 |
| Servius_Tullius | person | a card's places (every card of it) | city:1159151593 | capital | dot | rm-069 |
| Sextus_Afranius_Burrus | person | a card's locator coordinate — rm-440 | 5.0724,44.2422 | coordinate | dot | rm-440 |
| Shah_Jahan | person | a card's places (every card of it) | pl:q3242297 | town | dot | wh-702 |
| Shen_Yue | person | a card's places (every card of it) | city:1159151385 | city | dot | cnh-341 |
| Shi_Jingtang | person | a card's places (every card of it) | city:1159151365 | city | dot | cnh-401 |
| Sima_Guang | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-432 |
| Sima_Xiangru | person | a card's places (every card of it) | city:1159151533 | city | dot | cnh-921 |
| Sneferu | person | a card's places (every card of it) | pl:q685414 | site | dot | eg-099 |
| Su_Shi | person | a card's places (every card of it) | pl:q427097 | city | dot | cnh-441 |
| Sun_Hao | person | a card's places (every card of it) | city:1159151385 | city | dot | cnh-292 |
| Tang_of_Shang | person | a card's places (every card of it) | pol:shang | polity | face | cnh-068 |
| Tao_Yuanming | person | a card's places (every card of it) | pl:q216077 | city | dot | cnh-320 |
| Tarquinius_Priscus | person | a card's places (every card of it) | pl:q179999 | town | dot | rm-066 |
| Tefibi | person | a card's places (every card of it) | city:1159149863 | town | dot | eg-149 |
| Telemachus | person | a card's places (every card of it) | pl:q7263152 | city | dot | gr-964 |
| Teti | person | a card's places (every card of it) | pl:q1278166 | site | dot | eg-129 |
| Teuta | person | a card's places (every card of it) | pl:q7320766 | town | dot | gr-849 |
| Theocritus | person | a card's places (every card of it) | pl:q13670 | city | dot | gr-811 |
| Theodosius_I | person | a card's places (every card of it) | pl:q833060 | site | dot | rm-603 |
| Theseus | person | a card's places (every card of it) | pl:q581494 | town | dot | gr-928 |
| Thomas_Aquinas | person | a card's places (every card of it) | pl:q117211 | town | dot | wh-512 |
| Tiberius | person | a card's places (every card of it) | pl:q19900818 | site | dot | rm-417 |
| Titus_Tatius | person | a card's places (every card of it) | pl:q2246183 | site | dot | rm-059 |
| Toussaint_Louverture | person | a card's places (every card of it) | city:1159146363 | town | dot | wh-768 |
| Ulpian | person | a card's places (every card of it) | pl:q3991738 | site | dot | rm-727 |
| Unas | person | a card's places (every card of it) | pl:q1478801 | site | dot | eg-126 |
| Userkaf | person | a card's places (every card of it) | pl:q192134 | site | dot | eg-119 |
| Valentinian_I | person | a card's places (every card of it) | pl:q3869982 | city | dot | rm-600 |
| Vasco_da_Gama | person | a card's places (every card of it) | pl:q28729 | city | dot | wh-660 |
| Verginia | person | a card's places (every card of it) | pl:q180212 | site | dot | rm-113 |
| Vespasian | person | a card's places (every card of it) | pl:q13396 | town | dot | rm-465 |
| Vesta_(mythology) | person | a card's locator coordinate — rm-910 | 12.4861,41.8917 | coordinate | dot | rm-910 |
| Vitellius | person | a card's locator coordinate — rm-460 | 6.9528,50.9364 | coordinate | dot | rm-460 |
| Vitruvius | person | a card's places (every card of it) | pl:q13142 | town | dot | rm-996 |
| Vladimir_II_Monomakh | person | a card's places (every card of it) | city:1159151495 | capital | dot | ru-072 |
| Vladimir_Lenin | person | a card's places (every card of it) | city:1159149577 | town | dot | wh-897 |
| Vladimir_the_Great | person | a card's places (every card of it) | city:1159151495 | capital | dot | ru-051 |
| Voltaire | person | a card's places (every card of it) | pl:q233733 | city | dot | wh-749 |
| Vsevolod_the_Big_Nest | person | a card's places (every card of it) | city:1159148121 | town | dot | ru-082 |
| Wang_Anshi | person | a card's locator coordinate — cnh-430 | 118.7789,32.0608 | coordinate | dot | cnh-430 |
| Wang_Dao | person | a card's places (every card of it) | city:1159151385 | city | dot | cnh-316 |
| Wang_Fuzhi | person | a card's places (every card of it) | city:1159149895 | city | dot | cnh-861 |
| Wang_Xizhi | person | a card's places (every card of it) | pl:q42666 | city | dot | cnh-319 |
| Wang_Yuanlu | person | a card's locator coordinate — cnh-937 | 94.8042,40.0372 | coordinate | dot | cnh-937 |
| Wang_Zhe | person | a card's places (every card of it) | city:1159148455 | city | dot | cnh-881 |
| Wenchang_Wang | person | a card's locator coordinate — cnh-868 | 105.171,31.643 | coordinate | dot | cnh-868 |
| Wepwawet | person | a card's places (every card of it) | city:1159149863 | town | dot | eg-164 |
| Wu_Zetian | person | a card's places (every card of it) | pl:q950653 | site | dot | cnh-371 |
| Xuanzang | person | a card's places (every card of it) | pl:q1047061 | site | dot | cnh-388 |
| Yan_Ruoju | person | a card's places (every card of it) | city:1159149921 | city | dot | cnh-864 |
| Yang_Guifei | person | a card's places (every card of it) | pl:q1201091 | town | dot | cnh-375 |
| Yaroslav_the_Wise | person | a card's places (every card of it) | pl:q76561 | town | dot | ru-057 |
| Yelü_Chucai | person | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-484 |
| Yongle_Emperor | person | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-510 |
| Yongzheng_Emperor | person | a card's places (every card of it) | pl:q907894 | site | dot | cnh-549 |
| Zeno_of_Citium | person | a card's places (every card of it) | city:1159151545 | capital | dot | gr-839 |
| Zenobia | person | a card's places (every card of it) | pl:q5747 | site | dot | rm-562 |
| Zenodotus | person | a card's places (every card of it) | city:1159151349 | city | dot | gr-806 |
| Zeus | person | a card's places (every card of it) | pl:q38888 | site | dot | gr-890 |
| Zhang_Daoling | person | a card's places (every card of it) | pl:q515573 | city | dot | cnh-877 |
| Zhang_Heng | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-263 |
| Zhang_Jue | person | a card's locator coordinate — cnh-269 | 115.037,37.221 | coordinate | dot | cnh-269 |
| Zheng_He | person | a card's locator coordinate — wh-712 | 118.7969,32.0603 | coordinate | dot | wh-712 cnh-514 |
| Zhiyi | person | a card's locator coordinate — cnh-887 | 121.0426,29.1731 | coordinate | dot | cnh-887 |
| Zhu_Wen | person | a card's places (every card of it) | city:1159147063 | city | dot | cnh-396 |

### Tier 5.5 — Name clashes to reject (9)

the same, but the term is not a place (a lake named Cedar, a river named Copper): do not take these.

| term | class | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|---|
| Peloponnesian_League | event | Wikipedia title = registry row — tagged institution/history/greece/warfare/classical/archaic — a name clash to check | pol:peloponnesian_league | polity | face | gr-265 |
| Peloponnesian_War | event | Wikipedia title = registry row — tagged event/warfare/history/politics/greece/classical — a name clash to check | pol:athenian_coalition | polity | face | wh-330 gr-521 pea-212 |
| Second_Athenian_League | event | Wikipedia title = registry row — tagged institution/event/history/politics/greece — a name clash to check | pol:athenian_league | polity | face | gr-667 |
| Cedar | other | name = one registry row — tagged plant/nature/biology/technology — a name clash to check | lake:51 | lake | dot |  |
| Chinese_Communist_Party | other | Wikipedia title = registry row — tagged politics/institution/china/communism/history — a name clash to check | pol:ccp | polity | face |  |
| Copper | other | name = one registry row — tagged object/technology/archaeology/history/science — a name clash to check | river:1159114561 | river | dot |  |
| Varna_(Hinduism) | other | name = one registry row — tagged concept/practice/history/religion/india — a name clash to check | city:1159145075 | town | dot | wh-379 |
| Arthur_Evans | person | name = one registry row — tagged person/archaeology/history/greece — a name clash to check | lake:649 | lake | dot | gr-007 |
| Franklin_D._Roosevelt | person | name = one registry row — tagged person/ruler/history/politics/united states — a name clash to check | lake:724 | lake | dot |  |
