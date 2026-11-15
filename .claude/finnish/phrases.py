#!/usr/bin/env python3
"""The phrases deck's expressions: Finnish set phrases, idioms and proverbs.

    python3 phrases.py      (from the cache directory, by run.py --level phr)

Reads `lex.json` and the five level decks, writes `selected-phr.json` in the
shape `select.py` writes for a level, with two more fields, `sub` and `count`.
Ported from `.claude/hungarian/phrases.py` (2026-11-15, on request: "Add
phrases"; the plan's Phase 3).

Not a CEFR level: an expression is a unit a frequency list of words cannot
see.  Three subdecks, the Indonesian, Turkish, Hindi and Romanian arrangement
(`docs/lang-decks.md`, "THE PHRASES DECK"):

  Phrases   an expression of more than one word that Wiktionary files as a
            phrase or an interjection and does NOT tag idiomatic -- mostly the
            everyday formulas (`hyvää ruokahalua`, `ei se mitään`);
  Idioms    an expression of more than one word with a sense Wiktionary TAGS
            idiomatic (`heittää veivinsä`, `pitää kiinni`);
  Proverbs  Wiktionary's part of speech `proverb`.

One subdeck per expression: a proverb outranks an idiom outranks a phrase.  A
plain multi-word noun (`kansainvälinen oikeus`) is a word, not an expression, and is not
here.

NOTHING A LEVEL DECK TEACHES IS TAUGHT AGAIN (`finnish_level.words_below`),
and every sense goes through the level decks' filters: a weak sense (rare,
dialectal ...) is not a reason to include an expression, a pointer is not a
meaning (`select.POINTER`), an expression with a swear word in it is never used
(`examples.clean`), and `EXCLUDE` names the rest, each with its reason.

THE ORDER is how many of Tatoeba's Finnish sentences contain the expression
-- an idiom that is a verb matched with its verb in any form and, two words
long, in either order (`examples.phrase_hits`) -- then the expression's own
frequency estimate (`extract.py`), then its spelling.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fi import fold, tokens
from finnish_level import LEVEL, f, words_below
import examples


def _select():
    # `select` is also a standard-library module, already imported by the time this
    # runs, so the level stage is loaded from its file
    import importlib.util as ilu
    spec = ilu.spec_from_file_location('finnish_select',
                                       os.path.join(os.path.dirname(os.path.abspath(__file__)), 'select.py'))
    m = ilu.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


SEL = _select()

assert LEVEL == 'phr', 'phrases.py builds the phrases deck only (run.py --level phr)'

ORDER = ['Phrases', 'Idioms', 'Proverbs']
PHRASE_POS = {'phrase', 'intj'}
IDIOM_POS = {'verb', 'adv', 'adj', 'noun', 'phrase', 'intj'}

# Never taught, whatever the source says.  Each line says why (read off the first build,
# 2026-11-15).
EXCLUDE = {
    # not a set phrase, or no meaning a card can show
    'elämä on': 'a fragment (of "sellaista elämä on"), first glossed as a usage note',
    'en puhu': 'a fragment ("I don\'t speak ..."); en puhu englantia and en puhu suomea are kept',
    'olen hetero': 'a personal sentence ("I\'m straight"), not a set phrase (Hungarian\'s rule)',
    'en ole uskonnollinen': 'a personal sentence, not a set phrase',
    # foreign phrases
    "c'est la vie": 'French', 'iter semel': 'Latin (a prescription\'s note)', 'dagen efter': 'Swedish',
    # rude, crude or violent
    'turpa kiinni': 'rude ("shut your trap")', 'pää kiinni': 'rude ("shut up!")',
    'haista home': 'an insult ("get stuffed")', 'älä hitossa': 'crude ("no shit")',
    'istu ja pala': 'a curse', 'reikä päähän': 'a threat ("death or bodily harm")',
    'päästä pukille': 'sexual slang', 'vanha pieru': 'crude ("old fart")',
    'antaa turpaan': 'slang for beating someone up',
}


# A sense that is no meaning a card can show: the level decks' pointers, the card's own
# NOT_A_MEANING ("Used other than figuratively ...: see ...", "synonym of ..."), and a pointer to
# another spelling ("A pronunciation variant of jukranpujut", "A variant of veljekset kuin
# ilvekset").  The first build had twelve expressions whose every sense was one of these:
# their cards came out with no English.
from build_deck import NOT_A_MEANING, gloss_text
import re as _re
VARIANT = _re.compile(r'^(?:an? )?(?:pronunciation |spelling )?variant of ', _re.I)


def good(e):
    return [g for g in e['glosses'] if g['g'] and not g['weak'] and not SEL.POINTER.match(g['g'])
            and not NOT_A_MEANING.search(gloss_text(g['g'])) and not VARIANT.match(g['g'])]


def gloss_sig(L):
    """The expression's meaning, as the card shows it: its first good gloss."""
    for e in L['entries']:
        gl = good(e)
        if gl:
            return gl[0]['g'].lower().strip(' .!?')
    return ''


def classify(lex):
    rows = {}
    for k, L in lex.items():
        if ' ' not in k or 'entries' not in L or L.get('formonly'):
            continue
        if '...' in k or '…' in k or k[0] == '-' or k[-1] == '-':
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
    swears = {fold(s) for s in SEL.SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    rows = []
    for k, (sub, _, pos) in classify(lex).items():
        if k in below or k in excl or not examples.clean(lex[k]['word']) \
                or any(fold(w) in swears for w in tokens(k)):
            continue
        L = lex[k]
        rows.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': pos if sub != 'Phrases' else '', 'source': 'phrases',
                     'topic': '', 'sub': sub})
    # how many Tatoeba sentences contain each expression
    pairs = examples.load()
    toks = [[fold(t) for t in tokens(fi_)] for _, fi_, _ in pairs]
    index = {}
    for i, ft in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    for r in rows:
        r['count'] = len(examples.phrase_hits(r, lex, toks, index))
    rows.sort(key=lambda r: (ORDER.index(r['sub']), -r['count'], -r['freq'], r['key']))
    # ONE EXPRESSION PER MEANING (Finnish, 2026-11-15): Wiktionary gives a phrase's spoken and
    # fuller variants entries of their own, glossed alike (`rakastan sinua`, `minä rakastan
    # sinua`, `mä rakastan sua`) -- on the reverse card one English side would have three right
    # answers.  The commonest (the order just made) is kept; an expression with a spoken
    # spelling (`examples.COLLOQUIAL`) never is.
    kept, seen = [], set()
    for r in rows:
        if any(fold(w) in examples.COLLOQUIAL for w in r['word'].split()):
            continue
        sig = gloss_sig(lex[r['key']])
        if sig in seen:
            continue
        seen.add(sig)
        kept.append(r)
    rows = kept
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    by = {s: sum(1 for r in rows if r['sub'] == s) for s in ORDER}
    print(f'  {len(rows)} expressions: ' + ', '.join(f'{by[s]} {s.lower()}' for s in ORDER) +
          f'; {sum(1 for r in rows if r["count"])} occur in a Tatoeba sentence')


if __name__ == '__main__':
    main()
