#!/usr/bin/env python3
"""The level's words, in frequency order: writes `selected-<level>.json`.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` (extract.py).  Every lemma is ranked by its lemma frequency
(ties by headword, so a re-run is byte-identical); a lemma that is another's
alternative spelling (`alt_of`), or is excluded below, takes no rank.  The level
is its band of that ranking (oe_level.BANDS) -- so Level 2's first word is the
501st, whatever Level 1 holds.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oe_level import LEVEL, BANDS, f

# HAND EXCLUSIONS, each with its reason.  A word here takes no rank at all.
EXCLUDE = {
    'tōm': 'counted off "Tom" in a name; the corpus has no "empty"',
    'þē': 'a late spelling of sē / þe; both are cards of their own',
    'ġe': 'the conjunction "and" (ġe … ġe "both … and") ties with ġē "you" on one '
          'spelling, and Ælfric\'s ge is the pronoun',
    'hālga': 'the weak form of hāliġ "holy" (se hālga, þā hālgan), which is the card',
    'hālġe': 'the weak feminine of hāliġ "holy", likewise',
    'sċeolh': 'counted off a form of sċulan',
    'māre': 'a form of māra "more", which is the card',
}


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    ranked = sorted((L for L in lex.values()
                     if not L.get('alt_of') and L['word'] not in EXCLUDE and L['freq'] > 0),
                    key=lambda L: (-L['freq'], L['word']))
    a, b = BANDS[LEVEL]
    band = ranked[a - 1:b]
    rows = [{'word': L['word'], 'rank': a + i, 'freq': L['freq']} for i, L in enumerate(band)]
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  selected {len(rows)} words, ranks {a}-{a + len(rows) - 1}; '
          f'the last has a count of {rows[-1]["freq"]:.1f}')


if __name__ == '__main__':
    main()
