#!/usr/bin/env python3
"""The phrases deck's expressions: Ukrainian set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with one more field, `sub`.

Not a CEFR level: an expression is a unit a frequency list of words cannot
see, which is why the level decks teach so few of them.  Three subdecks, the
Indonesian, Turkish and Hindi arrangement (`docs/lang-decks.md`, "THE PHRASES
DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic -- mostly the
            everyday formulas (`до́брого ра́нку`, `на жаль`);
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic (`би́ти байдики́`, `ма́ти на ува́зі`);
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`ukrainian_level.words_below`),
and every sense goes through the level decks' filters: a weak sense (rare,
dialectal, a Russianism, vulgar ...) is not a reason to include an expression,
a template ("... ро́ків") is not an expression, and `EXCLUDE` names the rest,
each with its reason.

THE ORDER is how many of Tatoeba's Ukrainian sentences contain the
expression -- its verb counted in any form of that verb (`examples.py`'s
matching for this deck) -- then the expression's own frequency estimate
(`extract.py`), then its spelling.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from uk import fold, tokens, NOT_UK
from ukrainian_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, already imported by the time this
    # runs, so the level stage's lists are loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('ukrainian_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SWEARS = _select().SWEARS

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj', 'prep_phrase'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'prep_phrase', 'intj'}

# Never taught, whatever the source says.  Each line says why.
EXCLUDE = {
    # PHRASEBOOK SENTENCES, NOT SET PHRASES (the Turkish and Hindi rule): a sentence a
    # learner builds from the level decks, or a template, is not one to learn whole
    'я не знаю': 'a sentence built from level words ("I don\'t know"), not a set phrase',
    'я з': 'a template ("I\'m from ..."), not an expression',
    'походу з': 'a dialect template ("I\'m from ..."), not an expression',
    'я українець': 'a personal sentence built from level words, not a set phrase',
    'я українка': 'a personal sentence built from level words, not a set phrase',
    'у мене є питання': 'a sentence built from level words ("I have a question"), not a set phrase',
    # DIALECT AND RUSSIAN FORMS of a greeting the deck teaches in the standard language
    'я називаюсє': 'a dialect form of "my name is" (мене звати is taught)',
    'добри вечур': 'a Transcarpathian form of добрий вечір, which is taught',
    'добри день': 'a Transcarpathian form of добрий день, which is taught',
    'доброї раніці': 'a dialect form of доброго ранку, which is taught',
    'з раночком': 'a dialect form of доброго ранку, which is taught',
    'так єс сі': 'a Galician dialect exclamation',
    'Христос раждается': 'the Russian / Church Slavonic form of Христос народився, which is taught',
    'Христос рождається': 'a Russianised form of Христос народився, which is taught',
    'зложити голову': 'a dialect spelling of скласти голову',
    # the same expression twice
    'день добрий': 'добрий день reordered',
    'слава богові': 'a variant of слава богу, which is taught',
    'доброго раночку': 'the diminutive of доброго ранку, which is taught',
    'хай щастить': 'the short form of нехай щастить, which is taught',
    'за зачиненими дверима': 'the same idiom as за закритими дверима, which is taught',
    'висаджувати в повітря': 'the imperfective of висадити в повітря, which is taught',
    # religious invocations and slogans (the Hindi rule); the festival greetings and the
    # national salute (слава Україні — героям слава) stay
    'слава Ісусу Христу': 'a religious greeting rather than a festival one',
    'з нами Бог': 'a religious invocation',
    'все буде Україна': 'a political slogan',
    # not usable as a card
    'шакалячий експрес': 'a piece of Internet slang of one community',
    'як Марко в пеклі': 'its Wiktionary gloss is a usage note naming verbs, not a meaning',
}


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak']]


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or k[0] == '-' or k[-1] == '-' or NOT_UK.search(k):
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
    toks = [[fold(t) for t in tokens(s)] for _, s, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        words, alts = examples.phrase_parts(r, lex)
        hits = set()
        for fm in alts[0]:
            for i in index.get(fm, []):
                if i not in hits and examples.seq_hit(toks[i], words, alts):
                    hits.add(i)
        r['count'] = len(hits)
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
