# The Serbian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Serbian deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped (Ukrainian, Polish, Hindi …); `docs/lang-decks.md` is the
record of how those were built, and every rule there applies here unless this file says otherwise. Asked for on
2026-11-16: "Add a Serbian language collection."

**STATUS (2026-11-16): COMPLETE — the alphabet deck, all five levels (A1 to C1) and the phrases deck are built**
(`.claude/serbian/`, §6–§11).

Later decks under `decks/` are community content, not a change to Folio: **no changelog line and no version bump**
for them. The collection's first commit carried one line and one bump, because it also changed the APP (the
shelf's hue in `app.js`) — the Ukrainian and Lao precedent.

## 1. The decisions (2026-11-16)

The request named no word source, size or script, so the session took the arrangement the nearest set
(Ukrainian, Slavic and Cyrillic) uses, and the owner may overrule any of it:

1. **Word source: CEFR A1–C1, assembled** (the Ukrainian / Polish / Hindi arrangement). No graded Serbian word
   list a deck could take whole was found, so each level is a hand-written topic inventory (`inventory.py`)
   scoped to the CEFR global descriptor for its band, topped up with the commonest remaining lemmas. Each deck's
   description says so. Sizes, Ukrainian's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
2. **Both alphabets.** Serbian is officially Cyrillic and is read in Latin every day; the two map letter for
   letter. **The card leads with Cyrillic and prints the Latin beneath the headword and under every sentence.**
   Forms and tables are Cyrillic only.
3. **The accent marked on the headword**, as Wiktionary writes it (`ку̏ћа`, `вре́ме`, `ле̑п`): the four tonal
   accents and the post-accent length mark. The Russian / Ukrainian decks mark stress; Serbian's is pitch and
   length as well, and only a dictionary shows it. Forms, tables and the speaker field carry no marks.
4. **Ekavian, the standard of Serbia** (`млеко`, not `млијеко`). An Ijekavian lemma is not carded; a sense
   Wiktionary marks as used only in Croatia, Bosnia or Montenegro, or as dialect, never opens a card.
5. **An alphabet deck first**: the 30 letters with their Latin twins, then the accent marks and the syllabic r.
6. **This session: plan + alphabet + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Serbian Alphabet — built | `Serbian-Alphabet.folio-deck.json` | 36 (30 letters, 5 marks, syllabic r) |
| Serbian A1 Beginner — built | `Serbian-A1.folio-deck.json` | 500 |
| Serbian A2 Elementary — built | `Serbian-A2.folio-deck.json` | 750 |
| Serbian B1 Intermediate — built | `Serbian-B1.folio-deck.json` | 1,000 |
| Serbian B2 Upper Intermediate — built | `Serbian-B2.folio-deck.json` | 1,500 |
| Serbian C1 Advanced — built | `Serbian-C1.folio-deck.json` | 1,500 |
| Serbian Phrases and Expressions — built | `Serbian-Phrases-and-Expressions.folio-deck.json` | 88 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, aspect, accents, forms | English Wiktionary's Serbo-Croatian via kaikki.org (`kaikki.org-dictionary-SerboCroatian.jsonl`, 386 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `sr_full.txt` | CC BY-SA 4.0 |
| example sentences | Tatoeba `srp` exports (21,804 Cyrillic Serbian–English pairs used) | CC BY 2.0 FR |
| letters, sounds, accents (alphabet deck) | Wikipedia, "Serbian Cyrillic alphabet" (oldid 1380570209) and "Serbo-Croatian phonology" (oldid 1384903020) | CC BY-SA 4.0 |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 8.2 million, Ethnologue 28th ed. (2022–23), via Wikipedia's infobox (oldid 1385821387), read 2026-11-16; no L2 figure | — |

## 3. The card

One note, two templates (Serbian → English, English → Serbian), `speechLang: 'sr-RS'`. Fields: `Word` (the
Cyrillic headword without marks — what the speaker reads, and the field `dedupe-glosses.py` names a sibling by),
`Serbian` (the same with Wiktionary's accent), `Latin` (Gaj's Latin), `English` (meanings by part of speech; a
noun's gender or "plural only", a verb's aspect, "(with се)" on a sense Wiktionary tags reflexive), `Forms` (a
noun's genitive and plural, an adjective's feminine, neuter and plural, a verb's ја / он present and past
participle), `Table` (behind a fold: a noun's seven cases by number, an adjective's by gender, a verb's present,
future, past participle and imperative; the personal pronouns' written-out paradigms), `Examples` (up to three
Tatoeba sentences in Cyrillic, the word in bold, the Latin beneath, with a speaker). The type's CSS is
`.claude/serbian/card.css` (Ukrainian's, the aspect line out, `.uc-lat` and `.uc-exl` in). **No aspect partner**:
Wiktionary's Serbo-Croatian entries do not name one.

## 4. What Serbian needs — the findings

- **EVERY WORD IS FILED TWICE**, a Latin entry and a Cyrillic one. The Latin entry is the lemma; it names its
  accented Cyrillic spelling (a form tagged `Cyrillic`), which the card prints. Everything is compared through
  `sr.fold` (Latin, no marks, lower case): Cyrillic to Latin is exact. **The Latin `i` "and" is missing from the
  extraction** (its page is shared by every language), so a Cyrillic entry stands in where its Latin one is absent.
- **THE ACCENT MARKS ARE STRIPPED BY NAME** (`sr.bare`): the acute of ć decomposes to c + U+0301, so a pass that
  strips every combining mark would print `cao` for `ћао`. The acute is kept on c and nowhere else.
- **SERBO-CROATIAN, NOT SERBIAN.** A sense carries the countries it is used in; `kruh` "bread" is Croatia's,
  `kafa` "coffee" is "regional, Serbia" — so a sense is weak when it names countries none of which is Serbia, or
  is regional without Serbia, or is dialect (Kajkavian, Chakavian, Torlakian, Ikavian) or Ijekavian.
- **AN IJEKAVIAN LEMMA NAMES ITS EKAVIAN PARTNER** (`vrijeme` lists `vreme` as "alternative, Ekavian"); it is not
  kept, and the subtitle counts of its forms go to the partner. But an Ekavian entry may list an Ekavian variant too
  (`deda` lists `ded`), so an entry marked Ekavian is never taken for an Ijekavian one. Tatoeba sentences holding an
  Ijekavian form are not used.
- **THE PERSONS ARE NOT TAGGED.** The extraction tags only the third person and the number of a present tense, so
  the six cells are read in the table's order, a person's variants split in half (`знам, знадем`). Two tables break
  that and are written out (`build_deck.PRESENT`): `biti` interleaves the emphatic `jesam` and the perfective
  `budem`, `videti` adds an archaic `viđu`. The future keeps the one-word Serbian spelling (`радићу`, never
  `radit ću`); the past participle is filed under an unrecognised tag and re-tagged.
- **HOMOGRAPHS THE FILL MISREAD** (`ETYMS`, `select.EXCLUDE`): `svet` "world" not "holy", `po` and `pod` the
  prepositions, `postajati` "to become"; `treba` "girl" and `kada` "bathtub" take the counts of "it is needed" and
  "when"; pronoun forms with entries of their own (`me`, `ga`, `njega`, `tobom`) are left to the pronoun cards; `s`
  and `sad` are the short forms of `sa` and `sada`.
- **USAGE NOTES AS GLOSSES** ("Used to connect a noun to an adjective …", "Placed at the beginning …") are dropped
  where the entry has a meaning beside them; a preposition's "answering the question gdjȅ/gdȅ" and a cross-reference
  in accented Latin ("(= nàprema)", "(see also vȅć)") are cut from the gloss.
- **A SPELLING FILED AS ANOTHER WORD'S ALTERNATIVE** (`ćerka` → `kćerka` → `kći`) takes that word's meanings, never
  its forms (kći declines kćeri, ćerka ćerke).
- **Known, left.** The fill carries the subtitles' drama vocabulary (`ubiti`, `mrtav`, `bog`, `policija`) on
  frequency, as every subtitle-ordered deck on the shelf does. `mal` "small" is Wiktionary's lemma (the everyday
  `мали` is its definite form); `sneg` lists "sine" among its senses, Wiktionary's own. 18 of A1's words have no
  sentence (mostly the months and days).

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write the
level's inventory into `inventory.py` (`serbian_level.SCOPE` already quotes every band), run, read every card,
extend `select.EXCLUDE` with what the ranking shows. **Phase 3** — a phrases deck.

The shelf's hue is measured: swept in CIELAB inside the shelf's band for the point farthest from the 79 hues on
the page, the magenta band refused — `#1C4C0E`, a deep forest green, 15.0 from its nearest (Geography's olive).

## 6. As built (2026-11-16): the alphabet and A1

`python3 .claude/serbian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/serbian-cache/` (gitignored, ~460 MB);
`python3 .claude/serbian/alphabet.py` writes the alphabet deck and reads nothing.
`node .claude/serbian/check-serbian.js` is the check (a word on two levels, a pointer gloss, a speaker field that is
not Serbian Cyrillic or carries a mark, a Latin field that is not the Cyrillic letter for letter, an accented head
that is not the speaker field with marks, a Latin letter in the forms, unbalanced HTML, a shared English side).
**A re-run is byte-identical** (verified, extraction included). A1: 500 notes, 363 from the inventory and 137 by
frequency; sentences for 482, three apiece for 457.

## 7. As built (2026-11-16): A2

`python3 .claude/serbian/run.py --level a2`. 750 notes: 389 from the A2 inventory (`inventory.py`: relatives, jobs
and study, clothes, food and cooking, the home, the town, travel, nature and the compass, animals, health, feelings,
free time and sport, time words, the higher numbers and measures, everyday verbs) and 361 by frequency, none taught
in A1; sentences for 662, three apiece for 538. Inventory words Wiktionary lacks as lemmas were dropped (`bratanac`,
`verenica`, `programer`, `pavlaka`, `stepenice`, `parking`, `supermarket`, `peron`, `kašnjenje`, `Božić` and `Uskrs`
(filed as names), `ranije`, `odložiti` …); `šolja`, `tiganj`, `šporet` and `kirija` are tagged only "regional" there
and `plesati` "Croatia", so they are out by the rule of §4; `prodavac` → `prodavač`, `dvesta` → `dvesto`, `stepenice` →
`stepenište`.

**New: THE ASPECT PARTNERS.** Wiktionary gives most derived imperfectives no senses of their own — `bacati` is only
"imperfective form of báciti", `vraćati` "imperfective form of vrátiti" — so the extraction dropped them as forms.
They are now kept (`extract.py`, `aspectual`): their meanings are the partner verb's, their count the forms of their
own table no other lemma claims, and the card's forms line names the partner (`perfective бацити`), the one aspect
pair the source does state. They are added AFTER the counts are split, so no other lemma's frequency moves, and
`select.py` keeps them off A1 — **A1 rebuilds byte-identical**, and so does A2.

New from reading the ranking: `select.EXCLUDE` grew by sixteen — pronoun forms (`čega`, `kome`, `sama`), Croatian
words (`nitko`, `ured`, `cura`), lemmas whose count is another word's (`bok` the Croatian "hi", `kim` the name, `vesti`
"news", `bit` from bit će, `ran`, `kos`, `vod`, `prav`, `no`) and a variant (`ded`). `ETYMS` takes `rad` "work",
`halo` "hello" and `tuš` "shower"; `LEAD` puts the everyday sense first where Wiktionary's first is rarer (`pismo`
"letter" not "alphabet", `semafor` "traffic light", `pečurka` "mushroom", `predsednik` "president" …); `čim` drops
its pronoun sense. Known, left: the fill carries the subtitles' crime-drama words (`ubica`, `pištolj`, `zločin`,
`detektiv`) as every subtitle-ordered level does; `glupost` lists "one's stuff" among its senses, Wiktionary's own.

## 8. As built (2026-11-16): B1

`python3 .claude/serbian/run.py --level b1`. 1,000 notes: 231 from the B1 inventory (work and a career, education,
the media and technology, the environment, society and politics, law and crime, money and banking, health and a way
of life, relationships and feelings, culture and the arts, the problems of travel, opinions and connectives,
describing people and things, the verbs of deciding, changing and making) and 769 by frequency, none taught in A1 or
A2; sentences for 801, three apiece for 536. The share from the inventory is small because B1's abstract words are
where Wiktionary's Serbian is thinnest, and because A1 and A2's fill had already taken many of them (`posao`,
`problem`, `zakon`, `sud`). Inventory words Wiktionary lacks as lemmas were dropped (`zagađenje`, `reciklaža`,
`bankomat`, `pušenje`, `usamljenost`, `prenoćište`, `pogoršati` …); `projekat` → `projekt`, `studije` → `studija`,
`mejl` → `imejl`, `osećanje` → `osećaj`, `reditelj` → `režiser`.

New from reading the ranking: `select.EXCLUDE` grew by twenty-six — pronoun forms (`kog`, `čime`), Croatian words
(`zrak`, `kava`, `doma`, `vani`, `kamo`, `ponovno`, `shvaćati`), a Torlakian `toj`, lemmas whose count is another
word's (`kuca` "knocks", `celiti` from cela, `videlo` the participle, `goriv` from gori, `viti`, the names Bob, Paul,
Scott, the Los of Los Angeles, English "go" and "top", and `zena` and `bas`, which are žena and baš typed without their
caron), an abbreviation (`gđa`) and `crnac`, now widely felt as offensive. `ETYMS` takes `spasti` "to save", `desni`
"right" and `izvesti` "to carry out" before "to export"; `LEAD` puts `gomila` "pile, heap", `savet` "advice",
`kukavica` "coward", `pamet` "mind" and `obratiti` "to approach" first. **A1, A2 and B1 rebuild byte-identical.**
Known, left: the fill carries the subtitles' crime, war and fantasy words (`metak`, `pukovnik`, `veštica`, `zmaj`) and
some slang (`kapirati`, `pandur`, `mator`), as the levels below do; `kći` "daughter" is a card here although A1's
`ćerka` borrows its meaning, the two being different words.

## 9. As built (2026-11-16): B2

`python3 .claude/serbian/run.py --level b2`. 1,500 notes: 184 from the B2 inventory (the economy and business, the
workplace, government, law and rights, science and technology, the environment and energy, society and its problems,
the media, education and the mind, health and medicine, culture, history and identity, the arts, attitudes and
character, the words of an argument, the verbs of change and judgement) and 1,316 by frequency, none taught below;
sentences for 805, three apiece for 366 — Tatoeba's Serbian is everyday speech and thins out here. The inventory share
is the smallest yet, as Ukrainian's B2 was: about forty inventory words have no lemma in Wiktionary's Serbo-Croatian
(`preduzetnik`, `birokratija`, `laboratorija`, `zemljotres` is regional-only, `hirurg`, `slikarstvo`, `recenzija`,
`kritikovati` …, printed by `select.py`); `diplomatija` → `diplomacija`, `dijalekt` → `dijalekat`, `digitalan` →
`digitalni`, `saradnik` → `saradnja`.

**At B2 the fill's counts are small (6,000–9,000 per lemma), so a lemma that takes its count from another word is the
commonest fault**: `select.EXCLUDE` grew by forty-eight — names (Liz, Chris, Han, Rosa, Lisa, Dina, Rika, Bruce,
Norman, Ren, Ada, Santa, Tara, Cal), English words in the subtitles ("but", "class"), lemmas whose own spelling counts
a sliver of their total (`odel` from odelo, `buk` from buka, `tat` from tata, `veriti`, `tkati`, `kinuti`, `meden`),
plural or participle forms of another word (`minuti` "minutes", `uzet`, `hiljadu`, `dušica` from dušo), Croatian words
(`cesta`, `mobitel`, `stroj`, `ovisiti`, `riskirati`, `pogreška`, `itko`, `pozornik`, and `kolovoz`, whose count is the
Croatian "August"), an Ijekavian `vijesti` and `nevjerojatno`, Greek letters, abbreviations and variants (`juli`,
`sena`), and one crude word. `ETYMS` takes `žica` "wire"; `LEAD` puts `junak` "hero", `nastup` "appearance",
`preterati` / `preterivati` "to exaggerate" and `prostitutka` "prostitute" first. **A1 to B2 rebuild byte-identical.**
Known, left: the fill carries the subtitles' crime, war and fantasy words (`municija`, `pucnjava`, `čarobnjak`,
`zmaj`) and some slang (`ćale`, `keš`, `frajer`), as every level does.

## 10. As built (2026-11-16): C1

`python3 .claude/serbian/run.py --level c1`. 1,500 notes: 120 from the C1 inventory (politics, power and the state,
law and justice, the economy and finance, science and research, philosophy and belief, language, literature and
style, the arts and taste, the mind and emotion, society and change, the land and the planet, the small words of
nuance, the verbs of arguing and shading a meaning) and 1,380 by frequency, none taught below; sentences for 532, three apiece for 164 — the thinnest level, as
Tatoeba's Serbian is everyday speech. The inventory share is
the smallest of the five because C1's abstract and learned words are where Wiktionary's Serbo-Croatian is thinnest:
about forty have no lemma there (`legitimitet`, `uredba`, `parnica`, `subvencija`, `zaplet`, `satira`, `poluostrvo`,
`fauna`, `precizirati`, `umanjiti` …, printed by `select.py`).

**At C1 the fill's counts are a few thousand per lemma, so the faults of B2 come in greater number**: `select.EXCLUDE`
grew by sixty-five — Croatian words (`obiteljski`, `scenarij`, `krivnja`, `navečer`, `postaja`, `isprika`, `utrka`,
`dućan`, `zločest`, `kaniti`, `izvešće`, `div`, `stupanj`, `Židov`, `skupina`, `kut`, `umak`, `tulum`, `komu`, `kabel`,
`hladnjak`, `užitak`, `proračun`, `pozornost`, `golem`, `natecanje`, and `zahod`, whose count is the Croatian
"toilet"), an Ijekavian `bijeg`, names (Khan, Pat, Thor, Cindy, Pasha, Amber, Texas), English words in the subtitles
("as", "at", "got", "hot", "final", "lane", "K"), lemmas counted from another word's forms (`mora` "must", `prima`
"receives", `poznati` the adjective, `beliti` and `beleti` from beli, `siriti` from sir, `svesti` the genitive of svest,
`leniti`, `platac`, `trak`, `tak`, `tel`), the subtitle files' own credit word `titl`, a variant (`orman`), a pronoun
form (`kime`) and a crude word. `ETYMS` takes `konac` "thread" over a bookish "end"; `LEAD` puts `tečnost` "liquid",
`šah` "chess", `prilog` "contribution", `nastavak` "continuation", `kasa` "cash register", `dužina` "length" and
`snalaziti` "to get by" first. **All five levels rebuild byte-identical.**

## 11. As built (2026-11-16): the phrases deck

`python3 .claude/serbian/run.py --level phr` runs `phrases.py` in place of `select.py` (Ukrainian's stage re-keyed).
88 expressions in three subdecks, the Indonesian, Turkish, Hindi and Ukrainian arrangement (`docs/lang-decks.md`,
"THE PHRASES DECK"): **35 Phrases** (Wiktionary's multi-word phrases and interjections not tagged idiomatic — `како
си`, `у потпуности`, `ако Бог да`, the birthday, New Year and Christmas wishes and the Orthodox festival greetings with
their replies, `Христос се роди` — `ваистину се роди`, `Христос васкрсе` — `ваистину васкрсе`), **37 Idioms** (a sense
tagged idiomatic — `бабе и жабе`, `кад на врби роди грожђе`, `открити топлу воду`) and **16 Proverbs** (`ко рано рани
две среће граби`, `ми о вуку, а вук на врата`). Nothing a level teaches is repeated (`лаку ноћ`, `добар дан` are A1's).
Ordered by Tatoeba occurrences, then frequency; 25 occur in a Tatoeba sentence, 23 carry sentences, 4 three.

**The deck is small because the source is**: English Wiktionary's Serbo-Croatian holds under a hundred and fifty
multi-word phrases and proverbs in Latin script, far fewer than its Ukrainian; nothing is added from outside it.

**Findings:** `examples.phrase_parts` matches an expression's verb (`-ti`, `-ći`) in any of its forms, for this deck
only; `examples.LITERAL` skips sentences that use the words literally (`Како сте дошли до школе?` for "how are you?",
`Како се зове ова игра?` for the filler "what's-it-called", a joke built on `не волим те`). Excluded, each with its
reason in `phrases.EXCLUDE` (19): Ijekavian or Croatian forms (`sretan put`, `ljubav je slijepa`, `dvije muhe`,
`namjerama`), the same expression twice (the imperfectives `otkrivati` / `izmišljati toplu vodu`, the half `mi o
vuku`, `ja te volim`), phrasebook sentences (`imam pitanje`, `trebam taksi`), a compound noun (`muškatni oraščić`),
religious invocations (the Hindi and Ukrainian rule; the festival greetings stay) and a crude proverb. **A re-run is
byte-identical, and all five levels rebuild byte-identical with the changed stages.**

**Known, left.** Some idioms open on Wiktionary's literal gloss before the figurative one (`капу кројити` "to sew a
hat", `мирна Босна` "peaceful Bosnia"), as the source writes them; `jesti komu iz ruke` keeps Wiktionary's `komu`.
