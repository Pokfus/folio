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
| 2026-09-17 | `hsk30l5` notes 241–270 (当前 → 电池), deck order | 19 | **a single-character card not one of whose three sentences used the sense it glosses, and a misspelling no checker can reach** |
| 2026-09-17 | `hsk30l5` notes 271–300 (电动 → 队伍), deck order, plus a corpus sweep for one-sided hints | 15 + 17 | **seventeen disambiguators pointing at collisions that no longer exist, and a two-reading card with a sense filed under the wrong reading** |
| 2026-09-17 | `hsk30l5` notes 301–330 (对象 → 方), deck order | 16 | **a split headword this audit itself introduced, a card that contradicts itself, and a sentence dropped from one card still standing on another** |
| 2026-09-17 | `hsk30l5` notes 331–360 (方案 → 服装), deck order, plus a corpus sweep for the traditional 著 | 14 + 1 | **the traditional aspect particle 著 in a simplified deck — a fault a variant sweep cannot see, because 著 is also a simplified character** |
| 2026-09-18 | `hsk30l5` notes 361–390 (副 → 个别), deck order, plus the seven outstanding 著 sites and the `exVariant` field they needed | 18 + 7 | **a record field for a one-character swap, and the chained rows that proved its guard was counting the wrong thing** |
| 2026-09-18 | `hsk30l5` notes 391–420 (各行各业 → 故乡), deck order, plus a WORD-level variant sweep of the whole corpus | 14 + 15 | **CC-CEDICT marks whole WORDS as variants, and batch 77's character sweep is blind to every one of them** |
| 2026-09-18 | `hsk30l5` notes 421–450 (挂号 → 过于), deck order | 20 | **a sentence built to be meaningless, standing first on its card — Chomsky's colourless green ideas** |
| 2026-09-18 | `hsk30l5` notes 451–480 (哈 → 蝴蝶), deck order | 20 | **a card not one of whose three sentences used its character as a word — two transliterated place names and a compound** |
| 2026-09-18 | `hsk30l5` notes 481–510 (胡同 → 机构), deck order | 18 | **a card that SPOKE one reading of its character and ILLUSTRATED the other twice over, which no checker here can see** |
| 2026-09-18 | `hsk30l5` notes 511–540 (激烈 → 记载), deck order | 26 | **seven near-repeats in thirty cards — one of them two sentences this audit itself added, differing only in their subject** |
| 2026-09-18 | `hsk30l5` notes 541–570 (嘉宾 → 将近), deck order | 20 | **the same string reported as a fault on two OTHER cards and invisible on the card where it IS the fault** |
| 2026-09-18 | `hsk30l5` notes 571–600 (讲话 → 尽量), deck order | 26 | **two CANTONESE sentences in a Mandarin deck, six cards apart — 结他 for a guitar and 系 for 是** |
| 2026-09-18 | `hsk30l5` notes 601–630 (紧密 → 巨大), deck order | 21 | **a fourth card with two readings under one pinyin, and two example sentences of 55 and 90 characters** |
| 2026-09-18 | `hsk30l5` notes 631–660 (据说 → 空间), deck order, plus the applier's hint strip | 20 + 1 | **`hints` is called authoritative and was not: a retired disambiguator stayed on its card for ever and `--check` went on passing** |
| 2026-09-18 | `hsk30l5` notes 661–690 (空中 → 理论), deck order | 17 | **a sentence standing on TWO cards took last batch's English fix on only one of them — a fault this audit made** |
| 2026-09-18 | `hsk30l5` notes 691–720 (里头 → 流传), deck order | 18 + 1 | **three cards glossing the one sense none of their sentences shows, and a second dead disambiguator retired** |
| 2026-09-18 | `hsk30l5` notes 721–750 (流感 → 迷), deck order, plus the applier's field whitelist | 28 | **a card's TRADITIONAL field carried the wrong character — and the record could not reach that field at all** |
| 2026-09-18 | `hsk30l5` notes 751–780 (迷路 → 闹), deck order | 18 | **a third sentence whose characters straddle a word boundary — 很难|得到 on the 难得 card** |
| 2026-09-18 | `hsk30l5` notes 781–810 (闹钟 → 碰), deck order | 17 | **a gloss belonging to a reading the card does not teach, and a card all three of whose sentences were loanwords** |
| 2026-09-18 | `check-polyreading.js` — a NEW checker and its whole finding list, across four decks | 9 | **eight cards glossed from a reading they do not teach, and a polyphone's dictionary entry is what hid every one** |
| 2026-09-18 | `hsk30l5` notes 811–840 (碰见 → 奇迹), deck order | 17 | **three cards whose only occurrence of the headword was inside a PHONETIC TRANSLITERATION — pizza, aspirin and a pint** |
| 2026-09-18 | `hsk30l5` notes 841–870 (其余 → 亲自), deck order | 12 | a gloss that was simply the wrong word — **强大 defined as “large”**, where the dictionary and all three of its own sentences say *formidable, powerful* |
| 2026-09-18 | `hsk30l5` notes 871–900 (勤奋 → 热量), deck order | 13 | **青, whose three sentences were 刺青, 青光眼 and 青菜 — not one of them the character on its own**, and a card teaching calories under the gloss “heat” |
| 2026-09-18 | `hsk30l5` notes 901–930 (热烈 → 沙漠), deck order | 11 | **人工 with TWO of its three sentences straddling a word boundary — 人|工作 both times** |
| 2026-09-18 | `hsk30l5` notes 931–960 (沙子 → 社区), deck order | 10 | **扇 — a card whose pinyin named one reading while every sentence on it used the other** |
| 2026-09-18 | `hsk30l5` notes 961–990 (社区 → 失恋), deck order | 8 | **升, whose three sentences were sunrise, sunrise and a litre — the “to promote” its gloss leads with was nowhere on the card** |
| 2026-09-18 | `hsk30l5` notes 991–1020 (失眠 → 事实), deck order | 5 | **使得 glossed “usable”** — CC-CEDICT's leading sense, and not the sense any of its three sentences uses |
| 2026-09-18 | `hsk30l5` notes 1021–1050 (视为 → 束), deck order | 5 | **束, all three of whose sentences were 束腹, 管束 and 装束** — neither the measure word nor the verb the card is for |
| 2026-09-18 | `hsk30l5` notes 1051–1080 (数据 → 缩短), deck order | 10 | three more straddles in one range — 水|分子, 四|周 as *four weeks*, and a **bare imperative fragment standing as a sentence** |
| 2026-09-18 | `hsk30l5` notes 1081–1110 (缩小 → 填), deck order | 10 | **他人, 特有 and 天上 all three straddling** — 他|人很好, 特|有劲 and 每天|上教堂 |
| 2026-09-18 | `hsk30l5` notes 1111–1140 (甜品 → 推动), deck order | 8 | **a CHARACTER ERROR that put the headword there at all — 挑 written for 跳, “this dog jumped”**, and 团对 for 团队 on the same batch |
| 2026-09-18 | `hsk30l5` notes 1141–1170 (推广 → 围绕), deck order | 9 | **微笑 straddling its own sentence — 教授微微|笑了一下**, and 退 with two of its three examples inside longer words |
| 2026-09-18 | `hsk30l5` notes 1171–1200 (维修 → 物质), deck order | 7 | **a CHARACTER ERROR under a perfect English — 请勿**望**您的物品 for 请勿忘** |
| 2026-09-18 | `hsk30l5` notes 1201–1230 (西餐 → 现状), deck order | 8 | **戏, two of whose three sentences were 戏院 and 儿戏**, and a third English calling a play a film |
| 2026-09-18 | `hsk30l5` notes 1231–1260 (相似 → 心态), deck order | 3 | a quiet range — two near-repeats and one `Compounds` panel |
| 2026-09-18 | `hsk30l5` notes 1261–1290 (新型 → 学历), deck order | 9 | **性质, whose first two examples carried the SAME English over two Chinese sentences**, and 形容 glossed by its literary sense while all three sentences mean *to describe* |
| 2026-09-18 | `hsk30l5` notes 1291–1320 (学年 → 药物), deck order | 7 | **腰, all three of whose sentences were 弯腰, 腰围 and 半山腰**, and a new school year that began in April twice |
| 2026-09-18 | `hsk30l5` notes 1321–1350 (夜间 → 因而), deck order | 8 | **一路顺风 with THREE near-identical sentences — 祝您/祝你 and a full stop against an exclamation mark** |
| 2026-09-18 | `hsk30l5` notes 1351–1380 (音量 → 优质), deck order | 5 | **用法 straddling 用 + 法文** — *because it is written in French*, on a card meaning *usage* |
| 2026-09-18 | `hsk30l5` notes 1381–1410 (由此 → 元旦), deck order | 7 | **one sentence straddling on TWO different cards at once** — 连笑话也有限制 was claimed by 有限 and by 限制 and belongs to neither |
| 2026-09-18 | `hsk30l5` notes 1411–1440 (员工 → 摘), deck order | 11 | **早期, two of whose examples were multi-sentence paragraphs about Bismarck and Mark Knopfler** |
| 2026-09-18 | `hsk30l5` notes 1441–1470 (窄 → 整体) | 11 | **阵 and 争, each with two of its three sentences inside longer words**, and a sentence whose Chinese was not Chinese |
| 2026-09-18 | `hsk30l5` notes 1471–1500 (整整 → 中华民族) | 11 | **三文治 — the headword inside a TRANSLITERATION of *sandwich***, and three sentences whose Chinese was ungrammatical under a perfect English |
| 2026-09-18 | `hsk30l5` notes 1501–1530 (中级 → 住宿) | 8 | **派对主席 — a *party host* written with the word for a CHAIRMAN**, which is not Chinese |
| 2026-09-18 | `hsk30l5` notes 1531–1560 (住址 → 总部) | 6 | **素抓饭 — the headword inside *pilaf***, and the `装修` gloss typo this audit had been carrying as an open item |
| 2026-09-18 | `hsk30l5` notes 1561–1579 (总共 → 作出) — **Level 5 FINISHED** | 4 | **美国组成五十州 — a sentence that reverses the relation it is translating**, and a slap in the face of a *vile woman* |
| 2026-09-18 | `hsk30l6` notes 1–30 (岸 → 暴力), deck order — **Level 6 BEGINS** | 6 | **败, all three of whose sentences were 胜败, 惨败 and 衰败** |
| 2026-09-18 | `hsk30l6` notes 31–60 (暴露 → 兵) | 10 | **倍增 straddling 成倍|增加 and 遍地 straddling 一遍|又一遍地**, and a singlet called a *wife-beater* |
| 2026-09-18 | `hsk30l6` notes 61–90 (病毒 → 不止) | 5 | **不时 swallowed by 时不时**, a different word built on the same two characters |
| 2026-09-18 | `hsk30l6` notes 91–120 (步骤 → 查询) | 9 | **千层面 — LASAGNA — as both of one card's examples**, and 才能 straddling 才 + 能 on two of three |
| 2026-09-18 | `hsk30l6` notes 121–150 (拆除 → 沉重) | 7 | **早产出生 — 早产 + 出生 — on the 产出 card**, a premature birth standing in for industrial output |
| 2026-09-18 | `hsk30l6` notes 151–180 (趁 → 愁), deck order | 11 | **a `dropEx` that ORPHANED an earlier batch's `exEn` row — and the applier FAILED on it rather than warning** |
| 2026-09-24 | `hsk30l6` notes 181–210 (筹备 → 创办), deck order | 15 | **six of the batch's findings are the RECORD'S own sentences, not the deck's** — near-repeats the earlier fill pass wrote two at a time |
| 2026-09-24 | `hsk30l6` notes 211–240 (创建 → 打造), deck order | 13 | **one sentence on TWO cards, repaired on one of them and not the other** — an `exEn` row is per NOTE and nothing reports the twin |
| 2026-09-24 | `hsk30l6` notes 241–270 (打仗 → 当选), deck order | 11 | **大都 glossed as a YUAN-DYNASTY CAPITAL** — a proper noun under an adverb label, over three sentences that are all the adverb |
| 2026-09-24 | `hsk30l6` notes 271–300 (档案 → 吊), deck order | 17 (+1 in Level 5) | **THREE cards glossed from the OTHER reading of their own characters**, and one whose three sentences contained the word nowhere at all |
| 2026-09-24 | `hsk30l6` notes 301–330 (调动 → 蹲), deck order | 21 | **TEN cards carried a near-repeat**, most of them this record's own fill-pass rows — and a spelling that is neither British nor American, which `check-british.js` can never see |
| 2026-09-24 | **the British pass's own blind spot** — one finding list, all nine decks | 479 | the pass and its checker both read three fields and the card type has six; **547 American spellings sat in `Characters` alone** |
| 2026-09-24 | **the `-is/-iz` table gap** — 45 rows into `SPELL_PAIRS`, an APP change | 70 (+2 cards, 1 term) | the raw grep's “~45 sites in Folio's own prose” was wrong: **they were CITATIONS**, and the real figure is ONE |
| 2026-09-24 | `hsk30l6` notes 331–360 (顿时 → 凡是), deck order | 23 (+3 in 7–9) | **ten near-repeats again**, a card glossed as its own neighbour — and `check-gloss-source.js` crying wolf on 68 correct glosses |
| 2026-09-24 | `hsk30l6` notes 361–390 (繁殖 → 丰收), deck order | 23 | **fourteen near-repeats, four of them ALL THREE sentences** — the fill pass at its weakest, and five glosses that were the wrong part of speech |
| 2026-09-24 | `hsk30l6` notes 391–420 (风雨 → 感想), deck order | 16 | a verb that takes TWO objects given one, an invented compound, and a card glossed *liver* that showed the organ nowhere |
| 2026-09-24 | `hsk30l6` notes 421–450 (钢笔 → 供给), deck order | 20 | **个体: NOT ONE of its three sentences contained the word**, and its gloss was wrong as well — the worst single card this audit has met |
| 2026-09-24 | `hsk30l6` notes 451–480 (攻击 → 拐), deck order | 12 | **顾, glossed from a sense CC-CEDICT does not carry, whose every sentence was 环顾**; and 费用共计一千元 beside 费用共计三千元 |
| 2026-09-24 | `hsk30l6` notes 481–510 (拐弯 → 过时), deck order | 20 (+1) | **three translations that render a different sentence**, two headwords straddling two shorter words, and a `not X` pair retired because the collision was a gloss error |
| 2026-09-24 | `hsk30l6` notes 511–540 (海内外 → 狠), deck order | 16 | **a card whose pinyin and bopomofo both say one reading while its gloss is the other reading's**, which `check-polyreading.js` cannot see because it only reads single-character cards |
| 2026-09-24 | `hsk30l6` notes 541–570 (恨 → 还原), deck order | 14 | **a character error that put the headword on the card** — 怀 for 坏, which speaks and segments perfectly — and six single-character cards given `Compounds` panels |
| 2026-09-24 | `hsk30l6` notes 571–600 (患 → 激发), deck order | 15 (+1) | **two of 会见's three sentences were 会 + 见**, their own translations saying so; a gloss fix retired a third `not X` pair |
| 2026-09-24 | `hsk30l6` notes 601–630 (基金 → 加重), deck order | 18 | **夹: not one of its three sentences used the verb the card teaches**, one of them a loanword in which the character means nothing — and two replacements drafted here carried back the very fault they replaced |
| 2026-09-24 | `hsk30l6` notes 631–660 (假设 → 奖品), deck order | 26 | **eight cards whose headword sat only inside a longer word** (尖叫 twice, 利剑, 箭头, 一箭双雕, 四体健全者) or in a sentence that was not Chinese, and seven near-repeats, three of them this record's own |
| 2026-09-24 | `hsk30l6` notes 661–690 (酱 → 借助), deck order | 27 | **酱 and 解: not one of either card's three sentences used the character on its own**, and three glosses were cut off mid-phrase or were not the word's meaning at all |
| 2026-09-24 | `hsk30l6` notes 691–720 (金额 → 镜头), deck order | 26 | **净 and 井 had no sentence using the character on its own**, 尽's three were one idea, and five Englishes rendered a different sentence from the Chinese above them |
| 2026-09-24 | `hsk30l6` notes 721–750 (纠纷 → 开创), deck order | 26 | **局's traditional field was 侷**, a different character; 就读 and 决策 each had a sentence that straddled; and batch 153's dropped 'Well of Despair' was found standing on a second card |
| 2026-09-24 | `hsk30l6` notes 751–780 (开关 → 空地), deck order | 21 (+1) | **two cards glossed from the OTHER reading** (看好, 空地 'air-to-surface missile'), 肯's three sentences all about a man called Ken, and an English typo that named a sex toy |
| 2026-09-24 | `hsk30l6` notes 781–810 (空闲 → 牢), deck order | 24 | **ten single-character cards in one range, and the transliteration class three more times** — broccoli on 兰花, Greifswald on 赖, a quart on 夸 |
| 2026-09-24 | `hsk30l6` notes 811–840 (劳动力 → 凌晨), deck order | 20 (+1 out of range) | **three single-character cards with no sentence using the character on its own** — 立, 料, and 雷 after its third went; and a `not X` hint pair that was hiding a wrong gloss |
| 2026-09-24 | `hsk30l6` notes 841–870 (流程 → 码头), deck order | 24 | **nine near-repeats, and glosses taken off the top of CC-CEDICT** — 流程 "course", 漏洞 "leak", 路程 "route", and 流量 led with two senses its sentences never used |
| 2026-09-24 | `hsk30l6` notes 871–900 (蚂蚁 → 描绘), deck order | 20 | **迈 was three sentences about somebody called Mike** — and 密's three were 告密, 密室 and 频密; a gloss cut off mid-phrase on 嘛 |
| 2026-09-24 | `hsk30l6` notes 901–930 (描写 → 南极洲), deck order | 14 (+1 out of range) | **a second `not X` hint pair covering two wrong glosses** — 模拟 and 仿制 both "imitation" under a verb label; and 民众's open item closed |
| 2026-09-24 | `hsk30l6` notes 931–960 (南美洲 → 泡), deck order | 24 | **four single-character cards with every sentence swallowed or nearly** — 扭 (扭伤 twice), 盘 (汤盘, 存盘, 大盘鸡), 暖 (回暖, 变暖), 泡 (泡汤) |
| 2026-09-24 | `hsk30l6` notes 961–990 (赔偿 → 坡), deck order | 25 | **片面 illustrated by 一片面包 "a slice of bread" twice**, 披 by pizza and the Beatles, and 喷 and 坡 swallowed three times each |
| 2026-09-24 | `hsk30l6` notes 991–1020 (泼 → 谦虚), deck order | 22 | **恰恰's three sentences were all the set phrase 恰恰相反**; 扑 glossed "dedicate all one's energies to a cause"; 铺 illustrated by 床铺, read pù |
| 2026-09-24 | `hsk30l6` notes 1021–1050 (前景 → 清醒), deck order | 22 | **two generalisations about a people on 勤劳, one about a class on 倾向**; 切实's 切实可行 twice; eleven glosses repaired |
| 2026-09-24 | `hsk30l6` notes 1051–1080 (情节 → 人工智能), deck order | 20 | **权力 'power' used for 权利 'a right'**; 券 swallowed three times over; 热点 illustrated by 热点儿 'a bit hot' |

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

## Batch 82 — hsk30l5 notes 241–270 (当前 → 电池)

Thirty consecutive notes; **nineteen of them changed**, plus one card in Levels 7–9 that a gloss
rewrite here freed. Three findings are new shapes.

**A SINGLE-CHARACTER CARD NOT ONE OF WHOSE THREE SENTENCES USED THE SENSE IT GLOSSES.** 登 was
defined *to ascend, to climb, to mount* over 我不应该**登出**, 他**登**广告出售他的房子 and
**登出**后重新**登入**需要密码 — logging out, placing an advertisement, and logging in and out again.
The character's oldest and commonest sense was in the gloss and on none of the card, and two of the
three sentences were the same pair of words twice over besides. This is the class batches 27 and 29
recorded and the sharpest instance of it yet: every sentence is real, every translation is right,
every one segments and speaks correctly, and the card teaches a sense it never shows. The first
sentence is dropped, an AUTHORED climbing sentence takes its place (他们登上了山顶), and the gloss is
widened to carry the *publish or record* sense that the surviving advertisement sentence shows and the
gloss did not. **This is found by reading the three English lines against the gloss and by nothing
else.**

**A MISSPELLING NO CHECKER IN THE PIPELINE CAN REACH.** 地震's gloss read *earthquake; **tremour***,
which is not a word in either dialect — British English writes **tremor**, the -our ending belonging
to the honour/colour family and not to this one. `check-british.js` reads 0 over it and always will:
that tool compares against the pairs app.js's own `SPELL_PAIRS` holds, and there is no `tremor` row
because the word is spelt the same on both sides of the Atlantic. **A hypercorrection is not a dialect
variant, so no two-column table can hold it.** The same card also labelled 地震 a **verb** — it is a
noun, and all three of its own sentences use it as one. Both repaired in one `senses` row.
· Grepped for the spelling across the repository afterwards: the only other two occurrences are in
  `books/kalidasa-shakuntala.js`, inside Sir William Jones's 1789 translation, where it is the
  eighteenth century's own spelling transcribed as printed. **A Library book is never edited** — the
  BCE/CE rule says so in terms — and those two stay. Worth recording, because a later sweep for this
  word would otherwise "fix" a published translation.

**THE SPLIT-HEADWORD CLASS A SECOND TIME, one batch after the first.** 地下's second sentence was
雨断断续续**地下**了一整天 — the adverbial particle 地 followed by 下 (to fall), with the characters
地下 an accident of the two meeting, exactly as 加拿大会 was on 大会 in batch 81. The card bolded them
and a reader was shown a word that is not in the sentence. Two batches running have turned one of
these up by reading; `check-example-fit.js` reports neither, the segmenter landing squarely on a real
word both times.

**A QUESTION ENDING IN A FULL STOP.** 导致's second sentence, 是什么原因导致你昨天没来, asks something
and closed on 。. Repaired through `exSpace`, which is safe for exactly this: the two sides are
compared with every space and every mark stripped out, so a row that swaps one terminal mark for
another cannot touch a word, a structure line or the bolding. Its English had dropped the headword
altogether and is rewritten beside it.

**A HINT PAIR RETIRED — the opposite of batch 81's finding.** 地面 was glossed with the single word
*floor* while all three of its sentences are the GROUND: fog near it, snow covering it, it trembling
underfoot. That one-word gloss collided with 地板 in Levels 7–9, which really is a floor, so the two
cards had been given a `not <other word>` disambiguator each — to tell apart a distinction **neither
gloss stated**. Rewriting 地面 to *the ground; a floor surface* and 地板 to *a floor; floorboards
(indoors)* says what each is, and both hints retire: a disambiguator that disambiguates nothing is
worse than none, a reader taking it for a real distinction. Shared-gloss groups 324 → 323. Where batch
81's rewrite MADE a collision, this one dissolved a standing one; **either way the coverage checker is
what says which, and it has to be re-run after a gloss rewrite.**

**THREE SINGLE-CHARACTER CARDS GAINED A `Compounds` SECTION.** 挡 had **nothing at all** in the
reader's downloaded deck against three words in the collection; 登 and 递 had one each, against eight
and four. 登's four rows include 登记 and 登录, which are the very next two cards in the deck, so the
section points a reader at what they are about to meet.

**THREE MORE SWALLOWED HEADWORDS**, each dropped with an authored replacement: 格挡 (to parry) on 挡,
投递 (to deliver post) on 递, and 地理学 on 地理 — that last one doubly, the sentence also being 他喜欢
地理和历史 with the subject changed.

**FIVE GLOSSES THAT WERE NOT THE SENSE THE CARD TEACHES.** 灯光 took only the PARENTHESISED first
sense of CC-CEDICT's `/(stage) lighting/light/`, so a word every one of whose sentences is about
ordinary light was defined as a theatre term. 导演 is labelled *noun / verb* and was glossed with the
noun alone, so half its own label had no definition behind it. 递 carried *progressively*, which
CC-CEDICT marks a **bound form** — it is only ever the first half of a compound such as 递增 — as though
it were a sense the character has alone. 当前's *before one* is a literal rendering of its two
characters rather than anything a reader would look up. And 地面, above.

**FOUR SENTENCES THAT WERE NOT ORDINARY CHINESE.** 道理's 没道理是这样的啊！does not parse as anything a
speaker would say — and the card had nothing at all for 有道理, far and away the commonest thing the
word is used in; 等待's 我等待更新 is a two-word stub with no object this verb takes; 地位's
现在父亲在他的办公室已经得到了一个上级的地位 renders an English sentence word for word; and 点心's
吃点点心你看好吗？runs 点 straight into 点心. All four dropped with authored replacements — 点心's
chosen for the *dim sum* sense its gloss names and no sentence showed.

**THREE MORE REPEATS AND THREE MORE BAD TRANSLATIONS.** 敌人's 敌人不靠近 and 无法靠近敌人 are the same
four words twice, once from each side, and the second carried **no terminal mark** at all; 点赞's first
and third rows were both this record's own, the same construction with the pronoun changed. On the
English side, 等候's 汽车站 was called a *Greyhound station* — an American coach company, not a
translation of anything in the sentence — and 地区's 路面, a road surface, was called a *floor*.

**Eleven cards were read and left untouched**: 当中, 当成, 当作, 到达, 到期, 登记, 登录, 等于, 低头,
的确 and 电池.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups **324 → 323**; pinyin clean; example-fit 142 and senses 152
unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 657 unchanged;
`build-lang-decks.js` re-run.

## Batch 83 — hsk30l5 notes 271–300 (电动 → 队伍), plus a corpus sweep for one-sided hints

Thirty consecutive notes, **fifteen of them changed**, and then a sweep that one of those fifteen
turned up: **seventeen more cards across five decks**, carrying a disambiguator for a collision that
no longer exists.

### The sweep: a dead one-sided hint

**A `not <other word>` BLOCK ANSWERS A COLLISION, AND A COLLISION IS SYMMETRIC.** So wherever one card
of a pair carries the block and its named partner does not carry the reverse, the pair has already
been separated and the survivor is disambiguating nothing. Found on 动手, which was glossed `start
work` and carried `not 上班` — and 上班 has since been rewritten to *to go to work; to be at work*, so
the collision had gone and only this half of the pair still said so.

**Swept over all nine decks: 17 of 661 hinted cards were one-sided, and every one of the seventeen was
dead.** The pattern is the same in all of them, and it is this audit's own doing: the PARTNER's gloss
had been sharpened by an earlier batch and the survivor kept pointing at a card that now gives a
different answer. 书 `not 本子` against a 本子 rewritten to *a notebook; an exercise book*; 茶 `not 茶叶`
against *tea leaves; tea*; 体力 `not 力气` against *muscle power, the strength to lift or push*; and the
same again for 不良/坏, 个案/例子, 以内/内, 参赛/竞争, 外边/外, 情感/感情, 正确/不错, 苗头/牌子,
草坪/草地, 许多/好多, 连贯/接, 道路/街道, 顺利/通顺 and 骨头/骨骼.

**NOTHING IN THE PIPELINE REPORTS THIS.** `check-mandarin-coverage.js` counts the groups that DO share
a gloss and whether each carries a disambiguator; it never asks whether a disambiguator points at a
card that no longer collides. Both of its figures read healthy throughout — 323 groups, 322 hinted,
1 still ambiguous — while seventeen readers' cards told them a distinction existed that did not.

**AND A HINT CANNOT BE RETIRED BY DELETING ITS ROW FROM THIS RECORD.** The applier WRITES a hint where
the record has one and **never strips one**, so a deleted row simply leaves the block standing in the
deck file — which is also why two of the seventeen, 体力 and 顺利, were not in the record at all: the
generator shipped them. A dead hint is retired by rewriting the GLOSS, which rebuilds the English
field. That turned out to be the right editorial answer as well: **every one of the seventeen was the
thin one-word original the partner had already outgrown** — `book`, `tea`, `road`, `bone`, `correct`,
`many`, `within`, `smooth`, and three capitalised singles (`Case`, `Sign`, `Lawn`) of the kind 地板's
`Floor` was in batch 82. All seventeen rewritten from CC-CEDICT and each card's own three sentences,
and the coverage checker re-run afterwards: shared-gloss groups unchanged at 323, still-ambiguous
still 1, so **not one of the seventeen rewrites made a new collision** — which is the check batch 81
learnt to run. One-sided hints 17 → 0; cards carrying a hint 661 → 644.

**A BANK SENTENCE APPEARS ON SEVERAL CARDS AND AN ENGLISH FIX REACHES ONLY THE CARD IT WAS WRITTEN
ON.** One of the seventeen, 参赛, carries 琳达是大会的参赛者之一 — the very sentence batch 81 corrected
on 大会 in Level 5, where a 大会 had been called a *pageant*. The copy on this card went on saying it.
**After fixing a translation, grep the decks for the sentence**: the bank is shared and a record row is
per note.

### The thirty notes

**A TWO-READING CARD WITH A SENSE FILED UNDER THE WRONG READING.** 调 already carried both its
readings, and its tiáo sense was written *to adjust, to blend, or a tune* — but a TUNE is **diào**.
CC-CEDICT's two entries are unambiguous: diào holds `/key (in music)/mode (music)/tune/tone/melody/`
and tiáo holds `/to harmonize/to blend/to adjust/to season (food)/`, with nothing musical in it at all.
So the card's first sentence, 这首曲子是大调, is a diào sentence sitting under a gloss that filed its
sense with tiáo, and a reader reading the card carefully came away with the two readings the wrong way
round. Senses rewritten and all three sentences tagged (diào, tiáo, tiáo). **A card can carry both its
readings and still be wrong about which is which** — checking that the READINGS are present is not the
same as checking that the SENSES are under the right one.

**SEVEN SINGLE-CHARACTER CARDS GAINED A `Compounds` SECTION** — 调, 冻, 洞, 堵, 度, 断, 堆 — of which
冻, 洞 and 堆 had **nothing at all** in the reader's downloaded deck. 度's rows record one thing worth
having: **态度 is written tàidu**, its second syllable neutral in CC-CEDICT, and a row given the tàidù
a reader would guess would have been wrong.

**FIVE GLOSSES THAT WERE NOT THE SENSE THE CARD TEACHES.** 冻 is labelled a VERB and was glossed
*frozen; jelly* — an adjective and a noun, so its own label had no definition behind it. 堵 is labelled
*verb / adjective / measure word* and glossed with the verb alone, while TWO of its three sentences are
the measure word (这堵墙, 一堵墙). 动手 read *start work*, which fits none of its three sentences.
队伍 read *troops; army* while all three of its sentences are a TEAM and none is military. And 断's
one-word *to break* left its own second sentence, 不要挂断电话, without a sense — cutting a call off is
not breaking it.

**THREE SENTENCES THAT WERE NOT CHINESE.** 独自's 我快乐独自 is the English *I'm happy alone* with its
words put into Chinese one at a time and left in English order — 独自 is an adverb and cannot stand
after the predicate. 断's 她发现她已经断盐了 renders *she had run out of salt* character by character,
and 断盐 is not something anyone says. 电器's 这个男人简直像一台被扯掉了电源的肮脏电器 came back as
*This man is like a filthy electronic without a battery*, which is not a sentence in either language.

**THE SAME ENGLISH TWICE ON ONE CARD, and it was this record's own doing.** 调研's 他们去乡下做调研 and
他们下乡做调研 both came back as *They went to the countryside to do research* — the exact (not proxy)
finding `check-senses.js` reports, and two rows written by an earlier batch of this audit. 电商 and
动人 were the same shape a row apart: 现在电商发展很快 / 这家电商发展很快, and 她的歌声十分动人 /
这首歌的旋律十分动人. All three replaced in place. **When a batch authors three sentences at once, the
second and third are where the repetition gets in.**

**TWO MORE REPEATS AND A SENSE NO SENTENCE SHOWED.** 堆's 我在堆雪人 and 是谁堆的雪人 are one snowman
twice, and its replacement (桌上堆着一堆书) gives the card the MEASURE WORD its own label names and
neither surviving sentence showed. All three of 度's sentences were the same sense — ten degrees, ten
below, zero Celsius — on a card whose gloss names four; the replacement is the *to pass (time)* sense.
And 动画's translations called it **anime**, the Japanese form specifically, where the word is
animation in general.

**Fifteen cards were read and left untouched**: 电动, 电视台, 电子版, 定期, 丢失, 豆腐, 豆浆, 独立,
独特, 读音, 短处, 短期, 对比, 对待 and 对手.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 323 unchanged across both halves; **one-sided hints 17 → 0**,
cards carrying a hint 661 → 644; pinyin clean; example-fit 142 unchanged; senses 152 → **151**;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 657 → 660;
`build-lang-decks.js` re-run.

## Batch 84 — hsk30l5 notes 301–330 (对象 → 方)

Thirty consecutive notes; **sixteen of them changed**, plus one card in Levels 7–9 that a gloss
rewrite here freed. Three findings are new shapes, and the first of them is this audit's own.

**A SPLIT HEADWORD THAT THIS RECORD PUT THERE.** 儿女's first sentence was 那高个**儿女**人很漂亮 —
高个儿 (a tall person) followed by 女人 (a woman), with the characters 儿女 an accident of the two
meeting, exactly as 加拿大会 was on 大会 (batch 81) and 雨断断续续**地下** on 地下 (batch 82). The card
bolded them and a reader was shown a word that is not in the sentence. **The third of this class in
four batches and the first this audit itself introduced**: the row was harvested from the decks' own
bank by an earlier batch, and that harvest's guard refuses a target SWALLOWED by a longer headword
while saying nothing about one STRADDLING two shorter ones — the same one-directional blind spot
`check-example-fit.js` has, met from the harvesting side. **When a batch harvests a sentence, the
straddle is the case to read for**, because nothing in the pipeline will.

**A CARD THAT CONTRADICTS ITSELF.** 番茄's first sentence read 番茄是蔬菜而不是水果 (*the tomato is a
vegetable, not a fruit*) and its third 严格地讲，番茄是水果 (*strictly speaking, the tomato is a
fruit*) — both true in their own register, cookery against botany, and flatly opposed on one card with
nothing to say which a reader should take away. The same shape as the three self-contradicting cards
the British-spelling sweep found in batch 32. The first is dropped and a sentence about the food put in
its place, leaving the botanical remark standing alone, where it is a fact rather than half an
argument.

**A SENTENCE DROPPED FROM ONE CARD IS NOT DROPPED FROM THE OTHERS THAT CARRY IT.** 这个年级的法方代表
是谁？ was dropped from 代表 in batch 82 as incoherent — a school year group and *the French side* in
one clause, with an English rendering neither — and the copy of it on 方 went on standing. This is the
mirror image of batch 83's finding that an English fix reaches only the card it was written on: **the
bank is shared and a record row is per note**, so a sentence condemned on one card has to be grepped
for across the decks.

**COARSE CONTENT THAT ARRIVED ON A CARD ABOUT SOMETHING ELSE.** 反's second sentence was
她很反感性爱 — *she strongly dislikes sex* — on a Level 5 card about the character 反, where the
headword is buried inside 反感 and the sentence teaches nothing about it. This is exactly what
`check-coarse.js` exists for and exactly why it cannot be a gate: every other checker passes it, the
Chinese being grammatical, the translation accurate, the segmentation clean and the speech correct.

**A LIVE COLLISION NEITHER GLOSS EXPLAINED.** 范围 and 区间 both read `range` and each carried a
`not <other word>` block — which answers the reverse card honestly and tells the reader nothing about
what separates the two words. The distinction is real and each card's own sentences show it: 范围 is an
extent or scope (势力范围, 校园范围内, 能力范围之外) where 区间 is a DELIMITED interval — a numerical
band, or a defined section of a route, which is what its own third sentence, 这是区间列车, is about and
which its gloss did not carry at all. Both rewritten, both hints retired, shared-gloss groups 323 →
322, and the coverage checker re-run to confirm no new collision. **That makes three consecutive
batches in which a hint turned out to be standing in for a distinction a gloss should have stated.**

**SIX SINGLE-CHARACTER CARDS GAINED A `Compounds` SECTION** — 朵, 躲, 罚, 翻, 反, 方 — of which 朵, 躲
and 罚 had **nothing at all** in the reader's downloaded deck, 躲 against a single word in the whole
collection, the thinnest showing yet. 反's rows include 反而 and 反正, which are the very next cards in
this deck. 耳朵 is written **ěrduo**, its second syllable neutral in CC-CEDICT — the same trap as
态度's tàidu one batch back.

**FIVE GLOSSES THAT WERE NOT THE SENSE THE CARD TEACHES**, and two of them named a sense the dictionary
does not give at all: 朵 opened on **stem**, which is in no CC-CEDICT entry for the character, and 发明
read `invent; **expound**`, where the dictionary holds only /to invent/an invention/. 翻's gloss was
`turn over; turn around; reverse` while its own three sentences are 翻倍, 机翻 and 后空翻 — so *to
translate* and *to double*, two of the three senses actually on the card, had no definition behind them.
二手 read `indirectly acquired`, the abstract first sense, over three sentences all about second-hand
goods. And 反映's one-word `to mirror` is the literal half of the word and the rarest thing it is used
for.

**FOUR SENTENCES REPLACED FOR THEIR CHINESE.** 发达's 因为**缺乏的**政府的关注 carries a stray 的 that
no reading of the clause allows; 发布's 墙上杂志 is not what a wall newspaper is called; 朵's 我卖两朵花
is not a thing anyone says; and 翻's 价值翻倍了 is a two-word stub. **THREE MORE FOR THEIR ENGLISH**:
`Is the incurrence of this penalty correct?` is not English, 男生的肌肉比女生发达 lost both the headword
and the noun it is predicated of, and 经济繁荣稳定 kept only the stability.

**AND ONE REPEAT.** 发起's 他发起攻击 and 敌人对我们发起了攻击 are one attack twice; the replacement
gives the card the *to initiate, to sponsor* sense its gloss names and neither military sentence showed.

**Fourteen cards were read and left untouched**: 对象, 吨, 二维码, 发表, 发挥, 发言, 发音, 罚款, 法院,
反而, 反复, 返回, 反应 and 反正.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups **323 → 322**; one-sided hints still 0, cards carrying a hint
644 → 642; pinyin clean; example-fit 142 and senses 151 unchanged; british 0; 34,596 blocks with
spoken == visible on every one; sense-tagged 660 unchanged; `build-lang-decks.js` re-run.

## Batch 85 — hsk30l5 notes 331–360 (方案 → 服装), plus a corpus sweep for the traditional 著

Thirty consecutive notes; **fourteen of them changed**, plus one card in Level 6 that a sweep begun
here could reach.

### The sweep: the traditional 著 in a simplified deck

**A FAULT A VARIANT SWEEP CANNOT SEE, BECAUSE THE CHARACTER IS ALSO A SIMPLIFIED ONE.** 防止's third
sentence was 她穿**著**一件厚外套 — 穿着, the aspect particle *zhe*, written in its traditional form.
Batch 77 built a sweep for exactly this shape and it found two sites in 11,532 notes, because its test
was CC-CEDICT's own variant table: a character the dictionary knows only as a pointer at another
character. **著 is not such a character.** It is a perfectly good simplified character in its own right
— 著名, 显著, 著作, 名著, 著称, 专著 are all correct and all in these decks — and it is *also* the
traditional form of 着. So the one test that would find it is a sweep for 著 followed by reading every
hit, which is what was done here.

**Fifteen sites carry the character — the one in range and fourteen more — and six of them are right.**
The nine faulty sites are the aspect
particle or the verb suffix: 她穿著一件厚外套 (Level 5, repaired in range), 他蹲著 (Level 6), 他默默地
看著我 (Level 6), 她等著接外甥 (Level 6), 月光在照耀著 (Level 6 and Levels 7–9 — one sentence on two
cards, the shared bank again), 他倚著我的肩膀睡著了 (Levels 7–9, twice in one sentence), 她的心流露著
感激之情 (Levels 7–9) and 随著病情变化 (Levels 7–9).

**ONE OF THE EIGHT WAS THIS RECORD'S OWN and is fixed; the other seven are not repairable through this
record as it stands.** 他蹲著 carries `uc-exadd`, so an earlier batch of this audit typed the
traditional form itself, and the row is corrected in place. The remaining seven are generator blocks,
and **no field here may rewrite one**: `exSpace` compares the two sides with every space and every mark
stripped out and therefore FAILS a character swap, correctly — that guard is what makes it safe — and
`dropEx` would throw away seven sound sentences to fix one glyph each. **The honest repair is a new
record field**, narrower than `exSpace`: a swap of ONE character for another, same length, differing at
exactly one position, and only for a DECLARED variant pair (著→着, 鉄→铁). A one-for-one substitution is
positionally identical, so `rewriteZhVisible` preserves the bolding and the `data-say` exactly — safer
than the insertions `exSpace` already allows — and these seven blocks carry no structure line at all,
which is the one thing such a swap could otherwise invalidate. Left for the next batch rather than
bolted on at the end of this one.

### The thirty notes

**TWO MORE SINGLE-CHARACTER CARDS TEACHING A SENSE THEY NEVER SHOW** — the 登 fault of batch 82, twice.
扶 is glossed *hold up; support with the hand; to help somebody up* over 扶梯在哪儿 (an escalator),
我们买了张舒适的扶手椅 (an armchair) and the proverb 烂泥扶不上墙, whose English is an idiom swapped for
an idiom (*You can't raise a cat to be a dog*) and says nothing about the word: two compounds and a
proverb, and not one use of the verb. And 福's first sentence was 我好想吃**大福** — *daifuku*, a
Japanese rice cake whose name is borrowed whole, so the card taught a loanword rather than its own
character, with an English that is not English either. Both repaired with authored sentences, 福's
being 门上贴着一个福字, which is where a reader will actually meet the character.

**THREE SINGLE-CHARACTER CARDS GAINED A `Compounds` SECTION** — 防, 扶 and 福 — and 防's is the widest
gap this audit has found: **nothing at all** in the reader's downloaded deck against fifteen words in
the collection.

**FIVE SENTENCES THAT WERE NOT CHINESE.** 马跟驴可分别 uses 分别 as a bare predicate after 可, which no
reading of the word allows; 今天疯狂的热 puts an attributive 的 between an adverb and its adjective;
在我们的城市那 carries a stray 那; 以防止冷 gives 防止 a bare adjective where it governs an event; and
萨米为生活奋斗 came back as *Sami fought for his life*, which renders a different sentence. **One of
them shows a trap worth naming**: 分类's broken Chinese had already had its ENGLISH rewritten by an
earlier batch, so dropping the sentence orphaned that `exEn` row — a hard FAIL on the next run, the
lesson of batch 75. The row and its `exEn` have to go together.

**FIVE REPEATS.** 防's 这手表是防水的 and 防水功能可以加分 are both 防水; 访问's second and third
sentences are both visiting countries, on a card whose gloss opens on *to interview* and which had no
sentence for it; 非洲's 我来自非洲 and 你来自非洲吗 are one sentence said twice, once as a statement and
once as a question; 奋斗's two 为 X 奋斗; and two more this record wrote itself — 分离's *parted for a
span of years*, twice, and 丰富多彩's 学校的活动 beside 学校的生活, the same school and predicate one
noun apart.

**TWO GLOSSES THAT LEFT THEIR OWN LABEL UNDEFINED.** 分析 is labelled a VERB and was glossed with the
noun *analysis*; 分别 is labelled *noun / verb / adverb* and was glossed with the verb alone, while its
own first sentence is the adverb — *separately, respectively* — which CC-CEDICT carries and the card did
not. And 风格's 你喜欢什么风格的音乐？came back as *What kind of music do you like?*, dropping the
headword.

**Sixteen cards were read and left untouched**: 方案, 房屋, 仿佛, 飞行, 飞行员, 分布, 纷纷, 分配,
分手, 分享, 风俗, 风险, 否定, 否认, 夫妇 and 服装.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 322 unchanged; one-sided hints still 0; pinyin clean;
example-fit 142 and senses 151 unchanged; british 0; 34,596 blocks with spoken == visible on every
one; sense-tagged 660 unchanged; `build-lang-decks.js` re-run. **著 sites: 15, of which 6 are correct
and 9 were faults over 8 distinct sentences — 2 repaired, 7 sites outstanding** (月光 and 照耀 carry the
same sentence).

## Batch 86 — hsk30l5 notes 361–390 (副 → 个别), and `exVariant`

Thirty consecutive notes, **eighteen of them changed**, and the seven 著 sites batch 85 measured and
could not repair — which took a new field in the record, and the field took two goes.

### `exVariant` — one character for another, from a declared table

Batch 85 found the traditional 著 standing for 着 on eight sentences and repaired two of them: one in
range, and one that happened to be this record's own authored row. **The other seven were generator
blocks and no field here could reach them.** `exSpace` compares the two sides with every space and
every mark stripped out and so REFUSES a character swap — that guard is the whole reason it is safe to
rewrite a generator's Chinese at all — and `dropEx` would have thrown away seven sound sentences to fix
one glyph each.

**The new field is narrower than the one that refused the job, not wider.** `exVariant: [[was, now]]`
requires the two sides to be the same LENGTH and every differing position to be a pair DECLARED in
`VARIANT_PAIRS`. A same-length substitution changes no position, so `rewriteZhVisible` flushes every tag
back exactly where it stood and the `<b>` round the headword and the `data-say` survive untouched —
where `exSpace` already permits insertions and deletions, which move every tag after them. The table
holds two rows: **著→着**, with a comment saying in terms that 著 is *not* wrong in itself (著名, 显著,
著作, 名著, 著称, 专著 all keep it, and six of the fifteen sites in the decks are exactly those), and
**鉄→铁**, the Japanese form batch 77 repaired by hand, declared so that the same fault found again has
a mechanism.

**THE GUARD WAS COUNTING THE WRONG THING, AND ONE SENTENCE PROVED IT.** The first cut allowed exactly
ONE differing position — which sounds like the strictest possible rule and is not, because
他倚**著**我的肩膀睡**著**了 carries the character twice and had to be split into two CHAINED rows, each
naming the sentence as the previous one leaves it. **Chained rows are not idempotent**: once both have
run, the first names a sentence the deck no longer has, and `--check` fails for ever afterwards. It did,
immediately, which is exactly what that step is for. The guard's job is that every difference is a
declared substitution, not that there is only one of them, so it counts PAIRS rather than positions and
倚 is one row. Proved against a liveness table afterwards: the swap is allowed, `著`→`了` is refused as
undeclared, a punctuation change is refused for the same reason, different lengths are refused, and an
identical pair is refused. **All seven sites repaired, the sweep reads 0, and the applier is idempotent
over two consecutive runs.**

### The thirty notes

**TWO MORE CARDS MET ONLY THROUGH SOMETHING BORROWED WHOLE.** 富's first sentence was 富子猜中了我的体重
— **富子 is Tomiko**, a Japanese given name, so a card about the character *rich* carried it only inside
a transliteration. That is batch 85's 大福 exactly, one card later and from the other direction: a
single-character card whose sentence is about a Japanese word that happens to contain the character.
Neither of its other two sentences used it freely either (富有 and 首富 are both compounds), so the
replacement is 他家越来越富了.

**A SENTENCE THAT ASSERTED SOMETHING FALSE IN THE PRESENT TENSE.** 妇女's 美国妇女没有选举权 says American
women HAVE no vote; its English said they *didn't*, which is the historical claim the sentence was meant
to make and which Chinese needs 曾经 or a date to carry. **`exEn` cannot repair this** — it leaves the
Chinese standing, and the Chinese is the part that is wrong — so the row was dropped for an authored
sentence that dates the fact. Worth keeping in mind when a translation looks like the only thing amiss:
**ask whether the English is wrong or whether it is silently correcting the Chinese.**

**FOUR SENTENCES USING THE WRONG WORD OR A BROKEN ONE.** 付出's 将其**付出**实践 wants 付诸, which is the
idiom, so the sentence is not Chinese and its English renders one the sentence does not contain; 改革's
我们**算计着**改革生产流程 uses *to scheme* where it means *to plan*, which is what its own English says;
改善's 它**有**改善了 puts 有 in front of a verb where Mandarin takes 有所改善 or 改善了 and not both;
高效's sentence carries a stray 使 between the adverbial and the verb. And 高科技's 台湾是高科技**领先国**
ends on a noun that is not a word.

**SIX REPEATS**, two of them rows this record wrote itself: 高大's *tall man* met and then seen with the
subject changed, 改正's two 请改正 imperatives, 盖's two quilts, 副's two pairs of spectacles, 复制's two
requests for a copy and 改天's two conversations postponed.

**THREE GLOSSES THAT LEFT THEIR OWN LABEL UNDEFINED**, which is now the commonest single fault in this
deck. 副 is labelled a MEASURE WORD and was glossed *deputy; vice-; auxiliary* — the prefix, not the
classifier, though two of its three sentences are 这副眼镜 and 一副太阳眼镜. 个别 is labelled *adjective /
adverb* and was glossed with the adverb alone while two of its sentences are the adjective. And 盖 was
*cover; lid* on a card whose own second sentence, 这家旅馆是去年盖的, is TO BUILD.

**FIVE SINGLE-CHARACTER CARDS GAINED A `Compounds` SECTION** — 副, 富, 盖, 搞, 隔 — and four of the five
had **nothing at all** in the reader's downloaded deck.

**Twelve cards were read and left untouched**: 负担, 富有, 改进, 概括, 概念, 敢于, 刚好, 高度, 告别,
歌词, 歌曲 and 格外.

**Checks after the batch.** `--check` clean and idempotent over two runs; coverage 11,532 at three
sentences, repeats 0, still-ambiguous 1; shared-gloss groups 322 unchanged; one-sided hints still 0;
pinyin clean; example-fit 142 and senses 151 unchanged; british 0; 34,596 blocks with spoken == visible
on every one; sense-tagged 660 unchanged; **著 faults 7 → 0**; `check-claims.js` 0 drifted and
`check-docs.js` 8 passed after the CLAUDE.md edit; `build-lang-decks.js` re-run.

## Batch 87 — hsk30l5 notes 391–420 (各行各业 → 故乡), plus the word-level variant sweep

Thirty consecutive notes, **fourteen of them changed** (one of those by the sweep), and a corpus sweep that `exVariant` made
repairable the day after it was built: **fifteen sites across four decks carrying a non-standard
spelling of a word**.

### The sweep: CC-CEDICT marks WORDS as variants, not only characters

Batch 77 built a variant sweep and it has been the audit's standing test ever since: a character the
dictionary knows ONLY as a pointer at another character. It returns two hits over 11,532 notes, and
batch 85 found the first thing it cannot see (著, which is a real character in its own right). **This is
the second, and it is structural: CC-CEDICT gives whole WORDS entries reading `variant of X` too, and a
character-level test is blind to every one of them.** 計畫|计画 is one — the dictionary says in terms
that it is a variant of 計劃|计划 — and it was sitting on seven cards while the character sweep read
clean.

**The raw word-level sweep is unusable and the filter is the whole finding.** Asking it directly
returns 1,198 candidate words and 29 pages of hits, because CC-CEDICT's "variant" target is written in
TRADITIONAL characters: 这里 is duly reported as a variant of 這裡, 怎么 of 怎麼, 关系 of 關係 — which is
just the simplified spelling, 343 and 206 and 92 times over. **The filter is to resolve the target to
its OWN simplified form and keep the pair only if it still differs**: 计画 → 計劃 → 计划 survives, 这里
→ 這裡 → 这里 does not. That takes it from 29 words to a readable list, and everything below is a
judgement made on that list one word at a time.

**Fifteen sites were repaired, over four declared pairs**, each added to `VARIANT_PAIRS` with the
measurement that settled it: **画→划** (计画 7 sites, against 计划 83 — the Taiwan spelling of the word,
where 画 is right in 画画, 画框 and 刻画 and wrong only here), **帐→账** (帐户, 帐单, 帐号, 5 sites,
against 8 + 3 + 8 of the 账 form), **爱→艾** (爱滋病, one sentence sitting on two cards, against 4 sites
of 艾滋病) and **拉→啦** (拉拉队, 1 site, against 3 of 啦啦队). Two of the fifteen were this record's own
authored rows and are corrected in place rather than through the field. **拉拉队 also exercised the
guard batch 86 had just widened** — it is two differing positions in one row, which the one-position
first cut would have refused.

**WHAT WAS READ AND LEFT IS THE LONGER HALF, and the reasons are worth keeping.** *Substring accidents*
— 利是 inside 胜利是 and 意大利是, 文词 inside 英文词, 格格 inside 格格不入, 子实 inside 句子实际,
家俱 inside 这家俱乐部, 用钱 inside 不能用钱, 要功 inside 需要功力, 比画 inside 画框比画: nine words,
none of them a fault. *Words the dictionary calls variants that mainland usage does not* — 辞典, 标识,
做主, 下功夫, 磨炼, 纯朴, 得意扬扬, 赠与, 畜牲 are all current, and 纪录 is not a variant of 记录 at all
but a distinct word (世界纪录 is a record, 记录 is a written note), so the 14 sites of it are right.
*And three real faults that `exVariant` must NOT be used for*: 当机 (Taiwan for a computer crash, where
three of the four sites are 当机立断 and correct), 哄动 for 轰动 (a different word, not a spelling), and
这个人真利害 — which wants 厉害, **on a card whose own headword is 利害**, so the repair is a dropped
sentence and not a swap. Recorded here rather than done, because each needs a sentence read rather than
a pair declared.

**AND ONE PAIR WAS DELIBERATELY NOT DECLARED.** 做证 → 作证 is three sites and looks exactly like 帐→账
— until 小题大作 → 小题大做 turns up in the same list needing 作→做, the other way round. **A pair that
needs both directions is not an orthographic standard but a lexical choice**, and putting 做/作 in the
table would have made it a claim about nothing. Both left, with this as the rule that decides what may
ever go in: the table holds pairs where one spelling of the SAME word is the mainland standard, never
pairs where the right character depends on the word.

### The thirty notes

**TWO SPLIT HEADWORDS ON ONE CARD, and a third already dropped from it.** 个人's 门口有**个人** is 有 +
个 + 人 and 四**个人**用餐 is 四 + 个 + 人 — the measure word followed by 人, not the word 个人 at all —
so two of three sentences did not contain the headword, and the record shows an earlier batch dropped a
fourth of the same shape (你没看见那个人吗？) and left these two. **个人 is the worst case of this class
the audit has met**: the characters occur together constantly in ordinary Chinese and mean something
else nearly every time, so the card needs its sentences read one at a time and no checker will help.

**A FIFTH TRUNCATED GLOSS IN THIS DECK.** 根 read `root; descendants; completely; [measure word for` —
cut off mid-phrase, with the bracket that opens and never closes which is this class's reliable tell. It
also named two senses CC-CEDICT does not give the character, and the CLASSIFIER it was cut off in the
middle of is what all three of its sentences show.

**A SENTENCE THAT MEANS NOTHING**, standing first on its card: 恭喜's 恭喜你的脸 — *congratulations on
your face*.

**TWO MORE SENTENCES CONDEMNED ELSEWHERE AND STILL STANDING HERE**: 我等待更新, dropped from 等待 in
batch 85, and 防水功能可以加分, dropped from 防 in the same batch. Neither is wrong for the card it
survived on — 更新 and 功能 are the headwords here — but both were still the weakest of three, and this
is the rule batch 84 met on 方 arriving twice in one batch.

**FOUR MORE REPEATS** (贡献's two 作贡献, 公平's two unfair treatments, 功能's two watch features,
古老's), **a broken calque** (工程's 水边地 for *waterfront*), **a word used of something it cannot
describe** (古老 of a town cinema), **two glosses that left their own label undefined** (固定 labelled a
verb over three adjectival sentences, 根 above), **two English translations that rendered a different
sentence** (故乡's 不由得想起了故乡, and 贡献's, which opened on a stray *And* carried over from whatever
longer passage it was cut from), and **three single-character cards that gained a `Compounds` section**
(根, 古, 鼓 — two of them with nothing at all in the reader's downloaded deck).

**Sixteen cards were read and left untouched**: 各行各业, 个性, 各自, 根本, 更换, 工程师, 工具,
公务员, 工业, 工艺, 公寓, 共享, 沟通, 构成, 古代 and 鼓掌.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 322 unchanged; one-sided hints still 0; pinyin clean; example-fit
142 and senses 151 unchanged; british 0; 34,596 blocks with spoken == visible on every one; sense-tagged
660 unchanged; **non-standard spellings of the four declared pairs 15 → 0**; `build-lang-decks.js`
re-run.

## Batch 88 — hsk30l5 notes 421–450 (挂号 → 过于)

Thirty consecutive notes of HSK Level 5 in deck order, the 挂号-to-过于 run. **Twenty cards changed**,
which is the highest count this deck has given, and the reason is not one fault repeated: it is the
three commonest ones — a place name standing in for the word, a gloss narrower or wider than its own
sentences, and a near-repeat the checkers cannot see — all arriving together.

### A sentence written to have no meaning

**观念's first example was Chomsky's *colourless green ideas sleep furiously*.** 无色的绿色的观念疯狂地睡觉
is the Chinese of the most famous sentence in twentieth-century linguistics, and its whole point is that
it is **grammatical and means nothing** — Chomsky wrote it in 1957 to separate the two. It is in the
sentence bank because it is in every parallel corpus there is, and it teaches a learner of 观念 nothing
whatever: the word is being used as a grammatical placeholder in a sentence chosen for being about
nothing. It also carries a doubled 的 construction (无色的绿色的) that no ordinary Chinese sentence has.
Replaced with 他的教育观念比较传统, an authored sentence in the frame the word is actually met in.

**Nothing in the pipeline can see this class, and there is nothing to build that would.** The sentence
contains the headword as a word, segments cleanly, speaks correctly, and its English translation is
exact. It is a perfectly formed card whose content is a joke about form.

### The place name again

**广 was illustrated twice out of three with 广东.** 来广东玩吗 and 广东的夏天很长 use the character only
inside the province's name, where it is a syllable of a proper noun and not the adjective *wide* the
card glosses — and the first of the two had no terminal mark either. This is the single-character
blind spot `check-example-fit.js` states in its own header: a one-character headword is skipped
outright, so 广 inside 广东 is beyond it by design, exactly as 东 inside 广东 was in batch 27. Both
replaced with authored sentences in the two frames the adjective takes, 这本书流传很广 and 他的知识面很广.

### Four glosses that did not fit their own sentences

**Two labels with nothing under them.** 怪 named *verb / adjective / adverb* over *strange, unusual, to
blame*, which is two senses under three labels: the adverbial 怪 — CC-CEDICT's colloquial *rather*, as
in 怪好的 — is a real sense of the character that neither half of the gloss defines and no sentence
shows. 规则 named *noun / adjective* over *rule; regulation*, which is the noun written twice, the
adjectival sense (*regular in shape or arrangement*, 规则的图形) being likewise unglossed and
unillustrated. Both labels are dropped rather than a sense invented to fill them; 怪 is split into the
two senses it does teach, with each of its three sentences tagged.

**One gloss narrower than its card.** 光线 read *light ray*, and not one of its three sentences is a
ray — 我能看到光线, 拍照片光线不够亮 and 有足够的光线读书 are all ambient light. CC-CEDICT gives *light
ray* first and *light* second, so this is batch 31's finding again: **the dictionary's leading sense is
not automatically this card's**, and a gloss taken off the top of an entry can be right about the word
while being wrong about the card.

**One gloss wider than it looked.** 滚 was glossed *to roll; trundle*, and with this batch's boiling
sentence added the card taught three distinct senses — 滚出我的房子 the rude *clear off*, 孩子从山上滚了下来
*to roll*, 锅里的水滚了 *to boil*, which is the sense CC-CEDICT gives first. Split into three, each
sentence tagged. *Trundle* went with it: it is a word a learner is less likely to know than the one it
was glossing.

### Two repeats no checker reports

**贵姓 carried 请问你贵姓？ and 请问您贵姓 — one sentence, one character apart** (你 against 您), with a
different English on each so that even the translations did not look alike. **过分 carried 你太过分了 and
我觉得你太过分了** — the same sentence with a frame in front of it. The coverage checker's repeat test
compares sentences **exactly**, so a near-duplicate is invisible to it, and both cards were showing a
reader two examples where they had one. **过期 is the same fault a step wider**: all three sentences were
a document expiring in the same frame, 护照, 签证 and 身份证, the first and third differing only in which
document.

### Five sentences that are not Chinese, or not about the word

**A collocation that does not exist**: 广场's 鲜明的灯火 — 鲜明 is *vivid* or *clear-cut*, of a colour or
a contrast, and light that illuminates a square is 明亮. **A calque**: 广泛's 广泛的安全措施实施了, English
word order with the patient in front of 实施了 and no 被. **A headword swallowed by a term of art**:
规模's only occurrence was inside 规模经济, *economies of scale*, in a sentence (预料到了……的实行) that
Chinese does not say — and with it gone the card's other two were both 大规模, so a bare-规模 sentence was
put first. **A missing 对**: 过敏's 我玉米过敏, where the word takes 对 before its allergen. **A word
missing from its own sentence's grammar**: 过于's 过于上网不是跟医学或精神病有关的事情, which fronts an
adverb as a noun phrase.

### A generalisation about people, and two more sentences replaced

观察 opened on **女人观察，男人思考** — *the woman observes and the man thinks* — which is the class
`check-coarse.js` names and which this audit has already removed from 矮 and 教养. 广大 opened on a
sentence whose whole content is a joke about Bombay and Mumbai being the same city, and 规律 on 现在我规律服药,
which uses the noun adverbially where Chinese wants 有规律地. 柜子 had 每个学生都有一柜子 — a locker,
missing its measure word — and an English translation calling a 柜子 a *shelf* two sentences after the
gloss called it a cupboard.

### Four single-character cards gained a `Compounds` section

怪, 广, 滚 and 锅. Two of them — 怪 and 滚 — had **nothing at all** in the reader's downloaded deck
against nine and one words respectively in the collection, which is the tap panel's own limit: it can
only search what has been downloaded. Every row's reading and gloss was checked against CC-CEDICT first.

### What was read and left

**Ten cards were read and left untouched**: 挂号, 观点, 冠军, 光临, 光明, 国画, 国庆, 果然, 果实 and
过度. 光明's *openhearted* looks like an unillustrated sense and is not: CC-CEDICT gives it, and the
card's three sentences cover the two senses the gloss leads with. 关闭 needed only a terminal full stop
on its first sentence, supplied through `exStop`.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 322 unchanged — so neither gloss rewrite made a new collision;
one-sided hints still 0; pinyin clean; example-fit 142 and senses 151 unchanged; british 0; 34,596
blocks with spoken == visible on every one; **sense-tagged 660 → 666**, the six being 怪's three and
滚's three; `build-lang-decks.js` re-run.

## Batch 89 — hsk30l5 notes 451–480 (哈 → 蝴蝶)

Thirty consecutive notes of HSK Level 5 in deck order, the 哈-to-蝴蝶 run. **Twenty cards changed**,
the same count as the batch before it, and the run's own character is that six of the twenty were
wrong on the ENGLISH rather than on the Chinese — a translation that renamed the drink it described, a
tense that disagreed with its own sentence, two that were not grammatical English at all, and one that
turned a remark about a suntan into a question about race.

### The single-character blind spot at its widest

**哈's three sentences were 哈尔滨, 哈拉和林 and 哈欠 — Harbin, Karakorum, and the bound 哈 of *a yawn*.**
The card glosses the character as the interjection and the sound of laughter, and NOT ONE of its three
examples used it that way: two are transliterated place names, where the character is a syllable chosen
for its sound and carries no meaning at all, and the third is a compound. `check-example-fit.js` skips
a one-character headword outright, by design, so nothing reported it — and this is worse than 东 in
batch 27, where one sentence of three survived the same test.

Two authored sentences were put in for the laugh. **The yawn was kept**, deliberately: 打哈欠 is where a
learner actually meets the character, and the new Compounds row naming 哈欠 is what makes the third
sentence legible rather than puzzling. **哈 is also the only card in all nine decks with nothing built
on it anywhere** — zero words in the reader's downloaded deck and zero in the whole collection — so its
panel could only ever have been authored.

### Three glosses that defined something their card did not show

**合 is the clearest case the audit has met.** The gloss read *to close, to join, to combine*, and its
three sentences were 不合情理, 合得来 and 合拍 — every one of them the *to suit, to accord with* sense
CC-CEDICT gives third, and two of them compounds besides. A card defining one thing and illustrating
another. 我们很合拍 was dropped for meaning what 合得来 above it means, an authored sentence put in for
the concrete *to close*, and the senses split so each sentence carries a tag.

**合影 named a part of speech its gloss did not define** — *noun / verb* over *group photo* — and the
label left undefined was the one the card mostly showed, two of three sentences being the verb. This is
batch 88's 怪 and 规则 from the other side: there the unillustrated label was dropped, here the missing
gloss is supplied, and which repair is right depends on whether the card's own sentences show the sense.

**黑 showed the colour in none of its three.** 越来越黑了 is the failing light, 我不想晒黑 is a suntan, and
the third was about a person's skin; so the card glossed *black* and illustrated dark, tanned and
darker. An authored sentence supplies the plain colour.

### Six faults on the English side

**A translation that renamed its own subject.** 含量's 淡啤酒是一种酒精含量低的啤酒 was rendered *Pale ale
is a low-alcohol beer*: 淡啤酒 is **light beer**, 淡色艾尔 is pale ale, and pale ale is not low in alcohol
— so the English contradicted the second half of its own sentence. Corrected rather than dropped, the
Chinese being sound.

**A tense that disagreed with its Chinese.** 好转's 它会好转的 — plainly future, 会……的 — was translated
*It's got better*. The 它 is a calque too: Chinese does not use a bare pronoun for a situation.

**Two that are not English.** 猴子 had *Monkeys are fond of banana* and *Not a few monkeys were found in
the mountain*. 不少 is *quite a few* and 山上 is *in the mountains*. Both are the side a reader is graded
against on the reverse card.

**And one that changes what a sentence says about people.** 黑's 他为什么看上去很黑？ was translated *Why
does he look black?*, which in English is a question about race where the Chinese 很黑 of a person is
*tanned* or *dark-skinned* — and with 我不想晒黑 two lines below it, the card gave a reader no way to read
it otherwise.

### A mistranslation on the Chinese side, which is the one that cannot be fixed by rewording

后果's 在理想的战争里，后果是人会死 was set against *In a war of ideas it is people who get killed* — but
**理想的战争 is *an ideal war***, not a war of ideas, which is 思想之争. The Chinese therefore asserts
something else, and something rather strange, and no rewriting of the English repairs it: the sentence
itself has to go. This is the mirror of the six above and the reason each was judged separately.

### The long sentence, the political slogan and the sentence from another card

**厚度 opened on sixty-eight characters of H. G. Wells** — the first paragraph of *The Time Machine*,
正如我们的数学家所言，这个空间有三个维度……, in which 厚度 appears once, as the third item of a list, inside
an argument about the dimensionality of space. It is the longest example sentence this audit has met.

**合法's third sentence was 税收就是合法的抢劫** — *taxes are just legal robbery*, a libertarian slogan and
the deck's only political assertion, on a card a learner drills to automaticity. It was also the card's
only attributive use, so the replacement is attributive too.

**好评's first sentence also stands on 广, twenty-nine cards earlier in the same deck.** 她的新小说广受好评
is correct on both — 广受 is the adverbial 广 that card teaches — and the shared bank normally makes that
fine. It stops being fine when the two cards are in one deck and a fortnight apart.

### Four more repeats, two calques and a split headword

**河流's 密西西比河流经哪个城市 does not contain the headword at all**: it is 密西西比河 + 流经, the 河 belonging
to the river's name and the 流 to the verb. It was one of `check-example-fit.js`'s own 142 findings, and
clearing it took that count to 141.

**海鲜 had 她喜欢海鲜 and 我很喜欢吃海鲜** — one sentence in two persons. **好运 had the same farewell three
times**, 祝(你)好运 with conversational filler in front of it. **过期's successor 忽视 had two sentences
about the same ignored warnings**, the first a bare fragment with no agent and no 了. **The calques**:
海外's 海外国家, English word order for *overseas countries*, with the card's English saying *foreign*,
which is 外国 and a different word; and 呼吸's 我的鼻子没办法呼吸了, *my nose cannot breathe*, which the
card's own English had already silently corrected to *I can't breathe through my nose*.

### Five cards gained a `Compounds` section

哈, 含, 黑, 红 and 湖 — the first four with nothing at all in the reader's downloaded deck against nine,
eight and fifteen words in the collection. **湖's panel deliberately omits 湖泊**: that card already
carries a `not 湖泊` disambiguator, the two sharing the gloss *lake*, and a Compounds row defining the
very word the front of the card tells the reader not to answer would undo it. **湖水 was wanted and is
not there**: CC-CEDICT has no entry for it, and a row's reading and gloss are verified against the
dictionary before it is written, so it was left out rather than glossed from inference.

### What was read and left, and one thing left on purpose

**Ten cards were read and left untouched**: 海关, 含有, 汗水, 行业, 好奇, 盒饭, 合理, 合同, 合作 and 蝴蝶.
含有's 可能含有坚果 looks like a fragment and is not — it is what is printed on the packet. **好奇 was left
although its first sentence reads oddly**, because an earlier batch has already read and judged it: the
record carries an `exEn` row correcting its English away from *Curiosity killed the cat*, which is not
what 好奇会吃苦头的 says.

**And 河流's gloss was left alone although one of its own sentences contradicts it.** It reads *rivers,
river systems (collective)* while 那条河流很长 is a single watercourse measured with 条, which CC-CEDICT
gives as the word's classifier. The gloss is narrow because an earlier batch narrowed it deliberately, to
break a three-way collision with 河 (*river, the general word*) and 江 (*large river*) on the English →
Chinese card — so **the disambiguation rule and the definition rule pull against each other here**, and
widening the gloss would put the collision back. The replacement sentence is plural instead, which is
the sense the gloss does define.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 322 unchanged — so neither the 合 nor the 合影 rewrite made a new
collision; one-sided hints still 0; pinyin clean; **example-fit 142 → 141**, the one cleared being
河流's split headword; senses 151 unchanged; british 0; 34,596 blocks with spoken == visible on every
one; **sense-tagged 666 → 672**, the six being 合's three and 合影's three; `build-lang-decks.js` re-run.

## Batch 90 — hsk30l5 notes 481–510 (胡同 → 机构)

Thirty consecutive notes of HSK Level 5 in deck order, the 胡同-to-机构 run. **Eighteen cards changed.**
Two of them are findings of a kind this audit has not met before, and both are invisible to every
checker in `.claude/decks/`.

### A card that spoke one reading and illustrated the other

**划 carries two readings, a `Say` of 划算 that pins huá — and two of its three sentences were huà.**
划线 and 划掉 are both **huà** in CC-CEDICT, only 划破 being huá; so a reader pressing the speaker heard
one reading of the character and then read two sentences using the other, with nothing on the card
saying which was which.

**No checker here can see this, and it is worth being precise about why.** `check-say-reading.js` asks
what reading a speech engine will guess for a card's own headword, measured against how the corpus uses
that CHARACTER — a question about the card, not about its sentences. `check-pinyin.js` compares the
card's pinyin against its bopomofo, which is a question about one field against another. **Neither asks
which reading each EXAMPLE uses**, and there is no field in which that could be stated except the
`exSense` tags, which is what this card now carries: 划线 tagged huà, and 划破 and a new rowing sentence
tagged huá. 划掉 was dropped for being 划线's own sense on paper a second time, and the English on 划破
said *a sharp crack of thunder* over a Chinese that says 闪电 — lightning.

### The harvest's own guard failing, three times on one card

**伙's three sentences were all 小伙子** — *a young man*, a compound in which 伙 is neither the classifier
the card labels it nor any of the senses it glossed. All three were **added by an earlier batch of this
audit**, harvested from Tatoeba, and the harvest's own filter is written in terms that would have caught
them: *the target must not be swallowed by a longer headword in the same place*. **小伙子 is itself a
headword in this same deck.** The guard did not fire, nothing reported it afterwards
(`check-example-fit.js` skips a one-character headword outright), and the first sentence's English was
wrong besides — *She scorned the boy* over a Chinese whose subject is 他.

All three replaced with sentences using 伙 as what the card says it is. **The noun glosses were dropped
rather than illustrated**: 伙 standing alone is the classifier, and *companion, partner* lives next door
on 伙伴, which is the very next card.

### Four glosses answering a different question from their own card

**花费 was labelled a VERB and glossed a NOUN** — *expense* — while all three of its sentences are the
verb. **回收 glossed *retrieve; recover; reclaim* and every one of its sentences is RECYCLING**, which is
the sense CC-CEDICT gives first and the gloss did not name at all: the card defined the three senses it
does not show and omitted the one it does. **滑** was labelled *verb / adjective* and glossed the
adjective alone. **户外** was glossed *outdoor*, an English adjective, over a Chinese noun meaning *the
outdoors*, which is what all three sentences use it as.

### Taiwan vocabulary in a simplified deck

**缓慢's first sentence used 硬体 and 软体** — the Taiwan words for hardware and software, where the
mainland says 硬件 and 软件. **Batch 87's word-level variant sweep cannot see this**: that test asks
CC-CEDICT whether a word is marked a variant of another, and 硬体 and 硬件 are two different words rather
than two spellings of one. This is the same shape as batch 86's 著 one level up — a regional difference
the dictionary does not file as a variant at all.

### Five near-repeats, and the tell each time

**婚礼 had one sentence in the active and the passive** — 他们明天举行婚礼 and 他们的婚礼将在明天举行, the same
three people marrying on the same day. **汇率 had 汇率是多少？ and 今天的汇率是多少？**, one sentence with two
characters in front of it. **话题 had 他转变了话题 and 我试图改变话题**, and their own English said so:
*He changed the topic of conversation* and *I tried to change the subject*. **缓解 had two medicines
easing two pains.** **黄金 had two questions about the density of gold against another metal.** Every one
is invisible to the coverage checker's repeat test, which compares sentences exactly.

**机构 is the same fault with a compound in it**: two of three sentences were somebody donating money to
a 慈善机构, so the card showed one collocation twice and the headword bare not at all. Its third was
harvested and garbled — 这个机构组织很多会议的志工…… runs 机构 and 组织 together at the point a reader is
looking for the headword, and its subject is the door-to-door sale of Frisian books.

### A sex joke, and four more faults on the English

**黄瓜's third sentence was 她床头有一根黄瓜** — *she has a cucumber at her bedside* — which is what a
subtitle corpus contains and what `check-coarse.js` cannot see, no word in it being coarse.

On the English side: 互动's *He doesn't usually get involved with his fan*, a singular over a plural and
a paraphrase over the word the card glosses; 挥's *She waved her arms* over 手, the hand; 滑's *The
ground is still wet* over a Chinese saying wet AND slippery, which drops the headword from the
translation entirely; and 缓慢's *happened gradually* over a Chinese that says *was slow*.

### Four single-character cards gained a `Compounds` section

滑, 化, 灰 and 挥, none of them with anything in the reader's downloaded deck. **化's gap is the widest
any single-character card has shown** — nothing downloaded against thirty-seven words in the collection
— because 化 is the deck's commonest suffix. **灰 also needed a sentence**: its gloss leads on *grey* and
not one of its three examples was a colour, 吃灰 and 积了灰 being dust and 火山灰 ash.

### What was read and left

**Twelve cards were read and left untouched**: 胡同, 话费, 画面, 化学, 环节, 恢复, 灰色, 伙伴, 火锅,
或是, 货物 and 或许. 胡同's third sentence defines the word rather than using it, which is unusual and is
right here — a 胡同 is a Beijing thing and a reader outside China has no picture of one.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 322 unchanged — so none of the four gloss rewrites made a new
collision; one-sided hints still 0; pinyin clean; example-fit 141 and senses 151 unchanged; british 0;
34,596 blocks with spoken == visible on every one; **sense-tagged 672 → 675**, the three being 划's;
`build-lang-decks.js` re-run.

## Batch 91 — hsk30l5 notes 511–540 (激烈 → 记载)

Thirty consecutive notes of HSK Level 5 in deck order, the 激烈-to-记载 run. **Twenty-six cards changed**,
four read and left. The batch's shape is unusual: no single card carried a spectacular fault, and instead
**seven of the thirty showed the same sentence twice in a form no checker can see**.

### Seven near-repeats, and what each one hid behind

The coverage checker's repeat test compares sentences EXACTLY and its duplicate-English test compares
translations exactly, so a card can show one thing twice and pass both. Seven did here, and they are worth
listing because each wears a different disguise.

**急诊 is the plainest and is this audit's own work.** Two of the three sentences an earlier batch added
were 孩子半夜去看了急诊 and 他半夜去看急诊 — the same sentence with a different subject, whose English
differs only in *The child* against *He*. **纪录 is the same shape on generator sentences**: 她打破了世界纪录
and 他破了世界纪录, *She broke the world record* and *He broke the world record*.

**机器 is one statement affirmed and negated** — 机器正常运作 against 这些机器目前不运转. **集合 is one
question asked twice**, 集合地点是哪儿？ and 我们在哪里集合？, once as a noun modifier and once as the verb.
**及格 had two people passing an examination**, **季度 two sets of first-quarter results**, and **纪念日 two
wedding anniversaries** — the second of each pair added by an earlier batch of this audit, which is the
half worth noticing: **a harvest filtered on a translation not already on the card cannot see a translation
that merely says the same thing.**

**挤 and 系 are the two where the repeat was hiding a second fault.** 挤's pair was 火车挤满了人 and
列车在晚上很挤, two crowded trains — and 挤满 is a word of its own, so the first had the one-character
headword swallowed, which `check-example-fit.js` skips by design. 系's was 系上安全带 and 没人系安全带,
two seat belts — and both are the **jì** reading, so a card carrying two readings illustrated one of them
twice and the other once with nothing saying which was which.

### Four glosses answering a different question from their own card

**纪录片 was glossed *newsreel*, and not one of its three sentences is a newsreel.** CC-CEDICT gives
*newsreel* first and *documentary (film or TV program)* second, so the card took the dictionary's leading
sense and the dictionary's leading sense is not automatically the card's — which is the rule this audit
states and this is the cleanest example of it yet.

**集 was glossed *collection; set; volume* while two of its three sentences are an EPISODE** (第一集, and
一集《海绵宝宝》), a sense the gloss did not name at all; reported by `check-gloss-source.js`. **技能 was
glossed *technical ability* alone** over three sentences about skills in the ordinary sense. And **记忆's
gloss carried *storage***, a computing sense CC-CEDICT does not give and no sentence shows.

### Five cards labelled with a part of speech no gloss illustrated

**记录 is labelled *noun / verb* and glossed only the verb** — *take notes; keep the minutes* — while two of
its three sentences are the noun. **挤 is labelled *verb / adjective* and glossed only the verb**, with two
adjective sentences. **纪念 is labelled *noun / verb* and glossed only the verb**, and NOT ONE of its three
sentences used that verb: two were 纪念品, a souvenir, with the headword swallowed, and the third the noun
周年纪念. **及 was labelled a CONJUNCTION** over one conjunction sentence, one 遍及 (swallowed again) and one
深及膝盖, which is the verb *to reach* the gloss never gave. **And 系's xì NOUN sense read *tie; fasten;
system; department*, repeating the jì verb gloss word for word.**

All five now carry the senses their own labels claim, and every one of them carries `exSense` tags so
each sentence says which sense it shows — as does 记忆 above, six cards and eighteen new tagged blocks,
675 → 693.

**记录's noun is glossed *written record; minutes* rather than bare *record*, deliberately.** 纪录 is the
very next card in the deck and CC-CEDICT files it as a variant of the same word; the two are now told
apart on the front of the reverse card — 记录 the written account, 纪录 the achievement — instead of
competing there. The shared-gloss count is unchanged at 322 groups, so the rewrite made no new collision.

### Two grammar errors a learner copies, and one calque

**我们激烈的讨论了这个问题 and 她说的极其快 write 的 where the grammar takes 地 and 得.** Both are generator
sentences, both are the commonest mistake a learner makes with these three particles, and a deck that
prints one teaches it. Re-set with the right particle. **我现在非常集中的学习 is the same error over a frame
集中 does not take in the first place** — its own English, *I'm studying very hard*, does not contain the
word — and was dropped rather than repunctuated.

**控制一个班级需要你做老师的所有技能 is a word-for-word calque of its English** and is not a sentence anyone
writes; so is 我们急忙跑向火, where *We raced towards the fire* is translating a 火场 the Chinese has not
got, and 计算机使表单的处理容易了, whose English — *The computer means making the form is easy* — is not a
sentence either. All three replaced.

### Six English translations that dropped the word the card is about

In order: 肌肉's *He's ripped* over a Chinese saying he has visible muscle definition; 机器's *It's working just
fine*, which names no machine; 即将's *The library is closing* over a Chinese whose whole point is *is about
to*; 计算's *arithmetic*, which is 算术 and a different word; 疾病's *a serious disease* over a Chinese
carrying no adjective; and 及格's *I don't want to fail my exams* over a Chinese that says only 不及格.

### Five single-character cards gained a `Compounds` section

及, 级, 集, 挤 and 系, none of them with anything in the reader's downloaded deck. Every row's reading and
gloss was checked against CC-CEDICT before it was written; 级 took five rows and the rest four.

### What was read and left, and one checker finding that is not one

**Four cards were read and left untouched**: 机器人, 集体, 急需 and 记载. 机器人's second sentence is a
subtitle exchange rather than a statement — *How could I be a robot? Robots don't dream.* — and uses the
word twice, which is fine.

**急需 was the closest call and was left.** 急需医疗用品 and 灾区急需食物和药品 are both emergency supplies,
which is one subject twice; but the first is a subjectless news headline and the second a full clause with
a different object, so they are two constructions rather than one sentence written twice. Recorded rather
than acted on.

**`check-example-fit.js` reports 及格's 我不想不及格 as split between 不及 and 格, and that is a false
positive** — 不及 is a headword in the corpus, so the greedy segmenter prefers it, and the sentence is the
perfectly ordinary negation 不 + 及格. It is left standing. **急忙's `check-gloss-source.js` finding is a
false positive too**: the card says *in a hurry; in haste* and the dictionary says *hastily*, which is the
same thing in different words — the shape that checker's own header warns is a quarter of its output.

**级's three sentences were read and left.** 高一级 is the classifier, 拾级而上 the noun *step of stairs*
and 大师级 the suffix, which between them are all three of the senses the gloss gives — so the card needed
only its Compounds panel.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 322 unchanged — so none of the six gloss rewrites made a new
collision; one-sided hints still 0; pinyin clean; example-fit 141 and senses 151 unchanged; british 0;
34,596 blocks with spoken == visible on every one; **sense-tagged 675 → 693**, the eighteen being 及's,
挤's, 系's, 记录's, 纪念's and 记忆's three apiece; `build-lang-decks.js` re-run.

## Batch 92 — hsk30l5 notes 541–570 (嘉宾 → 将近)

Thirty consecutive notes of HSK Level 5 in deck order. **Twenty cards changed**, ten read and left. Its
best finding is a checker being right about a string on two cards and blind to it on the third, which is
the card the string is actually wrong on.

### 一家电影院 — reported twice, invisible where it matters

**家电's first sentence was 广场东边有一家电影院, which does not contain the word at all**: it is 一家 +
电影院, and the card's own two characters straddle the boundary between them.

**`check-example-fit.js` reports exactly this string — twice — on other cards in this same deck.** 电视台's
她在一家电视台工作 is listed as *split between 家电 and 视 and 台*, and 电商's 他在一家电商公司上班 as *split
between 家电 and 商*. Both findings exist because the segmenter's lexicon holds 家电 and greedily prefers
it. **And that is precisely why it cannot see the fault on 家电 itself**: there the segmenter lands
squarely on the headword, which is all the check asks. It is batch 26's measured blind spot met from the
far side — the checker's own lexicon supplying the wrong answer on the one card that matters.

**加工 is the same fault one card later**: 我无法相信他有种向老板要求加工资 is 加 + 工资, to raise wages,
and reports nothing for the same reason. **Both sentences were harvested by earlier batches of this
audit**, and the harvest's guard is written in terms of the opposite arrangement: it refuses a target
SWALLOWED by a longer headword, and says nothing about one FORMED ACROSS two shorter ones. Both are
replaced with authored sentences.

### A card whose three sentences used its character in three other words

**甲's sentences were 洗甲水 (nail polish remover), 甲虫 (a beetle) and 手甲的生长速度比脚甲快四倍.**
Not one uses 甲 as a word, and the third is not standard Mandarin at all — the words are 指甲 and 足趾甲,
where 手甲 is a southern form. A one-character headword is skipped by `check-example-fit.js` by design,
so nothing reported any of it.

All three are replaced with the sense the character actually carries free, which is the **letter A of an
enumeration** — 甲、乙、丙 — and the gloss is re-ordered to lead on it. **Nothing was taken OUT of the
gloss**: *shell*, *nail* and the Heavenly Stem are all real senses of the character, and a character card
should say what its character means; what was wrong was leading on senses the card could not show.

### Three more cards labelled with a part of speech no gloss illustrated

**架 is labelled *noun / verb / measure word* and glossed the noun alone**, and two of its three sentences
showed neither — 她们在干架 is 干架, scrapping, and 上高架走 is 高架, an elevated road: the one-character
headword swallowed twice. All three senses are now written out and each sentence tagged.

**建筑 is labelled *noun / verb* and glossed the verb alone**, while all three of its sentences are the
noun. **建设's gloss is the verb and its first sentence was the noun** (军队建设) inside a slogan whose
English does not contain the word at all, and its second was 建设性, a derived adjective.

**Two senses are now glossed and deliberately NOT illustrated, and both are recorded rather than papered
over.** 架 as a bare noun is written rather than spoken Chinese — every everyday sentence for it is
really 架子 or a compound, which would swallow the headword again. And 建筑 as a verb has been given over
to 建造 and 建设, which are the two cards either side of it in this very deck.

### Seven near-repeats, one of them across two cards

加热 heated the same water twice; 加速 accelerated a train and then a car; 驾驶 said *drive carefully*
twice; 驾照 asked twice about the age you get a licence; 艰苦 had 艰苦的工作 twice over; 剪 cut the same
head of hair twice.

**And 剪's 用剪刀剪图片 is word for word the third sentence of 剪刀, the very next card in the deck** — so
a reader working through in order met it twice within two cards. It is left standing on 剪刀, where the
scissors are the subject, and dropped from 剪.

### Three sentences that are not Chinese, and one word that does not exist

**键's one generator sentence turned on 键琴手**, which is not a word: a player of keyboards is a 键盘手.
So the card's character appeared inside a non-word, and 一队本地乐队 says *band* twice besides.
**捡's 你不介意的路上捡东西回来？** has no grammatical reading — 你不介意的路上 is not a phrase Chinese
has. **建's 我建石头房子** is its English (*I build houses out of stone*) with the 用 taken out.

### Two particle errors and four English translations that dropped the word

键盘's 手指在键盘上快速的移动 writes 的 where an adverbial takes 地 — the third such sentence in two
batches, and the commonest particle mistake a learner makes. 简历's English spelled it *resumé*, with the
accent on the wrong vowel; it is put into *CV*, which is the word the card's gloss and its other two
sentences already use. **简直's two translations both dropped the adverb the card exists for**: *You'll
find it impossible to live there* and *Some people think of reading as a waste of time* say nothing about
*simply*.

**家务's gloss was *house work* as two words**, which is not how the compound is spelled in either
English; reported by `check-gloss-source.js`. **将近's gloss carried *nearby***, which is 附近 and a
different word, and one of its sentences made a noun of an adverb (年迈的将近).

### Five single-character cards gained a `Compounds` section — and one deliberately did not

甲, 架, 剪, 建 and 键 took one, every row's reading and gloss checked against CC-CEDICT first. **捡 did
not, and the reason is worth recording**: the dictionary holds only 捡拾, 捡漏 and two idioms for that
character, so there is no set of three ordinary words to give — and a row glossed from inference is the
one thing this record forbids. An absent panel is the honest answer; batch 90's 灰 made the same call
about one row and this makes it about a whole card.

### What was read and left

**Ten cards were read and left untouched**: 嘉宾, 加深, 假如, 价值, 坚强, 剪刀, 减肥, 渐渐, 建立 and 建造.

**坚强 and 建造 were the close calls and both were left.** 坚强 has 我不够坚强 and 他很坚强, one
predicate in two persons — but the second carries a consequence clause the first has not, so they are
two sentences rather than one written twice. 建造 has 大楼正在建造 and 到处都是新建造的楼房, both
buildings — but one is progressive and one attributive, which is the distinction the word's grammar
turns on. **减肥's three sentences are all about losing weight and that is not a repeat**: it is what
the word means.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 322 unchanged — so neither the 家务 nor the 将近 gloss rewrite made
a new collision; one-sided hints still 0; pinyin clean; example-fit 141 and senses 151 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; **sense-tagged 693 → 696**, the three being
架's; `build-lang-decks.js` re-run.

## Batch 93 — hsk30l5 notes 571–600 (讲话 → 尽量)

Thirty consecutive notes of HSK Level 5 in deck order. **Twenty-six cards changed**, four read and left.
**Not one of the findings below was reported by any checker in `.claude/decks/`** — all eight were run
over this range first and every one came back with nothing.

### Cantonese in a Mandarin deck, twice, six cards apart

**结's third sentence asked to borrow somebody's 结他.** That is the CANTONESE loan for *guitar*; the
Mandarin word is 吉他, and **CC-CEDICT has no entry for 结他 at all**. So the card's character stood inside
a word Mandarin does not have — and because the characters are ordinary simplified ones, nothing in the
pipeline can see it.

**今日's second sentence was 话事话，今日系六月八号，我老婆生日** — 系 for 是 and 话事话 for 话说回来, which
is Cantonese written out in simplified characters, on a card whose whole job is to distinguish a written
Mandarin word from its spoken neighbour.

**This is batch 90's 硬体/软体 finding in a second language.** A regional WORD is not a regional spelling,
so `check-pinyin.js` is clean on it (the readings are right for what is written), the variant sweep
cannot match it (CC-CEDICT files no variant relation), and `check-example-fit.js` skips 结 outright for
being one character. **Read the sentences.**

### A gloss that was the one thing its card never showed, five times

**讲话 is glossed *a speech*, a noun, and all three of its sentences are the verb.** **降水 is LABELLED a
verb** and glossed two nouns, which is what it is. **接收 is labelled a verb and glossed *reception (of
transmitted signal)***, a noun phrase, which is CC-CEDICT's leading sense and is one of the three things
its own sentences do. **届 is labelled a MEASURE WORD and its gloss opened on *fall due*,** a verb sense
of the character that no classifier use touches. And **紧 is labelled *verb / adjective* and its gloss
leads on *tight*** — while 紧闭, 咬紧 and 紧握 are all 紧 doing adverbial work on another verb, so the
adjective the gloss leads on was shown nowhere.

**讲座 is the same shape with the dictionary on the other side.** Its gloss was *series of lectures*,
which is CC-CEDICT's own wording, and all three sentences are a SINGLE lecture — 讲座八点钟开始. Modern
usage has both; *lecture* goes in front and the dictionary's sense stays behind it. **That is a change
made against the dictionary's wording and it is recorded as such**, on the rule that the card's own
sentences decide.

### Six sentences that are not sentences

奖励's 秘密的礼物公开的奖励 is two noun phrases side by side with no verb between them, read by its
English as a passive. 尽快's 他们会尽快。 stops where its English has a complement — 尽快 is an adverb and
cannot be a predicate. 脚步's 他停下脚步看起海报 has no grammatical reading of 看起. 交易's
这笔交易是我的，所以你需要去冷静并且同意我 is a word-for-word calque **carrying no terminal punctuation at
all**, and 角度's 我们应该用各种不同的角度看待此问题 carries none either. 尽量's 请尽量批评 is the tail of
a set formula standing alone, where it reads as an instruction to criticise as much as possible.

### A generalisation about a nationality whose English softened it

**讲究's 人们都以为日本人是讲究礼貌的** was translated *Japanese people are considered to be polite*
— and 以为 in Chinese carries the sense that the belief is mistaken, which the English drops. So the
sentence says something sharper than its own translation admits, about a people, on a vocabulary card.
`check-coarse.js` has no word in it to match. Replaced.

### Six English translations that dropped the word the card is about

接触's *It's a whole new ball game for me*; 接近's *Keep away from me*, which **reverses the verb** — a
reader meeting it maps 接近 onto the opposite of what it means; 脚步's *my feet stopped*, which is 脚 and
not 脚步; 教材's *buy a book* for 买本教材; 结论's *this is a true story* for 那个传言是真的, a rumour; and
交换's *I'd like to teach you Chinese in exchange for your teaching me another language*, which is a whole
clause the Chinese has not got.

### Nine near-repeats, one of them three sentences deep

**浇 watered a plant three times over** — 浇植物, 浇花, 浇水 — which is the deepest one of these the audit
has met. 讲话 had 跟 somebody 讲话 twice; 讲究 had one person's dress affirmed and another's negated;
降水 compared rainfall with last year twice; 交往 had *We've been going out three months* and *I've been
going out with her for months*; 节省 saved the same time twice; and 角度's three sentences were all the
*point of view* sense, so the geometric sense its gloss gives first was shown nowhere.

### Four headwords swallowed by a longer word

阶段性 on 阶段, 非结构性 on 结构, 完结 on 结, and 比较 on 较 — the last skipped by
`check-example-fit.js` for being one character, the first two invisible because the derived form is a
word in its own right.

### Four single-character cards gained a `Compounds` section

浇, 较, 结 and 紧, every row's reading and gloss checked against CC-CEDICT first; 浇 took three rows
and the rest four.

### What was read and left

**Four cards were read and left untouched**: 讲述, 接待, 结合 and 紧急.

**接待 was the close call.** Its second sentence — 这次，虽然我的阅历更多但是没有人等着接待我 — is long and
reads like half of a paragraph, but it is grammatical, it uses the word in the sense the gloss gives,
and its English is accurate. Left. **结论's 得出这个结论 and 我们的结论就是 are close** and were left too:
one is a question about how a conclusion was reached and the other states one, which is two things a
reader needs.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 322 unchanged — so none of the five gloss rewrites made a new
collision; one-sided hints still 0; pinyin clean; example-fit 141 and senses 151 unchanged; british 0;
34,596 blocks with spoken == visible on every one; **sense-tagged 696 → 699**, the three being 讲话's;
`build-lang-decks.js` re-run.

## Batch 94 — hsk30l5 notes 601–630 (紧密 → 巨大)

Thirty consecutive notes of HSK Level 5 in deck order. **Twenty-one cards changed**, nine read and left.

### A fourth card with two readings under one pinyin

**精神 was written jīng shen throughout — ㄥㄧㄥ ㄕㄣ˙ — and its own three sentences use both readings.**
CC-CEDICT files two entries: **jīngshén** *spirit; mind; ethos* and **jīngshen** *vigour; vitality*. 他精神很好
and 今天我没有精神 are the neutral tone; 体育精神 is the second. So a reader pressing the speaker heard one
reading and then read a sentence using the other, with nothing on the card saying so.

**No checker here can see it, and it is worth being exact about why.** `check-pinyin.js` compares a
card's pinyin against its own bopomofo — and both fields said ㄕㄣ˙, so the two agreed on the same wrong
answer and the check passed. `check-say-reading.js` asks only about SINGLE-character cards. This is the
fourth such card the audit has found (after 重, 花 and the batch-31 pair) and the same repair: both
readings written out, the senses split under them, each sentence tagged. The card now joins the 70
readings `check-pinyin.js` skips for having two.

### Two example sentences that are not examples

**紧密's first sentence ran to 55 characters** — a paragraph about which animals people first worshipped,
with the headword in the middle of it. **近年来's ran to about 90**, three sentences of newspaper prose
about an affable man visiting friends at a seaside resort *associated with gay chic*, with the headword
at the very end.

**This is a length fault before it is anything else, and the audit has not had a rule for it.** A card
shows three examples in a box a few lines deep; at fifty characters and more the reader is doing reading
comprehension rather than meeting a word, and at ninety the word is furniture in somebody else's
paragraph. The harvest this audit runs caps a sentence at 36 characters. **Generator sentences were never
capped at all**, and these are the two worst in the range. Both replaced.

### A card teaching a non-word, and a card teaching the wrong reading of its own character

**据's first sentence was 这是个据药。** There is no such word as 据药, and its English — *This medicine has
a strong effect* — belongs to some other sentence altogether. **And its third was 手头十分拮据**, which is
worse than a swallowed headword: 拮据 is read **jié JŪ**, so the card showed its character in a reading it
does not teach. Only one of the three used 据 as the preposition the card is about.

### Six glosses and labels that answered a different question

**进步 is labelled *verb / adjective*** and two of its sentences are the noun; the adjective the label
claims is the ideological sense (进步青年), which the card neither glosses nor shows, so the label was
claiming a part of speech with nothing behind it at all. **进口 is labelled a verb and glossed two nouns.**
**距 is labelled a verb and glossed two nouns** — it is the verb *to be so far from*, which is what all
three of its sentences are. **惊喜 is labelled an adjective** and its own first sentence is the noun.
**近期 was glossed *near in time***, CC-CEDICT's opening phrase and not an English anyone uses alone,
over sentences spanning the near future, *soon* and *lately*.

**And 橘子 contradicts itself**: the gloss is *tangerine* and all three English translations say
*oranges*, so the reverse card asks for a word the card's own sentences never use.

### Eight near-repeats

谨慎 handled two things carefully with the same verb; 近代 studied modern history twice; 近日 had the
temperature falling twice; 救护车 asked for an ambulance in two persons; 惊喜 exclaimed *what a nice
surprise* as a statement and then as a question; and **距's two were the same sentence with the buildings
changed and the same distance in both** — 学校距我家只有两公里 and 车站距这里两公里. Four of the eight were
added by earlier batches of this audit.

### A remark about how the waitresses look, and a calque

**酒吧's 这个酒吧的女服务员很漂亮** is a comment on the appearance of the women working there, and its
English says *pub* where the card's gloss and its other two sentences say *bar* — two English words for
one Chinese one. `check-coarse.js` has no word in it to match. **剧场's 昨晚他希望他去了剧场** is
*He wishes he had gone to the theatre last night* put through word by word; Chinese has no counterfactual
of that shape, and 他希望他 repeats the subject besides. **进一步's 你会发现它用几页纸进一步作了说明**
uses 用几页纸 as an instrument of 说明, which is not a construction Chinese has.

### Four single-character cards gained a `Compounds` section

静, 救, 据 and 距, every row checked against CC-CEDICT first. **静's three sentences were read and are
sound** — all three are the adjective the gloss leads on — so that card needed nothing but its panel,
which is worth recording: a single-character card is not automatically a card with something wrong on it.

### What was read and left, and two checker findings that are not findings

**Nine cards were read and left untouched**: 尽力, 经典, 精力, 经营, 久远, 居民, 居住, 具备 and 巨大.
具备's three are a question about prerequisites, an aphorism and a line from a spy drama, which is an odd
set and a correct one — all three use the word in the sense the gloss gives.

**`check-example-fit.js` reports 紧密's 各部门要紧密配合 as split between 要紧 and 密, and that is a
false positive**: the sentence is 要 + 紧密配合, and the greedy segmenter prefers 要紧 because 要紧 is a
headword in the corpus. **`check-gloss-source.js` reports 剧场 for sharing no content word with the
dictionary, which is *theatre* against *theater*** — the checker has no spelling table, and the deck is
authored British.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 322 unchanged — so none of the six gloss rewrites made a new
collision; one-sided hints still 0; pinyin clean, with the cross-checked count 11,463 → 11,462 and the
skipped 69 → 70, which is 精神 joining the two-reading cards; example-fit 141 and senses 151 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; **sense-tagged 699 → 705**, the six being
进步's and 精神's; `build-lang-decks.js` re-run.

## Batch 95 — hsk30l5 notes 631–660 (据说 → 空间)

Thirty consecutive notes of HSK Level 5 in deck order. **Twenty cards changed** in Level 5 and **one in
Levels 7–9**, which is the batch's real finding: a retired disambiguator that the applier could not take
off its card.

### `hints` is called authoritative and was not

**靠's gloss was *lean on* and NOT ONE of its three sentences is leaning** — 全都靠它了, 靠什么维持生活
and 靠不住 are all *to rely on*, which CC-CEDICT gives and the card did not. Rewriting the gloss retires
a disambiguator: 靠 and 拄 each carried a `not` hint because both glossed *lean on*, and with the new
gloss the collision is gone.

**Taking the pair out of `hints` removed 靠's block and left 拄's standing.** The record was then
claiming a hint the deck no longer had — and `--check` passed, because the applier REPLACED a leading
`not X` block rather than removing one, so a note dropped from the map simply kept what it had. **That is
the exact drift the file exists to prevent**, in the one field its own header calls the complete list,
and it sat one function away from the two strips written for added examples and sense tags and justified
in those same words.

**It went unnoticed because of how the seventeen dead hints of batch 27 were retired.** Every one of them
was retired by a note that ALSO took a new gloss in the same batch — and a `senses` rewrite replaces
`English` whole, which takes the block with it as a side effect. 拄 is the first note in this whole audit
to lose its PARTNER's gloss without changing its own, so it is the first case the side effect could not
cover.

**The fix is a blanket strip before the re-add, and it is safe because the map is the complete list —
measured rather than assumed.** Of the 641 hint blocks the nine decks carried, 640 were named by `hints`
and the one that was not is 拄: the generator's own pairs sit in the map beside the ones this record
added. **The change was proved inert on the other eight decks byte for byte** — re-running writes exactly
one changed note outside Level 5, 拄's.

### Four near-identical pairs, two of them this audit's own

**科研's 他在大学从事科研工作 and 他从事科研工作 are the same sentence with the location taken off** — the
plainest near-repeat the audit has met, and both were added by an earlier batch of it. **开展's
学校开展了一次活动 and 学校开展了读书活动 differ by one word**, also both added here. 可靠 had the same
people unreliable twice; 克服 had 克服困难 twice in three slots; 捐 donated blood twice; 开幕 opened the
same Olympics twice; 开幕式 held the same ceremony twice, once by 举办 and once by 举行.

**And 看望 was three deep**: all three sentences were somebody going to see somebody.

### Taiwan Mandarin, in a sentence about slides

**客户's 慧如那个简报档还没传喔？客户在催。** is Taiwan usage through and through: 简报 for a slide
deck (the mainland sense of 简报 is a bulletin or a brief report), 档 for a computer file where the
mainland writes 文件, and the sentence-final 喔. **The third regional-vocabulary finding in five
batches** — after 硬体/软体 and 结他 — and invisible for the same reason each time: these are different
WORDS, so no variant sweep and no pinyin check can reach them.

### A truncated gloss, and three more labels that named the wrong part of speech

**开放's gloss read *lift a restriction; open up (to the outside world/*** — the bracket never closes and
the phrase stops mid-word. It is the sixth truncated gloss this audit has found. **科研 is labelled a
VERB** and is a noun. **客服 is labelled an ADJECTIVE** and is a noun. **可见 put a CONJUNCTION label over
*it is thus clear that; visible; visual*** — two words' worth of sense under one part of speech, with the
card's own sentences using both.

### A measure word counting the wrong thing

**颗's first sentence was 你有两颗球。** 颗 does not count balls — 个 does — and the English it carried,
*You have two balls*, is not a sentence to put in front of a reader. `check-coarse.js` has no word in it
to match. Replaced with stars, which is one of the things CC-CEDICT says 颗 counts.

### Two more sentences that are not sentences

**看作's third ran to 50 characters and has no grammatical reading** —
他的教导都包含在道教者看作关于宗教最后的权威的道德经那本深刻的书 piles modifier inside modifier and
never resolves. It was added by an earlier batch of this audit. **靠近's 无法靠近敌人 carries no terminal
punctuation**, repeats the card's own first sentence, and is 接近's 我们无法接近敌人 with one character
changed, forty cards earlier in this same deck. **开业's 开业庆典酬宾 is shop signage**, four characters with
no predicate.

### A mistake this batch made, and the check that caught it

**Two `ex` arrays were OVERWRITTEN rather than appended to**, because the helper that merges a new entry
into an existing one assigns whole keys — so 开幕 and 开业 lost rows added by earlier batches and came out
at two examples and one. **`check-mandarin-coverage.js` caught it in its first line**: 11,530 notes at
three sentences against 11,532, and the block count 34,596 → 34,593. Both restored, and the count is back
at 11,532. **It is recorded because the shape will recur**: a record entry that already exists has to be
read before it is merged into, and the count is what says whether it was.

### What was read and left

**Ten cards were read and left untouched**: 具有, 绝对, 决赛, 角色, 开发, 开水, 开通, 可怕, 客观 and
空间.

**角色 was the judgement call.** Its third sentence is 女性永远只能扮演次要角色吗？ — *Must the woman
always play the secondary role?* — which is a sentence about women on a vocabulary card. It is left,
because it is INTERROGATIVE and challenges the assumption rather than asserting it, which is the
opposite of batch 90's 矮 and 教养. Recorded so the next reader knows it was read rather than missed.

**空间's 空间科学还在起步阶段 is also 阶段's second sentence**, seventy-three cards earlier, and is left
on both: it is a good sentence for each headword and the two are far enough apart that no reader meets
them together. **决赛's 四分之一决赛 and 半决赛 look like swallowed headwords and are not** — they are the
quarter-final and the semi-final, which is a reader's next question about the word.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; **shared-gloss groups 322 → 321 and hint-carrying groups 321 → 320**, which is the
靠/拄 pair separating; one-sided hints still 0; pinyin clean; example-fit 141 and senses 151 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; **sense-tagged 705 → 708**, the three being
可见's; hints 663 → 661; `build-lang-decks.js` re-run. **No changelog line and no version bump for the
applier change**: `.claude/decks/mandarin-fix.js` is not part of the site.

## Batch 96 — hsk30l5 notes 661–690 (空中 → 理论)

Thirty consecutive notes of HSK Level 5 in deck order. **Seventeen cards changed**, thirteen read and
left.

### A fix this audit applied to one card and not to the other card carrying the same sentence

**类's third sentence was 我没接触过这个球类游戏, which is 接触's own first sentence**, ninety-seven cards
earlier in this same deck. Batch 93 rewrote the English on 接触 — *It's a whole new ball game for me*
became *I have never come across this ball game before* — **and left this card's copy saying the old
thing**, so the two now carried one Chinese sentence under two different translations.

**An `exEn` row is keyed to one note, and a sentence standing on two notes takes the fix on one of
them.** Nothing reports it: the coverage checker's duplicate test is per CARD, `--check` compares the
deck against the record and both cards match their own entries, and the two sentences are on cards a
hundred apart so no reader meets them together. The rule to carry forward is **grep the corpus for a
sentence before writing an `exEn` for it**. Replaced here with an authored sentence, which settles it
for good.

### Two cards whose pinyin disagreed with their own bopomofo

**口袋 read kǒu dai** and its own bopomofo reads ㄈㄞˇ ㄉㄞˋ; **老婆 read lǎo po** against ㄌㄠˇ ㄆㄛˊ.
CC-CEDICT gives kou3 **dai4** and lao3 **po2**.

**This is deliberately NOT the blanket tone sweep this audit has refused.** That sweep returns 231
disagreements over the corpus of which almost none are errors — about 123 are 不/一 sandhi and about 100
are mainland-against-Taiwan neutral-tone variance — and `check-pinyin.js` is right to compare syllable
BOUNDARIES and nothing else. What these two are is **one card each with two witnesses against the
pinyin**: its own bopomofo and the dictionary, agreeing with each other. Corrected on that ground and on
no wider one; the other twelve cards in this range whose readings carry a neutral tone were checked
against both witnesses and agree.

### A card whose character appeared three times and was a word none of them

**库's sentences were 军火库, 库德语 and 库米.** The first is a compound; the second is a
TRANSLITERATION of *Kurdish*, and the Taiwan form of it besides (the mainland writes 库尔德语); the third
is a woman called Kumi. So two of the three used the character for its SOUND alone — **batch 89's 哈
finding exactly**, where the three sentences were Harbin, Karakorum and a yawn — and
`check-example-fit.js` skips a one-character headword by design.

### Taiwan vocabulary again, and this time the dictionary says so

**梨's third sentence was 我喜欢吃加酰梨的素食汉堡**, and 酰梨 is an AVOCADO — **CC-CEDICT marks it
`(Tw)`**, the mainland word being 牛油果. So the card's character stood inside a Taiwan word for a
different fruit. It is the fourth regional-vocabulary finding in six batches, after 硬体/软体, 结他 and
简报档, and **the first one the dictionary itself flags**, which is worth knowing: the `(Tw)` marker is
greppable, where the other three were not.

### An explicit sentence and a demeaning one, on one card, invisible to every list

**老公's second and third sentences were 老公性无能，我该怎么办？ and 我老公没用。** — *What should I do
if my husband is impotent?* and *My husband is useless*. **`check-coarse.js` reports neither**, asked on
all six of its lists: 性无能 is in none of them and *useless* is not a coarse word. This is the class its
own header names and batch 90's 黄瓜 met from another direction — content that a word list cannot reach
because nothing in it is a word.

### Four glosses and labels answering a different question

**离职 was glossed *to leave one's job temporarily (e.g. for study)*** — CC-CEDICT's first sense — and
all three of its sentences are leaving for good, which the dictionary gives second. **亏 is labelled a
VERB and its gloss opens on two nouns**, and its three sentences are three different senses of which the
gloss named one. **宽 glosses one word, *wide*, under a *noun / verb / adjective* label**, and its second
sentence is 宽 meaning LENIENT. **口味's English was *My taste has got heavier***, the Chinese put through
word by word.

### Eight near-repeats

宽度 asked the width of a road and then answered it; 老板 had two people looking for the boss; 类似 had
*yours is similar to mine* and *mine is similar to yours*; 泪水 had tears in two people's eyes, with a
third pair of eyes on 泪, the card immediately before it; 厘米 had the same THREE CENTIMETRES once
shorter and once taller; and 离职 had two people leaving a job in the same month. Four of the eight were
added by earlier batches of this audit.

### A mistake this batch made, and the report line that caught it

**A `dropEx` row was written through a wrong Unicode escape** — `\u9170` is 酰 and 酰梨's first character
is 酪 — so the row named 酰梨, which is in no sentence, and the avocado stayed on the card while the
replacement was pushed past the three-example cap. **The applier's own `badDrop` line reported it**
(`hsk30l5/梨 → 酰梨`), which is what that line is for: a drop the record claims and never made. It is
recorded because the shape will recur — **write the Chinese literally rather than as escapes**, and read
the drop report after a run.

### Three single-character cards gained a `Compounds` section — and one deliberately did not

库, 宽, 亏, 泪 and 类 took one (five, not three), every row checked against CC-CEDICT first. **梨 did
not**, for 捡's reason two batches back: the dictionary's 梨 words are 梨子, 鸭梨 and a run of botanical
and loanword entries — 士多啡梨 is a Hong Kong strawberry — so there is no set of three ordinary words
to give. **泪's own three sentences were read and are sound**, so that card needed nothing but its panel.

### What was read and left, and two checker findings that are not findings

**Thirteen cards were read and left untouched**: 空中, 控制, 昆虫, 来源, 劳动, 老百姓, 姥姥, 姥爷, 乐观,
乐趣, 类型, 离婚 and 理论.

**老百姓 was the judgement call.** Its second sentence is 自古至今，容忍的总是老百姓，被容忍的总是统治者
— an epigram about rulers and the ruled. It is left: it is a general historical observation rather than a
slogan for any state, which is the distinction batch 90 drew, and the word it teaches is exactly the one
such a sentence is about.

**`check-example-fit.js` reports two sentences in this range and both are false positives**: 口袋's
他把手插进口袋里 is 插进 + 口袋 and the greedy segmenter prefers 进口, and 类型's 你想看哪种类型的电影？
is 哪种 + 类型 where it prefers 种类. Both sentences are sound.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 321 unchanged — so none of the four gloss rewrites made a new
collision; one-sided hints still 0; pinyin clean; example-fit 141 and senses 151 unchanged; british 0;
34,596 blocks with spoken == visible on every one; **sense-tagged 708 → 714**, the six being 宽's and
亏's; `build-lang-decks.js` re-run.

## Batch 97 — hsk30l5 notes 691–720 (里头 → 流传)

Thirty consecutive notes of HSK Level 5 in deck order. **Eighteen cards changed** in Level 5 and **one in
Levels 7–9**, the second dead disambiguator this audit has retired since the applier learned to strip a
hint block.

### Three cards glossing the one sense none of their sentences shows

**令 is glossed *to command, to order* and not one of its sentences is an order**: 令人难过, 令您快乐 and
你会令她害羞 are all 令 meaning *to cause* or *to make somebody feel*, which CC-CEDICT gives and the
card did not. **脸色 is glossed *complexion* alone** and its first sentence is 他看到我脸色变了 — an
EXPRESSION changing, which a complexion does not do. **连续 is labelled a VERB and glossed *continuous*,
an adjective**, over two sentences that are adverbial.

**And 力 is the same shape with the card half right.** Its gloss leads on the NOUN and its label reads
*noun / suffix*; 强力推荐 and 他很有说服力 are the suffix, so those two are sound, and the third was
亲力亲为, a set phrase whose English (*She wants to do it on her own*) says nothing about force. So the
card claimed two things and showed one of them twice.

### A second dead disambiguator, and the applier now takes it off

**连续 and 连绵 each carried a `not` hint** because both glossed the bare word *continuous* — 连绵's with
a capital C, which is why the shared-gloss count never saw them as one group. Splitting 连续's senses
retires the pair, and this time **removing both from `hints` actually removed both blocks**, because
batch 95 taught the applier to strip one. Hint blocks 640 → 638; the record and the decks agree, with
nothing left carrying a hint the record does not name.

### A fourth card whose pinyin disagreed with its own bopomofo

**力量 read lì liàng** against its own ㄌㄧˋ ㄌㄧㄤ˙ and CC-CEDICT's li4 liang5. The third such
correction in two batches, on the same narrow ground as 口袋 and 老婆: **two witnesses against the
pinyin, its own bopomofo and the dictionary**, never the blanket tone sweep this audit measured and
refused.

### Regional vocabulary, a political slogan, and a claim the deck has no business making

**领先's 这款笔记型电脑 uses the Taiwan word for a laptop** — the mainland writes 笔记本电脑 — which is
the fifth regional-vocabulary finding in seven batches. Its third sentence was 台湾是高科技领先国, which
turns on 领先国, not a word, over a claim about a place a vocabulary card has no reason to be making.
**联合's third was 全世界无产者，联合起来！** — the Manifesto, and a repeat of 联合起来 from the card's own
first sentence, so one collocation twice and one of the two a slogan.

### Four sentences with errors in them, and one that only wanted a full stop

**流传's 玲奶奶死的不瞑目。流传说那栋房子至今未人敢入住。 carries four errors in two clauses** — 死的 for
死得, 流传说 for a word that does not exist, 未人敢 for 没人敢, and two sentences in one example block —
and was added by an earlier batch of this audit. **利益's 商人们只看中利益 writes 看中**, *to take a fancy
to*, where 看重, *to value*, is meant; the two are homophones with separate CC-CEDICT entries, which is
what makes the slip invisible to every check here.

**连接's 海洋不是将世界分隔开来，而是将世界连接起来 carried no terminal punctuation** and is otherwise a
good sentence, so it took a full stop through `exStop` rather than a replacement — which is exactly the
case that field exists for. Its third sentence, two questions in one block with 相连接 doubling the verb,
**was a reported `check-example-fit.js` finding** (split between 相连 and 接) and is the one the count
141 → 140 records.

### A card whose three sentences all opened on the same word

**利益's three all began 只** — 他只顾自己的利益, 国家之间没有朋友，只有利益, 商人们只看中利益 — so the
card taught one rhetorical shape three times and 利益 as something only ever grabbed. The third is
replaced by a sentence in which it is served.

### Five English translations that dropped the word the card is about

立即's two, which turned *at once* into *quickly* and into *soon*; 了不起's *He is very much a scholar*,
which contains nothing of *remarkable*; 里头's *None of this makes any sense*, which leaves out the one
word the sentence is on the card for; and 利用's *long weekend*, which is 长周末 — 大周末 means in the
middle of the weekend.

### Two single-character cards gained a `Compounds` section, and two more besides

力, 铃, 领 and 令 took one, every row checked against CC-CEDICT first. **铃's own three sentences were
read and are sound** — 铃响, 按铃 and the proverb 解铃还须系铃人 — so that card needed nothing but its
panel. **领's COLLAR sense is glossed and deliberately not illustrated**, the same call 架 took in batch
92: 领 alone as a collar is written Chinese, and every everyday sentence for it is 领子 or 衣领, which
would swallow the headword again.

### What was read and left

**Twelve cards were read and left untouched**: 理由, 立刻, 连忙, 恋爱, 良好, 粮食, 列车, 临时, 领带,
领导, 领取 and 领域.

**临时 was the close call.** Its first sentence is the chengyu 临时抱佛脚 with an English — *I'm making a
last minute effort* — that supplies a first-person subject the Chinese has not got. It is left: the idiom
is one a Level 5 reader meets, 临时 in it means exactly what the card glosses, and an English that
paraphrases an idiom is not the same fault as one that drops the headword.

**良好's 现在正缺良好的建筑木材 is also 建筑's third sentence**, 137 cards earlier, and is left on both: it
is a good sentence for each headword and the two are far enough apart that no reader meets them
together. Recorded so it is not re-found as a fault.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; **shared-gloss groups 321 → 320 and hint blocks 640 → 638**, which is the 连续/连绵
pair separating; one-sided hints still 0 and no card carries a hint the record does not name; pinyin
clean; **example-fit 141 → 140**, the one cleared being 连接's 相连接; senses 151 unchanged; british 0;
34,596 blocks with spoken == visible on every one; sense-tagged 714 unchanged; `build-lang-decks.js`
re-run.

## Batch 98 — hsk30l5 notes 721–750 (流感 → 迷)

Thirty consecutive notes of HSK Level 5 in deck order. **Twenty-eight cards changed**, two read and left
— the highest count of the audit, and the batch also found a field the record had no way to write.

### A wrong traditional character, in a field the record could not reach

**录's Traditional field read 彔.** CC-CEDICT glosses 彔 *to carve wood*; the traditional form of 录 in the
sense this card teaches — to record — is **錄**, a separate dictionary entry. So the card offered a
traditional-script reader a different word.

**Correcting it did nothing, silently.** The applier writes a record entry's fields through a WHITELIST,
and `Traditional` was not on it: the entry applied cleanly, wrote nothing, and `--check` passed, because
`--check` re-applies and compares and the field was never touched on either run. **The record is the one
way these decks may be edited, so a field it cannot reach is a field that can never be corrected at
all** — and a key it drops without a word is worse, because the record then claims an edit the deck has
not got.

**Two changes to `mandarin-fix.js`, both small.** `Traditional` joins the whitelist — `Simplified`
deliberately does not, being the key an entry is looked up by, so writing it would rename a note out from
under its own record — and **an unhandled key is now REPORTED**, which is what would have caught this in
the first second rather than the tenth minute. The change is proved inert: re-running writes exactly the
one changed note and the other eight decks come back byte-identical.

**And the class was then measured over the whole corpus.** Of **6,691 notes carrying a Traditional field
that differs from the simplified**, only **six** are not a CC-CEDICT traditional/simplified pair, and
three of those are right: 系 and 蒙 carry two readings and therefore two traditionals separated by a
slash, and 事迹's 事跡 uses 跡, which the dictionary holds as a bound form of 迹. **Three are open work
and all sit outside this batch's range**: `hsk30l2/裤子` carries 裤子 where the traditional is 褲子,
`hsk30l5/面向` carries 面單 where 向 does not change in traditional script at all, and `hsk30l6/野`
carries 壄, an ancient variant, where 野 is its own traditional. Recorded rather than swept, this batch
being full.

### A sentence dropped from one card and left standing on another — the mirror of last batch

**录's second sentence was 他录了一个纪录片给我**, which is **the sentence batch 91 dropped from 纪录片**
— dropped there for counting a film with 个 against that card's own measure word 部, and because one does
not 录 a documentary. It was left standing here.

Batch 96 found this from the other side: an `exEn` row fixed 接触 and left 类 saying the old thing. **Both
are one rule: `dropEx` and `exEn` are keyed to ONE note, and a sentence living on two notes takes the
edit on one of them.** Grep the corpus for a sentence before dropping or re-translating it.

### The applier refusing a separable verb, and being right to

The first replacement written for 录音 was 讲座全程都录了音 — the separable form — and **the applier
refused the batch**: an example must contain its headword as a contiguous string, because the block bolds
the headword and a split verb cannot be bolded. The guard is right; the sentence was rewritten to
我们给这首歌录音 rather than the guard widened.

### A fifth card whose pinyin disagreed with its own bopomofo — and a sixth going the other way

**逻辑 read luó jí** against its own ㄌㄨㄛˊ ㄐㄧ˙ and CC-CEDICT's luo2 ji5: the pinyin is the outlier,
as on 口袋, 老婆 and 力量.

**买卖 is the same shape reversed and is the interesting one.** CC-CEDICT holds TWO entries — mǎi mài *to
buy and sell* and mǎi mai *a transaction; a shop* — and the card's pinyin read the neutral tone while its
bopomofo read ㄇㄞˋ. Its own three sentences settle it: 做买卖, 小买卖 and 这笔买卖 are all the NOUN, so
the neutral reading is the card's and **the BOPOMOFO is what is corrected**. Which is the point of reading
the sentences rather than trusting whichever field one happens to look at first.

### Eight glosses and labels answering a different question

**陆地 was glossed *dry land; terrace***, and a 陆地 is not a terrace and never was. **玫瑰 was glossed
*rugosa rose (shrub) (Rosa rugosa)***, CC-CEDICT's botanical first sense, over three sentences that are
simply roses. **魅力 was glossed *enchantment***, a word about spells, over three that are charm and
charisma. **没法儿 was glossed the single capitalised word *Can't***, which is neither a definition nor a
part of speech. **路线 was glossed *itinerary*** over three route maps. **满足 is labelled a VERB and
glossed two adjectives**; **美味 is labelled a NOUN and glossed an adjective**; **门诊 is labelled a VERB
and glossed a noun phrase**. And **迷 is labelled a verb** while its own second sentence is the noun, a
fan.

### Nine near-repeats, one of them three sentences deep

**美味's three were all about CAKE.** 流感 had the same speaker with the same flu twice; 漏 had the same
roof leaking twice; 路人 had one person asking the way and another showing it; 路线 asked twice for a
route map; 录音 had the same tape recorder twice; 忙碌 had the same predicate in two persons; 玫瑰 had two
blue roses; 美术 went to the gallery twice. Four were added by earlier batches of this audit.

### A 41-character sentence, and four that are not Chinese

**陆续's first ran to 41 characters of games journalism** — the third length fault after 紧密 and 近年来
in batch 94. **毛病's 这个鼠标突然毛病了 makes a verb of a noun** and so has no predicate at all.
**录取's 我希望考试能录取 puts the candidate in the subject slot** of a verb that takes him as its object.
**矛盾's 他们有时候有矛盾冲突 carries no terminal punctuation** and says the same thing twice in 矛盾冲突.
**忙碌's 我有一个忙碌的生活 是 *I have a busy life* word for word.**

### Five English translations that dropped or replaced the word

媒体's *The media stuck a shiv into his reputation*, an American prison idiom for 抹黑; 论文's *essay*
where the card's own gloss and its other two sentences say *thesis*; 浏览's *visit art galleries* for a
word the card glosses as *browse*; 留言's *Leave a comment, OK?* for a sentence that ASKS — 可以留言吗？;
and 录取's *I hope to graduate at the exams*.

### Two single-character cards gained a `Compounds` section — and 人龙 was checked and kept

龙, 漏, 录, 骂 and 迷 took one. **骂's own three sentences were read and are sound**, the first being
妈妈骂马吗？, a deliberate tone drill. **龙's 买票的人龙竟然那么长 looked like a Hong Kong usage and
was kept**: CC-CEDICT gives 人龙 plainly as *a queue of people*, with no regional marker, so the sentence
stands. Its 龙猫说 did not — CC-CEDICT gives 龙猫 as *chinchilla* and *Totoro*, so the character stood
inside a cartoon name.

### What was read and left

**Two cards were read and left untouched**: 旅行社 and 毛笔. **旅行社's 旅行社的利润猛涨 is also 利润's
own first sentence**, thirty-six cards earlier — the closest such pair the audit has met, and left on
both: it is a good sentence for each headword, and re-writing one of them would be inventing a fault. It
is recorded so the next reader knows it was seen.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 320 unchanged — so none of the six gloss rewrites made a new
collision; one-sided hints still 0; pinyin clean; example-fit 140 and senses 151 unchanged; british 0;
34,596 blocks with spoken == visible on every one; **sense-tagged 714 → 723**, the nine being 满足's,
美味's and 迷's; `build-lang-decks.js` re-run. **No changelog line and no version bump for the applier
change**: `.claude/decks/mandarin-fix.js` is not part of the site.

## Batch 99 — hsk30l5 notes 751–780 (迷路 → 闹)

Thirty consecutive notes of HSK Level 5 in deck order. **Eighteen cards changed**, twelve read and left.

### A third sentence whose characters straddle a word boundary

**难得's third sentence was 如果你不会说英语，你就很难得到一个好的职位**, which does not contain the
word at all: it is 很难 + 得到, and the card's two characters straddle the boundary between them.

**The third instance of this class**, after 家电's 一家|电影院 and 加工's 加|工资 in batch 92, and
invisible for the same reason each time: the segmenter's lexicon holds 难得, so it lands squarely on the
headword when the headword is the card's own, and `check-example-fit.js` reports nothing. It was added by
an earlier batch of this audit — as both of the others were. **The harvest filter refuses a target
SWALLOWED by a longer headword and says nothing about one FORMED ACROSS two shorter ones**, which is now
three cards' worth of evidence that the guard is written one direction short.

### The second wrong traditional character, and this one was already on the list

**面向's Traditional field read 面單.** 向 does not change in traditional script at all — CC-CEDICT gives
面向 面向 as its own pair — so 單 is an over-conversion rather than a typo, 單 being a variant of 向 in
other senses.

It is one of the three the corpus sweep at the end of batch 98 turned up, and **the only one that fell
inside a batch range**, so it is fixed here on the schedule rather than out of turn. The other two are
still open and still recorded: `hsk30l2/裤子` carries 裤子 where the traditional is 褲子, and `hsk30l6/野`
carries 壄, an ancient variant, where 野 is its own traditional. The sweep now reads five outliers of
6,691, three of them legitimate.

### Four glosses and labels answering a different question

**敏感's gloss carried *tactful***, which the word does not mean — a tactful person is 得体 or 圆滑, and
CC-CEDICT gives only *sensitive; susceptible*. **名牌 was glossed *famous brand* alone**, where the
dictionary gives *nameplate; name tag* beside it and the card's own third sentence, 这是名牌大学, is
neither. **描述 is labelled a VERB** and its own first sentence is the noun. And 敏感 showed the physical
sense twice — heat and a tooth — and never the one a Level 5 reader most needs, a sensitive SUBJECT.

### Five mistranslations, two of them reversing the sentence

**闹's 他们一直闹笑话 was *They were always making jokes*** — and 闹笑话 is CC-CEDICT's *to make a fool
of oneself*, which is the opposite of telling a joke on purpose. **摸's 谁也不要摸这个 was *Nobody wants
to touch this***, where the Chinese is an INSTRUCTION — nobody is to touch it. **陌生's *I saw a strange
woman there*** reads in English as a woman who was odd, where 陌生 is unfamiliar and the card's own gloss
says so. **命's 恭敬不如从命 carried a literal gloss of an idiom** that means *then I shall take you up on
it*, over a sentence whose 从命 swallows the headword anyway.

### Five sentences that are not Chinese, and one that only wanted a full stop

**难以's 这件事很难以相信的 puts 很 in front of 难以**, which does not take a degree adverb, and closes on
a 的 the sentence has no use for. **模糊's 这句句子意思模糊 says *sentence* twice** — 这句 already counts
one. **明显's 事情如此明显所以我们不需要证明 is its English word for word** with no comma before 所以.
**木头's 一个木头碗 is a noun phrase with no predicate.** And **面积's 求三角形的面积 carried no terminal
punctuation** — it is otherwise a good example, a maths exercise being exactly where this word lives, so
it took a full stop through `exStop` rather than a replacement.

### An internet joke and a game, one replaced and one kept

**模式's 您现已切换至手动呼吸模式** — *you are now breathing manually* — is grammatical, teaches the
word, and spends a card's one clear slot on a gag a learner cannot place. Replaced.

**木头's 一二三，木头人 was KEPT.** It is a children's game; 木头人 does swallow the headword, and *Red
light, green light* is the right English for it rather than a translation — a reader who meets the game
will meet it in exactly those words. The distinction is worth stating: a swallowed headword is a fault
when the compound teaches nothing about the card, and not when the compound is the thing a reader will
actually hear.

### Five near-repeats

迷路 got lost three times over with nothing around it, twice in the second person; 密切 had a close
RELATIONSHIP twice, the second running to 28 characters; 面向 had the same room facing two ways; 名牌 had
the same sentiment in two persons; 敏感 was sensitive to temperature twice.

### Three single-character cards gained a `Compounds` section

命, 摸, 某 and 闹 took one. **某's has three rows rather than four** — it is a bound form and the
dictionary holds few words on it — and **its own three sentences were read and are sound**, 某个地方,
某些地方 and 某处 being the pronoun in the three shapes it takes.

### What was read and left

**Twelve cards were read and left untouched**: 秘密, 秘书, 面临, 名称, 名片, 明确, 明星, 命运, 目光,
哪怕, 难度 and 男子.

**难以's 你会发现难以满足她 is also 满足's own first sentence**, forty cards earlier and edited in batch 98
— checked here, and left on both, the sentence being right for each headword and its English identical on
the two. **Recorded because batches 96 and 98 both found the other outcome**, where a fix reached one card
of a pair and not the other: the rule is to grep before editing, and grepping also finds the pairs that
are fine.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 320 unchanged — so neither the 敏感 nor the 名牌 gloss rewrite made
a new collision; one-sided hints still 0; pinyin clean; example-fit 140 and senses 151 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; **sense-tagged 723 → 726**, the three being
描述's; **Traditional outliers 6 → 5**; `build-lang-decks.js` re-run.

## Batch 100 — hsk30l5 notes 781–810 (闹钟 → 碰)

Thirty consecutive notes of HSK Level 5 in deck order. **Seventeen cards changed**, thirteen read and
left. The hundredth batch, and two of its findings are shapes the audit has not met before.

### A gloss that belongs to a reading the card does not teach

**哦 was glossed *softly chant*.** CC-CEDICT holds three readings of the character: **é** *to chant*,
**ó** *oh (doubt or surprise)* and **ò** *oh (on learning something)*. The card's pinyin is **ò** and all
three of its sentences are that or the softening sentence-final particle — so a reader met the right
character, the right reading, and a definition from a reading the card never mentions.

**No checker here can see it, and the reason is worth stating.** `check-pinyin.js` compares pinyin
against bopomofo and both say ㄛˋ, so they agree. `check-gloss-source.js` compares the card's gloss
against the dictionary entry for the WORD — and the dictionary entry holds all three readings' senses at
once, so *chant* is in it and the gloss matches. **A polyphone's dictionary entry launders a gloss taken
from the wrong reading.** This is the first time the audit has found one, and the shape to watch for is a
single-character card with several readings where only one is taught.

### A card all three of whose sentences were loanwords

**派 is glossed *to send; to dispatch; faction*, and its three sentences were 在派对上见, 谁想来一块派 and
母亲经常为我们做苹果派.** 派对 is a transliteration of *party*; the other two are 派 borrowed for *pie*,
which CC-CEDICT does list and which has nothing to do with any sense the gloss gives. So the card glossed
three senses and illustrated a fourth, three times over — the 库 finding of batch 96 (Kurdish and Kumi)
with the character used for its sound in a different direction, for a borrowing rather than a name. All
three replaced, one sentence for each sense the gloss names.

### A fourth straddled word boundary — and the first that is the generator's own

**能干's 我们谁也能干 does not contain the word**: it is 谁也能 + 干, *anyone can DO it*, and the card's
two characters straddle the boundary between them. After 家电's 一家|电影院, 加工's 加|工资 and 难得's
很难|得到 this is the fourth — and **the first that is the GENERATOR's own rather than a harvest of this
audit's**, which is worth recording: the class is not something this audit introduced, only something it
has added to three times.

### Four glosses answering a different question

**碰 was glossed *to meet with* alone** and two of its three sentences are *to touch*, with only 碰头 the
meeting — so the gloss named the sense shown once and left out the one shown twice. **排列 was glossed the
single word *array***, a noun and a computing term, where the word is a verb and CC-CEDICT gives *to
arrange in order*. **女子's gloss names the SPORTING sense in its own parenthesis** and no sentence
showed it. And **女子's first English said *girl*** where the gloss itself says the word is the formal one
for a grown woman.

### Eight near-repeats

浓 had strong coffee twice; 女子 the same girls' school twice; 排列 alphabetical order twice; 盆 the same
flowerpot twice — and with 锅碗瓢盆 in the third slot never showed 盆 standing alone at all; 配合 had
配合得很好 twice with the subject changed; 派出所 had the same man walking into the same station on two
errands; 年夜饭 had dumplings at the New Year table twice; 闹钟 had the two halves of one transaction.
Three of the eight were added by earlier batches of this audit.

### A 45-character sentence, and three that are not sentences

**培训's first ran to 45 characters** about Algeria's public-sector employees, with the headword
three-quarters of the way through — the fourth length fault after 紧密, 近年来 and 陆续. **培养's
子女培养全社会都很关心，教育要进行改革 is two unrelated sentences joined by a comma**, which its own
English admits by giving them as two. **年夜饭's 说明年夜饭的饺子… opens on 说明**, a clause lifted out of a
longer text. **闹钟's 第一项东西 counts a thing with 项**, which counts items on an agenda, where 件 is the
word.

### The overwrite mistake again, five batches after it was written up as one that would recur

**排列's `ex` array was overwritten rather than appended to**, exactly as 开幕's and 开业's were in batch
95 and for exactly the reason recorded there: the helper that merges a new entry into an existing one
assigns whole keys. **`check-mandarin-coverage.js` caught it in its first line again** — 11,531 notes at
three sentences against 11,532. Restored. Batch 95 wrote *the shape will recur*; it recurred, and the
count is what said so both times.

### One thing recorded rather than changed

**念's Measure word field says 顿**, which counts meals and scoldings and is not a classifier 念 takes.
It is LEFT ALONE, because the class is corpus-wide and mostly right: **63 verb-only notes carry a measure
word**, and 复习一次, 咳嗽一阵 and 旅行一趟 are all correct verbal classifiers. So this is one doubtful row
inside a real convention rather than a fault to pick off, and settling it needs a source this audit has
not got. The question is recorded so the next reader does not have to re-find it.

### Six single-character cards gained a `Compounds` section

念, 浓, 派, 赔, 配, 盆 and 碰 took one, every row checked against CC-CEDICT first. **念, 赔 and 配
needed nothing else** — their sentences were read and are sound, which is worth saying as often as the
faults are: a single-character card is not automatically a card with something wrong on it.

### What was read and left

**Thirteen cards were read and left untouched**: 内部, 年初, 年代, 年纪, 牛仔裤, 农民, 农业, 欧洲, 偶然,
拍摄, 跑道, 陪伴 and 配送.

**年代's 这些废墟年代久远 is also 久远's own first sentence**, 167 cards earlier — checked and left on
both, the sentence being right for each headword and far enough apart that no reader meets them
together. **年初 was the close call**: 这项工作年初就开始了 and 计划是年初定的 are both something set going
at the start of the year, but the verbs and the subjects differ and the middle sentence is a job change,
so the card teaches three things rather than one.

**Checks after the batch.** `--check` clean; coverage 11,532 at three sentences, repeats 0,
still-ambiguous 1; shared-gloss groups 320 unchanged — so neither the 哦, 排列 nor 碰 gloss rewrite made a
new collision; one-sided hints still 0; pinyin clean; example-fit 140 and senses 151 unchanged;
british 0; 34,596 blocks with spoken == visible on every one; sense-tagged 726 unchanged;
`build-lang-decks.js` re-run.

## Batch 101 — `check-polyreading.js`, and its whole finding list

Not a run of notes in deck order but **a new checker and everything it found** — which is the other shape
a batch may take, and the right one here, because batch 100's 哦 turned out to be one of a class.
**Nine cards changed**, across four decks.

### What 哦 turned out to be

哦 was glossed *softly chant*, which is CC-CEDICT's sense for the **é** reading, where the card teaches
**ò** and all three of its sentences are *oh*. **The question that makes it a class is: how many other
single-character cards gloss a reading they do not teach?**

### Why nothing here could see it

- **`check-pinyin.js`** compares a card's pinyin against its own bopomofo. On every one of these they
  AGREE, and they are both right — the reading is not what is wrong.
- **`check-say-reading.js`** asks which reading a speech engine will GUESS for the headword, measured
  against how the corpus uses that character. That is a question about the corpus, not about the gloss.
- **`check-gloss-source.js`** compares the gloss against CC-CEDICT's entry — for the WORD. **And a
  polyphone's entry holds every reading's senses at once**, so *chant* is in 哦's entry, *filter* is in
  淋's and *swift current* is in 溜's, and every one of these glosses MATCHES. **A polyphone's dictionary
  entry launders a gloss taken from the wrong reading**, which is the sentence this batch is for.

### The checker

`node .claude/decks/check-polyreading.js [--deck=] [--all]`. For every single-character note whose pinyin
names ONE reading, of a character the dictionary gives two or more: does the gloss share a content word
with the senses of the reading the card TEACHES? A card that shares none, and shares one with another
reading's, is reported. **Report-only, exit 0**, and a proxy — a correct gloss may paraphrase in words
the dictionary does not use.

**The part of speech is stripped before the compare, and that was not an optimisation.** Without it a
card glossed *interjection | hmm* matches any reading whose dictionary sense contains the word
*interjection*, which reported 嗯 and 唧 on the first run for nothing. With it the same run turned up
子, which the first had missed.

### The eight findings, and what each turned out to be

**The card's own SENTENCES decide which half is wrong**, which is why this cannot be a `--fix`.

**Five were the GLOSS, because every sentence used the reading the card names.** 子 is labelled a SUFFIX
with the neutral reading and was glossed *child, offspring, seed, small thing* — the third-tone zǐ noun
— over 车子, 鞋子 and 一大家子. **搞 was the cleanest**: glossed *bear; endure; stand*, which is gé,
where the card is gē and all three sentences are 搞糖, 搞到下周日, 少搞点儿糖. **溜 was the worst**:
glossed *swift current; turbulent flow; rainwater from the roof; plaster* — four liù senses, every one a
NOUN — on a card labelled a VERB, read liū, whose sentences are 溜冰, 溜走 and 溜狗. So it named a part
of speech it did not gloss and glossed a reading it did not teach, in one line. 淋 was glossed lìn's
*filter; strain* over three lín sentences, and 熬 glossed āo's *boil* while two of its three sentences
are áo's *endure* — 熬夜 twice — which the gloss never gave at all.

**Two were the CARD, because the sentences used both readings.** 揣 glossed chuǎi's *to guess* with
chuāi in the pinyin, and its sentences are two chuǎi and one chuāi; 豁 glossed *clear; exempt*, which
is huò, with huō in the pinyin, and its sentences are two huō and one huò. Both are given **both
readings** with each sentence tagged — the shape 系, 划 and 精神 already use.

**And one was both, plus something else.** 勒 glossed lè's *to rein in; to force* where the card is lēi
— and **two of its three sentences were TRANSLITERATED NAMES**, 法迪勒 for Fadil and 海伦凯勒 for Helen
Keller, so the character stood twice for its sound alone. That is batch 96's 库 (Kurdish and Kumi) and
batch 89's 哈 met a third time, and `check-example-fit.js` skips a one-character headword by design.
Only 勒紧裤带 used the word.

### One more found by reading rather than by the checker

**唐！我的电脑又当机了 uses 当机**, the TAIWAN word for a computer crashing — the mainland writes 死机,
and CC-CEDICT has no entry for 当机 at all, holding 宕机 and 死机. **The sixth regional-vocabulary
finding in ten batches.** Its gloss was also *oh; ah; well*, which is the āi reading's grunt of
agreement, where the card is ài and all three sentences are dismay. **`check-polyreading.js` does NOT
report 唐**, its gloss sharing no word with either reading — which is the proxy's honest limit and is
recorded rather than papered over.

### What was NOT done

**No `Compounds` panels.** This is a finding list rather than a run of notes in deck order, and the five
single-character cards it touches sit in four different decks; giving them panels would be starting a
different pass inside this one. Recorded so the next deck-order batch over Levels 6 and 7 knows to.

**Checks after the batch.** `check-polyreading.js` 8 → 0; `--check` clean; coverage 11,532 at three
sentences, repeats 0, still-ambiguous 1; shared-gloss groups 320 unchanged — so none of the six gloss
rewrites made a new collision; one-sided hints still 0; pinyin clean; example-fit 140 and senses 151
unchanged; british 0; 34,596 blocks with spoken == visible on every one; **sense-tagged 726 → 732**, the
six being 揣's and 豁's; `build-lang-decks.js` re-run. **No changelog line and no version bump**: a new
file in `.claude/decks/` is not part of the site, and the CLAUDE.md bullet added for it is a rule rather
than a release.

## Batch 102 — `hsk30l5` notes 811–840 (碰见 → 奇迹)

**What the batch was.** Thirty consecutive notes of HSK 3.0 Level 5 in deck order, 碰见 through 奇迹.
**Seventeen changed, thirteen were read and left**, verified against the real diff rather than counted
from the record: 批准, 品牌, 品质, 聘请, 评价, 凭借, 平静, 平均, 屏幕, 平台, 破坏, 普及 and 期间 need
nothing — three sentences each, in three different constructions, under a gloss CC-CEDICT agrees with.

### The leading fault: the headword standing for its SOUND

**Three cards' only occurrence of the headword was inside a phonetic transliteration**, where the
character carries its sound and none of its meaning. 批's second sentence was **批萨**, a spelling of
*pizza*; 匹's third was **阿司匹林**, *aspirin*; 品's second was **一品脱啤酒**, a **pint** of beer.
In all three the sentence segments, speaks and translates perfectly, the card bolds the character,
and what the reader is shown is a fragment of a foreign word.

**Nothing in the pipeline can see this.** `check-example-fit.js` skips a one-character headword
outright, by design, and all three of these are one character. It is the class batch 96 met as 库
(Kurdish, Kumi), batch 89 as 哈 and batch 101 as 勒 (Fadil, Helen Keller) — **the fifth batch running
to find it, and it is found by reading and by nothing else.** The three are dropped and replaced with
authored sentences using the word in the sense the card teaches: 第一批学生已经到了 and 经理批了这份申请
for 批, 她买了一匹布 for 匹's second classifier sense (a bolt of cloth, which the card's own gloss names
and none of its sentences showed), and 他慢慢品着这杯茶 for 品.

**A fourth is the same fault with a proper name in it.** 齐's first sentence was **齐里独自跳舞** —
*Ziri dances alone* — the character standing for the first syllable of a personal name. Replaced with
东西都齐了.

### Two cards whose gloss named one sense and whose sentences showed three

**拼** was glossed *to join together; to piece together* and two of its three sentences were about
**spelling** (我的名字不是那样拼的, 两个拼法都对) while the third was the idiom 爱拼才会赢, which is the
*go all out* sense again. CC-CEDICT gives all four: to piece together, to pool, to risk all, to spell.
Split into three senses with each sentence tagged; 两个拼法都对 went, 拼法 being a compound that
swallows the headword, and 他把碎片拼成一个杯子 was authored so that the piece-together sense the card
leads with actually has an example.

**平** was glossed *flat; level; even; peaceful* over 他们打平了 (*to tie*, a sense the gloss did not
name), 书架和桌子齐平 and 这个平底锅没有把手 — the last two both swallowing the character inside 齐平
and 平底锅. Two senses now, **flat; level; even** and **to tie; to draw (a game)**, with 这条路很平 and
把桌子放平 authored. **"Peaceful" was dropped from the card deliberately**: CC-CEDICT marks it
`(bound form)`, 平 alone is not used that way in modern Chinese, and the new `Compounds` panel teaches
it as 和平.

### Ten `Compounds` panels

Every single-character card in the range had none: 批, 匹, 骗, 拼, 品, 平, 评, 凭, 齐, 其. Three to
five rows each, **every reading and gloss looked up in CC-CEDICT before it was written** — 批评, 批发,
批改; 匹配, 匹敌, 马匹; 骗子, 欺骗, 骗局, 拐骗; 拼命, 拼写, 拼图; 产品, 作品, 品德, 品尝; 和平, 水平,
公平, 平方; 评论, 评估, 评分; 凭证, 文凭, 任凭; 整齐, 齐全, 一齐, 看齐; 其他, 其中, 其实, 尤其.
一齐 is written **yì qí**, the sandhi the deck writes elsewhere, not the citation tone.

### One card contradicting a rule this audit itself recorded

**评** already carried a finding from batch 24 that *"to grade" a test is American and the British verb
is "to mark"* — and the third sentence **authored in the batch that recorded it** read "The teacher
**graded** our compositions", directly under that sentence in its own `why`. `exBritish` cannot see it:
*grade* and *mark* are two different words, not two spellings, so `SPELL_PAIRS` has no row for them and
`check-british.js` reads 0 whatever the card says. Corrected to *marked*. **A rule written into a
record is not a rule the tools enforce**, and the place it is most likely to be broken is the same
batch that wrote it down.

### One sentence that was not Chinese

**期待's second example was 他到我期待** — the words in an order Chinese does not allow — under a
perfectly good English, *I've been anticipating his arrival*. Nothing downstream can see this: it
speaks, it segments after a fashion, and the pair reads correctly to anyone reading only the English.
Replaced with 我一直期待他的到来. Its third sentence, 我不期待去上班, ended bare and took an `exStop`.

### The smaller repairs

A **near-repeat** on 碰见 — 我碰见了一个老朋友 and 我在银行附近碰见老朋友 are the same sentence in a
frame, which the coverage checker cannot see because it compares sentences exactly; the second went for
a conditional, 如果你碰见他，请告诉他一声. **拼音 was labelled a verb** and is a noun. And four English
translations said nothing about the headword they were teaching: 品种's *species* for a **variety**
(the word means breed or strain, not species), 平安's *And upon you be peace!*, 平衡's *make both ends
meet* for 收支平衡, and 奇迹's *Anyone can be a legend* over 每个人都能成为奇迹. Only the English was
rewritten in each; the Chinese is the deck's own.

### Three findings read and left

`check-gloss-source.js` reports **批**, **匹** and **其** in this range and all three are the proxy
working as its header says it will. 批's *to comment on; to approve (in writing)* is the dictionary's
*to criticize* and *to act on* in other words; 匹's card gives the classifier sense, which is what all
three of its sentences show, against a dictionary head that leads with two bound forms; 其's *he, she,
it* against *his; her; its* is one sense written two ways. None is a fault.

### Checks after the batch

`--check` clean; coverage **11,532 notes at three sentences, repeats 0**, so no `ex` array was
overwritten this time; shared-gloss groups 320 and still-ambiguous 1 — unchanged, so none of the five
gloss rewrites made a new collision. The one that remains, *noun neighbour* → 邻居 / 街坊, is across
Level-3 and Levels-7–9 and outside this range; it is a pair, so it can take the deck's `not X` hint,
and is recorded here for the batch that reaches it. pinyin clean; example-fit 0 on Level 5;
`check-polyreading.js` 0; `check-say-reading.js` names nothing in the range; coarse 0 on all six lists;
british 0; `build-lang-decks.js` re-run. **No changelog line and no version bump** — a community deck
is not a change to Folio, and nothing in the app changed.

## Batch 103 — `hsk30l5` notes 841–870 (其余 → 亲自)

**Twelve of thirty changed; eighteen read and left.**

**The leading finding is a gloss that is simply the wrong word.** 强大 was defined `adjective | large`,
and it is not: CC-CEDICT gives *big and strong; formidable; powerful*, and all three of the card's own
sentences say so — 这使我们更强大 (*makes us stronger*), 强大的对手 (*a tough competitor*), 强大的措施
(*strong measures*). Nothing in the pipeline can see this. The gloss is well-formed English, the
sentences are real and their English is right, `check-gloss-source.js` reports it under the
overlap rule along with a hundred legitimate paraphrases, and a reader simply learns the wrong word.
It is the same shape as 炒作 glossed *Nest* in the batch that built that checker, one degree less
obvious.

**欠 led its gloss with a sense none of its sentences shows.** The card read `yawn; owe; be behind
with` over three sentences that are all *to owe*. The dictionary's own order is *to owe / to lack /
(bound form) yawn*, and the bound form is exactly that — 欠 only means a yawn inside 哈欠 — so the
gloss now reads *to owe; to lack; (bound form) to yawn*. The card keeps the sense; it stops leading
with it.

**亲 was worse than it looked and cost two sentences rather than one.** The card was glossed
`verb / adjective | parent, relative, intimate, close` while its second sentence, 他说永远都不亲她, is
*to kiss* — a sense the gloss does not carry at all. Splitting it into the two senses the sentences
show then exposed the other two: 你父母亲在家吗 bolds 亲 inside **父母亲**, and 她想亲力亲为 is a
four-character idiom in which 亲 means *personally*, a third sense again. Both were dropped for
authored sentences using the character as the card teaches it — 我们两家关系很亲 and 孩子跟妈妈最亲 —
and the kiss sentence is tagged sense 2.

**Two more swallowed headwords and two bare sentence ends.** 签's 将此网站存入书签 is 书签, a bookmark;
悄悄's 房间里静悄悄的 is 静悄悄, a different word. Both replaced. 其余's 你留在这儿，其余的人去外面,
亲爱's 我亲爱的妈妈 and 亲切's 美国人是亲切的人 all ended with no terminal punctuation and took an
`exStop`, which appends a full stop to the visible text and to `data-say` together and touches nothing
else.

**And two English translations said nothing about the word.** 抢 is *to snatch, to rob*, and its first
sentence read 我的钱包被抢了 → *My purse was **stolen***, which is 偷; its third read 这名男子抢走了她的包包
→ *The man **robbed** her bag*, which is not English — you rob a person, not a bag. Both now say
*snatched*. Only the English was rewritten; the Chinese is the deck's own.

**Seven `Compounds` panels** — 签, 浅, 欠, 墙, 抢, 切, 亲 — every reading and gloss checked against
CC-CEDICT before it was written. 切's obvious fourth row, 切开, is not in the dictionary at all and was
replaced by 密切.

## Batch 104 — `hsk30l5` notes 871–900 (勤奋 → 热量)

**Thirteen of thirty changed; seventeen read and left.**

**青 had no sentence on it at all.** Its three examples were 刺青 (a tattoo), 青光眼 (glaucoma) and
青菜 (green vegetables) — three different words, each swallowing the character whole, on a card whose
whole job is that character and whose gloss is *blue or green*. This is the class
`check-example-fit.js` is blind to by design: it skips single-character headwords outright, since one
character cannot straddle anything. It is found by reading the card, and the tell here was the same one
batch 29 recorded — **the card's own English lines**: a card glossed *blue or green* whose three
translations say *tattoos*, *glaucoma* and *vegetables*. All three replaced.

**热量 taught calories under the gloss "heat".** Its three sentences are 热量很高 / 消耗热量 / 热量低,
every one of them a calorie count; the gloss said `noun | heat`. CC-CEDICT gives *heat / quantity of
heat / calorific value*, so the gloss now reads *heat; calorie content (of food)* — the general sense
kept, the card's own sense named.

**A character error, an advertisement and a pronoun that did not match its English.** 全体's third
sentence read 在全体职员回家后，**火事**爆发了 — 火事 is Japanese; Chinese writes 火灾 — and the
sentence segments, speaks and translates perfectly, which is why nothing reported it. 全新's third was
*收录蕾哈娜及更多艺人全新歌曲 / Featuring new music by Rihanna and more*, a piece of advertising copy
naming a celebrity. And 劝's second read 她劝我别相信她的话 against an English beginning ***He** advised
me* — the Chinese says 她. Only the English was rewritten there.

**Three swallowed headwords and a news extract.** 群's 他太不合群 is 合群; 绕's 你最喜欢哪一个绕口令 is
绕口令, which is now a `Compounds` row instead; 情景's 咖啡师们该创造一个情景喜剧 is 情景喜剧 *and* its
English (*Baristas need to make a sitcom*) teaches nothing. 群体's first sentence was a 43-character
clause lifted out of the middle of a news story, subordinate clause and dash and all.

**穷 and 情绪 lost an English that said nothing.** 他们都不穷 was *All of them are not poor*, which in
English means the opposite of what the Chinese says; it now reads *None of them is poor*.
你应该学习控制自己的情绪 was *You should learn to restrain yourself* — a good translation that never
mentions emotion, which is the one thing the card is teaching.

**请教** carried a near-repeat: 你最好请教你的医生 and 您最好请教一下医生 are one sentence in two frames.

**Four `Compounds` panels** — 青, 穷, 权, 劝, 群, 绕 (six).

## Batch 105 — `hsk30l5` notes 901–930 (热烈 → 沙漠)

**Eleven of thirty changed; nineteen read and left.**

**人工 straddled twice on one card**, which is the first time this audit has seen that. Its second
sentence is 我能跟任何**人工**作 and its third 这个地区的**人工**作很勤奋 — both are 人 + 工作, the
first character ending one word and the second opening the next, so the card bolded two characters that
never formed the word at all. `check-example-fit.js` asks only whether a headword is swallowed by a
LONGER word and is blind to this direction; the harvest's own guard is the same test, so a sentence
spanning two shorter words walks straight through it. Two authored replacements, 这个湖是人工挖出来的
and 这部分还是靠人工完成.

**认 had one sentence that is not Chinese and one that swallows the word.** 我认我会留下 (*I think I'll
stay*) is not a construction 认 takes on its own; 你是认真的吗 is 认真. Replaced with 我认得出他的字 and
他不认这笔账.

**软's first sentence was 他是个软蛋** — literally *soft egg*, an opaque and mildly insulting word for
a coward, on a card whose gloss is simply *soft* and whose English says *He's a coward*. It teaches
nothing about 软 and it is the kind of sentence a learner repeats without knowing what they have said.
Replaced with 这张床太软了.

**赛场 was glossed "racetrack"** while all three of its sentences are about a sports ground —
赛场上气氛紧张, 赛场上很安静, 他第一次走进赛场, whose own English says *ground* and *field*.
CC-CEDICT's entry is *racetrack / field (for athletics competition)*, the leading sense again, and the
card had taken the head of the entry rather than the sense it teaches. Now *the ground; the arena; the
field of play*.

**Two more English translations that said nothing.** 人才's 逆境出人才 was rendered by the proverb
*Adversity makes a man wise, not rich*, which is a real English saying about something else and never
mentions talent; it now reads *Hard times bring talent out*. 如同's 胃里如同千军万马开过 was given
*An army marches on its stomach* — again a real proverb, again about something else entirely; the
Chinese says *my stomach felt as though an army had marched through it*.

**热心 carried a near-repeat** (both sentences *pretends to be enthusiastic*), and the duplicate is
also the third sentence of the 情感 card, so it went.

**Six `Compounds` panels** — 忍, 认, 如, 软, 弱, 洒. 洒's fourth candidate, 泼洒, is not in CC-CEDICT
and was replaced by 洒脱.

## Batch 106 — `hsk30l5` notes 931–960 (沙子 → 社区)

**Ten of thirty changed; twenty read and left.**

**扇 is the batch's finding and it is two faults at once.** The card was glossed `verb | to fan; to
slap (someone's face)` with its pinyin as `shān` — and two of its three sentences are 这**扇**门 and
六**扇**窗, which are the measure word for doors and windows and are read `shàn`. So the card named a
reading its own examples do not use, and gave no gloss at all for the sense they do. The third
sentence, 我想买风扇, is 风扇 and swallows the character besides. `check-pinyin.js` cannot see it — it
compares a card's pinyin against its own bopomofo for syllable BOUNDARIES, and both said `shān`
together. `check-say-reading.js` cannot see it either: that asks what a speech engine will guess from
the corpus's own distribution, and the corpus is right about the character. It is found by reading the
sentences against the reading. The card now carries both readings in pinyin and bopomofo, two senses,
an authored `shān` sentence (她拿着报纸扇了扇), and its examples tagged 2, 2, 1.

**赏 had a near-repeat and a swallow together.** 在中秋节…赏月 and 在江户时代赏月的宴会 are both
moon-viewing; 黑帮悬赏捉拿汤姆 is 悬赏. Two authored replacements for the two senses the gloss names —
老板赏了他一千块 (*to reward*) and 这幅画很值得一赏 (*to appreciate*).

**烧's second sentence translated 烧酒 as "sake".** 我爸爸不喝多少烧酒 — 烧酒 is Chinese grain spirit,
not Japanese rice wine, and the word swallows the headword besides. Replaced with 房子烧了一整夜.

**Three sentences that were off the card altogether.** 傻's 你是不是吸毒吸傻了 is a drug reference whose
English (*Do you have a drug problem?*) does not translate it and which taught nothing about *silly*.
伤害's 这个怪物只吃魔法伤害 is video-game jargon and is not idiomatic Chinese besides — 受伤害, not
吃伤害. 设立's first sentence was a three-sentence paragraph about a bus stop outside a Cologne nursing
home; it is a good joke and it is not an example sentence.

**Five `Compounds` panels** — 傻, 晒, 删, 扇, 伤, 赏, 烧, 蛇 (eight). 烧's obvious 烧饭 is not in
CC-CEDICT; 烧水 is, and took its place.

## Batch 107 — `hsk30l5` notes 961–990 (社区 → 失恋)

**Eight of thirty changed; twenty-two read and left.**

**升's three sentences were sunrise, a litre and sunrise again.** 太阳升起来了 and 太阳总是从东方升起
are the same sentence in a frame — a near-repeat the coverage checker cannot see — and between them
they left the card's gloss leading with *to promote*, a sense no sentence on the card illustrated.
Replaced with 他去年升了经理.

**And that exposed the card's part-of-speech label.** The gloss read `verb | litre; to promote; to
rise` — *litre* is not a verb, and 升 is a measure word in that sense. The card now carries three
senses, each with its own label, and its examples are tagged 1, 3, 2. This is the same class as 拼音
labelled a verb in batch 102: the label is one the decks use everywhere and the gloss is well-formed,
so it is read off the card's own line and nothing else can see it.

**摄影's third sentence carried the coarse word and swallowed the headword together.**
每个有照相机的傻瓜都觉得自己是**摄影家** — 摄影家 is a photographer, a different word, and the English
read *Every dumbass with a camera*. The coarse checker's `slur` list would have named it; the swallow
would not have been named by anything.

**深刻's first English was not English.** 您使我印象深刻 was *You have left a heavy impression on me* —
a calque of 印象深刻 word for word. It now reads *You made a deep impression on me*.

**神秘 carried a near-repeat** so close that the two English lines differ by two words: *This place has
a mysterious atmosphere* and *This place has a mysterious atmosphere to it*. The coverage checker
compares sentences exactly, so it sees nothing.

**Four `Compounds` panels** — 伸, 胜, 诗, 湿.

## Batch 108 — `hsk30l5` notes 991–1020 (失眠 → 事实)

**Five of thirty changed; twenty-five read and left.** A quiet range, and the five are worth having.

**使得 was glossed "usable".** That is CC-CEDICT's leading sense (*usable; serviceable / feasible;
workable / to make; to cause; to bring about*), and it is not this card's: all three sentences are
暴风雪使得我们难以返回营地, 这使得他上学迟到了 and 大雨使得比赛推迟了 — every one of them *to cause*.
This is batch 31's finding exactly — **the dictionary's first sense is not automatically this card's**
— and a gloss taken off the top of an entry reads perfectly either way.

**Two straddles and a swallow, all three invisible to every checker.** 时差's first sentence is
他过马路**时差**点被车撞 — 时 + 差点, *while crossing the road he nearly*, which has nothing to do with
a time difference. 时常's third is 我还是个小男孩**时常**去池塘游泳 — 时 + 常去. 时刻's second is
地震**时时刻刻**都有可能发生, which is 时时刻刻, a four-character adverb. All three sentences are real,
grammatical, correctly translated Chinese; what is wrong is that the word the card teaches is not in
any of them.

**One `Compounds` panel** — 式.

## Batch 109 — `hsk30l5` notes 1021–1050 (视为 → 束)

**Five of thirty changed; twenty-five read and left.**

**束 is the batch's finding and it is the 青 shape again.** All three of its sentences were 束腹 (a
corset), 管束 (to control) and 装束 (dress, attire) — three different words, none of them the measure
word the card's gloss names and none of them the verb. The character is a measure word for bunches,
bundles and beams of light, and for tying things up, and the card showed neither. Three authored
sentences replace all three, tagged to two senses the gloss now splits: 他送了她一束花,
一束阳光照进了房间 and 请把这些报纸束起来.

**鼠标's first sentence was not Chinese.** 这个鼠标突然**毛病**了 — 毛病 is a noun and takes 出; the
English (*Suddenly, this mouse stopped working*) reads perfectly, which is why nothing downstream could
see it. Replaced with 这个鼠标突然不动了, which says what the English says.

**Two near-repeats.** 视为's 他被视为村里最好的医生 and 他们把他视为城里最好的医生 — the same sentence
with the village changed to a town. 试验's 这次核试验成功了 and 这个国家成功进行了一次核试验 — the same
nuclear test twice.

**One `Compounds` panel** — 守, plus 束's.

## Batch 110 — `hsk30l5` notes 1051–1080 (数据 → 缩短)

**Ten of thirty changed; twenty read and left.**

**Two more straddles, and the second one is the one to remember.** 水分's second sentence is
一个**水分**子是由两个氢原子…— 水 + 分子, a water MOLECULE, on a card whose gloss is *moisture content*.
四周's third is 你在三或**四周**内就会习惯 — 四 + 周, **four weeks**, on a card meaning *all around*.
Both sentences are perfectly good Chinese about something else, and both bold two characters that never
formed the word.

**摔's first "sentence" was a bare imperative fragment.** 摔坏别人的手机 / *Smash someone else's phone*
— a verb phrase with no subject and no context, which is not a sentence and teaches nothing about how
the word is used. Replaced with 他在雪地上摔了一跤.

**碎's second was 他叫了一盘杂碎** — 杂碎 is chop suey, a compound that swallows the headword, and a
dish most learners will never meet; the English is *He ordered a chop suey*.

**顺 and 搜 each carried a near-repeat.** 顺's two 顺道 sentences (*by the way* and *dropped in at*),
and 搜's two 搜身 sentences (*frisk searches* and *a pat-down*) — which between them meant 搜 appeared
in only one word on the whole card.

**酸甜苦辣's first two English lines were IDENTICAL**: *He has tasted all the ups and downs of life*,
twice, over two different Chinese sentences. The coverage checker reports repeated SENTENCES and
`check-senses.js` reports a repeated English; this pair is two distinct Chinese sentences sharing an
English, so the second was rewritten rather than dropped — the Chinese is a real second construction
worth having.

**四处's third English was not English.** 四处都在下雨 → *The rain is raining all around*.

**Six `Compounds` panels** — 摔, 税, 顺, 搜, 随, 碎.

## Batch 111 — `hsk30l5` notes 1081–1110 (缩小 → 填)

**Ten of thirty changed; twenty read and left.**

**Three straddles in one range of thirty**, which is the highest this audit has seen. 他人's second is
**他人**很好，和你一样 — 他 + 人很好, *he is very kind*, and the English says so. 特有's second is
去上海新建的绿地玩也**特有**劲 — 特 + 有劲, *really fun*. 天上's third is 我每**天上**教堂 — 每天 +
上教堂, *I go to church every day*. Each renders, segments, speaks and translates perfectly; in each
the word the card teaches is simply not in the sentence.

**所's third sentence is 所有的电话都不通** — 所有 is a determiner meaning *all*, a completely different
function word from the measure word and the noun this card is for. Replaced with 这所房子是新盖的.

**提升's first sentence is not Chinese at all**: 创新创新本身就提升了创新 — *creating creativity itself
is improving creativity* — with 创新 doubled at the head and a meaning that does not survive being read
twice. Replaced with 这次训练提升了他的水平.

**天上 was also glossed "celestial"**, an adjective, on a card labelled `noun`, against three sentences
that all say *in the sky*. `check-gloss-source.js` named it and the dictionary agrees: *the sky; the
heavens*. This is the third shape batch 31 recorded — **the label and the gloss are different parts of
speech** — and it is read off the card's own line and nothing else.

**Five `Compounds` panels** — 所, 锁, 桃, 套, 替, 填 (six).

## Batch 112 — `hsk30l5` notes 1111–1140 (甜品 → 推动)

**Eight of thirty changed; twenty-two read and left.**

**挑's first sentence was a CHARACTER ERROR that put the headword there at all.** 这只狗**挑**了 /
*This dog jumped* — the character wanted is 跳, and 挑 is on that card only because somebody typed the
wrong one. This is the class batch 30 found on 炮 and 破: nothing in the pipeline can see it, because
挑 is a real character, the sentence segments and speaks, and the English is a correct translation of
what was meant. The card's other two sentences were both 挑…的毛病 (*to find fault*), a near-repeat,
which between them left the card with one real sentence out of three; two authored replacements cover
the two readings the card teaches.

**团 carried the same fault one word over.** 我想加入你们的**团对** — a typo for 团队, which is the
neighbouring card (1139) and whose own first sentence is the corrected form of the same sentence. Its
first example, 你有团子吗 / *Do you have some dango?*, is a Japanese confection written in Chinese
characters and teaches nothing about 团. Both replaced.

**挑选's third sentence was machine-translated.** 这将会是巨大的，如果你可以挑选一些面包，然后再回家 —
a word-for-word rendering of *It'd be great if you could pick up some bread before you come home*, with
*great* read as *巨大* and the clause order left in English. Replaced with 回家前请挑选一些面包.

**投's gloss named the wrong sense and its three sentences were one sense three times.** The card read
`verb | to throw, cast, or fling` over 我投肯一票, 您已经投了票了吗 and 没有人投反对票 — every one of
them voting, which the gloss never mentions. The gloss now leads with *to cast (a ballot); to vote*,
the throwing sense is a second sense, and 他把硬币投进了箱子 was authored for it. A three-way near-repeat
and a sense gap on one card.

**通常's first English said "sometimes".** 孩子通常没有耐心 / *Children **sometimes** lack patience* —
on a card whose whole content is that 通常 means *usually*. The card's other two sentences both say
*usually*, so the reader met the word defined one way and translated another.

**兔子's first two sentences were a near-repeat with the animal changed**: 我喜欢兔子 / *I like hares*
and 你喜欢兔子吗 / *Do you like rabbits?* — the same word in the Chinese, two different animals in the
English.

**Five `Compounds` panels** — 挑, 贴, 同, 投, 团. 挑's obvious fourth row, 挑水, is not in CC-CEDICT and
was replaced by 挑拨.

## Checks after batches 103–112

`mandarin-fix.js --check` clean — every deck carries its fixes, and no `dropEx`, `exEn` or `exStop` row
matched nothing. Coverage: **11,532 notes at three sentences across all nine decks, 0 showing the same
sentence twice**, so no `ex` array was overwritten by the ten batches sharing one writer. Shared-gloss
groups **320** and still-ambiguous **1**, both unchanged, so none of the seven gloss rewrites made a new
reverse-card collision. `check-pinyin.js` clean over 11,459 readings. `check-example-fit.js` on Level 5
reports 25 findings, none of them in 841–1140. `check-polyreading.js` 0. `check-coarse.js` names nothing
on Level 5 on any of its six lists — the 傻 and 摄影 repairs cleared the two it had. `check-british.js`
0. `check-senses.js` names no duplicate English inside the range. `build-lang-decks.js` re-run, so the
catalogue's revision moves and every reader who already holds the deck is offered the update.

**Verified against the real diff**: 92 of the 300 notes in 841–1140 changed and **nothing outside the
range moved** — 12, 13, 11, 10, 8, 5, 5, 10, 10, 8 per batch, summing to 92.

**Read and left, with the question recorded.** `check-gloss-source.js` reports ten cards in the range
and eight are the proxy paraphrasing: 汽油 *petrol* against the dictionary's *gasoline* (the decks are
authored British and the card is right), 轻易, 傻, 诗, 手套, 手续, 书架, 税 and 随后 all one sense
written two ways. The ninth was 天上 and was fixed. **`挑` keeps a `Say` of 挑选, which pins `tiāo`
while its new third sentence teaches `tiǎo`** — the card's other two sentences are both `tiāo`, so the
override is right for the majority and the minority reading is named in the senses; it is recorded here
rather than changed. **And one fault was found outside the range and left there**: `hsk30l5/装修` is
glossed *to decroate*, a plain typo, which belongs to the batch that reaches it.

**No changelog line and no version bump** — a community deck is not a change to Folio, and nothing in
the app changed.

## Batch 113 — `hsk30l5` notes 1141–1170 (推广 → 围绕)

**Nine of thirty changed; twenty-one read and left.**

**微笑 straddled inside its own sentence**, which is the neatest example of that fault this audit has
found: 教授**微微笑**了一下 / *The professor grinned* is 微微 + 笑了, an adverb and a verb, so the card
bolded two characters that are one word in neither reading. `check-example-fit.js` asks only whether a
headword is swallowed by a LONGER word and is blind to this direction. The English is wrong about the
word as well — a grin is not a smile — so the sentence went whole for 她对我微笑了一下.

**退 had two of its three sentences inside longer words**: 他被批准**早退** and 你**退烧**了吗, the
second of which is also the third sentence of the 烧 card. That left one real example out of three, so
two were authored for the two senses the card names — 大水慢慢退了 and 这件衣服可以退吗.

**Three English translations said nothing about the headword.** 退出's 我不该退出的 was *I shouldn't
have **logged off***, a computing sense the gloss does not carry; 违法's 您有违法行为吗 was *Are you
in trouble with the law?*, which never says *illegal*; 外形's 这台机器外形很小 was *This machine is
small in shape*, which is not English.

**Two near-repeats and a swallow.** 推广's 这项技术已经推广开了 and 这项技术正在推广 are the same
sentence in two aspects; 推荐's 你推荐什么 and 你有什么推荐 are the same question twice. 围's
住宅**围栏**应该多高 is 围栏, a fence.

**Two `Compounds` panels** — 弯, 围.

## Batch 114 — `hsk30l5` notes 1171–1200 (维修 → 物质)

**Seven of thirty changed; twenty-three read and left.**

**物品 carried a character error under a perfect English.** 请勿**望**您的物品 / *Please mind your
belongings* — the character wanted is 忘, and 望 means *to gaze*, so the Chinese reads *please do not
gaze at your belongings*. It is the class batches 30 and 112 record: the wrong character is a real
character, the sentence segments and speaks, and the English is a correct translation of what was
meant, so nothing in the pipeline can see it.

**雾's first sentence was 烟雾出现了 / *Smoke appeared*** — 烟雾 is smoke or smog, a compound that
swallows the headword, and the English says *smoke* on a card glossed *fog*. The card's own English
line is the tell, exactly as batch 29 recorded.

**无数 and 无限 each lost something.** 无数's 这本小说使无数女孩流下了眼泪 was *The fiction reduced
girls to tears* — no *countless* anywhere in it. 无限's 宇宙毫无疑问是无限的 and 但宇宙无限 are the
same claim about the universe twice, so the second went for 他对孩子有无限的耐心.

**武术** carried a near-repeat so close that the two differ by one character: 他从小**学习**武术 and
他从小**练**武术.

**Two `Compounds` panels** — 胃, 握. 握's obvious fourth row, 握紧, is not in CC-CEDICT; 握力 is.

## Batch 115 — `hsk30l5` notes 1201–1230 (西餐 → 现状)

**Eight of thirty changed; twenty-two read and left.**

**戏 had one real sentence out of three, and its English was wrong about that one.** 让我们在**戏院**
前面碰面 is 戏院 and 这可不是**儿戏** is 儿戏 — two compounds — while the survivor, 这星期有没有好戏看,
was translated *Are there any good **films** being shown this week?* on a card glossed *play, drama,
performance*. Two authored sentences replace the compounds and the English now says *plays*.

**县's three sentences were all about Japan.** 日本有多少个县, 我住在兵库县 and
我在兵库县立大学学习 — a Japanese prefecture is a reasonable rendering of 县 and the last two are the
same place twice, so the near-repeat went for 这个县有三十万人, which is what the word means in China.

**现实 and 限制 each lost a sentence the word is not in.** 现实's 我喜欢**超现实主义** is 超现实主义,
surrealism, and ended with no terminal punctuation besides. 限制's 连笑话也有限制 is 有 + 限制 read by
the segmenter as 有限 + 制 — see batch 121, where the same sentence turns up on the 有限 card and is
wrong there too.

**闲 and 乡 are the same shape.** 闲's 我跟他**闲逛**过 is 闲逛; 乡's 乡间有很多树 and 我喜欢在乡间散步
are both 乡间 and are a near-repeat into the bargain.

**Two English translations said nothing.** 显然's 他显然喜欢散步 was *There's no doubt that he likes
taking walks*, which never says *obviously*; 显示's 昨夜温度计显示气温下降到零度 was *The thermometer
fell to zero last night*, which drops the verb the card is for.

**Four `Compounds` panels** — 戏, 闲, 县, 乡.

## Batch 116 — `hsk30l5` notes 1231–1260 (相似 → 心态)

**Three of thirty changed; twenty-seven read and left.** The quietest range in this sitting, and the
three are small.

**小于's first two sentences were 这个数小于十 and 这个数小于一百** — the same sentence with the number
changed, which is what a near-repeat looks like at its most mechanical. **新娘's first and third were
新娘看起来非常漂亮 and 新娘好像非常漂亮**, the same observation twice. One `Compounds` panel, 斜.

**Read and left**: 新郎 and 新娘 share a sentence (新郎现在在一家公司工作，新娘是我们的老师) and 外形 and
相似 share another (地球的外形和橙子相似). A sentence on two cards is not a near-repeat — a reader meets
each card on its own — and in both pairs the sentence teaches both words.

## Batch 117 — `hsk30l5` notes 1261–1290 (新型 → 学历)

**Nine of thirty changed; twenty-one read and left.**

**性质's first two examples carried the SAME English over two different Chinese sentences.**
这两件事**的**性质不同 and 这两件事性质不同 both read *These two matters are different in nature* —
which is `check-senses.js`'s own exact check rather than a proxy, and it had named this card
(`u_hsk30l5_1278`) for some time. The Chinese sentences differ by one particle, so the honest repair is
the English: the second now reads *The two cases are of a different character*.

**形容 was glossed by its literary sense.** The card read `verb | appearance; countenance` — which is
what 形容 means in classical Chinese — over three sentences that all mean *to describe*. CC-CEDICT
leads with *to describe* and marks the other *(literary)*; the gloss now says both in that order. Its
third sentence was 不够后面要再加个**形容词**, which is 形容词, an adjective, and ended with no
terminal punctuation besides.

**行人's first sentence was 我的母亲经常让行人吃耳光 / *My mother often slaps passers-by***, which is
not a sentence a learner should meet on a card about pedestrians.

**Three near-repeats.** 休闲's 周末他喜欢**在家**休闲 and 周末他喜欢休闲; 学分's 这门课有**三**个学分
and 这门课有**两**个学分; 学科's 所有学科中，我比较喜欢英语 and 英语变成了我最喜欢的学科.

**One `Compounds` panel** — 需.

**And one authored replacement had to be replaced in turn**, which is worth recording. The sentence
first written for 行人 was 这条街上行人很多 — and `check-example-fit.js` reported it straight back,
because 街 + 上行 is how a greedy segmenter reads 街上行. The class this audit spends most of its time
on can be introduced by the repair as easily as found in the original. It is now
过马路时行人要小心. **Re-run the checker after authoring, not only before.**

## Batch 118 — `hsk30l5` notes 1291–1320 (学年 → 药物)

**Seven of thirty changed; twenty-three read and left.**

**腰's three sentences were 弯腰, 腰围 and 半山腰** — a stoop, a waist measurement and the middle of a
mountain, three compounds, none of them the character standing on its own. 弯腰 was kept, being the
commonest thing anyone does with the word, and two authored sentences replace the others.

**眼 was the same shape one card over**: 我**眼皮**发热 is 眼皮, an eyelid, and 什么都逃不过我的**法眼**
is 法眼, a discerning eye. Both went; the survivor, 眼不见心不烦, is the character in an idiom, and the
two replacements cover the measure-word sense (他回头看了我一眼) and the free noun (他红着眼说不出话).

**摇's third was 他们把我们当成摇钱树** — 摇钱树, a money tree.

**学年 carried a near-repeat differing by one character**: 日本的新学年**在**四月开始 and
日本的新学年**从**四月开始.

**要不's first English said nothing about the word.** 要不一起到车站去 was *Do you want to go to the
station with me?*, which is a fine translation and never says *how about* or *otherwise*, the two
things the card is for.

**Four `Compounds` panels** — 沿, 眼, 腰, 摇, 咬 (five). 咬's obvious 反咬 is not in CC-CEDICT; 咬合 is.

**One card deliberately gets NO `Compounds` panel and the reason is worth writing down.** 呀 is a
sentence-final particle and an interjection, not a morpheme that builds words: what it appears in
(哎呀, 啊呀) are interjections written with it rather than compounds of it. The rule that a
single-character card gets a `Compounds` section is a rule about characters that BUILD, and a
grammatical particle is the case where the honest answer is none.

## Batch 119 — `hsk30l5` notes 1321–1350 (夜间 → 因而)

**Eight of thirty changed; twenty-two read and left.**

**一路顺风 had three near-identical sentences**, which is the worst repeat this audit has met:
祝**您**一路顺风。 / 祝**你**一路顺风。 / 祝你一路顺风**！** — one formula, three times, differing by a
pronoun and a punctuation mark. The coverage checker compares sentences exactly and reported nothing.
One was kept and two authored.

**一路 straddled on its second sentence**: 去医院要坐**哪一路**公交 is 哪一 + 路公交, where 路 is the
measure word for a bus route and 一路 is not the word at all.

**以's second sentence was 他以为什么都知道** — 以为, *to think (mistakenly)*, which swallows the
headword and is a completely different word; 乙's second was 对**乙**酰氨基酚, paracetamol, where the
character is inside a chemical transliteration and carries none of its meaning. That is batch 102's
finding again, one degree further: not a foreign place name but a foreign compound.

**Two more near-repeats**: 一旦's 坏习惯一旦被养成，便不能简单地改正 and 一旦养成了坏习惯，就很难改回来了;
以来's 入冬以来一直没下**雨** and 入冬以来一直没下**雪**.

**Three `Compounds` panels** — 移, 乙, 以, 亿 (four). 亿's panel is three rows rather than four, because
百亿 and 亿元 are not in CC-CEDICT and 亿万富翁 is the only other entry the dictionary carries for it:
**a character that occurs in few compounds gets a short panel rather than an invented one.**

## Batch 120 — `hsk30l5` notes 1351–1380 (音量 → 优质)

**Five of thirty changed; twenty-five read and left.**

**用法 straddled 用 + 法文.** 因为是**用法**文写的，所以这本书很难读 / *This book is difficult to read
as it is written in French* — the two characters are the preposition 用 and the first character of
法文, and the card, which means *usage*, bolded them as its own. A perfectly good sentence about
something else.

**Two English translations that were not English or were not the sentence.** 优美's
他虽然不是歌手，但他唱的非常优美 read *he has beautiful voice*, missing its article; 悠久's
京都和奈良都是历史悠久的古城 read *Nara is as old as Kyoto*, which is a different claim from the one
the Chinese makes and drops the word the card teaches.

**Two `Compounds` panels** — 迎, 硬.

## Batch 121 — `hsk30l5` notes 1381–1410 (由此 → 元旦)

**Seven of thirty changed; twenty-three read and left.**

**One sentence straddled on TWO different cards at once, and belongs to neither.** 连笑话也有限制 is
连 + 笑话 + 也 + 有 + 限制 — so on the **限制** card (batch 115) the segmenter reads 有限 + 制 and the
headword is split, and on the **有限** card the word genuinely is not there at all, 有 being the verb
and 限制 the object. The same string was serving as an example for two cards that mean different
things, and it is wrong for both. Dropped from each, with an authored sentence for each.

**语文 straddled too**: 他在牛津大学修了英**语文**学 is 英语 + 文学, English literature, on a card
whose own gloss is *Chinese as a school subject*.

**原's first sentence was 他们知道如何制造原子弹** — 原子弹, an atomic bomb — and 圆's third was
圆圈是红色的, where 圆圈 is a circle. Both swallow.

**Two more English translations and a near-repeat.** 有害's 吸烟有害健康 was *Smoking **affects** your
health*, which is neutral where the word is not. 有益's 体育有益健康 and 跑步对你的健康有益 are the
same claim about exercise twice. 原有's 这里保留了原有的**建筑** and 这里保留了原有的**风格** likewise.

**Two `Compounds` panels** — 原, 圆.

## Batch 122 — `hsk30l5` notes 1411–1440 (员工 → 摘)

**Eleven of thirty changed; nineteen read and left** — the busiest range in this sitting, almost
entirely because of the `Compounds` backlog at the end of the alphabet.

**早期's second and third examples were multi-sentence paragraphs.** One was 91 characters about
Bismarck's opinion of his own public speaking; the other was about Mark Knopfler playing the opening
bars of *Money for Nothing*. Both are real prose and neither is an example sentence; both went for two
authored ones.

**愿's third was 我有一个愿景** — 愿景, a vision or a goal — and its first, 愿你们平安, carried the
English *And upon you be peace!*, which is the same formula batch 102 struck off the 平安 card and
which says nothing about 愿. **运's first was 你们三个很走运**, 走运, *to be in luck*, a different sense
inside a different word.

**Two more near-repeats.** 增进's 交流可以增进了解 and 交流能增进理解 — the same sentence with two
synonyms swapped. 在线's 他总是在线 and 他一直在线，随时可以问他.

**早晚's third English said nothing about the word**: 这债她早晚要还的 read *She will pay for this*,
which drops *sooner or later* entirely.

**Seven `Compounds` panels** — 愿, 运, 造, 增, 赠, 炸, 摘.

## Checks after batches 113–122

`mandarin-fix.js --check` clean — every deck carries its fixes, and no `dropEx`, `exEn` or `exStop` row
matched nothing. Coverage: **11,532 notes at three sentences across all nine decks, 0 showing the same
sentence twice.** Shared-gloss groups **320** and still-ambiguous **1**, both unchanged, so the two
gloss rewrites (形容, 显然) made no new reverse-card collision. `check-pinyin.js` clean over 11,459
readings. `check-polyreading.js` 0. `check-coarse.js` names nothing on Level 5 on any of its six lists.
`check-british.js` 0. `check-senses.js` names no duplicate English inside the range — the 性质 finding
it had been carrying is cleared. `build-lang-decks.js` re-run.

**Verified against the real diff**: 74 of the 300 notes in 1141–1440 changed and **nothing outside the
range moved** — 9, 7, 8, 3, 9, 7, 8, 5, 7, 11 per batch, summing to 74.

**`check-example-fit.js` found four in range that reading had missed, and one of them was mine.**
信用's 他不是那种**不守信用**的人 is 守信 + 用 and 幸运's 他说他是**不幸运**的 is 不幸 + 运; both were
dropped and replaced. The third was the sentence this sitting had just authored for 行人 (see batch
117). **The fourth is a FALSE POSITIVE and stays**: 行走's 那是人类第一次在月球**上行走** is
在月球上 + 行走, which is correct Chinese and correct segmentation; the greedy matcher prefers 上行,
a real word meaning *to go up*, and loses. The checker's own header says it is a proxy, and this is
what that means.

**Read and left.** `check-gloss-source.js` reports six cards in the range and five are the proxy
paraphrasing — 现代化, 协议, 形状, 呀 and 眼泪 all one sense written two ways. The sixth, 显然, was a
real finding of a different kind: the gloss was right and the LABEL was not, the card saying
`adjective` over two sentences that use the word adverbially, so the label is widened rather than the
gloss changed. **And one card is deliberately given no `Compounds` panel** — 呀, a sentence particle,
for the reason set out in batch 118.

**No changelog line and no version bump** — a community deck is not a change to Folio, and nothing in
the app changed.

## Batches 123–127 — `hsk30l5` notes 1441–1579: the end of Level 5

**Forty of the last 139 notes changed** — 11, 11, 8, 6, 4 — and **Level 5 is finished**: 1,579 notes
read card by card over batches 63–127.

**The transliteration class turned up twice more, and both are food.** 治's second sentence was
汤姆说他看到玛丽在公园吃**三文治** — 三文治 is *sandwich* written for its sound, and 治, whose card
means *to govern, to cure*, carries none of its meaning there. 抓's second was 你们有没有**素抓饭** —
抓饭 is *pilaf*, borrowed from Uyghur *palaw*, and the same thing happens. Both segment, speak and
translate perfectly; nothing in the pipeline can see either. That is the class batch 102 opened with
pizza, aspirin and a pint, and it is now seven cards across the level.

**Six sentences were not Chinese**, which is the level's other recurring fault and the one whose
English always reads well. 挣's 挣的越多钱，就花得越多钱 puts the measure phrase in a position Chinese
does not allow (it is 挣的钱越多); 智慧's 衰老不得，智慧不得不得 is not a sentence at all under
*Don't get older, get wiser*; 治疗's 医生治疗了他们的降低体温 treats a verb as a noun; 哲学's
他不仅社会学毕业，还有哲学 drops the verb from its second clause; 自由's 我不是个意愿自由主义**着**
writes 着 for 者 and adds a spurious 意愿; and 醉's 他非常醉了 takes a degree adverb 醉 cannot take.
**And 主席's third sentence is the same thing with a word rather than a grammar**: 派对主席 for a
*party host*, where 主席 is a chairman of a committee or a state.

**组成's third sentence reversed the relation it was translating.** 美国组成五十州 says *America
composes fifty states*; the second sentence on the same card, 美国由五十个州组成, says it correctly.
The two were a near-repeat as well, so the wrong one went.

**Four cards had almost no sentence on them**: 阵 (阵痛 / 对阵), 争 (争斗), 败 — whose three were
胜败, 惨败 and 衰败 — and 兵 (兵家 / 阅兵式). And 嘴巴's third example was
来人，给我掌这贱女人嘴巴 / *Guards! Slap that vile woman's face!*, which the coarse checker's lists do
not reach and which no learner should meet.

**装修's gloss typo is cleared.** The card read `verb | to **decroate**` — reported by
`check-gloss-source.js` two sittings ago, recorded then as an open item because it was outside the
range, and fixed here now that the range reached it. **An open item recorded with its note number is
one the next batch can close;** this one waited exactly ten batches.

**Nineteen `Compounds` panels** — 窄, 占, 涨, 阵, 争, 挣, 支, 直, 止, 至, 治, 猪, 煮, 抓, 撞, 追, 紫,
族, 醉. 窄路, 母猪, 熬煮, 水煮 and 深紫 are not in CC-CEDICT and were replaced or dropped; 窄, 煮 and
紫 take three-row panels rather than invented fourth rows.

## Batches 128–132 — `hsk30l6` notes 1–150: Level 6 begins

**Thirty-seven of 150 changed** — 6, 10, 5, 9, 7.

**Six straddles in the first 150 notes**, which is a higher rate than Level 5 ever ran at, and two of
them are the best examples of the class this audit has found.

**层面's first two sentences were both 千层面 — LASAGNA.** 我爱千层面 and 汤姆吃了纯素食千层面 are
千层 + 面, a thousand layers of pasta, on a card that means *aspect, facet, level*. It is a straddle and
a near-repeat at once, so two of three sentences went together.

**才能's first and third were 才 + 能**, the adverb and the modal: 我怎么才能发胖 is *how do I manage to
put on weight* and 只有学习才能获得知识 is *only through study can one gain knowledge*. Neither is the
noun *talent* the card is for, which left one real sentence out of three.

**倍增's first was 成倍增加** (成倍 + 增加), **遍地's was 一遍又一遍地** (一遍 + 又 + 一遍 + 地),
**产出's was 早产出生** — a premature birth standing in for industrial output — and **不时's third was
时不时**, which is a different word built on the same two characters in the other order.

**Two cards carried the SAME English on two sentences**, which is `check-senses.js`'s exact check
rather than a proxy: 步骤's 请按照步骤操作 and 请按步骤操作 both read *Please follow the steps*, and
层次's 这篇文章层次分明 and 文章的层次很清楚 both read *The article is clearly structured*. Both had
been on that checker's list; in each the Chinese sentences are genuinely different and the English was
rewritten rather than a sentence dropped.

**背心's first English called a singlet a "wife-beater".** 他脱了背心 — the garment is a vest, and the
slang name for it is a term of abuse for the man supposed to wear it. `check-coarse.js` has no English
word list, only Chinese, so this is found by reading.

**Two examples were off the card altogether.** 财物's first was four clauses of Genesis 13 in a
nineteenth-century English translation; 场景's was a paragraph of marketing copy for a football video
game, graphics engine and all.

**Nineteen `Compounds` panels** — 岸, 摆, 败, 版, 爆, 逼, 闭, 避, 编, 兵, 播, 补, 捕, 布, 踩, 侧, 叉,
肠, 抄. 踩油门 and 乱踩 are not in CC-CEDICT; 踩刹车 and 踩雷 are.

## Checks after batches 123–132

`mandarin-fix.js --check` clean — every deck carries its fixes, and no `dropEx`, `exEn` or `exStop` row
matched nothing. Coverage: **11,532 notes at three sentences across all nine decks, 0 showing the same
sentence twice.** Shared-gloss groups **320** and still-ambiguous **1**, both unchanged.
`check-pinyin.js` clean over 11,459 readings. `check-polyreading.js` 0. `check-coarse.js` names nothing
in either range on any of its six lists. `check-british.js` 0. `check-senses.js` names no duplicate
English left in either range. `build-lang-decks.js` re-run.

**Verified against the real diff**: 40 of the 139 Level 5 notes in 1441–1579 changed and 37 of the 150
Level 6 notes in 1–150, and **nothing outside either range moved**.

**`check-example-fit.js` found three more after the repair, and one was mine again.** 种子's
春天要播种子 is 播种 + 子 — the verb *to sow* plus a stray character — and 整齐's 收拾得整整齐齐 is the
reduplicated form, which the card was bolding through the middle of. The third was the sentence this
sitting had just authored for 嘴巴: 他捂住嘴巴笑了 reads 捂 + **住嘴** + 巴, 住嘴 being *shut up*.
**That is the second sitting running in which an authored replacement introduced the very fault it was
repairing** — batch 117 did it to 行人 — so the rule stands and is worth repeating: **re-run the
checker after authoring, not only before.** All three are fixed and the range now reads zero.

**No changelog line and no version bump** — a community deck is not a change to Folio, and nothing in
the app changed.

## Batch 133 — `hsk30l6` notes 151–180 (趁 → 愁)

**Eleven of thirty changed; nineteen read and left.**

**THE BATCH'S FINDING IS ABOUT THE RECORD RATHER THAN THE DECK, and it is worth having.** 尺's three
sentences were 尺码, 公尺 and 公尺 — all three swallowing the headword, and the last two a near-repeat
of each other besides — so all three were dropped. The applier then **FAILED**:

```
FAIL  2 `exEn` row(s) naming a sentence the note has not got:
      hsk30l6/尺 → 该建筑高一百公尺。
      hsk30l6/尺 → 这块木板大约两公尺长。
```

Those two rows were written by the **ONE-WAY-ROW sweep of batch 32**, which found 33 sites across 22
cards where an American spelling sat in a family `SPELL_PAIRS` marks one-way — and rewrote these two
sentences' *meter* to *metre*. Dropping the sentences orphaned the repairs. **`exEn` FAILS rather than
warns where `dropEx` merely reports**, and that asymmetry is exactly right here: a `dropEx` matching
nothing is usually a repair already made, where an `exEn` matching nothing is always either a typo or
this — a later batch quietly undoing an earlier one. Both rows are removed with the sentences they
named, and the record says so. **Nothing is lost**: the English repair went with the sentence, and 公尺
is now one of the card's `Compounds` rows instead. **When a batch drops a sentence, check the record
for earlier rows that name it** — the applier will catch it, but it catches it as a hard failure in
the middle of a ten-card write.

**成 was glossed as a measure word and all three of its sentences are the verb.** The card read
`measure word | one tenth; proportion` over 您想成为什么, 功到自然成 and 也许他不会成名 — *to become*,
*to succeed* and *to become famous*. CC-CEDICT leads with *to succeed / to finish / to complete / to
become* and puts *one tenth* last; the card had taken the tail of the entry and shown none of the head.
Two of the three sentences swallow the character besides (成为, 成名), so it is now three senses with
an authored sentence for each of the two the deck had lost: 他后来成了一名医生 and
今年的产量增加了两成.

**诚信 was a noun glossed as an adjective, twice over.** The card read `adjective | genuine` over three
sentences that are all the noun — *honesty is a virtue*, *in business one must have* 诚信, *integrity
is the best signboard*. And fixing the gloss alone left `adjective | honesty; trustworthiness`,
because **`gloss` replaces the gloss TEXT and leaves the part-of-speech label standing**; `senses`
writes both. That is the third card this audit has had to set through `senses` for that reason (显然,
升, now 诚信), and it is worth stating as a rule: **when the label is wrong too, the row is `senses`,
never `gloss`.**

**Three more swallowed headwords.** 盛's 全盛时期 is 全盛; 愁's 乡愁 and 愁闷 are both compounds, which
left one real sentence on that card out of three. 尺 is above.

**撑 and 抽奖 each carried a repeat.** 撑's second and third are both a rope holding a weight;
抽奖's first two are 活动结束后**还**有抽奖 and 活动结束后有抽奖 under the *same English*, which is
`check-senses.js`'s exact check and which it had been reporting as `u_hsk30l6_178`.

**Two sentences ended bare** — 城镇's 我不想在城镇的那个地方买房 and 冲突's 他们有时候有矛盾冲突 —
and took an `exStop`. **And 成语's first English was a calque of a joke**: 我把成语全部还给老师了 means
*I have forgotten every idiom I was taught*, and the card read *I gave all of the Chinese proverbs back
to the teacher*, which is the words without the sense.

**Four `Compounds` panels** — 趁, 撑, 成, 盛, 尺, 愁 (six). 趁着 and 撑住 are not in CC-CEDICT, so those
two take three-row panels.

**Checks after.** `--check` clean. Coverage 11,532 notes at three sentences with 0 repeats;
shared-gloss groups 320 and still-ambiguous 1, both unchanged. `check-pinyin.js` clean;
`check-polyreading.js` 0; `check-british.js` 0; `check-example-fit.js`, `check-coarse.js`,
`check-senses.js` and `check-gloss-source.js` all name nothing in 151–180. **Verified against the real
diff: 11 of 30 changed and nothing outside the range moved.** `build-lang-decks.js` re-run. No
changelog line and no version bump.

## Batch 134 — `hsk30l6` notes 181–210 (筹备 → 创办)

**Fifteen of thirty changed; fifteen read and left.**

**SIX OF THE BATCH'S FINDINGS ARE IN THE RECORD RATHER THAN IN THE DECK, and that is the batch.**
初等, 出场, 出力, 传输 and 处处 each carried a near-repeat in which **both sentences are `ex` rows this
record authored** — 这是初等数学的问题 / 这是初等数学的内容, 他一出场，观众就鼓掌 /
演员一出场就获得掌声, 为这件事他出力不少 / 这件事他出力最多, 数据传输很快 / 数据传输速度很快,
这里处处都是花 / 春天处处是花香. They came from the **fill pass** that gave every short note its three
examples: a card needing two sentences got two written in one sitting, and the second was the first in
a slightly different frame. The pass was right to fill them and wrong about how; this is the bill
arriving.

**出入's was worse than a repeat — it was a straddle in a sentence this record shipped.**
要找**出入**侵我们系统的黑客 is 找出 + 入侵, so the card bolded two characters that belong to neither
word, on a card meaning *entry and exit, discrepancy*. Replaced with 这两份报告的数字有出入, which is
the third sense the gloss names and no sentence had shown.

**The repair for all six is an edit to the `ex` array, not a `dropEx`.** `dropEx` does filter the
record's own rows — deliberately — but reaching for it here would be writing a row to cancel a row this
same file already holds, and the file is meant to be readable. A small `swapOwn` helper in the batch
script removes the named row and pushes its replacement, and **fails loudly if the substring matches
anything other than exactly one row**, which is the guard that makes editing our own rows as safe as
dropping the deck's.

**除's gloss named a sense none of its three sentences shows, and missed the two they do.** The card
read `verb | get rid of; eliminate; remove` over 六除以二得三 (arithmetic), 除我以外 (*except*) and
孩子们还没上过除法 (arithmetic again, and 除法 swallows the character). CC-CEDICT carries all three
senses; the card had taken one and shown none of it. It is now three senses tagged 1, 2, 3, with
这块地里的草已经除干净了 authored for the one the gloss had.

**串's three sentences were all kebabs** — 烤肉串, 几串烤羊肉, 烤肉串 — two of them swallowing the
character inside 烤肉串 and the two a near-repeat besides. One real example out of three; the two
replacements cover the measure word (一串葡萄) and the verb (把这些珠子串起来).

**Two examples were passages rather than sentences.** 储存's first was a paragraph about the Mars
rover's geology mission; 传达's was a hundred characters of meditation on how hard it is to say what
you mean. 传达's second, the qipao sentence, is long too and was **kept**: it genuinely turns on the
word, which is the test.

**And three smaller things.** 传授's first English was a garbled proverb — *An ounce of wit that is
bought is **worse** a pound that is taught* — where the saying reads *worth*. 传输's survivor said
*The data transmits quickly*, which is not English. 出示, 储蓄, 传染 and 闯 each lost a deck-side
near-repeat: 出示 had two passport sentences, 储蓄 two *save now or regret later*, 传染 the same cold
given in both directions, 闯 two break-ins.

**Two `Compounds` panels** — 除, 串, 闯 (three). 一串, 手串 and 硬闯 are not in CC-CEDICT and were
replaced.

**Read and left.** 传染病's first sentence is *Life is a fatal sexually transmitted disease* — an
aphorism, grammatical, and it does teach the word; it is odd on a learner card and it is not a fault,
so it stays and is recorded here rather than swept. `check-gloss-source.js` names one card in the
range, 筹备 (*prepare; arrange* against *preparations; to get ready for sth*), which is the proxy
paraphrasing.

**Checks after.** `--check` clean. Coverage 11,532 notes at three sentences with 0 repeats;
shared-gloss groups 320 and still-ambiguous 1, both unchanged. `check-pinyin.js` clean;
`check-polyreading.js` 0; `check-british.js` 0; `check-example-fit.js`, `check-coarse.js` and
`check-senses.js` all name nothing in 181–210. **Verified against the real diff: 15 of 30 changed and
nothing outside the range moved.** `build-lang-decks.js` re-run. No changelog line and no version bump.

## Batch 135 — `hsk30l6` notes 211–240 (创建 → 打造)

**Thirteen of thirty changed; seventeen read and left.**

**THE BATCH'S FINDING IS A SENTENCE THAT SITS ON TWO CARDS AND WAS REPAIRED ON ONE OF THEM.**
村庄's second example is 到村庄有条窄路, translated *There's narrow road to the village* — missing its
article. The same sentence is `hsk30l5/窄`'s second example, where **batch 123 fixed exactly this
English**, twelve batches ago. The fix did not travel, because **an `exEn` row is keyed by NOTE**: it
names a sentence *on that card*, and a sentence the corpus uses twice needs the row twice. Nothing
reports it either — neither card is internally inconsistent, every checker here asks its questions of
one card at a time, and both cards render perfectly.

**So the class was measured over all nine decks, and it is real but mostly benign.** **2,998 sentences
appear on two or more cards**, and **145 of those carry DIFFERING English**. Read through, most of that
145 is not a fault at all: the harvest translated each card's copy separately, so 那里的气候怎么样 is
*How's the weather there?* on 怎么样 and *What is the climate like there?* on 气候, and a reader meets
one card at a time. What the list DOES contain is the shape found here — one copy carrying a fault its
twin has had fixed — and a handful that are simply worse on one side than the other
(早安，师傅 is *Good morning, master. How can I improve my listening?* on two cards and
*Good day, lords. In what way can I refine upon my adroitness in aural comprehension?* on a third).
**That is a report, not a gate**, on `check-senses.js`'s own terms, and it is recorded here as a
candidate for a checker of its own rather than swept now: 145 findings is five batches of reading, and
the rule is one batch per sitting.

**搭's gloss named a sense none of its three sentences showed, and the three were one sentence three
times.** The card read `verb | put up; build` over 我搭地铁上学, 或者你必须搭这辆公车 and
他不喜欢搭飞机旅行 — underground, bus, plane, the same construction three times, and every one of them
the *take a vehicle* sense the gloss does not carry. CC-CEDICT gives both. Two senses now, one deck
sentence kept for the first and two authored for the second.

**Two more borrowed words swallowing their character.** 刺's third example was 我喜欢吃刺身 —
刺身 is *sashimi*, the Japanese word written in Chinese characters — and its first was 她有刺青吗,
刺青 being a tattoo, which is also the sentence batch 104 struck off the 青 card for the same reason.
**One sentence, two cards, the same fault on both**, which is the batch's finding arriving a second
time from the other direction.

**Three more cards had almost no sentence on them**: 纯 (纯净, 纯素食), 寸 (肝肠寸断, 方寸大乱) and
匆匆, whose third example is 匆匆忙忙 — the reduplication of 匆忙, the NEXT card, not of this one.

**Two faults were the record's own** — the class batch 134 opened. 从业's first two rows carried the
**same English word for word** over 他从业**已经**二十年了 and 他从业二十年了, which is
`check-senses.js`'s exact duplicate-English check and which it had been reporting as `u_hsk30l6_223`.
挫折's first row was a 78-character paragraph harvested from the sentence bank, about how setbacks let
us *see decisive opportunities clearly*. Both repaired through `swapOwn`.

**And three smaller things.** 此刻's third English was machine-translated —
*This moment will nap, you will have a dream; But this moment study,you will interpret a dream* —
missing space and all. 创立's second and third were both *X was founded in YEAR*. 答复's third ended
bare and took an `exStop`. 脆's first was 巧克力脆饼 glossed *chocolate chip cookies*, which is a
different biscuit as well as a swallowed headword.

**Five `Compounds` panels** — 纯, 刺, 醋, 脆, 寸, 搭 (six). 寸步 is not in CC-CEDICT, so 寸 takes a
three-row panel.

**Read and left.** `check-gloss-source.js` names 匆忙 (*hastily; in a hurry* against *hasty; hurried*),
which is the proxy paraphrasing. 垂直's 垂直的金发 is hair hanging straight down, which is a real use of
the word whatever *straight* suggests. 从未's 他从未看不起穷人 is stilted rather than wrong.

**Checks after.** `--check` clean. Coverage 11,532 notes at three sentences with 0 repeats;
shared-gloss groups 320 and still-ambiguous 1, both unchanged. `check-pinyin.js` clean;
`check-polyreading.js` 0; `check-british.js` 0; `check-example-fit.js`, `check-coarse.js` and
`check-senses.js` all name nothing in 211–240. **Verified against the real diff: 13 of 30 changed and
nothing outside the range moved.** `build-lang-decks.js` re-run. No changelog line and no version bump.

## Batch 136 — `hsk30l6` notes 241–270 (打仗 → 当选)

**Eleven of thirty changed; nineteen read and left.**

**大都 was glossed as a city that has not existed since 1368.** The card read
`adverb | Dadu, capital of China during the Yuan Dynasty` — which is CC-CEDICT's **first** entry for
the string, a proper noun, sitting under an adverb label — while all three of its sentences are the
adverb *for the most part*: 汤姆的朋友大都没你高, 来的人大都是学生. The sense the card actually teaches
was not glossed at all. It is the leading-sense trap at its widest: the dictionary's head entry was not
merely a different sense of the same word but a different word, a place name, and the card took it.

**Its reading is left alone, and the reason is worth recording.** CC-CEDICT gives the adverb as
`da4 dou1` with `da4 du1` marked *also pronounced*, and the proper noun as `da4 du1`. The card says
`dà dū`, which is therefore the rarer but accepted reading of the adverb — not wrong, and changing it
would be this audit choosing between two attested pronunciations on no evidence. Recorded rather than
changed.

**Its second example was a straddle besides**, and one of the record's own: 许多欧洲的**大都**市 is
大 + 都市, a metropolis.

**当今 was the same fault in miniature** — `noun | current`, an adjective glossing a noun, over three
sentences that all say *today's world*. That is batch 31's third shape (the label and the gloss are
different parts of speech), and **the fourth card this audit has had to set through `senses` for it**,
after 显然, 升 and 诚信. Reported by `check-gloss-source.js`, which is the only thing here that can see
it.

**带领's first example carried a character error.** 老师正在带领小朋友们**嘻戏** — the word is 嬉戏,
*to play*; 嘻 is the laughter character and 嘻戏 is not a word. The sentence speaks and segments without
complaint, and its English (*The teachers are playing games with students in the kindergarten*) never
mentions leading, which is the word the card is for.

**Three more of the record's own rows went.** 代理's was 47 characters of marketing copy about an
on-line customer service desk and *trained support agents*; 大洋洲's second was
*Australia is in Oceania* beside the deck's own *Australia is the largest country in Oceania*; 大都's
is above. All three repaired through `swapOwn`.

**Two English translations were a different sentence from the Chinese.** 担忧's 担忧只是想象力的误用
says *worry is only a misuse of the imagination* and was translated *Most of the things you worry about
never happen!*, which is a different aphorism. 耽误's 可以耽误你一点时间吗 was *Do you have a minute?*,
which is what one would say in English and never mentions the word. 大吃一惊's third was *I think
you're really amazing*, a compliment where the idiom means *taken aback*.

**And the smaller ones.** 呆's first example was 书呆子, a bookworm, swallowing the character. 大幅's
first and third were both *X increased greatly*. 当今's second had awkward Chinese
(拥有双语种) and no terminal stop. 当下's third opened on 为何如何？, which is not Chinese.

**One `Compounds` panel** — 呆.

**AND THE SITTING NEARLY INTRODUCED A NEAR-REPEAT OF ITS OWN, WHICH IS THE THIRD TIME.** The sentence
first authored for 带领 was 导游带领我们参观了故宫 — 带领 X 参观 Y, which is the construction of the row
already on that card. Caught by reading the card back after applying, and replaced with
在他的带领下，球队赢了比赛. Batches 117 and 123 were the checker catching a straddle; this is the same
lesson where **no checker can help**, a near-repeat being invisible to every tool here. **Read the
finished card, not just the diff.**

**Read and left.** 大吃一惊's gloss prints *(idiom)* twice — cosmetic, the deck's own formatting, and
not worth a row. 当选's first two are both about a chairman but in different constructions. 大师's
大师级作品 has the word in it.

**Checks after.** `--check` clean. Coverage 11,532 notes at three sentences with 0 repeats;
shared-gloss groups 320 and still-ambiguous 1, both unchanged. `check-pinyin.js` clean;
`check-polyreading.js` 0; `check-british.js` 0; `check-example-fit.js`, `check-coarse.js` and
`check-senses.js` all name nothing in 241–270. **Verified against the real diff: 11 of 30 changed and
nothing outside the range moved.** `build-lang-decks.js` re-run. No changelog line and no version bump.

## Batch 137 — `hsk30l6` notes 271–300 (档案 → 吊)

**Seventeen of thirty changed, plus one card in Level 5 — the worst range this audit has met.**

**THREE CARDS IN ONE RANGE WERE GLOSSED FROM THE OTHER READING OF THEIR OWN CHARACTERS.** That fault
has turned up one card at a time for thirty batches; here it is 当天, 地道 and 倒车 within thirty
notes, which is enough to say something about the pipeline rather than about the cards. CC-CEDICT files
a two-reading string as two separate entries, and a gloss taken off the top of a `grep` takes the first
of them whatever the card's pinyin says.

- **当天** reads `dàng tiān`, which the dictionary glosses *the same day*; the card said *on that day*,
  which is the `dāng tiān` entry. Both of its usable sentences — the post office on Christmas Day, the
  ticket valid on the day — are the `dàng` reading, so the gloss was the one thing out of step.
- **地道** reads `dì dao`, the neutral-tone adjective glossed *authentic; genuine; proper*, and all
  three sentences are that sense: idiomatic Russian, authentic Chinese. The gloss led with
  *tunnel; underpass*, which is `dì dào`.
- **倒车 is the same fault at full size and took a different repair.** Its pinyin, its bopomofo AND its
  gloss all said `dǎo chē`, *to change buses or trains* — and **all three of its sentences were
  `dào chē`, backing a car into a garage**, two of them the same sentence with the subject changed. Both
  readings are ordinary words, so the card now **teaches both**, as 重, 系 and 精神 already do, with each
  sentence tagged with the reading it shows and two authored `dǎo chē` sentences replacing the duplicate
  pair. A slash in the pinyin field is what makes `check-pinyin.js` skip a card, which is right for a
  two-reading card and is why its cross-checked total falls by one.

**得了 had the word in none of its three sentences.** 我得了金牌 is 得 + 了, the verb *to get* with its
aspect marker; 还有几个小时才到得了 and 拿不得了 are the potential complement `de liǎo`, the
dictionary's second entry and a different reading again. The card teaches the interjection `dé le`,
*all right! that's enough!*, and nothing on it showed that — while its label read *verb / particle*,
which is what the two characters are **separately** rather than what the word is. Three authored
sentences and an `interjection` label.

**地域 was glossed `area`, which is 面积's entire gloss** — so the two cards were one English prompt with
two right answers, and BOTH carried a `not <other word>` hint to be answerable at all. All three of
地域's sentences are regions: customs, accents, regional character. The sharper gloss
*region; district; territory* is the real distinction the hint was papering over, so **both hints are
removed with it** — which is why this batch touches a Level 5 card. The coverage checker confirms it:
shared-gloss groups 320 → 319, groups carrying a disambiguator 319 → 318, **still ambiguous unchanged at
1**. That is the rule this record already follows — a collision hiding a real distinction wants a
sharper gloss, not a disambiguator — applied in the direction that REMOVES a hint rather than adding one.

**Two straddles and two swallows**, the two arrangements of one fault. 当天's 当天气变冷的时候 is
当 + 天气; 得以's 错误多得以至于 is 多得 + 以至于 — **both of them this record's own rows from the fill
pass**. 岛's 长岛家的亲戚 is the Japanese surname Nagashima; 滴's 雨滴敲打窗户玻璃 is *raindrop*, a noun
of its own; 吊's 吊带是最安全的 is a strap or a sling. All four single-character swallows are invisible
to `check-example-fit.js`, which skips a one-character headword by design.

**And the rest.** 导师's English said *homeroom teacher*, which is 班主任. 灯笼's said *lamp*. 滴's
滴酒不沾 was narrowed to *beer*. 得知's 他得知了他的错误 was *He acknowledged his faults*, which 得知
does not mean, over Chinese that does not work either. 典型 carried a **character error** — 我对中的印象,
missing the 国 of 中国 — beside a four-character stub. 地质's first example was ninety characters of
Mars-rover mission copy with regolith in the English; 点燃's third was Exodus 22:6 in classical Chinese
under the King James; 电源's was an odd simile calling a man a filthy appliance, whose English said
*battery* where the Chinese says power supply. 地形 and 点燃 each carried a near-repeat besides.

**Three `Compounds` panels** — 岛, 滴, 吊.

**AND THE SITTING INTRODUCED THREE NEAR-REPEATS OF ITS OWN, one of them a NEW SHAPE.** Two were the
familiar kind, caught by reading the finished card: 得知's replacement was about hearing 消息 from the
news, which is what the sentence already on the card says, and 岛's opened 岛上, the construction already
there. **The third is worth naming because no reading of one card could catch it**: the sentence authored
for 地质 read 这一带的地质结构很复杂, *the geological structure around here is complicated* — all but word
for word 地形's own 这一带地形复杂, **two cards earlier in the same deck**, in both languages. A near-repeat
ACROSS two cards, which nothing here asks about and which only reading the two finished cards together
shows. It belongs with the 2,998-sentence measurement from batch 135 as a candidate for a checker of its
own.

**Read and left.** 道德, 点击, 典礼, 电饭锅, 电力, 店铺, 抵达, 抵抗, 倒是, 得了's siblings 倒闭 and 档案,
低碳, 等级 and 打仗 are sound. 大吃一惊's `check-gloss-source.js` finding is batch 136's, unchanged and
still the proxy paraphrasing.

**Checks after.** `--check` clean. Coverage 11,532 notes at three sentences with 0 repeats; multi-sense
notes 626 → 627 and multi-category labels 1,383 → 1,382, both the arithmetic of 倒车 and 得了.
`check-pinyin.js` clean at 11,458 cross-checked and 74 skipped; `check-polyreading.js` 0;
`check-british.js` 0; `check-example-fit.js`, `check-senses.js`, `check-coarse.js` and
`check-say-reading.js` all name nothing in 271–300. **Verified against the real diff: 17 of 30 changed
in Level 6, nothing outside the range, and exactly one card in Level 5 — 面积, whose hint the 地域 gloss
retired.** `build-lang-decks.js` re-run. No changelog line and no version bump.

## Batch 138 — `hsk30l6` notes 301–330 (调动 → 蹲)

**Twenty-one of thirty changed.** Two findings here are about the pipeline rather than about any card,
and both are recorded with their measurements because neither has a checker.

### `manoeuver` is neither spelling, and no checker here can ever see it

调动 was glossed *transfer; shift; **manoeuver***. British English writes **manoeuvre** and American
English **maneuver**; `manoeuver` is neither, and the same deck writes `manoeuvre` correctly four lines
over and six more times in Levels 7–9. **`check-british.js` reads 0 on it and always will**: that
checker asks whether a word is the American member of a declared GB/US pair in `SPELL_PAIRS`, and a
misspelling belongs to neither side of any pair. It is invisible to the one tool that reads the decks'
English, and was found by reading the gloss. The rewritten gloss drops the word rather than repairing
it, *to redeploy* being what the card's own sentences show.

### THE BRITISH PASS DOES NOT REACH THREE OF THE DECKS' FIELDS — 549 SITES, MEASURED

Pulling that thread found something larger. `exBritish` in `mandarin-fix.js` sweeps exactly three
things — `fields.English`, `fields.Examples` and `answerText` — and the Mandarin card type has more
English fields than that. Measured across all nine decks against `SPELL_PAIRS`'s own two-way rows:

| field | American spellings in it | notes |
|---|---|---|
| `Characters` (the component-breakdown panel) | **547** | 475 |
| `Compounds` (authored by THIS AUDIT) | 1 | 1 |
| `Literally` (the Idioms deck) | 1 | 1 |
| everything the pass does sweep | **0** | — |

The `Characters` count is `labor` 250, `color` 203, `favor` 40, `plow` 18, `specialized` 16, `armor` 7,
`honor` 5, `armory` 5, `skillful` 3 — **every one of them a word the table already carries**, surviving
only because the pass does not reach that field, on 4% of the corpus. A reader meets `labor` 250 times
in a deck authored British.

**And the sharpest part is about this audit's own work.** The `Compounds` panels — forty-odd of them now,
three more in this batch — are authored by hand into a field `exBritish` cannot reach, and one already
carries an American spelling (`hsk30l5/集`, *centralize*). Nothing would have caught it; nothing caught
it until this measurement. `重整旗鼓`'s `Literally` line carries *reorganize* for the same reason.

**Both are left unfixed here, deliberately.** Batch 76's rule is that the fix for a mechanical class is
the table and never the sites; one level up, the fix here is the PASS and never the sites. Widening the
swept-field list repairs all 549 mechanically and proves itself by converting 集's row — that is the next
batch, and it is a `.claude/` helper change, so still no changelog line.

**A second, separate gap measured while there**: `SPELL_PAIRS`'s 39 `-is/-iz` rows were chosen for
Folio's OWN prose (`colonis`, `sovietis`, `hellenis`, `fossilis`) and the decks' English is a different
vocabulary — **62 distinct American spellings over 97 occurrences and 45 stems** that no row covers:
`fertilizer`, `generalize`, `publicize`, `optimize`, `sympathize`, `jeopardize`, `authorization`,
`hypnotize`, `synchronize`, `visualize`, `customize` and the rest. That is batch 76's finding again
(*a family can be in the table with members missing, and it reads 0 exactly like an absent family*), and
it needs rows rather than edits. **The measurement's own trap is worth keeping**: a stem rule over that
suffix also catches **`prize` 42, `seize` 40, `size` 29 and `maize` 2** — 113 occurrences where `-ize` is
the only English spelling there is, and where a rule would write *prise*, *seise*, *sise* and *maise*.
This is why the table is declared and never derived.

### The cards

**Ten of the thirty carried a near-repeat**, which is the most this audit has found in one range, and
**seven of the ten were this record's own rows** from the fill pass that brought every note to three
sentences. 定价 had *this book is priced at thirty yuan* beside *this book is priced at forty yuan*;
对称 had 这座建筑左右对称 beside 这幢建筑左右对称, differing by the measure word alone; 动态 had two
sentences whose English was word for word identical; 对接 had 两艘飞船成功对接 beside 飞船成功对接, one
a truncation of the other — so close that **the swap helper matched both rows and refused to write**,
which is the sharpest possible statement of the problem and is what that guard is for. 调动, 钓鱼, 订婚
and 定制 are the same shape. 短缺 is the exception that proves it: *the recent coffee shortage caused
many problems* twice over, and **both were the deck's own rows**, not this record's.

**栋 was a third kind**: all THREE sentences counted 房子 — this house, that small house, a new house —
so a measure word that classifies buildings of every kind was shown doing one job.

**Four cards had a gloss and a label that were different parts of speech** — 端 (*end; extremity*, two
nouns, under `verb`, while its own second sentence is the verb and was glossed nowhere), 短缺 (*shortage*
under `verb`), 对称 (*symmetry* under `adjective`) and 对抗 (the noun *confrontation* leading a `verb`
label). That is now nine cards this audit has set through `senses` for it.

**蹲 glossed one sense and taught another**: *squat on the heels; to crouch*, with TWO of its three
sentences 蹲监狱, doing time — CC-CEDICT's third sense, *to stay (somewhere)*, which the card did not
carry. The gloss now says so and one prison sentence is replaced, so the card shows both.

**定位's entire gloss was *to orientate***, CC-CEDICT's leading word and not what any of its three
sentences does — bats locating obstacles, a phone finding where you are, a product's market positioning.

**Five swallows**, all on single-character cards and so skipped by `check-example-fit.js` by design:
顶嘴 on 顶, 逗号 on 逗, 原动力 on 动力, 开端 on 端, and 狠毒 plus 吸毒 and 服毒 on 毒, whose three
sentences were all compounds so that a card glossed *poison; toxin* never showed the bare noun.
**渡's was the funniest this audit has met**: 渡渡鸟 is the DODO, so the character appeared twice inside
one word and the sentence was about an extinct bird. Its third wrote the holiday 度假 as 渡假, the Taiwan
variant and a different word from the one the card teaches.

**Five `Compounds` panels** — 跌, 顶, 逗, 毒, 渡.

**AND FOR THE FOURTH BATCH RUNNING, THE SITTING INTRODUCED A NEAR-REPEAT OF ITS OWN.** 对称's first
replacement ended *is not perfectly symmetrical* over a row already reading *is perfectly symmetrical*;
replaced again with an adverbial construction. Reading the finished card is now catching one of these
every single batch, which says the habit that produces them is not going away and the read-back is not
optional.

**Read and left.** 斗争, 都市, 动机, 动漫, 定时, 定义, 对立, 对应, 跌's three sentences and 动听 are
sound. `check-gloss-source.js` names 定制, 动态 and 对应 — all three the proxy paraphrasing correctly in
words the dictionary does not use. `check-example-fit.js` names 民众, which is out of this range: its
全国民众 splits as 国民 + 众, and the sentence is shared with 对抗.

**Checks after.** `--check` clean. Coverage 11,532 notes at three sentences with 0 repeats; shared-gloss
groups 319 and still-ambiguous 1, both unchanged. `check-pinyin.js` clean; `check-polyreading.js` 0;
`check-british.js` 0 (which this batch has just shown means less than it looks);
`check-senses.js`, `check-coarse.js` and `check-say-reading.js` name nothing in 301–330. **Verified
against the real diff: 21 of 30 changed, nothing outside the range.** `build-lang-decks.js` re-run. No
changelog line and no version bump.

## Batch 139 — the British pass's own blind spot (all nine decks, 479 cards)

**Not a range of notes but the finding list batch 138 measured and deferred**: `exBritish` swept three
fields and the Mandarin card type has six. **479 cards changed across all nine decks**, and the diff
matches the prediction exactly — 475 `Characters` panels, 2 `Compounds`, 1 `Literally`, 1 `English`.

### What was fixed

`exBritish` and `exLexis` in `mandarin-fix.js` now reach `Characters`, `Compounds` and `Literally`
beside `English`, `Examples` and `answerText`. The words converted are the ones measured last batch:
**labor 250, color 203, favor 40, plow 18, specialized 16, armor 7, honor 5, armory 5, skillful 3**,
plus `centralize` in a `Compounds` panel this audit authored and `reorganize` in 重整旗鼓's `Literally`
line. A reader was meeting `labor` 250 times in a deck authored British.

**THE SELECTOR IS PER FIELD, NOT A UNION, AND THE IDIOMS DECK IS WHY.** Each field is swept only where
its English lives — an `<i>` gloss in `Characters`, a `uc-cmpg` span in `Compounds`, the whole string in
`Literally` — because `Characters` carries a pinyin in `uc-ptp` beside every gloss and `Compounds` one
in `uc-cmpp`, and running an English word list over a romanisation is the thing `answer` is re-derived
to avoid. A first cut fired all three selectors at every field, which works today and is one line from
disaster: the Idioms deck's `Origin` line carries **70 bare `<i>` WORK TITLES** — *<i>Analects</i>*,
*<i>Book of Documents</i>* — so the day `Origin` joins the swept list, a union selector would put a
word-choice table through the name of a published work.

**`check-british.js` was widened to match, and it is the more important half.** It read the same three
fields, so it reported 0 truthfully about the two-thirds of the card it was looking at. **A checker's
reading of zero is only ever a statement about what it reads** — that is this batch's whole lesson, and
it is the third form of it this audit has met, after batch 76's missing table rows and batch 138's
`manoeuver`. Proved by planting `specialized` back into one `Characters` panel and watching the widened
checker name it, then clearing it with the pass.

### Two things the widening broke or found, both caught by reading rather than counting

**THE SWEEP CREATED A DUPLICATE, AND ONLY THE DIFF COULD SHOW IT.** 龙's `Compounds` row — this
record's own — glossed 龙头 as *tap; faucet; front-runner*, CC-CEDICT's own wording, which lists the
British and the American word **side by side**. Converting the American one left **`tap; tap;
front-runner`**. That is batch 26's rule word for word: *read the diff line by line; counting what is
left cannot see what a swap broke*. The row now reads *tap; front-runner*, which is what an authored
British panel should have said to begin with. A sweep for a repeated term across all four English
fields found exactly one other, and it is **not** the sweep's: 替补 has read
`verb / noun  substitute ; substitute` since before this audit began — two senses glossed with the same
word, so the noun and the verb were indistinguishable and the reverse card asked one question with one
answer written twice. Set through `senses` to *to replace; to substitute for* and *a substitute; a
replacement*.

**AND THE RECORD NEARLY LOST AN ENTRY, WHICH ONLY THE NOTE COUNT COULD SHOW.** The 替补 row was first
written under the key `hsk3079/替补`; the applier refused it as matching no note — correctly, the deck's
key is `hsk30l7` — and the rekey **overwrote that note's existing fill-pass entry wholesale**, taking its
two example sentences and its `why` with it. **`--check` passed afterwards**, and had to: a record that
has lost an entry and a deck rebuilt from that record agree perfectly. What caught it was arithmetic —
**8,544 notes before adding a note and 8,544 after** — and nothing else in the pipeline could have. The
entry is restored and the new `senses` merged into it. **Check the note count after any run that adds
one**; a rekey is a delete and an insert, and the delete is silent.

### The other half is deferred again, and the measurement says why

`SPELL_PAIRS`'s 39 `-is/-iz` rows still miss **62 distinct American spellings over 97 occurrences and 45
stems** in the decks' English. Adding the rows is an app change, and this batch measured what it would
do to the other corpus: **about 45 American spellings would appear at once in FOLIO'S OWN PROSE** —
`nationalization` ×8 in a Politics card, `optimizing`/`optimization` ×9 across the geography and biology
collections, `digitized`, `popularized`, `localization`, `sterilization`, `visualization`, `baptized`,
`monopolized`, `patronizing` in `countries.js`, one in `truefalse.js` and one in `quotes.js`.
`check-spelling-corpus.js` reads the prose as clean **because those rows are missing**, which is exactly
the blind spot CLAUDE.md names (*a family nobody added is a family nobody can see*) — now measured on
both corpora rather than asserted about one. So it is a pass of its own: the rows and the ~45 prose
fixes in one commit, with a changelog line and a version bump, since that one really is a change to the
app.

### Checks after

`--check` clean, and the pass is **idempotent** (a second run writes nothing, verified by checksum).
`check-british.js` 0 over the six fields it now reads; `check-pinyin.js` clean; `check-polyreading.js`
0; `check-say-reading.js` 0. Coverage 11,532 notes at three sentences with 0 repeats; shared-gloss
groups 319 and still-ambiguous 1, both unchanged — this batch changed English spelling, not glosses,
with the two exceptions named above. **Verified against the real diff: 479 cards over nine decks, and
the changed fields are 475 `Characters`, 2 `Compounds`, 1 `Literally` and 1 `English` with its two
mirrors — no field this batch did not intend to touch.** One deck file was edited by hand for the
liveness probe above and the applier rewrote it in the same minute; the checksum test confirms it left
no trace. `build-lang-decks.js` re-run. **No changelog line and no version bump**: both tools are
`.claude/` helpers and the rest is deck content.

## Batch 140 — the `-is/-iz` table gap (an app change, 70 deck cards)

**The half batch 139 deferred, and the deferral's own reasoning turned out to be wrong in the one way
that mattered.** `SPELL_PAIRS`'s 39 `-is/-iz` rows were chosen for Folio's own prose — `colonis`,
`sovietis`, `hellenis`, `fossilis` — and the language decks' English is a different vocabulary
entirely, so **62 distinct American spellings over 97 occurrences and 45 stems** had no row at all and
`check-british.js` read 0 on every one of them. **45 rows added; 70 deck cards converted**, every stem
represented: `fertilizer`, `generalize`, `publicize`, `optimize`, `sympathize`, `jeopardize`,
`authorization`, `hypnotize`, `synchronize`, `visualize`, `customize`, `baptized`, `uncivilized` and
the rest.

### THE DEFERRAL'S REASON WAS AN OVERCOUNT, AND SAYING SO IS THE POINT

Batch 139's log said adding the rows would surface **"about 45 American spellings at once in FOLIO'S
OWN PROSE"**, and listed `nationalization` ×8, `optimization`, `digitized`, `baptized`, `patronizing`.
That figure came from a raw `grep` over the data files. **With the rows actually added, Folio's own
prose yields exactly ONE** — `popularized` in the `Genus` glossary term. Every other site is a
**CITATION**: *The Internationalization of Public Interest Law*, *Nationalization and its Alternatives*
and 142 more published titles, which `check-spelling-corpus.js` counts apart as borrowed text and which
must never be rewritten — the mask that, the one time it was missing from `check-style.js`, renamed six
real works. **A grep over a data file cannot tell a card's prose from the titles it cites**, and the
checker that can was sitting one command away the whole time. The deferral was still the right call;
its stated reason was not.

### What the corpus checker actually found, and two of the four were not faults

It was reading **4 findings before this batch even began** — drift since the last pass — and the new
rows added a fifth:

- **`Civilizational` / `civilizational` on `pea-014`**, in `answer`, `answerText` AND `abstract`: the
  card's own answer term, in American, on the one collection whose subject makes the word unavoidable.
  Fixed through `fix-field.js`, one field at a time. (It has no paired glossary term at all — a pairing
  gap, recorded and out of scope here.)
- **`popularized` in `gloss:Genus`** — the one site the new rows surfaced. Fixed through
  `add-sources.js` with its three citations carried through unchanged.
- **`flavor` in True-or-False #67 is NOT A FAULT**: it sits inside a quotation from the Supreme Court's
  1911 record — the trade-mark papers say the extracts were used *"for the purpose of obtaining a
  flavor"*. **A quoted document is borrowed text however British the sentence around it.** Declared in
  `KEPT`, keyed by item AND word, so a different American spelling creeping into that statement still
  reports.
- **`Tumors` in #101 is not a fault either**: the *Registry of Tumors in Lower Animals* is the
  Smithsonian's own registry, closed in 2013. Declared in `NAMES`, beside *Pearl Harbor* and the
  *Indian Reorganization Act*.

**Folio's own prose reads ZERO again**, now with 45 more families in the table than when it last did.

### The rows, and the one thing that makes several of them safe

Each stem is justified by a measured occurrence in the decks; none was added on spec. **The suffix list
deliberately omits the bare stem**, and that is not tidiness — it is what makes `synthesis` the noun,
`Polaris` the star, `optimism`, `socialist` and `Baptist` unmatchable, since each is the stem plus a
suffix that is not in the list. **Adding an empty element to any of those rows would rewrite all five.**
And the measurement's own trap is recorded in the table's comment, because it is the argument against
ever making this family a rule: the same suffix catches **`prize` 42, `seize` 40, `size` 29 and `maize`
2**, where `-ize` is the only English spelling there is and a stem rule would write *prise*, *seise*,
*sise* and *maise*.

### Checks after

`test-spelling.js` 71 passed; `check-truefalse.js` clean over 216 statements;
`check-spelling-corpus.js` 0 in Folio's own prose; `check-british.js` 0 over the six fields it now
reads; `split-cards.js --check` clean; the whole fast gate green (295 + 7 + 15 + 72 + 22 + 136 + 15
assertions, `check-docs`, `check-questions`, `check-style`). `check-claims.js` reads **0 drifted** after
CLAUDE.md was brought into step — the 196-row figure, the pass's swept fields, the closed family, and
app.js's own size and line count, which had drifted with this change.

**Verified against the real diff**: 70 deck cards over four decks, plus `pea-014`, the `Genus` term, the
two declared rows, `app.js`, `changelog.js` and CLAUDE.md. `build-lang-decks.js` re-run.

**THIS ONE DOES CARRY A CHANGELOG LINE AND A VERSION BUMP** — 1.871 → **1.872**, `released` read off the
clock — because the table is the app's and the change is reader-facing: an American reader now gets
American spellings on 45 more families of word. The deck files that moved with it are deck content and
get no line of their own.

## Batch 141 — `hsk30l6` notes 331–360 (顿时 → 凡是)

**Twenty-three of thirty changed, plus three cards in Levels 7–9 that a table row reached.** Back to the
running order, and the range found one fault that is about a checker rather than a card.

### `check-gloss-source.js` was crying wolf on 68 correct glosses

儿科 was glossed **`pediatrics`** over an example saying **`pediatrician`** — while two of its own
sentences said *paediatric*. **The card contradicted itself and `check-british.js` read 0**, the `-ae-`
family having no `paediatric` row: batch 138's `manoeuver` and batch 140's `-is/-iz` gap for the third
time, and this one found by reading a card rather than by any sweep. Three rows added — `paediatric`,
`anaesthe`, `haemorrhag` — measured first at **5 deck sites** (儿科, 知觉, 麻醉, 膜) **and none in
Folio's own prose**, which already writes `oestrogens`.

**Then the fix made a second fault visible.** With the gloss in British, `check-gloss-source.js` reported
儿科 as sharing no content word with CC-CEDICT — because **CC-CEDICT is an American dictionary and these
decks are authored British**, so the two can never agree on those words. Measured: **68 of its 993
findings** were exactly that, `colour` against *color*, `neighbour` against *neighbor*, `kilometre`
against *kilometer*, `theatre`, `programme`, `criticise`, `to apologise` — **and the class grows every
time a row is added to `SPELL_PAIRS`**, as 48 were in the two days before this. The checker's own header
says a list a quarter of which is right teaches the next person to ignore it; this was 7% and rising.
The card's gloss is now put into American through **app.js's own table, sliced out by text with the run
stopping if the slice fails**, before the compare — it changes what is COMPARED and not what is
reported, so a finding still prints the card's own British wording. **993 → 928, and the drop set was
read in full: 68 dropped, 0 added, and every one of the 68 is a spelling-only difference** — which is
the standing rule that a tightening is judged by its drop set and never by its count.

### The cards

**Ten near-repeats again**, and this range's are the plainest yet. 发票 carried **the same English word
for word** — *Please give me a receipt* — on two different Chinese sentences, which **nothing here can
see**: `check-mandarin-coverage.js` reports a note showing the same SENTENCE twice and compares the
Chinese, so two Chinese sentences sharing one English are invisible to it. 法定 had *a statutory
holiday* beside *a statutory rest day*; 发育 the same child developing twice; 二氧化碳 plants absorbing
it twice; 多才多艺 the same predicate with the subject changed; 耳环 the same pair of earrings; 348 发动
the same car that would not start; 343, 332 and 354 likewise — **seven of the ten this record's own rows
from the fill pass**.

**Three glosses were the wrong sense or the wrong part of speech.** 多元's entire gloss was **`poly-`**,
a bound prefix rather than a word, taken off the head of CC-CEDICT's entry — a reverse card asking for
*poly-* is one nobody can answer. 发行 was **`sell wholesale`**, which is not in the dictionary's entry
at all and is not what any of its three sentences does. 发炎 was **`inflame`**, a transitive English
verb meaning to rouse, where 发炎 is intransitive — *to become inflamed*, which is what all three of its
sentences are.

**躲避 was glossed as its own neighbour.** *To hide* is 隐藏's whole gloss, so the two cards were one
English prompt with two right answers and **both carried a `not <other word>` hint** to be answerable.
All three of 躲避's sentences are avoiding — the questions, the storm, the plague. The sharper gloss
*to avoid; to dodge; to take shelter from* is the distinction the hint was papering over, so **both
hints go with it**: shared-gloss groups 319 → 318, disambiguators 318 → 317, still ambiguous unchanged
at 1. **The second time this audit has been able to REMOVE a disambiguator rather than add one**, after
地域 / 面积.

**A straddle and two swallows.** 顿时's 当我第一次回波士顿时 is **波士顿 — BOSTON — plus 时**, so the
card's own word was not in the sentence at all. 番's 吐鲁番 is **TURPAN**, the character standing inside
a place name; 发电's 发电报 is *to send a telegram*. 夺's three sentences were all compounds, two of
them the same one, so a card glossed *to seize* never showed the bare verb.

**番 also had a label naming one sense over a gloss naming another** — `measure word` above *foreign*,
which are two different entries — so both are glossed now and the `Compounds` panel shows the bound
*foreign* sense where a learner meets it, in 番茄. **Two `Compounds` panels**, 夺 and 番.

**AND FOR THE FIFTH BATCH RUNNING THE SITTING INTRODUCED ITS OWN FAULT — but this time a CHECKER caught
it.** The sentence authored for 发票 opened **开发票**, which segments 开发 + 票, 开发 being *to
develop*: the very straddle this batch was repairing three cards earlier.
`check-example-fit.js` named it. The other two were the familiar kind and were caught by reading the
finished card — 多才多艺's replacement was a third *X 多才多艺* predicate, and 耳环's read 耳朵上的耳环,
*the earrings on her ears*, which is redundant in Chinese.

**Read and left.** 多媒体, 发病, 发愁, 发放, 发光, 法官, 繁忙, 凡是, 恶心's two survivors and 多亏 are
sound. 凡是's second sentence is a Mao slogan, which is a real and well-known line that teaches the word
and stays.

### Checks after

`--check` clean. `check-pinyin.js`, `check-polyreading.js`, `check-british.js` and
`check-say-reading.js` all 0; `check-example-fit.js` names nothing in 331–360; coverage 11,532 notes at
three sentences with 0 repeats. `check-spelling-corpus.js` 0 in Folio's own prose and `check-claims.js`
0 drifted after CLAUDE.md was brought into step. **Verified against the real diff: 23 of 30 in the range
plus 隐藏, whose hint this batch retired, and three cards in Levels 7–9 the `anaesthe` and `haemorrhag`
rows reached.** `build-lang-decks.js` re-run.

**This one carries a changelog line and a version bump — 1.872 → 1.873** — because three rows went into
`SPELL_PAIRS`, which is the app's. Per the one-line-per-kind-of-change-per-day rule the day's existing
spelling line was **raised from forty-five families to forty-eight** rather than joined by a second.

## Batch 142 — `hsk30l6` notes 361–390 (繁殖 → 丰收)

**Twenty-three of thirty changed — and this is the weakest range the fill pass has left behind.**

### Fourteen near-repeats, and four cards where ALL THREE sentences were one sentence

Not two of three but **three of three** on 防治, 飞速, 肥胖 and 肥沃. 肥沃 read *the soil here is
fertile*, *the land on his farm is very fertile* and *this land is fertile*; 飞速 read 技术在飞速发展,
城市在飞速发展 and 技术飞速进步 — two of those differ by **a single character**. 防治 said *disease
prevention matters* three ways, and one of the three, 预防和防治要同时进行, is a redundancy besides:
防治 already IS prevention and treatment, so the sentence reads *prevention and prevention-and-treatment*.

Ten more cards carried the ordinary two-of-three kind — 方位, 房价, 放飞, 肺炎, 分期, 氛围, 风光, 丰收,
反思 and 384 氛围, whose two carried **the same English word for word** (*The atmosphere … is relaxed*),
the shape `check-mandarin-coverage.js` cannot see because it compares the Chinese. **Most were this
record's own fill-pass rows, but 丰收's two were the DECK's** — worth recording, because it says the fill
pass is not the only source of these.

### Five glosses were the wrong part of speech, three of them found by a checker

访谈 was *to visit and discuss* under a `verb` label while all three sentences are the NOUN — a reporter
conducted one, a paper carried one, he gave a television one. 飞速 was the adjective *swift* under
`adverb`. 反思 was three NOUNS — *self-examination; introspection; profound consideration* — under
`verb`, over three sentences that are all the verb. 愤怒 was three nouns under `adjective`, on a card
whose sentences use both, so the label now names both. **`check-gloss-source.js` reported the last three
of those, on its first run since yesterday's fix to it** — which is the argument for that fix: they were
sitting under 65 spelling-only false findings before.

### Four swallows, all on single-character cards

犯's 犯人 is *a convict*; 肺's **水肺 is an AQUALUNG** — 水肺潜水 is scuba diving, so the English never
mentioned a lung at all; 粉's three sentences were 花粉, 粉刷 and 粉红色, so a card glossed *powder* never
showed the bare noun once. All are skipped by `check-example-fit.js` by design. **Four `Compounds`
panels** — 犯, 肺, 粉, 肥.

### 肥 was a word for livestock used of a person

觉得汤姆肥的人不止我一个 calls a named person 肥, which in Chinese is what one says of animals and of
meat; the neutral word for a person is 胖, and the deck has 肥胖 two cards later. Its sibling 这猫是很肥
is ungrammatical besides — 是 cannot stand before 很肥. Both replaced, and the replacements give the two
senses nothing on the card showed: rich soil, and the loose-fitting sense CC-CEDICT lists third.
**肥胖's first sentence was a generalisation about a nationality** (*Many Americans are obese*), which
teaches nothing about the word, and went with the two near-repeats beside it.

### And the rest

反馈's first sentence **ended with no full stop at all** — the corpus punctuation pass converts a mark
and never supplies a missing one, so about 150 sentences still end bare. 肺炎 wrote 的 where the
adverbial marker is 地 (不停地咳嗽), a character error that renders and speaks perfectly. 分散 carried a
passage of **wuxia fiction with four proper names** in it, and beside it thirty-five characters of
self-help whose English is not a translation of the Chinese in front of it. 封闭's third was forty
characters of free-software argument. 方言's 他嘴里一口方言 has no verb. 反思's 反思并回应。 was four
characters with no subject, object or context.

### AND FOR THE SIXTH BATCH RUNNING, THREE REPLACEMENTS OF MY OWN ECHOED THE ROW BESIDE THEM

反思's first replacement had a team reflecting on a DEFEAT over a row reading *one should reflect after
failure*; 封闭's closed a TUNNEL over a row closing a ROAD. Both caught by reading the finished card, and
replaced again — the tunnel by the figurative *shut off from the world*, which neither of the other two
sentences covered. **Six batches running is not a run of bad luck, it is the method**: authoring a
replacement from the card's own subject naturally lands on the card's own construction, and the only
guard is reading the finished card rather than the diff.

**Read and left.** 繁殖, 方方面面, 妨碍, 放大, 分工, 分级, 风力, 愤怒's sentences and 肺's two surviving
compounds are sound. `check-gloss-source.js` also names 飞速, which is the proxy paraphrasing — *swiftly;
at great speed* against *swift; rapidly*.

### Checks after

`--check` clean. `check-pinyin.js`, `check-polyreading.js`, `check-british.js`, `check-say-reading.js`
and `check-example-fit.js` all name nothing in 361–390; `check-senses.js` and `check-coarse.js` likewise.
Coverage 11,532 notes at three sentences with 0 repeats; shared-gloss groups 318 and still-ambiguous 1,
both unchanged. **Verified against the real diff: 23 of 30 changed, nothing outside the range.**
`build-lang-decks.js` re-run. No changelog line and no version bump.

## Batch 143 — `hsk30l6` notes 391–420 (风雨 → 感想)

**Sixteen of thirty changed.** A quieter range than the last, and its faults are mostly of a kind the
checkers cannot reach.

### Three sentences that are not Chinese

**赋予 takes TWO objects** — 赋予 somebody something — and the card's first two sentences were
**他赋予价值。** and **赋予自己价值。**, four and five characters giving it one object or none. Both read
as fragments, and they are near-repeats of each other besides. Replaced by the constitution granting
freedom of speech and an experience giving somebody new strength.

**夫人's 这位就是谁想见你的夫人 is ungrammatical**: 谁 is the interrogative *who* and cannot head a
relative clause, which Chinese builds as 这位就是想见你的那位夫人. It renders, speaks and segments
perfectly, which is why nothing reported it.

**辅导's 营辅员 is not a word at all** — a camp counsellor is 营地辅导员 — so the sentence opened on an
invented compound built out of the card's own character.

### A card glossed *liver* that showed the organ nowhere

肝's three sentences were 肝肠寸断 (an idiom for heartbreak), 肝炎 (hepatitis) and a drinker's joke
addressed to alcohol — **not one of them the bare noun**, and all three invisible to
`check-example-fit.js`, which skips a one-character headword by design. Two replaced; the third's English
also ran two clauses together with no punctuation (*She got hepatitis no wonder she is losing so much
weight*). **Three `Compounds` panels** — 服, 浮 and 肝 — authored from CC-CEDICT.

**服's 和服 is a KIMONO** and 符号's 标点符号 *a punctuation mark*, standing in two of that card's three
sentences; the one replaced was an idiom whose English — *I do not trust a single word that comes out of
their mouths* — never mentions a symbol at all.

### Nine near-repeats, one of them all three

附件's three sentences were **all an email attachment**, so a card glossed *attachment; appendix;
enclosure* showed one of its three senses three times over; the replacements give the other two. 改编 had
the same film adapted from the same novel twice, in the two ways round the sentence can be built, with
their English differing by one word. 风雨 and 覆盖 each had the same sentence with a noun changed **and
both pairs were the DECK's own rows**, not this record's.

### Two conventions mixed in six characters

概率's 耶诞节下雪的概率 writes Christmas in the **TAIWAN form** — the mainland writes 圣诞节, which the rest
of these decks use — while 概率 itself is the mainland term, Taiwan saying 機率. Two spellings of one
convention in one short sentence.

### And a figurative sense leading its own gloss

干燥 read *dull; dry*, the figurative sense first, over three sentences that are all weather and air.
CC-CEDICT puts *(of weather, climate, soil etc) dry; arid* first and marks *dull* as figurative, which
the card now does too.

### THE SEVENTH BATCH RUNNING WITH A SELF-INFLICTED ECHO — AND THIS TIME TWO ON ONE CARD

改编's replacement was a third 改编成 over a row already reading 他把故事改编成话剧, and **both** of
概率's replacements were *the probability of X is N*. All three caught by reading the finished card and
replaced again. The pattern is now firm enough to state as a rule: **an authored replacement lands on the
card's own construction unless it is deliberately built on a different one** — a noun use, a figurative
sense, a different verb frame — so pick the construction FIRST and the content second.

**Read and left.** 服从, 幅度, 福利, 服用, 辅助, 负面, 富裕, 改造, 干脆, 尴尬, 干旱, 干扰, 赶忙, 感染
and 感想's survivors are sound. `check-gloss-source.js` names 赶忙 and 感想: the first because CC-CEDICT
glosses 赶忙 as a verb where the card calls it an adverb and all three of its sentences are adverbial —
the card is right and the dictionary is phrasing it differently; the second differs from the dictionary
by the plural alone.

### Checks after

`--check` clean. `check-pinyin.js`, `check-polyreading.js`, `check-british.js`, `check-say-reading.js`,
`check-example-fit.js`, `check-senses.js` and `check-coarse.js` all name nothing in 391–420. Coverage
11,532 notes at three sentences with 0 repeats; shared-gloss groups 318 and still-ambiguous 1, both
unchanged. **Verified against the real diff: 16 of 30 changed, nothing outside the range.**
`build-lang-decks.js` re-run. No changelog line and no version bump.

## Batch 144 — `hsk30l6` notes 421–450 (钢笔 → 供给)

**Twenty of thirty changed, and one card was wrong in every part of itself.**

### 个体 — not one of its three sentences contained the word, and the gloss was wrong too

The card teaches **个体**, *an individual*. Its three sentences were:

- 我去做了**个体**检 — 个 + 体检, *I went for a check-up*
- 我想成为一**个体**育记者 — 一个 + 体育, *a sports reporter*
- 他是一**个体**育爱好者 — 一个 + 体育 again

**All three are perfectly good Chinese, all three are about something else entirely, and all three were
this record's own rows from the fill pass.** Three authored sentences replace them — and once they were
in, `check-gloss-source.js` reported the card again, because the **gloss was wrong as well**:
*individuality; personality* is an abstract noun where 个体 is a concrete one. A card defining the wrong
thing and illustrating a third thing three times over is the worst single card this audit has met.

**歌唱 is the same fault at two thirds scale**: 她唱**歌唱**得很好听 is 唱歌 + 唱得, and
我这个**歌唱**得好不好 is 歌 + 唱得 — both about singing, both carrying the two characters, neither
carrying the word. Only one of its three sentences used 歌唱 at all. 高等's 最高**等第** is 最高 + 等第
in the same way.

### Three cards showed the bare character nowhere

公's three sentences were 公害, 公交 and 公车; 宫's were 故宫, 卢浮宫 and 守宫砂; 高原's were
**志贺高原 twice** — Shiga Kogen, a Japanese ski resort, so the card showed one proper name twice and
the common noun once. All invisible to `check-example-fit.js`, which skips a one-character headword by
design. **Three `Compounds` panels** — 割, 公 and 宫.

**宫's 守宫砂 also had to go on its own account**: the sentence explains an old method of testing a
woman's virginity, which teaches nothing about the character.

### A second Taiwan-vocabulary finding in two batches

高原's surviving sentence used **高丽菜**, the Taiwan word for cabbage — the mainland writes 卷心菜 or
圆白菜 — so a mainland HSK deck carried Taiwan vocabulary. That is the second in two batches after
概率's 耶诞节, which suggests the harvest corpus has a Taiwan component worth watching for rather than a
pair of accidents.

### Two glosses from the wrong place

**工夫 was glossed *(old) labourer***, which CC-CEDICT files under 工夫 **gōngfū** — and the card reads
**gōngfu**, the neutral tone, whose entry is *period of time; spare time; skill; labour; effort*. All
three of its sentences are time and effort. **The fourth card this audit has found glossed from the
other reading of its own characters**, after 当天, 地道 and 倒车. **给予's entire gloss was
*rendition***, a noun — the dictionary reads *to give; to accord; to render*, and *rendition* is what
*render* becomes when a gloss is built out of the wrong part of speech.

### And the ordinary run

Eight near-repeats — 港口's ships, 高层's high floor, 高尚's noble character, 高手's tennis player,
高新技术's cluster of firms, 稿件's editor, 跟前's child, 公告's notice — of which 港口's and 高手's
were the **deck's** own rows. 岗位's 这个岗位不合适小姑娘 wrote 不合适 for the verb 不适合 and made a
claim about young women besides. 稿子's 天好以后 means *after the weather clears* under an English
reading *After today*. 跟随's 跟随他的道路。 is five characters with no subject. 割's 心如刀割 is an
idiom about grief.

### THE EIGHTH BATCH RUNNING WITH A SELF-INFLICTED FAULT — and this one was the batch's own subject

The replacement first authored for 公 was **这块地是公家的**, and 公家 is a compound of its own — so the
sentence carried the very swallow that card was being repaired for. Caught by reading the finished card,
and replaced with the *male (of an animal)* sense, which is bare 公 and a construction the card does not
otherwise show. Last batch's rule held on the other nineteen: **pick the construction first and the
content second.**

**Read and left.** 钢笔, 高超, 高端, 高峰, 隔壁, 革命, 跟踪, 公安, 工地, 供给 and 稿子's survivor are
sound.

### Checks after

`--check` clean. `check-pinyin.js`, `check-polyreading.js`, `check-british.js`, `check-say-reading.js`,
`check-example-fit.js`, `check-senses.js`, `check-coarse.js` and `check-gloss-source.js` all name nothing
in 421–450. Coverage 11,532 notes at three sentences with 0 repeats; shared-gloss groups 318 and
still-ambiguous 1, both unchanged. **Verified against the real diff: 20 of 30 changed, nothing outside
the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

## Batch 145 — `hsk30l6` notes 451–480 (攻击 → 拐)

Twelve of the thirty changed. The rest were read and left.

### 顾 — a gloss from a sense the dictionary does not carry, over three sentences that never used the word

Not one of this card's three sentences contained 顾 as a word: **她环顾了一下四周**, **我环顾四周，却没看
见任何人** and **汤姆环顾四周，发现自己迷路了** are all 环顾, "to look around", and two of them are 环顾四周
verbatim. That is the batch's fourth consecutive single-character swallow, and `check-example-fit.js`
skips a one-character headword by design, so nothing reported it.

What makes this one worse than its predecessors is that **the gloss was wrong with them**. The card read
*to look back; to turn around and look* — which is the classical sense, and **CC-CEDICT does not carry it
at all**: its entry is *to look after; to take into consideration; to attend to*, which is also the sense
behind every compound a reader of this deck actually meets (照顾, 顾客, 不顾, 顾虑, and 顾问 twelve cards
later in this same range). So the card taught a reading nothing supports, illustrated by a word it was not
about. Gloss and sentences were corrected together, the three replacements being 只顾/不顾, the potential
complement 顾不上, and 顾着.

### Two sentences identical but for the number in them

**费用共计一千元** beside **费用共计三千元** — the sharpest near-repeat this audit has found, and to
`check-mandarin-coverage.js`, which compares example translations exactly ("a thousand yuan in all" against
"three thousand yuan in total"), two perfectly distinct examples. The replacement counts something that is
not money. Three more near-repeats in the same thirty: 这道工序很重要/很关键, 这座城市有很多古迹/城里有很多
古迹, and 公民's two *X is a citizen of Y* sentences.

### The part-of-speech label and the gloss were different parts of speech — three times

Batch 31's third shape, at three times its rate here. **构造** was labelled a VERB over the gloss
*structure*, with all three sentences the noun and CC-CEDICT giving no verb sense at all. **公认** was
labelled a verb over *universally acknowledged*, a past participle. And **拐** ran three senses together in
one line under a single verb label — *to turn, to abduct, or a walking stick*, the last of which is a noun
— now split as the dictionary splits them, with sense tags on the two examples that show the first two.
拐's third sentence was a swallow besides: **请在那个拐角左转** uses 拐角, "corner", and its verb is 左转.

### A number written in a form that reads as something else

**公元** dated the arrival of Buddhism to **公元六七年** — sixty-seven only to a reader who already knows
the year, 六七年 otherwise being "six or seven years". Beyond it, two of that card's three sentences used
公元**前**, the BCE form, on a card whose headword is the CE one. Both were replaced with sentences that
state a CE year plainly; the surviving 公元前 sentence stays, being a real use of the word.

### Read and left

攻击, 公开, 功效, 公益, 供应, 公正, 公众, 公主, 巩固, 孤独, 姑姑, 股票, 古人, 股市, 骨头, 固体, 顾问,
故障 and the survivors of 沟, 古典 and 鼓舞 are sound. 巩固 and 鼓舞 each carry a `verb / adjective` label
whose adjective half no sentence shows; CC-CEDICT gives 巩固 both and 鼓舞 neither, and the house rule is
not to sweep that flag, so both are recorded rather than changed — 鼓舞's repair was the near-repeat
(令人鼓舞 twice), not the label.

### Checks after

`--check` clean. `check-pinyin.js`, `check-british.js`, `check-say-reading.js`, `check-example-fit.js`,
`check-senses.js`, `check-coarse.js` and `check-gloss-source.js` all name nothing in 451–480. Coverage
11,532 notes at three sentences with 0 repeats; shared-gloss groups 318 and still-ambiguous 1, both
unchanged across four gloss rewrites. **Verified against the real diff: 12 of 30 changed, nothing outside
the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

## Batch 146 — `hsk30l6` notes 481–510 (拐弯 → 过时)

Twenty of the thirty changed, and **one note outside the range**, deliberately: see the hint pair below.

### Three translations that render a different sentence from the one above them

Not a near-repeat and not a swallow — the English simply says something the Chinese does not, and no
checker in this collection compares the two halves of a block at all.

**官方**'s 你不能回避官方政策 was translated **"You can't avoid office politics"**. 官方政策 is *official
policy*; office politics is 办公室政治, a different phrase about a different thing — and one that does not
contain the headword. **关爱**'s 关爱生命，请勿嬉水 is a warning sign at the water's edge and says *value
your life*; the card read **"For the sake of living things, please do not play around with the water"**,
which turns 生命 into wildlife and makes a safety notice an environmental one. And **国产**'s 我的车是德国
产的 was translated, correctly, as *"My car is German"* — which is the tell for the fault under it.

### The headword straddling two shorter words — twice, and it is the fault the checker was written for

**国产**: 我的车是德**国产**的 is 德国 + 产, *made in Germany*, and the card's word exists in it only as the
join between the two. **国歌**: 帮我推荐几位法**国歌**手吧 is 法国 + 歌手, *French singers*, and the sentence
has nothing to do with an anthem. This is the arrangement `check-example-fit.js` exists to report, and it
reported neither, because both sentences are record rows the harvest added and the harvest's own guard
tests the other direction — a target swallowed by a LONGER headword — which is batch 26's finding met from
the far side.

Two ordinary swallows beside them: **棍** had 曲棍球, *field hockey*, on two of its three sentences, so one
of three used the word; and **官** had 长官, *commanding officer*, translated "sir".

### 归 — not one sentence showed the sense it was glossed with

The gloss was *to return, to go back to*, and all three examples were the belonging sense: 归我, 归谁, and
工作归工作，学习归学习, which is a third thing again. CC-CEDICT carries all three, so the card was not wrong
so much as pointed at the wrong one of them. Split, tagged with `exSense`, and given an authored sentence
for the returning sense, which it had none of. The retired *preposition* label was wrong for the
reduplication, which is a construction rather than a part of speech.

**规范** is the same shape one step down — three labels (noun, verb, adjective) over a gloss that is three
nouns, with the third sentence the verb — and **过渡** the same again, below.

### A gloss cut off mid-phrase, and a gloss that was the wrong English word

**国情** read *"the characteristics and circumstances particular to a"* — CC-CEDICT's own wording with its
last word missing, so the term was defined by a fragment ending on an article. Nothing looks at a gloss for
a complete phrase; it was found by reading the card. **轨道** read *track; pathway* and left out ORBIT,
which the dictionary gives second and which is the sense a reader meets in 卫星轨道; no sentence showed it
either, and the one replaced was a calque besides (5号轨道 for a station platform, where Chinese says 站台).
**管道** was glossed with CC-CEDICT's first word and only its first word, *tubing*, which in English names
the material rather than the thing.

### A `not X` pair retired, and why one note outside the range changed

**过渡** was glossed **transit** — which is 过境, passing through a country, and is exactly the Levels 7-9
card its `not 过境` block named. **The collision was an artefact of the error rather than a real one**: 过渡
is to pass from one stage to another, and once it says so the two share no English prompt. So both glosses
are corrected and the pair is retired from `hints` together. Retiring only 过渡's half would have left 过境
carrying a disambiguator pointing at a card that no longer collides — the dead one-sided hint this audit
has swept for once already, and worse than none, since a reader takes it for a real distinction.
`check-mandarin-coverage.js` reads 317 shared-gloss groups against 318 before, which is this pair and
nothing else.

### The applier refused an authored sentence, and it was right to

The first replacement written for **拐弯** was 这条河在这里拐了个弯 — the river makes a bend here — and
`mandarin-fix.js` refused the batch: 拐了个弯 splits the headword around 了个, so the sentence does not
contain 拐弯 as a literal string, and the guard that keeps an added example on its own card cannot tell
that from a sentence about something else. **A split verb-object compound is a real use of the word and an
unreachable one here.** Replaced with one that keeps it whole.

### Read and left

关怀, 观赏, 官员, 罐, 广阔, 规划, 归还, 规矩, 贵重, 过后 are sound. `check-gloss-source.js` names 规划,
whose card gloss (*planning; programming; project*) and dictionary entry (*to draw up a plan; a program*)
share their substance and not their content words — the overlap half of that checker being the sludge its
own header says it is.

### Checks after

`--check` clean. `check-pinyin.js`, `check-british.js`, `check-say-reading.js`, `check-example-fit.js`,
`check-senses.js`, `check-polyreading.js` and `check-coarse.js` all name nothing in 481–510. Coverage
11,532 notes at three sentences with 0 repeats; shared-gloss groups 318 → 317 (the retired pair) and
still-ambiguous 1, unchanged. **Verified against the real diff: 20 of 30 changed, and exactly one note
outside the range — hsk30l7/过境, the retired pair's other half.** `build-lang-decks.js` re-run. No
changelog line and no version bump.

### Batch 147 — `hsk30l6` notes 511–540 (海内外 → 狠), 2026-09-24

Sixteen of the thirty changed. The finding worth keeping is **好学**, and it is a hole in a checker
rather than a slip in a card. The word has two readings and CC-CEDICT carries them as two entries:
`hǎo xué` *easy to learn*, and `hào xué` *eager to study; studious*. The card's **pinyin AND its
bopomofo both say hào** (ㄏㄠˋ ㄒㄩㄝˊ) — they agree, so `check-pinyin.js` has nothing to report —
while its gloss read *easy to learn*, which is the other reading's sense. Two of its three sentences
went with the gloss rather than the reading: 法语好学吗 is plainly `hǎo xué`, and 只要你好好学中文 is
not the word at all, being 好好 + 学. Only 她勤而好学 taught what the card says it teaches.
**`check-polyreading.js` exists for exactly this fault and could not see it**: it reads only
SINGLE-CHARACTER cards, on the reasoning that a lone polyphone is where a gloss taken from the wrong
reading hides. 好学 is two characters, and two-character words have readings too. The gloss is
corrected to the reading the card names, the two sentences are replaced, and the question of widening
that checker to two-character cards is recorded rather than answered — the measurement it would need
is how many two-character words the decks carry with two CC-CEDICT entries at all, which is a batch of
its own.

**Three more glosses were a different word's.** **海面** was glossed *sea level*, which is 海平面 —
a separate word with its own CC-CEDICT entry — where 海面 is *the surface of the sea*; the sentence
resting on the wrong sense (海面随着全球变暖的加剧而越来越高, "sea levels get higher and higher")
went with it, replaced by 潜艇浮出了海面. **和平** was glossed *peace; mild*; CC-CEDICT gives
*peace; peaceful* and all three sentences are the noun, so *mild* — a literary use of the word —
stated a sense the card never shows. And **合成**'s gloss ended in *synthetise*, which is not an
English word in either dialect, so `check-british.js` could not have reported it either.

**Three label-against-gloss mismatches**, the shape these batches keep turning up. **海岸** carried
CC-CEDICT's first word alone, the adjective *coastal*, under a NOUN label and over three sentences
that all use the noun. **航空** was labelled a verb over *aviation*. **害** gave only the noun senses
(*harm, damage, injury*) under a "noun / verb" label, where CC-CEDICT leads with the verb — split into
`[verb, noun]` with `exSense [1,1,2]`.

**毫不** is the dictionary's-first-word trap from batch 31 again: glossed *hardly*, CC-CEDICT's leading
word and the one none of its sentences shows, all three being *not in the least*. Widened — and then
the plain widening sat beside **毫无**'s *none; not in the least*, a **near-collision the coverage
checker cannot see**, comparing exactly. The two are genuinely different words and the difference is
grammatical, so 毫不 takes a parenthetical saying so: *(before a verb or adjective)*, where 毫无 takes
a noun. Shared-gloss groups held at 317.

**好不** had two of three sentences that were not the word. 很好不是吗 is 好 + 不是 and 好不好 is
好 + 不 + 好 — the headword STRADDLING a boundary, which `check-example-fit.js` reports only when the
headword is split between two words its own lexicon knows, and 不是 sits the other side of that test.
Both replaced by authored 好不 + adjective sentences. **狠**'s 今天热得狠 is the same class from
another direction: CC-CEDICT records 狠 as an **old variant of 很**, so the sentence is not a typo but
the intensifier, a different word wearing this card's character — and it taught none of *ruthless,
cruel, severe*. **害** had two swallows beside its label fault, 公害 and 遇害.

**Four near-repeats**, each one frame written twice: 海内外 (这本书在海内外都很有名 / 这本书在海内外都很受欢迎),
号召 (政府 / 学校号召大家节约用水), 毫升 (请加五十 / 请倒二百毫升水), and 毫米, whose dropped sentence
was a local weather bulletin — 过去6小时，我县牙城镇降雨达到122.4毫米 — carrying a place name and a
decimal figure that teach nothing about a millimetre.

**Two English translations were wrong about their own Chinese.** **好客** rendered 大多数中国人是非常好客的
as "Many Chinese people make good guests", which is its opposite: a 好客 person is the one who
entertains. Fixed with `exEn`. And **海拔**'s Alps sentence wrote Italy 义大利, the Taiwan form against
the mainland 意大利, while its English stated no elevation at all; dropped rather than respelled, since
义 and 意 are not orthographic variants and `exVariant` may not be used to swap them.

**Fourteen cards were read and left**: 海域, 寒冬, 含义, 罕见, 旱灾, 毫无, 好感, 好容易, 合并, 和谐,
核心, 嘿, 黑暗, 痕迹. **Two questions are recorded rather than answered.** 号召's third sentence,
他响应了这个号召, is the NOUN under a verb label, and CC-CEDICT gives only verb senses — splitting it
would be going beyond the dictionary on one sentence's evidence. And 航空's 航天航空工程师 writes the
pair in the order the mainland usually reverses (航空航天); the form is attested, the record has no
instrument that can reorder Chinese characters in a deck sentence anyway, and dropping a third
sentence to fix a word order would cost more than it buys.

Coverage unchanged: 11,532 notes at three sentences, 0 repeats, 317 shared-gloss groups with
still-ambiguous 1. `check-british` reads 0. **Verified against the real diff: 16 of 30 changed and
nothing outside the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 148 — `hsk30l6` notes 541–570 (恨 → 还原), 2026-09-24

Fourteen of the thirty changed, and six of those fourteen are single-character cards that had no
`Compounds` panel: 恨, 横, 壶, 户, 怀, 环. Every reading and gloss in the twenty-four rows was checked
against CC-CEDICT before it was written; 蛮横 was considered for 横 and left out, its reading being
`mánhèng` rather than the card's `héng`, which is the one way a compounds panel can teach the wrong
thing while looking right.

**怀 is the batch's finding, and it is the class from batch 30 again: a character error that put the
headword on the card.** Its second sentence read 我不喜欢怀男孩 and was translated "I don't like bad
boys" — which renders 坏男孩. 怀 is 坏 mistyped, so the sentence is not about this character at all,
and **nothing in the pipeline can see it**: it segments, it speaks, its translation is a perfectly
good English sentence, and the headword is present as a literal substring. Only reading the Chinese
against its English finds it.

**Three sentences did not contain their headword as a word.** 宏大's 宽宏大量 is 宽宏 + 大量, so the
word straddled the boundary — `check-example-fit.js`'s own shape, which it could not report because
both halves are record rows the harvest guard tests from the other direction. 后人's 地震后人们普遍觉得恐慌
is 地震后 + 人们, the same straddle, on a sentence about panic after an earthquake. 化妆's remaining
swallow was 化妆品, a noun compound on a card whose label and gloss are the verb. 壶 and 环 each had
two of three sentences swallowed — 茶壶/咖啡壶 and 环顾/环游 — one of each replaced, and the compounds
that were doing the work now named in the panel instead.

**Two cards taught one collocation three times.** 胡子's three sentences were all 刮胡子, so the noun
never stood on its own; CC-CEDICT gives *beard; mustache or whiskers; facial hair* where the card had
*beard* alone, which is also why every sentence could be about shaving. 互助's three were all the
four-character 互帮互助. Two of each replaced.

**后退** is the dictionary's-first-word trap for the third batch running: glossed *to recoil*, which
is CC-CEDICT's leading word and the one none of its sentences shows — all three are moving or
stepping back. **宏大** was *great* where the dictionary gives *great; grand*, and grand is the sense
its sentences carry. **户** had all-noun glosses under a "measure word" label; 户 is genuinely both,
so it is split, with `exSense [1,2,2]`.

**Two sentences were not Chinese and one English was not a translation.** 户's 那户井水是许多疾病的源头
does not work — 户 does not classify well water — and its English rendered only the second of two
unrelated clauses. 恨's 我不管你说，我恨你！ wants an object (我不管你说**什么**) and carried a stray
space after the comma besides. And 宏大's 欣赏生活中的小事，它们的总合很是宏大 wrote 总合 for 总和 while
its English, "they will bring you to a bigger end target", renders no part of the Chinese. 横's
才华横溢 was both faults at once: an idiom swallowing the headword, translated "He's overflowing",
which renders neither the idiom (*brilliantly talented*) nor the character.

**欢乐 is a fault with no checker and no Chinese in it at all**: its three sentences are fine and all
three were translated with the same frame, "is full of joy", so the card taught one English phrase
three times over. `check-mandarin-coverage.js` compares the CHINESE for repeats and the gloss for
reverse-card collisions; a repeated English *translation* across a card's own three examples is in
neither test. Two were re-rendered (*merriment*, *gaiety*) and the Chinese left untouched. Worth
watching for: this is the second batch in which the English side carried the fault while the Chinese
was sound.

**Sixteen cards were read and left**: 衡量, 洪水, 后代, 后期, 后者, 忽略, 花朵, 花生, 滑冰, 滑雪, 划分,
化石, 话筒, 怀念, 怀孕, 还原. One question is recorded rather than answered: 花朵's first two sentences
are both 花园…花朵 (the garden full of flowers; all the garden's flowers withered) — a near-repeat of
setting rather than of construction, and the two senses they show are different enough that replacing
one would cost more than it buys.

Coverage unchanged: 11,532 notes at three sentences, 0 repeats, 317 shared-gloss groups with
still-ambiguous 1. `check-british` reads 0. **Verified against the real diff: 14 of 30 changed and
nothing outside the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 149 — `hsk30l6` notes 571–600 (患 → 激发), 2026-09-24

Fifteen of the thirty changed, plus one note outside the range — `hsk30l7/绘制`, the other half of a
retired pair.

**会见 is the batch's finding.** Two of its three sentences were not the word: 我再也不会见她了 is
不会 + 见 and 可能不久会见你 is 会 + 见, both "will see" rather than "to meet with". **Their own
English says so** — "I'll never see her again", "Maybe I'll see you later" — which is the cheapest way
this class is ever caught, and `check-example-fit.js` cannot report it: 会 and 见 are both headwords
its lexicon knows, so a greedy longest-match lands squarely on 会见 and sees nothing split. Both are
replaced by authored sentences in the formal sense the gloss names.

**A gloss fix retired a third `not X` pair, and the mechanism is worth writing down.** 绘画 was glossed
*drawing* — a noun under a verb label — where CC-CEDICT gives *to draw; to paint*, which is also what
all three of its sentences are about. Correcting it had a consequence the applier's own documented
behaviour makes invisible: **a `gloss` fix replaces `fl.English` whole and therefore DROPS the `not X`
block**, so 绘画's disambiguator vanished with the correction while `hsk30l7/绘制` went on saying
*not 绘画*. The two no longer share a gloss at all, so the surviving hint pointed at a collision that
does not exist — which the record's own rule says is worse than none, a reader taking it for a real
distinction. Both hint entries are deleted and **绘制 is given its own sense instead**, the
dictionary's *to draft (a map, blueprint, diagram)*, which is the actual difference between the two
words. Its 他绘制了一张地图 turned out to be 他绘制了一张详细的地图 with one word taken out, so that
was replaced in the same edit. Shared-gloss groups 317 → 316, hints 653 → 651.
**When a `gloss` or `senses` fix lands on a hinted note, check the other half of the pair.**

**Four label-against-gloss mismatches.** 患 gave only nouns under a *verb* label where CC-CEDICT leads
with *to suffer (from illness); to contract (a disease)* — which is what its one plain sentence,
他患了重感冒, actually shows; split, with `exSense [2,1,2]`. 混乱 was *confusion*, a noun, under an
*adjective* label. 饥饿 was nouns under an *adjective* label, and here the correction went the other
way: CC-CEDICT gives only nouns, so the LABEL was changed to match rather than an adjective sense
invented for it. 绘画 as above.

**回报 is the dictionary's-wrong-word trap for the fourth batch running**, and a new shape of it: the
gloss was *bring back a report*, which is CC-CEDICT's *to report back* — a real sense, sitting fifth in
its list, and the one none of the three sentences carries, all three being repayment or a smile
returned. **汇** is the same fault costing a neighbouring card: glossed *to converge, to gather
together* with no mention of **remit**, which the dictionary opens on and which 汇款 — a card fourteen
notes further down the same deck — is built on.

**Four single-character cards were given `Compounds` panels**: 患, 黄, 汇, 混. Sixteen rows, every
reading checked first — 混淆 is `hùnxiáo`, not `hùnxiāo`, which is the sort of thing a panel gets wrong
while looking perfectly authoritative.

**Three cards taught one English three times, and one taught one construction three times.** 活力's
three sentences were all 充满活力 AND all translated "full of energy" — both repeats at once; two
replaced. 灰尘 had "was covered with dust" over two of three. 活跃 had 我母亲很活跃 and 玛丽她很活跃,
one frame twice and the second doubling its subject besides. **This is the third batch running in
which a repeat sat on the English side**, where no checker here compares.

**Three English translations rendered something else.** 皇帝's 皇帝也得讲道理 was translated "Caesar is
not above grammarians", a Latin proverb with no part of the Chinese in it — the sentence says an
emperor too must be reasonable. 活跃's 他的大脑仍然很活跃 was "He still has springtime on the brain".
幻想's 太空旅行已不再是幻想 rendered 幻想 as *a dream*, which is 梦想 — a different word the decks
teach, and the opposite in tone, 幻想 being the thing that is not real.

**回头** lost a sentence that was two proverbs joined: the headword swallowed by 浪子回头 in the first,
and the second ending on a coarse line about a dog, which `check-coarse.js` does not carry. **皇帝**'s
long sentence had a space after a full-width comma, repaired with `exSpace`.

**Fourteen cards were read and left**: 患者, 灰心, 回顾, 汇报, 汇款, 婚姻, 混合, 火柴, 火灾, 货币,
击败, 基地, 机动车, 激发. One question is recorded rather than answered: **货车** translates its own
word three different ways across its three sentences — *van*, *lorry*, *lorry* — and its gloss sanctions
both, so the inconsistency is the gloss's rather than any sentence's, and narrowing it would reopen the
货车/卡车 collision batch 146 settled.

Coverage: 11,532 notes at three sentences, 0 repeats, **316 shared-gloss groups** (317 before the pair
was retired) with still-ambiguous 1. `check-british` reads 0. **Verified against the real diff: 15 of
30 changed and exactly one note outside the range, `hsk30l7/绘制`.** `build-lang-decks.js` re-run. No
changelog line and no version bump.

### Batch 150 — `hsk30l6` notes 601–630 (基金 → 加重), 2026-09-24

Eighteen of the thirty changed, and **two of the replacements drafted in this batch were themselves
the fault they were replacing** — both caught reading the cards back before anything shipped. That is
the standing rule (*pick the construction first and the content second*) earning its keep for the ninth
batch running, and it is worth recording what it caught rather than quietly fixing it. The draft for
家常 was 婆媳俩坐着拉家常, a near-repeat of the 我们聊了些家常 standing directly above it — one fault
swapped for another. The draft for 家居 was worse: 周末他大多待在家居家办公 is 待在家 + 居家办公, the
**same straddle** the edit existed to remove. **Read the whole card back, not the line you changed.**

**夹 is the batch's finding, and it is a shape none of these batches has produced before: a
single-character card not one of whose three sentences used the word it teaches.** The gloss is the
verb — *to press from both sides, to place in between* — and the three sentences were 夹克, 剪报夹 and
文件夹. Two of those are genuine: CC-CEDICT's 夹 `[jia1]` carries *clip; folder* as well as the verb,
so 剪报夹 and 文件夹 are the noun sense and were kept. **夹克 is a loanword for "jacket"**, in which
the character is a phonetic sign and means nothing at all — the one sentence on the card where the
headword is not the word. It is replaced by an authored verb sentence, and a `Compounds` panel names
夹子, 夹杂, 文件夹 and 夹缝. **Nothing in the pipeline can see a transliteration**: it segments, it
speaks, and the headword is present as a literal substring.

**家居 is the harvest guard's own blind spot, demonstrated twice on one note.** This record had
ALREADY dropped two straddles from it — 国家 + 居住 and 画家 + 居住 — and then harvested
你家居然有辆日本车, which is 家 + 居然, in their place. The harvest's guard asks whether a LONGER word
swallows the headword; it says nothing about one spanning two SHORTER words, so **a replacement can
carry back in the very fault it was replacing**, which is exactly what happened here and then nearly
happened a second time in this batch's own draft. 家常's 胜败是兵家常事 is the same class: 兵家 +
常事, on a proverb about soldiers.

**Four glosses kept a sense none of their sentences shows.** 加重 was *to make heavier*, CC-CEDICT's
first and literal words, over three sentences that are all figurative — a disaster made worse, an
illness worsened, a burden increased; the dictionary continues *to aggravate (a bad situation); to
increase (a burden)*. **That is the fifth batch running for this trap.** 集团 was *group; clique;
circle* and never named the corporate sense two of its three sentences use. 技艺 was *skill* alone
where the dictionary gives *skill; art*, and its own third sentence is about a craft. 急切 read
**"eager;urgent; imperative"** — a missing space after the first semicolon and two senses CC-CEDICT
does not carry at all, where it gives *eager; impatient*, and impatience is what the card's own third
sentence warns against.

**Four near-repeats, one of them an outright duplicate.** 机遇's 这是一个难得的机遇 and 这是难得的机遇
are the same sentence with 一个 taken out **and carried the same English word for word** — a duplicate
`check-mandarin-coverage.js` misses by one character, comparing exactly. Then 机制 (one subject
changed), 季军 (the setting taken out), 加倍 (both 加倍小心), 继承 (both 继承王位), 吉祥 (both about
the colour red) and 技艺 (both 他的技艺…).

**Three Englishes dropped the word the card teaches**, which is the third batch running where the fault
sat on the English side. 极为's two — "His words broke her heart", "All the members made much of her
opinion" — carried no adverb at all, on a card whose whole subject is a formal intensifier. 激情's
"full of energetic and splendid competition" is not a grammatical sentence and renders neither the
word nor the Chinese. And 基因's 基因编辑 was translated *genetic engineering*, which is 基因工程 — a
different thing and a different word.

**Two sentences were dropped for their content.** 集团's was a police raid on a group of prostitutes,
which `check-coarse.js` does not carry (娼妓 is in none of its six lists) and which teaches nothing
about a word meaning *group*. 基金's was the lobbyists' bribe — the same sentence 汇 carried thirty
notes earlier in this deck, and dropped there too — leaving the card no longer two-thirds about misused
money. 急救 had the headword only inside 急救箱 and the proper name 海姆利克急救法; one is replaced.

**Twelve cards were read and left**: 激励, 机械, 即便, 极端, 纪律, 寂寞, 技巧, 家家户户, 加剧, 家属,
加以, 家园.

Coverage unchanged: 11,532 notes at three sentences, 0 repeats, 316 shared-gloss groups with
still-ambiguous 1. `check-british` reads 0. **Verified against the real diff: 18 of 30 changed and
nothing outside the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 151 — `hsk30l6` notes 631–660 (假设 → 奖品), 2026-09-24

Twenty-six of the thirty changed. **The batch's largest class is the single-character card whose
sentences use a longer word instead**, which `check-example-fit.js` skips by design. **尖** had two of
its three sentences on 尖叫 "to shriek" — the same word twice, and a word of its own. **箭** had 箭头
(the arrow SIGN) and the idiom 一箭双雕. **剑**'s 恐惧比利剑更伤人 is 利剑 "sharp sword", which
CC-CEDICT lists. All five are replaced by authored sentences using the character on its own, and the
four single-character cards in the range (嫁, 尖, 剑, 箭) got `Compounds` panels, every row read off
CC-CEDICT first — which is also where the swallowing words now belong (尖叫, 箭头, 一箭双雕).
**健全** is the same shape one level up: its first sentence was a hundred-character passage of a
translated speech in which the headword appears only inside 四体健全者 "the able-bodied".

**Three sentences were not natural Chinese, and nothing but reading can see that.** 假设得很大 puts a
得 complement on a noun; 风暴几个小时没有减弱了 closes a 没有 with 了; and 他间隔了很久才作答 uses
间隔, which spaces THINGS out, for a person pausing, which is 隔. A fourth used the right grammar for
the wrong verb: 给他讲解一下你的困境 — 讲解 is what a guide or a teacher does to a subject, not how you
tell someone your troubles. And 鉴定's 经鉴定，此人三观不正 is an internet joke on the neologism 三观,
whose English ("officially unhealthy") rendered neither.

**Seven near-repeats, and three of them were this record's own authored sentences** — which is the
standing lesson of the last ten batches arriving from the other side: the record's EARLIER passes
filled cards to three sentences without reading them against each other. 监督's 工程由专人监督 and
工程有专人监督 are one character apart; 简介 asked 请写一份公司简介 and 请写一段简介; 坚决 said 坚决反对
twice; 监测 monitored water quality twice. From the deck's side, 肩膀 hurt a shoulder twice, 坚硬 was
stone twice, 奖牌 won a medal twice, 奖品 handed over a prize three times, 嫁 said 嫁给 + "you" twice,
and **减弱 was the weather three times** — now a storm, an eyesight and a transitive 减弱噪音, the
transitive use being one the card had never shown.

**Eleven glosses changed, and two of them for a word that is not a sense at all.** 检验 began
**"checkout"**; 健全 read "sound; sane; perfect". 嫁 dropped the one thing that defines the word —
CC-CEDICT's *(of a woman) to marry* — and kept "shift", which lives only in 嫁祸. 艰辛 put the noun
"hardships" under an ADJECTIVE label; 坚硬 put the noun "rigidity" into an adjective gloss. 检测 was "to
detect" over three sentences that all test something; 减压 was the literal "to reduce pressure" over
three sentences that all relieve stress; 间接 led with "secondhand", 将军 carried "admiral" (海军上将),
监督 carried "control" and "monitor" (the second being 监测's own gloss one card up), and 奖品 led with
"award" under three Englishes that all say "prize".

**Five cards were split into senses and tagged.** 假设, 兼职 and 间隔 named a VERB in their label while
all three sentences were the noun; each got an authored verb sentence. 健全 likewise — **and its verb
sense, "to perfect (a system)", is NOT in CC-CEDICT**, which gives *robust; sound* only. It is standard in
the Chinese dictionaries (健全制度), the card's own label already claimed it, and it is recorded as a
judgement rather than as a dictionary reading. 尖 is split into its two adjective senses, *pointed;
sharp* and *(of sight or hearing) keen; (of a voice) shrill*. 简介 lost a "verb" half no sentence had.

Three Englishes were corrected: 坚固's 那是个… said "This"; 兼职's 八万日元 sentence added "a month" the
Chinese does not say, and its neighbour wanted hyphens; 检测's own authored "can detect air quality"
was not English.

**Four cards were read and left**: 坚定, 艰难, 简化, 建筑物. One question is recorded rather than
answered: **坚定** is labelled "verb / adjective" and no sentence shows the verb (坚定信心, "to
strengthen confidence"), which CC-CEDICT does not carry either — so the label stands unillustrated
rather than being answered from outside the dictionary this audit reads. And one finding travels: the
hundred-character speech dropped from 健全 is **also 民众's third sentence** (`hsk30l6` note 908,
out of range), where `check-example-fit.js` already flags it as a 国民 + 众 straddle.

Coverage: 11,532 notes at three sentences, 0 repeats, 316 shared-gloss groups with still-ambiguous 1
(邻居 / 街坊, carried). `check-british` reads 0. **Verified against the real diff: 26 of 30 changed and
nothing outside the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 152 — `hsk30l6` notes 661–690 (酱 → 借助), 2026-09-24

Twenty-seven of the thirty changed. **Two single-character cards had not one sentence using the
character on its own** — the shape batch 150 found for 夹, arriving twice more. **酱**'s three were
蛋黄酱 "mayonnaise" twice (one of them the joke "Is mayonnaise an instrument?") and 花生酱 "peanut
butter"; **解**'s were 解决, 解压 and the proverb 解铃还须系铃人, all three words of their own in
CC-CEDICT. Both cards were rebuilt: three AUTHORED sentences each, glosses split by sense (解 into
*untie*, *solve* and the noun *solution*, one sentence per sense and tagged), and `Compounds` panels in
which the words that had swallowed the headword now live where they belong. **`check-example-fit.js`
skips one-character headwords by design, so nothing but reading finds this**, and it has now been found
on three cards in three batches.

**Three glosses were not the word, and two were cut off.** 截止 was **"to put a stop to something"**,
which it does not mean (CC-CEDICT: *to end; to close*) — and all three of its sentences were 截止日期
"deadline", so the card never showed the verb its label claimed; two authored sentences now do
(报名下周五截止, 投票已经截止了). `check-gloss-source.js` had it in its list; this is the first batch to
reach it. 酱's gloss ended **"made from fermented beans,"** — a trailing comma, the phrase cut — and
借鉴's ended **"draw on the"**. 戒指 read "ring [jewellry]", misspelt inside square brackets. Smaller:
解读 was "to decipher" over three sentences that interpret, 解答 lacked "to answer", 节奏 lacked the
"pace" its own sentence uses, 交际 had a verb label over "social intercourse", and 教训 named only the
noun while its second sentence is the verb *scolded* — split and tagged.

**Two English translations had the numbers wrong.** 截至's first sentence said **2006 for 二零零七年**
and **"three million, seven hundred and forty one thousand" for 三千七百四十一万**, which is 37.41
million — a factor of ten, on the card's longest sentence, and one of two near-identical 60-character
statistics sentences besides. Dropped. 较为's English dropped the word the card teaches ("the
conservative Republican Party" for 较为保守的共和党), 杰出's said "challenging" for 给人启发的, 交际's
invented "socialisers", and 郊外's own authored English put a walk OUT of town into the suburbs.

**Four sentences were not good Chinese.** 接连's 57-character sentence had a character error (分部 for
分布) that left 更分部广的 ungrammatical; 胶水's 是用胶水黏在一起 was missing the 的 that closes 是 … 的;
借助's 没有借助他人协助 says *help* twice; 交际's 参加跟外国人交际谈判 was a run-on fragment. 街头's
news fragment and 焦虑's 焦虑感 sentence (English: "Mennad's anxiety was kicking") went with them.

**Nine near-repeats, five of them this record's own authored sentences** — the lesson batch 151 recorded,
arriving again: 胶带 (请 taken off, otherwise identical), 焦点 (成了 … 焦点 twice), 节能 (很节能 with the
appliance changed), 解读, 解说 (他为 … twice), and 借鉴 (experience twice). From the deck: 酱油 (the
same recipe step twice), 角落 (世界的…角落 twice) and 脚印 (three people finding footprints). And 解放's
own authored 解放龟岛！ was an activist slogan that taught nothing.

**One replacement was itself redrafted before anything shipped**: 借助望远镜，我们看到了… opened on
借助 exactly as the card's first sentence 借助工具会更省力 does. It became 要借助轮椅才能行动.

**Three cards were read and left**: 交谈, 结实, 结尾. One question is recorded rather than answered:
**教训**'s pinyin writes *jiào xùn* where its bopomofo and CC-CEDICT both give a neutral second
syllable; both readings are current and this audit does not settle tone disagreements as a class.

Coverage: 11,532 notes at three sentences, 0 repeats, 316 shared-gloss groups with still-ambiguous 1.
The three hint pairs in range (焦虑/着急, 脚印/足迹, 街头/马路) are untouched, their glosses unchanged.
`check-british` reads 0. **Verified against the real diff: 27 of 30 changed and nothing outside the
range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 153 — `hsk30l6` notes 691–720 (金额 → 镜头), 2026-09-24

Twenty-six of the thirty changed. **The single-character class again, for the fourth batch running.**
**净**'s three sentences were 纯净 twice and the saying 不干不净 — the character never on its own.
**井** had a fantasy place name, 绝望之井 "the Well of Despair", and 水井, a word of its own. **尽** had
one sentence swallowed (用尽 is in CC-CEDICT) and all three said the same thing — do your utmost —
while the card claims two readings; the jǐn reading turns out to live almost entirely in compounds
(尽快, 尽量, 尽管), so the `Compounds` panel carries it and the two new sentences show the jìn reading's
other uses, *to use up* (花尽) and *to fulfil a duty* (尽了…责任). All three cards got panels, every
row read off CC-CEDICT; 净 is split into *clean*, *net* and the adverb *nothing but; all the time*,
one sentence each. Two more swallowed headwords on two-character cards: 进化论 on 进化 and 精确性 on
精确.

**Five Englishes translated a different sentence from the Chinese above them.** 惊人's 真是惊人至极
read **"It was all more and more surprising"** — a line from *Alice*, not a translation of this.
镜头's English dropped the headword and turned *he thinks the scenes are bloody* into *American dramas
are bloody*. 金额's said "over 20,000 yen" for 达到了两万; 精通's "very sharp at physics" lost the
mastery; 金属's 酸性 means *acidity* and its English silently corrected it to *acid* — that one was
dropped rather than corrected, the Chinese being the fault. 经商's own authored "Trade requires a good
head" was not English.

**Eight glosses changed.** 进展 led with **"evolve"**, which it does not mean; 精美 was "delicate", which
CC-CEDICT does not give and which reads *fragile*; 进化 put a noun under a verb label; 精心 put two
adverbs under an adjective label; 竞赛 put three nouns under a verb label with no verb sentence (the
label is corrected rather than a verb sentence invented); 近视 was unhyphenated against its own three
Englishes; 颈椎 carried a bracketed gloss of its own gloss; 进度 lacked the plain "progress". 警告 and
镜头 were split and tagged — the noun *warning* and the film *shot*, each shown by the card's own
sentences.

**Seven near-repeats, five of them this record's own**: 精致 (three × 很/十分精致), 精准, 经商, 景观
and 进而 (先 X，进而 Y twice); from the deck, 金牌 (three wins) and 景象 (那景象 twice). Plus a
job title twice on 金融, and 竞赛's 料理竞赛, the Japanese and Taiwan word for cooking.

**Four cards were read and left**: 金钱, 金子, 近来, 惊讶. The four hint pairs in range (金钱/钱,
金子/黄金, 进而/继而, and 景象/画面) are untouched, their glosses unchanged.

Coverage: 11,532 notes at three sentences, 0 repeats, 316 shared-gloss groups with still-ambiguous 1.
`check-british` reads 0. **Verified against the real diff: 26 of 30 changed and nothing outside the
range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 154 — `hsk30l6` notes 721–750 (纠纷 → 开创), 2026-09-24

Twenty-six of the thirty changed. **局's Traditional field read 侷**, which CC-CEDICT gives only as the
variant for *cramped; narrow*; in every sense the card teaches — a round of a game, a bureau — the
character is 局 in both scripts. The fourth wrong-character traditional this audit has found (after 录,
面向 and the still-open 裤子 and 野), and like the others invisible to every checker, the card rendering
as 局 / 侷 with nothing to say that the second half was a different word. 局's other fault was the
single-character one: two of its sentences were 警察局 and 邮政局, both words of their own. Rebuilt with
authored sentences, split into its two senses and given a `Compounds` panel, as was **卷**, whose 卷发
is a word too. (卷起, which CC-CEDICT also lists, stays: it is the verb plus 起, transparently.)

**Two straddles, both invisible to the example-fit checker because it sees the right characters in the
right order.** 就读's 我做完我的功课后，就读这本书 is 就 "then" + 读 "read" — the word is not in the
sentence at all. 决策's 汤姆名义上市公司的领导 is missing its 是, so it reads 名义 + 上市公司 "listed
company"; the missing character turns a sentence into a straddle.

**A dropped sentence was standing on a second card.** 他终于到了绝望之井 "the Well of Despair", dropped
from 井 in batch 153, was 绝望's first sentence too — the standing lesson that a `dropEx` is keyed to
one note, and that a sentence removed for its content should be grepped across the decks the same day.
It was grepped this time, and a third card carries it — **`hsk30l4/之`, where it is RIGHT and stays**: 绝望之井 is exactly the literary possessive X之Y that card teaches, and its only sentence showing it free (the other two are 之后 and 之处). **The same sentence is a fault on one card and the best example on another**, which is why a content drop is judged per card and never swept. Open item from that read: 之's 他十分钟之后来 is translated "He came after ten minutes" where the Chinese says he will come in ten minutes.

**Four Englishes were numerically or lexically wrong.** 军人's 数以百万计 was translated
**"thousands upon thousands"** — off by three orders of magnitude. 剧烈's 进一步的检查 became "Another
step forward revealed", mistaking *further* for a step. 救援队 was "search party", 军队's 彻底 was "once
and for all", and 舅舅 said "Mommy".

**Near-repeats: nine, and seven of them this record's own authored sentences** — 纠纷 (两家因为 X 起了
纠纷 twice), 救灾 (the same sentence with 工作 taken off), 救助, 举动, 均匀 (搅拌均匀 twice), 开创 and
救援; from the deck, 就算 (the same rain sentence with 明天 moved) and 聚集 (a crowd gathering twice,
replaced by the transitive use the card had not shown), plus 卡片, three cards handed to somebody.

**Glosses.** 局限 ended on **"localisation"** and 均匀 on **"equality"**, neither a sense of the word; 纠纷
carried "issue", 局面 led with "aspect; phase", 举动 read as physical motion. 救命 named only the verb
while two sentences are the cry *Help!*; 局限, 捐款, 捐赠 and 局 named only one of two parts of speech
the card's own sentences use — all split and tagged. **救援 is now reported by `check-gloss-source.js`**,
and deliberately: the gloss became *to rescue*, which CC-CEDICT does not word that way (*to save; to
support; to help*), but it is the word's everyday sense and what all three sentences do. That finding is
the checker working as a proxy, not a fault. 酒精's drinker's joke was replaced by the medical sense
CC-CEDICT leads with.

**Four cards were read and left**: 纠正, 菊花, 剧本, 俱乐部. The 就读/上学 hint pair is untouched.

Coverage: 11,532 notes at three sentences, 0 repeats, 316 shared-gloss groups with still-ambiguous 1.
`check-british` reads 0. **Verified against the real diff: 26 of 30 changed and nothing outside the
range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 155 — `hsk30l6` notes 751–780 (开关 → 空地), 2026-09-24

Twenty-one of the thirty changed, **plus one note outside the range**, `hsk30l7/筒`, for the reason in
the next paragraph.

**开启's first sentence was translated "Switching on a FLESHLIGHT won't help you see in the dark"** — a
one-letter typo for *flashlight* that names a sex toy, on a sentence that is not natural Chinese and
whose English is American besides. `check-coarse.js` cannot reach it: the word is not in any of its
lists, being a trade name. **It stood on a second card, `hsk30l7/筒`**, where it is also a swallow
(手电筒 "torch"), so it was dropped from both in the same batch rather than left for 筒's own turn —
the lesson batches 153 and 154 recorded, applied on the day. 筒's other two sentences (听筒, 甜筒) are
swallows too and are LEFT for that card's own batch in Levels 7–9.

**Two cards were glossed from the reading they do not teach.** **空地** is *kòng dì*, "open space" — what
all three of its sentences say — and was glossed **"air-to-surface (missile)"**, which is CC-CEDICT's
*kōng dì*, a different entry. **看好** was pinned to *kàn hǎo*, "to be optimistic about" (the HSK word),
and glossed "to keep an eye on", which is *kān hǎo* — and two of its three sentences did not contain the
word at all: 你看好吗 is 你看 + 好吗 and 看看好吗 is 看看 + 好吗. It now teaches both readings, as 尽 and
卷 do, with authored sentences for the *kàn* sense it had never shown. `check-polyreading.js` looks only
at single-character cards, which is how two-character ones slip past.

**肯's three sentences were all about a man called Ken** — 肯 as the transliteration of an English name,
meaning nothing: 肯喜欢露营, 你还是肯, 很奇怪肯竟然没有同意. Not one showed *willing to*. All three
replaced; this is batch 150's 夹克 loanword finding at card scale. **Two more transliteration and straddle
faults were this record's own authored sentences**: 科普's 斯科普里是北马其顿的首都 is *Skopje*, in which
科普 is two sounds, and 看中's 她很喜欢看中文书 is 看 + 中文书.

**Single-character cards.** 砍 had 砍价 "to bargain" and a subjectless fragment from a game's help
text; 科 had 挂科 "to fail a course" twice, one sentence repeated. Both rebuilt with `Compounds` panels,
as was 肯. Two-character swallows: 考古学 and 考古学家 on 考古 (one also repeating the record's own
sentence), and 可行性 on 可行.

**Glosses.** 渴望 led with "fall over oneself"; 课题 was a definition, not a gloss; 开设 was CC-CEDICT's
first sense while all three sentences are its second; 恐惧 put nouns and a verb under an ADJECTIVE label;
考验 and 科普 were split and tagged. 看待's 我把他看待为老板 was not Chinese (把 … 看作 is), and
渴望's 如何引起女人的渴望 was a line of sexual advice.

**Near-repeats: 客车 (this record's, destination changed), 科目 (the same question twice), 考验 (two harsh
ordeals), and 渴望** — where the fix produced one: once 我们渴望和平 had its English corrected, it and
我渴望冒险 were the same subject + 渴望 + noun frame, and it was replaced by a verb-phrase complement.

**`check-example-fit.js` now reports 科普's 这是一本科普读物 as 本科 + 普. That is a false positive**:
the sentence is 一本 + 科普读物, and the greedy segmenter took 本科 "undergraduate" out of the middle. It
was reported before this batch too; only its example number moved.

**Nine cards were read and left**: 开头, 看不起, 看得起, 看似, 看重, 考察, 考核, 可口, 可怜. The 开启/打开
hint pair is untouched.

Coverage: 11,532 notes at three sentences, 0 repeats, 316 shared-gloss groups with still-ambiguous 1.
`check-british` reads 0. **Verified against the real diff: 21 of 30 changed in range, and exactly one
note outside it, `hsk30l7/筒`.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 156 — `hsk30l6` notes 781–810 (空闲 → 牢), 2026-09-24

Twenty-four of the thirty changed, nothing outside the range. **Ten of the thirty were single-character
cards** — 扣, 酷, 夸, 款, 啦, 赖, 栏, 烂, 狼, 牢, counting the particle 啦 — the densest run of them
this audit has met, and **only 啦 was not reached by the swallowed-headword fault.** Every other one had
at least one sentence where the character lived inside a longer word: 扣子, 酷爱, 借款, 仰赖, 烂泥, 丛林狼,
监牢, and **栏 had all three** (围栏, 侧边栏, 意见栏 — the last one ending on a comma). All were rebuilt
with authored sentences and given `Compounds` panels, and seven (扣, 夸, 款, 赖, 栏, 烂, 牢) were split into
the senses the sentences actually show and tagged.

**The transliteration class, three more times, and once on a two-character card.** **兰花 had two of its
three sentences about BROCCOLI** — 西兰花, in which 兰花 is not an orchid. **赖**'s 格赖夫斯瓦尔德 is
*Greifswald*, and **夸**'s 一夸脱 is a *quart*. This is batch 155's 肯 "Ken" and 科普 "Skopje" again, and
the fourth batch running to find it. Nothing in the pipeline can see it: the characters are there, in
order, and the segmenter finds the headword standing.

**Glosses that named a sense no sentence used.** 困扰 was "to perplex" over three sentences that were
**all the same construction**, 遭受 X 困扰 "to suffer from X" — two replaced, active and passive. 来往 was
"to come and go" while all three sentences have dealings with somebody. 夸 was "exaggerate; boast" while
both its real sentences praise. 赖 was "to rely on", a sense that lives only in 依赖 and 信赖 — the free
verb *hangs on* and *blames*. 款 led with "sincerity"; 酷 led with "cruel, severe" over three sentences
saying *cool*; 烂 led with "mashed; mushy" over *rotten* and *lousy*, and got the soft-and-stewed sentence it
had promised. 会计 said "accountancy" and not "accountant"; 快捷 kept two *shortcut* sentences that were
快捷方式, a word of its own.

**Englishes.** 烂泥扶不上墙 was translated **"You can't raise a cat to be a dog"** — a different proverb
entirely. 好啦，老古董 was **"OK, boomer"**. 您吃不吃辣椒 was "Do you want pepper on it?"; 辣椒 was
"Capsicum"; 口头上的温柔 was "verbal gentleness"; the proverb on 赖 was American and lacked its full stop
(supplied with `exStop`).

**Near-repeats — six, four of them this record's own**: 口感 (the same rice twice), 口号 (shouted twice),
口腔 (hygiene twice), 亏损; from the deck, 空闲 (空闲时间 three times) and 夸张 (the same sentence with 现在
added). And one caught on read-back: once 酷's swallowed 酷爱 sentence was replaced, all three were a
predicate 很/非常/真酷, so one became attributive.

**Two checker findings are proxies, recorded rather than acted on.** `check-coarse.js` now lists 啦's
你不要命啦 under VIOLENCE for the word *killed* in its corrected English — "Do you want to get yourself
killed?" is the ordinary sense of the phrase. And `check-gloss-source.js` still reports 款, now reading
*sum of money; fund* against CC-CEDICT's *section; paragraph; funds* — the singular against the plural.

**Six cards were read and left**: 枯燥, 夸奖, 款式, 来临, 拦, 朗读. The 夸奖/表扬 hint pair is untouched.

Coverage: 11,532 notes at three sentences, 0 repeats, 316 shared-gloss groups with still-ambiguous 1.
`check-british` reads 0. **Verified against the real diff: 24 of 30 changed and nothing outside the
range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 157 — `hsk30l6` notes 811–840 (劳动力 → 凌晨)

**Three single-character cards had nothing left once the swallows were taken out.** 立's three were 立马
*at once*, 立山 (Mount Tate, a place name) and the idiom 坐立不安; 料's were 配料, 酱料 and 馅料, all
*ingredients* words and none of them the verb *to expect* its gloss promised; 雷's were 鱼雷 *torpedo*, 雷雨
*thunderstorm* — whose English, "Lightning-prone area: please do not climb", said something else again — and,
read a second time, 雷声 *thunder*, which is a word of its own too. All nine are AUTHORED, one per sense, and
立 and 料 are split and tagged. 理 lost two swallows (至理, 理所应当) and kept 谁理他！我理也不要理他！ — which is
理 *to pay attention to*, a sense the gloss did not name, and whose English, **"I care about him, and then I
don't!"**, said the opposite of the Chinese. It is split into three senses and tagged. 粒 lost 微粒, 淋 lost
淋浴, and seven Compounds panels were written, **淋's the one owed since batch 150**.

**A hint pair that was hiding a wrong gloss.** 利息 was glossed "interest rate" with a `not 利率` block, and
hsk30l7/利率 carried `not 利息` back — but "interest rate" is 利率's meaning, and 利息 is the money itself, as
CC-CEDICT and all three of its sentences have it. With the gloss right the two no longer collide, so **the hint
pair is removed from both**, which is the one change outside the range; the shared-gloss count goes 316 → 315.
A `not X` block is a statement that two words mean the same thing, and here it was the fault's alibi.

**A wrong traditional form.** 历年 was written 曆年, which CC-CEDICT gives as *calendar year*; *over the years*,
the card's gloss and every sentence, is 歷年.

**Glosses.** 两岸 was "bilateral" over two sentences about the banks of a river and one about the Taiwan
Strait — split and tagged. 链接 was labelled a verb over three nouns; it now shows both. 类别 leads with
*category*, which all three sentences are; 理性 gains *rational*, which two of its sentences are; 理财's gloss
ended on a bare "money"; 晾 gained its "to".

**Englishes.** 理科比文科难 said "natural sciences … social sciences" — 文科 is the arts. 我感情上支持，但是理性上
反对 said "on the pragmatic level". 衣服被晾出去了 said the clothes *are drying*. 这件事靠个人的立场来解释 was
rendered "It is subject to interpretation", and the Chinese is not natural either; replaced. 理念's two
fragments ("Adopt his concepts.") replaced.

**Near-repeats, all five this record's own**: 劳动力 (充足 twice), 历经 (the bridge twice), 历年 (the data twice),
凌晨 (X点 twice), 链接 (点击 twice).

**Ten cards were read and left**: 老实, 老鼠, 老太太, 乐于, 力度, 例外, 联合国, 联网, 联想, 两极. 例外 names
"noun / verb" over sentences that are mostly the noun; 不许例外 will bear the verb reading and it was left.

Coverage: 11,532 notes at three sentences, 0 repeats, 315 shared-gloss groups with still-ambiguous 1
(邻居/街坊, unchanged). `check-british` reads 0. **Verified against the real diff: 20 of 30 changed in range,
and one out of range — hsk30l7/利率, its hint removed.** `build-lang-decks.js` re-run. No changelog line and no
version bump.

### Batch 158 — `hsk30l6` notes 841–870 (流程 → 码头)

**Glosses read off the head of the dictionary entry rather than off the card.** 流程 was "course" over three
sentences about a procedure; 漏洞 was "leak" over a loophole, a software bug and a flaw in a disguise; 路程 was
"route" over three distances; 流量 led with "flow rate; throughput of passengers" while its sentences were
website traffic and mobile data. Each is CC-CEDICT's FIRST sense and none is the card's — the rule batch 31
recorded, met four times in thirty. 流量 is split into its three senses with an AUTHORED river sentence for
the one it named and did not show; 流动, 流通, 落地 and 录像 gained the senses their own sentences used, the last
two split and tagged.

**Nine near-repeats, seven of them this record's own**: 流动 (the river flowing slowly, with and without 地),
流通 (air circulation twice), 楼道 (no clutter twice), 路况 (poor today twice), 绿化 (well done twice), 旅途
(旅途愉快 twice), 码头 (the boat at the wharf twice); and from the deck, 路程 (the way to the station twice) and
轮 (轮到 twice). One more was caught on read-back: once 马虎's tongue-twister (马马马虎虎, the headword inside
马马虎虎) went, all three were predicate 马虎 after an adverb, so the authored one became attributive.

**Swallows**: 流程图 on 流程, 沐浴露 on 露, 录像带 and 录像机 on 录像, 轮滑 on 轮. 流程's sentence also wrote 图标
*icon* for 图表 and lacked its stop; 漏洞's misprinted 措施 as 措拖; this record's 28-word disguise sentence on 漏洞
(its 一角店胡子 a calque of *dime store moustache*) is gone. 浏览器's third used 网路, the Taiwan word.

**露's two readings carried one identical gloss.** CC-CEDICT gives *to show* under both lòu and lù, and 露出 as
lù "also pr. lòu"; what separates lòu is its set phrases (露面, 露一手, 露马脚). The shower-gel sentence is
replaced by 露了一手, lòu. **Which reading 太阳露出来了 and 耳朵露出来 take is a judgement and is recorded as one**:
tagged lù, with the gloss saying colloquial speech often has lòu. 率 had no sentence for shuài — all three were
lǜ inside a compound — so the weakest (销售率, whose English dropped the rate) is replaced by 率队.

**Englishes**: 路面 said *floor*; 旅程 said *would need*; 旅途 said *voyage*; 落后's said *gains and losses*;
轮子's was a half-translated proverb (replaced); 履行's 履行命令 is an unnatural collocation (replaced).

**Six cards were read and left**: 流入, 录用, 录制, 轮船, 轮椅, 论坛. Five Compounds panels written (露, 率, 轮;
淋 and 雷 last batch). `check-gloss-source.js` now lists 流程 — *process; procedure* against CC-CEDICT's *course;
stream; sequence of processes* — which is the proxy disagreeing with a correction, left.

Coverage: 11,532 notes at three sentences; same-sentence-twice drops 143 → 142 (流动); 315 shared-gloss groups,
still-ambiguous 1 (邻居/街坊). `check-british` reads 0. **Verified against the real diff: 24 of 30 changed and
nothing outside the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 159 — `hsk30l6` notes 871–900 (蚂蚁 → 描绘)

**The transliteration class again, at full strength: 迈's three sentences were all 迈克, *Mike*** — "How are
you, Mike?", "Mike asked not to be disturbed", "I call him Mike" — a card for *to step, to stride* on which
the character means nothing. All three replaced by AUTHORED sentences (迈过门槛, 迈不开步, 迈着大步). 密 had the
same fault in the other shape: its three were 告密, 密室 and 频密, each a word of its own, so the card never
used 密 once. Replaced, split into *dense* / *close, intimate* / *secret (bound form)*, and tagged.

**A gloss cut off mid-phrase.** 嘛 read "[indicates that something is obvious; calls for the" — the second
half gone. Split into CC-CEDICT's *obvious* sense and the softened request 你亲自去嘛 actually shows; its
first sentence was 干嘛, a word of its own, and is replaced.

**Swallows**: 埋头 on 埋, 冒烟 on 冒 (a word CC-CEDICT lists), 免责声明 on 免, and on read-back **this record's own
免疫力 on 免疫** — caught only because the dictionary was asked about the sentence I was keeping. 冒's gloss
named *to counterfeit*, which only 冒充 means; it is split into the two senses its sentences use, and 冒充 put
in its Compounds. 免 gained *to remove from office*, and 免疫 was a VERB glossed "immunisation" — now split into
the noun and the verb.

**Sentences that were not good Chinese.** 煤's 原材料的价格如石油或者煤的不停地上升 is ungrammatical; 漫长's 五年太
漫长而无法等待 is a calque of *too long to wait*; 密集's first ran to 57 characters of translationese about
qipao tailoring. 贸易's 一间贸易公司 counts a company with 间, the southern and Taiwan usage. 眉毛's "Mary has
green eyebrows" taught nothing. All replaced.

**Near-repeats, three of them this record's own**: 棉 (是棉的 twice), 密度 (population density twice), 免税
(the duty-free shop twice, the first the deck's).

**Englishes**: 面子's 你就是要面子 was "You're only saving face!", the wrong way round; 盲人's said "blind men";
漫长's "oh so long"; 冒's "Smoke appeared"; 贸易's "The activity of foreign trade". Three glosses gained their
"to" (冒险, 弥补, 描绘), 描绘 losing "display", which no sentence does.

**Ten cards were read and left**: 蚂蚁, 麦克风, 漫画, 梅花, 美观, 迷人, 蜜蜂, 勉强, 面部, 面粉. 漫画's 漫画书 is not a
CC-CEDICT headword and was left. Seven Compounds panels written (埋, 迈, 冒, 煤, 密, 棉, 免), 埋's noting
that 埋怨 is read mán.

Coverage: 11,532 notes at three sentences; 315 shared-gloss groups, still-ambiguous 1 (邻居/街坊).
`check-british` reads 0; `check-gloss-source.js` loses 免疫. **Verified against the real diff: 20 of 30 changed
and nothing outside the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 160 — `hsk30l6` notes 901–930 (描写 → 南极洲)

**The second hint pair in three batches that was a wrong gloss's alibi.** 模拟 was glossed "imitation" under
a VERB label, and hsk30l7/仿制 was glossed "Imitation" under a verb label too — so the two collided, and the
deck's answer was a `not 仿制` / `not 模拟` block on each rather than a gloss that was right. CC-CEDICT gives
模拟 *to simulate* and 仿制 *to copy; to make by imitating a model*. Both corrected, the hint pair removed from
both (the one change outside the range), and 模拟 split into the verb and the adjective *mock, simulated* its
own sentences mostly are. **仿制's second sentence, 这件是仿制品, has the headword only inside 仿制品 *replica***,
and is left for the Levels 7–9 pass rather than written out of range. With batch 157's 利息/利率, the lesson is
now twice-measured: **a `not X` pair is a claim that two glosses are both right, and it is worth asking.**

**Two glosses cut off mid-phrase, and one that was simply wrong.** 名额 read "quota (of people); [the number
of people assigned or" — rewritten from CC-CEDICT. 命名 was "nominate; nomenclature", neither of which the word
means; it is *to name*.

**民众's open item is closed.** The two long sentences recorded as outstanding since batch 91 — 97 characters
on mission statements and 150 on a speech — are replaced by AUTHORED sentences of ordinary length.
`check-example-fit.js` still lists the third, 全国民众, as 国民 + 众; that is the segmenter preferring the
longer word and is a false positive.

**Swallows**: 绝妙 on 妙, 母牛 on 母 (which the coarse checker also listed for 流产 in its English). 母 was an
ADJECTIVE glossed "mother" — split into the noun and *(of animals) female*, with an AUTHORED sentence for the
second. 描写 gained the noun its third sentence is.

**Sentences that were not good Chinese.** 模仿's 错误是否能够模仿 rendered "Is the error reproducible?", which is
复现; 命名's 为他们的婴儿命名为珍 (a baby is 取名); 木材's 发送木材, a verb for messages; 难点's 最难点, 最 on a noun;
名胜's Edinburgh sentence with 供应 for *offers*; 默默's context-less fragment. All replaced.

**Near-repeats**: 灭 (the lights went out twice), 名额 (this record's own, twice), 模型 (the model plane twice).
**Englishes**: 母's "maiden name", 默默's "did nothing but weep" and a present tense, 木材's "building wood".

**Sixteen cards were read and left**: 民歌, 民间, 民俗, 民宿, 民主, 明亮, 明明, 名气, 命令, 模特儿, 摩托车, 模样, 母语,
目录, 奶粉, 南极洲. Three Compounds panels written (妙, 灭, 母).

Coverage: 11,532 notes at three sentences; shared-gloss groups 315 → 314, still-ambiguous 1 (邻居/街坊).
`check-british` reads 0; `check-gloss-source.js` loses 命名 and 仿制. **Verified against the real diff: 14 of 30
changed in range, and one out of range — hsk30l7/仿制, its gloss corrected and its hint removed.**
`build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 161 — `hsk30l6` notes 931–960 (南美洲 → 泡)

**Single-character cards that barely used their character.** 盘's three sentences were 汤盘 *soup plate*,
存盘 *to save a file* and 大盘鸡, a dish — none of them 盘 on its own; replaced with the measure word the card
names (一盘水果, 一盘棋) and the verb *to coil*, and split and tagged. 扭's were 扭伤 *to sprain* twice and a door
handle whose English said it "came off"; three AUTHORED sentences now show turning the head, twisting a cap
and swaying the hips. 暖 had 回暖 and 变暖, both CC-CEDICT words, and no sentence for the verb its gloss named;
泡 had 泡汤 *to come to nothing* and a *chocolate milk* that is not 泡'd. 泥 lost 土豆泥 *mashed potato*.
**One applier fact relearned**: 暖's record already carried a `gloss`, which the applier applies AFTER
`senses`, so the split did not take and `exSense` failed ("names sense 2 of 1") until the gloss was deleted.

**Swallows in this record's own sentences**: 内科医生 on 内科, 国内外 on 内外, 年终奖 on 年终 — each a word
CC-CEDICT lists, each authored in an earlier pass. On read-back, 排除万难 on 排除 too, an idiom.

**Sentences that were not good Chinese, or not sentences.** 能量's 还要花能量砍掉 had no subject or object;
能源's 如同无限般的 is translationese; 排除's third was translationese without a stop; 农产品's first was 44
characters on rural internet use; 农田's farms in Russia; 脑袋's 黄鱼脑袋, not an expression Chinese uses for
a poor memory. And **偶像's first sentence was 70 characters of archaic religious instruction** ("be not an
observer of omens, since it leadeth to idolatry…"). All replaced.

**Glosses**: 内涵 was "connotation; implication" over three sentences about depth and substance; 能量 "amount
of energy"; 年度 "year"; and five gained a missing part of speech or "to" (排除 *to rule out*, 排放, 排练, 排名,
盼望).

**Near-repeats**: 内涵 (很有内涵 twice), 年度 (the annual report twice), 年终 (the bonus twice), 内衣 (not
wearing any twice), 盼望 (the holidays twice). 内衣's first sentence also got its full stop (`exStop`).
**Englishes**: 脑袋's "Is your skull broken?", 庞大's "succeeded to his father's large property", 抛's "The coin
toss decides", 盼望's stilted first, 排练's capital after a semicolon, 泡's past tense.

**Six cards were read and left**: 南美洲, 难免, 脑子, 念书, 浓厚, 暖气. 南美洲's 澳洲 for Australia is widely
used on the mainland and was left. Five Compounds panels written (泥, 扭, 暖, 盘, 泡).

Coverage: 11,532 notes at three sentences; 314 shared-gloss groups, still-ambiguous 1 (邻居/街坊).
`check-british` reads 0. **Verified against the real diff: 24 of 30 changed and nothing outside the range.**
`build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 162 — `hsk30l6` notes 961–990 (赔偿 → 坡)

**The straddle class at its plainest: 片面 *one-sided* was illustrated by 我吃一片面包 and 我要另一片面包** —
一片 *a slice* + 面包 *bread*. The card's characters are there and the word is not, and **both sentences were
this record's own**, harvested before the harvest's guard could see a headword spanning two shorter words. Both
replaced. 披 had the transliteration class twice — 披萨 *pizza* and 披头四 *the Beatles* — and 漂 had 漂白剂
*bleach*, where 漂 is read piǎo and not the card's piāo; its Compounds panel names both other readings.

**Three single-character cards with every sentence swallowed.** 喷 had 喷发, 喷火 and 喷墨; 坡 had 陡坡, 坡道 and
下坡; each is replaced by three AUTHORED sentences. 皮 lost 眼皮 and 皮革/真皮 and gained 'naughty', which CC-CEDICT
gives. 捧's three all held something in both hands while its gloss named praise and a measure word; the three
now show one sense each, tagged. 飘's three were all a cloud in the sky.

**Taiwan vocabulary**: 配备's 摄影头 and 智慧型手机; 品尝's advertisement for Hsinchu's meatballs (29 characters).
**Sentences that were not good Chinese**: 贫困's 阿尔及利亚仍国境贫困; 频道's 那么你频道换掉也行啊. **This record's
own archaic legal text on 赔偿**, 39 characters on thorns and stacks of corn, is gone. 平方 lost a fragment on
平方英里 and a sentence on 平方根, and now shows the colloquial *square metres* and the verb *to square*.

**骗子's three Englishes all said *liar***, which 骗子 is not — it is a swindler or a cheat — and one of them was
律师都是骗子 *Lawyers are all liars*, a generalisation about a profession, now replaced.

**Near-repeats, five of them this record's own**: 陪同, 培育, 频率, 评选, and from the deck 频道 (the same
welcome twice). **Glosses**: 评论 was verb-only over three nouns (split, with a verb sentence); 频繁 was
adverbs over adjectives; nine gained a missing "to" or noun.

**Five cards were read and left**: 疲劳, 片刻, 平等, 平凡, 平方米. Seven Compounds panels written (喷, 捧, 披, 皮,
飘, 漂, 坡).

Coverage: 11,532 notes at three sentences; 314 shared-gloss groups, still-ambiguous 1 (邻居/街坊).
`check-british` reads 0. **Verified against the real diff: 25 of 30 changed and nothing outside the range.**
`build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 163 — `hsk30l6` notes 991–1020 (泼 → 谦虚)

**恰恰 *exactly* had three sentences, and all three were 恰恰相反 *just the opposite***, a set phrase CC-CEDICT
lists as a headword of its own — two of them long and one mistranslated as "Instead". All three replaced by
AUTHORED sentences using 恰恰 on its own (恰恰是, 恰恰出在, 恰恰是时候).

**Glosses from the wrong end of the entry.** 扑 led with **"dedicate all one's energies to a cause"**, a sense
no sentence showed; all three throw themselves at something. 气质 was "manners"; 齐全 "complete; ready"; 恰好
"as it turns out"; 其间 "in between". 铺's gloss named "display; bed" — senses of other readings — and its first
sentence was **床铺, read pù, on a card that teaches pū**; its Compounds panel says so.

**Swallows**: 扑鼻 and the idiom 饿虎扑羊 on 扑; 铺设 on 铺 (its English said *floor*); 手牵手 on 牵, whose three were
all holding hands; 启发性 on 启发; and this record's own 泼水 on 泼.

**A usage error presented as a sentence.** 起初's 我起初来自中国 "I'm originally from China" uses 起初, which is
*at first* of a time, where Chinese says 原来 or 本来. 迫切's second wrote 的 for adverbial 地; 谦虚's 我是谦虚的 is
unnatural and undoes itself; 齐全's comparison of editions was awkward; 启发's thanks to Mr Smith was
translationese. All replaced.

**Near-repeats**: 启动 (restart the computer three times), 期限 (the deadline twice), 气氛 (the mysterious place
twice), and this record's own 其间, 启示, 千家万户. **Englishes**: 欺骗's *swindled*, 气味's *terrifying*.

**Eight cards were read and left**: 扑灭, 朴素, 棋子, 起点, 启事, 起源, 气体, 恰当. 起初 keeps its Genesis sentence,
which is the Chinese Union Version's own wording. `check-coarse.js` now lists 泼's 脏水 under SLUR for *dirty*
in "dirty water" — a proxy firing on a literal. Four Compounds panels written (泼, 扑, 铺, 牵).

Coverage: 11,532 notes at three sentences; 314 shared-gloss groups, still-ambiguous 1 (邻居/街坊).
`check-british` reads 0; `check-gloss-source.js` loses 气质. **Verified against the real diff: 22 of 30 changed
and nothing outside the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 164 — `hsk30l6` notes 1021–1050 (前景 → 清醒)

**Generalisations about people, the class `check-coarse.js` watches for and cannot find.** 勤劳 carried
中国人民非常勤劳 and 日本人是勤劳的民族 — "the Chinese people are exceptionally hardworking", "the Japanese are an
industrious people" — and 倾向 carried 资本家倾向于压榨工人 "capitalists tend to exploit the workers", a political
claim presented as a vocabulary example. All three replaced by AUTHORED sentences. **No checker lists any of the
three**: the vocabulary is flattering or neutral, which is exactly why a word list cannot see it.

**Swallows**: 金枪鱼 *tuna* and 枪支 on 枪; 清白 on 清; and this record's own **切实可行** on 切实, twice — a set phrase
CC-CEDICT lists, so the card taught *feasible* under a headword meaning *practical, earnest*.

**Eleven glosses repaired**, most of them taken from the wrong end of the entry: 前景 led with "foreground" over
three sentences about prospects; 清晨 was "daybreak, the small hours of the morning", which is 凌晨; 清理 said
"disentangle"; 桥梁 "approach"; 亲属 "kin" alone; 倾向 "be inclined to; prefer" missing the noun *tendency* its own
second sentence is; 前期, 强迫, 倾听, 切实 and 清醒 gained what their sentences show. **清洁 gained "to clean"**, which
its first sentence is — and that ends its exact collision with hsk30l3/干净 "clean", so the shared-gloss count
drops 314 → 313; the `not 干净` / `not 清洁` pair stays on both, the two words still being close.

**A fault in the applier worth knowing**: removing a fix from the record does NOT restore the deck — the gloss
written on the first run stayed on the card after the `gloss` key was deleted, and `--check` could not have seen
it. Put the value back rather than deleting the key.

**Sentences that were not good Chinese, or not sentences**: 倾听's 倾听... (one word and an ellipsis) and 清晰's 更清晰些,
both this record's own; 青春's 由跑步保养青春的活力; 清洁's 的 for 地; 巧妙's 迭 for 叠 and a proverb whose English made
no sense; 亲属's sentence hung on a Japanese surname; 桥梁's 43-character koala sentence.

**Near-repeats**: 潜力, 亲密, 清扫. **Englishes**: 青春期's "Children in puberty are easily emotional", 切实's.

**Eight cards were read and left**: 前提, 前者, 墙壁, 强化, 强壮, 瞧, 清淡, 清洗. Two Compounds panels written (枪, 清).

Coverage: 11,532 notes at three sentences; 313 shared-gloss groups, still-ambiguous 1 (邻居/街坊).
`check-british` reads 0; `check-gloss-source.js` loses 清理 and 倾向. **Verified against the real diff: 22 of 30
changed and nothing outside the range.** `build-lang-decks.js` re-run. No changelog line and no version bump.

### Batch 165 — `hsk30l6` notes 1051–1080 (情节 → 人工智能)

**A near-homophone confusion presented as an example.** 权力's 妇女有选择的权力 "Women have the right to choose"
uses 权力 *power* where the sentence means 权利 *a right* — the two are both quán lì, and the card exists partly
so a learner keeps them apart. Replaced. **The straddle class once more**: 热点's 天气热点儿没关系 is 热 *hot* +
点儿 *a little*, the headword's characters and not the word.

**券 had three sentences and all three were compounds** — 餐券, 优惠券, 代金券 — on a card whose character is rarely
free. Three AUTHORED sentences use it on its own (凭券入场, 这张券, 一张券). 圈 lost 圆圈 and 甜甜圈 and now shows the
measure word for laps; 曲 lost 作曲 and 作曲家, and its qū reading, which had no sentence, got one; 染 lost 染上;
求职 lost 求职者.

**Englishes that said something else**: 热门's said *the network* for 大数据 *big data*; 缺陷's *inconveniences*,
with 满 for 蛮 in the Chinese; 权力's *I am devoid of power*; 曲's proverb was rendered *No day without a line*,
a different proverb. **Translationese**: 情形's lawyer, 渠道's first, 娶's 聪明到不会娶她, 热门's 得标的热门队.

**Near-repeats, four of them this record's own**: 求救, 趣味, 热度, 热水器; and from the deck 晴朗, 求助, 区分.
**Glosses**: 渠道 now leads with the figurative *channel* two sentences use; 热门 was labelled a NOUN over three
predicate adjectives; 区分, 趣味, 热度, 热点, 染, 娶, 晴朗 gained what their sentences show.

**Ten cards were read and left**: 情节, 求婚, 取代, 全程, 确立, 群众, 燃料, 热线, 热议, 人工智能.
`check-example-fit.js` flags 趣味's 很有趣味 as 有趣 + 味 — that is 有 + 趣味, a false positive. Five Compounds panels
written (求, 曲, 圈, 券, 染).

Coverage: 11,532 notes at three sentences; 313 shared-gloss groups, still-ambiguous 1 (邻居/街坊).
`check-british` reads 0. **Verified against the real diff: 20 of 30 changed and nothing outside the range.**
`build-lang-decks.js` re-run. No changelog line and no version bump.
