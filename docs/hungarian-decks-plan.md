# The Hungarian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Hungarian deck in `decks/`.** It is the plan for a
Hungarian set built in the Greek decks' shape (`docs/greek-decks-plan.md`, whose pipeline `.claude/hungarian/`
adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there applies here unless
this file says otherwise. Asked for on 2026-11-09: "Add a Hungarian language collection."

**STATUS (2026-11-12): the alphabet deck and A1 to B2 are built** (`.claude/hungarian/`, §6–§9). C1 and a phrases
deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one (adding Hungarian to the day's
"collections join the Languages section" line) because it also changed the APP — the shelf's hue in `app.js`.

## 1. The decisions (2026-11-09, taken from the Greek and Hindi precedent — the owner was not asked)

The request named no levels, so the session followed the last "Add a … language collection" requests. **Any of
these is the owner's to overrule.**

1. **Word source: CEFR A1–C1, assembled.** Hungarian has examinations accredited to the CEFR (the ECL, the Origó
   and university ITK exams), but no graded word list for any of them is known to be published, so the decks do
   not claim to be any exam's vocabulary. (No new search was run for one this session; the Greek finding was
   taken as the pattern. One search was run before A2, on 2026-11-12, and found none: the A2 "szólista"
   pages it turned up are English words for Hungarian speakers.) Each level is a hand-written topic inventory
   (`inventory.py`) scoped to the CEFR global descriptor, topped up with the commonest remaining lemmas; the
   description says so. Sizes, Hindi's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
2. **An alphabet deck, first** in the collection — of SOUNDS rather than shapes, the script being Latin.
3. **No romanisation** (the script is Latin); **verbs by their third person singular present**, the form
   Hungarian dictionaries and Wiktionary list (`eszik` "eats"), with the infinitive among the forms.

| deck | file | notes |
|---|---|---|
| Hungarian Alphabet — built | `Hungarian-Alphabet.folio-deck.json` | 46 |
| Hungarian A1 Beginner — built | `Hungarian-A1.folio-deck.json` | 500 |
| Hungarian A2 Elementary — built | `Hungarian-A2.folio-deck.json` | 750 |
| Hungarian B1 Intermediate — built | `Hungarian-B1.folio-deck.json` | 1,000 |
| Hungarian B2 Upper Intermediate — built | `Hungarian-B2.folio-deck.json` | 1,500 |
| Hungarian C1 Advanced | `Hungarian-C1.folio-deck.json` | 1,500 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, forms | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Hungarian.jsonl`, 590 MB) | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `hu_full.txt` (3.15 million forms) | CC BY-SA 4.0 |
| example sentences | Tatoeba `hun` exports (170,194 Hungarian–English pairs after the swear filter) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 12 million, Wikipedia's infobox (2021–2023), read 2026-11-09 | — |

## 3. The card

One note, two templates (Hungarian → English, English → Hungarian), `speechLang: 'hu-HU'`. Fields: `Hungarian`
(the headword), `Word` (the same, what the checks key on), `Say`, `English` (meanings by part of speech; a
bracketed DEFINITION over 40 characters is cut, `shorten`), `Forms` (a noun's plural, accusative and "his/her"
form; an adjective's comparative and plural; a verb's "I" form, past and infinitive; a pronoun's accusative),
`Table` (behind a fold: a verb's present indefinite and definite, past indefinite and definite, conditional and
imperative by person; a noun's seventeen cases in both numbers and its possessive; a pronoun's cases),
`Examples` (up to three Tatoeba sentences, the word in bold). The CSS is Greek's, less the romanisation rules.

## 4. What Hungarian needs that no earlier set did — the findings

- **THE VERB TABLES' PERSON TAGS ARE SHIFTED BY ONE ROW** in the kaikki extraction (`látok` "I see" tagged second
  person, `lát` first person plural; the conditional and subjunctive carry no mood tag; the definite slot of an
  intransitive verb holds the text "intransitive verb"), the fault Turkish found. `hu.verb_table` reads the
  cells by POSITION — formal rows dropped (each repeats the plain row after it), "X or" / "or X" merged into one
  cell — and checks each block's shape: the present's third person must be the headword, the past's end in -t,
  the conditional's first person be the infinitive's stem + -nék (the first -nék in `megy`'s table is the
  archaic past `menék`), the subjunctive's third end in -n. A failing block is left out, never shown wrong:
  over 4,135 conjugated verbs, 42 lose their table and a handful one block. A template tagged properly (`van`) is
  read by tag.
- **THE SUBTITLES' Õ AND Û.** 1.9 million of the frequency list's 3.15 million lines were typed in a Latin-1
  encoding with no ő or ű (`nõ` beside `nő`); `hu.fold` maps õ/ô → ő and û → ű, keeping every other accent
  (`kor` "age" and `kór` "disease" stay apart).
- **ONE HEADWORD, TWO WORDS.** `fog` (tooth; to hold, will), `vár` (castle; to wait), `áll` (chin; to stand), `ér`
  (vein; to reach, be worth), `fél` (half; to fear), `hét` (seven; week), `mi` (we; what): `build_deck.ETYMS`
  names which etymologies a card shows, and the examples' ambiguity test counts an ETYMOLOGY, not a lemma, as an
  owner of a form.
- **EXAMPLES ARE CHOSEN AGAINST AMBIGUITY.** A sentence whose matched words belong to one word only, or whose
  English uses one of the card's glosses, comes first (`ért` had been dealt "the snow reached the knees", the
  past of `ér`; `követ` "the ambassador demands stone"). A capitalised word inside a sentence (`Korán`, the
  Quran) and a case ending after a hyphen (`2:30-kor`) are not tokens. A sentence with a swear word is never used
  (`SWEAR`; two had been dealt for `falu` and `hely`).
- **A FORM FILED AS ITS OWN WORD** (`volt`, `volna`, `amit`, `nézd`, `kérlek`, `vége`, `őt`, `szerinte`) is taught on
  the card whose table shows it (`select.EXCLUDE`). An inventory word whose spelling is also another lemma's form
  (`kérem` "please", `kér`'s "I ask for it") is dealt by its own spelling's count.
- **WRITTEN GLOSSES** (`build_deck.GLOSS`, each with its reason): `meg` (the perfective prefix, which Wiktionary
  files only as "and"), `fog` ("will" — Wiktionary's own conjugation tables give the future as "the infinitive
  plus the conjugated auxiliary verb fog"), `jobb` ("better", Wiktionary's form-of sense), `tart` and `ér` (whose
  senses are definitions).
- **AN ALTERNATIVE SPELLING** (`gyerek`, filed under `gyermek`) prints its own spelling and the target's meanings,
  and NO forms — the target's (`gyermekek`) are not its own.

**Known, left.** The fill carries the subtitles' crime-drama vocabulary (`megöl`, `öl`, `fegyver`) on frequency, as
every subtitle-ordered deck does. The personal forms of `ő` that Wiktionary files as words (`neki`, `vele`, `rá`,
`róla`, `benne`) are kept: they are words a beginner meets as such. Adjectives carry no table.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 to C1, one level per session: write the
level's inventory into `inventory.py` and its `SCOPE` into `hungarian_level.py`, run, read every card.
**Phase 3** — a phrases deck (`phrase` / `proverb` entries and multi-word lemmas).

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/hungarian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/hungarian-cache/` (gitignored, ~800 MB);
`python3 .claude/hungarian/alphabet.py` writes the alphabet deck (checks its example words against `lex.json`).
`node .claude/hungarian/check-hungarian.js` is the check. **A re-run is byte-identical** (verified for both decks,
with `--re-extract`). A1: 500 notes, 328 from the inventory and 172 by frequency; three sentences for all 500.
The alphabet: 46 notes — the 44 letters in Hungarian order with their names (nine of them written with two or
three characters), then the stress and the doubled consonant; every sound side unique (asserted). The shelf's hue
is measured: `#14659F`, a steel blue, 16.9 from its nearest neighbours (Ancient Greece and French) against all 65
other hues on the page (re-swept at the merge with seventeen new languages on the shelf).

## 7. As built (2026-11-12): A2

Asked for on 2026-11-12: "Add Hungarian A2." `python3 .claude/hungarian/run.py --level a2`: 750 notes, 454 from
the inventory (`inventory.A2`, fifteen topics after the Romanian A2's) and 296 by frequency; sentences for 748, three
apiece for 743. The scope is the CEFR A2 global descriptor (`SCOPE['a2']`). A re-run is byte-identical, and A1
rebuilt on the same day's sources is byte-identical to the shipped file. What reading the cards changed:

- **FORMS WHOSE EVERY SENSE IS A POINTER came out with NO English** (`neve`, `élete`, `életem`, `keze`, `része`,
  `feje`, `apám`, `szeretlek`): the A2 fill reaches the possessed forms of A1 nouns. Excluded, with the
  accusatives, imperatives and other forms of words already taught (`mit`, `egyet`, `annak`, `arról`, `állj`, `nézze`,
  `vigyázz`, `köszönjük`), `emlékezik` (the same verb as A1's `emlékszik`) and `gyermek` (A1's `gyerek`).
- **A SUBTITLE COUNT FOR A SENSE WIKTIONARY DOES NOT GIVE**: `halló` (the telephone "hello?", glossed "auditory"),
  `bocs` ("sorry", glossed "bear cub"), `tőlem` ("from me", glossed "for all I care"), `frank` (the name Frank,
  glossed "Frankish"). Excluded; `bocsi` "sorry" is dealt instead. Two curses (`francba`, `fenébe`) were excluded.
- **`sír`** shows "to cry" before "grave" (`ETYMS`). `repülő` (filed as a participle, no English) became
  `repülőgép`; `foglalás` (glossed only "distraint") and the duplicates `kilogramm` and `bicikli` were dropped.
- **The description said "for a beginner" at every level**; it now names the level's learner (`FOR`, Romanian's).

**Known, left.** `kirándulás` lists Wiktionary's "sprain" before "excursion". The fill again carries the subtitles'
crime-drama words (`gyilkos`, `börtön`, `nyomozó`).

## 8. As built (2026-11-12): B1

Asked for on 2026-11-12: "Add B1." `python3 .claude/hungarian/run.py --level b1`: 1,000 notes, 426 from the
inventory (`inventory.B1`, fifteen topics after the Hindi B1's: work and the economy, education, media and
technology, government and law, the environment, health, transport, the household, relationships, feelings,
religion and festivals, ideas and plans, connectors, describing, the verbs of thinking and changing) and 574 by
frequency; sentences for 983, three apiece for 937. A re-run is byte-identical. What the level needed:

- **VERBAL NOUNS.** Wiktionary files most -ás/-és nouns as "verbal noun of lop: stealing, theft", tagged as a form,
  so the extraction had dropped them (`lopás`, `fűtés`, `javítás` were "not in Wiktionary"). `extract.py` now keeps
  the meaning after the pointer (`verbal_noun_gloss`, three wordings) for a noun with no other sense: 132 lemmas,
  flagged `vn` and added AFTER the frequency count, so no other lemma's count moves. `select.py` deals them from
  B1 up only; A1 and A2 do not change. None reached B1's frequency cutoff; four are in the inventory.
- **POINTERS UNTAGGED AS FORMS** gave 49 cards with no English: possessives and object forms glossed by their
  grammar ("first-person singular single-possession possessive of anya", `fia`, `lánya`, `látlak`) and "synonym of X"
  (`bennünket`, `repülő`). `select.usable` judges a word by the etymology the card SHOWS, without such glosses
  (`szád` is "your mouth" first, "aperture" second). `check-hungarian.js` now fails a card with no meaning at all.
- **SUBTITLE COUNTS FOR ANOTHER WORD** (`select.EXCLUDE`): `henry`, `bob` (names), `tönk` (`tönkre`), `telt`
  (`telik`'s past), `ment` (`megy`'s past; it had been written into the inventory for "save"), and three curses.
- **SWEARING IN THE ENGLISH.** A clean Hungarian sentence can be translated with an obscenity ("Mi az ördög ez?",
  "What the fuck is that?"): `examples.SWEAR_EN` refuses one, and the check reads the English. **This changed the
  sentences of four cards already shipped** (A1 `isten`; A2 `művel`, `bőr`, `udvarias`) and nothing else in either deck.
- Dropped from the inventory for their glosses: `edzés` ("tempering"), `hányás` ("verbal noun of hány"), `dugó`
  (no "traffic jam"), `válás` ("becoming"; `elválik` is "to divorce").

**Known, left.** The fill is heavier with the subtitles' crime and war vocabulary at this band (`gyilkosság`'s
neighbours `nyomozás`, `holttest`, `gyanúsított`, `őrmester`, `hadnagy`). `hülyeség` is glossed "bullshit, rubbish,
nonsense", Wiktionary's own first gloss.

## 9. As built (2026-11-12): B2

Asked for on 2026-11-12: "Add B2." `python3 .claude/hungarian/run.py --level b2`: 1,500 notes, 400 from the
inventory (`inventory.B2`, thirteen topics after the Hindi B2's: politics and administration, the law and the
courts, the economy and finance, science, technology, the environment, health and the mind, the arts and media,
history and society, argument, formal connectors, describing, the verbs of reporting and persuading — many of
its words are taught lower, so only 400 are new) and 1,100 by frequency; sentences for 1,435, three apiece for
1,305. A re-run is byte-identical. What reading the cards changed:

- **COUNTS THAT BELONG TO ANOTHER WORD** (`select.EXCLUDE`), more of them at this depth: names (`pete`, `gordon`),
  English (`go`, `house`, `la`), possessed forms of words already taught (`korom` "my age", glossed "soot"; `karom`
  "my arm", glossed "claw"), colloquial spellings (`föl`, `len`), stems (`esz`), and words glossed only by a
  pointer (`teli`, `jelenik`, `juttat`, `valamiért`); `edzés` (glossed "tempering") again.
- **`ETYMS`**: `fogoly` "prisoner" before "partridge", `szán` "to intend, to pity" before "sleigh", `bejárat`
  "entrance" before "to run in".
- **`SWEAR_EN` widened** to "cock", "dick" and "pussy" (`farok` had two such sentences). **This changed one card
  already shipped**, A2's `kislány` ("Come on, don't be a pussy!"), and nothing else in A1, A2 or B1.
- The inventory's words Wiktionary has under another headword were rewritten (`vád`, `ítél`, `perel`,
  `megveszteget`, `privatizáció`, `kihal`, `szén-dioxid`, `megőriz`, `megfontol`); the rest were dropped.

**Known, left.** `kifogás` lists "unharnessing" before "objection, excuse", `ellenállás` has only "electrical
resistance" and `írás` "script; tails" — Wiktionary's own senses. The fill carries more crime, war and fantasy
vocabulary (`túsz`, `boszorkány`, `sárkány`) and a few sexual words (`szexel`, `szeretkezik`) from the subtitles;
their sentences pass both swear filters.
