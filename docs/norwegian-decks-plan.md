# The Norwegian language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Norwegian deck in `decks/`.** It is the plan for a
Norwegian (Bokmål) set, built in the Swedish decks' shape (`docs/swedish-decks-plan.md`, whose pipeline
`.claude/norwegian/` adapts); `docs/lang-decks.md` is the record of how every set was built, and every rule there
applies here unless this file says otherwise. Asked for on 2026-11-15: "Add a Norwegian language collection."

**STATUS (2026-11-15): the plan is complete** — all five levels, A1 to C1, and the phrases deck (`.claude/norwegian/`, §6–§11).

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
| Norwegian A2 Elementary — built | `Norwegian-A2.folio-deck.json` | 750 |
| Norwegian B1 Intermediate — built | `Norwegian-B1.folio-deck.json` | 1,000 |
| Norwegian B2 Upper Intermediate — built | `Norwegian-B2.folio-deck.json` | 1,500 |
| Norwegian C1 Advanced — built | `Norwegian-C1.folio-deck.json` | 1,500 |
| Norwegian Phrases and Expressions — built | `Norwegian-Phrases-and-Expressions.folio-deck.json` | 310 |

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

**Phase 1 (done)** — the pipeline and A1. **Phase 2 (done)** — A2 to C1, one level per session: write the level's
inventory into `inventory.py`, its `SCOPE` into `norwegian_level.py` (already written for all five) and its
`STAMP` into `build_deck.py`, run, read every card. **Phase 3 (done)** — a phrases deck (Swedish's `phrases.py`, with
particle verbs: `ta vare på`, `finne ut`).

## 6. As built (2026-11-15): A1

`python3 .claude/norwegian/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py` →
`examples.py` → `build_deck.py`, caching in `.claude/norwegian-cache/` (gitignored, ~220 MB).
`node .claude/norwegian/check-norwegian.js` is the check. **A re-run is byte-identical** (verified, extract
included). A1: 500 notes, 356 from the inventory and 144 by frequency; three sentences for 482, none for 7.
Every card was read. The shelf's hue is measured: first `#85063D`, a deep wine, which Amharic's parallel sweep also chose; re-swept at
the merge against all 72 other hues, `#896F23`, a dark ochre, 14.6 from its nearest (World History's sepia), with the
magenta band's standing rejection kept and the greens left out (`lang-norwegian` in `app.js`).

## 7. As built (2026-11-15): A2

Asked for on 2026-11-15: "Add A2." `python3 .claude/norwegian/run.py --level a2`; the same stages, no new source.
**750 notes: 295 from a 19-topic inventory** (`inventory.py` `A2`, the Swedish A2 topics in Bokmål: seasons and
dates, numbers to a million, the land and nature, weather, animals, clothes, the home and kitchen, food and
cooking, work, school, travel, the town, health, feelings, free time, verbs, describing, time words, connectors —
`SCOPE['a2']`) **and 455 by frequency**; three sentences for 596, none for 38. Every card was read. A1 re-runs
byte-identical after every change below. Nine inventory words are not Bokmål headwords — mostly participles
Wiktionary files as verb forms — and were replaced or dropped (`briller` → `brille`, `forkjølet` → `forkjølelse`,
`bekymret` → `bekymring`, `overrasket` → `overraske`, `stengt` → `stenge`; `leksjon`, `skuffet` and `blond`
dropped); `senere` "later", filed only as sen's comparative, is a `FORM_WORDS` card.

**What the A2 ranking turned up**, each fixed with its reason beside it:
- **Noun before verb, again and more often** (`select.FILL_POS`): `røre`, `vare` "to last", `banke`, `spore`,
  `hoppe` (not "a mare"), `føre`, `råde`, `dekke`, `ri`, `rekke`, `pleie`, `bringe`, `rive`, `rømme` (not "sour
  cream"), `skifte`, `sikte`, `skille`, `skjære` (not "a magpie"); `kul` is "cool", `konge` "king", `gift`
  "married". `ETYMS` takes `kart` "a map" (not "unripe fruit"), `lønn` "salary" (not "a maple"), `kurs` "a course
  of lessons" and `skuffe` "to disappoint".
- **A form taught elsewhere, or a count that is another word's** (`select.EXCLUDE`): adjective neuters and plurals
  (`raskt`, `enkelt`, `fullt`, `gode`, `hvite`), `ene`, `sett` (se's participle), `huse` (huset), `kong` (kongen),
  `kule` (kul's plural), `faste`, `bar`; `purke` and `and`, whose counts are police slang and the English word.
- A vulgar, sexual or slang sense cut by `GLOSS` (`nummer`, `ende`, `onkel`, `lande`, `gress`, `høne`, `type`);
  `mål` written as "goal" first, its fourteen Wiktionary senses leading with "a given dimension"; `ræv` to `SWEARS`.
- `drive`'s present participle, tagged a present, kept off the card (`FORM_DROP`).

**Known, left.** The fill carries the subtitles' crime vocabulary (`våpen`, `fengsel`, `drap`, `morder`, `pistol`),
as A1 does and every subtitle-ordered deck on the shelf does.

## 8. As built (2026-11-15): B1

Asked for on 2026-11-15: "Add B1." `python3 .claude/norwegian/run.py --level b1`. **1,000 notes: 235 from a
16-topic inventory** (`inventory.py` `B1`, the Swedish B1 topics in Bokmål: work and the economy, society and
politics, media and technology, the environment, education, relationships, housing, health, travel, culture,
feelings and opinions, explaining and arguing, B1 verbs, judging adjectives, time words, connectors —
`SCOPE['b1']`) **and 765 by frequency**; three sentences for 428, **none for 240** — Tatoeba's Bokmål is thin at
this level (`fagforening`, `oppsigelse`, `kosthold`), and the description states how many carry sentences. Every
card was read; A1 and A2 re-run byte-identical, and B1 re-runs byte-identical with the extract rebuilt. Fifteen
inventory words are not Bokmål headwords and were replaced or dropped (`fortjeneste` → `gevinst`, `forfremmelse`
→ `forfremme`, `epost` → `e-post`, `leietaker` → `leieboer`, `stress` → `stresse`, `påstå` → `påstand`;
`ansatt`, a participle, `storting`, a name, and seven phrases and compounds Wiktionary lacks, dropped).

**What the B1 ranking turned up**, each in `select.EXCLUDE` or a `build_deck.py` table with its reason:
- **A rare headword taking a common word's count** — more of these than at any level so far: `verk` "an ache"
  took `verken` "neither", `trette` "a quarrel" `tretten` "thirteen", `våk` "a buzzard" `våken` "awake", `helle`
  `heller`, `gasse` `gassen`, `sale` `salt`, `los` "Los Angeles", `hitle` "Hitler", `morse` `morsen` (the spoken
  "mum"); names and English (`adam`, `texas`, `lind`, `hank`, `eve`, `more`, `lake`).
- Forms and second spellings taught on another card: adjective neuters and plurals (`dypt`, `normalt`, `varmt`,
  `sterkt`, `fritt`, `rødt`, `sykt`, `dobbelt`, `dyrt`, `syke`, `onde`, `hellige`, `lyse`), `jorden`, `elsket`;
  `framtid`, `leite`, `hand` and `sort` beside `fremtid`, `lete`, `hånd` and `svart`; phrase-only words (`fjor`,
  `hjel`, `rede`, `carte`).
- Noun before verb again (`trosse`, `spy`, `øse`); `delta` and `slette` named as verbs in the inventory (not the
  Greek letter, not "a plain"); two verbs' present participles tagged presents (`FORM_DROP`).
- Sexual or vulgar senses cut by `GLOSS` (`rote`, `tenne`); `pisse`, `fanken`, `pupp` and `kjerring` to `SWEARS`;
  `voldta` excluded, as Swedish's `våldta` was.

**Known, left.** The subtitles' crime and fantasy vocabulary is heavier here than at A2 (`drapsmann`, `gissel`,
`kokain`, `vampyr`, `zombie`, `demon`) — frequency, labelled as such in the description.

## 9. As built (2026-11-15): B2

Asked for on 2026-11-15: "Add B2." `python3 .claude/norwegian/run.py --level b2`. **1,500 notes: 161 from a
13-topic inventory** (`inventory.py` `B2`, the Swedish B2 topics in Bokmål: the economy, politics, law, science
and technology, the environment, health and society, media, culture and society, the abstract nouns of
discussion, arguing and reasoning, B2 verbs, evaluating adjectives, formal connectors — `SCOPE['b2']`) **and 1,339
by frequency**; three sentences for 228, **none for 731** — very nearly half the deck, against a quarter for
Swedish B2: Tatoeba's Bokmål (14,219 pairs) has little formal vocabulary, and the description says how many carry
sentences. Every card was read; A1 to B1 re-run byte-identical, and B2 re-runs byte-identical with the extract
rebuilt. Twenty inventory words are not Bokmål headwords in the extract: four replaced (`innviklet` →
`komplisert`, `uavhengig av` → `uavhengig`, `tross alt` → `tross`, `drivhuseffekt` → `drivhus`), sixteen removed
(`konjunktur`, `arbeidsmarked`, `forskrift`, `utredning`, `journalistikk`, three multi-word verbs …), and
`objektiv`, whose only Wiktionary entry is the noun "a lens", removed rather than taught as that.

**What the B2 ranking turned up**, each in `select.EXCLUDE` or a `build_deck.py` table with its reason:
- **A rare headword taking a common word's count**, as at B1: `lever` "a liver" (the present of leve), `rev` "a
  fox" (the past of rive), `lest` (lese's participle), `ete` (ett "one"), `ør` (ører), `matte` (the colloquial
  "maths"); English words (`in`, `green`, `house`, `make`, `kid`, `boss`) and names (`turner`).
- Forms and second spellings taught elsewhere: adjective neuters and plurals (`fett`, `grønt`, `langsomt`,
  `effektivt`, `tynne`, `sure`), participles (`savnet`, `forbannet`), `katte`; `antagelig`, `hverken`, `fler`,
  `bru`, `tjukk`, `rein` and `òg` beside the spellings taught; spellings removed in 2005 (`ska`, `bye`).
- Noun before verb (`bøye` "to bend", not "a buoy"); `skjør` "fragile", not "soured milk".
- `koselig`'s "hello" and `hamburger`'s order fixed by `GLOSS`; `tispe`, `dæven`, `ludder` and `runke` to
  `SWEARS`; `kåte` and `voldtekt` excluded with `voldta`. `dømmekraft`, whose entry gives no gender, is en/ei by
  its forms (`GENDER_FIX`).

**Known, left.** The fill is heavier still with the subtitles' crime, war and fantasy vocabulary (`henrette`,
`knivstikke`, `romvesen`, `varulv`, `torpedo`) and carries some sexual vocabulary (`penis`, `vagina`, `porno`,
`kondom`) on frequency — plain words, not slang, as Swedish B2 left them.

## 10. As built (2026-11-15): C1

Asked for on 2026-11-15: "Add C1." `python3 .claude/norwegian/run.py --level c1`. **1,500 notes: 72 from a
10-topic inventory** (`inventory.py` `C1`, the Swedish C1 topics in Bokmål: academic and intellectual, society and
governance, economy, law and ethics, mind and behaviour, language and rhetoric, abstract nouns of analysis, verbs
and adjectives of formal argument, formal connectors — `SCOPE['c1']`) **and 1,428 by frequency**; three sentences
for 104, **none for 1,009** — two thirds of the deck; Tatoeba's Bokmål has almost nothing at this register, and
the description states how many carry sentences. Every card was read; A1 to B1 re-run byte-identical, and C1
re-runs byte-identical with the extract rebuilt. **Thirty-seven inventory words are not headwords** in the Bokmål
extract (`empiri`, `rettsstat`, `integritet`, `resonnement`, `forutsigbarhet`, `problematisere`, `utlede` …) and
were removed: English Wiktionary's Bokmål is thin in formal vocabulary, so the inventory carries half of Swedish
C1's.

**The fill at this depth is the subtitles' long tail**, as Swedish C1's was: many everyday nouns a C1 learner may
know from B-level life (`tannbørste`, `popkorn`, `kattunge`) beside formal ones. A graded lexicon would change this
level most.

**What the C1 ranking turned up**, each in `select.EXCLUDE` or a `build_deck.py` table with its reason:
- A rare headword taking a common word's count: `bedre` "to improve" (the comparative "better"), `kopper`
  "copper" (cups), `tiende` "a tithe" (the ordinal "tenth"), `bur`, `lam`, `gange`, `hiv`; names (`leif`, `loke`,
  `balboa`, `pentagon`) and English (`ass`, `bridge`, `die`, `rape`, `sake`, `rise`, `sole`).
- Adjective neuters used as adverbs, a dozen (`strengt`, `mentalt`, `sosialt`, `lokalt` …), `lukket`; `tyve`,
  `hu` and `broder` beside `tjue`, `hun` and `bror`; spellings removed in 2005; phrase-only words (`forhånd`,
  `frifot`, `henhold`).
- `abstrakt` named as the adjective (its first entry is "an abstract"); `pung` and `trekant` lose a sexual sense;
  `soper`, `tøs` and `faenskap` to `SWEARS`; `onanere`, `pervo` and `voldtektsmann` excluded.
- **A fix that reaches B2**: a language's name takes no article (`jeg snakker dansk`), and B2's `dansk` was
  printed "en dansk" — `dansk` and `latin` join `NO_ART` and `check-norwegian.js`'s list. That one B2 card is the
  only change to a lower level (verified card by card).

**Known, left.** The subtitles' crime and war vocabulary (`massakre`, `halshugge`, `attentat`) and some plain
sexual vocabulary (`orgasme`, `ereksjon`, `samleie`) on frequency, as at B2.

## 11. As built (2026-11-15): the phrases deck

Asked for on 2026-11-15: "Add a phrases deck." `python3 .claude/norwegian/run.py --level phr` (after all five
levels); the selection stage is `phrases.py`, Swedish's arrangement with **one subdeck Swedish did not have —
FIXED EXPRESSIONS**, the multi-word adverbs, prepositions and conjunctions sentences are built from (`på grunn av`,
`i stedet for`, `til og med`, `med andre ord`): the Bokmål extract files more of them than it does particle verbs,
and a word list cannot see them. **310 expressions in five subdecks**: 100 Phrases, 94 Fixed expressions, 46
Particle verbs, 50 Idioms, 20 Proverbs — **every expression that passes the filters**, no cap reached: English
Wiktionary lists far fewer Bokmål expressions than Swedish ones (Swedish's deck chose 830 from about 1,700), and
the description says so. Nothing a level teaches is taught again (`av og til`, `god morgen`, `i dag` are A1's).

- **Classification**, Swedish's plus one rule: a proverb is Wiktionary's `proverb`; an idiom has a sense tagged
  `idiomatic`; a particle verb is a multi-word `verb` with no such tag; a fixed expression is a multi-word `adv`,
  `prep` or `conj`; a phrase is a `phrase` / `intj` / `prep_phrase`. The highest wins. Latin, Italian and French
  loans (`a priori`, `ad hoc`, `a cappella`, `anno domini`) are filtered by their opening preposition or their
  words (`phrases.LOAN_START`, `FOREIGN`), and the Latin that got through by another part of speech excluded.
- **Order**: Tatoeba sentences containing the expression (a particle verb's first word in any form of its verb),
  then the frequency estimate. 115 of the 310 occur in Tatoeba; 115 carry a sentence, 50 of them three.
- **A FILTER THAT WAS TOO WIDE**: the phrases deck drops Wiktionary's pointer senses ("See ta sig"), and Swedish's
  pattern matched case-insensitively — so `vi sees` "see you" lost its only gloss and printed an empty English
  side. The pattern is case-sensitive now (`build_deck.english`); the levels are unaffected (byte-identical).
- **`EXCLUDE`** (each with its reason): phrasebook sentences built from level words (`jeg elsker deg`, `jeg er
  sulten`, `tror du på Gud` — the Hindi, Turkish and Swedish rule; the formulas asked and answered whole, `jeg vet
  ikke`, `hvordan går det`, `snakker du engelsk`, stay); the second spelling of one expression (`intet problem`,
  `godt nytt år`, `hokuspokus filiokus`); Nynorsk (`i ein fei`, `til dømes`) and spellings removed in 2005; a
  sexual sense (`gå til sengs med`), a film title, a slogan, a geographer's term filed as an idiom.
- `tusen takk` and `mange takk` shared "many thanks"; `tusen takk` is written "thank you very much (literally: a
  thousand thanks)" in `GLOSS`.

**Known, left.** Two pairs share an English side and are told apart by the dedupe pass's label (`på fersken` /
`på fersk gjerning`, `side om side` / `side ved side`), as Wiktionary glosses them alike. The particle-verb
subdeck is small (46) because Wiktionary lists few Bokmål particle verbs, not because the deck caps them.
