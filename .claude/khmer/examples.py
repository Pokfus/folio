#!/usr/bin/env python3
"""Up to three example sentences for each word: Tatoeba's, then Wiktionary's.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`khm_sentences_detailed.tsv`, `khm-eng_links.tsv`, `eng_sentences.tsv`, CC BY 2.0
FR) and writes `examples-<level>.json`: word key -> up to three [Khmer, English,
romanisation, [[start, end], ...]] rows, the spans being where the word stands in
the sentence.

FINDING A WORD IN AN UNSPACED SENTENCE (`km.Segmenter`, Thai's method).  Each
sentence is cut into words by maximal matching against every Khmer headword of
Wiktionary, and a word matches only where its first and last letters fall on cuts
-- ត "ta" is never found inside ស្តី.  A word the cut holds inside a compound
matches at the second depth, ranked after every sentence where it stands alone.
The match is on `km.key` (subscript ta and da one letter), which keeps every
length, so a span found in the key is the span in the sentence printed.

THE CHOICE IS DETERMINISTIC: a word standing on the sentence's own cuts first,
then sentences of 8 to 40 letters, then the shorter, then the lower sentence id
-- so a re-run is byte-identical.  A Khmer sentence with several English
translations takes the shortest.  Each sentence is used at most once per deck.

TATOEBA'S KHMER IS SMALL -- some 1,400 sentences with an English translation --
so many words have none; Wiktionary's own usage examples (romanised and
translated, CC BY-SA 4.0) fill what they can, which is little: the Khmer entries
carry about 750 examples between them.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from km import fold, key, Segmenter
from khmer_level import f

csv.field_size_limit(10 ** 8)

# A Tatoeba sentence left out, with its reason.
SKIP = {}


def load():
    khm = {}
    for row in csv.reader(open('khm_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and fold(row[2]) not in SKIP:
            khm[row[0]] = fold(row[2])
    links = {}
    for row in csv.reader(open('khm-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in khm:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for tid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(tid), khm[tid], en[0]))
    pairs.sort()
    return pairs


def spans_in(text, w, cuts):
    out, i = [], text.find(w)
    while i >= 0:
        if i in cuts and i + len(w) in cuts:
            out.append([i, i + len(w)])
        i = text.find(w, i + 1)
    return out


def shown_entries(row, lex):
    """The entries `build_deck` will show, for Wiktionary's examples."""
    import build_deck
    if row.get('compose'):
        return []
    return build_deck.entries_for(row, lex)


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    seg = Segmenter(lex)
    sents = []
    for pid, km_, en in load():
        k, coarse, fine = seg.boundaries(km_)
        sents.append((pid, km_, k, en, coarse, fine))
    used, out = set(), {}
    n_tat = n_wik = 0
    for row in rows:
        w = key(row['word'])
        cands = []
        for i, (pid, text, k, en, coarse, fine) in enumerate(sents):
            if w not in k:
                continue
            sp = spans_in(k, w, coarse)
            depth = 0
            if not sp:
                sp, depth = spans_in(k, w, fine), 1
            if sp:
                n = len(k)
                cands.append(((depth, 0 if 8 <= n <= 40 else 1, n, pid), i, sp))
        picked = []
        for _, i, sp in sorted(cands):
            if i in used:
                continue
            used.add(i)
            picked.append([sents[i][1], sents[i][3], '', sp])
            n_tat += 1
            if len(picked) == 3:
                break
        if len(picked) < 3:
            have = {p[0] for p in picked}
            for e in shown_entries(row, lex):
                for km_, rom, en in e.get('ex', []):
                    km_ = fold(km_)
                    if km_ in have or len(picked) == 3:
                        continue
                    k, coarse, fine = seg.boundaries(km_)
                    sp = spans_in(k, w, coarse) or spans_in(k, w, fine) or \
                        spans_in(k, w, set(range(len(k) + 1)))
                    if not sp:
                        continue
                    have.add(km_)
                    picked.append([km_, en, rom, sp])
                    n_wik += 1
        out[row['key']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(sents)} Tatoeba pairs; {n_tat} Tatoeba and {n_wik} Wiktionary sentences used; '
          f'three for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
