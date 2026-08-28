# China — the 1000-card plan

The running order for the `china` collection. Every card has a number, a topic and a deck, fixed in
advance, so the collection can be grown one card at a time across many sessions without anyone having
to remember where it had got to.

Not part of the site.

**This is the only plan written onto a tree that already existed.** Greece, World History, Rome, Russia
and India all got their trees from their plans; China's dynastic tree was built first and has been
sitting empty since the deck was trimmed in July 2026. It is kept, and the four changes made to it are
set out below.

## ⚠ Before `cnh-001` ships: the collection is SET ASIDE

`china` carries **`placeholder: true`** in `data.js` — it was set aside on request in July 2026 — and
that flag is not decoration. `availableCardIdSet()` in app.js excludes every card in a placeholder
collection, so cards written into this tree today would **not** reach the daily review, the games, the
card of the day or a study deep link. They would be written and never studied.

**Taking the flag off is the site owner's decision, not this plan's**, so it has been left exactly as
it was. Whoever writes `cnh-001` should clear it in the same commit, or knowingly accept that the
collection stays dark until they do.

One related oddity, pre-existing and harmless today: `defaultState()` in app.js ships
`active: ["cn-qing"]`, and there is no `cn-qing` node anywhere in the tree — the Qing deck is `col-33`.
Nothing breaks, because an entry with no cards is skipped by `countedActiveEntries`, but if this
collection is ever un-set-aside that default should be pointed at a node that exists.

## How to use this (the whole point of the file)

**"Generate the next China card" means: take the lowest `cnh-NNN` that is not yet in `data.js`, read
its topic and deck from the list below, research it, and add it.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));
      for(let i=1;i<=1000;i++){const id='cnh-'+String(i).padStart(3,'0');
      if(!h.has(id)){console.log('next:',id);break}}"

There is deliberately **no separate progress file**. `data.js` is the record of what exists, this file
is the record of what is planned, and the next card is whatever falls between them — so the two can
never disagree about where the work has got to.

Then write the card to the rules in CLAUDE.md ("Generating cards & glossary entries") and add it with:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** `add-card.js` falls back to the first leaf in the whole tree when it is
omitted — which, for this collection alone, happens to be right (`cn-myth`). Pass it anyway.

**The prefix is `cnh-`, not `cn-`**, because `cn-myth` is a deck id and `cn-001` beside it invites
exactly the confusion the ids exist to prevent. `cnh-` is also the collection's own historical
convention: the trimmed 600-card deck used it, and its template card `cnh-001` survives in
`.claude/backup/data.js`. Numbering runs past 999, so ids are not all the same length: `cnh-001` …
`cnh-999`, then `cnh-1000`. The command above pads to three digits, which is right for every id but
the last.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `cnh-276 Battle of Red Cliffs` is already an answer term; `cnh-076 Shang kingship` is an area,
and the card's actual answer — the word that gets blanked — is chosen while writing it, from what the
sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** Some will turn out
to be thinner than they look, and a few will turn out to be two cards. When that happens, change the
line here in the same commit as the card, and say so — this file is only useful while it is true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

Card ids run `cnh-001` … `cnh-1000`, in the order below, following the tree — which means the first
thirty decks run roughly chronologically and the last nine are thematic, in a reading order rather
than a claim about dates. Cards sort on the study page by `cardYears(answerDate)`, not by id.

## The four changes made to the tree

Small, and all four are easy to revert if they are not wanted.

**1. The duplicate Xin is gone.** `Xin` appeared twice: `col-9`, directly under Imperial, and `col-11`,
inside Han. It is one fourteen-year interregnum, and `col-11` is where it belongs, since Wang Mang is
precisely what separates the Western from the Eastern Han. `col-9` is dropped.

**2. `col-30 Jin` is retitled `Jurchen Jin`.** The tree carried **two decks called Jin** — `col-17`,
the Sima house of 266–420 (晉), and `col-30`, the Jurchen dynasty of 1115–1234 (金). Both are correct
English names for genuinely different dynasties nine centuries apart, and in a Library list they were
indistinguishable. `col-17` keeps the bare name; `col-30` takes the qualifier, which is standard usage.

**3. `col-2 Xia` is retitled `Neolithic China and the Xia`.** It is the tree's earliest deck and
therefore the only home for Yangshao, Longshan, Liangzhu, Hongshan and Sanxingdui — none of which is
Xia, and one of which (Sanxingdui) is emphatically not. Filing twelve Neolithic cards under the name
of a dynasty whose existence is itself contested would have been the plan's first factual error. If a
separate Neolithic deck is ever wanted, this is where it splits.

**4. Three thematic decks are added** — `cn-state`, `cn-belief` and `cn-culture`, nine leaf decks
between them, 300 cards. See the decisions below; this is the substantial change and the reason the
plan needed to touch the tree at all.

Everything else is untouched: the Ancient / Imperial / Modern spine, all thirty surviving dynastic
leaves, the `col-N` ids, and the order they sit in.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Mythology | *(flat)* | 40 | cnh-001–040 |
| Ancient | Neolithic China and the Xia | 25 | cnh-041–065 |
| | Shang | 45 | cnh-066–110 |
| | Western Zhou | 30 | cnh-111–140 |
| | Eastern Zhou | 50 | cnh-141–190 |
| Imperial | Qin | 22 | cnh-191–212 |
| | Western Han | 32 | cnh-213–244 |
| | Xin | 8 | cnh-245–252 |
| | Eastern Han | 20 | cnh-253–272 |
| | Three Kingdoms | 20 | cnh-273–292 |
| | Western Jin | 10 | cnh-293–302 |
| | Sixteen Kingdoms | 10 | cnh-303–312 |
| | Eastern Jin | 10 | cnh-313–322 |
| | Northern and Southern dynasties | 20 | cnh-323–342 |
| | Sui | 12 | cnh-343–354 |
| | Tang | 42 | cnh-355–396 |
| | Five Dynasties and Ten Kingdoms | 14 | cnh-397–410 |
| | Liao | 10 | cnh-411–420 |
| | Northern Song | 26 | cnh-421–446 |
| | Southern Song | 18 | cnh-447–464 |
| | Western Xia | 8 | cnh-465–472 |
| | Jurchen Jin | 10 | cnh-473–482 |
| | Yuan | 20 | cnh-483–502 |
| | Ming | 32 | cnh-503–534 |
| | Qing | 38 | cnh-535–572 |
| Modern | Early Republic | 33 | cnh-573–605 |
| | Civil War | 25 | cnh-606–630 |
| | World War II | 25 | cnh-631–655 |
| | People's Republic of China | 35 | cnh-656–690 |
| | Republic of China (Taiwan) | 10 | cnh-691–700 |
| State, Society and Economy | The imperial state | 40 | cnh-701–740 |
| | Society and everyday life | 32 | cnh-741–772 |
| | The peoples and frontiers of China | 28 | cnh-773–800 |
| | Land, trade and money | 25 | cnh-801–825 |
| Thought and Religion | Chinese philosophy | 42 | cnh-826–867 |
| | Religion and ritual | 35 | cnh-868–902 |
| Learning, Arts and Invention | Language and literature | 40 | cnh-903–942 |
| | Art, architecture and music | 30 | cnh-943–972 |
| | Science, technology and medicine | 28 | cnh-973–1000 |

Deck totals: Mythology 40 · Ancient 150 · Imperial 382 · Modern 128 · State, Society and Economy 125 ·
Thought and Religion 77 · Learning, Arts and Invention 98. **1000.**

## What the weighting is arguing

**China needed thematic decks more than any other collection, not less, and it had none.** The dynastic
frame is so strong here that everything running across it has nowhere to go. The examination system ran
from 605 to 1905; Confucianism ran for two and a half thousand years; the characters, silk, the Grand
Canal, the family, the frontier and the standard histories all outlive every dynasty in the tree. On
the old tree each of those would have been scattered across twenty decks at a card apiece and taught
nowhere. Three hundred cards now sit outside the dynasties — the same share Rome and India give their
thematic decks, and for a stronger reason.

**The dynastic decks are deliberately unequal, from 8 cards to 45, and that is the point.** Greece and
Rome hold their subdecks between 25 and 70 because those subdecks are themes bounded by a period.
China's are dynasties, and dynasties differ by an order of magnitude: the Xin lasted fourteen years and
the Tang two hundred and eighty-nine. A tree that gave each an equal share would be making a claim
about Chinese history that is simply false. **An eight-card deck here is proportionate, not thin.**

**Ancient China keeps 150 and the Shang alone gets 45.** The Shang is where China becomes a documented
society rather than an inferred one, and the oracle bones are the earliest substantial body of Chinese
writing there is — the single most important source in the collection's first half.

**The twentieth century gets 128 across five decks.** It is the best-documented and most argued-over
stretch, and it is the part most likely to swell past its share.

**Tang 42, Song 44 between the two halves, Ming 32, Qing 38.** These four carry a fifth of the whole
collection between them, which is roughly where the surviving record and the teaching weight sit.

## Five decisions this plan forced on the tree

**The dynastic cycle is a card, not the tree's silent assumption.** `cnh-703 The dynastic cycle` exists
because the idea that dynasties rise, decay and fall in a moral pattern is itself a **Chinese
historiographical theory** — bound up with the Mandate of Heaven, and useful to every dynasty that
wanted to explain why its predecessor deserved to lose. It is not a neutral description of what
happened, and a collection organised by dynasty will teach it as one unless it is named.

**The standard histories are a source, and their authorship is the first thing to know about them.**
`cnh-736 Chinese historiography`, `cnh-737 Twenty-Four Histories` and `cnh-738 The standard history as
a genre` are in `cn-government` rather than scattered, because each of those histories was compiled by
the dynasty that *replaced* the one it describes. That is the single most important source-critical
fact in Chinese history, it colours everything from Di Xin to the last Ming emperor, and a card that
repeats a standard history's verdict on the ruler it was written to discredit has been taken in.

**"China" is not only the Han, and `cn-peoples` gets 28 cards to say so.** The Liao, Western Xia,
Jurchen Jin, Yuan and Qing are conquest dynasties, and the usual course treats them as interruptions of
Chinese history rather than as part of it. The frontier, the steppe relationship, Tibet, Xinjiang,
Manchuria and the peoples of the southwest are the subject and not the margin — the same argument the
Russia plan makes with `ru-peoples` and the India plan with the south.

**Thinkers live in `cn-thought`; their politics live in the dynastic decks.** Confucius, Mencius,
Laozi, Mozi and Han Feizi are all in the philosophy subdeck with their ideas, cross-listed to Eastern
Zhou, exactly as the Rome plan puts Virgil in `rm-literature` and cross-lists him to Augustus. The
Warring States deck carries Shang Yang's *reforms* because those are an event; `cn-thought` carries
Legalism because that is an argument.

**The Modern deck's subdecks overlap in time, and the cards say so.** `col-36 Civil War` covers
1927–1949 and `col-37 World War II` covers 1937–1945, so eight years belong to both. That is not a
fault in the tree — it is what happened, the civil war having been suspended rather than ended by the
Japanese invasion — but a reader meeting the two decks needs telling, and `cnh-606` and `cnh-631` are
where to tell them.

## History, not archaeology — and the three other pulls

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Do not restate either here.

The archaeology pull is concentrated in `col-2` and `col-3`, where everything before the oracle bones
is material evidence, and it comes with this collection's hardest question:

**`cnh-061 The question of the Xia's historicity` is China's Aryan-migration debate** — the counterpart
of `in-033` and `ru-031`. Whether the Xia existed as the texts describe, and whether Erlitou is it, is
argued between Chinese and Western scholarship along lines that are not purely evidential; the
Xia–Shang–Zhou Chronology Project (`cnh-065`) is itself part of the story. The cards are about the
evidence and about the argument. They do not settle it, and a card that quietly picks a side while
sounding neutral is worse than one that picks openly.

Three other pulls:

**The state's account.** China has an unbroken tradition of official history-writing and a present-day
state with firm views about the past. Neither that account nor the mirror-image Western one is the
register here. Write from the scholarship; name a disputed thing as disputed; give ranges where the
scholarship gives ranges. This bites hardest on `cnh-666 Great Chinese Famine`, `cnh-670 Cultural
Revolution`, `cnh-684 Tiananmen Square protests of 1989` and everything in `cn-peoples` that touches
Tibet and Xinjiang — and equally on `cnh-637 Nanjing Massacre`, where the denialist literature is the
mirror of the same fault.

**Great men.** Chinese history is taught as a queue of emperors and the tree concedes that a dynasty is
a real unit. The rule the Rome, Russia and India plans use holds: **no person is the subject of a run
of cards.** Several cards carry Qin Shi Huang's or Mao's name; they are policies, campaigns and
consequences, not episodes of a biography.

**Modern scholars are capped at two in the thousand and this plan spends both.** `cnh-070 The discovery
of the oracle bones` and `cnh-937 Dunhuang manuscripts` are events with consequences on the scale of
the Linear B decipherment that earns Greece its `gr-075`: before 1899 the Shang was a literary
tradition, and the Dunhuang library cave rewrote what was known of Chinese Buddhism and of vernacular
writing. Both are cards about what changed, not about who changed it.

## Names, dates and romanisation

**Romanisation: pinyin**, throughout, with one class of exception — where a non-pinyin form simply *is*
the English name of the thing, keep it. Confucius, Mencius, Taoism, the *Tao Te Ching*, Peking opera
and the Yangtze are all in that class; Peking, Canton, Mao Tse-tung and Chungking are not, and take
their pinyin forms. **Every term ships with its variants as `GLOSSARY_ALIASES` the day it ships** —
this collection will generate more alias rows than any other, and a reader who learned the older
spellings will type them.

**Dates.** BCE/CE. Dynastic dates are conventions rather than facts and several are argued: the Xia's
are inferred, the Shang's earlier reigns are not fixed, and the Jin's founding is given as 265 or 266
depending on whether the abdication or the accession is counted. **Give the conventional date, say it
is conventional where it is contested, and give the range where scholarship gives one.** The Chinese
lunar calendar means a "year" often straddles two Western ones; where that matters, the card says so.

**Two names that will trip a writer and a reader alike.** *Jin* is two dynasties nine centuries apart
(`col-17` and `col-30`) — always disambiguate in the card's own prose, not only in the deck title. And
*li* is two entirely different central concepts, 禮 ritual propriety (`cnh-831`) and 理 principle
(`cnh-861`); the glossary needs distinct head words, or one will link inside sentences meaning the
other.

## Sourcing

China is well served in English and much of it is open: university repositories, the Chinese Text
Project for the classical corpus, museum records at the Palace Museum, the British Museum, the Met and
the Freer|Sackler, and the whole out-of-copyright sinological shelf on archive.org. Three cautions.

**A transmitted text is evidence of when it was written, not always of what it describes.** The
*Records of the Grand Historian* is a first-century-BCE source for the Shang; the *Bamboo Annals* have a
transmission history that is itself the subject of a scholarly literature. Cite them for what they are.

**Statistics for the twentieth century are contested and the disagreements are enormous.** The death
toll of the Great Leap famine, of the Cultural Revolution, of the Taiping Rebellion and of the Nanjing
Massacre all have live scholarly ranges spanning millions. Give the range and name whose it is. This is
the same rule the Russia plan sets for Soviet figures and the India plan for the colonial period.

**Excavation reports are the primary literature for everything before the oracle bones**, and many are
published only in Chinese. Where the English-language literature is a synthesis of them, cite the
synthesis for what it establishes rather than the dig for what it found.

## Living beside the other collections

**World History is the survey and never waits for this collection.** Ancient China gets 20 cards there
(`wh-396`–`wh-415`), East Asia 25 in the post-classical deck and Ming and Qing China 15 in the early
modern one. Ten sentences on the Tang is a different card from ten sentences on the two-tax system.

**Five pairs already exist in other plans and should be written deliberately differently:**

| event | elsewhere | here |
|---|---|---|
| Treaty of Nerchinsk | `ru-274` — Russia's first treaty with China and the limit of its Amur expansion | `cnh-546` — the Kangxi settlement of a frontier the Qing had just secured |
| the transmission of Buddhism | `in-812` — a religion leaving India | `cnh-883` — a foreign religion arriving in China, and what it had to become to stay |
| Xuanzang | `in-199` — a visitor whose account is a source for Gupta-age India | `cnh-388` — a Tang monk's journey and the translations it produced |
| the war with Japan | `ww2-401`–`ww2-435` — the war's largest and longest land theatre; `jp-728`–`jp-734` — what the army did and what it could not win | `cnh-631`–`cnh-655` — eight years that reshaped China and set up its civil war |
| the tally trade | `jp-263`, `jp-264` — Ashikaga Japan buying a place in the Ming order | `cnh` Ming cards — the tribute system working as designed |

Write the card this collection needs.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `cnh-828 Confucius`, `cnh-837 Laozi`, `cnh-846 Han Feizi` → also `col-5` Eastern Zhou
- `cnh-704 Imperial examination` → also `col-22` Sui, where it begins
- `cnh-722 The Great Wall` → also `col-32` Ming, which built the wall a visitor sees
- `cnh-240 Sima Qian`, `cnh-241 Records of the Grand Historian` → also `cn-government`, where
  historiography is taught
- `cnh-459 Zhu Xi`, `cnh-460 Neo-Confucianism` → also `cn-thought`
- `cnh-978 Gunpowder`, `cnh-976 Woodblock printing` → also the Song decks, where they land

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`).

The glossary has **`China`, `Mongolia`, `Taiwan`, `Zhoukoudian` and `Sima_Qian`** and nothing else
Chinese — and `Sima_Qian` is the template entry the whole glossary was regrown from, so in a real sense
this collection's vocabulary starts at zero. Write the terms **cited from the start**, at the
`GLOSS_SRC_TARGET` bar of 2, rather than opening a backlog.

Three traps beyond the usual. **Alias rows are mandatory here** — see the romanisation rule above.
**A term whose surface is an ordinary English word** (`Han`, `Song`, `Tang`, `Qin`, `Jin`, `Shang`,
`Yuan`, `Ming`) needs `GLOSSARY_CASESENSITIVE` or a narrower head word, and this collection has more of
them than the rest of the site put together: *song*, *tang*, *ming* and *yuan* are all common English
words or fragments, and `Han` collides with a personal name. And **a term that is a Chinese concept and
an English word at once** — *dao*, *qi*, *li* — needs a description written from the scholarship rather
than from the loose English usage the word has picked up.

**A fourth trap is specific to romanised Chinese and was measured on this list rather than guessed.**
Running a token-overlap sweep over the 1000 topics to find near-duplicates returned almost nothing but
false positives, and the reason is the finding: **Chinese names collide on their syllables.** The list
contains *Yang Yan* (a Tang chancellor) beside *yin and yang*; *Ban Zhao* beside *Han-Zhao*; *Tao Te
Ching* beside *I Ching*; *Eastern Wu* beside *Eastern Jin*. None of those is a duplicate topic, but
every one is a surface an auto-linker can match wrongly, because `buildGlossIndex` sorts surfaces
longest-first and a two-syllable name is short. **Prefer the fuller head word** (`Yang Yan` rather than
`Yang`, `Han-Zhao` rather than `Zhao`), and check a new one-or-two-syllable term against the terms
already shipped before adding it.

---

# The list

## Mythology — `cn-myth`

    cnh-001  Chinese mythology
    cnh-002  Three Sovereigns and Five Emperors
    cnh-003  Pangu
    cnh-004  Nüwa
    cnh-005  Fuxi
    cnh-006  Shennong
    cnh-007  Yellow Emperor
    cnh-008  Chiyou
    cnh-009  Battle of Zhuolu
    cnh-010  Yao
    cnh-011  Shun
    cnh-012  Yu the Great
    cnh-013  The great flood in Chinese myth
    cnh-014  Houyi
    cnh-015  Chang'e
    cnh-016  Kua Fu
    cnh-017  Jingwei
    cnh-018  Gonggong
    cnh-019  Kunlun Mountain
    cnh-020  Queen Mother of the West
    cnh-021  Penglai
    cnh-022  Eight Immortals
    cnh-023  Chinese dragon
    cnh-024  Fenghuang
    cnh-025  Qilin
    cnh-026  Four Symbols
    cnh-027  Taotie
    cnh-028  Classic of Mountains and Seas
    cnh-029  Chuci
    cnh-030  Jade Emperor
    cnh-031  Diyu
    cnh-032  The ten courts of the underworld
    cnh-033  Zao Jun
    cnh-034  Menshen
    cnh-035  Chinese zodiac
    cnh-036  The Cowherd and the Weaver Girl
    cnh-037  Legend of the White Snake
    cnh-038  Mazu
    cnh-039  Guandi and the deification of Guan Yu
    cnh-040  Myth and history in early China

## Ancient

### Neolithic China and the Xia — `col-2`

    cnh-041  Neolithic China
    cnh-042  The origins of Chinese agriculture
    cnh-043  Millet and rice in early China
    cnh-044  Jiahu
    cnh-045  Yangshao culture
    cnh-046  Banpo
    cnh-047  Hongshan culture
    cnh-048  Liangzhu culture
    cnh-049  Liangzhu jade
    cnh-050  Longshan culture
    cnh-051  Chinese Neolithic pottery
    cnh-052  The Central Plain and the origins of Chinese civilisation
    cnh-053  Sanxingdui
    cnh-054  Xia dynasty
    cnh-055  Shaokang and the restoration of the Xia
    cnh-056  Tribute of Yu
    cnh-057  Qi of Xia
    cnh-058  Jie of Xia
    cnh-059  Songs of the Five Sons
    cnh-060  Bamboo Annals
    cnh-061  The question of the Xia's historicity
    cnh-062  Erlitou culture
    cnh-063  The Erlitou site
    cnh-064  Erlitou bronze
    cnh-065  Xia–Shang–Zhou Chronology Project

### Shang — `col-3`

    cnh-066  Shang dynasty
    cnh-067  The Shang in the transmitted record
    cnh-068  Tang of Shang
    cnh-069  Yinxu
    cnh-070  The discovery of the oracle bones
    cnh-071  Oracle bone script
    cnh-072  Shang divination
    cnh-073  Wu Ding
    cnh-074  Fu Hao
    cnh-075  The tomb of Fu Hao
    cnh-076  Shang kingship
    cnh-077  Shangdi
    cnh-078  Shang ancestor worship
    cnh-079  Human sacrifice under the Shang
    cnh-080  The Shang royal tombs
    cnh-081  Chinese ritual bronzes
    cnh-082  Piece-mould casting
    cnh-083  Ding
    cnh-084  Shang bronze decoration
    cnh-085  Shang jade
    cnh-086  The chariot in Shang China
    cnh-087  Shang warfare
    cnh-088  The Shang capitals
    cnh-089  Zhengzhou Shang City
    cnh-090  Panlongcheng
    cnh-091  Shang agriculture
    cnh-092  Shang settlement and the countryside
    cnh-093  The Shang calendar
    cnh-094  Shang writing and its descendants
    cnh-095  The Shang and their neighbours
    cnh-096  Shang bronze technology and its sources
    cnh-097  Cowrie shells and Shang exchange
    cnh-098  Shang music and instruments
    cnh-099  Shang craft workshops
    cnh-100  Shang burial practice
    cnh-101  Shang queens and royal women
    cnh-102  Di Xin
    cnh-103  The fall of the Shang
    cnh-104  Battle of Muye
    cnh-105  The Zhou account of the Shang
    cnh-106  The Shang in later Chinese memory
    cnh-107  The oracle bone archives as a source
    cnh-108  Shang chronology and its problems
    cnh-109  The Shang in world Bronze Age context
    cnh-110  What the Shang record does and does not say

### Western Zhou — `col-4`

    cnh-111  Zhou dynasty
    cnh-112  Western Zhou
    cnh-113  King Wen of Zhou
    cnh-114  King Wu of Zhou
    cnh-115  Duke of Zhou
    cnh-116  Rebellion of the Three Guards
    cnh-117  Mandate of Heaven
    cnh-118  Tian
    cnh-119  Fengjian
    cnh-120  The Zhou colonies in the east
    cnh-121  Chengzhou
    cnh-122  Zhou royal ritual
    cnh-123  Western Zhou bronze inscriptions
    cnh-124  The Zhou ritual reform
    cnh-125  Zongfa
    cnh-126  Book of Documents
    cnh-127  Classic of Poetry
    cnh-128  The Zhou reckoning of the year
    cnh-129  The well-field system
    cnh-130  Zhou warfare and the chariot
    cnh-131  The Zhou and the Xianyun
    cnh-132  King Mu of Zhou
    cnh-133  King Li of Zhou
    cnh-134  The Gonghe regency
    cnh-135  King Xuan of Zhou
    cnh-136  King You of Zhou
    cnh-137  Baosi and the beacon fires
    cnh-138  The sack of Haojing
    cnh-139  The move of the Zhou capital to Luoyang
    cnh-140  The Western Zhou legacy

### Eastern Zhou — `col-5`

    cnh-141  Eastern Zhou
    cnh-142  Spring and Autumn period
    cnh-143  Spring and Autumn Annals
    cnh-144  Zuo Zhuan
    cnh-145  The decline of Zhou royal authority
    cnh-146  The hegemon system
    cnh-147  Duke Huan of Qi
    cnh-148  Guan Zhong
    cnh-149  Duke Wen of Jin
    cnh-150  Battle of Chengpu
    cnh-151  King Zhuang of Chu
    cnh-152  The state of Qi
    cnh-153  The state of Jin
    cnh-154  The state of Chu
    cnh-155  The state of Qin
    cnh-156  The state of Lu
    cnh-157  The state of Song
    cnh-158  The state of Yue
    cnh-159  Goujian
    cnh-160  The covenant meetings
    cnh-161  Spring and Autumn warfare
    cnh-162  The partition of Jin
    cnh-163  Warring States period
    cnh-164  The seven warring states
    cnh-165  The rise of Wei
    cnh-166  Li Kui
    cnh-167  Wu Qi
    cnh-168  Shang Yang
    cnh-169  Shang Yang's reforms
    cnh-170  The Qin state after Shang Yang
    cnh-171  Warring States warfare
    cnh-172  The Chinese crossbow
    cnh-173  Mass infantry armies in the Warring States
    cnh-174  King Wuling of Zhao and the cavalry reform
    cnh-175  Iron in the Warring States
    cnh-176  Warring States coinage
    cnh-177  Warring States cities
    cnh-178  Vertical and horizontal alliances
    cnh-179  Su Qin and Zhang Yi
    cnh-180  Battle of Maling
    cnh-181  Battle of Changping
    cnh-182  Bai Qi
    cnh-183  Jixia Academy
    cnh-184  The Four Lords of the Warring States
    cnh-185  Zhanguo Ce
    cnh-186  Qu Yuan
    cnh-187  Li Sao
    cnh-188  The Qin conquest of the six states
    cnh-189  Jing Ke
    cnh-190  The end of the Zhou

## Imperial

### Qin — `col-7`

    cnh-191  Qin dynasty
    cnh-192  Qin Shi Huang
    cnh-193  The unification of 221 BCE
    cnh-194  Huangdi
    cnh-195  Li Si
    cnh-196  The abolition of the fengjian order
    cnh-197  The commandery-county system
    cnh-198  Qin standardisation
    cnh-199  The standardisation of the Chinese script
    cnh-200  Qin law
    cnh-201  The Shuihudi Qin bamboo texts
    cnh-202  Burning of books and burying of scholars
    cnh-203  The Qin road system
    cnh-204  Lingqu Canal
    cnh-205  The Qin conquest of the south
    cnh-206  Meng Tian and the Ordos campaign
    cnh-207  The Qin long walls
    cnh-208  Mausoleum of the First Qin Emperor
    cnh-209  Terracotta Army
    cnh-210  Qin Shi Huang and the search for immortality
    cnh-211  The Shaqiu plot
    cnh-212  The fall of the Qin

### Western Han — `col-10`

    cnh-213  Han dynasty
    cnh-214  Chu–Han Contention
    cnh-215  Xiang Yu
    cnh-216  Emperor Gaozu of Han
    cnh-217  Feast at Hong Gate
    cnh-218  Battle of Gaixia
    cnh-219  The Han founding settlement
    cnh-220  Empress Lü
    cnh-221  The Rule of Wen and Jing
    cnh-222  Rebellion of the Seven States
    cnh-223  Emperor Wu of Han
    cnh-224  The Han–Xiongnu wars
    cnh-225  Xiongnu
    cnh-226  Modu Chanyu
    cnh-227  Heqin
    cnh-228  Wei Qing and Huo Qubing
    cnh-229  Zhang Qian
    cnh-230  The opening of the Silk Road
    cnh-231  The Han conquest of the Hexi Corridor
    cnh-232  The Han conquest of Nanyue
    cnh-233  The Han commanderies in Korea
    cnh-234  The salt and iron monopolies
    cnh-235  Discourses on Salt and Iron
    cnh-236  The equable transport system
    cnh-237  Dong Zhongshu
    cnh-238  The Han adoption of Confucianism
    cnh-239  The Han Imperial University
    cnh-240  Sima Qian
    cnh-241  Records of the Grand Historian
    cnh-242  Chang'an under the Han
    cnh-243  Han provincial administration
    cnh-244  The late Western Han court

### Xin — `col-11`

    cnh-245  Xin dynasty
    cnh-246  Wang Mang
    cnh-247  Wang Mang's usurpation
    cnh-248  Wang Mang's reforms
    cnh-249  Wang Mang's currency reforms
    cnh-250  The Yellow River shift of 11 CE
    cnh-251  Red Eyebrows
    cnh-252  The fall of the Xin

### Eastern Han — `col-12`

    cnh-253  Eastern Han
    cnh-254  Emperor Guangwu of Han
    cnh-255  The Han restoration
    cnh-256  Luoyang under the Eastern Han
    cnh-257  Ban Chao
    cnh-258  The Protectorate of the Western Regions
    cnh-259  Ban Gu
    cnh-260  Book of Han
    cnh-261  Ban Zhao
    cnh-262  Cai Lun
    cnh-263  Zhang Heng
    cnh-264  The great families of the Eastern Han
    cnh-265  Consort clans and eunuchs
    cnh-266  Partisan Prohibitions
    cnh-267  The arrival of Buddhism in China
    cnh-268  Yellow Turban Rebellion
    cnh-269  Zhang Jue
    cnh-270  Dong Zhuo
    cnh-271  The warlords of the 190s
    cnh-272  The end of the Han

### Three Kingdoms — `col-16`

    cnh-273  Three Kingdoms
    cnh-274  Cao Cao
    cnh-275  Battle of Guandu
    cnh-276  Battle of Red Cliffs
    cnh-277  Cao Wei
    cnh-278  Cao Pi
    cnh-279  Shu Han
    cnh-280  Liu Bei
    cnh-281  Zhuge Liang
    cnh-282  Longzhong Plan
    cnh-283  Zhuge Liang's Northern Expeditions
    cnh-284  Eastern Wu
    cnh-285  Sun Quan
    cnh-286  Guan Yu
    cnh-287  Tuntian
    cnh-288  Nine-rank system
    cnh-289  Sima Yi
    cnh-290  Records of the Three Kingdoms
    cnh-291  Romance of the Three Kingdoms and the historical record
    cnh-292  The reunification of 280

### Western Jin — `col-18`

    cnh-293  Jin dynasty
    cnh-294  Emperor Wu of Jin
    cnh-295  The Jin conquest of Wu
    cnh-296  The Jin occupation-of-land system
    cnh-297  War of the Eight Princes
    cnh-298  The Jin aristocracy
    cnh-299  Qingtan
    cnh-300  Seven Sages of the Bamboo Grove
    cnh-301  Disaster of Yongjia
    cnh-302  The fall of the Western Jin

### Sixteen Kingdoms — `col-19`

    cnh-303  Sixteen Kingdoms
    cnh-304  Five Barbarians
    cnh-305  Han-Zhao
    cnh-306  Later Zhao
    cnh-307  The Murong and the Yan states
    cnh-308  Former Qin
    cnh-309  Fu Jian
    cnh-310  Battle of Fei River
    cnh-311  The flight of the northern elite to the south
    cnh-312  Buddhism in the northern kingdoms

### Eastern Jin — `col-20`

    cnh-313  Eastern Jin
    cnh-314  Jiankang
    cnh-315  The émigré great clans
    cnh-316  Wang Dao
    cnh-317  The northern expeditions of the Eastern Jin
    cnh-318  Huan Wen
    cnh-319  Wang Xizhi
    cnh-320  Tao Yuanming
    cnh-321  Gu Kaizhi
    cnh-322  The end of the Eastern Jin

### Northern and Southern dynasties — `col-21`

    cnh-323  Northern and Southern dynasties
    cnh-324  Liu Song
    cnh-325  Southern Qi
    cnh-326  Liang dynasty
    cnh-327  Emperor Wu of Liang
    cnh-328  Hou Jing rebellion
    cnh-329  Chen dynasty
    cnh-330  Northern Wei
    cnh-331  Tuoba
    cnh-332  Equal-field system
    cnh-333  The sinicisation reforms of Emperor Xiaowen
    cnh-334  The move of the Northern Wei capital to Luoyang
    cnh-335  Yungang Grottoes
    cnh-336  Longmen Grottoes
    cnh-337  Six Frontier Towns revolt
    cnh-338  Eastern Wei and Western Wei
    cnh-339  Northern Qi and Northern Zhou
    cnh-340  Fubing system
    cnh-341  Southern literary culture
    cnh-342  Wen Xuan

### Sui — `col-22`

    cnh-343  Sui dynasty
    cnh-344  Emperor Wen of Sui
    cnh-345  The Sui reunification
    cnh-346  The Sui administrative reforms
    cnh-347  Three Departments and Six Ministries
    cnh-348  The beginning of the examination system
    cnh-349  Emperor Yang of Sui
    cnh-350  Grand Canal
    cnh-351  The Sui campaigns against Goguryeo
    cnh-352  The Sui walls
    cnh-353  The Sui rebellions
    cnh-354  The fall of the Sui

### Tang — `col-23`

    cnh-355  Tang dynasty
    cnh-356  Emperor Gaozu of Tang
    cnh-357  Emperor Taizong of Tang
    cnh-358  Incident at Xuanwu Gate
    cnh-359  The Zhenguan reign
    cnh-360  Tang Code
    cnh-361  The Tang equal-field system
    cnh-362  Zu yong diao
    cnh-363  Tang central government
    cnh-364  The Tang examinations
    cnh-365  The Tang defeat of the Eastern Turks
    cnh-366  The Tang protectorates in Central Asia
    cnh-367  Chang'an under the Tang
    cnh-368  The markets of Tang Chang'an
    cnh-369  Foreign communities in Tang China
    cnh-370  Tang cosmopolitanism
    cnh-371  Wu Zetian
    cnh-372  The Zhou interregnum
    cnh-373  Emperor Xuanzong of Tang
    cnh-374  The Kaiyuan era
    cnh-375  Yang Guifei
    cnh-376  Battle of Talas
    cnh-377  An Lushan
    cnh-378  An Lushan Rebellion
    cnh-379  The consequences of the An Lushan Rebellion
    cnh-380  Jiedushi
    cnh-381  Two-tax system
    cnh-382  Yang Yan
    cnh-383  The Tang salt monopoly
    cnh-384  The Tibetan Empire and the Tang
    cnh-385  The Uyghur Khaganate and the Tang
    cnh-386  Nanzhao
    cnh-387  Tang Buddhism at its height
    cnh-388  Xuanzang
    cnh-389  Great Anti-Buddhist Persecution
    cnh-390  Tang poetry
    cnh-391  Li Bai
    cnh-392  Du Fu
    cnh-393  Bai Juyi
    cnh-394  Han Yu
    cnh-395  Huang Chao Rebellion
    cnh-396  The fall of the Tang

### Five Dynasties and Ten Kingdoms — `col-24`

    cnh-397  Five Dynasties and Ten Kingdoms
    cnh-398  Later Liang
    cnh-399  Later Tang
    cnh-400  Sixteen Prefectures
    cnh-401  Shi Jingtang
    cnh-402  Later Han and Later Zhou
    cnh-403  Emperor Shizong of Later Zhou
    cnh-404  The Ten Kingdoms
    cnh-405  Wuyue
    cnh-406  Southern Tang
    cnh-407  Li Yu
    cnh-408  The southern economy in the tenth century
    cnh-409  Printing in the Five Dynasties
    cnh-410  The Song reunification

### Liao — `col-25`

    cnh-411  Liao dynasty
    cnh-412  Khitan people
    cnh-413  Abaoji
    cnh-414  The Liao dual administration
    cnh-415  Khitan scripts
    cnh-416  The Liao and the Sixteen Prefectures
    cnh-417  Treaty of Chanyuan
    cnh-418  Liao Buddhism and architecture
    cnh-419  Liao relations with the Song
    cnh-420  The fall of the Liao

### Northern Song — `col-27`

    cnh-421  Song dynasty
    cnh-422  Emperor Taizu of Song
    cnh-423  The cup of wine that released the generals
    cnh-424  Northern Song
    cnh-425  Kaifeng
    cnh-426  The Song civil service
    cnh-427  The Song examinations
    cnh-428  The scholar-official under the Song
    cnh-429  Song military weakness
    cnh-430  Wang Anshi
    cnh-431  New Policies
    cnh-432  Sima Guang
    cnh-433  Zizhi Tongjian
    cnh-434  The factional struggles of the Northern Song
    cnh-435  The Song commercial revolution
    cnh-436  Jiaozi
    cnh-437  Song iron and coal
    cnh-438  Song shipbuilding
    cnh-439  Bi Sheng
    cnh-440  Song printing and the spread of books
    cnh-441  Su Shi
    cnh-442  Song ci poetry
    cnh-443  Along the River During the Qingming Festival
    cnh-444  Song landscape painting
    cnh-445  Emperor Huizong
    cnh-446  Jingkang incident

### Southern Song — `col-28`

    cnh-447  Southern Song
    cnh-448  Emperor Gaozong of Song
    cnh-449  Lin'an
    cnh-450  Yue Fei
    cnh-451  Qin Hui
    cnh-452  Treaty of Shaoxing
    cnh-453  Battle of Caishi
    cnh-454  The Southern Song economy
    cnh-455  Quanzhou
    cnh-456  Song porcelain
    cnh-457  Song tea culture
    cnh-458  The cities of the Southern Song
    cnh-459  Zhu Xi
    cnh-460  Neo-Confucianism
    cnh-461  The Southern Song navy
    cnh-462  Gunpowder weapons under the Song
    cnh-463  The Mongol conquest of the Southern Song
    cnh-464  Battle of Yamen

### Western Xia — `col-29`

    cnh-465  Western Xia
    cnh-466  Tangut people
    cnh-467  Li Yuanhao
    cnh-468  Tangut script
    cnh-469  Western Xia Buddhism
    cnh-470  Western Xia and its neighbours
    cnh-471  Khara-Khoto
    cnh-472  The Mongol destruction of the Western Xia

### Jurchen Jin — `col-30`

    cnh-473  Jurchen Jin
    cnh-474  Jurchen people
    cnh-475  Wanyan Aguda
    cnh-476  The Jin conquest of the Liao
    cnh-477  The Jin conquest of northern China
    cnh-478  Meng'an mouke
    cnh-479  Jurchen script
    cnh-480  Jin rule over the Han population
    cnh-481  The Jin and the Mongols
    cnh-482  The fall of the Jurchen Jin

### Yuan — `col-31`

    cnh-483  Yuan dynasty
    cnh-484  Genghis Khan and China
    cnh-485  Kublai Khan
    cnh-486  The Mongol conquest of China
    cnh-487  Khanbaliq
    cnh-488  The Yuan four-class system
    cnh-489  Yuan administration
    cnh-490  Semu
    cnh-491  The Yuan and the examinations
    cnh-492  Yuan paper money
    cnh-493  The Grand Canal under the Yuan
    cnh-494  The Yuan seaborne expeditions
    cnh-495  Marco Polo in China
    cnh-496  Foreign religions under the Yuan
    cnh-497  Tibetan Buddhism and the Yuan court
    cnh-498  Yuan drama
    cnh-499  Romance of the Western Chamber
    cnh-500  Yuan blue-and-white porcelain
    cnh-501  Red Turban Rebellions
    cnh-502  The fall of the Yuan

### Ming — `col-32`

    cnh-503  Ming dynasty
    cnh-504  Hongwu Emperor
    cnh-505  The Ming founding settlement
    cnh-506  The Hongwu purges
    cnh-507  The abolition of the chancellorship
    cnh-508  Grand Secretariat
    cnh-509  Jingnan campaign
    cnh-510  Yongle Emperor
    cnh-511  The move of the capital to Beijing
    cnh-512  Forbidden City
    cnh-513  Yongle Encyclopedia
    cnh-514  Zheng He
    cnh-515  Ming treasure voyages
    cnh-516  The end of the treasure voyages
    cnh-517  Tumu Crisis
    cnh-518  The Ming Great Wall
    cnh-519  The Ming tribute system
    cnh-520  Wokou
    cnh-521  Haijin
    cnh-522  Single whip law
    cnh-523  Silver and the Ming economy
    cnh-524  The Ming commercial economy
    cnh-525  Ming porcelain and the export trade
    cnh-526  The Jesuit China missions
    cnh-527  Matteo Ricci
    cnh-528  Wang Yangming
    cnh-529  Ming vernacular fiction
    cnh-530  The Ming intervention in the Imjin War
    cnh-531  Donglin movement
    cnh-532  Wei Zhongxian
    cnh-533  Li Zicheng
    cnh-534  The fall of the Ming

### Qing — `col-33`

    cnh-535  Qing dynasty
    cnh-536  Nurhaci
    cnh-537  Eight Banners
    cnh-538  Hong Taiji
    cnh-539  The Manchu conquest of China
    cnh-540  Dorgon
    cnh-541  The queue order
    cnh-542  The Yangzhou massacre
    cnh-543  Revolt of the Three Feudatories
    cnh-544  The Qing annexation of Taiwan
    cnh-545  Kangxi Emperor
    cnh-546  Treaty of Nerchinsk
    cnh-547  The Qing conquest of the Dzungars
    cnh-548  The Qing and Tibet
    cnh-549  Yongzheng Emperor
    cnh-550  Grand Council
    cnh-551  Qianlong Emperor
    cnh-552  Siku Quanshu
    cnh-553  The Qing literary inquisition
    cnh-554  Qing population growth
    cnh-555  Heshen
    cnh-556  Macartney Embassy
    cnh-557  Canton System
    cnh-558  White Lotus Rebellion
    cnh-559  The opium trade
    cnh-560  Lin Zexu
    cnh-561  First Opium War
    cnh-562  Treaty of Nanking
    cnh-563  Unequal treaty
    cnh-564  Taiping Rebellion
    cnh-565  Hong Xiuquan
    cnh-566  Nian Rebellion and the Muslim revolts
    cnh-567  Second Opium War
    cnh-568  Self-Strengthening Movement
    cnh-569  Empress Dowager Cixi
    cnh-570  First Sino-Japanese War
    cnh-571  Hundred Days' Reform
    cnh-572  Boxer Rebellion

## Modern

### Early Republic — `col-35`

    cnh-573  The Qing New Policies
    cnh-574  Xinhai Revolution
    cnh-575  Sun Yat-sen
    cnh-576  The abdication of Puyi
    cnh-577  Republic of China (1912–1949)
    cnh-578  Yuan Shikai
    cnh-579  The Empire of China of 1915
    cnh-580  Warlord Era
    cnh-581  The Beiyang government
    cnh-582  China in the First World War
    cnh-583  Twenty-One Demands
    cnh-584  The Shandong question
    cnh-585  May Fourth Movement
    cnh-586  New Culture Movement
    cnh-587  Chen Duxiu
    cnh-588  Hu Shi
    cnh-589  Lu Xun
    cnh-590  The founding of the Chinese Communist Party
    cnh-591  First United Front
    cnh-592  Whampoa Military Academy
    cnh-593  Chiang Kai-shek
    cnh-594  Northern Expedition
    cnh-595  Shanghai massacre
    cnh-596  Nanjing decade
    cnh-597  The Nationalist government
    cnh-598  Kuomintang
    cnh-599  Treaty ports in China
    cnh-600  Shanghai in the Republican era
    cnh-601  Chinese industry in the Republican era
    cnh-602  Rural China in the Republican era
    cnh-603  Chinese students abroad
    cnh-604  The Chinese women's movement
    cnh-605  Education reform in Republican China

### Civil War — `col-36`

    cnh-606  Chinese Civil War
    cnh-607  Jiangxi Soviet
    cnh-608  Mao Zedong
    cnh-609  The encirclement campaigns
    cnh-610  Long March
    cnh-611  Zunyi Conference
    cnh-612  Yan'an
    cnh-613  Yan'an Rectification Movement
    cnh-614  Mao Zedong Thought
    cnh-615  Zhou Enlai
    cnh-616  Zhu De
    cnh-617  Xi'an Incident
    cnh-618  Second United Front
    cnh-619  Communist land policy in the base areas
    cnh-620  The resumption of the civil war in 1946
    cnh-621  Marshall Mission
    cnh-622  Nationalist hyperinflation
    cnh-623  Liaoshen campaign
    cnh-624  Huaihai campaign
    cnh-625  Pingjin campaign
    cnh-626  The fall of Nanjing in 1949
    cnh-627  The Nationalist retreat to Taiwan
    cnh-628  The founding of the People's Republic
    cnh-629  Why the Communists won
    cnh-630  The cost of the civil war

### World War II — `col-37`

    cnh-631  Second Sino-Japanese War
    cnh-632  Mukden Incident
    cnh-633  Manchukuo
    cnh-634  The Japanese occupation of Manchuria
    cnh-635  Marco Polo Bridge Incident
    cnh-636  Battle of Shanghai
    cnh-637  Nanjing Massacre
    cnh-638  The retreat to Chongqing
    cnh-639  Chongqing as wartime capital
    cnh-640  The bombing of Chongqing
    cnh-641  Battle of Taierzhuang
    cnh-642  1938 Yellow River flood
    cnh-643  Wang Jingwei and the Nanjing regime
    cnh-644  Hundred Regiments Offensive
    cnh-645  The Communist base areas in wartime
    cnh-646  New Fourth Army incident
    cnh-647  The Burma Road and the Hump
    cnh-648  Joseph Stilwell and the China theatre
    cnh-649  Operation Ichi-Go
    cnh-650  Unit 731
    cnh-651  Chinese famine of 1942–1943
    cnh-652  Chinese casualties in the war
    cnh-653  The Japanese surrender in China
    cnh-654  China and the founding of the United Nations
    cnh-655  The memory of the war in China

### People's Republic of China — `col-38`

    cnh-656  People's Republic of China
    cnh-657  The land reform campaign
    cnh-658  The campaign to suppress counter-revolutionaries
    cnh-659  China in the Korean War
    cnh-660  The First Five-Year Plan
    cnh-661  The socialist transformation of industry and commerce
    cnh-662  Hundred Flowers Campaign
    cnh-663  Anti-Rightist Campaign
    cnh-664  Great Leap Forward
    cnh-665  People's commune
    cnh-666  Great Chinese Famine
    cnh-667  Lushan Conference
    cnh-668  Sino-Soviet split
    cnh-669  Liu Shaoqi and the recovery
    cnh-670  Cultural Revolution
    cnh-671  Red Guards
    cnh-672  Quotations from Chairman Mao Tse-tung
    cnh-673  Down to the Countryside Movement
    cnh-674  Lin Biao
    cnh-675  Gang of Four
    cnh-676  The Sino-American rapprochement
    cnh-677  The death of Mao Zedong
    cnh-678  Deng Xiaoping
    cnh-679  Boluan Fanzheng
    cnh-680  Chinese economic reform
    cnh-681  Household responsibility system
    cnh-682  Special economic zone
    cnh-683  One-child policy
    cnh-684  Tiananmen Square protests of 1989
    cnh-685  Southern tour
    cnh-686  China's accession to the World Trade Organization
    cnh-687  Chinese urbanisation since 1978
    cnh-688  Hukou
    cnh-689  The handover of Hong Kong and Macau
    cnh-690  China in the twenty-first century

### Republic of China (Taiwan) — `col-39`

    cnh-691  Taiwan under Japanese rule
    cnh-692  The retrocession of Taiwan
    cnh-693  February 28 incident
    cnh-694  White Terror
    cnh-695  Taiwan under martial law
    cnh-696  The Taiwan economic miracle
    cnh-697  The democratisation of Taiwan
    cnh-698  Cross-Strait relations
    cnh-699  Taiwanese identity
    cnh-700  The political status of Taiwan

## State, Society and Economy

### The imperial state — `cn-government`

    cnh-701  The Chinese imperial state
    cnh-702  Emperor of China
    cnh-703  The dynastic cycle
    cnh-704  Imperial examination
    cnh-705  The examination curriculum
    cnh-706  The examination degrees
    cnh-707  The scholar-official
    cnh-708  The Chinese bureaucracy
    cnh-709  Six Ministries
    cnh-710  The censorate
    cnh-711  The Chinese county magistrate
    cnh-712  Yamen
    cnh-713  Chinese legal codes
    cnh-714  Punishment in imperial China
    cnh-715  Chinese household registration
    cnh-716  Taxation in imperial China
    cnh-717  Corvée labour in China
    cnh-718  The Chinese state monopolies
    cnh-719  The Chinese granary system
    cnh-720  Chinese armies through the dynasties
    cnh-721  Chinese military organisation
    cnh-722  Great Wall of China
    cnh-723  Chinese frontier defence
    cnh-724  Tributary system of China
    cnh-725  The kowtow and Chinese diplomacy
    cnh-726  Chinese cartography
    cnh-727  The Chinese imperial capital as an idea
    cnh-728  Chinese palace architecture and the court
    cnh-729  Chinese court ritual
    cnh-730  Eunuchs in China
    cnh-731  The imperial harem and the inner court
    cnh-732  Imperial succession in China
    cnh-733  Regencies and empress dowagers
    cnh-734  Rebellion in Chinese history
    cnh-735  Chinese secret societies
    cnh-736  Chinese historiography
    cnh-737  Twenty-Four Histories
    cnh-738  The standard history as a genre
    cnh-739  The Chinese archive and the loss of records
    cnh-740  Writing Chinese history today

### Society and everyday life — `cn-society`

    cnh-741  Chinese society
    cnh-742  The Chinese family
    cnh-743  Filial piety
    cnh-744  Chinese lineage organisation
    cnh-745  The Chinese gentry
    cnh-746  The Chinese peasantry
    cnh-747  Merchants in Chinese society
    cnh-748  Chinese artisans and guilds
    cnh-749  Bondservitude in China
    cnh-750  Women in Chinese history
    cnh-751  Marriage in China
    cnh-752  Concubinage in China
    cnh-753  Foot binding
    cnh-754  Childhood and schooling in China
    cnh-755  Chinese kinship terms
    cnh-756  Chinese funerary practice
    cnh-757  Chinese ancestral halls
    cnh-758  Chinese festivals
    cnh-759  Chinese New Year
    cnh-760  Chinese calendar
    cnh-761  Chinese cuisine
    cnh-762  Rice and wheat in Chinese life
    cnh-763  Tea in China
    cnh-764  Chinese alcohol and drinking customs
    cnh-765  Chinese clothing
    cnh-766  The Chinese courtyard house
    cnh-767  Chinese city walls
    cnh-768  Chinese markets and street life
    cnh-769  Chinese games and pastimes
    cnh-770  Chinese martial arts
    cnh-771  Chinese population history
    cnh-772  Migration within China

### The peoples and frontiers of China — `cn-peoples`

    cnh-773  The peoples of China
    cnh-774  Han Chinese
    cnh-775  Hua–Yi distinction
    cnh-776  Sinicisation
    cnh-777  The steppe frontier
    cnh-778  Nomads and settled China
    cnh-779  The Xiongnu and their successors
    cnh-780  Turkic peoples and China
    cnh-781  The Mongols and China
    cnh-782  Manchu people
    cnh-783  Tibet and China
    cnh-784  Tibetan people
    cnh-785  Xinjiang
    cnh-786  Uyghurs
    cnh-787  Hui people
    cnh-788  Islam in China
    cnh-789  The peoples of the southwest
    cnh-790  Miao and Yao peoples
    cnh-791  Zhuang people
    cnh-792  Yi people
    cnh-793  The southward expansion of Han settlement
    cnh-794  Tusi
    cnh-795  Manchuria as a frontier
    cnh-796  Mongolia and China
    cnh-797  Korea and China
    cnh-798  Vietnam and China
    cnh-799  Japan and China
    cnh-800  Nationality policy in the People's Republic

### Land, trade and money — `cn-economy`

    cnh-801  The economic history of China
    cnh-802  Chinese agriculture
    cnh-803  Rice cultivation in China
    cnh-804  Chinese irrigation and water control
    cnh-805  The Yellow River and its floods
    cnh-806  The Yangtze and the south
    cnh-807  Land tenure in China
    cnh-808  Landlordism and tenancy in China
    cnh-809  Chinese coinage
    cnh-810  Paper money in China
    cnh-811  Silver in the Chinese economy
    cnh-812  Chinese domestic trade
    cnh-813  Chinese canals and river transport
    cnh-814  Silk Road
    cnh-815  Chinese silk
    cnh-816  The Chinese tea trade
    cnh-817  The Chinese porcelain trade
    cnh-818  Chinese maritime trade
    cnh-819  The Chinese junk
    cnh-820  Chinese merchant networks
    cnh-821  Chinese banking and remittance
    cnh-822  The Chinese salt administration
    cnh-823  Chinese mining
    cnh-824  Chinese textile production
    cnh-825  The great divergence

## Thought and Religion

### Chinese philosophy — `cn-thought`

    cnh-826  Chinese philosophy
    cnh-827  Hundred Schools of Thought
    cnh-828  Confucius
    cnh-829  Analects
    cnh-830  Ren
    cnh-831  Li (ritual propriety)
    cnh-832  Junzi
    cnh-833  Confucianism
    cnh-834  Mencius
    cnh-835  Xunzi
    cnh-836  The debate on human nature
    cnh-837  Laozi
    cnh-838  Tao Te Ching
    cnh-839  Dao
    cnh-840  Wu wei
    cnh-841  Taoism
    cnh-842  Zhuangzi
    cnh-843  Mozi
    cnh-844  Mohism
    cnh-845  Legalism
    cnh-846  Han Feizi
    cnh-847  School of Names
    cnh-848  Yin and yang
    cnh-849  Wu Xing
    cnh-850  Zou Yan
    cnh-851  I Ching
    cnh-852  Chinese classic texts
    cnh-853  Four Books and Five Classics
    cnh-854  Han Confucianism
    cnh-855  New Text and Old Text schools
    cnh-856  Xuanxue
    cnh-857  The Confucian revival of the Tang
    cnh-858  Neo-Confucian metaphysics
    cnh-859  Zhou Dunyi
    cnh-860  Cheng–Zhu school
    cnh-861  Li (principle) and qi
    cnh-862  Lu–Wang school
    cnh-863  The investigation of things
    cnh-864  Qing evidential scholarship
    cnh-865  Chinese political thought
    cnh-866  Chinese thought and the modern world
    cnh-867  Chinese philosophy since 1900

### Religion and ritual — `cn-religion`

    cnh-868  Chinese folk religion
    cnh-869  Chinese ancestor veneration
    cnh-870  The celestial bureaucracy
    cnh-871  Chinese temples
    cnh-872  Feng shui
    cnh-873  Divination in China
    cnh-874  Chinese state ritual and sacrifice
    cnh-875  Temple of Heaven
    cnh-876  Taoist religion
    cnh-877  Way of the Celestial Masters
    cnh-878  Chinese alchemy and the search for immortality
    cnh-879  Taoist canon
    cnh-880  Taoist monasticism
    cnh-881  Quanzhen School
    cnh-882  Chinese Buddhism
    cnh-883  The transmission of Buddhism into China
    cnh-884  Chinese Buddhist translation
    cnh-885  Kumarajiva
    cnh-886  The schools of Chinese Buddhism
    cnh-887  Tiantai
    cnh-888  Huayan
    cnh-889  Pure Land Buddhism
    cnh-890  Chan Buddhism
    cnh-891  Chinese Buddhist monasteries
    cnh-892  Chinese Buddhist cave temples
    cnh-893  Mogao Caves
    cnh-894  Chinese Buddhist pilgrimage
    cnh-895  The persecutions of Buddhism in China
    cnh-896  Buddhism and the Chinese state
    cnh-897  Three teachings
    cnh-898  Christianity in China
    cnh-899  Church of the East in China
    cnh-900  Chinese millenarian movements
    cnh-901  Religion in the People's Republic
    cnh-902  Chinese religion today

## Learning, Arts and Invention

### Language and literature — `cn-language`

    cnh-903  Chinese language
    cnh-904  Chinese characters
    cnh-905  The development of the Chinese script
    cnh-906  Seal script
    cnh-907  Clerical script
    cnh-908  Regular script
    cnh-909  Classical Chinese
    cnh-910  Varieties of Chinese
    cnh-911  Mandarin Chinese
    cnh-912  Chinese rhyme books
    cnh-913  Chinese dictionaries
    cnh-914  Shuowen Jiezi
    cnh-915  Chinese script reform
    cnh-916  Simplified Chinese characters
    cnh-917  Pinyin
    cnh-918  Chinese literature
    cnh-919  Chinese poetry
    cnh-920  Shi poetry
    cnh-921  Fu
    cnh-922  Ci poetry
    cnh-923  Sanqu and dramatic verse
    cnh-924  Chinese prose
    cnh-925  The Chinese essay
    cnh-926  Biography in Chinese writing
    cnh-927  Chinese fiction
    cnh-928  Four Great Classical Novels
    cnh-929  Water Margin
    cnh-930  Journey to the West
    cnh-931  Jin Ping Mei
    cnh-932  Dream of the Red Chamber
    cnh-933  Strange Tales from a Chinese Studio
    cnh-934  Chinese drama
    cnh-935  Chinese literary criticism
    cnh-936  The Chinese book
    cnh-937  Dunhuang manuscripts
    cnh-938  Chinese libraries and book collecting
    cnh-939  Modern Chinese literature
    cnh-940  Chinese literature after 1949
    cnh-941  Literature and censorship in China
    cnh-942  Chinese literature in translation

### Art, architecture and music — `cn-arts`

    cnh-943  Chinese art
    cnh-944  Chinese calligraphy
    cnh-945  Four Treasures of the Study
    cnh-946  Chinese painting
    cnh-947  Shan shui
    cnh-948  Chinese bird-and-flower painting
    cnh-949  Chinese figure painting
    cnh-950  The literati painter
    cnh-951  Chinese handscrolls and hanging scrolls
    cnh-952  Chinese seals and collectors' marks
    cnh-953  Chinese bronzes as art
    cnh-954  Chinese jade
    cnh-955  Chinese ceramics
    cnh-956  Celadon
    cnh-957  Blue and white pottery
    cnh-958  Jingdezhen
    cnh-959  Chinese lacquerware
    cnh-960  Chinese embroidery
    cnh-961  Chinese furniture
    cnh-962  Chinese architecture
    cnh-963  Dougong
    cnh-964  Chinese pagoda
    cnh-965  Chinese garden
    cnh-966  Chinese tombs and their art
    cnh-967  Chinese music
    cnh-968  Chinese musical instruments
    cnh-969  Guqin
    cnh-970  Chinese opera
    cnh-971  Peking opera
    cnh-972  Cinema of China

### Science, technology and medicine — `cn-science`

    cnh-973  Science and technology in China
    cnh-974  The Needham question
    cnh-975  Papermaking
    cnh-976  Woodblock printing
    cnh-977  Movable type in China
    cnh-978  Gunpowder
    cnh-979  Early Chinese firearms
    cnh-980  Compass
    cnh-981  Chinese navigation
    cnh-982  Chinese astronomy
    cnh-983  The Chinese astronomical bureau
    cnh-984  Chinese records of comets and supernovae
    cnh-985  Chinese calendrical science
    cnh-986  Chinese mathematics
    cnh-987  The Nine Chapters on the Mathematical Art
    cnh-988  Chinese algebra
    cnh-989  Chinese engineering
    cnh-990  Chinese bridges
    cnh-991  Chinese hydraulic engineering
    cnh-992  Dujiangyan
    cnh-993  Chinese cast iron
    cnh-994  Chinese textile machinery
    cnh-995  Chinese agricultural treatises
    cnh-996  Traditional Chinese medicine
    cnh-997  Acupuncture
    cnh-998  Chinese materia medica
    cnh-999  Chinese medical classics
    cnh-1000 Science in modern China
