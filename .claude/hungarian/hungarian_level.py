#!/usr/bin/env python3
"""Which Hungarian level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `HUNGARIAN_LEVEL` --
the arrangement every pipeline here uses (`greek_level`, `hindi_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  Hungarian has examinations at these
levels (the ECL, the Origó and the university ITK exams, all accredited to the
CEFR), but no graded word list for any of them was found published, so these
decks do not claim to be any exam's vocabulary.  Like the Greek, Hindi and
UKBI Indonesian decks they are ASSEMBLED: a hand-written inventory of each
level's topics (`inventory.py`), then the commonest remaining words of everyday
Hungarian by lemma frequency (`select.py`).  Each level is scoped to the Council
of Europe's CEFR global descriptor for its band, and the deck's description says
both things in plain words.  The plan is `docs/hungarian-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the alphabet deck's
title carries "Alphabet" and sorts before A1.
"""
import json, os

LEVEL = os.environ.get('HUNGARIAN_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Hungarian {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'hungarian{k}' for k in BANDS}
DECK_FILES = {k: f'Hungarian-{k.upper()}.folio-deck.json' for k in BANDS}

# The Greek and Hindi sizes, in NOTES (the plan, §1).
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
                  'weather, colours, and the articles, pronouns, question words, '
                  'postpositions and particles every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'relatives and the people around you, jobs and study, clothes, more food and '
                  'cooking, the rooms and furniture of a home, the town and its services, travel '
                  'and holidays, nature, the seasons and the compass, animals, health and the '
                  'body, feelings and character, free time and sport, telling what happened '
                  'when, the higher numbers and measures, and the everyday verbs of moving, '
                  'dressing, cooking and doing',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences and '
                 'events, dreams, hopes and ambitions, and briefly give reasons and explanations '
                 'for opinions and plans',
        'topics': 'work, money and the economy, education, the news, media and technology, '
                  'government, law and society, the environment and the weather, health and '
                  'medicine, travel and transport, the household and its chores, relationships '
                  'and the stages of life, feelings and character, religion and festivals, '
                  'ideas, reasons and plans, the connectors that join sentences, words for '
                  'describing, and the verbs of thinking, deciding, arguing and changing',
    },
    'b2': {
        'quote': 'Can understand the main ideas of complex text on both concrete and abstract '
                 'topics, including technical discussions in their field of specialisation',
        'gloss': 'able to interact with a degree of fluency and spontaneity that makes regular '
                 'interaction with native speakers quite possible without strain for either '
                 'party, and to produce clear, detailed text on a wide range of subjects and '
                 'explain a viewpoint on a topical issue, giving the advantages and disadvantages '
                 'of various options',
        'topics': 'politics and public administration, the law and the courts, the economy and '
                  'finance, science and research, technology, the environment and natural '
                  'resources, health and the mind, the arts, literature and the media, history '
                  'and society, argument and evaluation — the words for claims, evidence, causes '
                  'and consequences — the formal connectors of written Hungarian, words for '
                  'describing, and the verbs of reporting, analysing and persuading',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from hu import fold
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(fold(w))
    return out
