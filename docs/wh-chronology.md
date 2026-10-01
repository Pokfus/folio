# World History — the chronology the collection commits to

The dates and conventions the World History collection (`col-8`, `wh-001`–`wh-1000`) uses, in ONE place, so
that no two cards disagree about when something happened. Written in Oct 2026 as Batch 0 of the refinement
audit (`docs/wh-refinement-audit.md`), on the model of `docs/greece-chronology.md`.

**Every date line and every date in a background must agree with this file.** Where a card needs a date
this file does not carry, add the row here in the same commit as the card, with the source it came from.
Where a card's own research shows a row here is wrong, correct the row and grep the collection for the old
figure on the day — a correction does not travel on its own. A row is only ever added from a source a batch
actually read; nothing here is carried over from the bulk-written cards unchecked.

`node .claude/wh-audit.js` reads the `chronology-pins` block at the foot of this file and reports any pinned
card whose date line does not carry its pinned figures.

## Conventions

| case | write | not | why |
|---|---|---|---|
| a year under 1000 | `301 CE`, `c. 668 – 631 BCE` | `301`, `668–631 BC` | `cardYears` reads a bare first-millennium number only through the era |
| an approximate range | `c. 1750 – 1470 BCE` | `c. 1750 – c. 1470 BCE` | a `c.` inside a range breaks the era's leftward carry |
| a century | `c. 700 – 600 BCE` | `7th century BCE` | a century alone yields no sort year |
| millions of years | `c. 3.2 Mya`, `c. 4.2 – 2 Mya` | `3,200,000 years ago` on the line | the compact notation `cardYears` parses; the unit is written once and carries left |
| thousands of years | `c. 300,000 years ago` or `c. 45,000 BP` (calibrated) | `45 ka`, `45 kyr` | one form per card; `BP` means before 1950 and is used only where the source gives it |
| a span across the BCE line | `c. 2.6 Mya – 9700 BCE` | | parsed, and reads as the period it is |
| a radiocarbon date | the calibrated figure the source gives, as BP or BCE | an uncalibrated figure as if calendar years | say "radiocarbon years" in prose if a source gives only uncalibrated |
| a disputed date | two rows (`Dated` / `Also dated`), or in prose "X puts it…; Y puts it…" | one figure chosen silently | the Greece rule |
| a discovery | a `Found` row only on a fossil, site or find card, after the dates of the thing itself | a discovery year as the card's only date | a discovery year sorts the card into the 20th century |
| no date a source gives | omit it | an estimate | never estimated |

Questions carry **no dates at all** — no year, century, millennium or decade, and no figure of years
("two million years ago"). Period names (Pleistocene, Upper Palaeolithic) are fine.

## Geological and archaeological periods

Filled batch by batch, from the source each row names.

| period | the collection says | source |
|---|---|---|

## Chronology pins

The figures each refined card's date line must carry. One line per card, `wh-NNN: figure; figure`.

```chronology-pins
```
