#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`irish_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, literary ...);
  · a one-letter lemma, a multi-word lemma (the inventory's to choose) and a
    lemma that is only a phrase or a proverb (the phrases deck's);
  · a lemma used fewer than twice in the Tatoeba sentences, whatever the
    treebank says -- its prose is legislation and news (`ballstát`, `foráil`);
  · a VERBAL NOUN of a verb already on the level (`déanamh`, `fáil`, `dul`):
    the verb's card prints it, and as a card of its own it is the same word;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ga import low
from irish_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'fuil': 'its count is `an bhfuil` "is ...?", a form of bí, not "blood"',
    'bith': 'its count is `ar bith` "any, at all", not "world"',
    'at': 'its count is `atá`, the relative form of bí, not "swelling"',
    'ea': 'only ever `is ea` "it is", taught on the copula',
    'féidir': 'only ever `is féidir` "it is possible" -- a phrase, not a noun to learn alone',
    'réir': 'only ever `de réir` "according to"',
    'éis': 'only ever `tar éis` "after"',
    'thú': 'the object form of tú, taught on its card',
    'tí': 'the genitive of teach, taught on its card',
    'leabhair': 'the plural of leabhar, taught on its card',
    'beith': 'a variant of bheith, the verbal noun of bí',
    'dol': 'its count is `dul`, the verbal noun of téigh',
    'féan': 'its count is a form of féin',
    'inar': 'a relative form of i, taught on its card',
    'ina': 'a contraction of i + a, taught on its card',
    'níor': 'a past form of the negative particle ní',
    'gur': 'a form of the conjunction go',
    'ba': 'the past of the copula is',
    'dearna': 'its count is `an ndearna`, the dependent past of déan, not "palm"',
    'don': 'its count is `don` "to the" (do + an), not "misfortune"',
    'méad': 'only ever `cé mhéad` "how many", taught as that',
    'diaidh': 'only ever `i ndiaidh` "after"',
    'iúl': 'only ever `cur in iúl` "to express, to let know"',
    'ais': 'only ever `ar ais` "back" and `le hais` "beside", as its own gloss says',
    'ríomhaire': '',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    return any(not g['weak'] for g in gl)


def verbal_nouns(lex, keys):
    out = set()
    for k in keys:
        for e in lex[k]['entries']:
            if e['pos'] == 'verb':
                v = e['head'].get('verbal noun', '')
                # `ceannach(t)` is two spellings, ceannach and ceannacht
                for x in (v, v.split('(')[0], v.replace('(', '').replace(')', '')):
                    if x:
                        out.add(low(x))
    return out


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = low(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if L and 'alt_of' in L:
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    excl = {low(s) for s in EXCLUDE}
    vns = verbal_nouns(lex, [r['via'] or r['key'] for r in rows])
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or k in seen or k in below or k in excl or k in vns:
            continue
        if len(k) < 2 or ' ' in k or not usable(L) or L['freq'] < 1:
            continue
        # THE FILL WANTS CONVERSATIONAL EVIDENCE: two or more uses in the Tatoeba sentences.
        # The treebank alone is legislation and news, and on its count A1 took `ballstát`
        # "member state", `airteagal` "article (of law)" and `foráil` "provision".
        if L.get('tat', 0) < 2:
            continue
        if all(e['pos'] in ('phrase', 'proverb', 'name') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
        if any(e['pos'] == 'verb' for e in L['entries']):
            vns |= verbal_nouns(lex, [k])
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
