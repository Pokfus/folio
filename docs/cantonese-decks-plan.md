# The Cantonese language decks — the plan (Nov 2026)

**Read this before building, or changing the plan for, any Cantonese deck in `decks/`.** It is the plan for a
language set in the shape of the ones already shipped, Thai's above all (`docs/thai-decks-plan.md`);
`docs/lang-decks.md` is the record of how those were built, and every rule there applies here unless this
file says otherwise. Asked for on 2026-11-15: "Add a Cantonese language collection."

**STATUS (2026-11-15): the Jyutping and Tones deck, A1, A2 and B1 are built** (`.claude/cantonese/`, §6–§8).
B2, C1 and a phrases deck are planned, one per session.

A deck under `decks/` is community content, not a change to Folio: **no changelog line and no version bump**
for any deck this plan produces. The collection's first commit carried one because it also changed the APP —
the shelf's hue in `app.js`.

## 1. The decisions (2026-11-15)

The request named no word source, script deck or romanisation. The owner's answers for the same request in
other languages (Hindi, Thai) were taken rather than asked again — **they are the owner's to overturn**:

1. **Word source: CEFR A1–C1, assembled** (the Thai / Hindi / UKBI arrangement). No examination publishes a
   graded Cantonese word list — there is no Cantonese HSK, and Hong Kong's own language tests examine written
   Chinese — so each level is a hand-written topic inventory (`inventory.py`) scoped to the CEFR global
   descriptor for its band, topped up with the commonest remaining words of spoken Cantonese. Each deck's
   description says so. Sizes as Thai's: **A1 500 · A2 750 · B1 1,000 · B2 1,500 · C1 1,500 notes**, then a
   phrases deck.
2. **SPOKEN Hong Kong Cantonese, in TRADITIONAL characters.** The words are the ones people say (佢 not 他, 喺
   not 在, 嘢 not 東西, 睇 not 看); written Chinese in Hong Kong is close to Mandarin, and a Cantonese learner is
   learning to speak. The simplified form is printed beneath where it differs, for a reader who learnt
   characters on the mainland.
3. **Jyutping on every card**, with its tone digits: a syllable on the wrong one of the six tones is another
   word (si1 poem, si2 history, si3 to try, si4 time, si5 market, si6 matter). Jyutping is the Linguistic
   Society of Hong Kong's system and HKCanCor's, CC-Canto's and Tatoeba's — every source already writes it.
4. **A Jyutping and Tones deck first, in place of a script deck.** Characters are not an alphabet; there is no
   short list that unlocks the rest, so they are taught a word at a time in the levels. What can be learnt
   first is the romanisation and the tones.
5. **This session: plan + sounds deck + A1**; later levels one per session.

| deck | file | notes |
|---|---|---|
| Cantonese Jyutping and Tones — built | `Cantonese-Jyutping-and-Tones.folio-deck.json` | 39 |
| Cantonese A1 Beginner — built | `Cantonese-A1.folio-deck.json` | 500 |
| Cantonese A2 Elementary — built | `Cantonese-A2.folio-deck.json` | 750 |
| Cantonese B1 Intermediate — built | `Cantonese-B1.folio-deck.json` | 1,000 |
| Cantonese B2 Upper Intermediate | `Cantonese-B2.folio-deck.json` | 1,500 |
| Cantonese C1 Advanced | `Cantonese-C1.folio-deck.json` | 1,500 |
| Cantonese Phrases and Expressions | `Cantonese-Phrases-and-Expressions.folio-deck.json` | — |

## 2. Sources and licences

| what | source | licence |
|---|---|---|
| meanings of the shared Chinese vocabulary | CC-CEDICT (MDBG, `cedict_1_0_ts_utf-8_mdbg.txt`, downloaded live) | CC BY-SA 4.0 |
| Jyutping of CC-CEDICT's entries | `cccedict-canto-readings-150923` (Pleco, cantonese.org) | CC BY-SA 3.0 |
| Cantonese words, their meanings and Jyutping | CC-Canto `cccanto-170202` (Pleco, cantonese.org) | CC BY-SA 3.0 |
| frequency, parts of speech, the reading people use | HKCanCor, the Hong Kong Cantonese Corpus (Luke Kang Kwong, 1997–98), read out of the PyCantonese 5.0.0 wheel (pinned by URL; unzipped, never installed) | CC BY 4.0 |
| frequency, example sentences and their Jyutping | Tatoeba `yue` exports (sentences, transcriptions, links to English) | CC BY 2.0 FR |
| level scope | CEFR global scale (Council of Europe), quoted | — |
| speakers (`LANGS`) | Yue Chinese: 85 million L1 (Ethnologue 28th ed., Wikipedia's Yue Chinese infobox), 86 total (Wikipedia's "List of languages by total number of speakers"), read 2026-11-15. The Cantonese article's infobox has no figure; standard Cantonese is by far Yue's largest variety | — |

**English Wiktionary (kaikki) is NOT used**, unlike every other set since Hindi: its Chinese extract is 1.2 GB
and files every Sinitic variety under one heading, while CC-Canto and CC-CEDICT's readings are already
Cantonese, already Jyutping, and small. **hermitdave/FrequencyWords has no Cantonese list**, and a written
Chinese list would count Mandarin-like written forms: HKCanCor is transcribed SPEECH, hand-segmented and
hand-romanised, which is exactly the register the decks teach.

CC-CEDICT and Tatoeba are downloaded live (not pinned), as in the Thai and Hindi pipelines; a re-run on a later
download can therefore move. The Pleco files are fixed releases and the HKCanCor wheel is pinned.

## 3. The card

One note, two templates (Cantonese → English, English → Cantonese), `speechLang: 'zh-HK'`. Fields:
`Cantonese` (the traditional headword), `Jyutping`, `Simplified` (only where it differs), `Word` (what the
speaker reads; also what `words_below` reads off a shipped deck), `English` (a part-of-speech line and up to four
glosses), `Examples` (up to three; the Jyutping line under a sentence only where it can be trusted, §4). The
CSS is `.claude/cantonese/card.css` (Thai's, with the headword sized for Han characters and `.uc-sc` for the
simplified line — not `.uc-simp`, which is Mandarin's headword class).

**No forms** — Cantonese does not inflect. **No classifier line**: CC-CEDICT's `CL:` is Mandarin's, and
Cantonese often counts a noun with another classifier (a dog is 一隻狗, Mandarin 一條狗), so printing it would be
wrong exactly where it matters. The classifiers are a topic of the A1 inventory instead (個 隻 本 架 張 件 杯 碗 條
間 對 次 樣 枝 包 粒 位).

**The part of speech is HKCanCor's**: the tag the corpus's annotators gave the word in this reading most often,
in plain English (`build_deck.POS`). A word the corpus lacks shows CC-Canto's own label where it has one, and
otherwise none — CC-CEDICT gives none.

## 4. What Cantonese needs that no earlier set did — the findings

- **A CARD IS A WORD IN ONE READING** (`select.py`). A character's readings are often different words: 呢 ne1
  is the question particle and 呢 ni1 "this"; 行 haang4 "to walk" and hong4 "a trade". The key is characters +
  Jyutping, and the inventory names a reading with `:` (`呢:ne1`, `嚟:lai4`, `喇:laa3`, `零:ling4`). Without
  one, the reading HKCanCor's speakers use most leads; Tatoeba's counts are never the first test — its Jyutping
  is machine-made, and on 佢 it prefers the casual heoi5 (21,000 per million) to the keoi5 HKCanCor's
  transcribers wrote (18,400).
- **THE READINGS FILE IS FROM 2015** (`extract.py`). CC-CEDICT has grown since, so an entry is joined to its
  Jyutping on (traditional, simplified, pinyin), with `u:` read as `v`; where the pinyin differs ("also pr.",
  下面 xia4 mian4 against the file's xia4 mian5) and the file has ONE reading for the pair, that one is taken.
  A CC-CEDICT entry the file never knew takes HKCanCor's reading where the corpus gives the word exactly one
  (47 entries — 喺 hai2 "to be at" is one: in CC-CEDICT, in neither Pleco file). Nothing is read off
  character by character.
- **NOT EVERY "READING" IS JYUTPING** (`yue.valid`). CC-Canto's 成日 is "seng4 yat6" — y is Yale's initial,
  not Jyutping's — and Tatoeba's transcriptions hold the odd stray. Every syllable is matched against
  Jyutping's initials and finals, and a reading that fails is not a reading. `check-cantonese.js` asserts the
  same on every shipped card, and one syllable per character.
- **THE SAME SENSES, ORDERED BY HISTORY** (`build_deck.SHOW`). Both dictionaries list a character's senses
  Mandarin-first and oldest-first, so the everyday Cantonese one is often late: 讀 opened on "comma", 落 on "to
  leave out", 比 on "Belgium", 水 on "Shui ethnic group", 涼 on the Five Liang of the Sixteen Kingdoms, 走 on
  "to walk" (in Cantonese it is "to leave", 行 is to walk), 喊 on "to yell" (in Cantonese, "to cry"). `SHOW`
  names which of a word's OWN glosses to show and in what order — about 100 rows, each read off its card; a
  gloss it names that the dictionaries lack stops the build.
- **UNTAGGED SLANG** (`build_deck.JUNK`). CC-Canto files vulgar senses with no tag: under 細佬 "younger
  brother", 七 "seven", 九 "nine" and 比 "to compare", and 黃色 "yellow" carries "pornographic". `JUNK` drops
  them, with place names, surnames, ethnic groups and radicals; `check-cantonese.js` fails if one gets
  through. The numbers have `SHOW` rows of their own (四 had "labourer", 八 "to nose around").
- **HKCanCor's SPELLINGS** (`yue.FOLD`). The corpus writes particles in characters no primer uses: 𡃉 for 㗎
  (gaa3, 1,810 tokens), 囖 for 囉, 嚹 for 喇, 𡁵 for 緊, 𠸏 for 嘅, 𠻹 for 添. Each is folded onto the dictionary's
  spelling for COUNTING only, and each row names the syllable both sources give it.
- **TATOEBA'S TRANSCRIPTION IS ITS SEGMENTATION** (`extract.cut`). Chinese is written without spaces, but
  Tatoeba transcribes its Cantonese a word at a time ("Tom daat⁶ m⁴dou² Mary …"), so each word's syllable count
  says how many characters it covers. A sentence the transcription does not account for exactly is not cut and
  not used (3,526 of 16,516); 998 sentences in simplified characters are left out (a character CC-CEDICT knows
  only as simplified). A word is found in a sentence only on these cuts (日 is never found inside 今日), and
  only in its own reading — unless the other reading shares a gloss, as 佢 keoi5 and heoi5 do.
- **THE SENTENCE'S JYUTPING IS SHOWN ONLY WHERE IT CAN BE TRUSTED** (`examples.py`). Tatoeba writes 冇 as mou2
  some 2,500 times where HKCanCor and both dictionaries have mou5; a sentence's romanisation is printed only
  when every word in it that the dictionaries hold carries one of their readings (942 of the 1,082 sentences
  used).
- **LONG PARAGRAPHS** — Tatoeba's Cantonese holds 1,500-character passages; nothing over 40 characters is an
  example.
- **HAND GLOSSES** (`hand.py`): four. 攰 "tired" and 晒 "all, completely" (in neither dictionary, or only as
  a variant of 曬 "to sun-dry"); 早晨 "good morning", THE Cantonese greeting, which CC-CEDICT knows only as
  Mandarin's "early morning"; and 緊, whose progressive sense CC-Canto has split across three glosses and
  misspelt. Each reading is HKCanCor's; each line says why.
- **EXCLUDED FROM THE FILL**: 可 (a bound form), 喀 (HKCanCor's hesitation haak6; the dictionaries' 喀 is "to
  vomit"), 哋 (the plural suffix, taught inside 我哋 / 你哋 / 佢哋), and every word HKCanCor tags mostly as an
  interjection (誒, 嗯).

**Known, left.** Some readings are CC-Canto's rather than the commonest Hong Kong one (屋企人 uk1 kei5 jan4,
媽媽 maa1 maa1, 英文 jing1 man4 where speakers often say man2); 幾錢 (CC-Canto gei2 cin4), 行路 (the readings
file's hang4 lou6), 阿媽 (CC-CEDICT's sense is Taiwanese "grandma") and 嘅話 (CC-Canto's "as said") were taken
out of the inventory rather than shipped with a doubtful reading or sense. 90 of A1's 500 words have no example
sentence (Tatoeba's Cantonese–English pairs are 2,852). Some glosses keep CC-CEDICT's lexicographer's wording
("(classifier used before a noun that has no specific classifier)").

## 5. Phases

**Phase 1 (done)** — the pipeline, the Jyutping and Tones deck, A1. **Phase 2** — A2 (done, §7), B1 (done, §8), B2 and C1, one level per
session: write the level's inventory into `inventory.py` and its `SCOPE` into `cantonese_level.py`, run, read
every card, extend `SHOW`, `JUNK`, `hand.py`. **Phase 3** — a phrases deck (CC-Canto's idioms and set phrases,
Tatoeba's short sentences).

## 6. As built (2026-11-15): the Jyutping and Tones deck and A1

`python3 .claude/cantonese/run.py [--level a1] [--no-fetch] [--re-extract]`; stages `extract.py` → `select.py`
→ `examples.py` → `build_deck.py`, caching in `.claude/cantonese-cache/` (gitignored, ~160 MB);
`python3 .claude/cantonese/sounds.py` writes the sounds deck (reads `lex.json`). `node
.claude/cantonese/check-cantonese.js` is the check. **A re-run is byte-identical**, verified from an empty cache
(every source downloaded afresh) and again with `--no-fetch`.

**A1**: 500 notes — 490 from the inventory (22 topics), 10 by frequency (噉, 即係, 嘢, 噉樣, 咁, 來, 其實, 嘞, 咪,
下, since A2's change to the fill, §7; first built with 以, 而, 面 and 度 in place of the last four); sentences
for 410, three for 317; 209 show a simplified form; four hand glosses.

**The Jyutping and Tones deck**: 39 notes — the six tones on si, the checked syllables, eleven initials spelt
unlike English (b p d t g k gw kw ng j z c), and twenty vowels, diphthongs and syllabic m and ng. Each example
word's Jyutping and meaning are asserted against the dictionaries; the IPA is derived from the Jyutping by the
standard correspondence (`sounds.ipa`); every sound side and every spelling unique (asserted). `levelRank`
sorts it before A1 (`/\bJyutping\b/`).

The shelf's hue is measured, `#86522A` (a russet). The first sweep chose an ochre, `#8C7126`, 14.3 from World
History's sepia; Norwegian's parallel session then took `#896F23`, 1.0 from it, and the re-sweep at the B1 merge
against all 97 other hues (greens and the magenta band left out, as for Hebrew) found the russet, 14.1 from its
nearest neighbours (Mesopotamia's umber and India's geography red).

## 7. As built (2026-11-15): A2

On request ("Add A2"). `python3 .claude/cantonese/run.py --level a2`. 750 notes: 451 from the A2 inventory (16
topics, `inventory.py` `A2`), 299 by frequency; A1's cards are not repeated (`words_below` now reads 'word|jyutping'
keys off the shipped deck, and an inventory word A1 teaches is skipped unless a second reading is named).
Sentences for 409, three for 218 (Tatoeba's Cantonese is thin past the first words); 358 show a simplified form;
no hand glosses. Both levels re-run byte-identical (verified, `--re-extract`).

- **THE FILL IS RANKED BY HKCanCor ALONE** (`select.py`, `HK_MIN = 3`). Ranked by the two corpora's summed rate,
  A2's fill was mostly single characters that are not spoken words: 斯, 尼, 姆, 菲, 蘭 (pieces of transliterated
  names Tatoeba's machine segmenter splits apart), and the literary 者, 之, 於, 所. HKCanCor is cut by hand, so its
  counts are words; ranked by it, the fill is spoken Cantonese — 犀利, 好彩, 黐線, 搞笑, 撳, 嘥, 啩, 不嬲, 直程.
  Tatoeba still contributes to the dealing order and the examples. The change reached A1's fill too (four of its
  ten words, §6); A1 had not been merged, so no reader held the old deck.
- **`EXCLUDE` grew** (`hand.py`): the surnames HKCanCor's speakers name people by (陳 李 黃 郭 黎), a station name
  (亞視), numbers built of numbers taught (一百, 二十 …), hesitations not tagged as interjections (嗯 呵 呃 嘿), 哩,
  俾 (Hong Kong's everyday spelling of 畀 "to give", which the dictionaries gloss "to cause" first), 隊 (HKCanCor's
  deoi2 is slang), 英 (a bound form), and A1's withdrawn 嘅話 and 阿媽 so the fill cannot bring them back.
- **About 50 more `SHOW` rows**, read off every card: 天橋 had opened on two districts of Jinan and Beijing, 大方
  on "expert; scholar; mother earth" (it is "generous"), 乾 on a trigram, 明 on the Ming dynasty, 越 on the
  ancient Yue peoples, 易 on the I Ching, 曳 on "inferior" (in Hong Kong, "naughty"), 貓 on "modem", 豬 on "a
  virgin", 老闆 on a brand, 加 on Canada.
- **A Taiwanese sense is shown only when there is no other** (`gloss_list`): 幼稚園 is CC-CEDICT's "kindergarten
  (Tw)" and was dropped whole before; 感冒 keeps "(Tw) to detest" out.
- **Readings named in the inventory**: 椅:ji2 (ji1 is a tree), 碟:dip6 (dip2 is "CD"), 曳:jai5.
- **Left out, with the reason**: 訓 and 襟 (another word than the one meant: 瞓 "to sleep" is A1's 瞓覺, and the
  fill brought 瞓 itself), 屙肚 (CC-Canto's gloss is "to defecate"; the word is "diarrhoea"), 好過 (CC-CEDICT's sense
  is "to have an easy time", not "better than"), 還 (its waan4 entry carries Mandarin hái's "still"), 執 and 傾
  (their everyday senses, "to tidy" and "to chat", are not among their glosses), 膊頭 (CC-Canto's gloss is a
  stray sentence). Not in either dictionary and dropped by `select.py`: BB 份工 T恤 叫嘢食 凍飲 少甜 執屋 露台 酒店房 月台
  好脾氣 唱K 未試過 唔鍾意 差過.

## 8. As built (2026-11-15): B1

On request ("Add B1"). `python3 .claude/cantonese/run.py --level b1`. 1,000 notes: 395 from the B1 inventory (16
topics, `inventory.py` `B1`), 605 by frequency. Sentences for only 248, three for 49: Tatoeba's 2,256 short
Cantonese–English pairs are used up by the first two levels, and the deck's description says many words have
none. 602 show a simplified form; no hand glosses. A re-run is byte-identical (verified).

- **THE FILL REACHES HKCanCor's TAIL, so it is filtered harder** (`select.py`). At B1 the fill takes words the
  corpus has 4 to 13 times, and there the one-character "words" are mostly bound forms its transcribers cut off a
  compound (所, 法, 之, 性, 化, 類, 式), dealt early because Tatoeba's counts lead the dealing order. A single
  character now needs 13 HKCanCor tokens (`HK_MIN_1`; A2's last single characters, 嘥 煩 爛 紙, have 13–14, so A2
  keeps them), a word HKCanCor tags mostly as a name is skipped (碧咸 Beckham, 朗拿度 Ronaldo, 荔景, 雀仔街), and so is
  one built only of numerals (二千, 四十). What is left is spoken Hong Kong Cantonese: 老奉, 核突, 巴閉, 戇居, 冚唪唥,
  打邊爐, 甩皮甩骨, 陰公, 離譜, 過癮. The name rule moved one A2 word: 大陸 "mainland" (HKCanCor tags it ns) gave way to
  缸 "jar".
- **`EXCLUDE` grew again**: other spellings of words already taught (鐘意, 噚日, 乜野, 屋村, 痴線), two words from one
  HKCanCor conversation that a learner's deck should not deal (艷舞, 全裸), 變態 ("pervert"), 低能 and 鬼佬 (an insult
  and a derogatory word), 西隧 and 城巴 (names), 阿爸 (CC-CEDICT's only sense is the Aramaic "Abba").
- **Seven more `SHOW` rows**: 樹林 opened on Shulin city in Taiwan, 肝 kept a gaming sense ("grindy"), 花紅 opened on a
  crabapple (it is the year-end bonus), 老爺 on "lord" (in Hong Kong, a wife's father-in-law).
- **Not in either dictionary and dropped by `select.py`**: 請人 計劃書 傾生意 放大假 返夜班 銀行戶口 還錢 交稅 樓價 圖書證 電台
  Wi-Fi 社交媒體 睇新聞 新移民 診症 扭親 抹枱 朋友仔 識朋友 年廿八 — and many inventory words were already taught at A1 or A2,
  which is why the inventory share is smaller than at the lower levels.
