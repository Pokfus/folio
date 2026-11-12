#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`irish_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the corpus's count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ga import fold
from irish_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-12): the Irish Wikipedia's own vocabulary.  Each with its reason.
EXCLUDE = {
    # WIKIPEDIA'S SCAFFOLDING: its section headings, counted once per article
    'tagairt': 'the heading Tagairtí "References" on most articles',
    'nasc': 'the heading Naisc sheachtracha "External links" on most articles',
    # PLACE NAMES' PIECES: Baile Átha Cliath "Dublin", Cill Dara, Cill Chainnigh ...
    'áth': 'a ford, counted from Baile Átha Cliath', 'cliath': 'counted from Baile Átha Cliath',
    'cill': 'a church, counted from the place names Cill Dara, Cill Mhantáin ...',
    # A RARE WORD WHOSE COUNT IS ANOTHER'S
    'fál': 'a hedge, whose genitive fáil is the spelling of fáil "getting" (faigh)',
    'fuaigh': '"to sew", whose table shares fuair, the past of faigh',
    'iúl': 'whose genitive iúil is the spelling of Iúil "July"',
    'ab': 'an abbot; its count is the copula form ab',
    # MET ONLY IN A PHRASE, which the inventory teaches whole (tar éis, i ndiaidh ...)
    'éis': 'met only in tar éis', 'diaidh': 'met only in i ndiaidh', 'réir': 'met only in de réir',
    'measc': 'met only in i measc', 'feadh': 'met only in ar feadh',
    'leith': 'met in ar leith, i leith; its own noun is a flatfish',
    'láthair': 'met mostly in i láthair "present"',
    'maidir': 'met only in maidir le "as regards"', 'déanaí': 'met only in le déanaí "recently"',
    # A VERBAL NOUN, shown on its verb's card
    'déanamh': 'the verbal noun of déan', 'dul': 'the verbal noun of téigh',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'cac', 'striapach', 'bastard', 'damnú', 'focáil', 'raicleach'}

# A FILL WORD'S READING: the part of speech its count is for, where Wiktionary lists another first.
FILL_POS = {}

SAME_AS = {}


def gloss_sig(L):
    return tuple(sorted({g['g'] for e in L['entries'] for g in e['glosses'] if not g['weak']}))[:4]


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    return any(not g['weak'] for g in gl)


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if L and 'alt_of' in L:
                # the common spelling of a word Wiktionary files under another :
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            fq = lex[SAME_AS[k]]['freq'] if k in SAME_AS else L['freq']
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': fq, 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    sigs = {gloss_sig(lex[r['via']] if r['via'] else lex[r['key']]) for r in rows}
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: -kv[1]['freq']):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if len(k) < 2 and k not in ('i', 'ó', 'é', 'í'):
            continue
        # a MULTI-WORD lemma (tycka om, till exempel) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS (`sedan` beside `sen`, `något`
        # beside `nåt`): Wiktionary gives both full entries, glossed
        # alike, so a lemma whose glosses are those of a word already chosen is the same word.
        sig = gloss_sig(L)
        if sig in sigs:
            continue
        sigs.add(sig)
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'],
                     'pos': FILL_POS.get(k, ''),
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
