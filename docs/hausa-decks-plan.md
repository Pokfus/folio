# The Hausa language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Hausa deck in `decks/`.** It is the plan for a
twelfth language set in the shape of the ones already shipped (Hindi, Russian TORFL, Indonesian UKBI …);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-09: "Add a Hausa language collection."

**STATUS (2026-11-12): the alphabet deck, A1 and A2 are built** (`.claude/hausa/`, §6, §7). B1 and the
phrases deck are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one line and one bump, because it
also changed the APP (the shelf's hue in `app.js`) — the Hindi and Turkish precedent.

## 1. The owner's decisions (2026-11-09)

Asked after a survey of the sources (§2), which are far thinner than for any language already on the shelf:

1. **Levels: CEFR A1–B1, smaller** (chosen over A1–C1 at Hindi's sizes, which would have been mostly
   hand-glossed, and over one core deck). Each level is a hand-written topic inventory (`inventory.py`)
   scoped to the CEFR global descriptor for its band, topped up with the commonest remaining words; the
   description says so. Sizes: **A1 500 · A2 750 · B1 1,000 notes**, then a phrases deck.
2. **The toned form as a second line, yes** — Wiktionary's dictionary spelling (ruwā, màcḕ) under the
   ordinary one (ruwa, mace), the `Tone` field. A word with no toned form shows none.
3. **Extra decks: an alphabet (Boko) deck, first in the collection; a phrases and expressions deck, after
   the levels.** Not an Ajami deck (sources too thin; it would be mostly hand-written).
4. **This session: plan + generator + alphabet + A1 + the shelf entry**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Hausa Alphabet (Boko) — built | `Hausa-Alphabet.folio-deck.json` | 36 |
| Hausa A1 Beginner — built | `Hausa-A1.folio-deck.json` | 500 |
| Hausa A2 Elementary — built | `Hausa-A2.folio-deck.json` | 750 |
| Hausa B1 Intermediate | `Hausa-B1.folio-deck.json` | 1,000 |
| Hausa Phrases and Expressions | `Hausa-Phrases-and-Expressions.folio-deck.json` | what the levels leave |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule; "Alphabet" sorts first.

## 2. Sources and licences — and what is missing

| what | source | licence |
|---|---|---|
| meanings, tone, gender, plurals | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Hausa.jsonl`, 2.9 MB, about 2,000 words) | CC BY-SA 4.0 |
| the core words Wiktionary lacks | Folio's own glosses, `hand.py` | — |
| frequency | counted from Tatoeba's Hausa sentences (about 21,850 sentences, 190,000 words) | CC BY 2.0 FR |
| example sentences | Tatoeba `hau` exports, with their English translations | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 58 million, Ethnologue 28th ed., via Wikipedia's infobox, read 2026-11-09 | — |

**WHAT IS MISSING, measured on 2026-11-09:**
- **Wiktionary has about 2,000 Hausa words, 83 of them verbs**, and it lacks some of the commonest words in
  the language: `yi` "do", `tafi` "go", `zo` "come", `gani` "see", `da` "and, with", `ba` "not", `abinci`
  "food", `dare` "night" — 113 of the first A1 inventory's words were absent. Those are glossed by hand
  (`hand.py`), with the standard meanings a course or dictionary gives; **a hand entry carries no toned
  form**, since a tone typed from memory would be a claim with no source. A1: 137 of 500 cards carry a
  hand gloss; 362 have a tone line.
- **No published frequency list.** hermitdave/FrequencyWords (the subtitle lists Hindi, Turkish and Russian
  used) has no Hausa file, so the frequency is counted from Tatoeba itself — small, and the translation of
  English Tatoeba sentences (almost all by one contributor), so it is a frequency of short conversational
  sentences. Hausa Wikipedia (190 MB compressed) was considered and not used: its register is the
  encyclopaedia's.
- **Tatoeba's Hausa often drops the hooks** (`kungiyoyin` for `ƙungiyoyin`, `wadanda` for `waɗanda`) and
  joins words (`yayi` for `ya yi`). The sentences are printed as written; the matching copes (§4).

## 3. The card

One note, two templates (Hausa → English, English → Hausa), `speechLang: 'ha-NG'`. Fields: `Hausa` (the
headword, ordinary spelling), `Tone` (Wiktionary's toned form), `Word` (the plain headword), `English`
(meanings by part of speech, a noun's gender in its label; a later reading said differently carries its own
toned form in its label — `kai` "you" is kai, `kai` "head" is kâi), `Forms` (a noun's or adjective's
feminine and plural, plain with the toned form beside it), `Examples` (up to three Tatoeba sentences, the
word in bold). No forms table: Wiktionary carries no Hausa paradigms. The CSS is `.claude/hausa/card.css`
(Hindi's).

**NO SPEAKER BUTTON**, unlike every other language deck: almost no device carries a Hausa voice, and a
browser asked for `ha-NG` without one reads the word in its default voice — English, in practice — which
teaches a wrong pronunciation rather than none. `speechLang` is still declared, because `spellTree` reads it
to leave the card's Hausa alone. `check-hausa.js` fails on a speaker button.

## 4. What Hausa needs that no earlier set did — the findings

- **TWO FOLDS** (`ha.py`). `norm()` drops tone and length marks (ordinary writing has none) and writes ƴ as
  'y; `loose()` also drops the hooks. A hook is a different SOUND (`ɗa` "son" / `da` "and", `ƙasa` "land" /
  `kasa`), so the loose match is a FALLBACK only, tried when nothing has the strict key, and only for words
  of four letters or more — without that, `'ya` "daughter" took the whole count of `ya` "he" and ranked
  fourth in the language.
- **THE SUFFIXES COUNT TO THEIR NOUN** (`ha.stems`): the genitive linker (-n, -r) and the possessive endings
  (`gidan`, `gidana`, `gidansa`, `ranar`, `lokacin`). Stripping can land on a wrong stem — `abokan` (the
  plural with the linker) fed `aboka` "lawyer" — so the fill's exclusions (`select.EXCLUDE`) carry each such
  case with its reason.
- **HOMOGRAPHS WHOSE COUNT IS ANOTHER WORD'S**: Wiktionary has `sa` only as "bull", `kada` only as
  "crocodile", `koma` as "fishing net", `fita` as "graduation", `hau` as "misfortune" — each a common verb
  or particle in running text. Those are given a hand gloss, added to the inventory, and Wiktionary's entry
  is dropped from the card (`build_deck.ETYMS`, `'hand'`). Others are excluded from the fill (`guɗa` is
  `guda` unhooked, `karuwa` is `ƙaruwa` unhooked, `bana` / `baka` are `ba na` / `ba ka` written as one).
- **THE TONE LINE BELONGS TO THE FIRST READING ONLY, and only when that reading is Wiktionary's**: under a
  hand-glossed `suna` "they are …-ing", Wiktionary's sūnā ("name") would be a wrong pronunciation of the
  word the card opens on. `check-hausa.js` asserts every tone line untones to its headword.
- **ONE CARD PER SPELLING**: Hausa writes several common words alike that tone tells apart (`kai`, `suna`,
  `ina`, `yaya`, `nawa`), and the card carries each meaning.
- **SMALL CORRECTIONS, each with its reason in `build_deck.py`**: a gloss replaced where Wiktionary's first
  sense is not the everyday one (`GLOSS`: `jimla` "sentence", `ɗan`, `yaro`), parts of speech that are noise
  dropped (`POS_ONLY`: an adverb that is only a noun's locative, `rawaya`'s dye plant), one gender corrected
  (`GENDER_FIX`: `littafi` is masculine; Wiktionary's head says f).

**Known, left.** The sentences keep Tatoeba's spellings, hooks dropped and words joined. The fill carries the
corpus's own topics on frequency (`tsuntsu` "bird", `soja`, `bindiga`). 5 of A1's 500 words have no
sentence. Wiktionary's genders are trusted except where named; `iyali` "family" is filed feminine there.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2** — A2 then B1, one level per session: write
the level's inventory into `inventory.py`, its missing glosses into `hand.py`, its `SCOPE` into
`hausa_level.py`; run with `--re-extract`; read every card. Expect most of a level's core to need a hand
gloss — Wiktionary's verbs run out early. **Phase 3** — the phrases deck (greetings and set expressions,
proverbs; Wiktionary's multi-word entries plus hand). **Phase 4** — a combined file, gitignored.

## 6. As built (2026-11-09): the alphabet and A1

`python3 .claude/hausa/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py`
→ `examples.py` → `build_deck.py`, caching in `.claude/hausa-cache/` (gitignored, ~200 MB). **Re-run with
`--re-extract` after editing `hand.py`** (the hand glosses are merged into `lex.json`).
`python3 .claude/hausa/alphabet.py` writes the alphabet deck (reads `lex.json` for the example words'
tones). `node .claude/hausa/check-hausa.js` is the check. **A re-run is byte-identical** (verified for both
decks). A1: 500 notes, 294 from the inventory and 206 by frequency; three sentences for 493, none for 5.
The alphabet: 36 notes — the 28 letters of the Nigerian order (with 'y / ƴ as one), the glottal stop, the
rolled r̃, the diphthongs ai and au, and the digraphs kw, gw, ƙw, ky; every sound side unique (asserted).
The shelf's hue is measured: `#665487`, a dusky indigo, 15.5 from its nearest of 60 (Psychology; Astronomy
15.6). **Re-swept at every merge**: the sweeps found in turn a green (19.5), a periwinkle (`#6F69D2`) and a
deep indigo (`#5D2A8A`) — and Arabic, Greek and Urdu, built in parallel sessions the same day, took each of
them. On the 60-hue shelf the two best points are a crimson and a teal-green (15.7), both in crowded bands;
the indigo family is next, and the subject's own colour (the dye pits of Kano).

## 7. As built (2026-11-12): A2

`python3 .claude/hausa/run.py --level a2 [--re-extract]`. 750 notes / 1,500 cards: 518 from the inventory
(`inventory.A2`, 22 topics scoped to the A2 descriptor), 232 by frequency. 330 carry a hand gloss
(`hand.HAND_A2`), 419 a tone line; sentences for 688 (three for 519), none for 62, nearly all hand-glossed
words the corpus never uses. **A re-run is byte-identical, and A1 still rebuilds byte-identical.**

- **EACH LEVEL'S HAND GLOSSES ARE KEPT APART, AND EACH LEVEL HAS ITS OWN LEXICON** (`hand.HANDS`,
  `hausa_level.HAND_LEVELS`, `hausa_level.LEX`). A hand entry is a lemma the frequency count can credit:
  `fada` "palace" took the tokens the hook fallback had given `faɗa`, and `ma'aikaci` took its plural from
  `ma'aikata` "factory". A1's order, and so its positional card ids, moved. So `extract.py` merges only
  the hands of the level being built and the levels below it, and writes `lex.json` (A1, which
  `alphabet.py` also reads) or `lex-<level>.json`. A word is hand-glossed on one level only (asserted).
- **A HAND ROW MAY NAME A SPELLING THAT COUNTS TO IT** (a fifth item, never printed): `haka` "so, thus",
  missing from Wiktionary and A1, takes `hakan`. Before that, `hakan` fell through to `haƙa` "to dig",
  which then ranked 19th in the language.
- **THE FILL IS THIN at A2**: Wiktionary's usable words with a count of 1 or more run out at about 230
  after A1, so most of the level is the inventory. The fill's exclusions (`select.EXCLUDE`, "Read off the
  A2 ranking") are the homographs whose count belongs to another word (`dina` the possessive "my", `yari` in
  `gidan yari` "prison", `kaso` "share", `banga` = `ban ga`, `girka` Greece), loans that duplicate a
  taught word (`bal`, `kwamfyuta`), and four sexual or crude words never put in a level deck.
- **COMMON VERBS WIKTIONARY HAS ONLY AS A RARER NOUN** (`goge` the fiddle, `kori` "curry", `makara` "bier",
  `taru` a fishing net, `komo`, `sara`, `dage`, `rama`, `tofa`, `ishe`, `laima` "tent", `baƙo` and
  `ango` given names only) are hand-glossed and the card shows the hand entry alone (`build_deck.ETYMS`).
  `WORD_AS` prints `baƙo` and `ango` in lower case. `TONE_OFF` withholds `tsintsiya`'s tone line: its
  Wiktionary head spells the variant `tsintsinyā`.
- **SENTENCES** (`examples.py`): from A2 on, a sentence whose English is sexual or vulgar is never shown
  (`BLOCK_EN`). It is not applied to A1, where it would replace `ƙarami`'s first sentence ("Big breasts in
  Japan …"). A1 is left byte-identical, so that sentence is still there. A word whose corpus spelling
  is mostly another word's must have its meaning in the sentence's English (`EX_NEED`): `bashi` ("ba
  shi"), `yaji` ("ya ji"), `tsani` ("na tsani"), `ɗinka` (the possessive), `sara` (a name), `kura` (ƙura),
  `Mayu` (witches), `raƙumi` (raƙuman ruwa, waves). `tsani`, `ɗinka`, `kura` and `raƙumi` keep no sentence.
- **Dropped from the inventory after reading the cards**: `fada` "palace" (every sentence was faɗa) and
  `nono` (its sentences were "breast"; it returned through the fill with clean sentences).

**Known, left.** As at A1, the sentences keep Tatoeba's spellings, and some translations are loose (`rani`
is given as "autumn"). The fill carries Tatoeba's topics (military ranks, `ta'adda`). `malam` takes
the butterfly sentences of `malam buɗe mana`, which has none of its own.
