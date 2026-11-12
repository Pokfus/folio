# The Ukrainian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Ukrainian deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this file
says otherwise. Asked for on 2026-11-09: "Add a Ukrainian language collection."

**STATUS (2026-11-12): the alphabet deck and all five levels, A1 to C1, are built** (`.claude/ukrainian/`, §6–§10).
A phrases deck (Phase 3) is not.

Later decks under `decks/` are community content, not a change to Folio: **no changelog line and no version bump**
for them. The collection's first commit carried one line and one bump, because it also changed the APP (the
shelf's hue in `app.js`) — the Hindi, Turkish and Russian precedent.

## 1. The decisions (2026-11-09)

The request named no word source, size or script deck, so the session took the arrangement the two nearest sets
already use, and the owner may overrule any of it:

1. **Word source: CEFR A1–C1, assembled** (the Hindi / UKBI / TORFL arrangement). Ukraine certifies proficiency in
   the state language but publishes no graded word list a deck could take whole, so each level is a hand-written
   topic inventory (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up with the commonest
   remaining lemmas. Each deck's description says so. Sizes, Hindi's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 ·
   C1 1,500 notes**.
2. **A Cyrillic alphabet deck, first** — the Russian precedent, since the level decks carry no transliteration.
3. **Stress marked on every headword and form, no transliteration** — the Russian decks' card.
4. **This session: plan + alphabet + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Ukrainian Alphabet — built | `Ukrainian-Alphabet.folio-deck.json` | 34 (33 letters and the apostrophe) |
| Ukrainian A1 Beginner — built | `Ukrainian-A1.folio-deck.json` | 500 |
| Ukrainian A2 Elementary — built | `Ukrainian-A2.folio-deck.json` | 750 |
| Ukrainian B1 Intermediate — built | `Ukrainian-B1.folio-deck.json` | 1,000 |
| Ukrainian B2 Upper Intermediate — built | `Ukrainian-B2.folio-deck.json` | 1,500 |
| Ukrainian C1 Advanced — built | `Ukrainian-C1.folio-deck.json` | 1,500 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, aspect, stress, forms | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Ukrainian.jsonl`, 320 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `uk_full.txt` (290,325 forms) | CC BY-SA 4.0 |
| example sentences | Tatoeba `ukr` exports (182,702 Ukrainian–English pairs used) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 32 million, Ethnologue 28th ed. (a 2023 figure), via Wikipedia's infobox, read 2026-11-09 | — |

## 3. The card

One note, two templates (Ukrainian → English, English → Ukrainian), `speechLang: 'uk-UA'`. Fields: `Ukrainian` (the
stressed headword, `кни́га`), `Word` (the same without the mark, what the speaker reads), `English` (meanings by part
of speech; a noun's gender, "plural only" for `гро́ші` / `две́рі`, a verb's aspect in its label), `Forms` (a noun's
genitive and plural, an adjective's feminine, neuter and plural, a verb's я / він forms and past, and the verb's
ASPECT PARTNER), `Table` (behind a fold: a noun's seven cases, an adjective's or pronoun's cases by gender, a
verb's present or future by person, past and imperative; the personal pronouns' written-out paradigms), `Examples`
(up to three Tatoeba sentences, the word in bold, with a speaker). The type's CSS is `.claude/ukrainian/card.css`
(Hindi's without the romanisation, plus `.uc-asp`).

## 4. What Ukrainian needs — the findings

- **THE SUBTITLE LIST IS PART RUSSIAN.** `что` is its 12th word, beside `ты`, `это`, `меня`. A form with a letter
  Ukrainian lacks (ы э ъ ё) is dropped at the door; a Russian word spelt with shared letters reaches only a
  Ukrainian lemma it collides with, and those are cut by hand with their reasons (`select.EXCLUDE`: `да`, `но`,
  `его` "ego", `ему` "emu", `том` "volume", `м'яти` taking `мне`, `посол` whose table holds `после`, `піт` "sweat"
  whose table holds `потом` …). Tatoeba files a few Russian sentences under `ukr`; they are skipped the same way.
- **THE APOSTROPHE** (`п'ять`, `сім'я`) is typed four ways across the sources and dropped by the subtitles
  (`пять`). `uk.fold` removes it for matching; the card prints U+02BC `ʼ`.
- **STRESS IS PRINTED, NEVER COMPARED** (`uk.bare` removes the acute by name, so `й` and `ї` survive); one-syllable
  words carry no mark. The head line's stress is the headword's; `STRESS` in `build_deck.py` supplies one Wiktionary
  lacks (`дава́йте`).
- **PERSONAL PRONOUNS SHARE ONE TABLE** in Wiktionary (`він` lists `я`, `мене́`, `ти`), so they get written-out
  paradigms (`uk.PRONOUN_CASES`).
- **A TABLE WITHOUT ITS OWN HEADWORD IS ANOTHER WORD'S**: `озимина` "winter crops" carries `мама`'s forms and
  claimed its count; such a table is dropped.
- **DIMINUTIVES ARE "FORM OF" ENTRIES** (`дідусь` "diminutive of дід"): the sense becomes "grandfather
  (affectionate)" from the entry's own gloss of the base word, rather than dropping the word.
- **ASPECT PARTNERS ARE KEPT ONLY WHEN RECIPROCAL** (`ходи́ти` → `походи́ти` "to walk about" is not its perfective);
  `PARTNER` overrides a reciprocal pair a grammar does not teach (`зна́ти` / `зазна́ти`).
- **ONE ETYMOLOGY PER CARD** (`ETYMS`): `сім'я` "family" not "seed", `ніж` "than" not "knife", `треба` "it is
  necessary" not "rite"; `ма́ти` is "to have" and "mother" on one card, both A1. Impersonal predicatives Wiktionary
  files as adjectives are labelled "predicative" (`PREDICATIVE`).
- **Known, left.** The fill carries the subtitles' drama vocabulary (`смерть`, `бог`, `чорт`, `король`, `сер`) on
  frequency, as every subtitle-ordered deck on the shelf does. `вбити` "to kill" is left out: Wiktionary's entry
  is only "to drive in".

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `ukrainian_level.py`, run, read every card, extend
`select.EXCLUDE` with what the ranking shows. **Phase 3** — a phrases deck.

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/ukrainian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/ukrainian-cache/` (gitignored, ~450 MB);
`python3 .claude/ukrainian/alphabet.py` writes the alphabet deck and reads nothing.
`node .claude/ukrainian/check-ukrainian.js` is the check (a word on two levels, a pointer gloss, a Russian-only
letter, a missing or doubled stress mark, a stressed speaker field, unbalanced HTML, a shared English side). **A
re-run is byte-identical** (verified). A1: 500 notes, 377 from the inventory and 123 by frequency; three sentences
for all 500. The shelf's hue is measured: `#9F4500`, 15.8 from its nearest of 58 (re-swept at the merge: its first sweep's `#2A8424` was Arabic's too).

## 7. As built (2026-11-12): A2

`python3 .claude/ukrainian/run.py --level a2`. 750 notes: 442 from the A2 inventory (`inventory.py`: relatives,
jobs and study, clothes, food and cooking, the home, the town, travel, nature and the compass, animals, health,
feelings, free time, time words, the higher numbers and measures, everyday verbs) and 308 by frequency, none taught
in A1; sentences for 745, three apiece for 730. The A2 `SCOPE` quotes the CEFR A2 global descriptor. Seven inventory
words Wiktionary lacks as lemmas were dropped (`ліцей`, `студентка`, `вчителька`, `перон`, `Великдень`, `Різдво`,
`пізніше`); `сором'язливий` is a pointer entry, so the inventory takes `соромливий`. New from reading the ranking:
`select.EXCLUDE` grew by fourteen (a vocative or a name taking a count — `варта`/`варто`, `боб`/Bob, `папа`; Russian
words — `муж`, `мужчина`, `дальше`, `готовити`, `явитися`, `нико`; forms with cards of their own — `зрозумів`,
`вітаю`, `побачення`), and `ENTRY_WITH` in `build_deck.py` picks one entry by its gloss where two etymologies share
a blank etymology number (`дружина` "wife", not the prince's band). **A1 rebuilds byte-identical and so does A2.**
Known, left: the fill keeps the subtitles' `чувак`, `біс`, `коп`, `наркотик`, as A1 kept `чорт`; `дружина` is
labelled "masculine or feminine", Wiktionary's own.

## 8. As built (2026-11-12): B1

`python3 .claude/ukrainian/run.py --level b1`. 1,000 notes: 391 from the B1 inventory (work and career, education,
media and technology, the environment, society and politics, law and crime, money and banking, health and a way of
life, relationships and feelings, culture and the arts, the problems of travel, opinions and connectives, describing
people and things, the verbs of deciding, changing and making) and 609 by frequency, none taught in A1 or A2;
sentences for 972, three apiece for 923. The B1 `SCOPE` quotes the CEFR B1 global descriptor; the description's
"words for …" phrase is now the table `LEARNER` in `build_deck.py`. Inventory words Wiktionary lacks as lemmas were
dropped (`випускник`, `вміння`, `розслідування`, `закоханий`, `хоча`, `незважаючи`, `незручний`, `заблукати` and
others; `інтернет` is a form-only entry); `стосунки` → `стосунок`, `речі` → `річ`; `розлучення` "divorce" is
defined only as a pointer to `розлука` "separation" and is left out. New from reading the ranking: `select.EXCLUDE`
grew by thirty-four — names or other words taking a count (`ян`, `чан`, `люк`, `майя`, `піп`), lemmas whose own forms barely count
(`карт`, `мара`, `миро`, `никнути`, `перти`), Russian words (`кофе`, `путь`, `письмо`, `куча`, `оп'ять`,
`появитися`, `попробувати`, `доказати`, `скучати`, `являтися`), у-spellings of a card already shipped (`учитель`,
`учитися`, `убивати`, `ударити`, `умирати`) and forms with cards of their own (`діти`, `заспокойся`, `поїхали`,
`чогось`, `типу`, `знов`), plus a pointer (`цінувати`), an old spelling (`вампир`) and an insult (`сучий`).
`build_deck.py` gained `ETYMS` for `тікати` ("to run away", not "to tick") and `уряд`, `ENTRY_WITH` for `стан`
("condition, state", not "torso"), `NOT_WEAK` for `уряд` (Wiktionary tags every noun sense of "government" rare, so
the untagged adverb "in succession" had won) and a `STRESS` for `стривати`. **A1, A2 and B1 rebuild byte-identical.**
Known, left: the fill keeps the subtitles' fantasy and police vocabulary (`дракон`, `меч`, `принц`, `сержант`,
`прокурор`), as the levels below do.

## 9. As built (2026-11-12): B2

`python3 .claude/ukrainian/run.py --level b2`. 1,500 notes: 347 from the B2 inventory (the economy and business, the
workplace, government, law and rights, science and technology, the environment and energy, society and its problems,
the media, education and the mind, health and medicine, culture, history and identity, the arts and reviews,
attitudes and character, the words of an argument, the verbs of change and judgement) and 1,153 by frequency, none
taught below; sentences for 1,377, three apiece for 1,191. The B2 `SCOPE` quotes the CEFR B2 global descriptor.
The inventory is the smallest share yet because B2's abstract vocabulary is where Wiktionary's Ukrainian is
thinnest: 35 inventory words have no lemma there (`спад`, `оподаткування`, `мислення`, `рецензія`, `мораль`,
`расизм`, `депортація` …, printed by `select.py`), and `становити` and `обурюватися` are pointer entries, so they
were taken out; `засоби масової інформації` was taken out beside `ЗМІ`, the two being one meaning. New from reading
the ranking: `select.EXCLUDE` grew by forty-five — lemmas whose own forms barely count (`піл`, `кайло`, `айва`,
`рея`, `забрало`, `кода`, `руда`, `літ`, `віл`, `пустий`, `заказати`, `ич`), counts that are another word (`жила`
the past of жити, `рота` the genitive of рот, the names Bill, Martin, Bond, Sonya, `францій` from Франції, `едем`
from Russian, the subtitles' own credits), Russian words (`старик`, `воздух`, `кусок`, `спорити`, `власть`,
`бизнес`, `хватати`, `судьба`, `грудь`, `дурак`, `стакан`, `строїти`), у-spellings and variants of a word shipped
(`упасти`, `украсти`, `учити`, `учора`, `установити`, `аніж`, `адрес`), forms (`силою`, `удачі`), a pointer
(`розлучення`), an old spelling (`барбар`) and a letter name (`мю`). `ETYMS` takes `ген` "gene", not a dialectal
"far away". **A1, A2, B1 and B2 rebuild byte-identical.** Known, left: the fill carries the subtitles' genre
vocabulary (`ельф`, `орк`, `вампір`, `шпигун`) and some slang (`кайф`, `фігня`, `бакс`), as the levels below do.

## 10. As built (2026-11-12): C1

`python3 .claude/ukrainian/run.py --level c1`. 1,500 notes: 274 from the C1 inventory (politics, power and the
state, law and justice, the economy and finance, science and research, philosophy and belief, language, literature
and style, the arts and taste, the mind, emotion and behaviour, society and change, the land and the planet, the
small words of nuance, the verbs of arguing and shading a meaning) and 1,226 by frequency, none taught below;
sentences for 1,216, three apiece for 920 — the thinnest level, as Tatoeba's Ukrainian is everyday speech. The C1
`SCOPE` quotes the CEFR C1 global descriptor. 52 inventory words have no lemma in Wiktionary (`консерватизм`,
`монополія`, `аудит`, `строфа`, `бароко`, `консенсус`, `ерозія` …, printed by `select.py`); `обурюватися` is a
pointer entry and was taken out. **At C1 the fill's counts are small (40–70 per lemma), so a lemma that takes its
count from another word's forms is the commonest fault**: `select.EXCLUDE` grew by forty-two — lemmas whose own forms
barely count (`ладо`, `бона`, `верзти`, `низати`, `висок` (the count is виски), `бердо`, `сура`, `нити`, `тета`,
`карат`, `гуда`, `гар`, `хала`, `сич`, `вал`, `дан`, `кар`), counts that are another word (`паша` the name, `бла` from
бла-бла, `індій` from Індії, `каліфорній` from Каліфорнії, `соль` from Russian "salt"), Russian words (`май`,
`важний`, `ловушка`, `напиток`, `дядя`, `упоминати`, `повторяти`), у- and в-spellings of a word shipped (`уміти`,
`убивця`, `уночі`, `ввійти`), a variant (`цукерок`), a form (`англійською`), pointers (`догадатися`, `пігулка`),
old spellings (`біл`, `туалета`), dialect (`се`, `нє`) and a letter name (`хі`). **All five levels rebuild
byte-identical.** Known, left: `учинок` and `укусити` are Wiktionary's own у-lemmas (their в-spellings are only
alternative forms there), and the fill carries the subtitles' slang and genre words as every level does.
