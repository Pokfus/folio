#!/usr/bin/env python3
"""Which Tagalog level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `TAGALOG_LEVEL` -- the
arrangement every pipeline here uses (`torfl_level`, `ukbi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  Tagalog (and Filipino, its standardised
form) has no CEFR certificate and no openly licensed graded word list that this
pipeline could find, so, like the Hindi, Romanian, UKBI Indonesian and TORFL
Russian decks, these decks are ASSEMBLED (2026-11-09, on Hindi's precedent): a
hand-written inventory of each level's topics (`inventory.py`), then the
commonest remaining words by lemma frequency (`select.py`).  Each level is
scoped to the Council of Europe's CEFR global descriptor for its band, and the
deck's description says both things in plain words.  The plan is
`docs/tagalog-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule.  Tagalog is written
in the Latin alphabet (Baybayin, the old script, is not taught), so there is no
script deck.
"""
import json, os, re

LEVEL = os.environ.get('TAGALOG_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Tagalog {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'tagalog{k}' for k in BANDS}
DECK_FILES = {k: f'Tagalog-{k.upper()}.folio-deck.json' for k in BANDS}
TITLES['phr'] = 'Tagalog Phrases and Expressions'
DECK_IDS['phr'] = 'tlphrase'
DECK_FILES['phr'] = 'Tagalog-Phrases-and-Expressions.folio-deck.json'

# The sizes, in NOTES -- Hindi's, the shelf's most recent assembled set.
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000, 'b2': 1500, 'c1': 1500}

BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}
BELOW['phr'] = list(BANDS)

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
                  'weather, colours, and the pronouns, markers, question words, particles '
                  'and conjunctions every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'relatives, jobs, clothes, the kitchen and cooking, fruit, the rooms and things '
                  'of a home, the town and its services, travel and transport, the natural world, '
                  'animals, health and the body, feelings and character, free time and '
                  'celebrations, school, the higher numbers and quantities, words for when and how '
                  'often, more colours, describing things, the everyday verbs of doing, '
                  'and the connectors and adverbs that join two sentences',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences, events, '
                 'dreams, hopes and ambitions and briefly give reasons and explanations for '
                 'opinions and plans',
        'topics': 'work and careers, money and banking, study and knowledge, health and medicine, '
                  'the media and technology, society and politics, crime and the law, nature and '
                  'the environment, belief and culture, travel and places, people and '
                  'relationships, feelings and the mind, opinion, reason and argument, abstract '
                  'description, the verbs of change, thought and speech, and the connectors of '
                  'a narrative',
    },
    'b2': {
        'quote': 'Can understand the main ideas of complex text on both concrete and abstract '
                 'topics, including technical discussions in his/her field of specialisation',
        'gloss': 'able to interact with a degree of fluency and spontaneity that makes regular '
                 'interaction with native speakers quite possible, and to produce clear, detailed '
                 'text on a wide range of subjects, explaining a viewpoint on a topical issue and '
                 'giving the advantages and disadvantages of various options',
        'topics': 'the economy and business, government and politics, law and justice, science '
                  'and research, technology, the environment, medicine and the body, education, '
                  'culture, the arts and the media, society and social issues, thought and '
                  'argument, advanced description, character and behaviour, and the verbs and '
                  'connectors of a reasoned text',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from tl import fold
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(('cap:' if w[:1].isupper() else '') + fold(w))
    return out
