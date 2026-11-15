# The Norwegian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Norwegian deck in `decks/`.** It is the plan for a
Norwegian (Bokmål) set, built in the Swedish decks' shape (`docs/swedish-decks-plan.md`, whose pipeline
`.claude/norwegian/` adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there
applies here unless this file says otherwise. Asked for on 2026-11-15: "Add a Norwegian language collection."

**STATUS (2026-11-15): A1 is built** (`.claude/norwegian/`, §6). A2–C1 and a phrases deck follow on request.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one because it also changed the APP —
the shelf's hue in `app.js`.

## 1. The decisions (2026-11-15, taken from the Swedish precedent — the owner was not asked)

The request named no levels and no written standard, so the session followed the Swedish set. **Any of these
is the owner's to overrule.**

1. **Bokmål, not Nynorsk.** Bokmål is the written standard most Norwegians use and the one learner courses
   teach first. A form Wiktionary tags `Nynorsk` or `alternative` is not shown; a Nynorsk set would be a
   separate collection.
2. **Word source: CEFR A1–C1, assembled.** Norway examines learners at these levels — Norskprøven (A1–C1) and
   Bergenstesten — but neither was found to publish a word list, so the decks do not claim to be their
   vocabulary. Each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global
   descriptor, topped up with the commonest remaining lemmas; the description says so. Sizes, Swedish's:
   **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
3. **No alphabet deck and no romanisation.** Norwegian is written in the Latin alphabet; æ, ø and å are taught
   by the words.

| deck | file | notes |
|---|---|---|
| Norwegian A1 Beginner — built | `Norwegian-A1.folio-deck.json` | 500 |
| Norwegian A2 Elementary | `Norwegian-A2.folio-deck.json` | 750 |
| Norwegian B1 Intermediate | `Norwegian-B1.folio-deck.json` | 1,000 |
| Norwegian B2 Upper Intermediate | `Norwegian-B2.folio-deck.json` | 1,500 |
| Norwegian C1 Advanced | `Norwegian-C1.folio-deck.json` | 1,500 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, forms | English Wiktionary via kaikki.org (`kaikki.org-dictionary-NorwegianBokmål.jsonl`, 93 MB, 81,648 entries) | CC BY-SA 4.0 |
| the preposition `i` (missing from that extract) | English Wiktionary, page `i/languages M to Z`, Norwegian Bokmål section, read 2026-11-15 | CC BY-SA 4.0 |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `no_full.txt` | CC BY-SA 4.0 |
| example sentences | Tatoeba `nob` exports (14,219 Norwegian–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 4.32 million native (2012), Wikipedia's infobox citing De Smedt et al., *The Norwegian Language in the Digital Age*, read 2026-11-15; no second-language figure, so `total` is the L1 | — |

## 3. The card

One note, two templates (Norwegian → English, English → Norwegian), `speechLang: 'nb-NO'`. Fields: `Norwegian`
(the headword, **a noun with its article** in `.uc-art` — `en` masculine, `ei` feminine, `et` neuter, and
`en/ei` for a noun Bokmål lets take either; none on a plural-only noun such as `penger`, a language's name,
`norsk`, or a month), `Word` (the bare lemma, what the checks key on), `Say` (what the speaker reads: the first
article and the noun), `English` (meanings by part of speech, a noun's gender in its label), `Forms` (a noun's
definite singular and plural, `bilen`, `biler`; an adjective's neuter and definite/plural, `stort`, `store`; a
verb's present, past and past participle, `spiser`, `spiste`, `spist`), `Table` (behind a fold: a noun's
indefinite and definite in both numbers; a verb's infinitive, present, past, perfect, imperative, passive and
participles; an adjective's comparison), `Examples` (up to three Tatoeba sentences, the word in bold). The
type's CSS is `.claude/norwegian/card.css` (Swedish's).

## 4. What Norwegian needs that Swedish did not — the findings

- **THE FORMS ARE ON THE HEAD LINE, NOT IN A TABLE.** Swedish entries carry a declension or conjugation table;
  Bokmål entries almost never do (324 table cells in the whole extract). A word's forms are the ones its head
  line lists, and those are the extract's `table`; a row tagged `alternative` (a second spelling, often
  Nynorsk's) or `noun-from-verb` is dropped.
- **THREE GENDERS, AND FEMININE MAY ALWAYS BE MASCULINE.** Wiktionary tags many nouns `nb-noun-c` (common:
  masculine or feminine) but some one way only while listing both definite forms (`datter` "masculine",
  `dattera` / `datteren`; `seng` "feminine", `senga` / `sengen`). A noun whose definite singular is listed in
  both -a and -en is printed `en/ei` (`build_deck.gender`). `mann` (both tags on its senses) is `en`, and `folk`
  (head line "plural only") `et`, in `GENDER_FIX`.
- **A VERB'S THIRD FORM** is tagged `supine` on some verbs (`være` → `vært`) and `participle past` on the rest;
  the card calls it "perfect" (`har spist`). A present that is also the imperative (`gjør`, `spør`) carries both
  tags, so neither is skipped for the other.
- **`i` IS MISSING FROM THE EXTRACT**, as Swedish's was: written into `extract.SUPPLEMENT` from Wiktionary's
  subpage, with the date read.
- **`når` "when" LOST ITS COUNT TO `nå` "to reach"**, whose present it also is: the common-verb exception to the
  closed-class rule handed it all (`når` was dealt at 0.49). `extract.OWN` gives the spelling to the adverb.
- **`hel` "whole" IS MET AS `hele`**, and that spelling went to a rare noun `hele` by the noun-headword rule;
  `select.SAME_AS` deals `hel` by `hele`'s count, and `hele` is excluded.
- **WORDS WIKTIONARY FILES ONLY AS FORMS**: the object pronouns `meg`, `deg` are full entries, but `hans` "his"
  is only "possessive of han"; `build_deck.FORM_WORDS` writes its card, and the inventory may name it.
- **NOUN BEFORE VERB AGAIN** — the Swedish fault at greater number, since Bokmål's verb infinitives in -e are
  spelt like many nouns: `finne` (a Finn), `skje` (a spoon), `huske` (a swing), `vise` (a ballad), `vente`,
  `prøve`, `stå`, `glemme`, `virke`, `falle`, `kaste`, `bry`, `bo`, `drikke`, `lære`, `hete` — read as verbs
  (`select.FILL_POS` or a part of speech in the inventory). `alt` is "everything", not "an alto"; `å` the
  infinitive marker, not the letter; `rom` "a room", not "rum" (`ETYMS`).
- A vulgar or drug sense cut by `GLOSS` (`ha`, `dra`, `reise`); a gloss that leads with a rare sense reordered
  by `LEAD` (`gang` "time", `middag` "dinner", `trenge` "to need"); `kort`'s mis-tagged superlative and `dra`'s
  `dradd` kept off the card (`adj_plural`, `FORM_DROP`).

**Known, left.** The fill carries the subtitles' crime-drama vocabulary (`drepe`, `skyte`, `politi`, `død`) on
frequency, as every subtitle-ordered deck on the shelf does. Tatoeba has fewer Bokmål sentences than Swedish
(14,219 pairs against 38,823): seven of A1's 500 words have none, and the higher levels will have markedly fewer.

## 5. Phases

**Phase 1 (done)** — the pipeline and A1. **Phase 2** — A2 to C1, one level per session: write the level's
inventory into `inventory.py`, its `SCOPE` into `norwegian_level.py` (already written for all five) and its
`STAMP` into `build_deck.py`, run, read every card. **Phase 3** — a phrases deck (Swedish's `phrases.py`, with
particle verbs: `ta vare på`, `finne ut`).

## 6. As built (2026-11-15): A1

`python3 .claude/norwegian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/norwegian-cache/` (gitignored, ~220 MB).
`node .claude/norwegian/check-norwegian.js` is the check. **A re-run is byte-identical** (verified, extract
included). A1: 500 notes, 356 from the inventory and 144 by frequency; three sentences for 482, none for 7.
Every card was read. The shelf's hue is measured: `#85063D`, a deep wine, 14.7 from its nearest of the 70 hues
(Japan), with the magenta band's standing rejection kept and the greens left out (`lang-norwegian` in `app.js`).
