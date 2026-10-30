#!/usr/bin/env python3
"""Which TORFL level is being built, where its intermediates go, and what its list IS.

ONE LEVEL PER RUN.  `LEVEL` is read once, at import, from `TORFL_LEVEL`, so a
second level in the same process would be built against the first one's
settings -- the arrangement `dele_level`, `cils_level` and `ukbi_level` use.
Every intermediate a stage writes is suffixed with the level (`f()`), so one
level can be built after another without either overwriting the other's files.

WHAT THE LIST IS, AND WHAT IT IS NOT.  TORFL (ТРКИ, the Russian state test of
Russian as a foreign language) has a lexical minimum for each level, but it is
published as a copyrighted book and not as open data, so -- like the CILS
Italian and UKBI Indonesian decks, and unlike Goethe's or DELE's -- this deck
cannot say "this is the exam board's vocabulary".  It is ASSEMBLED, as UKBI's
is: a hand-written inventory of the level's own topics (`supplement.py`), then
the commonest remaining words of everyday Russian by lemma frequency
(`select.py`).  The deck's description says so in plain words.

THE TITLES ARE ENGLISH (the owner's decision, 2026-10-30): the level's English
name is in the title and the Russian name (Элементарный уровень, ТЭУ) only in
the description.  The CEFR band is in the title and the file name so that
`levelRank` in `.claude/build-lang-decks.js` sorts the levels with no new rule.

THE SCOPE OF A LEVEL.  The owner is supplying TORFL's own level descriptions;
until they are in this file, A1's scope is the Council of Europe's global
descriptor for A1, which TORFL's Elementary level is aligned to.  `SCOPE['a1']`
says which of the two it quotes, and `emit.py` prints that, so the deck never
claims a source it was not built from.
"""
import json, os, re

LEVEL = os.environ.get('TORFL_LEVEL', 'a1').lower()

BANDS = ('a1', 'a2', 'b1', 'b2', 'c1', 'c2')

# (English name, Russian name, abbreviation)
NAMES = {
    'a1': ('Elementary', 'Элементарный уровень', 'ТЭУ'),
    'a2': ('Basic', 'Базовый уровень', 'ТБУ'),
    'b1': ('Certificate Level 1', 'Первый сертификационный уровень', 'ТРКИ-1'),
    'b2': ('Certificate Level 2', 'Второй сертификационный уровень', 'ТРКИ-2'),
    'c1': ('Certificate Level 3', 'Третий сертификационный уровень', 'ТРКИ-3'),
    'c2': ('Certificate Level 4', 'Четвёртый сертификационный уровень', 'ТРКИ-4'),
}

TITLES = {k: f'TORFL {k.upper()} {v[0]} — Russian' for k, v in NAMES.items()}
DECK_IDS = {k: f'torfl{k}' for k in BANDS}
DECK_FILES = {k: f'TORFL-{k.upper()}-Russian.folio-deck.json' for k in BANDS}

# The owner's sizes (2026-10-30), in NOTES; an aspect pair is one note.
TARGET = {'a1': 500, 'a2': 750, 'b1': 1000, 'b2': 1500, 'c1': 1500, 'c2': 1000}

BELOW = {k: list(BANDS[:i]) for i, k in enumerate(BANDS)}

SCOPE = {
    'a1': {
        'source': 'cefr',
        'quote': 'Can understand and use familiar everyday expressions and very basic '
                 'phrases aimed at the satisfaction of needs of a concrete type',
        'gloss': 'able to introduce themselves and others, to ask and answer questions '
                 'about personal details such as where they live, people they know and '
                 'things they have, and to interact in a simple way provided the other '
                 'person talks slowly and clearly and is prepared to help',
        'topics': 'greetings and politeness, introducing yourself, family, numbers, '
                  'telling the time, days and months, food and drink, shopping and money, '
                  'the home, the town and getting about, the body and feeling ill, the '
                  'weather, colours, and the pronouns, question words, prepositions and '
                  'conjunctions every sentence is built out of',
    },
    'a2': {
        'source': 'cefr',
        'quote': 'Can understand sentences and frequently used expressions related to areas '
                 'of most immediate relevance',
        'gloss': 'able to manage simple, routine exchanges of information on familiar matters '
                 '— personal and family information, shopping, the local area, work — and to '
                 'describe in simple terms their background, their surroundings and what they '
                 'immediately need',
        'topics': 'relatives and the people around you, work and study, clothes and shopping, '
                  'more food and cooking, the furniture of a home, the town, the countryside '
                  'and the four points of the compass, travel, health and the body, feelings and '
                  'character, free time, telling what happened and when, giving an opinion, the '
                  'numbers to a million, and the everyday verbs of moving, dressing and doing',
    },
}


def f(name):
    """An intermediate file's name for this level."""
    base, ext = os.path.splitext(name)
    return f'{base}-{LEVEL}{ext}'


_DECKS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'decks')


def words_below():
    """Every lemma a lower level teaches, read off its SHIPPED deck file.

    From the file rather than a working file, so the exclusion is against what
    actually went out (the rule `goethe_level` records).  A note's `Word` field
    is its lemmas, unstressed and comma-separated -- both members of an aspect
    pair (`делать, сделать`) -- so a pair taught at A1 keeps its perfective out of
    A2 as well.  It is also what the speaker reads aloud.
    """
    from russian import fold
    out = set()
    for lvl in BELOW.get(LEVEL, []):
        p = os.path.join(_DECKS, DECK_FILES[lvl])
        if not os.path.exists(p):
            raise SystemExit(f'{LEVEL} is built on {lvl}, but {p} is missing')
        for c in json.load(open(p, encoding='utf-8'))['cards']:
            for w in re.split(r'\s*,\s*', (c.get('fields') or {}).get('Word', '')):
                if w:
                    out.add(fold(w))
    return out
