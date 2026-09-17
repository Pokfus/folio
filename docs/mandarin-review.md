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
