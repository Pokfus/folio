#!/usr/bin/env python3
"""Choose a level's words: the inventory first, then the commonest remaining words of spoken Cantonese.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `freq.json` (extract.py's) and writes `selected-<level>.json`: one row per card,
{key, word, jp, freq, source, topic}.  A card is a WORD IN ONE READING -- its key is the characters
and the Jyutping -- because a Cantonese character's readings are often different words (呢 ne1 is a
question particle, 呢 ni1 "this"; 行 haang4 "to walk", hong4 "a trade").

WHICH READING.  The inventory may name it (`行:haang4`).  Otherwise the reading HKCanCor's speakers
use most, where the corpus has the word; then the reading the two corpora together use most; then the
dictionary's first.  Tatoeba's counts are never the first test: its Jyutping is machine-made, and on
佢 it prefers the casual heoi5 to the keoi5 HKCanCor's transcribers wrote down.

A WORD NEITHER DICTIONARY HOLDS is carried by `hand.py` (its reading from HKCanCor, its English
Folio's) or reported and dropped -- never given a meaning here.

THE FILL takes the commonest word in HKCanCor not already taught (Tatoeba's counts rank nothing
here: see the comment in `main`), skipping: a word that is only a name; a
reading with no usable gloss; and a word HKCanCor tags mostly as an interjection (誒, 嗯, 吓 are the
corpus's hesitations, frequent and nothing to learn).  A word taught by a lower level is never dealt
again, by key.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from yue import fold
from cantonese_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY
from hand import HAND, EXCLUDE

# The topics dealt before everything else: a learner says these on the first day, and in a corpus of
# conversation they are rare (people greet once and talk for an hour).
LEAD_TOPICS = {'greetings and politeness'}
HK_MIN = 3


def usable(e):
    return bool(e.get('g')) or bool(e.get('w'))


def reading(w, L, fr, jp=None):
    """The entry a card shows for word `w`, or None."""
    ents = [e for e in L if usable(e)]
    if jp:
        return next((e for e in ents if e['j'] == jp), None)
    ents = [e for e in ents if not e['name']] or ents
    if not ents:
        return None
    hk = {j: sum(t.values()) for j, t in (fr.get('pos') or {}).items()}
    both = fr.get('j') or {}
    order = {e['j']: i for i, e in enumerate(L)}
    return sorted(ents, key=lambda e: (-hk.get(e['j'], 0), -both.get(e['j'], 0),
                                       0 if e['g'] else 1, order[e['j']]))[0]


def interjection(fr, jp):
    tags = (fr.get('pos') or {}).get(jp) or {}
    n = sum(tags.values())
    return n and tags.get('e', 0) * 2 > n


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    freq = json.load(open('freq.json', encoding='utf-8'))
    below = words_below()
    below_words = {k.split('|')[0] for k in below}
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, jp = item.partition(':')
            jp = jp.replace('_', ' ')
            if w in below_words and not jp:
                continue          # a lower level teaches it; a second reading must be named
            fr = freq.get(w, {})
            if w in HAND and (not jp or HAND[w]['j'] == jp):
                e = HAND[w]
                key = f"{w}|{e['j']}"
                if key in seen or key in below:
                    continue
                seen.add(key)
                rows.append({'key': key, 'word': w, 'jp': e['j'], 'freq': fr.get('j', {}).get(e['j'], 0),
                             'source': 'inventory', 'topic': topic, 'hand': True})
                continue
            e = reading(w, lex.get(w, []), fr, jp or None)
            if not e:
                missing.append(item)
                continue
            key = f"{w}|{e['j']}"
            if key in seen or key in below:
                continue
            seen.add(key)
            rows.append({'key': key, 'word': w, 'jp': e['j'], 'freq': fr.get('j', {}).get(e['j'], 0),
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    taught = {r['word'] for r in rows} | below_words
    fill = []
    # THE FILL IS RANKED BY HKCanCor ALONE (A2, 2026-11-15).  Tatoeba's machine cut splits a name or a
    # word it does not know into single characters, so its counts made 斯, 尼, 姆, 菲 (pieces of
    # transliterated names) and the literary 者, 之, 於 "common" -- at A2 they were most of the fill.
    # HKCanCor is cut by hand; a word it does not have at least HK_MIN times is not dealt by frequency.
    def hk(fr):
        return sum(sum(t.values()) for t in (fr.get('pos') or {}).values())
    for w, fr in sorted(freq.items(), key=lambda kv: (-hk(kv[1]), -kv[1]['n'], kv[0])):
        if hk(fr) < HK_MIN:
            break
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if w in taught or w in EXCLUDE or w not in lex:
            continue
        e = reading(w, lex[w], fr)
        if not e or e['name'] or not e['g'] or interjection(fr, e['j']):
            continue
        key = f"{w}|{e['j']}"
        taught.add(w)
        fill.append({'key': key, 'word': w, 'jp': e['j'], 'freq': fr.get('j', {}).get(e['j'], 0),
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (r['topic'] not in LEAD_TOPICS, -r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  IN NEITHER DICTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
