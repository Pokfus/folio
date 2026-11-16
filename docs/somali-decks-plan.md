# The Somali language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Somali deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped (Hausa, Zulu, Yoruba …); `docs/lang-decks.md` is the
record of how those were built, and every rule there applies here unless this file says otherwise. Asked for
on 2026-11-16: "Add a Somali language collection."

**STATUS (2026-11-16): the alphabet deck, A1 and A2 are built** (`.claude/somali/`, §6–§7). A2 holds 439
notes, not 500: what the source has left (§7). The phrases deck is next.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for a later deck this plan produces. The collection's first commit carried one line and one bump because it
also changed the APP (the shelf's hue in `app.js`) — the Hausa and Yoruba precedent.

## 1. The owner's decisions (2026-11-16)

Asked after a survey of the sources (§2), the thinnest of any language on the shelf:

1. **Levels: CEFR A1–A2, smaller** — **A1 400 · A2 500 notes** (chosen over A1–B1 at Hausa's sizes, which
   would have been mostly Folio's own glosses, and over one unlevelled core deck). Each level is a
   hand-written topic inventory (`inventory.py`) scoped to the CEFR global descriptor for its band, topped up
   with the commonest remaining Wiktionary words; the description says so.
2. **A few core words hand-glossed** (`hand.py`), the Hausa arrangement: a hand entry carries no accent line.
3. **Extra decks: an alphabet deck, first in the collection; a phrases deck, after the levels.**
4. **This session: plan + generator + alphabet + A1 + the shelf entry**; later decks one per session.

| deck | file | notes |
|---|---|---|
| Somali Alphabet — built | `Somali-Alphabet.folio-deck.json` | 33 |
| Somali A1 Beginner — built | `Somali-A1.folio-deck.json` | 400 |
| Somali A2 Elementary — built | `Somali-A2.folio-deck.json` | 439 (planned 500) |
| Somali phrases — planned | (named when built) | — |

The titles carry the CEFR band, so `levelRank` sorts them with no new rule; "Alphabet" sorts first.

## 2. Sources and licences — and what is missing

| what | source | licence |
|---|---|---|
| meanings, accents, genders, plurals, usage examples | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Somali.jsonl`, 1.7 MB, 1,136 entries, about 1,000 usable) | CC BY-SA 4.0 |
| the core words Wiktionary lacks | Folio's own glosses, `hand.py` | — |
| frequency | the Somali Wikipedia, `sowiki-20261101-pages-articles.xml.bz2`, pinned: its 6,002 articles of 150 words or more (3.4 M words) | CC BY-SA 4.0 |
| example sentences | Tatoeba `som` exports (164 Somali sentences, about 125 with an English translation) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| L1 speakers (`LANGS`) | 23.8 million (Ethnologue, 2019–2024, via Wikipedia's infobox, read 2026-11-16); no second-language figure, so `total` is the L1 | — |

**WHAT IS MISSING, measured on 2026-11-16:** English Wiktionary has 542 Somali nouns and 315 verbs, and lacks
some of the commonest words in the language — `tag` "go", `lacag` "money", `hadda` "now", `berri`
"tomorrow", `laakiin` "but", `badan` "many", `kale` "other", most question words and the everyday nouns of a
town (`baabuur`, `waddo`, `dukaan`). 87 of A1's 400 cards are hand-glossed. Checked and unusable:
hermitdave/FrequencyWords has no Somali list (404).

## 3. The card

One note, two templates (Somali → English, English → Somali), `speechLang: 'so-SO'`. Fields: `Somali` (the
headword, ordinary spelling), `Tone` (Wiktionary's accented headword, nín, gabádh), `Word` (the plain
headword, for the check and the next level), `English` (meanings by part of speech, a noun's gender in its
label), `Forms` (a noun's plurals, each with its own gender), `Examples` (up to three: Wiktionary's own, then
Tatoeba's). The CSS is `.claude/somali/card.css` (Yoruba's).

- **The tone line is the first entry's, and only when that entry is Wiktionary's**; a hand gloss carries none.
  **Only the acute and the grave**: fifteen of Wiktionary's heads also write a diaeresis (jöög, shä̀äh), a
  vowel-quality notation nothing on the card explains, and those show no tone line (`build_deck.ACCENT_ONLY`).
- **A plural is printed plain** (maalmo, not Wiktionary's maalmó) with its gender beside it, since Somali
  plurals often take the other gender (wiil m, wiilal f).
- **No verb table**: Wiktionary's Somali conjugation tables carry template residue in some cells (`{{{4}}}ayaa`).
- **NO SPEAKER BUTTON**, the Hausa rule. `check-somali.js` fails on one.

## 4. What Somali needs that no earlier set did — the findings

- **A LEMMA FREQUENCY OVER A SUFFIXING ORTHOGRAPHY.** Somali writes the definite article and the verb endings
  onto the word (`buugga`, `magaalada`, `cunay`), so a lemma is counted over its forms (`extract.generated` and the claims in `main`):
  the spelling, its plurals, the clean one-word forms of Wiktionary's tables, the pointer entries that name
  it, and GENERATED regular endings — a noun's article in each shape (-ka -ga -ha -a, -ta -da -sha, the past
  -kii / -tii, the demonstratives) on the singular and each plural, and the commonest endings of a
  first-conjugation verb or an -ee verb. An approximation, documented in `extract.py`; a shared form is split
  in proportion to the claimants' own counts.
- **WIKTIONARY FILES DEFINITE FORMS AS NOUNS** (`xarunta`, `nidaamka`, `bisha` "date", `dusha` "above"): each is
  excluded from the fill by name (`select.EXCLUDE`), with its reason.
- **WIKTIONARY'S GLOSS IS SOMETIMES NOT THE WORD THE CORPUS COUNTS** (`sida` "this" for "like, as", `jeer`
  "hippopotamus" for "time", `gaar` "to reach" for "special", `uun` "create" for "only"): excluded from the
  fill, never re-glossed. **Where an inventory word's Wiktionary sense is wrong for it** (`miro` "nut" for
  "fruit", `shaati` "blouse", `fudud` "subtle", `qurux` "beautiful" as a noun, `gadaal`), the hand row is shown
  ALONE (`build_deck.HAND_ONLY`); where it is merely not the everyday one (`mar`, `maalin`, `jaalle`), the hand
  row leads and Wiktionary's follows.
- **GRAMMAR WORDS ARE LEFT TO THE INVENTORY**: the fill takes no lemma of two letters or fewer and none of the
  focus and topic markers (`waa`, `waxa`, `baa`, `ayaan`), whose counts are every sentence's.
- **ONE GENDER CORRECTED** (`build_deck.GENDER_FIX`): `sanad` "year" is masculine (sanadka in 543 articles,
  sanadda in 2); Wiktionary's head says f.
- **The head template's plurals are label / form pairs** (`plural`, `or`, `definite`), so a definite form is
  never read as a plural (`extract.gender_plural`).

**Known, left.** The fill carries the encyclopaedia's topics (months, history, government). Spelling variants
Wiktionary splits (`gaar` / `gaadh`, `cayaar` / the Wikipedia's commoner `ciyaar`) are taught under Wiktionary's
page. 40 of A1's 400 words have a sentence.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, A1. **Phase 2 (done, §7)** — A2: write its inventory into `inventory.py`,
its missing glosses into `hand.py` and its scope into `somali_level.SCOPE`, run with `--re-extract`, read every card. Expect the fill to run thin: after A1
only about 600 usable Wiktionary words are left. **Phase 3** — the phrases deck.

## 6. As built (2026-11-16): the alphabet and A1

`python3 .claude/somali/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `wikitext.py` → `extract.py` →
`select.py` → `examples.py` → `build_deck.py`, caching in `.claude/somali-cache/` (gitignored, ~140 MB). **Re-run
with `--re-extract` after editing `hand.py`.** `python3 .claude/somali/alphabet.py` writes the alphabet deck
(reads `lex.json` and the A1 deck: every example word is an A1 word). `node .claude/somali/check-somali.js` is
the check. **A re-run is byte-identical** (verified for both decks). A1: 400 notes, 275 from the inventory and
125 by frequency; 87 hand-glossed, 92 with a tone line, 80 with plurals, 40 with sentences. The alphabet: 33
notes — the 21 consonants in the primers' order, the glottal stop, the five vowels, the long vowels and five
diphthongs; every sound side unique (asserted). The shelf's hue is measured: `#3C7575`, a teal, 13.8 from its
nearest of 79 (France, Philosophy).

## 7. As built (2026-11-16): A2

`python3 .claude/somali/run.py --level a2 [--re-extract]`. **439 notes / 878 cards, not the planned 500**: 254 from
the inventory (`inventory.A2`, 18 topics scoped to the A2 descriptor), 185 by frequency, which then has nothing
usable left (its last words are counted once). 88 hand-glossed (`hand.HAND_A2`), 64 with a tone line, 51 with
plurals, 7 with sentences. **A re-run is byte-identical, and A1 and the alphabet still rebuild byte-identical.**

- **EACH LEVEL HAS ITS OWN LEXICON** (`somali_level.LEX`: `lex.json`, `lex-a2.json`; `hand.HANDS`,
  `somali_level.HAND_LEVELS`), the Hausa finding: a hand noun claims its definite forms (waji → wajiga), so A2's
  hand glosses in A1's lexicon would move A1's counts and its positional ids. A word is hand-glossed on one
  level only (asserted in `extract.py`).
- **THE FILL RUNS OUT.** After A1, Wiktionary's remaining Somali is largely noise for a level deck: definite
  forms filed as nouns (`wajiga`, `qoorta`, `timaha`, `musqusha`), variant and dialect spellings of taught
  words (`magaalad`, `babuur`, `anaga`, `ayeey`), verbal nouns and infinitives filed as verbs (`socod`, `tirin`,
  `noolaan`), second and third words for a taught meaning (`luqun`, `duun` "neck"; `xadiid` "iron"), and slurs,
  insults and clan epithets from the history articles. Each is in `select.EXCLUDE` with its reason (about 75
  lines, "Read off the A2 ranking"). What is left — 185 words, counts 164 down to 1 — is dealt. Padding to 500
  with excluded entries would teach the noise, so the description says the level is smaller and why.
- **HAND_ONLY grew** (`cabitaan` "a drink", not Wiktionary's "soda"; `sheeko` "story", not "conversation";
  `raadi` "look for", not "find"). **Two seasons** Wiktionary lacks are hand-glossed (`jiilaal`, `dayr`);
  `gu'` and `xagaa` are its own. `ciid` carries both its words, "sand" and "Eid".
- **Small corrections, each with its reason in `build_deck.py`**: `askari` is masculine (`GENDER_FIX`:
  askariga / askarigii 5 articles each, the feminine article none); `gu'` shows one of Wiktionary's two
  identical entries (`ONE_ENTRY`); a gloss that is a dialect pointer ("southern Somali form of tidhi") or
  begins with punctuation (`ciddi`'s ".sand") is dropped (`POINTER`). A1 is unaffected by all three.

**Known, left.** The fill keeps Wiktionary's topics with the encyclopaedia's order (`asaas` "found",
`dimuqraadi`, `kacaan`). Some fill glosses are Wiktionary's narrower or older senses (`wacan` "perfect", `murugo`
"sad" as an adjective). Seven sentences in all: Tatoeba's Somali is nearly used up by A1. No B1 is planned (the
owner's choice of A1–A2, §1); after A2, 251 Wiktionary entries remain untaught, nearly
all of them excluded above or never used in the Somali Wikipedia.

