# Backfill plan — multiple question phrasings for every existing card

Goal: every card in the World History prehistory deck (`wh-001` … `wh-105`, 105 cards) carries
**3 question phrasings** (the shipped `question` + 2 extras) in **English and all 9 translations**
(es, fr, de, it, nl, ru, ar, zh, ja). No new cards are added until this backfill is complete
(owner's decision, 2026-07-30).

Scale: 105 cards × 2 extras × 10 languages = **2,100 new question strings**.

## Batches

**15 batches of 7 cards, in id order** (batch 1 = wh-001–007, batch 2 = wh-008–014, … batch 15 =
wh-099–105). Seven cards ≈ 140 strings per batch — small enough to hold every card's background in
mind while writing and to review properly, large enough to finish in 15 passes.

Each batch is one run of `node .claude/add-questions.js <batch.json>` (format documented in the
script header and CLAUDE.md). A batch ships **complete** — all 9 languages in the same JSON — so
`--partial` is never needed and no card is ever live with a translated question pool in some
languages and not others.

## Per-batch workflow

1. **Draft the 2 English extras per card**, from the card's own abstract only (every phrasing must
   stay answerable from the card's background — no new facts, nothing invented). Each extra follows
   the full question rules: one sentence, 20–34 words (~28), mid-sentence
   `<span class="blank">_____</span>`, `<i>` for titles.
2. **Different angle, not a reword**: extra 1 and extra 2 each lead with a different fact from the
   background than the shipped question does (function vs date vs place vs consequence).
   `add-questions.js` rejects verbatim duplicates; the angle check is editorial.
3. **Translate ×9** at native quality, meaning-for-meaning, same brevity in each language's own
   idiom (the script warns on untrimmed translations).
4. **Run** `node .claude/add-questions.js batch-NN.json` — it validates lengths, blanks, language
   parity and the 10-phrasing cap, then rewrites `data.js` and re-parses it.
5. **Check**: `node .claude/check-style.js`, then load the site and study a card from the batch
   (confirm phrasings rotate, no console errors).
6. **Changelog**: one count line per shipping day, raised as batches land the same day (e.g.
   "Extra question phrasings for 21 cards in the World History prehistory deck, in all ten site
   languages."), with its nine `chrome.exact` translations via `add-lang.js` — never naming cards.
7. **Commit** per batch (or per day of batches), so a bad batch can be rolled back alone.

## After batch 15

- Update the `data.js` bullet in CLAUDE.md to say every card carries 3 phrasings.
- Delete this file (the plan is done).
- New cards resume, now under `add-card.js`'s built-in 3-phrasing requirement.
