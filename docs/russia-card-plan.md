# Russia — the 1000-card plan

The running order for the `col-42` Russia collection. Every card has a number, a topic and a deck,
fixed in advance, so the collection can be grown one card at a time across many sessions without
anyone having to remember where it had got to.

Not part of the site.

## How to use this (the whole point of the file)

**"Generate the next Russia card" means: take the lowest `ru-NNN` that is not yet in `data.js`, read
its topic and deck from the list below, research it, and add it.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));
      for(let i=1;i<=1000;i++){const id='ru-'+String(i).padStart(3,'0');
      if(!h.has(id)){console.log('next:',id);break}}"

There is deliberately **no separate progress file**. `data.js` is the record of what exists, this file
is the record of what is planned, and the next card is whatever falls between them — so the two can
never disagree about where the work has got to.

Then write the card to the rules in CLAUDE.md ("Generating cards & glossary entries") and add it with:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** `add-card.js` falls back to the first leaf in the whole tree when it is
omitted, which is `cn-myth`, in the China collection.

Note that the numbering runs past 999, so ids are **not** all the same length: `ru-001` … `ru-999`,
then `ru-1000`. The command above pads to three digits, which is right for every id but the last.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `ru-400 Battle of Borodino` is already an answer term; `ru-025 Slavic paganism` is an area, and
the card's actual answer — the word that gets blanked — is chosen while writing it, from what the
sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** Some will turn out
to be thinner than they look, and a few will turn out to be two cards. When that happens, change the
line here in the same commit as the card, and say so — this file is only useful while it is true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

Card ids run `ru-001` … `ru-1000`, in the order below. Numbering follows the tree, and the first seven
decks follow chronology, so their running order is roughly chronological — which also means an early
card and a late card in the same deck sort together on the study page, since cards are ordered by
`cardYears(answerDate)` and not by id. The last two decks are thematic and their order is a reading
order rather than a claim about dates.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Rus' | Before Rus' | 35 | ru-001–035 |
| | Kievan Rus' | 55 | ru-036–090 |
| | The Mongol conquest and the Golden Horde | 35 | ru-091–125 |
| | The rise of Moscow | 35 | ru-126–160 |
| Muscovy | Ivan III and Vasily III | 30 | ru-161–190 |
| | Ivan the Terrible | 35 | ru-191–225 |
| | The Time of Troubles | 25 | ru-226–250 |
| | The first Romanovs | 25 | ru-251–275 |
| The Russian Empire | Peter the Great | 40 | ru-276–315 |
| | From Peter to Catherine | 25 | ru-316–340 |
| | Catherine the Great | 40 | ru-341–380 |
| The Nineteenth Century | Alexander I and the war with Napoleon | 35 | ru-381–415 |
| | Nicholas I | 25 | ru-416–440 |
| | The Great Reforms | 40 | ru-441–480 |
| The End of the Empire | Late imperial Russia | 30 | ru-481–510 |
| | 1905 and the fall of the monarchy | 40 | ru-511–550 |
| Revolution and the Soviet Union | 1917 | 35 | ru-551–585 |
| | The Civil War and the making of the USSR | 30 | ru-586–615 |
| | Stalin | 40 | ru-616–655 |
| | The Great Patriotic War | 35 | ru-656–690 |
| | The Soviet Union after Stalin | 25 | ru-691–715 |
| Russia since 1985 | *(flat)* | 35 | ru-716–750 |
| Land, Peoples and Faith | The Russian land | 35 | ru-751–785 |
| | The peoples of Russia | 50 | ru-786–835 |
| | The Orthodox Church | 40 | ru-836–875 |
| Society, Ideas and Culture | Society and everyday life | 30 | ru-876–905 |
| | Russian thought | 20 | ru-906–925 |
| | Russian literature | 40 | ru-926–965 |
| | Art, architecture and music | 35 | ru-966–1000 |

Deck totals: Rus' 160 · Muscovy 115 · The Russian Empire 105 · The Nineteenth Century 100 ·
The End of the Empire 70 · Revolution and the Soviet Union 165 · Russia since 1985 35 ·
Land, Peoples and Faith 125 · Society, Ideas and Culture 125. **1000.**

## What the weighting is arguing

**The pre-Petrine centuries keep 275 cards, better than a quarter of the collection.** A Russian
history course usually opens with a paragraph on Rus', a paragraph on the Mongols and a page on Ivan
the Terrible, and then starts properly with Peter. Eight hundred years is not a prologue: the
institutions that Peter reformed, the church that Stalin persecuted and the frontier that Russia is
still arguing about were all made in them.

**The twentieth century gets 200 and not more** — 165 for the Soviet Union and 35 for everything
since 1985. It is the best-taught stretch of Russian history there is, it is where the accessible
sources are thickest, and it is the part of the collection most in danger of eating the rest. A
reader who wants the Eastern Front in depth is served by a war collection; this is the history of a
country.

**A quarter of the collection — 250 cards — sits outside the narrative altogether**, and 50 of those
are the peoples of Russia. See the decision below; it is the most important one in this file.

**Rus' gets 160 and the Kievan subdeck alone gets 55.** Partly for the reason above, and partly
because this is the period a reader is most likely to arrive at with something already fixed in their
head, from one national story or another. It needs room to be told as a period rather than as a
claim.

**The Orthodox Church gets a 40-card subdeck of its own.** For most of the thousand years this
collection covers, the Church was the largest institution in the country after the state, and for
some of them it was not clearly second. Distributing it through the reigns would leave the icon, the
monastery, the schism and the parish priest as footnotes to politics.

## Six decisions this plan forced on the tree

Written down because they were made here, not in the tree, and the reasoning is invisible from the
tree itself.

**Rus' is covered as the polity it was, and is never called "early Russia".** This is the hardest
decision in the file and the one most likely to be quietly undone by a card written in a hurry.
Kievan Rus' is the shared inheritance of three modern nations — Russia, Ukraine and Belarus — and the
proposition that it is the first chapter of a Russian national story is a claim made in the present,
by interested parties, about a state that had no idea any of the three existed. So the cards describe
a Slavic and Varangian polity centred on Kyiv, using the names its own sources use, and **the modern
claim on that inheritance is itself a card** (`ru-090 The inheritance of Rus'`) rather than an
unexamined assumption in the ninety before it. The collection is called Russia because that is the
country whose history it follows forward; it does not follow that everything upstream of Russia was
Russia.

**Nothing outside the Russian core is an "and the rest" deck.** `ru-peoples` gets 50 cards — the
largest subdeck in the collection — because Russia has been a multinational empire for longer than it
has been anything else, and the usual course treats the Tatars, the peoples of the Caucasus, the
Kazakhs, the Siberian nations, the Poles, the Finns and the Jews of the Pale as things that happen at
the edges of a Russian story. The mechanisms get cards too, not just the peoples: the *yasak*, the
Pale of Settlement, Russification, *korenizatsiya*, the deportations. This mirrors the rule in
`docs/world-history-card-plan.md` about running one chronological spine through Europe and hanging
everything else off it as an excursion.

**Some of the most important things in this collection happened to other people, and they are in it.**
The Circassian expulsions, the Holodomor and the Kazakh famine, Katyn, the deportation of the Chechens
and the Crimean Tatars, the Baltic annexations, Hungary in 1956 and Prague in 1968, the wars in
Chechnya, and Ukraine since 2014 all have cards. They are written as what happened, from the
scholarship, not as episodes in anybody's national achievement and not as an indictment either. A
collection that leaves them out is not a shorter history of Russia; it is a different and false one.

**The Church has a subdeck; Russian thought has a small one.** `ru-thought` is 20 cards — the
Slavophiles and Westernisers, populism, the religious philosophers, Eurasianism — because these
arguments run across every reign and reading them inside one is what makes each reign look like a
personality. It is deliberately small: most Russian thinking about Russia is done in the novels, and
`ru-literature` is twice its size.

**Literature is one subdeck of 40, not one per period.** Russian literature is read as a canon, the
same call the Rome plan makes about Latin. The authors and works live in `ru-literature`; the events
live in the narrative decks, and Pushkin's death is cross-listed to Nicholas I because the censorship
is the point of it.

**The deck breaks at 1985, not 1991.** *Perestroika*, *glasnost*, Chernobyl and the nationalities
crisis are the beginning of what happened next rather than the end of the Brezhnev era, and putting
the August Coup in a different deck from the reforms that led to it teaches the collapse as a
surprise.

## Dates, names and spellings

Three conventions, fixed here so that thirty sessions do not each decide them again.

**Dates.** Russia used the Julian calendar until February 1918, so its dates run behind the Western
ones — twelve days in the nineteenth century, thirteen in the twentieth. The October Revolution
happened in November. **A card gives the date in the style the event is normally cited in and says
which**, and for the revolutionary year gives both (25 October / 7 November 1917). Never silently
convert one into the other; the two dates are both true and the discrepancy is a fact worth teaching.

**Names.** Modern places take the form current English-language scholarship uses — Kyiv, Lviv,
Kharkiv for the modern cities. Historical entities keep the name the scholarship on *them* uses, so
the polity is "Kievan Rus'" and the card says outright that its capital is the city now called Kyiv.
**A spelling is not an argument and must not be made to do one silently**; where the choice carries
weight, the card says so in a clause rather than making the point by orthography.

**Transliteration.** One system throughout, and the familiar English form of a name that has one —
Tchaikovsky, Trotsky, Dostoevsky — since a reader searching for the card will type what they have seen
before. `GLOSSARY_ALIASES` is the place to catch the variants.

## History, not archaeology — and the two other pulls

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Do not restate either here; what follows is
only what is specific to this collection.

The archaeology pull bites on `ru-before` and on the early half of `ru-kievan`, where the evidence is
kurgans, hoards and birch bark, and it comes with a companion this collection has to name:
**`ru-031 The Normanist controversy` is the Russian equivalent of Greece's Spartan mirage.** Whether
the Rus' were Scandinavians has been argued since the eighteenth century, was a matter of state policy
under Stalin, and is still not a neutral question. The card is about the evidence and about the
argument; it does not settle it, and a card that quietly picks a side while sounding neutral is worse
than one that picks a side openly.

Two other pulls are stronger here than the archaeological one:

**Great men.** Russian history is taught as a queue of tsars and general secretaries, and the tree
above concedes that a reign is a real unit of periodisation — five subdecks are named after one
person. The safeguard is the rule the Rome plan uses: **no person is the subject of a run of cards.**
Where several cards carry one name they are events, offices, laws and works, not episodes of a
biography, and the 250 thematic cards have almost no personal names in them at all.

**The state's own account.** Every state writes a flattering history and Russia's has been rewritten
more often and more completely than most — under Nicholas I, under Stalin, and again in the last
fifteen years. The accessible material reflects that, in both directions: a great deal of what is
easily reachable in English about modern Russia is advocacy, from one government or another. The rule
is the site's ordinary one applied strictly — **write what reputable scholarship and intergovernmental
record support, name a disputed thing as disputed, and never repeat any state's account of its own
actions as established fact.** That applies to the Russian state and equally to the states that oppose
it.

**Modern scholars are capped at two in the thousand and the plan spends none of them.** Nothing
happened to Russia's past that Evans did to Bronze Age Crete. The two places one was nearly earned are
the Normanist argument and the opening of the Soviet archives after 1991, and both are better told as
what changed than as who changed it.

## Sourcing, and one thing that has got harder

Russian history is well served in English: a large open scholarly literature, digitised primary
sources, and the whole nineteenth-century reference shelf on the Internet Archive. Three warnings
worth having in advance.

**Soviet statistics are artefacts, not measurements.** Production figures, harvest returns, census
results and casualty totals were produced by a system with reasons to shape them, and several were
falsified outright — the 1937 census most famously. A card giving a Soviet figure says whose figure it
is and, where the scholarship gives a range, gives the range.

**Many Russian archives have closed since 2022**, and some of the best work of the 1990s and 2000s
rests on documents that cannot now be re-examined. That is not a reason to avoid it — it is the
scholarship, and it was peer-reviewed — but where a claim turns on a single archival citation the card
should be written to what the argument establishes rather than to the document.

**Casualty figures for the twentieth century are contested and the disagreements are large.** Soviet
war dead, famine mortality and Gulag deaths all have live scholarly ranges, and picking the highest or
lowest number and stating it flat is the commonest way this material goes wrong. Give the range and
name whose it is.

## Living beside the other collections

**World History is the survey and never waits for this collection.** Russia and the USSR run through
`wh-586`–`wh-600` (the steppe empires), the age of revolutions, both world wars and the whole Cold War
deck, at survey altitude. The rule in `docs/world-history-card-plan.md` cuts both ways: ten sentences
on the Russian Revolution is a different card from ten sentences on the July Days.

**The Cold War is the pair to watch**, and `docs/us-card-plan.md` now exists, so here is the table this
paragraph used to ask for:

| subject | here | in `col-41` United States |
|---|---|---|
| the origins of the Cold War | a Soviet reading of encirclement and of what the war had cost | `us-856` — an American reading of an ally that did not leave the countries it had liberated |
| the Cuban Missile Crisis | `ru-706` — a Soviet decision and a Soviet retreat | `us-888` — thirteen days in Washington, and the concession that was kept quiet |
| the space race | Sputnik and Gagarin as Soviet achievements | `us-877` — Sputnik as an American shock, and what it did to schools and budgets |
| the arms race | Soviet strategic doctrine and its costs | `us-865`, `us-874`, `us-878` — deterrence, brinkmanship and the military-industrial complex |

Neither collection carries the other's card. `ru-706` is about a Soviet decision and a Soviet retreat,
not about thirteen days in Washington.

One pair already exists: **`ru-274 Treaty of Nerchinsk` and `cnh-546 Treaty of Nerchinsk`** in
`docs/china-card-plan.md` — Russia's first treaty with China and the limit of its Amur expansion on one
side, the Kangxi settlement of a frontier the Qing had just secured on the other.

**And `docs/ww2-card-plan.md` cards the same war from the other altitude**, which is the largest overlap
this collection has with anything:

| subject | here | there |
|---|---|---|
| the Eastern Front | `ru-656`–`ru-690` — the Great Patriotic War, a Soviet national experience and its memory | `ww2-261`–`ww2-400` — the theatre where the European war was decided |
| Katyn | `ru-658` — a Soviet crime and a Soviet lie maintained for fifty years | `ww2-155`, `ww2-326` — an atrocity, and the discovery that broke the Allied coalition's Polish policy |
| the Holocaust | `ru-671` — the Holocaust in the Soviet Union, from the Soviet side | `ww2-731`–`ww2-790` — the whole of it |

That plan's rule about the four pulls is this one's rule generalised, and its national-memory section
names the Great Patriotic War among the versions to card as a **subject** rather than write in.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `ru-938 The death of Pushkin` → also `ru-nicholas-i`, where the censorship is
- `ru-443 The emancipation of the serfs` → also `ru-society`, which is where serfdom is taught
- `ru-156 Andrei Rublev`, `ru-157 The Trinity icon` → also `ru-church`
- `ru-262 The Raskol`, `ru-263 The Old Believers` → also `ru-church`
- `ru-638 The Holodomor`, `ru-674 The deportation of the punished peoples` → also `ru-peoples`
- `ru-484 The Trans-Siberian Railway` → also `ru-land`
- `ru-712 The Soviet dissident movement`, `ru-964 Samizdat` → each other's decks

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`).

This collection starts with a head start no other has had. Phase 3 of the glossary citation pass wrote
every country in the world, so **all eighteen post-Soviet successor states are already there and
already cited** — Russia, Ukraine, Belarus, the three Baltic states, the three in the Caucasus, the
five in Central Asia, plus Poland, Finland and Mongolia. What is missing is everything historical:
there is no `Rus'`, no `Tsar`, no `Serfdom`, no `Boyar`, no `Bolshevik`. Write those **cited from the
start**, at the `GLOSS_SRC_TARGET` bar of 2, rather than opening a backlog to be closed later.

Two glossary-specific cautions follow from the naming rules above. A term whose surface is an ordinary
English word — `Soviet`, `Duma`, `Thaw`, `Terror` — needs `GLOSSARY_CASESENSITIVE` or a narrower head
word, or it will auto-link inside sentences that do not mean it. And a term with a well-known variant
spelling needs its alias written the day the term ships, not the day someone notices the link failing.

---

# The list

## Rus'

### Before Rus' — `ru-before`

    ru-001  The Eurasian steppe
    ru-002  The Pontic–Caspian steppe
    ru-003  Steppe nomadism
    ru-004  The Cimmerians
    ru-005  The Scythians
    ru-006  Scythian gold
    ru-007  Scythian kurgans
    ru-008  The Sarmatians
    ru-009  Greek colonies on the northern Black Sea
    ru-010  The Bosporan Kingdom
    ru-011  The Goths in the Black Sea steppe
    ru-012  The Huns
    ru-013  The Avars
    ru-014  The Bulgars
    ru-015  Volga Bulgaria
    ru-016  The Khazars
    ru-017  The Khazar conversion to Judaism
    ru-018  Itil
    ru-019  The Magyars
    ru-020  The Pechenegs
    ru-021  The origin of the Slavs
    ru-022  The Slavic migrations
    ru-023  East Slavs
    ru-024  The East Slavic tribes
    ru-025  Slavic paganism
    ru-026  Perun
    ru-027  The Finno-Ugric peoples of the forest
    ru-028  The Balts
    ru-029  The Varangians
    ru-030  The Rus' people
    ru-031  The Normanist controversy
    ru-032  Staraya Ladoga
    ru-033  Gnyozdovo
    ru-034  The trade route from the Varangians to the Greeks
    ru-035  The Volga trade route

### Kievan Rus' — `ru-kievan`

    ru-036  Kievan Rus'
    ru-037  Rurik
    ru-038  Primary Chronicle
    ru-039  The calling of the Varangians
    ru-040  Novgorod in the ninth century
    ru-041  Oleg of Novgorod
    ru-042  The seizure of Kyiv
    ru-043  The Rus'–Byzantine treaties
    ru-044  The Rus' raids on Constantinople
    ru-045  Igor of Kyiv
    ru-046  Olga of Kyiv
    ru-047  The baptism of Olga
    ru-048  Sviatoslav I
    ru-049  The destruction of Khazaria
    ru-050  Sviatoslav's Balkan campaigns
    ru-051  Vladimir the Great
    ru-052  Vladimir's pagan reform
    ru-053  The Christianisation of Kievan Rus'
    ru-054  The choice of faiths
    ru-055  The baptism of Kyiv
    ru-056  Boris and Gleb
    ru-057  Yaroslav the Wise
    ru-058  Russkaya Pravda
    ru-059  Saint Sophia Cathedral in Kyiv
    ru-060  The metropolitanate of Kyiv
    ru-061  Kyiv Pechersk Lavra
    ru-062  Hilarion of Kyiv
    ru-063  Old East Slavic
    ru-064  Church Slavonic
    ru-065  Birch bark letters
    ru-066  Druzhina
    ru-067  The towns of Rus'
    ru-068  The trade of Rus'
    ru-069  The coinage of Rus'
    ru-070  The rota system of succession
    ru-071  The Council of Liubech
    ru-072  Vladimir Monomakh
    ru-073  The Instruction of Vladimir Monomakh
    ru-074  The Cumans
    ru-075  The fragmentation of Rus'
    ru-076  Novgorod Republic
    ru-077  The Novgorod veche
    ru-078  Novgorod's northern empire
    ru-079  Vladimir-Suzdal
    ru-080  Andrey Bogolyubsky
    ru-081  The sack of Kyiv in 1169
    ru-082  Vsevolod the Big Nest
    ru-083  Galicia–Volhynia
    ru-084  The Principality of Polotsk
    ru-085  The Principality of Chernigov
    ru-086  The Tale of Igor's Campaign
    ru-087  The architecture of Rus'
    ru-088  Church of the Intercession on the Nerl
    ru-089  Rus' and Byzantium
    ru-090  The inheritance of Rus'

### The Mongol conquest and the Golden Horde — `ru-horde`

    ru-091  The Mongol Empire
    ru-092  Genghis Khan
    ru-093  Battle of the Kalka River
    ru-094  Batu Khan
    ru-095  The Mongol invasion of Rus'
    ru-096  The sack of Ryazan
    ru-097  The sack of Vladimir
    ru-098  The sack of Kyiv in 1240
    ru-099  The Mongol invasion of Central Europe
    ru-100  Golden Horde
    ru-101  Sarai
    ru-102  Yarlyk
    ru-103  The Mongol tribute
    ru-104  The Mongol census of Rus'
    ru-105  Baskak
    ru-106  The Tatar yoke
    ru-107  Alexander Nevsky
    ru-108  Battle of the Neva
    ru-109  Battle on the Ice
    ru-110  The Teutonic Order in the Baltic
    ru-111  The Swedish crusades against Novgorod
    ru-112  Daniel of Galicia
    ru-113  Grand Duchy of Lithuania
    ru-114  The Lithuanian expansion into Rus'
    ru-115  Union of Krewo
    ru-116  The Islamisation of the Golden Horde
    ru-117  Uzbeg Khan
    ru-118  The Horde and the Russian Church
    ru-119  What the Mongol conquest did to Rus'
    ru-120  The Great Troubles of the Horde
    ru-121  Mamai
    ru-122  Tokhtamysh
    ru-123  Timur and the Horde
    ru-124  The breakup of the Golden Horde
    ru-125  The successor khanates

### The rise of Moscow — `ru-moscow-rise`

    ru-126  The rise of Moscow
    ru-127  The founding of Moscow
    ru-128  Daniel of Moscow
    ru-129  Yury of Moscow
    ru-130  Ivan Kalita
    ru-131  The move of the metropolitan see to Moscow
    ru-132  Metropolitan Peter
    ru-133  Metropolitan Alexius
    ru-134  Moscow and Tver
    ru-135  The Tver uprising of 1327
    ru-136  Simeon the Proud
    ru-137  The Black Death in Rus'
    ru-138  Dmitry Donskoy
    ru-139  The stone Kremlin of 1367
    ru-140  Battle of the Vozha River
    ru-141  Battle of Kulikovo
    ru-142  Tokhtamysh's sack of Moscow
    ru-143  Sergius of Radonezh
    ru-144  Trinity Lavra of St Sergius
    ru-145  The monastic colonisation of the north
    ru-146  Vasily I
    ru-147  The annexation of Nizhny Novgorod
    ru-148  The Muscovite Civil War
    ru-149  Vasily II
    ru-150  The blinding of Vasily II
    ru-151  The Council of Florence
    ru-152  The rejection of the union of the churches
    ru-153  The autocephaly of the Russian Church
    ru-154  Moscow and the fall of Constantinople
    ru-155  Theophanes the Greek
    ru-156  Andrei Rublev
    ru-157  Trinity
    ru-158  The Muscovite court
    ru-159  Boyar
    ru-160  Mestnichestvo

## Muscovy

### Ivan III and Vasily III — `ru-ivan-iii`

    ru-161  Ivan III
    ru-162  The gathering of the Russian lands
    ru-163  The annexation of Novgorod
    ru-164  The end of the Novgorod Republic
    ru-165  The annexation of Tver
    ru-166  Great Stand on the Ugra River
    ru-167  The end of the Tatar yoke
    ru-168  Sophia Palaiologina
    ru-169  The title sovereign of all Rus'
    ru-170  The double-headed eagle
    ru-171  Sudebnik of 1497
    ru-172  Pomestie
    ru-173  The Muscovite service state
    ru-174  Moscow Kremlin
    ru-175  Dormition Cathedral
    ru-176  Aristotele Fioravanti
    ru-177  The Muscovite–Lithuanian wars
    ru-178  Muscovy and the Crimean Khanate
    ru-179  The Judaisers
    ru-180  Joseph of Volokolamsk
    ru-181  Nil Sorsky
    ru-182  The possessors and the non-possessors
    ru-183  Third Rome
    ru-184  Vasily III
    ru-185  The annexation of Pskov
    ru-186  The annexation of Ryazan
    ru-187  The capture of Smolensk
    ru-188  Maximus the Greek
    ru-189  The Muscovite chancelleries
    ru-190  Foreign accounts of Muscovy

### Ivan the Terrible — `ru-ivan-iv`

    ru-191  Ivan the Terrible
    ru-192  The regency of Elena Glinskaya
    ru-193  The boyar rule of the 1540s
    ru-194  The coronation of 1547
    ru-195  Tsar
    ru-196  The Moscow fire and riot of 1547
    ru-197  The Chosen Council
    ru-198  Sudebnik of 1550
    ru-199  Stoglav
    ru-200  Streltsy
    ru-201  Muscovite military reform in the 1550s
    ru-202  Siege of Kazan
    ru-203  The annexation of the Khanate of Kazan
    ru-204  The annexation of Astrakhan
    ru-205  The opening of the Volga
    ru-206  Saint Basil's Cathedral
    ru-207  Livonian War
    ru-208  The fall of the Livonian Order
    ru-209  Muscovy against Poland–Lithuania and Sweden
    ru-210  Union of Lublin
    ru-211  Oprichnina
    ru-212  Oprichnik
    ru-213  The massacre of Novgorod
    ru-214  Metropolitan Philip
    ru-215  The burning of Moscow in 1571
    ru-216  Devlet I Giray
    ru-217  Battle of Molodi
    ru-218  The end of the Oprichnina
    ru-219  The death of the Tsarevich Ivan
    ru-220  The correspondence with Kurbsky
    ru-221  The English discovery of Muscovy
    ru-222  Muscovy Company
    ru-223  Yermak
    ru-224  The beginning of the conquest of Siberia
    ru-225  The reign of Ivan IV in retrospect

### The Time of Troubles — `ru-troubles`

    ru-226  Time of Troubles
    ru-227  Feodor I
    ru-228  Boris Godunov
    ru-229  The founding of the Moscow Patriarchate
    ru-230  The death of Tsarevich Dmitry
    ru-231  St George's Day and the binding of the peasants
    ru-232  The famine of 1601–1603
    ru-233  False Dmitry I
    ru-234  The Polish intervention
    ru-235  Vasily IV
    ru-236  The Bolotnikov rebellion
    ru-237  False Dmitry II
    ru-238  The Tushino camp
    ru-239  The Swedish intervention
    ru-240  Battle of Klushino
    ru-241  The Polish occupation of Moscow
    ru-242  The candidacy of Władysław for the Russian throne
    ru-243  Patriarch Hermogenes
    ru-244  The first militia
    ru-245  Minin and Pozharsky
    ru-246  The liberation of Moscow in 1612
    ru-247  The Zemsky Sobor of 1613
    ru-248  The election of Michael Romanov
    ru-249  Truce of Deulino
    ru-250  What the Troubles cost

### The first Romanovs — `ru-first-romanovs`

    ru-251  House of Romanov
    ru-252  Michael of Russia
    ru-253  Patriarch Filaret
    ru-254  Smolensk War
    ru-255  Alexis of Russia
    ru-256  Salt Riot
    ru-257  Sobornoye Ulozheniye
    ru-258  The completion of serfdom
    ru-259  Copper Riot
    ru-260  Patriarch Nikon
    ru-261  The Nikonian reforms
    ru-262  Raskol
    ru-263  Old Believers
    ru-264  Avvakum
    ru-265  The siege of the Solovetsky Monastery
    ru-266  Khmelnytsky Uprising
    ru-267  Pereiaslav Agreement
    ru-268  The Russo-Polish War of 1654–1667
    ru-269  Truce of Andrusovo
    ru-270  Cossacks
    ru-271  Zaporozhian Sich
    ru-272  Stepan Razin
    ru-273  The Russian advance to the Pacific
    ru-274  Treaty of Nerchinsk
    ru-275  Feodor III and the abolition of mestnichestvo

## The Russian Empire

### Peter the Great — `ru-peter`

    ru-276  Peter the Great
    ru-277  The regency of Sophia Alekseyevna
    ru-278  The streltsy uprising of 1682
    ru-279  The Crimean campaigns of Golitsyn
    ru-280  Peter's seizure of power
    ru-281  The German Quarter
    ru-282  The Azov campaigns
    ru-283  Grand Embassy
    ru-284  The streltsy revolt of 1698
    ru-285  The beard tax
    ru-286  Great Northern War
    ru-287  Charles XII
    ru-288  Battle of Narva
    ru-289  The founding of Saint Petersburg
    ru-290  The building of the new capital
    ru-291  The founding of the Russian navy
    ru-292  Battle of Poltava
    ru-293  Ivan Mazepa
    ru-294  Pruth River Campaign
    ru-295  Treaty of Nystad
    ru-296  The proclamation of the Russian Empire
    ru-297  Table of Ranks
    ru-298  The Petrine collegia
    ru-299  Governing Senate
    ru-300  Most Holy Synod
    ru-301  The abolition of the patriarchate
    ru-302  The Russian poll tax
    ru-303  Petrine conscription
    ru-304  The Petrine nobility
    ru-305  Russian industry under Peter
    ru-306  The Ural ironworks
    ru-307  Peter's cultural decrees
    ru-308  The civil script
    ru-309  Russian Academy of Sciences
    ru-310  Kunstkamera
    ru-311  Tsarevich Alexei Petrovich
    ru-312  The law of succession of 1722
    ru-313  Peter's Persian campaign
    ru-314  What the Petrine reforms cost
    ru-315  Peter the Great in Russian memory

### From Peter to Catherine — `ru-empresses`

    ru-316  The era of palace revolutions
    ru-317  Catherine I
    ru-318  Supreme Privy Council
    ru-319  Peter II
    ru-320  Anna of Russia
    ru-321  The conditions of 1730
    ru-322  Bironovshchina
    ru-323  Russia and the War of the Polish Succession
    ru-324  The Russo-Turkish War of 1735–1739
    ru-325  Ivan VI
    ru-326  Elizabeth of Russia
    ru-327  The coup of 1741
    ru-328  Elizabeth's suspension of the death penalty
    ru-329  Mikhail Lomonosov
    ru-330  The founding of Moscow University
    ru-331  Imperial Academy of Arts
    ru-332  Bartolomeo Rastrelli
    ru-333  Winter Palace
    ru-334  Russian Baroque
    ru-335  Russia in the Seven Years' War
    ru-336  Battle of Kunersdorf
    ru-337  The Russian occupation of Berlin
    ru-338  Peter III
    ru-339  The manifesto on the freedom of the nobility
    ru-340  The coup of 1762

### Catherine the Great — `ru-catherine`

    ru-341  Catherine the Great
    ru-342  Catherine's accession
    ru-343  Nakaz
    ru-344  The Legislative Commission
    ru-345  Enlightened absolutism in Russia
    ru-346  The secularisation of church lands
    ru-347  Catherine and the philosophes
    ru-348  Grigory Orlov
    ru-349  Grigory Potemkin
    ru-350  The Russo-Turkish War of 1768–1774
    ru-351  Battle of Chesma
    ru-352  Treaty of Küçük Kaynarca
    ru-353  The annexation of the Crimean Khanate
    ru-354  New Russia
    ru-355  Potemkin village
    ru-356  The founding of Sevastopol and Odesa
    ru-357  The Russo-Turkish War of 1787–1792
    ru-358  Alexander Suvorov
    ru-359  Fyodor Ushakov
    ru-360  Partitions of Poland
    ru-361  The first partition of Poland
    ru-362  Kościuszko Uprising
    ru-363  The third partition of Poland
    ru-364  Pugachev's Rebellion
    ru-365  Yemelyan Pugachev
    ru-366  The destruction of the Zaporozhian Sich
    ru-367  The provincial reform of 1775
    ru-368  Charter to the Nobility
    ru-369  Charter to the Towns
    ru-370  Pale of Settlement
    ru-371  The beginning of Russian rule in Georgia
    ru-372  Russian America
    ru-373  Russian-American Company
    ru-374  Alexander Radishchev
    ru-375  Nikolay Novikov
    ru-376  Freemasonry in Russia
    ru-377  Catherine and the French Revolution
    ru-378  Paul I
    ru-379  The Pauline laws
    ru-380  The assassination of Paul I

## The Nineteenth Century

### Alexander I and the war with Napoleon — `ru-alexander-i`

    ru-381  Alexander I
    ru-382  The Unofficial Committee
    ru-383  Mikhail Speransky
    ru-384  The ministerial reform of 1802
    ru-385  Russia in the Third Coalition
    ru-386  Battle of Austerlitz
    ru-387  Battle of Eylau
    ru-388  Battle of Friedland
    ru-389  Treaties of Tilsit
    ru-390  Russia and the Continental System
    ru-391  Finnish War
    ru-392  Grand Duchy of Finland
    ru-393  The Russo-Turkish War of 1806–1812
    ru-394  The annexation of Bessarabia
    ru-395  The Russo-Persian War of 1804–1813
    ru-396  Treaty of Gulistan
    ru-397  French invasion of Russia
    ru-398  Mikhail Kutuzov
    ru-399  Battle of Smolensk, 1812
    ru-400  Battle of Borodino
    ru-401  The abandonment of Moscow
    ru-402  The fire of Moscow
    ru-403  The retreat from Moscow
    ru-404  Battle of Berezina
    ru-405  The Patriotic War of 1812 in Russian memory
    ru-406  Russia in the War of the Sixth Coalition
    ru-407  Battle of Leipzig
    ru-408  The Russian entry into Paris
    ru-409  Russia at the Congress of Vienna
    ru-410  Congress Poland
    ru-411  Holy Alliance
    ru-412  Alexander I's later years
    ru-413  Military settlements
    ru-414  Alexey Arakcheyev
    ru-415  The death of Alexander I

### Nicholas I — `ru-nicholas-i`

    ru-416  Nicholas I
    ru-417  Decembrist revolt
    ru-418  The Decembrists
    ru-419  The Northern and Southern Societies
    ru-420  The punishment of the Decembrists
    ru-421  Third Section
    ru-422  Official Nationality
    ru-423  Sergey Uvarov
    ru-424  Censorship under Nicholas I
    ru-425  The codification of Russian law
    ru-426  November Uprising
    ru-427  The Russification of Congress Poland
    ru-428  Caucasian War
    ru-429  Imam Shamil
    ru-430  The Circassian expulsions
    ru-431  The Russo-Persian War of 1826–1828
    ru-432  The Russo-Turkish War of 1828–1829
    ru-433  Russia and the revolutions of 1848
    ru-434  The Russian intervention in Hungary
    ru-435  Petrashevsky Circle
    ru-436  Crimean War
    ru-437  Siege of Sevastopol
    ru-438  Battle of Sinop
    ru-439  Treaty of Paris of 1856
    ru-440  What the Crimean War showed

### The Great Reforms — `ru-reforms`

    ru-441  Alexander II
    ru-442  The Great Reforms
    ru-443  Emancipation reform of 1861
    ru-444  The Emancipation Manifesto
    ru-445  Redemption payments
    ru-446  The commune after emancipation
    ru-447  Zemstvo
    ru-448  The judicial reform of 1864
    ru-449  Trial by jury in Russia
    ru-450  The municipal reform of 1870
    ru-451  The Milyutin military reforms
    ru-452  The education reforms of the 1860s
    ru-453  The censorship reform of 1865
    ru-454  January Uprising
    ru-455  Russification in the western provinces
    ru-456  The Valuev Circular and the Ems Decree
    ru-457  The Russian conquest of Central Asia
    ru-458  The Khanate of Khiva and the Emirate of Bukhara
    ru-459  The Great Game
    ru-460  Alaska Purchase
    ru-461  Treaty of Aigun
    ru-462  The founding of Vladivostok
    ru-463  The Russo-Turkish War of 1877–1878
    ru-464  Siege of Plevna
    ru-465  Treaty of San Stefano
    ru-466  Congress of Berlin
    ru-467  Intelligentsia
    ru-468  Russian nihilism
    ru-469  Nikolay Chernyshevsky
    ru-470  Narodniks
    ru-471  Going to the people
    ru-472  Land and Liberty
    ru-473  Narodnaya Volya
    ru-474  Russian revolutionary terrorism
    ru-475  Vera Zasulich
    ru-476  The assassination of Alexander II
    ru-477  Alexander III
    ru-478  The counter-reforms
    ru-479  Konstantin Pobedonostsev
    ru-480  The pogroms of 1881–1884

## The End of the Empire

### Late imperial Russia — `ru-late-empire`

    ru-481  The Russian Empire in 1900
    ru-482  Russian industrialisation
    ru-483  Sergei Witte
    ru-484  Trans-Siberian Railway
    ru-485  Foreign capital in Russian industry
    ru-486  The Russian working class
    ru-487  The Russian peasantry in 1900
    ru-488  The Russian famine of 1891–1892
    ru-489  The Franco-Russian Alliance
    ru-490  Russian expansion into Manchuria
    ru-491  Chinese Eastern Railway
    ru-492  Port Arthur
    ru-493  Russo-Japanese War
    ru-494  Siege of Port Arthur
    ru-495  Battle of Mukden
    ru-496  Battle of Tsushima
    ru-497  Treaty of Portsmouth
    ru-498  Nicholas II
    ru-499  The Russian autocracy at the turn of the century
    ru-500  Okhrana
    ru-501  Russian Marxism
    ru-502  Georgi Plekhanov
    ru-503  Russian Social Democratic Labour Party
    ru-504  Bolsheviks and Mensheviks
    ru-505  Vladimir Lenin
    ru-506  What Is to Be Done?
    ru-507  Socialist Revolutionary Party
    ru-508  Constitutional Democratic Party
    ru-509  Union of the Russian People
    ru-510  The Jewish question in late imperial Russia

### 1905 and the fall of the monarchy — `ru-last-years`

    ru-511  Russian Revolution of 1905
    ru-512  Bloody Sunday
    ru-513  Georgy Gapon
    ru-514  The Potemkin mutiny
    ru-515  The October general strike
    ru-516  The Petersburg Soviet of 1905
    ru-517  October Manifesto
    ru-518  The Fundamental Laws of 1906
    ru-519  State Duma
    ru-520  The First and Second Dumas
    ru-521  The coup of June 1907
    ru-522  The Third Duma
    ru-523  Pyotr Stolypin
    ru-524  The Stolypin agrarian reform
    ru-525  Stolypin's necktie
    ru-526  The assassination of Stolypin
    ru-527  Lena massacre
    ru-528  Beilis trial
    ru-529  Grigori Rasputin
    ru-530  Haemophilia in the Russian royal family
    ru-531  Russia and the July Crisis
    ru-532  Russia enters the First World War
    ru-533  Battle of Tannenberg
    ru-534  First Battle of the Masurian Lakes
    ru-535  The Galician campaign of 1914
    ru-536  The Great Retreat of 1915
    ru-537  Nicholas II takes command
    ru-538  Brusilov offensive
    ru-539  The Russian war economy
    ru-540  Russian casualties in the First World War
    ru-541  Progressive Bloc
    ru-542  The Russian home front in 1916
    ru-543  The murder of Rasputin
    ru-544  February Revolution
    ru-545  The Petrograd garrison mutiny
    ru-546  The abdication of Nicholas II
    ru-547  The end of the Romanov dynasty
    ru-548  Why the monarchy fell
    ru-549  Russian Provisional Government
    ru-550  Dual power

## Revolution and the Soviet Union

### 1917 — `ru-revolution`

    ru-551  Order No. 1
    ru-552  Petrograd Soviet
    ru-553  Alexander Kerensky
    ru-554  The return of Lenin
    ru-555  April Theses
    ru-556  The April Crisis
    ru-557  The first coalition government
    ru-558  The First All-Russian Congress of Soviets
    ru-559  The June offensive
    ru-560  July Days
    ru-561  Lenin in hiding
    ru-562  Kornilov affair
    ru-563  Lavr Kornilov
    ru-564  The Bolshevik majority in the soviets
    ru-565  Red Guards
    ru-566  Military Revolutionary Committee
    ru-567  Leon Trotsky
    ru-568  October Revolution
    ru-569  The storming of the Winter Palace
    ru-570  The Second All-Russian Congress of Soviets
    ru-571  Decree on Peace
    ru-572  Decree on Land
    ru-573  Sovnarkom
    ru-574  Cheka
    ru-575  Felix Dzerzhinsky
    ru-576  Russian Constituent Assembly
    ru-577  The dissolution of the Constituent Assembly
    ru-578  The nationalisation of Russian industry
    ru-579  The decree separating church and state
    ru-580  Treaty of Brest-Litovsk
    ru-581  The Left SR uprising
    ru-582  The move of the capital to Moscow
    ru-583  The execution of the Romanov family
    ru-584  The Russian Revolution and the world
    ru-585  Explaining 1917

### The Civil War and the making of the USSR — `ru-civil-war`

    ru-586  Russian Civil War
    ru-587  Red Army
    ru-588  Trotsky and the Red Army
    ru-589  White movement
    ru-590  Anton Denikin
    ru-591  Alexander Kolchak
    ru-592  Pyotr Wrangel
    ru-593  Czechoslovak Legion
    ru-594  The Allied intervention in the Russian Civil War
    ru-595  The Greens and the peasant war
    ru-596  Nestor Makhno
    ru-597  War communism
    ru-598  Prodrazvyorstka
    ru-599  Red Terror
    ru-600  White Terror
    ru-601  The pogroms of the Civil War
    ru-602  Russian famine of 1921–1922
    ru-603  The white emigration
    ru-604  The independence of Finland and the Baltic states
    ru-605  Polish–Soviet War
    ru-606  Battle of Warsaw
    ru-607  Peace of Riga
    ru-608  The Soviet reconquest of Ukraine and the Caucasus
    ru-609  Basmachi movement
    ru-610  Kronstadt rebellion
    ru-611  Tambov Rebellion
    ru-612  New Economic Policy
    ru-613  The founding of the Soviet Union
    ru-614  The Soviet constitution of 1924
    ru-615  Korenizatsiya

### Stalin — `ru-stalin`

    ru-616  Joseph Stalin
    ru-617  Lenin's last years
    ru-618  Lenin's Testament
    ru-619  The death of Lenin
    ru-620  The cult of Lenin
    ru-621  The succession struggle in the 1920s
    ru-622  Left Opposition
    ru-623  Socialism in one country
    ru-624  The defeat of Trotsky
    ru-625  The exile and murder of Trotsky
    ru-626  Right Opposition
    ru-627  Nikolai Bukharin
    ru-628  First five-year plan
    ru-629  Soviet central planning
    ru-630  Gosplan
    ru-631  Soviet industrialisation
    ru-632  Magnitogorsk
    ru-633  Dnieper Hydroelectric Station
    ru-634  Collectivisation in the Soviet Union
    ru-635  Dekulakisation
    ru-636  Kolkhoz
    ru-637  Soviet famine of 1930–1933
    ru-638  Holodomor
    ru-639  Kazakh famine of 1930–1933
    ru-640  The Soviet internal passport
    ru-641  Stakhanovite movement
    ru-642  Gulag
    ru-643  White Sea–Baltic Canal
    ru-644  Soviet forced labour
    ru-645  Great Purge
    ru-646  Moscow Trials
    ru-647  The assassination of Sergei Kirov
    ru-648  NKVD Order No. 00447
    ru-649  Nikolai Yezhov
    ru-650  The purge of the Red Army
    ru-651  Lavrentiy Beria
    ru-652  The cult of Stalin
    ru-653  The Soviet constitution of 1936
    ru-654  Soviet foreign policy in the 1930s
    ru-655  Molotov–Ribbentrop Pact

### The Great Patriotic War — `ru-great-patriotic-war`

    ru-656  Great Patriotic War
    ru-657  The Soviet invasion of Poland
    ru-658  Katyn massacre
    ru-659  Winter War
    ru-660  The Soviet annexation of the Baltic states
    ru-661  Operation Barbarossa
    ru-662  The Soviet Union in June 1941
    ru-663  Battle of Smolensk, 1941
    ru-664  The first battle of Kyiv
    ru-665  The evacuation of Soviet industry
    ru-666  Battle of Moscow
    ru-667  Siege of Leningrad
    ru-668  The Road of Life
    ru-669  Soviet partisans
    ru-670  The German occupation of Soviet territory
    ru-671  The Holocaust in the Soviet Union
    ru-672  Babi Yar
    ru-673  Soviet prisoners of war in German captivity
    ru-674  The deportation of the punished peoples
    ru-675  The deportation of the Crimean Tatars
    ru-676  Battle of Stalingrad
    ru-677  Operation Uranus
    ru-678  Battle of Kursk
    ru-679  Lend-Lease to the Soviet Union
    ru-680  Arctic convoys
    ru-681  Operation Bagration
    ru-682  The Warsaw Uprising and the Red Army
    ru-683  The Soviet advance into Central Europe
    ru-684  Battle of Berlin
    ru-685  Red Army crimes in 1945
    ru-686  Soviet–Japanese War
    ru-687  Soviet casualties in the Second World War
    ru-688  The Soviet home front
    ru-689  Soviet women in the war
    ru-690  The memory of the Great Patriotic War

### The Soviet Union after Stalin — `ru-after-stalin`

    ru-691  The Soviet Union in 1945
    ru-692  The Sovietisation of Eastern Europe
    ru-693  The Soviet atomic bomb project
    ru-694  Late Stalinism
    ru-695  Doctors' plot
    ru-696  The death of Stalin
    ru-697  Nikita Khrushchev
    ru-698  On the Cult of Personality and Its Consequences
    ru-699  De-Stalinisation
    ru-700  Khrushchev Thaw
    ru-701  The Hungarian Revolution of 1956
    ru-702  Virgin Lands campaign
    ru-703  Sputnik 1
    ru-704  Yuri Gagarin
    ru-705  The Soviet space programme
    ru-706  The Cuban Missile Crisis
    ru-707  Sino-Soviet split
    ru-708  The fall of Khrushchev
    ru-709  Leonid Brezhnev
    ru-710  Era of Stagnation
    ru-711  The Prague Spring and the Brezhnev Doctrine
    ru-712  The Soviet dissident movement
    ru-713  Andrei Sakharov
    ru-714  Soviet–Afghan War
    ru-715  The Soviet economy in the 1980s

## Russia since 1985 — `ru-federation`

    ru-716  Mikhail Gorbachev
    ru-717  Perestroika
    ru-718  Glasnost
    ru-719  Chernobyl disaster
    ru-720  Congress of People's Deputies of the Soviet Union
    ru-721  The nationalities crisis in the Soviet Union
    ru-722  The Baltic independence movements
    ru-723  The Nagorno-Karabakh conflict
    ru-724  The revolutions of 1989 and the Soviet Union
    ru-725  Boris Yeltsin
    ru-726  The Russian declaration of sovereignty
    ru-727  1991 Soviet coup attempt
    ru-728  Dissolution of the Soviet Union
    ru-729  Belovezha Accords
    ru-730  Commonwealth of Independent States
    ru-731  Shock therapy
    ru-732  Russian privatisation in the 1990s
    ru-733  Russian oligarchs
    ru-734  The Russian constitutional crisis of 1993
    ru-735  The Russian Constitution of 1993
    ru-736  First Chechen War
    ru-737  The Russian presidential election of 1996
    ru-738  The Russian financial crisis of 1998
    ru-739  Second Chechen War
    ru-740  Vladimir Putin
    ru-741  The Russian state under Putin
    ru-742  Russian oil and gas as state power
    ru-743  The Russian news media since 1991
    ru-744  Russian opposition politics
    ru-745  Russo-Georgian War
    ru-746  The annexation of Crimea
    ru-747  The war in Donbas
    ru-748  The Russian invasion of Ukraine
    ru-749  The international response to the invasion
    ru-750  The uses of the Russian past

## Land, Peoples and Faith

### The Russian land — `ru-land`

    ru-751  The geography of Russia
    ru-752  East European Plain
    ru-753  Ural Mountains
    ru-754  Siberia
    ru-755  The Russian Far East
    ru-756  Caucasus
    ru-757  The Russian Arctic
    ru-758  Permafrost
    ru-759  Taiga
    ru-760  Tundra
    ru-761  Chernozem
    ru-762  The climate of Russia
    ru-763  Volga
    ru-764  Don
    ru-765  Dnieper
    ru-766  The Ob and the Yenisei
    ru-767  Lena
    ru-768  Amur
    ru-769  Lake Baikal
    ru-770  Caspian Sea
    ru-771  Russia and the Black Sea
    ru-772  Russia and the Baltic Sea
    ru-773  White Sea
    ru-774  Northern Sea Route
    ru-775  The forests of Russia
    ru-776  Russian agriculture
    ru-777  Russian mineral wealth
    ru-778  Russian oil
    ru-779  Russian natural gas
    ru-780  Russian railways
    ru-781  Moscow
    ru-782  Saint Petersburg
    ru-783  The Russian provincial town
    ru-784  Settlement and the Russian frontier
    ru-785  The size of Russia

### The peoples of Russia — `ru-peoples`

    ru-786  The peoples of Russia
    ru-787  Russians
    ru-788  Ukrainians
    ru-789  Belarusians
    ru-790  The Russian Empire as a multinational state
    ru-791  Russification
    ru-792  Volga Tatars
    ru-793  Bashkirs
    ru-794  Chuvash people
    ru-795  The Mordvins and the Mari
    ru-796  The Komi and the Udmurts
    ru-797  Kalmyks
    ru-798  Buryats
    ru-799  Yakuts
    ru-800  Evenks
    ru-801  Chukchi people
    ru-802  Nenets people
    ru-803  Indigenous peoples of Siberia
    ru-804  The Siberian peoples under Russian rule
    ru-805  Yasak
    ru-806  The peoples of the North Caucasus
    ru-807  Chechens
    ru-808  Circassians
    ru-809  The peoples of Dagestan
    ru-810  Georgia under Russian rule
    ru-811  Armenia under Russian rule
    ru-812  Azerbaijan under Russian rule
    ru-813  Kazakhs
    ru-814  Russian Turkestan
    ru-815  The Central Asian revolt of 1916
    ru-816  Islam in Russia
    ru-817  Jadidism
    ru-818  Buddhism in Russia
    ru-819  Jews in the Russian Empire
    ru-820  The shtetl
    ru-821  Pogrom
    ru-822  General Jewish Labour Bund
    ru-823  Jewish emigration from the Russian Empire
    ru-824  Soviet Jewish policy
    ru-825  Poles in the Russian Empire
    ru-826  Baltic Germans
    ru-827  Volga Germans
    ru-828  Finland under Russian rule
    ru-829  The Baltic peoples under Russian rule
    ru-830  Soviet nationality policy
    ru-831  Republics of the Soviet Union
    ru-832  The autonomous republics
    ru-833  Population transfer in the Soviet Union
    ru-834  National movements in the late Soviet Union
    ru-835  The peoples of the Russian Federation

### The Orthodox Church — `ru-church`

    ru-836  Russian Orthodox Church
    ru-837  Eastern Orthodoxy
    ru-838  The Byzantine inheritance in Russia
    ru-839  The Orthodox liturgy
    ru-840  Russian icons
    ru-841  Iconostasis
    ru-842  The Russian schools of icon painting
    ru-843  The Russian monastery
    ru-844  Russian monasticism
    ru-845  Solovetsky Monastery
    ru-846  Valaam Monastery
    ru-847  Russian saints
    ru-848  Foolishness for Christ
    ru-849  Russian church architecture
    ru-850  Onion dome
    ru-851  The tent-roofed church
    ru-852  Russian Orthodox church music
    ru-853  Russian church bells
    ru-854  The Russian parish clergy
    ru-855  Church and state in Muscovy
    ru-856  The Church under the Holy Synod
    ru-857  The Old Believers after the schism
    ru-858  Russian religious sects
    ru-859  Starets
    ru-860  Optina Monastery
    ru-861  Seraphim of Sarov
    ru-862  John of Kronstadt
    ru-863  The Russian church council of 1917–1918
    ru-864  The restoration of the patriarchate
    ru-865  Patriarch Tikhon
    ru-866  The Bolshevik campaign against religion
    ru-867  League of Militant Atheists
    ru-868  The destruction of churches under Soviet rule
    ru-869  Cathedral of Christ the Saviour
    ru-870  The Church and the Second World War
    ru-871  Khrushchev's anti-religious campaign
    ru-872  The Church in the late Soviet Union
    ru-873  The millennium of the baptism of Rus'
    ru-874  The Russian Orthodox Church since 1991
    ru-875  Orthodoxy and Russian identity

## Society, Ideas and Culture

### Society and everyday life — `ru-society`

    ru-876  Russian society
    ru-877  The estates of the Russian Empire
    ru-878  The Russian nobility
    ru-879  The Russian country estate
    ru-880  Serfdom in Russia
    ru-881  The origins of Russian serfdom
    ru-882  The serf economy
    ru-883  Barshchina and obrok
    ru-884  Household serfs
    ru-885  Serf theatres and serf artists
    ru-886  Obshchina
    ru-887  The Russian village
    ru-888  The Russian peasant household
    ru-889  The peasant year
    ru-890  Peasant customary law
    ru-891  The Russian merchant estate
    ru-892  Meshchane
    ru-893  Raznochintsy
    ru-894  Russian towns before the railways
    ru-895  The Russian factory settlement
    ru-896  Education in the Russian Empire
    ru-897  Literacy in Russia
    ru-898  Banya
    ru-899  Russian cuisine
    ru-900  Vodka and the Russian state
    ru-901  The Russian family
    ru-902  Women in Russian society
    ru-903  Soviet everyday life
    ru-904  Communal apartment
    ru-905  Shortage in the Soviet economy

### Russian thought — `ru-thought`

    ru-906  Russian philosophy
    ru-907  Slavophilia
    ru-908  Westernisers
    ru-909  Pyotr Chaadayev
    ru-910  Alexander Herzen
    ru-911  Vissarion Belinsky
    ru-912  Mikhail Bakunin
    ru-913  Russian anarchism
    ru-914  Peter Kropotkin
    ru-915  Narodnichestvo
    ru-916  Russian liberalism
    ru-917  Russian conservatism
    ru-918  Panslavism
    ru-919  Nikolay Danilevsky
    ru-920  Vladimir Solovyov
    ru-921  Russian religious philosophy
    ru-922  Vekhi
    ru-923  Marxism–Leninism
    ru-924  Eurasianism
    ru-925  The Russian idea

### Russian literature — `ru-literature`

    ru-926  Russian literature
    ru-927  Old Russian literature
    ru-928  Russian folklore
    ru-929  Bylina
    ru-930  Nikolay Karamzin
    ru-931  Alexander Pushkin
    ru-932  Eugene Onegin
    ru-933  The Bronze Horseman
    ru-934  The death of Pushkin
    ru-935  Mikhail Lermontov
    ru-936  A Hero of Our Time
    ru-937  Nikolai Gogol
    ru-938  Dead Souls
    ru-939  The Government Inspector
    ru-940  Russian realism
    ru-941  Ivan Turgenev
    ru-942  Fathers and Sons
    ru-943  Superfluous man
    ru-944  Ivan Goncharov
    ru-945  Nikolay Nekrasov
    ru-946  Fyodor Dostoevsky
    ru-947  Crime and Punishment
    ru-948  The Brothers Karamazov
    ru-949  Leo Tolstoy
    ru-950  War and Peace
    ru-951  Anna Karenina
    ru-952  Tolstoy's later thought
    ru-953  Anton Chekhov
    ru-954  The Cherry Orchard
    ru-955  The Russian thick journal
    ru-956  Silver Age of Russian poetry
    ru-957  Russian symbolism
    ru-958  Vladimir Mayakovsky
    ru-959  Anna Akhmatova
    ru-960  Osip Mandelstam
    ru-961  Mikhail Bulgakov
    ru-962  Boris Pasternak
    ru-963  Socialist realism
    ru-964  Samizdat
    ru-965  Aleksandr Solzhenitsyn

### Art, architecture and music — `ru-arts`

    ru-966  Russian art
    ru-967  Russian architecture
    ru-968  The wooden architecture of the Russian north
    ru-969  Kizhi Pogost
    ru-970  The neoclassical architecture of Saint Petersburg
    ru-971  Russian Empire style
    ru-972  Russian Revival architecture
    ru-973  Russian portrait painting
    ru-974  Peredvizhniki
    ru-975  Ilya Repin
    ru-976  Vasily Surikov
    ru-977  Isaac Levitan
    ru-978  Russian history painting
    ru-979  Pavel Tretyakov
    ru-980  Russian decorative art
    ru-981  Fabergé egg
    ru-982  Russian avant-garde
    ru-983  Kazimir Malevich
    ru-984  Wassily Kandinsky
    ru-985  Constructivism
    ru-986  Soviet architecture
    ru-987  Stalinist architecture
    ru-988  Moscow Metro
    ru-989  Russian music
    ru-990  Mikhail Glinka
    ru-991  The Five
    ru-992  Modest Mussorgsky
    ru-993  Nikolai Rimsky-Korsakov
    ru-994  Pyotr Ilyich Tchaikovsky
    ru-995  Russian ballet
    ru-996  Ballets Russes
    ru-997  Igor Stravinsky
    ru-998  Sergei Rachmaninoff
    ru-999  Dmitri Shostakovich
    ru-1000 Russian and Soviet cinema
