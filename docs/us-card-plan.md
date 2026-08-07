# The United States — a 1000-card running order

The plan for `col-41`, the United States collection: every card's number, topic and deck, fixed in
advance so the collection can be grown one card at a time over many sessions without anyone having to
remember what was intended.

It is the ninth of these, after Ancient Greece, World History, Ancient Rome, Russia, India, China,
Ancient Egypt and the Second World War, and it is written to the same rules. Read
`docs/greece-card-plan.md` first if this is the first one you have met; the mechanics are identical and
are not restated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `us-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='us-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: `String(1000).padStart(3,"0")` is `"1000"` and
the ids are `us-001` … `us-999`, then `us-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`us-575 Battle of Gettysburg` is already an answer term; `us-555 What caused the American Civil War` is an
argument to describe, and the card's actual answer — the word that gets blanked — is chosen while
writing it, from what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** When that happens,
change the line here in the same commit as the card, and say so — this file is only useful while it is
true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

## Making the collection

**The collection already exists.** `col-41` is an empty node in `data.js` with its title, its nine
translated titles and its `COLL_THEME` hue (`#2F4373`, navy) already set. This plan adds its tree and
nothing else, which is the Rome, Russia and India case rather than the Egypt and Second World War one.

**The card prefix is `us-`.** Free of every existing prefix (`wh-`, `gr-`, `rm-`, `ru-`, `in-`, `cnh-`,
`eg-`, `ww2-`).

**There is no `COLLECTION_NUMERALS` entry and there should not be one.** The United States counts in
Western digits, as World History does, and the level badge is already correct.

**The title stays "United States".** Not "The United States" and not "America" — the node is already
titled and already translated into nine languages, and renaming it would retire all nine for no gain.
Note that the collection's prose does use *America* and *American* where that is the natural English,
and `us-1000` is about what that word has been made to carry.

## What this collection is about, and the two scope decisions

**It is the history of the United States and of the territory that became it.** That second half is
doing real work and is the reason two decks exist that a shorter plan would not have.

**First: the collection opens with Native America, and Native America is a deck rather than a
prologue.** People had lived on this land for at least fifteen thousand years before 1492, in
societies with agriculture, cities, confederacies and long-distance trade, and much of the history of
the United States is the history of what happened to them. A collection that opens at Jamestown has
already made a claim about whose history this is, quietly and without arguing for it. So deck 1 is 100
cards, it begins with the peopling of the continent and the Mississippian cities, and it runs forward
through removal and the reservations to tribal sovereignty in the present — because Native American
history is not a phase of American history that ends when the frontier closes.

**Second: North America before 1763 was not only English.** Spanish Florida is older than Jamestown by
forty-two years, New Mexico older by nine; French Louisiana and New Netherland shaped the map and the
place names, and a third of the modern country was Mexican within living memory of the Civil War. So
`us-borderlands` exists, and the collection is not simply the story of thirteen colonies growing
westward.

**Where it ends.** At the present, which is unusual here — Greece, Rome and Egypt end in antiquity and
Russia and India run to the present but with a settled twentieth century behind them. The last leaf
runs to the 2020s, and the closer a card sits to the present the more carefully it has to be written;
see the pulls below.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Native America | Native America before contact | 40 | us-001–040 |
| | Contact, disease and the colonial encounter | 35 | us-041–075 |
| | Removal, the reservations and sovereignty | 25 | us-076–100 |
| Colonies and Empire, 1565–1763 | Spanish, French and Dutch North America | 25 | us-101–125 |
| | The English colonies | 45 | us-126–170 |
| | Colonial society and the imperial wars | 35 | us-171–205 |
| Revolution and Founding, 1763–1800 | The imperial crisis | 30 | us-206–235 |
| | The War of Independence | 40 | us-236–275 |
| | The Constitution | 35 | us-276–310 |
| | The early republic | 25 | us-311–335 |
| Expansion and Division, 1800–1860 | Jefferson, Madison and the War of 1812 | 28 | us-336–363 |
| | The Jacksonian era | 27 | us-364–390 |
| | Expansion and Manifest Destiny | 30 | us-391–420 |
| | Antebellum society and reform | 20 | us-421–440 |
| Slavery | The slave trade and the slave economy | 30 | us-441–470 |
| | Enslaved life, family and resistance | 35 | us-471–505 |
| | Abolition and the antislavery movement | 25 | us-506–530 |
| Civil War and Reconstruction, 1848–1877 | The sectional crisis | 25 | us-531–555 |
| | The Civil War | 45 | us-556–600 |
| | Emancipation and Black freedom | 20 | us-601–620 |
| | Reconstruction and its overthrow | 30 | us-621–650 |
| The Industrial Nation, 1865–1917 | The West | 30 | us-651–680 |
| | Industry, labour and the corporation | 30 | us-681–710 |
| | Immigration and the city | 25 | us-711–735 |
| | Populism, Progressivism and empire | 25 | us-736–760 |
| Depression, War and Cold War, 1917–1963 | The First World War and the twenties | 32 | us-761–792 |
| | Depression and the New Deal | 33 | us-793–825 |
| | The Second World War | 30 | us-826–855 |
| | The Cold War | 35 | us-856–890 |
| Modern America | Jim Crow and the Black freedom struggle | 35 | us-891–925 |
| | The sixties and Vietnam | 25 | us-926–950 |
| | Rights movements and the new politics | 20 | us-951–970 |
| | America since 1974 | 30 | us-971–1000 |

Deck totals: Native America 100 · Colonies and Empire 105 · Revolution and Founding 130 ·
Expansion and Division 105 · Slavery 90 · Civil War and Reconstruction 120 ·
The Industrial Nation 110 · Depression, War and Cold War 130 · Modern America 110. **1000.**

## What the weighting is arguing

**Native America gets 100 and does not stop at contact.** The three subdecks are the continent before
1492, the two centuries of encounter, and then removal through to the present. That last one is the
argument: putting allotment, the boarding schools, termination and the sovereignty era in the Native
deck rather than in the chapters of national history where they chronologically fall is a claim that
these are episodes in a continuous history of particular nations, not incidents in someone else's
story. The plains wars are the deliberate exception and sit in `us-west`, because there they are
what the settlement of the West actually consisted of and burying them in another deck would let the
West be carded as an empty place being filled.

**Slavery is a deck of 90, not a subdeck of the antebellum South.** This is the Second World War
plan's Holocaust reasoning in a different key. Slavery in the United States lasted two hundred and
forty-six years, was legal in every one of the thirteen colonies, built the wealth of northern
shipping, insurance and textile firms as well as southern plantations, and is the subject on which
American public understanding and American scholarship are furthest apart. Filing it under the Old
South makes it regional when it was national, and makes it a phase when it is a foundation. The deck
also gives enslaved life 35 cards of its own, which is the point: a deck about the slave *system*
alone would card the people in it only as its material.

**Reconstruction gets 30 and three of them are about how it was written up.** For roughly seventy
years the American academy taught that Reconstruction was a disaster inflicted on a prostrate South by
vindictive northerners and incompetent freedmen. That account was false, was overturned, and had by
then furnished the intellectual respectability for disfranchisement and segregation. It is the
clearest case in this collection of history doing political work, and `us-648`, `us-649` and `us-650`
card it directly.

**The Black freedom struggle opens with Jim Crow, not with Montgomery.** `us-891`–`us-902` are the
building of the segregation regime — the disfranchising constitutions, the lynching campaign, the
covenants and the redlining maps — before a single card of the movement against it. Segregation was
constructed, by legislatures and courts and banks, in the decades after Reconstruction; a movement
deck that opens in 1955 leaves a reader assuming it was simply inherited from slavery.

**The twentieth century gets 240 across two decks.** Most of what a reader comes to this collection
already arguing about is here, and a thin modern coda would be a way of avoiding it.

**The Revolution and the founding get 130, the largest of the pre-1860 decks**, because the Constitution
is not only an event in 1787 but the framework every later argument in the collection is conducted
inside, and because 35 cards is what it takes to card a document clause by clause rather than as a
sentiment.

## Six decisions this plan forced on the tree

**There is no "the South" deck, and there is no "the West" deck before 1865.** Both are tempting and
both would do damage. A South deck turns slavery into a regional subject, which is the thing the
Slavery deck exists to prevent. A pre-1865 West deck turns the continent into a stage that history
arrives on, which is what `us-native-before` is there to refuse. The West appears as a deck once
`us-west` covers 1865–1900, and even there it opens on the peoples already living in it.

**Native removal sits in the Native deck and the plains wars sit in the West deck**, which looks
inconsistent and is deliberate; the reasoning is under the weighting above. Both are cross-listed to
each other at writing time.

**Presidents do not organise the tree.** A United States collection left alone becomes a list of
administrations, and the tree is built out of what happened instead. `The presidency of X` cards exist
where the presidency itself is the subject — Washington's, because the office was being invented;
Jackson's, because the party system was; Franklin Roosevelt's, because the federal government's
relationship to the citizen changed — and elsewhere the politics is carded by the events, the laws and
the movements. There are 45 presidents and rather fewer than 45 presidency cards, and that is the
intent rather than an oversight.

**The Constitution gets its own subdeck of 35 and is carded clause by clause.** Separation of powers,
federalism, each article, the Electoral College, the amendment process, the Bill of Rights amendment by
amendment, and then two cards on what the document left unsettled. This is the deck a reader will come
back to when a later card turns on it, which is most of them.

**The Civil War gets 45 and Emancipation gets its own 20.** Splitting them says something: emancipation
was not a by-product of the fighting. It was made by enslaved people walking off plantations towards
Union lines in numbers that forced the question, by the Confiscation Acts, by 180,000 Black men in
uniform and finally by a constitutional amendment. Carded inside the military narrative it becomes a
presidential decision with a date.

**The last leaf runs to the present and stops at 30 cards.** Everything after about 2000 gets thinner
on purpose. A card is a claim, the scholarship on the last twenty years is still being written, and
this is the one place where the collection can most easily become commentary.

## History, not myth — and the four pulls

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Archaeology is a real pull only in deck 1, where
it is handled the way `docs/egypt-card-plan.md` handles it: the card is about the people, not the dig.
Four other things pull harder, and the Second World War plan's version of this section is the one to
read alongside it.

**Exceptionalism.** The idea that the United States is a nation with a mission, unlike others in kind
rather than in detail, is not a neutral background assumption — it is a specific claim with a history,
running from Winthrop's sermon through Manifest Destiny to the Cold War and after. It is carded as a
**subject** (`us-148`, `us-391`, `us-665`, `us-1000`) and never as the register the collection is
written in. The test: a card that says the United States did something *because that is what America
is* has adopted the claim instead of describing it.

**The founding register.** There are two bad ways to write the founders — as demigods and as
hypocrites — and both are registers rather than findings. Jefferson wrote that all men are created
equal and enslaved more than six hundred people, and the card that states both plainly and lets the
reader hold them is a better card than either the one that explains the contradiction away or the one
that thinks the contradiction is the whole story. `us-245` exists for exactly this.

**Settled in scholarship, contested in public.** This is the pull specific to this collection, and the
sharpest case is the cause of the Civil War, which the seceding states stated in their own secession
declarations and which a great deal of popular material still disputes. The rule is the Second World
War plan's, and the ordering matters as much there as here: **a card that explains comes before a card
that debunks.** `us-555 What caused the American Civil War` is built from the secession documents and the
Confederate vice-president's own speech (`us-554`); `us-648 Lost Cause of the Confederacy` then cards the alternative
account as what it is, a postwar construction with a purpose and a date. The same shape governs
`us-520` on the Underground Railroad, where the popular version is not malicious, merely wrong, and
`us-669 The myth of the West`.

**Live political use.** More than any other collection here, this one will be read by people who are
inside the arguments it describes. Cards touching those arguments state what the scholarship supports
and say who disputes it, and the collection takes no position on any question that is live in current
American politics. What it does do is decline to treat a settled historical question as open because it
is politically contested — those are different things, and running them together is the most likely way
this collection goes wrong.

**Modern scholars are capped at two in the thousand and the plan spends both**: `us-666 Frederick
Jackson Turner` and `us-649 The Dunning School and its overthrow`. Both are spent for the same reason,
which is the only reason that justifies one — in each case a historian's account escaped the academy
and became the public understanding of a large part of the American past, which makes the account
itself an event in American history rather than a piece of historiography.

## Names, dates and figures

**Native nations.** The collection uses the name a nation uses for itself where that is established and
current — Muscogee, Lakota, Diné, Haudenosaunee — and gives the familiar name in the same sentence the
first time, because a reader looking for Creek, Sioux, Navajo or Iroquois has to be able to find the
card. Where a treaty, a statute or a court case carries the older name, the card names it as the
document does and says so. **A name is not an argument and must not be made to do one silently**, which
is the rule the Russia and India plans set and which applies here to *Native American*, *American
Indian* and *Indigenous* alike: all three are in current use, including by the people they describe,
and the collection prefers the specific nation to any of them.

**Enslaved people, not slaves**, throughout, in card prose and in glossary descriptions. The reason is
not delicacy: *slave* names a person by the thing done to them and quietly makes it a category of
person rather than a condition imposed, which is a historical claim and a false one. *Enslaver* rather
than *owner* or *master* where the sentence needs the other party. Direct quotation from a source keeps
the source's words.

**Dates.** Unusually straightforward for this site — no calendar problem after 1752, when British
America adopted the Gregorian calendar, and dates before that are given as the sources give them with a
note where the eleven days matter (Washington's birthday is the standing example). The one real trap is
the war names: the Seven Years' War is carded as the French and Indian War because that is what the
North American theatre is called in this literature, with the other name given.

**Figures.** Three sets are contested and all three are carded so that a reader meets the argument
rather than a number. The **pre-contact population of North America** has published estimates from
about 2 million to about 18 million, resting on different methods, and `us-039` is about why. The
**mortality of the Middle Passage and of the demographic collapse** likewise. And the **Civil War
dead** were revised upward from 620,000 to a range around 750,000 in 2011 on demographic evidence, and
`us-599` gives the range and says whose it is. Elsewhere the rule is the standing one: give the range,
name whose it is, and never state the highest or lowest available figure flat.

## Sourcing

**Extremely well served, and the best-served collection on the site.** The Library of Congress, the
National Archives, the Smithsonian, the National Park Service's historical handbooks, the Census
Bureau's historical statistics and the university presses are all open, deep and reachable, and the
founding documents, the Congressional record, the Supreme Court reports and the secession declarations
are primary sources anyone can read in full. The 45 presidential glossary terms already carry
Miller Center citations from Phase 2 of the citation pass, which is a head start no other collection
had.

**Three hazards, and the second is the one to think about hardest.**

**Lost Cause material is still in wide circulation** and some of it is on heritage-organisation sites,
in state historical markers and in older textbooks that are online precisely because they are out of
copyright. Age is not authority. A pre-1950 general history of Reconstruction is evidence of what was
believed, not of what happened.

**The WPA slave narratives are indispensable and need handling as evidence.** More than two thousand
interviews with formerly enslaved people, held at the Library of Congress and readable in full, and the
richest first-person source there is for `us-enslaved-life`. They were also collected in the 1930s, from
people who had mostly been children before 1865, by interviewers who were mostly white and mostly
southern, in a Jim Crow South where a Black informant had obvious reasons to be careful about what they
said to them and how. Historians use them heavily and with that caveat attached; so should these cards.
`us-470` is about this directly, and any card leaning on a narrative should be written having read what
the scholarship says about using them.

**Much state and local "heritage" material is advocacy**, and it is often the top result for a specific
place or event. The citation bar is the defence and it is the ordinary one: a peer-reviewed work, a
national archive or library, a museum with a research department, or a government record — opened and
read — or the claim does not ship.

## Living beside the other collections

**World History is the survey and never waits for this collection.** The American Revolution, the Civil
War, the world wars and the Cold War are all carded in `col-8` at survey altitude. The rule in
`docs/world-history-card-plan.md` cuts both ways: ten sentences on the American Civil War is a different
card from ten sentences on the Anaconda Plan.

**The Cold War pair is the one another plan asked for.** `docs/russia-card-plan.md` says outright that
when this collection is planned, "the Cuban Missile Crisis, the space race and the arms control
treaties should get the table the Rome plan gives its Greek pairs". Here it is:

| subject | in `col-42` Russia | here |
|---|---|---|
| the origins of the Cold War | `ru-700`-range — a Soviet reading of encirclement and of what the war had cost | `us-856` — an American reading of an ally that did not leave the countries it had liberated |
| the Cuban Missile Crisis | `ru-706` — a Soviet decision and a Soviet retreat | `us-888` — thirteen days in Washington, and the concession that was kept quiet |
| the space race | `ru-708`-range — Sputnik and Gagarin as Soviet achievements | `us-877` — Sputnik as an American shock, and what it did to schools and budgets |
| the arms race | Soviet strategic doctrine and its costs | `us-865`, `us-874`, `us-878` — deterrence, brinkmanship and the military-industrial complex |

Neither collection carries the other's card. Write the one this collection needs.

**Four more pairs already exist**, and three of them are with collections planned this month:

| subject | elsewhere | here |
|---|---|---|
| Pearl Harbor and the Pacific | `ww2-441`–`ww2-470`, `ww2-471`–`ww2-510` — the theatre and the campaign | `us-828`, `us-843`–`us-846` — what the war did to a country that had been arguing about staying out |
| the atomic bomb | `ww2-909`–`ww2-912`, `ww2-936`–`ww2-946` — the project and the decision, from the war's side | `us-840`–`us-842`, `us-851`–`us-853` — the project as an American undertaking and the argument Americans have had about it since |
| Japanese American internment | `ww2-508` — one of the war's civilian internments | `us-833`, `us-834` — a constitutional question the Supreme Court got wrong and said so fifty years later |
| the Occupation of Japan | `jp-771`–`jp-800` — six years that rewrote a country's constitution, land ownership and schools, from inside it | `us-846`-range and the Cold War deck — an American undertaking that became a Cold War asset |

**And one collection that does not exist yet.** The British side of the imperial crisis, the Revolution
and the War of 1812 belongs to a Britain collection Folio has not planned. `docs/india-card-plan.md`
records the same gap for Plassey, 1857 and Partition. When it is written, these are its pairs.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `us-076`–`us-080`, removal and the Trail of Tears → also `us-jackson`, whose presidency did it
- `us-082`–`us-092`, the plains wars and allotment → also `us-west`
- `us-287 Three-fifths Compromise`, `us-288 The Constitution and slavery` → also `us-slave-system`
- `us-447 Slavery and the American Revolution`, `us-448 Abolition of slavery in the northern states` → also `us-early-republic`
- `us-604 Emancipation Proclamation`, `us-612 Thirteenth Amendment` → also `us-abolition`
- `us-630 Fourteenth Amendment`, `us-635 Fifteenth Amendment` → also `us-constitution`
- `us-773 Great Migration` → also `us-civil-rights`
- `us-833 Internment of Japanese Americans` → also `us-rights`

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`).

**This collection starts further ahead than any other.** All 45 presidents are already glossary terms,
cited at the bar from batches P1–P7 of the citation pass, along with `United_States`, `North_America`
and `Settlement_of_the_Americas`. What is missing is everything else: no `Slavery`, no `Reconstruction`,
no `Jim_Crow`, no `Manifest_Destiny`, no `New_Deal`, no `Cherokee`, no `Lakota`. Write those **cited
from the start**, at the `GLOSS_SRC_TARGET` bar of 2.

Three traps. **A term whose surface is an ordinary English word** — `Union`, `Confederacy`, `Frontier`,
`Reconstruction`, `Progressive`, `Depression`, `Prohibition`, `Reservation` — needs
`GLOSSARY_CASESENSITIVE` or a narrower head word, and this collection has a great many. **A Native
nation needs its aliases the day it ships**, both directions: `Muscogee` with *Creek*, `Lakota` with
*Sioux*, `Diné` with *Navajo*, `Haudenosaunee` with *Iroquois*, or half the cards in deck 1 will link
to nothing. And **the slavery and civil-rights terms need particular care in three sentences**: a
glossary entry is the shortest thing on the site and the least room in which to be careless, so draft
those from museum and institutional definitions — the National Museum of African American History and
Culture and the Library of Congress both publish them — which exist precisely because the wording
matters.

---

# The list

## Native America

### Native America before contact — `us-native-before`

    us-001  Native Americans in the United States
    us-002  Settlement of the Americas
    us-003  Beringia
    us-004  The coastal migration route
    us-005  Paleo-Indians
    us-006  Clovis culture
    us-007  The pre-Clovis debate
    us-008  Monte Verde and the evidence for early arrival
    us-009  The Archaic period in North America
    us-010  The domestication of maize
    us-011  The Three Sisters
    us-012  Eastern Agricultural Complex
    us-013  Poverty Point
    us-014  Adena culture
    us-015  Hopewell tradition
    us-016  The Hopewell exchange network
    us-017  Mississippian culture
    us-018  Cahokia
    us-019  Monks Mound
    us-020  The abandonment of Cahokia
    us-021  Moundville
    us-022  Ancestral Puebloans
    us-023  Chaco Canyon
    us-024  The Chaco roads and the great houses
    us-025  Mesa Verde
    us-026  The Ancestral Puebloan migrations
    us-027  Hohokam
    us-028  Mogollon
    us-029  The Pueblo peoples
    us-030  The Athabaskan migration and the Diné and Apache
    us-031  The peoples of the Northwest Coast
    us-032  The potlatch
    us-033  The peoples of California before contact
    us-034  The Great Basin peoples
    us-035  The Great Plains before the horse
    us-036  Haudenosaunee Confederacy
    us-037  The Great Law of Peace
    us-038  The Algonquian peoples of the eastern woodlands
    us-039  Estimating the pre-contact population of North America
    us-040  How pre-contact America is known

### Contact, disease and the colonial encounter — `us-native-contact`

    us-041  Columbian exchange
    us-042  Virgin soil epidemics
    us-043  The demographic collapse of Native America
    us-044  Smallpox in the Americas
    us-045  The horse and the transformation of the Plains
    us-046  Comanche
    us-047  The Comanche ascendancy
    us-048  Lakota
    us-049  The Plains horse cultures
    us-050  The North American fur trade
    us-051  The Beaver Wars
    us-052  Native nations and European rivalry
    us-053  Wampum
    us-054  The Covenant Chain
    us-055  Praying towns
    us-056  Native American Christianity
    us-057  Pueblo Revolt
    us-058  Popé
    us-059  The Spanish return to New Mexico
    us-060  King Philip's War
    us-061  Metacomet
    us-062  Native slavery in colonial America
    us-063  The Yamasee War
    us-064  The Tuscarora War
    us-065  Native diplomacy and the middle ground
    us-066  Native nations and the deerskin trade
    us-067  Pontiac's War
    us-068  Royal Proclamation of 1763
    us-069  Native nations in the American Revolution
    us-070  Joseph Brant
    us-071  The Sullivan Expedition and the destruction of Haudenosaunee towns
    us-072  Northwest Indian War
    us-073  Battle of Fallen Timbers
    us-074  Tecumseh
    us-075  Tenskwatawa and the Prophetstown movement

### Removal, the reservations and sovereignty — `us-native-modern`

    us-076  Indian Removal Act
    us-077  Cherokee Nation v. Georgia
    us-078  Worcester v. Georgia
    us-079  Trail of Tears
    us-080  The removal of the Five Tribes
    us-081  Indian Territory
    us-082  The Seminole Wars
    us-083  The California genocide
    us-084  The reservation system
    us-085  The Indian agent and the treaty system
    us-086  The end of treaty-making in 1871
    us-087  Dawes Act
    us-088  Allotment and the loss of Native land
    us-089  American Indian boarding schools
    us-090  Carlisle Indian Industrial School
    us-091  What the boarding schools did
    us-092  The Ghost Dance
    us-093  Wounded Knee Massacre
    us-094  Native Americans and the First World War
    us-095  Indian Citizenship Act
    us-096  Indian Reorganization Act
    us-097  Indian termination policy
    us-098  American Indian Movement
    us-099  Wounded Knee Occupation
    us-100  Tribal sovereignty in modern America

## Colonies and Empire, 1565–1763

### Spanish, French and Dutch North America — `us-borderlands`

    us-101  Spanish Florida
    us-102  St. Augustine, Florida
    us-103  Juan Ponce de León
    us-104  The de Soto expedition
    us-105  The Coronado expedition
    us-106  Spanish New Mexico
    us-107  Santa Fe, New Mexico
    us-108  The encomienda on the northern frontier
    us-109  The Spanish mission system
    us-110  The Spanish missions in California
    us-111  Junípero Serra and the argument about the missions
    us-112  Spanish Texas
    us-113  New France
    us-114  Samuel de Champlain
    us-115  Quebec and the St. Lawrence settlements
    us-116  Coureurs des bois
    us-117  Jesuit missions in New France
    us-118  The Jesuit Relations
    us-119  Louisiana (New France)
    us-120  New Orleans under the French
    us-121  New Netherland
    us-122  New Amsterdam
    us-123  Peter Stuyvesant
    us-124  The English conquest of New Netherland
    us-125  What the Dutch and French left behind

### The English colonies — `us-colonies`

    us-126  Roanoke Colony
    us-127  The fate of the Roanoke colonists
    us-128  Jamestown
    us-129  Virginia Company
    us-130  The Starving Time
    us-131  John Smith
    us-132  Powhatan
    us-133  Pocahontas
    us-134  The Anglo-Powhatan Wars
    us-135  Tobacco and the Virginia economy
    us-136  Headright
    us-137  Indentured servitude in the American colonies
    us-138  House of Burgesses
    us-139  Bacon's Rebellion
    us-140  Plymouth Colony
    us-141  Mayflower
    us-142  Mayflower Compact
    us-143  William Bradford
    us-144  The Pilgrims and the Separatists
    us-145  Massachusetts Bay Colony
    us-146  John Winthrop
    us-147  The Great Migration to New England
    us-148  City upon a Hill
    us-149  The New England town and the congregation
    us-150  Roger Williams and Rhode Island
    us-151  Anne Hutchinson
    us-152  Connecticut and the Fundamental Orders
    us-153  Pequot War
    us-154  Province of Maryland
    us-155  Maryland Toleration Act
    us-156  Province of Carolina
    us-157  Barbados and the making of Carolina slavery
    us-158  Province of Georgia
    us-159  James Oglethorpe
    us-160  Province of Pennsylvania
    us-161  William Penn
    us-162  Quakers in colonial America
    us-163  New Jersey and Delaware
    us-164  New England Confederation
    us-165  Dominion of New England
    us-166  The Glorious Revolution in the colonies
    us-167  Navigation Acts
    us-168  Salutary neglect
    us-169  The colonial assemblies and colonial government
    us-170  The English colonies compared

### Colonial society and the imperial wars — `us-colonial-society`

    us-171  Colonial population growth
    us-172  The colonial family
    us-173  Women in colonial America
    us-174  Colonial agriculture
    us-175  The colonial economy and the Atlantic trade
    us-176  Colonial cities
    us-177  Colonial Boston, Philadelphia and New York
    us-178  The colonial gentry
    us-179  Poverty and dependence in the colonies
    us-180  German immigration to colonial America
    us-181  Scots-Irish immigration to colonial America
    us-182  The colonial backcountry
    us-183  Religion in the American colonies
    us-184  First Great Awakening
    us-185  George Whitefield
    us-186  Jonathan Edwards
    us-187  The Old Lights and the New Lights
    us-188  Colonial printing and the newspaper
    us-189  John Peter Zenger
    us-190  Benjamin Franklin
    us-191  The American Enlightenment
    us-192  The colonial colleges
    us-193  Salem witch trials
    us-194  What the Salem trials were about
    us-195  Smallpox inoculation in colonial America
    us-196  King William's War and Queen Anne's War
    us-197  King George's War
    us-198  French and Indian War
    us-199  Battle of the Monongahela
    us-200  The Albany Congress and the Albany Plan
    us-201  Battle of the Plains of Abraham
    us-202  Treaty of Paris (1763)
    us-203  What British victory changed
    us-204  The colonial militia
    us-205  Colonial identity on the eve of the crisis

## Revolution and Founding, 1763–1800

### The imperial crisis — `us-imperial-crisis`

    us-206  The imperial crisis
    us-207  The cost of the Seven Years' War
    us-208  Sugar Act
    us-209  Stamp Act 1765
    us-210  Stamp Act Congress
    us-211  Sons of Liberty
    us-212  No taxation without representation
    us-213  Virtual representation
    us-214  Declaratory Act
    us-215  Townshend Acts
    us-216  The non-importation movement
    us-217  Colonial women and the boycotts
    us-218  Boston Massacre
    us-219  The trial of the soldiers
    us-220  Gaspee Affair
    us-221  Committees of correspondence
    us-222  Tea Act
    us-223  Boston Tea Party
    us-224  Intolerable Acts
    us-225  Quebec Act
    us-226  First Continental Congress
    us-227  Continental Association
    us-228  Loyalists in the American Revolution
    us-229  Common Sense
    us-230  Thomas Paine
    us-231  Battles of Lexington and Concord
    us-232  The shot heard round the world
    us-233  Second Continental Congress
    us-234  Olive Branch Petition
    us-235  Why the colonies rebelled

### The War of Independence — `us-revolution`

    us-236  American Revolutionary War
    us-237  Siege of Boston
    us-238  Battle of Bunker Hill
    us-239  Washington takes command of the army
    us-240  Continental Army
    us-241  The invasion of Quebec, 1775
    us-242  United States Declaration of Independence
    us-243  The drafting of the Declaration
    us-244  Thomas Jefferson
    us-245  All men are created equal
    us-246  The grievances in the Declaration
    us-247  The New York campaign of 1776
    us-248  Washington's retreat across New Jersey
    us-249  Battle of Trenton
    us-250  Battle of Princeton
    us-251  Saratoga campaign
    us-252  Battles of Saratoga
    us-253  The Franco-American alliance
    us-254  Benjamin Franklin in Paris
    us-255  Valley Forge
    us-256  Friedrich Wilhelm von Steuben
    us-257  The war in the South
    us-258  Siege of Charleston
    us-259  Battle of Camden
    us-260  Nathanael Greene
    us-261  Partisan war in the Carolinas
    us-262  Battle of Cowpens
    us-263  Battle of Guilford Court House
    us-264  The naval war of the Revolution
    us-265  John Paul Jones
    us-266  Benedict Arnold
    us-267  Siege of Yorktown
    us-268  The surrender at Yorktown
    us-269  Treaty of Paris (1783)
    us-270  Black soldiers in the Revolutionary War
    us-271  Dunmore's Proclamation
    us-272  Women in the American Revolution
    us-273  The loyalist exodus
    us-274  The cost of the Revolutionary War
    us-275  How radical was the American Revolution?

### The Constitution — `us-constitution`

    us-276  Articles of Confederation
    us-277  The Confederation Congress
    us-278  The weaknesses of the Confederation
    us-279  Land Ordinance of 1785
    us-280  Northwest Ordinance
    us-281  Shays' Rebellion
    us-282  Annapolis Convention
    us-283  Constitutional Convention
    us-284  Virginia Plan
    us-285  New Jersey Plan
    us-286  Connecticut Compromise
    us-287  Three-fifths Compromise
    us-288  The Constitution and slavery
    us-289  Separation of powers
    us-290  Checks and balances
    us-291  Federalism in the United States
    us-292  Article One and the Congress
    us-293  Article Two and the presidency
    us-294  United States Electoral College
    us-295  Article Three and the judiciary
    us-296  Supremacy Clause
    us-297  The amendment process
    us-298  James Madison
    us-299  Alexander Hamilton
    us-300  The Federalist Papers
    us-301  Federalist No. 10
    us-302  Anti-Federalism
    us-303  The ratification debate
    us-304  The state ratifying conventions
    us-305  United States Bill of Rights
    us-306  First Amendment
    us-307  Second Amendment
    us-308  The rights of the accused
    us-309  What the Constitution left unsettled
    us-310  The silences of the Constitution

### The early republic — `us-early-republic`

    us-311  The presidency of George Washington
    us-312  The first cabinet
    us-313  Judiciary Act of 1789
    us-314  Hamilton's financial programme
    us-315  The assumption of the state debts
    us-316  First Bank of the United States
    us-317  Whiskey Rebellion
    us-318  First Party System
    us-319  Federalist Party
    us-320  Democratic-Republican Party
    us-321  Jay Treaty
    us-322  Pinckney's Treaty
    us-323  Washington's Farewell Address
    us-324  The presidency of John Adams
    us-325  Quasi-War
    us-326  XYZ Affair
    us-327  Alien and Sedition Acts
    us-328  Kentucky and Virginia Resolutions
    us-329  1800 United States presidential election
    us-330  The revolution of 1800
    us-331  Marbury v. Madison
    us-332  Judicial review in the United States
    us-333  John Marshall
    us-334  The peaceful transfer of power
    us-335  The republic in 1800

## Expansion and Division, 1800–1860

### Jefferson, Madison and the War of 1812 — `us-jefferson`

    us-336  The presidency of Thomas Jefferson
    us-337  Louisiana Purchase
    us-338  The constitutional problem of the Purchase
    us-339  Lewis and Clark Expedition
    us-340  Sacagawea
    us-341  Barbary Wars
    us-342  Aaron Burr
    us-343  Burr conspiracy
    us-344  Embargo Act of 1807
    us-345  The presidency of James Madison
    us-346  The causes of the War of 1812
    us-347  Impressment
    us-348  War Hawks
    us-349  War of 1812
    us-350  The invasion of Canada, 1812
    us-351  Battle of Lake Erie
    us-352  Burning of Washington
    us-353  Battle of Baltimore and the national anthem
    us-354  Battle of New Orleans
    us-355  The rise of Andrew Jackson
    us-356  Treaty of Ghent
    us-357  Hartford Convention
    us-358  The end of the Federalist Party
    us-359  Era of Good Feelings
    us-360  The presidency of James Monroe
    us-361  Monroe Doctrine
    us-362  Panic of 1819
    us-363  Missouri Compromise

### The Jacksonian era — `us-jackson`

    us-364  Market Revolution
    us-365  Erie Canal
    us-366  Steamboats and the western rivers
    us-367  The first American railroads
    us-368  Lowell mill girls
    us-369  American System
    us-370  Henry Clay
    us-371  Tariff of Abominations
    us-372  1824 United States presidential election
    us-373  Corrupt bargain
    us-374  The presidency of John Quincy Adams
    us-375  The rise of mass democracy
    us-376  The expansion of the franchise
    us-377  Second Party System
    us-378  Democratic Party (United States)
    us-379  Whig Party (United States)
    us-380  The presidency of Andrew Jackson
    us-381  Spoils system
    us-382  Nullification crisis
    us-383  John C. Calhoun
    us-384  Bank War
    us-385  Second Bank of the United States
    us-386  Panic of 1837
    us-387  The presidency of Martin Van Buren
    us-388  The log cabin campaign of 1840
    us-389  The limits of Jacksonian democracy
    us-390  What Jacksonian democracy is argued to have been

### Expansion and Manifest Destiny — `us-expansion`

    us-391  Manifest destiny
    us-392  Oregon Trail
    us-393  The overland migrations
    us-394  Mormon pioneers
    us-395  Joseph Smith and the Latter Day Saint movement
    us-396  Brigham Young and the settlement of Utah
    us-397  Texas Revolution
    us-398  Battle of the Alamo
    us-399  Republic of Texas
    us-400  Texas annexation
    us-401  The presidency of James K. Polk
    us-402  Oregon boundary dispute
    us-403  Mexican–American War
    us-404  The march on Mexico City
    us-405  Opposition to the Mexican War
    us-406  Treaty of Guadalupe Hidalgo
    us-407  Mexican Cession
    us-408  Mexican Americans after 1848
    us-409  California Gold Rush
    us-410  The forty-niners
    us-411  San Francisco and the boom towns
    us-412  Chinese immigration to California
    us-413  The Californios and the loss of the ranchos
    us-414  Santa Fe Trail
    us-415  Gadsden Purchase
    us-416  Filibuster (military)
    us-417  The Perry expedition to Japan
    us-418  The Pacific Railroad Surveys
    us-419  The West as an idea before 1860
    us-420  What expansion cost

### Antebellum society and reform — `us-antebellum`

    us-421  Antebellum America
    us-422  Second Great Awakening
    us-423  Charles Grandison Finney
    us-424  Burned-over district
    us-425  Utopian communities in America
    us-426  The temperance movement
    us-427  Asylum and prison reform
    us-428  Dorothea Dix
    us-429  The common school movement
    us-430  Horace Mann
    us-431  Cult of Domesticity
    us-432  Women's rights before Seneca Falls
    us-433  Seneca Falls Convention
    us-434  Elizabeth Cady Stanton
    us-435  Know Nothing
    us-436  Irish immigration and the Great Famine
    us-437  German immigration in the 1840s and 1850s
    us-438  Transcendentalism
    us-439  Ralph Waldo Emerson and Henry David Thoreau
    us-440  The American Renaissance in letters

## Slavery

### The slave trade and the slave economy — `us-slave-system`

    us-441  Slavery in the United States
    us-442  Atlantic slave trade
    us-443  Middle Passage
    us-444  The origins of slavery in Virginia
    us-445  Slave codes
    us-446  Slavery in the colonial North
    us-447  Slavery and the American Revolution
    us-448  Abolition of slavery in the northern states
    us-449  Act Prohibiting Importation of Slaves
    us-450  Cotton gin
    us-451  The cotton boom
    us-452  King Cotton
    us-453  Slave trade in the United States
    us-454  The coffle and the journey south
    us-455  The slave market and the slave pen
    us-456  The economics of American slavery
    us-457  The debate over the profitability of slavery
    us-458  Slavery and northern capital
    us-459  American slavery and the world economy
    us-460  The planter class
    us-461  The plantation
    us-462  Overseers and drivers
    us-463  Urban slavery
    us-464  Industrial slavery
    us-465  The law of slavery in the United States
    us-466  Slave patrol
    us-467  Proslavery
    us-468  George Fitzhugh and the defence of slavery
    us-469  Counting the enslaved population
    us-470  The sources for American slavery

### Enslaved life, family and resistance — `us-enslaved-life`

    us-471  The lives of the enslaved
    us-472  The slave quarters
    us-473  Enslaved labour in the fields
    us-474  The task system and the gang system
    us-475  Enslaved women in the United States
    us-476  Childbirth and motherhood under slavery
    us-477  Enslaved families
    us-478  The sale and separation of families
    us-479  Enslaved children
    us-480  Food, clothing and material life under slavery
    us-481  Health and mortality among the enslaved
    us-482  Violence and punishment under slavery
    us-483  Sexual violence under slavery
    us-484  African American religion under slavery
    us-485  The Black church before emancipation
    us-486  Spirituals
    us-487  African survivals in African American culture
    us-488  Gullah
    us-489  Enslaved craftsmen and skilled labour
    us-490  Literacy and the laws against teaching the enslaved
    us-491  Everyday resistance to slavery
    us-492  Running away from slavery
    us-493  Maroon communities in North America
    us-494  Slave rebellions in the United States
    us-495  Stono Rebellion
    us-496  Gabriel's conspiracy
    us-497  Denmark Vesey
    us-498  Nat Turner's slave rebellion
    us-499  The response to Nat Turner
    us-500  United States v. The Amistad
    us-501  Free Black communities in the South
    us-502  Free Black communities in the North
    us-503  Black abolitionists
    us-504  Slave narrative
    us-505  How American slavery has been written about

### Abolition and the antislavery movement — `us-abolition`

    us-506  Abolitionism in the United States
    us-507  Quakers and early antislavery
    us-508  American Colonization Society
    us-509  Liberia and the colonisation argument
    us-510  William Lloyd Garrison
    us-511  The Liberator
    us-512  American Anti-Slavery Society
    us-513  Immediatism
    us-514  Gag rule
    us-515  Frederick Douglass
    us-516  Narrative of the Life of Frederick Douglass
    us-517  Sojourner Truth
    us-518  Harriet Tubman
    us-519  Underground Railroad
    us-520  The Underground Railroad and what is actually known about it
    us-521  Fugitive Slave Act of 1850
    us-522  Resistance to the fugitive slave law
    us-523  Uncle Tom's Cabin
    us-524  Harriet Beecher Stowe
    us-525  Political antislavery
    us-526  Liberty Party and Free Soil Party
    us-527  Abolitionists and women's rights
    us-528  Violence and the antislavery movement
    us-529  John Brown
    us-530  John Brown's raid on Harpers Ferry

## Civil War and Reconstruction, 1848–1877

### The sectional crisis — `us-sectional-crisis`

    us-531  Sectionalism in the United States
    us-532  Wilmot Proviso
    us-533  Popular sovereignty
    us-534  Compromise of 1850
    us-535  The debate over the Compromise of 1850
    us-536  Daniel Webster and the Seventh of March speech
    us-537  Kansas–Nebraska Act
    us-538  Stephen A. Douglas
    us-539  Bleeding Kansas
    us-540  The caning of Charles Sumner
    us-541  The founding of the Republican Party
    us-542  The Republican coalition of the 1850s
    us-543  Dred Scott v. Sandford
    us-544  The reaction to Dred Scott
    us-545  Lincoln–Douglas debates
    us-546  The rise of Abraham Lincoln
    us-547  House Divided Speech
    us-548  The Democratic split of 1860
    us-549  1860 United States presidential election
    us-550  Secession in the United States
    us-551  The secession winter
    us-552  Confederate States of America
    us-553  The Confederate constitution
    us-554  Cornerstone Speech
    us-555  What caused the American Civil War

### The Civil War — `us-civil-war`

    us-556  American Civil War
    us-557  Battle of Fort Sumter
    us-558  The secession of the upper South
    us-559  Border states in the American Civil War
    us-560  The resources of North and South
    us-561  First Battle of Bull Run
    us-562  Anaconda Plan
    us-563  Union blockade
    us-564  George B. McClellan
    us-565  Army of the Potomac
    us-566  Peninsula campaign
    us-567  Seven Days Battles
    us-568  Robert E. Lee
    us-569  Second Battle of Bull Run
    us-570  Battle of Antietam
    us-571  The bloodiest day in American history
    us-572  Battle of Fredericksburg
    us-573  Battle of Chancellorsville
    us-574  The death of Stonewall Jackson
    us-575  Battle of Gettysburg
    us-576  Pickett's Charge
    us-577  Gettysburg Address
    us-578  The Civil War in the West
    us-579  Ulysses S. Grant
    us-580  Battle of Shiloh
    us-581  The capture of New Orleans
    us-582  Siege of Vicksburg
    us-583  Battles for Chattanooga
    us-584  Grant takes command of the Union armies
    us-585  Overland Campaign
    us-586  Battle of Cold Harbor
    us-587  Siege of Petersburg
    us-588  William Tecumseh Sherman
    us-589  Atlanta campaign
    us-590  Sherman's March to the Sea
    us-591  Hard war and its limits
    us-592  Battle of Mobile Bay
    us-593  The ironclads and the naval war
    us-594  Battle of Hampton Roads
    us-595  Confederate commerce raiders
    us-596  Appomattox Court House
    us-597  The surrender at Appomattox
    us-598  Assassination of Abraham Lincoln
    us-599  Counting the Civil War dead
    us-600  Why the Union won

### Emancipation and Black freedom — `us-emancipation`

    us-601  Emancipation in the American Civil War
    us-602  Contraband (American Civil War)
    us-603  Confiscation Acts
    us-604  Emancipation Proclamation
    us-605  What the Emancipation Proclamation did and did not do
    us-606  Abraham Lincoln and slavery
    us-607  Self-emancipation and the enslaved
    us-608  United States Colored Troops
    us-609  54th Massachusetts Infantry Regiment
    us-610  Battle of Fort Pillow
    us-611  Black soldiers and the fight over equal pay
    us-612  Thirteenth Amendment
    us-613  The Civil War home fronts
    us-614  The Union war economy
    us-615  The Confederate war economy
    us-616  Confederate conscription and dissent
    us-617  New York City draft riots
    us-618  Women in the American Civil War
    us-619  Civil War medicine
    us-620  Andersonville and the prison camps

### Reconstruction and its overthrow — `us-reconstruction`

    us-621  Reconstruction era
    us-622  Presidential Reconstruction
    us-623  Andrew Johnson
    us-624  Black Codes
    us-625  Freedmen's Bureau
    us-626  What the freedpeople wanted
    us-627  Forty acres and a mule
    us-628  Sharecropping
    us-629  Civil Rights Act of 1866
    us-630  Fourteenth Amendment
    us-631  Radical Reconstruction
    us-632  Thaddeus Stevens and the Radical Republicans
    us-633  Reconstruction Acts
    us-634  Impeachment of Andrew Johnson
    us-635  Fifteenth Amendment
    us-636  Black officeholders during Reconstruction
    us-637  Hiram Rhodes Revels and Blanche Bruce
    us-638  Black schools and churches after emancipation
    us-639  The Reconstruction state governments
    us-640  Ku Klux Klan
    us-641  Enforcement Acts
    us-642  Colfax massacre
    us-643  The White League and paramilitary terror
    us-644  Panic of 1873 and the northern retreat
    us-645  Slaughter-House Cases
    us-646  Compromise of 1877
    us-647  The end of Reconstruction
    us-648  Lost Cause of the Confederacy
    us-649  The Dunning School and its overthrow
    us-650  Reconstruction reconsidered

## The Industrial Nation, 1865–1917

### The West — `us-west`

    us-651  American frontier
    us-652  Homestead Acts
    us-653  First transcontinental railroad
    us-654  The railroad land grants
    us-655  Chinese labour and the transcontinental railroad
    us-656  The Plains wars
    us-657  Sand Creek massacre
    us-658  Battle of the Little Bighorn
    us-659  Sitting Bull
    us-660  Chief Joseph and the Nez Perce flight
    us-661  The destruction of the bison
    us-662  The cattle kingdom
    us-663  The long drive and the cow towns
    us-664  The cowboy
    us-665  Frontier Thesis
    us-666  Frederick Jackson Turner
    us-667  Mining booms in the American West
    us-668  Comstock Lode
    us-669  The myth of the West
    us-670  Farming the Great Plains
    us-671  Dry farming, barbed wire and the windmill
    us-672  Women in the American West
    us-673  Exodusters
    us-674  Buffalo Soldiers
    us-675  Irrigation and the settlement of the arid West
    us-676  Alaska Purchase
    us-677  The overthrow of the Hawaiian Kingdom
    us-678  Oklahoma land runs
    us-679  Conservation and the national parks
    us-680  John Muir and the wilderness idea

### Industry, labour and the corporation — `us-industry`

    us-681  Gilded Age
    us-682  Industrialisation in the United States
    us-683  Andrew Carnegie and the steel industry
    us-684  Vertical integration
    us-685  John D. Rockefeller and Standard Oil
    us-686  The trust and the holding company
    us-687  J. P. Morgan and finance capital
    us-688  Robber baron
    us-689  Sherman Antitrust Act
    us-690  Thomas Edison and the electric light
    us-691  The electrification of America
    us-692  The telephone and the telegraph
    us-693  Mass production and the assembly line
    us-694  Scientific management
    us-695  The department store and the mail-order catalogue
    us-696  Advertising and the American consumer
    us-697  Industrial work and the working day
    us-698  Child labour in the United States
    us-699  Industrial accidents and the Triangle fire
    us-700  Knights of Labor
    us-701  American Federation of Labor
    us-702  Samuel Gompers
    us-703  Great Railroad Strike of 1877
    us-704  Haymarket affair
    us-705  Homestead strike
    us-706  Pullman Strike
    us-707  Eugene V. Debs
    us-708  Industrial Workers of the World
    us-709  Socialism in the United States
    us-710  Why American labour took the shape it did

### Immigration and the city — `us-immigration-city`

    us-711  Immigration to the United States
    us-712  The old immigration and the new
    us-713  Ellis Island
    us-714  Angel Island Immigration Station
    us-715  The immigrant crossing
    us-716  Italian immigration to the United States
    us-717  Eastern European Jewish immigration
    us-718  The Lower East Side
    us-719  Immigrant neighbourhoods and mutual aid societies
    us-720  Immigrant labour in the industrial city
    us-721  The urban political machine
    us-722  Tammany Hall
    us-723  The American city in 1900
    us-724  Tenement
    us-725  How the Other Half Lives
    us-726  Jacob Riis and the photograph as argument
    us-727  Urban sanitation and public health
    us-728  The skyscraper
    us-729  The streetcar and the first suburbs
    us-730  Chinese Exclusion Act
    us-731  Anti-Chinese violence in the American West
    us-732  Nativism in the Gilded Age
    us-733  The immigrant press and immigrant politics
    us-734  The melting pot and its critics
    us-735  What assimilation demanded

### Populism, Progressivism and empire — `us-progressive`

    us-736  Populism in the United States
    us-737  Farmers' Alliance
    us-738  People's Party (United States)
    us-739  Free silver
    us-740  William Jennings Bryan
    us-741  1896 United States presidential election
    us-742  Progressive Era
    us-743  Muckraker
    us-744  Upton Sinclair and The Jungle
    us-745  Pure Food and Drug Act of 1906
    us-746  Theodore Roosevelt
    us-747  Trust-busting and the Square Deal
    us-748  Progressive reform in the cities and the states
    us-749  Woodrow Wilson and the New Freedom
    us-750  Federal Reserve System
    us-751  The Progressive Era amendments
    us-752  American imperialism
    us-753  Spanish–American War
    us-754  The sinking of the Maine and the yellow press
    us-755  Battle of Manila Bay
    us-756  The annexation of the Philippines
    us-757  Philippine–American War
    us-758  American Anti-Imperialist League
    us-759  Panama Canal
    us-760  Roosevelt Corollary and the Caribbean interventions

## Depression, War and Cold War, 1917–1963

### The First World War and the twenties — `us-ww1-twenties`

    us-761  The United States in World War I
    us-762  American neutrality, 1914–1917
    us-763  Sinking of the RMS Lusitania
    us-764  Zimmermann Telegram
    us-765  The decision for war in 1917
    us-766  American Expeditionary Forces
    us-767  John J. Pershing
    us-768  The American army in France
    us-769  Meuse–Argonne offensive
    us-770  The American home front in the First World War
    us-771  Espionage Act of 1917 and the Sedition Act of 1918
    us-772  Wartime repression and dissent
    us-773  Great Migration
    us-774  Women's suffrage in the United States
    us-775  Nineteenth Amendment
    us-776  Alice Paul and the militant suffragists
    us-777  The 1918 influenza pandemic in the United States
    us-778  Fourteen Points
    us-779  Wilson at the Paris Peace Conference
    us-780  The Senate and the League of Nations
    us-781  First Red Scare
    us-782  Palmer Raids
    us-783  Red Summer
    us-784  Tulsa race massacre
    us-785  The Ku Klux Klan in the 1920s
    us-786  Immigration Act of 1924
    us-787  Prohibition in the United States
    us-788  Organised crime and bootlegging
    us-789  The Roaring Twenties
    us-790  Harlem Renaissance
    us-791  Scopes trial
    us-792  The weaknesses of the 1920s economy

### Depression and the New Deal — `us-depression`

    us-793  Wall Street Crash of 1929
    us-794  The causes of the Great Depression
    us-795  The banking crisis of 1930–1933
    us-796  Unemployment in the Great Depression
    us-797  Hooverville
    us-798  The presidency of Herbert Hoover
    us-799  Bonus Army
    us-800  Dust Bowl
    us-801  The Dust Bowl migration
    us-802  1932 United States presidential election
    us-803  Franklin D. Roosevelt
    us-804  The Hundred Days
    us-805  New Deal
    us-806  Emergency Banking Act and the bank holiday
    us-807  Fireside chats
    us-808  Civilian Conservation Corps
    us-809  Agricultural Adjustment Act
    us-810  National Industrial Recovery Act
    us-811  Tennessee Valley Authority
    us-812  Works Progress Administration
    us-813  The Federal Writers' Project and the arts projects
    us-814  Social Security Act
    us-815  National Labor Relations Act
    us-816  Congress of Industrial Organizations
    us-817  Flint sit-down strike
    us-818  The Second New Deal
    us-819  The Supreme Court and the New Deal
    us-820  Judicial Procedures Reform Bill of 1937
    us-821  New Deal coalition
    us-822  African Americans and the New Deal
    us-823  Mexican Repatriation
    us-824  Recession of 1937–1938
    us-825  What the New Deal did and did not do

### The Second World War — `us-ww2`

    us-826  American isolationism in the 1930s
    us-827  Lend-Lease
    us-828  Attack on Pearl Harbor
    us-829  The American declaration of war
    us-830  American mobilisation for the Second World War
    us-831  The American war economy
    us-832  Rosie the Riveter and women's war work
    us-833  Internment of Japanese Americans
    us-834  Korematsu v. United States
    us-835  African Americans and the Double V campaign
    us-836  Bracero Program
    us-837  Zoot Suit Riots
    us-838  American wartime propaganda
    us-839  Rationing and the American home front
    us-840  Manhattan Project
    us-841  Los Alamos and J. Robert Oppenheimer
    us-842  Trinity nuclear test
    us-843  The American war in the Pacific
    us-844  Island hopping
    us-845  Battle of Midway
    us-846  Iwo Jima and Okinawa
    us-847  The American war in Europe
    us-848  Operation Torch and the Italian campaign
    us-849  The American armies in Normandy
    us-850  The United States Army Air Forces in Europe
    us-851  The decision to use the atomic bomb
    us-852  Atomic bombings of Hiroshima and Nagasaki
    us-853  The American argument about the bomb
    us-854  Demobilisation and the G.I. Bill
    us-855  What the war did to the United States

### The Cold War — `us-cold-war`

    us-856  The origins of the Cold War
    us-857  Containment
    us-858  George F. Kennan and the Long Telegram
    us-859  Truman Doctrine
    us-860  Marshall Plan
    us-861  Berlin Blockade
    us-862  NATO
    us-863  National Security Act of 1947
    us-864  Central Intelligence Agency
    us-865  The nuclear arms race
    us-866  Korean War
    us-867  The loss of China debate
    us-868  McCarthyism
    us-869  Joseph McCarthy
    us-870  House Un-American Activities Committee
    us-871  Hollywood blacklist
    us-872  The Hiss and Rosenberg cases
    us-873  The presidency of Dwight D. Eisenhower
    us-874  Massive retaliation and brinkmanship
    us-875  The CIA and covert intervention
    us-876  Iran 1953 and Guatemala 1954
    us-877  Sputnik and the space race
    us-878  Military–industrial complex
    us-879  The postwar boom
    us-880  Levittown and the new suburbs
    us-881  Baby boom
    us-882  Interstate Highway System
    us-883  Consumer culture in the 1950s
    us-884  Television and American life
    us-885  Rock and roll
    us-886  The Beat Generation
    us-887  Bay of Pigs Invasion
    us-888  Cuban Missile Crisis
    us-889  Assassination of John F. Kennedy
    us-890  The Cold War at home

## Modern America

### Jim Crow and the Black freedom struggle — `us-civil-rights`

    us-891  Jim Crow laws
    us-892  Plessy v. Ferguson
    us-893  Disfranchisement after the Reconstruction era
    us-894  Lynching in the United States
    us-895  Ida B. Wells and the anti-lynching campaign
    us-896  Booker T. Washington
    us-897  W. E. B. Du Bois
    us-898  The Niagara Movement and the NAACP
    us-899  The northern colour line
    us-900  Marcus Garvey
    us-901  Racially restrictive covenants
    us-902  Redlining
    us-903  Civil rights movement
    us-904  Thurgood Marshall and the NAACP legal campaign
    us-905  Brown v. Board of Education
    us-906  Massive resistance
    us-907  Little Rock Nine
    us-908  The murder of Emmett Till
    us-909  Montgomery bus boycott
    us-910  Rosa Parks
    us-911  Martin Luther King Jr.
    us-912  Southern Christian Leadership Conference
    us-913  Greensboro sit-ins
    us-914  Student Nonviolent Coordinating Committee
    us-915  Freedom Riders
    us-916  Birmingham campaign
    us-917  March on Washington for Jobs and Freedom
    us-918  I Have a Dream
    us-919  Freedom Summer
    us-920  Murders of Chaney, Goodman and Schwerner
    us-921  Civil Rights Act of 1964
    us-922  Selma to Montgomery marches
    us-923  Voting Rights Act of 1965
    us-924  Malcolm X
    us-925  Black Power

### The sixties and Vietnam — `us-sixties`

    us-926  The presidency of Lyndon B. Johnson
    us-927  Great Society
    us-928  War on Poverty
    us-929  Medicare and Medicaid
    us-930  Immigration and Nationality Act of 1965
    us-931  The origins of American involvement in Vietnam
    us-932  Gulf of Tonkin incident
    us-933  Vietnam War
    us-934  Escalation and the draft
    us-935  Tet Offensive
    us-936  The antiwar movement in the United States
    us-937  The counterculture of the 1960s
    us-938  Students for a Democratic Society
    us-939  1968 in the United States
    us-940  The assassinations of 1968
    us-941  The urban uprisings of the 1960s
    us-942  Kerner Commission
    us-943  The presidency of Richard Nixon
    us-944  Vietnamization
    us-945  My Lai massacre
    us-946  Kent State shootings
    us-947  Pentagon Papers
    us-948  Fall of Saigon
    us-949  The cost of the Vietnam War
    us-950  Vietnam in American memory

### Rights movements and the new politics — `us-rights`

    us-951  Second-wave feminism
    us-952  Betty Friedan and The Feminine Mystique
    us-953  National Organization for Women
    us-954  Equal Rights Amendment
    us-955  Roe v. Wade
    us-956  Chicano Movement
    us-957  Cesar Chavez and the United Farm Workers
    us-958  Red Power movement
    us-959  The Asian American movement
    us-960  Stonewall riots
    us-961  The gay rights movement in the United States
    us-962  The disability rights movement
    us-963  The American environmental movement
    us-964  Silent Spring
    us-965  Earth Day and the Environmental Protection Agency
    us-966  The consumer movement and Ralph Nader
    us-967  New Right
    us-968  The religious right
    us-969  The rise of the culture wars
    us-970  Rights and the Supreme Court since 1960

### America since 1974 — `us-since-1974`

    us-971  Watergate scandal
    us-972  The resignation of Richard Nixon
    us-973  The presidency of Gerald Ford
    us-974  Stagflation
    us-975  The oil shocks of the 1970s
    us-976  The presidency of Jimmy Carter
    us-977  Iran hostage crisis
    us-978  The presidency of Ronald Reagan
    us-979  Reaganomics
    us-980  The Reagan buildup and the end of the Cold War
    us-981  Iran–Contra affair
    us-982  Deindustrialisation and the Rust Belt
    us-983  The AIDS epidemic in the United States
    us-984  The war on drugs and mass incarceration
    us-985  The presidency of George H. W. Bush
    us-986  Gulf War
    us-987  The presidency of Bill Clinton
    us-988  NAFTA and globalisation
    us-989  The 1996 welfare and crime legislation
    us-990  September 11 attacks
    us-991  The war on terror
    us-992  Iraq War
    us-993  Great Recession
    us-994  The presidency of Barack Obama
    us-995  Affordable Care Act
    us-996  Political polarisation in the United States
    us-997  Immigration and the border since 1986
    us-998  The United States in the twenty-first century
    us-999  How American history is argued about
    us-1000 What the American story has been made to carry
