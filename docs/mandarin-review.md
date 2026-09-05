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

- **5,103 notes carry exactly one example and 1,018 carry two.** The card type shows up to three, so
  the *no examples at all* problem is finished and a *thin* one is what remains. It is a much smaller
  fault — a reader can see the word used — and it is now a question of a second and third sentence
  rather than of a fold that never appears.
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

## Ten more ways to improve the collection

These are the next ten, written after the first twelve shipped and after every note gained an example.
Each says what it would cost and what could go wrong, because three of them are cheap and three are
the kind of change that damages a deck if it is done at scale without judgement.

**1. Take the one-example notes to three, level by level, using the same guards.** 5,103 notes have
one sentence and 1,018 have two; the card type shows three, and three is what makes a word's range
visible — a noun in subject and object position, a verb with and without an object. This is the
largest remaining piece of work in the collection and it is the same work just finished, at twice the
size. Do it **level by level from the bottom up**, since a Level 3 word is met by more readers than a
Level 8 one, and run `check-senses.js` after each level: a second sentence that merely restates the
first is worse than no second sentence.

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
