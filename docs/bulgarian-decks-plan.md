# The Bulgarian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Bulgarian deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped (Ukrainian, Russian TORFL, Hindi …); `docs/lang-decks.md`
is the record of how those were built, and every rule there applies here unless this file says otherwise.
Asked for on 2026-11-16: "Add a Bulgarian language collection."

**STATUS (2026-11-16): the alphabet deck and all five levels, A1 to C1, are built** (`.claude/bulgarian/`, §6–§10).
A phrases deck is next.

Later decks under `decks/` are community content, not a change to Folio: **no changelog line and no version bump**
for them. The collection's first commit carried one line and one bump, because it also changed the APP (the
shelf's hue in `app.js`) — the Ukrainian precedent.

## 1. The decisions (2026-11-16)

The request named no word source, size or script deck, so the session took the arrangement of the nearest set,
Ukrainian (a Cyrillic Slavic language, assembled to CEFR), and the owner may overrule any of it:

1. **Word source: CEFR A1–C1, assembled.** Bulgarian as a foreign language is taught and examined on the CEFR's
   levels, but no graded word list is published that a deck could take whole, so each level is a hand-written
   topic inventory (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up with the
   commonest remaining lemmas. Each deck's description says so. Sizes, Ukrainian's: **A1 500 · A2 750 ·
   B1 1,000 · B2 1,500 · C1 1,500 notes**.
2. **A Cyrillic alphabet deck, first** — the level decks carry no transliteration.
3. **Stress marked on every headword and form, no transliteration** — the Russian and Ukrainian card.
4. **This session: plan + alphabet + A1**; later levels one per session, then a phrases deck.

| deck | file | notes |
|---|---|---|
| Bulgarian Alphabet — built | `Bulgarian-Alphabet.folio-deck.json` | 30 |
| Bulgarian A1 Beginner — built | `Bulgarian-A1.folio-deck.json` | 500 |
| Bulgarian A2 Elementary — built | `Bulgarian-A2.folio-deck.json` | 750 |
| Bulgarian B1 Intermediate — built | `Bulgarian-B1.folio-deck.json` | 1,000 |
| Bulgarian B2 Upper Intermediate — built | `Bulgarian-B2.folio-deck.json` | 1,500 |
| Bulgarian C1 Advanced — built | `Bulgarian-C1.folio-deck.json` | 1,500 |
| Bulgarian Phrases and Expressions | `Bulgarian-Phrases-and-Expressions.folio-deck.json` | — |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, aspect, stress, forms | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Bulgarian.jsonl`, 192 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `bg_full.txt` | CC BY-SA 4.0 |
| example sentences | Tatoeba `bul` exports (19,258 Bulgarian–English pairs used) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 6.8 million L1, 7.9 million total (Ethnologue 28th ed. and the 2021 census, 2019–2023), Wikipedia's infobox, read 2026-11-16 | — |

## 3. The card

One note, two templates (Bulgarian → English, English → Bulgarian), `speechLang: 'bg-BG'`. Fields: `Bulgarian` (the
stressed headword, `кни́га`), `Word` (the same without the mark, what the speaker reads), `English` (meanings by part
of speech; a noun's gender, a verb's aspect in its label), `Forms` (a noun's DEFINITE form — "the" is a suffix in
Bulgarian, `кни́гата`, the full `-ът` article of a masculine — its plural and, where it differs, the COUNT FORM used
after a number, `два гра́да`; an adjective's feminine, neuter and plural; a verb's ти form and its past, the aorist;
and the verb's ASPECT PARTNER), `Table` (behind a fold: a noun's indefinite, definite — subject and object for a
masculine — count and vocative forms; an adjective's or determiner's by gender; a verb's present, aorist and imperfect
by person, its imperative and the past participle that builds the perfect; the personal pronouns' full and short
forms), `Examples` (up to three Tatoeba sentences, the word in bold, with a speaker). The type's CSS is
`.claude/bulgarian/card.css` (Ukrainian's). **A verb's headword is its first person singular present** (`чета́`),
the Bulgarian dictionary form, since the language has no infinitive; the gloss reads "to read", as Bulgarian–English
dictionaries give it, and the description says so.

## 4. What Bulgarian needs — the findings

- **WIKTIONARY PRINTS A SECOND, PRE-1945 TABLE** (`кни́гитѣ`) after a `…-pre1945` template; every form after such a
  template is skipped (`extract.py`), and ѣ ѫ never pass `bg.is_bulgarian`.
- **Ѝ IS A WORD** (the dative clitic "her"), spelt with a grave to keep it apart from и "and": `bg.bare` keeps it as
  a word of its own and `bg.fold` compares it as и; the check allows it.
- **Ъ IS A VOWEL**, not Russian's hard sign, so the "not Bulgarian" letters are ы э ё є і ї ґ ў, the Serbian and
  Macedonian ђ ј љ њ ћ џ ѓ ќ ѕ, and the pre-1945 ѣ ѫ ѭ.
- **THE PERSONAL PRONOUNS HAVE NO TABLE** in Wiktionary, and each short form (`ме`, `го`, `ѝ`, `ги` …) is an entry of
  its own; they get written-out paradigms (`bg.PRONOUN_CASES`: nominative, accusative and dative, full and short),
  and the separate entries are cut from the fill (`select.EXCLUDE`) as forms on those cards.
- **A VERB'S TABLE HOLDS ITS VERBAL NOUN AND PARTICIPLES** (`че́тене`, `че́тен`), words a learner meets on their own;
  they are left out of the table (and its counts), except the past active participle (`чел`), which builds the perfect.
- **A PLURAL-ONLY NOUN OWNS ITS FORMS** (`extract.py`): `пари́` "money" had lost its count to `паря́` "to scald"
  (whose он-form is пари), and `хо́ра` "people" to човек, whose plural it is.
- **`NO_CLAIM`** keeps a rarer twin's table from claiming the common word's forms: `трябвам` (personal "to be
  needed") had taken nearly all of `трябва` "must", and `пара` "steam" part of `пари́`.
- **A COMPARATIVE OR A FEMININE FILED AS A FORM** keeps its sense (`extract.comparative_sense`): `по́вече` "more"
  (filed as the comparative of много) and `ко́тка` "cat" (filed as the feminine of кот — the card had opened on
  "cunning person").
- **A WEAK SENSE NEVER LEADS** (`build_deck.english`): `тъ́рся` opened on a rare "to ransack", `стру́вам` on "to
  devote". `LEAD` orders a gloss where Wiktionary's first is not the everyday one (`изгле́ждам` "to seem", `прав`
  "right, correct", `път` "road" and "time, occasion").
- **One etymology per card** (`ETYMS`): `да` is "yes" AND the particle of every subordinate verb; `ка́рам` "to drive",
  not a rare "to rebuke". `PARTNER` replaces Wiktionary's `напра́вя` / `напра́вям` with `пра́вя`.
- **The euro.** Bulgaria adopted the euro on 1 January 2026, and Wiktionary already glosses `лев` as the former
  currency, so the A1 inventory teaches `е́вро`.
- **Known, left.** The fill carries the subtitles' drama vocabulary (`бог`, `дя́вол`, `уби́я`, `мъ́ртъв`, `сър`) on
  frequency, as every subtitle-ordered deck on the shelf does. Some closed-class glosses are long (Wiktionary's
  `се`, `си`); they are the source's words.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write the
level's inventory into `inventory.py` (its `SCOPE` is already in `bulgarian_level.py`), run, read every card, extend
`select.EXCLUDE` with what the ranking shows. **Phase 3** — a phrases deck (Ukrainian's `phrases.py` is the model;
it was not copied here).

## 6. As built (2026-11-16): the alphabet and A1

`python3 .claude/bulgarian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/bulgarian-cache/` (gitignored, ~330 MB);
`python3 .claude/bulgarian/alphabet.py` writes the alphabet deck and reads nothing.
`node .claude/bulgarian/check-bulgarian.js` is the check (a word on two levels, a pointer gloss, a letter Bulgarian
lacks, a missing or doubled stress mark, a stressed speaker field, unbalanced HTML, a shared English side). **A
re-run is byte-identical** (verified). A1: 500 notes, 388 from the inventory and 112 by frequency; sentences for
488, three apiece for 471. Inventory words Wiktionary lacks as lemmas were dropped or replaced (`фамилия`, `метро`,
`всичко`, `казвам се`; `извинете` → `извиня́вам`, `боли` → `боля́`, `себе` → `се́бе си`). The alphabet: 30 letters
with their Bulgarian names (бъ, въ, гъ …; и кратко, ер голям, ер малък), the sounds for an English speaker, and the
five places a Russian reader parts company (щ, ъ, ь, е, no ы э ё). The shelf's hue is measured: `#813F8D`, a purple
14.0 from its nearest of 79 (Danish), the greens and the magenta band left out and nothing within 20 of the flag.

## 7. As built (2026-11-16): A2

`python3 .claude/bulgarian/run.py --level a2`. 750 notes: 337 from the A2 inventory (`inventory.py`: relatives and the
people around you, jobs and study, clothes, food and cooking, the rooms and furniture of a home, the town, travel,
nature and the compass, animals, health, feelings and character, free time, telling when, the higher numbers and
measures, the everyday verbs) and 413 by frequency, none taught in A1; sentences for 694, three apiece for 598. The
A2 `SCOPE` quotes the CEFR A2 global descriptor. **Wiktionary's Bulgarian is thin past the core**: 45 inventory words
have no lemma there and were dropped (`професия`, `инженер`, `заплата`, `палто`, `квартал`, `ваканция`, `екскурзия`,
`паркинг`, `Коледа`, `Великден` …); plurals and adjectives filed only under another headword were taken in that form
(`обувки` → `обувка`, `пердета` → `перде`, `слънчево` → `слънчев`, `уплашен` → `уплаша`, `изненадан` → `изненада`).
New from reading the ranking: `select.EXCLUDE` grew by fourteen — forms of the A1 possessives (`твоя`, `нашия`,
`нашите` …), `бе` (the count is the aorist of съм), lemmas whose own forms barely count (`брава` — the count is
браво; `кос` — коса; `тоалетен` — тоалетна; `поява` — появи), names (`франк` Frank, `том` Tom), an insult (`кучи`),
`рожден` (counted from рожден ден) and `окажа` (glossed only "in idioms"). `ETYMS` takes `съд` "court" before
"vessel", `чест` "honour" before "frequent" and `клас` "class", not "ear of corn"; `LEAD` orders `връзка`
"connection", `изобщо` "at all", `прекарам` "to spend (time)", `ред` "turn", `смятам` "to consider", `новина`
"piece of news", `право` "right", `продължа(вам)` "to continue", `пич` "dude". **A1 rebuilds byte-identical, and so
does A2.** Known, left: the fill keeps the subtitles' police and drama vocabulary (`убиец`, `пистолет`, `ченге`,
`детектив`) and slang (`пич`, `гадже`, `готин`), as A1 kept `дя́вол`.

## 8. As built (2026-11-16): B1

`python3 .claude/bulgarian/run.py --level b1`. 1,000 notes: 267 from the B1 inventory (work, education, the media and
technology, the environment, society and politics, law and crime, money, health and a way of life, relationships
and feelings, culture and the arts, the problems of travel, opinions and connectives, describing people and things,
the verbs of deciding and changing, the economy and science, public life) and 733 by frequency, none taught below;
sentences for 819, three apiece for 524 — Tatoeba's 19,258 Bulgarian pairs are wearing thin. The B1 `SCOPE` quotes the
CEFR B1 global descriptor. **The inventory's share is the smallest yet because Wiktionary's Bulgarian is thinnest
here**: 61 of the first draft's words have no lemma (`кариера`, `пенсия`, `заплащане`, `курс`, `новини`, `имейл`,
`околна среда`, `избори`, `стрес`, `лечение`, `катастрофа`, `може би`, `разбира се`, and most `-ирам` verbs —
`планирам`, `организирам`), so the draft was topped up with ninety words checked against the extract first, and the
missing ones taken out. `чек` ("chequer" only), `права` ("make, constitution", not "rights") and `спестявания` (a
participle) were taken out too. New from reading the ranking: `select.EXCLUDE` grew by twenty-six — names (`дон`,
`ким`, `скот`, `лос`, `док`, `мак`, `стан`, `дан`), chemical elements counted from a country (`франций` Франция,
`индий`, `калифорний`, `германий`), lemmas whose own forms barely count (`почин`, `спека`, `рея`, `гар`, `аба`,
`ахам`, `бон`), forms and variants (`обед`, `тука`, `вашия`, `неговия`), the bookish `ала`, the note `ре`, the subtitle
credits, and `страхувам` (glossed only as a pointer to страхувам се). `ETYMS` takes `накажа` "to punish" and `ранен`
"wounded" before "early"; `LEAD` orders `зарежа` "to abandon", `развивам` "to develop", `партия` "party", `образование`
"education", `свобода` "freedom"; `build_deck.english` drops a usage example Wiktionary filed as a sense (`у́мствен
бага́ж ― …`). **A1, A2 and B1 rebuild byte-identical.** Known, left: the fill carries the subtitles' military and
fantasy vocabulary (`генерал`, `сержант`, `меч`, `вещица`, `чудовище`) as the levels below do.

## 9. As built (2026-11-16): B2

`python3 .claude/bulgarian/run.py --level b2`. 1,500 notes: 220 from the B2 inventory (the economy and business, the
workplace, government, law and rights, science and technology, the environment and energy, society and its problems,
the media, education and the mind, health and medicine, culture, history and identity, the arts and reviews, attitudes
and character, the words of an argument, the verbs of change and judgement) and 1,280 by frequency, none taught below.
**The inventory was checked against the extract BEFORE it was written** (B1's lesson): of two drafts' 430 words, about
120 have no lemma in Wiktionary (`капитал`, `заместник`, `прокурор`, `депутат`, `лаборатория`, `космос`, `журналистика`,
`логика`, `талант`, `лечение`, `паметник`, `критик`, `следователно`, `критикувам`, `гарантирам` …) and about 90 were
already taught, so 221 were written. **Sentences for 721, three apiece for 272** — under half the level: Tatoeba's
Bulgarian is everyday speech and B2's words are past it, and the description gives the figures. New from reading the
ranking: `select.EXCLUDE` grew by fifty-two — names (`лин`, `брус`, `кен`, `клей`, `тара`, `тор`, `лъка`, `марс`,
`линкълн`, `форд` …), lemmas whose own forms barely count (`китя`, `опреда`, `начета` none at all; `тоба`, `логик`,
`лича`, `каля`, `нищ` — the count is нищо —, `околен` — около —, `следен`, `поли` — the plural of пола), forms (`нейния`,
`техния`, `единия`, `ела`, `таз`), pointers (`оказвам`, `съглася`, `касая`, `наранявания`), `трябвам` (its count is
трябва's, A1), hesitation noises (`ъъ`, `ъх`), swear words and a slur. `ETYMS` takes `нападам` "to attack", `целя` "to
aim", `мит` "myth", `повод` "occasion" and `лига` "league"; `LEAD` orders thirteen more (`шах` "chess", `отмяна`
"abolition", `изследвам` "to investigate", `тръба` "pipe", `волан` "steering wheel" …); `STRESS` supplies sixteen head
lines whose head and table both lack it (`терапи́я`, `конкуре́нция`, `пенсионе́р` …). **A cross-reference filed as a
sense is now dropped** ("only used in по́-по́сле", "see съ́рдя се"), and `check-bulgarian.js` fails one: that changed one
line on five cards of A1, A2 and B1 (`после`, `дълго`, `напред`, `нататък`, `сърдя`), which rebuild otherwise
byte-identical. Known, left: the fill carries the subtitles' genre vocabulary (`вампир`, `пират`, `гангстер`) and
adult words (`секс`, `презерватив`), as subtitle-ordered decks on the shelf do.

## 10. As built (2026-11-16): C1

`python3 .claude/bulgarian/run.py --level c1`. 1,500 notes: 159 from the C1 inventory (politics and the state, law,
the economy, science, philosophy and belief, language and literature, the arts, the mind and behaviour, society and
change, the land, the words of nuance, the verbs of arguing) and 1,341 by frequency, none taught below. **The
smallest inventory on the shelf, because Wiktionary's Bulgarian ends here**: of two checked drafts' ~520 words, about
170 have no lemma (`идеология`, `коалиция`, `подсъдим`, `завещание`, `методология`, `генетика`, `философ`, `естетика`,
`мотивация`, `глобализация`, `екосистема`, `донякъде`, `оспорвам`, `пренебрегвам` …) and most of the rest were taught
below. **Sentences for only 375 of the 1,500, three apiece for 83**: Tatoeba's 19,258 Bulgarian pairs are spent by
C1, and the description gives the figures. New from reading the ranking: `select.usable` now refuses a lemma whose
every gloss describes a form ("definite object … participle of …"), which several -ния entries (`очаквания`,
`обяснения`) had reached the fill with; `select.EXCLUDE` grew by forty-one — lemmas whose own forms count nothing or
next to nothing (`тесам`, `юря`, `рося`, `напека`, `смия`, `перя`, `кълн`, `бърна`), counts that are another word
(`талий` Италия, `кайра` Кайро, `нет` and `меня` Russian, `тур`, names — `ива`, `юта`, `мара`, `юда` —, brands),
letter names and calls to animals, the variant `двайсет`, pointers (`гадя`, `цапам`), an oath, a slur, and
`скалпел`, whose stress Wiktionary does not give and is not supplied from memory. `ETYMS` takes `опека`
"guardianship" before "to bake"; `LEAD` orders `хлебарка` "cockroach", `кама` "dagger", `бродя` "to roam", `пестя`
"to spare" and `изтребител` "fighter plane"; `STRESS` supplies twenty-two head lines (`катего́рия`, `перспекти́ва`,
`явле́ние` …). **All five levels rebuild byte-identical.** Known, left: some glosses are Wiktionary's oddities
(`невъзпитан` "not nurtured up", `низина` "lowness" before "lowland"), and the fill carries the subtitles' genre
vocabulary as every level does.
