# The Mandarin collection — a review

**September 2026, on request**: *"The card 蛋糕 gives the wrong pinyin dàng āo. Analyse the Chinese
language collection. Check for any mistakes or inconsistencies. Check if every card correctly lists
its most common definitions. Check if the pinyin corresponds to the tts voice. Check if the card
correctly lists three different example sentences. Suggest at least 10 further ways to improve the
Chinese language collection."*

Nine decks, **11,532 notes / 23,064 cards, 21.7 MB**: HSK 3.0 levels 1–6 and 7–9, plus Everyday
Phrases and Idioms. This file records what was measured, what was repaired, and what was not — the
suggestions at the end are costed and each says which of the findings it closes.

**Since then all twelve suggestions have been implemented** — nine in full, three as far as the
material allows — and the second half of this file records what each did and, for the three, exactly
where it stops. The findings below are the state the collection was in BEFORE that pass; the table
under "Where the collection stands now" gives the state after it.

**The measure is `node .claude/decks/check-mandarin-coverage.js`**, written for this review and
committed with it, so every figure below is a command rather than a claim. It joins the three
checkers already here — `check-pinyin.js` (readings against the same card's bopomofo),
`check-say-reading.js` (which cards a speech engine will read wrongly) and `check-senses.js` (a gloss
against the card's own examples).

---

## 1. The reported card was already fixed, and the reader can still see it

`蛋糕` reads **`dàn gāo`** in `decks/Mandarin-HSK-3.0-Level-3.folio-deck.json` and has since commit
`12f6b57`, *"Repair 110 Mandarin readings, and add the check that found them"*. Before that commit it
read **`dàng āo`** — exactly as reported. It was one of the 110: a pinyin segmenter splitting
`dangao` as `dang`+`ao` rather than `dan`+`gao`, the n/ng ambiguity `check-pinyin.js` exists for.

**So the data is right and the reader's screen is wrong, and that is the actual fault.** A language
deck is fetched once, by the Download button, and written into IndexedDB; `langDeckDownload` opens
with

```js
if (UDECKS[deckId]) return { ok: true, deck: UDECKS[deckId] };
```

— a deck already on the device is **never re-fetched**, and nothing compares the reader's copy against
the shipped one. `meta.version` is `1` in all nine files and no code reads it; the catalogue rows in
`lang-decks.js` carry `notes`, `cards` and `bytes` and no version at all. **Every content repair ever
made to a language deck has reached only readers who had not yet downloaded it.** The 110 readings,
the 1,953 repeated examples and the five wrong senses are all in this position.

A reader's workaround today is to remove the deck and download it again, which costs them their
place in it. The fix is suggestion **1**.

## 2. Does the pinyin correspond to the TTS voice?

Mostly, and the exceptions are known and countable.

A Mandarin card hands the speaker its own **characters** (`data-say="{{Simplified}}"`), which is
right — a Mandarin voice given `bēizi` reads the romanisation — and is the whole of the problem where
the word is **one polyphonic character**: a lone 了 or 差 gives the engine no context, so it falls
back to the character's commonest reading.

- `check-pinyin.js`: **11,509 readings cross-checked, clean.** The pinyin and the bopomofo agree on
  every syllable boundary, which is the one thing a segmenter can get wrong invisibly.
- `check-say-reading.js`: of **1,503 single-character cards, 27 teach a minority reading** of their own
  character. Two carry a `Say` override (了 → 好了, 差 → 还差); **25 do not**, and a speech engine will
  probably read each of them as something other than what the card's pinyin says. The widest margins
  are 为 (card says *wèi*, corpus 44 *wéi* to 5), 得 (*de*, corpus 44 *dé*), 量 (*liáng*, corpus 28
  *liàng*), 血 (*xiě*, corpus 13 *xuè*), 只, 还, 都, 更, 干, 倒.
- **Do not add a blanket tone check.** Comparing tones across the two notations returns 231
  disagreements of which almost none are errors — ~123 are 不/一 sandhi (pinyin writes what is spoken,
  zhuyin the citation tone) and ~100 are mainland-against-Taiwan neutral-tone variance. The
  measurement is in `check-pinyin.js`'s header.

Suggestion **2** closes the 25.

## 3. Does every card list its most common definitions?

**No — 96.9% of notes teach exactly one sense.** 355 notes of 11,532 give more than one.

That figure alone would be unfair: most words have one sense worth teaching. Two counts show the gap
is real anyway.

- **1,577 single-sense notes carry a part of speech naming several categories** — 对 is tagged
  `verb / adjective / measure word` against the single gloss *correct; right*, 多 is
  `verb / adjective / adverb` against *many; much; more than; how*. The label claims senses the gloss
  does not give.
- **3,660 single-sense notes have a gloss that is really several senses joined by semicolons** —
  什么样 *what kind?; what sort?*, 我国 *my country; our country*. The senses are there and are not
  separated, so nothing can be studied, cited or shown one at a time.

Read by hand, the most damaging shape is a **second reading left out entirely**, because the card then
teaches a pronunciation the word only half has:

| word | card teaches | missing |
|---|---|---|
| 长 | `cháng` — long | **zhǎng** — to grow; chief, head of |
| 行 | `xíng` — OK | **háng** — row; trade, line of business (银行, 行业) |
| 好 | `hǎo` — good | **hào** — to be fond of |
| 少 | `shǎo` — few | **shào** — young (少年) |
| 数 | `shù` — number | **shǔ** — to count |

The treatment is **inconsistent** rather than absent: 过, 花, 空, 重 all carry both readings as two
labelled senses, which is the right shape and is what the five above want. **便** is worse than
incomplete — its one sense reads `adverb — convenience; excrement or urine; relieve oneself`, three
`biàn` senses jumbled under a part of speech that fits none of them, and it omits `pián` (便宜), which
is the reading a learner meets first.

Suggestions **3** and **4**.

## 4. Does every card list three different example sentences?

**No. 44% carry the full three; 3,406 notes (29.5%) carry none at all.** No note repeats a sentence
within itself, so the 1,953 duplicates repaired in `44f0882` have not come back.

| deck | notes | none | one | two | three | full set |
|---|---|---|---|---|---|---|
| Everyday Phrases | 159 | 48 | 35 | 18 | 58 | 36% |
| HSK 3.0 Level 1 | 300 | 1 | 3 | 0 | 296 | 99% |
| HSK 3.0 Level 2 | 197 | 1 | 1 | 2 | 193 | 98% |
| HSK 3.0 Level 3 | 491 | 7 | 10 | 12 | 462 | 94% |
| HSK 3.0 Level 4 | 990 | 45 | 47 | 43 | 855 | 86% |
| HSK 3.0 Level 5 | 1,579 | 112 | 177 | 131 | 1,159 | 73% |
| HSK 3.0 Level 6 | 1,777 | 337 | 338 | 201 | 901 | 51% |
| HSK 3.0 Levels 7–9 | 5,562 | 2,500 | 1,314 | 594 | 1,154 | 21% |
| Idioms | 477 | 355 | 98 | 16 | 8 | 2% |
| **all** | **11,532** | **3,406** | **2,023** | **1,017** | **5,086** | **44%** |

**The shortfall tracks the level exactly**, which says it is a supply problem rather than a bug: the
example corpus is a sentence bank, and a bank drawn from everyday text has three sentences for 爱 and
none for 足不出户. The two places it hurts most are the two ends of that gradient — **Levels 7–9**,
where 45% of notes have nothing, and the **Idioms deck at 2%**, which is the worst possible deck to
have it in, an idiom being defined by how it is used.

A note with no examples draws no fold at all, so a reader cannot tell a word Folio has no sentence for
from a fold they forgot to open. Suggestions **5**, **6** and **7**.

## 5. The finding with the most teeth: 863 unanswerable reverse cards

The English → Chinese card's front is `{{English}}` and nothing else. **404 glosses are shared by two
or more notes, covering 863 notes — 7.5% of the collection.** Each of those is one question with
several right answers:

- *adverb: again* → 再 · 又 · 重新 · 再度
- *noun: early morning* → 早上 · 早晨 · 清晨 · 一早
- *verb: to go out* → 出 · 出门 · 出去 · 外出
- *verb: decline* → 减退 · 衰减 · 衰落 · 推辞 · 下滑
- *noun: woman* → 女人 · 女性 · 妇女 · 女子

The reader types a correct answer, is shown a different word, and has no way to tell a wrong answer
from a collision. It is the only finding here that a reader experiences as **being marked wrong for
being right**, and it is why it is ranked first among the suggestions that are content work.
Suggestion **8**.

## 6. Smaller inconsistencies

- **Nine readings written as one word, and unverifiable — repaired in this pass.** The corpus writes
  one space per syllable 11,500 times; seven notes did not (`zìshǒu`, `zìzhìqū`, `zōngyì`, `zǒushì`,
  `zǒuxiàng`, `zúbùchūhù`, `zuòliao`), and those same seven, plus 露面 and 略知一二, had **no
  bopomofo** — which is exactly the shape `check-pinyin.js` skips, so they were the residue its
  earlier repair could not reach. Both fields are now filled, and **every bopomofo syllable was
  derived from the corpus's own usage of that character in that reading**, not typed: 自 `zì` → ㄗˋ is
  what the other 77 cards containing it already say. The two the corpus had no evidence for are 露
  `lòu` → ㄌㄡˋ and neutral 料 → ㄌㄧㄠ˙. `check-pinyin.js` now cross-checks 11,509 readings rather than
  11,500 and is still clean, which is the check that the nine were filled in correctly.
- **嗯 is written `ǹg`**, which is not a standard pinyin syllable — the forms are `ń` / `ň` / `ǹ`. It
  is the one note left with no bopomofo, and so the one reading nothing can cross-check. Left as
  found: the right answer is a judgement about which of three interjection readings the card teaches.
- **77% of noun-tagged notes carry no measure word** (3,536 of 4,601). Most of those are not countable
  — 今天, 大家, 多少 — so the figure overstates it; but 出租车, 儿子, 孩子, 大学生 are all in the list
  and all take one. The field exists in the card type and is rendered when filled.
- **416 example sentences are used by three or more notes.** That is legitimate — one sentence
  containing several target words genuinely serves several cards — and is recorded here only so the
  next person does not read it as duplication.
- **The Idioms deck has no field for the literal sense.** 谢天谢地 is glossed *thank goodness*, which
  is what it means and not what it says; the image behind an idiom is most of what makes it stick, and
  355 of the 477 have no example sentence to supply it either.

---

## The twelve improvements, and what each of them did

All twelve were implemented in September 2026 on request. Nine are complete, three are complete only
as far as the material allows and say below exactly where they stop. **Every content edit to these
nine decks lives in `.claude/decks/mandarin-fixes.json`** — they cannot be regenerated, so that file
is the only record of how the shipped decks differ from what the generator produced, and
`node .claude/decks/mandarin-fix.js --check` asserts they still carry it.

**1. An update path for a downloaded deck. — DONE.** *Closes §1.* The catalogue row carries a content
revision (a SHA-256 over the deck's cards and glossary, canonically keyed, so a re-serialisation that
moves whitespace or key order cannot move it); a mounted deck records the one it was built from; the
two disagreeing puts an **Update** button on the deck's row in the daily study. A deck downloaded
before this carries no revision at all and counts as stale, which is what reaches the reader who
reported `蛋糕`. It **merges into the existing deck id** rather than importing — a language deck keeps
the file's own id, so a re-fetched file has bit-identical card ids, and `S.cards`, `S.buried`,
`S.flags` and `S.deckOpts` are all keyed by ids that do not move. A note the shipped deck has dropped
is kept rather than deleted. `.claude/test-deck-update.js` reproduces the reported fault — it corrupts
a card in IndexedDB the way a stale download is corrupt — and asserts both the repair and the surviving
schedule. 21 assertions.

**2. `Say` for the single characters a speech engine misreads. — DONE.** *Closes §2.* Twenty-one
written, using the shortest ordinary word that pins the reading (为 → 因为 was not needed in the end,
为 teaching both readings instead; 得 → 觉得, 量 → 测量, 干 → 干什么, 只 → 一只). Two of the
twenty-five turned out to be card errors rather than TTS problems and were fixed as such: **奔** taught
`bèn` against a gloss ("to run quickly; to hurry") that is `bēn`, and **咽** paired `yàn` with `yān`'s
sense "throat". `check-say-reading.js` falls from **25 unfixed to 1** — 咽, which now teaches both
readings and is listed only because the corpus's majority reading for that character is the literary
`yè`, which the card does not teach and should not.

**3. Splitting the crammed glosses. — DONE FOR THE CORE VOCABULARY, AND DELIBERATELY NOT IN BULK.**
The suggestion said this was "largely mechanical". **It is not, and doing it mechanically would damage
more cards than it helped.** Of the 3,660 single-sense notes whose gloss contains a semicolon, most
separate SYNONYMS of one sense — 什么样 "what kind?; what sort?", 大伙 "everyone; all of us; all of
you", 我国 "my country; our country" — and splitting those would invent a distinction the word has not
got, which is worse than leaving them joined. What *is* safely separable is a note whose part of speech
names several categories AND whose gloss has parts that map onto them: **55 such notes in levels 1–3**,
the core vocabulary, were split by hand — 在 into verb / preposition / adverb, 家 into noun / measure
word / suffix, 条 into the noun and the classifier. 3,610 remain joined and are recorded here as a
judgement rather than a backlog.

**4. Both readings for a polyphone. — DONE.** *Closes the rest of §3.* **Thirty-seven** headwords that
taught one reading of a character the corpus uses in two now teach both, in the shape 过, 花, 空 and 重
already used — 长 gains `zhǎng`, 行 gains `háng`, 好 gains `hào`, 少 gains `shào`, 数 gains `shǔ`, 地
gains `dì`, 教 gains `jiào`. Every bopomofo syllable is the corpus's own for that reading, derived
rather than typed. **便** was rewritten outright: its one sense read `adverb — convenience; excrement
or urine; relieve oneself`, three `biàn` senses under a part of speech that fits none of them and no
`pián` at all. The candidates were found by the corpus's own reading distribution, which is
`check-say-reading.js`'s measure used for a second purpose; tone sandhi (一, 不) and neutral-tone
variants (头, 气, 上) were excluded, being one reading rather than two.

**5. The Idioms deck's examples. — DONE.** *Closes the worst of §4.* **348 of 477 had none; now 0 do.**
Thirteen are real sentences harvested from the decks' own bank, which turns out to hold almost nothing
for an idiom. **The other 348 are AUTHORED, and the record says so on every one of them** — that is a
real difference from the 19,315 sentences around them, which came from a corpus, and it is not papered
over. They are short, ordinary, and use the idiom in its normal construction; they carry no structure
line, because that line is a part-of-speech gloss of every word with the target's own bolded and one
derived for a different headword would be wrong rather than missing.

**6. A literal gloss for every idiom. — DONE.** All **477**. Seventy-five came out of the decks' own
glosses, which carried the literal sense inline marked `lit.` and buried it in a run-on definition;
splitting it puts the meaning in the gloss and the image under it. The other 402 are written from the
characters, and only where the literal reading says something the meaning does not. The card type
gained a `Literally` field on the **Chinese → English side only** — on the reverse card the image would
give the answer away.

**7. The examples gap at levels 6 and 7–9. — PARTLY, AND THE LIMIT IS REAL.** A corpus-wide harvest
under two guards — the target must not be swallowed by a longer headword in the same place, and the
translation must be new — supplies **306 notes**. A plain substring search offers 1,950 and almost all
of them are collisions; the first cut of this harvest, before the translation guard, introduced six
cards showing two different Chinese sentences under one English, which is what `check-senses.js`
caught. **2,979 notes across the collection still have no example, 2,776 of them in levels 6 and 7–9**,
and closing that needs a second sentence corpus rather than another pass over this one. Authoring
~2,800 sentences was not attempted: the 348 written for the idioms are as far as hand-authoring goes
before quality becomes the risk.

**8. The ambiguous reverse cards. — DONE.** *Closes §5.* **0 groups, 0 notes still ambiguous**, from
401 groups covering 857. The decks already answered this for 104 pairs with a `not <other word>` block
above the senses; that convention is completed for the 251 pairs that had none, and deliberately NOT
used for the 46 groups of three or more — naming four of five answers on the front of the card is worse
than the ambiguity — which were given the gloss that actually distinguishes them: 再 "of something
still to come" against 又 "of something that has already happened again", 词典 "of words" against 字典
"of characters", 早晨 "a shade more formal than 早上" against 清晨 "daybreak". **Two of the 138 were
wrong rather than merely ambiguous**: 中餐 was glossed "lunch" over three examples about Chinese
cuisine, and 博士 "doctor" where its own examples are about a doctorate. The hints map is
**authoritative and regenerated** from the finished decks, so a pair that stops colliding loses its
block rather than keeping one that points at nothing.

**9. A route through the shelf. — HALF DONE, AND THE OTHER HALF IS NOT POSSIBLE HERE.** Each of the
nine decks now carries a line under its title on the Collections page saying what it is and when to
study it — "The first 300 words — start here if you are new to Chinese", "the advanced band, larger
than every level below it together". **Splitting Levels 7–9 into its three real levels cannot be
done**: the syllabus publishes them as one band, the deck file carries no per-card level marker, and
the generator inputs for these nine decks are not in this repo.

**10. Teaching the character. — DONE.** Tapping a character in a card's own character block lists the
other words in the same deck built on it, with their readings and glosses, shortest first — 学 on a 学习
card lists eleven in Level 1 alone. It warms the deck first and says so meanwhile: boot mounts a note
as a stub with no fields, so searching what happens to be warm would answer "three other words" for a
deck holding forty, and that answer is a plausible one. It lists and does not link: navigating away
would take the reader out of a card they are part way through. The second half of the suggestion —
ordering a character's introduction before the words that use it — is the same impossibility as **9**,
the order being the HSK syllabus's and the card ids being permanent addresses.

**11. Measure words on the concrete nouns of levels 1–3. — DONE.** **65** written, from the corpus's
own table of the 112 classifiers the decks already use, so the rendering cannot drift from the 1,148
notes that already had one — a character the decks have never used as a measure word is refused rather
than rendered from a guess at its pinyin. The residue is what the checker always said it was: of 3,482
noun-tagged notes without one, the great majority are pronouns, directions, time words and
abstractions that legitimately take none.

**12. Working `check-senses.js`'s ranked list. — DONE.** Its exact half (the same example twice on one
card) is at **0**. Its proxy half produced four real corrections: **白酒** was glossed correctly as
baijiu and all three of its examples translated it as "white wine", so every sentence on the card
taught the mistranslation the gloss exists to correct; **一旦** led on "in a single day", the rare
literary sense, while all three examples use the ordinary conditional; **赶不上** was glossed only "can't
keep up with" while every example is about missing a train; **通顺** was glossed "Smooth", capitalised
mid-sentence and too vague to be a definition.

---

## Where the collection stands now

| measure | before | after |
|---|---|---|
| single-character cards a speech engine will misread, unfixed | 25 | **1** |
| ambiguous English → Chinese cards | 857 notes | **0** |
| idioms with no example sentence | 348 | **0** |
| idioms with a literal gloss | 0 | **477** |
| **notes with no example sentence** | **3,406** | **0** |
| notes teaching more than one sense | 355 | 382 |
| readings `check-pinyin.js` cannot cross-check | 10 | **1** |
| pinyin written as one word | 7 | **0** |

**Every one of the 11,532 Mandarin notes now carries at least one example sentence.** Getting there
cost 3,222 authored sentences on top of 836 real ones — 488 recovered from the Tatoeba corpus and 348
found in the decks' own bank, written for another card that happened to use the word. The split is
the finding: **the corpus ran out long before the syllabus did.** The last honest measurement of that
is worth keeping, because the obvious next move looks cheaper than it is — relaxing the harvest's
36-character sentence cap to 50 buys **111 notes of the 2,391 that Levels 7–9 still needed, and only
5 of them had no example at all**. The cap was never the constraint; free sentence banks simply do
not contain 陨石, 汗马功劳 or 不正之风.

Every authored sentence says so in `mandarin-fixes.json`'s own `why`, so a reader of the record can
always tell one from a corpus sentence, and the applier refuses any example that does not contain its
own headword — a guard that fired six times during this pass and was right every time (a 放水 sentence
that had split the word across a verb and its object, a 立功 that had done the same, a 脱身 written as
脱不了身, a 许愿 as 许了个愿, a 舍得 as 舍不得, and one 真相大白 that split the idiom).

The one reading nothing can check is **嗯**, written `ǹg`, which is not a standard pinyin syllable —
the forms are `ń` / `ň` / `ǹ`. It is left as found because the right answer is a judgement about which
of three interjection readings the card teaches.

## What is still open

- ~~**5,103 notes carry exactly one example and 1,018 carry two.**~~ **DONE (Sep 2026): every one of the
  11,532 notes now carries the three example sentences the card type shows** — 100% across all nine decks,
  with no note showing the same sentence twice. See *The three-example pass* below.
- **3,610 glosses are several senses joined by semicolons.** Most are synonym lists and must stay
  joined — see **3** — but some fraction are genuine multi-sense notes above level 3 and would repay
  the same hand pass the 55 got.
- **1,510 notes name several parts of speech against a single gloss.** The same judgement, from the
  other side.
- **嗯's reading**, above.
- One gloss was found to be a **copy of the card next to it in the file** — 炒作 was defined as "Nest",
  which is 巢穴's gloss — and is corrected. An adjacency sweep over all nine decks finds no second
  instance, so it is a one-off rather than a class; it was found by eye while writing examples, and
  nothing in the pipeline could have found it.

## Ten more ways to improve the collection — and what happened to them

These were the next ten, written after the first twelve shipped and after every note gained an example.
**Eight have shipped and two turned out to be already true.** The largest of them — item 1, the long
grind — is now finished as well. Three of them were partly wrong about the collection, and the measurements that showed it are the
most useful thing in this section.

| # | what it asked for | what happened |
|---|---|---|
| 1 | one-example notes taken to three | **shipped** — all 11,532 notes now carry three |
| 2 | an origin line for the idioms | **shipped, 90 of 477** — and the deck turned out not to be a deck of classical chengyu |
| 3 | community difficulty on language decks | **already true** — the pooled rating has always covered them |
| 4 | order a deck by frequency, not the alphabet | **shipped** as a fourth study order |
| 5 | split the 1,510 part-of-speech multi-senses | **shipped, 23 of 1,510** — the other 1,487 are not multi-sense at all |
| 6 | a frequency line in the character network | **shipped**, with the character's own reading |
| 7 | speak the example sentences | **already true** — every example has carried a speaker all along |
| 8 | say which sense an example shows | **shipped**, 14 notes — the machinery is general, the judgement is not |
| 9 | audit the glosses against a second dictionary | **shipped** — and it found two real pinyin errors |
| 10 | say on the shelf what a deck teaches | **shipped** |

### 2. The Idioms deck is not a deck of classical idioms

The suggestion assumed that a 成语 has a story behind it and that 477 of them would be 477 pieces of
research. Measured against a list of the well-known 成语典故, **13 of the 477 matched**; read by eye, about
ninety have a source worth stating. The reason is the deck's own selection rule, which is printed in its
description: expressions the dictionary marks as idioms, appearing at least sixty times in a corpus of
film subtitles, and in no HSK list. That is a rule for finding **colloquial four-character expressions**
— 谢天谢地, 原来如此, 说来话长 — and most of them have no story because they never had one; their literal
line already says everything there is.

So an `Origin` line ships on the ninety that have a source, and the field is simply absent on the rest.
The line names the work — the <i>Zhuangzi</i>, the <i>Zuo zhuan</i>, Du Mu's poem on Xiang Yu — and says
what happened there in one sentence. Two of the ninety are worth singling out because they are honest
about not being classical at all: **一石二鸟 is a translation of the English proverb** about two birds, and
**连锁反应 is a modern term taken from physics**.

### 5. Naming two parts of speech is almost never a missing sense

1,510 notes give one gloss under two or more parts of speech, and the suggestion read that as 1,510 notes
teaching one use and testing two. Broken down, it is mostly Chinese doing what Chinese does:

| family | notes | is it two senses? |
|---|---|---|
| `verb / idiom`, `adjective / idiom`, `noun / idiom`, `adverb / idiom` | 371 | no — one meaning wearing two labels |
| `verb / adjective` and `adjective / verb` | 209 | no — a Chinese adjective **is** a stative verb |
| `noun / verb` and `verb / noun` | 400 | almost never — zero-derivation, one meaning |
| `adjective / adverb`, `noun / adverb`, … | ~200 | rarely |
| measure-word, preposition and conjunction families | ~130 | **sometimes, and this is where the fault lives** |

Twenty-three were split by hand, and six of them are Level 1 and 2 words a reader meets in their first
week: **天** was "sky, heaven" and never "day"; **回** was "to return" and never "a time"; **给** was "to
give" and never the preposition "for"; **比** was "to compare" and never "than"; **还是** gave the "or" of
a question and never "still"; **名** gave the noun and never the measure word for people. The rest are
measure words the gloss simply left out — 封 for letters, 台 for machines, 座 for bridges and hills, 部
for films and books, 堂 for lessons, 桩 for matters.

### 8. Tagging an example with its sense only pays where the senses differ

204 notes carry two or more senses **and** two or more examples, which looked like the size of the job.
It is not: most of those "senses" are a dictionary's near-synonym list — 没错 has five, and all five are
"that's right" — and numbering a sentence as sense 3 of 5 synonyms is noise dressed as information. The
machinery is general (`exSense` in the record, applied after any sense split, refusing a tag that points
at a sense the note has not got); the judgement is per note, and fourteen notes have it. One of them paid
for the whole exercise: tagging **道** turned up a sense the card had not got at all — its own second
example is 自言自语道, where 道 is the verb that ends a line of reported speech, and the card listed only
the noun and the measure word.

### The fault none of the ten predicted: an example that does not contain its own word

Topping the Everyday Phrases deck up to three examples turned up a card for **久病** illustrated by
医生虽然已经竭尽全力，但**不久病人**还是死了 — where the two characters straddle 不久 and 病人 and mean
nothing together. The sentence is real, its translation is right, the card bolds the characters, and the
word the card teaches is not in it. That is a whole class of fault, and `check-example-fit.js` measures it:
the nine decks list 11,532 words, which is a serviceable lexicon, so a sentence can be re-segmented and
asked whether the headword straddles a boundary between two other words.

**350 findings out of 23,618 sentences, of which about 200 were real and are repaired.** Some cards were
wrong three times over: **生动** was illustrated only ever inside 野生动物, **后期** only inside 最后期限,
**上火** only inside 赶上火车, **试卷** only inside 考试卷. Seventy-five notes had no correct example at
all, so a reader studying those cards never once saw the word used.

Two things about the measure are worth keeping. **The ranking is what makes it readable**: greedy
segmentation cannot tell 如何|在 (a real fault) from 十分|钟 (not one), because the two have exactly the
same shape — so a finding is ranked by how much more the competing word is used across all nine decks'
sentences than the headword is, and the real faults come to the top. And **the precision is about 57%**,
which is stated rather than rounded up: the remaining 103 findings are the segmenter losing to a negator
or a modifier (不|安全 read as 不安|全, 有|时间 as 有时|间), and they are left alone.

Repairing it also found a fault in the repair tool. **`dropEx` did not filter the record's own examples** —
it was written to remove a sentence the GENERATOR had shipped, so it only filtered what was read off the
deck, and the moment a HARVESTED sentence turned out to be wrong the drop silently did nothing: the
applier strips the added blocks and then puts them straight back from the record.

### 3 and 7 were already true

**The pooled community difficulty rating has always covered language decks.** `card.difficulty` is an
editorial judgement that only curated cards carry, so a language card shows nothing at first — but
`cardStatsBump` is called from `grade()` for every card answered, and a community card's id is derived
from the deck FILE, so it is the same id for every reader who downloaded it. Once such a card has twenty
answers across all readers the stars appear, measured rather than judged. A comment in app.js said the
opposite and has been corrected. What genuinely did not work for these decks is the "By difficulty" study
order, which reads the editorial rating — and that is what suggestion 4 answers.

**Every example sentence has carried a speaker since the decks shipped**: the `uc-exsay` control sits in
each example block with the sentence in its `data-say`, which is the contract `cardSpeak` honours. The
sentences authored in this pass carry it too.

### The ten in full

These are the next ten, written after the first twelve shipped and after every note gained an example.
Each says what it would cost and what could go wrong, because three of them are cheap and three are
the kind of change that damages a deck if it is done at scale without judgement.

**1. Take the one-example notes to three, level by level, using the same guards.** ~~5,103 notes have
one sentence and 1,018 have two.~~ **DONE (Sep 2026): all 11,532 notes carry three**, which is 100% of
all nine decks with no note showing the same sentence twice. It was done bottom-up as planned — Level 5,
Everyday Phrases, Idioms, Level 6, then the 7,900 of Levels 7–9 — and the free banks were exhausted
several levels down, so essentially every sentence is AUTHORED and the record says so on each entry.
Three things are worth carrying to any pass of this shape. **A second example must use a DIFFERENT
construction from the first** — a noun in subject and then in object position, a verb with and without
an object — since a sentence that restates the first teaches nothing; that is the rule the whole grind
was written to. **The dedupe has to compare against the DECK, not against the record**: the batch script
checked only its own entries, so eight authored sentences that happened to match an already-harvested
one shipped twice and had to be found afterwards with a duplicate sweep — run one at the end. And
`check-example-fit.js` earns its keep on authored text: it caught 球场上空无一人 (segments as 上空, "the
sky above"), 一路平安无事 (contains the separate idiom 一路平安) and 报纸有时事评论 (segments as 有时,
"sometimes"), all three genuinely ambiguous to a reader and all three rewritten.

**2. Give the Idioms deck its story, not just its gloss.** All 477 idioms now have a literal line and
an example, which was the whole of the last pass — but an idiom is a compressed story, and the four
characters of 守株待兔 mean nothing until someone tells you about the farmer and the stump. A one-line
**origin** field, on the model of `Literally`, would be the single highest-value addition to that deck.
It is 477 pieces of research and each one is checkable, which is exactly the shape of work the citation
passes elsewhere on the site are built for.

**3. Measure which cards a reader actually fails, and rate the decks against it.** Folio already keeps
a per-review log (`S.revlog`) and already shows a community difficulty rating on curated cards once a
card has 20 answers. A language deck's cards are outside that entirely. Wiring `bump_card_grades` to
community cards would tell us — from readers rather than from a syllabus — which HSK 7–9 words are
genuinely hard, and that is the honest input to every ordering decision below.

**4. Order the decks by frequency inside a level, not by pinyin.** The HSK lists are alphabetical by
reading, which is an ordering with no pedagogical content at all: a reader working through Level 5 in
order meets 报到 and 比例 on day one and 自觉 in a year. A frequency ordering within each level would put
the words a reader will actually meet first. **It cannot be done by re-sorting the deck file** — a card
id is a permanent address and re-sorting would repoint every reader's schedule — so it wants a
`Frequency` field the study order can read, which is the same shape as `card.difficulty` on the curated
side.

**5. Split the 1,510 part-of-speech-only multi-senses.** These are notes whose gloss is one phrase but
whose part of speech names two or three categories — 忙 as "verb / adjective — busy", 年 as
"noun / measure word — year". Where the two categories really are two uses, the note is teaching one
and testing both. This is the same hand pass the 55 semicolon glosses got, and it must stay a hand
pass: a rule that splits on the slash would split 半 "adverb / numeral" into two cards for one word.

**6. Give the character network a frequency line.** Tapping a character on a card now lists the other
words in the same deck built on it, which is the feature readers of Chinese ask for most. What it
cannot yet say is which of those words is worth learning first, or how the character is pronounced
when it stands alone. Both are already in the data — the deck's own readings give every character a
reading distribution, which is what `check-say-reading.js` is built on.

**7. Let a reader hear the example sentences, not just the word.** Every card's word has a speaker;
the example sentences carry `data-say` too, and on a Mandarin card that is where the tones actually
live — a word said in isolation is said in its citation tone, and 不 and 一 change in a sentence. This
is a card-type change rather than an app change, so it ships per deck and can be tried on one.

**8. Say which sense an example is showing.** A multi-sense note shows three sentences and does not say
which sense each one illustrates, so a reader meeting 差 as both *to differ* and *to lack* has to work
out the mapping themselves. A one-word tag on each example — the sense number it belongs to — costs
nothing to render and makes a three-sentence card teach three things instead of one.

**9. Audit the glosses against a second dictionary.** 炒作's gloss was a copy of its neighbour's, and
it survived every check in the pipeline because a wrong gloss is a perfectly well-formed gloss. The
only thing that can catch this class is a second source: cross-checking each headword's gloss against
an independently compiled dictionary and reporting where the two share no content word at all. It would
be report-only and mostly noise — but the fault it catches is invisible in every other way.

**10. State on the shelf what each deck actually teaches.** The catalogue gives each deck its card
count and its download size, and the subtitles now say who a deck is for. What no reader can see before
downloading 20 MB is whether the deck teaches both directions, whether it carries example sentences,
whether it has audio. Those are facts the build script already reads off each file — `build-lang-decks.js`
counts cards by walking the templates — so it is a catalogue field rather than research.

---

## The audit batch log

One row per batch, so the next session can tell a card that was read and left alone from a card
nobody has opened yet. **A batch that changed nothing still gets a row.** Read the row's own notes
before re-opening the same finding list: about half of what the report-only checkers name is a
correct card, and re-deriving that costs a session.

| date | batch | notes changed | leading fault |
|---|---|---|---|
| 2026-09-17 | `check-gloss-source.js`'s whole neighbour-gloss list (24) + its 4 reading findings | 24 | a gloss copied from the card sitting beside it in the exam list |
| 2026-09-17 | `hsk30l1` notes 1–30 (爱 → 的), deck order | 24 | a gloss that names one use while the card's examples test another |
| 2026-09-17 | `hsk30l1` notes 31–60 (第 → 个), deck order | 25 | a gloss that leaks its own answer onto the reverse card |
| 2026-09-17 | `hsk30l1` notes 61–90 (给 → 饺子), deck order, plus a corpus-wide punctuation pass | 25 + 389 blocks | a Chinese sentence punctuated with ASCII marks |
| 2026-09-17 | `hsk30l1` notes 91–120 (叫 → 没关系), deck order | 27 | a particle card describing a different particle |
| 2026-09-17 | `hsk30l1` notes 121–150 (没事 → 您), deck order | 21 | an example sentence that is not grammatical Chinese |
| 2026-09-17 | `hsk30l1` notes 151–180 (牛奶 → 少), deck order | 22 | an example that models the mistake the card should prevent |
| 2026-09-17 | `hsk30l1` notes 181–210 (谁 → 听见), deck order, plus a new `exEn` field | 19 | a gloss giving the dictionary's rarest sense as the card's only one |
| 2026-09-17 | `hsk30l1` notes 211–240 (同学 → 写), deck order | 23 | a polyphone taught at the wrong reading of the two |
| 2026-09-17 | `hsk30l1` notes 241–270 (谢谢 → 再), deck order | 20 | a gloss that stops dead in the middle of a phrase |
| 2026-09-17 | `hsk30l1` notes 271–300 (在 → 做), deck order — **Level 1 complete** | 22 | a gloss naming one sense while the examples show another |
| 2026-09-17 | `hsk30l2` notes 1–30 (啊 → 但), deck order | 18 | a gloss naming three senses the card shows none of |
| 2026-09-17 | `hsk30l2` notes 31–60 (但是 → 机场), deck order | 20 | a polyphone's commonest reading glossed at its narrowest sense |
| 2026-09-17 | `hsk30l2` notes 61–90 (机票 → 路上), deck order | 19 | a gloss that is an archaism the dictionary marks (old) |
| 2026-09-17 | `hsk30l2` notes 91–120 (旅游 → 肉), deck order | 19 | a card missing the sense two of its three sentences show |
| 2026-09-17 | `hsk30l2` notes 121–150 (商场 → 位), deck order | 21 | the dictionary's own editorial note pasted into a gloss |
| 2026-09-17 | `hsk30l2` notes 151–180 (为什么 → 鱼), deck order | 16 | **an obscene example sentence on a Level 2 weather card** |
| 2026-09-17 | `hsk30l2` notes 181–197 (远 → 左边), deck order, plus a new `exStop` field — **Level 2 complete** | 17 | a noun gloss on a card two of whose sentences are the verb |
| 2026-09-17 | `hsk30l3` notes 1–30 (阿姨 → 表演), deck order, plus a traditional-character sweep over all nine decks | 25 | a card whose gloss and all three of whose English lines disagreed |
| 2026-09-17 | `hsk30l3` notes 31–60 (别的 → 城市), deck order, plus an American-spelling sweep over all nine decks | 29 | a card two of whose three sentences do not contain the headword at all |
| 2026-09-17 | **the coarse-content sweep**, all nine decks, profanity · sexual · body · adult · slur read in full | 37 | a card all three of whose sentences were about penises |
| 2026-09-17 | **the violence half of that sweep, plus a public-figures sweep**, all nine decks | 29 | a living head of state accused of murder on a vocabulary card |
| 2026-09-17 | **the American-spelling pass**, all nine decks, as a new `exBritish` deck field | 412 | 489 American spellings in decks the site's switch can never correct |
| 2026-09-17 | **the American-word-choice pass**, all nine decks, as a new `exLexis` deck field plus 87 per-note rows | 189 | a word the spelling table cannot reach, because it is a different word |
| 2026-09-17 | **the whitespace pass**, all nine decks, as a new `exSpace` note field | 30 | a card not one of whose three sentences used its own headword as a word |
| 2026-09-17 | `hsk30l3` notes 61–90 (迟到 → 电), deck order | 12 | four cards teaching a word their own sentences do not contain, all invisible to `check-example-fit.js` |
| 2026-09-17 | `hsk30l3` notes 91–120 (电梯 → 房子), deck order, plus the two -logue spellings | 20 + 1 | a card whose three sentences were three different words beginning with its character |
| 2026-09-17 | `hsk30l3` notes 121–150 (放 → 关机), deck order | 17 | six glosses naming a part of speech the gloss did not belong to |
| 2026-09-17 | `hsk30l3` notes 151–180 (关系 → 或者), deck order, plus the bare-`afterward` class | 22 | two single-character cards whose sentences used the character and not the word |
| 2026-09-17 | `hsk30l3` notes 181–210 (鸡 → 斤), deck order, plus the `programme` class and a hole in `check-coarse.js` | 27 | an obscene sentence on a card glossed *chicken*, which the coarse sweep was excusing by design |
| 2026-09-17 | `hsk30l3` notes 211–240 (经过 → 老人), deck order | 20 | four English lines that translated something other than their own Chinese |
| 2026-09-17 | `hsk30l3` notes 241–270 (离开 → 南方), deck order, plus the whole ONE-WAY-ROW class | 40 | seven spelling families `check-british.js` reads 0 over by design, swept once and for all |
| 2026-09-17 | `hsk30l3` notes 271–300 (难过 → 前天), deck order | 18 | the character panel searches the DOWNLOADED deck, so six characters taught here show a reader nothing |
| 2026-09-17 | `hsk30l3` notes 301–330 (清楚 → 收), deck order, plus the whole MAD class | 22 | eight single-character cards in thirty, every one of their panels empty or all but empty |
| 2026-09-17 | `hsk30l3` notes 331–360 (收到 → 外卖), deck order, plus the LEXIS table's missing plurals | 35 | every row of the word-choice table was blind to its own plural, and the obvious fix makes *mathss* |
| 2026-09-17 | `hsk30l3` notes 361–390 (外语 → 相机), deck order, plus the whole `toward` class | 20 | a gloss cut off mid-list, and a card whose three English lines contradicted its own definition |
| 2026-09-17 | `hsk30l3` notes 391–420 (小区 → 以后), deck order | 19 | a sentence whose headword the segmenter finds and which is still not that word |
| 2026-09-17 | `hsk30l3` notes 421–450 (以前 → 员), deck order, plus the whole `anymore` class | 39 | the same fault twice on one card, one reported and one invisible, and a card teaching a non-word |
| 2026-09-17 | `hsk30l3` notes 451–480 (愿意 → 住院), deck order | 14 | a card glossed with the one sense none of its three sentences uses |
| 2026-09-17 | `hsk30l3` notes 481–491 (字典 → 作业) — **Level 3 finished**, 491 of 491 read | 5 | the fullest character panel in the deck, ten words, every one of them the empty suffix |
| 2026-09-17 | `hsk30l4` notes 1–30 (爱情 → 便于), deck order — **Level 4 opens** | 11 | an elephant's 鼻子 is a trunk, and a card labelled a verb over a noun |
| 2026-09-17 | `hsk30l4` notes 31–60 (标准 → 材料), deck order | 14 | two cards whose gloss is a sense not one of their sentences uses, and three malformed glosses |
| 2026-09-17 | `hsk30l4` notes 61–90 (参观 → 出行), deck order | 13 | a third truncated gloss, and a `not X` hint retired by glossing the distinction it was patching |
| 2026-09-17 | `hsk30l4` notes 91–120 (出租 → 打折), deck order | 15 | a sentence about a TAXI on the card for *to rent*, which segments perfectly and no checker can see |
| 2026-09-17 | `hsk30l4` notes 121–150 (打针 → 低于), deck order | 18 | a gloss that misspelt its own subject, and a card two of whose three sentences were not its word |
| 2026-09-17 | `hsk30l4` notes 151–180 (底 → 多样), deck order | 21 | a fourth truncated gloss, and the label-against-gloss fault three more times in thirty cards |
| 2026-09-17 | `hsk30l4` notes 181–210 (而 → 父亲), deck order | 22 | a fifth truncated gloss, a gloss that was not English, and a falafel on the card for *expense* |
| 2026-09-17 | `hsk30l4` notes 211–240 (复印 → 歌手), deck order, plus the `highway` sites | 24 | six glosses whose label named a part of speech the gloss had not got, and an English line about the wrong people |
| 2026-09-17 | `hsk30l4` notes 241–270 (各 → 管理), deck order, plus the whole `railroad` class | 27 | the first new LEXIS row since batch 24, and a card whose gloss its own two translations contradicted |
| 2026-09-17 | `hsk30l4` notes 271–300 (光 → 怀疑), deck order, plus the whole `skeptical` class | 22 | a fourth family `SPELL_PAIRS` has never held, and a card that contradicted itself over it |
| 2026-09-17 | `hsk30l4` notes 301–330 (坏处 → 记者), deck order, plus a hint pair retired across two decks | 21 | a card whose own first line was the one sense its gloss had not got, twice over |
| 2026-09-17 | `hsk30l4` notes 331–360 (加班 → 降低), deck order, plus the whole `hometown` class | 32 | a gloss that was a calque, a card glossing a reading it did not give, and a correction to batch 50 |
| 2026-09-17 | `hsk30l4` notes 361–390 (降价 → 进行), deck order | 19 | an obscene sentence a single-character card's own discriminator excuses, and a character error the English gave away |
| 2026-09-17 | `hsk30l4` notes 391–420 (禁止 → 考生), deck order | 15 | the `compounds` guard refused a block, and a FAIL turns out to REPORT after the write rather than refuse |
| 2026-09-17 | `hsk30l4` notes 421–450 (棵 → 浪漫), deck order | 18 | a card ALL THREE of whose sentences used its character for its sound alone, and a sixth truncated gloss |
| 2026-09-17 | `hsk30l4` notes 451–480 (老虎 → 留下), deck order | 18 | a card whose gloss named one sense while all three of its lines used another the gloss never gave |
| 2026-09-17 | `hsk30l4` notes 481–510 (流行 → 母亲), deck order | 21 | a gloss that dismissed its own card three times over, and a second hint pair retired |
| 2026-09-17 | `hsk30l4` notes 511–540 (母子 → 排队), deck order | 19 | a sentence whose three headword characters were two OTHER words meeting, and a wrong pronoun in the Chinese |
| 2026-09-17 | `hsk30l4` notes 541–570 (排球 → 千万), deck order | 20 | a label and a gloss that were different WORDS, and a question mark that was a full stop |
| 2026-09-17 | `hsk30l4` notes 571–600 (签证 → 缺少), deck order | 25 | a gloss that was not any sense the word has, and a `not X` hint retired by giving both cards their real meaning |
| 2026-09-17 | `hsk30l4` notes 601–630 (却 → 少见), deck order | 15 | a headword that was not in its own sentence at all, twice, and invisible to the checker both times |
| 2026-09-17 | `hsk30l4` notes 631–660 (少量 → 使), deck order, plus a new `cell phone` LEXIS row and a petrol sweep | 33 | a card glossed `province` not one of whose three sentences is a province |
| 2026-09-17 | `hsk30l4` notes 661–690 (使馆 → 顺便), deck order | 16 | a label and a gloss that were two different senses of the same character |
| 2026-09-17 | `hsk30l4` notes 691–720 (顺利 → 提), deck order | 23 | a card glossed `to calculate` not one of whose three sentences calculates anything, two of them unfit besides |
| 2026-09-17 | `hsk30l4` notes 721–750 (提出 → 推迟), deck order, plus a new `parking lot` LEXIS row and a `fill out` sweep | 25 | six labels naming a part of speech the card's own gloss is not |
| 2026-09-17 | `hsk30l4` notes 751–780 (推出 → 吸), deck order | 20 | a gloss that was simply the wrong word, papered over by a `not X` hint |
| 2026-09-17 | `hsk30l4` notes 781–810 (西部 → 笑话), deck order | 17 | a SIBLING PAIR both illustrated with a sentence their headword is not in |
| 2026-09-17 | `hsk30l4` notes 811–840 (血 → 研究生), deck order | 16 | a card teaching a Cantonese word for the animal its sentence is about |
| 2026-09-17 | `hsk30l4` notes 841–870 (严重 → 勇敢), deck order | 21 | a gloss that was the wrong end of its own transaction |
| 2026-09-17 | `hsk30l4` notes 871–900 (永远 → 约会), deck order | 16 | two thirds of a card illustrated with a Japanese name spelled in its headword |
| 2026-09-17 | `hsk30l4` notes 901–930 (月饼 → 之), deck order | 15 | three sentences whose Chinese says the opposite of their own English |
| 2026-09-17 | `hsk30l4` notes 931–960 (支持 → 转), deck order, plus `major` and `gonna` sweeps | 22 | a split headword hidden by the fact that the pair IS a real word |
| 2026-09-17 | `hsk30l4` notes 961–990 (转发 → 作者), deck order — **Level 4 complete** | 18 | a noun gloss on a card whose sentences are two different verbs |
| 2026-09-17 | `hsk30l5` notes 1–30 (哎 → 报到), deck order | 25 | **two of one card's three sentences used its character for its sound in a name** |
| 2026-09-17 | `hsk30l5` notes 31–60 (报道 → 表达), deck order, plus three cards outside it that share a sentence | 19 | **two of one card's three sentences were written with the wrong character of a homophone pair** |
| 2026-09-17 | `hsk30l5` notes 61–90 (表面 → 册), deck order, plus three rows added to app.js's own `SPELL_PAIRS` | 29 | **a spelling family that IS in the table, with three of its members missing** |
| 2026-09-17 | `hsk30l5` notes 91–120 (测 → 车祸), deck order, plus a corpus sweep for variant characters | 17 | **a Japanese character in a Chinese sentence, on three cards at once** |
| 2026-09-17 | `hsk30l5` notes 121–150 (车库 → 持续), deck order | 13 | **a card that listed the same sense twice, and put two readings under one pinyin** |
| 2026-09-17 | `hsk30l5` notes 151–180 (尺子 → 传说), deck order | 15 | **two more glosses cut off mid-phrase, and a second card with two readings under one pinyin** |
| 2026-09-17 | `hsk30l5` notes 181–210 (传统 → 打破), deck order | 16 | **a gloss offering a word that does not exist, and one naming the wrong verb entirely** |
| 2026-09-17 | `hsk30l5` notes 211–240 (打听 → 当年), deck order | 20 | **a third card with two readings under one pinyin, and a gloss rewrite that collided with its neighbour** |

### 2026-09-17 — the neighbour-gloss list

**What the batch was.** `check-gloss-source.js` reports two things: a gloss sharing no content word
with its own CC-CEDICT entry (1,016 notes as this was written — the sludge its own header warns about), and the sharp
version, a gloss that instead matches the dictionary entry of a card **within two either way in the
file**. That second list was 24 and is the one this batch took, with the 4 reading findings beside
it. It went to **3**, and all three of those are read-and-left, below.

**The fault, in two layers.** The 24 turned out to be one mechanical fault wearing two coats. Nearly
every one is a pair of near-synonyms that the exam list's alphabetical order happens to sit next to
each other — 视力/视觉, 简练/简洁, 巡视/巡逻, 兴盛/兴隆, 追捧/追赶 — where the card had been given
its neighbour's meaning. An earlier pass looked at this list and concluded, correctly, that the
findings are near-synonym PAIRS; what it did not say is that a fair number of the cards are also
simply wrong. 追捧 was glossed "chase / pursue", which is 追赶 and not this word at all; 巡视 was
"patrol", which is 巡逻, while all three of its own examples translate it as *inspect*; 视力 was
"vision; sight", which is 视觉, while its examples are all eye tests.

The second coat is the register fault the audit request names: **a capitalised abstract noun standing
in for a verb** — 爱慕 "Love", 发源 "Origin", 费力 "Strenuous", 骨骼 "Bone", 跨越 "Span", 逃生
"Escape", 送别 "Send off", 赞许 "Approve", 过头 "Excessive". Ten of the 24 had it, and it is what
made the transposition possible: a one-word gloss has nowhere to carry a distinction.

**What was changed, and how.** 24 notes, all through `mandarin-fixes.json`: 22 `gloss`, 2 `senses`
(协作 and 兴盛 needed their part of speech moved as well), 7 example repairs. The glosses are the
dictionary's own words wherever the dictionary is usable, and the card's own three examples decide
when it is not.

Five of the 24 were half of a **hinted pair** — two cards whose glosses were byte-identical, each
carrying the deck's `not <other word>` block: 感情/情感, 费力/费劲, 骨骼/骨头, 协作/协同, 养育/提高.
The applier drops a note's hint when a `gloss` replaces its English wholesale, so a one-sided fix
leaves the partner pointing at a word that no longer shares its meaning. The rule taken here, and
worth keeping: **fix the partner too where the partner's own gloss is also wrong by the register
rule; leave it, and leave its hint, where the partner's gloss is already right.** So 费劲
("Strenuous"), 协同 ("Cooperate / collaborate") and 提高 (the bare "raise") were reglossed with their
opposite numbers and both hints in each pair went; 情感 ("feeling") and 骨头 ("bone") are correct as
they stand, keep their glosses and keep their hints, which still point at genuine near-synonyms.
Ambiguous reverse cards went 354 groups → 349 and **STILL AMBIGUOUS stayed at 0**.

**The mistake this batch made, because it is the one to avoid next time.** 兴盛 was first reglossed
"flourishing; thriving", keeping the card's stated *adjective*. Re-running the checker put it
straight back on the list: 兴隆's full CC-CEDICT entry is `prosperous/thriving/flourishing`, so
**every** adjectival gloss of 兴盛 is 兴隆's. The dictionary splits that pair by part of speech —
兴盛 verbal, 兴隆 adjectival — so the fix is a `senses` change to `verb / to flourish; to thrive`,
which the card's three examples (曾经兴盛, 日益兴盛, 兴盛衰亡) support. **Re-run the checker after a
regloss**: a new gloss can land on the neighbour's entry as easily as the old one did, and nothing
else will say so.

**The seven example repairs.** Two were duplicate English translations that `check-senses.js`
reports (发源 had 这条河发源于山里 and 这条河发源于山中 under one translation; 简练 had 他的文章 and
他的文字), and that count went 154 → 152. Five were found by reading rather than by a checker: 费力's only authored example was 你白费力气了,
which contains 白费 + 力气 and not 费力 at all — the same sentence sits correctly on the 力气 card —
and its English, "You're barking up the wrong tree", is a different idiom rather than a translation;
过头's third example was 我回过头去 "I looked over my shoulder", where 回过头 is 回 + 过 + 头 and the
word is not there; and 梦寐以求, 协同 and 巡视 each had two examples that were one frame with one
word swapped. All seven replacements are AUTHORED and say so in the record. `check-example-fit.js` stayed at 144
findings — none was introduced.

**Read and left alone, with the reason.** Three of the checker's findings are false positives and
will report for ever:

- **回复** "to reply" — CC-CEDICT files 回复 as *to recover; to revert; variant of 回覆*, so the
  checker matches the gloss against 回信's entry instead. The card is right: 回复 is the ordinary
  mainland word for replying and all three examples are replies. **One real question was found here
  and could not be fixed**: the card's Traditional field reads 回復, which is the *recover* word — the
  reply sense is 回覆. `Traditional` is not in `mandarin-fix.js`'s field whitelist, so the record
  cannot express that correction at all. Left for a session that is willing to widen the whitelist.
- **界限** "dividing line; limits; bounds" — CC-CEDICT gives 界限 "boundary" and 界线 "limits;
  bounds; dividing line", i.e. the dictionary has the pair the other way round from the cards. The
  cards are the better of the two: 界限 is the abstract limit (划清界限, 界限分明) and 界线 the
  concrete line, which is what each card's own examples show. Both left.
- **知足常乐** "contentment is happiness" — the idiom IS 知足 plus 常乐, so its gloss will always echo
  知足's entry. The card is right and it is a `phrase`, so the "to " rule does not apply.

**All four reading findings were read and none is a fault.** 谁 `shéi/shuí` and 熟 `shú/shóu` teach
both readings, which is correct. 藤蔓 `téng màn` and 泄露 `xiè lù` are the readings CC-CEDICT itself
records as the alternates (`Taiwan pr. [teng2man4]`, `also pr. [xie4lu4]`). Changing either means
moving the pinyin AND the bopomofo together, and the corpus carries roughly a hundred
mainland-against-Taiwan variants that this file already says must not be swept; moving one of them
alone makes the deck less consistent, not more. **Left, and recorded as a question rather than
guessed at.**

### What the next batch should know

**The register fault is 2,334 senses, and 96% of it is in one deck.** Measured after this batch:
glosses opening on a capitalised ordinary word run **hsk30l7 2,334, hsk30l5 15, hsk30l6 12, hsk30l1
8, hsk30l4 7, hsk30idm 5, hsk30l3 3, hsk30l2 0**. The 60 in `hsk30phr` and the 5 in `hsk30idm` are
**correct and must not be swept** — a phrase gloss is a sentence ("Hurry up!", "Good morning!",
"Long live the king!"). Inside hsk30l7 the 2,334 break down by part of speech as verb 878, noun 830,
adjective 270, and a sample reads: 变换 *Transformation*, 倒塌 *Collapse*, 分发 *Distribution*,
侵权 *Infringement*, 受理 *Acceptance*, 荆棘 *Thorn*, 萝卜 *Radish*, 调侃 *Banter*. **The verb ones
are the worse half and are a wrong part of speech rather than a wrong register**: a noun standing in
for a verb. **A proper noun is not a finding** — 佛 *Buddha* is in the count and is right — so this
number is a ceiling, not a work list.

**1,781 senses in hsk30l7 sit under a part of speech of exactly `verb` and do not begin "to "**
(3,081 across all nine decks). That figure is a looser proxy than the capitals: a note tagged
`verb / adjective` glossed "busy" or "good" is a Chinese stative verb correctly glossed as an
adjective, and 谢谢 "thank you" is right. Rank by the capitals and read the verb list beside it.

**Two things this session could not do.** `docs/mandarin-audit-prompt.md`, which the audit request
names as the baseline, **is not in the repository** — the baseline had to be rebuilt by running the
checkers. And `.claude/decks/check-decks.js` requires Playwright, which is not installed here, so the
card-level browser checks did not run; every other checker in the finishing list did.

**Nothing was done about the `Compounds` field.** That request is about single-character cards and
this batch, being a checker's finding list, contains none — every one of its 24 headwords is two
characters or more. It is still open, and the measurement it rests on stands: 639 of the 1,503
single-character notes have no other word built on their character anywhere in their own deck, so
the tap panel tells 42% of them nothing.

### 2026-09-17 — Level 1, notes 1–30

**The order changed with this batch, on request: deck by deck from Level 1 upward**, so the cards a
beginner meets first are repaired first. That supersedes the triage order the audit request set out —
the checker finding lists are no longer taken whole, they are read against whichever notes the current
batch covers.

**Twenty-four of the thirty needed something.** The shape of the fault at this level is not the
transposition that dominated the first batch; it is **a gloss that names one use of a word while the
card's own three examples test another**, which `check-senses.js` cannot see because a gloss and a
sentence rarely share a content word anyway.

- **菜** was glossed "vegetable" — CC-CEDICT's leading sense, and **not one of the card's three
  examples shows it**: 你要点菜吗 is ordering dishes, 饭菜不太好 is the meals, 她是我的菜 is the
  colloquial "my type". Both senses are now glossed and an authored sentence supplies the vegetable
  use the card had never shown.
- **病** is tagged `noun / verb` and glossed with three nouns, while its first example 听说你病了 is
  the verb. **This is the deliberate kind of split CLAUDE.md permits on the 1,487 two-part-of-speech
  notes** — the card really was teaching one use and testing two — and not the sweep of them that
  file forbids.
- **吧** gave only the suggestion sense while its second example is the tag question 那不对，对吧？;
  **边** was glossed as a noun and a suffix while its first example is the 边…边… adverbial, which
  CC-CEDICT carries as a sense of its own ("simultaneously"); **的** was glossed with the single word
  "of" while its three examples are a possessive, an attributive and the sentence-final particle.
  All three were split into the senses their own sentences show and **each example tagged with
  `exSense`**, which is what that field is for where the senses genuinely differ. **不客气** already
  had its two senses right and needed the tags alone.
- **吧's gloss also had an unmatched closing bracket** — `[makes a suggestion, eg. "Let's …")]` —
  which renders on the card.
- **包子** was glossed "bao zi [steamed stuffed bun]", i.e. the card's own romanisation standing where
  the English belongs: on the English → Chinese side the prompt was handing over the answer's pinyin.
- **本** is a measure-word card whose three examples are all books, and its gloss led with "root";
  **到** missed the sense its third example uses (做不到); **爱** was "to love" alone against an
  example reading "Do you like to study?"; **车** was "vehicle, wheeled conveyance" against three
  plain cars.

**Four examples were replaced, all for reasons no checker reports.** 爸爸's 谁是你爸爸？was rendered
"Who's your daddy?", an English phrase carrying a sense the Chinese does not and the last thing a
beginner's card should teach. 包子's first example ran to sixty characters and two sentences about
university snacks, carrying 咖哩牛肉 and 肉桂卷, neither of which is in any HSK level. 大学生's third
was punctuated with ASCII commas and a full stop — 过去,我是中学生,现在我是大学生. — so the card showed a
beginner the wrong punctuation for the language it teaches. 菜's second was the slang sense.

**The mistake this batch made.** The first replacement written for 大学生 was 班里有很多大学生。, which
puts 多 immediately before the headword; greedy segmentation reads that as 多大 + 学生 and
`check-example-fit.js` reported it, so the batch had introduced a finding of exactly the kind it
exists to remove. Rewritten with the headword at the head of the sentence. **Re-run
`check-example-fit.js` after writing an example, not only after dropping one.** A second slip is worth
the same warning: `Object.assign` on a record entry **replaces an existing `ex` array wholesale**, so
包子 briefly shipped with one example instead of three. **Read a note's existing entry before adding
to it.**

### The `Compounds` field

**Built in this batch, and it is the one thing here that is a change to the app rather than to a
deck.** A single-character card glosses its character and stops. Tapping the character already opens a
panel listing the other words built on it (`openCharWin` / `charNeighbours` in app.js), but that panel
can only search the deck the reader has **downloaded** — and on Level 1, **71 of its 137
single-character cards have no other word in that deck at all**, so for 52% of the cards the feature
exists for it says "No other word in this deck uses it". Of the eighteen single-character cards in
this batch, **ten show an HSK 1 reader nothing**.

`Compounds` is the authored answer, bounded by the language rather than by the deck. Three notes on
how it is built, for the next batch:

- **It is written compactly and expanded**, which is `mw`'s and `senses`' rule: a row is
  `[word, pinyin, gloss]` and `mandarin-fix.js` builds the markup, so the record stays readable and a
  reading can be checked against a dictionary without parsing HTML out of it. The headword character
  is bolded wherever it falls, as the example sentences already do — that is how a reader sees it
  doing different work in each row.
- **A field is added in three places or in none**: the type's `fields` list, the template on BOTH
  cards, and the type's own scoped CSS. `decks.<id>.addFields` does all three; adding it to two of
  them stores the field and shows it nowhere.
- **The applier has no dictionary and cannot check a reading.** What it CAN refuse is a row that does
  not contain the card's own character, or that merely repeats it — both render perfectly, the first
  as a word with nothing bolded in it. The guard was proved to fire on both shapes before it was
  trusted.

**How the rows were chosen.** Words that show the character doing DIFFERENT work rather than three
near-synonyms — 穿 gets 穿过, 穿越 and 看穿, which are the "pierce, pass through" sense its own gloss
("to wear") never reaches; 大 gets 长大, 大概, 大约 and 伟大, i.e. a resultative complement, two
adverbs of approximation and an intensifier, and none of 大家 / 大学 / 大学生, which the reader's own
deck already shows. A polyphone gets a row per reading: **吧** is three words all read `bā` against
the card's neutral-tone particle, and **的** carries 目的 `dì` and 的确 `dí`. Ordered by the HSK level
each word is taught at, which is the syllabus's own frequency ordering, ties broken by how often the
corpus's example sentences use it. **All 71 rows had their reading and gloss checked against
CC-CEDICT before being written**, which caught one: 一百 has no dictionary entry at all (CC-CEDICT
carries no plain numeral compound above 十九), so 百万 took its place rather than shipping a row
nothing could verify.

**The field is on `hsk30l1` only.** Every other deck gets it in the batch that reaches it: the
catalogue's content revision is a hash over a deck's cards, so adding an empty field to eight decks
would rewrite eight files and offer no reader an update.

### Found while working, and left for the batch that reaches it

- **`菜肴` (hsk30l7) is glossed "Conjecture".** 菜肴 is cooked dishes, food. The gloss appears to have
  drifted from another card entirely, and it is invisible to every checker — it is a well-formed
  gloss, and `check-gloss-source.js`'s neighbour rule only fires on a card within two either way.
- **`不错` is glossed "correct" (hsk30l2)**, which reads wrong and **is not**: CC-CEDICT's own entry
  leads "correct; right; not bad". Checked and deliberately left. Recorded because the next reader of
  that card will have the same doubt.

### 2026-09-17 — Level 1, notes 31–60

**Twenty-five of the thirty.** Twelve are single-character cards and took a `Compounds` list; the
rest are the same shape of fault as the previous batch — a gloss that names one use while the
examples test another — plus one new class, below.

**The new class: a gloss that leaks its own answer.** The English → Chinese card's front is
`{{English}}` **and nothing else**, so a gloss carrying a character of its own headword hands the
reader the answer. **The previous batch shipped one**: the adverb sense written onto 边 read
"(一边…一边…) while doing two things at once". It is reworded to CC-CEDICT's own English word,
*simultaneously*. **多 had the same fault already** — "how (in a question: 多大? how old?)". Measured
over the nine decks the count was **15, and is now 13**; the survivors are listed at the foot of this
entry. **This is worth a checker and does not have one**: it is two lines of arithmetic (does the
gloss contain a Han character of the headword?) and nothing in the pipeline asks it.

**The other glosses.** 读 was glossed "read aloud" **and that is CC-CEDICT's own leading sense**, so
it is not wrong — but it was the only sense given and **not one of the card's three examples shows
it**; widened rather than replaced, which is the right answer when the dictionary and the card are
both defensible. 读书 is the same shape. 对不起 was the single word "sorry" while its first example
is 你对不起我 "You do me wrong", which is not an apology but the transitive verb the dictionary lists
separately — split, and each example tagged. 电话 missed the "phone number" sense its second example
uses. 饭 missed "a meal". 个 is a measure-word card whose gloss led with "individual" — **the same
fault as 本 in the previous batch**, and worth expecting on every classifier card. 第's gloss said
"sequence prefix (ordinal number marker)", the same thing twice. 非常's read "very, extremely
(everyday word)" — **the parenthetical is a note from the author to the author**, and on the reverse
card it is part of the prompt.

**Four examples replaced, and two of them were one fault.** 弟弟's and 哥哥's third examples carried
**the identical English, word for word — "His brother studies hard"** — which drops the elder/younger
distinction both cards exist to teach, so a reader comparing the pair learned nothing from either.
They are now deliberate mirrors of each other, 我弟弟比我小三岁 against 我哥哥比我大两岁: the two words
differ by exactly 小/大, and one frame shown twice with the opposite word is the clearest thing either
card can say. 儿子's second example ended in a **half-width ASCII question mark** — the same fault as
大学生's last batch, so expect more. 高兴's second was 怎么不高兴？rendered "What makes you sad?",
which asserts a sadness the Chinese does not and does not contain the headword in the English at all.

**A trap in the record worth knowing.** `dropEx` **also filters the record's own `ex` rows** — any row
whose Chinese contains a dropped string is removed. So a sentence whose ENGLISH alone needs correcting
cannot be fixed by dropping and re-adding the same Chinese; it has to be replaced with a different
sentence. That is why 弟弟 and 哥哥 got new sentences rather than corrected translations.

**The compound rows.** 48 rows over twelve characters, every reading and gloss checked against
CC-CEDICT first. **Four of the twelve — 第, 都, 二, 歌 — show an HSK 1 reader nothing** in the tap
panel. Two are polyphonic and carry a row per reading: **都** gets 全都 `dōu` against 首都, 都市 and
成都 `dū`, and **分** gets 十分 `fēn`, 部分 `fen`, 分析 `fēn` and 充分 `fèn`. Where the panel is
already full — **饭 has six words in the reader's own deck** — the rows deliberately go elsewhere
(饭碗, "a rice bowl; one's livelihood", is the kind of row the panel can never produce).

### Two measurements taken this batch, for the batches that come after

**67 glosses carry an American spelling, and a gloss is never converted.** `applySpelling` sweeps
`.uc-exe` — an example's English — and nothing else, so the gloss a reader sees is the gloss as
authored, whichever spelling they asked for. The corpus's own glosses lean British (-ise 95 against
-ize 72, -our 29 against -or 20) and the site is authored British. The count by word: practice 16,
favor 9, color 8, honor 6, defense 4, theater 4, center 3, license 3, program 3, traveler 2, meter 2,
tire 2, and one each of gray, plow, neighbor, analyze, aluminum. **It is a ceiling, not a work list**:
*practice* is the correct British noun and only the verb is *practise*, *tire* is a correct British
verb, and *program* is British for a computer program. 电影院's "movie theater" was fixed in this
batch because it fell in range.

**13 glosses still leak a character of their own answer.** 闭嘴, 过得, 个头, 什么事, 我靠, 是的,
有本事 (all `hsk30phr`), 早晨 (l4), 便 (l5), 辞典 (l7), 要紧 (l7), 无时无刻 and 染指 (both `idm`).
**Several are not really glosses at all** but CC-CEDICT's cross-reference boilerplate copied whole —
"same as 闭上嘴巴", "variant of 似的", "see also 哇靠" — which tells a learner nothing and is a
separate fault worth a pass of its own.

### Found while working, and left for the batch that reaches it

- **`酒店` (hsk30l2) is glossed "wine shop".** 酒店 is a hotel. CC-CEDICT lists "hotel; restaurant;
  wine shop", so the gloss is inside the dictionary's range and is nonetheless the wrong sense for a
  modern learner: the card's own examples will say.
- **`分析` (hsk30l5) is glossed "analysis" under a verb part of speech** — the noun-for-a-verb shape
  that dominates Levels 7–9, met here at Level 5.

### 2026-09-17 — Level 1, notes 61–90, and the punctuation pass

**The pass came first and took most of the batch's example work with it.** Sweeping the nine decks for
punctuation found **551 example sentences carrying an ASCII mark after a Chinese character** — 我明年想学汉语.
and 你们公司几点下班? and 我们出去后, 再也没有回来。 — so a card teaching Chinese was showing a beginner the
wrong marks for it. 40 of them were in Level 1 and seven fell inside this batch's own thirty.

**It is a deck-level pass, not an entry per note**, for the reason the Spanish record's `exBritish` is
one: there is no judgement in it, and a mechanical substitution written out per card is one that gets
applied to 116 cards and forgotten on the 117th. `decks.<id>.exPunct` turns it on, and it is on for all
nine. **389 example blocks changed.**

**IT CONVERTS A MARK AND NEVER ADDS ONE.** 150 sentences simply stop, with no terminal at all, and
supplying one is a claim that the sentence is COMPLETE — which a machine cannot make: four of them end
in 吗 or 呢 and want ？ rather than 。. Those stay hand work, batch by batch. **Level 1 has exactly
two**, 那个包包看起来好贵 (fixed here) and 我们也不得不做 (note #253, a later batch).

**And one survivor is deliberate**: `忍一时，风平浪静. 让一步，海阔天空。` in the Idioms deck has a full
stop MID-sentence, and the rule only converts one at the end, where an abbreviation cannot be mistaken
for a terminal. One sentence in 34,596; left for the batch that reaches it rather than widening a guard.

### The bug the pass turned up, which nothing else could see

**Eight cards were handing the speaker a fragment, or nothing at all.** A sentence is stored twice in
its block — once as the visible text, once in a `data-say="…"` attribute the speech control is handed —
and eight sentences contain an ASCII double quote, **which ends the attribute**. So 对话's speaker said
`和一个只说` and stopped; 加上's, 恐怕's and 嗯's said **nothing**, their sentences opening on a quote.
Every checker in the pipeline passed them: the card renders perfectly and the fault is inside an
attribute.

Two things came out of it. The quotes are now paired into “ ”, **and only where the count is even** —
an odd one cannot be paired and a guess would leave a quote unclosed. And **the spoken copy is now
DERIVED from the visible one** rather than repaired beside it, so the two agree by construction:
**34,596 of 34,596 blocks**, where before the pass eight differed. That equality is a cheap and strong
invariant and is worth asserting after any change to an example.

**A second thing the pass had to learn.** Fourteen sentences kept their ASCII marks after the first
run, and the reason is structural: this record **strips and rebuilds every `uc-exadd` block** from its
own `ex` rows, so a sentence the record owns was put straight back with the fault the deck-level pass
had just removed. The builder repunctuates its own rows now.

### The thirty notes

Nine glosses, three sense-tag sets, four examples and fifteen compound lists.

- **会** is the batch's worst card: glossed "to know how to; can; meeting" — three things under one verb
  part of speech, one of them a noun — while **not one of its three examples shows any of them**.
  明天会下雨, 你不会来 and 她会没事的 are all the future-and-likelihood auxiliary, which the gloss did not
  name at all. Split into the three senses CC-CEDICT lists, the missing one added, every example tagged.
- **很** is the most interesting. Two of its three examples do not translate 很 at all — 这个很便宜 is
  "This is cheap" — which reads as two careless translations and **is the most important thing about the
  word**: CC-CEDICT records it in terms, "often used before an adjective without intensifying its
  meaning". Added as a second sense and the examples tagged, so the two sentences that looked like
  mistakes become the card's own teaching point.
- **公司** was glossed "company; office" and *office is not a sense of 公司 at all* (that is 办公室).
  **汉语** was "Standard Chinese language", which is 普通话. **见** was "to see, to perceive with the
  eyes" while two examples are to MEET. **件** named clothing while both working examples are 事.
  **好看** was "good-looking" while its first example is a film.
- **汉字's second example was rendered "Can you read this kanji?"** — the Japanese word for these
  characters, on the card teaching the Chinese one.
- **件's third example was 今天我有一个备件** — 件 there is the second half of 备件, a spare part, so the
  card's own word does not appear in it.

**很 has no compound list, and that is the honest answer.** CC-CEDICT has no entry for 很多, 很少 or any
other word built on it: 很 is almost purely a free adverb. **Not every single-character card can have a
`Compounds` section**, and inventing rows for one that builds nothing would be worse than the gap.

**Three rows take the DECK's reading rather than the dictionary's** — 好处 hǎo chù, 后面 hòu miàn,
回来 huí lái against CC-CEDICT's neutral-tone forms — because the deck has a card for each and a reader
should not meet two readings of one word. CC-CEDICT sanctions the first outright ("also pr. [hao3chu4]")
and the rest are the mainland-against-Taiwan variance CLAUDE.md warns must not be swept.

### Found while working, and left for the batch that reaches it

- **`太` (hsk30l1, later in the deck) is glossed "very"**, which is 很's word: 太 is *too*, excessively.
  太贵了 is "too expensive", not "very expensive". It keeps its `not 很` hint, which still points at a
  genuine near-synonym.
- **Spaces inside a Chinese sentence**: `学习 汉语 难 不 难？` (hsk30l3, 难). Worth a sweep of its own.

### 2026-09-17 — Level 1, notes 91–120

**Twenty-seven of the thirty.** Nineteen are single-character cards, and **fifteen of those nineteen
show an HSK 1 reader nothing** in the tap panel — the highest proportion of any batch so far. Level 1
now has 64 of its 137 single-character cards carrying a `Compounds` list.

**了 was describing a different particle.** Its gloss read **"[makes an exclamation]"**, which 了 does
not do: it is the completed-action and change-of-state marker, and all three of the card's examples are
one or the other (出租车到了, 吃饭了没有, 你回来了吗). CC-CEDICT gives "(completed action marker)" beside
"(modal particle intensifying preceding clause)", and the old gloss looks like a garbling of the second.
**This is the commonest particle in the language.** The two uses are given as ONE sense deliberately —
that is the standard teaching formulation, and the card's own sentences do not split cleanly between them.

**块 did not name the sense its first example uses.** 我给你五块钱吧 is 块 as the everyday word for a
unit of money, which is how a beginner meets it on the first day; the gloss said "lump; piece". Split,
with each example tagged.

**开's three examples use three different senses and two were unglossed** — 她开出租车 is to drive,
这门打不开 is to open, 火车几点钟开 is to depart, against a gloss of "to switch on; open". **看病** was
glossed only from the patient's side while its second example is the doctor examining the patient.
**课** was "lesson" while all three examples are a class. **里** was the single word "in", which is true
and hides the one thing a beginner gets wrong — 里 FOLLOWS its noun where English "in" precedes it.

**吗's gloss read "[makes a yes; no question]"** — and the semicolon is the corpus's own separator
BETWEEN senses, so the card appeared to teach two of them, one of which was the word "yes".

**Three more verbs glossed without their "to "** — 看见 "see", 买 "buy", 觉得 "to think; feel". 买 is
the sharp case: its opposite number 卖, one card later, already read "to sell", so the pair disagreed
with each other about the form.

**姐姐 had the 哥哥 / 弟弟 fault.** Not one of its three examples translated 姐姐 as anything but
"sister", so the word the card exists to teach — the ELDER one — appeared in none of its own English.
Fixed the same way, with an authored sentence that states the relative age. **妹妹 is the other half
and is later in this deck**; it says "little sister" in one of its three, so it is less bad and is
recorded rather than reached for.

**Three compound rows take the DECK's reading rather than CC-CEDICT's** — 看来 kàn lái, 一块儿 yí kuàir,
起来 qǐ lái — because the deck has a card for each and a reader should not meet two readings of one
word. 一块儿 is also the 一 tone sandhi CLAUDE.md says must not be normalised away.

**吗's own compound list is the batch's best use of the section**: 不是吗 `ma`, 干吗 `má`, 吗啡 `mǎ` —
three rows covering all three of the character's readings, none of which the card's particle gloss
could show.

### Found while working, and left for the batch that reaches it

- **Thirteen example translations are in a markedly colloquial or nonstandard English**: "Don't matter"
  (块), "Nope" (买, 它), "wanna" (谁, 玩, 回去), "ain't" (算), "gonna" (纸巾, 报警, 鲨鱼, 下线, and two
  more in Levels 7–9). 买's was replaced, because its CHINESE was weak too — 我不买它 puts a pronoun
  object where Chinese would drop it. **块's was NOT**: there the Chinese is sound and only the
  contraction is off, which is not worth losing a good sentence over. That is the line this pass draws
  between an English that is *wrong* (高兴's "What makes you sad?", two batches ago) and one that is
  merely informal.
- **妹妹** needs the mirror of 姐姐's third example.

### 2026-09-17 — Level 1, notes 121–150

**Twenty-one of the thirty.** Only nine are single-character cards this time, which left room for the
glosses — and this is the first batch where the worst faults are in the **example sentences** rather
than the glosses.

**Two examples are not grammatical Chinese.**

- **们's second example was 您们是学生吗？** and **您们 is not standard Chinese**: 您 has no plural
  form — the plural is 你们, or a term of address — and CC-CEDICT has no entry for it. A beginner's
  card was teaching an error.
- **呢's third was 你能解决这个问题呢吗？** and **呢吗 cannot stack**: two sentence-final particles do
  not co-occur.

**Two more examples do not contain their own card's word.** 男's third was 你还是处男吗？— 处男 is a
word, so 男 does not stand alone in it, and the subject is not one a beginner's card should raise
unasked. 你好's third was 这是为你好 "It's for your own good", which is 为 + 你 + 好 and not the
greeting at all.

**And one English says the opposite of its Chinese.** 男朋友's first example was 我想男朋友。rendered
"I want a boyfriend" — but 想 with a person as its object is **to miss** them, so the sentence means
"I miss my boyfriend".

**能's third example ended in 。 although 吗 makes it a question.** The punctuation pass cannot see
this: the sentence HAS a terminal, it is simply the wrong one. **Measured over the whole corpus there
are exactly two**, and the other (你想打排球吗。, Level 4) is recorded for its batch. Note that the
obvious wider check — a sentence ending in a question particle and a full stop — is a **false-positive
generator**: 吧 correctly ends a statement (我们分手吧。 is "Let's break up"), and so does 呢. Only 吗
is safe to test.

### The glosses

- **们's gloss was cut off mid-phrase**: "plural suffix for pronouns and nouns referring to" — referring
  to what? CC-CEDICT's own wording is "plural marker for pronouns, and nouns referring to individuals",
  and the card carried the first two-thirds of it.
- **没有 taught half of itself.** Glossed "don't have" under a part of speech of `verb / adverb`, while
  **two of its three examples are the adverb** — 知道了没有 and 他还没有来 negate a completed action.
  Among the commonest words in the language.
- **呢's gloss read "[returns; forwards a question]"** — garbled exactly as 吗's was last batch, the
  semicolon reading as a separator between two senses. **That is now three particle cards in two
  batches whose glosses were mangled** (了, 吗, 呢); it is worth expecting on the rest.
- **哪 and 那 are the same fault mirrored.** 哪 was glossed "which?" while two of its examples are
  WHERE (爸爸去哪了), and 那 had no sense for its own second example 你还在那吗 "still out there". Both
  are the colloquial reduction of the two-syllable place word, both are what a beginner actually hears,
  and **neither is in CC-CEDICT** — so the added senses rest on the cards' own sentences and are marked
  colloquial. The reduced forms are deliberately NOT written out in the glosses, since each contains its
  own card's character.
- **名字** was glossed "given name" while all three examples are simply a name.

**The four sibling cards now agree.** 哥哥, 弟弟, 姐姐 and 妹妹 all state the relation in their own
English and differ from each other by exactly 大/小. 妹妹 was recorded last batch and repaired here.

### On the compound lists

**您 gets ONE row, and that is the complete answer**: CC-CEDICT has exactly one word built on it, 您好.
A section of one looks thin and is honest — and it is a word the reader needs that their deck has not
got. (Compare 很 two batches ago, which builds *nothing* and so gets no section at all.)

**们's list is the clearest case yet for the section existing.** All five of the 们 words in the
reader's own deck are PRONOUNS; 孩子们 shows the half of the gloss the deck cannot.

### 2026-09-17 — Level 1, notes 151–180

**Twenty-two of the thirty**, thirteen of them single-character cards. Six of those thirteen show an
HSK 1 reader nothing in the tap panel; **上's panel is the fullest in the deck at six words**, so its
rows go elsewhere — 马上 above all, where 上 does work none of those six shows.

**Another sentence that is not grammatical Chinese.** 起床's first example was **她晚了起床。** — the
adverbial cannot stand there; it has to be 她起床晚了 or 她很晚才起床. That is the third such sentence in
two batches (您们, 呢吗, and this), which is worth expecting rather than being surprised by.

**And one that models the mistake the card should prevent.** 女士's first example was **我是位女士。** —
位 is the POLITE measure word, used *of other people*. Using it of oneself is exactly what a learner
has to be taught not to do, and the card was modelling it. Replaced with a sentence that uses 位
correctly, of somebody else.

**Two more examples do not let their own character stand alone**: 女's 孙子女 (a word, and a formal one
three levels above this deck) and 千's 千层面, which is lasagna — so the card teaching the numeral for a
thousand was illustrating it with an Italian dish.

**A tense the Chinese does not have.** 朋友's first example, 我们是朋友。, was rendered "We *were*
friends". The Chinese is present. On a beginner's card that teaches the wrong mapping outright.

**上班's second example said the opposite of its Chinese** — 你今天晚上有没有要上班？rendered "Are you
off tonight?" — and the Chinese itself is awkward besides.

### The glosses

- **请's gloss was "to invite; please" under a single verb part of speech**, and "please" is not a verb:
  it is what 请 does at the head of a request, which is the card's own first example. Split, with the
  examples tagged.
- **上班 was glossed "start work"** — no "to ", and only one of the word's senses, while two of its three
  examples are GOING to work.
- **少's first sense was the single word "few"**, against examples that need *missing* (什么也没少) and
  *seldom* (她很少出去).
- **上午 was glossed "morning" — and so is 早上, two cards in the same deck for two different parts of
  the day, told apart by nothing.** 上午 is the forenoon; 早上 is early morning. Said in English rather
  than by naming the other card, since a gloss is the whole of the reverse card's front.

### Found while working, and left for the batch that reaches it

- **`早上`'s gloss carries "(everyday word)"** — the parenthetical author's note cut from 非常 four
  batches ago. It is later in this deck. **Worth grepping for as a class**: it is the third shape of
  "text that is not a gloss" this pass has met, after the truncation (们) and the cross-reference
  boilerplate (闭嘴, 是的).
- **Three compound rows take the DECK's reading over CC-CEDICT's** — 回去 huí qù, 别人 bié rén,
  价钱 jià qián. That is now the settled rule and it has come up in four batches running: **where the
  deck has a card for the word, the compound row matches the card.**

### 2026-09-17 — Level 1, notes 181–210

**What the batch was.** The thirty cards 谁 → 听见, read one at a time against CC-CEDICT and against
their own three sentences. **Nineteen were changed**, eleven left alone. The batch also added a field
to the applier, `exEn`, for a fault the record could not express (below).

### The one fault a reader would notice first

**岁 was glossed "year (of crop harvests)".** That is CC-CEDICT's THIRD and rarest sense of the
character, and not one of the card's own three sentences shows it: 你十岁了吗, 他的儿子今年八岁 and
明天是她五岁生日 are all AGE, which is the dictionary's first sense and the only one a beginner will
ever meet. A learner working through Level 1 was being taught the harvest.

### The mechanism this batch had to add, because it cost a round and reported nothing

**`dropEx` plus a re-add of the SAME Chinese does not work, and fails silently.** The obvious way to
correct a translation while keeping a good sentence is to name the sentence in `dropEx` and put it
back through `ex` with a better English. It does not: the drop deliberately filters the record's own
`ex` rows as well as the deck's blocks (so that a `dropEx` on a *harvested* sentence is not undone by
the rebuild), so the re-add is thrown away. **手机 came back with one example instead of three, 事 and
谁 with two, and nothing anywhere said so** — `--check` passed, because the record's claims were all
carried.

So the applier gained **`exEn`**, `[[chinese, english]]`, which rewrites one block's `uc-exe` div in
place. It is the same class of edit as `dropEx` — a permanent mutation of a generator block, which
this repo cannot undo — and it is **checkable where `dropEx` is not**: the new English is re-asserted
on every run, so a row that matches nothing is always a typo rather than a repair already made, and it
FAILS rather than being noted. Liveness-tested by pointing a row at a sentence the note has not got.

### The glosses

- **时候 had been given 时间's meaning.** Its gloss was "[duration of] time", which is verbatim one of
  CC-CEDICT's senses for 时间 — the other card in the same deck — so the pair was told apart by
  nothing, and the one that got the duration reading was the wrong one. 时候 is the moment something
  happens; 时间 is the quantity of it.
- **太 was glossed "very".** CC-CEDICT leads with "too (much)", and two of the card's three sentences
  are the fault-finding sense (不要太晚去睡觉, 那个店的菜太贵). A learner taught "very" writes 太好 for
  "very good", which says the opposite. Split into the two senses the examples show.
- **什么 taught the interrogative and showed the indefinite twice.** 我们什么都做不了 and 什么也没少 are
  not questions. Split, and each example tagged with the sense it shows — the second use of `exSense`
  in Level 1.
- **生病** was three adjectives ("ill; sick; unwell") under a verb, and **听** lost the "to " off the
  second half of "to listen; hear". The register rule again, twice.
- **天's first sense was a run-on**: "sky, heaven, or the celestial realm" — three renderings of one
  meaning, the third of them a phrase no beginner needs and the dictionary does not use.

### Two blocks floating above the senses, which the record did not own

**他们 and 她们 each carried TWO blocks above their senses** — the deck's own `not X` hint, and under
it a bare phrase, "of a mixed or male group" / "of a female group". Nothing else in the nine decks has
that shape and the record had no entry for either. The restriction is real and CC-CEDICT states it the
ordinary way (她们 is "they; them (females)"), so it is folded into the gloss, where it is part of the
question the reverse card asks rather than an aside above it. 它们's "they (for inanimate objects)" —
an instruction to the reader rather than an English equivalent — was reworded to match, and widened:
the card's own first sentence, 它们吃这些东西, is about creatures that eat, and the dictionary gives 它
as "it (pronoun for an animal)".

**Three `not X` hints were removed from the record with those glosses** (他们, 她们, 太), which is the
applier's own documented rule — a note given a distinguishing gloss no longer needs a hint, and a
disambiguator disambiguating nothing is worse than none. **很's `not 太` was KEPT**: shown "very;
quite", a beginner really may still reach for 太, so that one goes on telling the reader something
true. The coverage checker reports **0 still-ambiguous groups** after the removals.

### …and one leak the new gloss introduced, caught before it shipped

The second sense of 太 was first written **"so; extremely (in 太…了)"** — which puts the card's own
character on the front of the English → Chinese card and hands the reader the answer, the same fault
found on 边 five batches ago. Rewritten as "(in an exclamation)". **The standing corpus count of
glosses that leak their own answer is 13, and it is still 13**; all thirteen are outside Level 1.

### The sentences

- **谁's 谁不知道的？** is not grammatical: 的 cannot close a rhetorical question of that shape.
- **说话's 你给谁说话？** teaches a preposition error in the one frame the word is most needed for —
  说话 takes 跟 or 和 for the person spoken to, never 给.
- **时候's 我小时候的时候还没有电脑。** says "when I was small" twice over; 小时候 already carries 时候.
- **手机's 苹果是非凡的手机。** rendered 苹果 as "the iPhone" — it is the fruit, or at most the company,
  never the handset — and put a Level 7 word (非凡) in a Level 1 sentence.
- **它's 不，我不买它。** modelled an English speaker's Chinese: the pronoun object does not stand there
  (我不买 is the sentence). Its "Nope" and 谁's "wanna" are two of the thirteen over-colloquial
  translations measured in batch 5; **this is the first batch that could repair the English without
  throwing the Chinese away**, which is what `exEn` is for.
- **事's "Anybody knows it"** is not English for 人人都知道.

### Two fixes that are not about meaning

- **手机's measure words were 部 and 支.** 支 counts pens, sticks and cigarettes, not telephones;
  CC-CEDICT gives 部 and 台, which is what a reader will hear in a shop.
- **Its other two sentences said "cellphone" and "cell phone".** The decks are authored in British
  English, because the site's spelling switch only ever converts British to American and never back, so
  an American form inside deck content is what BOTH readers see. Rewritten with the Chinese untouched.

### On the compound lists

**Thirteen of the range's sixteen single-character cards got one; three did not, and that is the
honest answer.** 谁 builds no multi-character word in any of the nine decks at all; 它 and 她 build
exactly one each (它们, 她们), which is below the three-row floor and is a list the card sitting two
rows away already is.

**是's section is the argument for the feature in miniature.** Every row on it — 但是, 可是, 还是,
总是, 要是 — is a conjunction or an adverb rather than the copula the card teaches, and 是 is far
commoner inside those five than it is on its own. The card had said "to be" and stopped.

**天's panel is the fullest in the deck**, six words, and five of the section's rows are among them:
今天, 明天, 昨天, 天气, 天空. No authored row could be more useful to a beginner than 今天, so for once
the section and the tap panel agree.

**One row takes the DECK's reading over CC-CEDICT's** — 太阳 tài yáng against the dictionary's
neutral-tone tài yang. Fifth batch running for that rule.

### Read and left alone

十, 时间, 是, 书, 书店, 水, 水果, 睡, 睡觉, 四, 他, 她, 天气, 听见 are all right as they stand.

**说 and 说话 keep their parenthetical glosses**, "(the general verb)" and "(as an activity)", and that
is a deliberate reversal of the reading this batch started with. They look like the author's-note class
cut from 非常 and recorded on 早上 — but the record shows they were WRITTEN by the disambiguation pass,
for a collision of three or more that cannot take a `not X` hint, and they carry a real semantic
distinction rather than a remark about register. **The line drawn here: a note about the card's own
register or usage is cut; a restriction on the meaning stays.** Rewording them was measured and
rejected besides — 曰 already holds "to say; to speak" in Levels 7–9, so the obvious replacement
gloss would have opened a new collision.

**很's second sense is a parenthetical and nothing else** — "(before an adjective, often just a link
rather than an intensifier)" — which is a note where a gloss should be. It is note #79 and was read in
batch 4; it is recorded again here because this batch touched its pair. It wants a rewrite that says
the same thing in answerable English, and that is a judgement rather than a substitution.

**The five Level 1 `check-example-fit.js` findings are all the greedy segmenter losing to a longer
word** (有时|间 in 你后天有时间吗, 不便|宜 in 这不便宜, 最好|听, 十分|钟, 看中|文). None is a real
fault and none was introduced here.

### 2026-09-17 — Level 1, notes 211–240

**What the batch was.** The thirty cards 同学 → 写, read one at a time against CC-CEDICT and against
their own three sentences. **Twenty-three were changed**, seven left alone. One card outside the range,
十, had its compound list rewritten — see below.

### The one fault a reader would hear

**喂 was taught at the wrong tone.** The card said `interjection — hello` with the reading **wèi**, and
CC-CEDICT files the two apart: **[wei2]** is "hello (when answering the phone)" and **[wei4]** is "hey
/ to feed". So the card gave the telephone greeting at the feeding tone, and a learner picking up a
phone and saying wèi is saying a different word. **The card's own sentences said so all along** — two
of its three are feeding (我正在喂孩子, 我早上不喂狗) and only one is the greeting. Split into the two
readings in the shape 便 and 咽 already use, and each example tagged. `check-pinyin.js` skips a
two-reading card by design, so the bopomofo was written beside the pinyin by hand.

### The character that was never shown doing its own job

**外 was glossed "outside" and then shown three times inside a longer word** — 出外 twice and 外债 once
— so a beginner never met it standing alone. The third of those, 我没有外债。rendered "I am free of
debt", is wrong besides: 外债 is FOREIGN debt, a Level 7 word in a Level 1 sentence. **That mistake is
also the missing half of the gloss.** CC-CEDICT gives "outside / in addition / foreign / external", and
FOREIGN is the sense a learner meets first, in 外国 and 外语. Added, with an authored sentence for each
sense.

**Note for the next batch: `check-example-fit.js` cannot see this.** It segments against the nine
decks' own 11,532 words, and 出外, 外债, 小雨 and 小孩子 are all real Chinese words that are not among
them — so a card showing its headword inside one of them passes the checker and fails the reader. 小
had the same fault (只 one of its three sentences had 小 standing alone) and was found the same way, by
reading.

### The glosses

- **晚's gloss was "evening, night, late" under a single `adjective`**, and two of those three are
  nouns. What the card could not say is that only "late" is 晚 standing on its own; the other two are
  what it means *inside* a word (晚上, 夜晚, 傍晚). Marked **(bound form)**, which is CC-CEDICT's own
  wording, and which is why no example can show that sense.
- **想 led with the sense it never showed.** Glossed "to want; to think" while all three sentences were
  THINK; the dictionary's own order puts thinking first and wanting fourth. Split, and the weakest of
  the three sentences (我也这么想, which says what 我想没关系 already says) replaced with one for the
  second sense — which a beginner needs in their first week.
- **下 gave three senses and its own first example showed a fourth.** 下个星期见 is 下 meaning NEXT,
  which CC-CEDICT states outright and the card did not have. Added and the examples tagged; 昨天下大雨
  is left untagged, 下雨 being a word of its own with a card of its own.
- **问题 was glossed "problem" alone**, where the dictionary leads with "question" — the sense a learner
  meets every day in a classroom and could not produce from this card.
- **午饭 carried "(everyday word)"**, the parenthetical author's-note class cut from 非常 and recorded
  on 早上. That is now three of them found in Level 1; expect more.

### The sentences

Eight replaced or retranslated, in four kinds:

- **Not grammatical.** 外边's 春季的时候…所以在外边的花不开花 (花不开花 is the noun and the verb said
  twice; it is 花不开), and 小学生's 有两千小学生到校 (a counted noun needs its classifier — the card's
  own measure-word row says 个 and 名).
- **The sentence already dropped from another card.** 晚's first example was 她晚了起床, the same
  ungrammatical line dropped from 起床 two batches ago. **A bad sentence can sit on two cards**, and
  fixing one does not find the other; it is worth grepping the deck for a dropped sentence's text.
- **English that is not English, or not the sentence.** 同学's "Do you like classmates in class?",
  问题's "When did the error occur?" for 问题是怎么出现的 (怎么 is how, and 问题 is not an error),
  些's "What am I hearing now?" for 我要听些什么, 下班's "When do you close?" (neither 公司 nor 下班 is
  in it).
- **Over-colloquial, or an idiom for its own sake.** 玩's "Wanna hang out tonight?" and 我's 他出卖了我
  "He sold me down the river" — a Level 5 word and an idiom that says nothing about the Chinese, on the
  card for the commonest pronoun in the language. Two more of the thirteen measured in batch 5; **the
  `exEn` field added last batch is what made four of these repairable without throwing good Chinese
  away.**

Also 小朋友's 小朋友都是外国人 "Children are all foreigners", which is not a sentence anybody would say
in either language.

### On the compound lists

**The rule this pass has actually been following is now written down, because the last batch got it
wrong.** Candidates come from the corpus where it has them and **from CC-CEDICT where its words are too
few or too advanced for the level**. Batch 8 drew 十's list from deck words only and so offered a
Level 1 reader 十分, 十足 and 十字路口 — every row correct, checked, and not what anybody learning to
count needs. **十's list is rewritten here**: 十一, 十二, 二十, 十分, 十字路口. None of the first three
is in any of the nine decks.

**五 is the same case and could only be done this way.** Every multi-character word the decks hold for
it is an idiom — 五颜六色, 五湖四海, 四分五裂 — so all four rows are the dictionary's: 五月, 十五, 五十,
星期五.

**喂's three rows are all the FEEDING reading**, because the telephone greeting builds no word at all.
That is worth a reader seeing directly beside the split gloss.

**些 gets no section, and that is the honest answer.** Its tap panel already finds all five words it
builds that a learner needs (这些, 一些, 有些, 那些, 哪些) — they are every one of them in the reader's
own Level 1 deck — and a section repeating exactly those five is noise rather than information. The
feature exists for the characters the panel underserves.

**Four rows take the DECK's reading over CC-CEDICT's** — 学问 xué wen, 一下 yí xià, 下来 xià lái,
小姐 xiǎo jiě. Sixth batch running for that rule.

### Read and left alone

晚饭, 晚上, 问, 我们, 五 (the card itself), 下雨, 下课, 下午, 先生, 现在, 小时, 小学, 写 are right as
they stand. 外's first example, 我们出外吃饭吧, keeps its bound use: 出外 is natural Chinese and one of
the three sentences may fairly show the character inside a word once the other two show it free.

### 2026-09-17 — Level 1, notes 241–270

**What the batch was.** The thirty cards 谢谢 → 再, read one at a time against CC-CEDICT and against
their own three sentences. **Twenty were changed**, ten left alone.

### The one to read first

**一's gloss stopped in the middle of a phrase.** "one; once; first; structural word between two of
the" — between two of the *what*? That is the **third truncated gloss this pass has found** (们's
"plural suffix for pronouns and nouns referring to" was the first, 呢's was the second) and it is on the
commonest character in the language. Cut to CC-CEDICT's own "one; a; single", which is also what all
three of the card's sentences show.

### An example that was not the headword at all

**有点儿's first sentence was 她有点儿面包。"She has a little bread".** That does not contain this
card's word: it is 有 plus 一点儿, a verb and its object, where 有点儿 is the ADVERB the card glosses
and stands in front of an adjective. **No checker here can see this** — `check-example-fit.js`
segments against the decks' own lexicon and 有点儿 *is* in it, so the characters line up and the
sentence looks perfect. Found by reading.

**有的 was worse: two of its three sentences were not the word either.** 这是常有的事 is 常有 plus 的,
a relative clause; 有的，先生你有几位？ is 有的 as the affirmative reply "yes, we do", followed by an
unrelated restaurant greeting. Only the third showed the pronoun the card is for.

### The glosses

- **学 was "to study, to learn, or knowledge" under one `verb`** — a run-on with a noun tacked on by
  "or", the same shape as 天's "or the celestial realm". CC-CEDICT gives five senses and two were
  missing, **one of them the card's own first example**: 学学你姐姐 is "copy your sister", which nothing
  on the card explained. Split three ways, with "-ology" marked (bound form).
- **要 was "want; be going to; ask for; demand" under one `verb`** — four senses, no "to " on any of
  them, and one of the four is not a verb. Split into the verb and the auxiliary, which is exactly how
  the card's own sentences split.
- **月's "month; moon" was one sense**, and only "month" is 月 standing alone — the moon is 月亮. Marked
  (bound form), as 晚 was last batch.
- **一些 showed a sense it did not have**: 你会好一些 is the comparative, "a little BETTER", which
  CC-CEDICT states and the card's gloss "some" cannot reach.
- **一下's gloss was a bracketed instruction**, "[used after a verb] give something a go", so the reverse
  card's front was a note about grammar. Reworded so the meaning leads and the restriction follows.
- **谢谢 was "thank you" under `verb`**, a phrase where a verb was claimed; both are wanted.
- **有的's "(there are) some (who are...)"** is CC-CEDICT's own wording verbatim and is not wrong — it is
  two bracketed asides round one word, and unanswerable as the front of a card. Said plainly.

### The sentences

- **新月出来了。was the same line on two cards**, 新's second example and 月's first, and on both of them
  the headword sits inside 新月. That is the second one-sentence-two-cards find in two batches (她晚了起床
  was the first); it is worth grepping the deck for a sentence before authoring its replacement.
- **你是小雨吗？"Are you Xiao-yu?"** on 雨's card — 小雨 there is a person's NAME, so a beginner learns
  that 雨 is something people are called.
- **我们也不得不做** on 也's card had **no terminal punctuation at all**, and was built on a Level 4
  construction. It is one of the 150 the corpus-wide punctuation pass deliberately left alone, that pass
  converting marks and never adding one.
- **Not grammatical:** 昨天没学生去那 (the negative needs 没有 before a noun, and the place word is 那儿),
  and 我吃了一半三明治了 (two 了 in one clause and a missing 的).
- **English that is not the sentence:** "They were students" for 他们是学生 (present tense in the
  Chinese), "I owe him $100" for 我欠他一百元 — **on the card for the yuan**, which is the one
  substitution it cannot afford — "The man is naked" for 那人没穿衣服, "Some people must be friendzoned"
  for 有些人只能成为朋友, and "I will do it tomorrow" for 我明天再做, which drops 再 altogether.

### A fault in the RECORD, not in a deck — and the sweep that finds it

**有的's earlier `ex` and `dropEx` were clobbered rather than extended** when this batch's fields were
merged onto the note, so the card came back with two sentences instead of three and the record stopped
claiming a drop it had really made. **It is the second time** (包子 in batch 2 was the first), and
`--check` passes either way, because the record's *current* claims are all carried.

**So this is now a standing step at the end of a batch**, and it is one command:

```
node -e "const j=s=>JSON.parse(require('child_process').execSync('git show '+s+':.claude/decks/mandarin-fixes.json',{maxBuffer:1e9}));const o=j('HEAD').notes,c=JSON.parse(require('fs').readFileSync('.claude/decks/mandarin-fixes.json')).notes;for(const k in o)for(const f of ['ex','dropEx','exEn','compounds','reviewed'])(o[k][f]||[]).forEach(x=>{const n=JSON.stringify((c[k]||{})[f]||[]);if(n.indexOf(JSON.stringify(x))<0)console.log(k,f,JSON.stringify(x))})"
```

It prints every note that has LOST an array element since the last commit. A batch that adds `ex`,
`dropEx` or `exEn` to a note that already has one must **append**; a gloss or a sense list is a
replacement and is meant to be.

### On the compound lists

**学's panel is the fullest in the whole deck — eleven words — and every one of them is a school**
(学校, 学生, 大学, 中学, 小学, 上学, 同学 and their compounds). So all four rows go where the panel
cannot: 科学, 数学, 化学, 文学, which is the (bound form) sense this batch has just added to the gloss
and the one a reader would otherwise never see an example of.

**一's five rows each carry a DIFFERENT TONE on 一, and that is the point of the list.** 一 is written
yì before a first, second or third tone and yí before a fourth, so 一起, 一样, 一定, 一直 and 一切 show
the sandhi the card's own reading (a plain yī) cannot. All five take the deck's spelling — seventh batch
running for that rule, with 不要 bú yào and 月饼 yuè bing beside them.

**美元 leads 元's list deliberately:** a reader just told that 元 is the yuan needs to know the same
character counts the dollar, which is the confusion the card's own second example had already made.
**下雪 leads 雪's and is in none of the nine decks** — the corpus has 下雨 and not its counterpart, which
is exactly the gap this section exists to fill.

### Read and left alone

星期, 星期日, 星期天, 休息, 学习, 学校, 雪 (the card), 医生, 医院, 椅子, 一点儿, 有 and 有些' first two
sentences are all right as they stand. 再's gloss keeps its parenthetical, "(of something still to
come)": unlike "(everyday word)" or "(the general verb)" that is a restriction on the MEANING — it is
what separates 再 from 又 — and this pass cuts notes about a card, not restrictions on a word.

### 2026-09-17 — Level 1, notes 271–300 — **the deck is finished**

**What the batch was.** The last thirty cards of HSK 1, 在 → 做, read one at a time against CC-CEDICT
and against their own three sentences. **Twenty-two were changed**, eight left alone. One card outside
the range, 汉语, was reglossed because this batch's work on 中文 left the two saying the same thing.

**All 300 cards of Level 1 have now been read.** Ten batches, roughly 220 cards changed.

### The fault this batch found most of

**A gloss naming one sense while the card's own sentences show another**, four times over, and every
one of them a word a beginner uses daily:

- **坐 was glossed "to sit"**, and two of its three sentences are 坐出租车 and 坐火车 — TAKING a taxi,
  going BY train. You take a bus far more often than you announce that you are sitting down, and the
  card gave a reader no way to produce it.
- **怎么 was glossed "how?"**, and two of its three are WHY — 怎么会这样, 我怎么看不见他们 — as both of
  the card's own English translations say.
- **早's "early; morning"** was one `adjective`, and only "early" is 早 standing alone; marked
  (bound form) exactly as its opposite 晚 was.
- **做's "to do; to be; become (an occupation)"** glued two senses together with a semicolon and dropped
  the "to" half way through.

### And the other half: sentences that are not the card's word

**再见's second and third examples were 再 plus 见** — 我们还能再见吗 is "can we MEET again", 我不会再见她
is "I won't SEE her again" — where 再见 is the farewell the card glosses. That is the third card in two
batches with this fault (有的 and 有点儿 were the others) and it is invisible to `check-example-fit.js`
every time, for the same reason: the compound is in the decks' own lexicon, so the characters segment
perfectly and only the meaning is wrong.

**你们住这里。was the same sentence as 这里's own first example** — the third one-sentence-two-cards find
in three batches, after 她晚了起床 and 新月出来了. It is worth grepping the deck for a sentence's text
before authoring its replacement.

**中学's 你是中学学生吗？ taught a form Chinese does not have**: the compound is 中学生, which is the very
next card in the deck. Its English also said "high school" where the gloss and its sibling example say
middle school.

Also: 只's 我是只猫吗 (a classifier with no numeral in front of it), 字's 她不会读书写字 (字 inside 写字,
in a fixed pair of two-character verbs), 真's 真男人喝茶 (真男人 is not standard; it is 真正的男人),
找's 一个人藏，十个人找 (a proverb on a Level 5 verb), and 中学生's twenty-character sentence built on
只不过, 普普通通 and 不算特别.

### A mechanism finding: a hint and a gloss cannot sit on one note

**中文 was glossed "Chinese [written language]" and its own first sentence is 我会说中文 — speaking it.**
The bracket is simply false and CC-CEDICT gives "Chinese language" flat. But removing it left 中文 and
汉语, two cards in the same deck, both reading "the Chinese language", and **the deck's own `not X` hint
cannot fix that**: the applier writes the hint above the senses and then `gloss` REPLACES the whole
English field, so a note carrying both keeps only the gloss. That is deliberate and documented — a note
given a *distinguishing* gloss does not need a hint — but it means **a note whose gloss is merely
CORRECTED cannot have one either**. The `--check` pass is no help: it reports the record's claims
carried, and the wiped hint was never a claim.

So the distinction is said in the gloss instead, in the words' own terms: **汉语 is "Chinese; the Han
language"**, which is what every textbook tells a beginner and what 中文 does not say. The pair now
differs on the front of the card rather than in a block that would not survive.

### On the compound lists

**这's four rows are all ones the panel cannot reach.** The reader's own Level 1 deck already holds
这个, 这里, 这些, 这儿 and 这边, so a list repeating them would be noise — which is why 些 was given no
section at all two batches ago. 这样, 这么, 这种 and 这时 are the next four and are in no Level 1 deck.
One candidate had to be dropped on the way: **这次 is not a CC-CEDICT headword** (it is compositional),
and the rule is that every row is checked, so it was replaced rather than kept.

**船只 is the row that earns 只 its section.** It is the only one of the five on the **zhī** reading —
the classifier this card teaches — where every other compound 只 builds abandons it for zhǐ.

**坐下 takes CC-CEDICT's neutral-tone zuò xia**, and is the first row in four batches to take the
dictionary's reading over a deck card's, for the simple reason that there is no deck card for it. The
deck-reading rule only ever applies where the deck has one.

### Read and left alone

在, 早饭, 这个, 这里, 这儿, 这些, 正在, 中国, 中午, 昨天, 做饭 and 桌子's first and third sentences are
right as they stand. 住's gloss keeps its parenthetical, "(a number of nights)": it is a restriction on
the meaning, not a remark about the card, and this batch gave it the example it had been missing.

### What Level 1 looked like, over ten batches

The same handful of faults, again and again:

1. **A gloss that is one of CC-CEDICT's senses and not the one the card's examples show** — 岁 at "year
   (of crop harvests)", 坐 at "to sit", 太 at "very", 怎么 at "how?".
2. **A sentence that does not contain the headword**, though its characters are all there — 有点儿, 有的,
   再见, 外, 小, 字.
3. **A verb glossed without its "to "**, or a phrase glossed under `verb` — 生病, 听, 知道, 谢谢, 起床.
4. **A parenthetical that is a note about the card rather than English** — 非常, 早上, 午饭, 一下, 有的.
   The line drawn: a note about register or usage is cut, a restriction on the meaning stays.
5. **A gloss that stops in the middle of a phrase** — 们, 呢, 一.
6. **English that is not the sentence** — a tense the Chinese does not carry, an idiom that drops the
   headword, slang, or a dollar sign on the card for the yuan.

### 2026-09-17 — Level 2, notes 1–30

**What the batch was.** The first thirty cards of HSK 2, 啊 → 但, read one at a time against CC-CEDICT
and against their own three sentences. **Eighteen were changed**, twelve left alone. The deck's card
type also gained the **`Compounds`** field, copied from Level 1's own definition in the record rather
than retyped, so the two cannot drift.

### The one to read first

**打's gloss named three senses and not one of its three sentences shows any of them.** It said "to hit,
to strike, to make (a phone call)"; the card's examples are 他打了网球, 你不打网球吗 and 打的去旅馆吧 —
playing tennis twice and taking a taxi. CC-CEDICT calls 打 "a semantically light transitive verb used
with various objects", which is the whole difficulty with this character: what it means depends on what
follows. Split into the three a beginner meets first and each example tagged.

### The Level 1 fault shapes, all present in the first thirty cards of Level 2

The six shapes the Level 1 log closes with are not a property of that deck. Every one of them turned up
again here:

- **A gloss that is CC-CEDICT's sense and not the card's.** 不错 was glossed "correct" with all three
  sentences showing "not bad; pretty good". 班 was "class" while its third sentence counts a scheduled
  FLIGHT. 错 was "wrong" while its second is the noun, "it's not my fault". 不好意思 was "to feel
  embarrassed" while its second is the "excuse me" a stranger opens with.
- **A gloss that creates the collision its own hint then papers over.** **本子 was glossed "book"**,
  which is 书 — the very card its `not 书` block pointed at. All three of its sentences say notebook,
  vocabulary book, exercise book. Said properly, the collision goes and the block with it. **That is a
  new shape and worth watching for**: a `not X` hint on a card whose gloss is simply wrong is a
  symptom, not a fix.
- **A run-on with a sense tacked on by "or".** 词's "word, speech, statement, or a type of classical
  Chinese", and 床's "bed; couch; framework" — the third of those being CC-CEDICT's "frame; chassis",
  the 床 of 车床, a lathe.
- **A verb without its "to ".** 帮忙's "lend a hand". Sixth card caught by that rule.
- **A sentence translated out of English word by word.** 打开's 打开你的思想。"Open your mind" — Chinese
  does not 打开 a mind — and 床's 不要走在花床上。, 花床 not being the Chinese for a flower bed (花坛 is).
- **A sentence that is not grammatical.** 白色's 我狗是白色的。 — a possessive needs 的; 我狗 is not
  Chinese.

Also 爱好's 他们都是电影爱好者。, where 爱好者 is a word of its own so the headword does not stand alone.

### A whitespace fault, measured — and a named list for a later batch

别's third example carried **a space between the last character and the full stop**: 酒后别开车 。 The
corpus-wide punctuation pass cannot touch this — it converts ASCII marks to their full-width forms and
never moves whitespace — so it was re-added correctly here.

**Swept for as a class, there are 17 distinct sentences like it, on 20 cards across 9 decks**
— ⚠ **that figure is WRONG and is corrected in the batch 15 entry at the foot of this file: the real
count is 32 blocks, 24 distinct sentences.** The sweep below used a character class of FULL-WIDTH
punctuation only, and so missed every sentence whose mark after the space is still ASCII — which is
precisely the set the punctuation pass could not convert, its own rule requiring the mark to follow a
Han character immediately. The table that follows is therefore a SUBSET:

| deck | card | sentence |
|---|---|---|
| `hsk30phr` / `hsk30l2` | 没什么 / 路上 | 路上没什么车 。 |
| `hsk30l3` | 丢 | 我丢了手表 。 |
| `hsk30l3` / **`hsk30l2`** | 酒 / **别** | 酒后别开车 。 ← **fixed on 别 only; 酒 still carries it** |
| `hsk30l3` | 可爱 | 他们可爱吗 ？ |
| `hsk30l3` | 难 | 学习 汉语 难 不 难？ |
| `hsk30l4` | 窗户 | 窗户 打开 了。 |
| `hsk30l4` | 来不及 | …就来不及了 。 |
| `hsk30l4` | 友好 | 你和他都很友好 。 |
| `hsk30l5` / `hsk30l6` | 专家 / 滑雪 | 据说她是个滑雪专家 。 |
| `hsk30l6` / `hsk30l7` / `hsk30idm` | 宏大 / 名利 / 宽宏大量 | 宽宏大量是个宝；…结缘好 放下名利… |
| `hsk30l7` | 托 | …哥伦布离婚了 ？ |
| `hsk30l7` / `hsk30l7` | 栽 / 增添 | …节日的气氛 ，那里的人… |
| `hsk30l7` | 裸体 | 国王是裸体的 ！ |
| `hsk30l7` | 孝顺 | 一、孝顺 二、行善。 |
| `hsk30l7` | 欣慰 | …路加和约翰 所说的话。 |

**It is NOT safe to sweep mechanically, and that is why it is a batch rather than a pass.** Fourteen of
the seventeen are a stray space that can simply go. **Three are a space standing in for punctuation** —
the 宽宏大量 idiom's 结缘好 · 放下名利, 孝顺's 一、孝顺 · 二、行善 — and deleting the space there runs two
clauses together, which is worse than leaving it. What those want is a mark, and which mark is a
judgement, exactly as the 150 sentences with no terminal punctuation are. The sweep is one regular
expression over the rendered example text; it is in this batch's commit and takes a few seconds.

### On the compound lists

**Fourteen of the fifteen single-character cards in this range got one**, and the field had to be added
to Level 2's card type first — the same anchor, markup and scoped CSS as Level 1's, read out of the
record's own Level 1 entry so a change to one reaches the other.

**啊 gets none**: the nine decks hold one word built on it (天啊) and CC-CEDICT little more, which is
below the three-row floor. Fourth character in that position, after 谁, 它 and 她.

**长's rows are split between its two readings on purpose** — 长期 on cháng against 校长, 成长 and 队长
on zhǎng — so the list does the job the card's own examples cannot: show which words take which reading.
That is the same argument 只's 船只 row made last batch, and it is the strongest case for this section
existing on a polyphone at all.

**出's panel is the fullest of the fourteen** (出来, 出去, 出门, 出国 are all in the reader's own Level 2
deck), so all four rows go elsewhere. **钱包 is on 包's list because it is in the card's own first
sentence**, 钱包在包里, where a reader meets it with no gloss at all.

**别人 takes the deck's reading, bié rén, over CC-CEDICT's neutral bié ren** — eighth batch running.

### Read and left alone

啊, 帮, 包, 比, 笔, 车站, 出, 出国, 出来, 出门, 出去, 从, 从小, 次, 打车 and 但 are right as they stand.

**不好意思's second example is the same sentence as 笔's second** (不好意思，请问你有笔吗？) — the fourth
one-sentence-two-cards find, and the first where **both cards use it correctly**: each headword stands
on its own in it and each gloss is what the sentence shows. Recorded rather than changed; a repeat a
reader meets twice is a smaller cost than replacing a sentence that is right for both.

### 2026-09-17 — Level 2, notes 31–60

**What the batch was.** The thirty cards 但是 → 机场, read one at a time against CC-CEDICT and against
their own three sentences. **Twenty were changed**, ten left alone.

### The narrowest gloss found so far

**过's guò sense was "to celebrate (a birthday)" and nothing else.** CC-CEDICT gives six — "to cross /
to go over / to pass (time) / to celebrate (a holiday) / to live; to get along / excessively" — and the
card had the fourth, on a character a beginner meets a dozen times a day. **Its own second sentence said
so**: 他能过考试的 is passing an EXAM, which the gloss could not reach.

### A trap in the record's own machinery, found by reading the finished deck

**`exSense` is POSITIONAL, and `dropEx` plus `ex` REORDERS the blocks.** The applier keeps what survives
the drop and APPENDS what the record adds, so a replaced sentence moves to the END of the card. Sense
tags written against the order the card had *before* the batch therefore point at the wrong senses —
and they render perfectly while doing it, a small numeral beside a sentence, with nothing anywhere to
say it is wrong.

It happened twice in this batch, on 得 and 画, and both were caught only by dumping the finished cards
and reading the tags back against the sentences:

- **得** was tagged `[3, 2, 1]` and wanted `[3, 1, 2]` — 你听得见吗 is the neutral-tone particle, not dé,
  and the newly authored 她得了第一名 is dé, not the particle.
- **画** was tagged `[1, 1, 2]` and wanted `[1, 2, 1]` — 那幅画有多少年了 is the noun and the newly
  authored 我画了一只猫 is the verb.

**So: write `exSense` against the order the card will have AFTER the drops and adds, and read the tags
back off the finished deck.** The applier's own guard only catches a tag pointing PAST the end of the
sense list (`badSense`); a tag pointing at the wrong sense *inside* the list is invisible to it. A sweep
for the guard's own case is in this batch's checks and reads **0 of 164 tags**.

### The glosses

- **过去** was the verb alone, and its second sentence is the noun — "the last couple of days".
- **花 had two faults in one gloss**: it led with the VERB, written "spend" with no "to ", and then
  packed "flower; blossom; patterned; colorful" — a noun and an adjective — into one sense under
  "noun / adjective". CC-CEDICT leads with the flower, which is also what the character *is*.
- **坏** was the single word "bad", and its first sentence, 电视机坏了, is not an adjective: the
  television has BROKEN.
- **等's second sense was labelled a preposition**, which "and so on" is not — it closes an enumeration,
  and CC-CEDICT says exactly that. Relabelled `suffix`; the meanings are unchanged.
- **公交车 was "public transport vehicle"**, CC-CEDICT's first rendering and a thing nobody says. All
  three of the card's sentences translate it BUS, which is the dictionary's second. A reader asked in
  English for a public transport vehicle cannot be expected to produce 公交车.

### The sentences

- **A doubled verb.** 得's 谁这么说说得不对。 — 说说得 has the verb twice and the sentence is not
  grammatical in any reading.
- **A semicolon where Chinese takes a comma.** 地铁's 请问；地铁在哪儿？ The punctuation pass converted
  the ASCII mark to its full-width form and could not know the mark itself was wrong — the same line
  that pass draws round the sentences with no terminal stop.
- **The wrong orthography.** 画's 我不知道你的计画。 — **计画 is the TAIWAN spelling of 计划**, in a
  simplified-character deck that has 计划 as a card of its own. First of its kind found.
- **The headword inside another word**, three times: 飞's 飞机场在那边 (and the deck has 机场 as a card
  twenty-one notes later), 动's 动词变位很有趣的 — which also has 变位 well above Level 2 and an
  ungrammatical 的 — and 懂's 她很懂汉字, where 懂 takes something one can *understand* rather than
  something one can read.
- **Folk stereotyping with ungrammatical English.** 个子's 个子矮的人心眼多。"Shorter people got more
  tricks up their sleeves."
- **A construction nobody uses.** 跟's 我不跟你要好了, and 坏's 坏的人，是我 — a cleft Chinese does not
  build that way, with an English two centuries old.
- **English that drops the word the card teaches.** 红茶's "How about a cup of tea?" — 红茶 is BLACK
  tea, which is the whole point of the card (the Chinese names it by the colour of the liquor, the
  English by the colour of the leaf). And 回去's "I don't wanna go back", another of the thirteen.

### On the compound lists

**Twelve cards got one, and three of the lists exist to show a reading the card's own examples cannot.**

- **得 is the deck's worst polyphone — three readings on one character, none of them predictable from
  it** — and the rows split between two: 觉得, 记得 and 懂得 on the neutral *de* against 得到 and 值得
  on *dé*.
- **Every row on 地 is the dì reading, on purpose**: all three of the card's sentences are the
  neutral-tone particle, so the list is the only place a reader meets the other half of the card.
- **高跟鞋 leads 跟's list** and is the only row of the three on that card's THIRD sense, the heel, which
  the gloss names and no example shows.

**过's panel already holds 过来, 过年 and 过去**, so all five rows go elsewhere — and every one of them
is a verb ENDING in 过 rather than beginning with it, which is the shape the panel's three do not show.

**Three rows take the deck's reading over CC-CEDICT's** — 值得 zhí dé, 不过 bú guò, 坏处 huài chù. Ninth
batch running.

### Read and left alone

但是, 地, 饭馆, 高, 高中, 告诉, 过来, 过年, 还是, 黑色, 红色, 后面, 回来 and 机场 are right as they
stand. The two `check-example-fit.js` findings in this deck (一会儿 inside 等一会, 准备 inside 不准) are
the greedy segmenter losing to a longer word and are not faults.

### 2026-09-17 — Level 2, notes 61–90

**What the batch was.** The thirty cards 机票 → 路上, read one at a time against CC-CEDICT and against
their own three sentences. **Nineteen were changed**, eleven left alone. One card outside the range,
`hsk30l7` 出台, was reglossed — see below.

### Two glosses that are simply the wrong word

**开学 was glossed "foundation of a University or College".** That is CC-CEDICT's fourth sense and the
dictionary marks it **(old)**: 開學 once meant founding a school and has not meant that in living
memory. What it means is that TERM HAS STARTED — which is what all three of the card's own sentences
say (大学四月开学, 他们已经开学了). A Level 2 reader was being taught an archaism for one of the
commonest words in a student's year.

**酒店 was glossed "wine shop"**, the finding recorded in batch 5 and reached here in deck order. All
three of its sentences are a HOTEL. It now says "a hotel; a restaurant" — both, because 酒店 really does
cover the restaurant, and because that is also what keeps it distinct from 旅馆, glossed plainly "hotel"
two levels up.

### Two one-character errors, each of which renders perfectly

- **近's 公交车站里我们很近。** — **里 where the sentence needs 离**. They are a tone apart and mean
  opposite kinds of thing: 里 is INSIDE, 离 is the distance FROM, so the Chinese read "inside the bus
  stop we are very close". 离 is a card in this same deck twenty-two notes later.
- **间's 不知道是那间？** — **那 where it needs 哪**, the one-stroke pair that separates "that" from
  "which"; the card's own English ("Don't you know what that is?") matched neither reading.

**Nothing in the pipeline can see either.** Both sentences segment perfectly, both are real characters,
and both read as ordinary Chinese until you parse them.

### The punctuation pass's two standing exclusions, both met in one batch

- **裤子's 这些裤子多少钱。** is a QUESTION ENDING IN A FULL STOP. The pass converts marks and never
  replaces one with a different mark, since which mark a sentence wants is a judgement. (One more is on
  record: `hsk30l4`'s 你想打排球吗。)
- **路上's 路上没什么车 。** carried the stray space — **the first of the seventeen named as their own
  batch last time to be reached in deck order.** Nineteen blocks are left; the list is in the previous
  entry.

### The 本子 lesson again, one deck apart

**介绍 was glossed "introduce"** — no "to ", the register rule — **and carried a `not 出台` block**. That
is exactly the shape 本子 showed two batches ago, except that this time the wrong gloss is on the OTHER
card: **出台 was glossed "Introduce"**, capitalised (the auto-glossing artefact) and wrong. CC-CEDICT
gives "to officially launch (a policy, program etc)", and all three of 出台's own sentences are a policy
or a set of rules being issued — 新政策上个月出台了, 细则还没有出台.

So both were fixed, sixty levels apart, and **the collision goes at the root**: neither card needs a
block. **A `not X` hint on a pair where one gloss is simply wrong is a symptom, not a fix** — that is
now twice, and it is worth checking the partner's gloss whenever a hint looks odd.

**The two `hints` rows went with the blocks.** Leaving them would have the record claim a block on every
run that the same run wipes, since a `gloss` replaces the whole English field after the hint is written
— and `--check` cannot see that, the wiped block never having been carried.

### The other glosses

**开始 and 考试 have the same shape**: one gloss under a part of speech reading **noun / verb**, so one
of the two categories the card claims had no English at all. 开始 was "to begin" with no noun; 考试 was
"examination" with no verb.

**考 was a run-on leading with the wrong direction** — "to examine, test, or investigate". For a student
考 is what YOU do, which is what both of its usable sentences show. Split, with the reader's own side
first.

### The sentences

Beside the four above: 教's 他们不教他们说英语 has the same pronoun as subject and object; 可能's
他们可能有点什么 is not a phrase Chinese builds; 考's 我们今天早上有历史小考 puts the headword inside 小考;
开学's 那是新学校什么时候开学 cannot take 那是 in front of it; 路上's 你死路上了？is not a sentence a
Level 2 card should carry. Two Englishes were rewritten with the Chinese untouched — 机票's eleven words
for four characters, and 经常's "all the time", which is 一直 and has a card of its own — and 裤子's two
American "pants" were put into the British the decks are authored in.

### On the compound lists

**Eleven cards got one, and two of them carry a reading the card cannot show.**

- **教's rows are ALL the jiào reading** — 教育, 教师, 教授, 宗教 — because all three of the card's
  sentences are jiāo, to teach. After this batch's replacement the jiào sense still has no example of its
  own, and the list is where a reader meets it.
- **累's rows split between its two** — 劳累 on lèi against 积累 and 累计 on lěi — and again all three
  sentences are the first, so the list is the only place the second appears.

**楼上 and 楼下 are in none of the nine decks**, and they are the two words a reader needs first for that
character; what the corpus offers instead is 阁楼 and 酒楼, a loft and a tavern.

### Read and left alone

记得, 教室, 进, 进来, 进去, 就, 咖啡, 快, 快乐, 快要, 篮球, 累, 离, 里面, 楼 and 路 are right as they
stand. 离's second example is the same sentence as 近's second (电影院离电车站近吗？) — the fifth
one-sentence-two-cards find, and the second where **both cards use it correctly**, so it is recorded
rather than changed.

### 2026-09-17 — Level 2, notes 91–120

**What the batch was.** The thirty cards 旅游 → 肉, read one at a time against CC-CEDICT and against
their own three sentences. **Nineteen were changed**, eleven left alone.

### The one to read first

**面's card glossed the face, the side and the classifier — and two of its three sentences are
NOODLES.** 你喜欢吃牛肉面吗 and 我们的拌面里有好多东西. That is not a stretched sense but a different
word: the simplified 面 merges 面 (face) and **麵** (flour, noodles), which CC-CEDICT keeps as separate
entries under the one form. A learner meeting 牛肉面 on this card had nothing whatever to attach it to.
Added as a third sense, and each example tagged.

### A wrong character inside the word the card is about

**名's 我喜欢我的名子。 has 名子 where the word is 名字** — a homophone of the second character, and the
deck carries 名字 as a Level 1 card, so a beginner was shown the wrong spelling of a word they had
already learnt.

### …and the replacement I wrote for it was wrong in the way this pass keeps finding

The first authored sentence for that slot was **请问你的名字怎么写？** — which puts 名 inside 名字, the
very fault being repaired two lines above it. Thrown away, and the card rethought. What came out of that
is worth keeping: **名 as a FREE word in modern Chinese is essentially only the classifier**, for people
(三十名学生) and for places in a ranking (第三名); the "name" sense is what it means *inside* 名字, 姓名
and 有名. So the gloss now marks that sense **(bound form)** — as 晚, 早, 月 and 一 were — both authored
sentences use the classifier, and the compound list is where the bound sense lives.

**Check an authored replacement for the fault you are replacing.** It is the second time this pass has
had to: 大学生's sentence in batch 2 introduced an example-fit finding the same way.

### One sentence, two cards, and wrong on both

**我上午慢跑。was the first example on 慢 AND on 跑**, and on both of them the headword sits inside 慢跑,
a word of its own. Sixth one-sentence-two-cards find of the pass, and **the first where the sentence was
wrong for both cards** — the four before it were either right for both or wrong for one.

### The glosses

- **旅游's gloss was the single word "tourism"** — a noun — under a **verb** part of speech, so neither
  half of the card was right; all three of its sentences are the verb.
- **跑步 was "running; jogging" under a verb**, two gerunds where a verb was claimed. Seventh card caught
  by the register rule.
- **起来 was "stand up; sit up; rise to one's feet"** — three renderings of one meaning, no "to " on any
  — and its FIRST sentence, 听起来不错, is not that meaning: 起来 after a perception verb is the
  particle, which CC-CEDICT files separately.
- **那么 was "like that" under "pronoun / conjunction"**, and the conjunction's meaning was absent: its
  second sentence is "SO, where shall we begin".

### The sentences

**球's 他是个网球球手。 doubles the 球 of 网球** — a tennis player is 网球运动员 or 网球选手, and 球手
alone is used of golf; the headword ends up inside two words at once. **肉's 他不喜欢鱼肉** puts it
inside 鱼肉 and the English drops the meat entirely. **奶奶's 我奶奶也告诉了我这样** is not a construction
Chinese has. **奶茶** lost two of three: one rendered "I've never drank milk with tea" (wrong participle,
and 奶茶 is one drink), the other a note-to-self built on 使命 and 麻糬, a Taiwanese transcription the
mainland writes 麻薯. **没意思's** third was a joke about becoming a god and then a devil.

**旁边's** third example was twenty-two characters of a different joke AND carried a space before its
exclamation mark — which leads to the correction below.

### ⚠ A measurement I recorded in batch 12 was wrong, and here is the right one

That entry says the stray-space fault is **17 distinct sentences on 20 cards**. It is not. The sweep
behind it used a character class of **full-width punctuation only**, so it missed every sentence whose
mark after the space is still **ASCII** — and that is precisely the set the punctuation pass could not
convert, since its own rule requires the mark to follow a Han character *immediately*. A space in
between leaves the ASCII mark standing, and the sweep then could not see it either. Two blind spots
that happen to line up.

**The real figure is 32 blocks, 24 distinct sentences, across 9 decks.** The fifteen the first sweep
missed are all of the shape 吗 ? — a question mark left in ASCII behind a space — on `hsk30l4` 重, 距离,
热闹, 之间, `hsk30l5` 大象, 火锅, 品尝, 或是, `hsk30l6` 滑雪, `hsk30l7` 饶, 坠, 贩卖, 魔鬼, and (before
this batch fixed it) `hsk30l2` 旁边.

**The lesson is the one this file keeps recording about its own measurements**: a figure produced by a
regular expression is only as wide as the expression, and the way to find out is to ask the question a
second way. The corrected sweep is in this batch's checks.

### On the compound lists

**Thirteen cards got one.**

- **面's panel is the fullest in the deck** — 后面, 里面, 前面, 上面, 外面, 下面, every one of them
  positional — so the rows go where it cannot, and two of them (面包, 面条) are the FLOUR sense this
  batch has just added to the gloss, which no positional compound could ever show.
- **每 has NOT ONE word built on it in any of the nine decks**, which is the emptiest panel found so far.
  All four rows are the dictionary's, and they are the four a Level 2 reader uses every day.
- **每个 takes CC-CEDICT's neutral měi ge**, there being no deck card to defer to — and it agrees with
  the deck's own habit, which writes 这个 zhè ge.

### Read and left alone

绿茶, 绿色, 每, 门, 门口, 门票, 拿, 那样, 男孩儿 (beyond its second English), 女孩儿, 票, 妻子, 前面,
晴, 让 and 鸟 are right as they stand. 票's third example is the same sentence as 门票's second, and
拿's first the same as 过来's second — both the fifth and seventh one-sentence-two-cards finds, and both
correct for both cards, so both are recorded rather than changed.

### 2026-09-17 — Level 2, notes 121–150

**What the batch was.** The thirty cards 商场 → 位, read one at a time against CC-CEDICT and against
their own three sentences. **Twenty-one were changed**, nine left alone.

### The one to read first

**外面's gloss read "outside (also pr. [wài mian] for this sense)".** That is **CC-CEDICT's own editorial
note**, brackets, abbreviation and all, sitting on the front of an English → Chinese card — so a reader
is asked to produce 外面 from a sentence about how 外面 is pronounced. The dictionary's actual senses are
"outside / surface / exterior". A new shape of fault, and worth grepping for: anything in a gloss
reading *also pr.*, *variant of*, *abbr. for*, *see also* or *CL:* is the dictionary talking to
lexicographers, not to a learner.

### A gloss written against the wrong part of speech

**位 was glossed "position" under a `measure word` part of speech** — the noun sense written against the
classifier's label, so neither half described the other — while all three of its sentences are the
polite classifier (她是位歌手, 哪一位啊). Split.

Its second example was also **the very sentence dropped from 有的 six batches ago** (有的，先生你有几位？),
which was 有的 used as an affirmative reply followed by an unrelated restaurant greeting. It is no better
here; replaced. That is the eighth one-sentence-two-cards find, and the second where the sentence was
already known to be bad.

### The headword inside another word, five times

- **题 had it in ALL THREE.** 跑题 is a word (to wander off the point), 小题大作 is a four-character
  idiom, and 是非题 is a word too — so a Level 2 reader met 题 three times and never once on its own.
- **上来's 从某种意义上来说** has the characters but not the word: the parse is 意义上 plus 来说.
- **头's 这些是找头** — 找头 is the change from a purchase.
- **手's 我在她手下工作** — 手下 is "under the command of".
- **万's 我希望万事如意** — a New Year greeting in which 万 means "all", not ten thousand.

### Not grammatical

- **虽然's 虽然我没在火车上睡觉。 is a subordinate clause with no main clause**, which is not a sentence
  in either language; 虽然 is correlative and wants 但是, 可是 or 还是 after it. The card's own English
  carried the fragment across.
- **忘's 不要再忘做那个** — 忘做 is not a construction Chinese builds (it wants 别忘了做), and the English
  said the opposite of what the Chinese was reaching for.
- **上面's 天花板上面有只苍蝇** was rendered "There is a fly on the ceiling", but 天花板上面 is ABOVE the
  ceiling; on it is 天花板上. The Chinese and the English describe different places.

### Two authored replacements thrown away — both caught by reading the finished card

**This is the second batch running in which my own replacement was the thing that had to be fixed**, and
the two failures are different enough to be worth naming:

1. **头's first replacement, 他的头很疼, said the same thing as the line above it** (谁的头在疼). The card
   names three senses — the head, "first", and a classifier for livestock — and had examples of only two,
   so the sentence became 他家养了三头牛 and all three are now tagged.
2. **上网's first replacement, 我每天上网查资料, tripped `check-example-fit.js`** — and that is a finding
   about the checker rather than about the sentence. It is ordinary Chinese, but **每天 is in none of the
   nine decks**, so the segmenter cannot see it: it takes 每 alone, then finds 天上, which IS a deck word,
   and the headword is reported split between 天上 and 网. **An authored sentence can be flagged purely
   because a common word is missing from the corpus's own lexicon.** Rewritten round it.

**So: run the checkers after AUTHORING, not only after dropping.** Both of these were introduced by the
repair.

### The other glosses

- **疼 was the single noun "pain"** under a part of speech reading `verb / adjective` — the card named two
  categories and gave a third.
- **送 was "to give (present); deliver; see someone off"**, the "to " on the first element only, so two of
  three read as nouns. Eighth card caught by the register rule.
- **时 gave the noun and the o'clock classifier**, and its third sentence is neither: 看书时不能吃东西 is
  时 meaning WHEN or WHILE, which a reader meets constantly in written Chinese.

### Four Englishes rewritten with the Chinese untouched

商场's called it a SUPERMARKET (that is 超市, with a card of its own); 手表's was plural where the Chinese
is singular; 舒服's "Where do you feel uncomfortable?" is not what a doctor asks in English, where
哪儿不舒服 is the standard question and "Where does it hurt?" its standard rendering; and **踢 called it
soccer twice and football once, contradicting itself** — the decks are authored British, so both became
football, as 条's "pants" became trousers.

### On the compound lists

**Twelve cards got one; 踢 gets none.** That character builds almost nothing CC-CEDICT records — 踢腿,
踢踏舞, 踢皮球 and the idiom 拳打脚踢 — and what a learner actually does with it (踢球, 踢足球) is a
phrase rather than a word, which the section's rule does not admit. Fifth character in that position,
after 谁, 它, 她 and 啊.

**Three of 头's four rows put it in the NEUTRAL tone** (头发 tóu fa, 石头 shí tou, 木头), which is what
the character does as a noun suffix and which the card's own reading, a full second tone, cannot show.
**面条 is on 条's list deliberately**: 面 was given its noodle sense two batches ago and this is the word
that carries it.

### Read and left alone

上去, 身体, 生日, 事情, 书包, 所以, 跳舞, 外国, 完, 网上 and 往 are right as they stand.

### 2026-09-17 — Level 2, notes 151–180

**What the batch was.** The thirty cards 为什么 → 鱼, read one at a time against CC-CEDICT and against
their own three sentences. **Sixteen were changed**, fourteen left alone.

### ⚠ The worst single thing this pass has found

**阴's third example was 你的阴茎很大。 — "Your penis is big."**

阴茎 is a word of its own, so the card's headword does not even stand alone in it; and the sentence has
no business on a Level 2 vocabulary card glossed "cloudy" under any circumstances whatever. It was
sitting on card 172 of a deck a beginner works through in their second month, and it has been shipped to
every reader who downloaded that deck.

**Nothing in the pipeline could see it.** It is grammatical, its translation is accurate, it segments
cleanly, and `check-example-fit.js` does not flag it because 阴茎 is not in the decks' own lexicon — the
same blind spot that hid 出外 and 外债 five batches ago. **Only reading the card finds this**, which is
the argument for the whole audit in one line.

Its first example, 天气依然阴雨, is the same structural fault without the offence — 阴雨 is a word (wet
and overcast weather). Both replaced.

**Worth doing before the next batch**, and recorded here rather than done, because it is a sweep of its
own: the sentences in these decks come from a public corpus, and one of them got through. A pass over
all 34,596 example blocks for anatomical and sexual vocabulary would say whether 阴茎 is alone.

### Two glosses, one shape

**姓 was "surname" under a part of speech reading `noun / verb`** — the verb's meaning missing entirely,
while its own second sentence is that verb (我跟我妈妈姓, "I take my mother's surname"). That is the
third card with this exact shape: 开始 and 考试 were the first two, all in Level 2.

**希望 was "hope; wish" under a `verb`** — two bare stems, so the card claimed a verb and gave what reads
as two nouns, and its third sentence is genuinely the noun.

### The parenthetical author's note, for the sixth time

**一起's gloss was "together, in company (everyday word)"** — after 非常, 早上, 午饭, 一下 and 有的. The
class is now well enough attested to be worth a sweep of its own: a gloss ending in a bracketed remark
about the card rather than about the word.

### Not grammatical

- **因为's 因为是那儿。"Because it is there"** is not a sentence: 因为 opens a clause and 是那儿 is not
  one, with no subject and no main clause after it.
- **下面's 那些钱藏了在地板下面。** — **藏了在** cannot stand: the aspect marker will not go between the
  verb and its locative (it wants 藏在, and a passive besides for the English given).
- **游泳's second example** was a two-line dialogue whose second half has **no terminal punctuation at
  all** — “没错” closes the quotation and stops. One of the 150 the punctuation pass deliberately leaves,
  since whether a fragment wants a stop is a judgement. Replaced rather than punctuated, the dialogue
  being poor teaching material either way.

### The headword inside another word

游's 我不玩网游 (an online game, on a card glossed "to swim"), and 右's 他伸长了他的右手 — which also
repeats 他 as both subject and possessor where Chinese drops the second.

### Two more of my own replacements rewritten on reading the finished card

**This is the third batch running**, and both were the same fault in different clothes:

1. **右边's second replacement carried the SAME English as the sentence that survived**, word for word —
   "Take the road on the right" twice on one card, which is what `check-senses.js` exists to catch.
   Rewritten as an existential frame.
2. **右's replacement used the same 往右 frame as the sentence above it.** Rewritten with 向, so the
   card's three sentences now show 右转, 往右 and 向右 — the three ways a beginner meets it.

**Reading the finished card is now the step that finds most of what a batch gets wrong.** The checkers
catch none of these: a duplicate English passes `--check`, and two sentences in the same frame are not
a finding anywhere.

### On the compound lists

**Seven cards got one.**

- **阴 is the clearest case for the section yet**: every word the nine decks hold for that character is
  Level 7 — 阴影, 阴暗, 阴历, 阴谋, 阴性 — so even a panel that could search the whole corpus would show
  a Level 2 reader nothing usable. 阴天 leads and is in no deck at all.
- **右手 is on 右's list because it is the word this batch took OUT of that card's examples**, where it
  was swallowing the headword. The section is where such a word belongs.
- **游戏 leads 游's** for the same reason from the other side: the sentence removed from that card was
  about 网游, and 游戏 is the word a reader actually needs for it — which is not the card's own meaning.

### Read and left alone

为什么, 洗, 洗手间, 下来, 下去, 小时候, 姓名, 眼睛, 药, 药店, 爷爷, 一会儿, 已经, 意思, 有意思, 有时
and 鱼 are right as they stand. 颜色's second English wrote "favorite color" and was put into British —
"color" is in `SPELL_PAIRS` and would have been converted for an American reader anyway; "favorite" is
the half that was stuck.

### 2026-09-17 — Level 2, notes 181–197, and a new `exStop` field

**What the batch was.** The last seventeen cards of HSK 2, 远 → 左边, read one at a time against
CC-CEDICT and against their own three sentences. **Sixteen of the seventeen in range were changed**,
and one card outside it — 右边, changed so that it and 左边 do not disagree about what kind of word they
are. **Level 2 is complete.**

### The one to read first

**站 was glossed "station; stop" under a NOUN part of speech, and two of its three sentences are the
verb.** 站在那儿的女人是谁？ and 你能站起来吗？ are *to stand*; only 还有两站 is a stop. CC-CEDICT gives
"station / to stand / to halt / to stop", so the missing sense is the dictionary's second and the
commonest verb in the entry. A reader working the reverse card is shown "a station; a stop" and has to
produce 站 — which is fine — but a reader working the forward card meets two sentences the gloss cannot
explain. Split, and the three sentences tagged.

Three more cards had the same shape in weaker form: **运动** gave the single noun "sport" under
**noun / verb**, with 我每天运动一小时 plainly the verb; **准备** gave "to prepare" where two of three
sentences are *to intend* and *to be about to*; **走** gave "go; walk" where two of three are *to
leave*. (走 was also a verb glossed without its "to ", the shape cut from 笑 and 跑步 in earlier
batches.)

### The new field, and why a good sentence was not thrown away

**远's first example ended with no terminal punctuation at all** — 地铁站有点儿远, and then nothing. It
is one of the ~150 sentences the corpus-wide punctuation pass deliberately left: that pass CONVERTS
marks and never ADDS one, whether a fragment wants a stop being a judgement.

The repair looks trivial and was not available. `dropEx` plus a re-add of the same Chinese **fails
silently** — the drop filters the record's own `ex` rows as well as the deck's blocks, so a sentence
re-added with its stop is thrown away and the card comes back an example short, which is how 手机 went
from three sentences to one in batch 8. And the sentence is GOOD: replacing it to work around a gap in
the applier would put a worse sentence on the card to fix a full stop.

So the applier gained **`exStop`**, `[[chinese, mark?]]`, the third field of its kind after `exEn`:

- It appends a terminal mark and **nothing else**, writing `data-say` and the visible text **together**,
  so the spoken and the seen cannot come apart.
- It matches `data-say` **exactly**, so it can never catch a longer sentence containing this one.
- It is **idempotent by matching either form**: a block whose `data-say` is already the sentence plus
  the mark is the repair applied and is a no-op.
- It **FAILS** on a row matching neither form, and on a row naming a sentence that already ends in a
  mark. Both were liveness-tested by planting them and watching the run exit 1.

**It is deliberately not a general Chinese rewrite, and cannot become one.** A generator block carries
a STRUCTURE LINE glossing every word's part of speech, and bolds the headword inside its visible text.
Neither can be re-derived for different words. Appending a mark at the end is the one edit that leaves
both true; anything else is `dropEx` + `ex`, which rebuilds the block and correctly drops the structure
line with it.

A terminal-punctuation scan of the whole of Level 2 finds exactly one other class — **four quoted
dialogues closing on ”** (本子, 咖啡, 位, 因为) — which are correct as they stand.

### The distinction that decides a swallowed headword, written down

**左 lost two of its three sentences** to the fault 右 lost one to in the batch before: 她用左手写字 and
我是左撇子 both put the headword inside a word of its own. `check-example-fit.js` can see neither,
because it **skips single-character headwords** — one character cannot straddle a boundary — so this
whole class has to be read for.

**周's three sentences look identical in shape and are not the fault.** 学校下周开学, 雨下了一周,
一周有几天 all put 周 next to another character. The test is **whether the headword is doing its own
work**, not whether its characters sit beside others: 周 IS the measure word for weeks, so 一周 is a
numeral plus its measure and 下周 is "next" plus it — where 左手 is a lexicalised noun inside which 左 is
a bound morpheme with no work of its own. Read and left.

### English that is not the sentence, and one card that said two things

**足球's gloss was "soccer ball"** — CC-CEDICT's *second* sense, where the first is "soccer; football" —
and not one of its three sentences is about a ball. Its English also said **football once and soccer
twice, for the same word on the same card**. The decks are authored British, because the site's
spelling switch only ever converts British to American and never back, so both readers see whatever is
written here; and neither reader is served by one card calling the game two things.

**最's two English lines were both NOUN renderings of adverb sentences.** "Who's your favorite?" and
"Coffee is my favorite drink" are idiomatic English and they hide the grammar the card exists to teach —
最 standing in front of a verb, which is what its own gloss says it is. Rewritten faithfully as "Who do
you like best?" and "I like drinking coffee best." (They were the American spelling too, but that is the
smaller half: fixing the spelling alone would have left the construction hidden on both.)

### Sentences that are not sentences

Three, and each was ungrammatical rather than merely awkward:

- **这么's** 谁这么说说得不对。 — 说说得 is a doubled verb with a complement marker stranded after it, and
  its English, "Whoever said so, it is false", is not English either.
- **这样's** 我们不做这样。 — 这样 is adverbial here and cannot stand as the object of 做.
- **正's** 正有什么奇怪的事情发生着。 — 正 + 有 + 什么 + verb + 着 is not a frame Chinese uses.

Each replacement was chosen to give the card a sense it claimed and showed nowhere: 这么多书 for the
quantity sense, 这样的机会不多 for the attributive one the old gloss named, 把画挂正 for the adjective.

### Two more of my own replacements rewritten on reading the finished card

**The fourth batch running.** Neither is visible to any checker:

1. **走路's replacement, 他每天走路上班, is the same construction as the surviving 他走路回家** — 走路
   followed by where you are going. Replaced with a duration frame, 从这儿走路只要十分钟.
2. **左's two replacements were first drafted as 往左拐 and 向左看**, which are 右's own three frames with
   the character swapped. A left/right pair taught in identical frames teaches the frame rather than the
   pair, so 左 now shows 左转, 往左 and 靠左 against 右's 右转, 往右拐, 向右看.

### On the compound lists

**All eight single-character cards in the range got one** — 远, 站, 着, 正, 周, 走, 最, 左 — 32 rows,
every reading and gloss checked against CC-CEDICT before it was written.

- **着's list is chosen to cover all three readings the card names and no sentence can.** 接着 is *zhe*,
  着急 and 着火 are *zháo*, 穿着 is *zhuó*. That is the finding on that card rather than an omission:
  outside the particle this character is **bound**, so there is no sentence in which bare 着 is read
  either of the other two ways, and the card's three examples are correctly all *zhe* — now tagged, so it
  says so rather than letting a reader assume one sentence per reading.
- **远's whole deck-side list is Level 4 and above**, so the tap panel could show a Level 2 reader
  nothing usable even with the whole corpus to search.
- **左手 and 左撇子 are on 左's list** because they are the two words this batch took OUT of that card's
  examples — the same repair 右手 got on 右.

### Read and left alone

丈夫, 自己's sentences, 周's sentences, 最's Chinese and 左边's sentences are right as they stand. One
thing was read and deliberately not changed: **正's 现在是十时正** is written-register and
Taiwan-flavoured where a mainland learner would say 十点整, but it is not wrong, the deck carries
bopomofo throughout, and 正 is doing real work in it.

**The 一会儿 finding from `check-example-fit.js` is a false positive** and is the only one left in the
deck: 就等一会儿。 segments as 等一会 + 儿 because 等一会 is itself a deck word, and the sentence does
contain 一会儿.

### Standing invariants at the end of the batch

- example blocks: **34,596**; **spoken == visible on every one**
- Chinese leaking into an English line: the Level 2 set is **byte-identical to HEAD's**, so the batch
  introduced none
- sense tags pointing past the sense list: **0**
- stray spaces: **32 blocks, 24 distinct sentences** — unchanged, and still a batch of its own
- clobber sweep over the record diff: **0**; 6 existing notes changed, 11 added, which is the 17 cards

### 2026-09-17 — Level 3, notes 1–30, and a traditional-character sweep

**What the batch was.** The first thirty cards of HSK 3, 阿姨 → 表演, read one at a time against
CC-CEDICT and against their own three sentences. **Twenty-four of the thirty were changed**, plus one
card in Level 6 caught by a corpus-wide sweep. Level 3's card type also gained the **`Compounds`**
field, copied from Level 2's own definition in the record rather than retyped, so the three levels that
now carry it cannot drift.

### The one to read first

**爱人's gloss says *spouse (PRC)* and all three of its English lines say *lover*.** CC-CEDICT splits
the word exactly along that line — "spouse (PRC) / lover (non-PRC)" — and these are PRC decks, so the
gloss is right and every sentence was translated on the other reading. On the second it stops being a
register problem and becomes a different claim:

> 有人看到了她在饭馆跟她爱人在一起。 — "She was seen at a restaurant with her **lover**."

which in English says an affair, where the Chinese says she was out with her husband. All three
rewritten; the Chinese is untouched. **A reader working the forward card was being taught the wrong
word three times over while the gloss above it said the right one** — and no checker can see that,
because the gloss is right, the sentences are right, and only the pairing is wrong.

### The traditional character in a simplified field

北's third sentence was **日本位於北半球。** — 於 is the traditional form of 于, inside the Simplified
field of a Simplified deck. Nothing in the pipeline can see it: the sentence renders, reads and speaks
correctly, and a learner copying it out writes a character the PRC does not use.

The sweep it prompted is cheap and worth keeping. The decks' own `Simplified`/`Traditional` pairs
identify **1,200 traditional-only Han characters**; testing all 34,596 example sentences against that
set finds **exactly two**, both 於 — this one and 起源's 佛教起源於印度 in Level 6. Two sentences is the
whole of a corpus-wide finding rather than a batch of its own, so both are fixed here.

*(A first run of the sweep reported 58 and was wrong: it treated the SPACE as a traditional-only
character, because spaces occur in `Traditional` fields and not in `Simplified` ones, so it was
re-reporting the stray-space set. Restricting it to CJK gives the real answer.)*

### One gloss, two parts of speech, and the sentences split between them

The commonest shape in this range, and eight cards had it. In each the gloss named one part of speech
and the card's own sentences used the other:

- **安全** gave "safe; security" under an **adjective** — an adjective and a noun joined by a semicolon.
- **变化** gave the single word "change" under **noun / verb**, which says nothing at all, English being
  a language in which that word is both.
- **比较** gave "compare" under **verb / adverb / preposition** while two of three sentences are the
  adverb: 哪个比较贵 is *which is more expensive*, and that sense — the one a beginner uses daily — was
  not on the card.
- **表演** gave the noun "performance" under a **verb**; **帮助** gave "to help" while its third sentence
  is the noun.
- **遍** gave the measure word alone while 我们游遍全国各地 is the other sense, *all over*.
- **被** gave "quilt; by (somebody/something)" under a single **preposition** label — a noun and a
  grammatical particle wearing one part of speech.
- **半天** is the same fault without the label: its gloss was "half of the day" and **not one of its
  three sentences means half a day**; all three are *for ages*.

Each was split, and where the division falls between the sentences they were tagged with `exSense`.

**Two senses deliberately carry no example, and that is the finding rather than an omission.** 被's
quilt is 被子 in modern Chinese, so there is no ordinary sentence in which bare 被 is one — the same
shape as 着's two non-particle readings in the batch before. It leads the compound list instead.

### Sentences that are not grammatical, and one that should not be in a beginner deck

- **班级's** 我们学校里有三十班级。 has **no measure word**. A number cannot stand directly against a
  noun in Chinese, and a beginner deck printing a count without its classifier models the single
  commonest mistake its readers make.
- **遍's** 我不会让自己说二遍。 — **二 cannot precede a measure word, 两 must.** Same class.
- **比较's** 这把椅子比较小的。 — a bare 比较 + adjective takes no 的.
- **变成's** 变成了绿色。 is a fragment with no subject, and its English supplies an "It" the Chinese
  has not got.
- **比如's** 勇气是非常重要的。比如肌肉，经常使用才得以加强。 is an English aphorism translated
  backwards: 比如 introduces an EXAMPLE and cannot mean *like*, so 比如肌肉 reads "for example, muscle".
- **北方's** 北方的春天送来狂风扫路。 is four images stacked with no grammar joining them — which is why
  its English reads as poetry.
- **矮's** 个子矮的人心眼多。 — "Shorter people got more tricks up their sleeves." A folk slur about
  short people, on the card that teaches the word *short*, with ungrammatical English besides.

### English that is not the sentence

Five, and two of them contradicted something else on their own card:

- **表演's** "Her performance is really good" is a NOUN rendering of 她表演得真好, **the one sentence on
  that card this batch has just tagged as the verb**.
- **变成's** "I want to be you" is 我想当您; 变成 is to TURN INTO, which the card's own gloss says.
- **半天's** "I'm none the wiser for his explanation" is an English idiom standing in for two Chinese
  clauses, and it drops 半天, the headword.
- **办法's** "This type of problem should be able to be solved" is a passive knot that also loses 补救
  办法, *a remedy*.
- **比赛's** "We went to the races" is horse racing; 比赛 is a match of any kind.
- **变化's** "changes easily" is 变化很快, quickly. **比赛's** was joined by a comma besides.

### Glosses joined by a comma

**办**, **变** and **比赛** wrote their senses `a, b, c` where every other gloss in these decks uses
semicolons. On the reverse card, whose front is the gloss and nothing else, that reads as one long
phrase rather than a list. 办 was also missing the sense two of its three sentences show — *to hold, to
organise (an event)*, which is what 办过奥运会 and 办了音乐会 are.

### My own replacement rewritten on reading the finished card

**The fifth batch running**, and only one this time: 矮's replacement was first drafted 这张桌子太矮了,
which is the SAME 太…了 frame as the surviving 她太矮了. 有点儿 instead, so the card's three sentences
show a comparative, 太…了 and 有点儿.

### On the compound lists

**All nine single-character cards in the range got one** — 矮, 把, 搬, 办, 饱, 北, 被, 变, 遍 — 33 rows,
every reading and gloss checked against CC-CEDICT before it was written.

- **矮个子 was drafted and cut**: CC-CEDICT has no entry for it, and a row nobody can check is a row this
  record may not carry. 低矮 in its place.
- **把手's reading follows the DECK, not the dictionary.** CC-CEDICT reads it two ways — bǎ shǒu "to
  shake hands" and bǎ shou "handle" — and the decks' own Level 7 card writes the handle as bǎ shǒu. The
  standing rule is that where the deck has a card for the compound, the compound row takes the deck's
  reading.
- **被子 leads 被's** because it is the word that card's quilt sense actually lives in, and the reason
  that sense can carry no sentence.

### Read and left alone

安静, 搬家, 办公室, 报纸, 笔记本, 必须 and 笔记's sentences are right as they stand. Three things were
read and deliberately not changed: **北's 我的家坐北向南** ("My house looks to the south") loses 北 in
the English but is what the Chinese means; **必须's "You need to leave"** for 你必须离开 is a fair
colloquial *must*; and **阿姨's nanny sense** is real and common in the PRC but is a third thing the
card's sentences do not show, so the gloss stops at two.

**Eight of the nine `check-example-fit.js` findings in this deck are the same false positive** — a
negator or a modifier in front of the headword forming a word of its own (不安 + 全, 不同 + 意, 不满 +
意, 不容 + 易, 好奇 + 怪, 再见 + 面, 几年 + 级, 拍照 + 片, 写作 + 业). Only 安全's is in this range.

### Standing invariants at the end of the batch

- example blocks: **34,596**; **spoken == visible on every one**
- Chinese leaking into an English line: the Level 3 and Level 6 sets are **byte-identical to HEAD's**
- sense tags pointing past the sense list: **0**
- stray spaces: **32 blocks, 24 distinct sentences** — unchanged, still a batch of its own
- traditional-only Han characters in an example sentence: **0**, from 2
- clobber sweep over the record diff: **0**; 5 existing notes changed, 20 added, which is the 25 cards

### 2026-09-17 — Level 3, notes 31–60, and an American-spelling sweep

**What the batch was.** The next thirty cards of HSK 3, 别的 → 城市, read one at a time against
CC-CEDICT and against their own three sentences. **Twenty-nine of the thirty were changed** — the
highest proportion of any batch so far, and the reason is in the sweep below: a great many of these
cards are sound Chinese with English that was written by somebody else.

### The one to read first

**不见's second and third sentences do not contain the headword at all.** 我什么都看不见 and
你看不见吗 are 看 + 不 + 见 — the negative potential complement of *to see* — in which 不见 is not a
unit and is not this word. The card taught its own word once, in 好久不见.

`check-example-fit.js` cannot see this and should not be taught to. It reports a headword **split
between two words**; here the characters sit wholly INSIDE 看不见, which is the looser question its own
header says it deliberately does not ask, because asking it returns 514 sentences of Chinese working
normally. So this class is read for, exactly as 左手 was on 左 in Level 2.

Both replaced, and the card gained the sense it was missing altogether: CC-CEDICT gives "not to see /
not to meet / **to have disappeared / to be missing**", and only the first was on it. Split and tagged,
so 好久不见了 and 钥匙不见了 are visibly two different words' worth of meaning.

### An obscenity, and the sweep it makes overdue

**才's second sentence was rendered "I don't give a fuck about what you say!"** — on a Level 3
vocabulary card, and it is not what 我才不听你说的呢 says either, which is emphatic rather than
obscene. It is the second of its kind this pass has found, after 阴's in Level 2.

That is now two hits from two different decks found by reading rather than by any checker, which is
what makes the corpus-wide sweep named after batch 17 worth doing as a batch of its own rather than
waiting for it to turn up card by card.

### The American-spelling sweep, and why it is a batch of its own

The decks are authored British by house rule, because **the site's spelling switch never runs in the
direction that would rescue them**: `applySpelling` returns immediately under `en-GB`, the authored
system, and converts to American only for a reader who asks. So an American spelling inside deck
content is simply what BOTH readers see.

Sweeping all nine decks with `SPELL_PAIRS` **sliced out of `app.js` rather than copied** — the rule the
Spanish record's `exBritish` already follows — finds **491 occurrences over 118 distinct words**,
led by `color` (30), `favorite` (25), `behavior` (24), `organization` (24), `theater` (14), `defense`
(12), `center` (11).

**Two traps mean it must not be swept mechanically, which is why it is named here and not done here.**

1. **The one-way rows must be excluded**, and `app.js` already knows which: it builds its own American
   → British map with `if (!oneWay)`. Reversing them blindly turns every narrative *story* into a
   *storey* (106 hits), the noun *practice* into the verb *practise* (56), a *license* into a *licence*
   and a computer *program* into a television *programme*. A first run of this sweep reported 713
   because it did not honour the flag.
2. **A proper noun is not a spelling.** *Pearl Harbor*, *World Trade Center*, an Australian *Labor*
   Party and the *Indian Reorganization Act* are names. The corpus has 8 `harbor`, 11 `center` and 9
   `labor`; all the ones read so far are ordinary nouns, but a mechanical pass has no way to know that
   and the next deck may not be so lucky.

Only the two occurrences inside this batch's range were fixed by hand — 冰激凌's "flavored" and 城市's
"center". **城市's sentence is shared with 图书馆**, one card further into this deck and outside the
range; that copy is deliberately left, because fixing one instance of a shared sentence leaves the two
disagreeing, and the sweep will take both together.

### A latent fault in `app.js`, found by the same slice and deliberately not fixed here

Building the American → British map exposes five entries whose output **is not a word in any variety of
English**: `humorous → humourous`, `laborious → labourious`, `honorary → honourary`, `clamorous →
clamourous`, `odorous → odourous`. The `-our` rows list `ous` and `ary` in their suffix strings, where
real English drops the *u* before those endings.

**It is latent rather than shipped**, and the reason is worth recording. That map has exactly one
consumer: `spellTree` only ever runs with `us = spellSystem() === "en-US"`, so the rendering path never
touches it, and the only call with the other argument is `gradeCloze`'s

```js
const ans = spellText(String(answer || ""), spellSystem() === "en-US")
```

which under the default `en-GB` maps American answer terms to British before comparing. Sweeping every
shipped card's `answerText` against that map rewrites **11 answers and all 11 are correct and
intended** — ten `Paleolithic`/`Paleo` and `us-096`'s `Reorganization`. **None of the five non-words
occurs in any answer**, so nothing is mis-graded today; the first card whose answer term carries one
would mark a reader wrong for typing the correct English word.

It is an app change and so would need a changelog line and a version bump, which do not belong in a
deck batch. Left for one of its own.

### One gloss, two parts of speech — again

The shape that led the batch before this one, and five cards had it:

- **冰** gave the single noun "ice" under **noun / verb**, and no sentence showed the verb.
- **才** gave "just now, only then, not until" and was missing the sense **two of its three sentences
  use** — the emphatic 才 of 我才不听 and 你才是, which CC-CEDICT calls "(emphatic, esp. in contrast or
  correction) really; actually" and which a beginner meets in speech first.
- **差** was missing *to differ BY*, which is what its own 他们差六岁 is.
- **层** carried two comma run-ons and, between them, no sentence for the layer sense.
- **常** gave "constant, regular, ordinary" under an **adverb** — three ADJECTIVES under an adverb
  label, and not one of its three sentences uses any of them; all three are *often*.

### A gloss that is not what the card's own English says

**宾馆** was "guesthouse" with three English lines saying *hotel*; **病人** was "sick person" with three
saying *patient*; **草地** was "lawn" with three saying *grass*; **别的** was the single word "else",
which only works after an interrogative; **差不多** was "almost", which fits one of its three;
**常见** was the literal "commonly seen" where all three say plainly *common*; **不久** stopped at "not
long (after)" where two of three are the forward-looking *soon*. Each extended from CC-CEDICT rather
than replaced.

### Sentences replaced, and the reason each had to go

- **病人's** 医生向病人用药 — 用药 is what a doctor DOES, not something done 向 somebody.
- **不同's** 这蛋糕吃起来不同一般 teaches a set phrase, *out of the ordinary*, on a card for the plain
  adjective; its English, "The cake tastes divine!", keeps neither the structure nor the word.
- **不久's** 可能不久会见你 misplaces the adverb, and its English says *later* where 不久 is *soon* —
  the opposite end of the same scale.
- **草's** first sentence is about 草地, which is the very next card in this deck and already carries
  two sentences telling a reader to keep off it.
- **草地's** 从草地里出来 means *come out of the grass* and its English said **"Stay off the grass"** —
  which is not a translation of it, and is word for word what the sentence below it already says.
- **层's** 外层空间 and 楼层 both bury the headword in a longer word; the second is thirty characters of
  hotel narrative on a measure-word card.
- **查's** first two sentences were both 查字典, one of them rendered "Remember to USE the dictionary".
- **常用's** 信赖域的算法越来越常用 is graduate numerical optimisation on an HSK 3 card.
- **冰's** 在这里有冰水吗 says COLD water for 冰水 and puts the locative in a slot Chinese does not use.

### English that is not the sentence

Ten lines across eight cards, and the shapes repeat: an English idiom standing in for the Chinese and
dropping the headword with it (别人's "I always have trouble remembering names"), a good English
sentence that throws away the very frame the card teaches (不但's "She is as clever as she is
beautiful", for a card whose entire content is 不但…而且), a tense the Chinese has not got (不用), a
judgement about a thing where the Chinese is a speaker refusing (不行), the wrong word entirely
(冰激凌's **"We don't have any ice"** on the card for ice cream, 参加's "You should go too" for *take
part*), one card using two English words for one thing (冰箱: refrigerator once, fridge twice — 足球's
fault in the batch before), a Chinese hotel room and a Chinese shirt **priced in dollars** where 元 is
yuan (宾馆, 衬衫), and a card whose gloss says *marks* while all three of its lines say *grades*
(成绩).

### On the compound lists

**All eight single-character cards in the range got one** — 冰, 才, 草, 层, 查, 差, 尝, 常 — 31 rows,
every reading and gloss checked against CC-CEDICT before it was written.

- **差's list is chosen to show the polyphony its own `Say` field exists for**: 差不多 and 差点儿 are
  chà, 差别 is chā, 出差 is chāi — three readings of one character in four rows.
- **平常 carries the adjective sense this batch took OFF 常's gloss**, which was claiming it under an
  adverb while none of the sentences showed it.
- **楼层 is on 层's list** because it is one of the two words this batch took out of that card's own
  examples — the repair 左手 got on 左, and 右手 before it.

### Read and left alone

菜单, 常见's sentences, 尝, 常常's Chinese, 不行's first sentence and 衬衫's third are right as they
stand. Two things were read and deliberately not changed: **草地's 草地看来不错** would be more natural
as 看起来, but 看来 is not wrong; and **衬衫's 他一直穿蓝衬衫** is *all along* rather than *always*, which
its English glosses loosely and correctly enough.

### Standing invariants at the end of the batch

- example blocks: **34,596**; **spoken == visible on every one**
- Chinese leaking into an English line: the Level 3 set is **byte-identical to HEAD's**
- sense tags pointing past the sense list: **0**, and all five tagged cards read back off the finished
  deck rather than trusted
- stray spaces: **32 blocks, 24 distinct** — unchanged
- American spellings: **491 → 489**, the two in range; the rest is a named batch
- clobber sweep over the record diff: **0**; 4 existing notes changed, 25 added, which is the 29 cards

### 2026-09-17 — the coarse-content sweep

**What the batch was.** Not a range of notes but a corpus-wide sweep, named after batch 17 and made
overdue by batch 20: **two obscenities had turned up by ordinary reading in four batches**, which is a
rate rather than an accident. 34,596 example blocks and every gloss, against six declared word lists in
English and Chinese. **Thirty-seven cards across seven decks were changed.**

The sweep is committed as `.claude/decks/check-coarse.js`; its header carries the reasoning and
CLAUDE.md names it. **Profanity, sexual, body, adult and slur were read in full; `violence` was not**,
and is left for a batch of its own.

### The one to read first

**茎 — glossed *stem; stalk* — had all three of its sentences about penises.**

> 你的阴茎很大。 — "Your penis is big."
> 别吸烟。吸烟可能缩短你的阴茎。 — "Don't smoke. Smoking can shorten your penis."
> 你从来吮了阴茎吗？ — "Have you ever sucked a penis?"

It is 阴's fault from Level 2 at three times the scale and from the same source: 阴茎 is a word of its
own, so the headword stands alone in none of them, and 阴茎 is not in the decks' lexicon, so
`check-example-fit.js` never looks at it. All three replaced.

The second of those sentences was **also 缩短's first example** in Level 5, which is how a subtitle
corpus spreads one line across every card whose character it happens to contain.

### The discriminator that makes the sweep usable

A first run reported 1,141 hits and most were the decks doing their job: Everyday Phrases and Idioms
teach 放屁, 该死, 滚蛋 and 一丝不挂 **on purpose**, and a phrasebook that left them out would be the
poorer for it. So a hit is dropped where the matched term IS the headword (either way round) or where
the card's own gloss already carries the English word. That takes it to 812, and what is left is coarse
content that arrived on a card about **something else** — which is the whole fault.

It is still a report and can never be more. Every word in the six lists has innocent uses: *naked eye*,
an *ass* the animal, *aroused his curiosity*, a *period*, 上床睡觉 (to go to bed), 妈的 matching inside
妈妈的 and 妈的衣角, 小三 inside 比我小三岁, 高潮 of a performance, "Prick up your ears", and
Shakespeare's "If you prick us, do we not bleed?".

### The widest real class: the English is coarser than the Chinese

**Nine cards**, and the shape is always the same — the card is not teaching an expletive and the
translator supplied one:

| card | Chinese | was | is |
|---|---|---|---|
| 可恶 | 可恶，家的钥匙到底放哪去了？ | "Shit, where the **fuck** did I put my home keys?" | "Damn it, where on earth did I put my house keys?" |
| 心血 | …别这时候搞砸了。 | "Don't **fuck** it up now." | "Do not mess it up now." |
| 倒霉 | 他倒霉极了。 | "He is **shit** out of luck." | "He is having a truly terrible run of luck." |
| 胡说 | 她们只是胡说八道。 | "They're just talking **shit**." | "They are just talking nonsense." |
| 简历 | 我根本不在乎我的简历。 | "I don't give a **damn** about my CV." | "I do not care in the least about my CV." |
| 爆 | 讨厌！轮胎爆了！ | "**Shit!** I've got a flat." | "Oh no! The tyre has burst!" |
| 厉害 | 我非常厉害。 | "I'm a **bad-ass**." | "I am really very good." |
| 得分 | 坏了，她要得分了。 | "**Damn**, she's going to score." | "Oh no, she is going to score." |
| 去你的 | 去你的破网站。 | "**Fuck** your websites." | "To hell with your rubbish website." |

可恶 is the clearest: **one mild Chinese expletive rendered as two strong English ones**. 得分 had a
second problem the rewrite fixes — *score* alone is sexual slang in English, which next to an expletive
on a Level 3 card is a reading nobody intended. 去你的 keeps its sentence, the card genuinely teaching
the expression; only the register comes down.

**不管's is the shared-sentence problem, and it is the same sentence batch 20 fixed on 别人.** `exEn` is
per note, so one copy was corrected and the other left — exactly what was flagged about 城市 and 图书馆
in the same batch. Fixed here so the two agree.

### A fault class nobody was looking for: a character error that put the headword there

Two cards, and neither is coarse at all — they were caught because the sweep pulled the card up:

- **炮's** first example was 爱迪生发明了电灯**炮**。 A light bulb is 电灯**泡**, with 泡. The sentence
  contains this card's headword ONLY because somebody typed the wrong character.
- **破's** third was 希望别**破**妈妈发现才好。 which is 别**被**妈妈发现 — "I hope Mum doesn't find
  out", which is exactly what its own English says. 破 for 被 is a typo, and again the example is on
  this card only because of it.

**Nothing in the pipeline can see this.** The sentence segments, speaks and translates perfectly; the
headword is present as a character; only the meaning is absent. It is worth a sweep of its own and one
is not obvious — a homophone or near-homograph standing where another character belongs cannot be found
by pattern, only by reading the sentence against its English.

### Cards rebuilt entirely

Three had nothing worth keeping:

- **茎** — all three about penises (above).
- **炮** (*cannon; firecracker*) — two sentences about 炮友, slang for a sexual partner, and the
  character error above. Now firecrackers at New Year, a Qing-dynasty cannon and the sound of guns.
- **吸** (*to inhale; to suck in*), a **Level 4** card — 吸一口气，妈的！, 你是不是吸毒吸傻了？ and
  我不吸大麻。 All three are profanity or drugs, and two render 吸 only inside 吸毒. Now a baby, a
  sponge and a doctor on smoking.

### Coarse content on a card about something else

- **硬** (*hard*), Level 5 — 马麻，我硬了。 "Mummy, I've got an erection." Its second sentence went with
  it for a different reason: 那么硬卡怎么用呢？ was translated "So, how's the card used?", which drops
  硬 entirely, so the one sentence left standing would have shown the headword doing nothing visible.
- **姿势** (*posture*) — sixty characters of graphic obstetric emergency with the headword once at the
  very end.
- **引发** (*to lead to*) — 自慰引发疯狂。 "Masturbation leads to insanity." Coarse, and **false**,
  which is the worse half on a card a reader is asked to memorise.
- **障碍**, **监控**, **厌烦**, **动画**, **和谐**, **避**, **混**, **好笑**, **胸**, **棍**, **搭档**,
  **淘** — an orgasm, a prostitute, 做爱, pornography, a sex life, a condom, 混蛋, 他妈, "big boobs",
  "shove a stick up your ass", "Mr. Goat Butt", and lingerie from a shopping site.
- **豁** and **切割** shared one sentence: fifty characters of contemporary American political argument
  about bans on gender-affirming care and surgery on intersex infants. Whatever one thinks of the
  claim, a vocabulary card is not where it belongs.

**Several replacements do double duty**, because a card whose sentences were all wrong usually had a
sense nothing showed: 淘's new 妈妈在淘米 is *to rinse in water*, which the gloss gives and both
surviving sentences (淘金, twice) do not; 监控's is the verb where both others were the noun; 一口气's
is the adverb *in one go* where both others were a literal breath; 混's is *to confuse* where both
others were *to mix*; 好笑's is *ridiculous*; 避's has 避 as a free verb, 避雨 and 避而不谈 both being
bound.

### Generalisations about people

Three, and the class was opened by 矮 in batch 19 ("shorter people have more tricks up their sleeves"):

- **抵挡** — 没有男人能够抵挡女人的诱惑。 "No man can resist the lure of a woman."
- **教养** — a people who "in their upbringing are on the same plane as **savages**", a colonial-era
  value judgement about a group of human beings. The most serious of the three.
- **中年** — 她是个中年胖女人。 "She's a middle-aged fat woman." The word being taught is *middle age*;
  the rest of the sentence teaches nothing.

**一丝不挂 is a judgement about REGISTER rather than subject**, and is recorded as such: the idiom means
*stark naked*, so its examples must be about nakedness. What was cut is a piece of romantic-novel prose
written from the man's side — "how much love it takes for a woman to be undressed by a man" — where the
two that stay, a child out of the bath and a figure in a painting, are neutral.

### Read and deliberately left

- **避孕套可以预防性传播疾病** (传播, 预防) and **酗酒是导致阳痿的一个因素** (酗酒) are public-health
  information on cards about spreading, preventing and alcohol abuse. They belong there.
- **严禁卖淫嫖娼…** is a public notice on the card for *strictly forbid*, which is the register that
  word lives in.
- **狗改不了吃屎** is a genuine Chinese proverb and 屎 is a card of its own.
- **守宫砂…验证女人贞操** (验证, 宫) is historical information about a real practice, not an obscenity.
- **他们家小孩因为不听话，被打了屁股** (听话) records corporal punishment as a fact of family life.
- **利马想要缩胸** (胸, 缩) is a medical fact; only 胸's *other* sentence was the problem.
- **那个丑男人在节食** stays on 丑, whose headword IS *ugly*.
- **高潮迭起** on 迭起 is an ordinary idiom about a performance.

### A side-finding, named and not acted on

The corpus's translator renders 事情 and 这件事 as **"affair"** about forty times — "This affair is
baffling", "The affair sounded an alarm bell", "We must study the affair as a whole". It is not coarse,
it is stilted, and it is the same shape as the American-spelling finding in batch 20: a corpus-wide
register fault that wants one pass rather than thirty card edits.

### What the sweep still holds

| category | before | after | read? |
|---|---|---|---|
| profanity | 141 | 124 | yes |
| sexual | 44 | 22 | yes |
| body | 19 | 11 | yes |
| adult | 106 | 99 | yes |
| violence | 200 | 200 | **no — a batch of its own** |
| slur | 195 | 192 | yes |

The residue in the read categories is the innocent uses listed above plus the deliberate leaves. **The
`violence` list was not opened**: a corpus of films and idioms is full of killing, and it needs the same
card-by-card reading the others got rather than a skim.

### Standing invariants at the end of the batch

- example blocks: **34,596**; **spoken == visible on every one**
- Chinese leaking into an English line: **all seven touched decks byte-identical to HEAD's**
- example coverage: **11,532 of 11,532 notes at three sentences**, and none showing the same twice
- `check-example-fit.js` over all nine decks: 143, and **not one names a card this batch touched**
- sense tags past the list: **0**; pinyin against bopomofo: **clean**
- stray spaces: **32 blocks, 24 distinct** — unchanged
- clobber sweep over the record diff: **0**; 19 existing notes changed, 18 added, which is the 37 cards

### 2026-09-17 — the violence half of the sweep, and a public-figures sweep

**What the batch was.** The half of batch 21's sweep left unread — `violence`, 200 findings — read card
by card, plus a new sweep the first one suggested: every example sentence against a list of well-known
names. **Twenty-nine cards across four decks changed.**

**The `violence` column is mostly the decks working**, exactly as predicted: 杀 and 自杀 are cards of
their own, a corpus of films and idioms is full of killing, and the list is thick with the honest
(肯尼迪总统被刺杀了), the idiomatic (一箭双雕, 格杀勿论), the medical (镇痛, "kill the pain"), the
proverbial (好奇害死猫) and the plainly false-positive (*drunk* for 喝, *drown out* the noise, *beat*,
*shot*, *hang*). 161 of the 200 survive the read and every one of them was looked at.

### The one to read first

**泼 — glossed *to splash; to spill* — carried two internet conspiracy memes.**

> 爱泼斯坦没有自杀。 — "Epstein didn't kill himself."
> 特朗普杀了爱泼斯坦。 — "**Trump killed Epstein.**"

A flashcard is a thing a reader is asked to memorise, and this one accused a living former head of
state of murder. **And the headword is in neither sentence in its own right** — 泼 appears only inside
爱泼斯坦, the Chinese spelling of *Epstein*. That is batch 21's character-error class wearing different
clothes: **a proper noun's transliteration putting the headword on a card it has nothing to do with**.

**棉 is the same fault exactly**: a real terrorist bombing with its casualty count, on a Level 6 card
glossed *cotton*, where 棉 appears only inside 棉兰老岛 — Mindanao.

### The public-figures sweep

Testing all 34,596 sentences against a list of well-known names finds **nine**, and the split is clean:

- **Three are plain historical fact** and stay — Bush following Reagan, and Kennedy's assassination
  (twice, one sentence on two cards).
- **Six were repaired.** Two are the Epstein memes above. 资产 carried 川普是俄罗斯的资产, "Trump is a
  Russian asset", a contested political accusation about a living person. 情形 put an **invented
  quotation into the mouths of two real heads of state** — Putin telling Hu Jintao they must help
  Kyrgyzstan — and then revealed it as a dream; the frame is what makes it a joke rather than a claim,
  but a vocabulary card is not the place to test whether a learner spots a frame. 概括 carried a garbled
  campaign-speech mashup naming Xi Jinping, two halves with nothing to do with each other. And 代言 had
  **eighty characters of a real victory speech** naming its vice-president-elect, with the headword once
  in the middle, beside two sentences of five and six characters.

**扭转's 扭转治疗是酷刑 ("Conversion therapy is torture") goes with them**, on the same reasoning as
batch 21's gender-affirming-care sentence: whatever one thinks of the claim, it arrived on a vocabulary
card because it happens to contain the character.

### The rule this batch had to write down

**A SUICIDE SENTENCE BELONGS ON THE CARD THAT TEACHES THE WORD FOR IT, AND NOWHERE ELSE.**

自杀 is a real Level 6 card and keeps its own examples. What was removed is the same subject arriving
at random on **eleven other cards** — 尝试, 失恋, 挫折, 青春期, 特性, 服, 吊, 宁可, 妥协, 企图, 试图 —
so that a reader working through Levels 5 to 7 met it again and again with no context and no reason.

It is a judgement about **how a flashcard is met** — one sentence at a time, out of order, repeatedly —
rather than about the subject, which a language must be able to talk about. Two of the eleven would go
under any rule:

- **失恋's** 他失恋了，所以便尝试自杀 does not merely mention the subject, it **asserts the causal link**,
  on the card for being left by somebody. 挫折's is the same link as a rhetorical question.
- **青春期's** was sixty characters of Bertrand Russell on hating life and being continually on the
  verge of suicide throughout adolescence — on the card for **puberty**, which is the age of the readers
  most likely to be studying it.

And 尝试's was **put to the reader in the second person**: 你有没有尝试过自杀？

**Where the card's own subject IS the hard thing, the sentence stays**: 毒 keeps 他服毒自杀了 and 吊
keeps 革命的时候他被吊死了. 吊 had two hanging deaths of its three, and only the first went.

### Register on a card whose subject is right

Three cards teach hard words and were kept, with the sentence changed:

- **吸毒** — 他是个吸毒男 is not standard Chinese and its English said **meth** where the Chinese says
  drugs; 你是不是吸毒吸傻了？ is an insult (*have drugs made you stupid?*) whose English, "Do you have a
  drug problem?", says something else entirely. (That sentence was also 吸's in Level 4, where batch 21
  removed it; here it was on the right card and still had to go.)
- **枪毙** — 我要枪毙了他 is a first-person threat, and "I need to kill him with a gun" is not a sentence
  anybody says. Replaced with a historical statement in the passive, which is how the word is used.
- **神** — 我杀死了神, "I killed God", teaches nothing 杀死 does not teach on its own card.

### Sentences that teach nothing and offend anyway

**孕妇** opened with 老天！我杀了一个孕妇！ and its second sentence was about underwear in coarse
English. **君子** carried a generalisation about the criminals of a named country, with the headword in
it only inside 瘾君子 — *an addict*, very nearly the opposite of what the card teaches. **宣告** had
fifty characters of contested moral argument about the atomic bombings. **生肖** had forty characters
of wuxia plot summary naming three characters nobody has heard of — and the card was missing **the one
question anybody is ever asked with this word**, 你属什么生肖？

### English that is not the sentence

- **好奇's** "Curiosity killed the cat" for 好奇会吃苦头的 — 吃苦头 is *to suffer for it*, and there is
  no cat. A reader answering the reverse card off that line would produce something with 猫 in it.
- **明明** and **招** share 我明明没招惹任何人, rendered "I didn't ask to be abused", which translates
  neither half: 明明 is *clearly* — this card's own gloss — and 招惹 is *to provoke*.
- **资产's** second sentence is not a sentence: 资产盈利能力或一些其他的价值，它们的主人 is the words of
  "Assets have earning power or some other value to their owner" in Chinese order with no grammar.

### A correction to batch 21's own figures

**The profanity column was 108/125 noise and the noise was mine.** The sweep's Chinese list carried a
bare **靠**, which is the ordinary verb *to rely on* and *to draw alongside* — so it matched 停靠, 依靠,
不靠神仙皇帝 and, once this batch had written it, 很多明星靠代言赚钱. It is the INTERJECTION 我靠 that is
vulgar. Narrowed to 我靠 and 靠北, the column goes **125 → 17**.

**Batch 21's read was sound in spite of it**, and that is worth stating rather than assuming: all
seventeen were re-read here and every one is a case that batch left deliberately — the 狗改不了吃屎
proverb, "Prick up your ears", Shakespeare's "if you prick us, do we not bleed", 妈的 matching inside
妈妈的 and 妈的衣角, and 可恶/糟了 rendered "Crap", which is mild. **One answer was wrong**: 大错特错's
only generator sentence called the listener a 混蛋, and the insult does none of the teaching, the frame
如果你认为…那你就大错特错了 carrying the idiom exactly as well without it.

**Expect the same of any single character added to those lists.** A one-character Chinese pattern in a
substring match will nearly always find the language rather than the fault.

### And I clobbered a note doing it

The 大错特错 edit was written with `Object.assign({ …mine }, existing)`, which puts the EXISTING fields
last — so the note's own `ex` and `why` won, my replacement sentence was thrown away, and **the card
went from three examples to two with `--check` passing and nothing else reporting**. The `add()` helper
every batch script has carried since batch 11 exists for exactly this and I did not use it.

**It was caught by `check-mandarin-coverage.js` reading 11,531 of 11,532 notes at three sentences** —
which is why that check belongs at the END of every batch and not only when a batch expects to move it.
Third occurrence of this fault in twenty-two batches (包子 in batch 2, 有的 in batch 10).

### What the sweep holds now

| category | at the start of batch 21 | now | read? |
|---|---|---|---|
| profanity | 141 | **15** | yes, twice |
| sexual | 44 | 22 | yes |
| body | 19 | 11 | yes |
| adult | 106 | 99 | yes |
| violence | 200 | 161 | **yes — this batch** |
| slur | 195 | 192 | yes |

**The sweep is now fully read.** What remains in every column is the innocent uses and the deliberate
leaves, both listed in batch 21's entry and this one.

### Standing invariants at the end of the batch

- example blocks: **34,596**; **spoken == visible on every one**
- example coverage: **11,532 of 11,532 notes at three sentences**, none showing the same twice — the
  check that caught the clobber
- Chinese leaking into an English line: all four touched decks **byte-identical to HEAD's**
- `check-example-fit.js` over all nine decks: **not one finding names a card this batch touched**
- sense tags past the list: **0**; pinyin against bopomofo: **clean**
- stray spaces: **32 blocks, 24 distinct** — unchanged
- sentences naming a well-known public figure: **9 → 3**, and all three are historical fact
- clobber sweep over the record diff: **0** after the repair; 14 existing notes changed, 15 added

### 2026-09-17 — the American-spelling pass

**What the batch was.** The second of the three standalone batches named in batch 20, done as a
**deck-level pass rather than 489 per-note entries**: a new `exBritish` field in `mandarin-fix.js`,
set on all nine decks. **412 cards changed, 597 fields, 136 distinct substitutions.**
`check-british.js` now reads **489 → 0**, and a second run of the applier is a no-op.

### Why it is a fault at all

The decks are authored British **because the site's spelling switch never runs in the direction that
would rescue them**. `applySpelling` returns immediately under `en-GB`, the authored system, and
converts to American only for a reader who asks. So an American spelling written INTO deck content is
never corrected for anybody — it is simply what both readers see, for ever.

### What bounds the pass, and why none of the three can be dropped

1. **The one-way rows are excluded, and `app.js` already knows which**: it builds its own
   American→British map with `if (!oneWay)`, precisely because storey→story is safe and the reverse
   catastrophic. Reversing them would turn every narrative STORY into a storey (106 in this corpus), the
   noun PRACTICE into the verb practise (56), a LICENSE into a licence and a computer PROGRAM into a
   television programme. **A first measurement of this corpus reported 713 because it did not honour the
   flag**; honouring it gives 489.
2. **Five forms are excluded by name** because the reverse mapping is not English at all — humorous →
   humourous, laborious → labourious, honorary → honourary, clamorous → clamourous, odorous →
   odourous. That is the latent app.js fault recorded in batch 20's entry, and the pass must not
   reproduce it.
3. **A proper noun is not a spelling** — and this is the one that turned out differently from the
   prediction. **`BRIT_KEEP` is empty as a MEASUREMENT rather than as an omission.** Batch 20 named
   Pearl Harbor, the World Trade Center, an Australian Labor Party and the Indian Reorganization Act as
   the reason this could not be swept mechanically. The corpus carries **8 `harbor`, 11 `center`, 9
   `labor`, 24 `organization` and 14 `theater`**, every one was read, and **not one is a name**: every
   harbor is a port, every center a middle, every labor work, every theater a theatre. A second check
   found **26 capitalised hits that are not sentence-initial, and all 26 are glosses** in the Levels 7–9
   deck, which capitalises its glosses. So the trap is real in principle and absent in fact.

**Re-run `check-british.js --list` and read the capitalised hits before trusting that again.** A deck
added later may not be so lucky.

### How the pass is built

- **A deck-level field, like `exPunct`**, for the same reason: a mechanical substitution belongs in one
  place where it cannot be applied to 400 cards and forgotten on the 401st.
- **The table is sliced out of `app.js` by text and the run STOPS if the slice fails.** A second copy of
  a 147-row word list goes stale on a change made in a file nobody editing a deck has reason to open —
  the rule `spanish-fix.js`'s own `exBritish` already follows, and the scar `add-card-tags.js` left.
- **It runs LAST**, after every per-note edit, so the record's own `ex` and `exEn` rows are swept with
  everything else: an American spelling typed into a documented repair is exactly as stuck as one the
  generator shipped.
- **It sweeps only the English** — each gloss and each `uc-exe` div — never the Chinese and never a
  `data-say`, which carries its own copy of the sentence.
- **The mirrors are RE-DERIVED, not swept.** `answerText` is the senses as plain text and `answer` is
  `<pinyin> — <senses>`; running an English word list over a romanisation is a risk for nothing, so the
  senses are swept once and the two mirrors rebuilt from the result.
- **Case is preserved** in the three shapes a sentence produces — lower, Capitalised, ALL CAPS — and
  anything else is left as written, which is app.js's own rule and for its own reason.

### All 136 substitutions were read

They are all correct British forms. The head of the list: `color` (35), `organization` (29),
`behavior` (27), `favorite` (26), `favor` (23), `theater` (17), `defense` (16), `recognize` (13),
`center` (13), `harbor` (12). The tail is where the reading matters, and it holds `plow → plough`,
`gray → grey`, `cozy → cosy`, `aluminum → aluminium`, `skillful → skilful`, `fulfill → fulfil`,
`enroll → enrol`, `installments → instalments`, `maneuver → manoeuvre` ("the Heimlich manoeuvre"),
`savior → saviour`, `diarrhea → diarrhoea`, `fetus → foetus` and `encyclopedia → encyclopaedia`.

**Two results are worth knowing and neither is wrong.** `travelers' check` becomes `travellers' check`
and not `cheque`, because *check/cheque* is a lexical pair rather than a spelling one and is not in the
table — this is exactly what the site itself would render, so the pass is consistent with it. And
Chomsky's *Colorless green ideas sleep furiously* becomes *Colourless*, which is how a British edition
prints it, but it is worth knowing that the pass will convert a quotation's spelling along with
everything else.

### The lexical half, measured and named

`SPELL_PAIRS` covers spellings and deliberately not word choices, so a second sweep asked what it cannot
reach: **478 raw hits over 37 words** — `fall` (74), `check` (73), `store` (46), `movie` (35),
`vacation` (29), `grade` (20), `mail` (20), `subway` (12), `truck` (12), `stove` (11), `elevator` (10),
`soccer` (8), `math` (8), `airplane` (7), `faucet` (7), `sidewalk` (3), `drugstore` (1).

**That figure is a raw upper bound and mostly homographs.** *fall*, *check*, *store*, *grade* and
*mail* are ordinary English verbs and nouns, and a great many of the 478 are those. It needs the same
card-by-card reading the coarse sweep got, and it is **a batch of its own** — the third, with "affair"
for 事情 (~40) and the whitespace batch (32 blocks).

### Standing invariants at the end of the batch

- example blocks: **34,596**; **spoken == visible on every one** — which is the check that matters most
  here, since the pass rewrites English beside a `data-say` it must never touch
- example coverage: **11,532 of 11,532 notes at three sentences**, none showing the same twice
- Chinese leaking into an English line: **all nine decks byte-identical to HEAD's**
- `check-example-fit.js`: **143, unchanged** — the pass touches no Chinese
- `check-pinyin.js`: clean; `check-say.js`: 18,538 headwords, 0 dropping an article
- `check-coarse.js`: unchanged in all six columns
- `check-british.js`: **489 → 0**, and the applier's second run writes nothing
- stray spaces: **32 blocks, 24 distinct** — unchanged, the last of the three named batches

## Batch 24 — the American-word-choice pass, all nine decks

The third and last of the three standalone batches named in batch 20, and the direct sequel to batch
23. That one converted SPELLINGS, and it could take its table straight out of `app.js` because a
spelling is a fact about a word: `color` and `colour` are one word written two ways, and
`SPELL_PAIRS` already knew 147 of those pairs because the site's own reader-facing switch needs them.
**A WORD CHOICE is not that.** `movie` and `film`, `vacation` and `holiday`, `elevator` and `lift`,
`faucet` and `tap` are different words; no rule relates them, and app.js has no table of them because
the site's own prose is authored British and has never needed one. So this table is **declared in
`mandarin-fix.js` itself**, as a new `exLexis` deck field beside `exBritish`, and every row in it was
arrived at by reading every occurrence the nine decks contain.

**The measurement, and why the measurement is not the batch.** A sweep over every gloss and every
`uc-exe` div, against a hand-written list of 46 American word choices, returned **463 raw hits over 38
words**. Of those, **only 195 were converted**: 18 words through the table and the rest by hand. The
gap is the whole finding and is worth having before anybody reaches for a bigger table.

| word | raw hits | what they turned out to be |
|---|---|---|
| `fall` | 74 | **71 are the ordinary verb.** A table row would have made "Pride goes before an autumn", "Let's autumn in love" and "the rise and autumn of states". Three are the season and were fixed by hand. |
| `check` | 73 | **66 are the ordinary verb**, and checking in at a hotel and checking out of one are British too. Seven are a bank draft and became cheques. |
| `store` | 46 | **32 are right as they stand** — a department store, a convenience store, a chain store, to set great store by something, and the verb. Fourteen plainly mean a shop and were converted one at a time. |
| `mail` | 20 | **all 20 are ordinary British English.** Air mail, registered mail, e-mail and voice mail are what a British reader says. Nothing was changed, and the finding was the sweep's. |
| `grade` | 20 | **13 are a rank, a class of goods or an exam grade**, all British. Five are a year at school and one is the verb *to mark*. |
| `stove` | 11 | **nothing changed.** A wood stove, a gas stove and a camping stove are all British; "cooker" is the more distinctly British word for the appliance but "stove" is not an error. |
| `vest` | 3 | **nothing changed** — and this one runs the other way. A British *vest* is the sleeveless garment 背心 actually is; it is the AMERICAN sense (a waistcoat) that these cards do not mean. |

**What went in the table, and the two things a word-for-word swap gets wrong.** Eighteen rows:
`movie`/`movies`, `vacation`, `elevator`, `subway`, `cellphone`, `sidewalk`, `airplane`, `soccer`,
`faucet`, `gotten`, `truck`, `math`, and four PHRASE rows that have to fire first. A compound whose
British name is not built from the same parts — a *movie theatre* is a cinema, not a film theatre, and
*to the movies* is *to the cinema* — and an **ARTICLE that changes with the word after it**: "Do you
have an elevator?" is "Do you have **a** lift?", and "Could I have a subway map?" is "Could I have
**an** underground map?". The table is applied longest-first, so the phrases win.

**`subway` is the one row that is a judgement rather than a fact, and it is recorded as one.** All
twelve of its hits are the railway, so the swap is mechanical; what is not mechanical is the choice of
British word. *Subway* in British English means a pedestrian underpass, which makes it a genuine false
friend on a card a learner is memorising, and "underground" is unambiguous. Against that: **Beijing's
own English signage says Subway**, and Shanghai's says Metro. The deck's English is a gloss for a
British reader rather than a sign to read in the street, so "underground" it is — but a later session
that wants "metro" instead has a one-line change and a reason.

**THE FAULT THIS BATCH MADE ITSELF, which is the part to read before the next gloss dedupe.** Eight
glosses carried the American word BESIDE the British one — "film; movie", "lift; elevator", "stopcock;
tap; faucet", "lorry; truck" — and the table left alone would have rendered each of them the same word
twice. Those were deduped per note, before the pass. **What nobody predicted is that taking the
American half off a gloss leaves the British half, and the British half is often what a NEIGHBOURING
note already says.** `check-mandarin-coverage.js`'s still-ambiguous reverse-card count went from **2
groups to 7** on the first run: 电影/片子 both "film", 假期/假日 both "holiday", 橡皮/橡胶 both
"rubber", 雪糕/冰棍儿 both "ice lolly", 货车/卡车 both "lorry". A reverse card's front is the gloss and
nothing else, so each of those is one question with two right answers.

Four of the five were settled with a **sharper gloss rather than a hint**, because in every case the
two words genuinely differ and the collision had been hiding it: 橡皮 is the eraser and 橡胶 the
material; 货车 is the general goods vehicle (its own first sentence calls it a van) and 卡车
specifically the lorry; 假期 is a stretch of holiday and 假日 a day off. **The fifth found a wrong
gloss rather than a duplicate one** — CC-CEDICT gives 雪糕 as an ice cream bar and 冰棍儿 as an ice
lolly, so "ice lolly" was the wrong word for that card and the right one for its neighbour.

**And 电影/片子 could not take a hint at all, which is worth knowing about the applier.** A `not <other
word>` block is prepended to `fl.English` early in the pass, and a `senses` or `gloss` fix later
REPLACES `fl.English` wholesale — deliberately, and the comment beside it says so: a note given its own
distinguishing gloss no longer needs a hint. So **a note carrying both a gloss fix and a hint keeps
only the gloss**, and the hint is silently gone. The right answer was on the card the whole time: 片子's
second sentence is 医生看了片子, "the doctor looked at the X-ray", which the one-sense gloss did not
cover. It now carries two senses — *film* and *X-ray plate* — with `exSense` saying which sentence
shows which, and the collision goes with them.

**What the second reading found, and it is the reason to read a diff line by line rather than count
what is left.** The residual measurement after the first apply was 234, all of it correctly left alone
— and reading all 195 changed lines against their originals found six the swap had made ungrammatical
or redundant, none of which any counter could see. 放假's gloss became "to have a holiday or holiday";
度假 became "Where did you go **for** holiday?", where the British word takes *on*; and **British
English takes the summer holidays in the plural and with the article** where American English says
"on summer vacation" and "during summer vacation" bare, which caught four sentences across five cards.
A seventh line had the fault both ways at once before the batch touched it: 落's second sentence read
"The leaves fall off the trees in **the fall**."

Two smaller things the reading turned up and fixed in passing, neither of them a dialect question:
低价's sentence said "a VCR", an abbreviation a learner meeting it on a vocabulary card has no way to
expand, and 食堂's said "the college dining hall" for 大学食堂, where a British *college* is a
sixth-form or further-education college rather than a university.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean; a second run of the applier writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous reverse groups back to the pre-batch **2** (颜色/彩色 and 邻居/街坊, both standing findings)
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-british.js`: **0**, unchanged; the lexical sweep's own residual is **231, every one of it deliberate**
- `check-example-fit.js`: **143, unchanged** — the pass touches no Chinese
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged** — the table collapsed no two sentences on one card into the same English
- `check-coarse.js`: unchanged in all six columns; `check-say-reading.js` unchanged
- answer-leak sets byte-identical to HEAD on all nine decks; 34,596 example blocks, spoken == visible on every one; sense tags past the sense list 0
- stray spaces: **32 blocks, 24 distinct** — unchanged, and now the only named batch left

### 2026-09-17 — the whitespace pass

**The last of the three standalone batches batch 20 named**, and the smallest of them: 32 example
blocks carrying a space where Chinese sets none — between two characters, or between a character and
the mark that ends the sentence. It is the least consequential fault in the backlog and it is on the
card twice over, because the gap rides in `data-say` as well as in the visible text, so the speaker
pauses where the writing does not.

**It needed a new field, and the reason is `dropEx`.** The only way this record can change a
generator's example is to drop the block and author a replacement — and a generator block carries a
STRUCTURE LINE glossing every word's part of speech and bolds the headword inside its visible text,
neither of which can be re-derived, so a drop-and-re-add loses both. `exStop` was written for exactly
this shape one mark over (append a terminal full stop and nothing else) and cannot help here, its
whole safety argument being that it only ever appends. `exSpace: [[was, now]]` is that argument one
degree wider: **a row that can only move whitespace and punctuation cannot invalidate a structure
line or a bolding**, and `zhSkeleton` is what enforces it — the two sides are compared with every
space and every punctuation mark stripped out, and a row whose sides differ by so much as one
character is a hard FAIL rather than a warning.

**The edit is tag-aware, which a string replace is not.** `rewriteZhVisible` walks the block's
visible text into tag tokens and character tokens, checks that the characters spell the old sentence
exactly, records which tags open and close at which non-punctuation position, and re-emits the new
sentence with each tag put back at the position it was at. So the `<b>` round the headword survives a
comma being inserted four characters in front of it. If anything fails to line up it returns null and
the row reports rather than writing.

**One ordering inside it is load-bearing and got it wrong first.** The block's `data-say` also appears
inside the visible div's own `uc-tts` span, so the match on the visible div is captured from the
ORIGINAL block text — rewriting the attribute first leaves that replace with nothing to find, and it
**fails silently**: the spoken field moves and the words on the card stand still, which is precisely
the fault the standing spoken-vs-visible sweep exists to catch and which would have shipped if that
sweep were not run. The visible text is replaced first and a comment says why.

**What the 24 distinct sentences were.** Twenty were mechanical — seventeen a space before the mark
that ends the sentence (我丢了手表 。), two set with a space between every word (学习 汉语 难 不 难？,
窗户 打开 了。), one a space before a comma. Four were not, and those are the ones a deletion would
have made worse, because the gap was doing a mark's work:

- **宽宏大量's couplet**, where the space stands between two clauses of a four-part verse and a
  deletion runs them together. The row supplies the enumeration comma instead.
- **孝顺's numbered pair** (世上有两件事不能等：一、孝顺 二、行善。) — a numbered list needs the comma
  between its items.
- **欣慰's list of four evangelists**, which carried three faults at once: the space after 约翰, two
  clause commas standing where Chinese uses the enumeration mark 、 inside a list, and a missing comma
  before the final clause. All three are punctuation, so the row changes no word.
- **火锅's second sentence** (吃火锅的时候 ,气氛…), where the space had also hidden the sentence from
  the deck-level punctuation pass — that pass matches a mark sitting IMMEDIATELY after a character,
  so the half-width comma beside the gap had never been converted either. **A stray space is not only
  a stray space: it is a hole in every check keyed on what stands next to a character.**

**And the sweep found two things that are not whitespace at all.**

**托 — not one of its three sentences used the headword as a word.** The card is glossed *to support
with the hand or palm*, and 托 stood inside 贝内迪托 (Benedito), 托尼 (Tony) and 克里斯托弗
(Christopher): three transliterations of European names. That is batch 22's character-error class in
its other form — the example is on this card only because the character happens to occur in somebody's
name — and **nothing in the pipeline can see it**, because `check-example-fit.js` skips a
single-character headword outright, one character being unable to straddle a word boundary. The third
sentence was worse again: 为什么克里斯托弗·哥伦布离婚了？ asks why Christopher Columbus got DIVORCED,
and the English under it read "What did Christopher Columbus discover?" — a different sentence
altogether. All three dropped and replaced with authored ones, each using 托 as a free verb in three
different constructions (the instrument with 用手, a serial verb with 走了过来, the resultative 托起).

**宏大's copy of the 宽宏大量 couplet is shipped by the RECORD, not by the generator.** The couplet is
a real deck sentence that this note was given a copy of in an earlier batch, so the same stray space
stood on three cards: two generator blocks, repaired with `exSpace`, and this one, where the fix
belongs in the record's own `ex` row. **A repair that reaches a sentence through the decks does not
reach the record's own copy of it**, and a run of the applier would have put the space straight back —
which is the same shape as batch 8's `dropEx` fault and is worth expecting whenever a sweep finds a
sentence this record authored.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run of the applier writes nothing
- both new guards proved live: a row that changes a word, and a block whose visible text disagrees with its `data-say`, each fail the run (exit 1) and restore to exit 0
- **stray spaces: 32 blocks, 24 distinct → 0** — the whole finding, closed
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous reverse groups **2**, unchanged
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged** — and not one finding names a card this batch touched
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**; the lexical residual is **232 over 13 words**, one more than batch 24's 231 over 12, and the one is batch 24's own deliberate 橡皮 gloss "rubber (the eraser)"
- `check-coarse.js`: measured against HEAD, **identical in all six columns**; `check-say-reading.js` unchanged
- answer-leak sets byte-identical to HEAD on all nine decks; 34,596 example blocks, **spoken == visible on every one**; sense tags past the sense list 0
- `build-lang-decks.js`: re-run, and exactly the **seven touched decks** carry a new content revision — Levels 1 and 2 are byte-identical, so their readers are not offered an update they do not need

### 2026-09-17 — HSK 3 notes 61–90 (迟到 → 电), deck order

Back to the deck-order sweep after three standalone passes. Thirty notes read card by card; twelve
changed, eighteen read and left alone.

**THE BATCH'S FINDING IS A BLIND SPOT IN `check-example-fit.js`, AND IT IS A LARGE ONE.** That checker
segments the sentence longest-match-first and reports an occurrence whose characters are SPLIT between
two words. What it cannot see is the opposite arrangement: **the segmenter landing squarely ON the
headword while the sentence is using those characters as something else.** Four cards in thirty were
teaching a word that is not in their own sentences, and the corpus-wide run reports 143 findings with
none of them named:

- **大人** (adult) — two of three sentences were 他是加拿大人 and 你不是加拿大人，是吗, which are about
  CANADA. Neither 加拿大 nor 加拿大人 is a headword in these nine decks, so the segmenter reads
  他|是|加|拿|大人 and sees a clean match. **The checker's own lexicon is what fooled it.**
- **得到** (to get) — two of three were 做得到 and 办得到, the POTENTIAL COMPLEMENT: verb + 得 + 到, where
  得 is the potential marker and 到 the result. 得到 is itself a headword, so longest-match prefers it
  over 做|得|到. A verb standing in front of 得到 is the signature, and the replacements avoid it.
- **的话** (the conditional particle "if") — two of three were the possessive 的 plus the noun 话:
  她的话如下 ("her words were as follows") and 听他的话 ("listen to what he says"). That is the commoner
  reading of the two characters and the card was teaching the rarer one with examples of the commoner.
- **电** (electricity) — 电影院离电车站近吗 carries 电 twice and neither is the word: 电影院 (cinema) and
  电车站 (tram stop). A **single-character headword is skipped by the checker outright**, one character
  being unable to straddle anything, so that whole class is beyond it by design. The English had lost
  the tram as well, rendering 电车站 as "the station". The sentence is legitimately kept on 离 and 近.

**AND THE HARVEST'S OWN GUARD IS ONE-SIDED, which is the same fault one layer up.** 得分's record
harvested 我们在扔掉之前得分类 from the decks' own bank under a guard that refuses a target **swallowed
by a LONGER headword**. This one is not swallowed — it is 得 (děi, "must") plus 分类 ("to sort"), two
SHORTER words meeting — so the guard passed it, and the card taught 得分 with a sentence that contains
neither the word nor even its reading. **It is the very fault the `dropEx` in that same entry was
written for** (懂得|分是非), re-introduced by the harvest that followed it. A guard against one
direction of a two-directional fault reads, in the record, exactly like a guard against both.

**Two faults in the Chinese and the English that no checker looks for.**

- **大熊猫**'s first sentence was UNGRAMMATICAL: 大熊猫只住在中国里 puts the localiser 里 after a country
  name, which Chinese does not do. A learner copying the card copies the mistake; the sentence segments,
  speaks and translates perfectly, so nothing in the pipeline can see it. Replaced with an authored
  sentence carrying the same fact.
- **春天**'s third ran two independent clauses together with no mark between them —
  冬天结束了春天已经来了 — so the sentence reads as one and the speaker gives it no pause. `exSpace`
  supplies the clause comma and changes no word, which is exactly what that field is bounded to; this is
  its first use outside the batch that introduced it.
- **蛋糕**'s third asserted more than its Chinese: 不同一般 is "out of the ordinary" and the English read
  "The cake tastes divine!", which claims deliciousness the sentence does not. `exEn`, Chinese untouched.

**Four glosses, each read against CC-CEDICT and against the card's own three sentences.**

- **大小** was "dimension" and all three sentences mean SIZE. **The parenthetical it gained is a
  disambiguator, not a note about the card**: 尺寸 is already glossed "size; dimensions; measurements
  (esp. of clothes)", so a bare "size" would have put two cards on the reverse deck that a reader cannot
  tell apart — batch 24's own collision trap, seen before it was made rather than after.
- **出生** was "birth; to be born" under a VERB label, and CC-CEDICT gives only "to be born". 诞生 keeps
  its "be born; come into being; emerge", which is what still tells the two apart.
- **除了** was `apart from ("chule...yiwai" construction)` — a construction spelled in bare romanisation
  the card never shows, naming half of what the word does. CC-CEDICT's leading senses are "apart from;
  besides; in addition to": **除了 both EXCLUDES and INCLUDES**, which the old gloss hid.
- **带** and **得分** are the measure-word family where the two-part-of-speech flag really is a missing
  sense. 带 was "carry" under "noun / verb" **while carrying the classifier 条, which counts a belt or a
  strap** — so the card promised a countable noun and defined none. 得分 was "to score" under the same
  label with no noun. Both split; 得分 gained an `exSense` because its three sentences really do divide
  1/1/2, and 带 deliberately did NOT, all three of its being the verb and a tag repeating itself three
  times saying nothing.

**A MEASURED NON-FINDING, so the next session does not sweep it.** 迟到 is glossed "arrive late" and 出发
"set off; depart", where 出院 beside them reads "to leave hospital" — which looks like a missing
infinitive marker. It is not a fault: measured over all nine decks, **2,582 verb glosses do not open on
"to " against 1,164 that do**, and a large share of the majority are legitimately not infinitives at all
(对不起, 再见, 下雨, 没事). The corpus's own house form is WITHOUT, and a sweep would be inventing a rule.

**Two cards read and deliberately left, with the question recorded.** 出生's third sentence,
我出生在二十年前, is marginal — 出生在 normally takes a place and a time takes 二十年前出生 — but it is
attested and I could not settle it from CC-CEDICT and the card's own examples, so the card stands.
地方's second, 有的地方不能理解 ("some parts are hard to understand"), uses the "aspect; part" sense
that CC-CEDICT lists beside "place"; the gloss "place" is right for two of the three and widening it
risks a collision for a sense a reader meets rarely. Both are left as they are.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2**, unchanged — the two gloss rewrites and the two splits made no new collision
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-gloss-source.js --deck=hsk30l3`: the neighbour check reads **0**, and not one of the twelve
  changed cards is named
- `check-example-fit.js`: **143, unchanged**, and no finding names a card this batch touched
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**; `check-coarse.js` identical in all six columns; `check-say-reading.js`
  unchanged at 10 of 1,503
- answer-leak sets byte-identical to HEAD on all nine decks; 34,596 example blocks, **spoken == visible
  on every one**; sense tags past the sense list 0; stray spaces 0
- `build-lang-decks.js`: re-run, and **exactly one row changed** — Level 3's content revision — so only
  the readers of that deck are offered an update

### 2026-09-17 — HSK 3 notes 91–120 (电梯 → 房子), deck order

Thirty notes read card by card, **twenty changed**, ten read and left alone. One further card outside
the range (`hsk30l6` 相声) is repaired here because it is the second and last member of a class this
batch measured to a close.

**The leading fault is batch 26's blind spot again, and worse.** 东 is glossed "east", and **not one of
its three sentences used the word**: 别边吃东西边说话 is 东西 dōngxi "thing", 来广东玩吗 is 广东
Guǎngdōng the province, and 东家说要提高租金 is 东家 dōngjiā "landlord". Three different words that
merely begin with the character, on a card whose whole job is that character. Nothing in the pipeline
can see it — `check-example-fit.js` **skips a single-character headword outright**, by design, since one
character cannot straddle a boundary; and two of the three sentences segment cleanly anyway, so even a
widened check would name only one. (The second sentence also carried no final mark at all.) All three
replaced with authored sentences giving 东 its three ordinary free uses: after 往, after 朝, and as a
bare predicate noun in a question.

**发 is the same fault carrying a second reading with it.** Its first sentence was 我喜欢短发 — duǎnfà
"short hair", which in traditional script is 短髮, **a different character from the card's own 發**. So a
learner met the headword's shape with neither its sound nor its sense, on a card that also happens to be
a polyphone. `check-say-reading.js` does not name 发 and is right not to: the corpus's majority reading
IS fā, which is what the card teaches, so the speaker says the right thing while the example shows the
wrong word. The gloss went with it — "to send (an email)" narrowed the word to one object and its
parenthetical was a note about the card rather than a disambiguator, where CC-CEDICT gives "to send out;
to issue; to develop" and the card's other two sentences are 发短信 and 发问.

**Two more cards, and the shape they share.** 我喜欢短发 is on 短 as well as on 发 — the same sentence
twice in one deck — and on 短 it is defensible, 短发 being transparently "short" + "hair". **A sentence
can be right on one card and wrong on another**, which is why this class is found by reading rather than
by a sweep over sentences.

**Four sentences that are not grammatical Chinese.**

- **饿**'s first was 我总是饿了 — the change-of-state 了 under 总是 "always", and a state that is always
  true cannot also be a change into it. Replaced with the A-not-A question, a construction the card did
  not have.
- **发生**'s third was 这件事突然自己发生的 — a 是…的 cleft with the 是 missing, so the sentence ends on a
  的 that nothing licenses.
- **短**'s third was 短回答是是, "The short answer is yes" rendered character by character: Chinese has no
  attributive 短回答, and the doubled 是是 reads as a stammer.
- **而且**'s second restated its subject three times — 我有钱，我胖而且我快乐 — to carry an English list of
  three adjectives, which is not what 而且 does. It joins CLAUSES, and Chinese does not put 我 in front of
  each.

**耳机 wrote 在戴着 twice**, the progressive 在 in front of the durative 着 on a verb that cannot take
both, so the Chinese read as "is in the act of having on". Its first and third sentences also said very
nearly the same thing in English. The first was repaired by dropping 在; the third was replaced with a
sentence using the classifier 副 the card carries and never showed.

**耳朵's first was a half-quoted idiom.** 我长耳朵了 stands alone as "I have grown ears"; what people
actually say is 我又不是没长耳朵, and the card's English ("I have ears, you know.") was translating the
idiom rather than the sentence on the card.

**发现 and 发展 each had a sentence doing nothing.** 你家很容易发现 uses 发现 for finding a PLACE, which
it does not do — an easily found house is 很好找 — where 发现 is noticing or discovering something one was
not looking for; its replacement gives the card that sense, which CC-CEDICT lists first and which none of
the three sentences showed. 发展's first and third were the same sentence twice, 中国发展得很快 and
中国很快地发展, the second of them stilted besides; its replacement is the TRANSITIVE use, which the card
did not have at all.

**Six glosses, each read against CC-CEDICT and against the card's own three sentences.**

- **段** was cut off mid-bracket — "section; paragraph; [measure word for stories, pieces" — so the card
  ended on an open bracket and an unfinished list. Rewritten to the two senses CC-CEDICT gives, in the
  shape the deck's other measure-word cards use (条's "(for long thin things: roads, fish, trousers)").
  **All three of its English translations were wrong as well**: 一段时间 with 看 is watching rather than
  looking after, 一段 is a paragraph and not a sentence, and 我跟你说段历史 offers a piece of history
  rather than reporting a conversation.
- **对话**'s part of speech and gloss contradicted each other: the card said "verb" and defined
  "dialogue", a noun, and all three of its sentences are the noun. CC-CEDICT gives both halves.
- **发烧** was "fever; have a fever" under a VERB label — a verb glossed with a noun first, and "fever" as
  a noun is 烧 or 发热, which is not what any of the three sentences says.
- **东北** named only the region ("Northeast China") while the card's own third sentence uses the
  direction. CC-CEDICT carries the two as separate entries, capitalised Dōngběi and lower-case dōngběi.
- **动物** and **耳朵** were glossed plural on cards carrying classifiers — 只/群 and 只/个 — which count
  one animal and one ear, so each promised a countable noun and defined a mass of them. **Measured across
  the nine decks, single-word noun glosses run 1,005 singular to 61 plural**, and most of that 61 is
  English that has no singular (trousers, chopsticks, news, maths, headphones). **This is NOT swept**:
  these two are the countable ones inside the range and the rest were left where they stand.

No `exSense` on either 对话 or 段, for 带's reason in batch 26: all three of each card's sentences are one
sense, and a tag repeating itself three times says nothing.

**A CLASS OF TWO, MEASURED AND CLOSED: the American -logue spellings are invisible to
`check-british.js`.** They are invisible to app.js's own `SPELL_PAIRS`, the -logue family being one of the
five CLAUDE.md names as deliberately absent from that table — American English writes *dialogue* and
*analogue* the same way often enough that a two-way row would do more harm than good. So the checker
reports **0 American spellings over the whole corpus** while these stand. Measured: the nine decks carry
exactly TWO, 对话's own first sentence ("I did not participate in the dialog.") and 相声's GLOSS in Level
6 ("comic dialog"), the latter contradicting both of its own example translations, which say "crosstalk".
Both are repaired here rather than left to reopen as a class. **Two is also why this is not a deck-level
pass**: `exLexis` exists for a substitution worth applying in one place, and a table of one word applied
twice is a table nobody will read.

**Five English lines that were not what the Chinese says.** 电梯's 送你到电梯口 became "I will send you to
the lift", where 送 is seeing somebody off and the English reads as dispatching them. 丢's 我不能丢下你离开
is "I can't abandon you and go"; "I can't leave without you" says the opposite thing about who goes where.
方便's "convenient to public transportation" is not English anybody writes, and 交通不方便 is about how hard
the place is to reach. 方法's Chinese is active and carries 找到; the English turned it passive and dropped
the finding. 方向's "I've mistaken the direction" is not idiomatic — 搞错 is getting a thing wrong. Three
more went with the sentences above: 发生's "May it not happen!", 而且's "and in addition, it was windy",
and 发展's "high speed development".

**A FALSE POSITIVE, recorded so the next session does not re-derive it.**
`check-gloss-source.js --deck=hsk30l3` names **电梯**: card "lift", dictionary "elevator; escalator". The
card is right. Batch 24 deduped that gloss deliberately — the decks are authored British and the site's
spelling switch never runs in the direction that would rescue an American word — and CC-CEDICT is an
American-English dictionary, so every British word choice in these decks will land in that list for ever.

**Two cards read and deliberately left, with the question recorded.** 懂得's gloss matches CC-CEDICT word
for word ("to understand; to know; to comprehend") and its first two sentences, 我不懂得游泳 and
他们懂得读这几个字吗, use 懂得 + verb for "know how to" — a pattern that is attested but far rarer than
会 in both places. I could not settle whether they are wrong or merely uncommon, so the card stands.
东方's third, 我对东方陶瓷有兴趣, is translated "oriental pottery": faithful to 东方陶瓷 and the
conventional museum term, but a word whose other uses have made it one to avoid. Changing it would be a
judgement about English rather than about the card, and it is recorded rather than made.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2**, unchanged — the six gloss rewrites made no new collision, checked against every
  gloss in the nine decks before they were written
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**, and no finding names a card this batch touched
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0** (see the -logue note above for what that zero does not cover)
- `check-say-reading.js`: unchanged at 10 of 1,503; 发 is correctly not among them
- `check-coarse.js`: **two findings fewer than HEAD, both accounted for** — SLUR 192 → 191 is 而且's
  "I am rich, fat and happy", the sentence dropped as unnatural Chinese, and ADULT 99 → 98 is 段's "for a
  period of time", where the `exEn` that corrected 看 to "watched" incidentally removed a false-positive
  hit on *period*. No category rose.
- answer-leak sets byte-identical to HEAD on both changed decks; 34,596 example blocks, **spoken ==
  visible on every one**; sense tags past the sense list 0; stray spaces 0
- every authored sentence segmented against the 11,532-word deck lexicon: each headword its own token
- `build-lang-decks.js`: re-run, and **exactly two rows changed** — Levels 3 and 6, the two decks touched
- CI fast gate green: `node --check` over every root and `.claude` script, the eight no-browser suites,
  `check-docs`, `check-questions`, `check-style`

### 2026-09-17 — HSK 3 notes 121–150 (放 → 关机), deck order

Thirty notes read card by card, **seventeen changed**, thirteen read and left alone.

**THE BLIND SPOT AGAIN, AND THIS TIME THE SHAPE OF IT IS CLEAR.** Two more cards taught a word their own
sentences do not contain, and both were invisible to `check-example-fit.js` for the same reason. 夫妻's
third sentence was 周末我们全家去吃四川菜，点了麻婆豆腐和夫妻肺片 — **夫妻肺片 is a Sichuan dish**, husband-and-wife
lung slices, and the card's own English said so. 服务's third was 服务生，买单 — **服务生 is a waiter**. In
both the segmenter lands squarely on the headword and reports nothing, because the swallowing compound is
not a headword in these decks. **That is not a gap that closes as the decks grow**: an exam syllabus has no
reason to list a dish or an occupation, so the compounds that do this will keep on being ones the lexicon
has not got. Batches 26, 27 and 28 have each found this class by reading and by nothing else.

**Four sentences whose Chinese was wrong, or read two ways.**

- **封**'s first was 它是封长信 — a classifier straight after 是 with no numeral in front of it, which
  Chinese does not do (一封, 这封), and 它 for a letter besides.
- **感到**'s first, 我为人生感到很开心, is meant as 为 + 人生 and the decks' own segmenter reads 为人 wéirén,
  which is a word. Even read as intended, 为…感到 wants a specific cause rather than life at large; its
  English, "I get a kick out of life", was slang for a sentence carrying none.
- **感兴趣**'s third was 他是对我感兴趣的 — a 是…的 cleft, which singles out WHO he is interested in, under
  the plain English "He was interested in me". The card taught an emphatic construction as the ordinary one.
- **公斤**'s second and third were one question asked twice, 一公斤香蕉多少钱 and 香蕉多少钱一公斤, and the
  third's English — "How much is the kilo of bananas?" — is not English anybody speaks.

**SIX GLOSSES, AND FIVE OF THEM ARE ONE FAULT IN TWO SHAPES.** The do-not-sweep rule on the 1,510
two-part-of-speech notes holds; these were read one at a time, and every one is the genuine residue.

- **The gloss belongs to only one of the parts of speech named.** 服务 said VERB and defined "to serve"
  while its second sentence is the noun and it carries the classifier 项, which counts the noun. 感冒 said
  "noun / verb" with one verb gloss and carries 场 and 次, which count a bout of a cold — batch 26's 带
  exactly. 根据 named THREE parts of speech against "according to", which is the third of them, while two
  of its three sentences are the NOUN. 关 said "noun / verb", defined "to close", and its own third
  sentence 不关你的事 is a different verb the card never glossed at all.
- **The gloss lists NOUNS under a VERB label**, which is CC-CEDICT's slash list run together. 干's gàn
  sense read "trunk; main part; do; work" — 幹 is a tree trunk and the main part of a thing as well as to
  do and to work. 更's gēng sense read "to change, to replace; night watch", and a night watch is one of
  the five divisions the night was formerly kept in. Both split, with the primary reading and the
  polyphone `Say` from the earlier batch untouched.
- **放** was the smallest of them: "to put; set free" changes grammar half way through, an infinitive and
  then a bare imperative. CC-CEDICT gives "to put; to place; to release; to free; to let go".

**Three cards earned an `exSense` and two deliberately did not**, which is 带's rule from batch 26 doing
its work: 服务 divides 1/2/2, 感冒 1/1/2, 关 1/1/2 and 根据 1/3/1, so the tag says something; 干 and the
rest are one sense three times over, where a tag repeating itself says nothing.

**Six English lines that were not the sentence.** 放心's first opened "Come on", which is chivvying
somebody where 放心 is reassuring them, and its third read "You can rely upon his being punctual". 分开's
third turned two questions discussed separately into one question discussed apart from another. 附近's
first wrote "near by" as two words, on the card whose gloss is that adverb. **刚才's first and second
dropped 刚才 altogether** — "I was at home" and "Who is the man that you were talking with" translate the
sentences with the headword taken out, which is the one word the card exists to teach — and the second
made 人 a man. 更's third dropped 比往常, the comparison the sentence is built on. 刮's third said "The
papers blew off" where 刮起来 is being lifted into the air. 干's third supplied a subject 活快干完了 has not
got, and 感冒's third said "It sucks having a cold".

**READ AND LEFT ALONE, with the reasons recorded.** 放's third, 但是他喜欢学校放长假, uses 放 in the
granting-a-holiday sense the gloss covers and segments clean. 放心's second, "You can depend on it" for
你可以尽管放心, is loose but not wrong. 刚刚's second is 刚刚发生了什么, the same sentence 发生 carries — two
cards legitimately sharing one sentence for two different headwords, which `check-senses.js` does not count
and should not. 风's first and 刮's first are that same arrangement. 公园's third is 动物园's second.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2**, unchanged — the six gloss rewrites were checked against every gloss in the nine
  decks before they were written
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**, and no finding names a card this batch touched
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**; `check-say-reading.js` unchanged at 10 of 1,503 — the two polyphone cards
  this batch reglossed keep their `Say`
- `check-coarse.js`: identical to HEAD in all six columns
- answer-leak set byte-identical to HEAD; 34,596 example blocks, **spoken == visible on every one**; sense
  tags past the sense list 0; stray spaces 0
- every authored sentence segmented against the 11,532-word deck lexicon: each headword its own token
- `build-lang-decks.js`: re-run, and **exactly one row changed** — Level 3, the only deck touched
- CI fast gate green: `node --check` over every root and `.claude` script, the eight no-browser suites,
  `check-docs`, `check-questions`, `check-style`

## Batch 29 — `hsk30l3` notes 151–180 (关系 → 或者), and the bare-`afterward` class

Thirty notes read card by card in deck order, **twenty-two changed** and eight read and left alone.
Two of the thirty were single-character cards, and both were the same fault batch 27 found on 东.

**The leading fault is the single-character blind spot, twice in seven notes.** 海 is glossed "sea",
and two of its three sentences used the character without the word: 那里人山人海 is the idiom *a sea
of people* and 你国家的人吃海带吗 is **kelp**. 河 is glossed "river", and two of its three did the
same: 河马 is a **hippopotamus** and 他开了先河 is the idiom *to set a precedent*. So each card left
its reader exactly one sentence using the word it teaches, and on both the wrong two came first.
`check-example-fit.js` skips a single-character headword outright — one character cannot straddle a
boundary — so neither is reportable and neither ever will be. **Three consecutive batches have now
found this class by reading and by nothing else**, and the two new ones are cheaper to find than
batch 27's, because the swallowing compound is printed in the card's own English: a card glossed
"sea" whose English says *kelp* is visible at a glance. That is the thing to scan for on a
single-character card — read the three English lines and ask whether each is about the character.

Both cards took two authored replacements and a `compounds` panel, 换 and 或 took a panel each, and
four single-character cards in these thirty now carry one.

**The second fault is batch 28's residue, unchanged in shape.** Three cards named more parts of
speech, or more senses, than their gloss covered.

- **关系** named *noun / verb* and glossed *relationship*, which is the noun. Its own third sentence,
  不只是钱关系重大, is the verb — *to concern, to matter* — with nothing on the card defining it.
  Split into CC-CEDICT's own two, in its order, `exSense` [1, 1, 2].
- **关注** named one part of speech, *verb*, and its **first** sentence was the noun: 谢谢您的关注,
  "thank you for your attention". `exSense` [2, 1, 1].
- **好多** glossed *many*, and its first sentence 这样好多了 means *much better* — which CC-CEDICT
  lists outright (/many/quite a lot/much better/) and the card did not. **It is not a straddle**: the
  segmenter lands squarely on 好多, so `check-example-fit.js` sees nothing. The sense is recorded
  rather than the sentence dropped, because the sentence is a real and common use of the word —
  though it is worth writing down that most grammars parse 好多了 as 好 + 多了 rather than 好多 + 了,
  and that CC-CEDICT is what settles it here rather than the grammar.

**好多's fix retired a reverse-card hint, and that is a rule rather than an accident.** The card
carried `not 许多`, because both were glossed *many* and the English → Chinese card had two right
answers. A `senses` rewrite REPLACES the English field, so the hint would have been destroyed
silently; the applier's own comment says a note given a distinguishing gloss no longer needs one. The
first sense now reads *many; quite a lot* against 许多's *many*, so the collision is gone on its own
terms and the `hints` row is deleted with it — measured afterwards, still-ambiguous reverse groups
stayed at **2**.

**Three glosses were simply not the commonest sense their own sentences showed.**

- **或者** glossed *perhaps*, and all three of its sentences mean **or** — the commonest sense of one
  of the commonest words in the language, missing from its own card. CC-CEDICT leads with /or/. It is
  glossed *or; either ... or* rather than a bare *or* deliberately: 或, 或是 and 要么 already carry
  the bare word, and the house rule gives a group of three or more distinguishing glosses rather than
  a fourth `not X` hint.
- **回答** glossed *reply*, and all three of its sentences answer a **question**. It is *to answer (a
  question)*, the collocation written into the gloss, because the plain *to answer; to reply* is
  already 应对's gloss word for word.
- **环境** glossed *environment* alone, and two of its three sentences use the wider sense CC-CEDICT
  also gives (/environment/circumstances/surroundings/) — 我适应新环境很慢 and 我需要换个环境, whose
  English read "new situations" and "a change of scenery" and so taught a reader nothing about the
  word on the card. The gloss is widened and the first sentence's English put back on the headword;
  the third is left as it stands, "a change of scenery" being the idiomatic English for it.

**And one gloss was an American spelling, in a family `check-british.js` cannot see.** 后来 was
glossed **afterward** on a card whose own third sentence ends *afterwards*. `SPELL_PAIRS` has no
-ward row at all, so the checker reports 0 over this as happily as over a clean corpus — batch 27's
`-logue` finding in a second family, and the same shape: a class too small to be a table, found by
reading. **Measured over all nine decks the class is three occurrences over two sites**: this gloss,
and one Levels 7–9 sentence which that deck carries on two notes (瓦 and 盘旋 share it), whose English
ended "for a few minutes afterward". All three are repaired here, the two out-of-range ones on batch
27's precedent for a measured class of two. **Grep the -ward, -logue and -ward-like families by hand
after a content batch; the checker covers neither.**

**Three sentences were not grammatical Chinese.**

- **国家**: 你是哪国家？ — 哪 needs its classifier before a noun, and 的 needs a head to hang on. The
  repair keeps what the sentence was teaching, 你是哪个国家的人？
- **黄色**: 红色和黄色和蓝色是颜色。 chains 和 the way English chains *and*, which Chinese does not:
  a list takes 、 between its members and 和 before the last only.
- **或**: 你结婚了或没结婚？ puts 或 in an alternative **question**, which is 还是's job (你结婚了还是
  没结婚？) or the A-not-A form. 或 joins alternatives in a statement. This one is worth keeping in
  mind: the card is *about* the word for "or", so a sentence misusing it teaches the one error the
  card exists to prevent.

**One punctuation repair, and a measurement that stopped it becoming a pass.** 关于's third sentence
wrote its ellipsis as six ASCII full stops where Chinese writes ……. That is the deck-level
punctuation pass's own class — a half-width mark inside a Chinese sentence — and the pass cannot see
it, its table converting , ; : ! ? and pairing quotes with no row for the full stop, which is a
legitimate mark inside a number. **Measured over all nine decks: seven sentences over five decks,
against four that use …… correctly** — so it is not a table, and two of the seven (郊区很安静... and
倾听...) are not sentences at all but truncated fragments needing judgement rather than a substitution.
This one is repaired where it stands with `exSpace`, whose skeleton comparison strips both marks, and
the other six are listed here for the batches that reach them: `hsk30l4` 郊区, `hsk30l5` 难得 /
`hsk30l7` 生平 (one shared sentence), `hsk30l6` 倾听, `hsk30l7` 庙 / 劈 (one shared sentence).

**Seven English lines said something the Chinese does not.** 关心's *"He is careless about money"*
says he is bad with money where 不关心 says he does not care about it. 害怕's *"She never shivers"* is
a translation of something else entirely on a card glossed *afraid*. 好像's *"How fascinating!"*
renders 挺有趣 and drops the headword. 号码's said only "the number" over 电话号码. 画家's called
Picasso an *artist*, which is 艺术家. 欢迎's *"Feel free to stay"* carries the sense and not the word.
会议's made one meeting plural.

**READ AND LEFT ALONE, with the reasons recorded.** 号码's measure word 堆 looks wrong for a number
and is CC-CEDICT's own (CL:堆,個). 好久's *quite a while* matches all three sentences and CC-CEDICT's
"(coll.) for a long time". 合适's first, "It is highly improper" for 这实在不合适, is loose and not
wrong. 河's gloss keeps *river (the general word)*, which an earlier batch wrote to break a
collision. 过节's second carries 慰劳, well above this level, but is a real sentence with a right
translation. **And two of 或者's sentences are left with the question recorded rather than rewritten**:
或者你必须搭这辆公车？ opens a question with 或者, which is attested as a discourse connector and
marginal as a sentence, and 你钱或者信用卡带来没有？ is topic-fronted in a way that is possible in
speech and clumsy on a card. Neither is settled by CC-CEDICT or by the card's own examples, so
neither was touched.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged** — which is the assertion that 好多's retired hint and 或者's new gloss
  were both checked against every gloss in the nine decks before they were written
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**, and no finding names a card this batch touched
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0** — which is exactly the reading it gives over the bare `afterward` this
  batch repaired, and the reason that finding is written down rather than left to the checker
- `check-say-reading.js`: unchanged at 10 of 1,503
- `check-gloss-source.js`: unchanged, and no finding names a card this batch reglossed
- `check-coarse.js`: identical to HEAD in all six columns
- answer-leak set byte-identical to HEAD; 34,596 example blocks, **spoken == visible on every one**; sense
  tags past the sense list 0; stray spaces 0
- every authored sentence segmented against the 11,532-word deck lexicon: each headword its own token,
  and each checked for a duplicate against every sentence and every English line in all nine decks
- `build-lang-decks.js`: re-run, and **exactly two rows changed** — Level 3 and Levels 7–9, the two decks touched
- CI fast gate green: `node --check` over every root and `.claude` script, the eight no-browser suites,
  `check-docs`, `check-questions`, `check-style`

## Batch 30 — `hsk30l3` notes 181–210 (鸡 → 斤), the `programme` class, and a hole in `check-coarse.js`

Thirty notes read card by card in deck order, **sixteen of them changed**, plus eleven notes across
four other decks for a spelling family no checker can see and one note in Levels 7–9 found while
measuring the batch's leading fault. Twenty-seven notes in all; the record goes 7,274 → 7,290 and the
hint map 702 → 701.

**The leading fault is that `check-coarse.js` was excusing an obscene sentence on purpose.** 鸡 is
glossed *chicken* and its second sentence was `我喜欢鸡鸡。` — "I like dicks." 鸡鸡 is the child's word
for the penis, and neither it nor 屌 was in the checker's Chinese lists, so the sweep had never
reported it. Adding the two words is the small half. **The large half is that adding them would not
have been enough**, and that is worth having written down: the checker's `own()` discriminator drops a
hit when the matched term contains the headword *or* the headword contains the matched term, which is
right — it is what stops the Everyday Phrases deck reporting 放屁 on the card that teaches 放屁 — and
**at a one-character headword the first branch is always true.** Every compound built on a character
contains it, including the ones whose meaning the character has nothing to do with, so 鸡 was
permanently exempt from every term beginning 鸡, and would have gone on being exempt after the word
was added to the list. The branch is now required of a headword of more than one character; the other
direction is untouched.

**The cost of that narrowing is measured rather than asserted: twelve rows over ten cards**, every one
a single-character card met through a compound it genuinely is about — 死/去死, 裸/赤裸 (twice), 经/月经,
醉/喝醉, 淹/淹死 (twice), 绞/绞死, 粗/粗俗, 傻/傻子, 聋/聋子, 俗/粗俗. Each was read and left; the totals
move profanity 15 → 16, body 11 → 13, adult 98 → 99, violence 161 → 165 and slur 185 → 189, and
sexual stays at 22 because both sentences the new words would have matched are dropped in this same
commit. **Twelve rows a reader passes over is the right price for the one that must never be missed**,
on a report that is read by eye anyway. The rule is in the script's own header beside the code.

**The same measurement found the second one.** Sweeping the corpus for 屌 turned up `hsk30l7/山寨`,
whose first sentence used 屌丝 — a vulgar internet word for a loser, literally the pubic hair of a
penis — to disparage the users of a **named brand of telephone**. Dropped, and `从前这里是一个山寨。`
authored in its place. Reading the card then showed a second fault the sweep had nothing to do with:
its gloss named *noun / adjective* and defined only the knock-off sense, so the noun the word
originally is — a fortified hill village, a mountain stronghold — was named in the part of speech and
nowhere else. Split, and the three blocks tagged 2 / 2 / 1.

**The third finding is a third spelling family `check-british.js` cannot see.** Batch 27 found
`-logue` and batch 29 `-ward`; this one is `program` / `programme`, and it is invisible for a different
reason from either. It IS in `SPELL_PAIRS`, but as a **one-way** row — British English writes *program*
for a computer program too, so the reverse mapping would make *a television program* out of nothing —
and `check-british.js` correctly excludes the one-way rows, so it goes on reporting 0. Measured over
the nine decks: **twelve sites**, of which eleven are a broadcast or an event and are repaired
(`hsk30l3/节目`, `hsk30l4/观看`, `hsk30l4/值得`, `hsk30l4/篇`, `hsk30l5/不良`, `hsk30l5/收看`,
`hsk30l6/一律`, `hsk30l6/专科`, `hsk30l7/分发`, `hsk30l7/寥寥无几`, `hsk30l7/勤工俭学`), and the twelfth,
`hsk30l5/下载`, is **left alone and is the point of the measurement** — its Chinese is 程序, a computer
program, where *program* is the British spelling as well. **Three batches running have now found a
family this checker is structurally blind to, so grep the one-way rows by hand after a content batch.**

**The glosses.** 接 was glossed **connect**, and not one of its three sentences is *connect* — two are
answering the telephone and one is meeting someone off a train. CC-CEDICT leads *to receive / to answer
(the phone) / to meet or welcome sb* and gives *to connect* fourth, so the card was teaching the
dictionary's fourth sense as its only one, against examples that all show the first two. It is now
"to receive; to answer (the phone)". That retired its `not 连贯` hint: *connect* was never a pair but a
**three-way** collision (接, 连, 连贯), and the house rule gives a group of three or more distinguishing
glosses rather than a disambiguator naming one of the other two — and with 接 out of it, 连 and 连贯 are
the pair the hint machinery is actually for. 借 was "to lend" alone, on a card whose own third sentence
is *borrow* — Chinese does not distinguish the two directions and the card was teaching only one of
them. 极 was glossed **extreme**, the adjective, under an **adverb** label; now *extremely*.

**Two senses splits, and one of them was a label nobody had read.** 急 carried one gloss under
*adjective* covering both the adjective and the verb; split, and the blocks tagged 1 / 2 / 1, its
second sentence 你着什么急 being the verb. **角 is the more useful case.** An earlier batch had given it
its two readings and, in doing so, inherited the deck's own part-of-speech label rather than authoring
one — so the jiǎo half read **measure word** over a gloss beginning "horn; corner". A horn and a corner
are nouns; only the currency unit is a measure word. Split into the noun and the measure word, keeping
the jué sense the earlier fix added, and all three sentences tagged 1, which is what they are. **A
label carried across by a fix aimed at something else is a label that has never been read**, and it is
the shape to expect wherever an earlier batch touched only one field of a card.

**Two more of the single-character class, both mild.** 季's first two sentences are both 雨季, so the
card showed its character inside one compound twice; the duplicate-shaped one was dropped and
`这部电视剧一共有三季。` authored, which is 季 as a free measure word. 加 had 加法 *addition* as its
third, a noun the card does not teach; dropped, and `我们又加了两把椅子。` authored. Neither is
reportable — `check-example-fit.js` skips a one-character headword outright — and neither is as bad as
batch 29's 海 and 河, because in both cases the compound really is built on the sense the card gives.

**Compounds** were authored for **every one of the fourteen single-character cards in the range**, none
of which had any — 鸡, 极, 急, 记, 季, 加, 讲, 角, 脚, 接, 街, 节, 借 and 斤 — every row's
reading and gloss checked against CC-CEDICT, and candidates taken from the corpus where it has them.
On 讲 and 街 that is the whole of the change: both cards' glosses and all six sentences were read and
are right as they stand. **Counting the single-character cards in the range and asserting the count
back is worth doing**, because five of these were missed on the batch's first pass — the cards that
needed a gloss or a sense split got the attention and the ones that needed only compounds were the
ones left out, which is exactly the wrong way round.

**Five English lines repaired, and two of them contradicted their own card.** 极's `真是惊人至极` read
"It was all more and more surprising", which is not what 至极 says; it is now "It was utterly
astonishing". 记's `我会记下来` read "I'll keep it", which drops the 记 the card is about; now "I'll
note it down". **脚's `人有两只脚` read "People have two legs"** on a card glossed *foot* — the one
English line a reader checks the gloss against was giving a different part of the body. And **斤's
second called a 斤 a pound**, on a card whose own gloss says half a kilogram: a 斤 is 500 g and a pound
454, so the sentence was contradicting the card two lines above it. And 假期's third read "on my time
off", which carries the sense and not the word the card teaches.

**What was read and left, and why.**

- **节** keeps all three sentences although none of them is the *festival* sense its gloss names first.
  Its first two are the measure word for lessons and its third is 节食, which is genuinely the verb
  sense *to restrain, to economise* — so every sentence uses the word, and the gap is that the noun
  senses have no sentence rather than that any sentence is wrong. Authoring two more would push the
  card past three; the honest fix is a later pass that decides which sense a three-sentence card owes
  its space to, and that is not a judgement to make one card at a time.
- **斤's third sentence says "catty"** where the first two say "half a kilo". Both are right — *catty*
  is the standard English name for the unit — and a reader meeting both learns something. Left.
- **几乎's first sentence** (`他几乎不来。` / "He seldom, if ever, comes.") is a loose translation of a
  Chinese sentence that literally says *he almost doesn't come*. It is idiomatic English and the
  Chinese is natural; whether the pair teaches 几乎 well is a judgement CC-CEDICT and the card cannot
  settle, so it is recorded rather than changed.
- **检查's third** (`我想让你接受超声检查。`) uses the word inside 超声检查 rather than alone, but that is
  a two-character headword the segmenter passes, and the compound is transparently *ultrasound* +
  *examination*. Left.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged** — which is the assertion that 接's retired hint was checked against
  every gloss in the nine decks before it was deleted
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**, and no finding names a card this batch touched
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**, which is the reading it gives over the eleven `program` sites this batch
  repaired, and the reason that class is written down rather than left to the checker
- `check-say-reading.js`: unchanged at 10 of 1,503
- `check-gloss-source.js`: unchanged, and no finding names a card this batch reglossed
- `check-coarse.js`: profanity 16, sexual 22, body 13, adult 99, violence 165, slur 189 — the deltas
  from the `own()` narrowing above, each row diffed against HEAD and read
- answer-leak set **byte-identical to HEAD on all five touched decks**; 34,596 example blocks, spoken ==
  visible on every one; sense tags past the sense list 0; stray spaces 0
- every authored sentence segmented against the 11,532-word deck lexicon: each headword its own token,
  and each checked for a duplicate against every sentence and every English line in all nine decks
- `build-lang-decks.js`: re-run, and **exactly five rows changed**, the five decks touched, each by its
  `bytes` and `rev` alone
- CI fast gate green: `node --check` over every root and `.claude` script, the eight no-browser suites,
  `check-docs`, `check-questions`, `check-style`

## Batch 31 — `hsk30l3` notes 211–240 (经过 → 老人)

Thirty notes read card by card in deck order, **twenty changed** and ten read and left alone. Eleven
of the thirty are single-character cards and none of them had a `Compounds` block; all eleven have one
now, which is most of the count.

**The leading fault is four English lines that translate something other than their own Chinese**, and
every one of them is invisible to every checker here: the sentence is grammatical, it segments, it
speaks, and the English is a fluent English sentence — it is simply about something else.

- **可** was wrong twice on one card. `你可不年轻。` was given as "You can't be young", which reads the
  emphatic 可 as the modal — the sentence says the reverse, that the person is *certainly not* young,
  and ADVERB is the card's own first label. `这件事非同小可。` was given as "Our goose is cooked", an
  English idiom that translates nothing in it (非同小可 is *this is no small matter*).
- **可爱** was wrong backwards. `说她美不如说她可爱。` says that 可爱 fits her better than 美 does, and
  the card read "She is more pretty than beautiful" — which reverses the comparison AND renders the
  headword as *pretty*, which is 美's word. Its third sentence did the same substitution. **A card
  glossed "lovely" whose own English says *pretty* twice is batch 29's rule** — read the English lines
  and ask whether each is about the word.
- **渴**'s `我不太渴了。` was put in the past ("I wasn't very thirsty") where the 了 marks a change of
  state in the present, which also made it a near-duplicate of the card's third line.
- **来自**'s `我来自中国。` was "I came from China", a past tense on a stative verb — and the card's
  other two sentences render it correctly, so one line was out of step with its own card.

**Three sentences were dropped and replaced, and two of the three were the single-character blind spot
again.** 可's `我可以来吗？` is 可以, the compound, on a card about the bare character; 刻's
`他们需要做决定——即刻作出决定。` is 即刻, where 刻 is bound. Both are beyond `check-example-fit.js`,
which skips a one-character headword by design, and **that is now five consecutive batches in which
this class has been found by reading and by nothing else.** The third is a plain Chinese error:
**开花**'s `正在开花桃树很美。` needs 的 before the noun (正在开花**的**桃树) and without it does not
parse, while its English described a third thing again. Two more sentences went for being useless
rather than wrong — 句子's "Where is my sentence?" and 可是's `你还年轻，可是没有永久。`, whose Chinese
predicate is not a predicate.

**可 and 刻 came out of it with a sentence for each of their senses**, which neither had before. 可
names adverb, conjunction and verb and showed only the adverb; 刻 names the verb *to carve*, the
measure word and the noun *moment*, and showed the last two. Both now run 1 / 2 / 3 and carry the tags.

**Three glosses named a part of speech they did not define** — batch 28's residue, and this range
holds three of them in thirty cards. **经过** read "pass through" under NOUN / VERB, with the
classifier 个 counting the noun (*the course of events*) that nothing defined; **决定** read "decide"
under NOUN / VERB with 个 and 项 counting *a decision*; **卡** read "card, calorie" as one gloss, which
is CC-CEDICT's slash list run together, so one prompt tested two different English words. All three
are split, and their sentences tagged — which says the useful half out loud: **every one of those nine
sentences is the second sense, or the first, and the other sense has none.**

**Two more glosses were the wrong one of two.** **开机** was glossed "to start an engine", which is
CC-CEDICT's first sense and is not what any of the card's three sentences shows — they are a computer
twice and a telephone once, which is the dictionary's second sense. **久** was glossed "long time", a
NOUN PHRASE under an ADJECTIVE label, where the dictionary reads "(of a period of time) long". And
**看来** was labelled a VERB over the gloss "apparently": the label and the gloss were different parts
of speech on one line, and the dictionary gives no verb sense at all.

**One sentence's whole fault was a missing full stop** — 旧's `这个商店卖旧书`, a plain declarative with
no terminal mark, which the deck-level punctuation pass cannot supply (it converts marks and never adds
one). That is what `exStop` is for. Measured over the nine decks, **184 sentences still end bare**, and
most of them are not this shape: a line closing on a quotation mark, a sign, a fragment.

**Compounds** were authored for **all eleven single-character cards in the range** — 久, 酒, 旧, 句, 卡,
可, 渴, 刻, 哭, 蓝, 老 — every row's reading and gloss checked against CC-CEDICT, and the candidates
taken from the corpus wherever it has them (31 of the 42 rows are words these decks already teach).

**What was read and left, and why.**

- **课文**'s `用自己的语言把课文内容复述。` wants a complement after the verb — 复述**一遍** — a 把
  sentence not usually taking a bare disyllabic verb. It is marked rather than plainly wrong, and
  replacing a sentence I merely find awkward is a larger claim than the evidence carries, so it is
  **recorded as a question rather than changed**.
- **空调**'s `室外的空调很便宜。` ("External air conditioners are quite cheap") is a strange thing to
  say and is not incorrect; the outdoor unit really is called that. Left.
- **客人**'s `做我的客人吧。` is a calque of the English "Be my guest", which in English means *go
  ahead* rather than *be my guest*. Whether the Chinese is idiomatic is a judgement CC-CEDICT and the
  card cannot settle. Recorded.
- **句**'s first sentence, `说句简单的话。`, is also 简单's third. Two cards sharing one sentence is not
  what `check-senses.js` measures (that is the same sentence twice on ONE card) and is not a fault: the
  sentence teaches a different word on each.
- **判断 is glossed "to decide"**, which is the gloss 决定's verb sense now also carries. They do not
  collide as whole cards — 决定's reverse front shows both its senses — and the coverage checker's
  still-ambiguous count is unmoved at 2. But 判断 is *to judge, to determine* rather than *to decide*,
  and it is outside this batch's range. **Recorded for whichever batch reaches `hsk30l4`.**

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged** — which is what says the three sense splits did not make a collision
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**, and no finding names a card this batch touched; all nine of
  its Level 3 findings are the greedy segmenter losing to a negator or a modifier (不|安全 read as 不安|全)
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**
- `check-say-reading.js`: unchanged
- `check-gloss-source.js`: **3 neighbour findings and 4 reading findings, unchanged**, and none names a
  card this batch reglossed — they are the read-and-left residue of the batch that closed that list
- `check-coarse.js`: identical to HEAD in all six columns
- answer-leak set byte-identical to HEAD; 34,596 example blocks, spoken == visible on every one; sense
  tags past the sense list 0; stray spaces 0
- every authored sentence segmented against the 11,532-word deck lexicon: each headword its own token,
  and each checked for a duplicate against every sentence and every English line in all nine decks
- `build-lang-decks.js`: re-run, and **exactly one row changed**, Level 3, by its `bytes` and `rev` alone
- CI fast gate green: `node --check` over every root and `.claude` script, the eight no-browser suites,
  `check-docs`, `check-questions`, `check-style`

## Batch 32 — `hsk30l3` notes 241–270 (离开 → 南方), and the whole one-way-row class

Thirty notes read card by card in deck order, **twenty-one changed and nine read and left alone**, plus
nineteen cards outside the range taken by the sweep this batch's own cards started — **forty cards in
all**.

**THE LEADING FINDING IS A RULE RATHER THAN A CARD, AND IT CLOSES THREE EARLIER BATCHES' LOOSE ENDS.**
Batches 27, 29 and 30 each found one small family of American spellings that `check-british.js` cannot
see — `-logue`, `-ward`, `programme` — and each was written up as its own curiosity. It is not a
curiosity: `SPELL_PAIRS` carries **twelve ONE-WAY rows over seven families** (`metre`, `mediaeval`,
`licence`, `practis`, `storey`, `catalogue`, `programme`), the checker excludes every one of them
correctly — reversing them would make a parking METRE, the noun PRACTISE, a two-storey novel and a
television programme out of nothing — and it therefore **reads 0 over all seven whatever the decks
contain**. The site's own switch runs one way from authored British, so an American spelling inside one
of those families is not merely unconverted: it is what BOTH readers see, for ever.

All seven were swept by hand. **Thirty-three sites over twenty-two cards; thirty-two repaired and one
left.**

- **metre — 12 sites over 10 cards**, and three of those cards CONTRADICTED THEMSELVES: 平方米 glossed
  *square meter* over a sentence reading *square metres*, 立方米 glossed *Cubic meter* over three
  sentences reading *cubic metres*, 冲刺 saying *100-meter* in its first sentence and *hundred metres*
  in its second. The American form was the minority inside its own card.
- **the one site left is the DEVICE**: 收费's *parking meter*, which is spelled `meter` in British
  English too. That is exactly why the row is one-way, and it is the whole reason this had to be a
  reading rather than a table row.
- **practise — 10 sites over 6 cards**, all of them the VERB. The noun is `practice` in both dialects,
  so the **other thirty-six** sites where the corpus writes *in practice*, *common practice*, *out of
  practice* and *the usual practice* are correct and were left. 练 was glossed *to practice, to train, to drill*
  — CC-CEDICT verbatim, American spelling and all — **while the very next card in the deck, 练习, already
  read "to practise"**, so two adjacent cards disagreed about how to spell the verb they share.
- **licence — 9 sites over 4 cards**, all of them the noun; there is no verb use of `license` anywhere
  in the corpus. Eight are the two phrases *driver's license* and *license plate*, which went into the
  deck-level LEXIS table as three new rows (the British is a different phrase besides — a *driver's
  license* is a *driving licence*, which no word-for-word swap reaches). **牌照 and 驾照 contradicted
  themselves here too**, each glossing *license* over a sentence already reading *licence*. The ninth
  site is 执照's bare gloss, which carries neither phrase and took a per-note row.
- **storey — 1 site in all nine decks**: Level-2 楼, glossed *multi-storied building*. The corpus
  already writes *storeys* and *single-storey* correctly everywhere else.
- **catalogue and mediaeval — 0.** The corpus writes `catalogue` twice and never `medieval`.

**AND THE FAMILY THE TABLE LEAVES OUT ALTOGETHER IS IN THIS RANGE.** 路边 was glossed **"curb**;
roadside; wayside", CC-CEDICT verbatim — and `kerb` is **EXCLUDED FROM `SPELL_PAIRS` BY NAME**, because
`curb` is also an ordinary English verb, so neither the site's table nor the checker can reach it at
all. The word was dropped rather than respelled: 路边 is the side of the road, which is what all three
of the card's own sentences say, where a kerb is the stone edge of it (路缘石). **So a reading of 0 from
`check-british.js` says nothing about a word whose two spellings are not two-way, and nothing at all
about a word the table has never held.** Four batches running have now found a family it cannot see;
this is the batch that measured the whole set rather than one more member of it.

**THE SINGLE-CHARACTER BLIND SPOT, FOR THE SIXTH BATCH RUNNING.** Two of the range's nine
single-character cards showed a sentence in which their character is not the word:

- **聊**'s `不，我没有时间闲聊。` teaches 闲聊, a CC-CEDICT word in its own right, on a card about the
  bare character.
- **南**'s `我听说南西很漂亮。` is about **NANCY** — 南西 being a transliteration of the name — so a card
  glossed *south* opened on a sentence with no south in it. This is batch 27's 东 class exactly, and
  batch 29's test says it at a glance: the English line reads "I hear that Nancy is very pretty", which
  is not about a compass direction.

`check-example-fit.js` skips a one-character headword by design and is blind to a compound its own
lexicon does not hold, so both were found by reading and by nothing else.

**A REGIONAL WORD FORM, AND THE MEASUREMENT BEHIND IT.** 留学生's first sentence read
`我是义大利留学生。` — **义大利 is the Taiwan form of Italy**, where these decks write 意大利 in eight
other sentences. The Chinese had to change, which `exSpace` cannot do (its guard refuses any row that
alters a character), so the block was rebuilt; the English went with it, 留学生 being an overseas or
international student where an exchange student is 交换生.
**The wider class was measured and deliberately NOT swept**: twelve sentences across the nine decks
carry a Taiwan form against a mainland majority — 网路 2 (网络 24), 资讯 3 (信息 28), 软体 1 (软件 23),
计程车 1 (出租车 12), 脚踏车 1 (自行车 26), 马铃薯 1 (土豆 8), 公尺 2 (米 109), 义大利 1, now 0.
**Three of the twelve are not a fault at all**: 资讯 is itself a Levels 7–9 HEADWORD, so its own three
sentences are the deck teaching the word on purpose. Of the rest, 马铃薯 is standard mainland usage for
the potato and 公尺 is ordinary in technical mainland writing, so the honest residue is about five
sentences in four other decks. **Each needs a `dropEx` plus an authored replacement**, which throws away
the generator's structure line, and none of them is wrong Chinese — so this is recorded for a batch that
reaches those decks rather than swept from here.

**FIVE GLOSSES NAMED A PART OF SPEECH THEY DID NOT DEFINE, OR WERE LABELLED AS ONE THEY ARE NOT.**

- **满意** was labelled a **VERB** over "pleased; satisfied", two adjectives, and all three of its
  sentences are adjectival. The decks label a stative verb an adjective everywhere else — 高兴, 开心,
  舒服, 方便 — so the label was the odd one rather than the gloss. Batch 31's 看来 exactly.
- **练习** read "noun / verb — to practise" with the measure word 个 counting the noun nothing named;
  split, and its weakest sentence (`她在开始练习`, a progressive on an inchoative) replaced by one
  showing the exercise.
- **明白** read "verb / adjective — to understand" with all three sentences the verb, two of them saying
  much the same thing; split, and the third replaced.
- **米** was labelled a **MEASURE WORD** over "rice; metre" — and rice is a noun. The two halves are not
  even the same part of speech.
- **难**'s second reading read "nàn — noun — disaster, calamity; to blame", and *to blame* is a verb.
  The label was widened rather than the gloss cut, both parts being real.

All five now carry their senses separately with the examples tagged. **难's three sentences are all the
nán reading and are tagged so**, the nàn reading being shown by its compounds — 灾难 and 遇难 — rather
than by a sentence forced onto a card with no room for one; **凉快** likewise gained the verb sense
(*to cool off*) its third sentence had been showing under an adjective label.

**A COARSE SENTENCE TEACHING NEITHER OF ITS CARD'S SENSES, AND `check-coarse.js` DOES NOT NAME IT.**
毛's `你看个毛呢？` is the slang 个毛 — "what the hell are you looking at?" — where the card gives the
noun *hair* and the measure word for a tenth of a yuan. **"What the hell" is in none of the checker's
six lists**, so this was found by reading; and the replacement is the first sentence on the card to show
the money sense plainly, that sense having been carried only by an idiom (半毛钱关系) whose English says
neither hair nor cents.

**A `not <other word>` BLOCK POINTING AT A WORD THAT NO LONGER SHARES THE GLOSS — a new finding list,
and this batch made one of them.** Giving 凉快 its own two senses ended its collision with 凉爽, and the
applier drops a re-glossed note's OWN hint automatically — but the PARTNER's hint is left standing,
because `hints` is a static map here rather than being regenerated from the finished decks. 凉爽 was
therefore telling the reader "not 凉快" about a word it no longer shares a meaning with, which is worse
than no hint at all, a reader taking it for a real distinction. Removing one is not just deleting the
`hints` key: the block is already written into the deck and **the applier is deliberately NOT
authoritative for hints** — 104 of them are the generator's own and a blanket strip would delete those —
so it needs a `gloss` row, which rebuilds the note's English field. 凉爽 got one ("cool and refreshing",
which is CC-CEDICT's own wording and what the card's first sentence already says).

**Swept over all nine decks, comparing each hint's target gloss with its own, case-folded, there are
14 such orphans and 13 of them are pre-existing** — each a card whose partner an earlier batch
re-glossed:

> 书 (not 本子) · 外边 (not 外) · 顺利 (not 通顺) · 许多 (not 好多) · 演出 (not 表演) · 正确 (not 不错) ·
> 不良 (not 坏) · 动手 (not 上班) · 情感 (not 感情) · 体力 (not 力气) · 骨头 (not 骨骼) · 草坪 (not 草地) ·
> 连贯 (not 接)

**Eleven of the thirteen carry a record-owned hint and can be cleared with a `gloss` row each; two —
顺利 and 体力 — carry the GENERATOR's own block, which nothing in this record can remove**, and would
need the applier to learn a rule it does not have. Recorded rather than swept: it is a finding list of
its own and belongs in a batch that can read all thirteen cards. (**A case-INSENSITIVE comparison is
what makes this measurable** — comparing byte-for-byte reports 202, of which 188 differ from their
partner only by a capital letter, which the coverage checker's own grouping folds away.)

**Three more English lines translated something other than their own Chinese** — batch 31's class, and
it is now in every batch:

- **难**'s `生意真难做！` was given as **"Man is business difficult!"**, which is not an English sentence
  at all: the interjection and the subject had changed places.
- **礼物**'s `他没送那个礼物给他。` was "He didn't **send** him that present" — 送 a present is to GIVE
  one.
- **了解**'s `我应该怎么去了解？` was "How am I supposed to **know**?", which is 我怎么知道; 去了解 asks
  how one is to FIND OUT, and that verb is the whole point of the sentence.

**One sentence's whole fault was a missing question mark.** 了解's `你了解它吗` simply stops — one of the
~180 the corpus-wide punctuation pass deliberately left, that pass converting marks and never adding
one. It is the second use of `exStop` and the first to need a mark other than a full stop: the sentence
is a 吗-question, so the row names ？ explicitly.

**One sentence was not grammatical.** 名单's `你的名字已经从名单删除了。` wants a localizer after the
noun — 从名单**上**删掉, 从名单**中**删除 — and without one the 从 phrase has nothing to take its object
from.

**Three glosses were the dictionary's own first word where the card's sentences all show another.**
**名人** read "personage", an archaism, where all three of its English lines say celebrity or famous
people; **楼梯** read "stair", which is one step, where 楼梯 is the flight and both of its sentences say
stairs; **路口** read "crossing" alone, thin enough to be read as 人行横道, where its own sentences say
junction and railway crossing.

**Compounds** were authored for **eight of the range's nine single-character cards** — 脸, 练, 聊, 马,
毛, 米, 南, 难 — every row's reading and gloss checked against CC-CEDICT, and the candidates taken from
the corpus wherever it has them. **The ninth, 辆, gets none, and that is the finding rather than an
omission**: CC-CEDICT holds exactly four entries containing the character and three of them are built on
the fourth (车辆, plus 机动车辆 and 装甲车辆). It is a bound measure word with no compound family, so a
`Compounds` block would be one row long, which says less than no block at all.

**What was read and left, and why.**

- **离开, 历史, 聊天儿, 马路, 马上, 面前, 南方** are right as they stand. 面前's "in front of" under a
  NOUN label is CC-CEDICT's own gloss and the shape the decks give every localizer, so it is the
  house form rather than the mismatch class above.
- **邻居** is one of the coverage checker's two remaining ambiguous groups ("noun neighbour" → 邻居,
  街坊), and **the imprecise half is 街坊, which is in Levels 7–9**: CC-CEDICT reads "neighborhood;
  neighbor" and the word is colloquial, so a gloss of "(coll.) neighbour; the neighbourhood" would close
  the group in one line. 邻居's own "neighbour" is exactly right and there is nothing to do to it.
  **Recorded for whichever batch reaches `hsk30l7`.** (The other group, "noun colour" → 颜色 / 彩色, wants
  the same treatment on 彩色 in Level 5 — CC-CEDICT's "color; multicoloured", i.e. colour as against
  black-and-white.)
- **练**'s `你今天早上有练弹钢琴吗？` uses 有 + verb as a perfective interrogative, which is ordinary in
  Taiwan and southern speech and non-standard in mainland Putonghua, where it would be 你今天早上练钢琴
  了吗. Whether an HSK deck should carry it is a judgement CC-CEDICT and the card cannot settle, and
  replacing a sentence I merely find regional is a larger claim than the evidence carries.
  **Recorded as a question rather than changed.**
- **楼梯**'s `这节楼梯吱吱响。` counts the stairs with 节 where 段 is commoner. Not confident enough to
  call it wrong. Recorded.
- **名单**'s first and third sentences are different constructions (存在句 against 不在) saying the same
  thing, and their English lines are near-identical — "Her name wasn't on the list" / "His name is not on
  the list". `check-senses.js` measures only an EXACT duplicate on one card, so it names neither. Left,
  the two constructions being worth teaching; recorded because a reader sees the English.
- **满意**'s `你老是不满意！` is `check-example-fit.js`'s standing false positive — 不满意 read as 不满|意,
  the greedy segmenter losing to a negator. All nine of its Level-3 findings are that shape.
- **句**-style sharing: 马上's first sentence is also 离开's. Batch 31 settled that two cards sharing a
  sentence is not a fault — the sentence teaches a different word on each.
- Three faults were seen **outside the range while sweeping it** and are recorded rather than fixed:
  **教练** (Level 4) is glossed "noun — train; drill; (sports) coach", a NOUN label over two verb
  glosses, where CC-CEDICT gives "to coach; to train / instructor; sports coach"; **执照** (Levels 7–9)
  illustrates itself three times with 驾驶执照 and nothing else; and **业** (Level 6) carries
  `让他们受业（于我们）`, a fragment in full-width brackets.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged** — which is what says the five sense splits made no new collision, and
  the disambiguated groups went 337 → 336 as 凉快/凉爽 stopped being a group at all
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**, and no finding names a card this batch touched
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**, none of them in Level 3
- `check-british.js`: **0** — which is the reading it gives over the thirty-two sites this batch
  repaired, and the reason the whole class is written down here rather than left to the checker
- `check-say-reading.js`: unchanged at 10 of 1,503
- `check-coarse.js`: **identical to HEAD in all six columns** (profanity 16, sexual 22, body 13, adult 99,
  violence 165, slur 189)
- `check-gloss-source.js`: neighbour findings **3, unchanged**; the overlap list moved by three and every
  one was read — 练习 came OUT (its split gloss now matches the dictionary's "to practice/exercise/drill"),
  and 驾照 and 弄虚作假 went IN because *driving licence* and *practise deceit* share no token with an
  American dictionary's *driver's license* and *practice fraud*. That is the same artefact the list
  already holds for 电梯/lift, 数学/maths and 邻居/neighbour, not a fault
- answer-leak set **byte-identical to HEAD**; 34,596 example blocks, spoken == visible on every one;
  sense tags past the sense list 0; stray spaces 0
- every authored sentence segmented against the 11,532-word deck lexicon: each headword its own token,
  and each checked for a duplicate against every sentence and every English line in all nine decks
- `build-lang-decks.js`: re-run, and **exactly six rows changed**, the six decks touched, each by its
  `bytes` and `rev` alone
- CI fast gate green: `node --check` over every root and `.claude` script, the eight no-browser suites,
  `check-docs`, `check-questions`, `check-style`

## Batch 33 — hsk30l3 notes 271–300 (难过 → 前天), and the six characters whose panel is empty

Thirty notes read in deck order, **eighteen cards changed** across 43 fields. Nothing outside
`hsk30l3` moved, and no app change was needed — the `Compounds` field has been on this deck's type
since the batch that introduced it, and 54 of its cards already carried one.

**THE BATCH'S FINDING IS ABOUT THE TAP PANEL, AND IT IS A FACT ABOUT THE DECKS RATHER THAN ABOUT ANY
CARD.** `openCharWin` reads `data-ucdeck` off the card wrapper and searches **that deck alone**, which
is right — a reader who has downloaded Level 3 has Level 3 — and it means a character's panel is only
as full as the level it is taught at. Six of these thirty notes are a single character, and measured
over `hsk30l3` their panels show:

| character | words in the collection | words in **its own deck** |
|---|---|---|
| 牛 | 6 (牛奶 L1, 牛仔裤 L5, 吹牛 L7–9, 对牛弹琴 L7–9, 钻牛角尖 idioms, 杀鸡焉用牛刀 phrases) | **0** |
| 爬 | 0 | **0** |
| 怕 | 7 (害怕 L3, 恐怕 L4, 可怕 L5, 哪怕 L5, 只怕 phrases, 生怕 L7–9, 担惊受怕 idioms) | **1** |
| 胖 | 2 (肥胖 L6, 胖乎乎 L7–9) | **0** |
| 骑 | 0 | **0** |
| 起 | 36 | **1** (起飞) |

So 怕 and 起 — the two characters the collection builds most on — are exactly as bare to a Level 3
reader as 爬 and 骑, which the nine decks genuinely have nothing for. **A count taken over the whole
collection answers a question nobody is asking**: the earlier compounds work quoted "639 of those 1,503
characters have no other word in their own deck at all", and the true figure for a reader is worse than
that, because the collection-wide count hides every character whose relatives are all a level or two
further on. All six were given four or five authored rows, each row's reading and gloss checked against
CC-CEDICT before it was written. 怕 and 起 take the words their own relatives are (害怕 / 恐怕 / 可怕 /
哪怕; 起床 / 一起 / 起来 / 对不起 / 引起) precisely because the reader cannot reach any of them from
this deck; 牛 deliberately goes elsewhere, to 牛肉 and 蜗牛, which the collection has no card for at all.

**FOUR GLOSSES WERE THE DICTIONARY'S OWN SENSES IN THE WRONG ORDER FOR THIS CARD** — batch 31's 开机
finding, four more times.

- **难过** was glossed *have a hard time*, which is the **third** of CC-CEDICT's three senses ("to feel
  sad; to feel unwell; (of life) to be difficult"), while its three sentences are *I know you're upset*,
  *Are you sad?* and *When we are very sad, we will cry*. Now **sad; upset**.
- **盘子** was glossed *tray*, CC-CEDICT's **first** of "tray; plate; dish" — over three sentences about
  washing the dishes, where the plates are, and a dirty plate. Now **plate; dish**. `check-gloss-source.js`
  cannot see either of these two in its overlap list, *tray* and *have a hard time* both being words the
  dictionary entry really contains; 难过 was in its **neighbour** list and 盘子 in neither.
- **男生** and **女生** gave only *schoolboy* / *schoolgirl* while their own six English lines say *boy*,
  *boys*, *boy*, *girl*, *girl*, *girls* — so the card's own translations contradicted its definition.
  Widened to what the dictionary records and the sentences use.
- **努力** was labelled *verb / adjective* over the single gloss *hardworking*, which is the adjective
  alone, while two of its three sentences are the verb and the third nominalises it (*his efforts*). Now
  **to work hard; to strive; hardworking**. It and 难过 were both in `check-gloss-source.js`'s overlap
  list and have come off it.

**TWO CARDS NAMED A SENSE THEY NEVER GAVE.** **难听** gave *unpleasant to hear* and its second sentence
is 难听的话 — words that are coarse or hurtful, the other sense CC-CEDICT records — so it is split and
the three sentences tagged 1 / 2 / 1. **怕** was labelled *verb / adverb* and answered by the verb
alone; split into "to fear; to be afraid of" and "perhaps; I'm afraid that". That split paid for itself
twice, because the card's third sentence 没什么好怕的 ("There's nothing to be afraid of") said in English
almost exactly what its second said ("I'm not afraid of anything"), so it is replaced by an authored
他怕是不会来了 and tagged as sense 2. **起** keeps the senses an earlier batch split out and gains the
tags that split never wrote: all three sentences are the verb, so the measure-word sense is **stated and
not illustrated**, there being no room for a fourth block — which is the honest state and is now visible
to the reader rather than left to be guessed.

**TWO SENTENCES DID NOT CONTAIN THEIR HEADWORD AT ALL**, the class `check-example-fit.js` is blind to
because the segmenter lands squarely on the longer word.

- **汽车** opened on 哪里坐公共汽车？ — which is about a **bus**. 公共汽车 is its own word with its own
  dictionary entry, and the card teaches 汽车, a car.
- **前年** opened on 我大前年死了个朋友。 — which is about **大前年**, three years ago, also a word of its
  own. The English ("Two years before last") was a correct translation of the sentence and a wrong one
  for the card. It was the note's only generator sentence, so the replacement joins the two an earlier
  batch had already authored, and all three of this card's examples are now authored.

**THREE SENTENCES WERE TRANSLATIONESE.** 平时's was 结果是英国人平时没问题听得懂外国人说的话。 — it
opens on 结果是 and runs 没问题 straight into 听得懂; it is an English sentence with Chinese words in it.
其实's was 你其实有没有看过？, which puts 其实 inside a 有没有 question where the word has nothing to
contrast with, and whose English rendered it as "at all". 牛's was 牛供给我们好奶。 — 供给 is
institutional supply and 好奶 is not a collocation Chinese has. All three replaced by authored sentences,
and two of the three deliberately use a measure word the card itself lists (头 for 牛, 辆 for 汽车).

**瓶子 SHOWED ONE ENGLISH LINE TWICE.** 请打开瓶子。 and 把瓶子打开。 were "Please open the bottle." and
"Open the bottle." — `check-senses.js` cannot see it, the two English strings not being identical. The 把
construction is worth teaching, so the first is kept and the bare one replaced.

**FOUR ENGLISH LINES DID NOT RENDER THE HEADWORD.** 爬到桌子底下去。 read *Get under the table*, which
is the sentence with its headword taken out; 他喜欢骑马出行。 read *He likes to get on the horse and go
out*, the Chinese word by word rather than a translation of it; 你的飞机什么时候起飞呢？ read *What time
is your plane?*, which asks a different question; and 难听's 比尔生气了并用难听的话骂迪克。 read *Bill
got mad and called Dick names*, in which neither 难听 nor its sense appears. All four fixed with `exEn`,
the Chinese untouched. The last one has an incidental: `check-coarse.js`'s slur column went **194 → 193**
because "got mad" left with it.

**WHAT WAS READ AND LEFT.**

- **平时's gloss stays *ordinarily*.** It is CC-CEDICT's own first sense and it is correct; widening it
  to "ordinarily; usually" — which is what its three English lines say — would have walked it into
  **平常**, four decks along, which already reads *ordinarily; generally; usually*. A gloss made more
  accurate at the price of a new reverse-card collision is not an improvement, and only the sentence
  needed replacing.
- **牛's 你喜欢吃牛肉面吗？ stays**, although its English says *beef* and never *cow*. 牛肉 is
  transparently cow-meat and the character is doing its own work there, which is batch 27's 短发-on-短
  case rather than its 东-as-东西 case. The card's other two lines are about cattle, so two of three are
  squarely about the character and the third is compositional.
- **男人, 难看, 难题, 年级, 年轻, 女人, 拍照, 胖, 啤酒, 奇怪, 其他, 铅笔, 前天** were read and are
  right as they stand: gloss matching the dictionary's leading sense and the card's own sentences,
  three distinct constructions, natural Chinese, and the pinyin clean against the bopomofo. 女人 and
  年级 already carry an earlier batch's authored gloss, and 男生, 女生, 难题, 难听, 起 and 前年 already
  carry earlier batches' measure words, senses and examples.
- **`check-example-fit.js` reports two cards in this range and both are false positives.** 年级's
  你的妹妹念几年级？ segments 几年|级 because greedy longest-match prefers 几年; 年级 is intact.
  奇怪's 这些人好奇怪。 segments 好奇|怪 for the same reason — 好 is the intensifier and 好奇 (curious)
  wins the match. Neither is a fault and neither should be repaired.
- **`check-say-reading.js` names none of the six single-character cards**, so 牛, 爬, 怕, 胖, 骑 and 起
  all teach the reading a speech engine will give them, and none needs a `Say`.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged**, and the shared-gloss groups **338 both before and after** with no group
  created and none dissolved — which is what says four re-glossings and two sense splits made no new
  collision, checked group by group against HEAD rather than by the totals alone
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged** (the two findings in range are the false positives above)
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**
- `check-say-reading.js`: unchanged at 10 of 1,503
- `check-coarse.js`: **identical to HEAD but for one line** — slur 194 → 193, the "got mad" this batch
  rewrote; the other five columns byte-identical
- `check-gloss-source.js`: neighbour findings **3, unchanged**; the overlap list went 1,032 → 1,030,
  exactly 难过 and 努力 coming off it and nothing going on
- 34,596 example blocks, **spoken == visible on every one**; sense-tagged blocks 296 → 305, which is the
  nine this batch wrote and no more
- every authored sentence segmented against the 11,532-word deck lexicon: each headword its own token,
  and each checked for a duplicate against every sentence and every English line in all nine decks
- `build-lang-decks.js`: re-run, and **exactly one row changed**, `hsk30l3`, by its `bytes` and `rev`
  alone — verified field by field against HEAD
- CI fast gate green: `node --check` over every root and `.claude` script, the eight no-browser suites,
  `check-docs`, `check-questions`, `check-style`

## Batch 34 — hsk30l3 notes 301–330 (清楚 → 收), and the whole MAD class

Thirty notes read in deck order, **twenty-two cards changed** across 44 fields — nineteen in range and
three in other decks, which are one measured class closed in a single pass. No app change: the
`Compounds` field has been on this deck's type since the batch that added it.

**BATCH 33'S FINDING AT THREE TIMES THE SCALE.** Eight of these thirty notes are a single character —
伞, 扫, 山, 声, 市, 试, 室, 收 — and the tap panel searches the deck the reader has **downloaded**, so
what each shows a Level 3 reader is:

| character | words in its own deck | words in the collection |
|---|---|---|
| 伞 | **0** | 1 |
| 山 | **0** | 17 |
| 试 | **0** | 15 |
| 扫 | 1 (打扫) | 8 |
| 声 | 1 (声音) | 28 |
| 市 | 1 (城市) | 14 |
| 室 | 1 (办公室) | 9 |
| 收 | 1 (收到) | **35** |

**收 is the sharpest case yet**: thirty-five words in the collection and one within reach. All eight
gained four authored rows, every reading and gloss checked against CC-CEDICT, and each row deliberately
goes to a word the panel cannot already reach — 声's rows skip 声音, which is the very next card in the
deck, and 市's skip 城市. Twenty-seven of these thirty-two words are in other levels; five (雨伞, 跳伞,
伞兵, 名声, 上市) the collection does not teach at all.

**FOUR GLOSSES WERE THE DICTIONARY'S SENSES IN THE WRONG ORDER FOR THE CARD**, batch 31's 开机 finding
again.

- **请客** read *to give a dinner party*, CC-CEDICT's first of three, while two of its sentences are
  晚饭我请客 and 今天我来请客 — picking up the bill rather than throwing a party. Now **to treat sb to
  a meal; to give a dinner party**, which covers all three, the third being 革命不是请客吃饭.
- **球场** read *stadium*, the one sense of six that needs a crowd; a 球场 is usually the pitch itself,
  and the word is what 篮球场 and 足球场 are built on. Now **sports ground; court; stadium**.
- **认真** read *earnest*, which is the one word none of its three English lines uses (*study hard*,
  *don't be so serious*, *studies hard*). Now **conscientious; serious; in earnest**.
- **上衣** read *jacket* while two of its three lines call the thing a *shirt*, which is 衬衫. A 上衣 is
  whatever is worn above the waist; the gloss is widened and those two lines now say *top*.

**TWO CARDS NAMED A PART OF SPEECH THEIR GLOSS DID NOT ANSWER** — batch 28's class, which is not to be
swept and is real one card at a time. **清楚** was *verb / adjective* over *clear*, while two of its
sentences are the verb (我不太清楚, 我没有听清楚); now *clear; to be clear about*. **生活** was
*noun / verb* over *life*, while 没有水你不能生活 is the verb; now *life; to live*. **热情** is the
third and took a real split: its third sentence uses the word as a noun (做事缺乏热情), so it is
*adjective: warm; cordial; enthusiastic* and *noun: enthusiasm; passion*, with the three sentences
tagged 1 / 1 / 2. **认得** was widened to *to recognise; to know (sb or sth by sight)* on the strength
of its own third line, *We know this song*.

**THE MAD CLASS, MEASURED AND CLOSED.** *Mad* is American for **angry** and ordinary British English
for **insane**, and 生气's second line read *Are you mad?*. Swept by hand over the nine decks: **12
sentences carry the word and 8 of them are the British sense** — 疯, 疯狂, 疯子, 理智 and 痴迷's *mad
about music* — so **it cannot be a LEXIS row**, a table would have made *My cat is angry* out of
我的猫疯了. The four that are the American sense all sit on cards whose headword *is* anger and are
repaired one at a time: 生气 (L3), 气 (L4), 打赌 and 发火 (L7–9). **Two of the four contradicted
themselves** — 气's own third line already says *Don't get angry at me*, and 发火 is glossed *Get angry
/ flare up* — so those cards gave a reader both dialects' words for one sense. `check-coarse.js`'s slur
column went **193 → 189** with them, the word having been on its list all along for the other reading.

**TWO SENTENCES DID NOT CONTAIN THEIR HEADWORD, AND `check-example-fit.js` CANNOT SEE EITHER**, both
cards being a single character, which that checker skips outright.

- **山** opened on 那里人山人海。 — the idiom 人山人海, which is its own card among the idioms, and whose
  English (*There's a huge number of people there*) mentions neither a mountain nor a hill. This is
  batch 29's 海 finding on the other half of the same idiom. The replacement uses 座, the measure word
  the card itself lists.
- **市** ended on 这次我们不去好市多可以吗？ — which is about **Costco**. 好市多 is a transliteration in
  which 市 is a sound and nothing else, so the card's own character was doing no work at all in it. The
  replacement uses 市 as the administrative suffix (北京市), which is the sense the gloss names.

**室 TAUGHT A REGIONAL WORD.** Its second sentence was 不要在课室里奔跑 — 课室 is the southern and
overseas word for a classroom, where standard Mandarin, the rest of this collection and HSK itself use
**教室**. Replaced with an authored 我们的教室在三楼. Its first line also rendered 室外 — the word the
card is there to explain — as *external*, and now says *outdoor*. A bound morpheme like 室 can only ever
be shown inside a compound, so what matters about its three sentences is that each compound be one a
learner will actually meet.

**FOUR MORE ENGLISH LINES DID NOT RENDER THEIR CHINESE.** 球场's first called the place a **ballpark**,
which is American and names a baseball ground in particular — a single occurrence in the nine decks, so
it is repaired here rather than in the LEXIS table, batch 32's rule. 沙发's first called the thing a
**couch** while the card is glossed *sofa* and its other two lines say sofa, so one card gave two words
for one object. 身高's *My height surpasses yours* is a register no learner needs. 生活's *He lived a
busy life* put a past tense on a Chinese sentence that has none and a noun where the Chinese has a verb.
All four fixed with `exEn`; every Chinese sentence untouched.

**WHAT WAS READ AND LEFT.**

- **沙发's measure words 条 and 张 were checked and are right** — CC-CEDICT gives both for this word.
  They looked wrong (条 is for long thin things) and are not, which is why the dictionary was consulted
  before the record was written.
- **伞's 雨伞卖得好 and 扫's 我找不到扫把了 stay.** Both put the headword inside a longer word, but 雨伞
  *is* an umbrella and 扫把 is the thing one sweeps with — transparent compounds, batch 27's 短发-on-短
  case rather than its 东-as-东西 case. 市's Costco sentence is the other kind and went.
- **请客's 革命不是请客吃饭 stays.** It is a famous quotation rather than an everyday sentence, and it
  is the one of the three that shows the dinner-party sense the gloss still carries.
- **清楚, 请假, 秋天, 裙子, 然后, 认为, 容易, 如果, 勺子, 身边, 声音, 世界, 收** were read and are
  right as they stand. 秋天, 市, 如果 and 收 already carry earlier batches' authored glosses and English,
  and 声 and 室 earlier batches' senses and measure word.
- **`check-example-fit.js` reports one card in range and it is a false positive**: 容易's
  学会一门外语不容易。 segments 不容|易 because greedy longest-match prefers 不容; 容易 is intact.
- **`check-say-reading.js` names none of the eight single-character cards**, so each teaches the reading
  a speech engine will give it and none needs a `Say`.
- **认得 came off `check-gloss-source.js`'s overlap list as a side effect, and that finding was a
  spelling artefact rather than a fault**: *to recognise* and the dictionary's *to recognize* share no
  token, so the card was reported for being British. The list already holds 电梯/lift, 数学/maths and
  邻居/neighbour for the same reason.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged**, and the shared-gloss groups **338 both before and after**, checked
  group by group against HEAD rather than by the totals — which is what says seven re-glossings and a
  sense split made no new collision
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0** — and it reads 0 over *mad*, *ballpark* and *couch* too, none of them being
  a spelling
- `check-say-reading.js`: unchanged at 10 of 1,503
- `check-coarse.js`: **identical to HEAD but for the four MAD lines**, slur 193 → 189; the other five
  columns byte-identical
- `check-gloss-source.js`: neighbour findings **3, unchanged**; the overlap list went 1,029 from 1,030,
  exactly 认得 coming off and nothing going on
- 34,596 example blocks, **spoken == visible on every one**; sense-tagged blocks 305 → 308, the three
  this batch wrote
- every authored sentence segmented against the 11,532-word deck lexicon and checked for a duplicate
  against every sentence and every English line in all nine decks
- `build-lang-decks.js`: re-run, and **exactly three rows changed** — `hsk30l3`, `hsk30l4` and
  `hsk30l7`, the three decks touched — each by its `bytes` and `rev` alone
- CI fast gate green: `node --check` over every root and `.claude` script, the eight no-browser suites,
  `check-docs`, `check-questions`, `check-style`

## Batch 35 — hsk30l3 notes 331–360 (收到 → 外卖), and the LEXIS table's missing plurals

Thirty notes read in deck order, **thirty-five cards changed** across 75 fields — twenty-four in range
and eleven in other decks, which are two measured classes closed in one pass. The only code change is
five rows added to `mandarin-fix.js`'s own LEXIS table and the paragraph that explains why they had to
be written by hand.

**A LEXIS ROW IS BLIND TO ITS OWN PLURAL, AND THE TABLE HAD NONE.** `LEXIS.rx` is built from the
literal keys with a word boundary either side, so `elevator` does not match inside `elevators` and the
row simply never fires. Measured over the nine decks: **ten card-sites over six distinct sentences**
escaped that way — *elevators* (2), *subways* (2), *cellphones* (1), *airplanes* (2), *trucks* (3) —
every one of them a word the table already claims in the singular. Several are the same sentence
shared by two or three cards, which is how one koala-and-lorries sentence about Australian bridges
accounts for three of the ten.

**This is a hole in the table rather than a new class**, which is what makes it a table fix where
batch 32's *meter* and batch 34's *mad* were per-note judgements: the table has already decided that
an elevator is a lift. So the five plurals are declared beside their singulars — `elevators → lifts`,
`subways → underground trains`, `cellphones → mobile phones`, `airplanes → aeroplanes`,
`trucks → lorries`.

**THE OBVIOUS GENERALISATION IS A TRAP AND THE TABLE ITSELF PROVES IT.** Matching `key + s`
automatically would fire `math` inside **`maths`** — the row's own TARGET, and ten sites of it in these
decks — and rewrite it to *mathss*; and `truck → lorry` cannot yield *lorries* from the singular's
replacement at all. A declared row can only ever do what it says, which is the same argument the
`CROSSREF_WRONG` tables are built on. The applier went from 3 cards put into British word choices to
**13**.

**TWO SMALLER CLASSES WERE SWEPT BY HAND AND ARE NOT TABLE ROWS.** *Coworker* is American where British
English says colleague — two sites (同事 L3, 确实 L4), and 同事 is glossed *colleague* and says
*colleagues* in its other two lines, so it contradicted itself. *Cab* is three sites (出租车 and 坐 in
Level 1, which share one sentence, and 司机 in Level 3), and it is **not an error in British English at
all** — it is the wrong one of two words on cards that have already chosen *taxi* in their gloss or
their neighbouring lines. *Dove* was swept too and stayed per-note: of its two sites one is the BIRD, on
鸽子, where it is correct British English, and the other is 跳's *I dove into the river*, which is both
American for *dived* and a mistranslation — 跳进 is jumping in.

**TEN OF THESE THIRTY NOTES ARE A SINGLE CHARACTER** — 受, 瘦, 树, 刷, 双, 糖, 甜, 跳, 挺, 腿 — and
their panels in `hsk30l3` show **nothing at all for eight of them**, 受到 for 受 and 牙刷 for 刷. All
ten gained authored `Compounds`, every reading and gloss checked against CC-CEDICT. Three of them take
only three rows because that is what the language offers: 瘦, 挺 and 腿 each have exactly one other word
in the whole collection. **挺 is the batch's thin one and its `why` says so** — outside the colloquial
*quite* the card teaches, its compounds are all the *straight, erect* sense and all of them literary.

**树's LIST DELIBERATELY OMITS 树木**, which is the word its own `not X` disambiguator names: a row for
it would have put the very word the card tells a reader it is **not** into the list of words built on
it. 种树 took the fourth slot instead, and the card's own third sentence is 谁种了这棵树. **Watch for
this on any single-character card carrying a hint** — the two blocks are written by different passes and
neither knows about the other.

**EIGHT GLOSSES WERE WRONG ABOUT THE CARD.**

- **突然** was labelled *adjective* over *suddenly*, which is an adverb — batch 31's third shape, the
  label and the gloss being different parts of speech. It is the one of the eight `check-gloss-source.js`
  could see, and it saw it for the right reason: *suddenly* shares no token with *sudden; abrupt;
  unexpected*. Split into adjective and adverb, and the three sentences tagged 2 / 2 / 1.
- **双** was labelled *measure word* over *a pair of*, which is one of its three sentences; the other
  two are 双人间 and 双眼, the adjective CC-CEDICT gives as *two; double; pair; both*. Split, tagged
  1 / 2 / 2.
- **瘦** gave the adjective alone while 我瘦了三公斤 is the verb *to lose weight*. Split, tagged 1 / 2 / 1.
- **受到** read simply *receive*, which says nothing about the one thing that distinguishes it from
  收到 — that what follows is done TO the subject. All three of its sentences are that shape
  (受到欢迎, 受到邀请, 受到重视). Now *to receive (praise, criticism etc); to be subjected to*.
- **刷** read *to brush, to scrub* while its second sentence is 我可以刷卡吗？, a sense CC-CEDICT records
  and the gloss did not reach. Now *to brush; to scrub; to swipe (a card)*.
- **糖** read *sugar* while its third line says *We want sweets*; **体育** read *physical education*
  while two of its three say *sports*; **水平** read *level* while every one of its sentences is the
  *standard, level of ability* sense, which left a reader no word for 我的法语水平不高.
- **特别 and 挺 needed no new sense, only the tags** their earlier splits never wrote. 挺's three are all
  the adverb, so its verb sense is stated and not illustrated — visible to the reader now rather than
  left to be guessed.

**FOUR SENTENCES WERE REPLACED.**

- **树** opened on 看看那边的树熊。 — a **koala**. 树熊 is its own word and the English mentions no tree
  at all; single-character cards are skipped by `check-example-fit.js` outright, which is how this and
  the next one survived.
- **甜** opened on 他真是甜心。 — 甜心, a calque of *sweetheart*, whose English says sweetheart and
  nothing about sweetness. Of that card's three lines only one was about taste at all, the third being
  甜点, dessert.
- **收到** opened on 收到一个信号。 / *Catch a signal* — a subjectless fragment under an imperative the
  Chinese has not got, so between them they taught neither the word nor a sentence.
- **腿** carried 我有蜜大腿。 / *I have honey thighs*, which is not Chinese anybody writes and not
  English anybody says. Whatever it began as, it taught neither language.

**SEVEN MORE ENGLISH LINES DID NOT RENDER THEIR CHINESE**, all fixed with `exEn` and every Chinese
sentence untouched. 受's *Hurt people hurt people* is an aphorism whose two identical words say nothing
to a learner about which is the verb. 瘦's *It's more polite to say thin than skinny* glosses 苗条 as
*thin* — the very word that card gives for 瘦 — where 苗条 is *slim*. 糖's *We didn't have sugar* is a
past tense the Chinese has not got: 没有…了 is the state of having run out. 体育馆's first line called
the place a stadium while the card is glossed *gym*. 同意's read *I* where the Chinese says 我们 — a
mistranslation of the SUBJECT, invisible to every checker here. 头发's first and third both read as
*long hair*, and the third rendered 留 as nothing. 外地's first and third were both *I'm a stranger
here*.

**WHAT WAS READ AND LEFT.**

- **数学** is glossed *maths* and two of its lines say *mathematics*. Both are British English and
  neither is wrong, so it stays — unlike *couch* beside *sofa* or *cab* beside *taxi*, where one of the
  two is the American word.
- **刷's 我们不刷盘子 stays**, although 盘子's card carries the same sentence: cross-card duplication is
  how these decks' example bank works, and *We don't wash the dishes* is what 刷盘子 means.
- **外地's gloss is CC-CEDICT's own wording** — *parts of the country other than where one is* — and
  reads like a definition because the word has no one-word English equivalent.
- **收到, 受, 瘦, 树, 甜, 腿, 叔叔, 四季, 太阳, 提高, 听说, 图书馆, 外卖** and the rest were read and are
  right as they stand. 收到, 受到, 体育 and 外卖 already carry earlier batches' authored examples, and
  司机, 头发 and 出租车 earlier batches' measure words.
- **`check-example-fit.js` reports nothing in this range**, which is not a clean bill: eight of the ten
  single-character cards here are outside what it can see, and two of the four replaced sentences were
  exactly the fault it is for.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged**, and the shared-gloss groups **338 both before and after**, checked
  group by group against HEAD — eight re-glossings and four sense splits made no new collision
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**, and it reads 0 over *elevators*, *trucks*, *coworker*, *cab* and *dove* too,
  none of them being a spelling
- `check-coarse.js`: **byte-identical to HEAD in all six columns**
- `check-gloss-source.js`: neighbour findings **3, unchanged**; the overlap list went 1,029 → 1,028,
  exactly 突然 coming off and nothing going on
- 34,596 example blocks, **spoken == visible on every one**; sense-tagged blocks 308 → 323, the fifteen
  this batch wrote
- every authored sentence segmented against the 11,532-word deck lexicon and checked for a duplicate
  against every sentence and every English line in all nine decks
- `build-lang-decks.js`: re-run, and **exactly six rows changed** — `hsk30l1`, `hsk30l3`, `hsk30l4`,
  `hsk30l5`, `hsk30l6` and `hsk30l7`, the six decks the two cross-deck classes touch — each by its
  `bytes` and `rev` alone
- CI fast gate green: `node --check` over every root, `.claude` and `.claude/decks` script, the eight
  no-browser suites, `check-docs`, `check-questions`, `check-style`

## Batch 36 — hsk30l3 notes 361–390 (外语 → 相机), and the whole `toward` class

Thirty notes read in deck order, **twenty cards changed** across 45 fields — seventeen in range and
three in other decks, which are one measured class closed in a pass. One row added to
`mandarin-fix.js`'s LEXIS table; no site change.

**A GLOSS WAS CUT OFF MID-LIST, AND NOTHING ANYWHERE REPORTS THAT.** 西北 read
*Northwest China (Shaanxi, Gansu, Qinghai, Ningxia,* — no Xinjiang, no closing bracket — and it was
the wrong one of CC-CEDICT's **two** entries besides: the capitalised place name, where all three of
the card's own sentences are the plain compass direction. Rewritten on the pattern its own siblings
already carry: 东北 reads *northeast; Northeast China*, so 西北 now reads **northwest; Northwest
China**. **The sibling sweep is what settled the wording** — the first draft was *north-west*, to match
the card's own authored English lines, and 东北, 东南 and 西南 all gloss unhyphenated. A card is
consistent with its neighbours or with itself; here the neighbours won, and the hyphens in the example
lines stay, both forms being British.

**A CARD CONTRADICTED ITS OWN GLOSS THREE TIMES OVER.** 屋子 is glossed *room (colloquial, chiefly
northern)*, which an earlier batch authored deliberately, and **all three of its English lines said
HOUSE**. That is not a two-way choice: this collection has already assigned the words — 房间 is
*room (in a house or a hotel)*, 房子 is *house* and carries its own `not 房屋` disambiguator — so the
three lines were contradicting 房子's gloss as well as their own card's. The Chinese is untouched and
the three lines now say room.

**TWO CARDS CARRIED A SENTENCE THAT IS NOT THEIR WORD AT ALL**, which is the batch's sharpest pair
because the characters are right and no checker here can see it.

- **晚会** had 我们晚会再谈这事。 — 晚会 there is 晚 + (一)会(儿), *in a little while*, which is why its
  English read *We'll talk about this later* and mentioned no party.
- **晚点**, two cards earlier, is the same collision surviving as a missing SENSE rather than a wrong
  sentence: the card gave *(of trains etc) late* and only its first sentence is that word — the other
  two are 晚(一)点, *a bit later*. **CC-CEDICT lists only the train sense**, because the other is
  compositional rather than a word, so the dictionary cannot settle this one; two of three sentences
  can, and do. Split, and the sentences tagged 1 / 2 / 2.

**西 OPENED ON NANCY.** 我听说南西很漂亮。 — 南西 is a transliteration in which 西 is a sound and
nothing else, the fault 市 carried in 好市多 two batches ago and 前年 in 大前年 three. Replaced with an
authored 房子的窗户朝西, deliberately not another 向西, the card's second line already having that
construction. Its third line, 忘东忘西, stays: the character genuinely means nothing there, and that is
worth a learner's seeing once — it is why 东西 leads the card's new `Compounds` rows.

**FIVE MORE GLOSSES WERE WRONG ABOUT THE CARD.**

- **碗** is labelled a NOUN and read *a bowl of*, which is the measure-word phrasing: a reader shown
  *a bowl of* on the reverse card has been handed a construction rather than a word.
- **箱子** gave the narrowest of five senses, *suitcase*, while all three of its own lines call the
  thing a box.
- **习惯** was *noun / verb* over *be used to*, the verb alone, while 写日记是一个好习惯 is the noun —
  and the noun is what its measure word 个 is there for.
- **洗衣机** read *washing machine; washer*, CC-CEDICT's own wording copied whole, and *washer* is the
  American short form. **No sweep here can see that**: it is a word choice rather than a spelling, and
  it sits in a GLOSS rather than in a sentence, where even the hand sweeps of *mad*, *cab* and
  *coworker* were looking.
- **为 and 像 needed no new sense, only the tags** their earlier splits never wrote — 为's three
  sentences are wèi, wèi and wéi, and 像's are all the verb, so its noun and adverb senses are stated
  and not illustrated.

**`toward` IS NOW A LEXIS ROW, AND THE MEASUREMENT IS WHY.** It was found on the 西 card's own second
line. Swept over the nine decks: **4 `toward` against 33 `towards`** — so the house form was already
settled and the four were simply out of step. It goes in the table rather than to four `exEn` rows
because it is a variant FORM rather than a choice between two words, like `gotten` beside it: there is
no British context that wants *toward*, so no judgement is needed per site. The word boundary is what
keeps it off *untoward*, which the decks do not contain. Zero after, 37 `towards`.

**SIX SINGLE-CHARACTER CARDS GAINED `Compounds`** — 碗, 为, 西, 先, 向, 像 — every reading and gloss
checked against CC-CEDICT. **为 is the widest character the audit has met**: 48 words in the collection
and three in its own deck, and its rows deliberately show both readings (因为 and 为什么 are wèi, 成为
and 作为 wéi), which is what the card is for. **西's panel is the fullest of the batch** at four words,
so its rows go elsewhere. **像's rows are all the noun sense the card states and does not illustrate**,
and 想象 is deliberately not among them — it is written with 象, not this character, and the applier
would have refused the row.

**FIVE MORE ENGLISH LINES DID NOT RENDER THEIR CHINESE.** 文化's first read *Individuality is very
important in the West*, which renders 文化 as nothing at all, and its third called 电脑 a *PC*. 洗澡's
*I wash myself* is neither the progressive 正在 says nor anything an English speaker says. And **忘记
and 相信 carry the same slip on the same verb** — 我只想忘记 and 我很想相信 were both put into the past
(*I only wanted to*, *I so wanted to*), where 想 there is the present want.

**WHAT WAS READ AND LEFT.**

- **碗's two washing-up sentences became one.** 我正在洗碗 and 我为什么要洗碗呢 were *I'm washing the
  dishes* and *Why must I wash the dishes?*, so the card showed the dishes twice and the bowl once; the
  second is replaced with an authored 桌子上有三个碗 using 个, one of the card's own measure words.
- **箱子's two opening sentences stay.** 请打开箱子 and 你知道如何打开这个箱子吗 are close, but one is
  an imperative and the other a question about knowing how — further apart than 瓶子's pair in batch 33,
  which was one English line twice.
- **外语, 完成, 网球, 网站, 为了, 卫生间, 西方, 西瓜, 西南, 喜爱, 夏天, 香蕉, 先, 相机** and the rest
  were read and are right as they stand. 完成's bare *complete* is the house form for a verb gloss
  (measured in batch 26: 2,582 verb glosses without *to* against 1,164 with). 西南's gloss is
  deliberately untouched, for the sibling reason above.
- **`check-example-fit.js` reports one card in range and it is the same false positive as last batch**,
  外语's 学会一门外语不容易, where the segmenter prefers 不容.
- **Five cards in this range carry a `not X` disambiguator** — 网站, 忘记, 卫生间, 喜爱 and 向 — and all
  five kept it, as they must: `compounds` and `exEn` do not rebuild `fl.English`, where `gloss` and
  `senses` do. None of the six re-glossed cards had one, and no partner hint pointed at them.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged**, and the shared-gloss groups **338 both before and after**, checked
  group by group against HEAD — six re-glossings and a sense split made no new collision
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**, and it reads 0 over *toward* and over *washer* too, neither being a spelling
- `check-coarse.js`: **byte-identical to HEAD in all six columns**
- `check-gloss-source.js`: **byte-identical to HEAD**, neighbour findings 3 and the overlap list 1,028 —
  none of the six re-glossings moved it, each of them already sharing a content word with its entry
- 34,596 example blocks, **spoken == visible on every one**; sense-tagged blocks 323 → 332, the nine
  this batch wrote
- every authored sentence segmented against the 11,532-word deck lexicon and checked for a duplicate
  against every sentence and every English line in all nine decks
- `build-lang-decks.js`: re-run, and **exactly three rows changed** — `hsk30l3`, `hsk30l5` and
  `hsk30l7`, the three decks `toward` reaches — each by its `bytes` and `rev` alone
- CI fast gate green: `node --check` over every root, `.claude` and `.claude/decks` script, the eight
  no-browser suites, `check-docs`, `check-questions`, `check-style`

## Batch 37 — hsk30l3 notes 391–420 (小区 → 以后)

Thirty notes read in deck order, **nineteen cards changed** across 46 fields, all of them in
`hsk30l3`. No code change and nothing outside this deck moved.

**A SENTENCE THE SEGMENTER FINDS THE HEADWORD IN, AND WHICH IS STILL NOT THAT WORD.** 牙刷's third
sentence was 把你的牙刷干净。 — which is 把你的**牙** + **刷**干净, *brush your teeth clean*: the
headword's two characters belong to different words in it, and the card's own bolding says otherwise.
**`check-example-fit.js` reports nothing here**, and the reason is the blind spot its own header names:
greedy longest-match lands squarely ON 牙刷, 牙刷 being in the lexicon and longer than 牙, so the
segmenter finds the headword and the sentence goes on using the characters as something else. Batch 26
named this class and it is still found by reading and by nothing else. Replaced with an authored
我该换一把新牙刷了, which uses 把, the measure word the card itself lists.

**TWO SENTENCES ON ONE CARD MISTRANSLATED THE SAME WORD, AND THE DICTIONARY SETTLES IT.** 牙's first
and third lines both rendered 洗牙 as *brush your teeth* — CC-CEDICT gives it as *(dentistry) to perform
or undergo scaling*, which is having your teeth cleaned by a dentist. The card's middle sentence is the
real 刷牙, so as it stood the card gave a learner one English phrase for two different things, and one
of the two lines was not English either (*Recently, I want to go to brush my teeth*). Both fixed, and
**洗牙 is now one of the card's `Compounds` rows** — the word its own sentences use twice.

**A GLOSS THAT IS NOT WHAT ANY OF THE CARD'S SENTENCES MEAN.** 心里 read **chest**. CC-CEDICT lists
*chest* first and *heart; mind* second, and 你住在我心里, 你心里有鬼 and 我可以听见你心里的声音 are
all the second — the batch-31 fault at its plainest: 心里 is where a Chinese speaker puts a thought,
not a rib cage.

**AND THE ONE `check-gloss-source.js` HAS BEEN RIGHT ABOUT ALL ALONG.** 信 was glossed *trust, believe,
sincerity* and said nothing about a **letter** — while two of its three sentences are letters and its
measure word 封 counts nothing else. The checker has carried it in the overlap list for as long as this
audit has been reading that list (*card: trust, believe, sincerity / dict: letter; mail; CL:封*), and it
came off with this fix. **A standing finding on a list that is 9% noise is still a finding**; the
reading that settles it is the card's own measure word.

**THREE CARDS CONTRADICTED THEMSELVES, ALL IN THE SAME SHAPE** — a gloss that has already chosen a word
and sentences that use the other one. 小区 is glossed *neighbourhood* and its three lines said district,
neighbourhood and community in turn; CC-CEDICT gives all three, so only the card can decide, and it
had. 校长's gloss leads *head teacher*, the British word, and all three of its sentences said
*principal*. 行李 is glossed *luggage* and two of its three said *baggage*. Same shape as 沙发's couch
beside sofa and 司机's cab beside taxi.

**TWO MORE GLOSSES WERE A PART OF SPEECH SHORT.** 选择 was labelled *verb* over the noun *choice* —
batch 31's third shape — while its sentences are one verb and two nouns; split and tagged 2 / 1 / 2.
要求 was *noun / verb* over *requirement*, the noun alone, while two of its three are the verb; and its
third line softened 要求 to *I want you to leave now*, which is 想 rather than this word. **行 and
一块儿 needed only the tags** their earlier splits never wrote: all six of their sentences are the first
sense, so 行's háng — a row, a trade, a firm — and 一块儿's noun are visibly stated and not illustrated.

**EIGHT SINGLE-CHARACTER CARDS GAINED `Compounds`** — 鞋, 信, 行, 选, 牙, 羊, 养, 页 — every reading and
gloss checked against CC-CEDICT. **行 is the widest character the audit has met**: **69 words in the
collection** and five in its own deck, which is also the fullest panel so far, so its rows go elsewhere
and show both readings. **牙's rows deliberately omit 牙齿**, which is that card's own `not X`
disambiguator — the trap 树 carried last batch, met a second time and now expected. 信's rows are split
between its two senses, the letter and the believing, which is the distinction its gloss had lost.

**羊 OPENED ON WOOL.** 冬天穿羊毛衣。 is 羊毛, its own word, and its English (*We wear wool in winter*)
mentions no animal; the card is a single character, so `check-example-fit.js` skips it outright.
Replaced with an authored 这只羊还很小 using 只, one of the card's own measure words. **小心 showed one
warning twice** — 小心着凉啊 and 你应该小心不要着凉, *be careful not to catch cold* under two wordings —
so the second is replaced by 过马路要小心, which gives the card a use outside illness.

**A SENTENCE WITH NO FULL STOP.** 页's 书页因年久而变黄 ended bare. The corpus-wide punctuation pass
CONVERTS marks and never ADDS one, so about 150 sentences still end without a terminator; `exStop` is
for exactly the few whose only fault that is, and this sentence is otherwise sound.

**WHAT WAS READ AND LEFT.**

- **鞋's two 鞋子 sentences stay.** The card is 鞋 and two of its three lines use 鞋子, but that is the
  bare character plus a nominal suffix, transparent in the way 雨伞 and 扫把 were last batch — not the
  way 羊毛 and 牙刷 are here.
- **校园, 信用卡, 牙刷 and 一块儿 each took only an English fix**, their Chinese being sound: *school
  life* for 校园生活, a missing plural in *Do you accept credit card?*, one toothbrush sentence said
  twice, and *Sing a song with me* for 咱一块儿来唱首歌, which drops both the 咱 and the 一块儿.
- **小心, 新年, 新闻, 新鲜, 兴趣, 休假, 需要, 选, 学期, 养, 一定, 一共, 一样, 以后** and the rest were
  read and are right as they stand. 学期 already carries an earlier batch's authored gloss and English
  (*term*, not *semester*), and 小区, 校园, 信用卡 and 行 earlier batches' measure words and senses.
- **`check-example-fit.js` reports nothing at all in this range**, and that is worth stating plainly:
  the batch's two headword faults were 牙刷's, which it cannot see because it finds the headword, and
  羊's, which it cannot see because the card is one character. Both were found by reading.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged**, and the shared-gloss groups **338 both before and after**, checked
  group by group against HEAD
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged**
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**, and it reads 0 over *principal* and *baggage* too, neither being a spelling
- `check-coarse.js`: **byte-identical to HEAD in all six columns**
- `check-gloss-source.js`: neighbour findings **3, unchanged**; the overlap list went 1,028 → 1,027,
  exactly 信 coming off — the finding this batch acted on
- 34,596 example blocks, **spoken == visible on every one**; sense-tagged blocks 332 → 341, the nine
  this batch wrote
- every authored sentence segmented against the 11,532-word deck lexicon and checked for a duplicate
  against every sentence and every English line in all nine decks
- `build-lang-decks.js`: re-run, and **exactly one row changed**, `hsk30l3`, by its `bytes` and `rev`
  alone
- CI fast gate green: `node --check` over every root, `.claude` and `.claude/decks` script, the eight
  no-browser suites, `check-docs`, `check-questions`, `check-style`

## Batch 38 — hsk30l3 notes 421–450 (以前 → 员), and the whole `anymore` class

Thirty notes read in deck order, **thirty-nine cards changed** across 75 fields — twenty-two in range
and seventeen in other decks, which are two measured classes closed in a pass. One row added to
`mandarin-fix.js`'s LEXIS table; no site change.

**THE SAME FAULT TWICE ON ONE CARD, AND ONLY ONE OF THEM WAS EVER REPORTED.** 有关's examples were
我没有关灯。 and 你有关门吗？ — both 有 + a 关 verb, neither of them this word. An earlier batch dropped
the first **on `check-example-fit.js`'s say-so**, and left the second standing beside it. The reason is
arithmetic rather than judgement:

- 我没有关灯 segments 我 | **没有** | 关灯, so 有关's characters straddle two words and the checker
  reports it;
- 你有关门吗 segments 你 | **有关** | 门 | 吗, because 有关 is itself in the lexicon and is longer than
  有, so the segmenter lands squarely on the headword and the checker sees nothing.

**The difference between a reported fault and an invisible one was which neighbouring words happen to
exist in the deck's own word list.** This is the blind spot batch 26 named and batch 37 met on 牙刷,
and it is the first time the audit has caught it leaving HALF a repair behind. **When a
`check-example-fit.js` finding is repaired, read the card's other two sentences** — the checker cannot
be relied on to have shown them.

**A CARD TAUGHT A WORD THAT DOES NOT EXIST.** 员's first sentence was 直子是个游泳员。 — and 游泳员 is
in no dictionary: CC-CEDICT has no entry, and a swimmer is 游泳运动员, which this collection's own
运动员 is the tail of. The sentence is a learner's mistake written out as an example, and it was the
card's first. Replaced with an authored 他是这个队的队员.

**A SECOND TRUNCATED GLOSS, ONE BATCH AFTER THE FIRST.** 园 read *garden, park, or enclosed area for
cultivation or* — and stopped, on the word *or*. 西北's was cut off mid-list last batch; these are the
only two the audit has met, and both were in Level 3's own glosses rather than in anything generated.
Rewritten from CC-CEDICT's own wording.

**THE ONE DISTINCTION A LEARNER NEEDS FROM 以为 WAS MISSING.** The card read *think; feel; reckon* —
which is 认为's gloss on another card in this same deck (*to think that; consider*) — so the two were
glossed as synonyms when the whole of the difference is that **以为 says the speaker turned out to be
wrong**. CC-CEDICT states it outright, and both of the card's own sentences carry it (我以为你知道,
他以为自己很了不起). Now *to think (mistakenly); to assume*.

**THREE MORE GLOSSES WERE A SENSE SHORT, AND ONE WAS A SENSE THE CARD NEVER SHOWS.**

- **一边** read *on the one hand …*, which is **not what any of its three sentences is**: two are
  一边…一边…, doing two things at once, and the third is 这一边, a side. Split to the two it teaches.
- **一般** gave the adjective *ordinary* while two of three sentences are the adverb *usually*.
- **一直** joined two senses with a semicolon (*straight on; always*) and its sentences split one to two.
- **游客** read *traveller* while all three of its English lines say **tourist** — another standing
  `check-gloss-source.js` finding, reported for as long as this audit has read that list, and off it
  now. That is two batches running where the overlap list was right about a Level 3 card: 信 last
  batch, 游客 this one.

**`anymore` IS NOW A LEXIS ROW, AND IT IS THE BIGGEST OF THE THREE.** British English writes it as TWO
WORDS in this sense, and the decks carried **20 sites** of the American one-word form against 12 of the
British. It goes in the table rather than to twenty `exEn` rows because it is a SPACING rather than a
word choice — no judgement per site — and because the replacement contains a space, so it can never
match itself on a re-run. Zero after, 32 *any more*, across all seven HSK decks.

**TWO SMALLER SWEEPS STAYED PER-NOTE.** *mailbox* is American where British English says **postbox**:
four sites, three of them 邮箱 and its own two sentences, one on 邻居 — and it is not a table row
because CC-CEDICT gives 邮箱 the email-inbox sense too, which that card's middle sentence uses, so a
blanket swap would have made a *postbox* of an inbox. *e-mail* against *email* is four sites, three on
邮件 and one on 发送 in Level 4; the modern unhyphenated spelling is what the rest of the collection
uses.

**FOUR MORE ENGLISH LINES DID NOT RENDER THEIR CHINESE.** 银行卡's second called a 银行卡 a **credit
card** — 信用卡 is its own card twenty notes earlier in this same deck. 游戏's first read *I like to
play board games* for 我喜欢打游戏, where 打游戏 is playing a video game and a board game is 棋类游戏.
饮料's first called a drink a *beverage* on a card glossed *drink*. And 又's gloss, authored by the
disambiguation batch, read *again (of something that has already happened again)* — the word twice,
once in the gloss and once inside the note explaining it.

**THREE SENTENCES WERE REPLACED BESIDES.** 语言 opened on 我爱语言学！, which is **linguistics**, a word
of its own. 一直's 我一直聪明 is not a sentence a speaker writes — a stative predicate takes 很 or
another degree word — and its English reached for the American sense of *smart*, which in British
English is about dress. 音乐's first and third were the same four words twice, 我喜欢音乐 and
音乐我喜欢, as *I love music* and *I like music*.

**THREE SINGLE-CHARACTER CARDS GAINED `Compounds`** — 用, 园, 员. **又 DELIBERATELY DID NOT, AND IT IS
THE FIRST CHARACTER THE AUDIT HAS DECLINED**: it is a grammatical adverb, the whole collection has one
other word built on it, and CC-CEDICT offers nothing a Level 3 reader wants — 又及 is a postscript and
一次又一次 is a phrase rather than a compound. **A section that has to invent its rows is worse than no
section**, and the rule the other thirty-odd cards follow is that the rows are words a learner will
meet. 园's rows go to 园丁 and 园艺, which are exactly what its own second and third sentences are about
and which a reader had nowhere to look up; 员 is a SUFFIX, so its rows are four occupations and
memberships, which is the whole of what it makes.

**WHAT WAS READ AND LEFT — AND ONE MEASURED FINDING NOT ACTED ON.**

- **The curly apostrophe: 69 lines against 5,196 straight ones**, measured over the nine decks. The
  house form is plainly the straight one and the residue is 1.3%, but it is a CHARACTER substitution
  rather than a word, so no existing pass can reach it — `exLexis` matches word keys — and acting on it
  would mean a new deck-level pass for a difference no reader will notice, a curly apostrophe being
  typographically the better of the two. **Recorded rather than swept**; 羽毛球's line was rewritten
  whole for its *anymore*, so one of the 70 went with that.
- **应该's third line renders 你 and 您 as *thou* and *ye***, which is archaic English and looks like a
  fault. It is not: *ye* was the plural and formal second person in early modern English, so the mapping
  is exact, and no modern English pair carries the distinction at all.
- **以前, 以上, 以外, 以下, 银行, 有名, 有用, 雨衣, 遇到, 遇见, 应该** and the rest were read and are
  right as they stand. 有关, 有用, 雨衣, 银行卡 and 影响 already carry earlier batches' authored examples
  and senses.
- **Two `exEn` rows in the first draft named a sentence that does not exist** — my transcription of
  邻居's and 发送's Chinese — and the applier REFUSED the whole run rather than writing the rest. That is
  the guard working as its header says it should: `exEn` fails where `dropEx` only warns, because a row
  it re-asserts on every run can only ever be a typo.

**Checks after the batch.**

- `mandarin-fix.js --check`: clean, "ok every deck already carries its fixes"; a second run writes nothing
- `check-mandarin-coverage.js`: 11,532 of 11,532 notes at three sentences, none repeated; still-ambiguous
  reverse groups **2, unchanged**, and the shared-gloss groups **338 both before and after**
- `check-pinyin.js`: clean — 11,468 readings cross-checked
- `check-example-fit.js`: **143, unchanged** — and it reports nothing on 有关, which is the batch's
  point
- `check-senses.js`: duplicate-English-on-one-card **152, unchanged**
- `check-british.js`: **0**, and it reads 0 over *anymore*, *mailbox* and *e-mail* too, none of them
  being a spelling
- `check-coarse.js`: **one line's text changed and no count moved** — 忍耐's 妈的 finding now reads
  *any more*
- `check-gloss-source.js`: neighbour findings **3, unchanged**; the overlap list went 1,027 → 1,026,
  exactly 游客 coming off
- 34,596 example blocks, **spoken == visible on every one**; sense-tagged blocks 341 → 353, the twelve
  this batch wrote
- every authored sentence segmented against the 11,532-word deck lexicon and checked for a duplicate
  against every sentence and every English line in all nine decks; 员's lands inside 队员, which is
  correct for a bound suffix and is what 室 did in batch 34
- `build-lang-decks.js`: re-run, and **all seven HSK rows changed**, which is the reach of the
  `anymore` class — each by its `bytes` and `rev` alone
- CI fast gate green: `node --check` over every root, `.claude` and `.claude/decks` script, the eight
  no-browser suites, `check-docs`, `check-questions`, `check-style`

## Batch 39 — hsk30l3 notes 451–480 (愿意 → 住院)

Thirty notes read in deck order, **fourteen cards changed** across 35 fields; one of them, 平常, is in
Level 4 and carries a sentence this batch corrected in Level 3.

**A CARD GLOSSED WITH THE ONE SENSE NONE OF ITS THREE SENTENCES USES.** 照 read *take (a photo)*, and
its examples are 照他说的做 (the preposition, *according to*), 那是一张近照吗 (the noun, a photograph)
and 月亮照亮了房间 (the verb, *to shine*). CC-CEDICT records all of them. Split into the three the card
teaches and tagged 2 / 3 / 1 — the first card in this deck to need three senses. **主要 is the same
shape one rung down**: labelled *adjective* over the adverb *mainly*, with its sentences one adverb to
two adjectives, and it too was a standing `check-gloss-source.js` finding. **只有** read *only have
…*, CC-CEDICT's first sense and again not one the card uses.

**TWO SENTENCES WERE NEITHER OF THEIR CARD'S SENSES.** 张's first was 小张人不错！ — the **surname**
Zhang, which CC-CEDICT files as a separate capitalised entry and which is neither the measure word nor
the verb the card gives. 中's second was 你一般中午饭吃什么？, where 中 sits inside 中午 and 中午饭 is
itself an odd form (the word is 午饭). Both replaced with authored sentences that show the sense each
card states and never illustrated — 他张开嘴 for 张's verb, 他中了一枪 for 中's zhòng.

**THREE ENGLISH WORDS FOR ONE CHINESE ONE, ON ONE CARD.** 运动会's lines called it a *sports
competition*, an *athletic meeting* and an *athletic meet* — the last American. Both loose ones are
school sports days, which is what their Chinese describes (下雨延后了, 排练, 课程).

**TWO SMALL BRITISH-USAGE CLASSES, BOTH MEASURED.** *on the weekend* is American: **2 sites against 9
of *at the weekend***, and the two are one sentence shared by 周末 and Level 4's 平常. **in hospital**
takes no article in British English, which 住院's second line had wrong, and its first reached for
*hospitalized* — American spelling and a register no learner needs. Neither is a table row; both are
one sentence each.

**SEVEN SINGLE-CHARACTER CARDS GAINED `Compounds`** — 越, 脏, 张, 照, 中, 种, 纸 — five of them with
nothing at all in their own deck's panel. **脏's rows are all the zāng the card teaches**, its other
reading zàng being an internal organ and a different word; 照's panel is already five words deep, so
its rows go elsewhere.

**WHAT WAS READ AND LEFT.** 越's gloss ended on a four-dot ellipsis (*the more...the more….*), a
typographical slip now set properly. 只能's third line read *Some people must be friendzoned* — internet
slang for a sentence that says nothing of the kind. 脏's third called a dirty shirt *stained*. And
**照片's `check-example-fit.js` finding is a false positive**: 她喜欢拍照片 segments 拍照|片 because
拍照 is itself a card, but 照片 really is the word there (拍 + 照片). 种 keeps its measure-word gloss:
its other reading, zhòng *to plant*, would need the Pinyin and Bopomofo changed as 中 and 为 have, and
no sentence on the card uses it — recorded rather than done.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 338 → 338; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 353 → 365;
`build-lang-decks.js` re-run.

## Batch 40 — hsk30l3 notes 481–491 (字典 → 作业), and **Level 3 is finished**

The deck's last eleven notes, **five cards changed** across 14 fields. **`hsk30l3` is now read card by
card end to end — all 491 notes**, over batches 1 and 20–40.

**THE FULLEST CHARACTER PANEL IN THE DECK, AND EVERY WORD IN IT THE EMPTY SUFFIX.** 子's tap panel shows
**ten** words from its own deck — 电子书, 房子, 句子, 筷子, 盘子, 瓶子, 裙子, 勺子, 屋子, 箱子 — and so
do all three of the card's own sentences (车子, 鞋子, 家子). Not one of them is the 子 the gloss
describes: *child, offspring, seed, small thing*. Its `Compounds` rows are therefore 儿子, 孩子 and
种子, the three words where the character still means something. **A full panel is not the same as a
useful one**, which is a different reason for going elsewhere from the one 照 and 行 gave.

**嘴's rows omit 嘴巴, that card's own `not X` disambiguator** — the trap 树 sprang in batch 35 and 牙 in
batch 37, met a third time and now looked for before the rows are written.

**总 named three parts of speech over the adjective alone** — *overall, general, chief* — while all
three of its sentences are the adverb. Split, with the adverb worded *always; all the time* rather than
总是's *always, invariably*, which is the very next card in the deck. **最后 read *lastly***, which fits
none of its three sentences (attributive *last*, *in the end*, *last*); another standing
`check-gloss-source.js` finding, now off its list. **字典's own point was lost in its own example**: a
字典 is a dictionary OF CHARACTERS, and its third line read *This word can't be found in the dictionary*
for 这个字.

**WHAT LEVEL 3 LOOKED LIKE, over 491 notes.** The recurring faults, in the order they turned up most
often: a gloss that is the dictionary's leading sense and not the card's (开机's class, met on 难过,
盘子, 请客, 球场, 心里, 照, 主要, 只有, 最后); a card contradicting itself, its gloss having chosen one
English word and its sentences using another (沙发, 司机, 小区, 校长, 行李, 运动会, 脏); a part of
speech named and never glossed (清楚, 生活, 瘦, 双, 习惯, 要求, 选择, 总); a headword swallowed by a
longer word, which `check-example-fit.js` can only see when the segmenter happens to straddle it (汽车
in 公共汽车, 前年 in 大前年, 市 in 好市多, 山 in 人山人海, 西 in 南西, 树 in 树熊, 甜 in 甜心, 羊 in
羊毛, 语言 in 语言学, 牙刷 and 有关, both invisible); and small American-usage classes, of which only
three were worth a table row.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 338 → 338; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 365 → 368; both
`not X` hints in range survived; `build-lang-decks.js` re-run.

## Batch 41 — hsk30l4 notes 1–30 (爱情 → 便于), and **Level 4 opens**

Thirty notes read in deck order, **eleven cards changed** across 21 fields. Level 4 is 990 notes, twice
Level 3's, and its first thirty already show the same fault shapes — which is worth stating, because it
means the classes the first forty batches established travel rather than being Level 3's own.

**AN ELEPHANT'S 鼻子 IS A TRUNK.** 大象鼻子长 read *An elephant has a long nose*, on the card whose
whole subject is that word. The Chinese is right and the English is the kind of translation that reads
perfectly until you notice what it is about.

**A CARD LABELLED A VERB OVER A NOUN.** 安检 gave *security check* under **verb**, and all three of its
sentences are the noun (过安检, 机场的安检, 安检机). CC-CEDICT gives both — it is an abbreviation of
安全检查 — and the card teaches one. **抱歉 is the mirror image**: *adjective* over the verb
*apologise*, with all three sentences the adjective. Batch 31's third shape, twice in thirty notes.

**背包 WAS A KNAPSACK.** That is CC-CEDICT's first word for it and dated in British English; a 背包 is a
rucksack, and the card's own second line already says *backpackers*.

**TWO CARDS SHOWED ONE STATEMENT TWICE.** 爱心's 他很有爱心 and 他是一个很有爱心的人 were *He is very
loving* and *He is a very loving person* — and **loving is not what 有爱心 says**: the dictionary gives
*compassion; kindness; care for others*. 办公's first two were both 办公桌, a desk, which swallows the
headword, and both English lines are about a desk and neither about working.

**FOUR SINGLE-CHARACTER CARDS GAINED `Compounds`** — 棒, 背, 笨, 按. **按's rows deliberately go to the
PRESSING sense**: its own panel is 按时 and 按照, the next two cards, both of them the *according to*
preposition, so a reader met the character twice in the sense its own gloss lists second.

**SMALL BRITISH-USAGE FIXES.** 安检's first line said *pulled out of LINE* for *a pat-down* — British
English queues, and is searched. 毕业生's first was missing an article (*with diploma*).

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 338 → 338; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 368 → 371;
`build-lang-decks.js` re-run.

## Batch 42 — hsk30l4 notes 31–60 (标准 → 材料)

Thirty notes read in deck order, **fourteen cards changed** across 35 fields.

**A CARD WHOSE GLOSS DID NOT CONTAIN THE WORD ITS THREE SENTENCES ARE ABOUT.** 表's examples are
我的表停了, 我没带表 and 这只表多少钱 — all three a WATCH — and its gloss read *surface, exterior, to
show, to express*. CC-CEDICT files the timepiece under the separate traditional form 錶, which is
presumably how it fell out. Its `Compounds` rows go the same way: the card's own panel is five words
deep and every one of them is the *express* or *table* sense, so the rows are 手表, 代表, 外表.

**并 IS THE SAME THING WITH THREE PARTS OF SPEECH.** It read *to combine, to merge* under
*verb / adverb / conjunction*, and its sentences are 反思并回应 (the conjunction), 他并没有来 and
并不是不可以 (the adverb that strengthens a negative). Not one is the verb. Split three ways and
tagged.

**THREE GLOSSES WERE MALFORMED, WHICH IS A CLASS OF ITS OWN.** 不断 read *ceaseless; uninterrupted;
continual continuous;* — two words run together with no separator and a semicolon left hanging. 不如
read *it would be better to …not as good as*, CC-CEDICT's two senses with nothing between them. 不光
read *not the only one*, a noun phrase for a construction. **With 西北's and 园's truncations in
Level 3, that is five glosses the audit has found broken as TEXT rather than wrong as content** — no
checker here looks at a gloss's shape, and a reader meets every one of them.

**TWO SENTENCES WERE 不 PLUS A DIFFERENT WORD.** 不过's first was 我不过生日 — 不 + 过生日, *I don't
celebrate my birthday*, which its own English says; the headword 不过, *however*, is not in it. And
**不便's second and third were both 不便宜, 不 + 便宜, *not cheap*** — which is the same shape from the
other side, and worse: **both were ADDED by an earlier batch**, so the harvest guard passed them. That
guard refuses a sentence whose headword is swallowed by a LONGER word; here the headword's two
characters are split between two SHORTER ones, which is the direction `check-example-fit.js`'s own
header says a corpus-internal test cannot see.

**AND REPLACING THEM NEEDED THE RECORD'S `ex` ARRAY REWRITTEN, NOT APPENDED TO.** The first attempt
added two authored rows to the two that were already there; the applier takes `slice(0, room)` with
`room = 3 − kept.length`, so it wrote the OLD two and dropped the new, and the card came back
unchanged with nothing reported. **When a card's bad sentences are the record's own, replace the array
and name them in `dropEx`** — appending silently loses the repair.

**步 LOST A RIFLE** (步枪, its own word, whose English mentions no step) and 表现 lost
我想你表现我怎么做那个, which is not Chinese anybody writes — 表现 is not the verb for showing somebody
how, and the English beside it is the original the machine translation came from.

**FOUR SINGLE-CHARACTER CARDS GAINED `Compounds`** — 表, 步, 部, 擦 — and **部's panel is seven words
deep**, the second fullest the audit has met.

**SMALLER FIXES.** 博士's second line called a 博士 a *professor* (that is 教授, a different card).
擦's second said *erased* the blackboard, which is American for what British English wipes, and its
third *scraped* shoes clean, which is a different action from 擦. 材料's second asked what *stuff* a
jacket is made of on a card glossed *material*. 部分's first ended with no full stop.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 338 → 338; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 371 → 377;
`build-lang-decks.js` re-run.

## Batch 43 — hsk30l4 notes 61–90 (参观 → 出行)

Thirty notes read in deck order, **thirteen cards changed** across 30 fields.

**A THIRD TRUNCATED GLOSS.** 场 read *[a level open space (eg. a threshing ground, market,* — no closing
parenthesis, no closing bracket — and it described a NOUN under a *measure word* label. After 西北 and
园 in Level 3 that is three cut off mid-sentence, and 不断, 不如 and 不光 malformed in the batch before:
**six glosses broken as text rather than wrong as content, and nothing in the pipeline looks at a
gloss's shape.** 乘 is the seventh — *to ride on; avail oneself of to multiply*, two senses run together.

**A `not X` HINT RETIRED BY GLOSSING THE DISTINCTION IT WAS PATCHING.** 茶叶 was glossed *tea*, which is
茶's own gloss, and the two were kept apart by a `not 茶` block. But 茶叶 is the **leaves**, the dry
product — CC-CEDICT reads *tea; tea leaves*, its measure words are 盒 and 罐, a box and a tin, and its
own second sentence is 茶叶蛋. Glossing it properly dissolves the collision, so the applier's own rule
drops the hint with the rebuild and the record's `hints` entry goes with it. **Shared-gloss groups
338 → 337 and still-ambiguous unchanged at 2**, which is what says the hint was a patch rather than a
distinction. **A hint is worth reading as a question about the gloss under it.**

**餐厅 WAS A CANTEEN**, which is none of the three things its own sentences are (a cafeteria, a dining
room, a restaurant). **出口** named one of three senses while its second sentence, 就要说出口了, is
another.

**TWO SENTENCES WENT.** 厕所 opened on 你是个厕所！ — *You are a toilet!*, an insult that teaches the
word in the one context where it says nothing about a lavatory. 厂 carried
在汤姆的语句制造厂中，松鼠写句子 — *Squirrels write sentences in Tom's sentence factory*, one of the
corpus's joke sentences, inside a compound nobody uses.

**FIVE SINGLE-CHARACTER CARDS GAINED `Compounds`** — 厂, 场, 乘, 迟, 重. **场's panel is three words and
every one of them the noun**, so a reader met the measure word nowhere; 重's is six deep, so its rows go
elsewhere and show both readings, 重复 being the chóng no sentence on the card illustrates.

**SMALLER FIXES.** 参观's third called a 家乡 a *home country* (it is a home town). 厕所's second said
*restrooms*. 超过's third read *I have not more than ten books*. 出现's third read *WHEN did the error
occur* for 怎么, which is how. And 出行's first was 他喜欢骑马出行 with the word-by-word English batch 36
corrected on 骑's card — **the same sentence is carried by two cards and each keeps its own English**, so
a fix on one does not reach the other.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 338 → 337, the 茶/茶叶 pair dissolving and nothing new appearing;
pinyin clean; example-fit 143 and senses 152 unchanged; british 0; 34,596 blocks with spoken == visible
on every one; sense-tagged 377 → 383; `build-lang-decks.js` re-run.

## Batch 44 — hsk30l4 notes 91–120 (出租 → 打折)

**What the batch was.** The next thirty notes of Level 4 in deck order, read card by card against the
five questions. Fifteen cards changed: four sentences replaced, four English lines corrected and seven
single-character cards given a `Compounds` block.

**A SENTENCE CAN CONTAIN ITS HEADWORD, SEGMENT ON IT, AND STILL NOT BE ABOUT IT — AND HERE THE REASON IS
THAT THE REAL WORD IS NOT A HEADWORD ANYWHERE.** 出租's first line was 我从出租车上下来 — *I got out of the
taxi*. 出租车 is a fixed word, and it is in NO deck in the collection, so `check-example-fit.js`'s own
lexicon has nothing longer than 出租 to match: the segmenter lands squarely on the headword, the
characters really are there, and the checker is right to report nothing. This is batch 26's 加拿大人
finding one word along, and it is worth stating the general form: **the checker can only be fooled by a
compound it does not know, so the compounds that fool it are exactly the ones no exam syllabus lists** —
and a taxi is as ordinary a word as there is. Replaced with an authored sentence.

**THREE MORE SENTENCES WENT, each for its own reason.** 厨师's third was 他喜欢我！—厨师的母鸡说 — *He
likes me! - The cook's hen said*, one of the corpus's joke lines, so a learner meets 厨师 beside a talking
chicken. 从中's first and third were the same sentence twice, 从中选一个 and 从中选择一人, so two of three
lines taught one construction; the replacement uses 从中得到 instead of a third 选. And 从来's second was
我从来没乘坐船, which **wants 过**: 从来没 takes the experiential, so the line is ungrammatical rather than
merely stilted, and 乘坐船 is written-register where the everyday word is 坐船. Nothing in the pipeline
inspects a sentence's grammar — it segments, it speaks and it translates, and it is still wrong.

**SEVEN SINGLE-CHARACTER CARDS GAINED `Compounds`** — 窗, 吹, 此, 粗, 村, 存, 答. **存's panel is EMPTY
against sixteen words in the collection**, the widest gap this level has shown, and 吹's is empty against
three. 此's four are all in the deck already (此次, 此外, 从此, 因此) so its rows go elsewhere — 如此, 此时,
彼此. Every row's reading and gloss was checked against CC-CEDICT before it was written.

**FOUR ENGLISH LINES.** 错过's third read *Life is always a mistake*, which is 错 and not 错过 — the card
is about missing chances and its English said the opposite of its own gloss. 打印's first said *copy
documents* for 打印文件 on a card glossed *print*, in a sentence whose other clause is about a printer
breaking down. And **the two remaining `on weekends` sites were corrected together**: 打工's first here
and `hsk30l7/航海`'s, against TEN uses of *at the weekend* elsewhere in the decks. **Two sites is not a
table row** — `exLexis` governs a substitution worth applying in one place, and this is not a substitution
at all, the difference being the preposition and the number.

**Read and left.** 此外's *Moreover, I can fly* and 从此's *I've decided to stop wearing underwear* are
both odd content out of the subtitle corpus and both teach their connective correctly; 此's 他不再工作于此
is written-register rather than wrong. 粗's own sentences include 粗话, which is why that word is a fit
`Compounds` row rather than a coarse finding.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 337 → 337; pinyin clean; example-fit 143 and senses 152 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 383 unchanged;
`build-lang-decks.js` re-run.

## Batch 45 — hsk30l4 notes 121–150 (打针 → 低于)

**What the batch was.** The next thirty notes of Level 4 in deck order. Eighteen cards changed — the
heaviest batch of the level so far, and the reason is that this stretch is full of glosses whose LABEL
and whose WORDS are different parts of speech.

**A GLOSS MISSPELT ITS OWN SUBJECT.** 导游 read *lead a site-seeing tour* — sightseeing — and it described
only the verb, where all three of the card's own sentences are the noun: 不要怪导游 (the tour guide),
这本导游册子 (a guidebook), 我为你充当导游 (to act as a guide). Nothing in the pipeline reads a gloss as
English: `check-british.js` sweeps for American spellings and a misspelling is neither. Two more of the
same family: **道歉 was labelled a VERB and glossed with the NOUN 'apology'**, and **等到 was labelled a
PREPOSITION**, which it is not — CC-CEDICT reads *to wait until; by the time when*, and both of the card's
first lines take a clause.

**A CARD TWO OF WHOSE THREE SENTENCES WERE NOT ITS WORD.** 大大 is glossed as the adverb *greatly*.
木星是太阳系里最大大行星 is 最大 + 大行星 — the word is not in the sentence at all, the characters being an
accident of two others meeting; 她面带大大的笑容 is the reduplicated ADJECTIVE 大大的, *big*, a different
word. Only the third line taught the adverb. Both replaced. **道's first line was 下水道堵了, a SEWER**,
and there the checker is blind by design — single-character headwords are exempt, which is batch 27's 东
and 发 finding again. **低价's second was the record's OWN**, 我觉得我们得调低价格, harvested from 低's
card where it is correct and where here the headword straddles 调低|价格; a drop alone cannot reach a row
the applier re-adds, so the array was replaced and the sentence named in `dropEx` — batch 42's rule doing
its work a second time.

**THREE MORE SENTENCES WENT.** 大厅's second was an English proverb translated into Chinese (*welcome both
in bower and hall*), which teaches neither the word nor anything a learner will ever say; its third counted
a telephone with 支, the measure word for pens and sticks. And 道路's first was 我爱的道路 — a noun phrase
with no verb and no full stop, meaning *the road I love*, under an English line reading *I love roads*.

**FIVE SINGLE-CHARACTER CARDS GAINED `Compounds`** — 待, 戴, 当, 倒, 刀 — **and four of the five panels are
empty**, 待 against thirteen words in the collection and 倒 against fourteen. 当's and 倒's rows deliberately
carry the reading no sentence on the card illustrates (上当 dàng, 倒车 dào).

**FOUR DUAL-READING CARDS WERE TAGGED** — 待, 当 and 倒, the last two dǎo to one dào so a reader can see
which line the `Say` field's 倒是 belongs to — and 道's three tags moved with its new sentence order.

**FIVE ENGLISH LINES.** 单位's second used the gloss's own word as the translation (*appear in my unit*,
for 工作单位, a workplace). 当时's third read *There was only three people*. 到来's first read *Thanks for
arriving*. 低于's second called 光盘 *records*, a century out. And 得意's first was given the English
proverb *Every dog has his day* — **a proverb may be rendered by its English equivalent where the
equivalent shows the word, and this one mentions a dog.**

**Read and left.** 戴's 你有戴手表吗 is southern usage rather than an error; 此's written-register siblings
in the batch before are the same judgement. 大巴's 大巴车 is a real word containing the headword.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 337 → 337; pinyin clean; example-fit 143 and senses 152 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 383 → 392;
`build-lang-decks.js` re-run.

## Batch 46 — hsk30l4 notes 151–180 (底 → 多样)

**What the batch was.** The next thirty notes of Level 4 in deck order. Twenty-one cards changed, and the
batch is dominated by one fault: **the label and the gloss naming different parts of speech**, which
batch 45 met three times and this one meets three more.

**A FOURTH TRUNCATED GLOSS.** 掉 read *lose; [as a complement after some verbs to indicate* — no closing
bracket, no end to the sentence — after 西北, 园 and 场. **All three of the card's own sentences are that
complement** (脱掉, 跑不掉, 吃掉) and not one is *to lose*, so the split names both and the tags say which
is illustrated. **Nothing in the pipeline reads a gloss as a piece of English**, which is why four of
these have now been found by eye and none by a checker.

**THE LABEL-AGAINST-GLOSS FAULT, THREE MORE TIMES.** 调查 was labelled a VERB over the noun *investigation*
— and all three of its sentences are the noun. 堵车 was labelled a VERB over the noun *traffic jam*, where
its own lines are both. And 顿's gloss read *measure word for meals or events; pause* UNDER a label reading
*verb / measure word*, so the words "measure word" appeared twice on one card and the verb sense had no
gloss of its own. Two more glosses were wrong as English rather than as grammar: **度假 read *to go on
holidays***, which is the American *on vacation* wearing a British word, and **电动车 read *Electric
vehicle***, capitalised mid-card and naming one of the two things the word is, where the card's own
sentences are two electric bikes to one vehicle.

**FIVE SENTENCES WENT.** 顿's second was 我刚到，让我安顿一下 — 安顿 swallows the character and means *to get
settled*, which the English on the card did not say either. 多样's second was ungrammatical, ending on 的
with no noun after it. 地球's first was the fragment *Earth appeared*. And **two cards said the same thing
twice**: 肚子's first and third were both being hungry, 点名's first and third both somebody missing the
register — the second of those being the record's OWN row, so the array was replaced and the sentence named
in `dropEx`, batch 42's rule for the third time.

**A STRAY SPACE.** 堵车's first line carried one after its comma, on the card and in the spoken field alike
— the shape batch 32 measured across 32 blocks, and one the deck-level punctuation pass cannot see, since
that pass matches a mark sitting IMMEDIATELY after a character.

**FOUR SINGLE-CHARACTER CARDS GAINED `Compounds`** — 掉, 定, 订, 顿, three of the four panels empty. **定's
is two words against fifty-two in the collection, the widest gap the level has shown.** 底 (three) and 队
(four) were measured and left. 顿's rows name 安顿, the word that swallowed the character in the sentence
this batch dropped.

**SEVEN ENGLISH LINES.** 对面's first read *in front of* for a word glossed *opposite* — a garden in front
of a house is on the same side of the road. 多数's read *many* for *most*; 读者's turned one book into
*these books*; 订's invented *our seats on a plane* for 机票; 对于's dropped 对于这个 entirely; 多么's read
*Life is so complicated* for an exclamative glossed *how ...*; and 地球's *Earth day* wanted its capital.

**Read and left.** 队员's third line carries a curly apostrophe, one of the 69 measured in batch 38 and
deliberately not swept as a class. 对于's 对于我 is written-register rather than wrong.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 337 → 337; pinyin clean; example-fit 143 and senses 152 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 392 → 398;
`build-lang-decks.js` re-run.

## Batch 47 — hsk30l4 notes 181–210 (而 → 父亲)

**What the batch was.** The next thirty notes of Level 4 in deck order. Twenty-two cards changed. The
glosses in this stretch are the worst the audit has met: **a fifth truncation, a gloss that is not English,
and five more where the label and the words disagree.**

**A FIFTH TRUNCATED GLOSS.** 幅 read *width of cloth; [measure word (for paintings, pictures,* — no closing
bracket, no closing parenthesis, and the words "measure word" inside a gloss whose LABEL already says
measure word. After 西北, 园, 场 and 掉. All three of its own sentences are the measure word, so it leads.

**AND ONE THAT WAS NOT ENGLISH.** 反对 read *to fight against; to opposed to something*. **丰富 ran two
senses together with the separator missing** — *enrich; abundant rich; plentiful* — where *enrich* is a verb
under an adjective label; **翻译 named two parts of speech against the single gloss *to translate***, so its
noun sense, which its own third sentence is, had no gloss at all; and **烦恼 was labelled an adjective**
where two of its three lines are the noun. Two more were glossed by something other than the word that
replaces them in English: **否则 read *if not*** where all three sentences are *or* or *otherwise*, and
**符合 read *tally with; accord with***, a register a learner will not meet.

**A FALAFEL ON THE CARD FOR *EXPENSE*.** 费's second line was 我刚吃了个法拉费 — a TRANSLITERATION, where the
character is present for its SOUND and has nothing to do with cost. It is the swallow this level has now
shown four times, in its purest form. **The first replacement written for it made the same mistake**:
这笔钱够付学费了 puts the character inside 学费, which is already a word in that card's own tap panel, so the
authored sentence was rewritten to use 费 as a VERB. **A replacement is checked against the fault it is
replacing.**

**THREE MORE SENTENCES WENT.** 法律's first was 新人新法律, a four-character slogan with no verb. 烦's second
was 要用心，不要操心、烦心 — three verbs in a row, and its 烦心 the same compound the card's third line already
used, so none taught 烦 on its own. And 房东's first was *when the cat's away, the mice will play* translated
word for word into Chinese, which is neither a Chinese saying nor a sentence anybody will use.

**A MISSING FULL STOP.** 放弃's third line had none at all, on the card and in the spoken field alike.

**FIVE SINGLE-CHARACTER CARDS GAINED `Compounds`** — 而, 烦, 幅, 付, 份. 幅's panel is empty; 而's is one
word against thirty in the collection. 法 (seven in deck), 费 (five) and the rest were measured and left.

**NINE ENGLISH LINES.** 发出's second read *We've sent the invitations yesterday*, which a present perfect
cannot do, and its third was not a sentence. 父亲's first called him *Dad*, which is 爸爸 and is the whole
distinction the card teaches. 父母's read *look to* for 照顾, which means to rely on. 分为's turned 书 into one
book that was divided into categories. 方面's and 费用's dropped the headword out of the English entirely.
丰富's third invented *everyone is rich and beautiful* out of a sentence about an inner world. 儿童's read
*these* for 他们. And 放弃's first read *We never gave up* for the habitual 从不.

**Read and left.** 分数 is glossed *(exam) grade* and CC-CEDICT also gives *fraction*; the card's three
sentences are all exam scores, so the narrower gloss is the card's own. 符合's *That's logical* is the
natural English for 那符合逻辑 even though it hides the headword.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 337 → 337; pinyin clean; example-fit 143 and senses 152 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 398 → 407;
`build-lang-decks.js` re-run.

## Batch 48 — hsk30l4 notes 211–240 (复印 → 歌手)

**What the batch was.** The next thirty notes of Level 4 in deck order, plus the two Levels 7–9 cards
carrying a sentence this batch corrected. Twenty-four cards changed.

**SIX GLOSSES WHOSE LABEL NAMED A PART OF SPEECH THE GLOSS HAD NOT GOT.** 负责 was *verb / adjective* over
*responsible for*, which is an adjective PHRASE, so the verb its own three sentences all are had no gloss.
感觉 was *noun / verb* over *feel*. 感 was labelled a SUFFIX and glossed only as one, where two of its
sentences are the verb. 感受 ran a verb and two nouns together with nothing between them. 赶紧 put a
participle phrase and a VERB under an adverb label. And 高于 read *greater than*, an adjective phrase under
a verb label, on a card whose sentences are a temperature, a death rate and an output — all higher rather
than greater. **This is the same fault batches 45, 46 and 47 each met three to five times**: the class is
now fourteen cards across four batches, and every one was found by reading the label against the words.

**AND ONE GLOSS THAT WAS TOO NARROW FOR ITS OWN CARD.** 赶 read *to catch up*, which is one of the things
the character does and **none of the three its own sentences do** — 赶时间 is to be in a hurry, 赶你走 is to
drive somebody out, 赶来 is to hurry over.

**AN ENGLISH LINE ABOUT THE WRONG PEOPLE.** 感情's third read *I don't like him any more than he likes me*
for 我们之间已经没有感情了, which says there are no feelings left BETWEEN US — neither 我 nor 他 is in the
sentence, and the English is a different claim about a different number of people. 胳膊's second called an
arm an ELBOW (肘), on a card whose one-word gloss is *arm*; 歌声's first made a 歌声 into countable *songs*;
钢琴's turned 不错 into *without mistakes*; 改's turned 该 into *had to* and then asked *where do we have to
change*, which in English is about trains.

**THREE SENTENCES WENT.** 复杂 and 改变 each said the same thing twice — 语法非常复杂 beside 语法是很复杂的,
and 什么都不会改变 beside 什么都改变了. And **父子's first line was 父父子子**, a fragment of the Confucian
君君臣臣父父子子, which is not a sentence and **does not contain the word**: what is on the card is 父父
followed by 子子. It was the record's own row, so the array was replaced and the fragment named in `dropEx`.

**THE `highway` SITES, AND WHY THEY ARE NOT A LEXIS ROW.** 高速's two sentences called a 高速路 and a
高速公路 a *highway*, which is American; the British word for that road is a motorway, and the same sentence
is carried by 驮 and 货运 in Levels 7–9, so four sites were corrected together. **It must not become a
`exLexis` row**, and the reason is batch 30's `program` finding exactly: 公路 on its own is an ordinary main
road, which British English does call a highway in law, so the right word depends on which road the sentence
means. **Two sites are left standing and are recorded here rather than swept**: `hsk30l4/公路` is glossed
*highway* while its own three sentences translate it *the street* and *the road*, and `hsk30l5/架` renders
上高架 as *take the highway* where 高架 is a flyover. Both are outside this batch's range and both want
reading rather than replacing.

**TWO SINGLE-CHARACTER CARDS GAINED `Compounds`** — 改 (one word in the deck against seventeen in the
collection) and 敢, whose two rows are **both of the other words the whole collection holds** on that
character. 赶 (three) and 感 (six) were measured and left.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 337 → 337; pinyin clean; example-fit 143 and senses 152 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 407 → 413;
`build-lang-decks.js` re-run.

## Batch 49 — hsk30l4 notes 241–270 (各 → 管理), plus the `railroad` class

**What the batch was.** The next thirty notes of Level 4 in deck order, plus one word-choice class swept
across all nine decks. Twenty-seven cards changed.

**THE FIRST NEW LEXIS ROW SINCE BATCH 24.** `railroad` → `railway`, with `railroads` → `railways` declared
beside it on batch 35's plural rule. **It is the case batch 48 refused for `highway` and this one passes**:
a railroad is a railway wherever it occurs, with no second sense to protect, where 公路 on its own really is
a highway in British legal English while 高速公路 is a motorway. Measured over the nine decks: **seven
occurrences on four cards against 27 `railway`s**, every one read, and **not one a proper noun** — which is
the check that matters, an American railroad company's NAME being a name. **The row reaches a place a
per-note fix would not have**: `hsk30l5/铁路`'s own GLOSS was *railroad*, and it is now *railway* without
anybody writing a row about that card. Residual: zero.

**`mall` WAS MEASURED IN THE SAME PASS AND DELIBERATELY LEFT.** Nine sites, and `hsk30l2/商场`'s own gloss
is *shopping mall*, which is ordinary British English — Bluewater and Westfield are shopping malls. The
finding there is the sweep's and not the deck's, which is what `stove` and `vest` were in batch 32.

**A CARD WHOSE GLOSS ITS OWN TRANSLATIONS CONTRADICTED.** 公路 was glossed *highway* — the site batch 48
named and could not reach, being outside that range — while its own two English lines already called it
*the street* and *the road*. Both the gloss and the *street* are corrected here; a 公路 is an ordinary main
road.

**SIX MORE LABEL-AGAINST-GLOSS CARDS**, which makes twenty across five batches: 共同 *adjective* over the
adverb *jointly*; 故意 *adverb* over the adjective *intentional*; 购物 *verb* over the noun *shopping*; 够
*verb / adverb* over the bare *enough*, which is not a verb; 关键 *noun / adjective* over two senses run
together inside a bracket; and 管理 glossed *to supervise*, narrower than any of its own three lines. 功夫's
was wrong a different way — glossed *labour; ability; kung fu* where **all three of its sentences are time
or effort and not one is a martial art**.

**SIX SENTENCES WENT.** 各种's second was ungrammatical (各种 is a determiner and takes no 的). 工资's third
counts wages with 很多 in a 有 clause, which Chinese does not do. 共's was the slogan 共产主义必胜, where
共产主义 swallows the character whole. 购买's rested on 整修品, which is not a word. 管's was about a
管风琴, an ORGAN. And **挂 had 挂科 — student slang for failing an exam — on two of its three lines**, saying
the same thing twice and neither of them the hanging the card is glossed for.

**THREE SINGLE-CHARACTER CARDS GAINED `Compounds`** — 共, 够 and 挂, the last against an empty panel. 够's
single row is the one word of the four in the collection its own deck had not already met.

**FOURTEEN ENGLISH LINES.** Three were American beyond the two tables' reach — *round-trip* on 各地,
*paycheck* on 工资 (the corpus's only site) and *sassy* on 姑娘. Three named the wrong thing: 顾客's
customers were an *audience* and then *visitors*, and 工厂's dismissed workers were *laid off*, which is a
job going rather than a judgement on the worker. And 估计's first read *How large is the audience?*, which
drops the card's whole subject and turns a guess into a fact.

**Read and left.** 管理's own third line, 日本政府无法管理问题, takes 问题 as the object of 管理 where Chinese
would use 处理; it is recorded rather than replaced, since the card is not about that verb. 工人's
你真是个努力的工人 is redundant in both languages and is the corpus's, not the card's.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 337 → 337; pinyin clean; example-fit 143 and senses 152 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 413 unchanged;
`build-lang-decks.js` re-run.

## Batch 50 — hsk30l4 notes 271–300 (光 → 怀疑), plus the `skeptical` class

**What the batch was.** The next thirty notes of Level 4 in deck order, plus one spelling family swept
across all nine decks. Twenty-two cards changed.

**A FOURTH FAMILY `SPELL_PAIRS` HAS NEVER HELD.** `skeptical` is not in app.js's table at all — it is a
k-for-c spelling, not a word choice, so `exLexis` cannot take it either — and **`check-british.js`
therefore reads 0 over the whole family whatever the decks contain.** This is the -logue class of batch 27
and the -ward class of batch 29 a third time, and it is repaired the same way, per note: five American
spellings against one British, on three cards. **And one of the three CONTRADICTED ITSELF** — `hsk30l7/半信半疑`
glossed itself *skeptical* while its own third sentence said *sceptical*, which is the shape batch 32 found
on the metre cards. Residual: zero.

**The running list of what a reading of 0 from that checker does not cover is now four:** `-logue`
(absent), `-ward` (absent), `programme` (present but one-way), `skeptic` (absent). **Grep the families by
hand after a content batch.**

**FIVE MORE LABEL-AGAINST-GLOSS CARDS**, which makes twenty-five across six batches. 光 was labelled *noun /
verb / adjective* against the single gloss *light*, and **its own third line is the ADVERB 'only'** — a
sense the label does not even name. 广播, 规定 and 好好 each named two parts of speech against one gloss,
and in all three every sentence on the card is the sense that was glossed, so the reader met one use and was
tested on two. 过程 was glossed *course of events*, a narrative rather than a process, where its own three
English lines already say *process*.

**TWO FIXED COMPOUNDS THAT SWALLOW THEIR CARD'S WORD, ON ONE CARD.** 国际's first line was 开什么国际玩笑,
the idiom *you must be joking* — nothing in it is international, and its English supplied a *stupid* that is
not there — and its second was 国际象棋, which is simply CHESS, a word whose two halves say nothing about
the game. Two of three lines, both replaced.

**FOUR MORE SENTENCES WENT.** 逛's first was ungrammatical (the aspect marker cannot sit between 去 and its
purpose clause) and duplicated the second's English. 厚's third had frost falling as 下厚霜 where Chinese
says 下霜. 航班's first was a cancelled flight one line above another cancelled flight, **and had no full
stop**, so dropping it settled both. And 忽然's third ran to forty characters and two clauses of simile — a
fine sentence and not an example — which was the record's own row, so the array was replaced.

**FOUR SINGLE-CHARACTER CARDS GAINED `Compounds`** — 光, 厚, 喊, 汗, three of the four panels empty and 厚's
against thirteen words in the collection. **逛 was measured and left because the collection holds NO other
word on that character at all**, which is the first time that has been the answer.

**NINE ENGLISH LINES.** 光's third was given the proverb *All that glitters is not gold*, which carries not
one word a reader could match to the headword — **and that line is the card's only example of the adverb
sense**, so the English was hiding the very thing the split had just named. 合格's first read *qualified as a
nurse*, which says she holds the certificate, where 合格的护士 says she is one. 害羞's third read *ashamed*
for a card glossed *shy*. 好好's second put the adverb in the one place English will not take it, and its
third dropped the headword entirely. 航班's *nonstop* wanted its hyphen and 广告's *aimed towards* wanted
*at*.

**Read and left.** 寒冷's 我喜欢寒冷 uses an adjective as a bare object, which is marginal rather than wrong;
互联网's second line has 主要 before 互联网 where the order wants 主要的互联网, and is the corpus's fault
rather than the card's.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 337 → 337; pinyin clean; example-fit 143 and senses 152 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 413 → 425;
`build-lang-decks.js` re-run.

## Batch 51 — hsk30l4 notes 301–330 (坏处 → 记者)

**What the batch was.** The next thirty notes of Level 4 in deck order, plus the other half of a
disambiguator pair that this batch's work retired. Twenty-one cards changed. **Nine of them are the
label-against-gloss fault**, which takes that class to thirty-four over seven batches and makes it far and
away the commonest thing wrong with these decks.

**A CARD WHOSE OWN FIRST LINE WAS THE ONE SENSE ITS GLOSS HAD NOT GOT, TWICE OVER.** 活 is labelled
*noun / verb / adjective* and glossed *to live; alive; living*, which is the last two — and its FIRST
sentence, 活快干完了, is exactly the missing noun: a job nearly finished. Nothing on the card said 活 could
mean work at all. 技术 is the same shape one gloss along: glossed *technology*, where 他的技术是公认的 is his
SKILL and the card's own English already said so. **The tell in both is that the card contradicts itself in
English**, which costs one glance per card and is how every one of these has been found.

**AND THE MIRROR OF IT: A CARD WHOSE GLOSS NAMED A SENSE NONE OF ITS SENTENCES USE.** 环保's three lines
are all the adjective and its only gloss was the noun; 激动's three are all the adjective and its only
gloss was the verb; 回忆's gloss was the verb where two of three are the noun; 基础's was the bare noun
where two of three are attributive. 回信 and 活动 each named two parts of speech against one gloss, and
积极 was glossed *active*, which is not what 积极方面 — *the positive side* — means.

**A HINT PAIR RETIRED ACROSS TWO DECKS.** 基础 and 基地 were both glossed *base* and were kept apart only by
each other's `not X` block. Giving 基础 its real gloss dissolves the collision, and **a disambiguator that
disambiguates nothing is worse than none**, a reader taking it for a real distinction. The senses rewrite
drops 基础's own block; 基地's had to be removed by rebuilding its gloss, **because the applier REPLACES a
hint it still holds and does not strip one the record has dropped** — so deleting a hint from the record is
only half the job. Shared-gloss groups 337 → 336, the second such retirement after 茶/茶叶 in batch 43.

**TWO OF 火's THREE LINES WERE ABOUT A TRAIN.** 火车票贵吗 and 不允许在火车上吸烟 are both 火车, a fixed
word that swallows the character whole, so one line in three taught 火 as fire. Both replaced. **Three more
cards said the same thing twice**: 及时's three lines were one English three ways, so the replacement teaches
the *promptly* sense instead; 记者's first two both asked whether somebody is a reporter; and 基本上's third
was 基本上吧, the adverb on its own with a particle after it.

**THREE SINGLE-CHARACTER CARDS GAINED `Compounds`** — 火, 货 and 寄, two of the three panels empty. **既 was
measured and LEFT**: the whole collection holds two words on that character, one of which is already in the
deck and the other a legal term, so a block would have been one row a learner will never need — the second
time after 逛 that the honest answer was no block.

**TEN ENGLISH LINES.** 既's first and third dropped the correlative the card exists to teach (*He is tall and
handsome* for 既高又帅). 技术's second turned 大数据技术 into *the network*. 会员's first called a 会员卡 a
*points card* and its third took membership *in* rather than *of*. 寄's *registered mail* wanted *post* and
its *Do you like to send it* wanted *would*. 活泼's read *an active person*, which is 积极 one card along.

**A QUESTION RECORDED RATHER THAN ANSWERED.** 换乘's second line writes Shibuya as **涉谷**, where the
standard Chinese is 涩谷. CC-CEDICT holds neither form, so it cannot be settled from the dictionary and the
card's own examples, and the card is left alone. It is the deck's only occurrence.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 337 → 336**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 425 → 446;
`build-lang-decks.js` re-run.

## Batch 52 — hsk30l4 notes 331–360 (加班 → 降低), plus the `hometown` class

**What the batch was.** The next thirty notes of Level 4 in deck order, plus one spacing class swept across
all nine decks. Thirty-two cards changed, the heaviest batch of the level.

**A CARD GLOSSING A READING IT DID NOT GIVE.** 将's gloss ended *general, commander*, which is 将 **jiàng**
— and the card's Pinyin and bopomofo said **jiāng** and nothing else, so a reader was shown a meaning they
could not have pronounced. This is the mirror of the dual-reading cards batches 45 and 48 tagged: there the
card gave two readings and illustrated one, here it gave one reading and glossed two. The card now carries
both readings, three senses each labelled with the one it belongs to, and tags saying all three of its
sentences are the jiāng adverb.

**A GLOSS THAT WAS A CALQUE.** 加油 read *to add oil*, which is the two characters rather than the meaning
— the word is to refuel and, quite separately, to cheer somebody on. **None of its three lines was
refuelling**, and its first was the fixed idiom 火上加油, pouring oil on the flames, which swallows the
headword; so the split names both senses and the replacement sentence supplies the one the card had none
of. Two more glosses were simply not English or not the word: 加班 read *over work*, and 奖金 read
*premium*, which in English is what one pays an insurer.

**THE `hometown` CLASS, ON `anymore`'S REASONING.** British style sets it as two words; the decks were split
**15 one word to 11 two, across eleven cards**, every site read and none a proper noun — **and `家乡`
CONTRADICTED ITSELF, its gloss already reading *home town* over two sentences saying *hometown*.** It is a
spacing rather than a word choice, so no judgement is needed per site, and the replacement contains a space
and can never match itself on a re-run. Residual: zero. The `gas station` sites, by contrast, are **two on
one card** and went to per-note rows — `exLexis` governs a substitution worth applying in one place.

**A CORRECTION TO BATCH 50.** That batch measured 逛's tap panel, found the collection holds no other word
on the character, and left it — reasoning there was nothing to list. **That tested the wrong thing**: a
`Compounds` row is verified against CC-CEDICT and need not exist in the decks at all, and CC-CEDICT holds
逛街, 逛逛 and 逛荡. The card has its block now. The same reasoning gives 江 one, whose panel is likewise
empty and whose collection holds a single other word.

**SEVEN SENTENCES WENT.** 假's 她请了天假 is ungrammatical, the numeral missing from inside 请假. 加上's
second used the word as a VERB OF SPEECH, which Chinese does not do, and carried a stray space besides.
家庭's second was about 家庭作业, homework. 江's third was a line of a wuxia novel with FOUR proper names, two
of them 江 as a SURNAME — the character on the card three times and never in its own sense. 健身's first ran
to fifty characters about bathhouses adding saunas. And 减 taught subtraction twice.

**FOUR MORE LABEL-AGAINST-GLOSS CARDS** — 建议, 奖, and the two named above — which makes thirty-eight over
eight batches.

**SIX ENGLISH LINES.** 加油站's two *gas stations*; 家乡's *home country*, which batch 43 corrected on 参观's
card and which each card keeps its own copy of; 将要's *He'll be asleep* for 将要睡觉, which is an action
rather than a state; 降低's *little moderation in the temperature*; 奖学金's *students who receive
scholarship*; and 健身房's *got so much slimmer lately*.

**Read and left.** 健身房's 我去注册一家健身房 uses 注册 where a gym membership takes 办卡 or 报名; 降's
他需要降班 is Taiwanese usage for being held back a year. Both are recorded rather than replaced.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 336 → 336; pinyin clean; example-fit 143 and senses 152 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 446 → 461;
`build-lang-decks.js` re-run.

## Batch 53 — hsk30l4 notes 361–390 (降价 → 进行)

**What the batch was.** The next thirty notes of Level 4 in deck order. Nineteen cards changed, plus two
Levels 7–9 cards carrying sentences this batch corrected.

**AN OBSCENE SENTENCE THAT check-coarse.js's OWN DISCRIMINATOR EXCUSES.** 交's third line was 她不喜欢口交
— *She doesn't like oral sex* — on a card glossed *to hand over; to make friends*. **This is the hole batch
30 measured and could not close**: `own()` drops a hit when the headword contains the matched term or the
matched term contains the headword, and **at a one-character headword the second branch is always true**,
every compound built on the character containing it. 交 is one character, so every term beginning or ending
in it is permanently excused. The batch-30 fix required MORE than one character of headword, which is right
and which leaves this case exactly where it was. **Its second line was the same fault without the offence** —
公交, public transport — so two of three lines swallowed the character and one taught it. Both replaced.

**A CHARACTER ERROR THE ENGLISH GAVE AWAY.** 仅仅's third line read 不能做仅仅是**接口**, an *interface*,
for 借口, an excuse — **and the card's own English said "excuse" all along**, which is what settles it. The
class batch 30 met on 电灯炮 and 别破妈妈发现: the sentence segments, speaks and translates perfectly, so
nothing in the pipeline can see it. The replacement is the deck's own sentence with the one character
corrected.

**A GLOSS NAMING A SENSE BELONGING TO ANOTHER READING, for the second batch running.** 结果's gloss ended
*fruit*, which is 结果 **jiē guǒ**, to bear fruit — a different word — while the card's Pinyin says jié guǒ
and nothing else. Batch 52 fixed 将 by adding the reading; here the jiē guǒ word is not what a Level 4
vocabulary card is for, so the sense is dropped and the conjunction the card genuinely lacked is named
instead.

**A SHARED-GLOSS GROUP DISSOLVED.** 街道 was glossed *road* — a group it shared with 道路 — where all three
of its own translations say STREET, and a 街道 is the built-up kind with buildings either side, which is
what its second line describes. Groups 336 → 335, the third such retirement after 茶/茶叶 and 基础/基地.

**SEVEN MORE LABEL-AGAINST-GLOSS CARDS** — 交, 骄傲, 交流, 教练, 教育, 解释 and the 结果 above — which makes
**forty-five over nine batches**. 交流 is the sharpest: labelled a VERB and glossed with two NOUNS. Three
more glosses were simply the wrong word: 解释's *to justify* (which is 辩解, a claim about motives rather
than facts), 仅仅's *barely* (which is 勉强) and 进行's *advance; progress*, none of which is what any of its
three lines does.

**AN ASCII ELLIPSIS.** 郊区's first line ended in six ASCII full stops where Chinese sets ……, two ellipsis
characters. The corpus's only site, and one the deck-level punctuation pass cannot see, since that pass
converts a mark standing immediately after a character rather than a run of them.

**TWO CARDS THAT CONTRADICTED THEMSELVES, both on the same two classes.** `hsk30l7/客运` glossed itself
*Passenger transportation* — American, and capitalised mid-gloss — over three sentences of its own already
saying *passenger transport*. `hsk30l7/支票` glossed itself *cheque* over a first line saying *checks*. Both
classes are two sites and went to per-note rows: **`check` is deliberately absent from `SPELL_PAIRS`**
because 66 of its 73 corpus sites are the ordinary verb, so the banking sense can never be swept.

**THREE MORE SENTENCES WENT.** 今后's first carried 会 TWICE, before the preposition and before the verb.
节约's first repeated 我 either side of the verb where the relative clause wants 我所有的钱. 教育's third was
a subjectless fragment whose 教育系 swallowed the headword into a department name.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 336 → 335**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 461 → 476;
`build-lang-decks.js` re-run. Residuals for `transportation`, the ASCII ellipsis and 接口: zero.

## Batch 54 — hsk30l4 notes 391–420 (禁止 → 考生)

**What the batch was.** The next thirty notes of Level 4 in deck order. Fifteen cards changed.

**A FAIL REPORTS AFTER THE WRITE; IT DOES NOT REFUSE THE RUN — AND BATCH 38's LOG SAYS OTHERWISE.** A
`compounds` block was written for 禁止 naming 严禁, 禁令 and 禁区, and the applier refused every row:
`compounds` rows must contain the card's own HEADWORD, which is the two-character word 禁止, where those
three carry only 禁. **The guard is right** — the tap panel is per CHARACTER and the `Compounds` field
belongs to the card's own word — so a single-character block cannot be parked on a two-character card that
happens to contain it. What the run then showed is that `fs.writeFileSync` sits at line 801 and every FAIL
report at 832 and after: **the good part of the batch had already landed and only the refused rows did
nothing.** Batch 38's entry says its bad `exEn` rows made the applier "refuse the whole run"; that was
wrong, and the true account is that those rows simply never applied while the rest of that batch was
written. The safeguard is that **the FAIL prints on every run, `--check` included**, so a bad row left in
the record announces itself for ever rather than drifting silently — but a session must not read a FAIL as
"nothing happened".

**A SHARED-GLOSS GROUP DISSOLVED.** 竞争 was glossed *to compete*, a group it shared with 参赛, and its own
second line is the NOUN — 精彩的竞争, splendid competition. Groups 335 → 334, the fourth such retirement.

**FIVE MORE LABEL-AGAINST-GLOSS CARDS** — 经济, 经历, 竞争, 究竟, 聚会 — which makes **fifty over ten
batches**. 经济 is the one worth keeping: glossed **economics**, which is 经济学, a third word — while its
own three lines are the ECONOMY, the adjective ECONOMIC and the adjective ECONOMICAL, none of them the
discipline. 究竟's gloss was two adverb phrases under a *noun / adverb* label, and neither of them the sense
all three of its lines use.

**FIVE SENTENCES WENT.** 禁止's first, 禁止游戏吗, is not a sentence anybody says and its English read
*Suspend the game?*. 就是's second, 不是你对的，就是我, is ungrammatical — the 不是…就是… frame takes parallel
predicates, so the 的 has nothing to attach to and the second half has no predicate at all. 剧院's third
asked an A-or-B question with 还是 AND 吗, which Chinese does not do. 烤's second was about an 烤箱, an oven,
and called it CLOSED where 关 of an appliance is turned off. And 聚's first was the idiom 好聚好散, which
swallows the character into a fixed phrase **and whose English asserts a DIVORCE that is nowhere in the
Chinese**.

**TWO SINGLE-CHARACTER CARDS GAINED `Compounds`** — 烤, whose panel is empty, and 聚. 举 (three in the deck)
and 镜 (two of the collection's five) were measured and left.

**TEN ENGLISH LINES.** 精彩's second was given the idiom *pearls before swine*, which says something the
Chinese does not and calls the audience swine into the bargain. 经历's first read *Worse things have
happened to both of us*, a comparison nothing in the sentence makes. 举例's read *to REIFY your idea*. 就是's
read *This is THE life*, which in English means the good life. 聚会's read *He loves to PARTY*. And 看法's
first dropped the headword and disagreed with the person instead of the view.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 335 → 334**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 476 → 491;
`build-lang-decks.js` re-run.

## Batch 55 — hsk30l4 notes 421–450 (棵 → 浪漫)

**What the batch was.** The next thirty notes of Level 4 in deck order. Eighteen cards changed.

**THE WORST SINGLE CARD THE AUDIT HAS MET.** 克 is the measure word for a GRAM, and **all three of its
sentences used the character for its SOUND alone**: 迈克 (Mike), 夹克 (a jacket), 迈克 again. Nothing
about weight appeared anywhere on the card, so a reader could study it to mastery and never learn what the
word means. It is batch 47's 法拉费 falafel at three times the scale, and it is invisible to every checker
here — the sentences segment, speak and translate perfectly, and `check-example-fit.js` skips
single-character headwords by design. All three replaced. **Its own tap panel makes the same point**: of
the two words the deck holds on the character, 巧克力 is a LOANWORD using it for its sound, so one word in
the panel was about weight at all.

**拉 IS THE SAME FAULT AT TWO OF THREE**: 拉倒 is the idiom *forget it*, which swallows the character into a
fixed phrase, and 拉塔 is the name *Lata*. Both replaced.

**A SIXTH TRUNCATED GLOSS.** 棵 read *individual [measure word for trees, cabbages, plants* — no closing
bracket, and the words "measure word" inside a gloss whose LABEL already says measure word — after 西北, 园,
场, 掉 and 幅. 拉's was the other malformation, two senses run together with nothing between them: *to play
(a bowed instrument) to pull*.

**FIVE MORE LABEL-AGAINST-GLOSS CARDS** — 科学, 客气, 肯定, 困 and 恐怕 — which makes **fifty-five over
eleven batches**. 肯定 is the sharpest: three parts of speech named against a gloss that is only the
adjective, so two of the three had none, and the card's own third line is the adverb. 恐怕 was glossed
*afraid*, an adjective, where the word is the sentence-opening adverb its own three translations already
render as *I'm afraid*.

**FOUR MORE SENTENCES WENT, all of them ungrammatical.** 咳嗽's second is four words in an order Chinese
does not allow. 课程's third wants the adverbial 地 for 彻底的 and puts 一小时内 before the verb rather
than after the negation. 口语's first sets *spoken English* as 口语英语, the two halves the wrong way round
— the card's own third line gets it right. And 浪漫's second ends 你不应该做了, a negated modal with a
completed-aspect particle and no object.

**FOUR SINGLE-CHARACTER CARDS GAINED `Compounds`** — 克, 拉, 空 and 苦, 拉's panel being empty and 空's one
word against twenty-five in the collection. 空 was also tagged, its three lines being two kōng to one kòng.

**SIX ENGLISH LINES.** 困难's third was given the proverb *No cross, no crown*, which carries not one word a
reader can match to the headword, and 辣's third the bare *The older, the wiser*, which hides the ginger the
Chinese is about. 课程's second read *some LESSONS have definitely been LEARNED*, an English idiom about
hindsight. 苦's second put *in his life* where 一生 means all his life. 来不及's read *CRAP*, coarser than
可恶. And 咳's third supplied a *He* the Chinese has not got — that one being the record's own row, so the
English was corrected in the array.

**A missing full stop** on 辣's second line, on the card and in the spoken field alike.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 334 → 334; pinyin clean; example-fit 143 and senses 152 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 491 → 503;
`build-lang-decks.js` re-run.

## Batch 56 — hsk30l4 notes 451–480 (老虎 → 留下)

**What the batch was.** The next thirty notes of Level 4 in deck order. Eighteen cards changed.

**A CARD WHOSE GLOSS NAMED ONE SENSE WHILE ALL THREE OF ITS LINES USED ANOTHER IT NEVER GAVE.** 连 was
labelled *verb / adverb / preposition* against the single gloss **connect** — and every one of its three
sentences is the adverb 连…都 / 连…也, *even*, which the gloss did not carry at all. A reader met one use
and was tested on three, and the use they met was not on the card. 厉害 is the same fault differently: it
was glossed *difficult to deal with*, which fits none of its three lines — being very good at something,
smoking heavily, and shaking too much.

**A SHARED-GLOSS GROUP DISSOLVED.** 例子 was glossed *case*, a group it shared with 个案, where all three of
its own translations say EXAMPLE. Groups 334 → 333, the fifth such retirement.

**ANOTHER DUAL-READING CARD ILLUSTRATING ONE READING ONLY, and this one needed a sentence rather than
tags.** 量 gives liáng and liàng, and all three of its lines were liàng — each of them inside a longer
compound besides (份量, 酒量, 饭量) — so the reading the card LEADS with, to measure, was stated and never
shown. The first also had **no full stop** and read *ginormous* in English, so it was replaced with an
authored liáng sentence and the three tagged 2, 2, 1.

**SEVEN MORE LABEL-AGAINST-GLOSS CARDS** — 连, 联系, 理解, 厉害, 老年, 理发, 例如, 例子 — which makes
**sixty-three over twelve batches**. 例如 was labelled a VERB, which it is not; 老年 was glossed *elderly*,
an adjective, where the word is the noun *old age* and the card's own third line is exactly that.

**THREE SENTENCES WENT.** 流's first was 我是个二流子, a layabout — a fixed three-character word swallowing
the headword and saying nothing about flowing. 零钱's first, 这是你零钱, drops a 的 that a possessive before
an ordinary object cannot drop. And 量's first, above.

**FOUR SINGLE-CHARACTER CARDS GAINED `Compounds`** — 连, 亮, 列 and 留; the first three have empty panels,
连's against sixteen words in the collection.

**NINE ENGLISH LINES, and two of them were English idioms standing in for the Chinese.** 力气's third was
given *You're barking up the wrong tree*, which is about looking in the wrong place where 白费力气 is
wasting effort whether or not it was aimed right; and 留's second was given *We take no prisoners!*, which
is about how one competes where the Chinese says not one is to be left. 俩's third read *Worse things have
happened to both of us* — the same sentence batch 54 corrected on 经历's card, each card keeping its own
English — and its second read *you GUYS*, which says nothing about the two the word counts. 理想's first
read *the GIRL of my dreams* where 情人 names no gender. 理发's third read *barbershop*, American as one
word. And 理解's and 另's each put a past tense on a sentence with no past marker in it.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 334 → 333**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 503 → 515;
`build-lang-decks.js` re-run.

## Batch 57 — hsk30l4 notes 481–510 (流行 → 母亲)

**What the batch was.** The next thirty notes of Level 4 in deck order. Twenty-one cards changed.

**A GLOSS THAT DISMISSED ITS OWN CARD THREE TIMES OVER.** 梦想 was glossed *hope vainly; pipe dream* — and
every one of its three lines is the ordinary modern sense, an aspiration: 别放弃梦想 (*don't give up on your
dreams*), 你的梦想实现了吗, 没有梦想，人不能生存. **The card contradicted itself in English on all three
lines**, which is the cheapest tell there is and the one this audit keeps finding glosses by.

**A SECOND HINT PAIR RETIRED, AND FOR THE SAME REASON AS THE FIRST.** 民族 was glossed **nationality**,
which is 国籍 — the card two hundred slots back — and the two were kept apart only by each other's `not X`
block. 民族 is an ethnic group or a people, which is what all three of its own translations say. Giving it
its real gloss dissolves the collision, and **国籍's block had to be removed by rebuilding its own gloss**,
because the applier replaces a hint it still holds and does not strip one the record has dropped — batch
51's finding on 基地, met again. Groups 333 → 332.

**MORE GLOSSES THAT SAID THE WRONG WORD.** 美丽 read *pretty*, which is 漂亮, where its own translations say
beautiful. 密码 read *code*, where all three say PASSWORD. 例子's *case* went in batch 56 and this is its
sibling. 馒头's whole gloss stood inside square brackets — the house form for a measure word's scope note —
and called a bun *steamed bread*. 免费 was labelled a VERB, which it is not. And 落 was glossed with a NOUN
(*settlement, village*) under a verb label.

**A WORD THAT IS NOT A WORD.** 毛衣's first line rested on 羊毛衣: the garment is 毛衣 and the material 羊毛,
and the two do not compound that way. Its English, *We wear wool in winter*, did not mention the garment at
all. **`sweater` was measured in the same pass and LEFT** — nine against two `jumper`s, and a sweater is
ordinary British English, so the finding is the sweep's and not the deck's, as `mall` and `stove` were.

**A ROMANISATION STANDING IN FOR A TRANSLATION.** 馒头's third line read *I'll give you a MANTOU to eat* — a
reader who did not know the word still does not.

**FIVE MORE SENTENCES WENT.** 麻烦's second has no verb at all, running from the polite formula straight into
a noun phrase. 美好's first is a noun phrase glossed as though it were a sentence, and its second puts the
adverbial 地 in front of a predicate adjective. And **末 lost two of three to swallows** — 本末倒置, a
four-character idiom, and 芥末, which is MUSTARD and has nothing to do with an end or a tip.

**FOUR SINGLE-CHARACTER CARDS GAINED `Compounds`** — 落, 乱, 满 and 末, 乱's panel being empty against eleven
words in the collection.

**EIGHT ENGLISH LINES.** 律师's second read *She practised as a BARRISTER*, naming one half of a profession
England divides and China does not. 面试's second read *audition*, which is 试镜. 面对's third repeated its
own subject. 美's third compared two English words where the Chinese compares 美 with 可爱. And 旅行's first
read *I love TRIPS* for a card glossed as a verb.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 333 → 332**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 515 → 524;
`build-lang-decks.js` re-run.

## Batch 58 — hsk30l4 notes 511–540 (母子 → 排队)

**What the batch was.** The next thirty notes of Level 4 in deck order. Nineteen cards changed.

**A SENTENCE WHOSE THREE HEADWORD CHARACTERS WERE TWO OTHER WORDS MEETING.** 目的地's second line was
偶尔漫无目的地走一走是很有乐趣的 — which is 漫无目的 followed by the adverbial particle **地**, so the word
目的地 is not in it at all. It is the fault `check-example-fit.js` exists for, and one it cannot see here,
since 漫无目的 is a headword in no deck and the segmenter therefore has nothing longer than the headword to
prefer. The card's third line also had **no full stop**.

**A WRONG CHARACTER AND A WRONG PRONOUN IN ONE LINE.** 女性's third read 他是我最好的女性朋友 — **他 for
她** — and its English then read *She is HIS best girlfriend* where the Chinese says MY. Two faults in one
sentence, neither of which anything in the pipeline can see: it segments, speaks and translates.

**A SHARED-GLOSS GROUP DISSOLVED.** 内 was glossed *within*, a group it shared with 以内 — and *within* is a
preposition under a NOUN label, where 内 is a localiser, the inside of something, which is what all three of
its lines use it as. Groups 332 → 331, the sixth such retirement.

**排 LOST TWO OF THREE TO SWALLOWS, and they are the funniest pair yet**: 我就要份牛排 is a **STEAK** and
你会开手排车吗 a **manual gearbox**, neither of which has anything to do with arranging or a row. 拍's first
was 合拍, being in step with somebody. The pattern is now unmistakable at single-character cards — 克, 拉,
末, 交, 火, 江 and these — and it is the one class `check-example-fit.js` is exempt from by design.

**A GLOSS THAT MISSED THE SENSE TWO OF ITS THREE LINES USE.** 牌 was glossed *a signboard, plaque, or
tablet*, where 洗牌 is shuffling and 发牌 is dealing — PLAYING CARDS, a sense the gloss did not carry.
Split and tagged. Four more label-against-gloss cards with it (耐心, 难忘, 偶尔, 内), making **seventy over
thirteen batches**, and 农村's gloss ran two senses together with nothing between them — *countryside rural
area* — the malformation now met on six cards.

**THREE MORE SENTENCES WENT.** 耐心's third wants the adverbial 地 where 的 makes it a modifier with nothing
to modify. 男性's first is a calque of the English *male attention*, which Chinese does not say, and makes a
claim about women the card has no business teaching.

**THREE SINGLE-CHARACTER CARDS GAINED `Compounds`** — 拍, 弄 and 牌, the first two with empty panels.

**TEN ENGLISH LINES.** 排队's two read *in LINE*, which is American on a card glossed *queue up*. 难受's read
*It SUCKS having a cold* and *makes you SICK*, which in English means vomiting where 难受 is feeling
uncomfortable. 难道's third read *eh?*, carrying nothing of the rhetorical force the card exists to teach.
And two were sentences other cards carry, each keeping its own English: 嗯's *Yea* (batch 53 fixed it on 仅)
and 内心's *Deep down, everyone is rich and beautiful* (batch 47 fixed it on 丰富).

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 332 → 331**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 524 → 530;
`build-lang-decks.js` re-run.

## Batch 59 — hsk30l4 notes 541–570 (排球 → 千万)

**What the batch was.** The next thirty notes of Level 4 in deck order. Twenty cards changed.

**A LABEL AND A GLOSS THAT WERE DIFFERENT WORDS.** 千万 was labelled an ADVERB and glossed **ten million**,
which is the numeral — and two of its three lines are the adverb (千万不要, 千万别), a sense the gloss did
not carry at all. The label-against-gloss class has been a part of speech missing or misnamed until now;
this is the first time the two named two different words.

**A QUESTION MARK THAT WAS A FULL STOP.** 排球's second line ends a 吗 question with 。 — and **the
deck-level punctuation pass cannot see it**, since that pass converts a mark standing immediately after a
character and this mark is simply the wrong one. `exSpace` reaches it, its rule being that a row may only
move whitespace and punctuation.

**FOUR GLOSSES CARRYING THE WORDS "MEASURE WORD" INSIDE A GLOSS WHOSE LABEL ALREADY SAYS SO** — 篇, 片, 期
and, by the same shape, 平常, which was labelled *noun / adjective* and glossed with three ADVERBS. 气 was
labelled *noun / verb* against a gloss that is only the noun, where two of its lines are the verb, and 判断
was glossed *to decide*, which is 决定 a few cards along, where its own first line is the noun *judgement*.
That makes **seventy-eight over fourteen batches**.

**A SHARED-GLOSS GROUP DISSOLVED.** 牌子 was glossed *sign*, a group it shared with 苗头, where two of its
three lines are a BRAND. Groups 331 → 330, the seventh such retirement.

**FOUR MORE SWALLOWS.** 篇's third was 千篇一律, a four-character idiom; 片's second was 生鱼片, **sashimi**;
期's second was 缓期执行, a stay of **execution**, which is not a sentence a learner of this word needs; and
葡萄's second was 葡萄糖, **glucose** — literally grape sugar, but its English says glucose, so a learner
meeting 葡萄 for the first time beside it learns nothing about the fruit.

**DROPPING A SENTENCE ORPHANS ANY `exEn` ROW THAT NAMED IT.** 篇 already carried an `exEn` rewriting the
English of the very line this batch dropped, and the applier reported it on the next run — which is how it
was found, and which is the batch-54 rule working in the direction that helps: a FAIL prints on every run,
`--check` included, so an orphaned row announces itself rather than sitting in the record for ever.

**THE `soda` CLASS, AND WHY IT IS NOT A TABLE ROW.** 汽水 was glossed *soda pop; carbonated soft drink* and
all three of its lines read *soda* — which in British English is soda water, and this is not that. Seven
American sites, on this card and one other (`hsk30l5/洒`), so per-note rows: **a bare `soda` → `fizzy
drink` row would rewrite a genuine soda water**, which is the judgement-per-site case `highway` and `mall`
already settled.

**THREE SINGLE-CHARACTER CARDS GAINED `Compounds`** — 篇, 片 and 破, 篇's and 破's panels being empty.

**EIGHT ENGLISH LINES.** 气候's first read *How's the WEATHER there?* on a card glossed *climate*. 普通话's
second gave two ROMANISATIONS in place of a translation. 普遍's third dropped the headword and said it of
all young people rather than most. 皮肤's called an 过敏 a *rash*. 皮鞋's dropped the leather. And 其次's
third used *then* for both 其次 and 然后.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 331 → 330**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 530 → 548;
`build-lang-decks.js` re-run.

## Batch 60 — hsk30l4 notes 571–600 (签证 → 缺少)

Thirty consecutive notes of the HSK 4 deck in deck order, and the thirtieth batch of this audit to
find the label-against-gloss class. **Twenty-five of the thirty changed.** The leading fault here is
its sharper form: not a label that outran its gloss, but **a gloss that is not any sense the word
has**. 情况 was glossed `happening` — a word CC-CEDICT does not give it at all (/circumstances;
state of affairs; situation/) and which none of its three sentences means. 轻松 was glossed
`gentle`, which is 轻柔, over 感觉轻松了, 放轻松 and 轻松愉快. 全球 was glossed `entire`, which is
the gloss of its FIRST CHARACTER rather than of the word. Each reads as a perfectly well-formed
English gloss, each sits under a label the decks use everywhere, and **no checker here can see any of
them**: the neighbour test in `check-gloss-source.js` fires only where a gloss is a near-copy of the
card two either way in the exam list, and these are not copies of anything.

**A `not X` hint retired by giving both cards their real meaning.** 敲 (Level 4) and 撞 (Level 5)
were both glossed **`to hit`**, so the English → Chinese card was one question with two right
answers, and the decks papered over it with a `not 撞` / `not 敲` hint pair. Neither gloss is what
the word means: CC-CEDICT gives 敲 /to hit/to strike/to tap/to rap/to knock/ and 撞 /to knock
against/to bump into/to run into/, and every one of 敲's sentences is knocking at a door while every
one of 撞's is a collision. Given `to knock; to tap, to rap` and `to bump into, to collide with; to
run into` the two no longer collide, so the hint pair is retired rather than kept pointing at a clash
that no longer exists — **the third pair retired this way**, after 基础/基地 (batch 51) and
民族/国籍 (batch 57), and the eighth shared-gloss group dissolved. Both notes had to be touched, not
just one: the applier REPLACES a hint it still holds but does not STRIP one the record has dropped,
so 撞's gloss was rebuilt in the same batch to take its block off.

**Five sentences replaced, and two of the reasons are ones this audit has met before.** 取's first
line was 他们去了鸟取 — **Tottori**, a Japanese place name written with 鸟 and 取, so the card about
`to take, to get` illustrated it with a word in which the character is standing in for a foreign
syllable: the 法拉费 fault of batch 47 at a different sound. `check-example-fit.js` cannot see it,
single-character headwords being skipped outright. 巧 lost two of its three: 爱不是花言巧语 buries
the character inside an idiom and rendered it "Love is not talking nonsense", which is not what
花言巧语 means, and 可不可以你也很巧的爱上我 is not grammatical Chinese. 敲 lost 刚刚敲过了八点钟，
不是吗？ — an English clock striking, translated word for word.

**And two that are the "different constructions" rule rather than a fault in any one sentence.**
全身's three lines were 我全身疼痛, 她全身都疼 and 我全身酸痛 — three ways of aching all over, in one
shape, so the card taught one collocation three times; the English differs on each, so the
duplicate-sentence check passes and only reading the card finds it. Two replaced with 全身湿透
(soaked from head to foot) and 全身检查 (a full-body examination). 取得's second and third were both
取得…进展 with different English around them; the third replaced with 取得了好成绩.

**`globalization`: a family `check-british.js` reads 0 over whatever the decks contain.** `globalis`
/ `globaliz` is not in app.js's `SPELL_PAIRS` at all, so the checker is blind to it in exactly the way
it is blind to -logue (batch 27), -ward (batch 29) and skeptic — and since the site's spelling switch
runs one way only, from authored British, an American spelling written into deck content is what BOTH
readers see. Measured over the nine decks: **three sites on three cards**, two of them the same
sentence (我们反对全球化) carried by two different notes, hsk30l4/全球 and hsk30l5/化, and the third
inside hsk30l7/跨国. All three fixed per note. **Folio's own prose is clean**: the corpus carries
three `Globaliz-` strings and every one is inside a CITATION — a published title, which is borrowed
text and out of scope by the site's own rule — so nothing outside the decks needed touching and no
app change was made. The 跨国 line also wrote `trans-national`, which British style sets solid; it
was rewritten with the rest of the sentence.

**A trap worth writing down: that third site belongs to the RECORD, not to the deck.** The
globalisation sentence on 跨国 is a row this record itself added in an earlier batch, so the repair
belongs in its own `ex` row and an `exEn` row naming it fails — which the applier duly reported.
Worse, the key was first written `hsk30l79/跨国` (the deck file is `Levels-7-9`; the deck's card ids
say **`hsk30l7`**), and renaming the key by assignment **overwrote the note's existing entry and its
two `ex` rows**, silently deleting two sentences from the card. Caught by reading the deck rather than
by any checker. **Check the deck id against a card id before writing a Levels 7–9 key, and never move
a record key by plain assignment** — merge into whatever is already there.

**Three English lines corrected.** 文艺青年 is not "a young artist": it is the fixed modern
expression for the arty, bookish sort of young person, and a job description teaches the reader a word
they will then use wrongly. 球迷's "The fans all hope the club changes the manager" states as fact
what 希望…能换 puts as a wish. And 全's "Have you seen all these films?" supplies a plural and a
demonstrative 你把电影全看了吗 has not got, losing the 全 the card is about.

**Seven `Compounds` blocks**, every row's reading and gloss checked against CC-CEDICT first: 敲 and
桥 had **nothing at all** in the reader's downloaded deck, 强, 巧 and 琴 one word each — and 巧's one
word is 巧克力, where the character is standing in for a foreign syllable and teaches nothing about it
— 轻 and 缺 two each. 区 (4), 取 (3) and 全 (5) were measured and left.

**Four more glosses widened to the sense the card shows**, none of them wrong so much as narrow: 琴
was CC-CEDICT's first sense, the zither, on a card whose three sentences are all keyboards (练琴, 弹琴
and 管风琴) — a gloss can be right about the word and wrong about the card; 轻 was `light-weight`
alone while two of three sentences are the gentle/softly sense; 缺点 was `disadvantage`, the narrowest
of four senses, over 优点和缺点 and 她的缺点; 前后 was carrying a de-collision gloss from an earlier
batch that covered one of the three senses its sentences show, the missing one being on a sentence
**this record itself authored**, so the gap was its own to close. Two more phantom labels dropped:
签证 and 区别 were both `noun / verb` over a single noun gloss with no sentence showing the verb, and
庆祝 is labelled `verb` over a gloss that opened on the noun.

**Read and left.** 前方, 桥, 巧克力, 亲戚, 球队, 区, 取消, 全部, 全都, 缺少 — and 强, whose third
sentence puts the character inside 女强人 but transparently, the compound meaning what the character
means. 取得's remaining two lines are both about progress and were left, the constructions differing.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 330 → 329**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 548 unchanged;
`build-lang-decks.js` re-run.

## Batch 61 — hsk30l4 notes 601–630 (却 → 少见)

Thirty consecutive notes of the HSK 4 deck in deck order. **Fifteen of the thirty changed** — the
smallest share since the Level 4 run began, and the batch's leading fault is the sharpest yet.

**A headword that was not in its own sentence at all, twice, and `check-example-fit.js` saw neither.**
人生 `life` was illustrated with **没有人生还** — which is 没有人 + 生还, *nobody survived*: the two
characters the card teaches are the end of one word and the start of another, and the card's own
English says so plainly, *No one escaped alive*. 上门 `to drop in` was illustrated with
**关上门，打开窗！** — 关上 + 门, *close the door*, whose English likewise mentions nobody dropping in
on anybody. Both are the blind spot the checker's own header names: it reports an occurrence the
segmenter SPLITS, and here greedy longest-match lands squarely ON the headword. The 上门 case is the
cleaner illustration of why that blind spot cannot be closed by tuning — **上门 IS a word and 关上 is
not a headword in these decks**, so the segmenter correctly prefers the longer real word it knows,
and reports the card clean. Found by reading the English line against the Chinese, which is the only
thing that finds this.

**Two more sentences replaced for being bad Chinese, and two for teaching one thing twice.** 入住's
second line, 玲奶奶死的不瞑目。流传说那栋房子至今未人敢入住。, is wrong three times over — 死的 for
死得, 流传说 where Chinese says 据说 or 传说, 未人敢 for 没人敢 — and is two sentences in a slot that
holds one; its replacement also carries the *move in* sense, both surviving lines being hotel
check-ins. 森林's second was **an English proverb translated word for word**: 他因为这些树而看不见森林
is *can't see the wood for the trees* carried into Chinese, and its English line was that translation
carried back again, so the reader met neither the proverb nor a natural sentence. 稍's first and third
were both *please wait a moment* (请稍等一下, 麻烦您稍待一下), and 少见's first and third were both
about a rare NAME — the second of them also using 蛮, which is southern colloquial and out of register
for the rest of the deck.

**Three labels and glosses.** 热闹 named **three** parts of speech, `noun / verb / adjective`, over a
gloss giving two adjectives and nothing else, with all three sentences the adjective. 任务 was glossed
`task` while two of its three English lines say *mission* — the card contradicting its own gloss — and
商量 was glossed `to consult` while two of its three say *discuss*; CC-CEDICT carries both senses for
both words, so the widening is the dictionary's own rather than a judgement.

**Four English lines that dropped the headword or hardened the Chinese.** 相反的理论往往也是真的 is
*the opposite THEORY is OFTEN true*; the card read *the contrary is always true*, losing the noun and
turning 往往 into `always`. 然而这也算不上什么像样的东西 came out as *But it isn't even worth calling
stuff*, which is not English. 观众人数庞大 is about the NUMBER of spectators — the word the card
teaches — and *The audience was very large* leaves no trace of it; 欢迎入学 welcomes students to the
school they have just enrolled at, and *Welcome, students!* says nothing about enrolling.

**One bare sentence.** 人数's second line ended with no terminal mark at all. The corpus-wide
punctuation pass CONVERTS a half-width mark to a full-width one and never ADDS one, so about 150
sentences still stop bare; `exStop` appends a full stop to the visible text and the spoken field
together and does nothing else.

**Four `Compounds` blocks**, every row checked against CC-CEDICT first: 却 and 扔 had **nothing at all**
in the reader's downloaded deck, and 扔 has nothing anywhere in the collection either — it is the first
character in this audit whose tap panel would be empty on a reader holding every Mandarin deck Folio
ships. 仍 and 稍 had one word each. **仍's block is two rows rather than three or more, and that is the
dictionary's limit rather than a short measure**: besides 仍然, which the deck already has, CC-CEDICT
carries only 仍旧 and the literary 频仍.

**Read and left.** 却, 确实, 人员, 任何, 扔 (its sentences), 仍, 仍然, 日常, 日记, 日期, 日子, 入,
入口, 散步, 扫码, 商品, 伤心, 稍微 — and 入, whose three sentences are all bound compounds (入睡, 入会,
入秋) rather than the free verb, which is what the character is: it takes no free use in modern
Mandarin and its panel already shows six words.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 329 unchanged; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 548 unchanged;
`build-lang-decks.js` re-run.

## Batch 62 — hsk30l4 notes 631–660 (少量 → 使)

Thirty consecutive notes of the HSK 4 deck, and the heaviest batch of the Level 4 run: **thirty-three
cards changed across six decks**, because two measured word-choice families were swept with it.

**The leading finding is the gloss-versus-examples fault in its purest form.** 省 was glossed
**`province`** and **not one of its three sentences is a province**: 这辆车很省油, 你省了我好多时间
and 天啊，省省吧 are all the verb 省 *to save, to economise*. Nothing on that card is misspelt,
mislabelled or ungrammatical; every checker here passes it; and a reader would simply learn the wrong
meaning of a Level 4 word. Both senses are now given with the verb leading, because that is what the
card shows, and the third sentence — whose English, *Jeez, give it a rest*, is a stretch on a set
phrase — was replaced with 他出生在四川省, so the card at last teaches the sense it was glossing. Each
sentence now carries the number of the sense it shows.

**That fix retired a `not X` hint pair, and the mechanics are worth writing down.** 省 and 省份 were
both glossed `province` and carried a `not 省份` / `not 省` pair between them. **A sense rewrite always
drops the hint**: the applier writes the block FIRST and `renderSenses` replaces the whole English
field afterwards, which its own comment says is deliberate — a disambiguator disambiguating nothing is
worse than none. So the pair could not have been kept even if it had been wanted, and it is not
wanted: with 省 leading on the verb the two ask different questions. 省份's gloss was sharpened in the
same pass to name the real distinction rather than leave the two sharing one English word — **省
attaches to a province's NAME (四川省), where 省份 is the noun used on its own and in counting them**,
which is exactly what that card's own three sentences do. Shared-gloss groups 329 → 328; **the fourth
pair retired this way**, after 基础/基地, 民族/国籍 and 敲/撞.

**A third headword that was not in its own sentence.** 十分's second line was 现在是七点五十分 — 五十
+ 分, *fifty minutes*, with its English reading *It's 7.50*. This is the shape
`check-example-fit.js`'s own header names as a FALSE positive (十分|钟), met here as the real thing,
and the checker reports nothing for the reason it reported nothing on 人生 and 上门 last batch. Three
batches running have found this class by reading and by nothing else.

**Two word-choice families measured in one pass, and only one of them became a table.**
· **`cell phone` is a LEXIS row**, `railroad`'s shape: a straight American word for a British one with
  no second sense to protect. **Nine occurrences on nine cards across five decks**, one sentence
  carried by four of them, every one read and every one 手机 — not a proper noun among them, nothing to
  judge per site, and the replacement contains a space so it can never match itself on a re-run. Both
  forms occur, so both are declared.
· **`gas` is NOT**, and refusing it is the more instructive half. It runs to **56 occurrences** across
  the nine decks and about fifty are the SUBSTANCE — natural gas, coal gas, a gas leak, a gas bubble,
  tear gas — which is British English too. Only the **six** that mean PETROL are American, and they
  went to per-note `exEn` rows on 省, 油 (×2), 汽油 (×2, one of them a row this record itself ships)
  and 耗. This is `fall` and `check` and `store` again: **the correct spelling depends on what the
  sentence is about, which is a judgement per site.** `crossroad` was measured the same way and came to
  **two** sites carrying one sentence — a class of two is not a table, so both are per note.

**Five more glosses that were not the card's sense.** 剩 was glossed `spare`, which is not a sense
CC-CEDICT gives it at all. 使 led on `to send (someone)` — the formal 使者 sense — while all three
sentences are the causative. 十分 was `completely; utterly` over three sentences that all say *very*,
and its bracketed literal called 分 a *point* where it is a tenth part. 少量 was **`a smidgen`**, which
is CC-CEDICT's own first gloss and a word a learner will not meet again. 少年 was `early youth`, an
abstract noun, on a card whose sentences all use it for a person. 师傅 was `master` alone, missing the
use a learner meets first and which the card's own second sentence is: how you address a driver.

**Four labels and one card that was a sense short.** 身 named `noun / measure word` over three nouns;
失败 named `verb / adjective` over sentences that are the verb and the NOUN; 申请 carried a noun inside
a gloss labelled `verb` alone. And **生 carried two senses while its three sentences show three** — 他
不是个高中生 is 生 as *student*, which CC-CEDICT gives as a bound form and which neither sense covered.
Its second sentence went with it: 生菜要洗吗？ buries the character in **生菜, which is LETTUCE**, and
called it *fresh vegetables*, so the card was wrong about the word and wrong about the dish at once.

**Five more sentences replaced.** 少数's two remaining lines were both `只有少数的人`, and the third was
a state slogan with full-width brackets, an odd plural on 族裔们 and an English line reading *are kins
in one family*. 少年 had a twelve-year-old proposing marriage. 社会's 他不仅社会学毕业，还有哲学
mismatches 不仅…还有 and buries the headword in 社会学. 剩 carried a line about sons coming home in
coffins, whose English did not translate it. 师傅's third was a long line on the layout of an ancient
city, out of register for the deck. 实际 used 实际 as a bare adverb where Chinese says 实际上.

**Three English lines corrected, plus two rows this record ships.** 我们没有失望 is *we were not
disappointed*, and the card said *We have not lost hope* — a different sentence about a different
feeling. 师傅's first was a mock-archaic pastiche (*Good day, lords. In what way can I refine upon my
adroitness in aural comprehension?*). 您使我印象深刻 is a deep impression, not a heavy one. And two
sentences the RECORD ships were corrected in their own rows rather than swept: 摄氏度's third had
dropped the very unit the card teaches, and 汽油's was one of the petrol six. **Ask which of the two is
shipping a sentence before writing a row about it** — the trap batch 61 met from the other side.

**Three `Compounds` blocks**, every row checked against CC-CEDICT first: 深, 省 and 剩 had **nothing at
all** in the reader's downloaded deck. 省's block deliberately includes **反省 fǎn xǐng**, the
character's other reading, which nothing else on that card could tell the reader about.

**One bare sentence**: 甚至's first ended with no terminal mark; `exStop` supplies the full stop and
nothing else.

**Read and left.** 社会 (its other lines), 摄氏度, 深, 身份证, 甚至, 生命, 生意, 失去, 师生, 时间表,
实际上, 食品, 食堂, 食物, 实在, 十字路口 — and 深, whose `adjective / adverb` label is not shown by any
sentence but whose gloss covers both, the adverbial use (深受影响) being one the deck may reach later.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 329 → 328**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 548 → 557;
`build-lang-decks.js` re-run.

## Batch 63 — hsk30l4 notes 661–690 (使馆 → 顺便)

Thirty consecutive notes of the HSK 4 deck; **sixteen changed**.

**The leading fault is one shape further on from the label-against-gloss class this audit keeps
finding: a label and a gloss that are two DIFFERENT SENSES of the same character.** 首 is labelled
`measure word` over the gloss **`first (occasion, thing etc.)`** — which is CC-CEDICT's third sense,
the 首 of 首次 and 首都 — while all three of its sentences are 这首歌, the classifier for songs and
poems. The reader is told what part of speech the word is and then told what it means as something
else, with nothing connecting the two. Both senses are now given with the classifier leading, and each
sentence says which it shows. **数字 is the same fault without the label**: glossed **`digital`**,
CC-CEDICT's last sense and the attributive of 数字电视, on a card whose three sentences are all the
plain noun.

**A fourth hint pair retired, and this one by sharpening both sides.** 数量 and 数目 were both glossed
`amount` — one English word doing two jobs — and carried a `not X` pair between them. The distinction
is real and each card's own sentences make it: **数量 is HOW MUCH or HOW MANY there is of something**
(数量不对, 机动车数量增加了), where **数目 is the FIGURE itself, a sum or a total** (1000美元是个大数目,
请核对一下数目). Given those, the pair is retired rather than kept papering over the collision. Shared
groups 328 → 327; the fifth pair retired in this audit, after 基础/基地, 民族/国籍, 敲/撞 and 省/省份.

**A card that was a sense short, on its harder kind.** 数's first sentence, 数年过去了, is shù meaning
**`several, a few`** — CC-CEDICT gives it outright and it is where a learner first meets that reading,
in 数年, 数十, 数百 — and neither of the card's two senses covered it. It is added to the shù sense
rather than made a third, being the same reading and the same part of speech, and each sentence now
says which of the two READINGS it shows, which on a two-reading card is the whole difficulty.

**Five sentences replaced, and two of the reasons are new to this run.** 世纪's first two were **the
same fact stated twice, once each way round** — 一个世纪就是一百年 and 一百年叫做一个世纪 — so the
second taught nothing the first did not; replaced with the word used rather than defined. 树林's third
carried **the wrong measure word**: 有一个穿过树林的小路, where a 小路 takes 条, so the sentence is
ungrammatical in the one place a learner is most likely to copy it from. 收费's was word-order-wrong
Chinese built on a calque (为了…需要它 the wrong way round, and 停车计时收费器 for *parking meter*
morpheme by morpheme) — **and it is the sentence batch 32's one-way-spelling sweep left standing as the
corpus's single correct `meter`**, the DEVICE, which is `meter` in British English too; that
adjudication is moot now the sentence is gone. 使用's third differed from its second only in the
person, and 熟's first carried a stray 的 on the end of an idiom.

**And 熟 shows the "different constructions" rule biting on SENSES rather than on shapes.** It glosses
four — ripe, cooked, familiar, skilled — and showed the last two twice over (人生地不熟, 眼熟, 记熟) and
the first two not at all, which is where a learner meets the character first. 这个西瓜熟了 replaces one
of the two familiars. 帅 is the same argument: 你真的很帅 and 你男朋友真帅 are one sentence twice, and
CC-CEDICT's `(coll.) cool!; sweet!` — what 帅 does for a car or a move — was neither glossed nor shown.

**Two more labels with nothing behind them**: 收入 named `noun / verb` over a noun gloss with three
noun sentences, and 首先 named `adverb / pronoun`, which 首先 is not in any sense CC-CEDICT gives. Two
more glosses narrowed to the wrong register: 市区's `urban district` is the most bureaucratic of its
three senses while the card's own English says *into town* and *the town centre*, and 受不了 pinned an
object to itself (`cannot bear it`) that the word does not carry.

**Four `Compounds` blocks.** 输 and 帅 had **nothing at all** in the reader's downloaded deck, and 帅
has nothing anywhere in the collection either — **the second such character in this audit, after 扔**.
熟 had one word and 首 two. 帅's block is deliberately half military (元帅, 统帅): that is the
character's older and commoner meaning and the card's gloss does not reach it at all.

**A trap in the record's own writing, worth keeping.** The scratchpad helper that merges an entry
CONCATENATES arrays — which is right for `ex`, `dropEx` and `exEn`, where a later batch adds to what an
earlier one wrote, and **wrong for `senses`, which is a replacement**. 数 already carried a `senses`
array from an earlier batch, so the first run gave the card FOUR senses, the old pair followed by the
new one. It renders perfectly — the card simply lists each reading twice — and nothing in the applier
objects. Caught by reading the diff. **`senses` is set, never merged.**

**Read and left.** 使馆 (whose second and third sentences say 大使馆, which is the headword with a
prefix rather than a swallow), 市场, 是否, 适合, 视频, 试题, 适应, 收拾, 收听, 首都, 售票员, 受伤, 输
(its sentences), 熟悉, 暑假, 数量 (its sentences), 帅 (its first two), 顺便.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 328 → 327**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 557 → 563;
`build-lang-decks.js` re-run.

## Batch 64 — hsk30l4 notes 691–720 (顺利 → 提)

Thirty consecutive notes; **twenty-three changed**, and ten of them needed a `Compounds` block, which
is the most of any batch so far.

**The worst card in the batch is 算.** It is glossed `to calculate, compute, reckon` and **not one of
its three sentences calculates anything**; two of the three had to go for reasons of their own.
她的女朋友真算飞机场 is body-shaming slang — 飞机场, *airfield*, for a flat-chested woman — which has no
business on a vocabulary card and which `check-coarse.js` cannot reach, 算 being a one-character
headword and the `own()` exemption swallowing every compound built on it. 这还算什么！ was rendered *You
ain't seen nothing yet*, neither the meaning nor English a learner should copy. Both replaced with the
two senses the gloss names and the card showed neither of — working a sum out, and counting as.

**An eighth truncated gloss, and beside it a sentence teaching the wrong reading.** 弹's gloss stopped
mid-bracket: `to shoot; to spring; to flick; to play (a stringed`. And its second sentence,
我没看见什么弹孔, is 弹 as **dàn**, a bullet, on a card whose pinyin field says tán and nothing else —
so a reader met the character's other reading with nothing to say so. Replaced with the flick sense
the gloss names; 子弹 goes into the card's new `Compounds` block instead, where the reading can be
labelled.

**A character error in the Chinese.** 汤's third sentence wrote **大咸了 for 太咸了**, so the sentence is
ungrammatical on a Level 4 card. This is the class `check-coarse.js` has twice turned up by accident
(电灯炮 for 电灯泡, 别破妈妈 for 别被妈妈) and which nothing in the pipeline can see: the sentence
segments, speaks and translates perfectly. Its English was wrong too — soup is 喝 in Chinese — so the
line was re-authored with the character corrected.

**A sixth family `check-british.js` reads 0 over, and this one is not an Americanism.** 酸奶 spelled the
word **two ways on ONE card**: `yoghurt` in the first sentence, `yogurt` in the second and third and in
its own gloss. Both spellings are current in Britain and Folio's own prose uses neither, so the fault
is the INCONSISTENCY rather than the dialect, and the card is standardised on the fuller form it
already carried. Measured over the nine decks: seven sites, six to one. `yog` is not in app.js's
`SPELL_PAIRS` at all, so the checker reads 0 whatever the decks contain — the same blind spot as
-logue, -ward, skeptic, kerb and globalis.

**Four labels naming parts of speech the card never shows**, including the batch's widest: 所有 named
`noun / verb / adjective` over the single word `all` with three determiner sentences, and 随便 named
`verb / adjective / conjunction` over `as one wishes` with three adverbial ones — **three labels,
none of them the one the card teaches**. 说明 ran its noun and verb together in one gloss and 讨厌's
second sentence is the adjective (`annoying`) its two-verb gloss does not reach; both were split, with
each sentence saying which sense it shows.

**Six glosses narrowed to one sense of several the card shows**: 酸 was `sour` over sentences that are
sour, ACID rain and legs that ACHE; 提 was `to carry` while its first sentence is *to mention*; 态度 was
`manner` over two plain `attitude`s; 塑料 was the plural `plastics` over three mass-noun sentences; and
孙女 and 孙子 stated their kinship precision in a bracket (`son's daughter`, `grandson [father's
family]`) rather than teaching it beside the everyday word.

**Five more sentence sets fixed for repetition or for being wrong.** 顺序's **three** sentences were all
字母顺序, alphabetical order, and the second was bad Chinese besides. 死's first two were insults
(`Over my dead body`, `Why don't you go to hell?`) and its gloss's third sense, `extremely`, was shown
by nothing — 我累死了 now shows it. 躺 taught lying down to rest twice and had a third line ambiguous
between lying BESIDE you and lying ON your right side. 硕士 had one sentence twice and an English line
that is not English. 抬's first sentence ended with no terminal mark.

**Ten `Compounds` blocks** — 死, 酸, 算, 台, 抬, 弹, 谈, 汤, 躺, 趟 — every row checked against
CC-CEDICT first. **躺 and 趟 have nothing built on them anywhere in the collection**, the third and
fourth such characters after 扔 and 帅. Two blocks deliberately carry the character's OTHER reading,
which is the one thing a single-reading card can never tell a reader: 子弹 **dàn** on 弹, and 趟浑水
**tāng** on 趟.

**Read and left.** 顺利, 说法, 速度, 随着 (whose first sentence uses 随着 verbally, which is marginal but
attested), 孙子 and 孙女's sentences, 台 (whose 一台车 is Taiwanese usage now common on the mainland),
抬头, 谈, 讨论, 特点 — and 趟's own sentences, whose English drops the classifier because there is no
English word for it.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 327 unchanged; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 563 → 569;
`build-lang-decks.js` re-run.

## Batch 65 — hsk30l4 notes 721–750 (提出 → 推迟)

Thirty consecutive notes; **twenty-five changed** across three decks.

**Six cards where the LABEL names a part of speech the card's own gloss is not.** This is one step past
the phantom-label class — the label is not extra, it is WRONG — and the batch is the first to find it
six times over. 痛 is labelled `adjective / adverb` over `pain, ache, sorrow`, which are three NOUNS,
with all three sentences the verb. 提前 is `verb` over the adverbial `in advance`, with three adverbial
sentences. 体检 is `verb` over a noun gloss, with three noun sentences. 同时 is `noun / conjunction`
over an adverbial gloss and three adverbial sentences. 通 names `verb / adjective / measure word` over
three verbs. And 头痛 is labelled `adjective` over a gloss that is a noun and a verb — **the label
naming neither half of its own gloss**.

**头痛 also carried a split headword, the fifth this audit has found.** 他的头痛了 reads as 他的头 +
痛了, *his HEAD hurts*, with 头 belonging to 他的头 — and `check-example-fit.js` reports nothing,
landing squarely on 头痛, which is the blind spot exactly as on 人生, 上门, 十分 and 数年.

**A new LEXIS row, and two families measured in the same pass and REFUSED one.**
· **`parking lot` is a row**, `railroad` and `cell phone`'s shape: **seven occurrences**, four of them
  on hsk30l4/停车场 including its own gloss, every one the American compound for a car park, with no
  second sense to protect.
· **`fill out` is not**, and one site is the whole reason: `The sail on the boat filled out`
  (hsk30l7/帆) is ordinary British English in a quite different sense, and any row on the bare phrase
  would wreck it. The other **eight** are forms and went to per-note rows, across five notes in two
  decks — and **hsk30l5/填 CONTRADICTED ITSELF**, its second sentence already saying `fill in` over a
  first and third saying `fill out`. The decks were already 32 to 9 in favour of the British form.
· **`dirt` is not either**: five of its six sites are grime, dust or the idiom *to eat dirt*, all
  ordinary British English, and only hsk30l4/土's `dig dirt from the ground` is the American word for
  soil. Both refusals are `gas` again — the right word depends on what the sentence is about.

**A rule the batch made explicit: a per-note row reaches ONE note.** Batch 63 corrected the mock-archaic
pastiche on hsk30l4/师傅 (*Good day, lords. In what way can I refine upon my adroitness in aural
comprehension?*) — and the same sentence sits on hsk30l4/听力, which still carried the old English. **A
sentence carried by several notes needs one row each**, and the only way to find the others is to grep
the decks for the sentence rather than for the note.

**Two sentences dropped for being wrong about the language they teach.** 听力's third, 我外父太老了，
听力不好, uses **外父**, which is Cantonese for a father-in-law where Mandarin says 岳父 — and its
English calls him a GRANDFATHER, so the sentence is wrong twice over. 通过's first was a film line
translated into Chinese and back: 您不可通过 for *You shall not pass*, with the polite 您 addressed to a
balrog.

**Three more glosses and five English lines.** 桶 was `a cylindrical container or vessel`, a dictionary
paraphrase, on a card whose three English lines all say *bucket*. 推 was `to push; refuse`, where the
second half is neither the word alone nor what the card's third sentence shows. 听力 was `hearing`
without the sense every HSK learner meets first. Among the English: `She made out the application for
admission` (提出申请 is to SUBMIT one), a habitual Chinese sentence put into the past, `meets that
description` for 符合条件, and `Thank you all the same` — which means thanks DESPITE something — for
同样感谢你.

**Five `Compounds` blocks**: 桶 and 土 had nothing at all in the reader's downloaded deck, 痛 and 图 one
word each, 推 two.

**Read and left.** 提到, 提供, 提醒, 体温 and 体重's sentences, 条件, 听众, 停, 停车, 停止, 童年, 同样's
other lines, 图 (whose 有图有真相 is internet slang but accurately rendered *Pics or it didn't happen*),
图片's other lines, 推迟 — and `closet`, whose single site is *coming out of the closet*, an idiom that
is the same in British English.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 327 unchanged; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 569 unchanged;
`build-lang-decks.js` re-run.

## Batch 66 — hsk30l4 notes 751–780 (推出 → 吸)

Thirty consecutive notes; **twenty changed**.

**The leading finding is a hint pair that was hiding an outright error.** 网址 was glossed
**`website`** — which is 网站 — while all three of its own sentences say *web address* (请把网址发给我,
这个网址已经失效, 他记下了网址). The two cards therefore shared one English word and carried a
`not 网站` / `not 网址` pair between them, **so the mistake was being papered over rather than
reported**: the disambiguator made the collision survivable and nothing was left to say that one of the
two glosses was simply wrong. Correcting 网址 to `a web address; a URL` dissolves it, and the pair is
retired. Shared groups 327 → 326; the sixth pair retired in this audit. **A `not X` block is a reason
to read both cards, not a reason to stop.**

**Two sentences out of register by a very long way.** 无's second was **Classical Chinese**:
狗子还有佛性也无？ is Zhaozhou's dog, a Chan koan, on a Level 4 vocabulary card — 也无 is not a question
particle any modern learner will meet. And 卫生's third, 这是夜用的卫生巾吗？, is a sanitary-towel
purchase whose English used **maxi pad**, the American term; the card is glossed for hygiene in general
and the sentence buries the headword in 卫生巾 besides.

**An offensive English line no checker can reach.** 脱's first sentence rendered 背心 as a
**wife-beater**. `check-coarse.js` is blind to it twice over: 脱 is a one-character headword, so
`own()` excuses every compound built on it, and the phrase is in none of its six lists in any case.
Found by reading. The card was also glossed `to escape; shed` while **all three** of its sentences are
taking clothes off, which is CC-CEDICT's own leading sense.

**A fragment punctuated with a double full stop.** 无论's first sentence was 无论我如何努力。。 —
*No matter how hard I try...* — which stops before the clause the conjunction exists to introduce, and
writes 。。 where Chinese sets an ellipsis. **A conjunction card whose example never reaches the second
half teaches nothing about how to use it.**

**Five more glosses that miss what the card shows**: 推出 was the literal `to push out` while two of its
three sentences are launching a product; 文章 was `essay` over a newspaper article and an idiom; 味道 was
`flavour` without the smell sense a learner meets as often; 卫生 was `health`, which is 健康; and 无 was
`without` under a `verb` label over two sentences that are the bound negator. **Two labels**: 晚安 was
`verb` — the decks already have `interjection`, which hsk30l1/你好 uses — and 污染 was `verb` over a
gloss opening on the noun.

**Six English lines.** 百闻不如一见 was rendered *A picture is worth a thousand words*, a different
proverb altogether that erases the 闻 the card is about. *The papers blew off*, *Lunch is on* (which
reads as an offer to pay), *You read the paper?*, `goodnight` closed up where British style sets the
greeting as two words, and a thermometer that *goes* below zero rather than reading below it. Two
sentences ended bare and were given their full stop.

**Four `Compounds` blocks**: 脱 and 闻 had nothing at all in the reader's downloaded deck, 味 and 吸 one
word each.

**Read and left.** 袜子, 外出's other lines, 完全, 晚餐, 网购, 网页, 网友, 往往's other lines, 危险, 味,
温度, 文件's other lines, 无法, 无聊, 误会, 吸 — and 味's third sentence, whose 调味品 buries the headword
in a compound that transparently means what the character means.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; **shared-gloss groups 327 → 326**; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 569 unchanged;
`build-lang-decks.js` re-run.

## Batch 67 — hsk30l4 notes 781–810 (西部 → 笑话)

Thirty consecutive notes; **seventeen changed**.

**The leading finding is a SIBLING PAIR both built on a split headword, which says how they were
assembled.** 线上 was illustrated with 足球教练站在边线上对自己的队伍喊出指令 — 边线 + 上, *on the
TOUCHLINE*, which its own English says — and 线下 with 太阳落到地平线下了 — 地平线 + 下, *below the
HORIZON*. **The same fault, on the two cards sitting next to each other**, which is what tells you the
harvest matched on the CHARACTER SEQUENCE rather than on the word: any sentence containing 线 followed
by 上 or 下 qualified, however the words actually divide. Both are the blind spot
`check-example-fit.js` names in its own header, and both were found by reading the English against the
Chinese. (The 线上 line also turned one 足球教练 into *The manager and coach*, two people.)

**Four cards whose sentences show none of the senses they gloss.** 细 names *thin, fine, slender;
minute, detailed* and showed none of the first three — two of its sentences were literary besides
(如果细究起来，实则不然 and the four-part maxim 愿要大、志要坚、气要柔、心要细), neither of which a
learner can use. 鲜's three were all 鲜红 or 鲜肉, the *bright* sense, while the gloss leads on *fresh*
and *delicious*. 香's first buried the character in 百香果, passion fruit. 咸's third was a film line
whose English — *Without dreams, what different are we from animals?* — is neither grammatical nor a
translation of 咸鱼, salted fish.

**A seventh family `check-british.js` reads 0 over.** 细's third English line wrote **`savored`**, and
`savor` is not in app.js's `SPELL_PAIRS` at all — after -logue, -ward, one-way `programme`, `skeptic`,
`kerb`, `globalis` and `yog`. Measured over the nine decks: **one** site against eleven `savour`, so it
is a per-note fix. **`pants` was measured in the same pass and is also per note**: of its nine hits,
eight are the VERB *to pant* (喘, 喘息) or the set idiom *to piss one's pants*, and only 鲜's `pant
legs` is the American word for trousers.

**Two more labels that are a different sense from their own gloss.** 项 is `measure word` over *nape
(of the neck); sum (of money); term* — three nouns — while two of its sentences are the classifier.
笑话 is `noun / verb` over the single noun *joke* while TWO of its three sentences are the verb, to
laugh AT somebody. Both split, with each sentence saying which sense it shows.

**Three sentence sets that misuse the word or the punctuation.** 效果's second tacks 效果 onto 副作用,
which already means a side effect, and its third wants 影响 — a question has an EFFECT ON you in
English and 影响 in Chinese, where 效果 is the result something achieves. 小组's second was wrong three
times over: 。。。 for an ellipsis, 嘛 for the question particle 吗, and an English *we* where the
Chinese says 我. 响 rang a telephone twice and never showed the *loud* sense its gloss names.

**And the per-note rule met for the third time.** 相反's third sentence is the one batch 61 corrected on
hsk30l4/然而 — and it sits on this note too, still carrying the old English. **A sentence carried by
several notes needs one row each**, and the only way to find the others is to grep the decks for the
sentence.

**Four more English lines**: *This message doesn't make sense* for 消息, which is news rather than a
message; *the author of this story* for a 小说 glossed *novel*; *She scorned the boy* for 看不起 a
小伙子, wrong on both the verb and the age; and *five spice* run together without its hyphen. Two
sentences ended bare and were given their full stop.

**Five `Compounds` blocks**: 咸, 香, 响 and 项 had nothing at all in the reader's downloaded deck, and
**咸 has nothing anywhere in the collection** — the fifth such character, after 扔, 帅, 躺 and 趟. 鲜 had
one word. 咸's block is two rows rather than three, which is CC-CEDICT's limit rather than a short
measure.

**Read and left.** 西部, 西红柿, 吸引, 细心, 下降's other lines, 鲜花, 现金, 羡慕, 现有, 相比 (whose
third line calls a person 嘈杂, which is marginal but attested), 相互, 相同, 详细, 想法, 小吃, 小组's
third line.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 326 unchanged; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 569 → 575;
`build-lang-decks.js` re-run.

## Batch 68 — hsk30l4 notes 811–840 (血 → 研究生)

Thirty consecutive notes; **sixteen changed**, and seven of them needed a `Compounds` block.

**A card teaching a word that is not Mandarin.** 熊's first sentence was 看看那边的树熊 — **树熊 is the
Cantonese and Taiwanese name for a koala**, which CC-CEDICT does not carry at all (it gives 树袋熊 and
the loanword 考拉) — so a card about bears showed a marsupial, under a regional name, with the headword
buried in the compound. Three faults in one sentence, and the only one any checker could in principle
see is the third. **This is the second dialect word this audit has found in a shipped sentence**, after
听力's 外父 (Cantonese for a father-in-law) last batch but two.

**Two cards whose content was intimate or narrow.** 性's third sentence was 老公性无能，我该怎么办？ — a
marital sexual-health problem on a card glossed *suffix: nature, character, innate quality*, which the
sentence does not illustrate; `check-coarse.js` cannot reach it, 性 being a one-character headword whose
`own()` exemption swallows every compound built on it. 性别's **three** sentences were all about gender
identity — 跨性别, 变性者…维持性别特征, 非二元性别 — so the everyday word showed one narrow topic three
times and none of the uses a learner meets first. The longest and most technical was replaced with a
form asking your sex; the other two stand.

**Five sentences that teach nothing about their own headword.** 血's second buried the character in
吸血鬼 and asked whether vampires can taste. 压's three never used it as a free verb at all — 解压 and
重压 bury it, and 强宾不压主 is a proverb a learner cannot adapt. 星星's third was an unnatural passive
(星星没有被看到, *Not a star was to be seen*, word for word). 醒's second was a back-translation whose
English belongs to the sentence it came FROM (我想办法不让你醒 for *I tried not to wake you up*, where
Chinese says 我尽量不吵醒你). And 幸福's second was a **film title** — 当幸福敲门时, the Chinese name of
*The Pursuit of Happyness* — a subordinate clause with no main clause and no terminal mark.

**Two glosses missing the sense a learner meets daily.** 烟 was `smoke, mist, or vapour` while
CC-CEDICT leads with **cigarette or pipe tobacco**, which is 抽烟 and 香烟 and which no sentence showed;
the gloss is widened and the thinnest sentence replaced with it. 性格 was `temperament` while all three
of the card's own English lines say **character**.

**Four English lines, three of them American.** 学费's first said `college tuition`, which is American
twice over — a British student is at UNIVERSITY, and in British English `tuition` is the teaching rather
than what you pay for it, so the fees are *tuition fees*, which the card's own third line already says;
that line in turn called a 银行卡 a credit card. `Catch a signal` for 收到一个信号, which is to RECEIVE
one. And 辛苦 rendered as `hardworking`, which is 勤奋 — 辛苦 is having it hard, the toil rather than the
diligence, and the card's own third line gets it right.

**Seven `Compounds` blocks** — 血, 熊, 盐, 烟, 醒, 修, 压 — every row checked against CC-CEDICT first.
**盐 has nothing built on it anywhere in the collection**, the sixth such character after 扔, 帅, 躺, 趟
and 咸.

**Read and left.** 心 (eight words in its panel already), 心情's other lines, 信息, 信心, 兴奋, 兄弟,
修理, 学院, 压力, 牙膏, 亚洲, 盐's sentences, 严格, 研究, 研究生 — and **许多, whose `numeral` label is a
judgement rather than a fault**: it is a quantifier rather than a number, but the decks' label
vocabulary has no `determiner` and `numeral` is where 数 puts its own quantifying sense, so changing it
would make this card disagree with its neighbours for no gain.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 326 unchanged; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 575 unchanged;
`build-lang-decks.js` re-run.

## Batch 69 — hsk30l4 notes 841–870 (严重 → 勇敢)

Thirty consecutive notes; **twenty-one cards changed** across three decks.

**The leading finding is a gloss that was the wrong end of its own transaction.** 应聘 is to APPLY for
an advertised job, and the card said **`accept an offer of employment`**. CC-CEDICT carries both
readings — /to accept a job offer/to apply for an advertised position/ — but the card's own sentences
settle it: 应聘薪酬更高的工作 is applying, and 应聘者 is an APPLICANT, which its third English line
already says. The first sentence's English had followed the wrong gloss into *accept the offer from
that company*, so the card was internally inconsistent and nothing reported it.

**A seventh `not X` pair retired, and it took a real distinction to do it.** 演出 was labelled `verb`
over the noun gloss `performance` — with three noun sentences — and shared that one English word with
hsk30l3/表演, which is why the two carried a hint pair. **演出 is the EVENT, a staged show; 表演 is the
ACTIVITY, the performing itself**, which is why 表演 takes a verb sense and 演出 in practice does not.
Both sharpened, the pair retired.

**A sentence about dealing drugs, on four cards, and only one of them was wrong.**
她在演唱会的场地贩卖毒品 — *She's selling drugs at concerts* — sat on 演唱 (as a row **this record
itself had added** in an earlier batch), on hsk30l6/场地, and on hsk30l7/毒品 and hsk30l7/贩卖. It was
replaced on the first two and **left on the last two**, and the line between them is
`check-coarse.js`'s own discriminator: a hit is dropped where the matched term IS the headword. 毒品 is
narcotics and 贩卖 is trafficking, so a card for either must show a sentence about them; 演唱 is singing
and 场地 is a venue, and there the drugs are incidental to the word being taught. **The same sentence
can be right on one card and wrong on another** — the rule batch 27 found for 短发 on 短 and on 发,
met here in the coarse-content register.

**Two more sentences unfit or not Chinese.** 引起's first was 如何引起女人的渴望？, clickbait rather
than teaching, in a sense the card's own third line already covers usably. 演唱's first wrote
**调情说爱**, which is a blend of 调情 and 谈情说爱 and is not an expression.

**Four cards showing one thing three times, or nothing at all.** 演's three sentences all bury the
character in a compound (开演, 重演, 讲演), so a card glossed *to perform* never showed the performing.
叶子's three were all leaves falling. 勇敢's first two were the same sentence twice, differing only in
the politeness of the pronoun. And 一切's first was not a sentence at all — 美好的一切 is a NOUN PHRASE,
*all that is good*, whose English read it as a clause.

**Three more glosses.** 阳光 led on the FIGURATIVE senses while all three sentences are literal
sunshine; 叶子 was `foliage`, a mass noun a learner will not use, over three English lines saying
*leaves*; 演员 was `actor/actress`, a slash form that is dated and narrower than the word, 演员 being
any performer. **One more label**: 邀请 was `verb` over the noun `invitation` with one noun and two verb
sentences, now split and tagged.

**Six English lines.** *If I was you* where careful English keeps the subjunctive — the one place a
learner copying the line will need it; `a thought` for 有意见, which the card's own gloss already calls
an objection; a dropped `already` on the card whose whole subject is 已; a present-tense price question
put into the past; *a chance in winning*; and *You want to leave it like that?* for 那样子行吗, which
asks whether that will DO.

**Three `Compounds` blocks**: 已 had nothing at all, 赢 and 夜 one word each.

**Read and left.** 严重, 眼镜's other lines, 眼前, 养成, 钥匙, 也许, 夜, 夜晚, 以内, 一生, 艺术, 因此,
印象, 赢, 赢得's other lines, 勇敢's third line — and hsk30l7/毒品 and hsk30l7/贩卖, read deliberately
and left for the reason above.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 326 unchanged; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 575 → 578;
`build-lang-decks.js` re-run.

## Batch 70 — hsk30l4 notes 871–900 (永远 → 约会)

Thirty consecutive notes; **sixteen cards changed** across three decks.

**The leading finding is the character-used-for-its-sound fault at its worst: two thirds of a card.**
由's second and third sentences were 由美将不会打网球 and 我想由美生病了 — both about **由美, YUMI**, a
Japanese given name — so a card for the preposition 由 illustrated it twice with a transliteration in
which the character means nothing at all, leaving one sentence to teach the word. This is 取's 鸟取
(batch 60) and 费's 法拉费 (batch 47) again, and it is the widest instance yet.

**Three sentences that are English put through a dictionary.** 优点's 她不自豪她所有的优点 renders *With
all her merits she was not proud* word by word, and 不自豪 does not take an object that way. 优秀's
**第二优秀 is not Chinese** — *second best* is 第二名 or 屈居第二, and 第二 cannot modify an adjective as
an English superlative does. And 有着's first sentence **contradicted the card's own gloss**: 有着 is for
qualities and experience, which the gloss says outright, and 你有着漂亮的腿 uses it of a pair of legs.

**A card whose gloss and every English line disagreed.** 友好 is glossed `friendly` and **all three
lines said `kind`**, which is 亲切 or 好心 — a different quality the reader would then use wrongly. Two
corrected; the third was the second again and was replaced.

**Four labels, all of them naming a part of speech the card never shows.** 永远 `noun / adverb` with
three adverbs; 有效 `verb` over an adjective, and two of its sentences are the OTHER adjective sense
(有效期限, 车票有效三天 are VALID rather than effective); 原来 `noun / adjective / adverb` over the single
word `originally`, where two of its sentences are *as it turns out*, a sense the gloss never reached;
and 约会 `noun / verb` over `appointment` while two of its sentences are a romantic DATE.

**Two more glosses**: 友谊 was `companionship` over three English lines saying *friendship*, and 原谅
`to excuse` over three saying *forgive*. **One sentence too long to be an example**: 用于's second ran
to forty-seven characters, with an English line longer still.

**Three things went wrong in the doing, and all three are worth keeping.**
· **Correcting 友谊 to `friendship` created a NEW collision** with hsk30l7/交情, which was glossed
  `Friendship` — capitalised mid-field, which nothing else in the decks does. The checker caught it on
  the run. 交情 is sharpened to what it actually means (how well two particular people know each other)
  rather than the pair being left to collide. **A gloss correction can make a collision as easily as it
  dissolves one; read the shared-gloss delta, not just the count.**
· **Dropping 友好's third sentence orphaned an `exSpace` row** this record had written for it in batch
  25. The trap batch 59 met with `exEn`, one field over: **a drop orphans every other row naming the
  same sentence.**
· **Giving 交情 its first entry silently deleted two of its three examples.** It carried two `uc-exadd`
  blocks the record did not account for, and the applier strips every added block from a note before
  re-adding what the record names — so blocks written into a deck without a record row survive only
  until that note is touched for anything at all. They were good sentences and are adopted as proper
  `ex` rows. **Measured afterwards: about ten such blocks remain across the nine decks, each one
  waiting on its note's first entry.** The strip is right — the record is authoritative or it is drift
  — so **re-count a touched note's examples after giving it its first entry.**

**And the `compounds` guard earned its keep again**: a first draft of 与's block listed **给予**, which
is 给 + 予, a different character that merely looks like 与. Refused, as it should have been.

**Three `Compounds` blocks**: 与 had nothing at all, 由 one word, 油 two. 与's block carries 参与 and
与会 deliberately — they are the character's other reading, **yù**, which nothing else on the card could
tell a reader about.

**Read and left.** 用来, 幽默, 尤其, 游玩, 由于, 友情, 有趣, 愉快, 于是, 语法, 预习, 原因, 远离, 院长,
约 — and 院子, whose three English lines called the same enclosure a *yard* twice and a **patio** once,
now all three the same word.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 326 unchanged (327 mid-run, corrected); pinyin clean;
example-fit 143 and senses 152 unchanged; british 0; 34,596 blocks with spoken == visible on every one;
sense-tagged 578 → 584; `build-lang-decks.js` re-run.

## Batch 71 — hsk30l4 notes 901–930 (月饼 → 之)

Thirty consecutive notes; **fifteen cards changed** across two decks.

**Three sentences whose Chinese says something different from their own English**, which is this
audit's most reliable single tell and the fault no checker can reach.
· 者's first was 她不是伤害者 — she is not the one who HARMS — under the English *She is not the
  victim*, which is 受害者, **the opposite party**. A reader would have learned the word for a
  perpetrator as the word for a victim.
· 证明's third was **数学喜欢证明事物**, *MATHEMATICS likes to prove things*, under an English saying
  *Mathematicians* (数学家). As it stands a school subject does the proving.
· 证's third wrote **应证**, which CC-CEDICT does not carry at all — it is a mis-writing of 印证, to
  corroborate — under the English *That thought crossed my mind*, which is a different sentence again.
  Two faults in eight characters.

**A conjunction sense with nothing behind it.** 再说 carries two senses and all three of its sentences
were the first: 改天再说吧, 再说一遍, 不要再说了. The CONJUNCTION — *besides, what is more*, which is how
a learner meets 再说 in speech — had no example at all, and the third sentence was the second again, so
it is replaced with one and each sentence now says which sense it shows.

**Four glosses that are the wrong part of speech or the wrong word.** 阅读 `verb` over the gerund
*reading*; 招聘 `verb` over the noun *recruitment*; 着火 glossed **`to burn`**, which is 燃烧, where
着火 is to CATCH fire, as all three of its own sentences are; and 正常 carrying a sense the word has not
got — `normal; fine; **generally speaking**`, the last of which is 一般来说.

**The per-note rule, for the fourth time.** 增加's third sentence ended with no terminal mark — and it
is the same sentence batch 61 gave a full stop to on hsk30l4/人数, sitting here uncorrected. A row
reaches ONE note; a sentence carried by several needs one row each.

**And a collision made rather than dissolved, for the second batch running.** Correcting 阅读 to the
plain `to read` collided with hsk30l6/念书 — which is itself glossed `to read` while **all three of its
sentences are studying** (边听音乐边念书, 为考试念书, 出国念书), so that card's own English contradicted
its gloss too. Both sharpened: 阅读 to *to read (a text)*, 念书 to *to study; to attend school*. **A
gloss correction can make a collision as easily as it dissolves one — read the shared-gloss delta, not
just the count.**

**One more sentence that is not Chinese**: 增加's 事故没减少而增加 puts 没…而… where the language says
不但没减少，反而增加了, so it reads as a translation of *Instead of fewer accidents there are more*.

**Three English lines.** 月饼's third **contradicted its own card twice in one sentence** — `moon cake`
open where the gloss and the other two lines write *mooncake*, and `Mid-Autumn Day` where they write
*the Mid-Autumn Festival*. 杂志's second put a present-tense invitation into the past. And 责任's *It is
you that are to blame for it* is not English anyone writes.

**Two `Compounds` blocks**: 云 had nothing at all, 整 two words.

**Read and left.** 月份, 云's sentences, 允许, 再次, 暂时, 暂停, 早餐, 早晨, 增长, 真正, 整, 整个, 整理,
正好, 证件, 正确, 正式, 之 — and 920 整 and 921 整个, whose first sentences are near-identical
(她哭了一整晚 and 我哭了整个晚上): they are different cards teaching different words, and the pair is
what shows the difference between them.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 326 unchanged (327 mid-run, corrected); pinyin clean;
example-fit 143 and senses 152 unchanged; british 0; 34,596 blocks with spoken == visible on every one;
sense-tagged 584 → 587; `build-lang-decks.js` re-run.

## Batch 72 — hsk30l4 notes 931–960 (支持 → 转)

Thirty consecutive notes; **twenty-two cards changed** across four decks.

**The split-headword class at its sharpest.** 只好's third sentence was 这支铅笔比那**只好** — which is
那只 (that one, with its classifier) + 好, *this pencil is better than that one*, exactly as its own
English says. The two characters are a very common classifier and a very common adjective sitting next
to each other, and **只好 IS a real word**, so greedy longest-match lands squarely on it and
`check-example-fit.js` reports the card clean. Sixth instance in this audit, after 人生, 上门, 十分,
数年, 头痛 and 线上/线下.

**A second reading the card does not carry.** 转's second sentence, 月球围着地球转, is **zhuàn** — to
revolve, which CC-CEDICT gives its own entry — on a card whose pinyin field said zhuǎn and nothing
else. 弹's fault from batch 64, and the fix is the shape 数, 血 and 熟 already use: both readings in the
pinyin and bopomofo fields, a sense each, and every sentence tagged with the reading it shows.

**Two word-choice families measured, and both went per note.**
· **`major` for a university subject** is American — British English asks what you are STUDYING.
  Measured over the nine decks: **29 occurrences, of which only five are this sense**; the rest are
  *a major problem*, *the major cities*, a military rank and a musical key, all ordinary British
  English. `gas` again, so it is a per-note fix — on 专业 twice and on hsk30l7/攻 and hsk30l7/宗.
· **`gonna`** is a spoken contraction no learner should be shown as written English, and the decks'
  English is standard everywhere else. Four sites across three decks, all corrected.

**Four glosses and labels.** 支持 was `to be in favour of` under a verb label while its second sentence
is the NOUN; 值得 was the adjective `worthy` under a verb label; 植物 was the bare plural `plants`; and
中餐 gave one of the word's two senses while its third sentence needed the other — rendered *There's
often rice or **pasta** for **lunch***, wrong twice, 面条 being noodles and the sentence being about
Chinese cooking.

**Three sentences that teach nothing about their headword.** 指's 指环没了光泽 buries the character in a
RING; 著名's first and third were both a famous singer; 祝's first and third were both wishing somebody
luck. And 纸巾's second wrote **。。。** where Chinese sets an ellipsis, with `gonna` in its English.

**Seven English lines.** `His ideas never earned him a single penny` for 一文不值, which means
WORTHLESS — and is the card's own gloss. `Do you enjoy your vocational field?`, which is not English.
**`barrister`** for 律师, which asserts an English distinction the Chinese does not make. `Where were
you?` dropping the 之前 the card is about. `She at least, she can face them!`, ungrammatical. `the
accent was on unemployment`, in a sense almost nobody now writes. And `I want to feel important` for
被人重视, which is hoping to be VALUED.

**Four `Compounds` blocks**: 值, 指, 祝 and 转 — one or two words each in the reader's downloaded deck.
指's block is where the card's noun sense went, 手指 and 戒指, once the gloss was reduced to the verb
the card teaches.

**Read and left.** 支付, 之后, 之间, 知识, 之中, 直接, 指出, 质量, 中年, 重点's other lines, 周围, 主意,
祝贺 (whose 我为你的订婚祝贺 is slightly marked, 祝贺你订婚 being the ordinary order, but attested), 专门,
转's third line (转小声 for a volume control, which is plausible if not the commonest verb).

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 326 unchanged; pinyin clean — **including the new two-reading
field on 转**; example-fit 143 and senses 152 unchanged; british 0; `gonna` now 0; 34,596 blocks with
spoken == visible on every one; sense-tagged 587 → 593; `build-lang-decks.js` re-run.

## Batch 73 — hsk30l4 notes 961–990 (转发 → 作者) — **Level 4 complete**

The last thirty notes of the HSK 4 deck; **eighteen cards changed**. **Level 4 is finished**: 990 notes
read one at a time over twenty-eight batches, from 阿姨 to 作者.

**The leading fault is a gloss that describes the one sentence where the headword is swallowed.** 装 is
glossed `dress; attire; clothing` — three NOUNS under a `verb` label — and the only sentence that fits
it is 着装, where the character is buried in a compound. The other two are verbs in two quite different
senses: 他装听不见 is to PRETEND and 这个瓶子装满了水 is to FILL. **The card glossed the sense it does
not teach and taught two it does not gloss.**

**Two more senses that no sentence showed.** 准's gloss names `standard, accurate, **to allow**` and the
last is a verb (不准, 准许) with nothing behind it — while two of its three sentences were the same watch
twice. 座's first sense is `seat` and **neither of its tagged sentences showed it**, both being the
classifier, with the untagged third burying the character in 叫座. Both cards now show the missing sense
and tag every sentence.

**Four labels, and one of them was right.** 自信 named `noun / verb / adjective` with nothing verbal on
the card; 最终 named `noun` over two adverbial sentences; 作用 named `noun / verb` where 起作用 is a verb
phrase built ON the noun rather than a verb use of it. But **自然's three-part label was correct** and
its sentences show all three — 功到自然成 the adverb, 自然中 the noun, 自然现象 the adjective — so there
the GLOSS was doing a third of the work, and the fix was to split it rather than to cut the label.

**Two sentences that are paragraphs.** 转机's first ran to fifty characters of philosophy with **a
full-width IDEOGRAPHIC SPACE after every comma**, which nothing else in the decks uses, and taught a
different sense of the word besides (得到转机, a turn for the better, on a card glossed *to transfer
planes*). 总结's first ran to forty and wrote 三个的 where Chinese needs no classifier at all.

**Two more sentences that are not Chinese**: 准确's 准确是多少钱 puts an adjective in front of 是, and
尊重's 尊重地回应 uses 尊重 adverbially, which it does not do — its English calling it `reverence`, a good
deal stronger than the word.

**Three glosses**: 自 led on `self; oneself`, which nothing on the card shows (产自, 不请自来, 自此 are all
*from, since*, and the self sense is a bound one that now lives in its `Compounds` block); 尊重 was `to
honour` over three English lines saying *respect*; and two sentences ended bare.

**Four `Compounds` blocks**: 装, 组, 座 and **赚, which has nothing built on it anywhere in the
collection** — the seventh such character, after 扔, 帅, 躺, 趟, 咸 and 盐.

**Read and left.** 转发, 准时, 资料, 仔细, 自习, 自学's other lines, 左右, 做法 (whose 灌肠的做法 is
food in context, though the word also names a medical procedure), 作家, 做梦, 作品's other lines, 座位,
作文, 作者.

**Level 4 in summary.** Twenty-eight batches, 990 notes. What the deck turned out to contain, by the
classes this audit has named: **six split headwords** whose two characters belong to different words
(人生, 上门, 十分, 头痛, 线上/线下, 只好); **four characters used for their sound** in a transliterated
name (鸟取, 由美 twice, 法拉费's siblings); **two dialect words** (树熊 for a koala, 外父 for a
father-in-law); **three character errors** (大咸了, 应证, 电灯炮's kin); **eight truncated or simply wrong
glosses**; **seven blind-spot spelling families** `check-british.js` cannot see; and **seven characters
whose tap panel is empty across the whole collection**. Coverage ends at 11,532 notes with three
sentences each and zero repeats.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 326 unchanged; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 593 → 609;
`build-lang-decks.js` re-run.

## Batch 74 — hsk30l5 notes 1–30 (哎 → 报到) — **Level 5 begins**

The first thirty notes of the HSK 5 deck, the biggest of the graded six; **twenty-five cards changed**
across two decks.

**The leading fault is the transliterated-name class at twice its usual size.** 安 is glossed
`peace, tranquility, safety`, and **two of its three sentences use the character as a person's name** —
安没有妹妹 and 谁打电话给安, both rendered *Ann* in their own English. Only 城市安睡了 uses it for its
meaning at all, so the card taught a sense **no sentence on it showed**. Fifth instance in this audit
after 鸟取 and 由美, and the first where the name takes the majority of the card.

**And it arrives twice in thirty notes.** 宝's second sentence is 宝拉为今天的考试念书了吗 — *Paula* —
and its third is 宝塔, a pagoda, where the character contributes nothing a reader could carry anywhere
else; that left one sentence in three showing `treasure`. **The Paula sentence is legitimate on
hsk30l6/念书**, whose headword it is really about, and is left standing there: the same sentence can be
right on one card and wrong on another, which is batch 27's finding met from the other side.

**Three cards glossed the sense they do not teach.** 包裹 gave the two VERB senses, `wrap up; pack up`,
while all three of its sentences are the noun — a parcel you lift, lose and have seized by customs.
保安 gave `to ensure public security` over three sentences about a security guard you call, bother or
send for. 把握 gave `to grasp; to hold; seize` under a `noun / verb` label while its second sentence is
the noun — 没有任何人对它有把握, nobody can be SURE of it. Each now carries both senses with every
sentence tagged.

**A labelled sense with no gloss behind it.** 白's label read `adjective / adverb` and the gloss was
`white` alone — while the FIRST sentence is the adverb, 他没有白死, *he did not die in vain*. A reader
meeting it was shown a word for a colour doing something no colour does.

**A polyphone taught at the wrong reading, on a sentence that should not be on a vocabulary card
either.** 薄's first sentence was 女人薄情善变 under *A woman is ever fickle and changeable*. 薄情 is
**bóqíng** — the character's other reading — on a card whose pinyin is báo and whose gloss is
`thin; flimsy`, so the sentence showed neither the card's sound nor its sense; and it is a flat
generalisation about women on a card about thinness. Replaced with the card's own sense.

**A card's third sentence was another card's headword.** 保's was 保存在阴凉的地方 — which is 保存, note
25 in this same deck, four cards further on. (Legitimate on hsk30l4/凉, where 阴凉 is the headword, and
left there.)

**Two calqued sentences.** 保持's 保持远距离关系不是最好的 is English put into Chinese word by word, where
the language says 异地恋 — and its English, *Having a long distance relationship isn't the best*, is not
English either. 宝贝's 他睡得像个宝贝似的 is *sleeping like a baby* taken across literally, where Chinese
says 睡得像婴儿一样; as it stood it said he sleeps like a darling.

**A hint pair retired, and the second half of it sharpened to make that honest.** 哎 and 嘿 were both
glossed `hey` and carried a `not X` line at each other. They are not the same word and **each card's own
three sentences say which is which** — all three of 嘿's call to somebody, where 哎's are surprise and
dismay, none of them rendered *hey* in its own English. Both glosses sharpened, the collision dissolved
and both hint rows removed. **Eleventh pair retired.** It also cost a lesson: the hints are keyed
`<deckId>/<headword>`, and a first sweep looking them up by the bare word found none, so the `gloss`
rewrite dropped 哎's hint before I had noticed it had one. **Read the hint map by its real key before
rewriting a gloss.**

**Three labels, one gloss, one word.** 半夜 was labelled `noun / numeral / measure word` over `midnight`
— those belong to the two characters taken apart rather than to the word. And 宝贝's `treasure; baby`
reads as the infant where 宝贝 is the term of endearment, which the card's own second line already
called *honey*.

**Two more missing terminal marks** (把握, 保留) **and one missing comma** (哎呀, which ran its
interjection straight into the clause after it where its other two sentences both set it off).

**Nine English lines**, of which three are worth naming: `Don't mistreat small animals!` for 要爱护小动物,
which reverses the polarity of the positive imperative the card is teaching; `a talking machine` for
发声器, which is a speaker; and `The weekdays are: Monday, ...` for 工作日包括, which drops the headword
altogether.

**Four `Compounds` blocks** — 暗, 薄, 宝 and 白, the first three with nothing at all in the reader's
downloaded deck. 宝塔 is carried there as a row, which is where a word built on the character belongs
once its sentence has gone.

**Read and left.** 哎呀's own gloss, 安全带, 安慰 (whose `verb / adjective` label is the ordinary
two-label shape rather than a missing sense), 安装's Chinese, 暗, 熬夜, 傍晚's other two, 包括's third,
包装, 宝贵, 保留's other two, 保险 (whose 保险箱 swallows the headword but is a real compound the reader
will meet), 保质期's Chinese, 报到 — and the whole of 唉 beyond its third sentence, which this record had
itself added as 唉唷喂啊, a fixed exclamation showing nothing of the bare word.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups **326 → 325**, no new collision; pinyin clean; example-fit 143
and senses 152 unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged
609 → 624; `build-lang-decks.js` re-run.

## Batch 75 — hsk30l5 notes 31–60 (报道 → 表达)

Thirty consecutive notes, **sixteen of them changed**, plus **three cards outside the range** that share
a sentence with one inside it — nineteen cards in all, across two decks.

**The leading fault is a homophone pair written the wrong way round, twice on one card.** 必需 and 必须
are both **bì xū** and are different words: 必需 is *to require; essential*, 必须 is the adverb *must*,
and 必须 has its own card at hsk30l3. Two of 必需's three sentences are 必须 sentences wearing the other
character — 你必需马上去那儿 (*It is necessary for you to go there immediately*) and 我们必需克服我们所感到的无助
— so **only 汽车是必需的 was this card's word at all**, and the card taught the reader to write the wrong
one of the single hardest pair in the level. Replaced with the verb and the attributive, which the card
also lacked, so its three sentences are now three constructions.

**A card whose glossed sense is the one it does not show, for the fourth batch running.** 报警 was
glossed `to give a warning` while all three sentences call the POLICE — 我们该报警 / 想报警的是谁 /
我要报警了, every one of them rendered *call the police* in its own English.

**And a card two of whose three sentences are a sense it does not gloss at all.** 便 glosses biàn as
`convenient, handy; then, in that case`, and 便后请洗手 and 我小便里有血 are the excretion sense
CC-CEDICT lists and this card does not; the third, 搭便车, is 便车, a lift. So **the `then, in that case`
the card does gloss — the commonest bare use of the character in written Chinese — had no sentence at
all.** This is also **batch 30's blind spot arriving on a new card**: `check-coarse.js`'s `own()` branch
excuses every compound that contains a ONE-character headword, so a card about 便 is permanently exempt
from every term beginning 便 and nothing reported these.

**A 130-character paragraph as an example sentence.** 本领's first was three sentences and a 90-word
English translation about a teacher exploiting his pupils to price a holiday, buy a fruit bowl and dress
dolls; the headword appears once, in the opening clause, and everything after it is about something
else. The longest example in the deck by a wide margin, and 转机 and 总结's fault from batch 73 at four
times the size. (**The same paragraph also sits on hsk30l7/衣裳**, whose batch is a long way off; it is
recorded and left there.)

**A sentence with no subject, carried by three cards.** 背后感受到她的目光 begins on a place word and
then has 感受到 with nobody attached to it, its English quietly supplying the *I* the Chinese has not
got — and it is on **hsk30l5/背后, hsk30l5/目光 and hsk30l4/感**. Repaired rather than replaced, and
repaired on all three: a row reaches one note, so one sentence on three cards is three rows.

**A political slogan, on two cards.** 共产主义必胜！was the first sentence of 必 and of 胜. Replaced on
both — the objection the public-figures sweep made earlier in this audit, and not a view about the
slogan.

**A classifier the card's own measure-word field contradicts.** 被子's second sentence counted the quilt
with 张 where the field says 床 and the first sentence uses 条. A card that states its classifier and
then shows a different one teaches a reader to distrust the field.

**A 的 where the language wants 地.** 表达's 我不能流利的用英文表达 writes the attributive particle in an
adverbial slot — one of the two or three commonest written errors in Chinese, and not something a card
should model. Its gloss was `to voice (an opinion)`, narrower than any of its own three sentences, none
of which is about an opinion.

**Three sentences that are not what a vocabulary card is for.** 报道's was thirty characters calling the
press 垃圾媒体, the gutter press, and stating an opinion about media bias. 标题's was software
documentation — function parameters, window titles, icon titles. 本质's was 众人皆知月球之本质为芝士,
which is classical grammar (之 for 的, 为 for 是) on a Level 5 card and says the moon is made of cheese.
All three were sentences this record had itself added in earlier example top-ups.

**Six English lines**, of which the two worth naming are `The convenience store ran out of business` for
出兑, which is a shop putting itself up for sale, and `Man is the only animal that talks` for
人类是唯一彼此交谈的动物, which drops 彼此 — the headword, and the whole claim, animals being noisy enough.

**One `Compounds` block**, 必, which had one word in the reader's downloaded deck against thirteen in the
collection.

**Two faults of my own, both recorded because both are traps this file already names.**
· **An orphaned `exEn`, twice in one batch.** Dropping a sentence from 报道 and from 便 left behind the
  `exEn` rows batch 24 had written for those same sentences, and the applier FAILED on both — which is
  exactly what that field is for, and is batch 70's *a drop orphans every other row naming the same
  sentence* met again. Removed with the sentences.
· **A replacement eaten by its own drop.** The first repair of 背后感受到她的目光 was written
  我在背后感受到她的目光, which CONTAINS the dropEx string — so `dropEx`, which filters the record's own
  `ex` rows too, threw the replacement away and left all three cards an example short **in silence**.
  Caught only by the block count moving 34,596 → 34,593. Reworded to 我感受到她在背后的目光, which does
  not contain the sentence it replaces. **Count the blocks after a drop-and-re-add.**

**Read and left.** 报告, 抱怨, 背景, 比分, 比例, 比喻, 毕竟 (whose 毕竟，我应认真相信些什么 fronts a
question a little oddly but is attested), 避免, 闭幕式, 必然, 必要, 变动, 便利 — whose third sentence
writes 便利商店, the Taiwan form, where the very next card is 便利店; both are real and the pair is left
as it stands — 标志, and 暴雨's 狂风暴雨, which swallows the headword in a set phrase the reader will
meet whole.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 2; shared-gloss groups 325 unchanged, no new collision; pinyin clean; example-fit 143
and senses 152 unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged
624 unchanged; `build-lang-decks.js` re-run.

## Batch 76 — hsk30l5 notes 61–90 (表面 → 册)

Thirty consecutive notes, **twenty of them changed** — plus **nine more cards across three decks** that
the batch's one app-level change swept mechanically. Twenty-nine cards in all.

**The leading finding is a spelling family that is in `SPELL_PAIRS` with three of its members missing,
which reads as 0 exactly like a family that is not there at all.** `check-british.js` has reported 0 for
weeks. The `-ll-` doubling family has fourteen rows in app.js — `travell`, `modell`, `labell`,
`cancell`, `counsell`, `jewell`, `levell`, `signall` and the rest — and it did not have `diall`,
`quarrell` or `marvell`, so **seven deck sentences and one deck GLOSS** carried `dialed`, `quarreled`
and `marvelous` with nothing able to see them. **The fix is the TABLE, never the sites**: three rows
added to `SPELL_PAIRS` converted all nine at once, because the decks' own `exBritish` pass slices that
table out of app.js rather than keeping a copy. It also let `check-spelling-corpus.js` see the family in
Folio's own prose for the first time — 24 `quarrelled`, 12 `quarrelling`, 10 `marvellous`, 1
`marvelled`, and one `marvelous` which is **inside a `card.quote` from Herodotus** and correctly
classified as borrowed text. **So when a family reads 0, ask whether every MEMBER of it is in the
table.** Recorded in CLAUDE.md under `check-british.js`; the app change carries a changelog line and a
version bump, folded into the day's existing spelling line rather than added beside it.

*(That sweep also surfaced one finding this batch deliberately leaves alone: `pea-014`'s answer term is
**Civilizational state**, the American spelling, on a card whose own background writes `civilisation`
two words later. It is a card ANSWER TERM, which reaches the glossary pairing, the cloze grading and the
plan's own line, so it belongs to a `pea-` batch rather than to a Mandarin one. Recorded rather than
fixed.)*

**A split headword, the seventh in this audit.** 不得了's first sentence was 我记不得了 — which is
记不得 (cannot remember) plus 了, and not the word at all. Invisible to `check-example-fit.js` by design,
because 不得了 IS a real word and greedy longest-match lands squarely on it. The card was also glossed
`desperately serious disastrous; terrible` while its other two sentences are both the INTENSIFIER
(气得不得了, 开心得不得了), which CC-CEDICT gives as *extremely; exceedingly* and this card did not — so
the gloss described a sense with no example and the examples showed a sense with no gloss. Both now
given, every sentence tagged, and the replacement carries the serious sense.

**One of the two remaining still-ambiguous reverse-card groups is dissolved.** 彩色 was glossed the bare
`colour`, which is 颜色's gloss — a single English prompt with two right answers and no `not X` line on
either. They are not the same word, and this card's own three sentences say which is which: colour film,
coloured pens, colour pictures, all of them colour **as opposed to black and white**. Sharpening the
gloss dissolves the group without a disambiguator, which is always the better of the two repairs.
**Only 邻居 / 街坊 is left.**

**A traditional character in a simplified deck.** 病情's second sentence wrote 随著 where the decks
write 随着 — the fault the traditional-character sweep found across all nine decks, still arriving one
card at a time. Repaired rather than replaced; only the one character was wrong.

**A gloss that stops mid-word.** 不要紧 read `not important; not serious It doesn't matter; never` — a
missing separator and then the single word `never`, which is not a sense of the word and is not even a
phrase. And 册's read `volume; book; measure word for books` **under the label `measure word`**, saying
it twice.

**Three sentences that were the card's other sentence over again** — 不利's two 判决对…不利, 不良's two
bad influences on children, and 补充's two *anything to add to what I said?* — each replaced with a
different construction rather than a different object.

**A sentence that does not parse.** 参考's 不留名或详细的参考什么都可以 has a noun phrase with nothing to
attach to and a predicate with no subject, and its English translates something that is not there.

**Two compounds swallowing their own headword**: 表情's second sentence was about 表情符号, an emoji,
which is its own word and not a face at all; and two of 玻璃's three were about a 玻璃杯, a tumbler, one
of them also writing 任何的 in front of a mass noun.

**Eight English lines**, of which the ones worth naming are `the infirmary` for 病房 (a hospital ward,
which the card's own gloss and other two lines both say), `I finished eating this cake` for 这包饼 (a
packet of biscuits — the classifier says so), `an impudent attitude` for 傲慢 (haughty), and three that
drop the headword outright: 不然, 裁判 (it is the REFEREE who tosses the coin) and 参与 (*not concerned
with* for *not taking part in*).

**Two `Compounds` blocks**, 藏 and 册, each with nothing at all in the reader's downloaded deck. 藏's
carries **西藏**, deliberately: it is the character's other reading, zàng, which the pinyin column states
and which a reader would otherwise meet with no warning.

**Read and left.** 表明, 拨打's Chinese, 博物馆, 不符, 步行, 不足, 采访, 采用, 餐饮, 操作 — whose
暗箱操作 swallows the headword in a set phrase whose English idiom is a fair match — 不然's first two,
裁判's third, and **饼, whose tap panel is not empty but is not short either: it lists 饼干 and 月饼,
which is everything the collection has, so a `Compounds` block would be adding words the reader has no
other way of meeting rather than surfacing words the deck is hiding.**

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
**still-ambiguous 2 → 1**; shared-gloss groups 325 → 324; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 624 → 627;
`check-style.js`, `check-claims.js`, `check-docs.js` and `test-spelling.js` all clean after the app.js
change, with CLAUDE.md's app.js line count re-measured; `build-lang-decks.js` re-run.

## Batch 77 — hsk30l5 notes 91–120 (测 → 车祸)

Thirty consecutive notes, **fifteen of them changed**, plus **two cards outside the range** that share a
sentence with one inside it — seventeen cards in all.

**The leading finding is a Japanese character in a Chinese sentence, and it took a new kind of sweep to
name it.** 一项估计显示，今年的钢鉄产量将会达到一亿吨 writes **鉄** where Chinese writes **铁** — the
Japanese shinjitai and old Chinese form — and the decks themselves spell it correctly on their own 钢铁
card at hsk30l7. It is on **three cards at once** (产量, 吨, 亿), so it is three rows.

**The sweep that found it is worth keeping, and the two that did not work are worth knowing.** Comparing
the decks' characters against CC-CEDICT's whole inventory returns 73 findings and every one is noise —
the card type shows a single character's COMPONENTS, so 阝, 钅, 礻 and seventy more are legitimate.
Comparing against the SIMPLIFIED column alone, over the spoken sentences only, returns **zero**: CC-CEDICT
carries 鉄 as an *old variant of 鐵|铁*, so it is a real Chinese character and the inventory cannot see it.
What works is asking **which characters CC-CEDICT knows ONLY as a pointer at another character** — every
one of their senses matching `variant of X` or `see X` and nothing else. Over all 11,532 notes that
returns exactly **two**:

    鉄  old variant of 鐵|铁   →  hsk30l5/产量  hsk30l5/吨  hsk30l5/亿
    绔  variant of 褲|裤       →  hsk30idm/纨绔子弟

and the second is the right answer — 纨绔子弟 is the standard written form of that idiom and 绔 occurs in
nothing else. **One fault and one readable false positive over the whole corpus.** It is recorded here
rather than shipped as a checker, on this file's own rule: its entire yield is spent, and a scanner that
will report the same single false positive for ever is one nobody runs. **Re-run it by hand after a
batch that harvests new sentences**, which is where a mixed-source corpus puts variant characters in.

**A character buried in a compound on every sentence it has.** 测's three were 测速, 目测 and 小测, so a
card glossing `to measure` never showed the character on its own — and it is an ordinary verb, 测体温,
测血压, which is what the replacement gives. 产 was two of three the same way, and its first sentence was
这是共产主义, which is both a compound and a political label.

**The plainest duplicate in the deck.** 常识's first two sentences are 她缺乏常识 and 他缺乏常识 — one
sentence with the pronoun changed, and English that differs by one word. Its gloss also read `general
knowledge` while all three of its own English lines say *common sense*; CC-CEDICT gives both and the
gloss now leads with the one the card teaches.

**A sense the first sentence shows and the gloss did not carry.** 炒 was glossed `stir-fry` alone while
秘书被炒了 is the secretary being SACKED — a sense CC-CEDICT gives, and a cooking word doing something no
cooking word does. Both senses now given and every sentence tagged.

**An adverb contradicting its own sentence.** 曾经 marks a past experience — something that was once so
and is no longer — and 曾经有一个意外 reports a single event under an English present perfect (`There's
been an accident`) that the adverb rules out.

**Three more sentences that were the card's other sentence over again**: 拆's two people knocking down
the same wall, 长处's third — **which this record had itself added in an example top-up, as a paraphrase
of the sentence directly above it** — and 测试's, whose 测试我考了低分 also puts the topic in front of the
subject with nothing to mark it, so the first two characters read as *test me*.

**A statistical joke where a length should be.** 长度's 婚姻的长度与婚宴的花费负相关 measures a marriage
in 长度, which is a physical length; duration takes 长短 or 持续时间.

**Five `Compounds` blocks** — 测, 曾, 插, 拆 and 产, four of them with nothing at all in the reader's
downloaded deck. 曾's carries **曾孙**, deliberately: it is the character's other reading, zēng, which
this card does not carry and which a reader would otherwise meet with no warning — the same reason 藏's
block carries 西藏.

**One missing full stop** (超), **one dual-reading card tagged** (朝, all three sentences cháo, so the
zhāo sense is now visibly the one without an example rather than left to be guessed at), and **one
English line coarser than its Chinese** (`Crap` for 可恶, which is *how annoying*).

**A fault of my own, recorded because it is a new shape of an old trap.** Replacing 长处's duplicate by
APPENDING a row to the record's own `ex` array changed nothing: `room = 3 - kept.length` left one free
slot and the array's FIRST row filled it — which was the row being replaced. **Where the sentence to be
replaced is the record's own, delete the row; `dropEx` plus a new row is for a GENERATOR block.** It is
silent either way, and was caught by the diff showing the card untouched.

**Read and left.** 差别, 差距, 叉子, 产品, 产业, 长久, 长期, 尝试, 长途 (whose three sentences are all
compounds, which is what 长途 is — it is an attributive and does not stand alone), 长远, 场所, 超出
(whose 想像 is the Taiwan form of 想象 and is listed in CC-CEDICT with the same gloss), 超级, 超速, 吵,
and 朝's three sentences themselves.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 324 unchanged; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 627 → 633;
`build-lang-decks.js` re-run.

## Batch 78 — hsk30l5 notes 121–150 (车库 → 持续)

Thirty consecutive notes; **thirteen cards changed**.

**The leading card had two faults in one field, and the first is a new shape.** 称 listed **the same
sense twice** — `verb: fit; match; to name`, and then `verb: fit; match; to name` again — which is a
duplicated entry rather than a second sense, and the first of its kind in this audit. And that gloss put
**two readings under one pinyin**: `to name` is chēng, the card's own reading and what all three of its
sentences show (又称普通话, 产品称它能, 称他胆小鬼), while `fit; match` is **chèn** — 称心, 对称 — a
different word the card was claiming without saying so. Both readings now carried with a sense each and
every sentence tagged, which is the repair 转, 数 and 弹 already use.

**Three fields, three different answers.** 沉默 was labelled `verb` over a gloss of three ADJECTIVES
(`reticent; taciturn; uncommunicative`) while all three sentences are the NOUN — 保持了沉默, 保持沉默,
沉默就意味着同意. The label said one thing, the gloss another and the card a third.

**A character that is not a word.** 池's third sentence wrote **池溏**, which CC-CEDICT has no entry for
at all: the word is 池塘, a pond, and 溏 (táng) means semi-liquid, as in a soft-boiled egg. One character
wrong; repaired rather than replaced.

**A fruit that is a different fruit.** 成熟's `Ripe medlars` renders 枇杷, which is a **loquat** —
CC-CEDICT gives the botanical name, *Eriobotrya japonica* — where a medlar is 欧楂, an unrelated
northern-European fruit.

**A carriage that became a car boot.** 车厢's third sentence was translated `in the trunk of his car`, on
a card glossed *railway carriage; compartment* whose measure word is 节 and whose other two sentences are
plainly a train — wrong about the thing, and American about it besides.

**Two sentences that read as something else in Chinese.** 我需要一些成人的东西 asks for adult MATERIAL
(成人的东西, 成人用品) rather than for something suitable for a grown-up, which is what its English says.
And 要你在多大程度上同意 opens on 要你, making an order out of a question, with the 要 translated by
nothing.

**A collocation the word does not take.** 彻底加强军队建设 — 彻底 goes with 解决, 改变 or 调查, things
that can be done completely, where 加强 is a matter of degree. It was a political exhortation as well.

**A duplicate that left the card's own leading gloss with no example.** 程序's 她是程序员 and
她是个女程序员吗 are one sentence asked and stated, both burying the headword in 程序员 — so `order;
procedure; sequence`, the gloss's first sense, had nothing behind it. Its remaining sentence also had
`inconveniences` for 缺陷, which on a computer program are **bugs**.

**The record's own top-up, again, as a paragraph of opinion.** 成分's added sentence ran to thirty-three
characters arguing that all social interaction necessarily involves insincerity — somebody's view of
people rather than an example of a word, and the same class as the gutter-press sentence on 报道. Deleted
as a row rather than dropped, which is batch 77's lesson applied rather than re-learned.

**A wrong classifier** (橙子's 这只橙子 — 只 classifies animals and one of a pair, and an orange takes
个) **and one English line softened into the wrong verb** (`admire` for 称赞, which is to say so out loud).

**Three `Compounds` blocks** — 沉, 称 and 池, each with nothing at all in the reader's downloaded deck.
称's carries **对称** and **称心**, both the chèn reading, which is where a reader will actually meet it.

**Read and left.** 车库, 车辆, 车主, 称为, 成本, 承担, 成果, 成就, 成立, 成年, 城区, 承认, 承受,
乘务员, 成员, 成长, 持续 — and 称赞's own 洋装, which is the Taiwan word for a dress where the mainland
says 连衣裙: it is real Chinese, the English is what was wrong, and the deck is not being normalised to
one variety.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 324 unchanged; pinyin clean — **including the new two-reading
field on 称**; example-fit 143 and senses 152 unchanged; british 0; 34,596 blocks with spoken == visible
on every one; sense-tagged 633 → 639; `build-lang-decks.js` re-run.

## Batch 79 — hsk30l5 notes 151–180 (尺子 → 传说)

Thirty consecutive notes; **fifteen cards changed**.

**Two more glosses cut off mid-phrase, which makes four at this level.** 丑's ended `the second of the
Twelve` — CC-CEDICT finishes it, *the second of the twelve EARTHLY BRANCHES* — and 处's ended
`to be in (a`, inside its own unclosed bracket. With 不要紧's stray `never` and 册's label repeated
inside its own gloss, this is now a recognisable class: **a gloss that stops mid-word reads to a reader
as a card nobody finished**, and all four were pasted rather than written.

**A second card with two readings under one pinyin, two batches after 称.** 冲 was glossed
`to flush; vigorously; on the strength of` — and the last of those is **chòng**, which CC-CEDICT gives as
*powerful; pungent; facing; in view of*, carried under a chōng pinyin with nothing to say so. All three
sentences are chōng; both readings now carried with a sense each and every sentence tagged.

**A third card glossing the sense it does not teach.** 抽 is `to draw out, to pull out` and all three of
its sentences are 抽烟 — to SMOKE, which CC-CEDICT lists as *to inhale, esp. smoke* and the card did not.
This has now been the level's commonest single fault for six batches running.

**Another homophone pair written the wrong way round.** 处理's 算数处理数字 writes 算数, which means *to
count* or *to hold good*, where the subject is **算术**, arithmetic — one character apart, and the same
shape as 必需 for 必须 in batch 75.

**Three cards where every sentence was one use of the word.** 臭's three were a single conversation about
a person smelling (你身上发臭了 / 不是的，你不臭 / 因为你真的很臭) — an exchange lifted whole rather than
three examples; 抽's three were all smoking; and 充电's said *I need to charge it* and *I need to charge
my mobile phone*, which is one sentence twice.

**A sentence that is the second half of another sentence.** 传递's third example OPENS ON 否则,
*otherwise* — so it only reads directly after the card's first sentence, and a card deals its examples in
whatever order it likes. It also explained that the left hand *is used for bathing*, a euphemism that
leaves the sentence making no sense at all. Its second was a joke with a meditation hum written into it
(`I'm sending positive vibes. Ommmmmm.`).

**Two more long ones**, both the class 本领 and 转机 established: 初期's first example was forty-five
characters of somebody's resolutions about a new blog, with the headword buried in the middle.

**A sentence that was an insult, with a word in its English that is not in the Chinese.** 丑's third was
那个丑男人在节食 under *Between you and me, the **fat** ugly man is on a diet* — the Chinese says only 丑.
It taught nothing 这把椅子很丑 does not.

**A word put in the wrong register** (谁也没有出席派对 — 出席 is for a meeting, a ceremony or a hearing,
and a party takes 参加), **a 的 where the language wants 地** (传说's 一代一代的传承, the same fault as
表达's 流利的 in batch 76), and **two English lines** (`Roll the ball to me` for 传, which is to pass, and
`This book will be printed` for 出版, which is to publish).

**A gratuitous subject where the word has a hundred ordinary uses.** 传播's third sentence was condoms
and sexually transmitted disease, on a card whose other disease sentence — Ebola through bodily fluids —
already covers that sense and stands. The word's ordinary subjects are news, rumour, knowledge and
culture, which is what the replacement gives.

**Five `Compounds` blocks** — 冲, 抽, 丑, 臭 and 初, every one of them with nothing at all in the reader's
downloaded deck. **臭 has nothing in the whole COLLECTION either**, the eighth such character in this
audit, which is exactly where authored rows are worth the most.

**Read and left.** 尺子, 翅膀, 充分, 充满, 充值, 充足, 重复, 虫子, 宠物, 初级, 出色, 出售, 出自, 处于,
成员-adjacent 传播's Ebola sentence, 传说's remaining two — and **除夕's first example**, which runs to
forty characters and is the one long sentence this batch keeps: it is about the word's own subject
(wrapping dumplings on New Year's Eve in northern China) rather than about something else with the
headword buried in it, which is the distinction the other long ones fail.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 324 unchanged; pinyin clean — **including the new two-reading
field on 冲**; example-fit 143 and senses 152 unchanged; british 0; 34,596 blocks with spoken == visible
on every one; sense-tagged 639 → 651; `build-lang-decks.js` re-run.

## Batch 80 — hsk30l5 notes 181–210 (传统 → 打破)

Thirty consecutive notes; **sixteen cards changed**.

**A gloss offering a word that does not exist.** 从而 read `thus; **therebyupon**` — two words run
together with the separator missing. The **fifth** garbled gloss at this level, after 不要紧's stray
`never`, 册's label repeated inside its own gloss, 丑's `the second of the Twelve` and 处's unclosed
bracket. Five in eight batches is no longer a coincidence: **this deck's gloss field was assembled from
a dictionary dump and its punctuation was not read.**

**And a gloss naming the wrong verb altogether.** 打扮 was `to decorate`, which is 装饰 — 打扮 is to
dress up or do oneself up, and it is about a PERSON. All three of the card's own sentences say so
(dressing as a woman, being good at dressing, getting ready for a date), so the gloss contradicted
everything under it, and a reader taking it at its word would write 打扮房间 for decorating a room.

**A sentence that says nothing in either language.** 创新创新本身就提升了创新 repeats the headword three
times and does not parse; nor does `Creating creativity itself is improving creativity`.

**An internet subculture on a Level 5 card.** 创作's second sentence was about the **furry fandom**
(福瑞圈), which a reader of this deck has no reason to meet and which teaches nothing about the word an
ordinary sentence would not.

**Two words a character apart, again.** 促进's 大型**公会** is a GUILD or trade association where the
sentence means a conference (会议). Repaired rather than replaced — the third such repair in three
batches, after 池溏 for 池塘 and 算数 for 算术.

**An English aphorism that took the other sense of its own word.** 辞职是人生的第一课 renders
*Resignation is the first lesson of life* — which is about accepting one's lot, 听天由命 — with the
Chinese for handing in your notice. What the card now says is that quitting your job is life's first
lesson.

**Two sentences that stop half way through.** 没有你的帮忙，我无法达成 leaves 达成 with no object, which
the verb requires (one reaches a goal, an agreement, a conclusion), and its English quietly supplies a
different verb to cover the gap. 我们没有打断 has no object either, and its English — `We didn't break
in` — is a third thing again, 打断 being to interrupt somebody rather than to enter by force.

**An adverb in front of a verb it does not take.** 爱从不是错的 puts 从不 before 是; the adverb negates a
verb of doing, and *love is never wrong* is 爱从来都不是错的.

**A scene that is not what a vocabulary card is for.** 催's second sentence was tear gas thrown into a
building by police — 催泪弹 also buries the headword in a compound whose 催 means *to cause* rather than
*to urge*, which is the card's own gloss.

**A third classifier on a card whose field states one.** 床单's 一个新床单, where the measure-word field
says 条 or 件 and the card's own second sentence uses 张.

**A sense the gloss omitted, on the card that had a sentence to spare.** 打断 also breaks a thing in
two, which is where a learner meets it as often as in conversation; the replacement shows it and both
senses are now stated.

**Three English lines and one missing full stop** — `Real people make history` for 历史是由人民创造的
(which is a passive about *the people*), `seek novelty` for 寻求刺激 (a thrill), `I think we need a
doggy bag` for 看来我们得打包了 (which says only that we shall have to pack up, and whose doggy-bag
sense the card's next sentence already covers), and 词汇's third sentence, which ended bare.

**Read and left.** 传统, 窗台, 创业, 此后, 此前, 此时 (whose first sentence is a line of Tang poetry —
海上升明月，天涯共此时 — which is literary but is exactly the register in which this word lives), 从前,
促使, 促销, 存放, 存款, 存在, 措施, 打破, and 创造's and 从事's remaining sentences.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 324 unchanged; pinyin clean; example-fit 143 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 651 → 654;
`build-lang-decks.js` re-run.

## Batch 81 — hsk30l5 notes 211–240 (打听 → 当年)

Thirty consecutive notes; **twenty of them changed**, plus one card in Levels 7–9 that a
rewrite here collided with. Four faults, of which two are new shapes and two are the batch's own
mistakes caught in the read-back.

**A THIRD CARD WITH TWO READINGS UNDER ONE PINYIN — and this one glossed the reading it does not
carry.** 大爷's pinyin and bopomofo are **dà ye**, with a neutral 爷, which CC-CEDICT gives as
*(coll.) father's older brother; uncle; term of respect for older man* — and which two of the card's
three sentences show, 门口坐着一位大爷 and 门口的大爷很热心. Its gloss read **arrogant idler**, which
is the dictionary's OTHER entry, **dà yé**, a different word. So the card said one thing in its
pinyin field and the opposite in its gloss, and a reader meeting it had no way to know either was
in question. Repaired the way 称 (batch 78) and 冲 (batch 79) are: both readings in the pinyin and
bopomofo fields, a sense each, and every sentence tagged with the reading it shows, the card's own
reading first. **One thing is recorded as a question rather than settled**, and the `why` says so on
the card's own record: the third sentence, 他摆出一副大爷的架子, is unambiguously the arrogant sense
in MEANING and is tagged sense 2 on CC-CEDICT's authority — but the tone the phrase is actually
spoken with is not something the dictionary and the card's three sentences can settle between them,
everyday speech using the neutral form for it too. Three cards in four batches have now carried two
readings under one pinyin; on this evidence it is the commonest structural fault left in Level 5.

**SHARPENING A GLOSS COLLIDED IT WITH ITS NEIGHBOUR, exactly as batch 30 warned.** 胆小 was glossed
with the abstract noun **cowardice** on a card labelled *adjective*, which cannot be substituted into
any of its three predicative sentences (是胆小的生物, 你不胆小, 一样胆小). Rewriting it to
*timid; cowardly* landed it **verbatim on 胆怯's gloss** in Levels 7–9, and still-ambiguous reverse-card
groups went 1 → 2 — the English → Chinese card's front being the gloss and nothing else, so two notes
sharing one are a single question with two right answers. **And the collision was hiding a real
distinction, which is what it usually does.** 胆小 is a standing DISPOSITION — a mouse is one, someone
is timid *like a rabbit* — where 胆怯 is a state of nerve failing at a moment, which is precisely what
its own three sentences show: 上台时他有点胆怯, 不要胆怯，大胆去做. Both are rewritten to say which
they are — 胆小 *timid; easily frightened*, 胆怯 *timid; apprehensive; lacking nerve* — and the count
went back to 1 (邻居/街坊, pre-existing). **The lesson is to re-run the coverage checker after a gloss
rewrite, not just after a sentence change**; nothing on either card looks wrong.

**THE SPLIT-HEADWORD CLASS AGAIN, AND `check-example-fit.js` STILL CANNOT SEE IT.** 大会's second
sentence was 如果你是第一次到外国生活的话，**加拿大会**很适合你 — Canada (加拿大) followed by 会, with
the characters 大会 an accident of the two meeting. The card bolded them and a reader was shown a word
that is not in the sentence. This is the class batch 26 recorded: the segmenter lands squarely on a
real word, so the checker reports nothing, and only reading finds it. Dropped, with an authored
replacement.

**FOUR SENTENCES THAT WERE TRANSLATION ARTEFACTS RATHER THAN CHINESE.** 大厦's third put daisies round
a 钢铁大厦, a "steel building" nobody names; 大型's formed a superlative as 最大型的构造, which is not
how that word takes one and not a noun that takes it; 代表'S 这个年级的法方代表是谁？ puts a school
year group and "the French side" in one clause, and its English rendered neither; and 淡's 你有任何淡
啤酒吗？ carries 任何 standing in for an English *any* that Chinese does not need. All four dropped,
with authored sentences in their place — 代表's chosen to give the card the VERB sense its gloss names
and neither surviving sentence showed.

**SIX ENGLISH TRANSLATIONS THAT DID NOT RENDER THEIR CHINESE**, repaired through `exEn`, which leaves
the Chinese, the structure line and the bolding untouched. 他的大脑仍然很活跃 was rendered *He still
has springtime on the brain*; 大象鼻子长 called an elephant's trunk a nose; 我只是个大众脸 — an
ordinary, forgettable face — was *I'm just another man*; 我需要和你单独待一会儿 was *I need some time
with you*, dropping the headword altogether; 琳达是大会的参赛者之一 called a 大会 a *pageant*; and
你们也太大胆了吧！was *You were also too brave!*

**SIX GLOSSES THAT WERE NOT THE SENSE THE CARD TEACHES.** 大胆 read *brazen*, CC-CEDICT's first sense
and a negative one, over three sentences rendered brave, audacity and boldly — the batch-31 rule that
the dictionary's leading sense is not automatically the card's. 大妈 read *father's elder brother's
wife*, the narrow kinship sense, over three sentences that every one of them use it as the ordinary
polite term for an older woman. 代替, a verb, was glossed with the adverb *instead*, which cannot be
substituted into any of its sentences. 待遇 read *treatment* alone while two of its three sentences are
about pay. 单's gloss was *single, alone, simple* while its own first sentence is 买单, where 单 is a
BILL — CC-CEDICT's leading sense and one the card did not carry at all. And 胆小, above.

**THREE SINGLE-CHARACTER CARDS GAINED A `Compounds` SECTION.** 代 and 淡 had **nothing at all** in the
reader's downloaded deck, against twenty-four and six words in the collection; 单 had one word against
twenty-two. Two of 单's four rows are the *list, bill* sense, which is where a learner will actually
meet it. Every row's reading and gloss checked against CC-CEDICT before it was written.

**TWO SWALLOWED HEADWORDS ON THOSE SAME CARDS.** 代's second sentence was 很多小学生学不好**代数** —
algebra, a word of its own, so the sentence used neither of the two senses the card glosses — and 淡's
third was 他不久就把事情**淡忘**了, a compound rather than the character. Both replaced with authored
sentences for senses the card names and had nothing for: the *generation* sense on 代 and the *light in
colour* sense on 淡.

**AND TWO REPEATS.** 大事 taught the word with two PROVERBS out of three (大事化小，小事化无 and
小事聪明，大事糊涂), a register a learner will not use, so the second is replaced with a plain sentence.
大于's first two sentences were both 弊大于利 — one word, one construction, twice — and its third was
the idiom 哀莫大于心死 carried in with **no terminal mark** and an English rendering neither half of it;
the record's own idiom row is deleted and the duplicate generator block dropped, with two authored
sentences in their place, one arithmetical and one a plain comparison. 单元's first and third rows were
**both this record's own** — 我住在三号楼二单元 and 我住在二单元, with an English differing by four
words — so the card showed one fact twice; the duplicate is replaced in place.

**TWO OF THE BATCH'S OWN MISTAKES, caught in the read-back rather than by any checker.** Dropping 代数
from 代 left the two surviving generator blocks as 代我问候你妈妈 and 你可以代我去吗 — the same 代我 +
verb frame twice, so the card taught one construction and called it two; and replacing 淡忘 left the
calque 你有任何淡啤酒吗 standing beside it. Both fixed in a second pass. **Read the card back after a
drop**: what a replacement leaves behind is not what the diff shows.

**Ten cards were read and left untouched**: 大多, 大力, 大米, 大批, 带动, 担任, 单一, 当地, 当年, and
打听, whose 我打听他是谁 is thin but not wrong.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous **back to 1** after the 胆小/胆怯 repair; shared-gloss groups 324 unchanged;
pinyin clean — including the new two-reading field on 大爷; example-fit 143 → **142**; senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 654 → 657;
`build-lang-decks.js` re-run.
