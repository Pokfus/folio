#!/usr/bin/env python3
"""Which Cantonese level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `CANTONESE_LEVEL` -- the arrangement every
pipeline here uses (`thai_level`, `hindi_level`).  Every intermediate a stage writes is suffixed with
the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  No examination board publishes a graded word list for
Cantonese -- there is no Cantonese counterpart of HSK, and Hong Kong's own language tests examine
written Chinese -- so, like the Thai, Hindi and UKBI decks, these decks are ASSEMBLED: a hand-written
inventory of each level's topics (`inventory.py`), then the commonest remaining words of SPOKEN
Cantonese by corpus frequency (`select.py`).  Each level is scoped to the Council of Europe's CEFR
global descriptor for its band, and the deck's description says both things in plain words.  The
plan is `docs/cantonese-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in `.claude/build-lang-decks.js` sorts
them with no new rule; the sounds deck's title carries "Jyutping" and has a rule of its own.
"""
import json, os

LEVEL = os.environ.get('CANTONESE_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Cantonese {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'yue{k}' for k in BANDS}
DECK_FILES = {k: f'Cantonese-{k.upper()}.folio-deck.json' for k in BANDS}
TITLES['phr'] = 'Cantonese Phrases and Expressions'
DECK_IDS['phr'] = 'yuephrase'
DECK_FILES['phr'] = 'Cantonese-Phrases-and-Expressions.folio-deck.json'

# Sizes in NOTES -- the Hindi and Thai sets', the closest precedents (an assembled list).
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
        'topics': 'greetings and thanks, the sentence-final particles, introducing yourself, '
                  'family, numbers and the classifiers they are counted with, money in dollars '
                  'and ten-cent pieces, telling the time, days and months, food and drink, yum '
                  'cha and eating out, shopping, the home, the town and getting about by MTR, bus '
                  'and minibus, the body and feeling ill, the weather, colours, and the pronouns, '
                  'question words, aspect markers, prepositions and conjunctions every sentence '
                  'is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'relatives and the people around you, jobs, work and school, clothes and '
                  'shopping with an Octopus card, cooking, dim sum and cha chaan teng food, the '
                  'furniture and chores of a flat, the town and its buildings, travel and '
                  'directions by MTR, ferry and tram, the countryside, nature and animals, the '
                  'seasons and typhoons, health and the body, feelings and character, free time, '
                  'sport and the festivals (Lunar New Year and its red packets, Mid-Autumn and its '
                  'mooncakes), more classifiers, telling what happened and when, comparing and '
                  'giving an opinion, and the everyday verbs of moving, dressing and doing',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'gloss': 'able to deal with most situations likely to arise while travelling, to produce '
                 'simple connected text on familiar topics, and to describe experiences and '
                 'events, dreams, hopes and ambitions, and briefly give reasons and explanations '
                 'for opinions and plans',
        'topics': 'work and careers, money, banking and the economy, education, the news, media '
                  'and technology, government, law and society, the environment, health and '
                  'medicine, travel, transport and accommodation, the household and its chores, '
                  'relationships and the stages of life, feelings and character, Hong Kong customs '
                  'and beliefs, the nouns for ideas, reasons and plans, the words that join '
                  'sentences, and the verbs of thinking, deciding, arguing and changing',
    },
    'b2': {
        'quote': 'Can understand the main ideas of complex text on both concrete and abstract '
                 'topics, including technical discussions in their field of specialisation',
        'gloss': 'able to interact with a degree of fluency and spontaneity that makes regular '
                 'interaction with native speakers quite possible without strain for either '
                 'party, and to produce clear, detailed text on a wide range of subjects and '
                 'explain a viewpoint on a topical issue, giving the advantages and disadvantages '
                 'of various options',
        'topics': 'politics and public administration (the Legislative Council, the Basic Law), '
                  'the law and the courts, the economy, business and finance, science and research, '
                  'technology and the internet, the environment and natural resources, health, '
                  'medicine and the mind, the arts, literature, Cantonese opera and the media, '
                  'history and society (public housing, the MPF, subdivided flats), argument and '
                  'evaluation, the formal connectors, the verbs of reporting, analysing and '
                  'persuading, and the colloquial expressions of everyday Hong Kong speech',
    },
    # C1 is written when it is built (docs/cantonese-decks-plan.md §5).
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every card a lower level teaches, read off its SHIPPED deck file, as 'word|jyutping' keys.

    A Cantonese card is a word in ONE reading (`select.py`), so the key carries the Jyutping."""
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            F = c.get('fields') or {}
            if F.get('Word'):
                out.add(F['Word'] + '|' + F.get('Jyutping', ''))
    return out
