# Japan — a 1000-card running order

The plan for `japan`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the tenth of these, after Ancient Greece, World History, Ancient Rome, Russia, India, China,
Ancient Egypt, the Second World War and the United States, and it is written to the same rules. Read
`docs/greece-card-plan.md` first if this is the first one you have met; the mechanics are identical and
are not restated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `jp-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='jp-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `jp-001` … `jp-999`, then `jp-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`jp-146 The Tale of Genji` is already an answer term; `jp-434 What "closed country" actually meant` is
an argument to describe, and the card's actual answer — the word that gets blanked — is chosen while
writing it, from what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** When that happens,
change the line here in the same commit as the card, and say so — this file is only useful while it is
true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its numeral system all ship with the file. That is the Egypt and Second World War case rather
than the Rome, Russia, India and United States one, where the node was already sitting empty.

**The id is `japan`**, following the readable-id precedent set by `china`, `egypt` and `ww2` rather than
taking the next `col-NN`. **The card prefix is `jp-`**, free of every existing prefix (`wh-`, `gr-`,
`rm-`, `ru-`, `in-`, `cnh-`, `eg-`, `ww2-`, `us-`).

**The hue is `#8A2E5C`, a deep red-purple**, and it was measured rather than picked. In CIELAB it sits
**35.9 from its nearest neighbour** — Rome's imperial purple, which is a blue-violet where this is a
red-purple — against a tightest existing pair of 12.9, and its lightness (L\* 34) sits inside the
existing range. It reads 8.0:1 against white, the best of the well-separated candidates.

**The two obvious Japanese colours were both measured and both are taken**, which is worth recording so
nobody tries them again: a *kachi* indigo lands **8.3** from the United States' navy and a *sumi*
charcoal **7.8** from the Second World War's dark iron — each less than the shelf's tightest existing
pair, so either would read as a near-miss of a colour already in use. What `#8A2E5C` is instead is
*kuwazome*, one of the murasaki family that the Taihō code reserved to the highest court ranks, which
is apt for a collection with a whole deck on the Heian court — but the numbers led there first and the
aptness cost nothing.

**It gets a `COLLECTION_NUMERALS` entry, `"ja"`**, and the reasoning is worth stating because the
obvious shortcut is wrong. Japanese counts in the same kanji China does — 一, 二, 三 … 十二 — so
`numeralIn` reuses `cnNumeral()` unchanged and there is only one implementation. What it must **not**
reuse is the `"zh"` key, because that key does two things: it selects the numerals *and* it puts the
badge in `var(--han)`, which is **Noto Sans SC, a Simplified Chinese webfont**. CLAUDE.md already warns
that face out of the body chain precisely so it cannot impose Chinese glyph forms on Japanese text, and
labelling a Japan collection's numerals "zh" in the code would say the wrong thing besides. So `"ja"`
gets the same numerals and its own badge rules (`.level-badge.num-ja`, `.lu-badge.num-ja`) at the same
sizes as `.zh` **without** the font override, falling through to the reader's own system CJK font —
which is exactly the treatment Japanese body text already gets by design.

## What this collection is about, and the three scope decisions

**It runs from the Jōmon to the present**, which is a long span even by this site's standards, and it is
not front-loaded: the four decks from Meiji onward take 460 of the thousand. Japan is one of the few
subjects where the deep past and the last century are both extremely well documented and both matter,
and a collection that treated the modern period as a coda would be avoiding most of what a reader comes
with.

**First: the Ainu and the Ryukyuans get a deck.** Japan is routinely described — including by the
Japanese state for most of the twentieth century — as one of the world's most ethnically homogeneous
countries. That description is a Meiji-era nation-building claim before it is a fact. Hokkaido was
colonised from 1869 by a government office set up for the purpose, and the Ryukyu Kingdom was a
sovereign tributary state with its own court, language and trade network until it was annexed in 1879.
Both are in living political argument now: the Ainu were recognised as an indigenous people only in
2019, and Okinawa carries the great majority of the American bases. So `jp-ainu` and `jp-ryukyu` are 30
cards each, and — the load-bearing part — **the annexations are carded in those decks and not in the
Meiji empire deck**, because they are events in the history of those peoples before they are two lines
in somebody else's expansion.

**Second: the empire and the war are carded from the outside as well as the inside.** `jp-colonial`
takes 35 cards and most of them are about Taiwan, Korea, Manchuria and China rather than about Tokyo.
Japanese colonial rule, the war in China, the Nanjing Massacre, Unit 731 and the comfort women system
are all subjects on which the scholarship is settled and the public argument is not, in Japan and in the
countries affected alike. The rule is the Russia plan's, which the Second World War plan needed too:
**no state's account of its own actions is repeated as established fact.** That cuts in every direction
here, including toward the wartime claims of Japan's opponents.

**Third: `jp-memory` exists as a subdeck of 20.** How this war is remembered is not a coda to it. The
textbook controversies, the Yasukuni visits, the apology statements, the reparations treaties and the
South Korean forced-labour rulings are live diplomacy between four countries, and they are carded as
history — what was said, when, by whom, and what it did — rather than adjudicated.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Early Japan | Jōmon Japan | 30 | jp-001–030 |
| | Yayoi and Kofun | 30 | jp-031–060 |
| | Asuka: the state and Buddhism | 25 | jp-061–085 |
| | Nara Japan | 25 | jp-086–110 |
| The Heian Court | The court and the Fujiwara | 30 | jp-111–140 |
| | Heian literature and art | 35 | jp-141–175 |
| | The provinces and the rise of the warriors | 25 | jp-176–200 |
| The Warrior Age | The Kamakura shogunate | 35 | jp-201–235 |
| | The Mongol invasions | 15 | jp-236–250 |
| | The Muromachi shogunate | 35 | jp-251–285 |
| | Medieval religion and culture | 25 | jp-286–310 |
| Unification | The Sengoku age | 35 | jp-311–345 |
| | The Europeans and Christianity | 25 | jp-346–370 |
| | The three unifiers | 40 | jp-371–410 |
| Tokugawa Japan | The Tokugawa order | 35 | jp-411–445 |
| | Edo society and the economy | 35 | jp-446–480 |
| | Edo culture | 35 | jp-481–515 |
| | The end of the shogunate | 25 | jp-516–540 |
| Meiji Japan | The Meiji Restoration | 30 | jp-541–570 |
| | Building the modern state | 30 | jp-571–600 |
| | Society, industry and culture | 25 | jp-601–625 |
| | The road to empire | 25 | jp-626–650 |
| Empire and War | Taishō Japan | 25 | jp-651–675 |
| | The turn to militarism | 30 | jp-676–705 |
| | The Japanese empire | 35 | jp-706–740 |
| | The war and its end | 30 | jp-741–770 |
| Postwar Japan | The Occupation | 30 | jp-771–800 |
| | The economic miracle | 30 | jp-801–830 |
| | Japan since 1973 | 30 | jp-831–860 |
| | The war in Japanese memory | 20 | jp-861–880 |
| Peoples, Belief and the Arts | The Ainu and Hokkaido | 30 | jp-881–910 |
| | Ryūkyū and Okinawa | 30 | jp-911–940 |
| | Shinto, Buddhism and belief | 30 | jp-941–970 |
| | Language, letters and the arts | 30 | jp-971–1000 |

Deck totals: Early Japan 110 · The Heian Court 90 · The Warrior Age 110 · Unification 100 ·
Tokugawa Japan 130 · Meiji Japan 110 · Empire and War 120 · Postwar Japan 110 ·
Peoples, Belief and the Arts 120. **1000.**

## What the weighting is arguing

**Tokugawa Japan gets the largest chronological deck at 130.** Two and a half centuries without a war,
during which the population, the cities, the road system, literacy, the publishing trade and a
commercial economy all grew enormously, and at the end of which a country supposedly sealed off from
the world industrialised faster than anywhere had. The Edo period is where the explanation for the
Meiji one has to come from, and a collection that treats it as a long pause before the interesting part
has guaranteed it cannot explain 1868.

**The Heian court gets 90 and 35 of them are literature and art.** This is the one place on the site
where a court's *writing* is the primary reason the period is studied — *The Tale of Genji*, *The
Pillow Book*, the poetic diaries, the anthologies — and the largest part of it was written by women, in
a script women were writing in because the men were writing Chinese. That is not a curiosity to note in
passing; it is why the deck is the size it is.

**Meiji, Empire and Postwar take 340 between them.** The century from 1868 to 1972 contains the fastest
state transformation of the modern era, an empire, a war that killed millions of other people and
around three million Japanese, an occupation that rewrote the constitution, and an economy that went
from ruins to the world's second largest. None of that fits in a coda.

**The Ainu and Ryukyu decks take 60 between them**, which is more than most collections give any single
people, and the reasoning is under the scope decisions above.

**The Mongol invasions get 15 and no more.** They are the most famous event in medieval Japanese
history outside Japan and they occupied two summers. Fifteen cards is enough for both campaigns, the
defensive works, the archaeology of the fleets, the shogunate's rewards crisis — which mattered more
than the battles — and the long afterlife of the word *kamikaze*.

## Six decisions this plan forced on the tree

**The Ainu and Ryukyuan annexations are carded in their own decks, not in `jp-meiji-empire`.** The most
consequential structural decision here, and it is stated in the scope section above. `jp-meiji-empire`
carries the frontier settlements and the treaties that fixed Japan's borders; `jp-898` and `jp-929`
carry the colonisation of Hokkaido and the Ryukyu disposition, in the decks that then follow those
peoples into the present.

**There is no "samurai" deck, and that is deliberate.** It is the single most requested thing about
Japanese history in English and it would be the worst deck on the site — a category that spans seven
centuries, three completely different social positions and one enormous romantic literature. The
warriors are carded where they were: as provincial strongmen in `jp-heian-provinces`, as a government
in `jp-kamakura`, as regional rulers in `jp-sengoku`, as salaried administrators in `jp-bakufu`, and as
a status abolished in `jp-restoration`. `jp-514 Bushidō` and `jp-515` then card the code itself as what
it largely is — a late construction — and `jp-335` cards what samurai warfare actually consisted of.

**Buddhism and Shinto are carded twice over, by period and thematically, and this is not duplication.**
The period decks carry what a school's arrival *did* — Nara Buddhism as an arm of the state, the
Kamakura schools as a mass religion, the Meiji separation of Shinto from Buddhism as an act of policy —
while `jp-religion` carries what the practices *are*, which is what a reader meets in a shrine or at a
funeral and which no period owns.

**The Korean invasions of the 1590s sit in `jp-unifiers`, at the end of Hideyoshi's career.** They were
his project, they are unintelligible apart from what unification had just built, and they are the
largest military undertaking in East Asia between the Mongols and the twentieth century. Four cards,
including what they cost and the Korean potters taken back to Japan.

**`jp-nanban` is a subdeck of 25 rather than a few cards inside the Sengoku.** The century from 1543 to
the closure covers firearms, the Jesuit mission, a Christian population in the hundreds of thousands, a
Japanese embassy to Rome, the Portuguese trade in Japanese slaves, the expulsions, Shimabara and the
hidden Christians who kept a form of the religion for two hundred and fifty years. That is a subject,
not an interlude.

**`jp-memory` is a subdeck and not a handful of cards at the end of `jp-war`.** Same reasoning as the
Second World War plan's, which cards the national memories as subjects: how a war is remembered is part
of its history, and putting it inside the war deck makes it an epilogue instead.

## History, not myth — and the four pulls

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Archaeology is a genuine pull only in deck 1 and
is handled as Egypt's plan handles it — the card is about the people, not the dig — with one deliberate
exception at `jp-028`, below. Four other things pull harder.

**Romance.** More popular English-language material exists about samurai, ninja and bushidō than about
any other part of this subject, and a great deal of it is invention. The corrective is not to leave
those subjects out but to card them accurately and to card the invention as its own subject:
`jp-333 Ninja` and `jp-334 What ninja actually were`; `jp-514 Bushidō` and `jp-515`, which take up a
code named in a book written in English in 1900 for a Western readership; `jp-335`, on what samurai
warfare consisted of, which for most of the Sengoku was massed infantry with spears and, after 1543,
guns.

**Essentialism.** *Nihonjinron* — the genre explaining Japanese behaviour by an unchanging Japanese
character — is not a neutral background and is the single easiest register to slide into when writing
about this subject in English. The test is the tense: a card that says the Japanese *are* something has
adopted the claim, where a card that says a practice began at a datable moment for reasons has
described one. `jp-588 The invention of Japanese tradition` and `jp-1000` card the pattern directly.

**The isolation story.** *Sakoku* is usually met as "Japan sealed itself off from the world for two
hundred and fifteen years", which the scholarship has substantially revised: trade and information ran
continuously through four gateways — the Dutch and Chinese at Nagasaki, Korea through Tsushima, Ryūkyū
through Satsuma, and the Ainu through Matsumae — and the word itself is a nineteenth-century coinage
back-applied to the policy. `jp-433`, `jp-434` and `jp-435` card the policy, the revision and the four
gateways, and the cards on Rangaku show what actually got through.

**Live political use.** The empire, the war and the memory of both are argued about in the present by
four governments, and the collection takes no position on any question that is live in current
diplomacy. What it does do — the United States plan's rule, needed here too — is **decline to treat a
settled historical question as open because it is politically contested**. The Nanjing Massacre
happened; the argument among historians is about the number and about how the army came to behave that
way, and `jp-730`, `jp-731` and `jp-872` are ordered so the evidence comes before the denial, as the
Second World War plan requires.

**Modern scholars are capped at two in the thousand and the plan spends none.** The nearest thing to an
earned one is `jp-028 The Japanese Paleolithic hoax` — where a leading archaeologist was found in 2000
to have been planting his own finds for two decades, invalidating an entire supposed early Palaeolithic
and forcing the textbooks to be rewritten — and it is carded as an **event**, at `jp-029`, rather than
as a biography.

## Names, dates and figures

**Name order is Japanese: family name first.** Tokugawa Ieyasu, Murasaki Shikibu, Ōe Kenzaburō. This is
standard in the scholarship and has been the Japanese government's own stated policy since 2019, and it
must be applied consistently or half the collection will file people under the wrong name. Where a
figure is overwhelmingly known in English the other way round, the card gives both once.

**Macrons on Japanese words and names, not on established English place names.** So *shōgun*, *daimyō*,
*Hōjō*, *Ōkubo*, *Ryūkyū*, *Jōmon* — but Tokyo, Osaka, Kyoto, Kobe, Honshu, Kyushu, Hokkaido, which
have settled English forms. This is ordinary scholarly practice and the inconsistency is only apparent:
the second list are English words now. **The glossary must carry both spellings as aliases** wherever
they differ, or a card writing *daimyō* will not link to a term keyed `Daimyo`.

**Era names.** Japanese dates are frequently given by era — Meiji 1 is 1868, Shōwa 20 is 1945 — and the
eras are also the names of the periods. Cards give the Western year, and use the era name where it is
the name of the period rather than a way of writing a date.

**The calendar changes on 1 January 1873**, when Japan replaced the lunisolar calendar with the
Gregorian one. This is Japan's version of the Julian/Gregorian gap the Russia plan has to handle, and it
is smaller but real: a specific day before 1873 may fall in a different Western month from the one the
Japanese date suggests, so a card naming an exact day in, say, the Boshin War gives the date its source
gives and says which calendar it is.

**Figures.** Two sets are contested and both are carded so a reader meets the argument rather than a
number. **The dead at Nanjing** have published estimates ranging from tens of thousands to over three
hundred thousand, resting on different definitions of the area and the period as well as on different
evidence; `jp-731` is about the evidence and the range, and the range is given with whose it is.
**Japan's own war dead** are usually given as around 2.5–3.1 million, and the civilian figures for the
firebombing and the atomic bombings likewise have ranges. The standing rule applies: give the range,
name whose it is, and never state the highest or lowest available figure flat.

## Sourcing

**Very well served in English**, which is not true of every collection here. The Cambridge History of
Japan, the university presses (Harvard, Columbia, Stanford, Hawai'i, California), the National Diet
Library's digital collections, the Japanese national museums and a large body of translated primary
sources — the chronicles, the Heian diaries, the Tokugawa legal codes, the Meiji constitution debates,
the Tokyo trial record — are all open and reachable.

**Three hazards, and the first is the most likely to catch a card unawares.**

**The popular literature on premodern Japan is heavily romanticised**, and some of it is old enough to
be freely available online, which is exactly why it turns up first. Nitobe's *Bushidō* (1900), the
Victorian and Edwardian accounts of "the soul of Japan", and the enormous martial-arts and
ninja literature are evidence of what people wanted Japan to be. Age is not authority, and neither is
a Japanese author's name on the cover — Nitobe wrote in English, for Americans, from a country he had
left as a young man.

**War-history material is contested and some of it is denialist**, in the same way the Second World War
plan describes and from more than one direction. The citation bar is the defence and should be applied
more strictly here than for the premodern decks: a peer-reviewed work, a national archive, a museum
with a research department, or an intergovernmental record — opened and read — or the claim does not
ship. The Tokyo trial record and the Japanese government's own published statements are primary
sources and are cited as such, which is not the same as endorsing them.

**Testimony from the comfort women, from Chinese survivors and from Korean forced labourers is evidence
and needs handling as such** — indispensable, not interchangeable with a secondary source, and the
subject of its own scholarship about how to use it. The same holds for *hibakusha* testimony. Cards
resting on any of it should be written having read what the scholarship says about using it.

## Living beside the other collections

**World History is the survey and never waits for this collection.** Japan appears in `wh-ming-qing`
(Tokugawa Japan), in the imperialism and both world war decks, and in the contemporary one, at survey
altitude. The rule in `docs/world-history-card-plan.md` cuts both ways: ten sentences on the Meiji
Restoration is a different card from ten sentences on the commutation of samurai stipends.

**Four collections already card these same events, and the pairs should be written deliberately
differently:**

| subject | elsewhere | here |
|---|---|---|
| the war in China | `cnh-631`–`cnh-655` — eight years that reshaped China; `ww2-401`–`ww2-435` — the war's longest land theatre | `jp-728`–`jp-734` — what the army did and what it could not win |
| Pearl Harbor and the Pacific | `ww2-436`–`ww2-510`; `us-828`, `us-843`–`us-846` | `jp-741`–`jp-752` — the decision, and a war Japan's own planners did not expect to win |
| the atomic bombings | `ww2-936`–`ww2-946`; `us-851`–`us-853` — the decision and the argument about it | `jp-767`, `jp-798`, `jp-799`, `jp-873` — what happened under them, and what the survivors became |
| the Occupation | `ww2-961`–`ww2-1000` — one of the war's settlements | `jp-771`–`jp-800` — six years that rewrote a country's constitution, land ownership and schools |
| the Mongols | `cnh` Yuan cards; `ru-` the Mongol yoke | `jp-236`–`jp-250` — two failed summers with consequences out of all proportion |
| Ming tribute and trade | `cnh-546`-range — the Chinese frame | `jp-263`, `jp-264`, `jp-920`, `jp-921` — from Ashikaga Japan and from Ryūkyū |

**And two collections that do not exist yet.** Korea appears here constantly — as the route by which
writing, Buddhism and metallurgy arrived, as the target of two invasions, and as a colony for
thirty-five years — and the Korean side of all of that belongs to a Korea collection Folio has not
planned. `docs/india-card-plan.md` and `docs/us-card-plan.md` record the same gap for Britain. When
either is written, these are its pairs.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `jp-441 Matsumae and the Ainu trade` → also `jp-ainu`
- `jp-440 Satsuma and Ryūkyū` → also `jp-ryukyu`
- `jp-584`–`jp-586`, State Shinto and the separation from Buddhism → also `jp-religion`
- `jp-514 Bushidō`, `jp-515` → also `jp-sengoku`, which is the age they claim to describe
- `jp-762 Battle of Okinawa`, `jp-763 Civilian deaths on Okinawa` → also `jp-ryukyu`
- `jp-730`–`jp-736`, the crimes in China and the comfort women system → also `jp-memory`
- `jp-989 Manga`, `jp-987 Anime` → also `jp-contemporary`

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`).

The glossary has `Japan` and nothing else Japanese — no `Samurai`, no `Shogun`, no `Shinto`, no `Kami`,
no `Ukiyo-e`, no `Ainu`. Write those **cited from the start**, at the `GLOSS_SRC_TARGET` bar of 2.

Four traps, and the first two are specific to this collection. **A macron is an alias problem, both
directions**: a term keyed `Daimyo` will not match a card writing *daimyō*, and one keyed `Shōgun` will
not match *shogun*, so every affected term needs both forms the day it ships — this collection has more
of them than any other. **A Japanese word that has entered English keeps its English sense as well**:
`Zen`, `Samurai`, `Tycoon`, `Emoji`, `Futon`, `Honcho` and `Bonsai` all occur in ordinary English prose
where the Japanese sense is not meant, so those need `GLOSSARY_CASESENSITIVE` or a narrower head word.
**A term whose surface is an ordinary English word** — `Occupation`, `Restoration`, `Bubble`,
`Reversion` — needs the same. And **the war and colonial terms need particular care in three
sentences**: a glossary entry is the shortest thing on the site and the least room in which to be
careless, so draft those from museum and institutional definitions rather than from the first summary
that comes to hand.

---

# The list

## Early Japan

### Jōmon Japan — `jp-jomon`

    jp-001  Japan
    jp-002  The Japanese archipelago
    jp-003  Japanese Paleolithic
    jp-004  The peopling of the Japanese islands
    jp-005  Jōmon period
    jp-006  Jōmon pottery
    jp-007  The world's earliest pottery
    jp-008  Jōmon chronology
    jp-009  Jōmon settlements
    jp-010  Sannai-Maruyama Site
    jp-011  Jōmon subsistence
    jp-012  Shell middens and the Jōmon diet
    jp-013  Jōmon plant management
    jp-014  Incipient cultivation in Jōmon Japan
    jp-015  Jōmon trade and obsidian
    jp-016  Lacquer in Jōmon Japan
    jp-017  Dogū
    jp-018  Jōmon ritual and stone circles
    jp-019  Jōmon burial
    jp-020  Jōmon population and its decline
    jp-021  The Jōmon in Hokkaido
    jp-022  The Jōmon in the Ryukyu Islands
    jp-023  What ended the Jōmon
    jp-024  Jōmon genetics
    jp-025  Jōmon ancestry in Japanese populations today
    jp-026  Jōmon regional diversity
    jp-027  Jōmon archaeology and Japanese identity
    jp-028  The Japanese Paleolithic hoax
    jp-029  What the hoax changed
    jp-030  How the Jōmon period is known

### Yayoi and Kofun — `jp-yayoi`

    jp-031  Yayoi period
    jp-032  The arrival of wet-rice agriculture in Japan
    jp-033  Yayoi migration from the continent
    jp-034  Yayoi pottery
    jp-035  Bronze and iron in Yayoi Japan
    jp-036  Dōtaku
    jp-037  Yayoi settlements and moated villages
    jp-038  Yoshinogari
    jp-039  Yayoi society and the rise of chiefs
    jp-040  Yayoi warfare
    jp-041  Wa (Japan)
    jp-042  The Chinese records of Wa
    jp-043  The Wei chronicle account of Japan
    jp-044  Yamatai
    jp-045  Himiko
    jp-046  The Yamatai location debate
    jp-047  Kofun period
    jp-048  Kofun
    jp-049  Daisenryō Kofun
    jp-050  Haniwa
    jp-051  The Yamato polity
    jp-052  The uji and the be
    jp-053  The horse-rider theory and why it was abandoned
    jp-054  Japan and the Korean kingdoms
    jp-055  Continental immigrants and their skills
    jp-056  The introduction of writing to Japan
    jp-057  The earliest inscriptions found in Japan
    jp-058  The Kofun aristocracy
    jp-059  The end of the Kofun age
    jp-060  Japan in East Asia by 550

### Asuka: the state and Buddhism — `jp-asuka`

    jp-061  Asuka period
    jp-062  The introduction of Buddhism to Japan
    jp-063  The Soga and Mononobe conflict
    jp-064  Soga clan
    jp-065  Prince Shōtoku
    jp-066  Seventeen-article constitution
    jp-067  Hōryū-ji
    jp-068  The first Japanese embassies to China
    jp-069  Empress Suiko
    jp-070  Taika Reform
    jp-071  Isshi incident
    jp-072  Emperor Tenji
    jp-073  Jinshin War
    jp-074  Emperor Tenmu
    jp-075  Ritsuryō
    jp-076  Taihō Code
    jp-077  The provincial and rank systems of the ritsuryō state
    jp-078  The handen land allotment system
    jp-079  Fujiwara-kyō
    jp-080  The rise of the tennō
    jp-081  Emperor of Japan
    jp-082  The origins of the imperial title
    jp-083  Early Japanese Buddhism and the state
    jp-084  Asuka art
    jp-085  Japan and Tang China

### Nara Japan — `jp-nara`

    jp-086  Nara period
    jp-087  Heijō-kyō
    jp-088  Nara and the Chinese capital model
    jp-089  Emperor Shōmu
    jp-090  Tōdai-ji
    jp-091  The Great Buddha of Nara
    jp-092  The six schools of Nara Buddhism
    jp-093  Nara Buddhism and the state
    jp-094  Gyōki
    jp-095  Ganjin
    jp-096  Shōsōin
    jp-097  What the Shōsōin holds
    jp-098  Kojiki
    jp-099  Nihon Shoki
    jp-100  The making of the imperial myth
    jp-101  Man'yōshū
    jp-102  Fudoki
    jp-103  The Nara economy and the tax system
    jp-104  The collapse of the handen system
    jp-105  Emishi
    jp-106  The northern wars of the eighth century
    jp-107  Empress Kōken and the Dōkyō affair
    jp-108  Nara court politics
    jp-109  The move away from Nara
    jp-110  What the Nara state achieved

## The Heian Court

### The court and the Fujiwara — `jp-heian-court`

    jp-111  Heian period
    jp-112  Heian-kyō
    jp-113  Emperor Kanmu
    jp-114  The reforms of the early Heian court
    jp-115  Fujiwara clan
    jp-116  Sesshō and Kampaku
    jp-117  Fujiwara no Michinaga
    jp-118  Marriage politics at the Heian court
    jp-119  Cloistered rule
    jp-120  Emperor Shirakawa
    jp-121  The Heian bureaucracy
    jp-122  Court ranks and offices in Heian Japan
    jp-123  Shōen
    jp-124  The decline of public land
    jp-125  Provincial governors and the zuryō
    jp-126  Kebiishi
    jp-127  The Heian calendar and the ritual year
    jp-128  Onmyōdō
    jp-129  Taboo, direction and daily life at court
    jp-130  Sugawara no Michizane
    jp-131  The end of the embassies to China
    jp-132  Heian Japan without China
    jp-133  Kūkai
    jp-134  Shingon Buddhism
    jp-135  Saichō
    jp-136  Tendai
    jp-137  Mount Hiei
    jp-138  Sōhei
    jp-139  Pure Land Buddhism in Heian Japan
    jp-140  The court and the provinces at 1050

### Heian literature and art — `jp-heian-culture`

    jp-141  Heian court culture
    jp-142  Kana
    jp-143  The development of hiragana
    jp-144  Women's writing in Heian Japan
    jp-145  Murasaki Shikibu
    jp-146  The Tale of Genji
    jp-147  What The Tale of Genji is about
    jp-148  The Tale of Genji as the first novel
    jp-149  Sei Shōnagon
    jp-150  The Pillow Book
    jp-151  Heian diary literature
    jp-152  The Kagerō Diary
    jp-153  Tosa Nikki
    jp-154  Waka
    jp-155  Kokin Wakashū
    jp-156  Ki no Tsurayuki
    jp-157  Poetry contests at the Heian court
    jp-158  Mono no aware
    jp-159  Miyabi
    jp-160  Heian court dress
    jp-161  Jūnihitoe
    jp-162  Shinden-zukuri
    jp-163  Byōdō-in
    jp-164  Yamato-e
    jp-165  Emakimono
    jp-166  The Tale of Genji scrolls
    jp-167  Heian Buddhist sculpture
    jp-168  Jōchō
    jp-169  Gagaku
    jp-170  Setsuwa
    jp-171  Konjaku Monogatarishū
    jp-172  Calligraphy in Heian Japan
    jp-173  The Heian language and its afterlife
    jp-174  Heian gardens
    jp-175  What Heian culture left

### The provinces and the rise of the warriors — `jp-heian-provinces`

    jp-176  The provinces in late Heian Japan
    jp-177  The origins of the samurai
    jp-178  Samurai
    jp-179  The warrior bands of the east
    jp-180  Minamoto clan
    jp-181  Taira clan
    jp-182  The warrior houses as servants of the court
    jp-183  Taira no Masakado
    jp-184  The rebellion of Masakado
    jp-185  Fujiwara no Sumitomo
    jp-186  Former Nine Years' War
    jp-187  Later Three-Year War
    jp-188  Northern Fujiwara
    jp-189  Hiraizumi
    jp-190  Chūson-ji
    jp-191  Hōgen Rebellion
    jp-192  Heiji Rebellion
    jp-193  Taira no Kiyomori
    jp-194  The Taira ascendancy
    jp-195  Genpei War
    jp-196  Battle of Ichi-no-Tani
    jp-197  Battle of Yashima
    jp-198  Battle of Dan-no-ura
    jp-199  The Tale of the Heike
    jp-200  What the Genpei War settled

## The Warrior Age

### The Kamakura shogunate — `jp-kamakura`

    jp-201  Kamakura shogunate
    jp-202  Minamoto no Yoritomo
    jp-203  The founding of the Kamakura government
    jp-204  Shogun
    jp-205  Shugo and jitō
    jp-206  Minamoto no Yoshitsune
    jp-207  The Yoshitsune legend
    jp-208  The end of the Minamoto line
    jp-209  Hōjō clan
    jp-210  Shikken
    jp-211  Hōjō Masako
    jp-212  Jōkyū War
    jp-213  The shogunate after the Jōkyū War
    jp-214  Goseibai Shikimoku
    jp-215  Kamakura law and the warrior estate
    jp-216  The Kamakura warrior household
    jp-217  Inheritance and warrior women in Kamakura Japan
    jp-218  Kamakura Buddhism
    jp-219  Hōnen
    jp-220  Jōdo-shū
    jp-221  Shinran
    jp-222  Jōdo Shinshū
    jp-223  Nichiren
    jp-224  Nichiren Buddhism
    jp-225  Eisai and the arrival of Zen
    jp-226  Dōgen
    jp-227  Sōtō
    jp-228  Zen and the warrior class
    jp-229  Kamakura sculpture
    jp-230  Unkei
    jp-231  Great Buddha of Kamakura
    jp-232  Kamakura literature
    jp-233  Hōjōki
    jp-234  The decline of the Hōjō
    jp-235  The fall of the Kamakura shogunate

### The Mongol invasions — `jp-mongol`

    jp-236  Mongol invasions of Japan
    jp-237  The Mongol embassies and Japan's refusal
    jp-238  The invasion of 1274
    jp-239  Battle of Bun'ei
    jp-240  The defensive wall of Hakata Bay
    jp-241  The invasion of 1281
    jp-242  Battle of Kōan
    jp-243  The divine wind
    jp-244  What actually destroyed the Mongol fleets
    jp-245  Mōko Shūrai Ekotoba
    jp-246  The cost of victory to the shogunate
    jp-247  The rewards problem and warrior discontent
    jp-248  The Mongol invasions in Japanese memory
    jp-249  The underwater archaeology of the invasion fleets
    jp-250  Japan and the Yuan after 1281

### The Muromachi shogunate — `jp-muromachi`

    jp-251  Kenmu Restoration
    jp-252  Emperor Go-Daigo
    jp-253  Ashikaga Takauji
    jp-254  Nanboku-chō period
    jp-255  The Southern and Northern Courts
    jp-256  Kusunoki Masashige
    jp-257  Taiheiki
    jp-258  Ashikaga shogunate
    jp-259  Muromachi period
    jp-260  Ashikaga Yoshimitsu
    jp-261  The reunification of the courts
    jp-262  Kinkaku-ji
    jp-263  Japan and Ming China
    jp-264  The tally trade
    jp-265  Ashikaga Yoshimasa
    jp-266  Ginkaku-ji
    jp-267  Shugo daimyō
    jp-268  The Muromachi provincial order
    jp-269  Wokou
    jp-270  Piracy in East Asian waters
    jp-271  Ikki
    jp-272  Ikkō-ikki
    jp-273  Peasant leagues and village self-rule
    jp-274  The medieval Japanese village
    jp-275  The medieval Japanese economy
    jp-276  Za and the merchant guilds
    jp-277  Coinage in medieval Japan
    jp-278  Ōnin War
    jp-279  The destruction of Kyoto
    jp-280  The collapse of shogunal authority
    jp-281  Gekokujō
    jp-282  The collapse of shugo authority in the provinces
    jp-283  Ashigaru
    jp-284  Castles in medieval Japan
    jp-285  Japan at 1500

### Medieval religion and culture — `jp-medieval-culture`

    jp-286  Muromachi culture
    jp-287  Kitayama and Higashiyama culture
    jp-288  Zen and Muromachi taste
    jp-289  Noh
    jp-290  Zeami
    jp-291  Kyōgen
    jp-292  Japanese tea ceremony
    jp-293  The beginnings of wabi-cha
    jp-294  Wabi-sabi
    jp-295  Ikebana
    jp-296  Japanese rock garden
    jp-297  Ryōan-ji
    jp-298  Ink wash painting in Japan
    jp-299  Sesshū Tōyō
    jp-300  Kanō school
    jp-301  Renga
    jp-302  Medieval Japanese poetry
    jp-303  Shinbutsu-shūgō
    jp-304  Honji suijaku
    jp-305  Ise Grand Shrine
    jp-306  Pilgrimage in medieval Japan
    jp-307  Kumano Kodō
    jp-308  Biwa hōshi and oral literature
    jp-309  Women in medieval Japan
    jp-310  What the medieval age made

## Unification

### The Sengoku age — `jp-sengoku`

    jp-311  Sengoku period
    jp-312  Sengoku daimyō
    jp-313  The daimyō domain and its law
    jp-314  Bunkokuhō
    jp-315  Kokudaka
    jp-316  Japanese castle
    jp-317  The castle town
    jp-318  Sengoku warfare
    jp-319  The spear and the massed infantry
    jp-320  Takeda Shingen
    jp-321  Uesugi Kenshin
    jp-322  Battles of Kawanakajima
    jp-323  The Later Hōjō of Odawara
    jp-324  Mōri Motonari
    jp-325  The Chōsokabe and Shikoku
    jp-326  Shimazu clan
    jp-327  Date Masamune
    jp-328  Imagawa Yoshimoto
    jp-329  Battle of Okehazama
    jp-330  The Miyoshi and the eclipse of the shogunate
    jp-331  The Ikkō-ikki against the daimyō
    jp-332  Enryaku-ji and the warrior monks in the Sengoku
    jp-333  Ninja
    jp-334  What ninja actually were
    jp-335  Samurai warfare and its realities
    jp-336  Sengoku society
    jp-337  The village in the Sengoku age
    jp-338  Sengoku women and marriage politics
    jp-339  Sengoku diplomacy and hostages
    jp-340  Mining and the Sengoku economy
    jp-341  Iwami Ginzan
    jp-342  Japanese silver and world trade
    jp-343  The sengoku daimyō and foreign trade
    jp-344  Religion in the Sengoku age
    jp-345  Japan in 1560

### The Europeans and Christianity — `jp-nanban`

    jp-346  Nanban trade
    jp-347  The arrival of the Portuguese
    jp-348  Tanegashima and the introduction of firearms
    jp-349  The Japanese adoption of the arquebus
    jp-350  Japanese gunsmithing in the sixteenth century
    jp-351  Francis Xavier
    jp-352  The Jesuit mission in Japan
    jp-353  Christianity in Japan
    jp-354  Kirishitan daimyō
    jp-355  Ōtomo Sōrin
    jp-356  Tenshō embassy
    jp-357  Nagasaki and the Jesuits
    jp-358  How many Japanese Christians there were
    jp-359  Nanban art
    jp-360  Japanese and European accounts of each other
    jp-361  Luís Fróis
    jp-362  The Portuguese trade in Japanese slaves
    jp-363  Hideyoshi's expulsion edict of 1587
    jp-364  Twenty-Six Martyrs of Japan
    jp-365  The Dutch and English arrivals
    jp-366  William Adams
    jp-367  The Tokugawa persecution of Christians
    jp-368  Fumi-e
    jp-369  Shimabara Rebellion
    jp-370  Kakure Kirishitan

### The three unifiers — `jp-unifiers`

    jp-371  The unification of Japan
    jp-372  Oda Nobunaga
    jp-373  Nobunaga's rise in Owari
    jp-374  Nobunaga and the last Ashikaga shogun
    jp-375  The burning of Enryaku-ji
    jp-376  The Ishiyama Hongan-ji War
    jp-377  Battle of Nagashino
    jp-378  Nobunaga's use of firearms
    jp-379  Azuchi Castle
    jp-380  Nobunaga's economic policy
    jp-381  Rakuichi-rakuza
    jp-382  Honnō-ji incident
    jp-383  Akechi Mitsuhide
    jp-384  Toyotomi Hideyoshi
    jp-385  Hideyoshi's rise from obscurity
    jp-386  Battle of Yamazaki
    jp-387  The Kiyosu conference and the Oda succession
    jp-388  Hideyoshi's unification campaigns
    jp-389  Siege of Odawara
    jp-390  Taikō kenchi
    jp-391  Sword hunt
    jp-392  The separation of warrior and peasant
    jp-393  Hideyoshi's status legislation
    jp-394  Osaka Castle
    jp-395  Azuchi–Momoyama culture
    jp-396  Sen no Rikyū
    jp-397  The death of Rikyū
    jp-398  Japanese invasions of Korea
    jp-399  The campaign of 1592
    jp-400  Yi Sun-sin and the naval war
    jp-401  The campaign of 1597 and the withdrawal
    jp-402  What the Korean invasions cost
    jp-403  The Korean potters taken to Japan
    jp-404  Tokugawa Ieyasu
    jp-405  The council of regents and the succession crisis
    jp-406  Battle of Sekigahara
    jp-407  The making of the Tokugawa settlement
    jp-408  Siege of Osaka
    jp-409  The end of the Toyotomi
    jp-410  What unification changed

## Tokugawa Japan

### The Tokugawa order — `jp-bakufu`

    jp-411  Tokugawa shogunate
    jp-412  Edo period
    jp-413  Han system
    jp-414  The shogun and the emperor
    jp-415  Kinchū narabini kuge shohatto
    jp-416  Buke shohatto
    jp-417  Daimyō
    jp-418  The domain and its finances
    jp-419  Sankin-kōtai
    jp-420  What alternate attendance cost
    jp-421  Fudai and tozama
    jp-422  The Tokugawa house lands
    jp-423  Edo
    jp-424  The growth of Edo
    jp-425  The shogunal bureaucracy
    jp-426  Rōjū
    jp-427  Tokugawa law and justice
    jp-428  The Tokugawa status order
    jp-429  Samurai as administrators
    jp-430  The stipend system and samurai poverty
    jp-431  Rōnin
    jp-432  The masterless samurai problem
    jp-433  Sakoku
    jp-434  What "closed country" actually meant
    jp-435  The four gateways
    jp-436  Dejima
    jp-437  The Dutch at Nagasaki
    jp-438  Tsushima and relations with Korea
    jp-439  The Korean embassies to Edo
    jp-440  Satsuma and Ryūkyū
    jp-441  Matsumae and the Ainu trade
    jp-442  The Chinese trade at Nagasaki
    jp-443  The outlawing of Christianity
    jp-444  Danka system
    jp-445  The Tokugawa peace

### Edo society and the economy — `jp-edo-society`

    jp-446  Edo society
    jp-447  The four divisions and their reality
    jp-448  The Japanese village in the Edo period
    jp-449  Village self-government under the Tokugawa
    jp-450  The Edo tax system
    jp-451  Rice as money
    jp-452  Agricultural improvement in the Edo period
    jp-453  New field development
    jp-454  Population in Tokugawa Japan
    jp-455  The Tokugawa demographic pattern
    jp-456  Famine in Tokugawa Japan
    jp-457  Tenmei famine
    jp-458  Tenpō famine
    jp-459  Peasant protest in Tokugawa Japan
    jp-460  Hyakushō ikki
    jp-461  Urban riots and the smashings
    jp-462  The Edo merchant class
    jp-463  Osaka and the rice market
    jp-464  Dōjima Rice Exchange
    jp-465  The great merchant houses
    jp-466  Money and credit in Tokugawa Japan
    jp-467  The Edo road system
    jp-468  Tōkaidō
    jp-469  Travel in the Edo period
    jp-470  Ise pilgrimage
    jp-471  Edo urban life
    jp-472  Fire and the wooden city
    jp-473  Great fire of Meireki
    jp-474  Women in Tokugawa Japan
    jp-475  The Tokugawa household and inheritance
    jp-476  Yoshiwara
    jp-477  The licensed quarters and the women in them
    jp-478  Burakumin
    jp-479  Outcaste status in Tokugawa Japan
    jp-480  Literacy and schooling in Tokugawa Japan

### Edo culture — `jp-edo-culture`

    jp-481  Edo culture
    jp-482  Ukiyo
    jp-483  Ukiyo-e
    jp-484  Japanese woodblock printing
    jp-485  Hishikawa Moronobu
    jp-486  Suzuki Harunobu and the full-colour print
    jp-487  Kitagawa Utamaro
    jp-488  Tōshūsai Sharaku
    jp-489  Katsushika Hokusai
    jp-490  The Great Wave off Kanagawa
    jp-491  Utagawa Hiroshige
    jp-492  The Fifty-three Stations of the Tōkaidō
    jp-493  Kabuki
    jp-494  The origins of kabuki and the ban on women
    jp-495  Onnagata
    jp-496  Bunraku
    jp-497  Chikamatsu Monzaemon
    jp-498  The love-suicide plays
    jp-499  Edo publishing and the book trade
    jp-500  Ihara Saikaku
    jp-501  Haiku
    jp-502  Matsuo Bashō
    jp-503  Oku no Hosomichi
    jp-504  Yosa Buson and Kobayashi Issa
    jp-505  Neo-Confucianism in Japan
    jp-506  Hayashi Razan and Tokugawa orthodoxy
    jp-507  Ogyū Sorai
    jp-508  Kokugaku
    jp-509  Motoori Norinaga
    jp-510  Rangaku
    jp-511  Sugita Genpaku and the Kaitai Shinsho
    jp-512  Science in Tokugawa Japan
    jp-513  Hiraga Gennai
    jp-514  Bushidō
    jp-515  Hagakure and the making of the samurai code

### The end of the shogunate — `jp-late-tokugawa`

    jp-516  The crisis of the late Tokugawa order
    jp-517  Kansei Reforms
    jp-518  Tenpō Reforms
    jp-519  Mizuno Tadakuni
    jp-520  Foreign ships in Japanese waters
    jp-521  The Morrison incident and the expulsion edicts
    jp-522  The Opium War and its effect on Japan
    jp-523  Perry Expedition
    jp-524  Convention of Kanagawa
    jp-525  Townsend Harris and the commercial treaty
    jp-526  Unequal treaty
    jp-527  Ansei Purge
    jp-528  Ii Naosuke
    jp-529  Sonnō jōi
    jp-530  Yoshida Shōin
    jp-531  Sakuradamon incident
    jp-532  The Chōshū and Satsuma domains
    jp-533  The bombardments of Kagoshima and Shimonoseki
    jp-534  Satchō Alliance
    jp-535  Sakamoto Ryōma
    jp-536  The economic disruption of the treaty ports
    jp-537  Ee ja nai ka
    jp-538  Tokugawa Yoshinobu
    jp-539  The resignation of the shogun
    jp-540  Boshin War

## Meiji Japan

### The Meiji Restoration — `jp-restoration`

    jp-541  Meiji Restoration
    jp-542  Charter Oath
    jp-543  The restoration of imperial rule
    jp-544  Emperor Meiji
    jp-545  The Meiji oligarchy
    jp-546  Ōkubo Toshimichi
    jp-547  Kido Takayoshi
    jp-548  Saigō Takamori
    jp-549  Iwakura Tomomi
    jp-550  The abolition of the han
    jp-551  The creation of the prefectures
    jp-552  The abolition of samurai status
    jp-553  The commutation of samurai stipends
    jp-554  Haitōrei
    jp-555  The samurai revolts of the 1870s
    jp-556  Satsuma Rebellion
    jp-557  The death of Saigō and his afterlife
    jp-558  Conscription in Meiji Japan
    jp-559  The Meiji land tax reform
    jp-560  Meiji currency and banking reform
    jp-561  Iwakura Mission
    jp-562  What the Iwakura Mission concluded
    jp-563  Foreign advisers in Meiji Japan
    jp-564  O-yatoi gaikokujin
    jp-565  Seikanron
    jp-566  The move of the capital to Tokyo
    jp-567  The calendar reform of 1873
    jp-568  The Meiji state and the emperor's new role
    jp-569  Freedom and People's Rights Movement
    jp-570  The road to a constitution

### Building the modern state — `jp-meiji-state`

    jp-571  Meiji Constitution
    jp-572  Itō Hirobumi
    jp-573  The Prussian model and the drafting
    jp-574  Imperial Diet
    jp-575  Political parties in Meiji Japan
    jp-576  Genrō
    jp-577  The Meiji legal codes
    jp-578  The Meiji civil code and the household
    jp-579  Ie
    jp-580  The Meiji police and local government
    jp-581  Imperial Rescript on Education
    jp-582  Meiji education reform
    jp-583  The Japanese school system
    jp-584  State Shinto
    jp-585  Shinbutsu bunri
    jp-586  Haibutsu kishaku
    jp-587  Shrines and the Meiji state
    jp-588  The invention of Japanese tradition
    jp-589  Imperial Rescript to Soldiers and Sailors
    jp-590  Imperial Japanese Army
    jp-591  Imperial Japanese Navy
    jp-592  The foreign models for the Japanese forces
    jp-593  Yamagata Aritomo
    jp-594  The independence of the supreme command
    jp-595  Meiji fiscal policy
    jp-596  Matsukata deflation
    jp-597  Zaibatsu
    jp-598  Mitsui and Mitsubishi in Meiji Japan
    jp-599  The Meiji bureaucracy
    jp-600  What the Meiji state was for

### Society, industry and culture — `jp-meiji-society`

    jp-601  Bunmei kaika
    jp-602  Westernisation and its critics
    jp-603  Dress and the two wardrobes
    jp-604  Rokumeikan
    jp-605  Industrialisation in Meiji Japan
    jp-606  Tomioka Silk Mill
    jp-607  Silk and the Japanese export economy
    jp-608  The mill girls and factory labour
    jp-609  Labour in Meiji Japan
    jp-610  Ashio Copper Mine pollution incident
    jp-611  Tanaka Shōzō
    jp-612  Meiji cities
    jp-613  Railways in Meiji Japan
    jp-614  The Meiji press
    jp-615  Fukuzawa Yukichi
    jp-616  Datsu-A Ron and the argument about Asia
    jp-617  Meiji literature
    jp-618  Natsume Sōseki
    jp-619  Mori Ōgai
    jp-620  Higuchi Ichiyō
    jp-621  Yōga and nihonga
    jp-622  Okakura Kakuzō and Ernest Fenollosa
    jp-623  Japonisme
    jp-624  New religions in Meiji Japan
    jp-625  Women in Meiji Japan

### The road to empire — `jp-meiji-empire`

    jp-626  The Empire of Japan
    jp-627  The Meiji settlement of Japan's borders
    jp-628  Treaty of Saint Petersburg and the northern frontier
    jp-629  The Ogasawara Islands
    jp-630  Japan and Korea in the 1870s
    jp-631  Ganghwa Island incident
    jp-632  The Imo Incident and the Gapsin Coup
    jp-633  First Sino-Japanese War
    jp-634  Battle of the Yalu River
    jp-635  Treaty of Shimonoseki
    jp-636  Triple Intervention
    jp-637  The Japanese acquisition of Taiwan
    jp-638  The Taiwanese resistance of 1895
    jp-639  Japan and the Boxer Rebellion
    jp-640  Anglo-Japanese Alliance
    jp-641  Russo-Japanese War
    jp-642  Siege of Port Arthur
    jp-643  Battle of Mukden
    jp-644  Battle of Tsushima
    jp-645  Treaty of Portsmouth
    jp-646  Hibiya incendiary incident
    jp-647  What the Russo-Japanese War meant in Asia
    jp-648  The Japanese protectorate over Korea
    jp-649  Japan–Korea Treaty of 1910
    jp-650  The end of the unequal treaties

## Empire and War

### Taishō Japan — `jp-taisho`

    jp-651  Taishō
    jp-652  Emperor Taishō
    jp-653  Taishō Democracy
    jp-654  The Taishō political crisis of 1913
    jp-655  Party cabinets in Taishō Japan
    jp-656  Hara Takashi
    jp-657  Yoshino Sakuzō and minponshugi
    jp-658  Japan in World War I
    jp-659  Twenty-One Demands
    jp-660  Japan at the Paris Peace Conference
    jp-661  Racial Equality Proposal
    jp-662  Japan and the League of Nations
    jp-663  Siberian intervention
    jp-664  The wartime boom and the postwar slump
    jp-665  Rice riots of 1918
    jp-666  The Japanese labour movement
    jp-667  Socialism and the left in Taishō Japan
    jp-668  Japanese Communist Party
    jp-669  The General Election Law of 1925
    jp-670  Peace Preservation Law
    jp-671  Taishō culture
    jp-672  Modern girls and modern Tokyo
    jp-673  Taishō literature
    jp-674  Great Kantō earthquake
    jp-675  The massacre of Koreans after the earthquake

### The turn to militarism — `jp-militarism`

    jp-676  Shōwa period
    jp-677  Hirohito
    jp-678  The Shōwa financial crisis and the Depression in Japan
    jp-679  Takahashi Korekiyo
    jp-680  Rural distress in 1930s Japan
    jp-681  Kokutai
    jp-682  Japanese ultranationalism
    jp-683  Kita Ikki
    jp-684  The London Naval Treaty and the supreme command controversy
    jp-685  Mukden Incident
    jp-686  Kwantung Army
    jp-687  Manchukuo
    jp-688  The Lytton Report and Japan's withdrawal from the League
    jp-689  May 15 Incident
    jp-690  The end of party government
    jp-691  February 26 Incident
    jp-692  The army factions
    jp-693  The Imperial Way and Control factions
    jp-694  Government by assassination
    jp-695  The thought police
    jp-696  The suppression of the left
    jp-697  Tenkō
    jp-698  State control of the press
    jp-699  The Anti-Comintern Pact and the Axis
    jp-700  Marco Polo Bridge Incident
    jp-701  The outbreak of the Second Sino-Japanese War
    jp-702  National Mobilization Law
    jp-703  Imperial Rule Assistance Association
    jp-704  The debate about Japanese fascism
    jp-705  Why the military took control

### The Japanese empire — `jp-colonial`

    jp-706  The Japanese colonial empire
    jp-707  Taiwan under Japanese rule
    jp-708  Gotō Shinpei and colonial development
    jp-709  Musha Incident
    jp-710  Taiwan under wartime mobilisation
    jp-711  Korea under Japanese rule
    jp-712  Government-General of Korea
    jp-713  March First Movement
    jp-714  The cultural rule policy
    jp-715  The land survey and Korean landholding
    jp-716  Industrialisation in colonial Korea
    jp-717  Colonial education in Korea
    jp-718  Sōshi-kaimei
    jp-719  Korean forced labour
    jp-720  Koreans in wartime Japan
    jp-721  The Korean independence movement
    jp-722  Karafuto Prefecture
    jp-723  South Seas Mandate
    jp-724  Japanese emigration and settler communities
    jp-725  Japanese settlement in Manchuria
    jp-726  The Manchukuo economy
    jp-727  The argument about colonial development
    jp-728  The stalemate in China
    jp-729  Battle of Shanghai
    jp-730  Nanjing Massacre
    jp-731  The evidence and the range of estimates for Nanjing
    jp-732  Three Alls Policy
    jp-733  Unit 731
    jp-734  Chemical and biological warfare in China
    jp-735  Comfort women
    jp-736  The comfort women system and the argument about it
    jp-737  Japanese war crimes
    jp-738  Prisoners of war under Japanese control
    jp-739  Greater East Asia Co-Prosperity Sphere
    jp-740  What the empire was and what it claimed to be

### The war and its end — `jp-war`

    jp-741  The road to war with the West
    jp-742  The southern advance and French Indochina
    jp-743  The oil embargo and Japan's dilemma
    jp-744  The decision for war
    jp-745  Hideki Tojo
    jp-746  Attack on Pearl Harbor
    jp-747  The Japanese offensive of 1941–1942
    jp-748  Fall of Singapore
    jp-749  The Japanese occupation of Southeast Asia
    jp-750  Battle of Midway
    jp-751  The turn of the Pacific war
    jp-752  Guadalcanal campaign
    jp-753  The Japanese war economy
    jp-754  Wartime mobilisation of Japanese society
    jp-755  Women and the wartime home front
    jp-756  Rationing and daily life in wartime Japan
    jp-757  Japanese wartime propaganda
    jp-758  Student mobilisation and the last drafts
    jp-759  Battle of Leyte Gulf
    jp-760  Kamikaze attacks
    jp-761  Battle of Iwo Jima
    jp-762  Battle of Okinawa
    jp-763  Civilian deaths on Okinawa
    jp-764  The firebombing of Japanese cities
    jp-765  Bombing of Tokyo
    jp-766  The Japanese leadership and the question of surrender
    jp-767  Atomic bombings of Hiroshima and Nagasaki
    jp-768  The Soviet invasion of Manchuria
    jp-769  Jewel Voice Broadcast
    jp-770  Japan's war dead and the cost of the war

## Postwar Japan

### The Occupation — `jp-occupation`

    jp-771  Occupation of Japan
    jp-772  Douglas MacArthur and SCAP
    jp-773  The surrender and the arrival of the Occupation
    jp-774  The decision to keep the emperor
    jp-775  Humanity Declaration
    jp-776  International Military Tribunal for the Far East
    jp-777  The Tokyo trial and its critics
    jp-778  The purge of wartime leaders
    jp-779  Demilitarisation
    jp-780  Constitution of Japan
    jp-781  Article 9 of the Japanese Constitution
    jp-782  How the postwar constitution was written
    jp-783  Japanese land reform
    jp-784  The dissolution of the zaibatsu
    jp-785  Labour and the Occupation
    jp-786  Women's suffrage and the postwar reforms
    jp-787  Education reform under the Occupation
    jp-788  Censorship under the Occupation
    jp-789  Reverse Course
    jp-790  The Red Purge
    jp-791  The Dodge Line
    jp-792  The Korean War and the Japanese economy
    jp-793  The National Police Reserve and the Self-Defense Forces
    jp-794  Treaty of San Francisco
    jp-795  Treaty of Mutual Cooperation and Security
    jp-796  Repatriation and the returnees
    jp-797  Postwar hunger and the black market
    jp-798  Hiroshima and Nagasaki after 1945
    jp-799  Hibakusha
    jp-800  What the Occupation changed and what it left

### The economic miracle — `jp-miracle`

    jp-801  Japanese economic miracle
    jp-802  1955 System
    jp-803  Liberal Democratic Party (Japan)
    jp-804  The Japan Socialist Party and the opposition
    jp-805  Anpo protests
    jp-806  Nobusuke Kishi
    jp-807  Ikeda Hayato and the Income Doubling Plan
    jp-808  Ministry of International Trade and Industry
    jp-809  The developmental state debate
    jp-810  Japanese management and lifetime employment
    jp-811  Keiretsu
    jp-812  Quality management in Japanese industry
    jp-813  Toyota Production System
    jp-814  The Japanese car industry
    jp-815  Japanese consumer electronics
    jp-816  Shinkansen
    jp-817  1964 Summer Olympics
    jp-818  Expo '70
    jp-819  Urbanisation and the salaryman
    jp-820  The postwar Japanese family
    jp-821  Women in postwar Japan
    jp-822  Postwar education and examination pressure
    jp-823  Pollution-related diseases in Japan
    jp-824  Minamata disease
    jp-825  The environmental movement in Japan
    jp-826  The Japanese student movement of the 1960s
    jp-827  The Japanese New Left
    jp-828  Treaty on Basic Relations between Japan and South Korea
    jp-829  The 1973 oil crisis and the end of high growth
    jp-830  What the miracle actually was

### Japan since 1973 — `jp-contemporary`

    jp-831  Japan after 1973
    jp-832  The stable-growth economy
    jp-833  Japan–United States trade friction
    jp-834  Plaza Accord
    jp-835  Japanese asset price bubble
    jp-836  The bursting of the bubble
    jp-837  Lost Decades
    jp-838  The Japanese banking crisis of the 1990s
    jp-839  Deflation and Japanese monetary policy
    jp-840  The end of LDP dominance in 1993
    jp-841  The electoral reform of 1994
    jp-842  Junichiro Koizumi
    jp-843  The Democratic Party of Japan government
    jp-844  Shinzo Abe
    jp-845  Abenomics
    jp-846  The argument over Article 9 and collective self-defence
    jp-847  The Self-Defense Forces since 1991
    jp-848  Great Hanshin earthquake
    jp-849  Tokyo subway sarin attack
    jp-850  Aum Shinrikyo
    jp-851  2011 Tōhoku earthquake and tsunami
    jp-852  Fukushima nuclear accident
    jp-853  Nuclear power in Japan after Fukushima
    jp-854  Ageing and population decline in Japan
    jp-855  Immigration and foreign workers in Japan
    jp-856  Zainichi Koreans
    jp-857  Gender and work in contemporary Japan
    jp-858  The export of Japanese popular culture
    jp-859  Japan's place in East Asia today
    jp-860  Japan in the twenty-first century

### The war in Japanese memory — `jp-memory`

    jp-861  The war in Japanese memory
    jp-862  Japanese history textbook controversies
    jp-863  Yasukuni Shrine
    jp-864  The Yasukuni visits and their diplomacy
    jp-865  Japanese apologies for war crimes
    jp-866  Murayama Statement
    jp-867  Kono Statement
    jp-868  The comfort women agreement of 2015
    jp-869  Japanese war reparations and the postwar treaties
    jp-870  The South Korean forced-labour rulings
    jp-871  Japanese historical revisionism
    jp-872  Nanjing Massacre denial
    jp-873  Hiroshima and the victim narrative
    jp-874  Japanese peace museums
    jp-875  Antiwar movements in postwar Japan
    jp-876  The debate over the emperor's war responsibility
    jp-877  Japanese and German war memory compared
    jp-878  Territorial disputes and their wartime roots
    jp-879  History and diplomacy in East Asia
    jp-880  What Japanese war memory is argued about

## Peoples, Belief and the Arts

### The Ainu and Hokkaido — `jp-ainu`

    jp-881  Ainu people
    jp-882  Ainu language
    jp-883  Ainu origins
    jp-884  Satsumon culture
    jp-885  Okhotsk culture
    jp-886  The Ainu of Hokkaido, Sakhalin and the Kurils
    jp-887  Ainu subsistence
    jp-888  Iomante
    jp-889  Ainu religion
    jp-890  Yukar
    jp-891  Ainu material culture
    jp-892  Ainu trade with Japan and the continent
    jp-893  The Matsumae domain and the Ainu
    jp-894  The basho contract system
    jp-895  Koshamain's War
    jp-896  Shakushain's revolt
    jp-897  The Menashi-Kunashir rebellion
    jp-898  The colonisation of Hokkaido
    jp-899  Hokkaido Development Commission
    jp-900  Tondenhei
    jp-901  Hokkaido Former Aborigines Protection Act
    jp-902  Ainu assimilation policy
    jp-903  The loss of Ainu land and livelihood
    jp-904  The Ainu in the twentieth century
    jp-905  The Ainu revival movement
    jp-906  Kayano Shigeru
    jp-907  The Nibutani Dam case
    jp-908  The Ainu Cultural Promotion Act
    jp-909  The 2019 recognition of the Ainu as an indigenous people
    jp-910  Ainu remains and their repatriation

### Ryūkyū and Okinawa — `jp-ryukyu`

    jp-911  Ryukyu Islands
    jp-912  Ryukyuan languages
    jp-913  Ryukyuan prehistory
    jp-914  Gusuku period
    jp-915  Gusuku
    jp-916  Ryukyu Kingdom
    jp-917  Shō Hashi and the unification of Okinawa
    jp-918  Shuri Castle
    jp-919  Ryukyuan maritime trade
    jp-920  Ryūkyū and Ming China
    jp-921  The Ryukyuan tributary relationship
    jp-922  Ryukyuan missions to China and Edo
    jp-923  Invasion of Ryukyu
    jp-924  Ryūkyū's dual subordination
    jp-925  Ryukyuan society and religion
    jp-926  Noro
    jp-927  Bingata and Ryukyuan crafts
    jp-928  Sanshin and Ryukyuan music
    jp-929  Ryukyu Disposition
    jp-930  Okinawa Prefecture and assimilation
    jp-931  The Okinawan language and the dialect placards
    jp-932  Okinawan emigration
    jp-933  Okinawa as a sacrifice for the mainland
    jp-934  The compulsory group suicides
    jp-935  The American occupation of Okinawa
    jp-936  Land seizures and the Okinawan protest movement
    jp-937  What reversion did not settle
    jp-938  United States Forces Japan in Okinawa
    jp-939  The Futenma relocation dispute
    jp-940  Okinawan identity today

### Shinto, Buddhism and belief — `jp-religion`

    jp-941  Shinto
    jp-942  Kami
    jp-943  Shinto shrine
    jp-944  Shinto ritual and purification
    jp-945  Japanese festivals
    jp-946  Japanese creation myth
    jp-947  Amaterasu
    jp-948  The Izumo tradition
    jp-949  Buddhism in Japan
    jp-950  The Buddhist temple in Japanese life
    jp-951  Japanese Buddhist funerals and the ancestors
    jp-952  Bon Festival
    jp-953  Shugendō
    jp-954  Yamabushi
    jp-955  Japanese folk religion
    jp-956  Yōkai
    jp-957  Onryō
    jp-958  Divination and fortune in Japan
    jp-959  Confucianism in Japanese life
    jp-960  Daoist and yin-yang elements in Japanese religion
    jp-961  The Japanese religious year
    jp-962  Japanese new religions
    jp-963  Tenrikyo
    jp-964  Soka Gakkai
    jp-965  Religion and politics in postwar Japan
    jp-966  Christianity in Japan after 1873
    jp-967  Religion and the Japanese state since 1945
    jp-968  Japanese attitudes to religious belonging
    jp-969  Pilgrimage in modern Japan
    jp-970  Shikoku Pilgrimage

### Language, letters and the arts — `jp-arts`

    jp-971  Japanese language
    jp-972  Japanese writing system
    jp-973  Kanji
    jp-974  Hiragana and katakana
    jp-975  Japanese dialects
    jp-976  Japanese literature
    jp-977  The modern Japanese novel
    jp-978  Yasunari Kawabata
    jp-979  Yukio Mishima
    jp-980  Kenzaburō Ōe
    jp-981  Haruki Murakami
    jp-982  Japanese poetry in the modern age
    jp-983  Modern Japanese theatre
    jp-984  Cinema of Japan
    jp-985  Akira Kurosawa
    jp-986  Yasujirō Ozu
    jp-987  Anime
    jp-988  Hayao Miyazaki
    jp-989  Manga
    jp-990  Japanese architecture
    jp-991  The traditional Japanese house
    jp-992  Japanese garden
    jp-993  Japanese pottery and porcelain
    jp-994  Japanese lacquerware and metalwork
    jp-995  Japanese textiles and dyeing
    jp-996  Japanese sword
    jp-997  Japanese cuisine
    jp-998  Japanese martial arts
    jp-999  Sumo
    jp-1000 What "Japan" has been made to mean
