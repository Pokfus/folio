# Westeros — a 1000-card running order

The plan for `westeros`, a new collection: every card's number, topic and deck, fixed in advance so
the collection can be grown one card at a time over many sessions without anyone having to remember
what was intended.

It is the twenty-eighth of these and **the second whose subject is a work of fiction**, after
Middle-earth. Read `docs/greece-card-plan.md` first if this is the first plan you have met, and
**read `docs/middleearth-card-plan.md`'s section "The one thing to read before writing anything"
second** — its argument about what a card may assert when the subject is invented is this
collection's argument too, and it is not repeated here at length. What IS here is everything that
differs, and three things differ a great deal.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `wes-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='wes-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them.

The padding above is right for every id but the last: the ids are `wes-001` … `wes-999`, then
`wes-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `wes-628 Who killed Joffrey` is a question the books answer in stages and the show answers
differently, and the card's actual answer — the word that gets blanked — is chosen while writing it.

Where the research says the line is wrong, **change the line here in the same commit as the card**,
and say so. Never invent a date, a name, a definition or a passage.

---

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue, a new `ICON_SYMBOLS` mark and its `COLLECTION_SECTION` row all ship with the file.

**The id is `westeros` and the card prefix is `wes-`.** The obvious short prefix `we-` was avoided
deliberately: it is not taken, but it is two characters and reads as a pronoun in a list of card ids,
and `wes-` is a prefix of nothing on the shelf and nothing on the shelf is a prefix of it. The deck
ids are also `wes-…`.

**THE COLLECTION IS CALLED WESTEROS AND THAT IS A CHOICE WORTH DEFENDING, because the world has no
name.** Tolkien's readers have "Middle-earth"; Martin's have nothing — the books say "the known
world", the maps are titled after the two continents, and the series is named after a song rather
than a place. The three candidates were *A Song of Ice and Fire*, which names the books and excludes
the television, *Game of Thrones*, which names the television and excludes the books, and
**Westeros**, which names neither and is what everybody says. It is imprecise in one direction — the
collection gives 26 cards to Essos and 22 to the far side of the Wall — and the plan says so rather
than pretending the continent is the world.

**IT NEEDS A `COLLECTION_SECTION` ROW AND THE ROW IS `westeros: "The Arts"`.** `sectionOf` returns
History for anything the table does not name, which is plainly wrong for a novel sequence and a
television series. It is the fourth collection under that heading, after Visual Art, Architecture and
Middle-earth.

### The hue: `#B32057`, crimson — and the shelf's six reds all lean the other way

**The apt families were swept in CIELAB against the 34 hues now on the shelf.** The shelf's median
nearest-neighbour distance is **20.1**, its tightest existing pair is **12.9** (China's vermilion
against Russia's lacquer), and its density — hues within ΔE 30 — runs a median of 6 and a maximum
of 9.

**THE FINDING THAT DECIDED IT IS THAT THE SHELF'S SIX REDS ALL LEAN ORANGE AND THE BLUE-LEANING RED
IS EMPTY.** China's vermilion, Russia's lacquer, the Indonesian deck's maroon, the Mandarin decks'
red, Korea's clay and Visual Art's oxblood sit between hue 25° and 40°; Japan's kuwazome is a
red-purple at 345°. **Between them, at hue 0–8 — carmine, crimson, the red of heraldic gules —
there is nothing at all.** `#B32057` stands **21.3** from its nearest neighbour, which is **above the
shelf's median of 20.1**, with **density 5**; it is 21.3 from Japan's kuwazome, 21.4 from the
Indonesian deck, 23.6 from the Mandarin decks, 28.8 from Russia and 30.0 from China. L 40, chroma 60,
and **6.4:1 against white** — which is worth noting on its own account, because the last three
collections all landed at the 3.7 floor of the shelf's 3.7–10.4 band and this one sits in the middle
of it.

**AND THE STORY IS NOT A HOUSE.** Crimson is Lannister, but it is also the Red Keep, the Red Wedding,
the red comet, the red priests, the red leaves of every heart tree, the Red Viper and the Red Waste.
**Red is this series' own signal for violence and for prophecy at once**, and it belongs to no single
faction — which the Lannister gold, the Stark grey, the Targaryen black-and-red and the Baratheon
yellow all do.

**Three other families were measured and refused.** **Blood-orange red**, the corner a reader might
first reach for, is the single most crowded on the shelf: the best candidate is **17.1 with TEN hues
inside ΔE 30**, which is the refusal Architecture's brick got at 16.3 with nine. **Cold slate-blue**
— winter, the Wall, the show's own desaturated palette, and the "ice" half of the title — tops out at
**18.7 with EIGHT neighbours**, pressed against the Second World War's dark iron, Philosophy's petrol
and the United States' navy. **Dark sea teal** is worse again at 13.3. The bright rose one step
further round scores better still and was rejected as a colour that means nothing here.

**Two regions that outscore it were NOT re-measured, on the standing notes in `COLL_THEME`** — the
magenta band, now refused for the tenth time, and the olive-brass. Do not run either sweep again.
**One warning specific to this hue: do not drift it lighter.** The same family at L 43–48 scores
22.2–22.9, which is better, and rendered beside the shelf's reds it is a raspberry pink rather than a
crimson. **The two points were given up for the colour**, which is Korea's trade exactly.

### The icon: a raven

**`raven`, drawn as a bird in flight with a swept wing and a visible tail.** Fifty-one marks were in
`ICON_SYMBOLS` and **not one was a bird in flight**: `owl` is a front-facing round bird with two large
eyes and ear tufts, and nothing else comes near. Rendered at 24, 28, 34 and 44px beside `owl`,
`plane`, `leaf` and `ship`, it is unmistakable at every size.

**IT IS THE FRANCHISE'S OWN MESSENGER AND IT BELONGS TO NO HOUSE**, which is the same test the hue had
to pass. Ravens carry every letter in the series, the maesters keep them, the three-eyed raven is one
of its central images, and "dark wings, dark words" is the saying a reader meets a dozen times.

**THREE OTHER MARKS WERE DRAWN AND REFUSED, and the refusals are the useful part.** A **direwolf head**
is House Stark's sigil and, drawn at 24px, is `owl` with pointed ears — a cat face. An **Iron Throne**,
drawn as a seat under a row of blades, reads at 24px as `castle`, whose entire identity is
crenellations, and as `crown` at a glance. A **dragon** cannot be drawn at 24px without becoming a
bird anyway. **Keep the tail and keep the wing's sweep**; the first raven drawn without them read as a
snail.

---

## What is different about this collection, in three paragraphs

**1. THE SERIES IS NOT FINISHED, AND THAT IS A FACT ABOUT EVERY CARD IN DECKS 5 AND 6.** *A Dance with
Dragons* was published in 2011 and *The Winds of Winter* has been forthcoming ever since. There is no
ending, several dozen plot lines stop mid-air, and a card that describes the state of the story is
describing where the last published book left it. **Write in those terms** — "at the end of the
published books", not "eventually" — and never write a card whose claim depends on an ending nobody
has read. `wes-660 Reading an unfinished series` is the card that carries this and every card in deck
6 inherits it.

**2. THE TELEVISION SERIES FINISHED FIRST, WITH A DIFFERENT ENDING, AND THAT IS THE TRAP.** *Game of
Thrones* overtook the books during its fifth season and ran to a conclusion in 2019 from an outline
Martin gave the showrunners. **That ending is the show's and it is not the books'.** A great many
readers now know only the screen version, several of its inventions have become the thing people
remember, and a card that presents any of it as the books' is simply wrong. So: **decks 2 to 6 card
the books and say nothing about the show; deck 8 cards the show, including its departures, as
departures.** `wes-659 Why the two endings need not match` is the card, and `wes-828 Whether the show
is the version remembered` is its pair.

**3. ONE OF THE PRIMARY SOURCES IS AN AVOWED LIAR.** *Fire & Blood* and *The World of Ice & Fire* are
written in the voice of maesters compiling a history from partisan witnesses, and they say so: a
single event is given three incompatible accounts, attributed to a court fool, a septon and a grand
maester, and the narrator declines to choose. **This is not a flaw to be smoothed over; it is the
form of the book and it is what the collection should teach.** `wes-500 Why Fire & Blood is
unreliable` and `wes-502 Mushroom, Septon Eustace and Grand Maester Munkun` are the cards, and every
card in `wes-dance` and `wes-conquest` inherits them: where the sources disagree, **the card gives
the disagreement**, exactly as a Mesopotamia card gives a range of scholarly estimates.

---

## Difficult material: the rule, stated before the running order

**THIS FRANCHISE CONTAINS SUSTAINED SEXUAL VIOLENCE, TORTURE, INCEST AND THE KILLING OF CHILDREN, AND
ITS TREATMENT OF ALL FOUR IS ITSELF ONE OF THE MOST-WRITTEN-ABOUT THINGS ABOUT IT.** Folio is written
for a reader at upper-secondary level. Those two sentences are both true and the collection has to be
built so that they stay true together. This section is the rule, and it binds every deck.

**A CARD NAMES WHAT HAPPENS AND NEVER RENDERS IT.** "Theon Greyjoy is tortured and mutilated over
several chapters written from inside his own collapsing mind, which critics have argued is the most
formally daring and the most unpleasant thing in the series" is a card. A description of what is done
to him is not, and no amount of fidelity to the text makes it one. This is the house rule the
Psychology plan states as *a disorder card describes and never diagnoses*, applied to a different
danger.

**WHERE A SEXUAL ASSAULT MUST BE NAMED, THE CARD GIVES THREE THINGS AND STOPS**: what happened, whom
it happened to, and what the argument about it is. That is the Korea plan's rule for the hardest
colonial subjects and it works here unchanged. `wes-702`, `wes-703`, `wes-704`, `wes-726`, `wes-727`
and `wes-728` are the cards that carry this material, they sit in the criticism decks where the
scholarship actually discusses it, and **they are the only cards that should be carrying it.**

**NO CARD IS WRITTEN FROM THE POSITION OF ENJOYING CRUELTY.** A card may say that a scene is famous,
that it is effective, or that readers found it unbearable; it may not relish it. Where a line in the
running order names a violent set piece — the Red Wedding, the Purple Wedding, Oberyn's duel — the
card is about *why it works as writing* and *what it does to the story*, which is what the critical
literature is about and is also the only interesting question.

**CHILD CHARACTERS ARE A SEPARATE AND STRICTER CASE.** The books' viewpoint characters include
children of eight and eleven, the television series aged its cast up, and the gap between the two is
itself a documented adaptation decision. `wes-733` and `wes-734` are about **that decision and the
criticism of it**, and no card in this collection pairs a child character with sexual content in any
other way.

**AND ONE THING FALLS OUT OF THE COPYRIGHT POSITION FOR FREE**: nothing in this collection can carry
a still from the show, so the worst version of this risk — an illustrated card — cannot arise. See
"Pictures" below.

---

## What this collection is about

**It is about A Song of Ice and Fire and everything that has grown out of it** — the author and the
history he raided, the five published novels and the novellas, the world they describe, the invented
history behind that world, the plot itself, the arguments about all of it, the television series and
its aftermath, and the games, companion volumes, fandom and business.

It is deliberately **not a plot summary with a franchise appendix**. The plot gets 90 cards of a
thousand. What gets the most is the **invented history** (125) and the **screen** (125), because the
first is where this world is deepest and the second is where most people met it.

---

## Is there a thousand cards in this?

Yes, and the answer turns on the same measurement Middle-earth's does: **only about a third of the
collection is the invented world at all.**

Counted from the running order: **105** are the author, his sources and his method; **110** are the
books as books; **240** describe the world and its peoples; **125** are the invented history, which
in this franchise is a published 700-page chronicle in its own right and not a set of appendices;
**90** are the plot; **105** are criticism and genre; **125** are the television; **110** are games,
companion books, fandom, business and legacy.

**THE INVENTED HISTORY IS THE SURPRISE AND IT IS WHY THE NUMBER WORKS.** *Fire & Blood* and *The World
of Ice & Fire* give three hundred years of Targaryen rule with named kings, dated reigns, a civil war
covered at chapter length, five rebellions and a disputed succession — and they are the source for
one whole prestige television series already. Deck 5 is 125 cards and could carry more.

**ABOUT A THIRD OF THE THOUSAND NAMES A PERSON**, which is more than Middle-earth's quarter and is
right for a series whose subject is politics: the cast is the argument. It is still a limit — a
character earns a slot by teaching something the house card does not, which is why House Frey has one
card and Walder Frey's part in the Red Wedding has another, and why a great many named knights have
none.

---

## Six scope decisions

**1. THE BOOKS AND THE SHOW ARE KEPT APART BY DECK.** Stated above; it is first because it decides
more lines than anything else.

**2. THE CRITICISM IS CARDED, INCLUDING THE CRITICISM THAT IS HOSTILE, AND MOST OF IT IS ABOUT THE
THINGS THE SERIES IS MOST ADMIRED FOR.** Thirty cards in `wes-arguments`: the realism claim and
whether medieval Europe was anything like this, the grimdark label, the treatment of race in Essos,
the white-saviour reading of Daenerys' arc, orientalism and the Dothraki, the treatment of rape, and
the argument about what an author owes a reader who has waited fourteen years. **They are carded as
arguments with evidence on each side**, and medievalists — who have written a good deal about this
series — are cited as the specialists they are.

**3. THE HISTORY BEHIND IT IS A DECK, NOT A FOOTNOTE.** Thirty-two cards on the Wars of the Roses,
Hadrian's Wall, the Black Dinner, Byzantium, the Mongols, the Little Ice Age and *The Accursed Kings*.
**The division of labour with the history collections is that they card the history and this deck
cards what Martin took from it and where he departed** — `wes-060` is that card by name. A reader who
learns here that the Red Wedding has two Scottish ancestors has learned something about both.

**4. THE UNRELIABLE SOURCES ARE CARDED AS UNRELIABLE.** Stated above. It is the collection's nearest
equivalent to Middle-earth's canon problem and it is more interesting, because Martin built the
unreliability in on purpose.

**5. THE FANDOM'S THEORY CULTURE IS CARDED AS A PRACTICE.** Twenty-seven cards. This is the fandom
that assembled R+L=J out of textual evidence over a decade and was proved right on screen, and the
practice — close reading, rereading projects, the podcasts, the video essays — is a genuine
interpretive culture worth describing. **It is also the fandom that produced organised harassment and
a petition to remake a television season**, and both are carded.

**6. THE BUSINESS IS CARDED AND IT IS UNUSUALLY WELL DOCUMENTED.** Eighteen cards on the 2007 option,
what Martin retained, the merchandising, the spin-off strategy, the tourism revenue, and when the
copyright expires. A franchise of this size leaves accounts, and accounts are better evidence than
commentary.

---

## The overlaps, measured

**They are small and they are all in deck 1**, which was measured rather than assumed:

    grep -rilE "martin|westeros|game of thrones|ice and fire|wars of the roses|hadrian" docs/*-card-plan.md
    node -e "global.window={};require('./data.js');console.log(window.CARD_DATA.filter(c=>/wars of the roses|hadrian|westeros|targaryen/i.test((c.answerText||'')+' '+(c.question||''))).map(c=>c.id))"

**No plan names Martin, Westeros or the series at all.** What the plans do hold is the history this
collection's first deck draws on: **France gives the Hundred Years' War 30 cards** (`fr-181`–`fr-210`),
**`wh-368 Hadrian's Wall` is shipped**, Rome holds Hadrian himself (`rm-503`–`rm-505`) and
Architecture holds Hadrian's Villa (`arch-297`). **The Wars of the Roses appear in no plan on the
shelf**, which is a gap in World History rather than an overlap with this one.

**THE DIVISION OF LABOUR IS ONE SENTENCE: a history collection cards the event, and `wes-history`
cards what a novelist made of it.** So `wh-368` is a Roman frontier work and `wes-041` is the wall
that a fantasy writer saw on a cold afternoon and made seven hundred feet of ice; `fr-181` is a
dynastic war and `wes-037` is the quarry Martin dug in. **Write the pair deliberately** where one
exists, and do not let this deck become a second history collection: its cards are about the
borrowing.

---

## Pictures: the honest answer is mostly no, again

**EVERYTHING IN THIS FRANCHISE IS IN COPYRIGHT AND ITS AUTHOR IS ALIVE.** The novels, the maps, the
cover art, the companion volumes' illustrations, every frame of the television series, every game
screenshot and all the publicity photography are unavailable against Folio's bar of PD / CC BY / CC
BY-SA. **That is this collection's stated reason-why-not under CLAUDE.md's picture rule, given once
for the whole thousand.** Do not go looking; a Westeros image that appears to be freely licensed on
Commons is almost certainly a mis-licensed upload or fan art of unclear provenance.

**WHAT CAN CARRY ONE is narrower than Middle-earth's list and still real.** The history deck is
almost entirely free: Towton, Bosworth, Hadrian's Wall, the Antonine Wall, medieval siege engines,
manuscript illuminations, the Princes in the Tower in nineteenth-century painting, Constantinople's
walls. The filming locations are free and well photographed — **Northern Ireland, Croatia, Iceland,
Spain and Malta all have freedom of panorama**, so Dubrovnik's walls, the Dark Hedges, Castle Ward,
Girona's steps and the Alcázar of Seville are all available. A few conference photographs of Martin
are CC-licensed. **Expect 60–90 of the thousand to carry a picture, nearly all of them in `wes-history`
and `wes-got`, and check Commons before promising one anywhere else.**

**`card.quote` IS UNAVAILABLE IN THIS COLLECTION AND THERE IS NO EXCEPTION.** The Library takes only
work whose copyright has expired; Martin's is not, and unlike Middle-earth — whose sources deck can
quote Folio's own *Beowulf* and *Poetic Edda* — this collection's sources are modern history books
and medieval chronicles the Library does not hold. **Do not write a `quote` block; `add-card.js` will
refuse it.**

**THE SCREEN DECKS HAVE `card.video`.** HBO's own trailers and behind-the-scenes featurettes on
YouTube are rights-holder uploads and the CSP already allows `youtube-nocookie.com`. A clip earns a
card only where the card is about the thing in the clip.

---

## Sourcing

**THE SECONDARY LITERATURE IS REAL BUT THINNER AND YOUNGER THAN TOLKIEN'S, AND MOST OF IT IS
PAYWALLED.** There is no *Mythlore* here. What exists: essay collections from academic presses
(McFarland's *Mastering the Game of Thrones*, Wiley's *Game of Thrones versus History*, several
university-press volumes on medievalism), a substantial medieval-studies literature in journals such
as *postmedieval* and *The Public Medievalist* — **the second is free and is written by
medievalists** — and a large media-studies literature on HBO and prestige television. **Search DOAJ
and OpenAIRE before assuming a paper is shut**, and prefer the medievalists on the history questions:
they are the people qualified to say whether the realism claim holds.

**THE PRIMARY TEXTS ARE THE SOURCE FOR IN-WORLD CLAIMS, CITED BY BOOK AND CHAPTER.** Cite the novels
by title and chapter — the chapters are named for their viewpoint character and numbered, which is
stable across every edition, where pagination is not. Cite *Fire & Blood* and *The World of Ice &
Fire* by section, **and say what they are**: an in-world compilation, not a statement of fact.

**MARTIN'S OWN STATEMENTS ARE A SOURCE FOR WHAT HE SAYS AND NOT FOR WHAT IS IN THE BOOKS.** His blog,
the *So Spake Martin* archive of his convention and email answers, and thirty years of interviews are
genuine evidence of intention, and intention is not text. This is the Architecture plan's
manifesto rule and the Middle-earth plan's commentary rule in a third medium. **He has also
contradicted himself, and changed his mind, and said things about the ending before writing it.**
Date the statement.

**A FAN WIKI IS NOT A SOURCE.** *A Wiki of Ice and Fire* is better than most and is still an
uncited tertiary compilation that mixes book and show; the larger Fandom wiki mixes them worse.
Follow them to the chapter and cite the chapter. `wes-963` is the card about exactly this.

**THE BUSINESS AND LEGAL CARDS REST ON FILINGS AND ACCOUNTS.** Warner Bros. Discovery's annual
reports, Northern Ireland Screen's published figures, the Croatian and Northern Irish tourism boards'
own studies. **Prefer the filing to the trade-press summary.**

---

## Dates, names and spellings

**AN IN-WORLD DATE IS NOT A DATE `cardYears` MAY SORT ON.** "283 AC" parses as the year 283 and would
file Robert's Rebellion in the Roman empire. **An in-world card is dated by its TEXT** — the card on
the Dance of the Dragons is dated 2018, by *Fire & Blood* — and the in-world date goes in the prose or
in an unlabelled row. **Read the sort year back after writing any date line in decks 3 to 6.** For the
same reason **`undatable: true` belongs on nearly every game-reachable card in decks 3, 4, 5 and 6**,
while a card about a book, an episode, a game or a person takes none.

**THE NAMES ARE MOSTLY ORDINARY ENGLISH AND THE APOSTROPHES ARE THE TRAP.** Jaqen H'ghar, Storm's End,
Casterly Rock, the Dothraki *dosh khaleen*, R'hllor. `answerText` is what a reader types and
`gradeCloze`'s near-miss tolerance forgives one slip; **an answer term with two apostrophes or an
internal capital needs testing rather than assuming.**

**A CHARACTER WITH SEVERAL NAMES NEEDS THE OTHERS AS GLOSSARY ALIASES**, the Rome collection's rule for
a Roman with three. Petyr Baelish and Littlefinger; Sandor Clegane and the Hound; Reek and Theon
Greyjoy; Arya and Cat of the Canals and No One; Aegon and Young Griff. **Where a name is itself a
spoiler the alias still goes in** — the glossary is a reference, not a reading order.

**AND THE SCREEN DECKS DATE BY TRANSMISSION.** An episode's date line is its first transmission and
its season; a season's is its first and last; a game's is its release year and platform.

---

## The glossary

**IT STARTS FROM NOTHING, AND THAT IS MEASURED.** Of the 3,838 shipped glossary terms, not one is a
Westeros term.

**THE TRAP IS SHARPER THAN MIDDLE-EARTH'S AND IT IS THE OPPOSITE ONE.** Tolkien's vocabulary is
mostly invented proper nouns that claim no English surface; **Martin's is mostly ordinary English
words used as names** — Stark, Wall, Hand, Watch, North, Reach, Vale, Mountain, Hound, Spider, Crown,
Throne, Pride, Winter, Faith, Citadel, Shadow, Rock, Storm. Almost none of them may claim its bare
surface: `buildGlossIndex` would auto-link the wrong sense across thousands of cards in every other
collection, and **`Stark` is the sharpest of all, being an ordinary English adjective the corpus uses
in its ordinary sense.** Key them `House_Stark`, `The_Wall_(A_Song_of_Ice_and_Fire)`,
`Hand_of_the_King`, `Night's_Watch` on `Life_(biology)`'s rule, reach them by a narrower alias and a
hand-written `data-k`, and **measure the bare word over the shipped corpus before deciding**, exactly
as `Cell_(biology)` was measured twice and answered differently the second time.

**FIVE GENERAL TERMS THIS COLLECTION WILL LINK TO ALREADY EXIST** — `Citadel`, `Crown_Dependency`,
`Winter_War`, `Middle_Ages` and `Lion_Gate` are all in the glossary and none of them means what this
collection means. **Do not re-key any of them**, and note that `Citadel` in particular is a real
fortification term: the Westerosi one needs a parenthetical key of its own.

---

## Difficulty, and the minigames

**LIKE MIDDLE-EARTH, THIS COLLECTION WILL REACH THE DAILY GAMES MORE THAN MOST.** Jon Snow, Daenerys,
Winterfell, the Iron Throne and the Red Wedding are household names; the Blackfyre Rebellions,
Archmaester Gyldayn and the Jogos Nhai are as obscure as anything Folio holds. Expect a spread from 1
to 5 with the mass in the middle, and rate the WORD rather than the card, as always.

**AND CHECK THE `undatable` FLAG ON EVERY DECK 3–6 CARD THAT IS RATED LOW ENOUGH TO BE DEALT**, since
that is exactly the set Timeline would otherwise ask a reader to place in real time.

---

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| The author and the making | George R. R. Martin | 28 | wes-001–028 |
|  | The history behind it | 32 | wes-029–060 |
|  | Writing the books | 25 | wes-061–085 |
|  | Publishing and the wait | 20 | wes-086–105 |
| The books | A Game of Thrones | 22 | wes-106–127 |
|  | A Clash of Kings and A Storm of Swords | 30 | wes-128–157 |
|  | A Feast for Crows and A Dance with Dragons | 28 | wes-158–185 |
|  | How the books are built | 30 | wes-186–215 |
| The world | Westeros | 30 | wes-216–245 |
|  | Essos and beyond | 26 | wes-246–271 |
|  | The North and the Wall | 22 | wes-272–293 |
|  | Seasons, magic and prophecy | 22 | wes-294–315 |
|  | Maps, measure and reckoning | 15 | wes-316–330 |
| Houses and peoples | The great houses | 30 | wes-331–360 |
|  | Lesser houses and the regions | 22 | wes-361–382 |
|  | Orders, institutions and the faith | 26 | wes-383–408 |
|  | Peoples beyond the Seven Kingdoms | 22 | wes-409–430 |
|  | Smallfolk, war and daily life | 15 | wes-431–445 |
| The history of Westeros | The Dawn Age to the Andals | 20 | wes-446–465 |
|  | Aegon's Conquest and the Targaryen kings | 32 | wes-466–497 |
|  | The Dance of the Dragons | 25 | wes-498–522 |
|  | Blackfyre, Dunk and Egg | 25 | wes-523–547 |
|  | Robert's Rebellion | 23 | wes-548–570 |
| The War of the Five Kings | From the Hand's death to the Green Fork | 24 | wes-571–594 |
|  | The riverlands and the Blackwater | 22 | wes-595–616 |
|  | The Red Wedding and after | 22 | wes-617–638 |
|  | Where the published books leave it | 22 | wes-639–660 |
| Reading the books | The themes | 30 | wes-661–690 |
|  | The arguments | 30 | wes-691–720 |
|  | Violence, sex and what the books are doing | 20 | wes-721–740 |
|  | Fantasy after Martin | 25 | wes-741–765 |
| The screen | Game of Thrones | 40 | wes-766–805 |
|  | Where the show left the books | 25 | wes-806–830 |
|  | The ending and the reaction | 20 | wes-831–850 |
|  | House of the Dragon and after | 22 | wes-851–872 |
|  | Making the show | 18 | wes-873–890 |
| The franchise | Games | 28 | wes-891–918 |
|  | Companion books and the world guides | 20 | wes-919–938 |
|  | Fandom and theory | 27 | wes-939–965 |
|  | The business and the law | 18 | wes-966–983 |
|  | What came after | 17 | wes-984–wes-1000 |

Nine decks, forty-one subdecks, one thousand cards.

---

# The list

## The author and the making

### George R. R. Martin — `wes-martin`

    wes-001  George R. R. Martin
    wes-002  Bayonne, New Jersey
    wes-003  Comics fanzines and Martin's first fandom
    wes-004  Northwestern and the conscientious objection
    wes-005  The chess tournaments and the years of odd jobs
    wes-006  Martin's short fiction
    wes-007  A Song for Lya
    wes-008  Sandkings
    wes-009  The Hugo and the Nebula
    wes-010  Dying of the Light
    wes-011  Fevre Dream
    wes-012  The Armageddon Rag and its failure
    wes-013  Wild Cards
    wes-014  Martin in Hollywood
    wes-015  The Twilight Zone revival
    wes-016  Beauty and the Beast
    wes-017  The unmade pilots
    wes-018  What television taught Martin about scale
    wes-019  Santa Fe
    wes-020  The Jean Cocteau Cinema
    wes-021  Martin's blog
    wes-022  Martin as an editor
    wes-023  Martin's influences among writers
    wes-024  What Martin took from Tolkien
    wes-025  Martin on Tolkien's ending
    wes-026  Martin's method and his reputation for slowness
    wes-027  Martin's other projects since 2011
    wes-028  Martin as a public figure

### The history behind it — `wes-history`

    wes-029  The Wars of the Roses
    wes-030  Lancaster and York
    wes-031  The Battle of Towton
    wes-032  Richard III
    wes-033  The Princes in the Tower
    wes-034  Margaret of Anjou
    wes-035  Warwick the Kingmaker
    wes-036  Henry Tudor and Bosworth
    wes-037  The Hundred Years' War as a source
    wes-038  The Black Dinner
    wes-039  The Massacre of Glencoe
    wes-040  Guest right in medieval custom
    wes-041  Hadrian's Wall as a source
    wes-042  The Antonine Wall
    wes-043  The Roman frontier and what lay beyond it
    wes-044  The Mongol conquests as a source
    wes-045  Steppe nomads and the Dothraki
    wes-046  Byzantium as a source
    wes-047  The Varangian Guard
    wes-048  The sack of Constantinople in 1204
    wes-049  The Crusades and the military orders
    wes-050  The Knights Templar
    wes-051  The medieval church and the Faith of the Seven
    wes-052  Armed religious revival in medieval Europe
    wes-053  The Great Famine of 1315
    wes-054  The Little Ice Age
    wes-055  Medieval siege warfare
    wes-056  Greek fire
    wes-057  The Icelandic sagas as a source
    wes-058  The Norman Conquest as a source
    wes-059  Maurice Druon's The Accursed Kings
    wes-060  Where Martin departs from the history

### Writing the books — `wes-writing`

    wes-061  The false start of 1991
    wes-062  The three-book plan
    wes-063  The five-year gap that was abandoned
    wes-064  The Meereenese knot
    wes-065  Splitting A Feast for Crows
    wes-066  Gardeners and architects
    wes-067  Writing without an outline
    wes-068  Martin's use of viewpoint
    wes-069  Killing a viewpoint character
    wes-070  The outline letter of 1993
    wes-071  What the 1993 outline got wrong
    wes-072  Martin's research habits
    wes-073  Food and the descriptions of feasts
    wes-074  Heraldry and the invention of sigils
    wes-075  Naming in Westeros
    wes-076  The Dunk and Egg novellas as a testing ground
    wes-077  Sample chapters and their status
    wes-078  The Winds of Winter
    wes-079  A Dream of Spring
    wes-080  What Martin has said about the ending
    wes-081  Whether the books will be finished
    wes-082  Collaborators and assistants
    wes-083  Elio García and Linda Antonsson
    wes-084  World-building that never reached a book
    wes-085  A series that outgrew its plan

### Publishing and the wait — `wes-publish`

    wes-086  Bantam Spectra
    wes-087  Voyager and the British editions
    wes-088  The publication of A Game of Thrones in 1996
    wes-089  The first reviews
    wes-090  How the series found its audience
    wes-091  The paperback and the word of mouth
    wes-092  Sales before the show
    wes-093  Sales after the show
    wes-094  The cover art traditions
    wes-095  Translating the series
    wes-096  The audiobooks and Roy Dotrice
    wes-097  The illustrated editions
    wes-098  The collector's market
    wes-099  Where the novellas were first published
    wes-100  The publication of A Dance with Dragons in 2011
    wes-101  The delay and the readers' response
    wes-102  Neil Gaiman on what a reader is owed
    wes-103  What a long wait does to a readership
    wes-104  Publishing a series with no end in sight
    wes-105  The series' place in publishing history

## The books

### A Game of Thrones — `wes-agot`

    wes-106  A Game of Thrones
    wes-107  The prologue beyond the Wall
    wes-108  Winterfell and the direwolf pups
    wes-109  Bran's fall
    wes-110  The death of Jon Arryn
    wes-111  Eddard Stark as Hand
    wes-112  The tourney of the Hand
    wes-113  The quarrel on the kingsroad
    wes-114  Tyrion at the Eyrie
    wes-115  Catelyn's seizing of Tyrion
    wes-116  Daenerys' marriage to Drogo
    wes-117  Viserys and the golden crown
    wes-118  The death of Robert Baratheon
    wes-119  Eddard's arrest
    wes-120  The execution on the steps of Baelor's sept
    wes-121  The King in the North
    wes-122  The birth of the dragons
    wes-123  The first book's ending as a promise
    wes-124  The eight viewpoints of the first book
    wes-125  What the first book establishes
    wes-126  The first book's title
    wes-127  Reading A Game of Thrones after the rest

### A Clash of Kings and A Storm of Swords — `wes-middle`

    wes-128  A Clash of Kings
    wes-129  The red comet
    wes-130  The five kings
    wes-131  Stannis Baratheon
    wes-132  Renly Baratheon
    wes-133  Melisandre and the Lord of Light
    wes-134  The burning of the Seven at Dragonstone
    wes-135  Theon's taking of Winterfell
    wes-136  The Battle of the Blackwater
    wes-137  Wildfire
    wes-138  Tyrion as Hand
    wes-139  Arya at Harrenhal
    wes-140  Jaqen H'ghar
    wes-141  The House of the Undying
    wes-142  Jon among the wildlings
    wes-143  A Storm of Swords
    wes-144  The book usually called the best
    wes-145  Jaime and Brienne on the road
    wes-146  Jaime's hand
    wes-147  The bear and the maiden fair
    wes-148  Catelyn's last chapter
    wes-149  The Purple Wedding
    wes-150  Tyrion's trial
    wes-151  The trial by combat of Oberyn and Gregor
    wes-152  Tywin's death
    wes-153  The Wall attacked from both sides
    wes-154  Stannis at the Wall
    wes-155  Lady Stoneheart
    wes-156  Why the third book ends where it does
    wes-157  The third book as the series' high point

### A Feast for Crows and A Dance with Dragons — `wes-later`

    wes-158  A Feast for Crows
    wes-159  Why the fourth book has half a cast
    wes-160  Cersei as a viewpoint character
    wes-161  The Faith Militant restored
    wes-162  Cersei's walk
    wes-163  Brienne's quest
    wes-164  The kingsmoot
    wes-165  Euron Greyjoy
    wes-166  Dorne and the Sand Snakes
    wes-167  Arya in Braavos
    wes-168  Sam at Oldtown
    wes-169  A Dance with Dragons
    wes-170  Daenerys in Meereen
    wes-171  The Sons of the Harpy
    wes-172  Quentyn Martell
    wes-173  Jon as Lord Commander
    wes-174  Jon's stabbing
    wes-175  Stannis in the north
    wes-176  The pink letter
    wes-177  Reek and Ramsay
    wes-178  Bran beyond the Wall
    wes-179  The three-eyed crow
    wes-180  Young Griff
    wes-181  The Golden Company
    wes-182  Tyrion's road east
    wes-183  The epilogue of A Dance with Dragons
    wes-184  The cliffhangers the series stands on
    wes-185  Reading books four and five together

### How the books are built — `wes-craft`

    wes-186  The rotating point of view
    wes-187  Third-person limited and what it hides
    wes-188  The prologue and epilogue convention
    wes-189  Chapter titles as characterisation
    wes-190  Unreliable narration in the books
    wes-191  The reader knowing more than the characters
    wes-192  Dramatic irony as the engine
    wes-193  Foreshadowing as structure
    wes-194  The appendices and the house lists
    wes-195  The maps in the books
    wes-196  Interior monologue and the repeated phrase
    wes-197  Sensory detail and the food
    wes-198  Sex and the viewpoint it is written from
    wes-199  Violence written from inside
    wes-200  Humour in the books
    wes-201  Dialogue and the words of the houses
    wes-202  Verse and song in the books
    wes-203  The Rains of Castamere
    wes-204  Names as a system
    wes-205  The problem of a cast this size
    wes-206  Time and the collapsing timeline
    wes-207  The ageing of the child characters
    wes-208  Geography and travel times
    wes-209  Chapters as episodes
    wes-210  The withheld death
    wes-211  Resurrection and what it costs
    wes-212  The books' length and its causes
    wes-213  Martin's prose style
    wes-214  What the books owe to television
    wes-215  What the books do that television cannot

## The world

### Westeros — `wes-westeros`

    wes-216  Westeros
    wes-217  The Seven Kingdoms
    wes-218  King's Landing
    wes-219  The Red Keep
    wes-220  The Iron Throne
    wes-221  The Great Sept of Baelor
    wes-222  Flea Bottom
    wes-223  The crownlands
    wes-224  Dragonstone
    wes-225  The North
    wes-226  Winterfell
    wes-227  The riverlands
    wes-228  Riverrun
    wes-229  Harrenhal
    wes-230  The Vale of Arryn
    wes-231  The Eyrie
    wes-232  The westerlands
    wes-233  Casterly Rock
    wes-234  Lannisport
    wes-235  The Reach
    wes-236  Highgarden
    wes-237  Oldtown
    wes-238  The stormlands
    wes-239  Storm's End
    wes-240  Dorne
    wes-241  Sunspear
    wes-242  The Iron Islands
    wes-243  Pyke
    wes-244  The kingsroad and the roads of Westeros
    wes-245  The climate and farming of Westeros

### Essos and beyond — `wes-essos`

    wes-246  Essos
    wes-247  The Free Cities
    wes-248  Braavos
    wes-249  The Iron Bank
    wes-250  The Titan of Braavos
    wes-251  Pentos
    wes-252  Volantis
    wes-253  Lys, Myr and Tyrosh
    wes-254  Norvos, Qohor and Lorath
    wes-255  Valyria
    wes-256  The Doom of Valyria
    wes-257  Valyrian steel
    wes-258  The Valyrian roads
    wes-259  Slaver's Bay
    wes-260  Astapor
    wes-261  Yunkai
    wes-262  Meereen
    wes-263  The Unsullied
    wes-264  The Dothraki sea
    wes-265  Vaes Dothrak
    wes-266  Qarth
    wes-267  The Summer Isles
    wes-268  Sothoryos
    wes-269  Yi Ti and the far east
    wes-270  Asshai and the Shadow
    wes-271  What the books do not show of the world

### The North and the Wall — `wes-wall`

    wes-272  The Wall
    wes-273  The building of the Wall
    wes-274  Castle Black
    wes-275  The abandoned castles of the Wall
    wes-276  The Night's Watch
    wes-277  The vows of the Night's Watch
    wes-278  The Lord Commander
    wes-279  Rangers, builders and stewards
    wes-280  The Gift
    wes-281  The haunted forest
    wes-282  The free folk
    wes-283  Mance Rayder
    wes-284  Hardhome
    wes-285  The Others
    wes-286  Wights
    wes-287  Dragonglass
    wes-288  The Long Night
    wes-289  The Night's King
    wes-290  The Children of the Forest
    wes-291  The Horn of Joramun
    wes-292  Craster and his keep
    wes-293  What is actually known about the Others

### Seasons, magic and prophecy — `wes-magic`

    wes-294  The seasons of Westeros
    wes-295  Why the seasons are irregular
    wes-296  Magic in the books and its scarcity
    wes-297  The return of magic with the dragons
    wes-298  Warging and skinchanging
    wes-299  Greensight
    wes-300  Weirwoods
    wes-301  The old gods
    wes-302  Prophecy in the books
    wes-303  Azor Ahai
    wes-304  The prince that was promised
    wes-305  The valonqar
    wes-306  Maggy the Frog
    wes-307  Glass candles
    wes-308  The Faceless Men
    wes-309  Shadowbinding
    wes-310  Resurrection and R'hllor
    wes-311  Beric Dondarrion
    wes-312  The House of Black and White
    wes-313  The pyromancers and their substance
    wes-314  Dragons as creatures
    wes-315  Whether magic has rules in these books

### Maps, measure and reckoning — `wes-maps`

    wes-316  The maps of Westeros
    wes-317  The map at the front of the book
    wes-318  The scale of Westeros
    wes-319  Distances and travel times
    wes-320  The calendar and the reckoning of years
    wes-321  After the Conquest as a dating system
    wes-322  Name-days and ages
    wes-323  Measures, coins and currency
    wes-324  The dragon, the stag and the penny
    wes-325  Ravens and the maesters' link
    wes-326  Ships and sea travel
    wes-327  Population and the size of armies
    wes-328  Whether Westeros's geography works
    wes-329  What the seasons do to a calendar
    wes-330  What a map of an invented world asserts

## Houses and peoples

### The great houses — `wes-great`

    wes-331  The great houses of Westeros
    wes-332  House Stark
    wes-333  The Stark words
    wes-334  Eddard Stark
    wes-335  Catelyn Stark
    wes-336  Robb Stark
    wes-337  Sansa Stark
    wes-338  Arya Stark
    wes-339  Bran Stark
    wes-340  Jon Snow
    wes-341  House Lannister
    wes-342  Tywin Lannister
    wes-343  Cersei Lannister
    wes-344  Jaime Lannister
    wes-345  Tyrion Lannister
    wes-346  House Baratheon
    wes-347  Robert Baratheon
    wes-348  House Targaryen
    wes-349  Daenerys Targaryen
    wes-350  House Tyrell
    wes-351  Olenna Tyrell
    wes-352  House Martell
    wes-353  Oberyn Martell
    wes-354  House Greyjoy
    wes-355  Theon Greyjoy
    wes-356  House Arryn
    wes-357  House Tully
    wes-358  Sigils and words as characterisation
    wes-359  Bastards and their surnames
    wes-360  Marriage, inheritance and succession

### Lesser houses and the regions — `wes-lesser`

    wes-361  House Bolton
    wes-362  House Frey
    wes-363  House Mormont
    wes-364  House Karstark
    wes-365  House Umber
    wes-366  House Reed
    wes-367  House Manderly
    wes-368  House Clegane
    wes-369  Sandor Clegane
    wes-370  Petyr Baelish
    wes-371  Varys
    wes-372  House Tarly
    wes-373  House Hightower
    wes-374  House Redwyne
    wes-375  House Dayne
    wes-376  House Blackwood and House Bracken
    wes-377  Davos Seaworth
    wes-378  Hedge knights and landed knights
    wes-379  The bannerman system
    wes-380  How a house rises
    wes-381  How a house is destroyed
    wes-382  The regional character of Westeros

### Orders, institutions and the faith — `wes-orders`

    wes-383  The Faith of the Seven
    wes-384  The seven aspects
    wes-385  The High Septon
    wes-386  The Faith Militant
    wes-387  Septons and septas
    wes-388  The silent sisters
    wes-389  The godswood
    wes-390  R'hllor and the red priests
    wes-391  The Drowned God
    wes-392  The Many-Faced God
    wes-393  The gods of Essos
    wes-394  The Citadel
    wes-395  The maesters
    wes-396  The maester's chain
    wes-397  Archmaesters and the higher mysteries
    wes-398  The Kingsguard
    wes-399  The white cloaks and their vows
    wes-400  The small council
    wes-401  The Hand of the King
    wes-402  Master of coin, ships and whisperers
    wes-403  The City Watch
    wes-404  The Iron Bank as an institution
    wes-405  Sellswords and the free companies
    wes-406  The Golden Company as an institution
    wes-407  Mummers, singers and the travelling trades
    wes-408  Who holds knowledge in Westeros

### Peoples beyond the Seven Kingdoms — `wes-beyond`

    wes-409  Wildling custom
    wes-410  Marriage by capture
    wes-411  The giants
    wes-412  The Thenns
    wes-413  The Dothraki
    wes-414  The khalasar
    wes-415  The dosh khaleen
    wes-416  How the Unsullied are made
    wes-417  Slavery in Essos
    wes-418  The Good Masters, Wise Masters and Great Masters
    wes-419  Old Ghis and the Ghiscari
    wes-420  The founding of Braavos
    wes-421  The Summer Islanders
    wes-422  The Ibbenese
    wes-423  The Jogos Nhai
    wes-424  The Rhoynar
    wes-425  Nymeria and the ten thousand ships
    wes-426  The Andals
    wes-427  The First Men
    wes-428  The Children of the Forest as a people
    wes-429  What became of the older peoples
    wes-430  The books' treatment of slavery

### Smallfolk, war and daily life — `wes-smallfolk`

    wes-431  The smallfolk
    wes-432  Peasant life in Westeros
    wes-433  What a war does to the countryside
    wes-434  The Brotherhood Without Banners
    wes-435  The sparrows
    wes-436  Famine and the coming winter
    wes-437  Inns, roads and travel
    wes-438  Towns and markets
    wes-439  Trade and what Westeros makes
    wes-440  The cities' underside
    wes-441  Medicine, the maester and the midwife
    wes-442  Children and childhood in Westeros
    wes-443  Women's lives outside the great houses
    wes-444  Law, justice and the king's peace
    wes-445  What the books say about ordinary people

## The history of Westeros

### The Dawn Age to the Andals — `wes-dawn`

    wes-446  The Dawn Age
    wes-447  The First Men and the coming of bronze
    wes-448  The Pact and the Isle of Faces
    wes-449  The Long Night in legend
    wes-450  The Age of Heroes
    wes-451  Bran the Builder
    wes-452  The founding of the Night's Watch
    wes-453  The Andal invasion
    wes-454  The Andals and the Faith
    wes-455  The Rhoynar come to Dorne
    wes-456  Garth Greenhand and the legends of the Reach
    wes-457  The Grey King and the ironborn legends
    wes-458  The Kings of Winter
    wes-459  The Storm Kings
    wes-460  The Kings of the Rock
    wes-461  The Gardener kings
    wes-462  The Hoares and the raising of Harrenhal
    wes-463  The Freehold of Valyria
    wes-464  Legend against history in Westeros
    wes-465  How the maesters wrote the past

### Aegon's Conquest and the Targaryen kings — `wes-conquest`

    wes-466  Aegon's Conquest
    wes-467  Aegon I Targaryen
    wes-468  Visenya and Rhaenys
    wes-469  Balerion, Vhagar and Meraxes
    wes-470  The Field of Fire
    wes-471  The burning of Harrenhal
    wes-472  The submission of the North
    wes-473  Dorne's resistance
    wes-474  The forging of the Iron Throne
    wes-475  The founding of King's Landing
    wes-476  The Targaryen dynasty
    wes-477  Aenys I
    wes-478  Maegor the Cruel
    wes-479  The Faith Militant uprising
    wes-480  Jaehaerys I the Conciliator
    wes-481  Good Queen Alysanne
    wes-482  The Great Council of 101
    wes-483  Viserys I
    wes-484  Aegon III the Dragonbane
    wes-485  The death of the last dragons
    wes-486  Daeron I and the conquest of Dorne
    wes-487  Baelor the Blessed
    wes-488  Aegon IV the Unworthy
    wes-489  Daeron II and the union with Dorne
    wes-490  Aerys I and the Great Spring Sickness
    wes-491  Maekar I
    wes-492  Aegon V the Unlikely
    wes-493  Summerhall
    wes-494  Jaehaerys II
    wes-495  Aerys II the Mad King
    wes-496  The wildfire plot
    wes-497  What the Targaryens were and why they fell

### The Dance of the Dragons — `wes-dance`

    wes-498  The Dance of the Dragons
    wes-499  Fire & Blood as a source
    wes-500  Why Fire & Blood is unreliable
    wes-501  Archmaester Gyldayn
    wes-502  Mushroom, Septon Eustace and Grand Maester Munkun
    wes-503  The succession dispute of 129
    wes-504  The greens and the blacks
    wes-505  Alicent Hightower
    wes-506  Otto Hightower
    wes-507  Rhaenyra Targaryen
    wes-508  Daemon Targaryen
    wes-509  Corlys Velaryon
    wes-510  Rhaenys, the Queen Who Never Was
    wes-511  Laenor and Laena Velaryon
    wes-512  The Driftmark succession
    wes-513  The death of Lucerys
    wes-514  Blood and Cheese
    wes-515  The Battle of Rook's Rest
    wes-516  The Butcher's Ball
    wes-517  The dragonseeds and the sowing
    wes-518  The storming of the Dragonpit
    wes-519  The fall of King's Landing
    wes-520  The death of Rhaenyra
    wes-521  The Hour of the Wolf
    wes-522  What the Dance cost the Targaryens

### Blackfyre, Dunk and Egg — `wes-blackfyre`

    wes-523  The Blackfyre Rebellions
    wes-524  Daemon Blackfyre
    wes-525  The Battle of the Redgrass Field
    wes-526  Bloodraven
    wes-527  Bittersteel
    wes-528  The Great Bastards
    wes-529  The later Blackfyre rebellions
    wes-530  The War of the Ninepenny Kings
    wes-531  The Tales of Dunk and Egg
    wes-532  The Hedge Knight
    wes-533  The Sworn Sword
    wes-534  The Mystery Knight
    wes-535  Ser Duncan the Tall
    wes-536  Egg and the making of a king
    wes-537  The Ashford tourney
    wes-538  Trial of seven
    wes-539  What the novellas do that the novels cannot
    wes-540  The Defiance of Duskendale
    wes-541  The tourney at Harrenhal of 281
    wes-542  Rhaegar Targaryen
    wes-543  Lyanna Stark
    wes-544  Elia Martell
    wes-545  The last years of Aerys II
    wes-546  A Knight of the Seven Kingdoms as a book
    wes-547  A century told from the edges

### Robert's Rebellion — `wes-rebellion`

    wes-548  Robert's Rebellion
    wes-549  The abduction question
    wes-550  The deaths of Rickard and Brandon Stark
    wes-551  Jon Arryn's refusal
    wes-552  The Battle of the Bells
    wes-553  The Battle of the Trident
    wes-554  The Sack of King's Landing
    wes-555  The murder of Elia and her children
    wes-556  Jaime and the Mad King
    wes-557  The siege of Storm's End
    wes-558  The Tower of Joy
    wes-559  Ned's promise
    wes-560  Robert's crowning
    wes-561  The Greyjoy Rebellion
    wes-562  The years of Robert's reign
    wes-563  Robert's marriage to Cersei
    wes-564  The Targaryen exiles
    wes-565  Viserys and Daenerys in the Free Cities
    wes-566  Illyrio Mopatis
    wes-567  What the histories of the rebellion disagree about
    wes-568  R+L=J as a question the books pose
    wes-569  How the past is told in the present
    wes-570  The rebellion as the series' hidden first act

## The War of the Five Kings

### From the Hand's death to the Green Fork — `wes-war1`

    wes-571  The War of the Five Kings
    wes-572  What Jon Arryn found out
    wes-573  The attempt on Bran's life
    wes-574  The catspaw dagger
    wes-575  Ned's investigation
    wes-576  Cersei's children
    wes-577  The flight that did not happen
    wes-578  Robert's boar hunt
    wes-579  The struggle for the throne after Robert
    wes-580  Joffrey's accession
    wes-581  What Ned's execution set off
    wes-582  The riverlands invaded
    wes-583  Robb's march south
    wes-584  Walder Frey's price
    wes-585  The Whispering Wood
    wes-586  The Battle of the Camps
    wes-587  The capture of Jaime
    wes-588  The North declares
    wes-589  Renly's claim
    wes-590  Stannis's claim
    wes-591  The Baratheon quarrel
    wes-592  Renly's death
    wes-593  The shadow
    wes-594  What each of the five kings wanted

### The riverlands and the Blackwater — `wes-war2`

    wes-595  Tyrion's arrival in King's Landing
    wes-596  The city's defences
    wes-597  The chain across the Blackwater
    wes-598  The Blackwater as a battle
    wes-599  Tywin and the Tyrells arrive
    wes-600  The aftermath and Tyrion's fall
    wes-601  Theon turns his cloak
    wes-602  The sack of Winterfell
    wes-603  The burning of Winterfell
    wes-604  Robb's marriage
    wes-605  Why Robb's marriage lost the war
    wes-606  The Karstark execution
    wes-607  The riverlands laid waste
    wes-608  The Mountain's raiders
    wes-609  Harrenhal under the Bloody Mummers
    wes-610  Arya's road
    wes-611  The Brotherhood in the war
    wes-612  Beric and the Hound
    wes-613  Jaime's captivity and release
    wes-614  Brienne's oath
    wes-615  The war's cost to the smallfolk
    wes-616  Why the war could not be won

### The Red Wedding and after — `wes-war3`

    wes-617  The Red Wedding
    wes-618  Guest right and its breaking
    wes-619  Roose Bolton's part
    wes-620  Walder Frey's part
    wes-621  Tywin's part
    wes-622  The Rains of Castamere as a signal
    wes-623  The end of the northern cause
    wes-624  The North occupied
    wes-625  The Boltons at Winterfell
    wes-626  The false Arya
    wes-627  Joffrey's wedding and death
    wes-628  Who killed Joffrey
    wes-629  Sansa's escape
    wes-630  Littlefinger and the Vale
    wes-631  Lysa Arryn's death
    wes-632  Tyrion's trial and Shae
    wes-633  Oberyn's duel
    wes-634  Tyrion's escape and Tywin's death
    wes-635  Cersei as regent
    wes-636  The crown's debt
    wes-637  The Faith rearmed
    wes-638  Where the realm stands after the war

### Where the published books leave it — `wes-war4`

    wes-639  Where the published books leave the story
    wes-640  The threads left open
    wes-641  Jon's stabbing and what follows
    wes-642  Stannis before Winterfell
    wes-643  Daenerys on the Dothraki sea
    wes-644  Meereen besieged
    wes-645  The ironborn in Slaver's Bay
    wes-646  Aegon's landing
    wes-647  The Golden Company in Westeros
    wes-648  The trial Cersei still faces
    wes-649  Arya's training
    wes-650  Bran under the tree
    wes-651  Sansa in the Vale
    wes-652  Brienne and Lady Stoneheart
    wes-653  Sam at the Citadel
    wes-654  The Others' advance
    wes-655  The Winds of Winter sample chapters
    wes-656  The Battle of Ice
    wes-657  The Battle of Fire
    wes-658  What the show's ending suggests about the books
    wes-659  Why the two endings need not match
    wes-660  Reading an unfinished series

## Reading the books

### The themes — `wes-themes`

    wes-661  Power and who holds it
    wes-662  Legitimacy and the right to rule
    wes-663  The cost of honour
    wes-664  Ned Stark as a lesson about honour
    wes-665  Duty against love
    wes-666  Oaths and their breaking
    wes-667  Family and the claims of blood
    wes-668  Identity and the assumed name
    wes-669  Disability in the books
    wes-670  Tyrion and how the world treats him
    wes-671  Bran and what he becomes
    wes-672  Children and what is done to them
    wes-673  Women and power in a world that denies it
    wes-674  Cersei's reading of her own life
    wes-675  Brienne and what a knight is
    wes-676  Arya and the refusal of a role
    wes-677  Sansa and the education of a courtier
    wes-678  Daenerys as liberator and as conqueror
    wes-679  Who abolishes slavery and at what cost
    wes-680  War and its logistics
    wes-681  Winter as an approaching fact
    wes-682  Climate, food and politics
    wes-683  Religion and whether the gods are real
    wes-684  Prophecy and free will
    wes-685  Death and its finality, or not
    wes-686  Mercy and what it costs
    wes-687  The good ruler problem
    wes-688  Institutions and why they fail
    wes-689  Debt, taxes and the unglamorous parts of power
    wes-690  What the series argues about the Middle Ages

### The arguments — `wes-arguments`

    wes-691  The realism claim
    wes-692  Grimdark as a label
    wes-693  Whether the books are cynical
    wes-694  The charge of nihilism
    wes-695  Martin's answer to the good-king fantasy
    wes-696  Historical accuracy as a defence
    wes-697  Whether medieval Europe was like this
    wes-698  Medievalists on the series
    wes-699  Race and the peoples of Essos
    wes-700  The white saviour argument
    wes-701  Orientalism and the Dothraki
    wes-702  The books' treatment of rape
    wes-703  Consent and the Daenerys and Drogo wedding
    wes-704  How the show changed that scene
    wes-705  Women readers and the series
    wes-706  Feminist readings
    wes-707  Queer readings
    wes-708  Disability studies and Tyrion
    wes-709  The argument about length
    wes-710  The argument about an unfinished series
    wes-711  What an author owes an audience
    wes-712  Is fantasy improved by cruelty?
    wes-713  The series read against Tolkien
    wes-714  Martin on Aragorn's tax policy
    wes-715  Whether that comparison is fair to either
    wes-716  Adaptation and the death of the author
    wes-717  The academic literature on the series
    wes-718  Teaching the series
    wes-719  What the critics got wrong early
    wes-720  How to argue about a series like this

### Violence, sex and what the books are doing — `wes-violence`

    wes-721  Violence in the books and what it is for
    wes-722  Writing violence from inside the victim
    wes-723  The Red Wedding as a formal device
    wes-724  Torture and Theon's chapters
    wes-725  Ramsay Bolton and the problem of a sadist
    wes-726  Sexual violence in the books
    wes-727  Sexual violence in the show
    wes-728  The show's added assaults and the criticism
    wes-729  Nudity, exposition and HBO
    wes-730  The critical response to the show's sex scenes
    wes-731  What the actors have said since
    wes-732  Intimacy coordination and how television changed
    wes-733  Child characters and adult content
    wes-734  Ageing up the cast
    wes-735  Cruelty as a narrative economy
    wes-736  Desensitisation and the reader
    wes-737  Where the series draws a line
    wes-738  What the books decline to show
    wes-739  Depicting against endorsing
    wes-740  Reading difficult material critically

### Fantasy after Martin — `wes-genre`

    wes-741  Epic fantasy before A Game of Thrones
    wes-742  The epic fantasy formula of the 1980s
    wes-743  What Martin changed
    wes-744  Grimdark as a movement
    wes-745  Joe Abercrombie
    wes-746  Scott Lynch
    wes-747  Mark Lawrence and the grimdark argument
    wes-748  The reaction against grimdark
    wes-749  N. K. Jemisin
    wes-750  Robin Hobb
    wes-751  Steven Erikson
    wes-752  Guy Gavriel Kay and historical fantasy
    wes-753  The political fantasy novel
    wes-754  Fantasy and the prestige-television era
    wes-755  Adaptation as the genre's new goal
    wes-756  The doorstopper and the series contract
    wes-757  Fantasy maps after Westeros
    wes-758  Fantasy publishing since 2011
    wes-759  Genre prizes and the series
    wes-760  The series at the Hugos
    wes-761  Fantasy's mainstream respectability
    wes-762  Whether Martin founded a school
    wes-763  Writers who reject the comparison
    wes-764  Fantasy after the show's ending
    wes-765  What the series did to the genre

## The screen

### Game of Thrones — `wes-got`

    wes-766  Game of Thrones
    wes-767  David Benioff and D. B. Weiss
    wes-768  The 2007 pitch to HBO
    wes-769  The unaired pilot
    wes-770  Recasting and reshooting
    wes-771  HBO and the prestige-drama model
    wes-772  Season one
    wes-773  Season two
    wes-774  Season three
    wes-775  Season four
    wes-776  Season five
    wes-777  Season six
    wes-778  Season seven
    wes-779  Season eight
    wes-780  The title sequence
    wes-781  Ramin Djawadi's score
    wes-782  The Rains of Castamere on screen
    wes-783  Casting Peter Dinklage
    wes-784  Casting the child actors
    wes-785  Sean Bean and the first season's marketing
    wes-786  Emilia Clarke's Daenerys
    wes-787  Lena Headey's Cersei
    wes-788  Maisie Williams and Sophie Turner
    wes-789  Kit Harington's Jon Snow
    wes-790  The ensemble and what a large cast costs
    wes-791  Filming in Northern Ireland
    wes-792  Filming in Croatia, Iceland, Spain and Malta
    wes-793  The Blackwater on screen
    wes-794  The Purple Wedding on screen
    wes-795  The Red Wedding on screen
    wes-796  Hardhome on screen
    wes-797  The Battle of the Bastards
    wes-798  The Long Night episode and its lighting
    wes-799  Dragons on screen
    wes-800  Direwolves on screen
    wes-801  The show's Emmys
    wes-802  Piracy and the show's audience
    wes-803  Weekly release and watercooler television
    wes-804  The show's global reach
    wes-805  What the show was at its height

### Where the show left the books — `wes-diverge`

    wes-806  Where the show left the books
    wes-807  Five books into six seasons
    wes-808  Characters the show cut
    wes-809  Lady Stoneheart on screen
    wes-810  Young Griff and the Golden Company on screen
    wes-811  The Dorne plot
    wes-812  The ironborn plot
    wes-813  Combining characters
    wes-814  Compressing journeys and travel time
    wes-815  The show's Stannis
    wes-816  The show's Sansa at Winterfell
    wes-817  The show's Tyrion after season four
    wes-818  The show's Daenerys
    wes-819  Running out of book
    wes-820  What Martin told the showrunners
    wes-821  The conversations about the ending
    wes-822  Book readers against show watchers
    wes-823  Spoilers and the reversal of who knows what
    wes-824  The show as an interpretation
    wes-825  Where the show improved on the books
    wes-826  Where the show simplified
    wes-827  Whether the show hurt the books
    wes-828  Whether the show is the version remembered
    wes-829  Adapting a source that is unfinished
    wes-830  The show's effect on Martin's writing

### The ending and the reaction — `wes-ending`

    wes-831  What season eight had to do
    wes-832  The pacing of the last two seasons
    wes-833  The Long Night's resolution
    wes-834  Daenerys' turn
    wes-835  The burning of King's Landing
    wes-836  Whether the turn was set up
    wes-837  Bran as king
    wes-838  The last council
    wes-839  Jon's ending
    wes-840  The petition and the fan reaction
    wes-841  Review scores and the collapse
    wes-842  The coffee cup and the water bottle
    wes-843  What the cast said afterwards
    wes-844  What the showrunners said afterwards
    wes-845  Whether an ending can ruin a series
    wes-846  The cultural memory of the ending
    wes-847  How quickly the conversation stopped
    wes-848  What the ending did to the franchise's value
    wes-849  What Martin has said about it
    wes-850  Whether the books will answer it

### House of the Dragon and after — `wes-hotd`

    wes-851  House of the Dragon
    wes-852  Adapting Fire & Blood
    wes-853  Adapting an unreliable history
    wes-854  House of the Dragon season one
    wes-855  House of the Dragon season two
    wes-856  The time jumps and the recasting
    wes-857  The show's Rhaenyra
    wes-858  The show's Alicent
    wes-859  The show's Daemon
    wes-860  The dragons of House of the Dragon
    wes-861  How it differs from Fire & Blood
    wes-862  The reception of House of the Dragon
    wes-863  A Knight of the Seven Kingdoms on screen
    wes-864  The Dunk and Egg adaptation
    wes-865  The cancelled spin-offs
    wes-866  The abandoned Long Night pilot
    wes-867  Aegon's Conquest as a project
    wes-868  Animated projects
    wes-869  The franchise strategy after 2019
    wes-870  HBO, Max and the streaming era
    wes-871  What a prequel can and cannot do
    wes-872  Where the screen franchise goes next

### Making the show — `wes-making`

    wes-873  Making Game of Thrones
    wes-874  The writers and the scripts
    wes-875  Directing an ensemble series
    wes-876  Miguel Sapochnik and the battle episodes
    wes-877  The stunt and horse teams
    wes-878  Michele Clapton and the costumes
    wes-879  Armour, heraldry and the props
    wes-880  The visual effects houses
    wes-881  Creating the dragons
    wes-882  Digital crowds and battles
    wes-883  Location shooting at scale
    wes-884  The Belfast studios
    wes-885  Budgets by season
    wes-886  The economics of an HBO drama
    wes-887  The behind-the-scenes documentaries
    wes-888  What the production books record
    wes-889  The tourism the show created
    wes-890  What the show did for Northern Ireland

## The franchise

### Games — `wes-games`

    wes-891  Games set in Westeros
    wes-892  A Game of Thrones: The Board Game
    wes-893  Battles of Westeros
    wes-894  A Game of Thrones: The Card Game
    wes-895  The living card game model
    wes-896  A Game of Thrones: Catan
    wes-897  Licensed reskins and what they borrow
    wes-898  A Song of Ice and Fire: Tabletop Miniatures Game
    wes-899  A Game of Thrones Roleplaying Game
    wes-900  The Chronicle System
    wes-901  Green Ronin and the roleplaying licence
    wes-902  Game of Thrones: Genesis
    wes-903  The 2012 Game of Thrones role-playing video game
    wes-904  Telltale's Game of Thrones
    wes-905  Episodic storytelling and the Telltale model
    wes-906  Game of Thrones: Conquest
    wes-907  Mobile games and the licence
    wes-908  Game of Thrones: Winter is Coming
    wes-909  Elden Ring
    wes-910  What Martin wrote for Elden Ring
    wes-911  Crusader Kings and the fan mods
    wes-912  A Clash of Kings for Mount & Blade
    wes-913  Fan-made games and the licence
    wes-914  WesterosCraft
    wes-915  Building a world in Minecraft
    wes-916  Why the franchise's games disappoint
    wes-917  What a game of this world would need
    wes-918  The games that never shipped

### Companion books and the world guides — `wes-companion`

    wes-919  The World of Ice & Fire
    wes-920  Writing a history book for an invented world
    wes-921  Fire & Blood
    wes-922  The Rise of the Dragon
    wes-923  The Lands of Ice and Fire
    wes-924  The official maps and their status
    wes-925  The Art of A Song of Ice and Fire
    wes-926  The graphic novel adaptation
    wes-927  A Feast of Ice and Fire
    wes-928  Inside HBO's Game of Thrones
    wes-929  The Wit and Wisdom of Tyrion Lannister
    wes-930  Coffee-table books and the franchise's shelf
    wes-931  The concordance problem
    wes-932  A Wiki of Ice and Fire
    wes-933  Westeros.org
    wes-934  So Spake Martin
    wes-935  Martin's answers as a source
    wes-936  What counts as canon in this franchise
    wes-937  The tiers of canon readers argue about
    wes-938  Why the companion books complicate the canon

### Fandom and theory — `wes-fandom`

    wes-939  The fandom before the show
    wes-940  The early forums
    wes-941  The fandom after 2011
    wes-942  Reddit and the theory culture
    wes-943  R+L=J
    wes-944  How R+L=J was assembled
    wes-945  The show's confirmation of a fan theory
    wes-946  The Grand Northern Conspiracy
    wes-947  Tinfoil and the limits of theory
    wes-948  Reading for clues
    wes-949  Close reading as a fan practice
    wes-950  Rereading projects
    wes-951  The podcasts
    wes-952  A Podcast of Ice and Fire
    wes-953  The video essay boom
    wes-954  Heterodox readings and their following
    wes-955  Fan art and the visual canon
    wes-956  Cosplay and conventions
    wes-957  Fan fiction
    wes-958  The fandom's relationship with Martin
    wes-959  Entitlement and the demand for the next book
    wes-960  Harassment and the worst of the fandom
    wes-961  The fandom after the ending
    wes-962  What happened to the audience
    wes-963  Why fan wikis are not sources
    wes-964  Tourism and the pilgrimage sites
    wes-965  What the fandom built that the books did not

### The business and the law — `wes-business`

    wes-966  The franchise as a business
    wes-967  The 2007 HBO option
    wes-968  Martin's deal and what he retained
    wes-969  Merchandising and the licence
    wes-970  What the franchise was worth at its peak
    wes-971  What it was worth after 2019
    wes-972  HBO's dependence on the show
    wes-973  The spin-off strategy
    wes-974  Book sales driven by television
    wes-975  Translation rights and global publishing
    wes-976  Trademark and the franchise's marks
    wes-977  Copyright and fan works
    wes-978  The 2020 fan-fiction dispute
    wes-979  Martin's position on fan fiction
    wes-980  Piracy and the show
    wes-981  Tourism revenue in Northern Ireland and Croatia
    wes-982  What the franchise is worth now
    wes-983  When the books enter the public domain

### What came after — `wes-legacy`

    wes-984  The series' place in twenty-first-century culture
    wes-985  Winter is coming as a phrase
    wes-986  The Red Wedding as a reference point
    wes-987  The series used as political metaphor
    wes-988  Commentators and the Westeros comparison
    wes-989  The show and the streaming wars
    wes-990  Television budgets after Game of Thrones
    wes-991  The fantasy adaptation boom
    wes-992  The Wheel of Time and The Witcher
    wes-993  The Rings of Power and the comparison
    wes-994  Whether the ending changed the legacy
    wes-995  The unfinished series as a cultural fact
    wes-996  What happens if the books are never finished
    wes-997  Posthumous completion and its precedents
    wes-998  How the series will be read in fifty years
    wes-999  What the series is about
    wes-1000  Reading A Song of Ice and Fire now
