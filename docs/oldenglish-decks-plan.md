# The Old English language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Old English deck in `decks/`.** It is the plan for
a twelfth language set on the shelf, the first for a language nobody speaks; `docs/lang-decks.md` is the
record of how the others were built, and every rule there applies here unless this file says otherwise.
Asked for on 2026-11-09: "Add an Old English language collection."

**STATUS (2026-11-09): the alphabet deck and Level 1 are built** (`.claude/oldenglish/`, §6). Levels 2–4
are not.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one line and one bump, because it
also changed the APP (the shelf's hue in `app.js`) — the Hindi, Turkish and Russian precedent.

## 1. Decisions taken in the session (the owner did not specify; each is open to change)

The request named no shape, so the session chose the defaults below and says so here rather than asking
first. Each is cheap to change before Level 2 is built and dear after.

1. **A level is a band of FREQUENCY, not a CEFR band.** Old English has no examination, no graded list and
   no speakers, so "A1" would claim a stage of conversation that does not exist. Level 1 is the 500
   commonest lemmas, Level 2 the next 500, Level 3 the next 1,000, Level 4 the 1,000 after that — 3,000
   words, about where the corpus's counts fall to a handful (Level 1's last word has a count of 23).
   Titles read "Old English Level N", so `levelRank` sorts them with no new rule.
2. **An alphabet and pronunciation deck, first** — the level decks print an editor's macrons and dots and a
   line of IPA, and there is no speaker, so the sounds are taught here or nowhere.
3. **The headword as modern editions print it** (Wiktionary's normalised late West Saxon: stān, iċ, ġēar),
   never a manuscript spelling, with Wiktionary's IPA under it (the phonetic `[…]` where given).
4. **No speaker control.** No browser voice reads Old English; a speaker that read it as modern English
   would teach the wrong sounds. `check-oldenglish.js` fails on a `uc-tts`.
5. **The Modern English descendant on the card** (cyning → king), labelled as a descendant, not a
   translation — the one thing an Old English card can teach that a modern-language card cannot.
6. **Not built, and the obvious next asks:** a poetry deck (Beowulf's word-hoard — the frequency here is
   prose), a phrases deck (Old English has no phrasebook; famous lines would be the honest equivalent), and
   a combined file.

| deck | file | notes |
|---|---|---|
| Old English Alphabet and Pronunciation — built | `Old-English-Alphabet.folio-deck.json` | 41 |
| Old English Level 1 — built | `Old-English-Level-1.folio-deck.json` | 500 (ranks 1–500) |
| Old English Level 2 | `Old-English-Level-2.folio-deck.json` | 500 (501–1,000) |
| Old English Level 3 | `Old-English-Level-3.folio-deck.json` | 1,000 (1,001–2,000) |
| Old English Level 4 | `Old-English-Level-4.folio-deck.json` | 1,000 (2,001–3,000) |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, class, forms, IPA, descendants | English Wiktionary via kaikki.org (`kaikki.org-dictionary-OldEnglish.jsonl`, 140 MB) | CC BY-SA 4.0 |
| frequency corpus | B. Thorpe (ed.), *The Homilies of the Anglo-Saxon Church*, vol. 1 (1844) — Ælfric's *Catholic Homilies*, the Old English column only (Project Gutenberg #38334, about 98,000 words) | public domain |
| | H. Sweet, *An Anglo-Saxon Primer*, 8th ed. (1905), the six reading texts only (Project Gutenberg #34316, about 9,400 words) | public domain |
| | Tatoeba's Old English sentences (`ang`, about 800) | CC BY 2.0 FR |
| example sentences | Tatoeba `ang`–`eng` pairs (745) | CC BY 2.0 FR |
| sounds (alphabet deck) | Sweet's *Primer*, "Sounds"; Wiktionary's pronunciations for the examples | public domain; CC BY-SA 4.0 |
| descendant tie-break | word counts in Tatoeba's English sentences | CC BY 2.0 FR |
| L1 speakers (`LANGS`) | 0 — it sorts after every living language | — |

**What the corpus means for the order, said in each deck's description:** Ælfric was a preacher and most
surviving Old English prose is religious, so God, Christ, heaven, the apostles and the devil come early;
the vocabulary of the poetry (the hall, the sea, the sword) is mostly not in Level 1.

## 3. The card

One note, two templates (Old English → English, English → Old English), no `speechLang`. Fields: `OE` (the
headword), `IPA`, `Word` (the bare headword, for the checks), `English` (meanings by part of speech; a noun's
gender, a verb's class — strong I–VII, weak 1–3, preterite-present, irregular — in the label), `Forms` (a
noun's genitive and plural, a verb's past, past plural and past participle, an adjective's comparative and
superlative), `Modern` (the descendant), `Table` (behind a fold: a verb's present, past, subjunctive and other
forms; a noun's four cases by number; an adjective's or determiner's strong declension by gender with the
instrumental; a pronoun's cases), `Examples` (up to three Tatoeba sentences, the word in bold). The type's
CSS is `.claude/oldenglish/card.css` (Hindi's, with `.uc-ipa` and `.uc-mod` for the pronunciation and the
descendant).

## 4. What Old English needs that no earlier set did — the findings

- **THE FOLD** (`oe.fold`): no standard spelling. Wiktionary prints normalised early West Saxon with macrons
  and dots; Thorpe's Ælfric is late West Saxon with manuscript accents (hí, hé), ð and þ at random, and y for
  ie / i (gehyrsumnys for gehiersumnes); Tatoeba sometimes prints wynn and the insular g (cƿeðe, ᵹelufod).
  Every comparison folds case, accents, macrons, dots, ð → þ, ƿ → w, ȝ ᵹ → g, y → i, ie → i, -nys → -nes and
  hyphens. 91% of corpus tokens then match a Wiktionary form; the commonest misses are names (Iohannes,
  Petrus), þaþa ("when", written as one word) and a few late spellings (micclum, þissere, worulde).
- **kaikki's verb tables are mis-tagged**: the subjunctive rows lose their mood and the participles come out
  tagged `imperative`. `extract.verb_table` reads the rows by POSITION, which the template fixes; a verb
  whose rows do not walk gets no table.
- **The personal pronouns share one table** (`l-self`): under iċ it lists his, him, hire … `own_pronoun_rows`
  keeps a pronoun's own person, number and gender — otherwise iċ took a share of every his.
- **THE LEMMA FREQUENCY, and the rules found by reading the ranking** (all in `extract.py`'s header): (1) a
  function word's own spelling is its own — `for` had gone to faran (past fōr), `æt` to etan, `ēac` to
  īeċan, `ac` "but" was half āc "oak"; (2) a spelling that is some lemma's own or table form is not also
  another's dialect variant (bearn was being counted for bereærn); (3) an alternative-spelling lemma that
  shares most of its meaning is the same lemma (hīo → hēo, self → sylf, the survivor being the spelling the
  corpus uses more) — "most of", because mān "crime" lists mann among its spellings and swallowed one of the
  commonest nouns there is; (4) a few rounds of re-estimation only, since run to convergence the split is
  winner-takes-all and a strong verb's big paradigm took every short word in it; (5) a capital mid-sentence
  is a noun's (Thorpe's God, Crist, Drihten — "god" had gone to gōd "good"); (6) `FORCE`, a short table of
  tokens given by hand, each with its reason (wesan and bēon divided by stem; willan's wolde not wiellan
  "to boil"'s; witan "know" not wītan "blame"; þæs, þan, seþe to sē; hira to hīe; manna to mann; stemn to
  stefn "voice"), and `LATIN`, the Latin of Thorpe's rubrics (`et` had made ettan "to graze" a top-500
  word).
- **Hand exclusions** (`select.EXCLUDE`, each with its reason): the weak forms hālga / hālġe (the card is
  hāliġ), þē (a late spelling of sē / þe), ġe "and" (ties with ġē "you" on one spelling), tōm, sċeolh,
  māre.
- **Which sentence shows which word** (`examples.py`): a token belongs to the lemma the count gave the most of
  it, capital-sensitive; for the six commonest function words (sē, þā, þæt, þe, swā, þonne) a sentence counts
  only if its English says the word's own meaning — Tatoeba's "Þa deadan sculon arisan" is "the dead", not
  "then".
- **The descendant** (`extract.moderns`): for each Middle English branch Wiktionary lists, its first untagged
  English word; of several, the one most branches lead to (mann: man, not the reshaped me), then the one
  commonest in Tatoeba's English (iċ: I, not ich); none when that word is all but gone (fewer than 3 uses —
  hǣlend's "healand", þēod's "theed").
- **Glosses chosen by hand where Wiktionary's first is not Ælfric's** (`build_deck.py`): `LEAD` (hǣlend "savior"
  before "healer", lāc "gift, offering" before "play"), `ETYMS` (mǣre "famous", not "boundary"), `LEAD_POS`
  (swā and ǣr lead with the adverb, þæt with the conjunction, ōþer with the adjective). "synonym of X" is
  replaced by X's own first gloss.

**Known, left.** Wiktionary's glosses are in American spelling (savior, labor, honor), as on every
Wiktionary-built deck. Some descendants are archaic and true rather than helpful (wunian → won "to dwell",
stefn → steven, bearn → barn "child" in the North). 304 of Level 1's 500 words have no Tatoeba sentence —
Tatoeba holds only about 800 Old English sentences. 9% of corpus tokens match nothing and count for nothing.
The frequency of a word like gōd "good" is depressed by God's capital (lower-case god is split by the rules).

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet, Level 1. **Phase 2** — Levels 2–4, one per session:
`python3 .claude/oldenglish/run.py --level l2`, then read every card as Level 1's were and add to
`FORCE` / `EXCLUDE` / `LEAD` what the reading finds (a level is built on the shipped decks below it, so
Level 1's words are never repeated). **Phase 3** — whatever §1.6 the owner asks for.

## 6. As built (2026-11-09): the alphabet and Level 1

`python3 .claude/oldenglish/run.py [--level l1] [--no-fetch]`; stages `corpus.py` → `extract.py` →
`select.py` → `examples.py` → `build_deck.py`, caching in `.claude/oldenglish-cache/` (gitignored, ~250 MB);
`python3 .claude/oldenglish/alphabet.py` writes the alphabet deck (reads `lex.json` for the example words'
IPA). `node .claude/oldenglish/check-oldenglish.js` is the check. **A re-run is byte-identical** (verified for
both decks). Level 1: 500 notes / 1,000 cards; 347 with key forms, 225 with a descendant, 196 with at least
one sentence (115 with three); 2 notes labelled by the shelf-wide unique-English pass. The alphabet: 41 notes —
14 vowels, 6 diphthongs, 14 consonants and spellings that differ from modern English, 3 rules (no silent
letters, long double consonants, unstressed ġe-), 1 for the letters said as today, 3 manuscript letters
(wynn, insular g, ꝥ); every sound side and every letter side unique (asserted). The shelf's hue is measured:
`#004E30`, 15.4 from its nearest of 63 (re-swept at the merge: Arabic had taken the first sweep's `#2A8424`).
