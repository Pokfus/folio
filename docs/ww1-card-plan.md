# The First World War — a 1000-card running order

The plan for `ww1`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the twenty-fifth of these and the fourteenth history collection. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical
and are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `ww1-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='ww1-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them.

The padding above is right for every id but the last: the ids are `ww1-001` … `ww1-999`, then
`ww1-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `ww1-295 Was Verdun a battle of attrition by design?` is an argument to describe, and the card's
actual answer — the word that gets blanked — is chosen while writing it, from what the sources will
support.

Where the research says the line is wrong, **change the line here in the same commit as the card**, and
say so. The house rule stands: never invent a date, a name or a definition.

**Twelve of the thousand lines are written as questions** and that is deliberate rather than sloppy.
Each is a place where the historiography is the subject and the answer term is the name of an
*argument* or a *document* rather than of an event — `ww1-110 The debate over the war's origins`,
`ww1-487 Who won Jutland`, `ww1-645 Did the war emancipate women`, `ww1-889 Was Germany defeated in
the field`, `ww1-950 When did the First World War end`. The Second World War plan uses the same shape
for `ww2-140 Was the war inevitable?` and for the same reason. **Twelve in a thousand is the ceiling,
not a licence**: a question-shaped line that turns out to have an ordinary answer term should be
retitled to that term, as that plan's own log shows happening twenty-nine times.

## Is there a thousand cards in this?

**Yes, and the risk is the opposite of the usual one.** Most plans on this shelf have to argue that
their subject is big enough. This one has to argue that it can be kept to a thousand: the war ran
fifty-two months, killed somewhere near ten million soldiers and a comparable number of civilians,
was fought on five continents by thirty-odd states, and is one of the two or three best-documented
events in human history. A thousand cards is **one card per fortnight of the war** if the collection
were nothing but chronology, which it is not.

**So the constraint here is selection, and the selection rule is stated rather than left to taste.**
A line earns its slot by teaching something the line above it does not. That rules out three things
this subject invites: **a battle-by-battle crawl** (the Isonzo was fought twelve times and gets two
cards, not twelve), **a general-by-general gallery** (fourteen commanders are named in the whole
thousand, each because a decision of theirs is the card), and **a regiment-by-regiment roll of
honour**, which is what a commemorative site does and this is not one.

**Where the padding risk is**, so it can be watched: the trench-life subdeck in deck 3 and the
day-by-day runs in decks 2 and 8. `ww1-226 Rats in the trenches` is in because it is a real card about
sanitation, disease and what soldiers actually wrote home about; it would not be in if the deck needed
filling.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its `COLLECTION_ICON` row all ship with the file.

**The id is `ww1` and the card prefix is `ww1-`.** Neither is a prefix of any existing one: `ww2-`
differs at the third character, and nothing else on the shelf begins `ww`. The deck ids are also
`ww1-…`. Two leaf ids elsewhere on the shelf are called `wh-ww1` and `fr-ww1`; both are fully
qualified by their own collection's prefix and neither collides.

**It needs no `COLLECTION_SECTION` row.** `sectionOf` returns **History** for anything the table does
not name, and this is a history collection, so the correct action is to add nothing — the same note
the France and Mesopotamia plans make, and for the same reason.

### The hue: `#686E52`, field grey — and the measurement refused the obvious colour twice

**The apt families were swept in CIELAB against the 31 hues now on the shelf, and every one of them is
crowded.** That is the honest headline, and it is what a shelf of thirty-one looks like: the shelf's
median nearest-neighbour distance is **20.8**, its tightest existing pair is **12.9** (China's
vermilion against Russia's lacquer), and its density — hues within ΔE 30 — runs a median of 5 and a
maximum of 9.

**THE POPPY IS REFUSED, ON THE NUMBERS AND ON THE ARGUMENT, AND THE NUMBERS CAME FIRST.** A scarlet
at a shelf-like chroma is the most crowded corner there is: the best candidate stands **17.1** with
**TEN hues within 30** — China, Russia, Korea, Visual Art, the German, Indonesian, Mandarin and
Spanish decks all live there. A *saturated* poppy scarlet measures beautifully (43.2, density 0) and
is refused for a different reason: chroma 104 against a shelf median of 35 is a banner that shouts
across a page where every other collection murmurs. **And the editorial argument points the same way.**
The remembrance poppy is a British and Commonwealth emblem of *mourning*, adopted in 1921, and this
collection covers thirty belligerents and ends with a subdeck arguing that each country remembers the
war differently. Wearing one nation-group's emblem of remembrance as the whole war's colour would make
a claim the collection spends thirty cards complicating.

**HORIZON BLUE AND KHAKI ARE REFUSED FOR THE SAME REASON AS EACH OTHER.** *Bleu horizon* — the French
uniform from 1915 — measures **16.4** against France's own slate blue-grey, which is the shelf hue it
would sit beside on the Collections page; and khaki drab measures **17.7** against World History's
sepia. Both are also a *national* uniform, which is the poppy's problem again.

**FIELD GREY IS TAKEN, AND WHAT MAKES IT RIGHT IS NOT THAT IT IS GERMAN.** `#686E52` measures **20.1**
from World History's sepia, **20.3** from Biology's forest green, **20.3** from France's slate,
**21.4** from the Italian deck and **21.9** from the Second World War's dark iron — five neighbours
inside a band of two units, which is the nearly-equidistant shape Astronomy's twilight has, rather
than one hue pressed against another. **L 45, chroma 17** — well inside the shelf's quiet half, chroma
17 against a median of 35 — and **5.3:1 against white**, comfortably inside the shelf's 3.7–10.4.

**The figure against it is stated rather than hidden: density 8, against a shelf median of 5 and a
maximum of 9.** It is the second most crowded hue on the shelf. That is accepted knowingly, because
the alternative was to take an uncrowded hue that means nothing: the only genuinely open ground left
at a shelf-like chroma is the magenta band, which the standing note in `COLL_THEME` records as having
been **rejected six times** and which came top of the unconstrained sweep again here, making seven. It
must not be measured again.

**Looked at as a banner and as its wash beside its five nearest neighbours** on the real Collections
page: the row reads as a cool grey-green against World History's warm sepia above it and France's
cooler blue-grey below, which is the whole test a density figure of 8 has to survive.

**THE ARGUMENT FOR GREY-GREEN IS THE COLLECTION'S OWN SUBJECT.** This is the war in which armies
stopped wearing colours. French infantry marched into Belgium in 1914 in red trousers and madder
képis; by 1916 every army in Europe was in some muted grey, green or brown, and the collection cards
that transition in deck 2. A drab banner says what the war did to the look of war. It is also the one
of the four candidate families that names **no single belligerent** — every army ended in some version
of it — which is the test the poppy, the horizon blue and the khaki each fail.

### The icon: a new symbol, `wire`

**A strand of barbed wire.** It is the object this war invented a use for, it belonged to every army
and to no nation, and it is the one piece of the war's furniture that is instantly readable as a
shape rather than as a silhouette somebody has to recognise.

**Three obvious alternatives were rejected before it.** A **steel helmet** is the most recognisable
object the war produced and every version of it is national — the Brodie is British, the Adrian
French, the Stahlhelm German — so the mark would pick a side. A **poppy** fails the argument the hue
section gives, and at 24px a five-petalled flower is a blob. A **biplane** collides outright with
`plane`, which the Second World War collection already wears.

**The collision to avoid is `sword` and `shield`**, the shelf's two existing martial marks, and the
separation is easy: both of those are vertical objects with a point or an outline, where this is a
**horizontal band across the whole width** with repeated barbs on it. At 24px it reads as a ruled line
with marks on it, which nothing else on the shelf is.

**Fifteen variants were rendered and looked at over three rounds**, at 24, 26, 28, 34 and 48px, on the
collection's own ground and on white, beside `sword`, `shield`, `plane` and `cards` — and then in the
real banner slot on the Collections page. None of what the rendering settled was predictable from the
description. **A wavy strand scribbles at 24px.** **Three barbs merge into a hatched bar.** **A twisted
pair of strands reads as a chain of beads.** **A six-point barb — an X with a vertical through it, which
is what a real barb looks like — reads as an asterisk.** And **a sagging strand, which is what real wire
does between posts, reads as a bird with its wings out.** What survives is the plainest construction
available: a straight strand with **two** four-point barbs, running y 8–16 on the 24 grid so a third of
the box stands above and below the line. The failure it had to clear is reading as a strike-through, and
it does not.

**One cost, stated: it is a physically smaller mark than its neighbours**, because a wire occupies a
horizontal band and a pagoda or a column fills the box. Looked at in the banner at 28px it still reads,
and the smallness is the other half of what makes it unmistakable at a glance.

## What this collection is about, and the six scope decisions

**The subject is the war of 1914–1918 and the world it made**, from the alliance system of the 1870s
to the Treaty of Lausanne in 1923 and to the way the war is remembered now. Six decisions shape the
tree, and each is a decision that could have gone the other way.

**1. IT IS NOT A WESTERN FRONT COLLECTION, AND THE ALLOCATION IS WHERE THAT IS ENFORCED.** In British,
French and American popular memory the First World War *is* mud, trenches and the Somme. More than
half the war's soldiers died somewhere else. So **deck 3 (the Western Front) gets 130 cards and deck 4
(everywhere else) gets 130 too**, and the equality is deliberate: the Eastern Front alone was fought
over a frontage three times as long, Serbia lost a larger share of its population than any belligerent,
and the Ottoman fronts ran from the Caucasus to Aden. A collection that gives the west 300 and the rest
100 has taught a reader the Anglophone memory of the war rather than the war.

**2. THE WAR DOES NOT END ON 11 NOVEMBER 1918.** Fighting continued in Russia, the Baltic, Poland,
Anatolia, Ireland and Upper Silesia into 1923, much of it by men and with weapons the war had made.
Deck 9 carries a 25-card subdeck on it and `ww1-950 When did the First World War end` cards the
question directly. **The armistice ended the Western Front**, and treating that as the end of the war
is the same mistake as decision 1 wearing a date.

**3. THE ARMENIAN GENOCIDE IS CARDED AS A GENOCIDE, AT LENGTH, AND NOT AS A FOOTNOTE TO GALLIPOLI.**
It has a 20-card subdeck of its own in deck 7, running from the Hamidian massacres through the Tehcir
Law and the deportations to the post-war courts martial, the diaspora and **`ww1-779 Denial of the
Armenian genocide`**, which cards the Turkish state's position **as an account rather than as a
finding** — the house rule about a state's account of its own actions, applied to the hardest case
this subject offers. `ww1-780` then cards what the killings contributed to the idea of crimes against
humanity, which is the Allied declaration of May 1915 and its long afterlife.

**4. THE ORIGINS ARE CARDED AS AN ARGUMENT, NOT AS A VERDICT.** Deck 1 is 110 cards and deliberately
does not build towards a culprit: the alliance system, the naval race, the war plans, the Balkan
crises and the July days each get their own run, and `ww1-110 The debate over the war's origins`
cards the dispute itself. **Only one modern scholar is named in the entire thousand lines** — Fritz
Fischer, at `ww1-997`, and he is there because the Fischer controversy of the 1960s was an event in
West German public life rather than only a position in a literature. The two-scholar cap therefore has
a slot to spare, and it should stay spare.

**5. THE NON-EUROPEAN PARTICIPANTS ARE A DECK, NOT AN APPENDIX.** Deck 7 is 100 cards: the Indian
Army, the *tirailleurs sénégalais*, the South African Native Labour Contingent, the British West Indies
Regiment, the Chinese Labour Corps, the Indochinese battalions, the Egyptian Labour Corps, the
dominions, the neutrals and Latin America. It sits at position 7 of 9 rather than at position 9
because it is not the collection's afterword. **`ww1-711 Colonial troops and the colour bar in
Europe` and `ww1-977 Unequal commemoration in Africa and Asia` are the two cards that keep it
honest**: the war was fought by empires, and what the empires did to their own subjects is part of
the subject.

**6. THE MEMORY DECK IS ABOUT COMMEMORATION AS A HISTORICAL PROBLEM.** Thirty cards on war graves,
memorials, silences, poppies, poetry and film — written to the World History plan's own rule, that
the job is *"not archaeology but commemoration — writing the card that a memorial writes"*. So
`ww1-976 Equality of treatment in the war graves` is carded beside `ww1-977`, and `ww1-996 Lions led
by donkeys` cards a phrase that shaped British popular memory from the 1960s rather than a claim
about 1916.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Origins | Europe before the war | 30 | ww1-001–030 |
| | Armies, navies and plans | 30 | ww1-031–060 |
| | Crises and the road to war | 25 | ww1-061–085 |
| | July 1914 | 25 | ww1-086–110 |
| 1914 | Mobilisation | 25 | ww1-111–135 |
| | The invasion of the west | 30 | ww1-136–165 |
| | The East in 1914 | 20 | ww1-166–185 |
| | The war becomes a siege | 25 | ww1-186–210 |
| The Western Front | Trench warfare | 35 | ww1-211–245 |
| | 1915 in the west | 25 | ww1-246–270 |
| | Verdun | 25 | ww1-271–295 |
| | The Somme | 25 | ww1-296–320 |
| | 1917 in the west | 20 | ww1-321–340 |
| The Other Fronts | The Eastern Front | 35 | ww1-341–375 |
| | Italy and the Alps | 25 | ww1-376–400 |
| | The Ottoman fronts | 40 | ww1-401–440 |
| | The Balkans and Salonika | 15 | ww1-441–455 |
| | Africa | 15 | ww1-456–470 |
| The War at Sea and in the Air | The surface war at sea | 30 | ww1-471–500 |
| | The submarine war and the blockade | 30 | ww1-501–530 |
| | The air war | 30 | ww1-531–560 |
| Home Fronts and Total War | The war economy | 30 | ww1-561–590 |
| | The state at war | 30 | ww1-591–620 |
| | Women and the war | 25 | ww1-621–645 |
| | Society under strain | 35 | ww1-646–680 |
| The Wider World | Empires at war | 35 | ww1-681–715 |
| | Asia, the Pacific and the labour corps | 25 | ww1-716–740 |
| | The Americas and the neutrals | 20 | ww1-741–760 |
| | The Armenian genocide and mass violence | 20 | ww1-761–780 |
| 1917 and 1918 | The year of crisis | 30 | ww1-781–810 |
| | The German offensives | 25 | ww1-811–835 |
| | The Hundred Days | 30 | ww1-836–865 |
| | The armistices | 25 | ww1-866–890 |
| Aftermath, Memory and Meaning | The peace settlements | 35 | ww1-891–925 |
| | Wars after the war | 25 | ww1-926–950 |
| | Counting the cost | 20 | ww1-951–970 |
| | Memory and meaning | 30 | ww1-971–1000 |

Deck totals: Origins 110 · 1914 100 · The Western Front 130 · The Other Fronts 130 ·
The War at Sea and in the Air 90 · Home Fronts and Total War 120 · The Wider World 100 ·
1917 and 1918 110 · Aftermath, Memory and Meaning 110. **Nine decks, 37 leaves, 1000 cards.**

## What the weighting is arguing

**The fighting gets 450 of the thousand and the other 550 go elsewhere.** Decks 2, 3, 4 and 8 are the
campaigns; decks 1, 5, 6, 7 and 9 are the origins, the sea and air, the home fronts, the world beyond
Europe, and the aftermath. That ratio is the collection's whole thesis in a number: this was a war
whose most consequential features — the blockade, the war economy, the conscript state, the collapse
of four empires, the redrawing of the Middle East — were not battles.

**Origins get 110, which is more than any other plan gives a war's causes**, and it is because the
origins of this war are the most argued-over question in modern history and because a reader who does
not understand the alliance system will read every later card as though the war simply happened.

**1914 gets a deck of its own.** It is the only year that does, and the reason is that the war of
August 1914 and the war of November 1914 are different wars: one is armies marching in the open under
nineteenth-century doctrines, the other is a continuous entrenched line from the Channel to
Switzerland. Deck 2 is the record of that turning into the other, and `ww1-189 Why the attack failed
in 1914` is the card the whole deck exists for.

**The war at sea and in the air get 90 between them and not more.** Both are wildly
over-represented in popular writing relative to what they decided — the air war killed a few thousand
people and the blockade killed several hundred thousand — so the submarine and blockade subdeck is the
largest of the three, and `ww1-530 The blockade's place in the war's outcome` is where that argument
is carded.

**Home fronts get 120 and the wider world 100.** Together that is 220 cards — more than the Western
Front and the other fronts separately — which is what "total war" has to mean if the phrase is doing
any work.

**Memory gets 30 and the peace gets 35.** The peace settlements are five treaties, not one, and a
reader who knows only Versailles has been taught the German grievance rather than the settlement.

## Six decisions this plan forced on the tree

**1. The Eastern Front sits in deck 4 rather than in deck 3, and Russia's revolution sits in deck 8
rather than in deck 4.** The fighting is a front; the revolution is a turning point in the war as a
whole, so it is carded where the war turns.

**2. Verdun and the Somme get a subdeck each.** No other battle does. They are the two battles that
became national arguments about the war's meaning in their own countries, and both subdecks end on
that — `ww1-293 Verdun as a French national symbol`, `ww1-319 The Somme in British memory`.

**3. The Ottoman fronts are one subdeck of 40, not four.** Gallipoli, Mesopotamia, Palestine, the
Caucasus and the Arab Revolt are one empire's war and are read wrongly when separated — the promises
made to the Arabs, the French and the Zionists were made by the same governments in the same eighteen
months, and `ww1-436 Conflicting promises in the Middle East` needs the three cards before it in the
same run.

**4. Africa is 15 cards and that is the smallest subdeck in the collection.** It is small because the
campaigns were small; it is present at all, and ends on `ww1-470 Africa's war and Africa's silence`,
because the carriers who died in East Africa outnumbered the soldiers and almost none of them is
named anywhere.

**5. The genocide subdeck sits in deck 7 rather than in deck 4.** Deck 4 is fronts; this was not one.

**6. There is no "technology" deck.** The tank, the aeroplane, gas, the submarine, the steel helmet
and the radio are each carded where they were used, because a technology deck teaches a reader that
the war was won by inventions, which is exactly what deck 8 argues it was not.

## History, not commemoration — and the four pulls

Folio's standing rule is that a card is about the past it names rather than about the modern
apparatus around it. In this subject the pull is unusually strong and comes from four directions.

**THE FIRST IS THE ANECDOTE.** The Christmas truce, the taxis of the Marne, the Red Baron and the
football match in no man's land are the four best-known things about this war and three of them are
substantially mythologised. They are carded — `ww1-160`, `ww1-543` — and each is carded with what the
evidence actually supports, which is usually smaller and more interesting than the story.

**THE SECOND IS THE POEM.** British memory of the war is very largely made of Owen, Sassoon and
Rosenberg, who were a small and unrepresentative group of officers writing at the end of the war. The
poets get four cards in deck 9, where they belong — as a fact about *memory* — and the trench subdeck
draws on letters, diaries and trench newspapers instead.

**THE THIRD IS THE COMMEMORATIVE REGISTER.** A card about the first day on the Somme is about a
military plan, its assumptions and their failure; it is not a lament. Where a figure is contested it
takes a range and says whose.

**THE FOURTH IS THE FUTURE.** Almost everything in this collection is routinely written about as a
cause of something in 1939. That is a real historical question and it is carded — `ww1-901`, `ww1-908`
and `ww1-925` — but a card whose subject is 1919 and whose content is 1933 has taught a reader the
sequel rather than the book. **The Second World War collection is where the sequel lives**, and it
already cards the peace from that end.

## This collection follows the no-researchers rule

The question on a card may never name a modern scholar. That rule binds here in full — this is a
history collection, not `psych` or `phil` — and it is easy to break in a subject whose historiography
is this famous. The three cards that are *about* modern argument (`ww1-110`, `ww1-996`, `ww1-997`)
are covered by the rule's own exemption, their answer term being the argument itself.

**The rule does not cover actors of the period.** Keynes writing in 1919, Lloyd George, Ludendorff
and Morgenthau are contemporaries giving evidence, and a question may name them exactly as a Greek
card's question may name Herodotus.

## Names, dates and spellings

**Place names take the form an English-language reader will meet in the literature**, with the local
form given in the card where it differs and matters: *Ypres* rather than Ieper, *Przemyśl* with its
diacritics, *Salonika* rather than Thessaloniki for the front and the campaign.

**Dates are given new style.** Russia ran on the Julian calendar until February 1918, so the February
Revolution happened in March and the October Revolution in November. **Every Russian card states both**
— this is the same convention the Russia plan sets and it must not diverge from it.

**The war's name.** It is the *First World War* throughout, which is the form British and most
Commonwealth scholarship uses; *World War I* appears only where it is part of a proper name. The
*Great War* is carded as a term people used, in deck 9, rather than used as the collection's own name.

**Casualty figures are given as ranges with whose estimate they are**, without exception. This subject
has more contested totals than any other on the shelf, official counts differ from historians' counts
by millions, and several belligerents never counted their colonial dead at all.

## Sourcing

**Measured rather than assumed**, and this is the best-sourced subject Folio has taken on.

**The primary documents are overwhelmingly open.** The diplomatic correspondence of July 1914 was
published by every belligerent government in the 1920s and is on archive.org in full — the German
*Kautsky documents*, the British *Documents on the Origins of the War*, the French *Documents
diplomatiques*. The Paris Peace Conference's proceedings are printed in the United States' *Foreign
Relations* series, which the Office of the Historian serves in full. The official histories of
Britain, Australia, New Zealand, Canada and the United States are all out of copyright and online.

**The war graves registers are open and are a primary source**, which makes several cards in deck 9
checkable in a way commemoration usually is not.

**The Armenian genocide has an unusually good open documentary base** — the American ambassador's
despatches in *Foreign Relations*, the British *Blue Book* of 1916 with its own later controversy, and
the published records of the 1919–1920 Constantinople courts martial.

**What is NOT open, and what to do about it.** The major modern syntheses are in copyright. The route
that keeps paying is the one the artefact pass found: a walled article is usually open at its
**Europe PMC** or repository copy, **DOAJ** finds the open journals, and for this subject in
particular the **centenary** produced a large open-access literature — *First World War Studies*, the
*Journal of the First World War*, and above all **1914–1918-online**, the international encyclopedia,
which is peer-reviewed, cites its own sources and is open. Test it per article as the glossary plan's
N9 rule requires, not per publisher.

## Living beside the other collections — measured, not guessed

**This is the most overlapped collection on the shelf, and roughly a hundred lines elsewhere already
touch the war.** Measured across the twenty-four existing plans:

| plan | lines | what they are |
|---|---|---|
| `france` | 31 | `fr-670`–`fr-700`, an entire subdeck: France's own war, Verdun to the devastated regions |
| `world-history` | 25 | `wh-871`–`wh-895`, the war as one episode of a world survey |
| `us` | 21 | `us-761`–`us-781`, neutrality, the AEF, the home front and Wilson at Paris |
| `russia` | 20 | `ru-531`–`ru-550`, the war as the Romanovs' end |
| `ww2` | 12 | `ww2-002`–`ww2-006`, `ww2-011`–`ww2-012`, `ww2-028`: the peace as the *second* war's origin |
| `china` `india` `japan` `korea` | 1 each | one card apiece on their own war |

**THE DIVISION OF LABOUR IS ONE SENTENCE: a national collection cards what the war did to that
country; this collection cards the war.** So `ru-533 Battle of Tannenberg` is Russia's card about the
first disaster of a dynasty that had three years left, and `ww1-168 The Battle of Tannenberg` is about
an encirclement and about the two officers it made; `fr-682 The Somme and the French army` is about
what the battle cost France, and the whole of `ww1-somme` is about the battle. The same rule settles
`wh-880`: the World History plan says outright that *"a reader who wants the Somme in depth is served
by a war collection rather than by a world survey spending a fifth of itself on ninety years"* — **it
was written anticipating this collection**, and deck 3 is the answer to it.

**THE PEACE IS THE ONE PLACE THE RULE RUNS THE OTHER WAY.** `ww2-004 Treaty of Versailles` and
`ww2-005 The war guilt clause` card the treaty as the thing the 1930s reacted against; `ww1-900` and
`ww1-901` card it as the settlement of the war just ended. **Write the pair deliberately**, and when
writing the `ww1-` card resist the pull described under "the fourth pull" above: what Hitler said
about Versailles in 1930 belongs on the `ww2-` card.

**Seventeen titles are shared verbatim or near-verbatim with another plan**, of which the ones to
know are `The Zimmermann Telegram` (`us-764`), `The sinking of the Lusitania` (`us-763`),
`The Fourteen Points` (`us-778`), `The Treaty of Brest-Litovsk` (`ru-` deck), `The Brusilov offensive`
(`ru-538`), `The Battle of Tannenberg` (`ru-533`), `The Easter Rising`, `Verdun`, `The Somme`,
`Passchendaele`, `Gallipoli`, `The League of Nations` (`ww2-012`) and `The Treaty of Versailles`
(`ww2-004`). **Write the shared glossary term ONCE**, whichever collection reaches it first — and
check before running `add-glossary.js`, which overwrites in silence.

**The glossary starts almost from nothing.** Measured against the shipped 3,838 terms, the war's own
vocabulary yields **six** existing entries: `Treaty_of_Versailles`, `Article_231_of_the_Treaty_of_Versailles`,
`Armistice_of_11_November_1918`, `League_of_Nations`, `Woodrow_Wilson` and `Conscription`, with
`Weimar_Republic` and `German_revolution_of_1918–1919` adjacent. There is no `Trench_warfare`, no
`Western_Front`, no `Battle_of_the_Somme`, no `Gallipoli_campaign`, no `Schlieffen_Plan`, no
`Armenian_genocide`. **Expect the glossary to grow here faster than anywhere since Korea**, and expect
the pairing rule to be doing real work on nearly every card.

---

# The list

## Origins

### Europe before the war — `ww1-europe1900`

    ww1-001  Europe in 1900
    ww1-002  The Concert of Europe
    ww1-003  The unification of Germany and the new balance
    ww1-004  Bismarck's alliance system
    ww1-005  The Reinsurance Treaty
    ww1-006  Wilhelmine Germany
    ww1-007  Kaiser Wilhelm II
    ww1-008  Weltpolitik
    ww1-009  The constitution of the German Empire
    ww1-010  Prussian militarism
    ww1-011  Austria-Hungary as a multinational state
    ww1-012  The Ausgleich of 1867
    ww1-013  The nationalities of the Habsburg Empire
    ww1-014  Franz Joseph I
    ww1-015  The Russian Empire in 1900
    ww1-016  Russia after 1905
    ww1-017  The Stolypin reforms
    ww1-018  The French Third Republic
    ww1-019  Revanchism and Alsace-Lorraine
    ww1-020  The Dreyfus affair and the French army
    ww1-021  Edwardian Britain
    ww1-022  Splendid isolation
    ww1-023  The Entente Cordiale
    ww1-024  The Anglo-Russian Convention of 1907
    ww1-025  The Triple Alliance
    ww1-026  Italy's place in the alliance system
    ww1-027  The Ottoman Empire in 1900
    ww1-028  The Young Turk Revolution
    ww1-029  Serbia after 1903
    ww1-030  Expectations of the coming war

### Armies, navies and plans — `ww1-arms`

    ww1-031  The Anglo-German naval race
    ww1-032  HMS Dreadnought
    ww1-033  Alfred von Tirpitz
    ww1-034  The German Naval Laws
    ww1-035  The cult of the offensive
    ww1-036  The Schlieffen Plan
    ww1-037  Alfred von Schlieffen
    ww1-038  Helmuth von Moltke the Younger
    ww1-039  Plan XVII
    ww1-040  The French doctrine of the offensive
    ww1-041  Russian Plan 19
    ww1-042  Austria-Hungary's war plans
    ww1-043  Conscription in continental Europe
    ww1-044  The German General Staff
    ww1-045  Mass armies and railway timetables
    ww1-046  The machine gun before 1914
    ww1-047  Quick-firing artillery
    ww1-048  The magazine rifle
    ww1-049  Barbed wire as a military technology
    ww1-050  Field fortification before 1914
    ww1-051  Military lessons of the Russo-Japanese War
    ww1-052  Military lessons of the Boer War
    ww1-053  The Balkan Wars as a military rehearsal
    ww1-054  Military spending before 1914
    ww1-055  The British Expeditionary Force in 1914
    ww1-056  The Haldane reforms
    ww1-057  Naval strategy and the blockade plan
    ww1-058  War planning and the reserve system
    ww1-059  Mobilisation as an irreversible act
    ww1-060  Did the armies expect a short war?

### Crises and the road to war — `ww1-crises`

    ww1-061  The First Moroccan Crisis
    ww1-062  The Algeciras Conference
    ww1-063  The Bosnian annexation crisis
    ww1-064  The Agadir Crisis
    ww1-065  The Italo-Turkish War
    ww1-066  The First Balkan War
    ww1-067  The Second Balkan War
    ww1-068  The Treaty of Bucharest of 1913
    ww1-069  The Balkan League
    ww1-070  Serbian expansion and Austrian alarm
    ww1-071  Panslavism
    ww1-072  The Liman von Sanders affair
    ww1-073  The Anglo-German naval talks
    ww1-074  Imperial rivalry outside Europe
    ww1-075  The Berlin-Baghdad railway
    ww1-076  Public opinion and the press before 1914
    ww1-077  The peace movement before 1914
    ww1-078  The Hague Conventions
    ww1-079  Socialism and the Second International
    ww1-080  The general strike against war
    ww1-081  Bertha von Suttner and the anti-war argument
    ww1-082  Norman Angell and The Great Illusion
    ww1-083  War scares and invasion literature
    ww1-084  The German war council of 1912
    ww1-085  Arms races and the security dilemma

### July 1914 — `ww1-july`

    ww1-086  Archduke Franz Ferdinand
    ww1-087  The Sarajevo assassination
    ww1-088  Gavrilo Princip
    ww1-089  The Black Hand
    ww1-090  Serbia's part in the plot
    ww1-091  Austria-Hungary's response to Sarajevo
    ww1-092  The blank cheque
    ww1-093  Leopold Berchtold
    ww1-094  The Austrian ultimatum to Serbia
    ww1-095  Serbia's reply
    ww1-096  Austria-Hungary declares war on Serbia
    ww1-097  Russian partial mobilisation
    ww1-098  Russian general mobilisation
    ww1-099  Sergei Sazonov
    ww1-100  The German ultimatums
    ww1-101  Germany declares war on Russia
    ww1-102  Germany declares war on France
    ww1-103  The German invasion of Belgium
    ww1-104  Belgian neutrality and the Treaty of London
    ww1-105  Britain declares war
    ww1-106  Edward Grey
    ww1-107  The Cabinet crisis in London
    ww1-108  Italy declares neutrality
    ww1-109  The July Crisis as a failure of diplomacy
    ww1-110  The debate over the war's origins

## 1914

### Mobilisation — `ww1-mob`

    ww1-111  Mobilisation in 1914
    ww1-112  The spirit of 1914
    ww1-113  The Burgfrieden
    ww1-114  The Union sacrée in 1914
    ww1-115  Socialist parties and the war credits
    ww1-116  Karl Liebknecht's dissent
    ww1-117  Volunteering in Britain
    ww1-118  Kitchener's New Armies
    ww1-119  The pals battalions
    ww1-120  Recruiting propaganda in 1914
    ww1-121  The Austro-Hungarian mobilisation
    ww1-122  Russia's mobilisation and its limits
    ww1-123  Ottoman entry into the war
    ww1-124  The Goeben and the Breslau
    ww1-125  The Ottoman-German alliance
    ww1-126  Enver Pasha
    ww1-127  The Ottoman proclamation of jihad
    ww1-128  Japan enters the war
    ww1-129  The siege of Tsingtao
    ww1-130  The first weeks of censorship
    ww1-131  Enemy aliens and internment in 1914
    ww1-132  The war's first atrocities
    ww1-133  The rape of Belgium
    ww1-134  The burning of Louvain
    ww1-135  Atrocity propaganda in 1914

### The invasion of the west — `ww1-1914west`

    ww1-136  The German advance through Belgium
    ww1-137  The siege of Liège
    ww1-138  The Big Bertha siege guns
    ww1-139  The fall of Brussels
    ww1-140  The Battle of the Frontiers
    ww1-141  The Battle of Mons
    ww1-142  The Great Retreat of 1914
    ww1-143  Joseph Joffre
    ww1-144  The Schlieffen Plan in execution
    ww1-145  The Battle of Le Cateau
    ww1-146  The French counter-attack at Guise
    ww1-147  The First Battle of the Marne
    ww1-148  The gap between the German First and Second Armies
    ww1-149  Richard Hentsch's mission
    ww1-150  The German withdrawal to the Aisne
    ww1-151  The First Battle of the Aisne
    ww1-152  The dismissal of Moltke
    ww1-153  Erich von Falkenhayn
    ww1-154  The Race to the Sea
    ww1-155  The siege of Antwerp
    ww1-156  The First Battle of Ypres
    ww1-157  The Ypres Salient
    ww1-158  The flooding of the Yser
    ww1-159  The destruction of the old British army
    ww1-160  The Christmas truce of 1914
    ww1-161  The front line at the end of 1914
    ww1-162  Why the war did not end in 1914
    ww1-163  The occupation of Belgium begins
    ww1-164  Northern France under German occupation
    ww1-165  Refugees in 1914

### The East in 1914 — `ww1-1914east`

    ww1-166  The Eastern Front in 1914
    ww1-167  The Russian invasion of East Prussia
    ww1-168  The Battle of Tannenberg
    ww1-169  Paul von Hindenburg
    ww1-170  Erich Ludendorff
    ww1-171  Max Hoffmann and the staff work of Tannenberg
    ww1-172  The First Battle of the Masurian Lakes
    ww1-173  The Russian invasion of Galicia
    ww1-174  The Battle of Lemberg
    ww1-175  The siege of Przemyśl
    ww1-176  Austria-Hungary's losses in 1914
    ww1-177  Conrad von Hötzendorf
    ww1-178  The Austro-Hungarian invasions of Serbia
    ww1-179  The Battle of Cer
    ww1-180  The Battle of Kolubara
    ww1-181  Serbia's victories of 1914
    ww1-182  The Ottoman offensive in the Caucasus
    ww1-183  The Battle of Sarikamish
    ww1-184  Distances and railways on the Eastern Front
    ww1-185  Why the Eastern Front never became a trench line

### The war becomes a siege — `ww1-siege`

    ww1-186  The stalemate of 1914 and 1915
    ww1-187  Digging in
    ww1-188  The first trench systems
    ww1-189  Why the attack failed in 1914
    ww1-190  Firepower and the defensive
    ww1-191  The problem of the breakthrough
    ww1-192  Command by telephone, runner and map
    ww1-193  Reconnaissance in 1914
    ww1-194  The shell shortage
    ww1-195  The Shell Crisis of 1915
    ww1-196  Munitions production begins
    ww1-197  The switch to a war economy
    ww1-198  War aims in 1914 and 1915
    ww1-199  The Septemberprogramm
    ww1-200  Allied war aims and the secret treaties
    ww1-201  The Treaty of London of 1915
    ww1-202  Italy enters the war
    ww1-203  Bulgaria enters the war
    ww1-204  Romania's neutrality and bargaining
    ww1-205  The neutral states of Europe
    ww1-206  Financing the war begins
    ww1-207  The first war loans
    ww1-208  The first casualty lists
    ww1-209  The war at the end of its first year
    ww1-210  The idea of attrition

## The Western Front

### Trench warfare — `ww1-trench`

    ww1-211  Trench warfare
    ww1-212  The anatomy of a trench system
    ww1-213  The fire trench and the parapet
    ww1-214  Communication trenches
    ww1-215  Dugouts
    ww1-216  No man's land
    ww1-217  The daily routine of the trenches
    ww1-218  Stand-to
    ww1-219  Trench raids
    ww1-220  Sniping
    ww1-221  Listening posts and patrols
    ww1-222  The rotation system
    ww1-223  Rations in the trenches
    ww1-224  Trench foot
    ww1-225  Lice and vermin
    ww1-226  Rats in the trenches
    ww1-227  Mud and drainage
    ww1-228  The winter trenches
    ww1-229  Latrines and sanitation at the front
    ww1-230  Water supply at the front
    ww1-231  The smell of the front
    ww1-232  Boredom and waiting
    ww1-233  Trench newspapers
    ww1-234  Trench art
    ww1-235  Superstition and rumour at the front
    ww1-236  Live and let live
    ww1-237  The sniper's plate
    ww1-238  Wiring parties
    ww1-239  Mining and counter-mining
    ww1-240  The mines at Messines
    ww1-241  Tunnellers
    ww1-242  Shellfire and its effects
    ww1-243  The creeping barrage
    ww1-244  Wound treatment at the front
    ww1-245  The casualty clearing station

### 1915 in the west — `ww1-1915west`

    ww1-246  The Western Front in 1915
    ww1-247  The Battle of Neuve Chapelle
    ww1-248  The Second Battle of Ypres
    ww1-249  The first gas attack
    ww1-250  Chlorine gas
    ww1-251  Fritz Haber
    ww1-252  The gas mask
    ww1-253  The Allied adoption of gas
    ww1-254  The Battle of Festubert
    ww1-255  The Second Battle of Artois
    ww1-256  Vimy Ridge in 1915
    ww1-257  The Battle of Loos
    ww1-258  The Battle of Champagne
    ww1-259  Trench mortars
    ww1-260  The hand grenade
    ww1-261  The steel helmet
    ww1-262  The rifle grenade
    ww1-263  The flamethrower
    ww1-264  The French artillery problem
    ww1-265  The shell shortage and Loos
    ww1-266  Command failures of 1915
    ww1-267  The dismissal of Sir John French
    ww1-268  Douglas Haig takes command
    ww1-269  What 1915 taught the armies
    ww1-270  Casualties of 1915 in the west

### Verdun — `ww1-verdun`

    ww1-271  The Battle of Verdun
    ww1-272  Falkenhayn's Christmas Memorandum
    ww1-273  Why Verdun
    ww1-274  The fortress system of Verdun
    ww1-275  The German bombardment of February 1916
    ww1-276  The fall of Fort Douaumont
    ww1-277  Philippe Pétain at Verdun
    ww1-278  They shall not pass
    ww1-279  The Voie Sacrée
    ww1-280  The noria system of rotation
    ww1-281  The fighting for Le Mort Homme
    ww1-282  Hill 304
    ww1-283  The fall of Fort Vaux
    ww1-284  The carrier pigeon in the First World War
    ww1-285  Robert Nivelle at Verdun
    ww1-286  The German high-water mark of July 1916
    ww1-287  The French counter-offensives of autumn 1916
    ww1-288  The recapture of Douaumont
    ww1-289  The cost of Verdun
    ww1-290  The village of Fleury
    ww1-291  The destroyed villages of Verdun
    ww1-292  The Douaumont ossuary
    ww1-293  Verdun as a French national symbol
    ww1-294  Verdun in German memory
    ww1-295  Was Verdun a battle of attrition by design?

### The Somme — `ww1-somme`

    ww1-296  The Battle of the Somme
    ww1-297  The origins of the Somme plan
    ww1-298  The Chantilly conference of 1915
    ww1-299  The Somme after Verdun
    ww1-300  The Somme bombardment
    ww1-301  The failure of the wire-cutting
    ww1-302  The first day on the Somme
    ww1-303  The Accrington Pals
    ww1-304  The Newfoundland Regiment at Beaumont Hamel
    ww1-305  The mine at Hawthorn Ridge
    ww1-306  The French army on the Somme
    ww1-307  Bazentin Ridge and the night attack
    ww1-308  Delville Wood
    ww1-309  Pozières
    ww1-310  The Australians on the Somme
    ww1-311  Flers-Courcelette
    ww1-312  The first use of the tank
    ww1-313  The Mark I tank
    ww1-314  Thiepval
    ww1-315  The Ancre
    ww1-316  The end of the Somme
    ww1-317  The casualties of the Somme
    ww1-318  The Somme film of 1916
    ww1-319  The Somme in British memory
    ww1-320  What the Somme achieved

### 1917 in the west — `ww1-1917west`

    ww1-321  The Western Front in 1917
    ww1-322  The German withdrawal to the Hindenburg Line
    ww1-323  Operation Alberich
    ww1-324  The Hindenburg Line
    ww1-325  The Battle of Arras
    ww1-326  The capture of Vimy Ridge
    ww1-327  The Canadian Corps at Vimy
    ww1-328  Arthur Currie
    ww1-329  The Nivelle offensive
    ww1-330  The Second Battle of the Aisne
    ww1-331  The Chemin des Dames
    ww1-332  The French army mutinies of 1917
    ww1-333  Pétain restores the army
    ww1-334  The Battle of Messines
    ww1-335  The Third Battle of Ypres
    ww1-336  Passchendaele
    ww1-337  The mud of 1917
    ww1-338  The Battle of Cambrai
    ww1-339  The tank at Cambrai
    ww1-340  What 1917 cost

## The Other Fronts

### The Eastern Front — `ww1-east`

    ww1-341  The Eastern Front
    ww1-342  The Carpathian winter campaign
    ww1-343  The fall of Przemyśl
    ww1-344  The Gorlice-Tarnów offensive
    ww1-345  August von Mackensen
    ww1-346  The Great Retreat of 1915
    ww1-347  The scorched-earth retreat and its refugees
    ww1-348  Nicholas II takes command of the army
    ww1-349  The Russian shell shortage
    ww1-350  The Russian army's recovery in 1916
    ww1-351  The Brusilov offensive
    ww1-352  Aleksei Brusilov
    ww1-353  The collapse of the Austro-Hungarian army in 1916
    ww1-354  German command over the Austrian front
    ww1-355  The conquest of Serbia in 1915
    ww1-356  The Serbian retreat through Albania
    ww1-357  The Serbian army on Corfu
    ww1-358  Romania enters the war
    ww1-359  The conquest of Romania
    ww1-360  The occupation of Romania
    ww1-361  Ober Ost
    ww1-362  The German occupation of Poland
    ww1-363  The Act of 5th November 1916
    ww1-364  Poland's question in the war
    ww1-365  The Baltic lands under occupation
    ww1-366  Jewish communities in the war zone
    ww1-367  Deportations on the Eastern Front
    ww1-368  Prisoners of war in Russia
    ww1-369  Prisoners of war in Germany and Austria
    ww1-370  The Russian army in 1917
    ww1-371  Order No. 1
    ww1-372  The Kerensky offensive
    ww1-373  The Riga offensive
    ww1-374  The armistice on the Eastern Front
    ww1-375  The Treaty of Brest-Litovsk

### Italy and the Alps — `ww1-italy`

    ww1-376  The Italian Front
    ww1-377  Italy's decision for war
    ww1-378  Italian irredentism
    ww1-379  D'Annunzio and the interventionists
    ww1-380  Luigi Cadorna
    ww1-381  The Isonzo front
    ww1-382  The Battles of the Isonzo
    ww1-383  Mountain warfare
    ww1-384  The White War in the Alps
    ww1-385  Avalanches and the war in the mountains
    ww1-386  The Strafexpedition of 1916
    ww1-387  The capture of Gorizia
    ww1-388  Discipline in the Italian army
    ww1-389  Decimation in the Italian army
    ww1-390  The Battle of Caporetto
    ww1-391  Infiltration tactics at Caporetto
    ww1-392  The retreat to the Piave
    ww1-393  Armando Diaz
    ww1-394  The Italian home front after Caporetto
    ww1-395  Allied reinforcements in Italy
    ww1-396  The Battle of the Piave River
    ww1-397  The Battle of Vittorio Veneto
    ww1-398  The end of the war on the Italian front
    ww1-399  Italy's war dead
    ww1-400  Italy's disappointed victory

### The Ottoman fronts — `ww1-ottoman`

    ww1-401  The Ottoman Empire at war
    ww1-402  The Ottoman army in 1914
    ww1-403  The Caucasus campaign
    ww1-404  The defence of the Dardanelles
    ww1-405  The naval attack of March 1915
    ww1-406  The Gallipoli campaign
    ww1-407  Churchill and the Dardanelles
    ww1-408  The landings at Cape Helles
    ww1-409  The Anzac landing
    ww1-410  Anzac Cove
    ww1-411  Mustafa Kemal at Gallipoli
    ww1-412  The August offensive at Suvla
    ww1-413  Disease and supply at Gallipoli
    ww1-414  The evacuation of Gallipoli
    ww1-415  Gallipoli in Australian and New Zealand memory
    ww1-416  Gallipoli in Turkish memory
    ww1-417  The Mesopotamian campaign
    ww1-418  The advance on Baghdad
    ww1-419  The siege of Kut
    ww1-420  The surrender at Kut
    ww1-421  The capture of Baghdad
    ww1-422  The Sinai and Palestine campaign
    ww1-423  The defence of the Suez Canal
    ww1-424  The Senussi campaign
    ww1-425  The battles of Gaza
    ww1-426  Edmund Allenby
    ww1-427  The capture of Jerusalem
    ww1-428  The Battle of Megiddo
    ww1-429  The Arab Revolt
    ww1-430  Sharif Hussein of Mecca
    ww1-431  T. E. Lawrence
    ww1-432  The Hejaz railway campaign
    ww1-433  The Hussein-McMahon correspondence
    ww1-434  The Sykes-Picot Agreement
    ww1-435  The Balfour Declaration
    ww1-436  Conflicting promises in the Middle East
    ww1-437  The Ottoman home front
    ww1-438  Famine in Greater Syria
    ww1-439  The Armistice of Mudros
    ww1-440  The end of Ottoman rule in the Arab provinces

### The Balkans and Salonika — `ww1-balkans`

    ww1-441  The Salonika front
    ww1-442  The Allied landing at Salonika
    ww1-443  Greece's national schism
    ww1-444  Eleftherios Venizelos
    ww1-445  Constantine I and Greek neutrality
    ww1-446  Bulgaria at war
    ww1-447  The occupation of Serbia
    ww1-448  Typhus in Serbia
    ww1-449  The Army of the Orient
    ww1-450  Trench warfare in the Macedonian mountains
    ww1-451  The Battle of Dobro Pole
    ww1-452  The collapse of Bulgaria
    ww1-453  The Armistice of Salonika
    ww1-454  The liberation of Serbia
    ww1-455  Serbia's losses in the war

### Africa — `ww1-africa`

    ww1-456  The war in Africa
    ww1-457  The invasion of Togoland
    ww1-458  The Kamerun campaign
    ww1-459  The conquest of German South West Africa
    ww1-460  The Maritz rebellion
    ww1-461  The East African campaign
    ww1-462  Paul von Lettow-Vorbeck
    ww1-463  The Battle of Tanga
    ww1-464  The Königsberg in the Rufiji delta
    ww1-465  The Schutztruppe and its askari
    ww1-466  Carriers in the East African campaign
    ww1-467  Famine and disease in East Africa
    ww1-468  Africa's civilian war dead
    ww1-469  The Chilembwe uprising
    ww1-470  Africa's war and Africa's silence

## The War at Sea and in the Air

### The surface war at sea — `ww1-sea`

    ww1-471  The war at sea
    ww1-472  The Grand Fleet
    ww1-473  The High Seas Fleet
    ww1-474  John Jellicoe
    ww1-475  Scapa Flow
    ww1-476  The Battle of Heligoland Bight
    ww1-477  The German raiding squadrons
    ww1-478  The Battle of Coronel
    ww1-479  The Battle of the Falkland Islands
    ww1-480  The cruise of the Emden
    ww1-481  Commerce raiders
    ww1-482  The Battle of Dogger Bank
    ww1-483  The Battle of Jutland
    ww1-484  Reinhard Scheer
    ww1-485  David Beatty
    ww1-486  The battlecruiser losses at Jutland
    ww1-487  Who won Jutland
    ww1-488  The fleet in being
    ww1-489  Coastal raids on England
    ww1-490  The Dover Patrol
    ww1-491  Naval mines
    ww1-492  The Zeebrugge Raid
    ww1-493  The war in the Baltic
    ww1-494  The Black Sea and the Russian fleet
    ww1-495  Naval aviation
    ww1-496  Seaplane carriers and the first aircraft carriers
    ww1-497  Convoy escort work
    ww1-498  The blockade of Germany begins
    ww1-499  The Northern Patrol
    ww1-500  Sea power and the war's outcome

### The submarine war and the blockade — `ww1-uboat`

    ww1-501  The U-boat war
    ww1-502  The submarine in 1914
    ww1-503  The first submarine campaign of 1915
    ww1-504  Prize rules and the submarine
    ww1-505  The sinking of the Lusitania
    ww1-506  American protests of 1915
    ww1-507  The Sussex pledge
    ww1-508  The growth of the U-boat fleet
    ww1-509  Unrestricted submarine warfare
    ww1-510  The decision of January 1917
    ww1-511  The gamble on Britain's surrender
    ww1-512  Shipping losses in 1917
    ww1-513  The convoy system
    ww1-514  The depth charge
    ww1-515  The hydrophone and early detection
    ww1-516  The Q-ship
    ww1-517  The Otranto Barrage
    ww1-518  The Dover Barrage
    ww1-519  The North Sea Mine Barrage
    ww1-520  American shipbuilding and the shipping crisis
    ww1-521  The blockade of the Central Powers
    ww1-522  Contraband and neutral trade
    ww1-523  The Ministry of Blockade
    ww1-524  The turnip winter
    ww1-525  Hunger in Germany
    ww1-526  Hunger in Austria-Hungary
    ww1-527  The blockade's civilian dead
    ww1-528  The blockade after the armistice
    ww1-529  The legality of the blockade
    ww1-530  The blockade's place in the war's outcome

### The air war — `ww1-air`

    ww1-531  The air war
    ww1-532  Aircraft in 1914
    ww1-533  Aerial reconnaissance
    ww1-534  Artillery spotting from the air
    ww1-535  Aerial photography
    ww1-536  The observation balloon
    ww1-537  Attacking the observation balloon
    ww1-538  The interrupter gear
    ww1-539  The Fokker Scourge
    ww1-540  Air superiority as an idea
    ww1-541  Bloody April
    ww1-542  The fighter squadron
    ww1-543  Manfred von Richthofen
    ww1-544  The Flying Circus
    ww1-545  The ace as a public figure
    ww1-546  René Fonck and the French aces
    ww1-547  Billy Bishop and the dominion airmen
    ww1-548  The life expectancy of a pilot
    ww1-549  Parachutes and the refusal to issue them
    ww1-550  Ground attack from the air
    ww1-551  The Zeppelin raids
    ww1-552  The Gotha raids on London
    ww1-553  The air defence of Britain
    ww1-554  The first strategic bombing
    ww1-555  The Independent Air Force
    ww1-556  Airship patrols at sea
    ww1-557  The founding of the Royal Air Force
    ww1-558  Aircraft production in the war
    ww1-559  What the air war achieved
    ww1-560  The myth of the knights of the air

## Home Fronts and Total War

### The war economy — `ww1-econ`

    ww1-561  Total war
    ww1-562  The war economy
    ww1-563  Munitions production
    ww1-564  The Ministry of Munitions
    ww1-565  Lloyd George as Minister of Munitions
    ww1-566  The Hindenburg Programme
    ww1-567  Walther Rathenau and the raw materials department
    ww1-568  The Auxiliary Service Law
    ww1-569  State control of industry
    ww1-570  Dilution of labour
    ww1-571  Strikes in wartime
    ww1-572  Trade unions and the war
    ww1-573  War profiteering
    ww1-574  Financing the war
    ww1-575  War bonds
    ww1-576  Inflation in wartime
    ww1-577  War debt between the Allies
    ww1-578  American loans to the Allies
    ww1-579  Britain's financial dependence on the United States
    ww1-580  Shipping and the food supply
    ww1-581  Agriculture in wartime
    ww1-582  Rationing
    ww1-583  Substitute foods
    ww1-584  The nitrogen problem and the Haber-Bosch process
    ww1-585  Synthetic substitutes in Germany
    ww1-586  Coal and the energy crisis
    ww1-587  Railways under state control
    ww1-588  Forced labour in the war economy
    ww1-589  The Belgian deportations for labour
    ww1-590  The war economy's legacy

### The state at war — `ww1-state`

    ww1-591  The state in wartime
    ww1-592  The Defence of the Realm Act
    ww1-593  Censorship of the press
    ww1-594  Censorship of soldiers' letters
    ww1-595  Propaganda in the First World War
    ww1-596  The propaganda poster
    ww1-597  Wellington House
    ww1-598  Atrocity stories and the Bryce Report
    ww1-599  Film as propaganda
    ww1-600  War artists
    ww1-601  Conscription in Britain
    ww1-602  The Military Service Act of 1916
    ww1-603  Conscientious objection
    ww1-604  The tribunals
    ww1-605  The treatment of conscientious objectors
    ww1-606  The Easter Rising
    ww1-607  The conscription crisis in Ireland
    ww1-608  The conscription crisis in Canada
    ww1-609  Australia's conscription referendums
    ww1-610  The internment of enemy aliens
    ww1-611  Spy fever
    ww1-612  Emergency powers and civil liberties
    ww1-613  Politics under wartime coalition
    ww1-614  The fall of Asquith
    ww1-615  Lloyd George as prime minister
    ww1-616  Clemenceau in power
    ww1-617  The silent dictatorship of Hindenburg and Ludendorff
    ww1-618  The German Reichstag in wartime
    ww1-619  The Union of Democratic Control
    ww1-620  Wartime dissent and its limits

### Women and the war — `ww1-women`

    ww1-621  Women in the First World War
    ww1-622  Women in munitions
    ww1-623  The canary girls
    ww1-624  Women in transport and the services
    ww1-625  The Women's Land Army
    ww1-626  Women's auxiliary military services
    ww1-627  Nursing in the First World War
    ww1-628  Voluntary Aid Detachments
    ww1-629  Edith Cavell
    ww1-630  Women doctors in wartime
    ww1-631  The Scottish Women's Hospitals
    ww1-632  Elsie Inglis
    ww1-633  Women in the Russian army
    ww1-634  The Women's Battalion of Death
    ww1-635  Women and wartime wages
    ww1-636  Women's work after the armistice
    ww1-637  The suffrage movement and the war
    ww1-638  The Representation of the People Act 1918
    ww1-639  Women's suffrage after the war in Europe
    ww1-640  The women's peace movement
    ww1-641  The Hague Women's Congress of 1915
    ww1-642  Women left at home
    ww1-643  War widows
    ww1-644  Separation allowances
    ww1-645  Did the war emancipate women

### Society under strain — `ww1-society`

    ww1-646  The home front
    ww1-647  Bereavement in wartime
    ww1-648  The telegram
    ww1-649  Casualty lists and the newspapers
    ww1-650  Spiritualism after the war
    ww1-651  Children in wartime
    ww1-652  Schools and the war
    ww1-653  Refugees in wartime Europe
    ww1-654  Belgian refugees in Britain
    ww1-655  Civilian internment camps
    ww1-656  Food queues and food riots
    ww1-657  The turnip winter at home
    ww1-658  The strikes of 1917 and 1918
    ww1-659  The January strike of 1918 in Germany
    ww1-660  Wartime crime and policing
    ww1-661  Alcohol regulation in wartime
    ww1-662  Venereal disease and the armies
    ww1-663  Prostitution and the war
    ww1-664  Morale on the home front
    ww1-665  Rumour and panic
    ww1-666  The influenza pandemic of 1918
    ww1-667  How the pandemic spread through the armies
    ww1-668  Spanish flu and its name
    ww1-669  The pandemic's death toll
    ww1-670  Medicine in the First World War
    ww1-671  Blood transfusion in wartime
    ww1-672  Plastic surgery and facial injury
    ww1-673  Harold Gillies and the Queen's Hospital
    ww1-674  Prosthetic limbs
    ww1-675  Shell shock
    ww1-676  The treatment of shell shock
    ww1-677  W. H. R. Rivers and Craiglockhart
    ww1-678  Military executions for cowardice
    ww1-679  Disabled veterans
    ww1-680  The war's cost to civilian health

## The Wider World

### Empires at war — `ww1-empires`

    ww1-681  The empires at war
    ww1-682  The Indian Army in the First World War
    ww1-683  Indian troops on the Western Front
    ww1-684  Indian troops in Mesopotamia
    ww1-685  India's war contribution
    ww1-686  India's expectations of reward
    ww1-687  The Montagu Declaration
    ww1-688  The Ghadar conspiracy
    ww1-689  Africans in the French army
    ww1-690  The tirailleurs sénégalais
    ww1-691  Blaise Diagne and recruitment in West Africa
    ww1-692  Resistance to recruitment in French Africa
    ww1-693  The Volta-Bani war
    ww1-694  The South African Native Labour Contingent
    ww1-695  The sinking of the SS Mendi
    ww1-696  The British West Indies Regiment
    ww1-697  Racial segregation in the Allied armies
    ww1-698  Canada in the First World War
    ww1-699  The Canadian Expeditionary Force
    ww1-700  Australia in the First World War
    ww1-701  New Zealand in the First World War
    ww1-702  South Africa in the First World War
    ww1-703  Newfoundland's war
    ww1-704  The dominions and imperial decision-making
    ww1-705  The Imperial War Cabinet
    ww1-706  The dominions at the peace conference
    ww1-707  Ireland and the war
    ww1-708  The 36th (Ulster) Division
    ww1-709  The 16th (Irish) Division
    ww1-710  Irish veterans and independence
    ww1-711  Colonial troops and the colour bar in Europe
    ww1-712  Wartime service and post-war nationalism
    ww1-713  The war and the idea of imperial obligation
    ww1-714  War memorials in the empire
    ww1-715  The empire's war dead

### Asia, the Pacific and the labour corps — `ww1-asia`

    ww1-716  Asia and the First World War
    ww1-717  Japan's war aims
    ww1-718  The Japanese navy in the Mediterranean
    ww1-719  The Twenty-One Demands
    ww1-720  Japan and Shandong
    ww1-721  The seizure of Germany's Pacific colonies
    ww1-722  Australia and New Guinea
    ww1-723  New Zealand and Samoa
    ww1-724  China's entry into the war
    ww1-725  The Chinese Labour Corps
    ww1-726  Noyelles-sur-Mer and the Chinese war graves
    ww1-727  China at the peace conference
    ww1-728  The May Fourth Movement
    ww1-729  Vietnamese workers and soldiers in France
    ww1-730  The Indochinese labour battalions
    ww1-731  Siam's declaration of war
    ww1-732  The Ottoman appeal to Muslim subjects
    ww1-733  The war and pan-Islamism
    ww1-734  Egypt under martial law
    ww1-735  The Egyptian Labour Corps
    ww1-736  The Egyptian revolution of 1919
    ww1-737  Persia in the First World War
    ww1-738  The famine in Persia
    ww1-739  Central Asia and the revolt of 1916
    ww1-740  Asia's war and the end of European prestige

### The Americas and the neutrals — `ww1-neutrals`

    ww1-741  The neutral states
    ww1-742  American neutrality
    ww1-743  The American arms trade with the Allies
    ww1-744  German sabotage in the United States
    ww1-745  The Zimmermann Telegram
    ww1-746  Woodrow Wilson's decision for war
    ww1-747  The American Expeditionary Forces arrive
    ww1-748  Pershing and an independent American army
    ww1-749  The American army in battle
    ww1-750  African American soldiers in the war
    ww1-751  The Harlem Hellfighters
    ww1-752  Brazil's declaration of war
    ww1-753  Latin America and the war
    ww1-754  The war's effect on neutral economies
    ww1-755  Switzerland in the First World War
    ww1-756  The Netherlands in the First World War
    ww1-757  Spain in the First World War
    ww1-758  Scandinavian neutrality
    ww1-759  Humanitarian work from neutral ground
    ww1-760  The Red Cross in the First World War

### The Armenian genocide and mass violence — `ww1-genocide`

    ww1-761  The Armenian genocide
    ww1-762  The Armenians of the Ottoman Empire
    ww1-763  The Hamidian massacres
    ww1-764  The Adana massacre
    ww1-765  The Committee of Union and Progress and nationalism
    ww1-766  The Tehcir Law
    ww1-767  The arrests of 24 April 1915
    ww1-768  The deportations of 1915
    ww1-769  The death marches to Deir ez-Zor
    ww1-770  The Special Organisation
    ww1-771  The killing of Assyrian Christians
    ww1-772  The Greek genocide
    ww1-773  Eyewitness accounts of the genocide
    ww1-774  Henry Morgenthau's reports
    ww1-775  The Allied declaration of May 1915
    ww1-776  The post-war courts martial in Constantinople
    ww1-777  Operation Nemesis
    ww1-778  The survivors and the diaspora
    ww1-779  Denial of the Armenian genocide
    ww1-780  The genocide and the idea of crimes against humanity

## 1917 and 1918

### The year of crisis — `ww1-1917`

    ww1-781  1917 as the war's turning point
    ww1-782  War weariness in 1917
    ww1-783  The February Revolution and the war
    ww1-784  The Provisional Government's decision to fight on
    ww1-785  The collapse of Russian discipline
    ww1-786  The October Revolution and the war
    ww1-787  The Decree on Peace
    ww1-788  The armistice at Brest-Litovsk
    ww1-789  The peace terms of Brest-Litovsk
    ww1-790  Germany's eastern empire
    ww1-791  The consequences of Russia's exit
    ww1-792  The causes of the French mutinies
    ww1-793  Punishment and reform after the mutinies
    ww1-794  The Italian crisis after Caporetto
    ww1-795  The papal peace note
    ww1-796  Benedict XV and the useless slaughter
    ww1-797  The Austrian peace feelers
    ww1-798  The Sixtus affair
    ww1-799  The Reichstag Peace Resolution of 1917
    ww1-800  The fall of Bethmann Hollweg
    ww1-801  The rise of Ludendorff's power
    ww1-802  Britain's manpower crisis
    ww1-803  The Lansdowne letter
    ww1-804  The Fourteen Points
    ww1-805  The idea of a peace without victory
    ww1-806  War aims after the Bolshevik disclosures
    ww1-807  The publication of the secret treaties
    ww1-808  The Supreme War Council
    ww1-809  Unity of command and Ferdinand Foch
    ww1-810  The state of the armies at the end of 1917

### The German offensives — `ww1-kaiserschlacht`

    ww1-811  The German spring offensive of 1918
    ww1-812  The strategic calculation of 1918
    ww1-813  The transfer of divisions from the east
    ww1-814  Stormtroop tactics
    ww1-815  The Hutier method
    ww1-816  Bruchmüller and the artillery plan
    ww1-817  Operation Michael
    ww1-818  The breakthrough of 21 March 1918
    ww1-819  The Fifth Army's retreat
    ww1-820  The Doullens conference
    ww1-821  Foch as generalissimo
    ww1-822  The Paris Gun
    ww1-823  Operation Georgette
    ww1-824  The Backs to the Wall order
    ww1-825  The German advance on the Marne
    ww1-826  Château-Thierry and Belleau Wood
    ww1-827  The Second Battle of the Marne
    ww1-828  The limits of the stormtroop method
    ww1-829  German casualties in the spring offensives
    ww1-830  The exhaustion of the German army
    ww1-831  Influenza and the German offensives
    ww1-832  The failure of German logistics
    ww1-833  Allied reserves and American manpower
    ww1-834  The turn of the tide in July 1918
    ww1-835  Why the spring offensives failed

### The Hundred Days — `ww1-100days`

    ww1-836  The Hundred Days Offensive
    ww1-837  The Battle of Amiens
    ww1-838  The black day of the German army
    ww1-839  The all-arms battle of 1918
    ww1-840  Tanks in 1918
    ww1-841  Artillery and the predicted barrage
    ww1-842  Sound ranging and flash spotting
    ww1-843  Aircraft and the 1918 battlefield
    ww1-844  The logistics of the advance
    ww1-845  The breaking of the Hindenburg Line
    ww1-846  The Battle of St Quentin Canal
    ww1-847  The Meuse-Argonne offensive
    ww1-848  The American army's learning curve
    ww1-849  The Battle of the Selle
    ww1-850  The Canadian Corps in the Hundred Days
    ww1-851  The Australian Corps and John Monash
    ww1-852  The Battle of Mont Saint-Quentin
    ww1-853  The liberation of occupied France and Belgium
    ww1-854  German surrenders in 1918
    ww1-855  The German army's discipline in retreat
    ww1-856  The collapse of Bulgaria and its consequences
    ww1-857  The Ottoman collapse
    ww1-858  The disintegration of Austria-Hungary
    ww1-859  The national councils of October 1918
    ww1-860  The Allied advance in the Balkans
    ww1-861  The German request for an armistice
    ww1-862  The Wilson notes
    ww1-863  The German constitutional reform of October 1918
    ww1-864  The naval mutiny at Kiel
    ww1-865  The German revolution of November 1918

### The armistices — `ww1-armistice`

    ww1-866  The armistice of 11 November 1918
    ww1-867  The sequence of the autumn armistices
    ww1-868  The railway carriage at Compiègne
    ww1-869  Matthias Erzberger
    ww1-870  The terms of the armistice
    ww1-871  Foch and the armistice negotiations
    ww1-872  The abdication of Wilhelm II
    ww1-873  The proclamation of the German republic
    ww1-874  Friedrich Ebert and the new government
    ww1-875  The last day of the war
    ww1-876  The last casualties
    ww1-877  The news of the armistice
    ww1-878  Celebrations of 11 November 1918
    ww1-879  The occupation of the Rhineland
    ww1-880  The surrender of the High Seas Fleet
    ww1-881  The scuttling at Scapa Flow
    ww1-882  The internment of the German submarines
    ww1-883  The return of prisoners of war
    ww1-884  Demobilisation
    ww1-885  Demobilisation riots
    ww1-886  The soldiers' return
    ww1-887  The continuation of the blockade into 1919
    ww1-888  The stab-in-the-back myth
    ww1-889  Was Germany defeated in the field
    ww1-890  The war's final ledger

## Aftermath, Memory and Meaning

### The peace settlements — `ww1-peace`

    ww1-891  The Paris Peace Conference
    ww1-892  The Council of Four
    ww1-893  Woodrow Wilson at Paris
    ww1-894  Clemenceau's aims
    ww1-895  Lloyd George's aims
    ww1-896  Orlando and Italy's claims
    ww1-897  The exclusion of the defeated
    ww1-898  Self-determination as a principle
    ww1-899  The limits of self-determination
    ww1-900  The Treaty of Versailles
    ww1-901  The war guilt clause
    ww1-902  Reparations
    ww1-903  The reparations commission
    ww1-904  Germany's territorial losses
    ww1-905  The Rhineland provisions
    ww1-906  The disarmament clauses
    ww1-907  The German reaction to the treaty
    ww1-908  The Diktat
    ww1-909  Keynes and the Economic Consequences of the Peace
    ww1-910  The Treaty of Saint-Germain
    ww1-911  The Treaty of Trianon
    ww1-912  The Treaty of Neuilly
    ww1-913  The Treaty of Sèvres
    ww1-914  The Treaty of Lausanne
    ww1-915  The new states of central Europe
    ww1-916  The rebirth of Poland
    ww1-917  The creation of Czechoslovakia
    ww1-918  The Kingdom of Serbs, Croats and Slovenes
    ww1-919  The minorities treaties
    ww1-920  The mandate system
    ww1-921  The League of Nations
    ww1-922  The League's covenant
    ww1-923  The American rejection of the League
    ww1-924  The Senate and Article X
    ww1-925  Was the peace a failure

### Wars after the war — `ww1-wars`

    ww1-926  The wars after the war
    ww1-927  The Russian Civil War and the Allies
    ww1-928  Allied intervention in Russia
    ww1-929  The Polish-Soviet War
    ww1-930  The Battle of Warsaw of 1920
    ww1-931  The Greco-Turkish War
    ww1-932  The Turkish War of Independence
    ww1-933  The burning of Smyrna
    ww1-934  The population exchange between Greece and Turkey
    ww1-935  The Hungarian Soviet Republic
    ww1-936  The Romanian occupation of Budapest
    ww1-937  The German Freikorps
    ww1-938  The Spartacist uprising
    ww1-939  The Kapp Putsch
    ww1-940  The Silesian uprisings
    ww1-941  The Irish War of Independence
    ww1-942  The Baltic wars of independence
    ww1-943  The Ukrainian struggle and the pogroms of 1919
    ww1-944  The Italian occupation of Fiume
    ww1-945  The Ruhr occupation of 1923
    ww1-946  Hyperinflation in Germany
    ww1-947  The Corfu incident
    ww1-948  Paramilitary violence in post-war Europe
    ww1-949  The brutalisation thesis
    ww1-950  When did the First World War end

### Counting the cost — `ww1-cost`

    ww1-951  The death toll of the First World War
    ww1-952  Counting the war dead
    ww1-953  Military deaths by country
    ww1-954  Civilian deaths in the First World War
    ww1-955  The wounded and the permanently disabled
    ww1-956  The missing
    ww1-957  War orphans and widows
    ww1-958  Veterans' pensions
    ww1-959  Veterans' organisations
    ww1-960  The lost generation
    ww1-961  Demographic effects of the war
    ww1-962  The war's economic cost
    ww1-963  The financial legacy of war debt
    ww1-964  Territorial change after the war
    ww1-965  The end of four empires
    ww1-966  Displaced peoples after the war
    ww1-967  The Nansen passport
    ww1-968  Post-war famine relief
    ww1-969  The war and the growth of the state
    ww1-970  The war's cost to the colonised world

### Memory and meaning — `ww1-memory`

    ww1-971  Remembering the First World War
    ww1-972  The war memorial
    ww1-973  The Imperial War Graves Commission
    ww1-974  Fabian Ware
    ww1-975  The design of the war cemeteries
    ww1-976  Equality of treatment in the war graves
    ww1-977  Unequal commemoration in Africa and Asia
    ww1-978  The Menin Gate
    ww1-979  The Thiepval Memorial
    ww1-980  The Cenotaph
    ww1-981  The tomb of the unknown warrior
    ww1-982  The two-minute silence
    ww1-983  Armistice Day
    ww1-984  The remembrance poppy
    ww1-985  Anzac Day
    ww1-986  Volkstrauertag and German mourning
    ww1-987  The French monument aux morts
    ww1-988  War literature of the First World War
    ww1-989  The war poets
    ww1-990  Wilfred Owen
    ww1-991  All Quiet on the Western Front
    ww1-992  War memoirs and the disenchantment of the 1920s
    ww1-993  The war in painting
    ww1-994  The war in film
    ww1-995  Oh! What a Lovely War and the war in the 1960s
    ww1-996  Lions led by donkeys
    ww1-997  The Fischer controversy
    ww1-998  The war in national histories
    ww1-999  The centenary of the First World War
    ww1-1000  The seminal catastrophe

