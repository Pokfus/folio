#!/usr/bin/env python3
"""Which Swahili level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `SWAHILI_LEVEL` -- the
arrangement every pipeline here uses (`hindi_level`, `torfl_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  No exam board publishes a graded Swahili
word list that can be reused -- there is no DELE, HSK or Goethe of its own -- so,
like the Hindi, UKBI Indonesian and TORFL Russian decks, these decks are
ASSEMBLED: a hand-written inventory of each level's topics (`inventory.py`), then
the commonest remaining words by lemma frequency (`select.py`).  Each level is
scoped to the Council of Europe's CEFR global descriptor for its band, and the
deck's description says both things in plain words.  The plan is
`docs/swahili-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule.
"""
import json, os

LEVEL = os.environ.get('SWAHILI_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Swahili {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'swahili{k}' for k in BANDS}
DECK_FILES = {k: f'Swahili-{k.upper()}.folio-deck.json' for k in BANDS}

# Sizes in NOTES, Hindi's ladder.
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000, 'b2': 1500, 'c1': 1500}

BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}

SCOPE = {
    'a1': {
        'quote': 'Can understand and use familiar everyday expressions and very basic '
                 'phrases aimed at the satisfaction of needs of a concrete type',
        'gloss': 'able to introduce themselves and others, to ask and answer questions '
                 'about personal details such as where they live, people they know and '
                 'things they have, and to interact in a simple way provided the other '
                 'person talks slowly and clearly and is prepared to help',
        'topics': 'greetings and politeness, introducing yourself, family, numbers, '
                  'telling the time, days and months, food and drink, shopping and money, '
                  'the home, the town and getting about, the body and feeling ill, the '
                  'weather, colours, and the pronouns, question words and little words '
                  'every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas of '
                 'most immediate relevance',
        'gloss': 'able to communicate in simple and routine tasks requiring a simple and direct '
                 'exchange of information on familiar and routine matters, and to describe in '
                 'simple terms aspects of their background, immediate environment and matters '
                 'in areas of immediate need',
        'topics': 'the months and seasons, the land, the weather and animals, clothes, the home '
                  'and the kitchen, food and cooking, work and jobs, school, travel and transport, '
                  'the town, health, feelings, free time, the everyday verbs of these, describing '
                  'things and people, time words, and the words that join one clause to the next',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every word a lower level teaches, read off its SHIPPED deck file (`Word`, the
    headword as spoken: `kusoma`, `zuri`)."""
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            k = (c.get('fields') or {}).get('Word', '')
            if k:
                out.add(k)
    return out
