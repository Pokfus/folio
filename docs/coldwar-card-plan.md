# The Cold War — a 1000-card running order

The plan for `coldwar`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the twenty-ninth of these and the fifteenth history collection. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical
and are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `cw-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='cw-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them.

The padding above is right for every id but the last: the ids are `cw-001` … `cw-999`, then `cw-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `cw-469 Who decided on the invasion` is a question the archives answered only after 1991, and
the card's actual answer — the word that gets blanked — is chosen while writing it, from what the
sources will support.

Where the research says the line is wrong, **change the line here in the same commit as the card**,
and say so. Never invent a date, a name, a figure or a document.

---

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and a new `ICON_SYMBOLS` mark all ship with the file.

**The id is `coldwar` and the card prefix is `cw-`.** Neither is a prefix of anything on the shelf and
nothing on the shelf is a prefix of either. The deck ids are also `cw-…`.

**IT NEEDS NO `COLLECTION_SECTION` ROW AND THAT IS THE POINT.** `sectionOf` returns History for
anything the table does not name, so the correct action for a history collection is to add nothing.
A row reading `coldwar: "History"` would be inert and would invite the next reader to take that table
for a list of every collection — which is exactly what the France plan says, and this is the second
collection to which it applies.

### The hue: `#4C5064`, a cold concrete grey — and the numbers are the worst yet accepted

**The apt families were swept in CIELAB against the 35 hues now on the shelf.** The shelf's median
nearest-neighbour distance is **20.1**, its tightest existing pair is **12.9**, and its density — hues
within ΔE 30 — runs a median of 6 and a maximum of 9.

**THE EDITORIAL CONSTRAINT CAME FIRST HERE, WHICH IS UNUSUAL: THE COLOUR MAY NOT BE EITHER SIDE'S.**
This collection's central scope decision is that the Cold War was not a duel between two governments
but a global system, and that most of the people who died in it were not American or Russian. A
banner in Soviet red or in American navy would contradict that in a swatch, before a reader had read
a word — and both are on the shelf already in any case (Russia's lacquer, the United States' navy).
**So the sweep was run over everything EXCEPT red and blue**, and the family that survives is the one
a reader would name anyway: the grey of concrete, of the Wall, of the bunker and the missile silo and
the housing block that both blocs built.

**AND THE NUMBERS ARE BAD AND ARE STATED IN FULL.** `#4C5064` stands **19.2** from its nearest
neighbour, which is **below the shelf's median of 20.1**, with **density 9 — equal to the highest on
the shelf**, the worst either figure has been for a new collection. Its neighbours are Psychology's
plum at 19, the United States' navy at 19, the Second World War's dark iron at 20, Greece's Aegean at
20, France's slate at 21 and Philosophy's petrol at 21. L 34, chroma 13, **7.96:1 against white**,
which is the one figure in its favour: it sits in the middle of the shelf's 3.7–10.4 band where the
last three collections all landed on the floor.

**IT IS A FOURTH GREY AND THE FOUR ARE GENUINELY FOUR COLOURS**, which is the argument that has to
carry it: the Second World War's iron is a dark warm brown-grey at L 27, this is a cool blue-grey at
L 34, the First World War's field grey is an olive at L 45, and France's slate is a blue-green at L 51.
Rendered as banners and as their 20% washes side by side, no two are confusable — the spread is in
lightness and in hue at once. **Look at that comparison again before moving it.**

**WHAT SCORES BETTER MEANS NOTHING HERE.** The best figure on the whole wheel outside the two banded
regions is a bright periwinkle at 20.6 and a light purple at 18.8 with a remarkable density of 2;
neither says anything about this subject, and a Cold War banner in lavender would be worse than a
crowded grey. **The magenta topped the unconstrained sweep for the eleventh time and the olive-brass
was not re-measured**, both on the standing notes in `COLL_THEME`. Do not run either sweep again.

**IF IT EVER NEEDS MOVING**, the alternative measured here is `#4A3C52` at **19.3 with density 8** —
marginally better on both figures — and it was refused because rendered at banner size it reads
plum rather than concrete, and sits 19 from Psychology's plum for that reason. **Check the swatch, not
the number.**

### The icon: the radiation trefoil

**`trefoil`, three wedges about a central disc.** Fifty-two marks were in `ICON_SYMBOLS` and nothing
resembles it: `atom` is a nucleus inside three ellipses, `ringed` a disc inside one, `sun` a small
disc with straight rays, `ring` a bare circle. Rendered at 24, 28, 34 and 44px beside all four it is
unmistakable at every size, which is what a three-wedge rotational form buys — it has a silhouette
nothing else on the shelf has.

**IT BELONGS TO NEITHER SIDE, which is the same test the hue had to pass**, and it names the one thing
that makes this a distinct subject rather than a chapter of great-power rivalry: for forty-five years
two states could have ended the world in an afternoon and did not. The symbol is the international
sign for radioactivity and is not anybody's national emblem.

**A MUSHROOM CLOUD WAS REFUSED**, and not on legibility: it is an image of the deaths of a hundred
thousand people used as a decorative mark, and a collection that cards Hiroshima properly should not
be wearing it. **A ROCKET WAS DRAWN AND REFUSED** on legibility — it reads at 24px as a fussy `plane`
and would be a third vehicle on the shelf. **A DIVIDED CIRCLE** — half filled, for the divided world —
reads as `moon`.

---

## What this collection is about

**It is about the global conflict between the Soviet Union and the United States and their allies,
from the breakdown of the wartime alliance to the dissolution of the Soviet Union**, and about what
that conflict did to everybody else.

Three things follow and each decides a large part of the running order.

**IT IS A GLOBAL HISTORY, NOT A DUEL, AND THE ARITHMETIC SAYS SO.** Deck 5 gives **120 cards to Asia**
and deck 6 gives **120 to the rest of the world** — decolonisation and non-alignment, the Middle East,
Africa and Latin America — against 110 for divided Europe and 110 for the two superpowers at home.
**Two hundred and forty cards of the thousand are outside Europe and North America**, which for a
subject whose general literature is written overwhelmingly from Washington and Moscow is a deliberate
correction. It is also where the dying happened: the Cold War killed almost nobody in the countries
that were waging it and killed millions in Korea, Vietnam, Indonesia, Afghanistan, Angola, Guatemala
and Central America.

**BOTH SUPERPOWERS' ACCOUNTS OF THEIR OWN ACTIONS ARE CARDED AS ACCOUNTS.** This is the house rule and
here it binds symmetrically and hard, because both sides produced a vast official literature about
their own good intentions and both are still quoted as though they were neutral. It binds on the
client states too: the DPRK's history of the Korean War, the Chilean junta's account of 1973, the
Czechoslovak "normalisation" histories of 1968.

**IT RUNS TO THE PRESENT AND STOPS SHORT OF ARGUING ABOUT IT.** Deck 9 cards the aftermath, the
nuclear legacy, the historiography and the memory, including the question of whether "a new Cold War"
is a useful description of anything now. **The cards give the argument and do not settle it**, which
is the Economics plan's rule in a different subject.

---

## Is there a thousand cards in this?

Yes, comfortably, and the risk runs the other way: the plan's work is **subtraction**, as the France
plan's was. Forty-five years, every continent, two economic systems, a nuclear arms race, a dozen
proxy wars and the collapse of an empire would support three thousand.

**SO THE PLAN MAKES THREE CUTS EXPLICITLY.** The **plot of each proxy war is compressed to what the
Cold War made of it** — Vietnam gets 34 cards and not a hundred, and a reader who wants the war in
depth is served by a Vietnam collection this shelf does not yet have. The **domestic politics of the
two superpowers are carded only where the Cold War is the cause** — the presidencies are one card
each, and the American civil rights movement appears as a propaganda problem rather than as a
subject. And **the personalities are carded sparingly**: about a fifth of the thousand names a person,
and a leader earns a card only where the decisions were theirs.

**THE STRAND THAT WOULD BE EASIEST TO UNDERWEIGHT IS THE NUCLEAR ONE AND IT GETS 110 CARDS.** Building
the bomb, strategy and deterrence, arms control, and the near misses — because deterrence theory is a
real intellectual subject, because arms control is the one part of the conflict that produced durable
institutions, and because the record of how close the thing came to happening by accident is the
single most important thing this collection has to teach.

---

## Six scope decisions

**1. THE GLOBAL SOUTH IS HALF THE COLLECTION.** Stated above.

**2. THE NUCLEAR CARDS GIVE THE NUMBERS AND NEITHER MINIMISE NOR PREACH.** A card says how many
warheads, whose estimate it is and on what date; it does not round up for effect and it does not
reassure. The near-miss deck (`cw-risk`) is the sharpest case: **every one of those incidents is
documented and several are contested**, so a card gives what the record shows and says where the
record is one government's. `cw-324 What the near misses show about the system` is the card that
carries the argument, and it is an argument about systems rather than about luck.

**3. INTELLIGENCE IS CARDED FOR WHAT IT DID TO POLICY, NOT AS A GENRE.** Espionage has the largest
popular literature of any part of this subject and much of it is unverifiable — memoirs by people
with reasons to exaggerate, defector claims never corroborated, agency histories written to justify
budgets. **A card here needs a document or a scholarly reconstruction, not a good story**, and where
the claim rests on one defector's word the card says so. `cw-705 What intelligence actually changed`
is deliberately the last card in that subdeck.

**4. THE HISTORIOGRAPHY IS CARDED BECAUSE IT WAS ITSELF AN EVENT.** Thirty cards in `cw-history`: the
orthodox account, the revisionist turn, post-revisionism, the archival revolution of the 1990s and
what it did and did not settle. **The two-scholar cap is spent here and it is spent deliberately** —
**William Appleman Williams and John Lewis Gaddis** are the two named, because the appearance of
*The Tragedy of American Diplomacy* and the post-revisionist synthesis were events in American public
argument rather than merely contributions to a literature. **Every other historian is carded as an
argument rather than as a name**, which is why `cw-963` is *The Third World turn in Cold War history*
and not a person.

**5. THE ASYMMETRY OF THE EVIDENCE IS ITSELF CARDED.** See "Sourcing" — it is the most important
methodological fact about this subject and `cw-955` is the card.

**6. NOTHING HERE IS WRITTEN AS THOUGH THE OUTCOME WAS OBVIOUS.** Nobody in 1985 expected the Soviet
Union to be gone in six years; nobody in 1950 expected the peace to hold. **A card that narrates
towards 1991 is writing teleology**, and the collection's own `cw-195 Why 1989 surprised everybody`
and `cw-892 Was the collapse inevitable?` exist to make that a subject rather than a habit.

---

## The overlaps, measured

**This collection has a real footprint on the shelf and it was measured rather than guessed**, by
matching every plan's card lines against a Cold-War-specific vocabulary:

    grep -c '' docs/*-card-plan.md   # then, per plan, the card lines matching:
    # cold war|cuban missile|berlin blockade|berlin wall|khrushchev|brezhnev|gorbachev|NATO|
    # warsaw pact|vietnam war|détente|perestroika|glasnost|mccarth|containment|marshall plan|
    # sputnik|space race|korean war|iron curtain|non-aligned|KGB|arms race|prague spring|
    # solidarity|afghan

**Sixty-six lines across thirteen plans**, and they are not spread evenly:

| collection | lines | what it holds |
|---|---|---|
| World History (`wh-`) | 17 | the headline set, `wh-946`–`wh-981`, one card each |
| United States (`us-`) | 15 | `us-856`–`us-890` and `us-931`–`us-980`, the Cold War as American history |
| Russia (`ru-`) | 12 | `ru-697`–`ru-718`, the Cold War as Soviet history |
| Korea (`ko-`) | 10 | `ko-751`–`ko-785`, an entire subdeck on the Korean War |
| the rest | 12 | one or two each, across France, China, Japan, India, the two wars and four others |

**THE DIVISION OF LABOUR IS ONE SENTENCE: a national collection cards what the Cold War did to that
country, and this collection cards the Cold War.** So `ru-706` is the Cuban Missile Crisis as an
episode in Soviet history and `cw-301`–`cw-309` are nine cards on the crisis itself; `us-868
McCarthyism` is a chapter of American politics and `cw-386`–`cw-413` are twenty-eight cards on what
fear did to both societies at once.

**KOREA IS THE SHARPEST PAIR AND MUST BE WRITTEN DELIBERATELY.** That collection already gives the
Korean War a ten-card run written **from inside Korea** — the civilian cost, the refugees, the war in
Korean memory, the war as Korea's own unfinished business — and this collection gives it 24 cards
written from outside, as the moment the Cold War became a shooting war and militarised containment.
**Neither is a substitute for the other and neither should be a summary of the other**; where a line
here has a `ko-` twin, read that card before writing this one.

**AND WORLD HISTORY IS THE MODEL FOR ALL OF IT**: seventeen lines there are one card each on the
things everybody has heard of, and each of them is a whole subdeck here. That is the same relation
Architecture has to the national collections and it works the same way.

---

## Sourcing

**THIS IS THE BEST-DOCUMENTED SUBJECT ON THE SHELF AND MOST OF THE DOCUMENTS ARE FREE.** Four
collections carry an enormous amount of primary material at no cost: the **Wilson Center Digital
Archive** (the Cold War International History Project, with translated Soviet, Chinese and East
European documents), the **National Security Archive** at George Washington University, the State
Department's **Foreign Relations of the United States** series, which is published in full text by
the Office of the Historian, and the **CIA's own reading room**. The scholarly journals — *Journal of
Cold War Studies*, *Cold War History*, *Diplomatic History* — are largely paywalled, so **search DOAJ
and OpenAIRE for the repository copy** before assuming a paper is shut.

**AND THE ONE METHODOLOGICAL FACT THAT MATTERS MOST: THE RECORD IS LOPSIDED.** American, British and
West German archives have been opening on a statutory timetable for fifty years. Soviet and East
European archives opened suddenly in the early 1990s, were worked for a decade, and **the Russian
ones have substantially re-closed since**. So the documentary base is far richer on one side than the
other, and the effect on the literature is systematic: **it is easier to write a well-evidenced
account of American deliberation than of Soviet deliberation, which makes American decisions look
more explicable and Soviet ones more opaque.** `cw-955 The asymmetry of the documentary record` is
the card and **every card in this collection inherits it.** Where a claim about Soviet intentions
rests on a single document or on a memoir, say so.

**A DECLASSIFIED DOCUMENT IS EVIDENCE OF WHAT AN AGENCY WROTE, NOT OF WHAT HAPPENED.** An intelligence
estimate is a guess with a letterhead; a policy memorandum is an argument somebody was making, often
losing; a transcript records what was said in a room by people who knew they were being recorded.
This is the Architecture plan's manifesto rule and the Middle-earth plan's commentary rule in a third
form, and here it is the commonest way a Cold War card will go wrong — **a card that cites NSC-68 for
what the Soviet Union was doing has cited an American argument about the Soviet Union.**

**MEMOIRS ARE THE WEAKEST SOURCE IN THIS SUBJECT AND THERE ARE HUNDREDS OF THEM.** Nearly every
participant wrote one, most were written to settle scores, and several of the best-known contain
claims no document supports. Use them for what somebody wanted remembered.

**THE CASUALTY FIGURES ARE CONTESTED EVERYWHERE AND ARE GIVEN AS RANGES WITH THEIR SOURCE NAMED** —
the Korean War, the Indonesian killings of 1965, the Cambodian deaths, the Guatemalan civil war, the
Angolan war. The house rule is that a contested figure is a range with whose it is named, and in this
collection it applies to a dozen cards at least.

---

## Dates, names and spellings

**THE DATES OF THE CONFLICT ITSELF ARE DISPUTED AND THE COLLECTION CARDS THE DISPUTE.** 1917, 1945,
1946 and 1947 all have serious advocates for the start; 1989 and 1991 for the end. `cw-002 When the
Cold War began` and `cw-969 When historians say the Cold War ended` are the cards. **Everywhere else,
give the date of the event and let the periodisation argument live in those two.**

**RUSSIAN AND UKRAINIAN NAMES FOLLOW THE RUSSIA PLAN'S CONVENTIONS**, which already settled this for a
thousand cards: the form a general English reader meets, transliterated without diacritics, and Kyiv
rather than Kiev for the present-day city while a historical Soviet institution keeps its own name.
**Do not re-argue it here; read `docs/russia-card-plan.md`'s conventions section.**

**THE EASTERN EUROPEAN NAMES CARRY THEIR DIACRITICS** — Gomułka, Ceaușescu, Dubček, Wałęsa, Havel,
Poznań — and `answerText` is what a reader types, so `gradeCloze`'s near-miss tolerance forgives one
slip but **an answer term with two diacritics needs testing rather than assuming.**

**A COUNTRY IS NAMED AS IT WAS NAMED AT THE TIME, with the modern name where a reader would otherwise
be lost** — the German Democratic Republic rather than "East Germany" in a card about its
institutions, Zaire in a card about Mobutu, Kampuchea where the regime called itself that, and
Czechoslovakia throughout. **The exception is where the period name is one side's claim**: a card
about the DPRK uses its own name and does not adopt either Korean state's term for the other.

**AND THE ACRONYMS ARE SPELLED OUT ON FIRST USE**, which is not pedantry in a subject this thick with
them: NSC-68, SALT, START, INF, ABM, CSCE, COCOM, NATO, SEATO, CENTO, NLF, KGB, HUAC. An answer term
may be an acronym where that is what the thing is called (`NATO`, `SALT I`), and the abstract still
says what it stands for.

---

## The glossary

**THE OVERLAP IS LARGER THAN IT LOOKS AND `add-glossary.js` OVERWRITES IN SILENCE.** The Russia,
United States, World History and Korea collections have between them already written a good many of
this collection's terms — every postwar American president is a cited glossary term from Phase 2 of
the citation pass, and the Russia collection's late-Soviet run has brought in Khrushchev, Brezhnev,
Gorbachev, perestroika and glasnost. **Check before running the helper on any term a national
collection could plausibly have reached**, and where one exists **widen the description rather than
re-keying it** — the Korea `Seoul` scar.

**THE TRAP IS THE ORDINARY-WORD TRAP AGAIN AND THIS SUBJECT IS FULL OF IT.** Containment, deterrence,
the Thaw, the Wall, the Curtain, détente, linkage, escalation, stability, the bomb, the Bloc, the
Third World, non-alignment, normalisation. Several are ordinary English words the corpus already uses
in their ordinary sense — **`stability`, `escalation`, `linkage` and `containment` must not claim
their bare surfaces**, and `The_Wall` is worse again, the Westeros collection having its own. Key them
`Containment_(Cold_War)` and `Berlin_Wall` on `Life_(biology)`'s rule, reach them by a narrower alias
and a hand-written `data-k`, and **measure the bare word over the shipped corpus before deciding.**

**AND TWO ACRONYMS NEED WATCHING.** `NATO` and `SALT` are both fine as keys; **`SALT` must not claim
the bare surface `salt`**, which is an ordinary English word in dozens of shipped cards, and
`buildGlossIndex`'s matching is case-sensitive only where a term asks for it — so `SALT I` takes
`caseSensitive: true` or it links every mention of salt in the Biology and Economics collections.

---

## Difficulty and the minigames

**THIS COLLECTION HAS AN UNUSUALLY WIDE SPREAD AND BOTH ENDS ARE WELL POPULATED.** The Berlin Wall,
the Cuban Missile Crisis, NATO, the space race and McCarthyism are household names; Operation RYaN,
the Novikov telegram, COCOM, the Novo-Ogaryovo process and Kyshtym are as obscure as anything on the
shelf. Rate the WORD rather than the card, as always.

**`undatable` IS RARELY RIGHT HERE AND SHOULD BE USED SPARINGLY.** Almost everything in this
collection happened at a datable moment, which makes it unusually good material for Timeline. The
exceptions are the concepts and the doctrines — containment, deterrence, bipolarity, the security
dilemma, the proxy war — where the sort year would be one arbitrary moment inside a long process.
**Ask the Middle-earth plan's question**: is the year the deck would sort this card at a date the term
is conventionally given?

---

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Origins and the shape of the conflict | Where it came from | 30 | cw-001–030 |
|  | 1945 to 1949 | 30 | cw-031–060 |
|  | What kind of conflict it was | 25 | cw-061–085 |
|  | The two blocs and the rest | 20 | cw-086–105 |
| Europe divided | Germany and Berlin | 30 | cw-106–135 |
|  | The Eastern bloc | 30 | cw-136–165 |
|  | Western Europe | 28 | cw-166–193 |
|  | Nineteen eighty-nine | 22 | cw-194–215 |
| The bomb | Building the bomb | 28 | cw-216–243 |
|  | Strategy and deterrence | 30 | cw-244–273 |
|  | Arms control | 26 | cw-274–299 |
|  | Near misses and the risk | 26 | cw-300–325 |
| The superpowers at home | The United States | 30 | cw-326–355 |
|  | The Soviet Union | 30 | cw-356–385 |
|  | Fear, loyalty and repression | 28 | cw-386–413 |
|  | The two economies | 22 | cw-414–435 |
| Asia | China | 28 | cw-436–463 |
|  | The Korean War | 24 | cw-464–487 |
|  | Vietnam and Indochina | 34 | cw-488–521 |
|  | The rest of Asia | 34 | cw-522–555 |
| The global Cold War | Decolonisation and non-alignment | 28 | cw-556–583 |
|  | The Middle East | 26 | cw-584–609 |
|  | Africa | 30 | cw-610–639 |
|  | Latin America | 36 | cw-640–675 |
| Spies, propaganda and culture | Intelligence | 30 | cw-676–705 |
|  | Propaganda and the war of words | 25 | cw-706–730 |
|  | Culture and sport | 28 | cw-731–758 |
|  | The space race | 22 | cw-759–780 |
| Détente, the second Cold War and the end | Détente | 28 | cw-781–808 |
|  | The second Cold War | 28 | cw-809–836 |
|  | Gorbachev | 28 | cw-837–864 |
|  | The collapse of the Soviet Union | 31 | cw-865–895 |
| Aftermath and argument | The aftermath | 28 | cw-896–923 |
|  | Nuclear legacies | 20 | cw-924–943 |
|  | How the Cold War is written | 30 | cw-944–973 |
|  | Memory and the present | 27 | cw-974–cw-1000 |

Nine decks, thirty-six subdecks, one thousand cards.

---

# The list

## Origins and the shape of the conflict

### Where it came from — `cw-origins`

    cw-001  The Cold War
    cw-002  When the Cold War began
    cw-003  The Russian Revolution and the Allied intervention
    cw-004  The Comintern
    cw-005  Western non-recognition of the Soviet Union
    cw-006  The Soviet Union and the interwar order
    cw-007  The Molotov-Ribbentrop Pact
    cw-008  The Grand Alliance
    cw-009  Lend-Lease
    cw-010  The second front argument
    cw-011  The Tehran Conference
    cw-012  The Warsaw Rising and Soviet inaction
    cw-013  The percentages agreement
    cw-014  The Yalta Conference
    cw-015  What Yalta actually decided
    cw-016  The death of Roosevelt
    cw-017  The Potsdam Conference
    cw-018  Hiroshima and the diplomacy of the bomb
    cw-019  The Long Telegram
    cw-020  The Novikov telegram
    cw-021  Churchill's Iron Curtain speech
    cw-022  The Soviet security argument
    cw-023  The American open-door argument
    cw-024  Ideology against interest as an explanation
    cw-025  Stalin's part in the breakdown
    cw-026  Truman's part in the breakdown
    cw-027  Misperception and the spiral model
    cw-028  Whether the Cold War was avoidable
    cw-029  The historiography of the origins
    cw-030  What the phrase Cold War meant when it was coined

### 1945 to 1949 — `cw-1945`

    cw-031  Europe in 1945
    cw-032  Displaced persons and the movement of peoples
    cw-033  The expulsion of the Germans
    cw-034  The occupation zones
    cw-035  Denazification and its limits
    cw-036  The Nuremberg trials and the Cold War
    cw-037  The Greek Civil War
    cw-038  The Turkish straits crisis
    cw-039  The Iran crisis of 1946
    cw-040  The Truman Doctrine
    cw-041  Containment
    cw-042  George Kennan and the X article
    cw-043  What Kennan meant and what was heard
    cw-044  The Marshall Plan
    cw-045  Why the Soviet Union refused Marshall aid
    cw-046  The Czechoslovak coup of 1948
    cw-047  The Berlin Blockade
    cw-048  The Berlin Airlift
    cw-049  The founding of NATO
    cw-050  The two Germanies
    cw-051  Comecon
    cw-052  The Cominform
    cw-053  The Tito-Stalin split
    cw-054  The Soviet atomic test of 1949
    cw-055  The Chinese Revolution and the shock of 1949
    cw-056  NSC-68
    cw-057  The militarisation of containment
    cw-058  Japan and the reverse course
    cw-059  The peace treaty with Japan
    cw-060  Why 1949 is the usual hinge

### What kind of conflict it was — `cw-shape`

    cw-061  A war that was not a war
    cw-062  Bipolarity
    cw-063  The security dilemma
    cw-064  Spheres of influence
    cw-065  Alliance systems
    cw-066  The client state
    cw-067  The proxy war
    cw-068  Deterrence as a form of politics
    cw-069  Ideology as a weapon
    cw-070  Two claims to universalism
    cw-071  The Cold War as a system of order
    cw-072  The Cold War and the United Nations
    cw-073  The Security Council veto
    cw-074  Summitry
    cw-075  Crisis diplomacy
    cw-076  The hotline
    cw-077  Rules of the game and tacit bargains
    cw-078  Why the superpowers never fought each other directly
    cw-079  The long peace argument
    cw-080  The objection to the long peace argument
    cw-081  The Cold War's death toll
    cw-082  Where the Cold War was hot
    cw-083  The Cold War as seen from the global South
    cw-084  The Cold War as an economic contest
    cw-085  The Cold War international system

### The two blocs and the rest — `cw-blocs`

    cw-086  The Western bloc
    cw-087  The Atlantic alliance
    cw-088  NATO's command structure
    cw-089  The Eastern bloc
    cw-090  The Warsaw Pact
    cw-091  Soviet control in Eastern Europe
    cw-092  The Brezhnev Doctrine
    cw-093  The neutral states
    cw-094  Austria and the State Treaty
    cw-095  Finlandisation
    cw-096  Sweden, Switzerland and armed neutrality
    cw-097  Yugoslavia outside both blocs
    cw-098  The Non-Aligned Movement
    cw-099  Neutralism as a third way
    cw-100  The Third World as a Cold War term
    cw-101  China as a third pole
    cw-102  The Sino-Soviet split as a bloc event
    cw-103  France and the withdrawal from NATO command
    cw-104  Alliance management and its quarrels
    cw-105  Whether bloc describes either side well

## Europe divided

### Germany and Berlin — `cw-germany`

    cw-106  The German question
    cw-107  The occupation of Germany
    cw-108  The currency reform of 1948
    cw-109  The Federal Republic of Germany
    cw-110  The German Democratic Republic
    cw-111  Konrad Adenauer
    cw-112  Walter Ulbricht
    cw-113  West German rearmament
    cw-114  The European Defence Community
    cw-115  The Hallstein Doctrine
    cw-116  The uprising of 17 June 1953
    cw-117  Berlin as a divided city
    cw-118  The Berlin ultimatum of 1958
    cw-119  The refugee flow through Berlin
    cw-120  The building of the Berlin Wall
    cw-121  What the Wall did to both states
    cw-122  Checkpoint Charlie and the tank standoff
    cw-123  Kennedy in Berlin
    cw-124  The Stasi
    cw-125  Life in the German Democratic Republic
    cw-126  Ostpolitik
    cw-127  Willy Brandt
    cw-128  The Basic Treaty of 1972
    cw-129  Two German states in the United Nations
    cw-130  The East German economy
    cw-131  Escapes and the order to shoot
    cw-132  West Berlin as a showcase
    cw-133  The peace movement in both Germanies
    cw-134  East Germany in the 1980s
    cw-135  The German Democratic Republic's last months

### The Eastern bloc — `cw-east`

    cw-136  The Sovietisation of Eastern Europe
    cw-137  Salami tactics
    cw-138  Show trials in the people's democracies
    cw-139  Collectivisation in Eastern Europe
    cw-140  The planned economy in practice
    cw-141  The Polish People's Republic
    cw-142  Poznań 1956
    cw-143  The Polish October
    cw-144  Władysław Gomułka
    cw-145  The Hungarian Revolution of 1956
    cw-146  Imre Nagy
    cw-147  The Soviet intervention in Hungary
    cw-148  What 1956 taught the West
    cw-149  Czechoslovakia before 1968
    cw-150  The Prague Spring
    cw-151  Alexander Dubček
    cw-152  Socialism with a human face
    cw-153  The Warsaw Pact invasion of 1968
    cw-154  Normalisation in Czechoslovakia
    cw-155  Charter 77
    cw-156  Romania under Ceaușescu
    cw-157  Romania's independent foreign policy
    cw-158  Albania and the Sino-Albanian alignment
    cw-159  Bulgaria and the loyal ally
    cw-160  Solidarity
    cw-161  Lech Wałęsa
    cw-162  Martial law in Poland
    cw-163  The Catholic Church in Poland
    cw-164  John Paul II and Eastern Europe
    cw-165  Dissidents and the Helsinki effect

### Western Europe — `cw-west`

    cw-166  Western Europe after 1945
    cw-167  The economic recovery
    cw-168  The Christian Democrats
    cw-169  The Western communist parties
    cw-170  The Italian election of 1948
    cw-171  Eurocommunism
    cw-172  The Schuman Plan
    cw-173  The European Economic Community
    cw-174  Britain and the special relationship
    cw-175  Suez and the limits of British power
    cw-176  The British independent deterrent
    cw-177  De Gaulle and the Fifth Republic
    cw-178  The French nuclear force
    cw-179  Greece under the colonels
    cw-180  Portugal and the Carnation Revolution
    cw-181  Spain after Franco
    cw-182  Scandinavia between the blocs
    cw-183  The American military presence in Europe
    cw-184  Bases and the politics of status of forces
    cw-185  Gladio and the stay-behind networks
    cw-186  The European peace movements
    cw-187  The Euromissile crisis
    cw-188  The Dutch and Belgian deployment debates
    cw-189  The Greenham Common protest
    cw-190  European détente and its own logic
    cw-191  The Conference on Security and Co-operation in Europe
    cw-192  The Helsinki Final Act
    cw-193  Western Europe's own Cold War

### Nineteen eighty-nine — `cw-1989`

    cw-194  Nineteen eighty-nine
    cw-195  Why 1989 surprised everybody
    cw-196  The Soviet decision not to intervene
    cw-197  The Polish round table
    cw-198  The Polish election of June 1989
    cw-199  The Hungarian border opening
    cw-200  The exodus through Hungary and Czechoslovakia
    cw-201  The Monday demonstrations in Leipzig
    cw-202  The fall of the Berlin Wall
    cw-203  The Velvet Revolution
    cw-204  Václav Havel
    cw-205  The Bulgarian change
    cw-206  The Romanian revolution
    cw-207  The execution of the Ceaușescus
    cw-208  Television and the revolutions of 1989
    cw-209  Civil society and the opposition networks
    cw-210  The Two Plus Four Treaty
    cw-211  German unification and its terms
    cw-212  What the Soviet Union was told about NATO
    cw-213  The dissolution of the Warsaw Pact
    cw-214  The end of Comecon
    cw-215  Was 1989 a revolution?

## The bomb

### Building the bomb — `cw-bomb`

    cw-216  The Manhattan Project
    cw-217  Hiroshima and Nagasaki
    cw-218  The decision to use the bomb
    cw-219  The atomic diplomacy argument
    cw-220  The Soviet atomic project
    cw-221  Igor Kurchatov
    cw-222  Atomic espionage
    cw-223  Klaus Fuchs
    cw-224  The Soviet test of August 1949
    cw-225  The hydrogen bomb decision
    cw-226  Edward Teller and the superbomb argument
    cw-227  Andrei Sakharov
    cw-228  The Castle Bravo test
    cw-229  The Lucky Dragon incident
    cw-230  Atmospheric testing and fallout
    cw-231  Strontium-90 and the baby-tooth studies
    cw-232  The British bomb
    cw-233  The French bomb
    cw-234  The Chinese bomb
    cw-235  Israel's undeclared programme
    cw-236  India's peaceful nuclear explosion
    cw-237  South Africa's bomb and its dismantling
    cw-238  The stockpiles at their peak
    cw-239  The bomber as a delivery system
    cw-240  The ballistic missile
    cw-241  The missile submarine
    cw-242  The nuclear triad
    cw-243  What building the bomb cost

### Strategy and deterrence — `cw-strategy`

    cw-244  Nuclear strategy as a discipline
    cw-245  Bernard Brodie and the absolute weapon
    cw-246  Massive retaliation
    cw-247  The New Look
    cw-248  Flexible response
    cw-249  Counterforce and countervalue
    cw-250  The second strike
    cw-251  Mutual assured destruction
    cw-252  Stability and the balance of terror
    cw-253  The missile gap
    cw-254  The bomber gap
    cw-255  The RAND Corporation
    cw-256  Game theory and deterrence
    cw-257  The threat that leaves something to chance
    cw-258  Thinking about the unthinkable
    cw-259  Escalation ladders
    cw-260  Limited nuclear war
    cw-261  Tactical nuclear weapons
    cw-262  Nuclear sharing in NATO
    cw-263  The Single Integrated Operational Plan
    cw-264  Command and control
    cw-265  Permissive action links
    cw-266  The problem of delegation
    cw-267  Launch on warning
    cw-268  The Perimeter system
    cw-269  Civil defence
    cw-270  Fallout shelters and the duck-and-cover films
    cw-271  Whether civil defence was ever credible
    cw-272  Nuclear winter
    cw-273  What deterrence theory could not model

### Arms control — `cw-arms`

    cw-274  Arms control as an idea
    cw-275  The Baruch Plan
    cw-276  The Open Skies proposal
    cw-277  The Antarctic Treaty
    cw-278  The Partial Test Ban Treaty
    cw-279  The Outer Space Treaty
    cw-280  The Non-Proliferation Treaty
    cw-281  The bargain at the heart of the Non-Proliferation Treaty
    cw-282  The International Atomic Energy Agency
    cw-283  Safeguards and inspection
    cw-284  SALT I
    cw-285  The Anti-Ballistic Missile Treaty
    cw-286  The Interim Agreement
    cw-287  SALT II
    cw-288  Why SALT II was never ratified
    cw-289  The Threshold Test Ban Treaty
    cw-290  The Biological Weapons Convention
    cw-291  Chemical weapons and the Cold War
    cw-292  The zero option and the intermediate-range talks
    cw-293  Verification and the on-site inspection breakthrough
    cw-294  START I
    cw-295  The Nunn-Lugar programme
    cw-296  The Comprehensive Test Ban Treaty
    cw-297  What arms control achieved
    cw-298  What arms control did not achieve
    cw-299  The disarmament movement's critique

### Near misses and the risk — `cw-risk`

    cw-300  How close the world came
    cw-301  The Cuban Missile Crisis
    cw-302  Why the missiles were sent
    cw-303  The blockade decision
    cw-304  The ExComm
    cw-305  The thirteen days
    cw-306  The secret Turkish missile deal
    cw-307  Vasili Arkhipov and the B-59
    cw-308  What was not known at the time
    cw-309  The missile crisis in Cuban memory
    cw-310  The Berlin crisis of 1961 as a nuclear crisis
    cw-311  Soviet fears of a first strike
    cw-312  Stanislav Petrov
    cw-313  The Norwegian rocket incident
    cw-314  Broken arrows and lost weapons
    cw-315  The Palomares accident
    cw-316  The Thule accident
    cw-317  False alarms in the warning systems
    cw-318  The 1979 NORAD training-tape alarm
    cw-319  Accidents at sea
    cw-320  Nuclear submarine losses
    cw-321  Accidents in the Soviet programme
    cw-322  Kyshtym
    cw-323  Chernobyl
    cw-324  What the near misses show about the system
    cw-325  Risk, luck and the limits of control

## The superpowers at home

### The United States — `cw-usa`

    cw-326  The United States as a superpower
    cw-327  The national security state
    cw-328  The National Security Act of 1947
    cw-329  The Pentagon and the defence budget
    cw-330  The military-industrial complex
    cw-331  Eisenhower's farewell address
    cw-332  Harry Truman
    cw-333  Dwight Eisenhower
    cw-334  John F. Kennedy
    cw-335  Lyndon Johnson
    cw-336  Richard Nixon
    cw-337  Gerald Ford
    cw-338  Jimmy Carter
    cw-339  Ronald Reagan
    cw-340  George H. W. Bush
    cw-341  Congress and the Cold War
    cw-342  The imperial presidency
    cw-343  The draft
    cw-344  The universities and federal science funding
    cw-345  The GI Bill and the postwar boom
    cw-346  Consumerism as an argument
    cw-347  The kitchen debate
    cw-348  Civil rights and the Cold War
    cw-349  American race relations as a propaganda problem
    cw-350  The New Left and the anti-war movement
    cw-351  Watergate and the erosion of trust
    cw-352  The Church Committee
    cw-353  Congressional oversight of intelligence
    cw-354  The Cold War and American federal power
    cw-355  What the Cold War cost the United States

### The Soviet Union — `cw-ussr`

    cw-356  The Soviet Union as a superpower
    cw-357  Reconstruction after 1945
    cw-358  Late Stalinism
    cw-359  The Zhdanovshchina
    cw-360  The doctors' plot
    cw-361  The death of Stalin
    cw-362  The succession struggle
    cw-363  The fall of Beria
    cw-364  Nikita Khrushchev
    cw-365  The Secret Speech
    cw-366  De-Stalinisation
    cw-367  The Thaw
    cw-368  The Virgin Lands campaign
    cw-369  The fall of Khrushchev
    cw-370  Leonid Brezhnev
    cw-371  The era of stagnation
    cw-372  The nomenklatura
    cw-373  The Soviet planned economy
    cw-374  The defence burden on the Soviet economy
    cw-375  Soviet agriculture and the grain imports
    cw-376  The Soviet standard of living
    cw-377  The second economy
    cw-378  Soviet nationalities policy
    cw-379  The Soviet Union as a multinational state
    cw-380  Soviet science and its strengths
    cw-381  Lysenko and the cost of ideology
    cw-382  The camps after Stalin
    cw-383  Dissidents in the Soviet Union
    cw-384  Samizdat
    cw-385  Punitive psychiatry

### Fear, loyalty and repression — `cw-fear`

    cw-386  Fear as a political resource
    cw-387  The first Red Scare and its memory
    cw-388  The second Red Scare
    cw-389  Joseph McCarthy
    cw-390  The House Un-American Activities Committee
    cw-391  The Hollywood Ten
    cw-392  Blacklisting
    cw-393  Loyalty oaths
    cw-394  The Alger Hiss case
    cw-395  The Rosenberg case
    cw-396  What Venona showed
    cw-397  The FBI under Hoover
    cw-398  COINTELPRO
    cw-399  The lavender scare
    cw-400  Anti-communism in the labour movement
    cw-401  Anti-communism in the churches
    cw-402  The John Birch Society
    cw-403  Soviet repression after Stalin
    cw-404  Political crime in Soviet law
    cw-405  The KGB at home
    cw-406  Surveillance in the Eastern bloc
    cw-407  The informer and the neighbour
    cw-408  Censorship in the Soviet bloc
    cw-409  Religion under communism
    cw-410  The persecution of the churches
    cw-411  Emigration and the refusenik movement
    cw-412  The Jackson-Vanik amendment
    cw-413  What the fear did to both societies

### The two economies — `cw-money`

    cw-414  The two economic systems
    cw-415  Bretton Woods
    cw-416  The dollar as the world's currency
    cw-417  The World Bank and the International Monetary Fund
    cw-418  The Soviet alternative to Bretton Woods
    cw-419  Growth rates and how they were measured
    cw-420  The CIA's estimates of Soviet output
    cw-421  Why the estimates were wrong
    cw-422  Comparing living standards across the blocs
    cw-423  The arms race as an economic contest
    cw-424  Defence spending as a share of output
    cw-425  Technology transfer and the embargo
    cw-426  COCOM
    cw-427  The grain deals
    cw-428  Soviet oil and gas exports
    cw-429  The Siberian pipeline dispute
    cw-430  Aid as a Cold War instrument
    cw-431  Development economics between the blocs
    cw-432  The debt crisis and the Eastern bloc
    cw-433  Convergence theory
    cw-434  Why the Soviet economy stopped growing
    cw-435  Whether the arms race bankrupted the Soviet Union

## Asia

### China — `cw-china`

    cw-436  China and the Cold War
    cw-437  The Chinese Civil War
    cw-438  American China policy after 1949
    cw-439  The who-lost-China debate
    cw-440  The Sino-Soviet alliance of 1950
    cw-441  Soviet aid to China
    cw-442  Chinese intervention in Korea
    cw-443  The Taiwan Strait crises
    cw-444  The Great Leap Forward
    cw-445  The Sino-Soviet split
    cw-446  The polemics and the doctrinal quarrel
    cw-447  The border clashes of 1969
    cw-448  China's own bomb
    cw-449  The Cultural Revolution as a foreign-policy problem
    cw-450  Chinese support for revolutionary movements
    cw-451  China and the Third World
    cw-452  Ping-pong diplomacy
    cw-453  Kissinger's secret visit
    cw-454  Nixon in China
    cw-455  The Shanghai Communiqué
    cw-456  The triangular relationship
    cw-457  Normalisation in 1979
    cw-458  China and Vietnam
    cw-459  Deng Xiaoping and reform
    cw-460  China's opening to the West
    cw-461  The Sino-Soviet rapprochement of 1989
    cw-462  Tiananmen and the Western response
    cw-463  China's Cold War on its own terms

### The Korean War — `cw-korea`

    cw-464  The division of Korea in 1945
    cw-465  The two Korean states
    cw-466  Kim Il Sung
    cw-467  Syngman Rhee
    cw-468  The road to June 1950
    cw-469  Who decided on the invasion
    cw-470  The Korean War
    cw-471  The United Nations command
    cw-472  The Pusan perimeter
    cw-473  Inchon
    cw-474  The advance to the Yalu
    cw-475  The war of the stalemate
    cw-476  The air war over North Korea
    cw-477  Civilian deaths in the Korean War
    cw-478  The prisoner-of-war question
    cw-479  The armistice of 1953
    cw-480  The Demilitarized Zone
    cw-481  The Korean War's effect on American policy
    cw-482  The Korean War's effect on Japan
    cw-483  North Korea after the war
    cw-484  South Korea's authoritarian decades
    cw-485  The Korean War as an unfinished war
    cw-486  What the Korean War settled
    cw-487  Why the Korean War matters to the whole Cold War

### Vietnam and Indochina — `cw-vietnam`

    cw-488  Indochina and the Cold War
    cw-489  French Indochina
    cw-490  Ho Chi Minh
    cw-491  The First Indochina War
    cw-492  American aid to the French
    cw-493  Dien Bien Phu
    cw-494  The Geneva Accords of 1954
    cw-495  The two Vietnams
    cw-496  Ngo Dinh Diem
    cw-497  The National Liberation Front
    cw-498  The domino theory
    cw-499  American advisers under Kennedy
    cw-500  The coup against Diem
    cw-501  The Gulf of Tonkin incident
    cw-502  The Americanisation of the war
    cw-503  The Vietnam War
    cw-504  Rolling Thunder
    cw-505  Search and destroy
    cw-506  The Ho Chi Minh trail
    cw-507  Soviet and Chinese aid to Hanoi
    cw-508  The Tet Offensive
    cw-509  The media and the war
    cw-510  My Lai
    cw-511  The anti-war movement
    cw-512  Vietnamisation
    cw-513  The war in Laos
    cw-514  The bombing of Cambodia
    cw-515  The Paris Peace Accords
    cw-516  The fall of Saigon
    cw-517  The war's cost to Vietnam
    cw-518  Agent Orange and unexploded ordnance
    cw-519  The Khmer Rouge
    cw-520  The Vietnamese invasion of Cambodia
    cw-521  What Vietnam did to American policy

### The rest of Asia — `cw-asiarest`

    cw-522  Japan as an American ally
    cw-523  The San Francisco system
    cw-524  The United States-Japan Security Treaty
    cw-525  The Anpo protests
    cw-526  Okinawa
    cw-527  Japan's economic rise as a Cold War fact
    cw-528  Taiwan under martial law
    cw-529  The Philippines and the American bases
    cw-530  Indonesia under Sukarno
    cw-531  The Bandung Conference
    cw-532  Konfrontasi
    cw-533  The Indonesian killings of 1965 and 1966
    cw-534  Suharto and the New Order
    cw-535  What the West knew about 1965
    cw-536  Malaya and the Emergency
    cw-537  Singapore and the Cold War
    cw-538  Thailand as a frontline state
    cw-539  Burma's neutralism
    cw-540  India's non-alignment
    cw-541  Jawaharlal Nehru
    cw-542  India and the Soviet Union
    cw-543  The Sino-Indian War of 1962
    cw-544  Pakistan and the American alliance
    cw-545  CENTO and SEATO
    cw-546  The Indo-Pakistani wars and the superpowers
    cw-547  Bangladesh in 1971
    cw-548  Afghanistan before 1979
    cw-549  The Saur Revolution
    cw-550  The Soviet invasion of Afghanistan
    cw-551  The mujahideen
    cw-552  Operation Cyclone
    cw-553  Stinger missiles and the turn of the war
    cw-554  The Soviet withdrawal
    cw-555  What Afghanistan cost the Soviet Union

## The global Cold War

### Decolonisation and non-alignment — `cw-decol`

    cw-556  Decolonisation and the Cold War
    cw-557  Why the empires ended when they did
    cw-558  The superpowers and the colonial powers
    cw-559  American anti-colonialism and its limits
    cw-560  Soviet support for national liberation
    cw-561  The Atlantic Charter and its promises
    cw-562  The United Nations and trusteeship
    cw-563  The Afro-Asian conference movement
    cw-564  Non-alignment as a strategy
    cw-565  Nehru, Nasser and Tito
    cw-566  Sukarno and the Bandung spirit
    cw-567  The Belgrade conference of 1961
    cw-568  The Group of 77
    cw-569  The New International Economic Order
    cw-570  UNCTAD
    cw-571  Third World debt
    cw-572  Modernisation theory
    cw-573  Development aid as competition
    cw-574  Soviet and Chinese aid models
    cw-575  The Peace Corps
    cw-576  Technical assistance and its politics
    cw-577  Students from the Third World in Moscow
    cw-578  Patrice Lumumba University
    cw-579  The Tricontinental Conference
    cw-580  Revolutionary internationalism
    cw-581  Cuba as an actor in the Third World
    cw-582  The limits of non-alignment
    cw-583  What the Cold War did to decolonisation

### The Middle East — `cw-mideast`

    cw-584  The Middle East in the Cold War
    cw-585  The Tudeh Party and Iranian communism
    cw-586  The 1953 coup in Iran
    cw-587  Mohammad Mossadegh
    cw-588  The Shah and the American alliance
    cw-589  The Baghdad Pact
    cw-590  Gamal Abdel Nasser
    cw-591  The Czech arms deal of 1955
    cw-592  The Aswan Dam and the withdrawal of aid
    cw-593  The Suez Crisis
    cw-594  The Eisenhower Doctrine
    cw-595  The Iraqi revolution of 1958
    cw-596  The United Arab Republic
    cw-597  The Arab-Israeli conflict and the superpowers
    cw-598  The Six-Day War
    cw-599  The War of Attrition
    cw-600  The October War of 1973
    cw-601  The nuclear alert of 1973
    cw-602  The oil embargo
    cw-603  OPEC and the price shocks
    cw-604  Camp David
    cw-605  The Iranian Revolution
    cw-606  The hostage crisis
    cw-607  The Iran-Iraq War and the superpowers
    cw-608  Lebanon and the multinational force
    cw-609  The Middle East as a Cold War theatre

### Africa — `cw-africa`

    cw-610  Africa and the Cold War
    cw-611  Ghana and Kwame Nkrumah
    cw-612  Guinea and the Soviet opening
    cw-613  The Congo crisis
    cw-614  Patrice Lumumba
    cw-615  The killing of Lumumba
    cw-616  Mobutu and Zaire
    cw-617  The United Nations operation in the Congo
    cw-618  Dag Hammarskjöld
    cw-619  Egypt and the Soviet Union
    cw-620  Ethiopia under Haile Selassie
    cw-621  The Ethiopian revolution
    cw-622  The Ogaden War
    cw-623  Somalia's change of patrons
    cw-624  The Horn of Africa as a Cold War laboratory
    cw-625  Portuguese Africa and the liberation wars
    cw-626  Angola's independence
    cw-627  The Angolan Civil War
    cw-628  Cuban troops in Angola
    cw-629  South Africa and the Border War
    cw-630  Mozambique and RENAMO
    cw-631  Rhodesia and the liberation struggle
    cw-632  Apartheid South Africa as a Western problem
    cw-633  The anti-apartheid movement
    cw-634  Sanctions and the Western debate
    cw-635  Nelson Mandela and the communism question
    cw-636  Tanzania and African socialism
    cw-637  Kenya and the Western alignment
    cw-638  French Africa and the Cold War
    cw-639  What the Cold War cost Africa

### Latin America — `cw-latam`

    cw-640  Latin America and the Cold War
    cw-641  The Rio Treaty
    cw-642  The Organization of American States
    cw-643  Guatemala under Arbenz
    cw-644  The 1954 coup in Guatemala
    cw-645  The United Fruit Company
    cw-646  The Guatemalan civil war
    cw-647  The Cuban Revolution
    cw-648  Fidel Castro
    cw-649  Che Guevara
    cw-650  Cuba's turn to the Soviet Union
    cw-651  The Bay of Pigs
    cw-652  Operation Mongoose
    cw-653  The Cuban embargo
    cw-654  Cuba's export of revolution
    cw-655  The Alliance for Progress
    cw-656  Counterinsurgency doctrine
    cw-657  The School of the Americas
    cw-658  National security doctrine in Latin America
    cw-659  The Brazilian coup of 1964
    cw-660  Brazil's military government
    cw-661  The Dominican intervention of 1965
    cw-662  Chile under Allende
    cw-663  The 1973 coup in Chile
    cw-664  Augusto Pinochet
    cw-665  The Chicago Boys
    cw-666  Operation Condor
    cw-667  Argentina's dirty war
    cw-668  The disappeared
    cw-669  Uruguay and Paraguay under military rule
    cw-670  The Nicaraguan Revolution
    cw-671  The Sandinistas
    cw-672  The Contras
    cw-673  The Iran-Contra affair
    cw-674  El Salvador's civil war
    cw-675  What the Cold War cost Latin America

## Spies, propaganda and culture

### Intelligence — `cw-intel`

    cw-676  Intelligence in the Cold War
    cw-677  The Central Intelligence Agency
    cw-678  The KGB
    cw-679  The Stasi and the bloc services
    cw-680  MI6 and GCHQ
    cw-681  Signals intelligence
    cw-682  The National Security Agency
    cw-683  The UKUSA agreement
    cw-684  The Venona project
    cw-685  Aerial reconnaissance
    cw-686  The U-2
    cw-687  The Powers incident
    cw-688  Reconnaissance satellites
    cw-689  Corona
    cw-690  Human intelligence and its limits
    cw-691  Oleg Penkovsky
    cw-692  Ames and Hanssen
    cw-693  The Cambridge Five
    cw-694  Kim Philby
    cw-695  Defectors and their handling
    cw-696  Covert action as an instrument
    cw-697  Regime change operations
    cw-698  Assassination plots and what the Church Committee found
    cw-699  Front organisations
    cw-700  The Congress for Cultural Freedom
    cw-701  Radio Free Europe and Radio Liberty
    cw-702  Active measures and disinformation
    cw-703  Operation INFEKTION
    cw-704  Intelligence failures
    cw-705  What intelligence actually changed

### Propaganda and the war of words — `cw-words`

    cw-706  Propaganda in the Cold War
    cw-707  The battle for hearts and minds
    cw-708  The United States Information Agency
    cw-709  The Voice of America
    cw-710  Jamming and the war of the airwaves
    cw-711  Soviet propaganda abroad
    cw-712  The World Peace Council
    cw-713  Peace as a contested word
    cw-714  Exhibitions and trade fairs
    cw-715  The American National Exhibition in Moscow
    cw-716  Books as instruments
    cw-717  Doctor Zhivago and the covert edition
    cw-718  Cultural diplomacy
    cw-719  Jazz diplomacy
    cw-720  Tours, exchanges and the cultural agreements
    cw-721  Student and academic exchanges
    cw-722  Sister cities and citizen diplomacy
    cw-723  Language teaching and area studies
    cw-724  Cold War rhetoric and its vocabulary
    cw-725  Euphemism in official language
    cw-726  The rhetoric of the free world
    cw-727  The rhetoric of imperialism
    cw-728  Public opinion polling in the Cold War
    cw-729  Whether propaganda worked
    cw-730  The evidence on the audiences

### Culture and sport — `cw-culture`

    cw-731  Culture in the Cold War
    cw-732  Socialist realism
    cw-733  Abstract expressionism and the freedom argument
    cw-734  The CIA and the modern art question
    cw-735  Literature and the dissident writer
    cw-736  Solzhenitsyn
    cw-737  The Nobel Prize as a Cold War event
    cw-738  Cinema and the Cold War
    cw-739  Hollywood's Cold War films
    cw-740  Soviet cinema and the thaw
    cw-741  Science fiction and the atomic age
    cw-742  Dr. Strangelove
    cw-743  The spy thriller
    cw-744  The anti-romance of espionage
    cw-745  James Bond
    cw-746  The Cold War on television
    cw-747  Popular music across the Iron Curtain
    cw-748  Rock music in the Eastern bloc
    cw-749  Youth culture as a political problem
    cw-750  Blue jeans and consumer symbolism
    cw-751  Sport as a proxy contest
    cw-752  The Olympic Games in the Cold War
    cw-753  The boycotts of 1980 and 1984
    cw-754  State-sponsored doping
    cw-755  The Miracle on Ice
    cw-756  The Fischer-Spassky match
    cw-757  Architecture and the two modernisms
    cw-758  What the cultural Cold War was about

### The space race — `cw-space`

    cw-759  The space race
    cw-760  Rocketry and its German inheritance
    cw-761  Wernher von Braun
    cw-762  Sergei Korolev
    cw-763  Sputnik
    cw-764  The Sputnik shock
    cw-765  The founding of NASA
    cw-766  The missile programmes behind the rockets
    cw-767  Laika and the animal flights
    cw-768  Yuri Gagarin
    cw-769  Shepard and Glenn
    cw-770  The Kennedy commitment
    cw-771  The Apollo programme
    cw-772  The Soviet lunar programme
    cw-773  The N1 failures
    cw-774  Apollo 11
    cw-775  Why the Soviet Union lost the Moon race
    cw-776  Space stations
    cw-777  Apollo-Soyuz
    cw-778  Military uses of space
    cw-779  The Strategic Defense Initiative
    cw-780  What the space race was for

## Détente, the second Cold War and the end

### Détente — `cw-detente`

    cw-781  Détente
    cw-782  What détente meant to each side
    cw-783  The conditions that made détente possible
    cw-784  Nixon and Kissinger
    cw-785  Realpolitik as a doctrine
    cw-786  Linkage
    cw-787  The Moscow Summit of 1972
    cw-788  The Basic Principles Agreement
    cw-789  Trade and the grain deal
    cw-790  The Helsinki process
    cw-791  Basket Three and human rights
    cw-792  The unintended consequences of Helsinki
    cw-793  Ostpolitik as European détente
    cw-794  Détente and the Third World
    cw-795  Angola and the American reaction
    cw-796  The Horn of Africa and the unravelling
    cw-797  Carter's human rights policy
    cw-798  The neutron bomb controversy
    cw-799  The Vladivostok accord
    cw-800  SALT II and the Senate
    cw-801  The NATO dual-track decision
    cw-802  The Iranian Revolution's effect on détente
    cw-803  Afghanistan and the end of détente
    cw-804  The Olympic boycott of 1980
    cw-805  The grain embargo
    cw-806  Détente's critics on the American right
    cw-807  Détente's critics in the Soviet establishment
    cw-808  Whether détente failed

### The second Cold War — `cw-second`

    cw-809  The second Cold War
    cw-810  Reagan's first term
    cw-811  The evil empire speech
    cw-812  The Reagan military buildup
    cw-813  The Reagan Doctrine
    cw-814  Aid to anti-communist insurgencies
    cw-815  Missile defence as policy
    cw-816  The Euromissile deployments
    cw-817  The Soviet walkout from the arms talks
    cw-818  The peace movement's revival
    cw-819  The nuclear freeze campaign
    cw-820  The Day After and public fear
    cw-821  Able Archer 83
    cw-822  Operation RYaN
    cw-823  The shooting down of KAL 007
    cw-824  Andropov and the Soviet reading of Reagan
    cw-825  The gerontocracy and the succession crisis
    cw-826  The Soviet economy under strain
    cw-827  The Western response to martial law in Poland
    cw-828  Grenada
    cw-829  Central America in the 1980s
    cw-830  Covert war and the limits of oversight
    cw-831  Thatcher and the alliance
    cw-832  The alliance quarrels of the 1980s
    cw-833  Reagan's turn towards negotiation
    cw-834  The Reykjavik summit
    cw-835  What nearly happened at Reykjavik
    cw-836  How the second Cold War ended

### Gorbachev — `cw-gorbachev`

    cw-837  Mikhail Gorbachev
    cw-838  The generation after Brezhnev
    cw-839  The new thinking in foreign policy
    cw-840  Eduard Shevardnadze
    cw-841  Perestroika
    cw-842  Glasnost
    cw-843  Acceleration and the failure of economic reform
    cw-844  The anti-alcohol campaign
    cw-845  Chernobyl and glasnost
    cw-846  The reassessment of Soviet history
    cw-847  The Congress of People's Deputies
    cw-848  Sakharov's return
    cw-849  The abandonment of the Brezhnev Doctrine
    cw-850  The Sinatra Doctrine
    cw-851  The Geneva summit of 1985
    cw-852  The INF Treaty
    cw-853  Ending the Afghan war as new thinking
    cw-854  The unilateral force reductions
    cw-855  The United Nations speech of 1988
    cw-856  Gorbachev and Eastern Europe in 1989
    cw-857  Gorbachev and German unification
    cw-858  The Malta summit
    cw-859  Was the Cold War declared over?
    cw-860  Gorbachev's Nobel Peace Prize
    cw-861  How Gorbachev was seen at home
    cw-862  How Gorbachev was seen abroad
    cw-863  What Gorbachev intended
    cw-864  What Gorbachev achieved

### The collapse of the Soviet Union — `cw-collapse`

    cw-865  The collapse of the Soviet Union
    cw-866  The nationalities question reopened
    cw-867  The Baltic independence movements
    cw-868  The Baltic Way
    cw-869  Nagorno-Karabakh
    cw-870  The Caucasus and the first violence
    cw-871  Central Asia and the union republics
    cw-872  The Russian republic as an actor
    cw-873  Boris Yeltsin
    cw-874  The war of laws
    cw-875  The Lithuanian crackdown of January 1991
    cw-876  The referendum of March 1991
    cw-877  The Novo-Ogaryovo process
    cw-878  The August coup
    cw-879  The three days
    cw-880  Why the coup failed
    cw-881  The banning of the Communist Party
    cw-882  The republics declare independence
    cw-883  The Belovezha Accords
    cw-884  The founding of the Commonwealth of Independent States
    cw-885  Gorbachev's resignation
    cw-886  The lowering of the flag
    cw-887  The division of Soviet assets
    cw-888  The Soviet nuclear arsenal and its succession
    cw-889  The Lisbon Protocol
    cw-890  Ukraine's denuclearisation and the Budapest Memorandum
    cw-891  Economic collapse and shock therapy
    cw-892  Was the collapse inevitable?
    cw-893  Explanations for the Soviet collapse
    cw-894  The American debate over who won
    cw-895  What ended when the Soviet Union ended

## Aftermath and argument

### The aftermath — `cw-aftermath`

    cw-896  The post-Cold War order
    cw-897  The unipolar moment
    cw-898  The end of history argument
    cw-899  The clash of civilisations argument
    cw-900  NATO after the Cold War
    cw-901  NATO enlargement
    cw-902  The argument about what was promised in 1990
    cw-903  Russia and the West in the 1990s
    cw-904  The wars of Yugoslav succession
    cw-905  The Cold War's frozen conflicts
    cw-906  Korea after the Cold War
    cw-907  Cuba after the Soviet subsidy
    cw-908  Vietnam and Đổi Mới
    cw-909  China after 1991
    cw-910  The former Soviet states
    cw-911  Post-communist transitions
    cw-912  Lustration and dealing with the past
    cw-913  Opening the secret police files
    cw-914  Truth commissions and the Cold War's crimes
    cw-915  Cold War veterans and their recognition
    cw-916  The peace dividend
    cw-917  Defence conversion
    cw-918  Base closures and the military footprint
    cw-919  The intelligence services after 1991
    cw-920  Nuclear security in the 1990s
    cw-921  Loose nukes and the Nunn-Lugar response
    cw-922  Proliferation after the Cold War
    cw-923  What the post-Cold War order inherited

### Nuclear legacies — `cw-legacy`

    cw-924  Nuclear weapons after the Cold War
    cw-925  The stockpiles today
    cw-926  The test-ban regime
    cw-927  New START
    cw-928  The collapse of the INF Treaty
    cw-929  The Doomsday Clock
    cw-930  The human cost of nuclear testing
    cw-931  Downwinders and test-site communities
    cw-932  The Marshall Islands
    cw-933  Semipalatinsk
    cw-934  Maralinga and the British tests
    cw-935  Nuclear waste and the weapons complex
    cw-936  Hanford and Mayak
    cw-937  Contaminated landscapes
    cw-938  Chemical and biological legacies
    cw-939  Landmines and unexploded ordnance
    cw-940  Agent Orange's long aftermath
    cw-941  The health legacy of the atomic age
    cw-942  Compensation and its politics
    cw-943  Who paid for the Cold War

### How the Cold War is written — `cw-history`

    cw-944  Writing the history of the Cold War
    cw-945  The orthodox interpretation
    cw-946  The revisionist interpretation
    cw-947  William Appleman Williams
    cw-948  Post-revisionism
    cw-949  John Lewis Gaddis
    cw-950  The archival revolution of the 1990s
    cw-951  The Cold War International History Project
    cw-952  What the Soviet archives showed
    cw-953  What the Soviet archives did not show
    cw-954  The re-closing of the Russian archives
    cw-955  The asymmetry of the documentary record
    cw-956  Declassification and its politics
    cw-957  The Freedom of Information Act
    cw-958  The National Security Archive
    cw-959  The Foreign Relations of the United States series
    cw-960  Oral history and its uses
    cw-961  The new Cold War history
    cw-962  Globalising the Cold War
    cw-963  The Third World turn in Cold War history
    cw-964  Cultural history of the Cold War
    cw-965  Gender and the Cold War
    cw-966  Environmental history of the Cold War
    cw-967  The Cold War in national historiographies
    cw-968  Whether the Cold War is a useful category
    cw-969  When historians say the Cold War ended
    cw-970  Counterfactuals and the Cold War
    cw-971  Intention against structure as an explanation
    cw-972  Evidence, secrecy and the historian
    cw-973  What is still not known

### Memory and the present — `cw-memory`

    cw-974  Remembering the Cold War
    cw-975  Museums of the Cold War
    cw-976  Bunkers and their afterlives
    cw-977  The Berlin Wall as a relic
    cw-978  Checkpoint Charlie as a tourist site
    cw-979  Ostalgie
    cw-980  Nostalgia for the Soviet Union
    cw-981  Monuments and their removal
    cw-982  Renaming streets and cities
    cw-983  The Cold War in school curricula
    cw-984  Memory laws
    cw-985  Competing memories in Eastern Europe
    cw-986  The memory of 1956 and 1968
    cw-987  Memorials to the victims
    cw-988  The Cold War on screen since 1991
    cw-989  The Cold War in popular history
    cw-990  Cold War terminology in present-day politics
    cw-991  A new Cold War as a phrase
    cw-992  Whether the comparison is useful
    cw-993  Great-power rivalry since 2001
    cw-994  Russia and the West after 2014
    cw-995  China, the United States and the analogy
    cw-996  Nuclear risk in the present
    cw-997  What the Cold War teaches about deterrence
    cw-998  What the Cold War teaches about proxy war
    cw-999  What the Cold War teaches about ending a conflict
    cw-1000  Reading the Cold War now
