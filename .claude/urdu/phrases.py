#!/usr/bin/env python3
"""The phrases deck's expressions: Urdu set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Adapted from `.claude/hindi/phrases.py` (the rules are Hindi's, and the
Indonesian and Turkish arrangement before it: `docs/lang-decks.md`, "THE
PHRASES DECK").  Reads `lex.json` and the level decks, writes
`selected-phr.json` in the shape `select.py` writes for a level, with two more
fields, `sub` and `count`.

Three subdecks:

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic;
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic;
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`urdu_level.words_below`; there
is no C1 deck, so A1 to B2), a weak sense is no reason to include an
expression, and `EXCLUDE` names the rest, each with its reason.

THE ORDER is how many of Tatoeba's Urdu sentences contain the expression (a
verb-final expression counted in any form of the verb, `examples.py`), then
the expression's own frequency estimate, then its spelling.

IT IS SMALL BECAUSE THE SOURCE IS: English Wiktionary defines about sixty Urdu
expressions in all (2026-11-12), against Hindi's several hundred.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ur import fold, tokens
from urdu_level import LEVEL, f, words_below
import examples


def _swears():
    # `select` is also a standard-library module, already imported by the time this
    # runs, so the level stage's list is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('urdu_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.SWEARS


SWEARS = _swears()

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj'}

# Never taught, whatever the source says.  Each line says why -- Hindi's rules (2026-11-12).
# The everyday Arabic formulas of Urdu speech (ان شاء اللہ, الحمد للہ, سبحان اللہ, جزاک اللہ) and
# the honorifics written after a holy name ARE taught: in Urdu they are part of the language, which
# Hindi's rule against "a religious formula in Arabic rather than a Hindi phrase" does not cover.
EXCLUDE = {
    'میں پاکستانی ہوں': 'a personal sentence built from level words, not a set phrase',
    'لعنت ہو': 'an oath ("damn it")',
    'بھاڑ میں جاؤ': 'an oath ("go to hell"), as in Hindi',
    'لال سلام': 'a political salute',
    'امپورٹڈ حکومت نا منظور': 'a political slogan of one campaign',
    'جئے شری رام': 'a religious and political invocation, as in Hindi',
    'اہل ایمان': "a Quranic form of address, not an Urdu phrase, as in Hindi",
    'تودا ربا': 'Punjabi, with no romanisation in the source',
    'سلامت باشد': 'the same blessing as سلامت باشید, which the deck teaches',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak']]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or '-' == k[0] or '-' == k[-1]:
            continue
        for e in L['entries']:
            gl = good(e)
            if not gl:
                continue
            tags = {t for g in gl for t in g['tags']}
            if e['pos'] == 'proverb':
                sub = 'Proverbs'
            elif 'idiomatic' in tags and e['pos'] in IDIOM_POS:
                sub = 'Idioms'
            elif e['pos'] in PHRASE_POS:
                sub = 'Phrases'
            else:
                continue
            rank = ORDER.index(sub)
            if k not in rows or rank > rows[k][1]:
                rows[k] = (sub, rank, e['pos'])
    return rows


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    rows = []
    for k, (sub, _, pos) in classify(lex).items():
        if k in below or k in excl or any(w in swears for w in k.split()):
            continue
        L = lex[k]
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos if sub != 'Phrases' else '', 'source': 'phrases',
                     'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(hi)] for _, hi, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        words, last = examples.phrase_parts(r, lex)
        n = 0
        for i in index.get(words[0], []):
            if examples.seq_hit(toks[i], words, last):
                n += 1
        r['count'] = n
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
