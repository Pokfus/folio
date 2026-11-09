#!/usr/bin/env python3
"""Up to three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json`, `freq.json` and the Tatoeba exports
(`ang_sentences.tsv`, `ang-eng_links.tsv`, `eng_sentences.tsv`, CC BY 2.0 FR)
and writes `examples-<level>.json`: word -> up to three [Old English, English,
[matched folded tokens]] triples.

WHICH TOKEN IS WHOSE.  A sentence token belongs to the lemma the frequency
stage gave the largest share of it (extract.py's split, read back off
`freq.json`), so a sentence's þā "then" is never shown as an example of sē
"the", whose forms include þā.

Tatoeba holds about 800 Old English sentences, most of them from Ælfric, so
many words have none; the deck's description gives the real coverage.  Among
the matches the choice is deterministic: sentences of four to twelve words first, then the headword's own spelling,
then the shorter, then the lower id.
A sentence with several English translations takes the shortest.  Each
sentence is used at most once per deck.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from oe import fold, nfc, tokens
from oe_level import f

csv.field_size_limit(10 ** 8)


def load():
    ang = {}
    for row in csv.reader(open('ang_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            ang[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('ang-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in ang:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for aid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(aid), ang[aid], en[0]))
    return sorted(pairs)


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
    pairs = load()
    by_word = {}
    for pid, oe_s, en in pairs:
        toks = owned(owner, oe_s)
        if len(toks) > MAX_WORDS:
            continue
        low = set(tokens(en.lower()))
        for t, h in set(toks):
            if h and (h not in CHECK or low & set(CHECK[h])):
                by_word.setdefault(h, []).append((pid, oe_s, en, t, len(toks)))
    used = set()
    out = {}
    for r in rows:
        w = r['word']
        own = fold(w)
        cands = sorted(by_word.get(w, []),
                       key=lambda x: (not (4 <= x[4] <= 12), x[3] != own, x[4], x[0]))
        picked = []
        for pid, oe_s, en, t, n in cands:
            if pid in used:
                continue
            hits = sorted({k for k, h in owned(owner, oe_s) if h == w})
            picked.append([oe_s, en, hits])
            used.add(pid)
            if len(picked) == 3:
                break
        out[w] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  examples: {len(pairs)} sentence pairs; three for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
