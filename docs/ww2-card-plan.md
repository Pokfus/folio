# The Second World War — the 1000-card plan

The running order for the `ww2` collection. Every card has a number, a topic and a deck, fixed in
advance, so the collection can be grown one card at a time across many sessions without anyone having
to remember where it had got to.

Not part of the site.

**This is the first collection whose subject is an event rather than a place.** Greece, Rome, Russia,
India, China and Egypt are countries and regions; World History is a survey. This one is a war, and that
changes the shape of the tree — see "What kind of collection this is" below. It is also the collection
`docs/world-history-card-plan.md` anticipated when it held the twentieth century to 130 cards on the
grounds that "a reader who wants the Somme in depth is served by a war collection rather than by a world
survey".

## How to use this (the whole point of the file)

**"Generate the next Second World War card" means: take the lowest `ww2-NNN` that is not yet in
`data.js`, read its topic and deck from the list below, research it, and add it.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));
      for(let i=1;i<=1000;i++){const id='ww2-'+String(i).padStart(3,'0');
      if(!h.has(id)){console.log('next:',id);break}}"

There is deliberately **no separate progress file**. `data.js` is the record of what exists, this file
is the record of what is planned, and the next card is whatever falls between them — so the two can
never disagree about where the work has got to.

Then write the card to the rules in CLAUDE.md ("Generating cards & glossary entries") and add it with:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** `add-card.js` falls back to the first leaf in the whole tree when it is
omitted, which is `cn-myth`, in the China collection.

The prefix is **`ww2-`**, which breaks the two-letter convention (`gr-`, `ru-`, `in-`, `eg-`) because
there is no sensible two-letter code for a war and `wh-` is already World History. Numbering runs past
999, so ids are not all the same length: `ww2-001` … `ww2-999`, then `ww2-1000`. The command above pads
to three digits, which is right for every id but the last.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `ww2-464 Battle of Midway` is already an answer term; `ww2-750 The intentionalist and
functionalist debate` is an argument to describe, and the card's actual answer — the word that gets
blanked — is chosen while writing it, from what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** Some will turn out
to be thinner than they look, and a few will turn out to be two cards. When that happens, change the
line here in the same commit as the card, and say so — this file is only useful while it is true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

Card ids run `ww2-001` … `ww2-1000`, in the order below, following the tree. The order is broadly
chronological but the theatres run in parallel, so a deck's range is not a claim about sequence:
`ww2-401`, the war in China, opens in 1937, before most of the European decks that precede it. Cards
sort on the study page by `cardYears(answerDate)`, not by id, so a reader studying the whole collection
meets the war roughly as it happened.

## Making the collection

**The id is `ww2` and the title is "The Second World War".** The British form rather than "World War
II", because the site's register is British throughout (`dayLocale()` is en-GB) and because World
History's own deck is already titled `wh-ww2 The Second World War`. Two names for one subject inside one
site is how a reader ends up searching for the wrong thing.

**The hue is `#4A4038`, a dark iron**, added to `COLL_THEME`, and it was measured rather than picked.
Every existing collection hue is a saturated colour; a desaturated dark neutral is both distinctive
against them and right for the subject. In CIELAB it sits **30.9 from its nearest neighbour** against a
tightest existing pair of 12.9, which is the best of the sober candidates — the greys and slates all
crowd within 15–24 of Greece's Aegean blue — and its lightness (L\* 28) sits inside the existing range
beside the United States' navy at 29.

**There is no `COLLECTION_NUMERALS` entry**, as for World History, Egypt and the United States. There is
no script this collection could plausibly count in.

## What kind of collection this is

A war is not a country, and three things follow that the other plans did not have to decide.

**The theatres run in parallel, so the tree is not a single chronological spine.** Decks 2 to 5 cover
the same years from four directions — Europe 1939–41, the Eastern Front, Asia and the Pacific, and the
Western Allies' campaigns — and a reader moving through them will cross 1942 four times. The
alternative, one strictly chronological sequence interleaving all theatres, is how the war is often
narrated and it makes each campaign impossible to follow. The **`answerDate` sort puts them back in
order** for anyone studying the whole collection, which is what that sort is for.

**There is no "society and culture" deck of the usual kind.** Its place is taken by the home fronts, the
occupied territories, the war economies and the technology — the things a war has instead.

**The prelude starts in 1919, not 1933.** The collection gives 140 cards to the road to war, and the
first 35 of them are the peace settlement, because the origins of the Second World War are in the
ending of the First and not only in the rise of one party. Where exactly the prelude begins is itself
an argument, and `ww2-001 The origins of the Second World War` and `ww2-140 Was the war inevitable?`
bracket it deliberately.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| The Road to War | The peace that failed | 35 | ww2-001–035 |
| | Fascism, Nazism and the crisis of democracy | 45 | ww2-036–080 |
| | Japan and the road to war in Asia | 25 | ww2-081–105 |
| | The crises of the 1930s | 35 | ww2-106–140 |
| The War in Europe, 1939–1941 | Poland and the outbreak | 30 | ww2-141–170 |
| | The fall of the West | 40 | ww2-171–210 |
| | Britain alone | 30 | ww2-211–240 |
| | The Mediterranean and the Balkans | 20 | ww2-241–260 |
| The Eastern Front | Barbarossa and 1941 | 40 | ww2-261–300 |
| | Stalingrad and the turn | 35 | ww2-301–335 |
| | Kursk to the Vistula | 35 | ww2-336–370 |
| | The road to Berlin | 30 | ww2-371–400 |
| The War in Asia and the Pacific | The war in China | 35 | ww2-401–435 |
| | Pearl Harbor and Japan's expansion | 35 | ww2-436–470 |
| | The Pacific counter-offensive | 40 | ww2-471–510 |
| | Burma, India and Southeast Asia | 30 | ww2-511–540 |
| The Western Allies at War | The Battle of the Atlantic | 28 | ww2-541–568 |
| | North Africa and Italy | 35 | ww2-569–603 |
| | The air war over Europe | 30 | ww2-604–633 |
| | Normandy to the Elbe | 27 | ww2-634–660 |
| Occupation, Resistance and the Holocaust | Occupation and collaboration | 40 | ww2-661–700 |
| | Resistance | 30 | ww2-701–730 |
| | The Holocaust | 60 | ww2-731–790 |
| | Other crimes and mass violence | 30 | ww2-791–820 |
| Home Fronts, Science and Society | The home fronts | 35 | ww2-821–855 |
| | War economies and production | 25 | ww2-856–880 |
| | Technology, intelligence and science | 35 | ww2-881–915 |
| | Soldiers, prisoners and civilians | 15 | ww2-916–930 |
| Endings and Reckonings | The defeat of Japan | 30 | ww2-931–960 |
| | Reckonings and legacies | 40 | ww2-961–1000 |

Deck totals: The Road to War 140 · The War in Europe 1939–1941 120 · The Eastern Front 140 ·
The War in Asia and the Pacific 140 · The Western Allies at War 120 ·
Occupation, Resistance and the Holocaust 160 · Home Fronts, Science and Society 110 ·
Endings and Reckonings 70. **1000.**

## What the weighting is arguing

**The Eastern Front gets 140 cards and the Western Allies' campaigns get 120.** That will look wrong to
a reader raised on the Anglophone account, and it is the plan's central argument. The war in Europe was
decided in the east: the great majority of German army casualties were inflicted there, the Wehrmacht
was broken at Stalingrad, Kursk and in Operation Bagration, and the Red Army took Berlin. A course that
gives Normandy more room than Bagration is not describing the war, it is describing one country's memory
of it.

**The war in Asia gets 140, and 35 of those are the war in China.** The Second World War in Asia began
in 1937 and ran for eight years, most of it in China, and it is the most systematically underweighted
theatre in Western teaching. Note the counterpart: `docs/china-card-plan.md` gives the same war 25 cards
from China's own side, and the two are written differently — see the pairs table.

**The Holocaust gets 60 cards and its deck 160.** See the decisions below. This is not a proportion
derived from anything; it is a judgement that the murder of six million people is not a chapter of the
Eastern Front, and that sixty cards is the least that lets it be taught as history rather than as a
number.

**The Road to War gets 140.** Understanding how the war began is most of what a reader can actually use,
and the origins are where the historiography is richest and the popular account thinnest.

**The Western Allies keep 120 and it is enough.** Normandy, the Atlantic, North Africa, Italy and the
bombing offensive are all here in proper detail. What they do not get is the two-fifths of the
collection an Anglophone syllabus would give them.

## Six decisions this plan forced on the tree

**The Holocaust is a subdeck of 60 cards, not a chapter inside the Eastern Front.** It happened
alongside the war, was enabled by it, and was carried out by a state at war — but it was not a military
operation and filing it as one is the commonest structural mistake a war course makes. The subdeck is
built to teach it as history: the origins in prewar policy, the ghettos, the mass shootings in the
occupied Soviet Union, the decision, the camps and the process, the destruction of specific
communities, the perpetrators, what the Allies knew, the survivors, and **the evidence**. It ends with
`ww2-788 The evidence for the Holocaust`, `ww2-789 Holocaust denial and why it fails` and `ww2-790
Holocaust memory`, in that order, because the evidence has to come before the denial for the denial card
to be a card about history rather than a platform.

Two rules for writing it, and they are not optional. **No false balance**: the Holocaust is not a matter
on which scholarship is divided, and the genuine historiographical arguments within it — intentionalist
against functionalist, the role of the Wehrmacht, the reach of local collaboration — are arguments about
mechanism and are carded as such. **No sensationalism**: this material does not need heightening, and
heightening it is a way of not looking at it. The register is the same plain one the rest of the site
uses.

**Other crimes get their own subdeck of 30, and it is not a levelling exercise.** The Roma genocide,
the murder of disabled people, the treatment of Soviet prisoners of war, Japanese war crimes, the
Volhynia massacres, the Soviet massacres of 1941 and the bombing of civilians are all in the collection
because they happened and a reader should know they did. Putting them in one subdeck is a filing
decision, not a claim that they are equivalent to each other or to the Holocaust, and the cards do not
make that claim.

**Occupation gets 40 cards and collaboration is treated as a subject, not an accusation.** For most
Europeans the war was an occupation rather than a campaign, and the interesting questions — why people
collaborated, what the range of behaviour actually was, how the postwar reckonings decided who counted
as what — are questions the moralised version cannot ask.

**The Battle of the Atlantic gets its own subdeck.** It ran the entire length of the war in Europe, it
was the one campaign that could have lost Britain the war outright, and split across the naval and
Western decks it would have disappeared into both.

**The German surrender is carded in `ww2-berlin`, at the end of the Eastern Front deck.** VE Day belongs
to everyone and the Western advance is in `ww2-normandy`, but the war in Europe ended where Berlin fell,
and putting the surrender anywhere else would make the tree argue with the weighting above.

**Deck 8 has no "defeat of Germany" subdeck** for the same reason, and 70 cards for the ending because
the aftermath is not the collection's subject: Nuremberg, the occupation, the displaced persons and the
origins of the Cold War are carded as the war's consequences, and everything past about 1948 belongs to
the collections that own it.

## History, not commemoration — and the four pulls

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Archaeology is not the pull here; four other
things are, and `docs/world-history-card-plan.md` names the first of them.

**Commemoration.** The trap for the modern decks is "writing the card that a memorial writes". A card on
D-Day states what was planned, what happened, what it cost and what it achieved, in the register of the
rest of the site. Heroism is a thing people did, not a tone to write in.

**National memory.** Every combatant nation has a version of this war that flatters it, and most of the
accessible material is written inside one of them. The British Blitz spirit, the American good war, the
French résistancialisme that made collaboration a minority aberration, the Soviet and now Russian Great
Patriotic War, the Japanese victim narrative and the German clean Wehrmacht are all carded — as
**subjects** (`ww2-229`, `ww2-295`, `ww2-393`, `ww2-982`, `ww2-995`), because how a war is remembered is
part of its history, and never as the register the collection is written in.

**Denial and myth.** Holocaust denial, the clean Wehrmacht, and the various claims that some atrocity
did not happen or was provoked are not scholarly positions and are not treated as ones. The site's
citation bar does most of the work here. The rule is Egypt's: **a card that debunks is a card about the
nonsense; a card that explains is a card about the war.** `ww2-788` and `ww2-789` are in that order for
exactly this reason.

**Live political use.** The war is argued about in the present — over Russia's account of it, over
Japanese textbooks, over what is owed and to whom — and cards touching those arguments state what the
scholarship supports and say who disputes it. **No state's account of its own actions is repeated as
established fact**, which is the rule the Russia plan sets and this collection needs more than any other.

**Modern scholars are capped at two in the thousand and the plan spends none.** There is no event here
of the kind that earns Greece its Linear B card: the war was not lost and recovered. The places a
scholar was nearly earned are the Holocaust historiography and the origins debate, and both are carded
as arguments (`ww2-732`, `ww2-750`, `ww2-120`, `ww2-998`) rather than as people.

## Names, dates and figures

**Names.** Operations take their code names where those are what the events are called (Barbarossa,
Overlord, Bagration) and plain descriptions where they are not. Places take the name current at the
time with the modern name given where it differs and matters — Danzig and Gdańsk, Königsberg and
Kaliningrad, Breslau and Wrocław, Lwów, Lviv and Lemberg. As in the Russia and India plans, **a spelling
is not an argument and must not be made to do one silently**; where the choice carries weight the card
says so in a clause.

**Dates.** Straightforward, and the one thing to watch is that the war has several start dates depending
on where you stand — 1937 in China, 1939 in Europe, 1940 for the Western Europeans invaded that year,
1941 for the Soviet Union and the United States. `ww2-001` says so.

**Figures.** Casualty and mortality figures for this war are contested and the disagreements run to
millions. Soviet war dead, Chinese war dead, civilian deaths under occupation, the toll of the strategic
bombing and the numbers killed at individual camps all have live scholarly ranges. **Give the range and
name whose it is**, and never pick the highest or lowest number available and state it flat. Three cards
exist to teach this directly: `ww2-390 Soviet casualties and their counting`, `ww2-818 Counting the
dead` and `ww2-962 The dead of the Second World War`.

## Sourcing

Better served than any other collection here, and with a specific hazard.

**The scholarship is enormous, open and current** — university repositories, the national archives of
most combatants, the Imperial War Museum, the United States Holocaust Memorial Museum, Yad Vashem, the
Bundesarchiv, and the published trial records of Nuremberg and Tokyo, which are primary sources for the
crimes and are in print and online in full.

**The hazard is that this subject has more bad material online than any other on the site**, and some of
it is dressed as scholarship: denial sites, unit-history enthusiasm that launders the Waffen-SS, and
national-memory advocacy from several directions. The citation bar is the defence, and it should be
applied more strictly here than anywhere: a peer-reviewed work, a national archive, a museum with a
research department, or an intergovernmental record — opened and read — or the claim does not ship.

**Memoirs and testimony are evidence and need handling as such.** Survivor testimony is indispensable
for the Holocaust and the camps and is not interchangeable with a secondary source; commanders' memoirs
are frequently self-serving, and several influential German generals' accounts were written to shape
the record. Cite them as what they are.

## Living beside the other collections

**World History is the survey and never waits for this collection.** The war gets 30 cards there
(`wh-916`–`wh-945`) against 1000 here, at survey altitude, and the interwar and Cold War decks sit
either side of it.

**Six collections already card these same events, and the pairs should be written deliberately
differently:**

| subject | elsewhere | here |
|---|---|---|
| the Eastern Front | `ru-656`–`ru-690` — the Great Patriotic War, a Soviet national experience and its memory | `ww2-261`–`ww2-400` — the theatre where the European war was decided |
| Katyn | `ru-658` — a Soviet crime and a Soviet lie maintained for fifty years | `ww2-155`, `ww2-326` — an atrocity, and the discovery that broke the Allied coalition's Polish policy |
| the war in China | `cnh-631`–`cnh-655` — eight years that reshaped China and set up its civil war; `jp-728`–`jp-734` — what the army did and what it could not win | `ww2-401`–`ww2-435` — the war's largest and longest land theatre |
| the defeat of Japan | `jp-741`–`jp-770`, `jp-771`–`jp-800` — a war Japan's own planners did not expect to win, and the occupation that followed | `ww2-931`–`ww2-960` — the last campaign of the Pacific war |
| the atomic bombings | `us-840`–`us-842`, `us-851`–`us-853` — an American undertaking, and the argument Americans have had about it since | `ww2-938`, `ww2-939`, `ww2-945`, `ww2-946` — the event, and the two arguments about it |
| Pearl Harbor and the Pacific | `us-828`, `us-843`–`us-846` — what the war did to a country that had been arguing about staying out | `ww2-441`–`ww2-510` — the theatre and the campaign |
| Japanese American internment | `us-833`, `us-834` — a constitutional question the Supreme Court got wrong and said so fifty years later | `ww2-508` — one of the war's civilian internments |
| the Bengal famine | `in-575` — a famine in British India and its causes | `ww2-524`, `ww2-525` — a wartime famine in a theatre of war |
| the Holocaust | `ru-671` — the Holocaust in the Soviet Union, from the Soviet side | `ww2-731`–`ww2-790` — the whole of it |

Write the card its own collection needs.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `ww2-155 Katyn massacre` → also `ww2-crimes`
- `ww2-319 Lend-Lease to the Soviet Union`, `ww2-320 The Arctic convoys` → also `ww2-atlantic`
- `ww2-419 Unit 731`, `ww2-421 Comfort women` → also `ww2-crimes`
- `ww2-508 Japanese American internment` → also `ww2-home-fronts`
- `ww2-629 V-1 flying bomb`, `ww2-630 V-2 rocket` → also `ww2-technology`
- `ww2-719 Warsaw Ghetto Uprising`, `ww2-722 Sobibor and Treblinka uprisings` → also `ww2-holocaust`
- `ww2-909`–`ww2-912`, the atomic bomb project → also `ww2-japan-end`

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`).

The glossary's coverage here is the modern countries and nothing else — every combatant is present as a
country term from Phase 3 of the citation pass, and there is no `Blitzkrieg`, no `Wehrmacht`, no
`Holocaust`, no `Lend-Lease`. Write those **cited from the start**, at the `GLOSS_SRC_TARGET` bar of 2.

Three traps. **A term whose surface is an ordinary English word** — `Resistance`, `Occupation`,
`Liberation`, `Blitz`, `Ultra`, `Magic`, `Enigma`, `Overlord` — needs `GLOSSARY_CASESENSITIVE` or a
narrower head word, and this collection has a great many of them because operation code names were
chosen to be ordinary words. **Operation names need their full form as the head word** (`Operation
Barbarossa`, not `Barbarossa`) for the same reason. And **the Holocaust terms need particular care in a
three-sentence description**: a glossary entry is the shortest thing on the site and the least room in
which to be careless, so those descriptions should be drafted from the museum and memorial-institution
definitions, which exist precisely because the wording matters.

---

# The list

## The Road to War

### The peace that failed — `ww2-versailles`

    ww2-001  The origins of the Second World War
    ww2-002  The end of the First World War
    ww2-003  Paris Peace Conference
    ww2-004  Treaty of Versailles
    ww2-005  The war guilt clause
    ww2-006  German reparations
    ww2-007  The territorial settlement in Europe
    ww2-008  The successor states of Central Europe
    ww2-009  Treaty of Trianon
    ww2-010  The Ottoman settlement and the Treaty of Lausanne
    ww2-011  League of Nations mandate
    ww2-012  League of Nations
    ww2-013  The absence of the United States
    ww2-014  Stab-in-the-back myth
    ww2-015  Weimar Republic
    ww2-016  The German revolution of 1918–1919
    ww2-017  The early challenges to the Weimar Republic
    ww2-018  Occupation of the Ruhr
    ww2-019  Hyperinflation in the Weimar Republic
    ww2-020  Dawes Plan
    ww2-021  Locarno Treaties
    ww2-022  Kellogg-Briand Pact
    ww2-023  The Weimar recovery
    ww2-024  Soviet Russia and the postwar order
    ww2-025  Treaty of Rapallo
    ww2-026  Washington Naval Conference
    ww2-027  Interwar disarmament and its failure
    ww2-028  Italy after the First World War
    ww2-029  The mutilated victory
    ww2-030  Japan and the Paris settlement
    ww2-031  The racial equality proposal
    ww2-032  The interwar international economy
    ww2-033  Wall Street crash of 1929
    ww2-034  Great Depression
    ww2-035  The Depression and the crisis of the liberal order

### Fascism, Nazism and the crisis of democracy — `ww2-fascism`

    ww2-036  Fascism
    ww2-037  Benito Mussolini
    ww2-038  March on Rome
    ww2-039  The Italian Fascist state
    ww2-040  The corporate state
    ww2-041  The cult of the Duce
    ww2-042  Second Italo-Ethiopian War
    ww2-043  Nazism
    ww2-044  Adolf Hitler
    ww2-045  The early Nazi Party
    ww2-046  Beer Hall Putsch
    ww2-047  Mein Kampf
    ww2-048  Nazi ideology
    ww2-049  Nazi antisemitism
    ww2-050  Lebensraum
    ww2-051  Nazi racial theory
    ww2-052  The Nazi electoral breakthrough
    ww2-053  The collapse of Weimar democracy
    ww2-054  Hitler's appointment as chancellor
    ww2-055  Reichstag fire
    ww2-056  Enabling Act of 1933
    ww2-057  Gleichschaltung
    ww2-058  The destruction of the German parties and unions
    ww2-059  Night of the Long Knives
    ww2-060  The Führer state
    ww2-061  Schutzstaffel
    ww2-062  Gestapo
    ww2-063  The early Nazi concentration camps
    ww2-064  Nazi propaganda
    ww2-065  Joseph Goebbels
    ww2-066  Nazi book burnings
    ww2-067  The Aryan Paragraph
    ww2-068  Nuremberg Laws
    ww2-069  Kristallnacht
    ww2-070  Évian Conference
    ww2-071  Voyage of the St. Louis
    ww2-072  Aktion T4
    ww2-073  Paragraph 175
    ww2-074  The Confessing Church
    ww2-075  The reintroduction of conscription
    ww2-076  Hjalmar Schacht
    ww2-077  The Four Year Plan
    ww2-078  Volksgemeinschaft
    ww2-079  Hitler Youth
    ww2-080  The Swing Kids

### Japan and the road to war in Asia — `ww2-asia-road`

    ww2-081  Empire of Japan
    ww2-082  Japanese imperialism before 1931
    ww2-083  Korea under Japanese rule
    ww2-084  Taishō democracy and its collapse
    ww2-085  The Japanese army and politics
    ww2-086  Japanese ultranationalism
    ww2-087  Mukden Incident
    ww2-088  The Japanese occupation of Manchuria
    ww2-089  Manchukuo
    ww2-090  Lytton Report
    ww2-091  Japan's withdrawal from the League of Nations
    ww2-092  February 26 Incident
    ww2-093  The Japanese decision for expansion
    ww2-094  Greater East Asia Co-Prosperity Sphere
    ww2-095  Marco Polo Bridge Incident
    ww2-096  The outbreak of the Second Sino-Japanese War
    ww2-097  Battle of Shanghai
    ww2-098  Nanjing Massacre
    ww2-099  The Chinese united front against Japan
    ww2-100  Soviet-Japanese border conflicts
    ww2-101  Battles of Khalkhin Gol
    ww2-102  The strike-north and strike-south debate
    ww2-103  Anti-Comintern Pact
    ww2-104  Tripartite Pact
    ww2-105  Japan and the Western empires in Asia

### The crises of the 1930s — `ww2-crisis`

    ww2-106  The collapse of collective security
    ww2-107  The Manchurian crisis and the League
    ww2-108  Abyssinia Crisis
    ww2-109  Hoare-Laval Pact
    ww2-110  Remilitarisation of the Rhineland
    ww2-111  Spanish Civil War
    ww2-112  Foreign intervention in the Spanish Civil War
    ww2-113  Bombing of Guernica
    ww2-114  The Non-Intervention Committee
    ww2-115  Rome-Berlin Axis
    ww2-116  Anschluss
    ww2-117  The Sudeten crisis
    ww2-118  Munich Agreement
    ww2-119  Appeasement
    ww2-120  The debate over appeasement
    ww2-121  Neville Chamberlain
    ww2-122  The German occupation of Czechoslovakia
    ww2-123  The British guarantee to Poland
    ww2-124  Italian invasion of Albania
    ww2-125  Pact of Steel
    ww2-126  The Anglo-French-Soviet negotiations of 1939
    ww2-127  Molotov-Ribbentrop Pact
    ww2-128  The secret protocol
    ww2-129  Why the Soviet Union signed
    ww2-130  The Danzig crisis
    ww2-131  American isolationism
    ww2-132  Neutrality Acts of the 1930s
    ww2-133  Franklin D. Roosevelt and the approach of war
    ww2-134  Maginot Line
    ww2-135  British rearmament
    ww2-136  Interwar military thought
    ww2-137  The development of armoured warfare
    ww2-138  Interwar air power theory
    ww2-139  The armies of 1939 compared
    ww2-140  Was the war inevitable?

## The War in Europe, 1939–1941

### Poland and the outbreak — `ww2-poland`

    ww2-141  Invasion of Poland
    ww2-142  Gleiwitz incident
    ww2-143  The Polish army in 1939
    ww2-144  The September campaign
    ww2-145  Siege of Warsaw
    ww2-146  The Soviet invasion of Poland
    ww2-147  The fourth partition of Poland
    ww2-148  The Anglo-French declarations of war
    ww2-149  Phoney War
    ww2-150  The beginning of the German occupation of Poland
    ww2-151  General Government
    ww2-152  Nazi policy towards Poles
    ww2-153  Intelligenzaktion
    ww2-154  The Soviet occupation of eastern Poland
    ww2-155  Katyn massacre
    ww2-156  Soviet deportations from occupied Poland
    ww2-157  Polish government-in-exile
    ww2-158  The Polish armed forces in the West
    ww2-159  Winter War
    ww2-160  The Moscow Peace Treaty
    ww2-161  The Soviet annexation of the Baltic states
    ww2-162  The Soviet annexation of Bessarabia
    ww2-163  The Allied plans for Scandinavia
    ww2-164  Operation Weserübung
    ww2-165  The German invasion of Denmark and Norway
    ww2-166  Battles of Narvik
    ww2-167  The Norway Debate
    ww2-168  Winston Churchill
    ww2-169  The naval war in the first year
    ww2-170  Battle of the River Plate

### The fall of the West — `ww2-west-1940`

    ww2-171  Battle of France
    ww2-172  Fall Gelb
    ww2-173  The Allied plans of 1940
    ww2-174  The breakthrough at Sedan
    ww2-175  The Ardennes and the Allied assumptions about it
    ww2-176  Blitzkrieg
    ww2-177  The debate over the word Blitzkrieg
    ww2-178  Heinz Guderian
    ww2-179  Erich von Manstein
    ww2-180  The German panzer divisions of 1940
    ww2-181  The French army in 1940
    ww2-182  The failure of French command
    ww2-183  The German invasion of the Low Countries
    ww2-184  Rotterdam Blitz
    ww2-185  The Dutch and Belgian capitulations
    ww2-186  The encirclement in the north
    ww2-187  Dunkirk evacuation
    ww2-188  The halt order
    ww2-189  The Italian entry into the war
    ww2-190  The fall of Paris
    ww2-191  The French exodus of 1940
    ww2-192  Armistice of 22 June 1940
    ww2-193  Vichy France
    ww2-194  Philippe Pétain
    ww2-195  The French empire divided
    ww2-196  Free France
    ww2-197  Charles de Gaulle
    ww2-198  Attack on Mers-el-Kébir
    ww2-199  The Channel Islands under German occupation
    ww2-200  Explaining the fall of France
    ww2-201  Britain's position after the fall of France
    ww2-202  The British decision to fight on
    ww2-203  Destroyers-for-bases deal
    ww2-204  Lend-Lease
    ww2-205  Atlantic Charter
    ww2-206  American opinion in 1940 and 1941
    ww2-207  German planning for the invasion of Britain
    ww2-208  Operation Sea Lion
    ww2-209  Was there a Blitzkrieg economy?
    ww2-210  Hitler's strategic choice after France

### Britain alone — `ww2-britain`

    ww2-211  Battle of Britain
    ww2-212  RAF Fighter Command
    ww2-213  Dowding system
    ww2-214  Chain Home
    ww2-215  Hugh Dowding
    ww2-216  The Luftwaffe in 1940
    ww2-217  The attack on the airfields
    ww2-218  The crisis of Fighter Command
    ww2-219  The switch to bombing London
    ww2-220  Battle of Britain Day
    ww2-221  The Few
    ww2-222  Polish and Commonwealth pilots in the Battle of Britain
    ww2-223  The Blitz
    ww2-224  The failure of the Blitz
    ww2-225  Coventry Blitz
    ww2-226  British civil defence
    ww2-227  Air raid shelters
    ww2-228  The evacuation of British children
    ww2-229  The myth of the Blitz spirit
    ww2-230  The British war cabinet
    ww2-231  Churchill as war leader
    ww2-232  The BBC and wartime broadcasting
    ww2-233  The British Empire and Commonwealth at war
    ww2-234  Canada in the Second World War
    ww2-235  Australia and New Zealand at war
    ww2-236  South Africa in the Second World War
    ww2-237  The Empire Air Training Scheme
    ww2-238  African troops in the Allied armies
    ww2-239  The Caribbean and the war
    ww2-240  The British war economy in 1940 and 1941

### The Mediterranean and the Balkans — `ww2-mediterranean-early`

    ww2-241  The Mediterranean theatre
    ww2-242  Greco-Italian War
    ww2-243  The Greek defence of 1940
    ww2-244  Operation Compass
    ww2-245  The Italian defeat in Cyrenaica
    ww2-246  East African campaign
    ww2-247  Battle of Taranto
    ww2-248  Battle of Cape Matapan
    ww2-249  Siege of Malta
    ww2-250  The German intervention in the Balkans
    ww2-251  The Yugoslav coup of 1941
    ww2-252  The invasion of Yugoslavia
    ww2-253  The German invasion of Greece
    ww2-254  Battle of Crete
    ww2-255  The partition of Yugoslavia
    ww2-256  Independent State of Croatia
    ww2-257  The Anglo-Iraqi War and the Syria-Lebanon campaign
    ww2-258  Anglo-Soviet invasion of Iran
    ww2-259  The Persian Corridor
    ww2-260  Did the Balkans delay Barbarossa?

## The Eastern Front

### Barbarossa and 1941 — `ww2-barbarossa`

    ww2-261  Operation Barbarossa
    ww2-262  The German plan for the invasion of the Soviet Union
    ww2-263  The ideological character of the war in the East
    ww2-264  Generalplan Ost
    ww2-265  Hunger Plan
    ww2-266  Commissar Order
    ww2-267  The Red Army in June 1941
    ww2-268  The warnings Stalin ignored
    ww2-269  The purge of the Red Army and its effects
    ww2-270  The encirclement battles of 1941
    ww2-271  Battle of Białystok–Minsk
    ww2-272  Battle of Smolensk
    ww2-273  The Baltic states under German occupation
    ww2-274  First Battle of Kiev
    ww2-275  The German advance on Leningrad
    ww2-276  Siege of Leningrad
    ww2-277  The starvation of Leningrad
    ww2-278  The Road of Life
    ww2-279  Operation Typhoon
    ww2-280  Battle of Moscow
    ww2-281  The Soviet evacuation of industry
    ww2-282  The Soviet counter-offensive of December 1941
    ww2-283  Georgy Zhukov
    ww2-284  Stalin as war leader
    ww2-285  Stavka
    ww2-286  Soviet mobilisation
    ww2-287  Order No. 227
    ww2-288  Penal battalions and blocking detachments
    ww2-289  Soviet prisoners of war in German captivity
    ww2-290  The German occupation regime in the East
    ww2-291  Reichskommissariat Ostland and Ukraine
    ww2-292  Soviet partisans
    ww2-293  Collaboration in the occupied Soviet territories
    ww2-294  The Wehrmacht and the war of annihilation
    ww2-295  Clean Wehrmacht myth
    ww2-296  The German failure before Moscow
    ww2-297  German logistics in the East
    ww2-298  The winter of 1941–1942
    ww2-299  Case Blue
    ww2-300  The German drive to the Caucasus

### Stalingrad and the turn — `ww2-stalingrad`

    ww2-301  Battle of Stalingrad
    ww2-302  The German advance to the Volga
    ww2-303  The fighting inside Stalingrad
    ww2-304  Vasily Chuikov
    ww2-305  Operation Uranus
    ww2-306  The encirclement of the Sixth Army
    ww2-307  The airlift to Stalingrad
    ww2-308  Friedrich Paulus
    ww2-309  Operation Winter Storm
    ww2-310  The surrender at Stalingrad
    ww2-311  The significance of Stalingrad
    ww2-312  Stalingrad in memory
    ww2-313  The Caucasus campaign
    ww2-314  The Soviet winter offensive of 1942–1943
    ww2-315  Third Battle of Kharkov
    ww2-316  The rebuilding of the Red Army
    ww2-317  Soviet weapons production
    ww2-318  T-34
    ww2-319  Lend-Lease to the Soviet Union
    ww2-320  Arctic convoys
    ww2-321  Soviet women in combat roles
    ww2-322  Soviet wartime propaganda
    ww2-323  Soviet operational art and deep battle
    ww2-324  Soviet wartime deportations of nationalities
    ww2-325  The Polish question in 1943
    ww2-326  The discovery of the Katyn graves
    ww2-327  The break in Soviet-Polish relations
    ww2-328  The second front debate
    ww2-329  The Allied conferences of 1943
    ww2-330  Casablanca Conference
    ww2-331  Unconditional surrender
    ww2-332  Tehran Conference
    ww2-333  The Grand Alliance and its strains
    ww2-334  Allied war aims
    ww2-335  The turn of the war in 1943

### Kursk to the Vistula — `ww2-east-1943`

    ww2-336  Battle of Kursk
    ww2-337  Operation Citadel
    ww2-338  The Soviet defences at Kursk
    ww2-339  Battle of Prokhorovka
    ww2-340  The end of German offensive capability in the East
    ww2-341  The Soviet advance to the Dnieper
    ww2-342  Battle of the Dnieper
    ww2-343  The liberation of Kiev
    ww2-344  The German scorched earth policy
    ww2-345  The lifting of the siege of Leningrad
    ww2-346  The Crimean campaign of 1944
    ww2-347  Operation Bagration
    ww2-348  The destruction of Army Group Centre
    ww2-349  Deep operation
    ww2-350  The Soviet advance into Poland
    ww2-351  Warsaw Uprising
    ww2-352  The Red Army and the Warsaw Uprising
    ww2-353  Polish Committee of National Liberation
    ww2-354  The Soviet advance into the Balkans
    ww2-355  The Romanian coup of August 1944
    ww2-356  Bulgaria's change of sides
    ww2-357  The liberation of Yugoslavia
    ww2-358  Slovak National Uprising
    ww2-359  Siege of Budapest
    ww2-360  Finland's exit from the war
    ww2-361  The Baltic offensives of 1944
    ww2-362  The German army in retreat
    ww2-363  20 July plot
    ww2-364  Claus von Stauffenberg
    ww2-365  The German military opposition to Hitler
    ww2-366  The aftermath of the July plot
    ww2-367  Volkssturm
    ww2-368  Albert Speer and German war production
    ww2-369  Foreign forced labour in Germany
    ww2-370  Germany's position at the end of 1944

### The road to Berlin — `ww2-berlin`

    ww2-371  Vistula–Oder offensive
    ww2-372  The Soviet advance into Germany
    ww2-373  The flight and expulsion of Germans from the East
    ww2-374  Red Army violence against civilians in 1945
    ww2-375  East Prussian offensive
    ww2-376  Yalta Conference
    ww2-377  The Yalta agreements on Poland and Germany
    ww2-378  The debate over Yalta
    ww2-379  The Soviet advance into Hungary and Austria
    ww2-380  Battle of the Seelow Heights
    ww2-381  Battle of Berlin
    ww2-382  The defence of Berlin
    ww2-383  Führerbunker
    ww2-384  The death of Adolf Hitler
    ww2-385  Raising a Flag over the Reichstag
    ww2-386  The surrender of Berlin
    ww2-387  German Instrument of Surrender
    ww2-388  Victory in Europe Day
    ww2-389  The Soviet cost of the war
    ww2-390  Soviet casualties and their counting
    ww2-391  The Eastern Front in the balance of the war
    ww2-392  The Eastern Front in Western memory
    ww2-393  The Great Patriotic War in Soviet and Russian memory
    ww2-394  The returning Soviet prisoners
    ww2-395  Soviet filtration camps
    ww2-396  The Soviet occupation zone
    ww2-397  The Soviet seizure of German industry
    ww2-398  The Soviet Union's position in 1945
    ww2-399  The Eastern Front and the origins of the Cold War
    ww2-400  What the Eastern Front decided

## The War in Asia and the Pacific

### The war in China — `ww2-china-war`

    ww2-401  Second Sino-Japanese War
    ww2-402  China in 1937
    ww2-403  The Chinese Nationalist army
    ww2-404  The Chinese Communist forces in the war
    ww2-405  The retreat to Chongqing
    ww2-406  Chongqing as wartime capital
    ww2-407  Bombing of Chongqing
    ww2-408  Battle of Taierzhuang
    ww2-409  1938 Yellow River flood
    ww2-410  Battle of Wuhan
    ww2-411  The stalemate after 1938
    ww2-412  Japanese occupation policy in China
    ww2-413  Three Alls policy
    ww2-414  Wang Jingwei and the Nanjing government
    ww2-415  Collaboration in occupied China
    ww2-416  Hundred Regiments Offensive
    ww2-417  New Fourth Army incident
    ww2-418  The Communist base areas
    ww2-419  Unit 731
    ww2-420  Japanese biological and chemical warfare in China
    ww2-421  Comfort women
    ww2-422  Burma Road
    ww2-423  The Hump
    ww2-424  Flying Tigers
    ww2-425  Joseph Stilwell
    ww2-426  Chiang Kai-shek and the Allies
    ww2-427  Cairo Conference
    ww2-428  Chinese famine of 1942–1943
    ww2-429  Operation Ichi-Go
    ww2-430  The Chinese war economy
    ww2-431  Chinese civilian casualties
    ww2-432  Chinese wartime refugees
    ww2-433  The Japanese surrender in China
    ww2-434  The war and the Chinese Civil War
    ww2-435  The China theatre in the balance of the war

### Pearl Harbor and Japan's expansion — `ww2-japan-expansion`

    ww2-436  The Japanese decision for war with the West
    ww2-437  The Japanese move into southern Indochina
    ww2-438  The American oil embargo
    ww2-439  The Hull note
    ww2-440  Isoroku Yamamoto
    ww2-441  Attack on Pearl Harbor
    ww2-442  The planning of the Pearl Harbor raid
    ww2-443  The damage at Pearl Harbor
    ww2-444  The American declaration of war
    ww2-445  The German declaration of war on the United States
    ww2-446  Hitler's decision to declare war on America
    ww2-447  The Japanese offensive of 1941–1942
    ww2-448  The sinking of Prince of Wales and Repulse
    ww2-449  Malayan campaign
    ww2-450  Fall of Singapore
    ww2-451  The Japanese conquest of the Philippines
    ww2-452  Bataan Death March
    ww2-453  The Japanese conquest of the Dutch East Indies
    ww2-454  Battle of Hong Kong
    ww2-455  The Japanese invasion of Burma
    ww2-456  Bombing of Darwin
    ww2-457  The limits of Japanese expansion
    ww2-458  Japanese occupation policy in Southeast Asia
    ww2-459  Asian nationalism under Japanese occupation
    ww2-460  Allied prisoners of war of the Japanese
    ww2-461  Burma Railway
    ww2-462  Doolittle Raid
    ww2-463  Battle of the Coral Sea
    ww2-464  Battle of Midway
    ww2-465  The codebreaking behind Midway
    ww2-466  The significance of Midway
    ww2-467  Guadalcanal campaign
    ww2-468  The naval battles around Guadalcanal
    ww2-469  New Guinea campaign
    ww2-470  Kokoda Track campaign

### The Pacific counter-offensive — `ww2-pacific`

    ww2-471  Allied strategy in the Pacific
    ww2-472  Leapfrogging
    ww2-473  Douglas MacArthur
    ww2-474  Chester W. Nimitz
    ww2-475  The United States Navy in the Pacific
    ww2-476  Carrier warfare
    ww2-477  The American submarine campaign against Japan
    ww2-478  The destruction of the Japanese merchant fleet
    ww2-479  Aleutian Islands campaign
    ww2-480  Battle of Tarawa
    ww2-481  Gilbert and Marshall Islands campaign
    ww2-482  Battle of Saipan
    ww2-483  Battle of the Philippine Sea
    ww2-484  The fall of the Tojo government
    ww2-485  Battle of Peleliu
    ww2-486  Philippines campaign of 1944–1945
    ww2-487  Battle of Leyte Gulf
    ww2-488  Kamikaze
    ww2-489  Battle of Manila
    ww2-490  Battle of Iwo Jima
    ww2-491  Raising the Flag on Iwo Jima
    ww2-492  Battle of Okinawa
    ww2-493  Civilian deaths on Okinawa
    ww2-494  The American strategic bombing of Japan
    ww2-495  Bombing of Tokyo
    ww2-496  Curtis LeMay
    ww2-497  Japanese civilians under the bombing
    ww2-498  The collapse of Japanese war production
    ww2-499  Japanese wartime propaganda
    ww2-500  Korea and Taiwan in the Japanese war effort
    ww2-501  Forced labour in the Japanese empire
    ww2-502  The blockade of Japan
    ww2-503  Operation Downfall
    ww2-504  The Japanese peace feelers of 1945
    ww2-505  Potsdam Declaration
    ww2-506  The Pacific war and the American public
    ww2-507  Race and the Pacific war
    ww2-508  Internment of Japanese Americans
    ww2-509  442nd Infantry Regiment
    ww2-510  The Pacific theatre in the balance of the war

### Burma, India and Southeast Asia — `ww2-burma`

    ww2-511  Burma campaign
    ww2-512  The Allied retreat from Burma
    ww2-513  The conditions of the Burma theatre
    ww2-514  Chindits
    ww2-515  Orde Wingate
    ww2-516  The Arakan campaigns
    ww2-517  Battle of Imphal
    ww2-518  Battle of Kohima
    ww2-519  William Slim
    ww2-520  The reconquest of Burma
    ww2-521  British Indian Army in the Second World War
    ww2-522  India's war effort
    ww2-523  The Indian home front
    ww2-524  Bengal famine of 1943
    ww2-525  The causes of the Bengal famine
    ww2-526  Quit India Movement
    ww2-527  Subhas Chandra Bose
    ww2-528  Indian National Army
    ww2-529  The INA trials
    ww2-530  Burma under Japanese occupation
    ww2-531  Aung San
    ww2-532  Thailand in the Second World War
    ww2-533  French Indochina under Japanese occupation
    ww2-534  Vietnamese famine of 1945
    ww2-535  Việt Minh
    ww2-536  The Dutch East Indies under Japanese occupation
    ww2-537  The Philippines under Japanese occupation
    ww2-538  Malaya and Singapore under occupation
    ww2-539  Sook Ching
    ww2-540  The war and the end of empire in Asia

## The Western Allies at War

### The Battle of the Atlantic — `ww2-atlantic`

    ww2-541  Battle of the Atlantic
    ww2-542  Convoy system
    ww2-543  U-boat
    ww2-544  Karl Dönitz
    ww2-545  Wolfpack
    ww2-546  First Happy Time
    ww2-547  The mid-Atlantic gap
    ww2-548  Escort carriers and very long range aircraft
    ww2-549  Anti-submarine warfare
    ww2-550  ASDIC
    ww2-551  High-frequency direction finding
    ww2-552  Enigma and the U-boat war
    ww2-553  The convoy battles of early 1943
    ww2-554  Black May
    ww2-555  The defeat of the U-boats
    ww2-556  The merchant navies
    ww2-557  Liberty ship
    ww2-558  American wartime shipbuilding
    ww2-559  German surface raiders
    ww2-560  The sinking of the Bismarck
    ww2-561  Channel Dash
    ww2-562  Convoy PQ 17
    ww2-563  The Royal Canadian Navy in the Atlantic
    ww2-564  The Atlantic and Allied strategy
    ww2-565  The Atlantic and the British food supply
    ww2-566  Casualties of the Atlantic campaign
    ww2-567  Neutral shipping and the war at sea
    ww2-568  Why the Allies won the Atlantic

### North Africa and Italy — `ww2-north-africa`

    ww2-569  North African campaign
    ww2-570  Afrika Korps
    ww2-571  Erwin Rommel
    ww2-572  Siege of Tobruk
    ww2-573  Operation Crusader
    ww2-574  Battle of Gazala
    ww2-575  The fall of Tobruk
    ww2-576  First Battle of El Alamein
    ww2-577  Bernard Montgomery
    ww2-578  Second Battle of El Alamein
    ww2-579  The conditions of the desert war
    ww2-580  Operation Torch
    ww2-581  The Darlan deal
    ww2-582  Tunisian campaign
    ww2-583  Battle of Kasserine Pass
    ww2-584  The Axis surrender in Tunisia
    ww2-585  Allied invasion of Sicily
    ww2-586  The fall of Mussolini
    ww2-587  Armistice of Cassibile
    ww2-588  The German occupation of Italy
    ww2-589  Italian Social Republic
    ww2-590  Italian campaign
    ww2-591  Allied invasion of Italy
    ww2-592  Battle of Monte Cassino
    ww2-593  The destruction of the abbey of Monte Cassino
    ww2-594  Battle of Anzio
    ww2-595  The liberation of Rome
    ww2-596  Gothic Line
    ww2-597  Italian resistance movement
    ww2-598  The Italian civil war
    ww2-599  German reprisals in Italy
    ww2-600  The death of Mussolini
    ww2-601  The surrender in Italy
    ww2-602  The Mediterranean strategy debate
    ww2-603  What the Italian campaign achieved

### The air war over Europe — `ww2-air-war`

    ww2-604  Strategic bombing during the Second World War
    ww2-605  RAF Bomber Command
    ww2-606  Area bombing
    ww2-607  Arthur Harris
    ww2-608  Butt Report
    ww2-609  Combined Bomber Offensive
    ww2-610  The United States Eighth Air Force
    ww2-611  Daylight and night bombing compared
    ww2-612  Bombing of Hamburg
    ww2-613  The Battle of the Ruhr
    ww2-614  Operation Chastise
    ww2-615  Schweinfurt–Regensburg mission
    ww2-616  The crisis of the daylight offensive
    ww2-617  The long-range escort fighter
    ww2-618  Big Week
    ww2-619  The bombing Battle of Berlin
    ww2-620  Bombing of Dresden
    ww2-621  The debate over area bombing
    ww2-622  German air defences
    ww2-623  The defeat of the Luftwaffe
    ww2-624  German aircraft production under bombing
    ww2-625  The effects of bombing on German war production
    ww2-626  German civilian casualties of bombing
    ww2-627  United States Strategic Bombing Survey
    ww2-628  Bomber crews and their losses
    ww2-629  V-1 flying bomb
    ww2-630  V-2 rocket
    ww2-631  The V-weapons and forced labour
    ww2-632  The tactical air war
    ww2-633  Air power and the outcome of the war

### Normandy to the Elbe — `ww2-normandy`

    ww2-634  The planning of the second front
    ww2-635  Operation Overlord
    ww2-636  Operation Fortitude
    ww2-637  Atlantic Wall
    ww2-638  Normandy landings
    ww2-639  The D-Day beaches
    ww2-640  The airborne landings in Normandy
    ww2-641  Mulberry harbour
    ww2-642  Operation Overlord's breakout battles
    ww2-643  Battle for Caen
    ww2-644  Operation Cobra
    ww2-645  Falaise pocket
    ww2-646  Liberation of Paris
    ww2-647  Operation Dragoon
    ww2-648  The Allied advance to the German border
    ww2-649  Operation Market Garden
    ww2-650  Battle of the Scheldt
    ww2-651  The Allied supply problem
    ww2-652  Battle of the Bulge
    ww2-653  Malmedy massacre
    ww2-654  Dwight D. Eisenhower
    ww2-655  The broad front controversy
    ww2-656  Operation Plunder and the crossing of the Rhine
    ww2-657  Ruhr pocket
    ww2-658  The Western Allies' advance into Germany
    ww2-659  Elbe Day
    ww2-660  The Western Front in the balance of the war

## Occupation, Resistance and the Holocaust

### Occupation and collaboration — `ww2-occupation`

    ww2-661  German-occupied Europe
    ww2-662  The varieties of German occupation
    ww2-663  The economic exploitation of occupied Europe
    ww2-664  Forced labour under German rule
    ww2-665  Fritz Sauckel
    ww2-666  Requisitioning and hunger in occupied Europe
    ww2-667  Dutch famine of 1944–1945
    ww2-668  Great Famine of Greece
    ww2-669  German military administration in occupied France
    ww2-670  Vichy collaboration
    ww2-671  Milice
    ww2-672  Occupied Norway and Denmark
    ww2-673  Vidkun Quisling
    ww2-674  The occupied Low Countries
    ww2-675  Occupied Poland under German rule
    ww2-676  Germanisation
    ww2-677  The kidnapping of Polish children
    ww2-678  Protectorate of Bohemia and Moravia
    ww2-679  Reinhard Heydrich
    ww2-680  Operation Anthropoid
    ww2-681  Lidice massacre
    ww2-682  Occupied Yugoslavia
    ww2-683  Jasenovac concentration camp
    ww2-684  Axis occupation of Greece
    ww2-685  Collaboration and its motives
    ww2-686  Auxiliary police in occupied Europe
    ww2-687  Foreign volunteers in the Waffen-SS
    ww2-688  Everyday life under occupation
    ww2-689  The black market in occupied Europe
    ww2-690  Women under occupation
    ww2-691  Sexual violence in the Second World War
    ww2-692  Children in occupied Europe
    ww2-693  Reprisals and hostage-taking
    ww2-694  Oradour-sur-Glane massacre
    ww2-695  Ardeatine massacre
    ww2-696  German anti-partisan warfare
    ww2-697  Deportation and population transfer under German rule
    ww2-698  Neutral powers in the Second World War
    ww2-699  Spain, Portugal, Sweden and Switzerland in the war
    ww2-700  The end of occupation

### Resistance — `ww2-resistance`

    ww2-701  Resistance during the Second World War
    ww2-702  The forms of resistance
    ww2-703  French Resistance
    ww2-704  Jean Moulin
    ww2-705  Maquis
    ww2-706  Special Operations Executive
    ww2-707  Office of Strategic Services
    ww2-708  Allied support for resistance movements
    ww2-709  Polish Underground State
    ww2-710  Home Army
    ww2-711  Polish intelligence in the Second World War
    ww2-712  Yugoslav Partisans
    ww2-713  Josip Broz Tito
    ww2-714  The Chetniks and the Yugoslav civil war
    ww2-715  Greek Resistance
    ww2-716  Italian resistance fighters
    ww2-717  Resistance in Norway, Denmark and the Low Countries
    ww2-718  Jewish resistance in German-occupied Europe
    ww2-719  Warsaw Ghetto Uprising
    ww2-720  Jewish partisans
    ww2-721  Resistance inside the camps
    ww2-722  The Treblinka and Sobibór uprisings
    ww2-723  German resistance to Nazism
    ww2-724  White Rose
    ww2-725  The rescue of Jews in occupied Europe
    ww2-726  Rescue of the Danish Jews
    ww2-727  Righteous Among the Nations
    ww2-728  Women in the resistance
    ww2-729  The cost of resistance
    ww2-730  Resistance in postwar memory

### The Holocaust — `ww2-holocaust`

    ww2-731  The Holocaust
    ww2-732  The historiography of the Holocaust
    ww2-733  Antisemitism in Europe before 1933
    ww2-734  Nazi anti-Jewish policy, 1933–1939
    ww2-735  The Jews of Europe in 1939
    ww2-736  The Jews of occupied Poland
    ww2-737  Ghettos in Nazi-occupied Europe
    ww2-738  Warsaw Ghetto
    ww2-739  Łódź Ghetto
    ww2-740  Conditions in the ghettos
    ww2-741  Judenrat
    ww2-742  The territorial schemes and the Madagascar Plan
    ww2-743  Einsatzgruppen
    ww2-744  The mass shootings in the occupied Soviet Union
    ww2-745  Babi Yar
    ww2-746  The Wehrmacht and the mass shootings
    ww2-747  Local participation in the killings
    ww2-748  Holocaust by bullets
    ww2-749  The decision for the Final Solution
    ww2-750  The intentionalist and functionalist debate
    ww2-751  Wannsee Conference
    ww2-752  Operation Reinhard
    ww2-753  Bełżec, Sobibór and Treblinka
    ww2-754  Chełmno extermination camp
    ww2-755  Auschwitz concentration camp
    ww2-756  Auschwitz II-Birkenau
    ww2-757  The selections
    ww2-758  The gas chambers
    ww2-759  Zyklon B
    ww2-760  Sonderkommando
    ww2-761  The deportations
    ww2-762  The role of the railways
    ww2-763  Majdanek concentration camp
    ww2-764  The Nazi concentration camp system
    ww2-765  Extermination through labour
    ww2-766  IG Farben and Auschwitz
    ww2-767  Nazi human experimentation
    ww2-768  The plunder of Jewish property
    ww2-769  Aryanization
    ww2-770  The destruction of Polish Jewry
    ww2-771  The destruction of Soviet Jewry
    ww2-772  The deportation of the Jews of Hungary
    ww2-773  The Jews of France, Belgium and the Netherlands
    ww2-774  Anne Frank
    ww2-775  The Jews of Greece and the Balkans
    ww2-776  The Jews of Italy
    ww2-777  Denmark, Bulgaria and the limits of deportation
    ww2-778  The perpetrators
    ww2-779  Heinrich Himmler
    ww2-780  Adolf Eichmann
    ww2-781  The question of perpetrator motivation
    ww2-782  What the Allies knew
    ww2-783  The Allied response to the Holocaust
    ww2-784  The debate over bombing Auschwitz
    ww2-785  Death marches
    ww2-786  The liberation of the camps
    ww2-787  Survivors of the Holocaust
    ww2-788  The evidence for the Holocaust
    ww2-789  Holocaust denial and why it fails
    ww2-790  Holocaust memory

### Other crimes and mass violence — `ww2-crimes`

    ww2-791  War crimes in the Second World War
    ww2-792  Nazi persecution of Roma people
    ww2-793  Porajmos
    ww2-794  The Nazi murder of disabled people
    ww2-795  The persecution of gay men under Nazism
    ww2-796  Jehovah's Witnesses under Nazi persecution
    ww2-797  The treatment of Soviet prisoners of war
    ww2-798  Japanese war crimes
    ww2-799  The Japanese treatment of prisoners of war
    ww2-800  Japanese atrocities against Asian civilians
    ww2-801  Manila massacre
    ww2-802  Sandakan death marches
    ww2-803  Reprisal killings in occupied Europe
    ww2-804  The bombing of civilians
    ww2-805  The law of war and its collapse
    ww2-806  The Geneva Conventions in the Second World War
    ww2-807  Soviet crimes during the war
    ww2-808  The NKVD prisoner massacres of 1941
    ww2-809  Ethnic cleansing during the war
    ww2-810  Massacres of Poles in Volhynia and Eastern Galicia
    ww2-811  Wartime expulsions and population transfers
    ww2-812  Famine as an instrument of war
    ww2-813  The record of wartime sexual violence
    ww2-814  Nazi plunder of art and cultural property
    ww2-815  The destruction of cultural heritage
    ww2-816  Refugees and displacement during the war
    ww2-817  Civilian casualties of the Second World War
    ww2-818  Counting the dead
    ww2-819  Crimes against humanity
    ww2-820  Genocide

## Home Fronts, Science and Society

### The home fronts — `ww2-home-fronts`

    ww2-821  The home front in the Second World War
    ww2-822  Total war
    ww2-823  The British home front
    ww2-824  Rationing in the United Kingdom
    ww2-825  British women and war work
    ww2-826  The American home front
    ww2-827  American war mobilisation
    ww2-828  Women in American war work
    ww2-829  African Americans and the Second World War
    ww2-830  Double V campaign
    ww2-831  The German home front
    ww2-832  German women and the Nazi war effort
    ww2-833  Rationing and shortage in Germany
    ww2-834  Germany under bombing
    ww2-835  Life on the Soviet home front
    ww2-836  The Japanese home front in wartime
    ww2-837  Propaganda in the Second World War
    ww2-838  Wartime censorship
    ww2-839  Radio in the Second World War
    ww2-840  Film and the war
    ww2-841  War art and photography
    ww2-842  War correspondents
    ww2-843  Conscription in the Second World War
    ww2-844  Conscientious objection
    ww2-845  Children in wartime
    ww2-846  Education in wartime
    ww2-847  Public health in wartime
    ww2-848  Housing and bomb damage
    ww2-849  Crime and disorder in wartime
    ww2-850  Religion and the war
    ww2-851  Marriage and family life in wartime
    ww2-852  Internment of enemy aliens
    ww2-853  Refugees before and during the war
    ww2-854  Kindertransport
    ww2-855  The war and social change

### War economies and production — `ww2-war-economy`

    ww2-856  The economics of the Second World War
    ww2-857  The mobilisation of the war economies
    ww2-858  The American war economy
    ww2-859  American war production
    ww2-860  Arsenal of Democracy
    ww2-861  The German war economy
    ww2-862  The failure of German economic mobilisation
    ww2-863  The Soviet war economy in the balance
    ww2-864  The relocation of Soviet industry
    ww2-865  The British war economy
    ww2-866  The Japanese war economy
    ww2-867  Raw materials and the war
    ww2-868  Oil and the Second World War
    ww2-869  The Ploiești oilfields
    ww2-870  Synthetic fuel and rubber
    ww2-871  Food and agriculture at war
    ww2-872  Wartime finance and inflation
    ww2-873  Allied economic cooperation
    ww2-874  Shipping and the movement of supplies
    ww2-875  Labour in the wartime economies
    ww2-876  Slave labour and the German economy
    ww2-877  The exploitation of the occupied economies
    ww2-878  Allied and Axis production compared
    ww2-879  The economic balance of the war
    ww2-880  Did economics decide the war?

### Technology, intelligence and science — `ww2-technology`

    ww2-881  Technology during World War II
    ww2-882  Radar
    ww2-883  Cavity magnetron
    ww2-884  Sonar
    ww2-885  Military aircraft of the Second World War
    ww2-886  The jet engine and the Messerschmitt Me 262
    ww2-887  Tanks in the Second World War
    ww2-888  Infantry weapons of the Second World War
    ww2-889  Proximity fuze
    ww2-890  The German missile programme
    ww2-891  Peenemünde
    ww2-892  Military medicine in the Second World War
    ww2-893  Penicillin
    ww2-894  Blood transfusion and battlefield surgery
    ww2-895  Operations research
    ww2-896  Cryptanalysis in the Second World War
    ww2-897  Enigma machine
    ww2-898  Bletchley Park
    ww2-899  Alan Turing
    ww2-900  Ultra
    ww2-901  The Polish contribution to breaking Enigma
    ww2-902  Colossus computer
    ww2-903  Magic and the Japanese codes
    ww2-904  Code talker
    ww2-905  Military deception in the Second World War
    ww2-906  Espionage in the Second World War
    ww2-907  Double-Cross System
    ww2-908  Soviet intelligence and the Western Allies
    ww2-909  The race for the atomic bomb
    ww2-910  Manhattan Project
    ww2-911  J. Robert Oppenheimer
    ww2-912  Trinity nuclear test
    ww2-913  The German nuclear weapons programme
    ww2-914  Scientists and the moral questions of the war
    ww2-915  What the war did to science

### Soldiers, prisoners and civilians — `ww2-experience`

    ww2-916  The experience of combat
    ww2-917  Morale and motivation in the armies
    ww2-918  Combat stress reaction
    ww2-919  Military discipline and desertion
    ww2-920  Life in the wartime armies
    ww2-921  Prisoners of war in the Second World War
    ww2-922  Prisoner-of-war camps in Europe
    ww2-923  Escape and evasion
    ww2-924  Women in the armed forces
    ww2-925  Nurses and the medical services
    ww2-926  Merchant seamen and the civilian services
    ww2-927  Military casualties and their counting
    ww2-928  War graves and commemoration
    ww2-929  Letters home and wartime writing
    ww2-930  Demobilisation and coming home

## Endings and Reckonings

### The defeat of Japan — `ww2-japan-end`

    ww2-931  Japan in the summer of 1945
    ww2-932  The Japanese leadership and the question of surrender
    ww2-933  The Supreme War Council
    ww2-934  The Soviet mediation attempt
    ww2-935  Potsdam Conference
    ww2-936  The decision to use the atomic bomb
    ww2-937  The choice of targets
    ww2-938  Atomic bombing of Hiroshima
    ww2-939  Atomic bombing of Nagasaki
    ww2-940  The immediate effects of the bombings
    ww2-941  Hibakusha
    ww2-942  Radiation sickness and the long-term effects
    ww2-943  Soviet invasion of Manchuria
    ww2-944  The Soviet campaign against Japan
    ww2-945  The debate over what caused the Japanese surrender
    ww2-946  The debate over the morality of the atomic bombings
    ww2-947  Hirohito's surrender broadcast
    ww2-948  Kyūjō incident
    ww2-949  Surrender of Japan
    ww2-950  The ceremony aboard USS Missouri
    ww2-951  The Japanese surrenders across Asia
    ww2-952  Occupation of Japan
    ww2-953  Supreme Commander for the Allied Powers
    ww2-954  The emperor and the occupation
    ww2-955  The demobilisation of the Japanese empire
    ww2-956  The repatriation of Japanese from Asia
    ww2-957  The division of Korea
    ww2-958  The end of the Japanese empire
    ww2-959  Japanese casualties of the war
    ww2-960  Victory over Japan Day

### Reckonings and legacies — `ww2-aftermath`

    ww2-961  The human cost of the Second World War
    ww2-962  The dead of the Second World War
    ww2-963  Europe in ruins
    ww2-964  Displaced persons after the war
    ww2-965  The expulsion of Germans from Central and Eastern Europe
    ww2-966  Jewish survivors and the displaced persons camps
    ww2-967  The founding of the United Nations
    ww2-968  Potsdam Agreement
    ww2-969  Allied-occupied Germany
    ww2-970  Denazification
    ww2-971  Nuremberg trials
    ww2-972  The charges at Nuremberg
    ww2-973  The Nuremberg principles
    ww2-974  Subsequent Nuremberg trials
    ww2-975  International Military Tribunal for the Far East
    ww2-976  The limits of postwar justice
    ww2-977  The war crimes trials in occupied Europe
    ww2-978  The purges of collaborators
    ww2-979  Retribution after liberation
    ww2-980  Reparations and restitution
    ww2-981  Germany's reckoning with the Nazi past
    ww2-982  Japan's reckoning with the war
    ww2-983  Marshall Plan
    ww2-984  The division of Europe
    ww2-985  The origins of the Cold War
    ww2-986  The war and decolonisation
    ww2-987  The war and the founding of Israel
    ww2-988  Universal Declaration of Human Rights
    ww2-989  Genocide Convention
    ww2-990  The postwar international order
    ww2-991  The war and the welfare state
    ww2-992  Women after the war
    ww2-993  Veterans and their return
    ww2-994  War memorials of the Second World War
    ww2-995  National memories of the war
    ww2-996  The war in film and popular culture
    ww2-997  The uses and misuses of the war
    ww2-998  The historiography of the Second World War
    ww2-999  The sources and what they leave out
    ww2-1000 Why the Second World War still matters
