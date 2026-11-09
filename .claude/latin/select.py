#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, each marked with where it came from (`inventory` or `frequency`).

THE ORDER the cards are dealt in: the word's rank in the DCC Latin Core
Vocabulary first (the commonest classical words first), then -- for the
inventory words the DCC list does not hold (`fēlēs`, `ientāculum`, `caeruleus`)
-- their lemma count over the Tatoeba corpus.

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`latin_level.words_below`).

WHICH ENTRIES A ROW KEEPS (`canon`, `pos`): an inventory word written with its
macrons keeps the Wiktionary entries whose headword is spelt exactly so; a fill
word keeps the entries matching its DCC headword's spelling and part of speech.
So `mālum` is the apple and never the evil, and the fill's `cum` is the
preposition AND the conjunction, as the DCC list has both.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la import fold, tidy, nfc
from latin_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
}


def usable(L, canon=None):
    for e in L['entries']:
        if canon and e['canon'] not in canon:
            continue
        if any(not g['weak'] for g in e['glosses']):
            return True
    return False


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, missing, loose = [], set(), [], []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = nfc(w.replace('_', ' '))
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            exact = [e['canon'] for e in L['entries'] if e['canon'] == w]
            if not exact:
                loose.append(f"{w} ({'/'.join(sorted({e['canon'] for e in L['entries']}))})")
            if not usable(L, exact or None):
                missing.append(item + ' (only weak senses)')
                continue
            seen.add(k)
            rows.append({'key': k, 'word': exact[0] if exact else L['word'], 'canon': exact[:1],
                         'pos': pos or '', 'dccpos': sorted({p for _, _, p in L['dcc_rows'] if p}),
                         'source': 'inventory', 'topic': topic,
                         'dcc': L['dcc'], 'tat': L['tat']})
    n_inv = len(rows)
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(((k, L) for k, L in lex.items() if L['dcc']), key=lambda kv: kv[1]['dcc']):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in below or k in excl or ' ' in k:
            continue
        heads = [tidy(h.split()[0].rstrip(',')) for _, h, _ in L['dcc_rows']]
        canon = sorted({e['canon'] for e in L['entries'] if e['canon'] in heads})
        dpos = sorted({p for _, _, p in L['dcc_rows'] if p})
        if not usable(L, canon or None):
            continue
        # THE DCC ROW MUST BE THIS LEMMA: "ā ab abs" (preposition) is filed under its
        # first spelling, and Wiktionary's `ā` is the letter and an interjection
        if dpos and not any(e['pos'] in dpos for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'word': canon[0] if canon else L['word'], 'canon': canon,
                     'pos': '', 'dccpos': dpos, 'source': 'frequency', 'topic': '',
                     'dcc': L['dcc'], 'tat': L['tat']})
    rows += fill
    rows.sort(key=lambda r: (r['dcc'] or 10 ** 6, -r['tat'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} from the DCC list')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))
    if loose:
        print('  MATCHED ONLY WITHOUT MACRONS (check the spelling):', '; '.join(loose))


if __name__ == '__main__':
    main()
