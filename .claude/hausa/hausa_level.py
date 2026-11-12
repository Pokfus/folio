#!/usr/bin/env python3
"""Which Hausa level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `HAUSA_LEVEL` -- the
arrangement every pipeline here uses (`hindi_level`, `torfl_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  No exam board publishes a graded Hausa word
list, so, like the Hindi, UKBI Indonesian and TORFL Russian decks, these are
ASSEMBLED (the owner's decision, 2026-11-09): a hand-written inventory of each
level's topics (`inventory.py`), then the commonest remaining words by lemma
frequency in the Tatoeba corpus (`select.py`).  Each level is scoped to the
Council of Europe's CEFR global descriptor for its band, and the deck's
description says both things in plain words.  The plan is
`docs/hausa-decks-plan.md`.

THE SIZES ARE SMALLER THAN HINDI'S (A1 500, A2 750, B1 1,000; no B2 or C1) because
the open sources are: English Wiktionary holds about 2,000 Hausa words, and the
core words it lacks are glossed by hand (`hand.py`).  The owner chose A1-B1 at
these sizes over five levels that would have been mostly hand-glossed.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule; the alphabet deck's
title carries "Alphabet" and sorts before A1.
"""
import json, os

LEVEL = os.environ.get('HAUSA_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate'}

TITLES = {k: f'Hausa {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'hausa{k}' for k in BANDS}
DECK_FILES = {k: f'Hausa-{k.upper()}.folio-deck.json' for k in BANDS}
TITLES['phr'] = 'Hausa Phrases and Expressions'
DECK_IDS['phr'] = 'haphrase'
DECK_FILES['phr'] = 'Hausa-Phrases-and-Expressions.folio-deck.json'

# The owner's sizes (2026-11-09), in NOTES.
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000}

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
                  'telling the time, the days of the week, food and drink, shopping and money, '
                  'the home, the town and getting about, the body and feeling ill, the '
                  'weather, colours, and the pronouns, question words, prepositions and '
                  'particles every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to communicate in simple and routine tasks requiring a simple and '
                 'direct exchange of information on familiar and routine matters, and to '
                 'describe in simple terms their background, their immediate surroundings '
                 'and matters of immediate need',
        'topics': 'work and jobs, school, the months and the seasons, travel, the home and '
                  'the kitchen, food and cooking, clothes, nature and animals, the body and '
                  'health, feelings, free time, religion and festivals, the neighbourhood, '
                  'and the everyday verbs, describing words and adverbs a simple account of '
                  'one\'s day needs',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to '
                 'produce simple connected text on topics that are familiar or of personal '
                 'interest, and to describe experiences and events, dreams, hopes and '
                 'ambitions and briefly give reasons and explanations for opinions and plans',
        'topics': 'opinions and arguing a point, news, government and society, the law, money '
                  'and the economy, work and business, education, health and the body, the '
                  'environment, travel and its troubles, technology, the arts and media, '
                  'religion and custom, character and relationships, and the verbs, linking '
                  'words and abstract nouns connected speech is built out of',
    },
}

# Who the deck's description says it is for.
LEARNER = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner'}


# WHICH HAND GLOSSES THE LEXICON IS BUILT WITH, and where it goes: this level's and every
# level's below it (`hand.HANDS`).  A1's lexicon keeps its old name, `lex.json`, which
# `alphabet.py` also reads; a higher level's is `lex-<level>.json`.
HAND_LEVELS = BELOW.get(LEVEL, []) + ([LEVEL] if LEVEL in BANDS else [])
LEX = 'lex.json' if LEVEL == 'a1' else f'lex-{LEVEL}.json'


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every word a lower level teaches, read off its SHIPPED deck file (`Word`)."""
    from ha import norm
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            w = (c.get('fields') or {}).get('Word', '')
            if w:
                out.add(norm(w))
    return out
