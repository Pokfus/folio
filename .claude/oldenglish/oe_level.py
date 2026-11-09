"""Which Old English level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `OE_LEVEL` -- the
arrangement every pipeline here uses (`hindi_level`, `torfl_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS.  Old English has no examination and no CEFR, and nobody alive
speaks it, so a level here is not a stage of conversation: it is a BAND OF
FREQUENCY.  Level 1 is the 500 commonest lemmas of the surviving prose as this
pipeline counts it (corpus.py, extract.py), Level 2 the next 500, Level 3 the next
1,000, Level 4 the 1,000 after that -- 3,000 words, which is about where the
corpus's counts fall to a handful and a ranking stops meaning anything.  The
plan is `docs/oldenglish-decks-plan.md`.

THE TITLES carry "Level N", so `levelRank` in `.claude/build-lang-decks.js`
sorts them with no new rule; the alphabet deck's title carries "Alphabet" and
sorts first by the rule Russian added.
"""
import json, os

LEVEL = os.environ.get('OE_LEVEL', 'l1').lower()

LEVELS = ('l1', 'l2', 'l3', 'l4')
# (first rank, last rank) in the frequency order, 1-based and inclusive
BANDS = {'l1': (1, 500), 'l2': (501, 1000), 'l3': (1001, 2000), 'l4': (2001, 3000)}
TARGET = {k: b - a + 1 for k, (a, b) in BANDS.items()}
NUM = {k: k[1:] for k in LEVELS}
TITLES = {k: f'Old English Level {NUM[k]}' for k in LEVELS}
DECK_IDS = {k: f'oe{k}' for k in LEVELS}
DECK_FILES = {k: f'Old-English-Level-{NUM[k]}.folio-deck.json' for k in LEVELS}
BELOW = {k: list(LEVELS[:i]) for i, k in enumerate(LEVELS)}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(w)
    return out
