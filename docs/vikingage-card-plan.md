# The Viking Age — a 1000-card running order

## How to use this (the whole point of the file)

A thousand cards is more than one session can write, and a collection grown a card at a time
without a plan drifts: the topics a session happens to find sources for get written, the ones that
need work do not, and after three hundred cards the collection is a survey of whatever was easy.
So the running order is fixed **in advance**, here, and a session's job is the next card rather
than the next decision.

**"Generate the next Viking Age card" means: take the lowest `vk-NNN` not yet in `data.js`, read
its topic and its deck off the list below, research it, and add it** with
`node .claude/add-card.js <card.json> <deckId>` — **always passing the deck id**, since without one
`add-card.js` files the card in the first leaf of the whole tree, which is in China.

The next id:

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='vk-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

## What a line in this list is, and is not

A line is **a subject to research**, not a fact to assert and not always the finished answer term.
The research decides what the card's answer is; where the line turns out to name something the
sources will not carry, or something a card already written has spent, **rename, split or drop the
line — in the same commit as the card, and say so.**

What a line is never allowed to become is a card filed somewhere the plan does not name. If a topic
has nowhere to go, the plan needs changing, not the tree.

## Making the collection

The collection node, its tree, its `COLL_THEME` hue and a new `ICON_SYMBOLS` mark ship with this
plan. It needs **no `COLLECTION_SECTION` row**, and that is the point rather than an omission:
`sectionOf` returns History for anything the table does not name, so the correct action for a
history collection is to add nothing. A row reading `vikingage: "History"` would be inert and would
invite the next reader to take that table for a list of every collection. This is the fourth
collection that rule has applied to, after France, the First World War and Mesopotamia.

### The hue: `#782C00`, rust and bog iron — and what it cost

Thirty-six collections in, the shelf's remaining space is not where the subject wants it. Every
colour the Viking Age actually means was measured and refused:

| candidate | what it is | nearest neighbour | ΔE | density |
|---|---|---|---|---|
| `#4E4842` | iron grey | `ww2` | **4.0** | — |
| `#4A6572` | North Sea grey-blue | `france` | 11.6 | 10 |
| `#3D5A5B` | fjord blue-green | `phil` | 8.8 | — |
| `#4C6B8A` | cold Atlantic blue | `col-13` | 16.1 | 6 |
| `#5B6B3A` | woad and moss | `mid` | 6.9 | — |
| `#A8761E` | Baltic amber | `lang-spanish` | 7.8 | — |
| `#6B2A22` | oxblood | `col-42` | 13.5 | 9 |

The iron grey is the sharpest refusal: at **4.0** from the Second World War's own hue it is not a
separate colour at all. The cold Atlantic blue is the interesting one, because it survived on
numbers and was refused for a better reason than its number — **Ancient Greece's hue *is* the
Aegean**, so a second sea-blue collection would put two collections one section apart both meaning
*the sea*. That is the France plan's own refusal (its *bleu de France* candidate's nearest
neighbour was the French language deck) met again from the other side.

Two regions still score at the top of every sweep and **must not be re-swept**: the magenta band
around `#C757B0`, refused eleven times now, and the olive-brass band, refused as the fourth member
of the yellow-green-brown quarter and now carrying a sixth.

What ships is **`#782C00`** — rust, bog iron, the oxide that iron becomes in a Scandinavian bog
and that the bog gave back as the ore every northern smith worked from. Its numbers, measured
against all 36 shelf hues in CIELAB:

- nearest neighbour **18.8** (`lang-german`'s brown) — and it is not one neighbour but **four**:
  `mesopotamia` 18.9, `lang-spanish` 19.0, `col-42` 19.2, against a shelf median of 20.0
- density **6** shelf hues within ΔE 30, against a shelf median of 7 and a maximum of 10
- L 29, C 51, contrast against white 9.7:1

**State those plainly rather than quoting the single nearest: 18.8 is below the median and below the
Cold War's 19.2, so this is the worst-separated hue the shelf has accepted, and four hues are packed
into the half-unit between 18.8 and 19.2.** What buys it is the other
column — density 6 is *better* than the median and much better than the Cold War's 9 — and the
swatch, which is the thing to check before moving it. **All four neighbours were rendered beside it
as banners before it was accepted**, and at L29 C51 it reads as a deep burnt sienna: plainly a
different object from `lang-german`'s duller brown (C32 against C51), from Mesopotamia's olive-ochre,
from Russia's brighter red and from the Spanish deck's much lighter burnt orange. It adds an **oxide** family to a
shelf whose seven reds are all brighter than it.

**Every softening costs separation fast and was measured**: `#7A3008` → 16.7, `#80340C` → 15.8,
`#853610` → 14.5, `#72300A` → 12.5. `#782C00` is the local optimum, so do not drift it lighter.

### The icon: a Dane axe — and the hammer that was drawn first and would not render

`k: "axe"`. A broad blade on a haft carried at an angle, which is the one construction of this
subject that survives 24 pixels. **It is not the icon this collection wanted**, and the account of
why is the useful part.

**A Thor's hammer was drawn first**, on the argument the collection would rather make: the pendant,
not the weapon, is the object that turns up in Scandinavia, England, Ireland, Iceland, Russia and
the Baltic alike, worn by ordinary people, and on some graves worn beside a cross. **Fifteen
proportions of it were drawn, rendered at 24, 28, 34 and 48 px and looked at, and every one failed
in one of two ways.** Head down, the flaring head over a stub haft reads as **a plant pot** at every
size and every proportion tried; the same form with a suspension loop reads as **a rubber stamp**.
Head up, the symmetry is the problem and it is not fixable by proportion — **a bar across the top of
a vertical stroke is the letter T**, and every recognisable hammer glyph escapes that by being
*asymmetric* (a claw, a peen, a wedge on one side), which a Mjölnir by definition is not. **Do not
re-draw it.** The measurement is that a symmetric object with a stem cannot carry this slot.

Four other constructions were drawn and refused the same way, and in every case the fault was
**shared construction rather than shared subject**:

- **A longship.** The obvious mark, and it cannot be made: a longship is a wide-low object in a
  square grid, so at 24 px the hull and the sail collapse into a moustache. Separate attempts read as
  a basket, a hat and a frying pan. `ship` and `anchor` exist besides.
- **A ship's prow curling into a spiral.** Reads as a shepherd's crook, or as a question mark.
- **A square sail on a mast.** Reads as the Chinese character 中 — which on a shelf carrying a China
  collection is the worst possible accident.
- **A drinking horn.** Reads as a swoosh, and a cleaner horn would collide with `moon`.
- **A Gotland picture stone.** Reads as a keyhole or a lightbulb.
- **A round shield.** A circle with an inner boss is `coin`'s construction (circle inside circle) and
  `compass`'s (circle with an inner figure).
- **A runestone.** A slab with a rounded top is `arch`'s silhouette exactly.
- **A triquetra.** Three overlapping rings are `atom` and `ringed`'s construction family.
- **A valknut.** Refused on grounds nothing to do with legibility: it is a symbol modern extremists
  have taken, which `vk-978` cards as a problem. A collection cannot card the appropriation and wear
  the symbol.

**What the axe costs is stated rather than hidden.** The collection's central correction is that
*víkingr* is a job most Scandinavians never did, and its emblem is now a weapon — which leans on
exactly the warrior image deck 9 spends 25 cards unpicking. That trade was made with the alternatives
above in front of it: an icon nobody can read is worse than an icon that over-weights one deck, and
the Dane axe is at least a real object this collection cards (`vk-707`) rather than a horned-helmet
invention. **If a legible non-martial construction is ever found, it should replace this.**

The geometry: **the haft is DIAGONAL and that is what makes it work** — nothing else on the shelf is
drawn on a diagonal, so the mark is distinguishable by its axis before a reader has resolved the
blade at all. **The haft crosses the blade rather than stopping at it**, which is what an axe does
and what stops the pair reading as the letter P; a blade sitting beside the top of an upright haft
was drawn six times and reads as **P** or as a flag at every size. `raven` is Westeros's, and `wall`,
`sword` and `crown` are taken.

## What this collection is about

**Scandinavia and the Scandinavian diaspora, roughly 750 to 1100.** Not "the Vikings" as a people,
because there was no such people: *víkingr* in Old Norse is a **job** — a man on a raiding voyage —
and the overwhelming majority of the people in this collection never went on one. They farmed
barley on a Norwegian fjord, spun wool in Jutland, smelted bog iron in Swedish forest, argued a
land case at a local thing, and died on the farm they were born on.

So the collection is not a raiding collection with some context attached. **Farming, law, craft and
trade get a whole deck of 120 cards (deck 7), belief gets 120 (deck 8), and the ships get 100 of
their own (deck 2)** — against 220 for the raids and settlements west and south. That is the
central scope decision and every other one follows from it.

## Is there a thousand cards in this?

Yes, and the reason is the arithmetic above rather than the raids. A collection that carded only
the raiding would run out at about three hundred: the annals record raid after raid and most of
them say nothing but a date, a place and a number of ships. What fills a thousand is that this is
**three centuries of an entire society**, unusually well served by archaeology — the ships, the
towns, the farms, the graves, the runestones, the hoards — and a diaspora that reaches from
Newfoundland to Baghdad.

The shares are stated so the collection cannot drift into whichever part has the most popular
writing behind it:

- **220** on raiding and settlement in the west and south (decks 3–4)
- **220** on the eastern road and the North Atlantic (decks 5–6)
- **240** on life at home and belief (decks 7–8)
- **210** on the evidence, the pre-history and the ships (decks 1–2)
- **110** on the kingdoms, the ending and the afterlives (deck 9)

## Six scope decisions

**1. The period is about 750 to 1100, not 793 to 1066.** The familiar dates are an English artefact:
793 is a raid on an English monastery and 1066 is an English battle, and a collection that took them
as the period's edges would be dating Scandinavian history by English events. `vk-096` Salme is a
ship-borne Scandinavian war party in Estonia around 750, forty years before Lindisfarne; the
eastern trade at Staraya Ladoga begins before 793; and in Iceland, Greenland and the Rus' the
period runs on past 1066 by any measure. **`vk-110` and `vk-965` card the question of the dates
themselves, and `vk-965`'s honest answer is that the period is a convenience.**

**2. A *víkingr* is a job, not a people.** See above. Concretely: no card may use "the Vikings" as
the subject of a sentence about ordinary Scandinavian life, and `vk-235` is *The word Viking and what
it meant*, placed early in deck 3 so a reader meets the correction before the raids.

**3. The evidence is the spine, and deck 1 is what says so.** Thirty cards on the sources come
first, before any raid. The reason is that this subject's evidence is lopsided in a way that shapes
every conclusion drawn from it: **nearly all the contemporary writing is by the victims** — English,
Irish and Frankish churchmen describing attacks on churches — while the Scandinavian accounts are
**Icelandic sagas written two to three centuries later** by Christians about pagans, and the few
eyewitness descriptions of Scandinavians in their own element are **Arabic**, by travellers meeting
them on the Volga. `vk-004` *Why the victims' records shape the whole picture*, `vk-012` *Why a saga
is not a chronicle* and `vk-016` *The Arabic geographers on the Rus'* carry it, and **every other
card in the collection inherits them**: where a claim rests on one saga, or on one annal, the card
says which.

**4. This is a history collection, not an archaeology collection.** The house rule bites hard here,
because the archaeology is the best part of the evidence and the temptation is to card the dig. So:
`vk-192` is the Oseberg **ship**, `vk-193` the **burial and the two women in it**, and neither is a
card about Gabriel Gustafson's excavation; `vk-250` is the Repton **winter camp**, not the 1980s
season that found it. **A card may say how we know — that is deck 1's whole job — and may not
become a card about the knowing.** Where the discovery itself is the fact worth having, the card
says so and is placed accordingly: `vk-970` *The discovery of the ship burials* sits in the
afterlives deck, where it belongs.

**5. The slave trade is carded plainly, not as a footnote.** Raiding took captives, and slaves were
one of the two staples of the eastern trade beside furs; Dublin was a slave market and so was Rouen.
Ten lines card it directly — `vk-234`, `vk-309`, `vk-376` (Rouen), `vk-451`, `vk-476`, `vk-477`,
`vk-700`, `vk-766`, `vk-767` and `vk-996` — and **`vk-029` *The silence of the enslaved in
the record*** states the evidential problem, which is that almost everything known about these
people is written by the people who sold them. A collection that carded the trade goods and left the
human ones as a line in a trade card would be repeating the sources' own silence.

**6. The horned helmet, the romanticism and the modern appropriation are carded, in deck 9.** The
popular image of this subject is a nineteenth-century invention with a twentieth-century political
afterlife, and both are matters of record rather than opinion: `vk-973` *Where the horned helmet came
from*, `vk-976` *Nazi appropriation of Norse symbols*, `vk-978` *Norse symbols and the modern far
right*, `vk-979` *How museums handle the symbols now*. The cards describe what was done with the
material and by whom; they take no position on any living movement beyond what the documented record
carries, on the same rule the Korea plan applies to a state's account of its own actions.

## The overlaps, measured

Measured against every shipped card and every plan on the shelf, rather than guessed at. Roughly
**forty lines elsewhere** touch this subject, which is fewer than the First World War's hundred and
more than Mesopotamia's.

| collection | lines | what they are |
|---|---|---|
| Russia (`col-42`) | ~16 | the Rus', from Rurik to Yaroslav |
| World History (`col-8`) | 7 | `wh-448`, `wh-491`, `wh-498`–`wh-501`, `wh-504` — the headline set |
| Visual Art (`art`) | 6 | six **objects**: `art-186`/`art-187` Sutton Hoo, `art-193` the Lindisfarne Gospels, `art-206` the Oseberg animal-head post, `art-215` the Jelling stone, `art-227` the Urnes portal, `art-228` the Bayeux Tapestry |
| Middle-earth (`mid`) | 5 | `mid-037`, `mid-063`, `mid-064`, `mid-066`, `mid-647` — Tolkien's Norse sources |
| France (`france`) | 3 | `fr-095`, `fr-118`, `fr-939` — the Norman settlement as French history |
| Westeros (`wes`) | 3 | `wes-047`, `wes-057`, `wes-058` — what a novelist made of the material |

**The division of labour is one sentence per neighbour.**

- **Russia cards the Rus' as Russian and Ukrainian history; this collection cards it as the eastern
  reach of a Scandinavian diaspora.** `ru-011` onwards is the making of a state; `vk-481`–`vk-515` is
  a 35-card subdeck asking who those people were, what the archaeology says, and **when they stopped
  being Scandinavian** (`vk-515`). The Normanist controversy is carded here, twice and deliberately —
  `vk-487`/`vk-488` for the argument and `vk-992` for its historiography — because it is an argument
  about Scandinavians.
- **World History cards the headline and this collection cards the subdeck**, as with Greece and
  France. `wh-448` is one card on the Viking expansion; `vk-211`–`vk-330` is 120.
- **`art` cards the object and this collection cards what it is evidence for.** The Jelling stone is
  `art-215` as a carved monument and `vk-849`/`vk-850` as Harald Bluetooth's claim to have made the
  Danes Christian. Four lines here are titled that way on purpose.
- **Middle-earth and Westeros card what writers made of this material; this collection cards the
  material.** `vk-972` *Wagner and the Ring* and `vk-981` *The Vikings on screen* are the seam, and
  they are about the reception rather than about Tolkien's or Martin's own work.
- **Architecture holds no overlap at all, which is a gap in Architecture rather than an overlap
  here.** `arch-505` is the Norman church in England and `arch-153` is the *Neolithic* longhouse;
  **the stave church and the Norse hall appear in no plan on the shelf**, so `vk-681`–`vk-700` and
  `vk-883`–`vk-885` are writing them for the first time.

## Sourcing

This is among the better-served subjects on the shelf, and the reason is that Scandinavian
archaeology publishes openly.

- **The primary written sources are all out of copyright and online.** The Anglo-Saxon Chronicle, the
  Annals of St-Bertin, the Irish annals (CELT, at University College Cork, has the Annals of Ulster
  and the Annals of the Four Masters with translations), the Primary Chronicle, Adam of Bremen and
  Saxo. **The Icelandic sagas are at the Icelandic Saga Database and in the Íslenzk fornrit
  editions**, and `sagadb.org` carries public-domain translations.
- **Two of Tolkien's sources are already in Folio's Library with their original-language column** —
  `beowulf` with `beowulf.ang`, and `poetic-edda` and `prose-edda` — so **`card.quote` is available
  to this collection in a way it is not to most**, for the mythology and poetry decks above all.
- **The journals are substantially open.** *Viking and Medieval Scandinavia*, *Journal of the North
  Atlantic*, *Acta Archaeologica*, *Fornvännen* (free, with a full back catalogue),
  *Medieval Archaeology*, and the Scandinavian national heritage agencies' own report series.
  **DOAJ and OpenAIRE are worth searching before assuming a paper is shut**, and much Scandinavian
  scholarship is written in English.
- **The museums publish their objects.** The National Museum of Denmark, the Museum of Cultural
  History in Oslo (the Oseberg and Gokstad ships), the Swedish History Museum, the Viking Ship
  Museum at Roskilde, and **Samnordisk runtextdatabas** (the Scandinavian Runic-text Database),
  which is the authority for any runestone card.
- **One trap, and it is the same one the Middle-earth plan records.** The popular literature on this
  subject is enormous, largely uncited, and routinely presents nineteenth-century invention and
  saga narrative as fact. **A reconstruction on a museum's own site is a source for what that museum
  argues, not for what happened**, and a television series' historical consultant is not a source at
  all.

## Dates, names and spellings

- **Anglicised Old Norse, without accents or thorns, because `answerText` is what a reader types.**
  *Thor*, not *Þórr*; *Odin*, not *Óðinn*; *Harald Hardrada*, not *Haraldr harðráði*; *Njal's saga*,
  not *Njáls saga*. The Old Norse form belongs in the prose, in italic, on first mention.
- **The patronymic is given as the sources give it**, so *Olaf Tryggvason* and *Olaf Haraldsson*
  rather than inventing surnames — and the two Olafs are carded four lines apart on purpose
  (`vk-870` and `vk-872`), because conflating them is the commonest error in popular accounts.
- **Place-names take the modern local form with the Norse form beside it**: *Kyiv*, not *Kiev*
  (the Russia plan's own rule, and this collection follows it); *Staraya Ladoga* with *Aldeigjuborg*;
  *Istanbul's* Viking-Age name is *Constantinople*, and *Miklagard* is what the Norse called it, so
  `vk-516` is titled *Miklagard*.
- **Hedeby, not Haithabu**; **Birka**, **Kaupang**, **Jelling**, **Uppsala** — the standard English
  scholarly forms.
- **A saga date is not a date.** A saga written in 1250 giving a year for an event in 980 is evidence
  of thirteenth-century tradition, and a card that puts that year on the date line has asserted more
  than the source carries. Where the only date is a saga's, **the date line says so in words or is
  left empty**, and `test-date-line.js` is what catches the alternative — a non-empty line yielding
  no sort year.
- **Two dates are genuinely contested and both are carded as contested**: Iceland's conversion
  (999 or 1000, `vk-596`) and the start of the Viking Age (`vk-110`).

## The glossary

**Twenty-four of this collection's terms already exist**, written for the Russia, World History,
Visual Art and geography collections — and the sharpest of them is **`Vikings` itself, which already
claims the bare aliases *Viking* and *Viking Age***. So the pairing rule is already satisfied for the
collection's own name, **and `add-glossary.js` would overwrite that term in silence**: the Korea
`Seoul` scar. **Widen; do not re-key.** The full existing set:

`Vikings`, `Scandinavia`, `Denmark`, `Norway`, `Sweden`, `Iceland`, `Greenland`, `Vinland`,
`Kievan_Rus'`, `Norman_Conquest`, `Lindisfarne_raid`, `Alfred_the_Great`, `Dublin`, `Sutton_Hoo`,
`Slavery`, `Settlement`, `Silver`, `Iron`, `Constantinople`, `Byzantine_Empire`,
`Abbasid_Caliphate`, `Charlemagne`, `Kyiv`, `Amber`.

Everything else starts from nothing — there is no `Danelaw`, no `Longship`, no `Runestone`, no
`Althing`, no `Odin`, no `Thor`, no `Saga`, no `Edda`, no `Old_Norse`, no `Normandy`, no `Novgorod`
and no `Varangian_Guard` — so expect the glossary to grow faster here than anywhere since Korea.

**The trap is the ordinary-word one and it is severe, measured over the shipped corpus:**

| term | abstracts containing the bare word | key it as |
|---|---|---|
| thing (the assembly) | **209** | `Thing_(assembly)` |
| ship | 80 | `Longship` and `Knarr`, never `Ship` |
| hall | 79 | `Longhouse` / `Chieftain's_hall` |
| shield | 70 | `Round_shield` |
| raid | 20 | no term; the raids are carded, the word is not |
| hoard | 13 | `Silver_hoard` |
| feud | 8 | `Feud_(Scandinavian_law)` |
| earl | 7 | `Jarl`, which is free |

**`Thing` is the worst case on the whole shelf** — it is one of the commonest nouns in English, and
a term claiming that surface would auto-link 209 abstracts to a definition of a Norse assembly.
Key it parenthetically on `Life_(biology)`'s rule, reach it through the narrower aliases
*thing* is not — `Althing`, `Thingvellir`, `husthing` — and hand-write a `data-k` where an
individual card needs it.

**Eight of the collection's own words are free and claim nothing wrongly**, measured at zero
occurrences in the corpus: `rune`, `longship`, `thrall`, `skald`, `jarl`, `berserk`, `fjord`,
`saga` (4 occurrences, all of them this sense). Claim those bare.

## Difficulty and the minigames

The ratings will skew easier than most collections on the shelf, because this subject's vocabulary
is unusually well known: *Viking*, *Thor*, *Odin*, *longship*, *rune*, *Valhalla* and *Ragnarok* are
household words, which is difficulty **1**. That is a real asset — it gives the daily games a pool
this collection genuinely feeds — and it is also the trap the ratings exist to catch, since the same
decks hold *Dróttkvætt*, *Gragas*, *Nordrsetur* and *Uppåkra*, which are **4** and **5**. **Rate the
word a stranger would be shown, not the card.**

**`undatable: true` is rarely right here**: nearly everything happened at a datable moment, which
makes this good Timeline material. The exceptions are the practices and the institutions — the
thing, the feud, outlawry, the leidang, clinker building — and the mythology, where a myth is
undatable by definition.

## Allocation

| deck | id | cards | ids |
|---|---|---|---|
| The evidence and its limits | `vk-ev` | 30 | `vk-001`–`vk-030` |
| The northern lands | `vk-lands` | 20 | `vk-031`–`vk-050` |
| Scandinavia in the Iron Age | `vk-ironage` | 30 | `vk-051`–`vk-080` |
| The Vendel and Merovingian centuries | `vk-vendel` | 30 | `vk-081`–`vk-110` |
| Building a ship | `vk-shipbuild` | 30 | `vk-111`–`vk-140` |
| Ships and their kinds | `vk-shiptypes` | 25 | `vk-141`–`vk-165` |
| Navigation and the sea road | `vk-nav` | 25 | `vk-166`–`vk-190` |
| The ship finds | `vk-shipfinds` | 20 | `vk-191`–`vk-210` |
| The first raids | `vk-first` | 25 | `vk-211`–`vk-235` |
| England and the great army | `vk-england` | 35 | `vk-236`–`vk-270` |
| The Danelaw and Scandinavian England | `vk-danelaw` | 25 | `vk-271`–`vk-295` |
| Ireland and the Irish Sea | `vk-ireland` | 20 | `vk-296`–`vk-315` |
| Scotland, the isles and the far north | `vk-scotland` | 15 | `vk-316`–`vk-330` |
| Raids on Francia | `vk-francia` | 30 | `vk-331`–`vk-360` |
| The making of Normandy | `vk-normandy` | 25 | `vk-361`–`vk-385` |
| Iberia and al-Andalus | `vk-iberia` | 25 | `vk-386`–`vk-410` |
| The Mediterranean and the far south | `vk-med` | 20 | `vk-411`–`vk-430` |
| The Baltic and its shores | `vk-baltic` | 25 | `vk-431`–`vk-455` |
| The river roads | `vk-rivers` | 25 | `vk-456`–`vk-480` |
| The Rus' | `vk-rus` | 35 | `vk-481`–`vk-515` |
| Constantinople and the Varangians | `vk-varangian` | 25 | `vk-516`–`vk-540` |
| The Northern Isles, the Faroes and the empty lands | `vk-faroe` | 20 | `vk-541`–`vk-560` |
| Iceland | `vk-iceland` | 40 | `vk-561`–`vk-600` |
| Greenland | `vk-greenland` | 30 | `vk-601`–`vk-630` |
| Vinland and North America | `vk-vinland` | 20 | `vk-631`–`vk-650` |
| Farm, field and food | `vk-farm` | 30 | `vk-651`–`vk-680` |
| House, hall and household | `vk-house` | 20 | `vk-681`–`vk-700` |
| Craft and material | `vk-craft` | 25 | `vk-701`–`vk-725` |
| Trade, towns and silver | `vk-trade` | 25 | `vk-726`–`vk-750` |
| Law, assembly and violence | `vk-law` | 20 | `vk-751`–`vk-770` |
| The gods and the myths | `vk-gods` | 35 | `vk-771`–`vk-805` |
| Ritual, burial and the dead | `vk-ritual` | 30 | `vk-806`–`vk-835` |
| Runes, poetry and memory | `vk-runes` | 25 | `vk-836`–`vk-860` |
| The coming of Christianity | `vk-christ` | 30 | `vk-861`–`vk-890` |
| The making of the three kingdoms | `vk-kings` | 30 | `vk-891`–`vk-920` |
| Cnut's North Sea empire | `vk-empire` | 20 | `vk-921`–`vk-940` |
| 1066 and the end of the Viking Age | `vk-end` | 25 | `vk-941`–`vk-965` |
| Afterlives, romanticism and misuse | `vk-legacy` | 20 | `vk-966`–`vk-985` |
| The historiography | `vk-hist` | 15 | `vk-986`–`vk-1000` |

**1000 cards, 9 decks, 39 leaf subdecks.**

# The list

## The north before the raids, and how we know

### The evidence and its limits — `vk-ev`

    vk-001  Who wrote the sources for the Viking Age
    vk-002  The Anglo-Saxon Chronicle as a source
    vk-003  The annals of the Frankish monasteries
    vk-004  Why the victims' records shape the whole picture
    vk-005  The Irish annals
    vk-006  The Icelandic sagas
    vk-007  When the sagas were written down
    vk-008  Snorri Sturluson
    vk-009  Heimskringla
    vk-010  The sagas of Icelanders
    vk-011  The kings' sagas
    vk-012  Why a saga is not a chronicle
    vk-013  Skaldic verse as historical evidence
    vk-014  Why skaldic verse is dated more confidently than prose
    vk-015  Ibn Fadlan
    vk-016  The Arabic geographers on the Rus'
    vk-017  The Byzantine sources
    vk-018  Rimbert's Life of Ansgar
    vk-019  Adam of Bremen
    vk-020  Saxo Grammaticus
    vk-021  Runic inscriptions as a source
    vk-022  Archaeology as the independent witness
    vk-023  Dendrochronology in Scandinavian archaeology
    vk-024  What radiocarbon dating can and cannot settle
    vk-025  Isotope analysis and where a person grew up
    vk-026  Ancient DNA and the Viking Age
    vk-027  What the coin hoards record
    vk-028  Place-names as evidence of settlement
    vk-029  The silence of the enslaved in the record
    vk-030  What the evidence cannot tell us

### The northern lands — `vk-lands`

    vk-031  The geography of Scandinavia
    vk-032  The Norwegian coast and its fjords
    vk-033  Why the sea was the road
    vk-034  The Danish islands and Jutland
    vk-035  The Swedish lakes and the Malaren basin
    vk-036  Lake Malaren and the land rising out of the sea
    vk-037  The forests of the north
    vk-038  The mountains and the summer pastures
    vk-039  Iron from the bog
    vk-040  Soapstone
    vk-041  Whetstone from Eidsborg
    vk-042  Walrus ivory and the Arctic hunt
    vk-043  Sapmi and the Sami
    vk-044  The Finnar of the sagas
    vk-045  The tribute from the north
    vk-046  Climate in the Viking Age
    vk-047  The Medieval Climate Anomaly
    vk-048  Where people could farm and where they could not
    vk-049  Sea level and the drowned harbours
    vk-050  Why the North Atlantic was crossable

### Scandinavia in the Iron Age — `vk-ironage`

    vk-051  The Bronze Age inheritance
    vk-052  The Pre-Roman Iron Age in Scandinavia
    vk-053  The Roman Iron Age in the north
    vk-054  Roman imports in Scandinavian graves
    vk-055  The Hjortspring boat
    vk-056  The Nydam ship
    vk-057  The weapon deposits in the bogs
    vk-058  Illerup Adal
    vk-059  The bog bodies of Denmark
    vk-060  Tollund Man
    vk-061  The Migration Period in Scandinavia
    vk-062  Gold bracteates
    vk-063  The gold hoards of the fifth century
    vk-064  The dust veil of 536
    vk-065  The Fimbulwinter and the year without summer
    vk-066  Abandoned farms of the sixth century
    vk-067  Ryggeskogen and the deserted settlements
    vk-068  The hillforts of the Migration Period
    vk-069  Eketorp
    vk-070  Sandby borg
    vk-071  The rise of the hall
    vk-072  Gudme
    vk-073  Uppakra
    vk-074  Central places
    vk-075  Guldgubbar and the gold foil figures
    vk-076  The warband as an institution
    vk-077  The retinue and its lord
    vk-078  Runes before the Viking Age
    vk-079  The Elder Futhark
    vk-080  The Golden Horns of Gallehus

### The Vendel and Merovingian centuries — `vk-vendel`

    vk-081  The Vendel Period
    vk-082  Vendel and Valsgarde
    vk-083  The boat graves of Uppland
    vk-084  Old Uppsala
    vk-085  The mounds at Old Uppsala
    vk-086  The Ynglinga dynasty
    vk-087  What the Ynglinga saga claims and what it shows
    vk-088  Helgo
    vk-089  The Buddha of Helgo
    vk-090  Ribe
    vk-091  Why Ribe is the oldest town in Denmark
    vk-092  Birka's beginnings
    vk-093  Staraya Ladoga
    vk-094  The first Scandinavians on the eastern rivers
    vk-095  The Salme ship burials
    vk-096  Why Salme matters for the start of the Viking Age
    vk-097  The sail reaches Scandinavia
    vk-098  Why the sail changed everything
    vk-099  Boat-building before the sail
    vk-100  The Kvalsund boat
    vk-101  The Sutton Hoo ship burial and its northern connections
    vk-102  Beowulf and Scandinavian tradition
    vk-103  Kings and chieftains before 793
    vk-104  Tribute, gift and the economy of a chieftain
    vk-105  Population pressure as an explanation
    vk-106  Silver shortage as an explanation
    vk-107  The technological explanation for the Viking Age
    vk-108  The political explanation for the Viking Age
    vk-109  Why there is no single cause
    vk-110  When the Viking Age began

## Ships, seafaring and the sea road

### Building a ship — `vk-shipbuild`

    vk-111  Clinker building
    vk-112  The strakes and the lapped seam
    vk-113  Why a clinker hull flexes
    vk-114  The keel
    vk-115  Choosing and felling the timber
    vk-116  Radially split planks
    vk-117  Why a split plank is stronger than a sawn one
    vk-118  The shipwright's tools
    vk-119  The broad axe
    vk-120  The T-shaped axe and the adze
    vk-121  Iron rivets and roves
    vk-122  Caulking with tarred animal hair
    vk-123  Tar production in the Viking Age
    vk-124  The tar kilns of Sweden
    vk-125  Ribs and crossbeams
    vk-126  The mast step and the kerling
    vk-127  The keelson
    vk-128  The steering oar
    vk-129  Making the sail
    vk-130  Wool sails and the labour they cost
    vk-131  How much wool a sail took
    vk-132  Rigging and the beitass
    vk-133  The anchor
    vk-134  Oars and oar ports
    vk-135  The shield rack
    vk-136  Painting and decorating a hull
    vk-137  How long a ship took to build
    vk-138  Repairing and rebuilding a ship
    vk-139  The working life of a ship
    vk-140  Boathouses and winter storage

### Ships and their kinds — `vk-shiptypes`

    vk-141  The longship
    vk-142  Why the longship is shallow
    vk-143  The langskip and its names
    vk-144  The snekkja
    vk-145  The skeid
    vk-146  The drakkar and what the sources actually call a ship
    vk-147  The knarr
    vk-148  Why a cargo ship is a different shape
    vk-149  The byrding
    vk-150  Small boats and the faering
    vk-151  River boats and portage craft
    vk-152  Crew size and how it is estimated
    vk-153  How fast a Viking ship could sail
    vk-154  How much cargo a knarr could carry
    vk-155  Rowing and when it was used
    vk-156  Sailing to windward
    vk-157  Seaworthiness in the open Atlantic
    vk-158  Livestock at sea
    vk-159  Water and food on a long passage
    vk-160  Life aboard on a raiding voyage
    vk-161  The ship as a status object
    vk-162  Ship graffiti
    vk-163  Ship images on picture stones
    vk-164  Ships in skaldic poetry
    vk-165  The ship in the law codes

### Navigation and the sea road — `vk-nav`

    vk-166  Navigating without a compass
    vk-167  Latitude sailing
    vk-168  The sun and the horizon
    vk-169  The sunstone and what the evidence supports
    vk-170  The Uunartoq disc
    vk-171  Sounding and the lead line
    vk-172  Reading the swell and the sea state
    vk-173  Birds and landfall
    vk-174  Whales, cloud and shore signs
    vk-175  Sailing directions in the sagas
    vk-176  The route from Norway to Iceland
    vk-177  The route from Iceland to Greenland
    vk-178  The North Way and the coastal passage
    vk-179  The Skagerrak and the Kattegat
    vk-180  The Danevirke and the land route
    vk-181  The portage at the Jutland neck
    vk-182  The Irish Sea route
    vk-183  The English Channel crossing
    vk-184  The Bay of Biscay and the southern route
    vk-185  Arctic voyaging and Ohthere's account
    vk-186  Ohthere of Halogaland
    vk-187  Winter and the sailing season
    vk-188  Shipwreck and loss at sea
    vk-189  The Skuldelev wrecks
    vk-190  How Roskilde Fjord was blocked

### The ship finds — `vk-shipfinds`

    vk-191  Why ships survive in Scandinavian soil
    vk-192  The Oseberg ship
    vk-193  The Oseberg burial and its two women
    vk-194  The Oseberg cart and sledges
    vk-195  The Gokstad ship
    vk-196  The Gokstad man
    vk-197  The Tune ship
    vk-198  The Skuldelev 1 cargo ship
    vk-199  The Skuldelev 2 longship and its Irish timber
    vk-200  The Skuldelev 5 warship
    vk-201  The Roskilde 6 ship
    vk-202  The Ladby ship burial
    vk-203  The Hedeby harbour wrecks
    vk-204  The Klastad ship
    vk-205  The Aland and Baltic boat finds
    vk-206  The Groix ship burial in Brittany
    vk-207  The Scar boat burial in Orkney
    vk-208  Ship rivets as evidence of a lost ship
    vk-209  Reconstructing a ship and sailing it
    vk-210  The Sea Stallion from Glendalough

## Raiding and settlement in Britain and Ireland

### The first raids — `vk-first`

    vk-211  The raid on Lindisfarne
    vk-212  Alcuin's letters on Lindisfarne
    vk-213  The Portland incident of 789
    vk-214  Why Portland may be the first recorded raid
    vk-215  The raid on Iona
    vk-216  Jarrow, Wearmouth and the Northumbrian coast
    vk-217  Why monasteries were targets
    vk-218  What a monastery held that was worth taking
    vk-219  Whether the raiders meant sacrilege
    vk-220  The scale of the earliest raids
    vk-221  Hit-and-run raiding and its logic
    vk-222  Overwintering as a change of strategy
    vk-223  The first overwintering in England
    vk-224  Thanet and Sheppey
    vk-225  The raiding fleet as a political actor
    vk-226  Who the first raiders were
    vk-227  Norwegian and Danish spheres
    vk-228  The coastal defence of Anglo-Saxon England
    vk-229  Coastal watch and the burghal system before Alfred
    vk-230  Charlemagne's coastal defences and the northern parallel
    vk-231  How a raid was organised at home
    vk-232  The leidang and whether it existed yet
    vk-233  Plunder and how it was divided
    vk-234  Captives taken in the first raids
    vk-235  The word Viking and what it meant

### England and the great army — `vk-england`

    vk-236  The kingdoms of England in 850
    vk-237  The Great Heathen Army
    vk-238  The army's arrival in East Anglia
    vk-239  The taking of York
    vk-240  The kingdom of Northumbria destroyed
    vk-241  Ivar the Boneless
    vk-242  Halfdan
    vk-243  Ubba
    vk-244  The legend of Ragnar Lothbrok
    vk-245  The blood eagle and whether it happened
    vk-246  The death of King Ella
    vk-247  East Anglia and King Edmund
    vk-248  The martyrdom of Edmund
    vk-249  Mercia and the fall of Repton
    vk-250  The Repton winter camp
    vk-251  The Repton mass grave
    vk-252  The Torksey camp
    vk-253  What a winter camp looked like
    vk-254  Wessex under attack
    vk-255  The Battle of Ashdown
    vk-256  Alfred at Athelney
    vk-257  The Battle of Edington
    vk-258  The baptism of Guthrum
    vk-259  The Treaty of Alfred and Guthrum
    vk-260  Alfred's burhs
    vk-261  Alfred's naval building
    vk-262  The reconquest under Edward the Elder
    vk-263  Aethelflaed of Mercia
    vk-264  The Battle of Tettenhall
    vk-265  The submission of the Five Boroughs
    vk-266  Athelstan and the Battle of Brunanburh
    vk-267  Where Brunanburh was fought
    vk-268  Eric Bloodaxe
    vk-269  The end of the kingdom of York
    vk-270  The second wave under Aethelred

### The Danelaw and Scandinavian England — `vk-danelaw`

    vk-271  What the Danelaw was
    vk-272  The boundary in the treaty and the boundary on the ground
    vk-273  The Five Boroughs
    vk-274  Scandinavian York
    vk-275  Coppergate and the Jorvik excavations
    vk-276  What Coppergate showed about daily life
    vk-277  Lincoln under the Danes
    vk-278  Stamford and Nottingham
    vk-279  Scandinavian place-names in England
    vk-280  The by and thorpe names
    vk-281  Grimston hybrids
    vk-282  How many settlers the names imply
    vk-283  The debate over the size of the settlement
    vk-284  Old Norse words in English
    vk-285  Grammar and the Norse contact
    vk-286  Danelaw law and the wapentake
    vk-287  The ora and Danish weights in England
    vk-288  Hogback tombstones
    vk-289  The Gosforth Cross
    vk-290  Sculpture in the Anglo-Scandinavian style
    vk-291  The Cuerdale hoard
    vk-292  The Vale of York hoard
    vk-293  Coinage of Scandinavian York
    vk-294  Saint Peter's pennies
    vk-295  Assimilation and how fast it happened

### Ireland and the Irish Sea — `vk-ireland`

    vk-296  Ireland before the Vikings
    vk-297  The first raids on Ireland
    vk-298  The longphort
    vk-299  Dublin's foundation
    vk-300  Excavating Viking Dublin
    vk-301  Wood Quay
    vk-302  Waterford, Wexford and Limerick
    vk-303  Cork and the southern ports
    vk-304  The Vikings and the Irish kings
    vk-305  The Ui Neill and the foreigners
    vk-306  The Dark Foreigners and the Fair Foreigners
    vk-307  Amlaib and Imar
    vk-308  The Uí Ímair dynasty
    vk-309  The slave trade out of Dublin
    vk-310  Dublin silver and the Irish Sea economy
    vk-311  The Battle of Tara
    vk-312  Brian Boru
    vk-313  The Battle of Clontarf
    vk-314  What Clontarf did and did not settle
    vk-315  The Hiberno-Norse after 1014

### Scotland, the isles and the far north — `vk-scotland`

    vk-316  Pictland and Dal Riata before the raids
    vk-317  The Northern Isles taken
    vk-318  The Earldom of Orkney
    vk-319  The Orkneyinga saga
    vk-320  Shetland settlement
    vk-321  Caithness and Sutherland
    vk-322  The Hebrides and the Kingdom of the Isles
    vk-323  Somerled and the later lordship
    vk-324  Norse place-names in Scotland
    vk-325  The Isle of Man
    vk-326  The Manx crosses
    vk-327  Tynwald
    vk-328  The Galloway hoard
    vk-329  Whether the Picts were displaced or absorbed
    vk-330  The Norse-Gaels

## Francia, Iberia and the south

### Raids on Francia — `vk-francia`

    vk-331  The Carolingian empire in 830
    vk-332  Charlemagne and the Danish frontier
    vk-333  The Danevirke
    vk-334  Godfred of Denmark
    vk-335  Harald Klak and Frankish patronage
    vk-336  The civil wars of Louis the Pious
    vk-337  Why Frankish disunity mattered
    vk-338  The raid on Dorestad
    vk-339  Dorestad and the Rhine trade
    vk-340  Quentovic
    vk-341  Rouen and the Seine raids
    vk-342  The sack of Nantes
    vk-343  Noirmoutier and the Loire base
    vk-344  The siege of Paris in 845
    vk-345  Ragnar and the Paris tradition
    vk-346  Tribute payments by the Franks
    vk-347  Why paying tribute was rational
    vk-348  Fortified bridges on the Seine
    vk-349  Charles the Bald's Edict of Pitres
    vk-350  The siege of Paris in 885
    vk-351  Odo of Paris and the defence
    vk-352  Bishop Gozlin
    vk-353  Abbo of Saint-Germain's poem
    vk-354  The Battle of Saucourt
    vk-355  The Battle of the Dyle
    vk-356  Frisia and the Vikings
    vk-357  The Frisian lordships granted to Danes
    vk-358  Rorik of Dorestad
    vk-359  The great army moves between England and Francia
    vk-360  How much of Francia was actually raided

### The making of Normandy — `vk-normandy`

    vk-361  Rollo
    vk-362  The Treaty of Saint-Clair-sur-Epte
    vk-363  What the treaty of 911 actually granted
    vk-364  Dudo of Saint-Quentin
    vk-365  Why Dudo must be read carefully
    vk-366  William Longsword
    vk-367  Richard I of Normandy
    vk-368  The growth of the duchy
    vk-369  Norse settlement in Normandy measured
    vk-370  Norse place-names in Normandy
    vk-371  How long Norse was spoken in Normandy
    vk-372  Bayeux and the Norse tongue
    vk-373  The Normans become Frankish
    vk-374  The Norman church
    vk-375  Norman feudal lordship
    vk-376  Rouen as a slave market
    vk-377  Normandy and England before 1066
    vk-378  Emma of Normandy
    vk-379  The Normans in southern Italy
    vk-380  Robert Guiscard
    vk-381  The Normans in Sicily
    vk-382  The First Crusade and the Normans
    vk-383  Whether the Normans were still Vikings
    vk-384  The Norman myth of descent
    vk-385  Normandy in the Bayeux Tapestry

### Iberia and al-Andalus — `vk-iberia`

    vk-386  The Iberian peninsula in the ninth century
    vk-387  The Emirate of Cordoba
    vk-388  The raid of 844
    vk-389  The sack of Seville
    vk-390  Abd al-Rahman II's response
    vk-391  The naval defence of al-Andalus
    vk-392  Al-Majus and what Arabic sources called them
    vk-393  The Bjorn Ironside expedition
    vk-394  Hastein
    vk-395  The raid on Nekur
    vk-396  The Christian kingdoms of the north
    vk-397  Galicia and the raids on Santiago
    vk-398  Bishop Cresconio and the Torres del Oeste
    vk-399  The raid of 968
    vk-400  Gunderedo
    vk-401  Lisbon and the Tagus
    vk-402  Whether there was Norse settlement in Iberia
    vk-403  Iberian silver and dirhams in the north
    vk-404  The 1015 expedition
    vk-405  Ibn Hayyan on the northmen
    vk-406  Al-Ghazal's embassy and whether it happened
    vk-407  The Arabic name for the northern raiders
    vk-408  Fortifying the Galician coast
    vk-409  What the Iberian raids cost the raiders
    vk-410  What Iberia shows about the limits of raiding

### The Mediterranean and the far south — `vk-med`

    vk-411  Entering the Mediterranean
    vk-412  The Balearic Islands raided
    vk-413  Provence and the Rhone
    vk-414  The raid on Luni
    vk-415  The Pisa tradition
    vk-416  Sicily and North Africa
    vk-417  The Blue Men and the Mauretanian captives
    vk-418  Slaves carried to Ireland from Africa
    vk-419  Byzantine naval power in the western sea
    vk-420  Greek fire
    vk-421  Why the Mediterranean was hostile ground
    vk-422  The Frankish and Muslim fleets compared
    vk-423  Camargue and the winter base
    vk-424  Returning north with the plunder
    vk-425  Whether the Mediterranean raids paid
    vk-426  Scandinavians in Muslim service
    vk-427  Pilgrimage and the Mediterranean route
    vk-428  Jerusalem and the northern pilgrims
    vk-429  Sigurd the Crusader
    vk-430  The Piraeus lion and its runes

## The eastern road: the Baltic, the rivers and the Rus'

### The Baltic and its shores — `vk-baltic`

    vk-431  The Baltic Sea as a Scandinavian lake
    vk-432  Gotland
    vk-433  The Gotland picture stones
    vk-434  Gotland's silver hoards
    vk-435  Why Gotland has more silver than anywhere else
    vk-436  Visby before the town
    vk-437  Oland
    vk-438  Bornholm
    vk-439  The Aland Islands
    vk-440  Grobin in Latvia
    vk-441  Wiskiauten and the Prussian coast
    vk-442  Truso
    vk-443  Wolin
    vk-444  The Slavic Baltic and the Obotrites
    vk-445  Jomsborg and whether it existed
    vk-446  The Jomsvikings
    vk-447  The Curonians
    vk-448  The Estonians and the raids on Sweden
    vk-449  The Finnish coast and the Gulf
    vk-450  Fur, wax and the northern forest trade
    vk-451  The Baltic slave trade
    vk-452  Amber and the eastern trade
    vk-453  Warfare among Baltic neighbours
    vk-454  Whether the eastern voyages were trade or raid
    vk-455  What separates the eastern road from the western

### The river roads — `vk-rivers`

    vk-456  Why rivers were the route east
    vk-457  Staraya Ladoga as the gateway
    vk-458  The Volkhov and Lake Ladoga
    vk-459  Gnezdovo
    vk-460  The Dnieper route
    vk-461  The Dnieper rapids
    vk-462  The rapids named in Constantine Porphyrogenitus
    vk-463  Portage between river systems
    vk-464  The Volga route
    vk-465  Bulghar on the Volga
    vk-466  The Volga Bulgars
    vk-467  Itil and the Khazars
    vk-468  The Khazar khaganate
    vk-469  The Caspian expeditions
    vk-470  The raid on Barda'a
    vk-471  Baghdad and the Abbasid silver
    vk-472  The dirham flood into Scandinavia
    vk-473  Why the dirhams stopped arriving
    vk-474  The silver crisis of the tenth century
    vk-475  Furs as the eastern staple
    vk-476  Slaves as the eastern staple
    vk-477  The word saqaliba
    vk-478  Weights, scales and the silver economy
    vk-479  Hacksilver
    vk-480  The eastern route as a chain of markets

### The Rus' — `vk-rus`

    vk-481  Who the Rus' were
    vk-482  The word Rus' and where it comes from
    vk-483  The Primary Chronicle
    vk-484  Why the Primary Chronicle is a twelfth-century text
    vk-485  Rurik
    vk-486  The invitation of the Varangians and what it is doing
    vk-487  The Normanist controversy
    vk-488  How the controversy became political
    vk-489  What archaeology says about Scandinavians in Rus'
    vk-490  Novgorod's beginnings
    vk-491  Ryurikovo Gorodishche
    vk-492  Kyiv's beginnings
    vk-493  Askold and Dir
    vk-494  Oleg
    vk-495  Oleg's treaty with Byzantium
    vk-496  Igor
    vk-497  The Rus' attack on Constantinople in 860
    vk-498  The attack of 941 and Greek fire
    vk-499  Olga of Kyiv
    vk-500  Olga's embassy and her baptism
    vk-501  Svyatoslav
    vk-502  The destruction of Khazaria
    vk-503  Svyatoslav in Bulgaria
    vk-504  The death of Svyatoslav
    vk-505  Vladimir the Great
    vk-506  The conversion of Vladimir
    vk-507  The baptism of the Rus'
    vk-508  Yaroslav the Wise
    vk-509  The Russkaya Pravda
    vk-510  Scandinavian names in the Rus' treaties
    vk-511  Druzhina and the prince's retinue
    vk-512  Birka and Rus' compared
    vk-513  Rus' burial practice
    vk-514  The chamber graves of Kyiv and Chernigov
    vk-515  When the Rus' stopped being Scandinavian

### Constantinople and the Varangians — `vk-varangian`

    vk-516  Miklagard
    vk-517  How Byzantium looked to a northerner
    vk-518  The Rus'-Byzantine treaties
    vk-519  Trade privileges at Constantinople
    vk-520  Saint Mamas and the Rus' quarter
    vk-521  The founding of the Varangian Guard
    vk-522  Basil II and the six thousand
    vk-523  What the guard actually did
    vk-524  Pay and plunder in imperial service
    vk-525  Harald Hardrada in Byzantium
    vk-526  Harald's career in the Mediterranean and Asia Minor
    vk-527  Bolli Bollason and the sagas of returning Varangians
    vk-528  The runestones that record a death in Greece
    vk-529  The Greece-stones of Sweden
    vk-530  The Ingvar stones
    vk-531  The Ingvar expedition
    vk-532  Graffiti in Hagia Sophia
    vk-533  Halfdan's name in Hagia Sophia
    vk-534  The Piraeus lion inscription
    vk-535  The guard after 1066
    vk-536  The English in the Varangian Guard
    vk-537  Byzantine silk and its route north
    vk-538  Byzantine coins in Scandinavian hoards
    vk-539  What the eastern service bought at home
    vk-540  Why the eastern connection faded

## The North Atlantic

### The Northern Isles, the Faroes and the empty lands — `vk-faroe`

    vk-541  Sailing into an empty ocean
    vk-542  Whether anyone was there first
    vk-543  The papar and the Irish hermits
    vk-544  Dicuil and the Irish account of northern islands
    vk-545  The Faroe Islands settled
    vk-546  Toftanes and the Faroese farms
    vk-547  The barley and the pollen record in the Faroes
    vk-548  Sheep and the Faroese name
    vk-549  The Faroese boat
    vk-550  The Faroe Islands and Norwegian overlordship
    vk-551  Orkney as a staging post
    vk-552  Birsay and the Brough
    vk-553  The Norse farm at Jarlshof
    vk-554  Skaill and the Orkney hoard
    vk-555  Maeshowe and its runes
    vk-556  The Norse in Shetland
    vk-557  The Atlantic island economy
    vk-558  Driftwood and the timber problem
    vk-559  Turf building without timber
    vk-560  Why the islands mattered to the Atlantic voyages

### Iceland — `vk-iceland`

    vk-561  Iceland before people
    vk-562  Naddod, Gardar and Floki
    vk-563  Ingolf Arnarson
    vk-564  The Landnamabok
    vk-565  What the Landnamabok is for
    vk-566  The Book of the Icelanders
    vk-567  Ari Thorgilsson
    vk-568  The settlement period
    vk-569  The landnam tephra layer
    vk-570  How many settlers there were
    vk-571  Where the settlers came from
    vk-572  The Celtic component in Icelandic ancestry
    vk-573  The enslaved in the settlement of Iceland
    vk-574  Land claim and how it was made
    vk-575  The first farms
    vk-576  Reykjavik's beginnings
    vk-577  Deforestation of Iceland
    vk-578  Soil erosion and the cost of settlement
    vk-579  Iceland's livestock and the loss of pigs
    vk-580  The Icelandic Commonwealth
    vk-581  The Althing
    vk-582  Thingvellir
    vk-583  The lawspeaker
    vk-584  The godar and the chieftaincies
    vk-585  The quarter courts
    vk-586  The Fifth Court
    vk-587  Outlawry
    vk-588  Full outlawry and lesser outlawry
    vk-589  Gragas
    vk-590  Feud and the saga society
    vk-591  Njal's saga
    vk-592  The Saga of the People of Laxardal
    vk-593  Egil's saga
    vk-594  The Saga of Grettir the Strong
    vk-595  Whether the sagas describe the tenth century or the thirteenth
    vk-596  Iceland's conversion in 999 or 1000
    vk-597  Thorgeir the lawspeaker's decision
    vk-598  Why the conversion was a legal act
    vk-599  The bishops of Skalholt and Holar
    vk-600  The end of the Commonwealth

### Greenland — `vk-greenland`

    vk-601  Erik the Red
    vk-602  Erik's outlawry and the voyage west
    vk-603  Naming Greenland
    vk-604  The Eastern Settlement
    vk-605  The Western Settlement
    vk-606  Brattahlid
    vk-607  Gardar and the cathedral
    vk-608  Hvalsey church
    vk-609  How many Norse Greenlanders there were
    vk-610  The Greenland farm economy
    vk-611  Sheep, goats and cattle in Greenland
    vk-612  The seal in the Greenland diet
    vk-613  What the bones and isotopes show about the diet
    vk-614  The Nordrsetur and the northern hunt
    vk-615  Walrus ivory as Greenland's export
    vk-616  How the ivory trade was identified
    vk-617  Where Greenland ivory ended up
    vk-618  Greenland and the Norwegian crown
    vk-619  The Greenland bishopric
    vk-620  The Thule people arrive
    vk-621  Norse and Thule contact
    vk-622  The Skraeling of the sagas
    vk-623  Kingittorsuaq and the northernmost runestone
    vk-624  The Little Ice Age and Greenland
    vk-625  Why the Norse Greenlanders disappeared
    vk-626  The environmental explanation and its critics
    vk-627  The economic explanation
    vk-628  The last written record from Greenland
    vk-629  Whether they left or died
    vk-630  What Greenland tells us about limits

### Vinland and North America — `vk-vinland`

    vk-631  The Saga of Erik the Red
    vk-632  The Saga of the Greenlanders
    vk-633  Why the two Vinland sagas disagree
    vk-634  Bjarni Herjolfsson
    vk-635  Leif Erikson
    vk-636  Helluland, Markland and Vinland
    vk-637  Where Vinland was
    vk-638  Thorfinn Karlsefni
    vk-639  Gudrid Thorbjarnardottir
    vk-640  Freydis Eriksdottir
    vk-641  L'Anse aux Meadows
    vk-642  What was found at L'Anse aux Meadows
    vk-643  The butternut evidence
    vk-644  Dating L'Anse aux Meadows to 1021
    vk-645  The Point Rosee claim and its retraction
    vk-646  Norse objects found in the Arctic
    vk-647  The Maine penny
    vk-648  The Kensington runestone and why it is a forgery
    vk-649  The Vinland map
    vk-650  Why the Norse did not stay

## Life at home: farm, hall, craft and trade

### Farm, field and food — `vk-farm`

    vk-651  The farm as the unit of Scandinavian society
    vk-652  Infield and outfield
    vk-653  Barley as the northern grain
    vk-654  Rye, oats and the northern limit of wheat
    vk-655  The ard and the plough
    vk-656  Manuring and the byre
    vk-657  Cattle and the winter fodder problem
    vk-658  Sheep and wool
    vk-659  Goats and pigs
    vk-660  Horses
    vk-661  Haymaking and the summer scythe
    vk-662  The seter and the mountain dairy
    vk-663  Butter, cheese and skyr
    vk-664  Preserving food in the north
    vk-665  Fish and the northern fisheries
    vk-666  Stockfish
    vk-667  Herring
    vk-668  Seals, whales and the shore harvest
    vk-669  Fowling and the seabird cliffs
    vk-670  Hunting for fur
    vk-671  Bread and the quern
    vk-672  Ale and brewing
    vk-673  Mead
    vk-674  The cooking pit and the hearth
    vk-675  What people actually ate
    vk-676  Nutrition, stature and the skeletal record
    vk-677  Famine and the bad year
    vk-678  Tenancy and the leased farm
    vk-679  The odal and inherited land
    vk-680  Deserted farms and what they show

### House, hall and household — `vk-house`

    vk-681  The Viking Age longhouse
    vk-682  Walls of turf, wattle and stave
    vk-683  The roof and the smoke hole
    vk-684  The long hearth
    vk-685  Benches and the sleeping platform
    vk-686  The high seat
    vk-687  The chieftain's hall
    vk-688  Lejre
    vk-689  Tissø
    vk-690  Borg in Lofoten
    vk-691  The pit house and the sunken workshop
    vk-692  Outbuildings and the farm cluster
    vk-693  The bath house and the sauna
    vk-694  Light, lamps and the dark winter
    vk-695  Furniture and chests
    vk-696  Textiles in the home
    vk-697  Who lived in a household
    vk-698  The mistress of the household and the keys
    vk-699  Children in the household
    vk-700  The enslaved in the household

### Craft and material — `vk-craft`

    vk-701  The blacksmith
    vk-702  Bloomery iron and the smelting furnace
    vk-703  Pattern-welded blades
    vk-704  The Ulfberht swords
    vk-705  Crucible steel and the eastern trade
    vk-706  The spear and its social meaning
    vk-707  The axe as a weapon
    vk-708  The bow in Scandinavian warfare
    vk-709  The round shield
    vk-710  Mail and who could afford it
    vk-711  The Gjermundbu helmet
    vk-712  Why no Viking helmet has horns
    vk-713  The comb maker
    vk-714  Antler and bone working
    vk-715  Soapstone vessels
    vk-716  Pottery in Scandinavia
    vk-717  Glass beads and their manufacture
    vk-718  Imported glass vessels
    vk-719  The silversmith
    vk-720  Filigree and granulation
    vk-721  Brooches and the oval brooch
    vk-722  Thor's hammer pendants
    vk-723  Woodcarving and the animal styles
    vk-724  Borre, Jelling, Mammen, Ringerike and Urnes
    vk-725  Spinning and weaving

### Trade, towns and silver — `vk-trade`

    vk-726  Why towns appeared when they did
    vk-727  Birka
    vk-728  Birka's graves and what they contain
    vk-729  The Birka warrior grave Bj 581
    vk-730  The debate over Bj 581
    vk-731  Hedeby
    vk-732  Hedeby's rampart and harbour
    vk-733  Kaupang
    vk-734  Sigtuna
    vk-735  Uppakra to Lund
    vk-736  Aarhus and Odense
    vk-737  Aggersborg and the ring fortresses
    vk-738  The seasonal market
    vk-739  The town and the king
    vk-740  Weights and the standardised silver economy
    vk-741  The cubo-octahedral weight
    vk-742  Folding balances
    vk-743  The first Scandinavian coinage
    vk-744  The Hedeby coins
    vk-745  Olof Skotkonung's coins
    vk-746  What the hoards were for
    vk-747  Why silver was buried and not recovered
    vk-748  The Spillings hoard
    vk-749  Trade goods from the far east
    vk-750  How far a single object could travel

### Law, assembly and violence — `vk-law`

    vk-751  The thing as an assembly
    vk-752  How a thing worked
    vk-753  The lawspeaker and the recitation of law
    vk-754  Oath and the oath-helper
    vk-755  Compensation and the man-price
    vk-756  Wergild in Scandinavian law
    vk-757  The duel and the holmgang
    vk-758  Feud and how it ended
    vk-759  Arbitration and the settlement
    vk-760  Homicide and secret killing
    vk-761  Theft and its punishment
    vk-762  Slander and the law on verse
    vk-763  Marriage in Scandinavian law
    vk-764  Divorce and a woman's right to leave
    vk-765  Inheritance and the widow
    vk-766  Slavery and the law of the thrall
    vk-767  Manumission and the freedman
    vk-768  Kingship and the law
    vk-769  The early provincial law codes
    vk-770  What the thirteenth-century codes can say about the tenth

## Belief, the dead, and the coming of Christianity

### The gods and the myths — `vk-gods`

    vk-771  Norse mythology and where it is written down
    vk-772  The Poetic Edda
    vk-773  The Codex Regius
    vk-774  The Prose Edda
    vk-775  Why Snorri is a Christian writing about pagans
    vk-776  Odin
    vk-777  Odin's names and what they say about him
    vk-778  Thor
    vk-779  Thor's hammer
    vk-780  Freyr
    vk-781  Freyja
    vk-782  Njord and the Vanir
    vk-783  Loki
    vk-784  Whether Loki was worshipped
    vk-785  Tyr
    vk-786  Baldr
    vk-787  Heimdall
    vk-788  Frigg
    vk-789  The Aesir and the Vanir
    vk-790  Yggdrasil
    vk-791  The nine worlds
    vk-792  Asgard
    vk-793  Midgard
    vk-794  Jotunheim and the giants
    vk-795  Hel and the dead
    vk-796  Valhalla
    vk-797  The valkyries
    vk-798  The Norns and fate
    vk-799  Voluspa
    vk-800  Ragnarok
    vk-801  Creation in Norse myth
    vk-802  Ymir
    vk-803  The dwarfs
    vk-804  The Volsung legend
    vk-805  Sigurd and the dragon

### Ritual, burial and the dead — `vk-ritual`

    vk-806  What pagan religion in Scandinavia actually was
    vk-807  No church, no creed, no priesthood
    vk-808  The blot and the sacrifice
    vk-809  The feast as worship
    vk-810  The temple at Uppsala in Adam of Bremen
    vk-811  Whether there were temples
    vk-812  The cult building at Uppakra
    vk-813  Hof and horg
    vk-814  Sacred groves and springs
    vk-815  Human sacrifice and the evidence
    vk-816  Ibn Fadlan's account of a Rus' funeral
    vk-817  How Ibn Fadlan should be read
    vk-818  Cremation
    vk-819  Inhumation
    vk-820  Grave goods and what they mean
    vk-821  Boat burial
    vk-822  Ship settings of stone
    vk-823  Mound burial
    vk-824  The Jelling mounds
    vk-825  Chamber graves
    vk-826  Women's graves and their wealth
    vk-827  Weapon burials
    vk-828  Horse and dog in the grave
    vk-829  The Oseberg burial re-examined
    vk-830  The dead who walk in the sagas
    vk-831  The draugr
    vk-832  Seidr and magic
    vk-833  The volva
    vk-834  Runic charms and amulets
    vk-835  What happened to the pagan dead after conversion

### Runes, poetry and memory — `vk-runes`

    vk-836  The runic alphabet
    vk-837  The Younger Futhark
    vk-838  Why the Younger Futhark has fewer letters
    vk-839  Long-branch and short-twig runes
    vk-840  Carving runes
    vk-841  Everyday runic writing
    vk-842  The Bryggen inscriptions
    vk-843  Runestones and when they were raised
    vk-844  Why Sweden has the most runestones
    vk-845  The formula of a runestone
    vk-846  Who paid for a runestone
    vk-847  Women who raised runestones
    vk-848  The Rok stone
    vk-849  The Jelling stone
    vk-850  The Jelling stone's claim
    vk-851  The Ingvar and Greece stones as a group
    vk-852  Runestones and inheritance
    vk-853  Christian runestones
    vk-854  The rune carvers who signed their work
    vk-855  Skaldic poetry and its metre
    vk-856  Dróttkvætt
    vk-857  The kenning
    vk-858  Eddic poetry
    vk-859  The skald at court
    vk-860  Praise poetry as political speech

### The coming of Christianity — `vk-christ`

    vk-861  Christianity's first contacts with Scandinavia
    vk-862  Willibrord's mission
    vk-863  Ansgar
    vk-864  The archbishopric of Hamburg-Bremen
    vk-865  The prima signatio and the half-convert
    vk-866  Why a trader might accept baptism
    vk-867  Harald Bluetooth
    vk-868  Poppo and the ordeal by iron
    vk-869  Whether Harald converted Denmark
    vk-870  Olaf Tryggvason
    vk-871  Olaf Tryggvason's methods
    vk-872  Olaf Haraldsson
    vk-873  The Battle of Stiklestad
    vk-874  Saint Olaf
    vk-875  The cult of Saint Olaf
    vk-876  Sweden's slow conversion
    vk-877  The last pagans at Uppsala
    vk-878  Inge the Elder and Blot-Sven
    vk-879  Iceland's conversion revisited
    vk-880  Greenland's conversion
    vk-881  Missionary bishops and their sources
    vk-882  The first churches
    vk-883  Stave churches
    vk-884  Urnes stave church
    vk-885  The stone church replaces the stave church
    vk-886  Church and king
    vk-887  Tithes and the parish
    vk-888  Syncretism and the mixed grave
    vk-889  Thor's hammer and the cross worn together
    vk-890  What conversion actually changed

## Kingdoms, endings and afterlives

### The making of the three kingdoms — `vk-kings`

    vk-891  Scandinavia as many small lordships
    vk-892  How a kingdom was made in the north
    vk-893  Harald Fairhair
    vk-894  The Battle of Hafrsfjord
    vk-895  Whether Harald Fairhair united Norway
    vk-896  Hakon the Good
    vk-897  Harald Greycloak and the sons of Eirik
    vk-898  Hakon Sigurdsson the jarl of Lade
    vk-899  The jarls of Lade
    vk-900  Gorm the Old
    vk-901  Harald Bluetooth as a builder
    vk-902  The ring fortresses and what they were for
    vk-903  Trelleborg
    vk-904  The Ravning Enge bridge
    vk-905  Sweyn Forkbeard
    vk-906  Erik the Victorious
    vk-907  Olof Skotkonung
    vk-908  The Svear and the Gotar
    vk-909  The battle of Fyrisvellir
    vk-910  The Battle of Svolder
    vk-911  Taxation and the making of a state
    vk-912  The leidang levy
    vk-913  Royal estates and the king's progress
    vk-914  Coinage and royal authority
    vk-915  The church as an instrument of kingship
    vk-916  Why kingdoms formed when raiding declined
    vk-917  Denmark's borders take shape
    vk-918  Norway's borders take shape
    vk-919  Sweden's borders take shape
    vk-920  What a Scandinavian king could and could not do

### Cnut's North Sea empire — `vk-empire`

    vk-921  Sweyn Forkbeard's conquest of England
    vk-922  The St Brice's Day massacre
    vk-923  Aethelred the Unready
    vk-924  The Danegeld under Aethelred
    vk-925  How much silver England paid
    vk-926  Thorkell the Tall
    vk-927  Cnut the Great
    vk-928  The Battle of Assandun
    vk-929  Edmund Ironside
    vk-930  Cnut as king of England
    vk-931  Cnut's laws
    vk-932  Cnut and the English church
    vk-933  Cnut's pilgrimage to Rome
    vk-934  Cnut as king of Denmark and Norway
    vk-935  What held the North Sea empire together
    vk-936  The huscarls
    vk-937  Emma of Normandy as queen twice over
    vk-938  Harthacnut and Harold Harefoot
    vk-939  The collapse of the empire
    vk-940  Edward the Confessor and the Danish inheritance

### 1066 and the end of the Viking Age — `vk-end`

    vk-941  Magnus the Good
    vk-942  Harald Hardrada
    vk-943  Harald's wars with Denmark
    vk-944  Sweyn Estridsson
    vk-945  The Battle of Niså
    vk-946  The English succession crisis of 1066
    vk-947  Tostig Godwinson
    vk-948  The Battle of Fulford
    vk-949  The Battle of Stamford Bridge
    vk-950  The death of Harald Hardrada
    vk-951  Why Stamford Bridge is called the end
    vk-952  The Battle of Hastings and the Norman victory
    vk-953  Sweyn Estridsson's claim to England
    vk-954  The Danish fleet of 1069
    vk-955  Hereward and the rising in the fens
    vk-956  Cnut IV and the fleet that never sailed
    vk-957  The last Scandinavian attempt on England
    vk-958  Magnus Barefoot in the Irish Sea
    vk-959  The Battle of Largs and the loss of the Hebrides
    vk-960  The Treaty of Perth
    vk-961  Why raiding stopped
    vk-962  What replaced the raiding economy
    vk-963  The Northern Crusades as a continuation
    vk-964  When the Viking Age ended
    vk-965  Whether the Viking Age is a useful period at all

### Afterlives, romanticism and misuse — `vk-legacy`

    vk-966  How medieval Europe remembered the Vikings
    vk-967  The Vikings in later Icelandic tradition
    vk-968  Saxo and the Danish national past
    vk-969  Gothicism in Sweden
    vk-970  The discovery of the ship burials
    vk-971  National romanticism in Scandinavia
    vk-972  Wagner and the Ring
    vk-973  Where the horned helmet came from
    vk-974  Victorian Britain and the Viking as ancestor
    vk-975  The invented Norse antiquities of America
    vk-976  Nazi appropriation of Norse symbols
    vk-977  Why the appropriation is a problem for the sources
    vk-978  Norse symbols and the modern far right
    vk-979  How museums handle the symbols now
    vk-980  Asatru and modern Heathenry
    vk-981  The Vikings on screen
    vk-982  Video games and the Viking image
    vk-983  Experimental archaeology and the sailed replica
    vk-984  What the popular image gets wrong
    vk-985  Why it matters what the image is

### The historiography — `vk-hist`

    vk-986  The first scholarly histories of the Viking Age
    vk-987  The Viking as barbarian and the Viking as trader
    vk-988  Peter Sawyer and the revision of the 1960s
    vk-989  The debate over the size of the armies
    vk-990  The debate over the scale of the settlement
    vk-991  Continuity against catastrophe in England
    vk-992  The Normanist controversy as historiography
    vk-993  Nationalism in Viking Age scholarship
    vk-994  Archaeology and the written sources in tension
    vk-995  Gender in Viking Age scholarship
    vk-996  Slavery in Viking Age scholarship
    vk-997  Genetics and its use and misuse
    vk-998  The environmental turn and Greenland
    vk-999  Globalising the Viking Age
    vk-1000  What is still open

