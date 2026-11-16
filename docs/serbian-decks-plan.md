# The Serbian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Serbian deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped (Ukrainian, Polish, Hindi …); `docs/lang-decks.md` is the
record of how those were built, and every rule there applies here unless this file says otherwise. Asked for on
2026-11-16: "Add a Serbian language collection."

**STATUS (2026-11-16): the alphabet deck, A1 and A2 are built** (`.claude/serbian/`, §6–§7). B1 to C1 are planned,
one level per session.

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
| Serbian B1 Intermediate | `Serbian-B1.folio-deck.json` | 1,000 |
| Serbian B2 Upper Intermediate | `Serbian-B2.folio-deck.json` | 1,500 |
| Serbian C1 Advanced | `Serbian-C1.folio-deck.json` | 1,500 |

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
