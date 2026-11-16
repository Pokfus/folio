# The Icelandic language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Icelandic deck in `decks/`.** It is the plan for an
Icelandic set, built in the Norwegian decks' shape (`docs/norwegian-decks-plan.md`, whose pipeline
`.claude/icelandic/` adapts) with an alphabet deck in the Finnish one's (`docs/finnish-decks-plan.md`);
`docs/lang-decks.md` is the record of how every set was built, and every rule there applies here unless this file
says otherwise. Asked for on 2026-11-15: "Add an Icelandic language collection."

**STATUS (2026-11-16): the plan is complete** — the alphabet deck and A1 (§6), A2 (§7), B1 (§8), B2 (§9), C1 (§10)
and the phrases deck (§11).

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one because it also changed the APP —
the shelf's hue in `app.js`.

## 1. The decisions (2026-11-15, taken from the Norwegian and Finnish precedents — the owner was not asked)

The request named no levels, so the session followed the Norwegian set, plus Finnish's alphabet deck. **Any of
these is the owner's to overrule.**

1. **Word source: CEFR A1–C1, assembled.** No graded word list for Icelandic as a foreign language was found
   published, so the decks do not claim to be an examination's vocabulary. Each level is a hand-written topic
   inventory (`inventory.py`) scoped to the CEFR global descriptor, topped up with the commonest remaining lemmas;
   the description says so. Sizes, Norwegian's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**.
2. **An alphabet deck, no romanisation.** Icelandic is written in the Latin alphabet, but it has letters English
   does not (þ ð æ ö, and á é í ó ú ý, each a letter with a sound of its own) and sounds its spelling does not show
   (hv, ll, pre-aspiration), so it gets Finnish's and Hungarian's alphabet-of-sounds deck rather than Norwegian's
   none.
3. **The verbs' present tense from BÍN** (§2, §4): English Wiktionary's extraction carries no Icelandic
   conjugation table, and the present is the tense a beginner needs first.

| deck | file | notes |
|---|---|---|
| Icelandic Alphabet — built | `Icelandic-Alphabet.folio-deck.json` | 39 |
| Icelandic A1 Beginner — built | `Icelandic-A1.folio-deck.json` | 500 |
| Icelandic A2 Elementary — built | `Icelandic-A2.folio-deck.json` | 750 |
| Icelandic B1 Intermediate — built | `Icelandic-B1.folio-deck.json` | 1,000 |
| Icelandic B2 Upper Intermediate — built | `Icelandic-B2.folio-deck.json` | 1,500 |
| Icelandic C1 Advanced — built | `Icelandic-C1.folio-deck.json` | 1,500 |
| Icelandic Phrases and Expressions — built | `Icelandic-Phrases-and-Expressions.folio-deck.json` | 734 |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings, gender, the forms of nouns, adjectives and pronouns, a verb's past and supine | English Wiktionary via kaikki.org (`kaikki.org-dictionary-Icelandic.jsonl`, 72 MB, 25,404 entries) | CC BY-SA 4.0 |
| a verb's present indicative (six persons) and imperative; its other finite forms as frequency claims only | The Database of Icelandic Morphology (BÍN), the Árni Magnússon Institute for Icelandic Studies, author and editor Kristín Bjarnadóttir, https://bin.arnastofnun.is — `SHsnid.csv` (basic format), downloaded 2026-11-15 | CC BY-SA 4.0; the conditions page (`/DMII/LTdata/conditions/`, read 2026-11-15) asks for that credit line and URL wherever the data is used, and for changes to be stated — the deck's description carries both, and says what is taken |
| frequency | hermitdave/FrequencyWords, OpenSubtitles 2018, `is_full.txt` (mis-encoded, §4) | CC BY-SA 4.0 |
| example sentences | Tatoeba `isl` exports (10,805 Icelandic–English pairs) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | 388,720 (Ethnologue 26th ed.), Wikipedia's infobox, read 2026-11-15; no second-language figure, so `total` is the L1 (0.39 million) | — |

## 3. The card

One note, two templates (Icelandic → English, English → Icelandic), `speechLang: 'is-IS'`. Fields: `Icelandic`
(the headword), `Word` (the bare lemma, what the checks key on), `Say` (what the speaker reads), `English` (meanings
by part of speech, a noun's gender in its label — **Icelandic has no indefinite article**, so the gender is a label,
not a word beside the noun), `Forms` (a noun's definite, genitive singular and plural, `hesturinn`, `hests`,
`hestar`; an adjective's feminine, neuter and comparative, `góð`, `gott`, `betri`; a verb's present "he" form, past
and supine, `fer`, `fór`, `farið`), `Table` (behind a fold: a noun's four cases in both numbers, indefinite ·
definite; a verb's present in six persons, then the infinitive, past singular and plural, supine, past participle
and imperative; an adjective's three nominatives and its comparison; a personal pronoun's four cases), `Examples`
(up to three Tatoeba sentences, the word in bold). The type's CSS is `.claude/icelandic/card.css` (Norwegian's).

The alphabet deck (`alphabet.py`, Finnish's): the 32 letters in Icelandic order with their Icelandic names, then
seven notes — ei/ey, au, hv, ll, pre-aspiration (pp tt kk), the first-syllable stress and vowel length. Every
example word is checked against `lex.json`.

## 4. What Icelandic needs that Norwegian did not — the findings

- **THE SUBTITLE LIST IS MIS-ENCODED.** `is_full.txt` writes most ð as đ (1.54 million tokens against 0.22 million
  correct), þ as ū (`ūú` 130,655, `ūađ` 173,058), ó as ķ, ý as ũ, á as ā, i as ą and some ð as õ or ō — an old subtitle
  code page read through another. `isl.subs_fold` maps the eight back before counting; none is an Icelandic letter,
  so no correct spelling loses a count. Without it `að` and `ađ` were two words and `þú` was barely counted.
- **NO PRESENT TENSE IN WIKTIONARY'S EXTRACTION.** A verb's head line gives its principal parts (past "he", past
  "they", supine) and its past participle declined, but no conjugation table. Wiktionary's form-of entries ("fer:
  first-person singular present indicative of fara") cover only about a quarter of the commonest verbs, so the
  present and imperative come from **BÍN**, matched to the Wiktionary lemma by its past where BÍN lists the
  spelling more than once (1,885 of 2,043 verbs; a middle-voice verb, `ferðast`, by BÍN's `MM-` forms). Where BÍN has
  no match the card shows no present rather than a guessed one (impersonal `langa`, `komast`). BÍN's other finite
  forms (past and subjunctive in every person, the question forms `ertu`, `ferðu`) are never shown: they only claim
  their spelling for the lemma's count — `væri` and `ertu` are among the subtitles' commonest words, and they are
  `vera`'s — and let a sentence match.
- **A FORM-OF ENTRY CLAIMS ITS SPELLING EVEN WHERE THE SPELLING IS A LEMMA** (unlike Norwegian): `er` is a relative
  pronoun and a conjunction in Wiktionary, and it is the present of `vera`, which is what the subtitles' 270,000
  `er` are.
- **A PERSONAL PRONOUN'S TABLE IS EVERY PERSONAL PRONOUN'S** (Swedish and Finnish met it too): `þú`'s, `mig`'s and
  `hann`'s pages carry one table of ég … þau, and each would claim the others' counts. `extract.own_person` keeps
  the headword's own person, number and gender; an object pronoun's table (`mig`) is its subject's and is dropped.
  One verb table (`skulu`) was extracted with its subject pronouns as cells (`hann`, `hún`, `ég skal`) — `verb_rows`
  drops them, or `skulu` outranked `hann`.
- **`sá` "that" TOOK `það`'s COUNT**: `það`, `þá`, `því` and `þess` are also cases of the demonstrative `sá`, which is
  also a verb ("to sow"; the past of sjá), so the closed-class rule's common-verb exception split all four — `sá`
  was dealt third. `extract.OWN` gives the four spellings to their own words; `sá` is read as the pronoun
  (`select.FILL_POS`).
- **NOUN BEFORE VERB**, as in Norwegian: `tala`, `elska`, `hætta`, `horfa`, `ræða`, `opna`, `loka` and `vinna` are
  listed noun first ("a speech", "love", "danger" …) and read as verbs (the inventory or `FILL_POS`); `líka` is the
  adverb "also", not the verb "to please". `bjór` is "beer" (etymology 2, not "a beaver"); `að` and `við` show both
  their etymologies (conjunction "that" and the infinitive "to"; "we" and "by, at").
- **WORDS WIKTIONARY FILES ONLY AS FORMS**: `þeir`, `þig`, `hana`, `hans`, `hennar`, `okkar`, `ykkar`, `ekkert`,
  and `hvað` "what" (whose only entry is the adverb "how") — `build_deck.FORM_WORDS` writes their cards.
- A sexual or slang sense cut by `GLOSS` (`gaman`, `ostur`, `hrísgrjón`); `lag`'s count is mostly `í lagi` "all
  right", written into its card; `ger` (yeast, its count gera's), `sama`, and the neuters `allt`, `gott`, `eitt`
  excluded (`select.EXCLUDE`); `fjandi` to `SWEARS`.

**Known, left.** The fill carries the subtitles' crime vocabulary (`drepa`, `byssa`, `skjóta`) on frequency, as
every subtitle-ordered deck on the shelf does. Two adverbs share "here" and are told apart by the dedupe pass's
label (`hér`, `hérna`). Tatoeba's Icelandic is small (10,805 pairs): nine of A1's 500 words have no sentence, and the
higher levels will have markedly fewer.

## 5. Phases

**Phase 1 (done)** — the pipeline, the alphabet and A1. **Phase 2 (done)** — A2 to C1, one level per request: write
the level's inventory into `inventory.py`, its `SCOPE` is already in `icelandic_level.py`, its
`STAMP` into `build_deck.py` (a level with none refuses to build), run, read every card, and widen the deck's
description where a level needs it. **Phase 3 (done)** — a phrases deck (Norwegian's `phrases.py`, §11).

## 6. As built (2026-11-15): the alphabet and A1

`python3 .claude/icelandic/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/icelandic-cache/` (gitignored, ~560 MB, BÍN's CSV 377 MB of it).
`python3 .claude/icelandic/alphabet.py` writes the alphabet deck from `lex.json`. `node .claude/icelandic/check-icelandic.js`
is the check. **A re-run is byte-identical** (verified, extract included). A1: 500 notes, 354 from the inventory and
146 by frequency; three sentences for 473, none for 9. Every card was read. The alphabet: 39 notes.

The shelf's hue is measured (`lang-icelandic` in `app.js`): swept against all 74 other hues inside the shelf's band,
the magenta band's standing rejection kept and the greens left out. The raw winner, a deep indigo (`#333C81`), stood
13.2 from the blue of Iceland's flag and was refused, as Finnish refused its flag's blue; the runner-up, `#303696`, an
ultramarine, is 14.1 from its nearest (Urdu) and 23.2 from the flag. Re-swept at the merge with main (2026-11-16)
against all 78 other hues, Khmer, Yoruba and Lao having arrived: it is now the winner outright, unchanged.

## 7. As built (2026-11-16): A2

Asked for on 2026-11-16: "Add A2." `python3 .claude/icelandic/run.py --level a2`; the same stages, no new source.
**750 notes: 271 from a 19-topic inventory** (`inventory.py` `A2`, Norwegian's A2 topics in Icelandic: seasons and
dates, numbers to a million, the land and nature — glacier, volcano, waterfall and fjord among them —, weather,
animals, clothes, the home and kitchen, food and cooking, work, school, travel, the town, health, feelings, free
time, verbs, describing, time words, connectors — `SCOPE['a2']`) **and 479 by frequency**; three sentences for 561,
none for 74. Every card was read. A1 re-runs byte-identical after every change below, and A2 re-runs byte-identical
with the extract rebuilt. Twelve inventory words are not Icelandic headwords in the extract and were replaced or
dropped (`útlönd` → `útland`, `frítími` → `skemmtun`, `áhugaverður` → `áhugi` and `áhugasamur`, `þó að` → `þó`;
`korter`, `hitastig`, `samstarfsmaður`, `seinkun`, `áhyggjufullur`, the participle `lokaður`, `sem sagt` and
`annaðhvort` dropped).

**What the A2 ranking turned up**, each fixed with its reason beside it:
- **Noun before verb, again** (`select.FILL_POS`, or a part of speech in the inventory): `breyta` (not "a variable"),
  `renna`, `velta`, `kanna`, `kveðja`, `vísa`, `skella`, `hrífa`, `greiða` (not "a comb"), `enda` (not the
  conjunction); `meðal` is the preposition "among", not "a medicine". `ETYMS` takes `kokkur` "a cook" (not "a cock")
  and puts `lok` "an end" before "a lid".
- **A count that is another word's** (`select.EXCLUDE`): `betra` and `minna` (the comparatives "better", "less",
  whose entries are rare verbs), `ber` (bera's present), `reiða` (a form of reiður), `síður` (the adverb "less,
  rather"), `næsta` (næstur's feminine), `aftann` (aftan "from behind"), `gær` (met only in í gær), and `hey`, the
  English interjection.
- **Curses and insults** to `SWEARS`: `fjandans`, `fjári`, `fífl`, `hálfviti`, `auli`, `bjáni`, `rass`, `kjaftæði`.
  A drug or sexual sense cut by `GLOSS` (`gras`, `ríða`, `hæna`'s slang); `dreyma` and `drífa` written with how
  they are used (mig dreymdi; drífðu þig!); `óþarfi` written as "something unnecessary".

**Known, left.** The fill carries the subtitles' crime and war vocabulary (`myrða`, `morðingi`, `vopn`, `fangelsi`,
`hershöfðingi`) on frequency, as A1 does and every subtitle-ordered deck on the shelf does.

## 8. As built (2026-11-16): B1

Asked for on 2026-11-16: "Add B1." `python3 .claude/icelandic/run.py --level b1`. **1,000 notes: 175 from a 16-topic
inventory** (`inventory.py` `B1`, Norwegian's B1 topics in Icelandic: work and the economy, society and politics —
`ríkisstjórn` —, media and technology, the environment — `jarðskjálfti`, `hraun` —, education,
relationships, housing, health, travel, culture, feelings and opinions, explaining and arguing, B1 verbs, judging
adjectives, time words, connectors — `SCOPE['b1']`) **and 825 by frequency**; three sentences for 384, **none for
291** — Tatoeba's Icelandic is thin at this level (`stéttarfélag`, `uppþvottavél`, `blóðþrýstingur`), and the
description states how many carry sentences. Every card was read; A1 and A2 re-run byte-identical, and B1 re-runs
byte-identical with the extract rebuilt. **Fifteen inventory words are not headwords in the extract** and were
dropped by `select.py` (`hagkerfi`, `yfirvinna`, `alþingi`, `raðhús`, `húsgögn`, `ferðaskrifstofa`,
`skoðunarferð`, `listamaður`, `stolt`, `mistakast`, `efnahagslegur`, `yfirvöld`, `að lokum`, `stöðugt`, `hins
vegar`). *Correction, 2026-11-16:* this section first said every word was found — the run's "NOT IN WIKTIONARY"
line was missed by a filter that matched the wrong case. The fifteen were taken out of `inventory.py` with B2; the
deck did not change by a byte, since `select.py` had always dropped them.

**What the B1 ranking turned up**, each in `select.py` or `build_deck.py` with its reason:
- **A count that is another word's** — more than at A2: `má` (mega's present), `var` (vera's past), `fær` (fá's
  present), `ver`, `húfur` (húfa's forms), `þinur` (þinn's forms), `dá` (deyja's), `parís` (the city), `æja` (the
  interjection æ), `me` (English), `pat` (the name), `mattur`; `sumur`, the singular of A2's `sumir`; `dauðans` and
  `seyðir`, a genitive and a set-phrase word.
- **A sense chosen**: `skemma`, `jafna`, `stytta`, `hella` and `spá` read as verbs, `sturta` "a shower" and `þyrla`
  "a helicopter" as nouns (`FILL_POS`); `benda` "to point", `vasi` "a pocket" and `hagur` "an advantage" by their
  second etymology (`ETYMS`); `hvetja` "to encourage" and `innflytjandi` "immigrant" lead (`LEAD`).
- **Curses, insults and slang** to `SWEARS` (`skratti`, `fjárans`, `fáviti`, `rassgat`, `drullusokkur`, `píka`,
  `hommi`, `pissa`) or excluded (`gella` and `skutla`, slang for a woman; `totta`); `nauðga` excluded, as Norwegian
  excluded voldta. A sexual or vulgar sense cut by `GLOSS` (`kóngur`, `spilla`, `drusla`, `drasl`, `rugl`, `tíð`);
  `seyði` written with `á seyði` "going on", `hlakka` with `hlakka til`, `skjár` as "screen", `grey` "poor thing"
  first.

**Known, left.** The subtitles' crime, war and fantasy vocabulary is heavier here than at A2 (`gísl`,
`hryðjuverkamaður`, `riffill`, `sjóræningi`, `dreki`), and some plain body words (`typpi`, `eista`, `pungur`) come in
on frequency — plain words, not slang, as Norwegian B2 left them. `benda`'s card has no present: BÍN's forms reach
only a lemma's first verb entry, and `benda` "to point" is its second.

## 9. As built (2026-11-16): B2

Asked for on 2026-11-16: "Add B2." `python3 .claude/icelandic/run.py --level b2`. **1,500 notes: 82 from a 13-topic
inventory** (`inventory.py` `B2`, Norwegian's B2 topics in Icelandic: the economy, politics, law, science and
technology, the environment — `jarðhiti`, `loftslagsbreyting` —, health and society, media, culture and society, the
abstract nouns of discussion, arguing and reasoning, B2 verbs, evaluating adjectives, formal connectors —
`SCOPE['b2']`) **and 1,418 by frequency**; three sentences for 240, **none for 833** — more than half the deck, as
with Norwegian B2: Tatoeba's Icelandic has almost no formal vocabulary, and the description says how many carry
sentences. Every card was read; A1 to B1 re-run byte-identical, and B2 re-runs byte-identical with the extract
rebuilt. **English Wiktionary's Icelandic is thin in formal vocabulary**: forty-seven of the inventory's words are
not headwords (`fjárfesting`, `útflutningur`, `auðlind`, `uppgötvun`, `túlka`, `viðhalda`, `varðandi` …): forty-three
were removed and four replaced by a form the extract has (`kosningar` → `kosning`, `loftslagsbreytingar` →
`loftslagsbreyting`, `fordómar` → `fordómur`, `réttarhöld` → `lögbrot`), and seven civic words added that it does
have (`skattur`, `frambjóðandi`, `ríkisborgari`, `atkvæði`, `sjálfstæði`, `aðgerðasinni`, `heilbrigði`). A graded
lexicon would change this level most.

**What the B2 ranking turned up**, each in `select.py` or `build_deck.py` with its reason:
- **A count that is another word's**: `gat` (geta's past), `borinn` and `lagður` (participles), `gula`, `ranga`,
  `falda`, `stríður`, `skyldur` and `móður` (other words' forms), `met` ("a record", which its entry does not give),
  `kínverji` (Kínverji, "a Chinese person"), `gemsi` (slang, "a mobile"), `kringja`, `kefja`; English words (`not`,
  `for`, `lost`, `ok`) and names (`patt`); two letters' names and two Greek letters; words met only in a set phrase
  (`eð`, `kennsl`, `blasa`). `rita` is read as "to write", not "a kittiwake".
- **Slang, sexual words and slurs** excluded (`ljóska`, `sæta`, `graður`, `káfa`, `fróa`, `mök`, `kynmök`, `runka`,
  `nauðgun`; `svertingi`, a dated term for a black person now offensive; `öfuguggi`, a slur) or to `SWEARS`
  (`tæfa`, `ansans`, `árans`, `helvískur`, `mella`, `flón`, `heimskingi`, `kúkur`, `úrþvætti`); a drug or sexual
  sense cut by `GLOSS` (`sýra`, `sæði`, `limur`); `vonast` written with `vonast til`.

**Known, left.** The fill is heavier still with the subtitles' crime, war and fantasy vocabulary (`leyniskytta`,
`handsprengja`, `vampíra`, `uppvakningur`, `hobbiti`), and carries some plain words of sex and drugs (`klám`,
`kókaín`, `heróín`, `vændiskona`, `geirvarta`) on frequency — plain words, not slang, as Norwegian B2 left them.

## 10. As built (2026-11-16): C1

Asked for on 2026-11-16: "Add C1." `python3 .claude/icelandic/run.py --level c1`. **1,500 notes: 63 from an 8-topic
inventory** (`inventory.py` `C1`, Norwegian's C1 topics in Icelandic: academic and intellectual, society and
governance, the economy, ethics and the mind, language and rhetoric, abstract nouns of analysis, verbs and adjectives
of argument, formal connectors — `SCOPE['c1']`) **and 1,437 by frequency**; three sentences for 115, **none for
1,085** — nearly three quarters of the deck; Tatoeba's Icelandic has almost nothing at this register, and the
description states how many carry sentences. Every card was read; A1 to B2 re-run byte-identical, and C1 re-runs
byte-identical with the extract rebuilt. **The inventory was checked against the extract before it was written**,
after B1 and B2: of a first draft of 155 candidates, 57 are not headwords (`siðfræði`, `fullveldi`, `orðræða`,
`skilgreina`, `endurspegla`, `fjármál`, `persónuleiki`, `dómgreind` …) and 35 were already taught below, which
leaves 63. A graded lexicon would change this level most.

**The fill at this depth is the subtitles' long tail**, as Norwegian C1's was: many everyday nouns a C1 learner may
know from B-level life (`tannbursti`, `sólgleraugu`, `hnetusmjör`) beside formal ones.

**What the C1 ranking turned up**, each in `select.py` or `build_deck.py` with its reason:
- **A count that is another word's**: `verður` (verða's present), `lá` (liggja's past), `mat` (matur's accusative),
  `manna` (maður's genitive plural), `men`, `endur` (önd's plural), `æður`, `daglegt` (a neuter); English (`at`,
  `art`, `set`, `il`) and names (`kurt`, `adda`, `bambi`); slang its entry does not give (`pæla` "to think about",
  `jóna` "a joint"); musical notes and Greek letters; words met only in a set phrase (`skefjar`, `kinka`, `mund`,
  `mannavillt`, `hylma`, `aðsig`). `kapall` is "a cable" (etymology 2, not "a mare"); `alast` is written with
  `alast upp` "to grow up".
- **`heldur` "but, rather" lost its count to `halda`**, whose present it also is — as Norwegian's `når` did to `nå`:
  its own spelling is met 6,249 times, but the split dealt it 36, so a conjunction a beginner needs (`ekki þetta
  heldur hitt`, "not this but that") arrived only at C1. The card leads with the conjunction (`ETYMS`), dropping the
  rare adjective "sturdy". Giving it the spelling outright (`extract.OWN`) would move it into A1 and reorder every
  shipped level, so it is left here and recorded.
- **Sexual words and slurs** excluded (`standpína`, `samfarir`, `munnmök`, `tott`, `snípur`, `hreðjar`, `skvísa`,
  `tittlingur`'s slang …; `surtur`, a racial slur) or to `SWEARS` (`fokking`, `perri`, `lessa`, `viðrini`, `ári`,
  `hóruhús`, and the childish `kúka`, `prumpa`, `freta`).

**Known, left.** The subtitles' crime and war vocabulary (`fjöldamorð`, `launmorðingi`, `jarðsprengja`) and some plain
words of the body, sex and drugs (`leggöng`, `kynfæri`, `skyndikynni`, `hass`, `vændi`) on frequency, as at B2.

## 11. As built (2026-11-16): the phrases deck

Asked for on 2026-11-16: "Add a phrases deck." `python3 .claude/icelandic/run.py --level phr` (after all five levels);
the selection stage is `phrases.py`, Norwegian's arrangement with its five subdecks. **734 expressions: 109
Phrases, 156 Fixed expressions, 336 Particle verbs, 102 Idioms, 31 Proverbs** — **every expression that passes the
filters**, no cap reached (the particle verbs' cap was raised from 250 to 400 to take all of them), and the
description says so. Nothing a level teaches is taught again (`góðan daginn`, `í dag`, `þess vegna`, `þar af
leiðandi` are the levels'). 200 of the 734 occur in Tatoeba; 197 carry a sentence, 98 of them three. Every card was
read; the alphabet and A1 to C1 re-run byte-identical, and the deck re-runs byte-identical with the extract rebuilt.

- **Classification and order** are Norwegian's: a proverb is Wiktionary's `proverb`; an idiom has a sense tagged
  `idiomatic`; a particle verb is a multi-word `verb` with no such tag; a fixed expression is a multi-word `adv`,
  `prep` or `conj`; a phrase is a `phrase` / `intj` / `prep_phrase`. Within a subdeck, Tatoeba sentences containing
  the expression (a particle verb's first word in any form of its verb — BÍN's present included), then the
  frequency estimate. The deck's description credits BÍN for that.
- **`EXCLUDE`** (each with its reason): phrasebook sentences built from level words (`ég elska þig`, `ég er ekki
  trúaður`, `borða morgunmat` — the Hindi, Turkish, Swedish and Norwegian rule; the formulas asked and answered
  whole, `ég skil ekki`, `ég veit það ekki`, `talar þú ensku`, stay); one formula in many languages (`talar þú
  þýsku`, `… japönsku`, `… latínu` — ensku is taught) and its bare template (`hvað er þetta á`); a pointer or a
  second form of one expression (`sitt af hverju`, `je minn`, `teningnum er kastað`, `láta eins og vind um eyru
  þjóta`), a misspelling (`hafa áhunga á`) and a mis-identification Wiktionary itself labels (`að vera heitt í
  hamstri`); Danish (`ekki með fulle fem`), a colloquial spelling (`akkuru ekki`), a geometer's term; `alast upp`,
  which C1's `alast` card is written as; sexual expressions and curses (`ríddu mér`, `fá það`, `sofa hjá`, `fróa
  sér`, `runka sér`, `fara í sleik`, `reka við`, `hver fjandinn`).

**Known, left.** Thirteen pairs share an English side and are told apart by the dedupe pass's label (`vertu sæll` /
`vertu sæl`, `oj bara` / `oj barasta`, `standa út` / `skaga fram`, `í fyrra` / `árið sem leið` …), as Wiktionary
glosses them alike — several are one greeting in its masculine and feminine forms. Five cards carry a forms line
(the particle verbs Wiktionary gives forms for); the rest carry none.
