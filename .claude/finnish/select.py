#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`finnish_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fi import fold
from finnish_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY


# Read off the A1 ranking (2026-11-15).  Each with its reason.
EXCLUDE = {
    # A FORM OF A WORD THE DECK TEACHES, which Wiktionary also files as a word of its own:
    'mitä': 'the partitive of mikä ("what"), taught there; its own entry is "the ... the"',
    'sitä': 'the partitive of se, taught there; its own entry is "the ... the"',
    'naiset': 'the plural of nainen, glossed only "ladies" (an address)',
    'odota': 'the imperative of odottaa ("wait!"), taught there',
    'käy': 'a form of käydä, glossed only as the film set\'s "action!"',
    # A COUNT THAT BELONGS TO ANOTHER WORD:
    'et': 'the count is ei\'s "you (do) not"; its own entry is the ampersand',
    'niittää': 'the count is niitä, the partitive of ne ("them"); glossed "to mow"',
    # COLLOQUIAL SPELLINGS of words the deck teaches in the standard form:
    'mä': 'the spoken form of minä ("I"), which the deck teaches',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'vittu', 'perkele', 'saatana', 'helvetti', 'paska', 'huora', 'kyrpä', 'perse', 'pillu',
          'mulkku', 'runkata', 'kusipää', 'paskiainen', 'idiootti', 'ääliö', 'jumalauta', 'kusi',
          'paskapää', 'mulkero', 'narttu', 'homo', 'neekeri', 'hintti', 'vitun', 'saatanan',
          'perkeleen', 'helvetin', 'paskat', 'hitto', 'hiton', 'piru', 'piru', 'piruuttaan'}


def gloss_sig(L):
    return tuple(sorted({g['g'] for e in L['entries'] for g in e['glosses'] if not g['weak']}))[:4]


# A POINTER Wiktionary does not tag as a form, which `build_deck` drops, so the card would
# come out with no English -- the patterns the Hungarian set met ("first-person ... of X",
# "synonym of X", "only used in X", "verbal noun of X" bare), kept for Finnish.
POINTER = re.compile(r'^(?:(?:first|second|third)-person\b.*?|synonym) of \S+'
                     r'|^only used in\b|^verbal noun of \S+$')


def usable(L):
    """A non-weak, non-pointer gloss in the etymology the card SHOWS (`build_deck`: the
    first, unless `ETYMS` names others)."""
    first = L['entries'][0].get('etym', '') if L['entries'] else ''
    gl = [g for e in L['entries'] if e.get('etym', '') == first
          for g in e['glosses'] if not POINTER.match(g['g'])]
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
            # an inventory word whose own spelling is also a FORM of another lemma lost that
            # count in the split: it is dealt by the larger of its lemma count and its own
            # spelling's (Hungarian's rule)
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': max(L['freq'], L.get('own', 0)),
                         'pos': pos or '',
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
        if len(k) < 2:
            continue
        # a MULTI-WORD lemma (jó reggelt) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS: Wiktionary sometimes gives both full
        # entries, glossed alike, so a lemma whose glosses are those of a word already chosen
        # is the same word.
        sig = gloss_sig(L)
        if sig in sigs:
            continue
        sigs.add(sig)
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
