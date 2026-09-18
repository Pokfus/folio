# France — a 1000-card running order

The plan for `france`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the twenty-second of these and the twelfth history collection. Read `docs/greece-card-plan.md`
first if this is the first plan you have met; the mechanics are identical and are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `fr-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='fr-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `fr-001` … `fr-999`, then `fr-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`fr-295 The Edict of Nantes` is already an answer term; `fr-738 Explaining the defeat of 1940` is an
argument to describe, and the card's actual answer — the word that gets blanked — is chosen while
writing it, from what the sources will support.

Where the research says the line is wrong, **change the line here in the same commit as the card**, and
say so. The house rule stands: never invent a date, a name or a definition.

## Is there a thousand cards in this?

**The question this plan has to answer is the opposite one: what to leave out.** France has two thousand
years of continuous, densely documented, heavily argued history, and there is a defensible three
thousand cards in it. So the plan's real work is subtraction, and three subtractions are made
deliberately and stated here rather than discovered later.

**The Revolution takes 140 cards and not 300.** It could take 300. The whole collection would then be
the Revolution with a long preface, which is how a great deal of French history is written and is not
what a reader of a national collection needs.

**Culture is carded as history, not as a canon.** France has the largest art, literature and philosophy
of any country Folio will card, and Folio already has collections for two of those. So this one cards
the **institutions, the patronage, the audiences and the arguments** — the Académie, the salons, the
Ordinance of Villers-Cotterêts, the Ferry laws, the exception culturelle — and leaves the works to
`art` and the arguments to `phil`. See "Living beside the other collections", which is measured rather
than assumed.

**The wars are carded from inside France.** Folio has a 1000-card Second World War collection and a
World History collection; this one does not re-fight either. What it cards is what the war did to
France, which is a different question and is mostly not a military one.

**Where the padding risk is**, so it can be watched: the reign-by-reign subdecks in decks 2 and 4, and
the regional subdeck in deck 9. A king is easy to card badly — *Louis XV reigned from 1715 to 1774 and
lost Canada* is a caption. **A reign earns its cards by what changed under it**, and where nothing much
did, the cards go to the society underneath instead.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its `COLLECTION_ICON` row all ship with the file.

**The id is `france` and the card prefix is `fr-`**, free of every existing prefix and no prefix of any
of them. The deck ids are also `fr-…`.

**It needs no `COLLECTION_SECTION` row**, and that is worth saying because every recent plan has added
one. `sectionOf` returns **History** for anything the table does not name, and this is a history
collection, so the right action is to add nothing. A row saying `france: "History"` would be inert and
would invite the next reader to think the table is a list of all collections.

### The hue: `#6A7D81`, a slate blue-grey — the shelf's first grey

**The obvious colour is the blue of the flag and it cannot be had, for a reason worse than crowding.**
Swept in CIELAB against all twenty-eight hues on the shelf (the twenty-one curated collections and the
seven language decks), the best *bleu de France* candidate stands **19.8** from its nearest neighbour —
below the shelf's median of 20.8 — and **that nearest neighbour is the French LANGUAGE DECK** (`#107CD0`,
on the same Collections page, under Languages). Two things called French in two hues 19.8 apart is the
one collision this shelf must not ship. It also sits at chroma 54 on a shelf whose median is 44 and
whose whole register is muted.

The other three apt families were measured and are worse. **Bordeaux / claret** tops out at **16.2**,
hard against Visual Art's oxblood, the Indonesian deck and Japan's kuwazome — the red-purple quarter is
the most crowded on the shelf. **Lavender** tops out at **16.1**, sitting on Psychology's plum.

What ships is the **slate blue-grey of the ardoise roofs** — the Loire, Anjou, Brittany, Normandy, and
the zinc of the north: a material that is genuinely national rather than Parisian, which matters on a
collection whose ninth deck opens at *France is not Paris*. `#6A7D81` stands **20.7 from Greece's
Aegean, 22.3 from Philosophy's petrol and 25.9 from Egypt's malachite**, against a median
nearest-neighbour distance of 20.8. L 51, chroma 8, **4.3:1 against white**, inside the shelf's
3.7–10.4 range.

**20.7 IS AT THE MEDIAN AND THAT IS A STATED TRADE, on Philosophy's own precedent** (petrol shipped at
19.8). What buys it is that **it adds a FAMILY rather than a member of one: there is no grey on this
shelf at all.** The Second World War's dark iron (`#4A4038`) is a warm brown-grey at L 27 and is the
nearest thing to it; this is the first cool, near-neutral hue Folio has.

**One step toward the optimum was given up for HUE, which is the opposite trade from Korea's.** The
best-separated candidate in the band is `#6C7F80` at **22.4**, and it sits at hue 203, which is a
neutral grey with a faint green cast — not the blue-grey the material is. Korea's note records giving
up score for contrast and then rejecting two families for not being the colour they were named after;
this gives up 1.7 of separation to *be* the colour it is named after, and lands at the median rather
than below it.

**The standing note in `COLL_THEME` holds and was not re-tested.** The magenta around `#c057b1` and the
olive-brass beside it have been measured and rejected five and four times respectively. Neither was
re-measured here.

### The icon: a new symbol, `eiffel`

**An Eiffel Tower**, on this shelf's own established convention: a pagoda stands for China, a torii for
Japan, a pyramid for Egypt, an onion dome for Russia, a Doric column for Greece and a wall for Chinese
geography. **A monument standing for a nation is what these marks already are**, and the anachronism —
a structure of 1889 standing for a collection that opens in the Palaeolithic — is exactly the pagoda's
and the torii's and is not a new cost.

**Two alternatives were considered and refused.** A **fleur-de-lis** is the older and arguably truer
emblem, and it says *monarchy* on a collection whose largest single deck is the Revolution; it is also
close to the existing `crown` mark and at 24px resolves to a blob. A **Gallic rooster** is a bird on a
shelf that already carries an owl.

**The collision is `pyramid` and `mountain`, both triangles — and the first draft lost to it.** Drawn
with the flare spread evenly over the whole height it read as a **traffic cone** at 24px, and so did
three further variants of the same construction: a shallow curve plus a ground line plus stripes is a
cone, whatever was intended. **What fixes it is WHERE the flare is.** The real silhouette is a needle
that splays only in its bottom third, so the curve holds close to the centre line from about y 12 upward
and does all its spreading below y 15 — the shaft is 2.3 units wide at y 9.5 and 10.4 at the base.
**Keep that, and keep the arch**; a straight-sided or evenly-tapered tower is a pyramid with a mast on
it. **A second platform was drawn and dropped**, on the laurel wreath's precedent: four horizontal marks
inside 17px is a blob, and the arch plus one platform says the same thing.

**Both the hue and the icon were rendered and looked at** — the icon at 20, 24, 28, 40 and 64px, on dark
ground and on light, beside `pyramid`, `mountain` and `crown`, which is how the traffic cone was caught;
and the hue as a banner and as its 20% wash beside its four nearest neighbours and the French language
deck.

## What this collection is about, and the six scope decisions

**It is the history of France and of the territory that became France, from the Palaeolithic to the
present.** The ninth deck, *The Making of France*, is 90 cards on the language, the regions, the empire
and the institutions, because those are the four things that turn a territory into a country and none of
them is confined to a century.

**First: Gaul is not France, and the collection says so in the cards rather than in a preface.**
`fr-015` is *What France means before France existed* and `fr-034` is *The myth of our ancestors the
Gauls* — because the identification of the French with the Gauls is a **nineteenth-century political
construction**, taught in Third Republic schoolbooks to a country that had just lost Alsace-Lorraine.
The Gaulish deck is about Gaul; the myth is carded as a fact about modern France, where it belongs.

**Second: the empire and decolonisation are carded at length, from both sides, and Algeria is the
hardest thing in the collection.** Deck 8 gives 30 cards to decolonisation and deck 9 gives 25 to the
empire as a whole. The rule that governs them is the house rule in its sharpest form: **no state's
account of its own actions is repeated as established fact.** That binds on the French state's colonial
record — the *mission civilisatrice*, the *indigénat*, Sétif, torture, the massacre of 17 October 1961,
the abandonment of the harkis — and it binds equally on the FLN's account of itself. **A contested
figure is given as a range with whose it is**, and the death tolls of the Algerian War are contested by
an order of magnitude, so no card states one flat.

**Third: Vichy is carded as a French regime, not as a German imposition.** This is the single place
where French public memory and the historiography have moved furthest, and the movement is itself
carded: `fr-766` is *The Paxton revolution*, `fr-767` *Vichy and the Republic*, `fr-769` *Vichy in
French memory* and `fr-770` *The 1995 acknowledgement*. What Vichy did on its own initiative — the
Statuts des Juifs, the Milice, the round-ups — is the subject, and the card that says so must also say
why the other account was believed for thirty years, which is the Dinosaurs plan's rule about
corrections applied here.

**Fourth: France is not Paris, and the plan enforces it structurally rather than by good intentions.**
Deck 9's regional subdeck is 25 cards, the language subdeck cards Occitan, Breton, Basque, Alsatian and
Corsican as languages rather than as patois, and the Paris-centred cards say so in their titles
(`fr-613` *The rebuilding of Paris*, `fr-937` *Paris and the desert*). **Centralisation is carded as a
thing that was done**, with a date and an agent, rather than as the natural shape of the country.

**Fifth: the Revolution is carded with its violence and its achievement in the same decks.** The Terror
gets its own cards with a figure that is actually known (`fr-470` *How many died in the Terror*), the
Vendée gets `fr-462`, and the abolition of feudalism, the Declaration, the departments, the metric
system and the 1794 abolition of slavery get theirs. **Neither the catechism nor the counter-catechism**:
`fr-556` and `fr-557` card the historians and the revisionist debate as what they are, a two-hundred-year
argument that is still political.

**Sixth: the memory wars are the collection's closing subject and its running theme.** `fr-1000` is *How
France argues about its past*, and it is earned: Vichy, Algeria, slavery, the colonial record and the
Revolution itself are all live public arguments with laws attached to some of them. A collection that
told the story and stopped would have left out the part of French history that is still happening.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Gaul and the Franks | Before Gaul | 15 | fr-001–015 |
|  | Celtic Gaul | 20 | fr-016–035 |
|  | Gallo-Roman Gaul | 25 | fr-036–060 |
|  | The Franks and the Merovingians | 20 | fr-061–080 |
|  | The Carolingians | 20 | fr-081–100 |
| The Medieval Kingdom | The early Capetians | 20 | fr-101–120 |
|  | Church, monastery and cathedral | 20 | fr-121–140 |
|  | Medieval society and the land | 20 | fr-141–160 |
|  | The making of the royal state | 20 | fr-161–180 |
|  | The Hundred Years' War | 30 | fr-181–210 |
| Renaissance and the Wars of Religion | The Italian Wars and the new monarchy | 20 | fr-211–230 |
|  | Renaissance and humanism in France | 20 | fr-231–250 |
|  | Reformation and the Huguenots | 20 | fr-251–270 |
|  | The Wars of Religion | 30 | fr-271–300 |
| The Ancien Régime | The Bourbon state | 25 | fr-301–325 |
|  | Louis XIV | 30 | fr-326–355 |
|  | Society under the Ancien Régime | 25 | fr-356–380 |
|  | The Enlightenment in France | 20 | fr-381–400 |
|  | The crisis of the monarchy | 20 | fr-401–420 |
| Revolution and Empire | 1789 | 30 | fr-421–450 |
|  | The Republic and the Terror | 30 | fr-451–480 |
|  | Thermidor and the Directory | 20 | fr-481–500 |
|  | Napoleon | 35 | fr-501–535 |
|  | What the Revolution changed | 25 | fr-536–560 |
| The Long Nineteenth Century | Restoration and July Monarchy | 25 | fr-561–585 |
|  | 1848 and the Second Republic | 20 | fr-586–605 |
|  | The Second Empire | 25 | fr-606–630 |
|  | Defeat and the Commune | 20 | fr-631–650 |
|  | The Third Republic to 1914 | 20 | fr-651–670 |
| War and Occupation | The First World War | 30 | fr-671–700 |
|  | The interwar republic | 25 | fr-701–725 |
|  | The defeat of 1940 | 15 | fr-726–740 |
|  | Vichy and the Occupation | 30 | fr-741–770 |
|  | Resistance, liberation and reckoning | 20 | fr-771–790 |
| France Since 1945 | The Fourth Republic | 20 | fr-791–810 |
|  | Decolonisation and the Algerian War | 30 | fr-811–840 |
|  | The Fifth Republic | 25 | fr-841–865 |
|  | 1968 and the long aftermath | 20 | fr-866–885 |
|  | France now | 25 | fr-886–910 |
| The Making of France | The French language | 20 | fr-911–930 |
|  | The regions and the provinces | 25 | fr-931–955 |
|  | The empire and the overseas | 25 | fr-956–980 |
|  | Institutions, ideas and everyday life | 20 | fr-981–1000 |

Deck totals: Gaul and the Franks 100 · The Medieval Kingdom 110 · Renaissance and the Wars of Religion 90 · The Ancien Régime 120 · Revolution and Empire 140 · The Long Nineteenth Century 110 · War and Occupation 120 · France Since 1945 120 · The Making of France 90. **1000.**

## What the weighting is arguing

**Revolution and Empire takes 140, the largest deck, and stops at 1815.** Twenty-six years get a seventh
of the collection because they are the hinge: every French regime since has defined itself for or
against them, and five of the nine decks that follow are unintelligible without them. The subdeck that
justifies the size is the last one — *What the Revolution changed*, 25 cards on the land, the Church,
citizenship, the symbols, the metric system and the two-hundred-year argument.

**The nineteenth century takes 110 across five regimes, and that IS the argument.** France ran through a
Restoration, a July Monarchy, a Second Republic, a Second Empire, a Commune and a Third Republic in
fifty-nine years. A reader who comes out of this deck knowing that the *question of the regime* was
open in France until about 1879 has learned the thing that distinguishes French from British or German
nineteenth-century politics.

**War and Occupation takes 120 for thirty-one years, and almost none of it is military.** The battles
are in the Second World War collection; what is here is conscription and the home front, the mutinies
of 1917, the Popular Front, the collapse of 1940 as a political event, Vichy's own programme, and the
reckoning afterwards. The one deliberately military subdeck is the 15 cards on 1940, because the defeat
is the political event.

**France Since 1945 takes 120 and 30 of those are decolonisation.** The empire is where the Fourth
Republic died, where the Fifth Republic was born, where the army last mutinied, and where the arguments
running through French politics now were set. A collection that gave it ten cards would be making a
claim about its importance by omission.

**The Middle Ages take 210 across two decks**, which is more than most national collections give them,
because this is where France was assembled: a royal demesne around Paris in 987 and a kingdom reaching
the Pyrenees, the Alps and the Channel by 1453. The Hundred Years' War takes 30 of it — the largest
subdeck in the two — because it is where the assembling was nearly undone and where the state that did
the assembling was built.

**The Ancien Régime takes 120 and Louis XIV takes 30 of it.** That is a quarter of a deck for one reign,
and it is defensible for one reason: the shape of the French state — centralised, administrative,
suspicious of intermediate bodies, expressed in a capital that is not a city but a court — is largely
his, and it survives the Revolution, Napoleon and five republics.

**The Making of France takes 90 and comes last rather than first.** The language, the regions, the
empire and the institutions are all long processes, and a reader meets them better once they have seen
the events that made them than as ninety pages of preface.

## Six decisions this plan forced on the tree

**The empire is carded twice, in two registers, and that is deliberate.** Deck 8's *Decolonisation and
the Algerian War* is the empire as a **French political crisis**, in chronological place; deck 9's *The
empire and the overseas* is the empire as a **thing in itself** — two empires, four centuries, the
slave trade, the administration, the ideology, and what still exists. Those are two questions, not one
topic repeated, and the cards name each other.

**Vichy and the Resistance are separate subdecks, not one.** Putting them together writes the story the
Paxton revolution overturned: a nation that resisted with a regime imposed on it. Thirty cards on what
Vichy did and twenty on what the Resistance was, each standing on its own, is the shape the
historiography actually has.

**There is no "kings of France" deck.** Louis IX is in the subdeck on the royal state, Francis I in the
Renaissance one, Louis XIV in his own because the reign is a system. A list of monarchs is what this
collection would become by default and is the thing its scope section warns about.

**The Wars of Religion get 30 cards and their own place beside the Reformation.** They are the longest
civil war in French history, they killed a share of the population comparable to the worst of the
twentieth century, and the settlement that ended them — the Edict of Nantes, and its revocation
eighty-seven years later — is where French thinking about religion and the state starts.

**1968 has a subdeck and it runs to the present.** *1968 and the long aftermath* is 20 cards, because
May 1968 on its own is a month and what it is actually about — feminism, the Veil Law, regionalism,
the collapse of the Communist vote, the rise of the Front National, the headscarf affairs — is fifty
years.

**`fr-999` is "What makes France French" and `fr-1000` is "How France argues about its past".** The
second is the collection's own thesis and the first is the question it is constantly tempted to answer
badly. Both are written last, on purpose.

## History, not commemoration — and the five pulls

**The rule this section is the local form of lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN
ARCHAEOLOGY SITE" and its historiography half). Five things pull a French card away from history.

**The national narrative.** France has an unusually strong, unusually old and unusually well-taught
story about itself — a continuous nation from Vercingetorix through Joan of Arc and the Revolution to
de Gaulle — and it was largely built between 1870 and 1914 for a purpose. **Card the story as a story
where it is one** (`fr-034`, `fr-202`, `fr-532`, `fr-657`, `fr-789`), and do not use it as the frame
for everything else.

**The great man.** Louis XIV, Napoleon and de Gaulle each attract a register in which the state is a
biography. The test is the plan's own: a reign or a presidency earns its cards by what changed, and the
card says what the change rested on — an administration, a war, a constitution, a price of bread.

**Revolutionary and counter-revolutionary catechism.** Both exist, both are still political, and both
are available in confident prose. The Vendée and the Terror have body counts that have been fought over
for two centuries; give the range, say who holds which end, and say what the evidence is.

**The colonial euphemism, and its mirror.** *Pacification*, *mise en valeur*, *événements* — the French
state's own vocabulary for the empire is a set of words designed not to describe what happened, and
`fr-839` (*The war's name and its memory*) exists because France did not legally call the Algerian War
a war until 1999. The mirror pull is to card the empire only as atrocity, which leaves out the schools,
the administration, the men who fought in French uniform and the people who wanted French citizenship
and were refused it.

**The cultural superlative.** French writing about French culture is the most self-celebrating in
Europe, and it is very good prose. *The most beautiful language*, *the birthplace of human rights*, *the
capital of the nineteenth century* — each is a claim someone made, usually datable, and each is a card
about who said it and why rather than a fact to pass on.

## This collection follows the no-researchers rule

**It is NOT excluded from it**, like every other history collection: a question is clued from the event,
not from who wrote about it. `fr-766` asks what the Paxton revolution overturned about Vichy — and it is
the exemption rather than the pattern, the answer term being a modern work.

**The exemption the rule already provides covers the handful where the name IS the term**: `fr-304`
Cardinal Richelieu, `fr-333` Colbert, `fr-576` Guizot, `fr-612` Haussmann, `fr-626` Pasteur, `fr-690`
Clemenceau, `fr-714` Léon Blum, `fr-743` Philippe Pétain, `fr-776` Jean Moulin, `fr-860` Mitterrand and
the rest — all **actors**, not historians, which is the line the rule actually draws.

**The historiography cap binds: at most three of ten sentences on who established a thing.** It will
bite hardest in the Revolution and Vichy decks, where the argument about the history is genuinely part
of the subject and is therefore carded explicitly at `fr-556`, `fr-557`, `fr-766` and `fr-789` so the
other cards do not have to carry it.

**Two modern historians at most across the collection**, on the standing rule, and they are spent where
an account itself became an event: **Robert Paxton**, whose 1972 book changed French law and French
public memory, and one more held in reserve for the Revolution's bicentenary argument.

## Names, dates and spellings

**French names and titles keep their accents, and this is the collection where that will break
something.** Étienne Marcel, Pétain, Thérèse, Château, Élysée, Déclaration. CLAUDE.md records twice that
**JavaScript's `\b` is defined over ASCII**, so an accented letter reads as a word boundary: a pattern
anchored with `\b` matches *inside* an accented word, and a rule written to skip a word will fail on
exactly the accented one. That is already fixed in `spellTree` and `buildGlossIndex` (both use
`\p{L}` lookarounds), but **any new sweep written while working on this collection must use the
lookaround form**, and a glossary alias containing an accent needs testing rather than assuming.

**Use the French form where French uses it and the English form where English does.** *Ancien Régime*,
*parlement*, *cahiers de doléances*, *épuration*, *laïcité*, *pieds-noirs* are untranslatable terms of
art and are italicised on first use; but it is the **Hundred Years' War**, the **Wars of Religion**,
**Louis XIV** and **Francis I** in English prose, not *Guerre de Cent Ans* or *François Ier*. A card
that switches register mid-sentence reads as a translation.

**THE REPUBLICAN CALENDAR IS THIS COLLECTION'S JULIAN/GREGORIAN PROBLEM, AND IT IS WORSE.** France dated
official acts by the *calendrier républicain* from October 1793 to December 1805: 9 Thermidor Year II,
18 Brumaire Year VIII, the Constitution of Year III. Two rules follow, and the second is checkable.
**A card may name the republican date, and must give the Gregorian one beside it** — 9 Thermidor Year II
(27 July 1794) — because a reader who meets only the first has been given a date they cannot place.
And **the DATE LINE takes the Gregorian date only**: `cardYears` cannot parse a republican date at all,
so a date line reading *9 Thermidor Year II* yields **no sort year**, the card falls to 0 and sorts as
timeless — which on a deck running 1789 to 1815 puts it at the wrong end of the deal order with nothing
on the page to say so. **Read the sort year back after writing a date line in deck 5**, which is two
lines of Node against `cardYears` and is the only thing that can see this.

**Dates before 1582 are Julian and are given as the sources give them**, without conversion, exactly as
the Russia plan handles its own gap in the other direction.

**A regnal number is not a date**, and neither is a republic's number: the Third Republic ran 1870–1940
and the Fifth from 1958, and a card that names one without a year has told the reader nothing they can
sort by.

## Sourcing

**Very well served, and in two languages — which is the opportunity and the trap.**

**The open routes that work.** **Persée** and **OpenEdition Journals** (Revues.org) carry an enormous
share of French academic history and are open; **Gallica**, the BnF's digital library, carries the
primary material — newspapers, pamphlets, the *Moniteur*, the cahiers de doléances — and is citable for
what it is. **Archives nationales** and the departmental archives publish finding aids and digitised
series. In English, the *French History*, *French Historical Studies*, *Annales* (in translation) and
*Past & Present* literature is the standard, and **JSTOR-only articles usually have an open copy** via
HAL, France's national preprint archive. CLAUDE.md's own reachability note applies: **Persée's article
records open and its PDFs are altcha-gated**, so cite the record.

**A source in French is welcome and often necessary**, under the house rule — much of this subject has
no English equivalent — and it is **marked with the `[in French]` chip**, which `SRC_LANG_NAMES` already
carries. **This collection will carry more language chips than any other**, which is fine; what is not
fine is a card resting entirely on French sources when an English one says the same thing, since most
readers of the English card can check an English source themselves.

**Four hazards.**

**The French state is a prolific publisher about itself.** Ministries, the Élysée, the Assemblée
nationale and the *Journal officiel* publish excellent primary material and also a great deal of
commemorative history. A ministry's account of the Algerian War or of Vichy is a **source for what the
French state now says**, cited as that, and is never an independent source for what happened.

**Commemorative historiography is a genre here and it is written by historians.** France runs
state-sponsored anniversaries — 1889, 1939, 1989, the Panthéon — and the scholarship produced around
them is real scholarship with a purpose. Check the date and the occasion of anything published in a
centenary year.

**The Revolution's historiography is factional and the factions are still alive.** The Jacobin,
liberal, Marxist and revisionist readings each have living practitioners and each has a confident
general-audience literature. **Where a card touches an interpretation, name the reading rather than
asserting it**, and `fr-557` is where the argument itself is carded.

**Wikipedia's French edition is better than its English one on this subject and is still not citable.**
Follow it to what it cites, which for French history is usually Persée or Gallica and is usually open.

## Living beside the other collections

**THE OVERLAPS WERE MEASURED RATHER THAN ASSUMED, and five collections touch this one.**

**THE SECOND WORLD WAR IS THE BIGGEST AND IT IS ABOUT TWENTY-FIVE CARDS.** `ww2-171` Battle of France,
`ww2-181`–`ww2-182` the French army and command, `ww2-187` Dunkirk, `ww2-190` the fall of Paris,
`ww2-191` the French exodus, `ww2-193` Vichy France, `ww2-195`–`ww2-197` the empire divided, Free France
and de Gaulle, `ww2-200` explaining the fall, `ww2-638`–`ww2-646` Normandy and the liberation of Paris,
`ww2-669`–`ww2-670` the German administration and Vichy collaboration, `ww2-701`–`ww2-703` resistance,
`ww2-773` the Jews of France. **The division of labour is that WW2 cards the WAR and this collection
cards FRANCE**: the Battle of France as a campaign is `ww2-171` and the collapse of the French state is
`fr-726`–`fr-740`; the Resistance as one of Europe's resistance movements is `ww2-701`–`ww2-703` and the
Resistance as a French political formation with a programme is `fr-771`–`fr-790`. **Three plan lines are
deliberately close and must be written as a pair**: `ww2-191`/`fr-730` the exodus, `ww2-193`/`fr-741`
Vichy, `ww2-200`/`fr-738` explaining the defeat. **Read the WW2 card before writing the French one.**

**WORLD HISTORY HAS SEVEN AND THEY ARE ALL HEADLINE-LEVEL**: `wh-681` New France, `wh-757` French
Revolution, `wh-762`–`wh-764` Napoleon, the Napoleonic Wars and the Napoleonic Code, `wh-893` Treaty of
Versailles, `wh-920` Battle of France. This is the same relationship Greece and Rome already have with
World History — one card there, a subdeck here — and needs no special handling beyond writing the finer
card as the finer card. **`fr-958` is *New France and the French in America* rather than *New France*,
so the two are not the same string.**

**ROME HAS FIVE ON GAUL**: `rm-021` Gauls in Italy, `rm-162` the conquest of Cisalpine Gaul, `rm-352`
Vercingetorix, `rm-353` the siege of Alesia, `rm-759` Roman Gaul. **Rome cards the conquest as Caesar's
campaign; this collection cards it as the end of independent Gaul** (`fr-029`–`fr-032`) **and, at
`fr-033`–`fr-035`, as something nineteenth-century France made up about itself.** The Gallo-Roman
subdeck (25 cards) is about the province as the substrate of France — the towns, the villa, the Latin
that became French, the bishops — which Rome's single `rm-759` does not attempt.

**VISUAL ART HOLDS THE WORKS AND THIS COLLECTION MUST NOT RE-CARD THEM.** `art` is a chronological
timeline of individual artworks and it is full of French ones — the Venus of Lespugue, the Hall of the
Bulls at Lascaux, the Saint-Denis tympanum, the Sainte-Chapelle glass, the Psalter of St Louis, and
several hundred more as the plan runs on. **The rule: `art` cards the object, `france` cards the
institution, the patron, the audience and the argument.** `fr-007` Lascaux is the *site* — its discovery
in 1940, its closure in 1963, Lascaux II — where `art-017` is the painting. `fr-130` is Saint-Denis and
the birth of Gothic as an architectural and political event; `art-243` is its tympanum. **Check `art`'s
running order before writing any card whose subject is a single object, and if the object is there,
write the institution instead.**

**PHILOSOPHY HOLDS THE ARGUMENTS**: `ph-462` Descartes and two more on him, `ph-619` Sartre, `ph-624`
Beauvoir, `ph-627` Camus, `ph-644` Foucault, `ph-648` Derrida, `ph-953` Rousseau, and Voltaire,
Montesquieu and Diderot in the Enlightenment deck. **This collection cards the philosophes as a public
force** — the salons, the Encyclopédie as an enterprise, censorship, the republic of letters, the
intellectuals of the Dreyfus affair, Sartre and *engagement* — **and never their arguments.** `fr-385`
is *Rousseau and the general will* because the general will is a political fact in 1793; what the
general will means is `ph-953`'s.

**GLOSSARY: `France` AND `Paris` ALREADY EXIST AND MUST NOT BE OVERWRITTEN.** Both were written for the
World Geography collection (`gw-023` and `gw-523`), so **the pairing rule is already satisfied for
them** — and `add-glossary.js` **overwrites in silence**, which is the scar CLAUDE.md records from the
Korea batch. Where the existing entry is geographical and this collection needs history in it, **widen
the existing description rather than re-keying**; the glossary is deck-agnostic by house rule.
**Measured when this plan was written**, the glossary's 3,838 terms contain only six this collection
will reach for — `France`, `Paris`, `Charlemagne`, `Clovis_I`, `Joan_of_Arc` and `Gothic_architecture` —
plus `Carolingian_Renaissance`, `Norman_Conquest` and `Paris_Peace_Conference_(1919–1920)` adjacent to
it. **Expect the glossary to grow faster here than anywhere since Korea**, and check before every run.

**Two keys need care.** `Revolution` must **not** claim its bare surface: it is an ordinary English word
and the corpus is full of industrial, scientific, agricultural and Chinese revolutions — key it
`French_Revolution` and let the bare word alone, which is the trade `Life_(biology)` was written to
refuse. `Republic` is the same shape and worse. `Empire` likewise.

# The list

## Gaul and the Franks

### Before Gaul — `fr-prehistory`

    fr-001  France
    fr-002  The Hexagon
    fr-003  The land that became France
    fr-004  The rivers of France
    fr-005  Palaeolithic settlement in France
    fr-006  The painted caves of France
    fr-007  Lascaux
    fr-008  Chauvet
    fr-009  The Neolithic in France
    fr-010  Carnac and the megaliths
    fr-011  The Bronze Age in France
    fr-012  The Iron Age and Hallstatt
    fr-013  The first written notice of the land
    fr-014  Greek Massalia
    fr-015  What France means before France existed

### Celtic Gaul — `fr-celts`

    fr-016  Gaul
    fr-017  The Gauls
    fr-018  The Gaulish tribes
    fr-019  Gaulish society
    fr-020  The druids
    fr-021  Gaulish religion
    fr-022  The oppidum
    fr-023  Bibracte
    fr-024  Gaulish agriculture and metalwork
    fr-025  Gaulish coinage
    fr-026  Gaul and the Mediterranean world
    fr-027  The Gaulish language
    fr-028  Transalpine Gaul becomes a province
    fr-029  The Roman conquest of Gaul
    fr-030  The great revolt of 52 BCE
    fr-031  Why Gaul fell
    fr-032  What the Gauls left behind
    fr-033  The Gauls in French memory
    fr-034  The myth of our ancestors the Gauls
    fr-035  Asterix and the modern Gaul

### Gallo-Roman Gaul — `fr-roman`

    fr-036  Roman Gaul
    fr-037  The provinces of Gaul
    fr-038  Lugdunum
    fr-039  Roman towns in Gaul
    fr-040  Roman roads in Gaul
    fr-041  The Pont du Gard
    fr-042  Nîmes and Arles
    fr-043  The villa and the countryside
    fr-044  Gallo-Roman society
    fr-045  Romanisation
    fr-046  The Gallo-Roman gods
    fr-047  Latin in Gaul
    fr-048  The Gallic Empire
    fr-049  Christianity comes to Gaul
    fr-050  The martyrs of Lyon
    fr-051  Saint Martin of Tours
    fr-052  The bishops of late Roman Gaul
    fr-053  The third-century crisis in Gaul
    fr-054  The late Roman army in Gaul
    fr-055  The barbarian settlements
    fr-056  The Visigoths in Aquitaine
    fr-057  The Burgundians
    fr-058  The end of Roman rule in Gaul
    fr-059  Continuity and rupture
    fr-060  What Rome left in France

### The Franks and the Merovingians — `fr-merovingian`

    fr-061  The Franks
    fr-062  Clovis
    fr-063  The baptism of Clovis
    fr-064  The conversion of the Franks
    fr-065  The Frankish kingdom
    fr-066  Salic law
    fr-067  Merovingian kingship
    fr-068  The partition of the kingdom
    fr-069  Neustria, Austrasia and Burgundy
    fr-070  Gregory of Tours
    fr-071  Merovingian society
    fr-072  Merovingian towns and trade
    fr-073  Monasticism in Merovingian Gaul
    fr-074  Columbanus and the Irish monks
    fr-075  Dagobert I
    fr-076  The rois fainéants
    fr-077  The mayors of the palace
    fr-078  Charles Martel
    fr-079  The Battle of Tours
    fr-080  The end of the Merovingians

### The Carolingians — `fr-carolingian`

    fr-081  Pepin the Short
    fr-082  The Carolingian coup
    fr-083  The alliance with the papacy
    fr-084  Charlemagne's conquests
    fr-085  The imperial coronation of 800
    fr-086  Carolingian government
    fr-087  The missi dominici
    fr-088  Carolingian learning
    fr-089  The Carolingian script
    fr-090  Aachen and the court
    fr-091  Louis the Pious
    fr-092  The civil wars of the 840s
    fr-093  The Treaty of Verdun
    fr-094  West Francia
    fr-095  The Viking raids
    fr-096  The Norman settlement
    fr-097  The collapse of Carolingian authority
    fr-098  The rise of the counts
    fr-099  The last Carolingians
    fr-100  From Francia to France

## The Medieval Kingdom

### The early Capetians — `fr-capetians`

    fr-101  Hugh Capet
    fr-102  The Capetian dynasty
    fr-103  The royal demesne
    fr-104  The weakness of the early Capetians
    fr-105  The Capetian miracle
    fr-106  Anointing and the sacre at Reims
    fr-107  The royal touch
    fr-108  Robert the Pious
    fr-109  Philip I
    fr-110  Louis VI
    fr-111  Suger
    fr-112  Louis VII
    fr-113  The Second Crusade and France
    fr-114  Eleanor of Aquitaine
    fr-115  The Angevin problem
    fr-116  Philip Augustus
    fr-117  Bouvines
    fr-118  The conquest of Normandy
    fr-119  The Albigensian Crusade
    fr-120  The absorption of the south

### Church, monastery and cathedral — `fr-church`

    fr-121  The Church in medieval France
    fr-122  Cluny
    fr-123  The Cluniac reform
    fr-124  Cîteaux and the Cistercians
    fr-125  Bernard of Clairvaux
    fr-126  Pilgrimage and the roads to Compostela
    fr-127  Relics and saints' cults
    fr-128  Romanesque architecture in France
    fr-129  The Gothic cathedral
    fr-130  Saint-Denis and the birth of Gothic
    fr-131  Chartres
    fr-132  Notre-Dame de Paris
    fr-133  The cathedral builders
    fr-134  Stained glass
    fr-135  The University of Paris
    fr-136  Scholasticism in Paris
    fr-137  Abelard
    fr-138  The mendicant orders in France
    fr-139  Heresy and the Inquisition
    fr-140  The Church and the crown

### Medieval society and the land — `fr-society`

    fr-141  The three orders
    fr-142  The seigneurie
    fr-143  The French peasantry
    fr-144  Serfdom and its decline
    fr-145  Clearing the land
    fr-146  The medieval village
    fr-147  The growth of towns
    fr-148  The commune movement
    fr-149  The fairs of Champagne
    fr-150  Trade and money
    fr-151  Guilds and crafts
    fr-152  Chivalry
    fr-153  The tournament
    fr-154  Courtly love
    fr-155  The troubadours
    fr-156  The two languages of medieval France
    fr-157  Old French literature
    fr-158  The Song of Roland
    fr-159  Jews in medieval France
    fr-160  The expulsions of the Jews

### The making of the royal state — `fr-crown`

    fr-161  Louis IX
    fr-162  The justice of Saint Louis
    fr-163  The crusades of Louis IX
    fr-164  Royal administration under the Capetians
    fr-165  The bailli and the sénéchal
    fr-166  The Parlement of Paris
    fr-167  Royal finance
    fr-168  Philip IV
    fr-169  Philip IV and Boniface VIII
    fr-170  The Avignon papacy
    fr-171  The destruction of the Templars
    fr-172  The Estates General
    fr-173  The apanage
    fr-174  The royal coinage
    fr-175  The succession crisis of 1328
    fr-176  The Valois
    fr-177  The invention of the Salic rule
    fr-178  The idea of the kingdom
    fr-179  The king's two bodies
    fr-180  What the Capetians built

### The Hundred Years' War — `fr-hundredyears`

    fr-181  The Hundred Years' War
    fr-182  The causes of the war
    fr-183  Gascony and the English king
    fr-184  Crécy
    fr-185  The Black Death in France
    fr-186  Poitiers and the capture of the king
    fr-187  The Jacquerie
    fr-188  Étienne Marcel and the Paris revolt
    fr-189  The Treaty of Brétigny
    fr-190  Charles V
    fr-191  Du Guesclin and the recovery
    fr-192  The madness of Charles VI
    fr-193  The Armagnacs and the Burgundians
    fr-194  Agincourt
    fr-195  The Treaty of Troyes
    fr-196  The Burgundian state
    fr-197  The kingdom of Bourges
    fr-198  Joan of Arc
    fr-199  The relief of Orléans
    fr-200  The coronation at Reims
    fr-201  The trial of Joan of Arc
    fr-202  The rehabilitation and the legend
    fr-203  The reconquest of Normandy
    fr-204  Castillon and the end of the war
    fr-205  The war and the French economy
    fr-206  The routiers and the ravaging of France
    fr-207  War and the growth of taxation
    fr-208  The standing army
    fr-209  Charles VII and the recovery of the state
    fr-210  What the war made of France

## Renaissance and the Wars of Religion

### The Italian Wars and the new monarchy — `fr-italianwars`

    fr-211  Louis XI
    fr-212  Louis XI and Charles the Bold
    fr-213  The fall of Burgundy
    fr-214  The acquisition of Brittany
    fr-215  The completion of the kingdom
    fr-216  The Italian Wars
    fr-217  Charles VIII in Italy
    fr-218  Louis XII and Milan
    fr-219  Marignano
    fr-220  Francis I
    fr-221  The captivity of Francis I
    fr-222  Pavia
    fr-223  The rivalry with Charles V
    fr-224  The Ottoman alliance
    fr-225  The end of the Italian Wars
    fr-226  What France took from Italy
    fr-227  The Renaissance monarchy
    fr-228  The Concordat of Bologna
    fr-229  The growth of royal offices
    fr-230  The sale of offices

### Renaissance and humanism in France — `fr-humanism`

    fr-231  The French Renaissance
    fr-232  Humanism in France
    fr-233  Guillaume Budé
    fr-234  The Collège Royal
    fr-235  Printing in France
    fr-236  Rabelais
    fr-237  The Pléiade
    fr-238  Ronsard
    fr-239  Montaigne
    fr-240  The Essais
    fr-241  The châteaux of the Loire
    fr-242  Chambord
    fr-243  Fontainebleau and the Italian artists
    fr-244  The French Renaissance garden
    fr-245  Music at the French court
    fr-246  The Ordinance of Villers-Cotterêts
    fr-247  French replaces Latin
    fr-248  The standardisation of French
    fr-249  Court culture under Francis I
    fr-250  The Renaissance and the state

### Reformation and the Huguenots — `fr-reformation`

    fr-251  The Reformation in France
    fr-252  Lefèvre d'Étaples and the early evangelicals
    fr-253  The Affair of the Placards
    fr-254  John Calvin
    fr-255  Calvin and Geneva
    fr-256  The Huguenots
    fr-257  Who the Huguenots were
    fr-258  The Reformed churches of France
    fr-259  The nobility and the new faith
    fr-260  Persecution under Henry II
    fr-261  The Chambre Ardente
    fr-262  Printing and the spread of reform
    fr-263  Catholic reform in France
    fr-264  The Gallican Church
    fr-265  Gallicanism
    fr-266  The Council of Trent and France
    fr-267  The Jesuits in France
    fr-268  Religion and regional division
    fr-269  Confessional coexistence
    fr-270  Why France did not become Protestant

### The Wars of Religion — `fr-religionwars`

    fr-271  The French Wars of Religion
    fr-272  The Conspiracy of Amboise
    fr-273  Catherine de' Medici
    fr-274  The Massacre of Vassy
    fr-275  The first war
    fr-276  The politics of the great houses
    fr-277  The Guise
    fr-278  The Bourbon claim
    fr-279  The Colloquy of Poissy
    fr-280  The Peace of Saint-Germain
    fr-281  The Saint Bartholomew's Day massacre
    fr-282  The massacre in the provinces
    fr-283  The consequences of the massacre
    fr-284  The Huguenot state within the state
    fr-285  The monarchomachs
    fr-286  The politiques
    fr-287  Jean Bodin and sovereignty
    fr-288  The Catholic League
    fr-289  The Day of the Barricades
    fr-290  The War of the Three Henries
    fr-291  The assassination of Henry III
    fr-292  Henry IV
    fr-293  The siege of Paris in 1590
    fr-294  The conversion of Henry IV
    fr-295  The Edict of Nantes
    fr-296  What the Edict granted
    fr-297  The reconstruction under Henry IV
    fr-298  Sully
    fr-299  The assassination of Henry IV
    fr-300  What the wars cost France

## The Ancien Régime

### The Bourbon state — `fr-bourbons`

    fr-301  The Bourbon dynasty
    fr-302  The regency of Marie de' Medici
    fr-303  Louis XIII
    fr-304  Cardinal Richelieu
    fr-305  Richelieu and the nobility
    fr-306  The siege of La Rochelle
    fr-307  Richelieu and the Huguenots
    fr-308  France in the Thirty Years' War
    fr-309  Raison d'État
    fr-310  The intendants
    fr-311  Mazarin
    fr-312  The Fronde
    fr-313  The Fronde of the princes
    fr-314  Why the Fronde failed
    fr-315  The Peace of Westphalia and France
    fr-316  The Treaty of the Pyrenees
    fr-317  Absolutism
    fr-318  What absolutism was not
    fr-319  The venal officeholder
    fr-320  The Parlements as opposition
    fr-321  The provincial estates
    fr-322  Taxation under the Bourbons
    fr-323  The taille and the gabelle
    fr-324  The army of the Bourbons
    fr-325  France becomes the leading power

### Louis XIV — `fr-louis14`

    fr-326  Louis XIV
    fr-327  The personal rule
    fr-328  The Sun King
    fr-329  Versailles
    fr-330  The court at Versailles
    fr-331  The domestication of the nobility
    fr-332  Royal propaganda and the image of the king
    fr-333  Colbert
    fr-334  Colbertism
    fr-335  Manufactures and trade
    fr-336  The French navy
    fr-337  Vauban and the fortified frontier
    fr-338  The wars of Louis XIV
    fr-339  The War of Devolution
    fr-340  The Dutch War
    fr-341  The Nine Years' War
    fr-342  The War of the Spanish Succession
    fr-343  Utrecht
    fr-344  The cost of the wars
    fr-345  The revocation of the Edict of Nantes
    fr-346  The Huguenot exodus
    fr-347  Jansenism
    fr-348  Port-Royal
    fr-349  Gallican liberties under Louis XIV
    fr-350  Classicism and the Academies
    fr-351  The theatre under Louis XIV
    fr-352  The Academy and the French language
    fr-353  Famine and crisis in the 1690s
    fr-354  The end of the reign
    fr-355  What Louis XIV left

### Society under the Ancien Régime — `fr-society18`

    fr-356  The Ancien Régime
    fr-357  The three estates
    fr-358  The French nobility
    fr-359  The nobility of the robe
    fr-360  The clergy as an order
    fr-361  The Third Estate
    fr-362  The peasantry in the eighteenth century
    fr-363  Seigneurial dues
    fr-364  The French bourgeoisie
    fr-365  Urban life in the eighteenth century
    fr-366  Paris in the eighteenth century
    fr-367  Population and subsistence
    fr-368  The grain trade and bread
    fr-369  The French economy before the Revolution
    fr-370  The Atlantic trade and the ports
    fr-371  Slavery and the French colonies
    fr-372  The Code Noir
    fr-373  Provincial France
    fr-374  Roads, travel and the internal market
    fr-375  Literacy and schooling
    fr-376  Popular religion
    fr-377  The family and the household
    fr-378  Women under the Ancien Régime
    fr-379  Crime and policing
    fr-380  Poverty and charity

### The Enlightenment in France — `fr-enlightenment`

    fr-381  The French Enlightenment
    fr-382  The philosophes
    fr-383  Voltaire
    fr-384  Montesquieu and the separation of powers
    fr-385  Rousseau and the general will
    fr-386  Diderot and the Encyclopédie
    fr-387  The Encyclopédie as an enterprise
    fr-388  The salons
    fr-389  Censorship and the book trade
    fr-390  The republic of letters
    fr-391  The public sphere
    fr-392  Freemasonry in France
    fr-393  Physiocracy
    fr-394  Enlightenment and religion
    fr-395  Enlightened opinion and the monarchy
    fr-396  The Enlightenment and slavery
    fr-397  Science under the Ancien Régime
    fr-398  The Academy of Sciences
    fr-399  Did the Enlightenment cause the Revolution
    fr-400  The limits of the Enlightenment

### The crisis of the monarchy — `fr-crisis`

    fr-401  Louis XV
    fr-402  The Regency
    fr-403  The financial system of John Law
    fr-404  The wars of Louis XV
    fr-405  The loss of New France
    fr-406  The Seven Years' War and France
    fr-407  The expulsion of the Jesuits
    fr-408  The Maupeou reforms
    fr-409  Louis XVI
    fr-410  Turgot and reform
    fr-411  Necker
    fr-412  France and the American war
    fr-413  The debt
    fr-414  The Assembly of Notables
    fr-415  The revolt of the nobility
    fr-416  The calling of the Estates General
    fr-417  The cahiers de doléances
    fr-418  The harvest of 1788
    fr-419  The crisis of 1789
    fr-420  Why the monarchy failed

## Revolution and Empire

### 1789 — `fr-1789`

    fr-421  The French Revolution
    fr-422  The Estates General of 1789
    fr-423  The question of voting by order
    fr-424  The National Assembly
    fr-425  The Tennis Court Oath
    fr-426  The dismissal of Necker
    fr-427  The storming of the Bastille
    fr-428  What the Bastille meant
    fr-429  The Great Fear
    fr-430  The night of 4 August
    fr-431  The abolition of feudalism
    fr-432  The Declaration of the Rights of Man
    fr-433  What the Declaration left out
    fr-434  The October Days
    fr-435  The king brought to Paris
    fr-436  The Constituent Assembly
    fr-437  The sale of church lands
    fr-438  The assignat
    fr-439  The Civil Constitution of the Clergy
    fr-440  The oath and the schism
    fr-441  The new administrative map
    fr-442  The departments
    fr-443  The reform of law and weights
    fr-444  The clubs
    fr-445  The Jacobin Club
    fr-446  The revolutionary press
    fr-447  Women in 1789
    fr-448  The flight to Varennes
    fr-449  The Champ de Mars massacre
    fr-450  The Constitution of 1791

### The Republic and the Terror — `fr-radical`

    fr-451  The Legislative Assembly
    fr-452  The declaration of war in 1792
    fr-453  The Brunswick Manifesto
    fr-454  The insurrection of 10 August 1792
    fr-455  The fall of the monarchy
    fr-456  The September Massacres
    fr-457  Valmy
    fr-458  The National Convention
    fr-459  The trial of Louis XVI
    fr-460  The execution of the king
    fr-461  The Girondins and the Montagnards
    fr-462  The Vendée
    fr-463  The federalist revolt
    fr-464  The Committee of Public Safety
    fr-465  Robespierre
    fr-466  The Terror
    fr-467  The Law of Suspects
    fr-468  The Revolutionary Tribunal
    fr-469  The guillotine
    fr-470  How many died in the Terror
    fr-471  The levée en masse
    fr-472  The armies of the Republic
    fr-473  The maximum and the controlled economy
    fr-474  Dechristianisation
    fr-475  The revolutionary calendar
    fr-476  The Cult of the Supreme Being
    fr-477  The sans-culottes
    fr-478  Women and the Revolution
    fr-479  The abolition of slavery in 1794
    fr-480  The fall of Robespierre

### Thermidor and the Directory — `fr-directory`

    fr-481  Thermidor
    fr-482  The Thermidorian reaction
    fr-483  The White Terror
    fr-484  The Constitution of Year III
    fr-485  The Directory
    fr-486  The politics of the Directory
    fr-487  Babeuf and the Conspiracy of Equals
    fr-488  The coups of the Directory
    fr-489  The sister republics
    fr-490  The Italian campaign of 1796
    fr-491  The Egyptian expedition
    fr-492  The war of the Second Coalition
    fr-493  The Directory's finances
    fr-494  Royalism under the Directory
    fr-495  The Chouannerie
    fr-496  The religious question after Thermidor
    fr-497  The Brumaire coup
    fr-498  Why the Directory fell
    fr-499  The Consulate
    fr-500  The Constitution of Year VIII

### Napoleon — `fr-napoleon`

    fr-501  Napoleon Bonaparte
    fr-502  The rise of Bonaparte
    fr-503  Marengo and the Peace of Amiens
    fr-504  The Consulate's reforms
    fr-505  The Concordat of 1801
    fr-506  The Napoleonic Code
    fr-507  What the Code settled
    fr-508  The prefects
    fr-509  The University and the lycée
    fr-510  The Bank of France
    fr-511  The Legion of Honour
    fr-512  The proclamation of the Empire
    fr-513  The imperial nobility
    fr-514  The police state under Napoleon
    fr-515  Censorship under the Empire
    fr-516  Austerlitz
    fr-517  The Grand Empire
    fr-518  The Continental System
    fr-519  The satellite kingdoms
    fr-520  The Peninsular War
    fr-521  The restoration of slavery in 1802
    fr-522  Haiti and the loss of Saint-Domingue
    fr-523  The Louisiana Purchase
    fr-524  The Russian campaign
    fr-525  The retreat from Moscow
    fr-526  The campaign of 1813
    fr-527  The campaign of France
    fr-528  The first abdication
    fr-529  Elba and the Hundred Days
    fr-530  Waterloo
    fr-531  Saint Helena
    fr-532  The Napoleonic legend
    fr-533  Napoleon and Europe
    fr-534  What Napoleon kept of the Revolution
    fr-535  Assessing Napoleon

### What the Revolution changed — `fr-revmeaning`

    fr-536  The Revolution and the land
    fr-537  The Revolution and the Church
    fr-538  The Revolution and the nobility
    fr-539  Citizenship and the nation
    fr-540  The nation in arms
    fr-541  The rights of Protestants and Jews
    fr-542  The Revolution and the colonies
    fr-543  The Revolution and women's rights
    fr-544  Revolutionary symbols
    fr-545  The tricolour
    fr-546  The Marseillaise
    fr-547  Marianne
    fr-548  Liberty, Equality, Fraternity
    fr-549  The metric system
    fr-550  Revolutionary festivals
    fr-551  The Revolution and the French language
    fr-552  The Revolution in the provinces
    fr-553  The counter-revolution
    fr-554  Emigration and the émigrés
    fr-555  The Revolution in European memory
    fr-556  The historians and the Revolution
    fr-557  The revisionist debate
    fr-558  The bicentenary of 1989
    fr-559  The Revolution as a founding event
    fr-560  What 1789 means in France today

## The Long Nineteenth Century

### Restoration and July Monarchy — `fr-restoration`

    fr-561  The Bourbon Restoration
    fr-562  The Charter of 1814
    fr-563  Louis XVIII
    fr-564  The ultras
    fr-565  The White Terror of 1815
    fr-566  Charles X
    fr-567  The sacre of Charles X
    fr-568  The Spanish expedition of 1823
    fr-569  The conquest of Algiers
    fr-570  The July Ordinances
    fr-571  The July Revolution
    fr-572  The Three Glorious Days
    fr-573  Louis-Philippe
    fr-574  The July Monarchy
    fr-575  The bourgeois monarchy
    fr-576  Guizot
    fr-577  Industrialisation in France
    fr-578  The railways
    fr-579  The new working class
    fr-580  Utopian socialism in France
    fr-581  Saint-Simon and Fourier
    fr-582  The Lyon silk workers' revolts
    fr-583  Romanticism in France
    fr-584  The banquet campaign
    fr-585  Why the July Monarchy fell

### 1848 and the Second Republic — `fr-1848`

    fr-586  The Revolution of 1848
    fr-587  The February days
    fr-588  The Provisional Government
    fr-589  The right to work and the National Workshops
    fr-590  Universal male suffrage
    fr-591  The abolition of slavery in 1848
    fr-592  Victor Schoelcher
    fr-593  The April elections
    fr-594  The June Days
    fr-595  The repression of June
    fr-596  The Constitution of 1848
    fr-597  The presidential election of 1848
    fr-598  Louis-Napoleon Bonaparte
    fr-599  The conservative republic
    fr-600  The Roman expedition
    fr-601  The Falloux Law
    fr-602  The coup of 2 December 1851
    fr-603  The resistance to the coup
    fr-604  The plebiscite and the Empire
    fr-605  What 1848 left behind

### The Second Empire — `fr-secondempire`

    fr-606  The Second Empire
    fr-607  Napoleon III
    fr-608  The authoritarian empire
    fr-609  The liberal empire
    fr-610  Economic growth under the Empire
    fr-611  The Crédit Mobilier and the banks
    fr-612  Haussmann
    fr-613  The rebuilding of Paris
    fr-614  What Haussmannisation did
    fr-615  The Universal Exhibitions
    fr-616  The Cobden–Chevalier treaty
    fr-617  The Crimean War and France
    fr-618  The Italian campaign of 1859
    fr-619  Nice and Savoy
    fr-620  The Mexican adventure
    fr-621  The Empire and the Church
    fr-622  The Empire and the workers
    fr-623  Colonial expansion under the Empire
    fr-624  The Suez Canal
    fr-625  Science and medicine in the Empire
    fr-626  Pasteur
    fr-627  The opposition to the Empire
    fr-628  The plebiscite of 1870
    fr-629  The Ems telegram and the war
    fr-630  The fall of the Empire

### Defeat and the Commune — `fr-commune`

    fr-631  The Franco-Prussian War
    fr-632  Sedan
    fr-633  The Government of National Defence
    fr-634  The siege of Paris
    fr-635  Gambetta and the war in the provinces
    fr-636  The armistice and the elections of 1871
    fr-637  The Treaty of Frankfurt
    fr-638  The loss of Alsace-Lorraine
    fr-639  The Paris Commune
    fr-640  The causes of the Commune
    fr-641  The Commune's government
    fr-642  The Commune's reforms
    fr-643  Women in the Commune
    fr-644  The Bloody Week
    fr-645  The repression of the Commune
    fr-646  The Commune in memory
    fr-647  The indemnity and recovery
    fr-648  The question of the regime
    fr-649  The failure of the monarchist restoration
    fr-650  The Republic by one vote

### The Third Republic to 1914 — `fr-thirdrepublic`

    fr-651  The Third Republic
    fr-652  The constitutional laws of 1875
    fr-653  The crisis of 16 May 1877
    fr-654  The republican settlement
    fr-655  The Ferry laws
    fr-656  Free, compulsory and secular schooling
    fr-657  The school and the nation
    fr-658  The Boulanger affair
    fr-659  The Panama scandal
    fr-660  The Dreyfus affair
    fr-661  The intellectuals and the affair
    fr-662  The consequences of the Dreyfus affair
    fr-663  Antisemitism in the Third Republic
    fr-664  The separation of Church and State
    fr-665  Laïcité
    fr-666  The French labour movement
    fr-667  Jean Jaurès and French socialism
    fr-668  The Radical Party
    fr-669  The Belle Époque
    fr-670  France in 1914

## War and Occupation

### The First World War — `fr-ww1`

    fr-671  France in the First World War
    fr-672  The July crisis and French mobilisation
    fr-673  The Union sacrée
    fr-674  The Battle of the Frontiers
    fr-675  The Marne
    fr-676  The taxis of the Marne
    fr-677  The race to the sea
    fr-678  The Western Front in France
    fr-679  Trench warfare on French soil
    fr-680  Verdun
    fr-681  The meaning of Verdun
    fr-682  The Somme and the French army
    fr-683  The Nivelle offensive
    fr-684  The mutinies of 1917
    fr-685  Pétain and the restoration of the army
    fr-686  The home front
    fr-687  Women and war work
    fr-688  The war economy
    fr-689  Colonial troops in the French army
    fr-690  Clemenceau
    fr-691  The occupied departments
    fr-692  The refugees of the north
    fr-693  The American entry and France
    fr-694  The victory of 1918
    fr-695  The armistice at Rethondes
    fr-696  The French war dead
    fr-697  French aims at the peace conference
    fr-698  Alsace-Lorraine regained
    fr-699  The devastated regions
    fr-700  The war in French memory

### The interwar republic — `fr-interwar`

    fr-701  France after the war
    fr-702  Reparations and the Ruhr occupation
    fr-703  The franc and the financial crisis
    fr-704  The Cartel des Gauches
    fr-705  Poincaré and stabilisation
    fr-706  Locarno and French security
    fr-707  The Maginot Line
    fr-708  French strategy between the wars
    fr-709  The Depression in France
    fr-710  Political instability in the 1930s
    fr-711  The leagues and the far right
    fr-712  The riot of 6 February 1934
    fr-713  The Popular Front
    fr-714  Léon Blum
    fr-715  The Matignon Accords
    fr-716  Paid holidays and the forty-hour week
    fr-717  The fall of the Popular Front
    fr-718  France and the Spanish Civil War
    fr-719  Pacifism in France
    fr-720  The Communist Party in France
    fr-721  Immigration between the wars
    fr-722  Colonial policy between the wars
    fr-723  The Colonial Exhibition of 1931
    fr-724  Munich and French opinion
    fr-725  France on the eve of war

### The defeat of 1940 — `fr-1940`

    fr-726  The drôle de guerre
    fr-727  The German offensive of May 1940
    fr-728  The breakthrough at Sedan
    fr-729  The collapse of the French front
    fr-730  The exodus of 1940
    fr-731  The government's flight to Bordeaux
    fr-732  The debate on the armistice
    fr-733  The armistice of June 1940
    fr-734  The appeal of 18 June
    fr-735  Mers-el-Kébir
    fr-736  The vote of 10 July 1940
    fr-737  The end of the Third Republic
    fr-738  Explaining the defeat of 1940
    fr-739  The Riom trial
    fr-740  The defeat in French memory

### Vichy and the Occupation — `fr-vichy`

    fr-741  Vichy France
    fr-742  The constitution Vichy never wrote
    fr-743  Philippe Pétain
    fr-744  The National Revolution
    fr-745  Work, Family, Fatherland
    fr-746  Who supported Vichy
    fr-747  Pierre Laval
    fr-748  Collaboration
    fr-749  The Montoire meeting
    fr-750  The occupied and unoccupied zones
    fr-751  Daily life under the Occupation
    fr-752  Rationing and the black market
    fr-753  The German exploitation of France
    fr-754  Forced labour and the STO
    fr-755  The Jewish statutes
    fr-756  The persecution of Jews in France
    fr-757  The Vél d'Hiv round-up
    fr-758  French complicity in the deportations
    fr-759  Who survived and why
    fr-760  The Milice
    fr-761  Collaborationism in Paris
    fr-762  Vichy and the empire
    fr-763  The occupation of the southern zone
    fr-764  The scuttling of the fleet at Toulon
    fr-765  Vichy's legality
    fr-766  The Paxton revolution
    fr-767  Vichy and the Republic
    fr-768  The trials of Pétain and Laval
    fr-769  Vichy in French memory
    fr-770  The 1995 acknowledgement

### Resistance, liberation and reckoning — `fr-resistance`

    fr-771  The beginnings of resistance
    fr-772  Free France and the question of legitimacy
    fr-773  Charles de Gaulle in London
    fr-774  De Gaulle and Giraud
    fr-775  The resistance movements
    fr-776  Jean Moulin
    fr-777  The unification of the Resistance
    fr-778  The National Council of the Resistance
    fr-779  The maquis
    fr-780  The Communists and the Resistance
    fr-781  Foreigners and Jews in the Resistance
    fr-782  Women in the French Resistance
    fr-783  The clandestine press
    fr-784  The programme of the Resistance
    fr-785  The liberation of France
    fr-786  The restoration of republican authority
    fr-787  The épuration
    fr-788  The shorn women
    fr-789  Résistancialisme
    fr-790  The Resistance in French memory

## France Since 1945

### The Fourth Republic — `fr-fourth`

    fr-791  The Fourth Republic
    fr-792  The provisional government of 1944
    fr-793  Women get the vote
    fr-794  The nationalisations of 1945
    fr-795  The founding of social security
    fr-796  The constitution of 1946
    fr-797  Tripartism and its collapse
    fr-798  The instability of governments
    fr-799  The Communists after 1947
    fr-800  Gaullism in opposition
    fr-801  The Marshall Plan and France
    fr-802  Reconstruction and the Monnet Plan
    fr-803  The Trente Glorieuses
    fr-804  France and the founding of Europe
    fr-805  The Schuman Declaration
    fr-806  The European Defence Community
    fr-807  The baby boom and immigration
    fr-808  Modernisation and the countryside
    fr-809  The war in Indochina
    fr-810  Dien Bien Phu

### Decolonisation and the Algerian War — `fr-decolonisation`

    fr-811  French decolonisation
    fr-812  The loss of Indochina
    fr-813  Morocco and Tunisia
    fr-814  French West Africa
    fr-815  The independence of sub-Saharan Africa
    fr-816  Françafrique
    fr-817  Algeria as part of France
    fr-818  The settlers of Algeria
    fr-819  Algerian Muslims and French citizenship
    fr-820  Sétif
    fr-821  The outbreak of the Algerian War
    fr-822  The FLN
    fr-823  The Battle of Algiers
    fr-824  Torture in the Algerian War
    fr-825  The argument about torture in France
    fr-826  The conscripts' war
    fr-827  The harkis
    fr-828  The war and French opinion
    fr-829  The intellectuals and the war
    fr-830  The fall of the Fourth Republic
    fr-831  De Gaulle's return in 1958
    fr-832  The turn to self-determination
    fr-833  The generals' putsch
    fr-834  The OAS
    fr-835  The Paris massacre of 1961
    fr-836  The Évian Accords
    fr-837  The exodus of the pieds-noirs
    fr-838  The fate of the harkis
    fr-839  The war's name and its memory
    fr-840  What decolonisation did to France

### The Fifth Republic — `fr-fifth`

    fr-841  The Fifth Republic
    fr-842  The constitution of 1958
    fr-843  The presidency of the Fifth Republic
    fr-844  The 1962 referendum on direct election
    fr-845  Cohabitation
    fr-846  De Gaulle's foreign policy
    fr-847  The force de frappe
    fr-848  France and NATO
    fr-849  De Gaulle and Europe
    fr-850  The Franco-German reconciliation
    fr-851  The Élysée Treaty
    fr-852  The modernisation of the economy
    fr-853  The state and industry
    fr-854  The grandes écoles and the elite
    fr-855  De Gaulle's departure
    fr-856  Pompidou
    fr-857  Giscard d'Estaing
    fr-858  The reforms of the 1970s
    fr-859  The Socialists and the Union of the Left
    fr-860  Mitterrand
    fr-861  The turn of 1983
    fr-862  Chirac
    fr-863  The presidency since 2007
    fr-864  The party system and its collapse
    fr-865  The institutions under strain

### 1968 and the long aftermath — `fr-1968`

    fr-866  May 1968
    fr-867  The student movement
    fr-868  The night of the barricades
    fr-869  The general strike
    fr-870  The Grenelle agreements
    fr-871  De Gaulle's disappearance and return
    fr-872  The June elections
    fr-873  What May 1968 changed
    fr-874  The interpretations of 1968
    fr-875  Feminism in France after 1968
    fr-876  Contraception and abortion
    fr-877  The Veil Law
    fr-878  Regionalism and minority languages
    fr-879  Environmentalism in France
    fr-880  The decline of the Communist Party
    fr-881  The rise of the Front National
    fr-882  Immigration and the politics of identity
    fr-883  The headscarf affairs
    fr-884  The banlieues and the riots of 2005
    fr-885  The strike as a French institution

### France now — `fr-contemporary`

    fr-886  France and European integration
    fr-887  The Maastricht referendum
    fr-888  The euro and France
    fr-889  The referendum of 2005
    fr-890  The French economy since 1980
    fr-891  Deindustrialisation
    fr-892  The French social model
    fr-893  The welfare state and its reform
    fr-894  Pensions and protest
    fr-895  French agriculture and the Common Agricultural Policy
    fr-896  Immigration since 1974
    fr-897  France and Islam
    fr-898  Laïcité today
    fr-899  The attacks of 2015
    fr-900  The state of emergency
    fr-901  The gilets jaunes
    fr-902  The French media
    fr-903  Sport and the nation
    fr-904  France and the Francophonie
    fr-905  French cultural policy
    fr-906  The exception culturelle
    fr-907  France's place in the world
    fr-908  The armed forces and intervention
    fr-909  Nuclear power in France
    fr-910  France in the twenty-first century

## The Making of France

### The French language — `fr-language`

    fr-911  The French language
    fr-912  From Latin to Old French
    fr-913  Old French
    fr-914  Middle French
    fr-915  The langue d'oïl
    fr-916  Occitan
    fr-917  The dialects and patois of France
    fr-918  The imposition of French
    fr-919  The Abbé Grégoire's survey
    fr-920  The school and the death of patois
    fr-921  The Académie française
    fr-922  The defence of French
    fr-923  French as a language of Europe
    fr-924  French spelling and its reforms
    fr-925  Breton
    fr-926  Basque
    fr-927  Alsatian and the languages of the east
    fr-928  Corsican
    fr-929  Regional languages and the constitution
    fr-930  French in the world

### The regions and the provinces — `fr-regions`

    fr-931  France is not Paris
    fr-932  The provinces of the Ancien Régime
    fr-933  The departments and the centralised state
    fr-934  Jacobin centralisation
    fr-935  Decentralisation since 1982
    fr-936  The modern regions
    fr-937  Paris and the desert
    fr-938  Brittany
    fr-939  Normandy
    fr-940  Alsace
    fr-941  Lorraine
    fr-942  Burgundy
    fr-943  Provence
    fr-944  Languedoc
    fr-945  Aquitaine and Gascony
    fr-946  The Auvergne and the Massif Central
    fr-947  Savoy and the Alps
    fr-948  The Pyrenees and the frontier
    fr-949  Corsica
    fr-950  Corsican nationalism
    fr-951  The industrial north
    fr-952  The Loire valley
    fr-953  Rural France and the exodus from the land
    fr-954  The French city
    fr-955  Regional identity in modern France

### The empire and the overseas — `fr-empire`

    fr-956  The French colonial empire
    fr-957  The first colonial empire
    fr-958  New France and the French in America
    fr-959  The French Caribbean
    fr-960  Saint-Domingue
    fr-961  The French slave trade
    fr-962  The abolition of slavery in France
    fr-963  The memory of slavery
    fr-964  French India and the loss of the first empire
    fr-965  The second colonial empire
    fr-966  The conquest of Algeria
    fr-967  The colonisation of Indochina
    fr-968  The scramble for Africa and France
    fr-969  Fashoda
    fr-970  The civilising mission
    fr-971  The image of empire at home
    fr-972  Colonial administration
    fr-973  The indigénat
    fr-974  Colonial troops in the two wars
    fr-975  Resistance to French rule
    fr-976  The overseas departments and territories
    fr-977  The Antilles today
    fr-978  Réunion and Mayotte
    fr-979  New Caledonia
    fr-980  What remains of the empire

### Institutions, ideas and everyday life — `fr-institutions`

    fr-981  The French state
    fr-982  The idea of the Republic
    fr-983  The French model of citizenship
    fr-984  The Napoleonic administration and its survival
    fr-985  French law and the codes
    fr-986  The Conseil d'État
    fr-987  The French school system
    fr-988  The baccalauréat
    fr-989  French universities
    fr-990  The army and the nation
    fr-991  The French Church since 1905
    fr-992  French food and the table
    fr-993  The invention of French cuisine
    fr-994  Wine and the French landscape
    fr-995  French fashion and luxury
    fr-996  French cinema
    fr-997  The French intellectual
    fr-998  French national symbols
    fr-999  What makes France French
    fr-1000  How France argues about its past
