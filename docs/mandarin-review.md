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
