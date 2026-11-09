# The Swedish language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Swedish deck in `decks/`.** It is the plan for a
Swedish set, built in the Greek decks' shape (`docs/greek-decks-plan.md`, whose pipeline `.claude/swedish/`
adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there applies here
unless this file says otherwise. Asked for on 2026-11-09: "Add a Swedish language collection."

**STATUS (2026-11-09): A1 is built** (`.claude/swedish/`, §6). A2 to C1 and a phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one (adding Swedish to the day's
"collections join the Languages section" line) because it also changed the APP — the shelf's hue in `app.js`.

## 1. The decisions (2026-11-09, taken from the Hindi and Greek precedent — the owner was not asked)

The request named no levels, so the session followed the Hindi owner's answers, as Greek did. **Any of these
is the owner's to overrule.**

1. **Word source: CEFR A1–C1, assembled.** Swedish has examinations at these levels — Swedex (A2–B2) and
   Tisus (C1) — but neither was found to publish a word list (one web search, 2026-11-09), so the decks do
   not claim to be their vocabulary. Each level is a hand-written topic inventory (`inventory.py`) scoped to
   the CEFR global descriptor, topped up with the commonest remaining lemmas; the description says so. Sizes,
   Hindi's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
   · **A CHOICE FOR THE OWNER**: Språkbanken (University of Gothenburg) publishes CEFR-graded Swedish
     lexicons built from learner material — SVALex (receptive, from coursebooks), SweLLex (productive) and
     the Kelly list (frequency, CEFR-labelled). Graded by level, they could replace the hand inventory from
     A2 on. Their licences were NOT checked this session; Kelly's is believed to be non-commercial, which
     Folio's rules would refuse. Check each before using any.
2. **No alphabet deck.** Swedish is written in the Latin alphabet; å, ä and ö are taught by the words.
3. **No romanisation**, for the same reason.

| deck | file | notes |
|---|---|---|
| Swedish A1 Beginner — built | `Swedish-A1.folio-deck.json` | 500 |
| Swedish A2 Elementary | `Swedish-A2.folio-deck.json` | 750 |
| Swedish B1 Intermediate | `Swedish-B1.folio-deck.json` | 1,000 |
| Swedish B2 Upper Intermediate | `Swedish-B2.folio-deck.json` | 1,500 |
| Swedish C1 Advanced | `Swedish-C1.folio-deck.json` | 1,500 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Swedish.jsonl`, 360 MB) | CC BY-SA 4.0 |
| the preposition `i` (missing from that extract) | English Wiktionary, page `i/languages M to Z`, Swedish section, read 2026-11-09 | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `sv_full.txt` | CC BY-SA 4.0 |
| example sentences | Tatoeba `swe` exports (38,823 Swedish–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 9.9 million, Wikipedia's infobox (Ethnologue 25th ed., 2012–2021 figures), read 2026-11-09 | — |

## 3. The card

One note, two templates (Swedish → English, English → Swedish), `speechLang: 'sv-SE'`. Fields: `Swedish`
(the headword, **a noun with its article** — en or ett — in `.uc-art`; no article on a plural-only noun such
as `pengar`, on a month, which Wiktionary gives no table, or on a language's name, `svenska`), `Word` (the bare
lemma, what the checks key on), `Say` (what the speaker reads: article and noun), `English` (meanings by part
of speech, a noun's gender in its label — "common gender (en)", "neuter (ett)"), `Forms` (a noun's definite
singular and plural, `bilen`, `bilar`; an adjective's neuter and plural, `stort`, `stora`; a verb's present,
past and supine, `äter`, `åt`, `ätit`), `Table` (behind a fold: a verb's infinitive, present, past, supine and
imperative, its -s forms and participles; a noun's indefinite and definite in both numbers; an adjective's
endings, comparative and superlative; a personal pronoun's subject, object and possessive forms), `Examples`
(up to three Tatoeba sentences, the word in bold). The type's CSS is `.claude/swedish/card.css` (Greek's,
without the romanisation rule).

## 4. What Swedish needs that no earlier set did — the findings

- **THE FOLD KEEPS Å, Ä AND Ö** (`sv.fold`: NFC and lower case only). They are letters, not marked vowels:
  `får`/`far`, `hår`/`har`, `äta`/`åta`.
- **A PERSONAL PRONOUN'S TABLE IS EVERY PRONOUN.** Wiktionary gives `jag`, `du`, `han`, `hon`, `den`, `vi` …
  ONE shared table, so each claimed the others' counts. Such a table claims nothing, and the card shows only
  the headword's own row (`extract.pron_row`: the person, number and gender of the cell that is the headword).
- **THE FREQUENCY RULES**, Greek's adapted, each found on reading the A1 ranking: (1) a closed-class word's own
  spelling is its own — `för` "for" was split with the present of `föra` and `föra` dealt 16th — **except against
  a common verb** (one earning at least a tenth of the shared count from its other forms): given the closed
  word, `går` "yesterday" (`i går`) took 176,000 of `gå`'s uses; (2) **an -s verb owns its forms**: `finnas`,
  `hoppas`, `andas` are verbs of their own, and the active verbs list the same spellings as passives — split,
  `finnas` (`finns` is the 93rd commonest form) was dealt at a count of 13; (3) a form-of entry's pointer claims
  only a spelling no table lists; (4) a noun's headword is its own against an adjective's cell, and a plural-only
  noun's against another noun's (`pengar` against the plural of `peng`).
- **THE FIRST TABLE ONLY.** Wiktionary sometimes adds a second, dialectal table (`barn` → `barne`, `barna`).
- **`i` IS MISSING FROM THE EXTRACT**: English Wiktionary's `i` is a mammoth page whose languages live on
  subpages, and kaikki.org carries no Swedish `i`. Its four everyday senses are written into `extract.SUPPLEMENT`
  from that subpage, with the date read.
- **`ska` IS DEALT BY `skola`'S COUNT** (`select.SAME_AS`): Wiktionary heads the modal verb `skola`, whose table
  claims `ska` and `skulle`, so `ska` by its own count would come last of A1.
- **WIKTIONARY'S "word; definition" GLOSSES** ("to have; to possess, or to have as a property; …") are cut to
  the word once they run past 55 characters, and a long "word (definition)" to the word (`gloss_text`); a noun's
  English article ("a car") is dropped, the label saying it is a noun.
- **A READING, NOT A SPELLING**: where Wiktionary's first entry is not the everyday word, the inventory names the
  part of speech (`få:verb`, not "few"; `vilja:verb`, not "will") and `select.FILL_POS` does the same for the fill
  (`tro` "to believe", `ringa` "to ring"); `ETYMS`, `LEAD`, `GLOSS` and `DROP_POS` in `build_deck.py` each carry
  their reason.
- Hand exclusions from the fill, each with its reason, in `select.EXCLUDE`; swearing in `SWEARS`.

**Known, left.** The fill carries the subtitles' crime-drama vocabulary (`döda`, `skjuta`, `polis`, `död`) on
frequency, as every subtitle-ordered deck on the shelf does. `var` "where" shares its spelling with `var` "was",
so some of its sentences may be of the verb. `min` shows the whole first-person row (jag, mig, min, mitt,
mina), which is the paradigm it belongs to. One of A1's 500 words has no Tatoeba sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline and A1. **Phase 2** — A2 to C1, one level per session: write the level's
inventory into `inventory.py` and its `SCOPE` into `swedish_level.py` (or, if the owner chooses, read a graded
lexicon — §1), run, read every card. **Phase 3** — a phrases deck (`phrase` / `proverb` entries and particle
verbs: `tycka om`, `ta hand om`).

## 6. As built (2026-11-09): A1

`python3 .claude/swedish/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/swedish-cache/` (gitignored, ~490 MB).
`node .claude/swedish/check-swedish.js` is the check. **A re-run is byte-identical** (verified, extract
included). A1: 500 notes, 359 from the inventory and 141 by frequency; three sentences for 492, none for 1.
The shelf's hue is measured: `#757839`, an olive, 16.7 from its nearest of 51 (Gateway to Global Affairs).
