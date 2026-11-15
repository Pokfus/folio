#!/usr/bin/env python3
"""Which Yoruba level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `YORUBA_LEVEL` -- the
arrangement every pipeline here uses (`amharic_level`, `zulu_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  No exam board publishes a graded Yoruba
word list, so, like the Zulu, Hausa and Amharic decks, these decks are ASSEMBLED:
a hand-written inventory of each level's topics (`inventory.py`), then the
commonest remaining words of the Yoruba Wikipedia (`select.py`).  Each level is
scoped to the Council of Europe's CEFR global descriptor for its band, and the
deck's description says both things in plain words.  THREE LEVELS, A1 to B1, at
the Zulu, Hausa and Amharic sizes (500 / 750 / 1,000): English Wiktionary holds
about 4,300 Yoruba words.  The plan is `docs/yoruba-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule.
"""
import json, os

LEVEL = os.environ.get('YORUBA_LEVEL', 'a1').lower()
BANDS = ('a1', 'a2', 'b1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate'}
TITLES = {k: f'Yoruba {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'yoruba{k}' for k in BANDS}
DECK_FILES = {k: f'Yoruba-{k.upper()}.folio-deck.json' for k in BANDS}
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000}
BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}

SCOPE = {
    'a1': {
        'quote': 'Can understand and use familiar everyday expressions and very basic '
                 'phrases aimed at the satisfaction of needs of a concrete type',
        'gloss': 'able to introduce themselves and others, to ask and answer questions '
                 'about personal details such as where they live, people they know and '
                 'things they have, and to interact in a simple way provided the other '
                 'person talks slowly and clearly and is prepared to help',
        'topics': 'greetings and politeness, the pronouns, question and joining words, numbers, '
                  'people and the family, the body and feeling ill, time and the days of the week, '
                  'food and drink, money and shopping, the home and clothes, the town and getting '
                  'about, the weather, colours, animals, school and work, the everyday verbs, '
                  'describing things, and the little words of place and manner every sentence is '
                  'built out of',
    },
}
WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner'}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every headword a lower level teaches, read off its SHIPPED deck file (`Word`), lower case."""
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(w.lower())
    return out
