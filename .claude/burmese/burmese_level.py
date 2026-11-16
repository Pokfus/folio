#!/usr/bin/env python3
"""Which Burmese level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `BURMESE_LEVEL` -- the
arrangement every pipeline here uses (`zulu_level`, `hindi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  No exam board publishes a graded Burmese
word list (Myanmar has no proficiency test for foreigners with one), so, like the
Thai, Hindi and Amharic decks, these decks are ASSEMBLED: a hand-written inventory
of each level's topics (`inventory.py`), then the commonest remaining words by
their frequency in the Burmese Wikipedia (`select.py`).  Each level is scoped to the
Council of Europe's CEFR global descriptor for its band, and the deck's description
says both things in plain words.  PLANNED: A1 500, A2 750, B1 1,000 notes (the Thai
sizes); English Wiktionary has about 7,600 Burmese lemmas, so a B2 is possible and
is the owner's to ask for.  The plan is `docs/burmese-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule.
"""
import json, os

LEVEL = os.environ.get('BURMESE_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate'}

TITLES = {k: f'Burmese {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'burmese{k}' for k in BANDS}
DECK_FILES = {k: f'Burmese-{k.upper()}.folio-deck.json' for k in BANDS}

# In NOTES (the Thai sizes).
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
        'topics': 'greetings and politeness, the pronouns (a man\'s and a woman\'s), the question '
                  'words and the particles of the spoken language every sentence is built out of, '
                  'people and the family, numbers and the commonest counting words, time and the '
                  'days of the week, food and drink, money and shopping, clothes, the home, the '
                  'town and getting about, the body and feeling ill, the weather and nature, '
                  'colours, animals, school and work, the everyday verbs and the describing verbs',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'the months, Western and Burmese, time, clothes and things worn, work and jobs, '
                  'relatives and the stages of life, feelings, travel, the land and the weather, '
                  'animals, the body, health, food and cooking, the kitchen and the home, talking '
                  'and deciding, the everyday verbs of doing, describing things and people, and the '
                  'faith and the feasts',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences and '
                 'events, dreams, hopes and ambitions, and briefly give reasons and explanations '
                 'for opinions and plans',
        'topics': '(to be written with the level)',
    },
}

WHO = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner'}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma key a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from my import key
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(key(w))
    return out
