# Glossary Atlas windows — the analysis, and what was built (2026-10-23)

**What this is.** An owner's request, examined and costed in §1–§3 and then BUILT the same day (§0): *"adding Atlas windows for
glossary pop-ups … no buttons in them, but allowed to move and zoom within the window; the glossary topic the only location on
the map."* **The rule (the owner): a window only for a term that is specifically about that location** — the town of Versailles,
never the Treaty of Versailles; a battle, a treaty, a person, a fossil or an institution gets none, however well its card is placed.
**States, empires and peoples are shaded at the year of their greatest extent. Opening a popup never adds to the Personal Atlas.**

## 0. As built (2026-10-23) — tiers 1, 2 and 4, and the states and peoples

**What a reader sees.** A glossary popup whose term is a location carries a small map — **below the description (and the Library
banner), above the Sources fold** — on the card windows' engine: **since 2026-10-24 the card windows' own buttons** (zoom in, zoom out, recentre, and relief where relief can draw — the owner asked for them; still no globe button, the bar's pin is that; `GLOSS_ZOOM_HTML` in `app.js`), a drag and a pinch or the wheel move and zoom
it (the arrow keys and `+` / `−` when it has focus). The term's place is the only thing marked: a gold square and the name for a
point (a site, a city, a cave, a mountain), the name alone for a region, a sea or a range, the Atlas's selection gold over the face
of a present-day country or province, and a **state, an empire, a people or a culture at the year of its greatest extent** —
Rome at 117, the Byzantine Empire at 561, the Achaemenids at 480 BCE — with every other state of that year plain. A people is its
presence stipple alone (no other people's). The bar's Atlas pin stays. No window on the Atlas page itself, none for a community
deck's term, and when the engine cannot draw (the bundle refused; no WebGL2 for a state of the past) the block simply goes.

**The pieces.**

* `atlas/data/glossary-places.js` is **format 2**: `ids` (the pin, as before, now 781 terms) and `windows` — per term
  `[lon, lat, kind, face, year, zoom]` — 1,098 windows: 104 at a year of greatest extent, 380 present-day faces, 213 card
  coordinates, the rest points. Still the lazy `atlas2gloss` bundle, 80 KB. `.claude/atlas-build/build-glossary-places.js`
  builds it as a pure function of the glossary (keys, tags, aliases), the cards (answers, locators, heavy `places`), the input
  file, the spec, the registry, `card-faces.js` (a country's frame) and `history.bin`; `check-places.js` (CI) and
  `test-study.js` §9 fail when it lags. Its header states the rule and every join.
* **The year of greatest extent** is read off `history.bin` alone: for an entity, the candidate years are each step's first year
  and the year after its last; the area in a year is the sum of `faceKm2` over its own faces alive then, a `contested:` face it
  shares at half, a `nested:` face it owns in full; the first year that attains the maximum wins. The centre is the area-weighted
  mean of the faces' `faceAnchor`s, the zoom frames their vertices (a face under 2 % of the total, an outlying island, does not
  widen the frame; a face is never framed closer than zoom 40).
* **Which terms**: the input file's 211 pins; a term whose tags make it a location (`locationClass` in the builder: the place tags,
  and the state/people tags when it joins a face; any event / person / thing tag excludes it) and that is the ANSWER of a card —
  or the name of a card's locator — whose `places` carry a registry row NAMED for it (tier 2); or whose such cards agree on one
  locator coordinate within 25 km (tier 4). A city and the province of its name resolve to the city unless the slug says
  `(state)`, `(province)`, `(region)`; anything else that disagrees is left out and listed (four today: Georgia (state), Grand
  Canal, Rhodes, Lomekwi 3).
* `app.js`: `glossWindowSpec`, `glossWindowHTML`, `mountGlossAtlas`, `stopGlossAtlas` beside `glossPlaceId`; the popup's body gained
  `.gloss-atlas`; `.mc-canvas` joined `GLOSS_NODRAG` and `GLOSS_TAP_SKIP` so a finger on the map pans the map, not the phone's
  sheet, and two taps on it are not a close. `atlas/atlas-windows.js`: the `map-gloss` host (`data-map-face`, `-facekind`,
  `-year`): the face is a highlight (`exact` at a year), the hub is asked for the whole history (`needHistory: "full"`, as Find
  it's area round), `neutral` for the other states, `peopleOnly` for a people. `atlas/atlas.js` + `atlas-embed.js`: the one-line
  `peopleOnly` switch in `presShown` and the spec. `styles.css`: `.gloss-atlas`.
* **Guarded by** `.claude/test-gloss-atlas-window.js` (the table's rules; a country, a point, a state at 561 with the gold on the
  pixels, a people; the phone's sheet; no WebGL2; no `placesSeen` written) — re-run after touching any of the above — plus
  `test-study.js` §9, `check-places.js`, `test-atlas-study.js` §7c (the pin), `test-window-fallbacks.js`, `test-atlas-embed.js`.

**Known limits.** A hub already on a war slice with a war window open keeps the slice, so a state's window opened beside a war
card draws today's map until the war window goes (the engine's own rule). On `file://` there is no twin of the whole history, so
a state's window stays today's map, centred and named. Tiers 3, 5 and 6 of §2 are not built: a glance list, a name-match list and
a Wikidata pass remain the way to the other 900 location terms. A term wrongly tagged (a river tagged `event`) gets no window
until retagged — the rule is strict by design.

## 1. What the window would be (the design, as examined before building)

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

**What counts as a location.** A term is a location when its tags say so (`place`, `city`, `capital`, `building`, `site`,
`region`, `river`, `island`, `mountain`, `sea`, `lake`, `strait`, `province`, `cave`, `temple`, `port`, `country`,
`continent`, `ocean`, `valley`, `peninsula`, `landform`…) and nothing says it is an event or a thing. A term tagged
`event`, `war`, `treaty`, `battle`, `person`, `ruler`, `deity`, `concept`, `practice`, `object`, `text`, `institution`,
`fossil`, `hominin`, `title` or `law` is OUT — even when the card answered by it carries a place (1,321 such terms do:
the Treaty of Versailles, Abraham Lincoln, Zeus, Turkana Boy), because the window would show the card's place, not the
term. A term carrying both a place tag and an excluding tag (96: the Rubicon is `event` and `place`; Sphacteria
`battle` and `place`) is listed in its tier with a note, for a glance: most are the place. A state, a people, a
dynasty or a culture (400) is not a location in the rule's sense and is set aside as Tier G, the owner's call.

**How a location's place was found.** Every term's title (its slug, underscores to spaces) and aliases were folded
(`places-registry.js`'s `fold`) and joined four ways, taking the first that answers:

* **A** — the term is already in `atlas/data/glossary-places.js` (a registry id).
* **B** — a card whose ANSWER is the term, or whose `locator.name` is the term, carries registry ids in its heavy `places`
  (`data-extra/`): the id NAMED for the term when there is one ("named"), else the id every such card shares ("shared"
  — the term lies within the card's place); two candidates farther than 25 km apart are `B?`.
* **C** — such a card has only a `locator.at` coordinate and no `places`.
* **D** — the title, an alias or the slug read as a Wikipedia title is exactly one registry row of a place kind.
* **F** — nothing joins.

**The result, sorted by effort** (locations only).

| tier | how the place is found | terms | drawn as a face / a dot | effort |
|---|---|---|---|---|
| 1 | already in `glossary-places.js` | 211 | 181 / 30 | none: the generator adds the coordinate or face |
| 2 | a card answered by the term carries a registry id named for the term | 586 | 208 / 378 | none: one generator rule |
| 3 | the same, but the id is the card's place, or two candidates (`B?`) | 459 | 338 / 110 | a glance each; the `B?` rows need a pick |
| 4 | a card's `locator.at` coordinate, no registry id | 107 | 0 / 107 | none to draw a dot; `migrate-places.js` for an id |
| 5 | a name match in the registry, no card | 90 | 12 / 78 | a glance each |
| 6 | tagged a place, nothing joins | 361 | — | a Wikidata lookup each (the slug IS a Wikipedia title, so the migration's title resolver can try them all; continents, hemispheres, ice sheets and "Western Europe" will fail, and should) |
| G | a state, a people, a dynasty, a culture | 400 | 374 joined, 26 not | the owner's call: a face at a year, a presence stipple, or nothing |
| — | an event, a person, a thing: not a location | 4,184 | — | none, by the rule |
| — | no place tag, no join | 297 | — | not relevant |

So **1,814 glossary terms are locations**. Tiers 1, 2 and 4 are **904 of them with no research at all** (a generator
rule over the cards' own `places` and `locator` fields); Tier 3's 459 are the same rule with a human reading the list
once; Tier 5's 90 a glance each; Tier 6's 361 are the real cost, one Wikidata resolution each, mostly automatic through
the title resolver `migrate-places.js` already has. The present rule that "a term that is neither a point nor a country
shows no marker, which is honest" (`glossPlaceId`'s comment) should hold for what the resolver cannot place.

**Caveats of the join.** Tier 2 is clean because the id's own name is the term's. In Tier 3 a card's `places` are the
card's, not the term's, so a few will be wrong in kind (a town whose card is placed on its country's face: 338 of the 459
are faces, and most of those should become the town's own dot in the registry). The Tier 5 rows were not checked by
hand. The tag classes are the glossary's tags as they stand; a term wrongly tagged is wrongly classed. Nothing here was
guessed into a data file: no file changed.

## 3. The lists

Every location term of Tiers 1–6, then Tier G, grouped by tier and sorted by name. "place" is the registry id (or
`lon,lat` for Tier 4); "window" says whether it would be a shaded face or a dot; "cards" are the cards the join went
through. The 4,184 terms the rule excludes and the 297 with no place tag are not listed.

### Tier 1 — Ready now (211)

already in `atlas/data/glossary-places.js` (a registry id); the generator only has to add the coordinate or face.

| term | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|
| Afar_Region | glossary-places.js | pl:q193494 | region | dot |  |
| Afghanistan | glossary-places.js | adm0:afg | country | face |  |
| Alaska | glossary-places.js | reg:1159104349 | region | dot |  |
| Albania | glossary-places.js | adm0:alb | country | face |  |
| Algeria | glossary-places.js | adm0:dza | country | face |  |
| Andorra | glossary-places.js | adm0:and | country | face |  |
| Angola | glossary-places.js | adm0:ago | country | face |  |
| Antarctica | glossary-places.js | adm0:ata | country | face |  |
| Argentina | glossary-places.js | adm0:arg | country | face |  |
| Armenia | glossary-places.js | adm0:arm | country | face |  |
| Australia | glossary-places.js | adm0:aus | country | face |  |
| Austria | glossary-places.js | adm0:aut | country | face |  |
| Awash_River | glossary-places.js | pl:q782845 | river | dot |  |
| Azerbaijan | glossary-places.js | adm0:aze | country | face |  |
| Bahrain | glossary-places.js | adm0:bhr | country | face |  |
| Bangladesh | glossary-places.js | adm0:bgd | country | face |  |
| Barbados | glossary-places.js | adm0:brb | country | face |  |
| Belarus | glossary-places.js | adm0:blr | country | face |  |
| Belgium | glossary-places.js | adm0:bel | country | face |  |
| Belize | glossary-places.js | adm0:blz | country | face |  |
| Benin | glossary-places.js | adm0:ben | country | face |  |
| Bhutan | glossary-places.js | adm0:btn | country | face |  |
| Blombos_Cave | glossary-places.js | pl:q884971 | site | dot |  |
| Bolivia | glossary-places.js | adm0:bol | country | face |  |
| Botswana | glossary-places.js | adm0:bwa | country | face |  |
| Brazil | glossary-places.js | adm0:bra | country | face |  |
| Brunei | glossary-places.js | adm0:brn | country | face |  |
| Bulgaria | glossary-places.js | adm0:bgr | country | face |  |
| Burkina_Faso | glossary-places.js | adm0:bfa | country | face |  |
| Burundi | glossary-places.js | adm0:bdi | country | face |  |
| Cambodia | glossary-places.js | adm0:khm | country | face |  |
| Cameroon | glossary-places.js | adm0:cmr | country | face |  |
| Canada | glossary-places.js | adm0:can | country | face |  |
| Cave_of_Altamira | glossary-places.js | pl:q133575 | site | dot |  |
| Chad | glossary-places.js | adm0:tcd | country | face |  |
| Chauvet_Cave | glossary-places.js | pl:q374096 | site | dot |  |
| Chile | glossary-places.js | adm0:chl | country | face |  |
| China | glossary-places.js | adm0:chn | country | face |  |
| Colombia | glossary-places.js | adm0:col | country | face |  |
| Comoros | glossary-places.js | adm0:com | country | face |  |
| Costa_Rica | glossary-places.js | adm0:cri | country | face |  |
| Croatia | glossary-places.js | adm0:hrv | country | face |  |
| Cuba | glossary-places.js | adm0:cub | country | face |  |
| Cyprus | glossary-places.js | adm0:cyp | country | face |  |
| Czech_Republic | glossary-places.js | adm0:cze | country | face |  |
| Denmark | glossary-places.js | adm0:dnk | country | face |  |
| Djibouti | glossary-places.js | adm0:dji | country | face |  |
| Dmanisi | glossary-places.js | pl:q261243 | city | dot |  |
| Doggerland | glossary-places.js | pl:q1138308 | region | dot |  |
| Dominica | glossary-places.js | adm0:dma | country | face |  |
| Ecuador | glossary-places.js | adm0:ecu | country | face |  |
| Egypt | glossary-places.js | adm0:egy | country | face |  |
| El_Salvador | glossary-places.js | adm0:slv | country | face |  |
| Eritrea | glossary-places.js | adm0:eri | country | face |  |
| Estonia | glossary-places.js | adm0:est | country | face |  |
| Eswatini | glossary-places.js | adm0:swz | country | face |  |
| Ethiopia | glossary-places.js | adm0:eth | country | face |  |
| Fennoscandia | glossary-places.js | pl:q604496 | region | dot |  |
| Fertile_Crescent | glossary-places.js | pl:q170526 | region | dot |  |
| Fiji | glossary-places.js | adm0:fji | country | face |  |
| Finland | glossary-places.js | adm0:fin | country | face |  |
| France | glossary-places.js | adm0:fra | country | face |  |
| Gabon | glossary-places.js | adm0:gab | country | face |  |
| Georgia_(country) | glossary-places.js | adm0:geo | country | face |  |
| Germany | glossary-places.js | adm0:deu | country | face |  |
| Ghana | glossary-places.js | adm0:gha | country | face |  |
| Gona,_Ethiopia | glossary-places.js | pl:q12314119 | site | dot |  |
| Great_Britain | glossary-places.js | reg:1159104133 | island | dot |  |
| Greece | glossary-places.js | adm0:grc | country | face |  |
| Greenland | glossary-places.js | adm0:grl | country | face |  |
| Grenada | glossary-places.js | adm0:grd | country | face |  |
| Guatemala | glossary-places.js | adm0:gtm | country | face |  |
| Guinea | glossary-places.js | adm0:gin | country | face |  |
| Guinea-Bissau | glossary-places.js | adm0:gnb | country | face |  |
| Guyana | glossary-places.js | adm0:guy | country | face |  |
| Hadar,_Ethiopia | glossary-places.js | pl:q1567353 | site | dot |  |
| Haiti | glossary-places.js | adm0:hti | country | face |  |
| Honduras | glossary-places.js | adm0:hnd | country | face |  |
| Hungary | glossary-places.js | adm0:hun | country | face |  |
| Iceland | glossary-places.js | adm0:isl | country | face |  |
| India | glossary-places.js | adm0:ind | country | face |  |
| Indonesia | glossary-places.js | adm0:idn | country | face |  |
| Iran | glossary-places.js | adm0:irn | country | face |  |
| Iraq | glossary-places.js | adm0:irq | country | face |  |
| Ireland | glossary-places.js | adm0:irl | country | face |  |
| Israel | glossary-places.js | adm0:isr | country | face |  |
| Italy | glossary-places.js | adm0:ita | country | face |  |
| Jamaica | glossary-places.js | adm0:jam | country | face |  |
| Japan | glossary-places.js | adm0:jpn | country | face |  |
| Johannesburg | glossary-places.js | city:1159151515 | capital | dot |  |
| Jordan | glossary-places.js | adm0:jor | country | face |  |
| Kazakhstan | glossary-places.js | adm0:kaz | country | face |  |
| Kenya | glossary-places.js | adm0:ken | country | face |  |
| Kiribati | glossary-places.js | adm0:kir | country | face |  |
| Kosovo | glossary-places.js | adm0:kos | country | face |  |
| Kuwait | glossary-places.js | adm0:kwt | country | face |  |
| Kyrgyzstan | glossary-places.js | adm0:kgz | country | face |  |
| Lake_Turkana | glossary-places.js | pl:q182719 | lake | dot |  |
| Laos | glossary-places.js | adm0:lao | country | face |  |
| Lascaux | glossary-places.js | pl:q172125 | site | dot |  |
| Latvia | glossary-places.js | adm0:lva | country | face |  |
| Le_Moustier | glossary-places.js | pl:q602572 | site | dot |  |
| Lebanon | glossary-places.js | adm0:lbn | country | face |  |
| Lesotho | glossary-places.js | adm0:lso | country | face |  |
| Liberia | glossary-places.js | adm0:lbr | country | face |  |
| Libya | glossary-places.js | adm0:lby | country | face |  |
| Liechtenstein | glossary-places.js | adm0:lie | country | face |  |
| Lithuania | glossary-places.js | adm0:ltu | country | face |  |
| Lomekwi | glossary-places.js | pl:q19833854 | site | dot |  |
| Luxembourg | glossary-places.js | adm0:lux | country | face |  |
| Madagascar | glossary-places.js | adm0:mdg | country | face |  |
| Malawi | glossary-places.js | adm0:mwi | country | face |  |
| Malaysia | glossary-places.js | adm0:mys | country | face |  |
| Maldives | glossary-places.js | adm0:mdv | country | face |  |
| Mali | glossary-places.js | adm0:mli | country | face |  |
| Malta | glossary-places.js | adm0:mlt | country | face |  |
| Mauritania | glossary-places.js | adm0:mrt | country | face |  |
| Mauritius | glossary-places.js | adm0:mus | country | face |  |
| Mexico | glossary-places.js | adm0:mex | country | face |  |
| Moldova | glossary-places.js | adm0:mda | country | face |  |
| Monaco | glossary-places.js | adm0:mco | country | face |  |
| Mongolia | glossary-places.js | adm0:mng | country | face |  |
| Montenegro | glossary-places.js | adm0:mne | country | face |  |
| Morocco | glossary-places.js | adm0:mar | country | face |  |
| Mozambique | glossary-places.js | adm0:moz | country | face |  |
| Myanmar | glossary-places.js | adm0:mmr | country | face |  |
| Namibia | glossary-places.js | adm0:nam | country | face |  |
| Nauru | glossary-places.js | adm0:nru | country | face |  |
| Near_East | glossary-places.js | pl:q48214 | region | dot |  |
| Nepal | glossary-places.js | adm0:npl | country | face |  |
| Netherlands | glossary-places.js | adm0:nld | country | face |  |
| New_Zealand | glossary-places.js | adm0:nzl | country | face |  |
| Nicaragua | glossary-places.js | adm0:nic | country | face |  |
| Niger | glossary-places.js | adm0:ner | country | face |  |
| Nigeria | glossary-places.js | adm0:nga | country | face |  |
| North_Korea | glossary-places.js | adm0:prk | country | face |  |
| North_Macedonia | glossary-places.js | adm0:mkd | country | face |  |
| Norway | glossary-places.js | adm0:nor | country | face |  |
| Olduvai_Gorge | glossary-places.js | pl:q217043 | site | dot |  |
| Oman | glossary-places.js | adm0:omn | country | face |  |
| Pakistan | glossary-places.js | adm0:pak | country | face |  |
| Palau | glossary-places.js | adm0:plw | country | face |  |
| Panama | glossary-places.js | adm0:pan | country | face |  |
| Papua_New_Guinea | glossary-places.js | adm0:png | country | face |  |
| Paraguay | glossary-places.js | adm0:pry | country | face |  |
| Peru | glossary-places.js | adm0:per | country | face |  |
| Philippines | glossary-places.js | adm0:phl | country | face |  |
| Poland | glossary-places.js | adm0:pol | country | face |  |
| Portugal | glossary-places.js | adm0:prt | country | face |  |
| Qafzeh_Cave | glossary-places.js | pl:q2121357 | site | dot |  |
| Qatar | glossary-places.js | adm0:qat | country | face |  |
| Romania | glossary-places.js | adm0:rou | country | face |  |
| Russia | glossary-places.js | adm0:rus | country | face |  |
| Rwanda | glossary-places.js | adm0:rwa | country | face |  |
| Sahara | glossary-places.js | reg:1159104337 | region | dot |  |
| Saint_Lucia | glossary-places.js | adm0:lca | country | face |  |
| Saint-Acheul | glossary-places.js | pl:q670003 | town | dot |  |
| Samoa | glossary-places.js | adm0:wsm | country | face |  |
| San_Marino | glossary-places.js | adm0:smr | country | face |  |
| São_Tomé_and_Príncipe | glossary-places.js | adm0:stp | country | face |  |
| Saudi_Arabia | glossary-places.js | adm0:sau | country | face |  |
| Senegal | glossary-places.js | adm0:sen | country | face |  |
| Serbia | glossary-places.js | adm0:srb | country | face |  |
| Seychelles | glossary-places.js | adm0:syc | country | face |  |
| Siberia | glossary-places.js | reg:1159104351 | region | dot |  |
| Sicily | glossary-places.js | pl:q1460 | region | dot |  |
| Sierra_Leone | glossary-places.js | adm0:sle | country | face |  |
| Singapore | glossary-places.js | adm0:sgp | country | face |  |
| Skhul_Cave | glossary-places.js | pl:q287341 | site | dot |  |
| Slovakia | glossary-places.js | adm0:svk | country | face |  |
| Slovenia | glossary-places.js | adm0:svn | country | face |  |
| Somalia | glossary-places.js | adm0:som | country | face |  |
| South_Africa | glossary-places.js | adm0:zaf | country | face |  |
| South_Korea | glossary-places.js | adm0:kor | country | face |  |
| Spain | glossary-places.js | adm0:esp | country | face |  |
| Sri_Lanka | glossary-places.js | adm0:lka | country | face |  |
| State_of_Palestine | glossary-places.js | adm0:psx | country | face |  |
| Sudan | glossary-places.js | adm0:sdn | country | face |  |
| Sulawesi | glossary-places.js | reg:1159103785 | island | dot |  |
| Sungir | glossary-places.js | pl:q1779534 | site | dot |  |
| Suriname | glossary-places.js | adm0:sur | country | face |  |
| Swabian_Jura | glossary-places.js | pl:q159589 | range | dot |  |
| Sweden | glossary-places.js | adm0:swe | country | face |  |
| Switzerland | glossary-places.js | adm0:che | country | face |  |
| Syria | glossary-places.js | adm0:syr | country | face |  |
| Taiwan | glossary-places.js | adm0:twn | country | face |  |
| Tajikistan | glossary-places.js | adm0:tjk | country | face |  |
| Tanzania | glossary-places.js | adm0:tza | country | face |  |
| Taung | glossary-places.js | pl:q2096879 | town | dot |  |
| Thailand | glossary-places.js | adm0:tha | country | face |  |
| Togo | glossary-places.js | adm0:tgo | country | face |  |
| Tonga | glossary-places.js | adm0:ton | country | face |  |
| Trinidad_and_Tobago | glossary-places.js | adm0:tto | country | face |  |
| Tunisia | glossary-places.js | adm0:tun | country | face |  |
| Turkey | glossary-places.js | adm0:tur | country | face |  |
| Turkmenistan | glossary-places.js | adm0:tkm | country | face |  |
| Tuvalu | glossary-places.js | adm0:tuv | country | face |  |
| Uganda | glossary-places.js | adm0:uga | country | face |  |
| Ukraine | glossary-places.js | adm0:ukr | country | face |  |
| United_Arab_Emirates | glossary-places.js | adm0:are | country | face |  |
| United_Kingdom | glossary-places.js | adm0:gbr | country | face |  |
| United_States | glossary-places.js | adm0:usa | country | face |  |
| Uruguay | glossary-places.js | adm0:ury | country | face |  |
| Uzbekistan | glossary-places.js | adm0:uzb | country | face |  |
| Vanuatu | glossary-places.js | adm0:vut | country | face |  |
| Vatican_City | glossary-places.js | adm0:vat | country | face |  |
| Venezuela | glossary-places.js | adm0:ven | country | face |  |
| Vietnam | glossary-places.js | adm0:vnm | country | face |  |
| Yemen | glossary-places.js | adm0:yem | country | face |  |
| Zambia | glossary-places.js | adm0:zmb | country | face |  |
| Zimbabwe | glossary-places.js | adm0:zwe | country | face |  |

### Tier 2 — Automatic from the cards (586)

a card answered by this term, or whose locator is named for it, carries a registry id NAMED for the term in its heavy `places` — a generator rule, no research.

| term | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|
| Abu_Gorab | a card's places (named for the term) | pl:q2038886 | site | dot | eg-120 |
| Abu_Rawash | a card's places (named for the term) | pl:q335278 | site | dot | eg-107 |
| Abusir | a card's places (named for the term) | pl:q336098 | site | dot | eg-123 eg-118 |
| Academy | a card's places (named for the term) — ALSO tagged institution: is it the place or the event? | pl:q19283711 | town | dot | gr-678 gr-908 |
| Acharnae | a card's places (named for the term) | pl:q576319 | town | dot | gr-532 |
| Acropolis | a card's places (named for the term) | pl:q2336187 | town | dot | gr-173 gr-986 |
| Addis_Ababa | a card's places (named for the term) | city:1159151549 | capital | dot | gw-510 ww2-042 |
| Adygea | a card's places (named for the term) | adm1:rus:ru-ad | admin1 | face | gru-073 |
| Aegean_Sea | a card's places (named for the term) | sea:1159117123 | sea | dot | gr-001 |
| Aegina | a card's places (named for the term) | pl:q191082 | island | dot | gr-196 |
| Ai-Khanoum | a card's places (named for the term) | pl:q857845 | site | dot | gr-782 |
| Alabama | a card's places (named for the term) | adm1:usa:us-al | admin1 | face | geo-037 |
| Åland | a card's places (named for the term) | adm0:ald | country | face | gw-217 fl-217 fd-217 |
| Alba_Longa | a card's places (named for the term) | pl:q335070 | site | dot | rm-056 rm-063 |
| Alban_Hills | a card's places (named for the term) | pl:q1129380 | range | dot | rm-005 |
| Alexandria | a card's places (named for the term) | city:1159151349 | city | dot | gr-801 rm-766 wh-335 gr-720 +14 |
| Alexandria_Eschate | a card's places (named for the term) | city:1159146327 | town | dot | gr-748 |
| American_Samoa | a card's places (named for the term) | adm0:asm | country | face | gw-207 fl-207 fd-207 |
| Amphipolis | a card's places (named for the term) | pl:q217414 | site | dot | gr-542 gr-543 gr-998 |
| Amsterdam | a card's places (named for the term) | city:1159151519 | capital | dot | gw-572 wh-676 eep-041 |
| Angkor_Wat | a card's places (named for the term) | pl:q43473 | site | dot | wh-557 |
| Anguilla | a card's places (named for the term) | adm0:aia | country | face | gw-219 fl-219 fd-219 |
| Anhui | a card's places (named for the term) | adm1:chn:cn-ah | admin1 | face | gc-009 |
| Antigua_and_Barbuda | a card's places (named for the term) | adm0:atg | country | face | gw-197 fl-197 fd-197 |
| Antioch | a card's places (named for the term) | city:1159113499 | town | dot | gr-780 rm-419 rm-596 |
| Anuradhapura | a card's places (named for the term) | city:1159148171 | town | dot | wh-562 |
| Apennines | a card's places (named for the term) | pl:q1285 | range | dot | rm-002 |
| Appian_Way | a card's places (named for the term) | pl:q189417 | site | dot | rm-138 |
| Aqua_Marcia | a card's places (named for the term) | pl:q622943 | site | dot | rm-988 |
| Ara_Pacis | a card's places (named for the term) | pl:q623612 | site | dot | rm-403 |
| Arch_of_Constantine | a card's places (named for the term) | pl:q5786 | site | dot | rm-594 |
| Arch_of_Titus | a card's places (named for the term) | pl:q723887 | site | dot | rm-474 |
| Argos | a card's places (named for the term) | pl:q13533353 | site | dot | gr-195 |
| Arizona_(state) | a card's places (named for the term) | adm1:usa:us-az | admin1 | face | geo-025 |
| Arkansas | a card's places (named for the term) | adm1:usa:us-ar | admin1 | face | geo-036 |
| Arkhangelsk | a card's places (named for the term) | adm1:rus:ru-ark | admin1 | face | gru-550 |
| Aruba | a card's places (named for the term) | adm0:abw | country | face | gw-192 fl-192 fd-192 |
| Ascra | a card's places (named for the term) | pl:q936920 | site | dot | gr-143 |
| Assinarus | a card's places (named for the term) — ALSO tagged event: is it the place or the event? | pl:q2292234 | river | dot | gr-560 |
| Astrakhan | a card's places (named for the term) | adm1:rus:ru-ast | admin1 | face | gru-554 |
| Atapuerca_Mountains | a card's places (named for the term) | pl:q48782131 | region | dot | wh-033 |
| Athens | a card's places (named for the term) | city:1159151545 | capital | dot | gw-594 wh-317 gr-805 gr-838 +12 |
| Athos_canal | a card's places (named for the term) | pl:q974205 | river | dot | gr-416 |
| Attica | a card's places (named for the term) | pl:q122443 | region | dot | gr-276 |
| Auschwitz_concentration_camp | a card's places (named for the term) | pl:q7342 | city | dot | wh-935 |
| Aventine_Hill | a card's places (named for the term) | pl:q194103 | hill | dot | rm-084 rm-449 |
| Babylon | a card's places (named for the term) | pl:q5684 | site | dot | wh-191 wh-288 gr-723 gr-747 +1 |
| Baekdudaegan | a card's places (named for the term) — ALSO tagged concept: is it the place or the event? | pl:q705583 | range | dot | ko-004 |
| Baghdad | a card's places (named for the term) | city:1159151547 | capital | dot | gw-534 wh-470 wh-597 ru-068 |
| Banditaccia_necropolis | a card's places (named for the term) | pl:q859735 | site | dot | rm-034 |
| Bangkok | a card's places (named for the term) | city:1159151509 | capital | dot | gw-520 wh-864 |
| Banpo | a card's places (named for the term) | pl:q806929 | site | dot | cnh-046 |
| Bashkortostan | a card's places (named for the term) | adm1:rus:ru-ba | admin1 | face | gru-007 |
| Baths_of_Diocletian | a card's places (named for the term) | pl:q836108 | site | dot | rm-884 |
| Belgorod | a card's places (named for the term) | adm1:rus:ru-bel | admin1 | face | gru-531 |
| Belgrade | a card's places (named for the term) | city:1159151079 | capital | dot | gw-610 wh-981 |
| Beringia | a card's places (named for the term) | pl:q190927 | region | dot | wh-097 us-003 |
| Berlin | a card's places (named for the term) | city:1159151529 | capital | dot | gw-519 ww2-103 ww2-104 ww2-125 +10 |
| Berlin_Wall | a card's places (named for the term) | pl:q5086 | site | dot | wh-959 |
| Bermuda | a card's places (named for the term) | adm0:bmu | country | face | gw-203 fl-203 fd-203 |
| Bhimbetka_rock_shelters | a card's places (named for the term) | pl:q331603 | site | dot | wh-110 |
| Bir_Kiseiba | a card's places (named for the term) | pl:q28162746 | site | dot | eg-016 |
| Borobudur | a card's places (named for the term) | pl:q42798 | site | dot | wh-561 |
| Bosnia_and_Herzegovina | a card's places (named for the term) | adm0:bih | country | face | gw-136 fl-136 fd-136 |
| Bridgetown | a card's places (named for the term) | city:1159150339 | capital | dot | gw-681 wh-727 wh-730 |
| British_Virgin_Islands | a card's places (named for the term) | adm0:vgb | country | face | gw-212 fl-212 fd-212 |
| Brussels | a card's places (named for the term) | city:1159151465 | capital | dot | gw-582 wh-989 eep-034 |
| Bryansk | a card's places (named for the term) | adm1:rus:ru-bry | admin1 | face | gru-541 |
| Bucharest | a card's places (named for the term) | city:1159151263 | capital | dot | gw-567 gga-119 |
| Buenos_Aires | a card's places (named for the term) | city:1159151559 | capital | dot | gw-535 wh-858 |
| Buhen | a card's places (named for the term) | pl:q1002656 | site | dot | eg-193 |
| Buto | a card's places (named for the term) | pl:q739278 | site | dot | eg-040 |
| Byzantium | a card's places (named for the term) | pl:q16869 | city | dot | gr-219 |
| Caere | a card's places (named for the term) | pl:q2914373 | site | dot | rm-033 rm-147 |
| Cahokia | a card's places (named for the term) | pl:q333661 | site | dot | us-018 wh-618 |
| Cairo | a card's places (named for the term) | city:1159151603 | capital | dot | gw-513 wh-570 |
| Calauria | a card's places (named for the term) | pl:q1443132 | island | dot | gr-757 |
| California | a card's places (named for the term) | adm1:usa:us-ca | admin1 | face | geo-001 us-033 |
| Calleva_Atrebatum | a card's places (named for the term) | pl:q1027253 | site | dot | rm-781 |
| Campus_Martius | a card's places (named for the term) — ALSO tagged institution: is it the place or the event? | pl:q242839 | region | dot | rm-826 rm-071 rm-073 rm-114 +9 |
| Camulodunum | a card's places (named for the term) | pl:q630604 | site | dot | rm-432 rm-442 |
| Cape_Sounion | a card's places (named for the term) | pl:q1136637 | cape | dot | gr-892 |
| Cape_Verde | a card's places (named for the term) | adm0:cpv | country | face | gw-174 fl-174 fd-174 |
| Capitoline_Hill | a card's places (named for the term) | pl:q34925 | hill | dot | rm-050 rm-076 rm-126 rm-140 |
| Capri | a card's places (named for the term) | pl:q173292 | island | dot | rm-425 |
| Caracas | a card's places (named for the term) | city:1159151493 | capital | dot | gw-553 wh-770 |
| Carthage | a card's places (named for the term) | pl:q6343 | site | dot | rm-181 rm-763 wh-295 rm-627 |
| Çatalhöyük | a card's places (named for the term) | pl:q192522 | site | dot | wh-125 |
| Cayman_Islands | a card's places (named for the term) | adm0:cym | country | face | gw-200 fl-200 fd-200 |
| Central_African_Republic | a card's places (named for the term) | adm0:caf | country | face | gw-122 fl-122 fd-122 |
| Chaco_Canyon | a card's places (named for the term) | pl:q49786970 | region | dot | us-023 wh-620 |
| Chalcis | a card's places (named for the term) | pl:q200133 | city | dot | gr-197 |
| Chang'an | a card's places (named for the term) | pl:q6501000 | site | dot | jp-088 wh-524 cnh-367 cnh-220 +10 |
| Chechnya | a card's places (named for the term) | adm1:rus:ru-ce | admin1 | face | gru-030 |
| Chelyabinsk | a card's places (named for the term) | adm1:rus:ru-che | admin1 | face | gru-510 |
| Chengdu | a card's places (named for the term) | city:1159151533 | city | dot | gc-505 wh-529 cnh-255 cnh-280 +6 |
| Chicago | a card's places (named for the term) | city:1159151491 | city | dot | geo-721 ww2-133 |
| Chichen_Itza | a card's places (named for the term) | pl:q5859 | site | dot | wh-603 |
| Chita | a card's places (named for the term) | adm1:rus:ru-zab | admin1 | face | gru-551 |
| Chongqing | a card's places (named for the term) | adm1:chn:cn-cq | admin1 | face | gc-019 |
| Chu_(state) | a card's places (named for the term) | pol:chu | polity | face | cnh-154 |
| Chukotka_Autonomous_Okrug | a card's places (named for the term) | adm1:rus:ru-chu | admin1 | face | gru-082 |
| Circus_Maximus | a card's places (named for the term) | pl:q207808 | site | dot | rm-068 rm-428 rm-446 |
| Cloaca_Maxima | a card's places (named for the term) | pl:q746102 | site | dot | rm-067 |
| Colonus | a card's places (named for the term) | pl:q1235930 | town | dot | gr-567 |
| Colorado_(state) | a card's places (named for the term) | adm1:usa:us-co | admin1 | face | geo-045 |
| Colosseum | a card's places (named for the term) | pl:q10285 | site | dot | wh-362 rm-475 |
| Comitium | a card's places (named for the term) — ALSO tagged institution: is it the place or the event? | pl:q1114895 | site | dot | rm-700 |
| Connecticut | a card's places (named for the term) | adm1:usa:us-ct | admin1 | face | geo-040 |
| Constantinople | a card's places (named for the term) | pl:q16869 | city | dot | wh-437 rm-586 ru-043 ru-044 +2 |
| Cook_Islands | a card's places (named for the term) | adm0:cok | country | face | gw-221 fl-221 fd-221 |
| Corinth | a card's places (named for the term) | pl:q1363688 | site | dot | gr-189 gr-323 gr-864 gr-935 +1 |
| Croton | a card's places (named for the term) | pl:q13526919 | site | dot | gr-213 |
| Cumae | a card's places (named for the term) | pl:q243456 | site | dot | gr-215 rm-044 rm-179 gr-994 |
| Curaçao | a card's places (named for the term) | adm0:cuw | country | face | gw-187 fl-187 fd-187 |
| Cusco | a card's places (named for the term) | city:1159150611 | town | dot | wh-613 |
| Cyrene | a card's places (named for the term) | pl:q44112 | site | dot | gr-206 gr-777 gr-807 |
| Dadu_(Beijing) | a card's places (named for the term) | city:1159151595 | capital | dot | cnh-502 cnh-487 cnh-496 |
| Dagestan | a card's places (named for the term) | adm1:rus:ru-da | admin1 | face | gru-011 |
| Dahshur | a card's places (named for the term) | pl:q685414 | site | dot | eg-099 eg-101 eg-102 eg-183 +2 |
| Damascus | a card's places (named for the term) | city:1159151269 | capital | dot | wh-466 gw-557 |
| Dardanelles | a card's places (named for the term) | sea:1159119155 | strait | dot | gr-105 gr-710 |
| Delaware_(state) | a card's places (named for the term) | adm1:usa:us-de | admin1 | face | geo-039 |
| Delos | a card's places (named for the term) | pl:q173148 | island | dot | gr-867 |
| Delphi | a card's places (named for the term) | pl:q75459 | site | dot | gr-164 gr-345 gr-787 gr-861 +9 |
| Democratic_Republic_of_the_Congo | a card's places (named for the term) | adm0:cod | country | face | gw-015 fl-015 fd-015 |
| Dendera | a card's places (named for the term) | pl:q29019 | site | dot | eg-154 |
| Denisova_Cave | a card's places (named for the term) | pl:q1029322 | site | dot | wh-039 |
| Dholavira | a card's places (named for the term) | pl:q9468 | site | dot | wh-236 |
| Diolkos | a card's places (named for the term) — ALSO tagged object: is it the place or the event? | pl:q1226902 | site | dot | gr-190 |
| Djibouti_(city) | a card's places (named for the term) | adm0:dji | country | face | gw-161 gw-661 fl-161 fd-161 |
| Dodona | a card's places (named for the term) | pl:q382317 | site | dot | gr-982 rm-164 gr-977 |
| Dominican_Republic | a card's places (named for the term) | adm0:dom | country | face | gw-085 fl-085 fd-085 |
| Domus_Aurea | a card's places (named for the term) | pl:q622438 | site | dot | rm-447 |
| Dreros | a card's places (named for the term) | pl:q5306985 | site | dot | gr-171 |
| East_Timor | a card's places (named for the term) | adm0:tls | country | face | gw-155 fl-155 fd-155 |
| Eastern_Desert | a card's places (named for the term) | reg:1159103265 | region | dot | eg-008 |
| Eboracum | a card's places (named for the term) | pl:q958954 | site | dot | rm-543 |
| Eion | a card's places (named for the term) | pl:q1268859 | site | dot | gr-544 |
| El_Lahun | a card's places (named for the term) | pl:q56924 | site | dot | eg-186 eg-184 eg-187 |
| Eleusis | a card's places (named for the term) | pl:q11918833 | site | dot | gr-991 gr-893 gr-990 |
| Elis | a card's places (named for the term) | pl:q1063649 | region | dot | gr-844 |
| Emporion | a card's places (named for the term) | pl:q93335904 | site | dot | gr-217 |
| Epidamnus | a card's places (named for the term) | city:1159144543 | town | dot | gr-524 |
| Epidaurus | a card's places (named for the term) | pl:q233576 | site | dot | gr-996 gr-995 gr-997 |
| Equatorial_Guinea | a card's places (named for the term) | adm0:gnq | country | face | gw-150 fl-150 fd-150 |
| Erechtheion | a card's places (named for the term) | pl:q242741 | site | dot | gr-502 |
| Etna | a card's places (named for the term) | pl:q16990 | mountain | dot | gr-914 |
| Eurasian_Steppe | a card's places (named for the term) | pl:q77120 | region | dot | ru-001 |
| Faiyum_Oasis | a card's places (named for the term) | city:1159149857 | town | dot | eg-006 eg-185 |
| Falkland_Islands | a card's places (named for the term) | adm0:flk | country | face | gw-229 fl-229 fd-229 |
| Famen_Temple | a card's places (named for the term) | pl:q614916 | site | dot | cnh-387 |
| Faroe_Islands | a card's places (named for the term) | adm0:fro | country | face | gw-205 fl-205 fd-205 |
| Federated_States_of_Micronesia | a card's places (named for the term) | adm0:fsm | country | face | gw-191 fl-191 fd-191 |
| Flavian_Palace | a card's places (named for the term) | pl:q529806 | site | dot | rm-487 rm-489 |
| Florence | a card's places (named for the term) | city:1159149751 | city | dot | wh-623 wh-624 gr-880 rm-729 |
| Florida | a card's places (named for the term) | adm1:usa:us-fl | admin1 | face | geo-003 |
| Forbidden_City | a card's places (named for the term) | pl:q80290 | site | dot | wh-713 cnh-512 cnh-550 cnh-552 +1 |
| Forum_Boarium | a card's places (named for the term) | pl:q283650 | site | dot | rm-047 |
| Forum_of_Augustus | a card's places (named for the term) | pl:q770797 | site | dot | rm-402 |
| Forum_Romanum | a card's places (named for the term) | pl:q180212 | site | dot | rm-088 rm-984 rm-986 rm-078 +34 |
| Free_City_of_Danzig | a card's places (named for the term) | city:1159149707 | town | dot | ww2-130 |
| French_Polynesia | a card's places (named for the term) | adm0:pyf | country | face | gw-182 fl-182 fd-182 |
| Fujian | a card's places (named for the term) | adm1:chn:cn-fj | admin1 | face | gc-015 wh-533 |
| Gabii | a card's places (named for the term) | pl:q614510 | site | dot | rm-074 |
| Gansu | a card's places (named for the term) | adm1:chn:cn-gs | admin1 | face | gc-022 |
| Gebel_Ramlah | a card's places (named for the term) | pl:q85762876 | site | dot | eg-015 |
| Gebelein | a card's places (named for the term) | pl:q1496830 | site | dot | eg-152 |
| Gela | a card's places (named for the term) | pl:q39971 | town | dot | gr-210 gr-974 |
| Giant_Wild_Goose_Pagoda | a card's places (named for the term) | pl:q1047061 | site | dot | cnh-964 cnh-388 |
| Gibraltar | a card's places (named for the term) | adm0:gib | country | face | gw-213 fl-213 fd-213 |
| Gisr_el-Mudir | a card's places (named for the term) | pl:q1527638 | site | dot | eg-090 |
| Giza | a card's places (named for the term) | city:1159146947 | city | dot | wh-212 eg-103 eg-104 eg-105 +10 |
| Gla | a card's places (named for the term) | pl:q636506 | site | dot | gr-071 |
| Gnyozdovo | a card's places (named for the term) | pl:q13424755 | town | dot | ru-033 |
| Göbekli_Tepe | a card's places (named for the term) | pl:q214944 | site | dot | wh-123 |
| Gournia | a card's places (named for the term) | pl:q1540236 | site | dot | gr-014 |
| Great_Mosque_of_Xi'an | a card's places (named for the term) | pl:q820842 | site | dot | cnh-788 |
| Great_Zimbabwe | a card's places (named for the term) | pl:q209217 | site | dot | wh-579 |
| Green_Island,_Taiwan | a card's places (named for the term) | pl:q701689 | island | dot | pea-139 |
| Guam | a card's places (named for the term) | adm0:gum | country | face | gw-186 fl-186 fd-186 |
| Guangdong | a card's places (named for the term) | adm1:chn:cn-gd | admin1 | face | gc-001 |
| Guangxi | a card's places (named for the term) | adm1:chn:cn-gx | admin1 | face | gc-011 |
| Guangzhou | a card's places (named for the term) | city:1159151331 | city | dot | gc-501 wh-531 wh-719 wh-840 +1 |
| Guernsey | a card's places (named for the term) | adm0:ggy | country | face | gw-201 fl-201 fd-201 |
| Guizhou | a card's places (named for the term) | adm1:chn:cn-gz | admin1 | face | gc-017 |
| Hadrian's_Villa | a card's places (named for the term) | pl:q272777 | site | dot | rm-509 |
| Hagia_Sophia | a card's places (named for the term) | pl:q12506 | site | dot | wh-440 wh-688 |
| Hainan | a card's places (named for the term) | adm1:chn:cn-hi | admin1 | face | gc-028 |
| Hall_of_Mental_Cultivation | a card's places (named for the term) | pl:q5642706 | site | dot | cnh-728 cnh-551 |
| Hangzhou | a card's places (named for the term) | city:1159151387 | city | dot | gc-508 cnh-405 cnh-448 cnh-449 +2 |
| Hatnub | a card's places (named for the term) | pl:q922009 | site | dot | eg-170 |
| Havana | a card's places (named for the term) | city:1159151347 | capital | dot | gw-587 wh-960 |
| Hawaii | a card's places (named for the term) | adm1:usa:us-hi | admin1 | face | geo-006 |
| Hebei | a card's places (named for the term) | adm1:chn:cn-he | admin1 | face | gc-006 |
| Heilongjiang | a card's places (named for the term) | adm1:chn:cn-hl | admin1 | face | gc-020 |
| Helsinki | a card's places (named for the term) | city:1159151419 | capital | dot | gw-617 eep-043 gga-110 |
| Henan | a card's places (named for the term) | adm1:chn:cn-ha | admin1 | face | gc-003 |
| Heracleopolis_Magna | a card's places (named for the term) | pl:q249480 | site | dot | eg-141 |
| Heraion_of_Samos | a card's places (named for the term) | pl:q841207 | site | dot | gr-165 |
| Herculaneum | a card's places (named for the term) | pl:q178813 | site | dot | rm-479 |
| Hexi_Corridor | a card's places (named for the term) | reg:1159103735 | region | dot | cnh-231 |
| Hierakonpolis | a card's places (named for the term) | pl:q278988 | site | dot | eg-036 eg-030 eg-048 eg-050 |
| Hong_Kong | a card's places (named for the term) | adm0:hkg | country | face | gw-104 fl-104 fd-104 |
| Hubei | a card's places (named for the term) | adm1:chn:cn-hb | admin1 | face | gc-010 |
| Hunan | a card's places (named for the term) | adm1:chn:cn-hn | admin1 | face | gc-007 |
| Idaean_Cave | a card's places (named for the term) | pl:q935991 | site | dot | gr-055 |
| Idaho | a card's places (named for the term) | adm1:usa:us-id | admin1 | face | geo-012 |
| Iguvium | a card's places (named for the term) | pl:q3792526 | site | dot | rm-016 |
| Illinois | a card's places (named for the term) | adm1:usa:us-il | admin1 | face | geo-021 |
| Inchtuthil | a card's places (named for the term) | pl:q2309575 | site | dot | rm-486 |
| Indiana | a card's places (named for the term) | adm1:usa:us-in | admin1 | face | geo-032 |
| Ingushetia | a card's places (named for the term) | adm1:rus:ru-in | admin1 | face | gru-069 |
| Inner_Mongolia | a card's places (named for the term) | adm1:chn:cn-nm | admin1 | face | gc-025 |
| Ionia | a card's places (named for the term) | pl:q620874 | region | dot | gr-200 |
| Iowa | a card's places (named for the term) | adm1:usa:us-ia | admin1 | face | geo-050 |
| Irkutsk | a card's places (named for the term) | adm1:rus:ru-irk | admin1 | face | gru-521 |
| Isfahan | a card's places (named for the term) | city:1159150971 | city | dot | wh-697 wh-696 |
| Isle_of_Man | a card's places (named for the term) | adm0:imn | country | face | gw-198 fl-198 fd-198 |
| Ivanovo | a card's places (named for the term) | adm1:rus:ru-iva | admin1 | face | gru-555 |
| Ivory_Coast | a card's places (named for the term) | adm0:civ | country | face | gw-050 fl-050 fd-050 |
| Jamestown,_Virginia | a card's places (named for the term) | pl:q323813 | town | dot | gw-727 wh-679 |
| Jericho | a card's places (named for the term) | pl:q2402267 | site | dot | wh-124 |
| Jersey | a card's places (named for the term) | adm0:jey | country | face | gw-195 fl-195 fd-195 |
| Jiahu | a card's places (named for the term) | pl:q1688860 | site | dot | cnh-044 |
| Jiangsu | a card's places (named for the term) | adm1:chn:cn-js | admin1 | face | gc-004 |
| Jiangxi | a card's places (named for the term) | adm1:chn:cn-jx | admin1 | face | gc-013 |
| Jilin | a card's places (named for the term) | adm1:chn:cn-jl | admin1 | face | gc-024 |
| Jin_(state) | a card's places (named for the term) | pol:jin_state | polity | face | cnh-153 |
| Jinan | a card's places (named for the term) | city:1159151379 | city | dot | gc-502 cnh-442 |
| Kabardino-Balkaria | a card's places (named for the term) | adm1:rus:ru-kb | admin1 | face | gru-056 |
| Kabul | a card's places (named for the term) | city:1159151561 | capital | dot | gw-536 wh-700 |
| Kaifeng | a card's places (named for the term) | pl:q208471 | city | dot | cnh-425 wh-532 cnh-397 cnh-398 +7 |
| Kaliningrad | a card's places (named for the term) | adm1:rus:ru-kgd | admin1 | face | gru-549 |
| Kaluga | a card's places (named for the term) | adm1:rus:ru-klu | admin1 | face | gru-548 |
| Kamchatka_Krai | a card's places (named for the term) | adm1:rus:ru-kam | admin1 | face | gru-077 |
| Kansas_(state) | a card's places (named for the term) | adm1:usa:us-ks | admin1 | face | geo-046 |
| Karnak | a card's places (named for the term) | pl:q522862 | site | dot | wh-228 eg-182 |
| Kazan | a card's places (named for the term) | adm1:rus:ru-ta | admin1 | face | gru-508 |
| Kemerovo | a card's places (named for the term) | adm1:rus:ru-kem | admin1 | face | gru-517 |
| Kentucky | a card's places (named for the term) | adm1:usa:us-ky | admin1 | face | geo-033 |
| Kerameikos | a card's places (named for the term) | pl:q630974 | site | dot | gr-123 gr-999 |
| Keros | a card's places (named for the term) | pl:q546109 | island | dot | gr-004 |
| Khabarovsk | a card's places (named for the term) | adm1:rus:ru-kha | admin1 | face | gru-534 |
| Khabarovsk_Krai | a card's places (named for the term) | adm1:rus:ru-kha | admin1 | face | gru-034 |
| Khanty-Mansi_Autonomous_Okrug | a card's places (named for the term) | adm1:rus:ru-khm | admin1 | face | gru-028 |
| Khanty-Mansiysk | a card's places (named for the term) | adm1:rus:ru-khm | admin1 | face | gru-528 |
| Kharga_Oasis | a card's places (named for the term) | pl:q428570 | region | dot | eg-009 |
| Kigali | a card's places (named for the term) | city:1159149385 | capital | dot | gw-577 wh-992 |
| Kilwa_Kisiwani | a card's places (named for the term) | pl:q1741475 | island | dot | wh-578 |
| Kingston | a card's places (named for the term) | city:1159150855 | capital | dot | gw-641 wh-729 |
| Kirov,_Kirov_Oblast | a card's places (named for the term) | adm1:rus:ru-kir | admin1 | face | gru-542 |
| Knossos | a card's places (named for the term) | pl:q173527 | site | dot | gr-008 gr-010 gr-017 gr-023 +5 |
| Komi_Republic | a card's places (named for the term) | adm1:rus:ru-ko | admin1 | face | gru-061 |
| Kostroma | a card's places (named for the term) | adm1:rus:ru-kos | admin1 | face | gru-568 |
| Krasnodar | a card's places (named for the term) | adm1:rus:ru-kda | admin1 | face | gru-503 |
| Krasnodar_Krai | a card's places (named for the term) | adm1:rus:ru-kda | admin1 | face | gru-003 |
| Krasnoyarsk | a card's places (named for the term) | adm1:rus:ru-kya | admin1 | face | gru-515 |
| Krasnoyarsk_Krai | a card's places (named for the term) | adm1:rus:ru-kya | admin1 | face | gru-015 |
| Kuk_Swamp | a card's places (named for the term) | pl:q1165562 | site | dot | wh-155 |
| Kurgan | a card's places (named for the term) — ALSO tagged practice: is it the place or the event? | adm1:rus:ru-kgn | admin1 | face | ru-007 gru-560 |
| Kursk | a card's places (named for the term) | adm1:rus:ru-krs | admin1 | face | gru-544 |
| Kyiv | a card's places (named for the term) | city:1159151495 | capital | dot | gw-541 ru-038 ru-041 ru-042 +13 |
| Kythera | a card's places (named for the term) | pl:q114571906 | site | dot | gr-049 |
| Laconia | a card's places (named for the term) | pl:q11723836 | region | dot | gr-232 |
| Lalibela | a card's places (named for the term) | pl:q207590 | town | dot | wh-582 |
| Lambaesis | a card's places (named for the term) | pl:q1309744 | site | dot | rm-507 |
| Lapis_Niger | a card's places (named for the term) — ALSO tagged object: is it the place or the event? | pl:q841388 | site | dot | rm-089 |
| Las_Médulas | a card's places (named for the term) | pl:q696803 | site | dot | rm-864 |
| Lavinium | a card's places (named for the term) | pl:q1352586 | site | dot | rm-055 |
| Lefkandi | a card's places (named for the term) | pl:q634655 | site | dot | gr-116 gr-117 |
| Leptis_Magna | a card's places (named for the term) | pl:q191504 | site | dot | rm-764 |
| Lesbos | a card's places (named for the term) | reg:1159102825 | island | dot | gr-356 |
| Lhasa | a card's places (named for the term) | city:1159150879 | town | dot | gc-531 cnh-384 cnh-548 |
| Liaoning | a card's places (named for the term) | adm1:chn:cn-ln | admin1 | face | gc-014 |
| Lima | a card's places (named for the term) | city:1159151511 | capital | dot | gw-548 wh-667 |
| Lingqu | a card's places (named for the term) | pl:q966140 | river | dot | cnh-204 |
| Lion_Gate | a card's places (named for the term) | pl:q1450403 | site | dot | gr-059 |
| Lipetsk | a card's places (named for the term) | adm1:rus:ru-lip | admin1 | face | gru-543 |
| Lisbon | a card's places (named for the term) | city:1159151273 | capital | dot | gw-590 wh-656 eep-047 |
| Londinium | a card's places (named for the term) | pl:q927198 | site | dot | rm-758 |
| London | a card's places (named for the term) | city:1159151577 | capital | dot | gw-521 ww2-120 ww2-114 ww2-121 +11 |
| Longmen_Grottoes | a card's places (named for the term) | pl:q273834 | site | dot | cnh-336 |
| Lothal | a card's places (named for the term) | pl:q9443 | site | dot | wh-237 |
| Louisiana | a card's places (named for the term) | adm1:usa:us-la | admin1 | face | geo-008 |
| Lu_(state) | a card's places (named for the term) | pol:lu | polity | face | cnh-156 |
| Ludus_Magnus | a card's places (named for the term) | pl:q1232473 | site | dot | rm-869 |
| Lugdunum | a card's places (named for the term) | pl:q665 | site | dot | rm-760 rm-430 rm-435 rm-540 |
| Luoyang | a card's places (named for the term) | city:1159147063 | city | dot | cnh-256 cnh-259 cnh-260 cnh-261 +17 |
| Luxembourg_(city) | a card's places (named for the term) | adm0:lux | country | face | gw-168 gw-668 fl-168 fd-168 |
| Lydia | a card's places (named for the term) | pol:lydia | polity | face | wh-297 gr-383 |
| Maadi | a card's places (named for the term) | pl:q589934 | town | dot | eg-041 |
| Macau | a card's places (named for the term) | adm0:mac | country | face | gw-167 fl-167 fd-167 |
| Machu_Picchu | a card's places (named for the term) | pl:q676203 | site | dot | wh-614 |
| Madrid | a card's places (named for the term) | city:1159151503 | capital | dot | gw-532 ww2-112 ww2-111 wh-735 |
| Magadan | a card's places (named for the term) | adm1:rus:ru-mag | admin1 | face | gru-581 |
| Maine | a card's places (named for the term) | adm1:usa:us-me | admin1 | face | geo-009 |
| Malia | a card's places (named for the term) | pl:q1887316 | site | dot | gr-012 |
| Manchester_(New_Hampshire) | a card's places (named for the term) | city:1159149119 | city | dot | geo-741 wh-788 |
| Manila | a card's places (named for the term) | city:1159151525 | capital | dot | gw-514 wh-678 |
| Mantineia | a card's places (named for the term) | pl:q1160195 | site | dot | gr-548 |
| Marathon_tumuli | a card's places (named for the term) | pl:q17276497 | site | dot | gr-407 |
| Marshall_Islands | a card's places (named for the term) | adm0:mhl | country | face | gw-215 fl-215 fd-215 |
| Maryland | a card's places (named for the term) | adm1:usa:us-md | admin1 | face | geo-014 |
| Masada | a card's places (named for the term) | pl:q186312 | site | dot | rm-472 |
| Massachusetts | a card's places (named for the term) | adm1:usa:us-ma | admin1 | face | geo-019 |
| Massalia | a card's places (named for the term) | city:1159150037 | city | dot | gr-216 gr-837 |
| Mausoleum_of_Augustus | a card's places (named for the term) | pl:q770847 | site | dot | rm-404 |
| Megalopolis | a card's places (named for the term) — ALSO tagged event: is it the place or the event? | pl:q36024972 | site | dot | gr-674 gr-863 gr-865 |
| Megara_Hyblaea | a card's places (named for the term) | pl:q1457477 | site | dot | gr-209 |
| Mehrgarh | a card's places (named for the term) | pl:q242148 | site | dot | wh-150 |
| Meidum | a card's places (named for the term) | pl:q13444093 | site | dot | eg-100 |
| Memphis_(Egypt) | a card's places (named for the term) | pl:q5715 | site | dot | gr-719 gr-753 eg-070 |
| Menelaion | a card's places (named for the term) | pl:q23069794 | site | dot | gr-260 |
| Mesa_Verde | a card's places (named for the term) | pl:q49693597 | site | dot | us-025 wh-619 |
| Mesopotamia | a card's places (named for the term) | reg:1159104115 | region | dot | wh-171 |
| Messana | a card's places (named for the term) | pl:q13666 | city | dot | rm-188 |
| Mevania | a card's places (named for the term) | pl:q17051264 | site | dot | rm-159 |
| Mexico_City | a card's places (named for the term) | city:1159151587 | capital | dot | gw-511 wh-861 |
| Michigan | a card's places (named for the term) | adm1:usa:us-mi | admin1 | face | geo-007 |
| Midea | a card's places (named for the term) | pl:q502897 | site | dot | gr-070 |
| Milan | a card's places (named for the term) | city:1159151315 | city | dot | rm-580 |
| Miletus | a card's places (named for the term) | pl:q169460 | site | dot | gr-098 gr-199 gr-712 gr-397 |
| Minnesota | a card's places (named for the term) | adm1:usa:us-mn | admin1 | face | geo-017 |
| Minsk | a card's places (named for the term) | city:1159151149 | capital | dot | gw-599 gga-121 |
| Mississippi_(state) | a card's places (named for the term) | adm1:usa:us-ms | admin1 | face | geo-038 |
| Missouri_(state) | a card's places (named for the term) | adm1:usa:us-mo | admin1 | face | geo-035 |
| Mochlos | a card's places (named for the term) | pl:q25094151 | island | dot | gr-038 |
| Mohenjo-daro | a card's places (named for the term) | pl:q5725 | site | dot | wh-233 |
| Montana | a card's places (named for the term) | adm1:usa:us-mt | admin1 | face | geo-043 |
| Monte_Testaccio | a card's places (named for the term) | pl:q781595 | site | dot | rm-534 |
| Monte_Verde | a card's places (named for the term) | pl:q975775 | site | dot | wh-099 us-008 |
| Montserrat | a card's places (named for the term) | adm0:msr | country | face | gw-228 fl-228 fd-228 |
| Mordovia | a card's places (named for the term) | adm1:rus:ru-mo | admin1 | face | gru-058 |
| Moscow | a card's places (named for the term) | city:1159151585 | capital | dot | gw-509 gru-001 ww2-126 ww2-127 +6 |
| Moscow_Oblast | a card's places (named for the term) | adm1:rus:ru-mow | admin1 | face | gru-002 |
| Mount_Ida | a card's places (named for the term) | pl:q1127771 | range | dot | gr-942 |
| Mount_Olympus | a card's places (named for the term) | pl:q80344 | mountain | dot | gr-905 |
| Murmansk | a card's places (named for the term) | adm1:rus:ru-mur | admin1 | face | gru-565 |
| Muziris | a card's places (named for the term) | pl:q2974112 | site | dot | rm-784 |
| Mycenae | a card's places (named for the term) | pl:q132564 | site | dot | gr-058 gr-945 gr-955 |
| Mycenaean_Thebes | a card's places (named for the term) | pl:q11225429 | site | dot | gr-069 gr-705 gr-903 gr-938 |
| Mytilene | a card's places (named for the term) | pl:q189059 | city | dot | gr-536 |
| Nabta_Playa | a card's places (named for the term) | pl:q1535226 | site | dot | wh-154 |
| Nairobi | a card's places (named for the term) | city:1159151597 | capital | dot | gw-526 wh-850 |
| Nanjing | a card's places (named for the term) | city:1159151385 | city | dot | gc-504 wh-712 cnh-285 cnh-292 +20 |
| Naqada | a card's places (named for the term) | pl:q959859 | site | dot | eg-038 eg-029 |
| Naucratis | a card's places (named for the term) | pl:q137721 | site | dot | gr-221 |
| Naxos | a card's places (named for the term) | pl:q188527 | island | dot | gr-930 |
| Nebraska_(state) | a card's places (named for the term) | adm1:usa:us-ne | admin1 | face | geo-047 |
| Nenets_Autonomous_Okrug | a card's places (named for the term) | adm1:rus:ru-nen | admin1 | face | gru-083 |
| Nevada_(state) | a card's places (named for the term) | adm1:usa:us-nv | admin1 | face | geo-015 |
| New_Caledonia | a card's places (named for the term) | adm0:ncl | country | face | gw-180 |
| New_Carthage | a card's places (named for the term) | pl:q2727884 | site | dot | rm-206 rm-457 |
| New_Hampshire | a card's places (named for the term) | adm1:usa:us-nh | admin1 | face | geo-041 |
| New_Jersey | a card's places (named for the term) | adm1:usa:us-nj | admin1 | face | geo-018 |
| New_Mexico | a card's places (named for the term) | adm1:usa:us-nm | admin1 | face | geo-026 |
| Newgrange | a card's places (named for the term) | pl:q339503 | site | dot | wh-143 |
| Nichoria | a card's places (named for the term) | pl:q1595514 | site | dot | gr-118 |
| Nile | a card's places (named for the term) | river:1159121589 | river | dot | eg-002 |
| Nile_Delta | a card's places (named for the term) | reg:1159103505 | region | dot | eg-005 |
| Nineveh | a card's places (named for the term) | city:1159150087 | city | dot | wh-283 |
| Ningxia | a card's places (named for the term) | adm1:chn:cn-nx | admin1 | face | gc-029 |
| Niue | a card's places (named for the term) | adm0:niu | country | face | gw-231 fl-231 fd-231 |
| Nizhny_Novgorod | a card's places (named for the term) | adm1:rus:ru-niz | admin1 | face | gru-513 |
| Norfolk_Island | a card's places (named for the term) | adm0:nfk | country | face | gw-230 fl-230 fd-230 |
| North_Carolina | a card's places (named for the term) | adm1:usa:us-nc | admin1 | face | geo-029 |
| North_Dakota | a card's places (named for the term) | adm1:usa:us-nd | admin1 | face | geo-049 |
| Northern_Mariana_Islands | a card's places (named for the term) | adm0:mnp | country | face | gw-209 fl-209 fd-209 |
| Novosibirsk | a card's places (named for the term) | adm1:rus:ru-nvs | admin1 | face | gru-516 |
| Odeon_of_Pericles | a card's places (named for the term) | pl:q2704249 | site | dot | gr-506 |
| Ohio | a card's places (named for the term) | adm1:usa:us-oh | admin1 | face | geo-020 |
| Oklahoma | a card's places (named for the term) | adm1:usa:us-ok | admin1 | face | geo-010 |
| Olbia | a card's places (named for the term) | pl:q1143233 | site | dot | gr-220 ru-009 |
| Old_Temple_of_Athena | a card's places (named for the term) | pl:q683988 | site | dot | gr-317 |
| Olympia | a card's places (named for the term) | pl:q38888 | site | dot | gr-163 geo-523 gr-342 rm-450 +3 |
| Olympia_(Washington) | a card's places (named for the term) | pl:q38888 | site | dot | gr-163 geo-523 gr-342 rm-450 +3 |
| Omsk | a card's places (named for the term) | adm1:rus:ru-oms | admin1 | face | gru-526 |
| Orchomenos | a card's places (named for the term) | pl:q543895 | town | dot | gr-869 |
| Oregon | a card's places (named for the term) | adm1:usa:us-or | admin1 | face | geo-024 |
| Orenburg | a card's places (named for the term) | adm1:rus:ru-ore | admin1 | face | gru-525 |
| Oryol | a card's places (named for the term) | adm1:rus:ru-orl | admin1 | face | gru-562 |
| Ostia_Antica | a card's places (named for the term) | pl:q1012797 | site | dot | rm-847 rm-065 rm-997 |
| Padua | a card's places (named for the term) | pl:q617 | city | dot | wh-651 |
| Pagan_Kingdom | a card's places (named for the term) | pol:pagan | polity | face | wh-558 |
| Palace_of_Nestor | a card's places (named for the term) | pl:q7263152 | city | dot | gr-068 gr-109 gr-539 gr-964 +1 |
| Palaikastro | a card's places (named for the term) | pl:q941860 | town | dot | gr-040 |
| Palatine_Hill | a card's places (named for the term) | pl:q200642 | hill | dot | rm-049 rm-429 wh-338 |
| Palmyra | a card's places (named for the term) | pl:q5747 | site | dot | rm-769 rm-562 |
| Panama_Canal_Zone | a card's places (named for the term) | pl:q498979 | region | dot | pea-218 |
| Panionion | a card's places (named for the term) — ALSO tagged practice: is it the place or the event? | pl:q1310950 | site | dot | gr-201 |
| Pantheon,_Rome | a card's places (named for the term) | pl:q99309 | site | dot | rm-508 |
| Paris | a card's places (named for the term) | city:1159151613 | capital | dot | gw-523 wh-511 ww2-109 wh-645 +7 |
| Parthenon | a card's places (named for the term) | pl:q10288 | site | dot | wh-325 gr-495 |
| Pennsylvania | a card's places (named for the term) | adm1:usa:us-pa | admin1 | face | geo-030 |
| Penza | a card's places (named for the term) | adm1:rus:ru-pnz | admin1 | face | gru-535 |
| Perachora | a card's places (named for the term) | pl:q2973204 | town | dot | gr-166 |
| Perm_Krai | a card's places (named for the term) | adm1:rus:ru-per | admin1 | face | gru-018 |
| Persepolis | a card's places (named for the term) | pl:q129072 | site | dot | wh-302 gr-725 gr-726 |
| Petras | a card's places (named for the term) | pl:q3901049 | site | dot | gr-041 |
| Phaistos | a card's places (named for the term) | pl:q249707 | site | dot | gr-011 gr-021 |
| Philadelphia | a card's places (named for the term) | city:1159151243 | city | dot | geo-730 wh-753 wh-754 wh-756 |
| Philippi | a card's places (named for the term) | pl:q379652 | site | dot | gr-873 rm-377 |
| Piraeus | a card's places (named for the term) | pl:q58976 | city | dot | gr-487 |
| Pitcairn_Islands | a card's places (named for the term) | adm0:pcn | country | face | gw-233 fl-233 fd-233 |
| Pompeii | a card's places (named for the term) | pl:q43332 | site | dot | wh-365 rm-478 rm-872 rm-976 |
| Pontic-Caspian_steppe | a card's places (named for the term) | reg:1730073981 | region | dot | ru-002 |
| Portus | a card's places (named for the term) | pl:q2037271 | site | dot | rm-848 |
| Potidaea | a card's places (named for the term) | pl:q81248 | site | dot | gr-526 |
| Potosí | a card's places (named for the term) | city:1159144841 | town | dot | wh-671 |
| Poverty_Point | a card's places (named for the term) | pl:q964745 | site | dot | wh-159 us-013 |
| Prague | a card's places (named for the term) | city:1159151359 | capital | dot | gw-588 ww2-122 wh-646 wh-965 |
| Praisos | a card's places (named for the term) | pl:q11942554 | site | dot | gr-054 |
| Primorsky_Krai | a card's places (named for the term) | adm1:rus:ru-pri | admin1 | face | gru-027 |
| Pseira | a card's places (named for the term) | pl:q473606 | island | dot | gr-039 |
| Pskov | a card's places (named for the term) | adm1:rus:ru-psk | admin1 | face | gru-566 |
| Puerto_Rico | a card's places (named for the term) | adm0:pri | country | face | gw-135 fl-135 fd-135 |
| Pyongyang | a card's places (named for the term) | city:1159151303 | capital | dot | gw-556 ko-011 pea-114 pea-115 +3 |
| Pyramid_of_Djoser | a card's places (named for the term) | pl:q192418 | site | dot | eg-093 wh-211 |
| Qaw_el-Kebir | a card's places (named for the term) | pl:q548283 | town | dot | eg-157 |
| Qi_(state) | a card's places (named for the term) | pol:qi | polity | face | cnh-152 |
| Qin_(state) | a card's places (named for the term) | pol:qin | polity | face | cnh-155 |
| Qinghai | a card's places (named for the term) | adm1:chn:cn-qh | admin1 | face | gc-030 |
| Republic_of_Karelia | a card's places (named for the term) | adm1:rus:ru-kr | admin1 | face | gru-071 |
| Republic_of_the_Congo | a card's places (named for the term) | adm0:cog | country | face | gw-113 fl-113 fd-113 |
| Rhode_Island | a card's places (named for the term) | adm1:usa:us-ri | admin1 | face | geo-004 |
| Rome | a card's places (named for the term) | city:1159151593 | capital | dot | gw-525 rm-052 rm-053 rm-058 +65 |
| Ruijin | a card's places (named for the term) | pl:q1025459 | town | dot | cnh-607 |
| Ryazan | a card's places (named for the term) | adm1:rus:ru-rya | admin1 | face | gru-545 |
| Saint_Barthélemy | a card's places (named for the term) | adm0:blm | country | face | gw-224 fl-224 fd-224 |
| Saint_Helena | a card's places (named for the term) | adm0:shn | country | face | gw-227 fl-227 fd-227 |
| Saint_Kitts_and_Nevis | a card's places (named for the term) | adm0:kna | country | face | gw-206 fl-206 fd-206 |
| Saint_Martin | a card's places (named for the term) | adm0:maf | country | face | gw-218 |
| Saint_Petersburg | a card's places (named for the term) | city:1159151291 | city | dot | gru-004 wh-811 |
| Saint_Pierre_and_Miquelon | a card's places (named for the term) | adm0:spm | country | face | gw-226 fl-226 fd-226 |
| Saint_Vincent_and_the_Grenadines | a card's places (named for the term) | adm0:vct | country | face | gw-196 fl-196 fd-196 |
| Sakha_Republic | a card's places (named for the term) | adm1:rus:ru-sa | admin1 | face | gru-047 |
| Sakhalin_Oblast | a card's places (named for the term) | adm1:rus:ru-sak | admin1 | face | gru-075 |
| Salamis | a card's places (named for the term) | pl:q202422 | island | dot | gr-430 gr-950 |
| Salamis_(Cyprus) | a card's places (named for the term) | pl:q202422 | island | dot | gr-430 gr-950 |
| Samara | a card's places (named for the term) | adm1:rus:ru-sam | admin1 | face | gru-512 |
| Samnium | a card's places (named for the term) | pl:q463459 | region | dot | rm-013 |
| Samos | a card's places (named for the term) | pl:q156882 | island | dot | gr-826 |
| San_Marino_(city) | a card's places (named for the term) | adm0:smr | country | face | gw-216 gw-716 fl-216 fd-216 |
| Santo_Domingo | a card's places (named for the term) | city:1159151401 | capital | dot | gw-585 wh-673 |
| Saqqara | a card's places (named for the term) | pl:q192134 | site | dot | eg-066 wh-211 eg-119 eg-128 |
| Sarajevo | a card's places (named for the term) | city:1159151177 | capital | dot | gw-636 wh-873 |
| Sardis | a card's places (named for the term) | pl:q232615 | site | dot | wh-304 gr-395 |
| Sarkel | a card's places (named for the term) | pl:q1068190 | site | dot | ru-049 wh-592 |
| Sarmizegetusa_Regia | a card's places (named for the term) | pl:q739802 | site | dot | rm-496 |
| Satricum | a card's places (named for the term) | pl:q2137162 | site | dot | rm-017 |
| Scyros | a card's places (named for the term) | pl:q208566 | island | dot | gr-457 |
| Selinus | a card's places (named for the term) | pl:q952173 | site | dot | gr-211 |
| Semna_(Nubia) | a card's places (named for the term) | pl:q1485667 | site | dot | eg-194 |
| Sentinum | a card's places (named for the term) | pl:q683244 | site | dot | rm-157 |
| Seoul | a card's places (named for the term) | city:1159151523 | capital | dot | gw-529 ko-010 wh-725 |
| Servian_Wall | a card's places (named for the term) | pl:q281330 | site | dot | rm-072 |
| Shaanxi | a card's places (named for the term) | adm1:chn:cn-sn | admin1 | face | gc-016 |
| Shandong | a card's places (named for the term) | adm1:chn:cn-sd | admin1 | face | gc-002 |
| Shanghai | a card's places (named for the term) | city:1159151605 | city | dot | gc-023 cnh-590 cnh-636 cnh-676 |
| Shanhai_Pass | a card's places (named for the term) | pl:q1048381 | site | dot | cnh-722 |
| Shaoshan | a card's places (named for the term) | pl:q838542 | town | dot | wh-954 |
| Shenzhen | a card's places (named for the term) | city:1159151215 | city | dot | pea-008 wh-990 |
| Sichuan | a card's places (named for the term) | adm1:chn:cn-sc | admin1 | face | gc-005 |
| Sijilmasa | a card's places (named for the term) | pl:q1334331 | site | dot | wh-567 |
| Sint_Maarten | a card's places (named for the term) | adm0:sxm | country | face | gw-210 fl-210 fd-210 |
| Siphnian_Treasury | a card's places (named for the term) | pl:q1754028 | site | dot | gr-344 |
| Skara_Brae | a card's places (named for the term) | pl:q816437 | site | dot | wh-142 |
| Smolensk | a card's places (named for the term) | adm1:rus:ru-smo | admin1 | face | gru-557 |
| Solomon_Islands | a card's places (named for the term) | adm0:slb | country | face | gw-165 fl-165 fd-165 |
| Song_(state) | a card's places (named for the term) | pol:song_state | polity | face | cnh-157 |
| South_Carolina | a card's places (named for the term) | adm1:usa:us-sc | admin1 | face | geo-028 |
| South_Dakota | a card's places (named for the term) | adm1:usa:us-sd | admin1 | face | geo-048 |
| South_Sudan | a card's places (named for the term) | adm0:sds | country | face | gw-081 fl-081 fd-081 |
| Sparta | a card's places (named for the term) | pl:q5690 | site | dot | gr-231 wh-316 gr-854 |
| Sphacteria | a card's places (named for the term) — ALSO tagged battle/event: is it the place or the event? | pl:q1303524 | island | dot | gr-540 |
| Springfield_(Illinois) | a card's places (named for the term) | city:1159146271 | town | dot | geo-521 wh-813 |
| Star_Carr | a card's places (named for the term) — ALSO tagged practice: is it the place or the event? | pl:q2299200 | site | dot | wh-109 |
| Staraya_Ladoga | a card's places (named for the term) | pl:q216794 | town | dot | ru-032 |
| Stavropol_Krai | a card's places (named for the term) | adm1:rus:ru-sta | admin1 | face | gru-014 |
| Stoa_Poikile | a card's places (named for the term) | pl:q936234 | site | dot | gr-515 |
| Stonehenge | a card's places (named for the term) | pl:q39671 | site | dot | wh-139 |
| Strait_of_Hormuz | a card's places (named for the term) | pl:q79883 | strait | dot | gga-161 |
| Susa | a card's places (named for the term) | pl:q180773 | site | dot | gr-724 gr-744 |
| Sybaris | a card's places (named for the term) | pl:q220583 | site | dot | gr-212 |
| Syracuse | a card's places (named for the term) | pl:q13670 | city | dot | gr-208 gr-811 gr-819 gr-821 +1 |
| Taebaek_Mountains | a card's places (named for the term) | pl:q562098 | range | dot | ko-003 |
| Taipei | a card's places (named for the term) | city:1159151567 | capital | dot | gw-560 cnh-627 pea-204 |
| Taiwan_Strait | a card's places (named for the term) | sea:1159116947 | strait | dot | pea-144 |
| Taiyuan | a card's places (named for the term) | city:1159151365 | city | dot | gc-518 cnh-356 cnh-401 cnh-410 |
| Taj_Mahal | a card's places (named for the term) | pl:q9141 | site | dot | wh-703 |
| Tambov | a card's places (named for the term) | adm1:rus:ru-tam | admin1 | face | gru-553 |
| Taras | a card's places (named for the term) | pl:q13498 | city | dot | gr-214 rm-163 rm-169 gr-847 +1 |
| Tarentum | a card's places (named for the term) | pl:q13498 | city | dot | rm-163 rm-169 gr-847 rm-933 +1 |
| Tarquinia | a card's places (named for the term) | pl:q179999 | town | dot | rm-032 rm-066 |
| Tatarstan | a card's places (named for the term) | adm1:rus:ru-ta | admin1 | face | gru-008 |
| Tehran | a card's places (named for the term) | city:1159151551 | capital | dot | gw-517 wh-863 wh-984 |
| Telesterion | a card's places (named for the term) | pl:q1819712 | site | dot | gr-507 |
| Tell_el-Farkha | a card's places (named for the term) | pl:q135678492 | site | dot | eg-081 |
| Tell_es-Sakan | a card's places (named for the term) | pl:q7697545 | site | dot | eg-042 |
| Temple_of_Apollo_Palatinus | a card's places (named for the term) | pl:q1236860 | site | dot | rm-401 |
| Temple_of_Athena_Nike | a card's places (named for the term) | pl:q384813 | site | dot | gr-504 |
| Temple_of_Castor_and_Pollux | a card's places (named for the term) | pl:q380530 | site | dot | rm-894 |
| Temple_of_Jupiter_Optimus_Maximus | a card's places (named for the term) | pl:q586468 | site | dot | rm-075 |
| Temple_of_Saturn | a card's places (named for the term) | pl:q746721 | site | dot | rm-912 rm-118 rm-122 rm-745 |
| Tennessee | a card's places (named for the term) | adm1:usa:us-tn | admin1 | face | geo-034 |
| Tenochtitlan | a card's places (named for the term) | pl:q13695 | city | dot | wh-606 wh-666 |
| Texas | a card's places (named for the term) | adm1:usa:us-tx | admin1 | face | geo-002 |
| The_Bahamas | a card's places (named for the term) | adm0:bhs | country | face | gw-177 fl-177 fd-177 |
| The_Gambia | a card's places (named for the term) | adm0:gmb | country | face | gw-142 fl-142 fd-142 |
| The_Hague | a card's places (named for the term) | city:1159149457 | city | dot | gw-758 gga-072 |
| Thera | a card's places (named for the term) | pl:q129296 | island | dot | wh-264 gr-043 gr-045 |
| Thessaloniki | a card's places (named for the term) | city:1159150955 | town | dot | wh-865 gr-871 gr-862 rm-609 |
| Thessaly | a card's places (named for the term) | pl:q166919 | region | dot | gr-872 |
| Tiananmen_Square | a card's places (named for the term) | pl:q164055 | site | dot | pea-001 cnh-684 |
| Tianjin | a card's places (named for the term) | adm1:chn:cn-tj | admin1 | face | gc-027 |
| Tiber | a card's places (named for the term) | river:1159120541 | river | dot | rm-003 |
| Tiber_Island | a card's places (named for the term) | pl:q545404 | island | dot | rm-921 rm-993 |
| Tibet | a card's places (named for the term) | adm1:chn:cn-xz | admin1 | face | gc-031 |
| Tikal | a card's places (named for the term) | pl:q181172 | site | dot | wh-601 |
| Timbuktu | a card's places (named for the term) | pl:q9427 | city | dot | wh-571 |
| Timgad | a card's places (named for the term) | pl:q459629 | site | dot | rm-527 |
| Tiryns | a card's places (named for the term) | pl:q217379 | site | dot | gr-067 gr-273 |
| Tiwanaku | a card's places (named for the term) | pl:q61750 | site | dot | wh-611 |
| Tomsk | a card's places (named for the term) | adm1:rus:ru-tom | admin1 | face | gru-546 |
| Trajan's_Column | a card's places (named for the term) — ALSO tagged object: is it the place or the event? | pl:q192784 | site | dot | rm-497 |
| Trajan's_Forum | a card's places (named for the term) | pl:q211295 | site | dot | rm-498 |
| Trajan's_Market | a card's places (named for the term) | pl:q478642 | site | dot | rm-499 |
| Treasury_of_Atreus | a card's places (named for the term) | pl:q1262524 | site | dot | gr-065 |
| Troy | a card's places (named for the term) | pl:q22647 | site | dot | gr-102 gr-103 gr-104 gr-106 +4 |
| Tunnel_of_Eupalinos | a card's places (named for the term) — ALSO tagged object: is it the place or the event? | pl:q955894 | site | dot | gr-193 |
| Turks_and_Caicos_Islands | a card's places (named for the term) | adm0:tca | country | face | gw-208 fl-208 fd-208 |
| Tuva | a card's places (named for the term) | adm1:rus:ru-ty | admin1 | face | gru-076 |
| Tver | a card's places (named for the term) | adm1:rus:ru-tve | admin1 | face | gru-536 |
| Tyre | a card's places (named for the term) | pl:q3991738 | site | dot | wh-293 gr-717 rm-727 |
| Tyumen | a card's places (named for the term) | adm1:rus:ru-tyu | admin1 | face | gru-509 |
| Ulyanovsk | a card's places (named for the term) | adm1:rus:ru-uly | admin1 | face | gru-538 |
| Umm_El_Qa'ab | a card's places (named for the term) | pl:q853955 | site | dot | eg-063 eg-039 eg-058 eg-059 +1 |
| United_States_Virgin_Islands | a card's places (named for the term) | adm0:vir | country | face | gw-193 fl-193 fd-193 |
| Ur | a card's places (named for the term) | pl:q5699 | site | dot | wh-180 wh-177 wh-181 wh-186 |
| Urartu | a card's places (named for the term) | pol:urartu | polity | face | wh-296 |
| Uruk | a card's places (named for the term) | pl:q168518 | site | dot | wh-173 |
| Utah | a card's places (named for the term) | adm1:usa:us-ut | admin1 | face | geo-016 |
| Valley_of_the_Kings | a card's places (named for the term) | pl:q133423 | site | dot | wh-227 |
| Varna_necropolis | a card's places (named for the term) | pl:q946052 | site | dot | wh-144 |
| Veii | a card's places (named for the term) | pl:q677935 | site | dot | rm-035 rm-120 rm-177 |
| Venice | a card's places (named for the term) | city:1159150277 | town | dot | wh-536 |
| Vermont | a card's places (named for the term) | adm1:usa:us-vt | admin1 | face | geo-042 |
| Vesuvius | a card's places (named for the term) | pl:q524 | mountain | dot | rm-327 rm-477 |
| Vienna | a card's places (named for the term) | city:1159151563 | capital | dot | gw-598 ww2-116 wh-691 wh-766 |
| Virginia_(state) | a card's places (named for the term) | adm1:usa:us-va | admin1 | face | geo-022 |
| Volgograd | a card's places (named for the term) | adm1:rus:ru-vgg | admin1 | face | gru-519 |
| Vologda | a card's places (named for the term) | adm1:rus:ru-vlg | admin1 | face | gru-540 |
| Voronezh | a card's places (named for the term) | adm1:rus:ru-vor | admin1 | face | gru-522 |
| Vulci | a card's places (named for the term) | pl:q931172 | site | dot | rm-036 |
| Wadi_Hammamat | a card's places (named for the term) | pl:q1479250 | site | dot | eg-088 eg-174 |
| Wadi_Kubbaniya | a card's places (named for the term) | pl:q109535880 | site | dot | eg-012 |
| Wadi_Maghareh | a card's places (named for the term) | pl:q1548813 | site | dot | eg-089 |
| Warsaw | a card's places (named for the term) | city:1159151299 | capital | dot | gw-542 ww2-145 wh-952 |
| Washington_(state) | a card's places (named for the term) | city:1159151573 | capital | dot | geo-023 ww2-131 ww2-132 wh-814 +3 |
| West_Lake | a card's places (named for the term) | pl:q502371 | lake | dot | cnh-449 cnh-393 |
| West_Virginia | a card's places (named for the term) | adm1:usa:us-wv | admin1 | face | geo-013 |
| Western_Desert | a card's places (named for the term) | reg:1159104061 | region | dot | eg-007 |
| Western_Sahara | a card's places (named for the term) | adm0:sah | country | face | gw-171 |
| White_Horse_Temple | a card's places (named for the term) | pl:q1264618 | site | dot | cnh-267 |
| Wisconsin_(state) | a card's places (named for the term) | adm1:usa:us-wi | admin1 | face | geo-031 |
| Wonderwerk_Cave | a card's places (named for the term) | pl:q2543042 | site | dot | wh-030 |
| Wuhan | a card's places (named for the term) | city:1159151367 | city | dot | gc-510 wh-999 |
| Wyoming | a card's places (named for the term) | adm1:usa:us-wy | admin1 | face | geo-044 |
| Xi'an | a card's places (named for the term) | city:1159151363 | city | dot | gc-516 cnh-340 cnh-343 cnh-344 +10 |
| Xinjiang | a card's places (named for the term) | adm1:chn:cn-xj | admin1 | face | gc-021 |
| Xuzhou | a card's places (named for the term) | city:1159149147 | city | dot | cnh-437 cnh-624 cnh-882 |
| Yamalo-Nenets_Autonomous_Okrug | a card's places (named for the term) | adm1:rus:ru-yan | admin1 | face | gru-072 |
| Yan'an | a card's places (named for the term) | pl:q515388 | city | dot | cnh-612 |
| Yaroslavl | a card's places (named for the term) | adm1:rus:ru-yar | admin1 | face | gru-537 |
| Yekaterinburg | a card's places (named for the term) | adm1:rus:ru-sve | admin1 | face | gru-505 |
| Yinchuan | a card's places (named for the term) | city:1159150889 | town | dot | gc-529 cnh-465 cnh-472 |
| Yinxu | a card's places (named for the term) | pl:q464904 | site | dot | wh-247 cnh-069 |
| Yue_(state) | a card's places (named for the term) | pol:yue | polity | face | cnh-158 |
| Yungang_Grottoes | a card's places (named for the term) | pl:q308805 | site | dot | cnh-335 |
| Yunnan | a card's places (named for the term) | adm1:chn:cn-yn | admin1 | face | gc-012 |
| Zabaykalsky_Krai | a card's places (named for the term) | adm1:rus:ru-zab | admin1 | face | gru-051 |
| Zagora | a card's places (named for the term) | pl:q140345 | site | dot | gr-119 |
| Zakros | a card's places (named for the term) | pl:q60218 | site | dot | gr-013 |
| Zhejiang | a card's places (named for the term) | adm1:chn:cn-zj | admin1 | face | gc-008 |
| Zhoukoudian | a card's places (named for the term) | pl:q13659137 | town | dot | wh-026 wh-025 |

### Tier 3 — Automatic from the cards, one glance each (459)

the id is the card's place, not named for the term (the term lies within it: a palace on Crete, a gate of Athens), or two candidates must be told apart (`B?`).

| term | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|
| Abidjan | a card's places (every card of it) | adm0:civ | country | face | gw-755 |
| Abu_Dhabi | a card's places (every card of it) | adm0:are | country | face | gw-586 |
| Abuja | a card's places (every card of it) | adm0:nga | country | face | gw-506 |
| Accra | a card's places (every card of it) | adm0:gha | country | face | gw-547 |
| Adamstown,_Pitcairn_Islands | a card's places (every card of it) | adm0:pcn | country | face | gw-733 |
| Aelia_Capitolina | a card's places (every card of it) | city:1159151203 | capital | dot | rm-512 |
| Albany_(New_York) | a card's places (every card of it) | adm1:usa:us-ny | admin1 | face | geo-511 |
| Albuquerque | a card's places (every card of it) | adm1:usa:us-nm | admin1 | face | geo-726 |
| Algiers | a card's places (every card of it) | adm0:dza | country | face | gw-533 |
| Alofi | a card's places (every card of it) | adm0:niu | country | face | gw-731 |
| Amman | a card's places (every card of it) | adm0:jor | country | face | gw-584 |
| Amphitheatre | a card's places (every card of it) | pl:q43332 | site | dot | rm-872 |
| Amur_Oblast | a card's places (every card of it) | adm1:rus:ru-amu | admin1 | face | gru-059 |
| Anadyr | a card's places (every card of it) | adm1:rus:ru-chu | admin1 | face | gru-582 |
| Anchorage_(Alaska) | a card's places (every card of it) | adm1:usa:us-ak | admin1 | face | geo-705 |
| Ancient_Greek_temple | a card's places (every card of it) | city:1159151545 | capital | dot | gr-968 |
| Ancient_Italy | a card's places (every card of it) | pl:q145694 | region | dot | rm-001 |
| Andorra_la_Vella | a card's places (every card of it) | adm0:and | country | face | gw-699 |
| Ankara | a card's places (every card of it) | adm0:tur | country | face | gw-518 |
| Annapolis | a card's places (every card of it) | adm1:usa:us-md | admin1 | face | geo-514 |
| Antananarivo | a card's places (every card of it) | adm0:mdg | country | face | gw-549 |
| Apia | a card's places (every card of it) | adm0:wsm | country | face | gw-684 |
| Aqua_Appia | a card's places (every card of it) | pl:q1632777 | site | dot | rm-139 |
| Aqua_Claudia | a card's places (every card of it) | pl:q751318 | site | dot | rm-436 |
| Arabia_Petraea | a card's places (every card of it) | pl:q127429784 | site | dot | rm-502 |
| Arkhangelsk_Oblast | a card's places (every card of it) | adm1:rus:ru-ark | admin1 | face | gru-050 |
| Artemis_Orthia | a card's places (every card of it) — ALSO tagged practice: is it the place or the event? | pl:q5690 | site | dot | gr-261 |
| Ashgabat | a card's places (every card of it) | adm0:tkm | country | face | gw-605 |
| Asmara | a card's places (every card of it) | adm0:eri | country | face | gw-632 |
| Astana | a card's places (every card of it) | adm0:kaz | country | face | gw-564 |
| Astrakhan_Oblast | a card's places (every card of it) | adm1:rus:ru-ast | admin1 | face | gru-054 |
| Asukadera | a card's places (every card of it) | pl:q17173672 | town | dot | jp-062 |
| Asunción | a card's places (every card of it) | adm0:pry | country | face | gw-608 |
| Atil | a card's places (every card of it) | pl:q4406882 | site | dot | ru-018 |
| Atlanta | a card's places (every card of it) | adm1:usa:us-ga | admin1 | face | geo-527 |
| Augusta | a card's places (every card of it) | adm1:usa:us-me | admin1 | face | geo-509 |
| Augusta_Emerita | a card's places (every card of it) | pl:q31918813 | city | dot | rm-682 |
| Aurelian_Walls | a card's places (every card of it) | city:1159151593 | capital | dot | rm-564 |
| Austin | a card's places (every card of it) | adm1:usa:us-tx | admin1 | face | geo-502 |
| Avarua | a card's places (every card of it) | adm0:cok | country | face | gw-721 |
| Baku | a card's places (every card of it) | adm0:aze | country | face | gw-595 |
| Baltimore | a card's places (every card of it) | adm1:usa:us-md | admin1 | face | geo-714 |
| Bamako | a card's places (every card of it) | adm0:mli | country | face | gw-558 |
| Bandar_Seri_Begawan | a card's places (every card of it) | adm0:brn | country | face | gw-675 |
| Bangui | a card's places (every card of it) | adm0:caf | country | face | gw-622 |
| Banjul | a card's places (every card of it) | adm0:gmb | country | face | gw-642 |
| Basilica_Aemilia | a card's places (every card of it) | city:1159151593 | capital | dot | rm-984 |
| Basseterre | a card's places (every card of it) | adm0:kna | country | face | gw-706 |
| Baths_of_Caracalla | a card's places (every card of it) | city:1159151593 | capital | dot | rm-546 |
| Baton_Rouge | a card's places (every card of it) | adm1:usa:us-la | admin1 | face | geo-508 |
| Beijing | a card's places — several candidates — city:1159151595 Beijing; adm1:chn:cn-bj Beijing | city:1159151595, adm1:chn:cn-bj, adm0:chn |  |  | gc-026 gw-502 cnh-511 wh-713 +18 |
| Beijing_Ancient_Observatory | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-983 |
| Beirut | a card's places (every card of it) | adm0:lbn | country | face | gw-616 |
| Belgorod_Oblast | a card's places (every card of it) | adm1:rus:ru-bel | admin1 | face | gru-031 |
| Belmopan | a card's places (every card of it) | adm0:blz | country | face | gw-676 |
| Bent_Pyramid | a card's places (every card of it) | pl:q685414 | site | dot | eg-101 |
| Bern | a card's places (every card of it) | adm0:che | country | face | gw-600 |
| Billings_(Montana) | a card's places (every card of it) | adm1:usa:us-mt | admin1 | face | geo-743 |
| Bishkek | a card's places (every card of it) | adm0:kgz | country | face | gw-607 |
| Bismarck_(North_Dakota) | a card's places (every card of it) | adm1:usa:us-nd | admin1 | face | geo-549 |
| Bissau | a card's places (every card of it) | adm0:gnb | country | face | gw-648 |
| Blagoveshchensk | a card's places (every card of it) | adm1:rus:ru-amu | admin1 | face | gru-559 |
| Bloemfontein | a card's places (every card of it) | adm0:zaf | country | face | gw-753 |
| Bogotá | a card's places (every card of it) | adm0:col | country | face | gw-528 |
| Boise | a card's places (every card of it) | adm1:usa:us-id | admin1 | face | geo-512 |
| Boston | a card's places (every card of it) | adm1:usa:us-ma | admin1 | face | geo-519 |
| Brades | a card's places (every card of it) | adm0:msr | country | face | gw-728 |
| Brasília | a card's places (every card of it) | adm0:bra | country | face | gw-507 |
| Bratislava | a card's places (every card of it) | adm0:svk | country | face | gw-620 |
| Brazzaville | a card's places (every card of it) | adm0:cog | country | face | gw-613 |
| Bridgeport_(Connecticut) | a card's places (every card of it) | adm1:usa:us-ct | admin1 | face | geo-740 |
| Bridgewater_Canal | a card's places (every card of it) | pl:q1617033 | town | dot | wh-787 |
| Bryansk_Oblast | a card's places (every card of it) | adm1:rus:ru-bry | admin1 | face | gru-041 |
| Budapest | a card's places (every card of it) | adm0:hun | country | face | gw-597 |
| Bujumbura | a card's places (every card of it) | adm0:bdi | country | face | gw-762 |
| Burlington_(Vermont) | a card's places (every card of it) | adm1:usa:us-vt | admin1 | face | geo-742 |
| Canberra | a card's places (every card of it) | adm0:aus | country | face | gw-554 |
| Cape_Town | a card's places (every card of it) | adm0:zaf | country | face | gw-752 |
| Carson_City | a card's places (every card of it) | adm1:usa:us-nv | admin1 | face | geo-515 |
| Casa_Romuli | a card's places (every card of it) | city:1159151593 | capital | dot | rm-051 |
| Castries | a card's places (every card of it) | adm0:lca | country | face | gw-685 |
| Cemetery_U | a card's places (every card of it) | pl:q853955 | site | dot | eg-039 |
| Changchun | a card's places (every card of it) | adm1:chn:cn-jl | admin1 | face | gc-524 |
| Changsha | a card's places (every card of it) | adm1:chn:cn-hn | admin1 | face | gc-507 |
| Charlotte_(North_Carolina) | a card's places (every card of it) | adm1:usa:us-nc | admin1 | face | geo-729 |
| Charlotte_Amalie | a card's places (every card of it) | adm0:vir | country | face | gw-693 |
| Chelyabinsk_Oblast | a card's places (every card of it) | adm1:rus:ru-che | admin1 | face | gru-010 |
| Cheyenne_(Wyoming) | a card's places (every card of it) | adm1:usa:us-wy | admin1 | face | geo-544 |
| Chișinău | a card's places (every card of it) | adm0:mda | country | face | gw-645 |
| Church_of_the_Intercession_on_the_Nerl | a card's places (every card of it) | pl:q762099 | town | dot | ru-088 |
| Church_of_the_Tithes | a card's places (every card of it) | city:1159151495 | capital | dot | ru-055 |
| Classical_Athens | a card's places (every card of it) | city:1159151545 | capital | dot | wh-317 |
| Cockburn_Town | a card's places (every card of it) | adm0:tca | country | face | gw-708 |
| Colombo | a card's places (every card of it) | adm0:lka | country | face | gw-756 |
| Columbia_(South_Carolina) | a card's places (every card of it) | adm1:usa:us-sc | admin1 | face | geo-528 |
| Columbus_(Ohio) | a card's places (every card of it) | adm1:usa:us-oh | admin1 | face | geo-520 |
| Column_of_Marcus_Aurelius | a card's places (every card of it) | pl:q63785 | site | dot | rm-521 |
| Conakry | a card's places (every card of it) | adm0:gin | country | face | gw-575 |
| Concord | a card's places (every card of it) | adm1:usa:us-nh | admin1 | face | geo-541 |
| Copenhagen | a card's places (every card of it) | adm0:dnk | country | face | gw-615 |
| Cotonou | a card's places (every card of it) | adm0:ben | country | face | gw-759 |
| Crete | a card's places — several candidates — reg:1159102805 Crete; pol:crete Crete | reg:1159102805, pol:crete |  |  | gr-005 gr-006 gr-009 gr-015 +17 |
| Cross-in-square | a card's places (every card of it) | city:1159151495 | capital | dot | ru-087 |
| Cyclades | a card's places — several candidates — pol:cyclades Cyclades; reg:1159102965 Cyclades | pol:cyclades, reg:1159102965 |  |  | gr-002 |
| Dakar | a card's places (every card of it) | adm0:sen | country | face | gw-569 |
| Dar_es_Salaam | a card's places (every card of it) | adm0:tza | country | face | gw-751 |
| Denver | a card's places (every card of it) | adm1:usa:us-co | admin1 | face | geo-545 |
| Des_Moines | a card's places (every card of it) | adm1:usa:us-ia | admin1 | face | geo-550 |
| Destruction_of_Pylos | a card's places (every card of it) — ALSO tagged event: is it the place or the event? | pl:q2047396 | site | dot | gr-109 |
| Detinets | a card's places (every card of it) | pl:q1277545 | site | dot | ru-067 |
| Detroit | a card's places (every card of it) | adm1:usa:us-mi | admin1 | face | geo-707 |
| Dhaka | a card's places (every card of it) | adm0:bgd | country | face | gw-508 |
| Dili | a card's places (every card of it) | adm0:tls | country | face | gw-655 |
| Diocletian's_Palace | a card's places (every card of it) | city:1159140363 | town | dot | rm-575 |
| Dodoma | a card's places (every card of it) | adm0:tza | country | face | gw-522 |
| Doha | a card's places (every card of it) | adm0:qat | country | face | gw-640 |
| Dover | a card's places (every card of it) | adm1:usa:us-de | admin1 | face | geo-539 |
| Drainage_of_Lake_Copais | a card's places (every card of it) — ALSO tagged event: is it the place or the event? | pl:q1234240 | lake | dot | gr-099 |
| Dublin | a card's places (every card of it) | adm0:irl | country | face | gw-621 |
| Dura-Europos_church | a card's places (every card of it) | pl:q464266 | site | dot | rm-928 |
| Dushanbe | a card's places (every card of it) | adm0:tjk | country | face | gw-591 |
| Etruscan_Campania | a card's places (every card of it) | pl:q1438 | region | dot | rm-040 |
| Fargo_(North_Dakota) | a card's places (every card of it) | adm1:usa:us-nd | admin1 | face | geo-749 |
| Founding_of_Alexandria | a card's places (every card of it) — ALSO tagged event: is it the place or the event? | city:1159151349 | city | dot | gr-720 |
| Frankfort | a card's places (every card of it) | adm1:usa:us-ky | admin1 | face | geo-533 |
| Freetown | a card's places (every card of it) | adm0:sle | country | face | gw-601 |
| Funafuti | a card's places (every card of it) | adm0:tuv | country | face | gw-725 |
| Gaborone | a card's places (every card of it) | adm0:bwa | country | face | gw-644 |
| Gallia_Narbonensis | a card's places (every card of it) | pl:q11938382 | site | dot | rm-759 |
| Garden_of_Epicurus | a card's places (every card of it) | city:1159151545 | capital | dot | gr-843 |
| Gatchina | a card's places (every card of it) | adm1:rus:ru-len | admin1 | face | gru-524 |
| Georgetown,_Guyana | a card's places (every card of it) | adm0:guy | country | face | gw-664 |
| Georgia_(state) | a card's places — several candidates — adm1:usa:us-ga Georgia; adm0:geo Georgia | adm1:usa:us-ga, adm0:geo |  |  | geo-027 gw-131 fl-131 fd-131 |
| Germania_Superior | a card's places (every card of it) | pl:q571790 | site | dot | rm-755 |
| Gitega | a card's places (every card of it) | adm0:bdi | country | face | gw-578 |
| Giza_pyramid_complex | a card's places (every card of it) | city:1159146947 | city | dot | eg-105 |
| Giza_West_Field | a card's places (every card of it) | city:1159146947 | city | dot | eg-138 |
| Gothic_architecture | a card's places (every card of it) | pl:q160506 | town | dot | wh-510 |
| Grave_Circle_A | a card's places (every card of it) | pl:q132564 | site | dot | gr-060 |
| Grave_Circle_B | a card's places (every card of it) | pl:q132564 | site | dot | gr-061 |
| Great_Pyramid_of_Giza | a card's places (every card of it) | city:1159146947 | city | dot | wh-212 |
| Grozny | a card's places (every card of it) | adm1:rus:ru-ce | admin1 | face | gru-530 |
| Guatemala_City | a card's places (every card of it) | adm0:gtm | country | face | gw-570 |
| Guiyang | a card's places (every card of it) | adm1:chn:cn-gz | admin1 | face | gc-517 |
| Gustavia | a card's places (every card of it) | adm0:blm | country | face | gw-724 |
| Hagåtña | a card's places (every card of it) | adm0:gum | country | face | gw-686 |
| Haikou | a card's places (every card of it) | adm1:chn:cn-hi | admin1 | face | gc-528 |
| Hanging_Gardens_of_Babylon | a card's places (every card of it) | pl:q5684 | site | dot | wh-288 |
| Hanoi | a card's places (every card of it) | adm0:vnm | country | face | gw-516 |
| Harappa | a card's places (every card of it) | pl:q2418927 | region | dot | wh-232 |
| Harare | a card's places (every card of it) | adm0:zwe | country | face | gw-574 |
| Harbin | a card's places (every card of it) | adm1:chn:cn-hl | admin1 | face | gc-520 |
| Harrisburg | a card's places (every card of it) | adm1:usa:us-pa | admin1 | face | geo-530 |
| Hartford | a card's places (every card of it) | adm1:usa:us-ct | admin1 | face | geo-540 |
| Hattusa | a card's places (every card of it) | pl:q848800 | town | dot | wh-267 |
| Hefei | a card's places (every card of it) | adm1:chn:cn-ah | admin1 | face | gc-509 |
| Heit_el-Ghurab | a card's places (every card of it) | city:1159146947 | city | dot | eg-113 |
| Helena_(Montana) | a card's places (every card of it) | adm1:usa:us-mt | admin1 | face | geo-543 |
| Hohhot | a card's places (every card of it) | adm1:chn:cn-nm | admin1 | face | gc-525 |
| Honiara | a card's places (every card of it) | adm0:slb | country | face | gw-665 |
| Honolulu | a card's places (every card of it) | adm1:usa:us-hi | admin1 | face | geo-506 |
| House_of_the_Vettii | a card's places (every card of it) | pl:q43332 | site | dot | rm-976 |
| Houston | a card's places (every card of it) | adm1:usa:us-tx | admin1 | face | geo-702 |
| Huntsville_(Alabama) | a card's places (every card of it) | adm1:usa:us-al | admin1 | face | geo-737 |
| Indianapolis | a card's places (every card of it) | adm1:usa:us-in | admin1 | face | geo-532 |
| Inebu-hedj | a card's places (every card of it) | pl:q5715 | site | dot | eg-070 |
| Irkutsk_Oblast | a card's places (every card of it) | adm1:rus:ru-irk | admin1 | face | gru-021 |
| Islamabad | a card's places (every card of it) | adm0:pak | country | face | gw-505 |
| Isthmian_wall | a card's places (every card of it) | pl:q215200 | region | dot | gr-101 |
| Italian_city-states | a card's places — several candidates — pol:florence Florence; pol:genoa Genoa; pol:milan Milan; pol:papal_states Papal States; pol:pisa Pisa; pol:savoy Savoy; pol:venice Venice | pol:florence, pol:genoa, pol:milan |  |  | wh-622 |
| Ivanovo_Oblast | a card's places (every card of it) | adm1:rus:ru-iva | admin1 | face | gru-055 |
| Jackson_(Mississippi) | a card's places (every card of it) | adm1:usa:us-ms | admin1 | face | geo-538 |
| Jacksonville_(Florida) | a card's places (every card of it) | adm1:usa:us-fl | admin1 | face | geo-703 |
| Jakarta | a card's places (every card of it) | adm0:idn | country | face | gw-504 |
| Jefferson_City | a card's places (every card of it) | adm1:usa:us-mo | admin1 | face | geo-535 |
| Jiangnan | a card's places (every card of it) | city:1159149145 | city | dot | cnh-806 |
| Jiankang | a card's places (every card of it) | city:1159151385 | city | dot | cnh-314 |
| Juba | a card's places (every card of it) | adm0:sds | country | face | gw-581 |
| Juneau | a card's places (every card of it) | adm1:usa:us-ak | admin1 | face | geo-505 |
| Kaliningrad_Oblast | a card's places (every card of it) | adm1:rus:ru-kgd | admin1 | face | gru-049 |
| Kaluga_Oblast | a card's places (every card of it) | adm1:rus:ru-klu | admin1 | face | gru-048 |
| Kampala | a card's places (every card of it) | adm0:uga | country | face | gw-531 |
| Kansas_City_(Missouri) | a card's places (every card of it) | adm1:usa:us-mo | admin1 | face | geo-735 |
| Kathmandu | a card's places (every card of it) | adm0:npl | country | face | gw-551 |
| Kemerovo_Oblast | a card's places (every card of it) | adm1:rus:ru-kem | admin1 | face | gru-017 |
| Khartoum | a card's places (every card of it) | adm0:sdn | country | face | gw-530 |
| Kingdom_of_Benin | a card's places (every card of it) | city:1159149127 | city | dot | wh-575 |
| Kingstown | a card's places (every card of it) | adm0:vct | country | face | gw-696 |
| Kinshasa | a card's places (every card of it) | adm0:cod | country | face | gw-515 |
| Kirov_Oblast | a card's places (every card of it) | adm1:rus:ru-kir | admin1 | face | gru-042 |
| Kostroma_Oblast | a card's places (every card of it) | adm1:rus:ru-kos | admin1 | face | gru-068 |
| Kuala_Lumpur | a card's places (every card of it) | adm0:mys | country | face | gw-544 |
| Kunming | a card's places (every card of it) | adm1:chn:cn-yn | admin1 | face | gc-512 |
| Kurgan_Oblast | a card's places (every card of it) | adm1:rus:ru-kgn | admin1 | face | gru-060 |
| Kursk_Oblast | a card's places (every card of it) | adm1:rus:ru-krs | admin1 | face | gru-044 |
| Kuwait_City | a card's places (every card of it) | adm0:kwt | country | face | gw-628 |
| Kyzyl | a card's places (every card of it) | adm1:rus:ru-ty | admin1 | face | gru-576 |
| La_Paz | a card's places (every card of it) | adm0:bol | country | face | gw-760 |
| Labyrinth_of_Egypt | a card's places (every card of it) | pl:q26237 | site | dot | eg-197 |
| Lake_Moeris | a card's places (every card of it) | city:1159149857 | town | dot | eg-185 |
| Lansing | a card's places (every card of it) | adm1:usa:us-mi | admin1 | face | geo-507 |
| Lanzhou | a card's places (every card of it) | adm1:chn:cn-gs | admin1 | face | gc-522 |
| Las_Vegas | a card's places (every card of it) | adm1:usa:us-nv | admin1 | face | geo-715 |
| Legionary_fortress | a card's places (every card of it) | pl:q532466 | site | dot | rm-667 |
| Leningrad_Oblast | a card's places (every card of it) | adm1:rus:ru-len | admin1 | face | gru-024 |
| Libreville | a card's places (every card of it) | adm0:gab | country | face | gw-643 |
| Lighthouse_of_Alexandria | a card's places (every card of it) | pl:q2696558 | island | dot | gr-804 |
| Lilongwe | a card's places (every card of it) | adm0:mwi | country | face | gw-562 |
| Lincoln_(Nebraska) | a card's places (every card of it) | adm1:usa:us-ne | admin1 | face | geo-547 |
| Lipetsk_Oblast | a card's places (every card of it) | adm1:rus:ru-lip | admin1 | face | gru-043 |
| Little_Rock | a card's places (every card of it) | adm1:usa:us-ar | admin1 | face | geo-536 |
| Ljubljana | a card's places (every card of it) | adm0:svn | country | face | gw-649 |
| Lobamba | a card's places (every card of it) | adm0:swz | country | face | gw-761 |
| Lomé | a card's places (every card of it) | adm0:tgo | country | face | gw-602 |
| Los_Angeles | a card's places (every card of it) | adm1:usa:us-ca | admin1 | face | geo-701 |
| Louisville_(Kentucky) | a card's places (every card of it) | adm1:usa:us-ky | admin1 | face | geo-733 |
| Lower_city_of_Troy | a card's places (every card of it) | pl:q22647 | site | dot | gr-104 |
| Luanda | a card's places (every card of it) | adm0:ago | country | face | gw-540 |
| Lusaka | a card's places (every card of it) | adm0:zmb | country | face | gw-563 |
| Madison | a card's places (every card of it) | adm1:usa:us-wi | admin1 | face | geo-531 |
| Magadan_Oblast | a card's places (every card of it) | adm1:rus:ru-mag | admin1 | face | gru-081 |
| Magas | a card's places (every card of it) | adm1:rus:ru-in | admin1 | face | gru-569 |
| Maginot_Line | a card's places (every card of it) | pl:q22640 | town | dot | ww2-134 |
| Maison_Carrée | a card's places (every card of it) | pl:q42807 | city | dot | rm-979 |
| Majuro | a card's places (every card of it) | adm0:mhl | country | face | gw-715 |
| Makhachkala | a card's places (every card of it) | adm1:rus:ru-da | admin1 | face | gru-511 |
| Malabo | a card's places (every card of it) | adm0:gnq | country | face | gw-650 |
| Malé | a card's places (every card of it) | adm0:mdv | country | face | gw-673 |
| Managua | a card's places (every card of it) | adm0:nic | country | face | gw-609 |
| Manama | a card's places (every card of it) | adm0:bhr | country | face | gw-654 |
| Maputo | a card's places (every card of it) | adm0:moz | country | face | gw-546 |
| Mariehamn | a card's places (every card of it) | adm0:ald | country | face | gw-717 |
| Marigot,_Saint_Martin | a card's places (every card of it) | adm0:maf | country | face | gw-718 |
| Maseru | a card's places (every card of it) | adm0:lso | country | face | gw-647 |
| Mata-Utu | a card's places (every card of it) | adm0:wlf | country | face | gw-723 |
| Maykop | a card's places (every card of it) | adm1:rus:ru-ad | admin1 | face | gru-573 |
| Mbabane | a card's places (every card of it) | adm0:swz | country | face | gw-660 |
| Memorial_Hall_of_the_Victims_in_Nanjing_Massacre_by_Japanese_Invaders | a card's places (every card of it) | city:1159151385 | city | dot | cnh-655 |
| Milliarium_Aureum | a card's places (every card of it) | pl:q180212 | site | dot | rm-991 |
| Milwaukee | a card's places (every card of it) | adm1:usa:us-wi | admin1 | face | geo-731 |
| Minneapolis | a card's places (every card of it) | adm1:usa:us-mn | admin1 | face | geo-717 |
| Minoan_Kythera | a card's places (every card of it) | pl:q114571906 | site | dot | gr-049 |
| Minoan_palace | a card's places (every card of it) | reg:1159102805 | island | dot | gr-009 |
| Minoan_road | a card's places (every card of it) | reg:1159102805 | island | dot | gr-036 |
| Minoan_water_management | a card's places (every card of it) | reg:1159102805 | island | dot | gr-037 |
| MMA_507 | a card's places (every card of it) | pl:q373909 | site | dot | eg-158 |
| Mogadishu | a card's places (every card of it) | adm0:som | country | face | gw-568 |
| Monrovia | a card's places (every card of it) | adm0:lbr | country | face | gw-618 |
| Montevideo | a card's places (every card of it) | adm0:ury | country | face | gw-634 |
| Montgomery_(Alabama) | a card's places (every card of it) | adm1:usa:us-al | admin1 | face | geo-537 |
| Montpelier | a card's places (every card of it) | adm1:usa:us-vt | admin1 | face | geo-542 |
| Moroni | a card's places (every card of it) | adm0:com | country | face | gw-663 |
| Murmansk_Oblast | a card's places (every card of it) | adm1:rus:ru-mur | admin1 | face | gru-065 |
| Muscat | a card's places (every card of it) | adm0:omn | country | face | gw-625 |
| Mycenaean_Knossos | a card's places (every card of it) | pl:q173527 | site | dot | gr-051 |
| Mycenaean_Miletus | a card's places (every card of it) | pl:q169460 | site | dot | gr-098 |
| N'Djamena | a card's places (every card of it) | adm0:tcd | country | face | gw-565 |
| Nalchik | a card's places (every card of it) | adm1:rus:ru-kb | admin1 | face | gru-556 |
| Nanchang | a card's places (every card of it) | adm1:chn:cn-jx | admin1 | face | gc-513 |
| Nanning | a card's places (every card of it) | adm1:chn:cn-gx | admin1 | face | gc-511 |
| Naryan-Mar | a card's places (every card of it) | adm1:rus:ru-nen | admin1 | face | gru-583 |
| Nashville | a card's places (every card of it) | adm1:usa:us-tn | admin1 | face | geo-534 |
| Nassau | a card's places (every card of it) | adm0:bhs | country | face | gw-677 |
| Naypyidaw | a card's places (every card of it) | adm0:mmr | country | face | gw-527 |
| New_Delhi | a card's places (every card of it) | adm0:ind | country | face | gw-501 |
| New_France | a card's places (every card of it) | city:1159151065 | town | dot | wh-681 |
| New_Orleans | a card's places (every card of it) | adm1:usa:us-la | admin1 | face | geo-708 |
| New_York_(state) | a card's places — several candidates — adm1:usa:us-ny New York; city:1159151575 New York City | adm1:usa:us-ny, city:1159151575 |  |  | geo-011 wh-907 |
| New_York_City | a card's places (every card of it) | adm1:usa:us-ny | admin1 | face | geo-711 |
| Newark_(New_Jersey) | a card's places (every card of it) | adm1:usa:us-nj | admin1 | face | geo-718 |
| Ngerulmud | a card's places (every card of it) | adm0:plw | country | face | gw-720 |
| Niamey | a card's places (every card of it) | adm0:ner | country | face | gw-555 |
| Nicosia | a card's places — several candidates — adm0:cnm Cyprus No Mans Area; adm0:cyn Northern Cyprus; adm0:cyp Cyprus | adm0:cnm, adm0:cyn, adm0:cyp |  |  | gw-658 |
| Nizhny_Novgorod_Oblast | a card's places (every card of it) | adm1:rus:ru-niz | admin1 | face | gru-013 |
| Nouakchott | a card's places (every card of it) | adm0:mrt | country | face | gw-626 |
| Nouméa | a card's places (every card of it) | adm0:ncl | country | face | gw-680 |
| Novgorod_Oblast | a card's places (every card of it) | adm1:rus:ru-ngr | admin1 | face | gru-067 |
| Novosibirsk_Oblast | a card's places (every card of it) | adm1:rus:ru-nvs | admin1 | face | gru-016 |
| Nubia | a card's places (every card of it) | pl:q1107569 | site | dot | wh-229 |
| Nuku'alofa | a card's places (every card of it) | adm0:ton | country | face | gw-694 |
| Nuuk | a card's places (every card of it) | adm0:grl | country | face | gw-704 |
| Oklahoma_City | a card's places (every card of it) | adm1:usa:us-ok | admin1 | face | geo-510 |
| Old_St._Peter's_Basilica | a card's places (every card of it) | pl:q1053000 | hill | dot | rm-593 |
| Omaha | a card's places (every card of it) | adm1:usa:us-ne | admin1 | face | geo-747 |
| Omsk_Oblast | a card's places (every card of it) | adm1:rus:ru-oms | admin1 | face | gru-026 |
| Oracle_of_Ammon | a card's places (every card of it) | pl:q2008735 | region | dot | gr-721 |
| Oranjestad | a card's places (every card of it) | adm0:abw | country | face | gw-692 |
| Orenburg_Oblast | a card's places (every card of it) | adm1:rus:ru-ore | admin1 | face | gru-025 |
| Oryol_Oblast | a card's places (every card of it) | adm1:rus:ru-orl | admin1 | face | gru-062 |
| Oslo | a card's places (every card of it) | adm0:nor | country | face | gw-619 |
| Ottawa | a card's places (every card of it) | adm0:can | country | face | gw-537 |
| Ouagadougou | a card's places (every card of it) | adm0:bfa | country | face | gw-559 |
| Pago_Pago | a card's places (every card of it) | adm0:asm | country | face | gw-707 |
| Pagoda_of_Fogong_Temple | a card's places (every card of it) | pl:q1197322 | region | dot | cnh-418 |
| Palikir | a card's places (every card of it) | adm0:fsm | country | face | gw-691 |
| Panama_City | a card's places (every card of it) | adm0:pan | country | face | gw-629 |
| Papeete | a card's places (every card of it) | adm0:pyf | country | face | gw-682 |
| Paramaribo | a card's places (every card of it) | adm0:sur | country | face | gw-669 |
| Penza_Oblast | a card's places (every card of it) | adm1:rus:ru-pnz | admin1 | face | gru-035 |
| Pereyaslavets | a card's places (every card of it) | pl:q182428 | city | dot | ru-050 |
| Perm | a card's places (every card of it) | adm1:rus:ru-per | admin1 | face | gru-518 |
| Petropavlovsk-Kamchatsky | a card's places (every card of it) | adm1:rus:ru-kam | admin1 | face | gru-577 |
| Petrozavodsk | a card's places (every card of it) | adm1:rus:ru-kr | admin1 | face | gru-571 |
| Philipsburg | a card's places (every card of it) | adm0:sxm | country | face | gw-710 |
| Phnom_Penh | a card's places (every card of it) | adm0:khm | country | face | gw-573 |
| Phoenicia | a card's places (every card of it) | pl:q3991738 | site | dot | wh-293 |
| Phoenix_(Arizona) | a card's places (every card of it) | adm1:usa:us-az | admin1 | face | geo-525 |
| Pierre_(South_Dakota) | a card's places (every card of it) | adm1:usa:us-sd | admin1 | face | geo-548 |
| Podgorica | a card's places (every card of it) | adm0:mne | country | face | gw-670 |
| Pomerium | a card's places (every card of it) | city:1159151593 | capital | dot | rm-087 |
| Pons_Fabricius | a card's places (every card of it) | pl:q545404 | island | dot | rm-993 |
| Pont_du_Gard | a card's places (every card of it) | pl:q379644 | town | dot | rm-989 |
| Port_Louis | a card's places (every card of it) | adm0:mus | country | face | gw-659 |
| Port_Moresby | a card's places (every card of it) | adm0:png | country | face | gw-592 |
| Port_Vila | a card's places (every card of it) | adm0:vut | country | face | gw-679 |
| Port-au-Prince | a card's places (every card of it) | adm0:hti | country | face | gw-583 |
| Port-of-Spain | a card's places (every card of it) | adm0:tto | country | face | gw-657 |
| Porto-Novo | a card's places (every card of it) | adm0:ben | country | face | gw-576 |
| Praia | a card's places (every card of it) | adm0:cpv | country | face | gw-674 |
| Pretoria | a card's places (every card of it) | adm0:zaf | country | face | gw-524 |
| Pristina | a card's places (every card of it) | adm0:kos | country | face | gw-653 |
| Protectorate_of_Bohemia_and_Moravia | a card's places (every card of it) | city:1159151359 | capital | dot | ww2-122 |
| Providence | a card's places (every card of it) | adm1:usa:us-ri | admin1 | face | geo-504 |
| Pskov_Oblast | a card's places (every card of it) | adm1:rus:ru-psk | admin1 | face | gru-066 |
| Putrajaya | a card's places (every card of it) | adm0:mys | country | face | gw-754 |
| Pyramid_of_Khafre | a card's places (every card of it) | city:1159146947 | city | dot | eg-109 |
| Pyramid_of_Menkaure | a card's places (every card of it) | city:1159146947 | city | dot | eg-112 |
| Quito | a card's places (every card of it) | adm0:ecu | country | face | gw-571 |
| Rabat | a card's places (every card of it) | adm0:mar | country | face | gw-539 |
| Raleigh | a card's places (every card of it) | adm1:usa:us-nc | admin1 | face | geo-529 |
| Red_Pyramid | a card's places (every card of it) | pl:q685414 | site | dot | eg-102 |
| Reykjavík | a card's places (every card of it) | adm0:isl | country | face | gw-678 |
| Rhodes | a card's places — several candidates — pl:q188731 Rhodes (city); reg:1159102803 Rhodes | pl:q188731, reg:1159102803 |  |  | gr-763 gr-764 gr-809 gr-831 |
| Richmond | a card's places (every card of it) | adm1:usa:us-va | admin1 | face | geo-522 |
| Riga | a card's places (every card of it) | adm0:lva | country | face | gw-651 |
| Riyadh | a card's places (every card of it) | adm0:sau | country | face | gw-545 |
| Road_Town | a card's places (every card of it) | adm0:vgb | country | face | gw-712 |
| Roman_Dacia | a card's places (every card of it) | pl:q12725121 | town | dot | rm-777 |
| Roseau | a card's places (every card of it) | adm0:dma | country | face | gw-702 |
| Rostov_Oblast | a card's places (every card of it) | adm1:rus:ru-ros | admin1 | face | gru-006 |
| Rostov-on-Don | a card's places (every card of it) | adm1:rus:ru-ros | admin1 | face | gru-506 |
| Ryazan_Oblast | a card's places (every card of it) | adm1:rus:ru-rya | admin1 | face | gru-045 |
| Sacramento | a card's places (every card of it) | adm1:usa:us-ca | admin1 | face | geo-501 |
| Saint_George's | a card's places (every card of it) | adm0:grd | country | face | gw-690 |
| Saint_John's | a card's places (every card of it) | adm0:atg | country | face | gw-697 |
| Saint_Peter_Port | a card's places (every card of it) | adm0:ggy | country | face | gw-701 |
| Saint_Sophia_Cathedral,_Kyiv | a card's places (every card of it) | city:1159151495 | capital | dot | ru-059 |
| Saint-Pierre,_Saint_Pierre_and_Miquelon | a card's places (every card of it) | adm0:spm | country | face | gw-726 |
| Salekhard | a card's places (every card of it) | adm1:rus:ru-yan | admin1 | face | gru-572 |
| Salem | a card's places (every card of it) | adm1:usa:us-or | admin1 | face | geo-524 |
| Salt_Lake_City | a card's places (every card of it) | adm1:usa:us-ut | admin1 | face | geo-516 |
| Samara_Oblast | a card's places (every card of it) | adm1:rus:ru-sam | admin1 | face | gru-012 |
| San_José | a card's places (every card of it) | adm0:cri | country | face | gw-627 |
| San_Juan | a card's places (every card of it) | adm0:pri | country | face | gw-635 |
| San_Salvador | a card's places (every card of it) | adm0:slv | country | face | gw-612 |
| Sana'a | a card's places (every card of it) | adm0:yem | country | face | gw-538 |
| Santa_Fe | a card's places (every card of it) | adm1:usa:us-nm | admin1 | face | geo-526 |
| Santiago | a card's places (every card of it) | adm0:chl | country | face | gw-566 |
| São_Tomé | a card's places (every card of it) | adm0:stp | country | face | gw-683 |
| Saransk | a card's places (every card of it) | adm1:rus:ru-mo | admin1 | face | gru-558 |
| Saratov | a card's places — several candidates — adm1:rus:ru-sar Saratov; city:1159149575 Saratov | adm1:rus:ru-sar, city:1159149575 |  |  | gru-520 ww2-158 |
| Saratov_Oblast | a card's places (every card of it) | adm1:rus:ru-sar | admin1 | face | gru-020 |
| Second_Temple | a card's places (every card of it) | pl:q193163 | hill | dot | rm-470 |
| Seven_Hills_of_Rome | a card's places (every card of it) | city:1159151593 | capital | dot | rm-048 |
| Shenyang | a card's places (every card of it) | adm1:chn:cn-ln | admin1 | face | gc-514 |
| Shijiazhuang | a card's places (every card of it) | adm1:chn:cn-he | admin1 | face | gc-506 |
| Sioux_Falls | a card's places (every card of it) | adm1:usa:us-sd | admin1 | face | geo-748 |
| Sixteen_Prefectures | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-400 |
| Skopje | a card's places (every card of it) | adm0:mkd | country | face | gw-652 |
| Smolensk_Oblast | a card's places (every card of it) | adm1:rus:ru-smo | admin1 | face | gru-057 |
| Sofia | a card's places (every card of it) | adm0:bgr | country | face | gw-611 |
| Solarium_Augusti | a card's places (every card of it) | pl:q242839 | region | dot | rm-841 |
| Sri_Jayawardenepura_Kotte | a card's places (every card of it) | adm0:lka | country | face | gw-561 |
| St._Paul | a card's places (every card of it) | adm1:usa:us-mn | admin1 | face | geo-517 |
| Stanley,_Falkland_Islands | a card's places (every card of it) | adm0:flk | country | face | gw-729 |
| Stavropol | a card's places (every card of it) | adm1:rus:ru-sta | admin1 | face | gru-514 |
| Stockholm | a card's places (every card of it) | adm0:swe | country | face | gw-593 |
| Sucre | a card's places (every card of it) | adm0:bol | country | face | gw-579 |
| Sudetenland | a card's places (every card of it) | pl:q384544 | city | dot | ww2-117 |
| Suez_Canal | a card's places (every card of it) | city:1159149855 | town | dot | wh-800 |
| Sugar_plantations_in_the_Caribbean | a card's places (every card of it) | city:1159150339 | capital | dot | wh-730 |
| Sui_long_walls | a card's places (every card of it) | pl:q515712 | city | dot | cnh-352 |
| Suva | a card's places (every card of it) | adm0:fji | country | face | gw-662 |
| Sverdlovsk_Oblast | a card's places (every card of it) | adm1:rus:ru-sve | admin1 | face | gru-005 |
| Swahili_coast | a card's places (every card of it) | city:1159150829 | town | dot | wh-577 |
| Syktyvkar | a card's places (every card of it) | adm1:rus:ru-ko | admin1 | face | gru-561 |
| Tallahassee | a card's places (every card of it) | adm1:usa:us-fl | admin1 | face | geo-503 |
| Tallinn | a card's places (every card of it) | adm0:est | country | face | gw-656 |
| Tambov_Oblast | a card's places (every card of it) | adm1:rus:ru-tam | admin1 | face | gru-053 |
| Tarawa | a card's places (every card of it) | adm0:kir | country | face | gw-688 |
| Tashkent | a card's places (every card of it) | adm0:uzb | country | face | gw-543 |
| Tbilisi | a card's places (every card of it) | adm0:geo | country | face | gw-631 |
| Tegucigalpa | a card's places (every card of it) | adm0:hnd | country | face | gw-589 |
| Temple_of_Hera,_Olympia | a card's places (every card of it) | pl:q38888 | site | dot | gr-342 |
| The_Valley,_Anguilla | a card's places (every card of it) | adm0:aia | country | face | gw-719 |
| Theatre_of_Pompey | a card's places (every card of it) | pl:q242839 | region | dot | rm-880 |
| Thimphu | a card's places (every card of it) | adm0:btn | country | face | gw-666 |
| Throne_Room_at_Knossos | a card's places (every card of it) | pl:q173527 | site | dot | gr-010 |
| Tianyi_Pavilion | a card's places (every card of it) | city:1159149925 | city | dot | cnh-938 |
| Tirana | a card's places (every card of it) | adm0:alb | country | face | gw-646 |
| Tokyo | a card's places (every card of it) | adm0:jpn | country | face | gw-512 |
| Tomb_of_Eurysaces_the_Baker | a card's places (every card of it) | pl:q751318 | site | dot | rm-971 |
| Tomsk_Oblast | a card's places (every card of it) | adm1:rus:ru-tom | admin1 | face | gru-046 |
| Topeka | a card's places (every card of it) | adm1:usa:us-ks | admin1 | face | geo-546 |
| Tórshavn | a card's places (every card of it) | adm0:fro | country | face | gw-705 |
| Toumba_building | a card's places (every card of it) | pl:q634655 | site | dot | gr-117 |
| Treasuries_at_Delphi | a card's places (every card of it) | pl:q75459 | site | dot | gr-345 |
| Trenton | a card's places (every card of it) | adm1:usa:us-nj | admin1 | face | geo-518 |
| Tripoli | a card's places (every card of it) | adm0:lby | country | face | gw-606 |
| Troy_VIIa | a card's places (every card of it) | pl:q22647 | site | dot | gr-103 |
| Tula_Oblast | a card's places (every card of it) | adm1:rus:ru-tul | admin1 | face | gru-032 |
| Tula,_Russia | a card's places — several candidates — adm1:rus:ru-tul Tula; pl:q1353133 Tula de Allende, Hidalgo | adm1:rus:ru-tul, pl:q1353133 |  |  | gru-532 wh-604 |
| Tunis | a card's places (every card of it) | adm0:tun | country | face | gw-580 |
| Tver_Oblast | a card's places (every card of it) | adm1:rus:ru-tve | admin1 | face | gru-036 |
| Tyumen_Oblast | a card's places (every card of it) | adm1:rus:ru-tyu | admin1 | face | gru-009 |
| Ufa | a card's places (every card of it) | adm1:rus:ru-ba | admin1 | face | gru-507 |
| Uganda_Railway | a card's places (every card of it) | city:1159151597 | capital | dot | wh-850 |
| Ulaanbaatar | a card's places (every card of it) | adm0:mng | country | face | gw-633 |
| Ulyanovsk_Oblast | a card's places (every card of it) | adm1:rus:ru-uly | admin1 | face | gru-038 |
| Ürümqi | a card's places (every card of it) | adm1:chn:cn-xj | admin1 | face | gc-521 |
| Vaduz | a card's places (every card of it) | adm0:lie | country | face | gw-711 |
| Valletta | a card's places (every card of it) | adm0:mlt | country | face | gw-672 |
| Valparaíso | a card's places (every card of it) | adm0:chl | country | face | gw-757 |
| Veliky_Novgorod | a card's places — several candidates — city:1159146503 Veliky Novgorod; adm1:rus:ru-ngr Novgorod | city:1159146503, adm1:rus:ru-ngr |  |  | gru-567 ru-040 ru-058 ru-065 +1 |
| Via_Domiziana | a card's places (every card of it) | pl:q1349926 | site | dot | rm-992 |
| Via_Egnatia | a card's places (every card of it) | city:1159150955 | town | dot | gr-862 |
| Via_Flaminia | a card's places (every card of it) | city:1159151593 | capital | dot | rm-173 |
| Vientiane | a card's places (every card of it) | adm0:lao | country | face | gw-603 |
| Villa_Romana_del_Casale | a card's places (every card of it) | pl:q56208 | town | dot | rm-978 |
| Vilnius | a card's places (every card of it) | adm0:ltu | country | face | gw-639 |
| Vinland | a card's places (every card of it) | pl:q189113 | site | dot | wh-501 |
| Virginia_Beach | a card's places (every card of it) | adm1:usa:us-va | admin1 | face | geo-722 |
| Vladimir_Oblast | a card's places (every card of it) | adm1:rus:ru-vla | admin1 | face | gru-033 |
| Vladivostok | a card's places (every card of it) | adm1:rus:ru-pri | admin1 | face | gru-527 |
| Volgograd_Oblast | a card's places (every card of it) | adm1:rus:ru-vgg | admin1 | face | gru-019 |
| Vologda_Oblast | a card's places (every card of it) | adm1:rus:ru-vlg | admin1 | face | gru-040 |
| Voronezh_Oblast | a card's places (every card of it) | adm1:rus:ru-vor | admin1 | face | gru-022 |
| Washington,_D.C. | a card's places (every card of it) | adm0:usa | country | face | gw-503 |
| Weiyang_Palace | a card's places (every card of it) | pl:q6501000 | site | dot | cnh-242 |
| Wellington | a card's places (every card of it) | adm0:nzl | country | face | gw-623 |
| West_Market_(Chang'an) | a card's places (every card of it) | city:1159151363 | city | dot | cnh-368 |
| White_Chapel | a card's places (every card of it) | pl:q522862 | site | dot | eg-182 |
| Wichita | a card's places (every card of it) | adm1:usa:us-ks | admin1 | face | geo-746 |
| Willemstad | a card's places (every card of it) | adm0:cuw | country | face | gw-687 |
| Wilmington_(Delaware) | a card's places (every card of it) | adm1:usa:us-de | admin1 | face | geo-739 |
| Wilusa | a card's places (every card of it) | pl:q22647 | site | dot | gr-106 |
| Windhoek | a card's places (every card of it) | adm0:nam | country | face | gw-638 |
| Xining | a card's places (every card of it) | adm1:chn:cn-qh | admin1 | face | gc-530 |
| Yakutsk | a card's places (every card of it) | adm1:rus:ru-sa | admin1 | face | gru-547 |
| Yamoussoukro | a card's places (every card of it) | adm0:civ | country | face | gw-550 |
| Yaoundé | a card's places (every card of it) | adm0:cmr | country | face | gw-552 |
| Yaren | a card's places (every card of it) | adm0:nru | country | face | gw-722 |
| Yaroslavl_Oblast | a card's places (every card of it) | adm1:rus:ru-yar | admin1 | face | gru-037 |
| Yerevan | a card's places (every card of it) | adm0:arm | country | face | gw-637 |
| Yugra | a card's places (every card of it) | adm1:rus:ru-khm | admin1 | face | ru-078 |
| Yuzhno-Sakhalinsk | a card's places (every card of it) | adm1:rus:ru-sak | admin1 | face | gru-575 |
| Zagreb | a card's places (every card of it) | adm0:hrv | country | face | gw-630 |
| Zhengzhou | a card's places (every card of it) | adm1:chn:cn-ha | admin1 | face | gc-503 |
| Ziggurat | a card's places (every card of it) | pl:q5699 | site | dot | wh-177 |

### Tier 4 — A coordinate, no registry id (107)

a card answered by this term, or whose locator is named for it, has a `locator.at`; the window can draw the dot today, a registry id needs `migrate-places.js`.

| term | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|
| 'Ain_Ghazal | a card's locator coordinate — wh-126 | 35.976,31.988 | coordinate | dot | wh-126 |
| Akrotiri | a card's locator coordinate — gr-042 gr-044 | 25.4036,36.3514 | coordinate | dot | gr-042 gr-044 |
| Al_Mina | a card's locator coordinate — gr-149 | 35.9871,36.0804 | coordinate | dot | gr-149 |
| Al-Azhar | a card's locator coordinate — wh-479 — ALSO tagged institution: is it the place or the event? | 31.2627,30.0457 | coordinate | dot | wh-479 |
| Ancient_Agora_of_Athens | a card's locator coordinate — gr-514 gr-1000 | 23.7225,37.975 | coordinate | dot | gr-514 gr-1000 |
| Antonine_Wall | a card's locator coordinate — rm-514 | -3.856,55.9978 | coordinate | dot | rm-514 |
| Arch_of_Septimius_Severus | a card's locator coordinate — rm-986 | 12.4847,41.8928 | coordinate | dot | rm-986 |
| Archbasilica_of_Saint_John_Lateran | a card's locator coordinate — rm-592 | 12.5062,41.8859 | coordinate | dot | rm-592 |
| Artemision_at_Ephesus | a card's locator coordinate — gr-202 | 27.3639,37.9497 | coordinate | dot | gr-202 |
| Asia | a card's locator coordinate — rm-258 | 27.1842,39.1325 | coordinate | dot | rm-258 |
| Ayia_Triada | a card's locator coordinate — gr-033 | 24.7925,35.0589 | coordinate | dot | gr-033 |
| Barbegal_aqueduct_and_mills | a card's locator coordinate — rm-998 — ALSO tagged industry: is it the place or the event? | 4.7214,43.7025 | coordinate | dot | rm-998 |
| Belitung_shipwreck | a card's locator coordinate — cnh-817 | 107.9167,-2.8333 | coordinate | dot | cnh-817 |
| Bithynia_and_Pontus | a card's locator coordinate — rm-774 | 29.9175,40.7625 | coordinate | dot | rm-774 |
| Castellum_aquae | a card's locator coordinate — rm-839 | 14.4861,40.75 | coordinate | dot | rm-839 |
| Chen_Clan_Ancestral_Hall | a card's locator coordinate — cnh-757 | 113.2405,23.1298 | coordinate | dot | cnh-757 |
| Circus_of_Maxentius | a card's locator coordinate — rm-877 | 12.5207,41.8548 | coordinate | dot | rm-877 |
| City_Wall_of_Nanjing | a card's locator coordinate — cnh-767 | 118.7765,32.0147 | coordinate | dot | cnh-767 |
| Column_of_Antoninus_Pius | a card's locator coordinate — rm-987 | 12.4761,41.9017 | coordinate | dot | rm-987 |
| Danubian_Limes | a card's locator coordinate — rm-754 | 16.8614,48.1133 | coordinate | dot | rm-754 |
| Dazu_Rock_Carvings | a card's locator coordinate — cnh-892 | 105.7167,29.7 | coordinate | dot | cnh-892 |
| Egesta | a card's locator coordinate — gr-553 | 12.8322,37.9414 | coordinate | dot | gr-553 |
| Eridu | a card's locator coordinate — wh-178 | 45.9961,30.8158 | coordinate | dot | wh-178 |
| Etruscan_cities | a card's locator coordinate — rm-024 | 11.8389,42.2279 | coordinate | dot | rm-024 |
| Fangmatan | a card's locator coordinate — cnh-975 | 106.1,34.4 | coordinate | dot | cnh-975 |
| Four_Commanderies_of_Han | a card's locator coordinate — cnh-233 | 125.7475,39.0167 | coordinate | dot | cnh-233 |
| Fujian_tulou | a card's locator coordinate — cnh-962 | 116.732,24.724 | coordinate | dot | cnh-962 |
| Fuzhou | a card's locator coordinate — cnh-862 | 116.358,27.949 | coordinate | dot | gc-515 cnh-862 |
| Gedrosia | a card's locator coordinate — gr-742 | 62.5,26.5 | coordinate | dot | gr-742 |
| Grand_Canal | a card's locator coordinate — the cards disagree — wh-522 cnh-350 | 120.2239,30.2614 | coordinate | dot | wh-522 cnh-350 |
| Great_Mosque_of_Córdoba | a card's locator coordinate — wh-477 | -4.7797,37.8792 | coordinate | dot | wh-477 |
| Great_Wall_of_China | a card's locator coordinate — wh-407 | 116.0069,40.3542 | coordinate | dot | wh-407 |
| Hadrians_Wall | a card's locator coordinate — wh-368 rm-506 | -2.2833,55.0167 | coordinate | dot | wh-368 rm-506 |
| Hangu_Pass | a card's locator coordinate — cnh-837 | 110.92,34.63 | coordinate | dot | cnh-837 |
| Hankou | a card's locator coordinate — cnh-812 | 114.2642,30.6029 | coordinate | dot | cnh-812 |
| Heb-sed_court | a card's locator coordinate — eg-096 | 31.2167,29.8711 | coordinate | dot | eg-096 |
| Hellespont_bridges | a card's locator coordinate — gr-415 — ALSO tagged object: is it the place or the event? | 26.405,40.1953 | coordinate | dot | gr-415 |
| Hyphasis | a card's locator coordinate — gr-741 | 75.5,31.4 | coordinate | dot | gr-741 |
| Indo-Islamic_architecture | a card's locator coordinate — wh-552 — ALSO tagged concept: is it the place or the event? | 77.1854,28.5244 | coordinate | dot | wh-552 |
| International_Humanitarian_City | a card's locator coordinate — gga-181 — ALSO tagged institution: is it the place or the event? | 55.0711,24.8952 | coordinate | dot | gga-181 |
| Jebel_Irhoud | a card's locator coordinate — wh-043 | -8.8725,31.855 | coordinate | dot | wh-043 |
| Jeongok-ri | a card's locator coordinate — ko-022 | 127.0638,38.0116 | coordinate | dot | ko-022 |
| Jiangnan_Examination_Hall | a card's locator coordinate — cnh-704 | 118.7904,32.0219 | coordinate | dot | cnh-704 |
| Kalchyk_(river) | a card's locator coordinate — wh-595 ru-093 | 37.4956,47.2508 | coordinate | dot | wh-595 ru-093 |
| Khara-Khoto | a card's locator coordinate — cnh-471 | 100.318,41.7456 | coordinate | dot | cnh-471 |
| Land_of_Punt | a card's locator coordinate — wh-422 | 43.3333,12.5833 | coordinate | dot | wh-422 |
| Latium | a card's locator coordinate — rm-004 rm-100 | 12.7167,41.9 | coordinate | dot | rm-004 rm-100 |
| Laurion | a card's locator coordinate — gr-318 | 24.05,37.7 | coordinate | dot | gr-318 gr-411 |
| Library_of_Pergamon | a card's locator coordinate — gr-791 — ALSO tagged institution: is it the place or the event? | 27.1842,39.1325 | coordinate | dot | gr-791 |
| Lomekwi_3 | a card's locator coordinate — wh-014 | 35.7508,3.8742 | coordinate | dot | wh-014 |
| Long_Walls | a card's locator coordinate — gr-488 | 23.7,37.95 | coordinate | dot | gr-488 |
| Lower_Germanic_Limes | a card's locator coordinate — rm-753 | 5.8625,51.8475 | coordinate | dot | rm-753 |
| Lyceum | a card's locator coordinate — gr-683 — ALSO tagged institution: is it the place or the event? | 23.7435,37.9741 | coordinate | dot | gr-683 |
| Madjedbebe | a card's locator coordinate — wh-093 | 132.8833,-12.5 | coordinate | dot | wh-093 |
| Magna_Graecia | a card's locator coordinate — rm-043 | 17.2769,39.885 | coordinate | dot | gr-223 rm-043 |
| Mausoleum_of_the_First_Qin_Emperor | a card's locator coordinate — cnh-208 | 109.2539,34.3817 | coordinate | dot | cnh-208 |
| Merimde_Beni_Salama | a card's locator coordinate — eg-019 | 30.85,30.316 | coordinate | dot | eg-019 |
| Meroë | a card's locator coordinate — wh-417 | 33.7264,16.9333 | coordinate | dot | wh-417 |
| Mesara | a card's locator coordinate — gr-035 | 24.8461,35.0372 | coordinate | dot | gr-035 |
| Mesoamerica | a card's locator coordinate — wh-425 | -98.8667,19.6667 | coordinate | dot | wh-425 |
| Mirgissa | a card's locator coordinate — eg-192 | 30.97,21.48 | coordinate | dot | eg-192 |
| Mogao_Caves | a card's locator coordinate — cnh-893 cnh-937 | 94.6639,40.1411 | coordinate | dot | cnh-893 cnh-937 |
| Monte_Albán | a card's locator coordinate — wh-427 | -96.7678,17.0439 | coordinate | dot | wh-427 |
| Mount_Wutai | a card's locator coordinate — cnh-894 | 113.2553,38.7283 | coordinate | dot | cnh-894 |
| Mycenaean_road_network | a card's locator coordinate — gr-100 — ALSO tagged object: is it the place or the event? | 22.9375,37.5936 | coordinate | dot | gr-100 |
| Nanchan_Temple | a card's locator coordinate — cnh-963 | 113.2553,38.7283 | coordinate | dot | cnh-963 |
| New_England | a card's locator coordinate — wh-680 | -70.6678,41.9583 | coordinate | dot | wh-680 |
| Pannonia | a card's locator coordinate — rm-776 | 19.6106,44.9661 | coordinate | dot | rm-776 |
| Pergamon_Altar | a card's locator coordinate — gr-790 — ALSO tagged object: is it the place or the event? | 27.1842,39.1325 | coordinate | dot | gr-790 |
| Pingcheng | a card's locator coordinate — cnh-334 cnh-895 | 113.367,40.097 | coordinate | dot | cnh-334 cnh-895 |
| Piraeus_wall | a card's locator coordinate — gr-445 | 23.6559,37.9406 | coordinate | dot | gr-445 |
| Pithekoussai | a card's locator coordinate — gr-148 | 13.8833,40.75 | coordinate | dot | gr-148 |
| Portus_Julius | a card's locator coordinate — rm-999 | 14.0947,40.8283 | coordinate | dot | rm-999 |
| Propylaea | a card's locator coordinate — gr-501 | 23.7251,37.9717 | coordinate | dot | gr-501 |
| Province_of_Asia | a card's locator coordinate — rm-258 | 27.1842,39.1325 | coordinate | dot | rm-258 |
| Province_of_Macedonia | a card's locator coordinate — rm-257 | 22.9356,40.6403 | coordinate | dot | rm-257 |
| Pulvinar_(Roman) | a card's locator coordinate — rm-889 | 12.4857,41.8859 | coordinate | dot | rm-889 |
| Puticuli | a card's locator coordinate — rm-816 | 12.4967,41.8956 | coordinate | dot | rm-816 |
| Roman_gardens | a card's locator coordinate — rm-833 | 12.4969,41.9081 | coordinate | dot | rm-833 |
| Roman_roads | a card's locator coordinate — rm-175 | 12.4964,41.9028 | coordinate | dot | wh-360 rm-175 |
| Royal_Cemetery_at_Ur | a card's locator coordinate — wh-181 | 46.1061,30.9615 | coordinate | dot | wh-181 |
| Royal_Road | a card's locator coordinate — wh-304 | 28.0403,38.4883 | coordinate | dot | gr-388 wh-304 |
| Saguntum | a card's locator coordinate — rm-208 | -0.2783,39.68 | coordinate | dot | rm-208 |
| Sahul | a card's locator coordinate — wh-092 | 142.5,-9.8333 | coordinate | dot | wh-092 |
| Sanxingdui | a card's locator coordinate — wh-250 | 104.2,30.993 | coordinate | dot | wh-250 cnh-053 |
| Seleucia_on_the_Tigris | a card's locator coordinate — gr-781 gr-768 | 44.5222,33.0944 | coordinate | dot | gr-781 gr-768 |
| Serdab | a card's locator coordinate — eg-094 | 31.2167,29.8711 | coordinate | dot | eg-094 |
| Shanghai_International_Settlement | a card's locator coordinate — cnh-600 | 121.4861,31.238 | coordinate | dot | cnh-600 |
| Shunet_El_Zebib | a card's locator coordinate — eg-069 | 31.9078,26.1894 | coordinate | dot | eg-069 |
| Six_Garrisons | a card's locator coordinate — cnh-337 | 108.2676,41.0884 | coordinate | dot | cnh-337 |
| Sogdiana | a card's locator coordinate — gr-736 | 66.9758,39.6547 | coordinate | dot | gr-736 |
| Stupa | a card's locator coordinate — wh-389 — ALSO tagged object: is it the place or the event? | 77.7397,23.4792 | coordinate | dot | wh-389 |
| Sutton_Hoo | a card's locator coordinate — wh-491 — ALSO tagged object: is it the place or the event? | 1.3389,52.0897 | coordinate | dot | wh-491 |
| Tea_Horse_Road | a card's locator coordinate — cnh-816 | 101.9569,29.9985 | coordinate | dot | cnh-816 |
| Temple_of_Agriculture | a card's locator coordinate — cnh-729 | 116.3862,39.8766 | coordinate | dot | cnh-729 |
| Teotihuacan | a card's locator coordinate — wh-431 | -98.8439,19.6925 | coordinate | dot | wh-431 |
| Theatre_of_Dionysus | a card's locator coordinate — gr-612 | 23.7278,37.9703 | coordinate | dot | gr-612 |
| Themistoclean_Wall | a card's locator coordinate — gr-444 | 23.7189,37.9783 | coordinate | dot | gr-444 |
| Tomb_100 | a card's locator coordinate — eg-037 | 32.7794,25.0972 | coordinate | dot | eg-037 |
| Tomb_U-j | a card's locator coordinate — eg-046 | 31.9083,26.175 | coordinate | dot | eg-046 |
| Ugarit | a card's locator coordinate — wh-268 | 35.7856,35.6019 | coordinate | dot | wh-268 |
| Via_Aemilia | a card's locator coordinate — rm-174 | 11.3426,44.4949 | coordinate | dot | rm-174 |
| White_Cloud_Temple | a card's locator coordinate — cnh-880 | 116.36,39.91 | coordinate | dot | cnh-880 |
| Wu_Liang_Shrine | a card's locator coordinate — cnh-966 | 116.342,35.408 | coordinate | dot | cnh-966 |
| Yodok_concentration_camp | a card's locator coordinate — pea-124 | 126.8514,39.6742 | coordinate | dot | pea-124 |
| Zhaozhou_Bridge | a card's locator coordinate — cnh-990 | 114.7633,37.7203 | coordinate | dot | cnh-990 |
| Zhengguo_Canal | a card's locator coordinate — cnh-804 | 108.843,34.527 | coordinate | dot | cnh-804 |

### Tier 5 — A name match in the registry, no card (90)

the term's title, alias or Wikipedia title is exactly one registry row; a glance confirms it.

| term | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|
| Africa | Wikipedia title = registry row | reg:1159104365 | region | dot |  |
| Africa_(Roman_province) | name = one registry row | reg:1159104365 | region | dot | rm-762 |
| Alps | Wikipedia title = registry row | reg:1159104297 | range | dot |  |
| Altai_Republic | Wikipedia title = registry row | adm1:rus:ru-al | admin1 | face | gru-079 |
| Amiens | Wikipedia title = registry row | city:1159142053 | town | dot |  |
| Anatolia | Wikipedia title = registry row | reg:1159104259 | region | dot |  |
| Aswan | Wikipedia title = registry row | city:1159149859 | town | dot |  |
| Atbarah_River | Wikipedia title = registry row | river:1159115347 | river | dot |  |
| Atlantic_Ocean | Wikipedia title = registry row | sea:1159115057 | ocean | dot |  |
| Balkans | Wikipedia title = registry row | reg:1159104241 | region | dot |  |
| Barnaul | Wikipedia title = registry row | city:1159150711 | town | dot | gru-523 |
| Black_Sea | Wikipedia title = registry row | sea:1159115171 | sea | dot |  |
| Blue_Nile | Wikipedia title = registry row | river:1159126701 | river | dot |  |
| Bologna | Wikipedia title = registry row | city:1159139461 | town | dot |  |
| Buryatia | Wikipedia title = registry row | adm1:rus:ru-bu | admin1 | face | gru-052 |
| Caspian_Sea | Wikipedia title = registry row | sea:1159115461 | sea | dot |  |
| Central_Valley_(California) | Wikipedia title = registry row | reg:1159103751 | region | dot |  |
| Charleston_(South_Carolina) | name = one registry row | city:1159149297 | town | dot | geo-513 geo-728 |
| Charleston_(West_Virginia) | name = one registry row | city:1159149297 | town | dot | geo-513 geo-728 |
| Cheboksary | Wikipedia title = registry row | city:1159146557 | town | dot | gru-539 |
| Cherkessk | Wikipedia title = registry row | city:1159137059 | town | dot | gru-574 |
| Chuvashia | Wikipedia title = registry row | adm1:rus:ru-cu | admin1 | face | gru-039 |
| Crimea | Wikipedia title = registry row | reg:1159103999 | region | dot |  |
| Damietta | Wikipedia title = registry row | city:1159140385 | town | dot |  |
| Danube | Wikipedia title = registry row | river:1159115307 | river | dot |  |
| Elista | Wikipedia title = registry row | city:1159148145 | town | dot | gru-578 |
| Europe | Wikipedia title = registry row | reg:1159104603 | region | dot |  |
| Genoa | Wikipedia title = registry row | city:1159148297 | town | dot |  |
| Gilf_Kebir | Wikipedia title = registry row | reg:1159103215 | region | dot | eg-014 |
| Great_Basin_peoples | name = one registry row | reg:1159104161 | region | dot | us-034 |
| Great_Plains | Wikipedia title = registry row | reg:1159104319 | region | dot | us-035 |
| Great_Rift_Valley | Wikipedia title = registry row | reg:1159103991 | region | dot |  |
| Hamilton,_Bermuda | Wikipedia title = registry row | city:1159151185 | capital | dot |  |
| Hokkaido | Wikipedia title = registry row | reg:1159103801 | island | dot |  |
| Honshu | Wikipedia title = registry row | reg:1159104129 | island | dot |  |
| Iberia | name = one registry row | reg:1159104343 | region | dot |  |
| Izhevsk | Wikipedia title = registry row | city:1159148141 | town | dot | gru-529 |
| Jeju_Island | name = one registry row | city:1159135293 | town | dot | ko-018 |
| Jewish_Autonomous_Oblast | Wikipedia title = registry row | adm1:rus:ru-yev | admin1 | face | gru-080 |
| Kalmykia | Wikipedia title = registry row | adm1:rus:ru-kl | admin1 | face | gru-078 |
| Karachay-Cherkessia | Wikipedia title = registry row | adm1:rus:ru-kc | admin1 | face | gru-074 |
| Khakassia | Wikipedia title = registry row | adm1:rus:ru-kk | admin1 | face | gru-070 |
| Korea | name = one registry row | reg:1159103669 | region | dot | ko-001 |
| Korean_Peninsula | Wikipedia title = registry row | reg:1159103669 | region | dot | ko-002 |
| Kunlun | name = one registry row | reg:1159104187 | range | dot | cnh-019 |
| Kurgan,_Kurgan_Oblast | Wikipedia title = registry row | city:1159146527 | town | dot |  |
| Kyushu | Wikipedia title = registry row | reg:1159103795 | island | dot |  |
| Laetoli | Wikipedia title = registry row | pl:q672146 | site | dot |  |
| Larisa_(Argos) | name = one registry row | city:1159142201 | town | dot |  |
| Levant | name = one registry row | reg:1730072159 | region | dot |  |
| Liao_River | Wikipedia title = registry row | river:1159114785 | river | dot | ko-050 |
| Mari_El | Wikipedia title = registry row | adm1:rus:ru-me | admin1 | face | gru-064 |
| Mediterranean | name = one registry row | sea:1159115321 | sea | dot |  |
| Mississippi_River | Wikipedia title = registry row | river:1159119147 | river | dot |  |
| Missouri_River | Wikipedia title = registry row | river:1159128481 | river | dot |  |
| Naples | Wikipedia title = registry row | city:1159151313 | city | dot |  |
| New_Guinea | Wikipedia title = registry row | reg:1159104121 | island | dot |  |
| North_America | Wikipedia title = registry row | reg:1159104607 | region | dot |  |
| North_Ossetia–Alania | Wikipedia title = registry row | adm1:rus:ru-se | admin1 | face | gru-063 |
| Okinawa_Island | Wikipedia title = registry row | reg:1730072495 | island-group | dot |  |
| Ordos_Plateau | name = one registry row | reg:1159103649 | region | dot | cnh-777 |
| Pacific_Ocean | Wikipedia title = registry row | sea:1159115079 | ocean | dot |  |
| Palermo | Wikipedia title = registry row | city:1159150805 | town | dot |  |
| Peloponnese | Wikipedia title = registry row | reg:1730071111 | island | dot |  |
| Pisa | name = one registry row | pol:pisa | polity | face |  |
| Portland_(Maine) | name = one registry row | city:1159150487 | city | dot | geo-724 geo-709 |
| Portland_(Oregon) | name = one registry row | city:1159150487 | city | dot | geo-724 geo-709 |
| Quanzhou | Wikipedia title = registry row | city:1159149791 | city | dot | cnh-455 |
| Rijeka | Wikipedia title = registry row | city:1159130051 | town | dot |  |
| Scandinavia | Wikipedia title = registry row | reg:1159104329 | region | dot |  |
| Sea_of_Japan | Wikipedia title = registry row | sea:1159115305 | sea | dot |  |
| Seattle | Wikipedia title = registry row | city:1159151223 | city | dot | geo-723 |
| Serengeti | Wikipedia title = registry row | reg:1159103293 | region | dot |  |
| Shanxi | Wikipedia title = registry row | adm1:chn:cn-sx | admin1 | face | gc-018 |
| Shikoku | Wikipedia title = registry row | reg:1159103797 | island | dot |  |
| Sidon | Wikipedia title = registry row | city:1159129477 | town | dot |  |
| Sierra_Nevada | Wikipedia title = registry row | reg:1159103951 | range | dot |  |
| Sobat_River | Wikipedia title = registry row | river:1159123459 | river | dot |  |
| South_America | Wikipedia title = registry row | reg:1159104361 | region | dot |  |
| Tyrrhenian_Sea | Wikipedia title = registry row | sea:1159116377 | sea | dot |  |
| Udmurtia | Wikipedia title = registry row | adm1:rus:ru-ud | admin1 | face | gru-029 |
| Ulan-Ude | Wikipedia title = registry row | city:1159149623 | town | dot | gru-552 |
| Victoria,_Seychelles | Wikipedia title = registry row | city:1159151191 | capital | dot |  |
| Vladikavkaz | Wikipedia title = registry row | city:1159137065 | town | dot | gru-563 |
| Vladimir,_Russia | Wikipedia title = registry row | city:1159148121 | town | dot |  |
| White_Nile | Wikipedia title = registry row | river:1159113335 | river | dot |  |
| White_Sands_National_Park | name = one registry row | reg:1730070773 | region | dot |  |
| Yam_(Nubia) | name = one registry row | lake:1130 | lake | dot | eg-133 |
| Yellow_Sea | Wikipedia title = registry row | sea:1159115999 | sea | dot | ko-007 |
| Yoshkar-Ola | Wikipedia title = registry row | city:1159137563 | town | dot | gru-564 |

### Tier 6 — Needs a Wikidata lookup (361)

tagged a place and nothing in Folio joins it: the slug is a Wikipedia title, so `migrate-places.js`'s title resolver can try each; continents, hemispheres and ice sheets will fail.

| term | what joins it | place (registry id or lon,lat) | kind | window | cards |
|---|---|---|---|---|---|
| 14_regions_of_Augustan_Rome | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  | rm-828 |
| Acragas | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Aeolic_capital | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  | gr-348 |
| Agora | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-174 |
| Agri_Decumates | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-756 |
| Ahhiyawa | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | gr-095 |
| Alashiya | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Altai_Krai | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gru-023 |
| Amarna | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Americas | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Amnisos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Amnok_River | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-017 |
| Amsa-dong | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-026 |
| Amyclae | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Anemospilia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Aniene | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Arcadia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Archaic_temple | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-338 |
| Archanes | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Archipelago | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Architrave | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Arctic | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ardea | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Argiletum | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged practice: is it the place or the event? |  |  |  |  |
| Argolid | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Aricia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ashlar | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged practice: is it the place or the event? |  |  |  |  |
| Aspis_hill | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Atoll | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Atrium_(architecture) | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-831 |
| Ayia_Irini | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Badlands | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Bangudae | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-041 |
| Barrel_vault | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-982 |
| Bering_Strait | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Birobidzhan | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gru-580 |
| Boeotia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Border_Cave | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Brescia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Broca's_area | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ps-031 |
| Burma_Road | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-647 |
| Byblos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Caelian_Hill | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Caesar's_Rhine_bridges | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-675 |
| Caldera | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Calypso | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged deity: is it the place or the event? |  |  |  | gr-962 |
| Campi_Flegrei | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Canaba | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-683 |
| Cape_Gelidonya | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged event: is it the place or the event? |  |  |  |  |
| Capitol_Hill,_Saipan | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Carsulae | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Castle | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-509 |
| Cella | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Cemetery | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Central_Plain | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-052 |
| Chania | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Channel_Islands_National_Park | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Chengzhou | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-121 |
| Chios | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Citadel | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Clitumnus | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Columbarium | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-825 |
| Comancheria | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-047 |
| Composite_order | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | rm-983 |
| Corbel | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  |  |
| Corcyra | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Corinthia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Corinthian_order | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Cosquer_Cave | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cradle_of_Humankind | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cretan_cult_cave | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Crustumerium | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cueva_de_El_Castillo | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Cueva_de_las_Manos | tagged a place, no join (needs a Wikidata lookup) |  |  |  | art-024 |
| Curia | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  |  |
| Daepyeong | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-031 |
| Daisenryō_Kofun | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-049 |
| Death_Valley | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dhaskalio | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Didyma | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dipylon_Gate | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Diyu | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-031 |
| Dodecanese | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dolmen | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-033 |
| Dolní_Věstonice | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Domus | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-830 |
| Doric_order | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | gr-339 |
| Douglas,_Isle_of_Man | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dromos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Earthen_fortress | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-081 |
| East_Africa | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| East_Asia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Echinus | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  |  |
| Egyptian_pyramids | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-091 |
| Eight_Provinces_of_Korea | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  | ko-009 |
| Enkomi | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Entasis | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Eretria | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-402 |
| Ergastulum | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-806 |
| Erlitou_site | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-063 |
| Esquiline_Hill | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Euboea | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Eurasia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Exclusive_economic_zone | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Fennoscandian_ice_sheet | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ferrara | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ficana | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Fidenae | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Forica | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-838 |
| Forum_(Roman) | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-985 |
| Free_China_(Second_Sino-Japanese_War) | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-639 |
| Fujiwara-kyō | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-079 |
| Fullonica | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-844 |
| Funadomari | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-024 |
| George_Town,_Cayman_Islands | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Gochang_Dolmen_Site | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Gorno-Altaysk | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gru-579 |
| Gortyn | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Goryeo_long_wall | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-016 |
| Gran_Sasso | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Grassland | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Grave_Gamma | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Great_house_(Chacoan) | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-024 |
| Greek_underworld | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-920 |
| Hall_of_the_Bulls | tagged a place, no join (needs a Wikidata lookup) |  |  |  | art-016 |
| Han_River_(Korea) | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-012 |
| Heijō-kyō | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-087 |
| Hephaisteion | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-505 |
| Hispania | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-761 |
| Hispellum | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Hohle_Fels | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Horreum | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-688 |
| Hōryū-ji | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-067 |
| Idalion | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ierapetra | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Inca_road_system | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-616 |
| Indian_reservation | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | us-084 |
| Indian_Territory | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-081 |
| Insula_(building) | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-829 |
| Ionic_order | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | gr-340 |
| Ios | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ithome | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Itjtawy | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-177 |
| Ius_Italicum | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept/law: is it the place or the event? |  |  |  | rm-780 |
| Jamestown,_Saint_Helena | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Janiculum | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Japanese_archipelago | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-002 |
| Joshua_Tree_National_Park | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Judaea_(Roman_province) | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-770 |
| Kalapodi | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kanagawa_Prefecture | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Karaca_Dağ | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Karakorum | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Karst | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kavos | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged practice: is it the place or the event? |  |  |  |  |
| Kea | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kilimanjaro | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kingston,_Norfolk_Island | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kition | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Klasies_River_Caves | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kofun | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  | jp-048 |
| Kokiselei | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kokubunji | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  | jp-093 |
| Kom_K_and_Kom_W | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-020 |
| Kommos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Konso | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Koobi_Fora | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Kouloura | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Krisa | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lake_Chad | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lasithi | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lassen_Volcanic_National_Park | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Laterculus_Veronensis | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged text: is it the place or the event? |  |  |  | rm-569 |
| Laurentide_ice_sheet | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Leang_Bulu'_Sipong_4 | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Leang_Tedongnge | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ledi-Geraru | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Leipzig | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Lelang | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-072 |
| Levantine_corridor | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-024 |
| Liancourt_Rocks | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | ko-019 |
| Liang_Bua | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Liaodong | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-043 |
| Limnae | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Liptako-Gourma | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gga-270 |
| Lucus_Ferentinae | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  |  |
| Lupercal | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged practice: is it the place or the event? |  |  |  |  |
| Macellum | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-842 |
| Manchuria | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-006 |
| Mastaba | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-065 |
| Maya_civilisation | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-428 |
| Meadowcroft_Rockshelter | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Megalith | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  | wh-138 |
| Megara | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Megaron | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-072 |
| Melos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mesara_tholos_tomb | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Messenia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Metope | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  | gr-347 |
| Ming_Great_Wall | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-518 |
| Mingtang | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-875 |
| Mission_San_José_(Texas) | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Moated_settlement | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-037 |
| Monks_Mound | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-019 |
| Moundville | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-021 |
| Mount_Dikte | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mount_Hymettus | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mount_Juktas | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mount_Pentelicus | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  |  |
| Mountain_fortress | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-094 |
| Myrtos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Myrtos_Fournou_Korifi | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Nariokotome | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Nazi_concentration_camps | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  | ww2-063 |
| Nazlet_Khater | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-013 |
| Ngorongoro_Conservation_Area | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Nilometer | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-085 |
| Noguni_shell_middens | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-022 |
| Northeast_Asia | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-042 |
| Nyayanga | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Oceania | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ocriculum | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Odai_Yamamoto_I | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-007 |
| Ohio_Country | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-065 |
| Opisthodomos | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Pacific_Northwest_Coast | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-031 |
| Palaestra | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-886 |
| Panhellenic_sanctuary | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | gr-228 |
| Panlongcheng | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-090 |
| Paphos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Paros | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Peak_sanctuary | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pediment | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  | gr-346 |
| Pelargikon | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Penglai | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-021 |
| Peripteros | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | gr-341 |
| Phocaea | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Phocis | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Phylakopi | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Picuris_Pueblo,_New_Mexico | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pinnacle_Point | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pit_dwelling | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged practice: is it the place or the event? |  |  |  | jp-009 ko-025 |
| Pit-house | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged practice: is it the place or the event? |  |  |  | ko-025 |
| Plinth | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  |  |
| Po_valley | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Polish_Corridor | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-007 |
| Pompeion | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Popina | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-859 |
| Praeneste | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Praying_town | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-055 |
| Pronaos | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Psychro_Cave | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Pueblo_peoples | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-029 |
| Qin_long_walls | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-207 |
| Qin_road_system | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-203 |
| Quartier_Mu | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Quirinal_Hill | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ramesses_II | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged ruler: is it the place or the event? |  |  |  | wh-225 |
| Rashid | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Regia | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  |  |
| Regionary_Catalogues | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged text: is it the place or the event? |  |  |  | rm-827 |
| Roman_aqueduct | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-361 |
| Roman_Britain | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-757 |
| Roman_diocese | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  | rm-570 |
| Roman_Egypt | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-765 |
| Roman_provincial_taxation | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | rm-269 |
| Roman_Syria | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-768 |
| Roman_villa | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-832 |
| Rostra | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  |  |
| Rubicon | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged event: is it the place or the event? |  |  |  | rm-359 |
| Salerno | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Sanctuary | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Sannai-Maruyama | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-010 |
| Savanna | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Scylla | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-961 |
| Settlement | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Shaft_Grave_V | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Shang_capitals | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-088 |
| Shipshed | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Shōsōin | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged institution: is it the place or the event? |  |  |  | jp-096 |
| Sibudu_Cave | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Siena | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Siheyuan | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-766 |
| Silicon_Valley | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Siphnos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Skarkos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Skene | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | gr-614 |
| Soda_lake | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Songgungni | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-036 |
| South_Asia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Southwest_Asia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Spoletium | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Sterkfontein | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Stoa | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Stone_circle | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged practice: is it the place or the event? |  |  |  | jp-018 |
| Stucco | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object/practice: is it the place or the event? |  |  |  |  |
| Stylobate | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Stymphalus | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Swabia | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Taberna | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-843 |
| Tachikawa_Loam | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-029 |
| Taygetus | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Temple | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Temple_of_Artemis,_Corfu | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Temple_of_Isis_and_Serapis | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-923 |
| Thasos | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Theatron | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | gr-613 |
| Thermae | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-883 |
| Thespiae | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-425 |
| Thinis | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-169 |
| Tholos_tomb | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-064 |
| Thornax | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-269 |
| Thrace | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tōdai-ji | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-090 |
| Tomb | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  |  |
| Tomb_of_Aegisthus | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tomb_of_Clytemnestra | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tomb_of_Dangun | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-062 |
| Tomb_of_Fu_Hao | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-075 |
| Tomb_of_the_Lions | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Treaty_of_Rhandeia | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged event: is it the place or the event? |  |  |  | rm-445 |
| Triglyph | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  |  |
| Triparadisus | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged event: is it the place or the event? |  |  |  | gr-759 |
| Troy_I | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_II | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_III | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_IV | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_IX | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_V | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VI | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VII | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VIIb1 | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VIIb2 | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Troy_VIII | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Trust_territory | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tuder | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tuscany | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Tusculum | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Valetudinarium | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-687 |
| Vasiliki | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Velabrum | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged practice: is it the place or the event? |  |  |  |  |
| Vestibule | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  |  |
| Villa_rustica | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-861 |
| Viminal_Hill | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Volute | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object: is it the place or the event? |  |  |  |  |
| Voussoir | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-981 |
| Wanggeom-seong | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-059 |
| Warring_States_cities | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-177 |
| Wawat | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-191 |
| Wernicke's_area | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ps-032 |
| West_Liao_River | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-014 |
| West_Turkana | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Western_Europe | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Willow_Palisade | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-795 |
| Xibeigang | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-080 |
| Xuantu_Commandery | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-079 |
| Yamatai | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged concept: is it the place or the event? |  |  |  | jp-044 |
| Yoshinogari | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-038 |
| Yurt | tagged a place, no join (needs a Wikidata lookup) — ALSO tagged object/practice: is it the place or the event? |  |  |  | wh-587 |
| Zhengzhou_Shang_City | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-089 |
| Zoo_Rock | tagged a place, no join (needs a Wikidata lookup) |  |  |  | art-023 |

### Tier G — a state, a people, a dynasty or a culture (374 joined, 26 not)

Not a location in the sense of the rule, and set aside for the owner's call: a state or an empire could be drawn as a shaded face at a year (the engine does it for a war's sides), a people as its presence stipple — or none of them get a window. The join tier is the same scale as above.

| term | tagged | what joins it | place | kind | window | cards |
|---|---|---|---|---|---|---|
| Abbasid_Caliphate | 2 · state | a card's places (named for the term) | pol:abbasid | polity | face | wh-469 |
| Achaemenid_Empire | 2 · state | a card's places (named for the term) | pol:achaemenid | polity | face | gr-381 wh-301 |
| Akkadian_Empire | 2 · state | a card's places (named for the term) | pol:akkad | polity | face | wh-185 |
| Ashanti_Empire | 2 · state | a card's places (named for the term) | pol:ashanti | polity | face | wh-738 |
| Attalid_dynasty | 2 · dynasty/state | a card's places (named for the term) | pol:pergamon | polity | face | gr-789 |
| Austria-Hungary | 2 · state | a card's places (named for the term) | pol:austria_hungary | polity | face | wh-807 |
| Aztec_Empire | 2 · state | a card's places (named for the term) | pol:aztec | polity | face | wh-605 |
| Badarian_culture | 2 · culture | a card's places (named for the term) | pl:q798844 | site | dot | eg-027 |
| Baekje | 2 · state | a card's places (named for the term) | pol:baekje | polity | face | jp-054 |
| Bosporan_Kingdom | 2 · state | a card's places (named for the term) | pol:bosporus | polity | face | ru-010 |
| Cao_Wei | 2 · state/dynasty | a card's places (named for the term) | pol:cao_wei | polity | face | cnh-277 |
| Chen_dynasty | 2 · dynasty/state | a card's places (named for the term) | pol:chen | polity | face | cnh-329 |
| Chola_dynasty | 2 · dynasty/state | a card's places (named for the term) | pol:chola | polity | face | wh-547 |
| Crimean_Khanate | 2 · state | a card's places (named for the term) | pol:crimean_khanate | polity | face | wh-710 |
| Delhi_Sultanate | 2 · state | a card's places (named for the term) | pol:delhi_sultanate | polity | face | wh-548 |
| Eastern_Han | 2 · dynasty/state | a card's places (named for the term) | pl:q1147037 | region | dot | cnh-253 |
| Eastern_Wei | 2 · dynasty/state | a card's places (named for the term) | pol:eastern_wei | polity | face | cnh-338 |
| Eastern_Wu | 2 · state/dynasty | a card's places (named for the term) | pol:eastern_wu | polity | face | cnh-284 |
| Empire_of_Japan | 2 · state | a card's places (named for the term) | pol:japan | polity | face | ww2-081 |
| Etruscan_civilisation | 2 · culture | a card's places (named for the term) | pol:etruscans | polity | face | rm-022 wh-337 rm-023 rm-024 +9 |
| Fatimid_Caliphate | 2 · state | a card's places (named for the term) | pol:fatimid | polity | face | wh-478 |
| First_Bulgarian_Empire | 2 · state | a card's places (named for the term) | pol:bulgaria_first | polity | face | wh-449 |
| Folsom_tradition | 2 · culture | a card's places (named for the term) | pl:q1435589 | town | dot | wh-103 |
| Former_Qin | 2 · state | a card's places (named for the term) | pol:former_qin | polity | face | cnh-308 |
| Former_Yan | 2 · state | a card's places (named for the term) | pol:former_yan | polity | face | cnh-307 |
| Gallic_Empire | 2 · state | a card's places (named for the term) | pol:gallic_empire | polity | face | rm-559 |
| Ghana_Empire | 2 · state | a card's places (named for the term) | pol:ghana_empire | polity | face | wh-566 |
| Golden_Horde | 2 · state/empire | a card's places (named for the term) | pol:golden_horde | polity | face | wh-598 ru-100 |
| Goryeo | 2 · dynasty/state | a card's places (named for the term) | pol:goryeo | polity | face | wh-540 |
| Gupta_Empire | 2 · state | a card's places (named for the term) | pol:gupta | polity | face | wh-393 |
| Han-Zhao | 2 · state | a card's places (named for the term) | pol:han_zhao | polity | face | cnh-305 |
| Huns | 2 · people | a card's places (named for the term) | pol:huns | people | face | wh-589 ru-012 |
| Inca_Empire | 2 · state | a card's places (named for the term) | pol:inca | polity | face | wh-612 |
| Indo-Greek_Kingdom | 2 · state | a card's places (named for the term) | pol:indo_greeks | polity | face | gr-784 wh-390 |
| Jin_dynasty_(266–420) | 2 · dynasty/state | a card's places (named for the term) | pol:western_jin | polity | face | cnh-293 |
| Kamakura_shogunate | 2 · state | a card's places (named for the term) | pol:kamakura | polity | face | wh-545 |
| Kanem–Bornu_Empire | 2 · state | a card's places (named for the term) | pol:kanem_bornu | polity | face | wh-573 |
| Khazars | 2 · people/state | a card's places (named for the term) | pol:khazaria | people | face | wh-592 ru-016 |
| Khmer_Empire | 2 · state | a card's places (named for the term) | pol:khmer | polity | face | wh-556 |
| Kievan_Rus' | 2 · state | a card's places (named for the term) | pol:rus | polity | face | wh-448 ru-036 |
| Kingdom_of_Aksum | 2 · state | a card's places (named for the term) | pol:aksum | polity | face | wh-418 |
| Kingdom_of_Galicia–Volhynia | 2 · state | a card's places (named for the term) | pol:galicia_volhynia | polity | face | ru-083 |
| Kingdom_of_Georgia | 2 · state | a card's places (named for the term) | pol:georgia | polity | face | wh-454 |
| Kingdom_of_Kongo | 2 · state | a card's places (named for the term) | pol:kongo | polity | face | wh-580 |
| Kingdom_of_Kush | 2 · state | a card's places (named for the term) | pol:kush | polity | face | wh-416 |
| Kushan_Empire | 2 · state | a card's places (named for the term) | pol:kushan | polity | face | wh-391 |
| Liang_dynasty | 2 · dynasty/state | a card's places (named for the term) | pol:liang | polity | face | cnh-326 |
| Liangzhu_culture | 2 · culture | a card's places (named for the term) | pl:q1204909 | region | dot | cnh-048 cnh-049 |
| Liu_Song_dynasty | 2 · dynasty/state | a card's places (named for the term) | pol:liu_song | polity | face | cnh-324 |
| Longshan_culture | 2 · culture | a card's places (named for the term) | pol:longshan | culture | face | wh-148 cnh-050 |
| Magyars | 2 · people | a card's places (named for the term) | pol:magyars | people | face | ru-019 |
| Majapahit | 2 · state | a card's places (named for the term) | pol:majapahit | polity | face | wh-555 |
| Makuria | 2 · state | a card's places (named for the term) | pol:makuria | polity | face | wh-585 |
| Malacca_Sultanate | 2 · state | a card's places (named for the term) | pol:malacca | polity | face | wh-565 |
| Mali_Empire | 2 · state | a card's places (named for the term) | pol:mali | polity | face | wh-568 |
| Mamluk_Sultanate | 2 · state | a card's places (named for the term) | pol:mamluk_egypt | polity | face | wh-485 |
| Maratha_Empire | 2 · state/empire | a card's places (named for the term) | pol:maratha | polity | face | wh-707 |
| Maurya_Empire | 2 · state | a card's places (named for the term) | pol:maurya | polity | face | wh-383 |
| Ming_dynasty | 2 · dynasty | a card's places (named for the term) | pol:ming | polity | face | wh-711 cnh-503 |
| Mitanni | 2 · state | a card's places (named for the term) | pol:mitanni | polity | face | wh-200 |
| Mongol_Empire | 2 · state/empire | a card's places (named for the term) | pol:mongol | polity | face | wh-594 ru-091 |
| Mughal_Empire | 2 · state/empire | a card's places (named for the term) | pol:mughal | polity | face | wh-699 |
| Mycenaean_Greece | 2 · culture | a card's places (named for the term) | pol:mycenaean | polity | face | wh-263 gr-056 |
| Nanyue | 2 · state | a card's places (named for the term) | pol:nanyue | polity | face | cnh-232 |
| Neo-Assyrian_Empire | 2 · state | a card's places (named for the term) | pol:neo_assyria | polity | face | wh-282 |
| Neo-Babylonian_Empire | 2 · state | a card's places (named for the term) | pol:neo_babylonia | polity | face | wh-286 |
| Northern_Wei | 2 · dynasty/state | a card's places (named for the term) | pol:northern_wei | polity | face | cnh-330 |
| Northern_Zhou | 2 · dynasty/state | a card's places (named for the term) | pol:northern_zhou | polity | face | cnh-339 |
| Novgorod_Republic | 2 · state | a card's places (named for the term) | pol:novgorod | polity | face | ru-076 |
| Ottoman_Empire | 2 · state/empire | a card's places (named for the term) | pol:ottoman | polity | face | wh-687 |
| Palmyrene_Empire | 2 · state | a card's places (named for the term) | pol:palmyra | polity | face | rm-561 |
| Pannonian_Avars | 2 · people/state | a card's places (named for the term) | pol:avars | people | face | ru-013 |
| Parthian_Empire | 2 · empire | a card's places (named for the term) | pl:q1986139 | region | dot | rm-773 |
| Portuguese_Empire | 2 · state/empire | a card's places (named for the term) | pol:portuguese_empire | polity | face | wh-675 |
| Principality_of_Chernigov | 2 · state | a card's places (named for the term) | pol:chernigov | polity | face | ru-085 |
| Principality_of_Polotsk | 2 · state | a card's places (named for the term) | pol:polotsk | polity | face | ru-084 |
| Ptolemaic_Egypt | 2 · state | a card's places (named for the term) | pol:ptolemaic | polity | face | gr-767 |
| Qing_dynasty | 2 · dynasty | a card's places (named for the term) | pol:qing | polity | face | wh-716 cnh-535 |
| Rashidun_Caliphate | 2 · state | a card's places (named for the term) | pol:rashidun | polity | face | wh-462 |
| Roman_Empire | 2 · state | a card's places (named for the term) | pl:q2277 | region | dot | wh-358 |
| Safavid_Empire | 2 · state/empire | a card's places (named for the term) | pol:safavid | polity | face | wh-695 |
| Sasanian_Empire | 2 · state | a card's places (named for the term) | pol:sasanian | polity | face | rm-553 |
| Seleucid_Empire | 2 · state | a card's places (named for the term) | pol:seleucid | polity | face | gr-769 |
| Seljuk_Empire | 2 · state | a card's places (named for the term) | pol:seljuk | polity | face | wh-483 |
| Shang_dynasty | 2 · dynasty | a card's places (named for the term) | pol:shang | polity | face | wh-245 cnh-066 cnh-068 |
| Shu_Han | 2 · state/dynasty | a card's places (named for the term) | pol:shu_han | polity | face | cnh-279 |
| Song_dynasty | 2 · dynasty | a card's places (named for the term) | pol:song | polity | face | wh-528 cnh-421 |
| Songhai_Empire | 2 · state | a card's places (named for the term) | pol:songhai | polity | face | wh-572 |
| Southern_Qi | 2 · dynasty/state | a card's places (named for the term) | pol:southern_qi | polity | face | cnh-325 |
| Spanish_Empire | 2 · state/empire | a card's places (named for the term) | pol:spanish_empire | polity | face | wh-674 |
| Srivijaya | 2 · state | a card's places (named for the term) | pol:srivijaya | polity | face | wh-554 |
| Sui_dynasty | 2 · dynasty | a card's places (named for the term) | pol:sui | polity | face | wh-521 cnh-343 |
| Sumer | 2 · culture | a card's places (named for the term) | pol:sumer | polity | face | wh-172 |
| Tang_dynasty | 2 · dynasty | a card's places (named for the term) | pol:tang | polity | face | wh-523 cnh-355 |
| Tokugawa_shogunate | 2 · state | a card's places (named for the term) | pol:tokugawa | polity | face | wh-723 |
| Umayyad_Caliphate | 2 · state | a card's places (named for the term) | pol:umayyad | polity | face | wh-465 |
| Vijayanagara_Empire | 2 · state/empire | a card's places (named for the term) | pol:vijayanagara | polity | face | wh-549 |
| Vladimir-Suzdal | 2 · state | a card's places (named for the term) | pol:vladimir_suzdal | polity | face | ru-079 |
| Volga_Bulgaria | 2 · state | a card's places (named for the term) | pol:volga_bulgaria | polity | face | ru-015 |
| Wallis_and_Futuna | 2 · state | a card's places (named for the term) | adm0:wlf | country | face | gw-223 fl-223 fd-223 |
| Weimar_Republic | 2 · state | a card's places (named for the term) | pol:weimar | polity | face | ww2-015 wh-905 |
| Wiman_Joseon | 2 · state | a card's places (named for the term) | pol:wiman_joseon | polity | face | ko-054 |
| Xin_dynasty | 2 · dynasty/state | a card's places (named for the term) | pol:xin | polity | face | cnh-245 |
| Yangshao_culture | 2 · culture | a card's places (named for the term) | pol:yangshao | culture | face | wh-147 cnh-045 |
| Yuan_dynasty | 2 · dynasty/state | a card's places (named for the term) | pol:yuan | polity | face | wh-535 cnh-483 |
| Zagwe_dynasty | 2 · dynasty | a card's places (named for the term) | pol:zagwe | polity | face | wh-581 |
| Ancient_Israel_and_Judah | 3 · state | a card's places — several candidates — pol:israel Kingdom of Israel; pol:judah Kingdom of Judah | pol:israel, pol:judah |  |  | wh-290 |
| Ancient_Rome | 3 · culture | a card's places (every card of it) | city:1159151593 | capital | dot | wh-336 |
| Antigonid_dynasty | 3 · dynasty/state | a card's places (every card of it) | pol:macedon | polity | face | gr-770 |
| Balts | 3 · people | a card's places (every card of it) | pl:q19658174 | region | dot | ru-028 |
| Byzantine_Empire | 3 · state | a card's places — several candidates — pol:byzantium Eastern Roman Empire; pl:q16869 Constantinople | pol:byzantium, pl:q16869 |  |  | wh-436 rm-637 gr-219 |
| Carthaginian_empire | 3 · state | a card's places (every card of it) | pol:carthage | polity | face | rm-182 |
| Chengjia | 3 · state/dynasty | a card's places (every card of it) | city:1159151533 | city | dot | cnh-255 |
| Congo_Free_State | 3 · state | a card's places (every card of it) | pl:q223917 | city | dot | wh-829 |
| Cycladic_civilisation | 3 · culture | a card's places — several candidates — pol:cyclades Cyclades; reg:1159102965 Cyclades | pol:cyclades, reg:1159102965 |  |  | gr-002 |
| Cypriot_city-kingdoms | 3 · state | a card's places (every card of it) | reg:1159103411 | island | dot | gr-158 |
| Da_Qi | 3 · state | a card's places (every card of it) | pl:q208471 | city | dot | cnh-477 |
| Đại_Việt | 3 · state | a card's places — several candidates — pl:q430309 Đại Việt; pol:dai_viet Dai Viet | pl:q430309, pol:dai_viet |  |  | wh-559 |
| Eastern_Jin | 3 · state/dynasty | a card's places (every card of it) | pol:western_jin | polity | face | cnh-313 |
| Elam | 3 · state | a card's places — several candidates — pl:q2369687 Susiana; pol:elam Elam | pl:q2369687, pol:elam |  |  | wh-199 |
| Empire_of_China_(1915–1916) | 3 · state | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-579 |
| Epigoni | 3 · people | a card's places (every card of it) | pl:q11924352 | site | dot | gr-941 |
| Fifth_Dynasty_of_Egypt | 3 · dynasty | a card's places (every card of it) | pl:q336098 | site | dot | eg-118 |
| Flavian_dynasty | 3 · dynasty/people | a card's places (every card of it) | city:1159151593 | capital | dot | rm-490 |
| Former_Shu | 3 · state | a card's places (every card of it) | city:1159151533 | city | dot | cnh-404 |
| Galatians | 3 · people/culture | a card's places (every card of it) | pol:galatia | people | face | gr-788 |
| Göktürks | 3 · people/state | a card's places (every card of it) | pl:q1453235 | region | dot | wh-591 |
| Greco-Bactrian_Kingdom | 3 · state/dynasty | a card's places — several candidates — pl:q132646 Bactria; pol:bactria Graeco-Bactria | pl:q132646, pol:bactria |  |  | gr-783 |
| Han_dynasty | 3 · dynasty/state | a card's places — several candidates — pol:han Han dynasty; pl:q1147037 Eastern Han | pol:han, pl:q1147037 |  |  | wh-408 cnh-213 cnh-253 |
| Hausa_Kingdoms | 3 · state | a card's places (every card of it) | city:1159151297 | city | dot | wh-574 |
| Hittites | 3 · people/state | a card's places (every card of it) | pl:q181007 | site | dot | wh-266 |
| House_of_Medici | 3 · people | a card's places (every card of it) | city:1159149751 | city | dot | wh-624 |
| Huizhou_merchants | 3 · people | a card's places (every card of it) | pl:q1197997 | region | dot | cnh-524 |
| Jiangxi_Soviet | 3 · state | a card's places (every card of it) | pl:q1025459 | town | dot | cnh-607 |
| Kassites | 3 · people | a card's places (every card of it) | pl:q622719 | site | dot | wh-198 |
| Keftiu | 3 · people | a card's places — several candidates — pol:crete Crete; reg:1159102805 Crete | pol:crete, reg:1159102805 |  |  | gr-047 |
| Kingdom_of_Dahomey | 3 · state | a card's places (every card of it) | pl:q189685 | city | dot | wh-737 |
| Later_Liang_(Five_Dynasties) | 3 · dynasty/state | a card's places (every card of it) | pl:q208471 | city | dot | cnh-398 |
| Later_Tang | 3 · dynasty/state | a card's places (every card of it) | city:1159147063 | city | dot | cnh-399 |
| Later_Zhao | 3 · state | a card's places (every card of it) | pl:q58576 | city | dot | cnh-306 |
| Later_Zhou | 3 · dynasty/state | a card's places (every card of it) | pl:q208471 | city | dot | cnh-402 |
| Ligurians | 3 · people | a card's places (every card of it) | pl:q1256 | region | dot | rm-018 |
| Luddite | 3 · people | a card's places (every card of it) | pl:q41262 | city | dot | wh-791 |
| Mal'ta-Buret'_culture | 3 · culture | a card's places (every card of it) | pl:q35464055 | site | dot | wh-096 |
| Maroons | 3 · people | a card's places (every card of it) | pl:q4672706 | town | dot | wh-734 |
| Medes | 3 · people/state | a card's places (every card of it) | city:1159150133 | town | dot | wh-299 |
| Merya | 3 · people | a card's places (every card of it) | pl:q193342 | town | dot | ru-027 |
| Messapians | 3 · people | a card's places (every card of it) | pl:q735628 | region | dot | rm-020 |
| Minoan_civilisation | 3 · culture | a card's places (every card of it) | pol:crete | culture | face | gr-006 wh-262 |
| Muromachi_period | 3 · state | a card's places (every card of it) | city:1159149967 | city | dot | wh-538 |
| Nanzhao | 3 · state | a card's places (every card of it) | pl:q855228 | town | dot | cnh-386 |
| Nerva–Antonine_dynasty | 3 · dynasty/people | a card's places (every card of it) | city:1159151593 | capital | dot | rm-491 |
| Northern_Han | 3 · state | a card's places (every card of it) | city:1159151365 | city | dot | cnh-410 |
| Northern_Yuan | 3 · dynasty | a card's places (every card of it) | city:1159151595 | capital | dot | cnh-502 |
| Phoenicians | 3 · people | a card's places (every card of it) | pl:q3991738 | site | dot | wh-293 |
| Qajar_Iran | 3 · state | a card's places (every card of it) | city:1159151551 | capital | dot | wh-863 |
| Qin_dynasty | 3 · dynasty | a card's places (every card of it) | pol:qin | polity | face | wh-405 cnh-191 |
| Roman_Italy | 3 · state | a card's places (every card of it) | city:1159151593 | capital | dot | rm-180 |
| Samnites | 3 · people | a card's places (every card of it) | pl:q463459 | region | dot | rm-013 |
| Saqaliba | 3 · people | a card's places (every card of it) | city:1159151547 | capital | dot | ru-068 |
| Scythians | 3 · people | a card's places (every card of it) | pol:scythia | people | face | ru-005 |
| Seven_warring_states | 3 · state | a card's places — several candidates — pol:chu Chu; pol:han_state Han (state); pol:qi Qi; pol:qin Qin; pol:wei Wei; pol:yan Yan; pol:zhao Zhao | pol:chu, pol:han_state, pol:qi |  |  | cnh-164 |
| Sixth_Dynasty_of_Egypt | 3 · dynasty | a card's places (every card of it) | pl:q192134 | site | dot | eg-128 |
| Sogdian_Whirl_dance | 3 · culture | a card's places (every card of it) | city:1159150569 | town | dot | cnh-370 |
| Southern_Ming | 3 · state | a card's places (every card of it) | city:1159151385 | city | dot | cnh-539 |
| Southern_Tang | 3 · state | a card's places (every card of it) | city:1159151385 | city | dot | cnh-406 |
| Soviet_Union | 3 · state | a card's places (every card of it) | city:1159151585 | capital | dot | wh-900 |
| Thervingi | 3 · people | a card's places (every card of it) | pl:q431280 | site | dot | rm-601 |
| Three_Fanzhen_of_Hebei | 3 · state | a card's places (every card of it) | pl:q59898 | region | dot | cnh-379 |
| Tibetan_Empire | 3 · empire/state | a card's places (every card of it) | city:1159150879 | town | dot | cnh-384 |
| Toltec | 3 · culture/people | a card's places (every card of it) | pl:q1353133 | town | dot | wh-604 |
| Umbrians | 3 · people | a card's places (every card of it) | pl:q1280 | region | dot | rm-015 |
| Uyghur_Khaganate | 3 · empire/people | a card's places (every card of it) | pl:q2475401 | site | dot | cnh-385 |
| Vandal_Kingdom | 3 · state | a card's places (every card of it) | pl:q6343 | site | dot | rm-627 |
| Veneti | 3 · people | a card's places (every card of it) | city:1159150277 | town | dot | rm-019 |
| Volsci | 3 · people | a card's places (every card of it) | pl:q2137162 | site | dot | rm-017 |
| Western_Xia | 3 · state | a card's places (every card of it) | city:1159150889 | town | dot | cnh-465 |
| Wu_Zhou | 3 · dynasty | a card's places (every card of it) | city:1159147063 | city | dot | cnh-372 |
| Wuyue | 3 · state | a card's places (every card of it) | city:1159151387 | city | dot | cnh-405 |
| Yan_(state) | 3 · state | a card's places — several candidates — pl:q6192085 Ji (Beijing); pol:yan Yan | pl:q6192085, pol:yan |  |  | ko-056 |
| Yangzhou_salt_merchants | 3 · people | a card's places (every card of it) | pl:q57906 | city | dot | cnh-822 |
| Yuezhi | 3 · people | a card's places (every card of it) | pl:q319114 | town | dot | wh-588 |
| Zhou_dynasty | 3 · dynasty | a card's places (every card of it) | pol:zhou | polity | face | cnh-111 |
| Ancestral_Puebloans | 4 · people/culture | a card's locator coordinate — wh-619 | -108.4887,37.1838 | coordinate | dot | us-022 wh-619 |
| Anglo-Saxon_England | 4 · state | a card's locator coordinate — wh-490 | -1.38,53.13 | coordinate | dot | wh-490 |
| Bell_Beaker_culture | 4 · culture | a card's locator coordinate — wh-273 | -3.6183,40.1592 | coordinate | dot | wh-273 |
| Bulgars | 4 · people/state | a card's locator coordinate — the cards disagree — ru-014 ru-035 | 37,46 | coordinate | dot | ru-014 ru-035 |
| Chavín_culture | 4 · culture | a card's locator coordinate — wh-432 | -77.1785,-9.5928 | coordinate | dot | wh-432 |
| Cimmerians | 4 · people | a card's locator coordinate — ru-004 | 44.5301,48.3565 | coordinate | dot | ru-004 |
| Clovis_culture | 4 · culture | a card's locator coordinate — wh-101 | -103.3246,34.2779 | coordinate | dot | wh-101 us-006 |
| Cumans | 4 · people | a card's locator coordinate — ru-074 | 44.1323,47.4346 | coordinate | dot | ru-074 |
| Desert_Fathers | 4 · people | a card's locator coordinate — rm-613 | 30.3333,30.5833 | coordinate | dot | rm-613 |
| El_Omari_culture | 4 · culture | a card's locator coordinate — eg-017 | 31.3333,29.8453 | coordinate | dot | eg-017 |
| Erlitou_culture | 4 · culture | a card's locator coordinate — wh-243 cnh-062 | 112.689,34.693 | coordinate | dot | wh-243 cnh-062 |
| Garamantes | 4 · people | a card's locator coordinate — wh-421 | 13.064,26.544 | coordinate | dot | wh-421 |
| Gojoseon | 4 · state | a card's locator coordinate — ko-046 | 125.7475,39.0167 | coordinate | dot | ko-046 |
| Goths | 4 · people | a card's locator coordinate — ru-011 | 30.2167,48.75 | coordinate | dot | ru-011 wh-488 |
| Hemudu_culture | 4 · culture | a card's locator coordinate — cnh-803 | 121.15,30.05 | coordinate | dot | cnh-803 |
| Hongshan_culture | 4 · culture | a card's locator coordinate — cnh-047 | 118.8825,42.255 | coordinate | dot | cnh-047 |
| Jin_dynasty_(1115–1234) | 4 · dynasty/state | a card's locator coordinate — the cards disagree — cnh-293 cnh-473 | 112.4539,34.6197 | coordinate | dot | cnh-293 cnh-473 |
| Linear_Pottery_culture | 4 · culture | a card's locator coordinate — wh-137 | 8.9564,48.9328 | coordinate | dot | wh-137 |
| Mahajanapadas | 4 · state | a card's locator coordinate — wh-376 | 81.3929,25.339 | coordinate | dot | wh-376 |
| Mississippian_culture | 4 · culture | a card's locator coordinate — wh-617 | -83.6083,32.8367 | coordinate | dot | us-017 wh-617 |
| Mumun_pottery_culture | 4 · culture | a card's locator coordinate — jp-033 | 127.0305,36.2678 | coordinate | dot | jp-033 |
| Naqada_culture | 4 · culture | a card's locator coordinate — wh-203 | 32.7167,25.9 | coordinate | dot | wh-203 |
| Nok_culture | 4 · culture | a card's locator coordinate — wh-419 | 9.0833,9.5667 | coordinate | dot | wh-419 |
| Norte_Chico_civilisation | 4 · culture | a card's locator coordinate — wh-435 | -77.5203,-10.8936 | coordinate | dot | wh-435 |
| Pechenegs | 4 · people | a card's locator coordinate — ru-020 | 32.625,46.6425 | coordinate | dot | ru-020 |
| Republic_of_China_(1912–1949) | 4 · state | a card's locator coordinate — cnh-577 | 118.7789,32.0608 | coordinate | dot | cnh-577 pea-131 |
| Rus'_people | 4 · people | a card's locator coordinate — ru-030 | 8.0564,49.9747 | coordinate | dot | ru-030 |
| Sabines | 4 · people | a card's locator coordinate — rm-012 | 12.8667,42.4 | coordinate | dot | rm-012 |
| Sarmatians | 4 · people | a card's locator coordinate — ru-008 | 44.5301,48.3565 | coordinate | dot | ru-008 |
| Sclaveni | 4 · people | a card's locator coordinate — ru-022 | 28.4917,45.27 | coordinate | dot | ru-022 |
| Senones | 4 · people | a card's locator coordinate — rm-160 | 13.2167,43.7167 | coordinate | dot | rm-160 |
| Seven_Sages_of_the_Bamboo_Grove | 4 · people | a card's locator coordinate — cnh-300 | 113.448,35.224 | coordinate | dot | cnh-300 |
| Terramare_culture | 4 · culture | a card's locator coordinate — rm-007 | 10.93,44.62 | coordinate | dot | rm-007 |
| Third_Dynasty_of_Ur | 4 · state | a card's locator coordinate — wh-186 | 46.1051,30.9617 | coordinate | dot | wh-186 |
| Tuoba | 4 · people | a card's locator coordinate — cnh-331 | 111.828,40.379 | coordinate | dot | cnh-331 |
| Únětice_culture | 4 · culture | a card's locator coordinate — wh-274 | 14.3542,50.15 | coordinate | dot | wh-274 |
| Villanovan_culture | 4 · culture | a card's locator coordinate — rm-008 | 11.46,44.5 | coordinate | dot | rm-008 |
| Visigothic_Kingdom | 4 · state | a card's locator coordinate — rm-626 | 1.444,43.6045 | coordinate | dot | rm-626 |
| Vyatichi | 4 · people | a card's locator coordinate — ru-024 | 36.2223,52.3624 | coordinate | dot | ru-024 |
| Wari_Empire | 4 · state/culture | a card's locator coordinate — wh-610 | -74.1989,-13.0606 | coordinate | dot | wh-610 |
| Western_Zhou | 4 · dynasty | a card's locator coordinate — wh-251 | 108.72,34.21 | coordinate | dot | wh-251 cnh-112 |
| Wokou | 4 · people | a card's locator coordinate — cnh-520 | 122.1,29.73 | coordinate | dot | cnh-520 |
| Xia_dynasty | 4 · dynasty | a card's locator coordinate — cnh-012 | 113.0253,34.4553 | coordinate | dot | wh-244 cnh-054 cnh-012 |
| Yamnaya_culture | 4 · culture | a card's locator coordinate — wh-258 | 35.1667,47.8333 | coordinate | dot | wh-258 |
| British_Raj | 5 · state | Wikipedia title = registry row | pol:british_raj | polity | face | wh-837 |
| Navajo | 5 · people | name = one registry row | lake:9298 | lake | dot |  |
| Wa_(Japan) | 5 · people | name = one registry row | adm1:usa:us-wa | admin1 | face | ko-097 jp-041 |
| Xiongnu | 5 · people | Wikipedia title = registry row | pol:xiongnu | polity | face | cnh-225 |
| Aamu | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-165 |
| Aeolians | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Aequi | 6 · people/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Al-Andalus | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-468 |
| Alaska_Natives | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Alcmaeonids | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-304 |
| Argonauts | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-933 |
| Baiyue | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-793 |
| Benshengren | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | pea-147 |
| Booi_Aha | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-749 |
| Buyeo | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-064 |
| Campanians | 6 · people/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Chinese_Empire | 6 · empire | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-701 |
| Choctaw_code_talkers | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-094 |
| Cimbri_and_the_Teutones | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-297 |
| Cisalpine_Gauls | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-021 |
| Comanche | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-046 |
| Diadochi | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-751 |
| Dian_kingdom | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-789 |
| Dorians | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Dzungar_Khanate | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-547 |
| East_Slavs | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ru-023 |
| Eighteenth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Eighth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-143 |
| Eleventh_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-147 |
| Fifteenth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| First_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-057 |
| Five_Barbarians | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-304 |
| Five_kings_of_Wa | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-060 |
| Floating_population | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-687 |
| Four_Lords_of_the_Warring_States | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-184 |
| Fourteenth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Fourth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-098 |
| Frentani | 6 · people/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Gladiator | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-868 |
| God-fearer | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-927 |
| Hadza_people | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Haida | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Han_Chinese | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-774 |
| Hektemoroi | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-285 |
| Heracleidae | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-234 |
| Hernici | 6 · people/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Horatii | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-064 |
| Hui_people | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-787 |
| Hyksos | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-219 |
| Ionians | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Italic_peoples | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-009 |
| Japanese_colonial_empire | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-082 |
| Jews | 6 · people/culture | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Jin-Cha-Ji_Border_Region | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-645 |
| Julio-Claudian_dynasty | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-416 |
| Jurchen_people | 6 · people/culture | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-474 |
| Khitan_people | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-412 |
| Koreans | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-013 |
| Kotjebi | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | pea-111 |
| Laeti | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-691 |
| Lakota | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-048 |
| Landed_gentry_in_China | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Latins | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-010 |
| Legionary | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-646 |
| Liao_dynasty | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-411 |
| Libertus | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-808 |
| Lucanians | 6 · people/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Maasai | 6 · people/culture | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Mahan | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-068 |
| Mamertines | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-187 |
| Manchu_people | 6 · people/culture | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-782 |
| Manchukuo | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ww2-089 cnh-633 |
| Mandan | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Marius_and_Sulla | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-351 rm-294 rm-309 |
| Marrucini | 6 · people/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Marsi | 6 · people/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Medjay | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-166 |
| Menfa | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-298 |
| Miao_people | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-790 |
| Mithraic_mysteries | 6 · empire | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-924 |
| Nationalist_government | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-597 |
| Native_Americans_in_the_United_States | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | us-001 |
| Nineteenth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Ninth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Northern_Qi | 6 · dynasty/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Okjeo | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-066 |
| Ostrogothic_Kingdom | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-636 |
| Overseas_Chinese | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-857 |
| Paeligni | 6 · people/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Paleo-Indians | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-100 us-005 |
| Persia | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | gr-441 |
| Picentes | 6 · people/culture | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Plebs_urbana | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-812 |
| Red_Guards | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-671 |
| Retiarius | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-870 |
| Roman_matron | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-794 |
| Romani_people | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Rouran_Khaganate | 6 · empire | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-779 |
| Samhan | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-067 |
| Samurai | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-544 |
| San_peoples | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Second_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-067 |
| Semu | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-490 |
| Seres | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-785 |
| Seventeenth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Seventh_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-142 |
| Shang_royal_women | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-101 |
| Shanxi_merchants | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-747 |
| Shatuo | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-780 |
| Sixteenth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Taiwanese_indigenous_peoples | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | pea-159 |
| Tangut_people | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-466 |
| Tenth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-145 |
| Third_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-092 |
| Thirteenth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-200 |
| Thirtieth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Thirty-first_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Three_Kingdoms | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-414 cnh-273 |
| Tibetans | 6 · people/culture | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-784 |
| Tlingit | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Toraijin | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-055 |
| Twelfth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  | eg-175 |
| Twentieth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-eighth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-fifth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-first_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-fourth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-ninth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-second_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-seventh_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-sixth_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Twenty-third_Dynasty_of_Egypt | 6 · dynasty | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Uyghurs | 6 · people/culture | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-786 |
| Varangians | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ru-029 |
| Verna_(slave) | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | rm-805 |
| Vestini | 6 · people/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Vikings | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | wh-498 |
| Waishengren | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | pea-148 |
| Wang_Jingwei_regime | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-643 |
| Western_Wei | 6 · dynasty/state | tagged a place, no join (needs a Wikidata lookup) |  |  |  |  |
| Xianbei | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-082 |
| Xianyun | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-131 |
| Xie_clan_of_Chen_Commandery | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-315 |
| Yamato_polity | 6 · state | tagged a place, no join (needs a Wikidata lookup) |  |  |  | jp-051 |
| Yemaek | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | ko-051 |
| Yi_people | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-792 |
| Zhuang_people | 6 · people | tagged a place, no join (needs a Wikidata lookup) |  |  |  | cnh-791 |
