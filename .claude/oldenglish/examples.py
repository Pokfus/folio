#!/usr/bin/env python3
"""Up to three sentences for each word, each with its reference: writes `examples-<level>.json`.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json`, `freq.json`, `thorpe-pairs.json` (thorpe.py) and the
pinned Tatoeba export (`tatoeba-ang.tsv`, CC BY 2.0 FR) and writes word -> up to three
[Old English, English, [matched folded tokens], reference].

TWO SOURCES, AND THE CARD NAMES WHICH (the beginner pass, 2026-11-27).
  · ÆLFRIC, with Thorpe's own facing translation of 1844, by page (thorpe.py): the prose the
    deck is ranked on, in Thorpe's spelling, the English his.  Real Old English.
  · TATOEBA, by sentence id: written by that site's contributors in the last few years, mostly
    in a normalised spelling with macrons -- modern compositions, short and plain, and the
    English is the contributor's.  Useful to a beginner and not evidence of the language; the
    reference says which is which.

WHICH TOKEN IS WHOSE.  A sentence token belongs to the lemma the frequency stage gave the
largest share of it (extract.py's split, read back off `freq.json`), so a sentence's þā
"then" is never shown as an example of sē "the", whose forms include þā.

THE CHOICE, deterministic.  For each word, in the order of the ranking:
  1. Ælfric's two best sentences of at most MAX_WORDS words, where he has them: reading him
     is what the deck is for;
  2. then the best of either source, to three.
"Best": a sentence of four to twelve words before any other; then the one with the FEWEST
WORDS THE READER HAS NOT MET -- a word counts as met when its lemma is this word or one ranked
above it, so a card's sentence is as readable as the deck can make it on the day it arrives;
then the headword's own spelling, the shorter, Tatoeba's lower id or Thorpe's earlier page.
Each sentence is used at most once per deck -- except that a word left with NO sentence takes
the best one another card already shows (a second pass): one shared sentence teaches more than
none.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oe import fold, nfc, tokens
from oe_level import f
from corpus import tatoeba_rows
from thorpe import REF


def load():
    """(source, order key, Old English, English, reference) for every translated sentence."""
    out = []
    for i, x in enumerate(json.load(open('thorpe-pairs.json', encoding='utf-8'))):
        out.append(('thorpe', i, nfc(x['oe']), x['en'], REF.format(x['p'])))
    for i, oe_s, en in tatoeba_rows():
        if en:
            out.append(('tatoeba', i, nfc(oe_s), en, f'Tatoeba {i}'))
    return out


def owner_map(lex, freq):
    """(folded token, capitalised mid-sentence?) -> the lemma with the largest share of it.
    The capital matters as it did for the count: a mid-sentence "God" is the noun."""
    out = {}
    for key, (_, hs) in freq.items():
        out[(key.rstrip('^'), key.endswith('^'))] = max(hs, key=lambda h: (lex[h]['freq'], h))
    return out


def owned(owner, s):
    """Each token of a sentence with the lemma it belongs to."""
    out = []
    for i, t in enumerate(tokens(s)):
        k = fold(t)
        cap = i > 0 and t[:1].isupper()
        out.append((k, owner.get((k, cap)) or owner.get((k, not cap))))
    return out


# THE COMMONEST FUNCTION WORDS SHARE THEIR SPELLINGS, and a sentence's þa may be "then" or
# "the": for these a sentence counts only when its English says the word's own meaning.
CHECK = {'þā': ('then', 'when'), 'þæt': ('that',), 'þe': ('who', 'which', 'that', 'whom'),
         'sē': ('the', 'that', 'who', 'this'), 'swā': ('so', 'as'), 'þonne': ('then', 'when', 'than')}
MAX_WORDS = 20


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    freq = json.load(open('freq.json', encoding='utf-8'))
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    owner = owner_map(lex, freq)
    rank = {r['word']: n for n, r in enumerate(rows)}
    by_word = {}
    for n, (src, key, oe_s, en, ref) in enumerate(load()):
        toks = owned(owner, oe_s)
        if len(toks) > MAX_WORDS or oe_s.count('"') % 2 or en.count('"') % 2:
            continue
        low = set(tokens(en.lower()))
        for t, h in set(toks):
            if h and (h not in CHECK or low & set(CHECK[h])):
                by_word.setdefault(h, []).append((n, src, key, oe_s, en, ref, t, toks))
    used = set()
    out = {}
    for r in rows:
        w = r['word']
        own = fold(w)
        here = rank[w]

        def cost(x):
            n, src, key, oe_s, en, ref, t, toks = x
            unmet = sum(1 for _, h in toks if rank.get(h, 10 ** 9) > here)
            return (not (4 <= len(toks) <= 12), unmet, t != own, len(toks), src, key)
        cands = sorted((x for x in by_word.get(w, []) if x[0] not in used), key=cost)
        picked = [x for x in cands if x[1] == 'thorpe'][:2]
        for x in cands:
            if len(picked) == 3:
                break
            if x not in picked:
                picked.append(x)
        picked.sort(key=cost)
        out[w] = []
        for n, src, key, oe_s, en, ref, t, toks in picked:
            used.add(n)
            out[w].append([oe_s, en, sorted({k for k, h in toks if h == w}), ref])
    shared = 0
    for r in rows:
        w = r['word']
        if out[w] or not by_word.get(w):
            continue
        own, here = fold(w), rank[w]
        n, src, key, oe_s, en, ref, t, toks = min(by_word[w], key=lambda x: (
            not (4 <= len(x[7]) <= 12), sum(1 for _, h in x[7] if rank.get(h, 10 ** 9) > here),
            x[6] != own, len(x[7]), x[1], x[2]))
        out[w].append([oe_s, en, sorted({k for k, h in toks if h == w}), ref])
        shared += 1
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    na = sum(1 for v in out.values() if any(x[3].startswith('Ælfric') for x in v))
    print(f'  examples: three for {n3} words, none for {n0}; Ælfric on {na} cards; '
          f'{shared} words share a sentence with another card')


if __name__ == '__main__':
    main()
