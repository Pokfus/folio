# The Mandarin collection — a review

**September 2026, on request**: *"The card 蛋糕 gives the wrong pinyin dàng āo. Analyse the Chinese
language collection. Check for any mistakes or inconsistencies. Check if every card correctly lists
its most common definitions. Check if the pinyin corresponds to the tts voice. Check if the card
correctly lists three different example sentences. Suggest at least 10 further ways to improve the
Chinese language collection."*

Nine decks, **11,532 notes / 23,064 cards, 21.7 MB**: HSK 3.0 levels 1–6 and 7–9, plus Everyday
Phrases and Idioms. This file records what was measured, what was repaired, and what was not — the
suggestions at the end are costed and each says which of the findings it closes.

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

## Ten ways to improve the collection

Ordered by what they buy a reader per hour of work. **1 and 2 are code; 3–10 are content**, and
several of the content ones are batch work whose measure already exists.

**1. Give a downloaded deck a way to be updated.** *Closes §1 — the reported bug, and every future
repair.* The catalogue row gains a `version` (or the content hash `build-lang-decks.js` already has
everything it needs to compute), the mounted deck records the one it was built from, and a row whose
shipped version is newer offers **Update** where it now offers nothing. The whole difficulty is that
`uDeckImportText` mints a fresh deck id when the deck is already mounted, which would orphan the
reader's schedule — so an update has to be a *merge into the existing id*: replace each note's fields,
keep `S.cards`, and leave a note the shipped deck has dropped alone rather than deleting a card the
reader is mid-way through. Without this, every content suggestion below reaches new readers only.

**2. Write a `Say` for the 25 single-character cards on a minority reading.** *Closes §2.* The
mechanism already exists and is proven on 了 and 差: the field takes the shortest ordinary word that
pins the reading (为 → 认为 or 因为, 得 → 记得, 量 → 商量, 血 → 流血). `check-say-reading.js` ranks
them by margin; it is 25 judgements and an hour's work, and each one turns a card that is *spoken
wrongly* into one that is spoken right. Read each before writing it — a card teaching both readings
with a slash is deliberate and needs none.

**3. Split the 3,660 semicolon-crammed glosses into real senses.** *Closes half of §3.* The senses are
already written; they are in one `uc-sense` div where they want to be several, and the card type
already renders a list. This is largely mechanical — split on `;`, carry the part of speech, and
review the residue where the semicolon was punctuation rather than a divider — and it is what makes
every later per-sense improvement (a sense-specific example, a sense-specific reverse card) possible
at all.

**4. Give a word with two readings two senses, and fix 便.** *Closes the rest of §3.* 长, 行, 好, 少,
数 and the rest of the polyphones in the list are missing the reading a learner will actually meet;
过, 花, 空 and 重 show the shape to copy — `chóng — …` / `zhòng — …` as two labelled senses, with the
bopomofo and the `Say` field following. **便** should be rewritten from scratch. A corpus-driven way to
find the whole set: any headword character whose reading in the card disagrees with its reading inside
the multi-character words of the same corpus is a candidate, which is `check-say-reading.js`'s
distribution used for a second purpose.

**5. Fill the Idioms deck's examples first, not last.** *Closes the worst of §4.* 355 of 477 idioms
have no sentence, and an idiom without a sentence is a gloss a reader can recite and cannot use. It is
the smallest of the nine decks and the one where an example is worth the most; 477 notes is a
tractable batch where Levels 7–9's 2,500 is not.

**6. Add a literal gloss to the Idioms deck.** A `Literally` field beside `English` — 毛骨悚然 *hair
and bones stand on end*, 画蛇添足 *draw a snake and add feet* — which is the picture that makes a
four-character idiom memorable and is exactly what the current gloss throws away. The card type takes
a new field without breaking the shipped cards; the field renders only when filled, like `Measure
word` and `Say`.

**7. Fill the examples gap at levels 6 and 7–9 from a second sentence source.** *Closes the rest of
§4.* 2,837 notes across those two decks have no sentence. The current bank has clearly been exhausted,
so this needs a different supply rather than another pass over the same one — and whatever is chosen,
the sentence has to be checked for containing the headword and for being a sentence rather than a
fragment. Worth doing after **1**, so existing readers get it.

**8. Disambiguate the 863 reverse cards.** *Closes §5.* Three ways, cheapest first: **(a)** show the
measure word, the part of speech and the register on the English → Chinese front, which separates
女人 / 女性 / 妇女 / 女子 without writing a word of new content; **(b)** put a short disambiguator in
the gloss itself — *again (a repetition already made)* for 又 against *again (one still to come)* for
再 — which is 404 groups of editorial work and is the real fix; **(c)** accept any note in the group as
correct, which needs the study page to know about synonym sets and is the largest change. **(a)** and
**(b)** together are the answer; (a) can ship immediately.

**9. Make the collection's own decks tell you where you are.** Nine decks presented as nine levels
give a learner no route: HSK 3.0's levels 7–9 are one 5,562-word deck, five times the size of any
other, and Everyday Phrases and Idioms sit outside the ladder with no indication of when they are
worth starting. Splitting 7–9 into its three real levels (the syllabus already distinguishes them)
and giving each deck a one-line "start this when…" in its `subtitle` costs almost nothing and is the
difference between a shelf and a course.

**10. Teach the character, not just the word.** Every note already carries a full `Characters`
breakdown with each component's own reading and sense — 蛋糕 gives 蛋 = 疋 *roll* + 虫 *insect*, 糕 =
米 *rice* + 羔 *lamb* — and it is shown as a static block. Two things would make it teach: **link a
component to the other words in the collection that contain it** (11,532 notes is a dense enough
corpus that 米 has dozens), and **order the decks' introduction of a character before the words that
use it**. The data for both is already in the file.

**Two more, since they are cheap.** **11.** Fill the measure word on the concrete nouns of levels 1–3
(§6) — a Chinese noun without its classifier is a noun a learner cannot use in a sentence, and the
first three levels are ~500 notes of which only the countable ones need it. **12.** Run
`check-senses.js --deck=Mandarin` and work the ranked list: it compares a gloss against that card's
own example sentences and is how the five wrong senses of `44f0882` were found; it is report-only and
roughly a quarter of its findings are real, which at this corpus size is still a long list of real
ones.

---

## What this pass changed

- The nine unspaced / bopomofo-less readings above, in `Mandarin-HSK-3.0-Levels-7-9` and
  `Mandarin-Idioms`, with `lang-decks.js` rebuilt for the new byte counts.
- `.claude/decks/check-mandarin-coverage.js`, the measure behind every figure in this file.

Nothing else. **Every other finding is recorded and not repaired**, because each is either a batch of
editorial judgements or a feature — and the first of them, the update path, is what decides whether
any of the rest reaches a reader who already has the deck.
