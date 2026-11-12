#!/usr/bin/env python3
"""Which Latin level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `LATIN_LEVEL` -- the
arrangement every pipeline here uses (`hindi_level`, `torfl_level`).  Every
intermediate a stage writes is suffixed with the level (`f()`).

WHAT THE LIST IS, AND WHAT IT IS NOT.  No examination publishes a graded Latin
word list on the CEFR -- the CEFR describes living languages, and Latin is
learnt to be READ -- so these decks are ASSEMBLED (the owner's decision,
2026-11-09): a hand-written inventory of each level's topics (`inventory.py`),
then the commonest remaining words of classical Latin by their rank in the
Dickinson College Commentaries Latin Core Vocabulary (`select.py`).  Each level
borrows the CEFR global descriptor for its band as a SCOPE -- which everyday
topics a learner at that band can handle -- and the deck's description says, in
plain words, that the band is borrowed and the list is Folio's own.  The plan
is `docs/latin-decks-plan.md`.

THE TITLES ARE ENGLISH and carry the CEFR band, so `levelRank` in
`.claude/build-lang-decks.js` sorts them with no new rule.
"""
import json, os

LEVEL = os.environ.get('LATIN_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1')
NAMES = {'a1': 'Beginner', 'a2': 'Elementary', 'b1': 'Intermediate',
         'b2': 'Upper Intermediate', 'c1': 'Advanced'}

TITLES = {k: f'Latin {k.upper()} {v}' for k, v in NAMES.items()}
DECK_IDS = {k: f'latin{k}' for k in BANDS}
DECK_FILES = {k: f'Latin-{k.upper()}.folio-deck.json' for k in BANDS}
TITLES['phr'] = 'Latin Phrases and Mottos'
DECK_IDS['phr'] = 'laphrase'
DECK_FILES['phr'] = 'Latin-Phrases-and-Mottos.folio-deck.json'

# Sizes in NOTES -- the Hindi set's, which the plan proposes and the owner may change.
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000, 'b2': 1500, 'c1': 1500}

# THE LEVELS THE DCC LIST CANNOT FILL (A1 and A2 take it to rank 891 of 996): their
# words beyond it are ordered by the classical-corpus count (`corpus.py`).
CORPUS_LEVELS = {'b1', 'b2', 'c1', 'phr'}

BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}
BELOW['phr'] = list(BANDS)

SCOPE = {
    'a1': {
        'quote': 'Can understand and use familiar everyday expressions and very basic '
                 'phrases aimed at the satisfaction of needs of a concrete type',
        'topics': 'greetings and politeness, people and the family, numbers, time, food '
                  'and drink, buying and selling, the house, the town and travel, the '
                  'body and illness, the sky and the weather, colours, animals, the '
                  'commonest describing words and verbs, and the pronouns, question '
                  'words, prepositions and conjunctions every sentence is built out of',
    },
    'a2': {
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'topics': 'the numbers to a thousand and the ordinals, the seasons and the parts of the '
                  'day, the wider family, work and the trades, the market, money and weights, '
                  'clothing, the rooms and things of a Roman house, meals and the kitchen, the '
                  'buildings of a town, roads, carts and ships, the country and the farm, more '
                  'animals, the body and health, school and writing, games and leisure, feelings '
                  'and character, more describing words, words of place and manner, and the '
                  'verbs of an ordinary day',
    },
    'b1': {
        'quote': 'Can understand the main points of clear standard input on familiar matters '
                 'regularly encountered in work, school, leisure, etc.',
        'topics': 'the state and its offices, law and the courts, the army and war, the gods '
                  'and religion, the sea and ships, land and geography, learning, speaking and '
                  'writing, building and the arts, trade, wealth and work, society and the '
                  'household, nature and the elements, time and history, mind, feeling and '
                  'character, more describing words, the words that join clauses, and the '
                  'verbs of thinking, speaking and doing',
    },
    'b2': {
        'quote': 'Can understand the main ideas of complex text on both concrete and abstract '
                 'topics, including technical discussions in his/her field of specialisation',
        'topics': 'philosophy and ethics, rhetoric, grammar and literature, law and government, '
                  'medicine and the body, farming and the estate, building and engineering, the '
                  'heavens and nature, the theatre and music, siege and fleet, abstract qualities, '
                  'emotions and attitudes, and the verbs of the treatises',
    },
}

# Who a level is for, in the description's "N words for …".
FOR = {'a1': 'a beginner', 'a2': 'an elementary learner', 'b1': 'an intermediate learner',
       'b2': 'an upper-intermediate learner', 'c1': 'an advanced learner'}


def load_lex():
    """`lex.json`, and from B1 on the lemmas only the classical count reaches
    (`classical.json`'s `lex`, `corpus.py`).  Run from the cache directory."""
    lex = json.load(open('lex.json', encoding='utf-8'))
    if LEVEL in CORPUS_LEVELS:
        lex.update(json.load(open('classical.json', encoding='utf-8'))['lex'])
    return lex


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file (`Key`)."""
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            k = (c.get('fields') or {}).get('Key', '')
            if k:
                out.add(k)
    return out
