#!/usr/bin/env python3
"""Up to three example sentences for each word: Tatoeba's, then Wiktionary's.

    python3 examples.py      (from the cache directory, by run.py)

Thai's `examples.py`, re-keyed to Lao.  Reads `selected-<level>.json`,
`lex.json` and the Tatoeba exports (`lao_sentences_detailed.tsv`,
`lao-eng_links.tsv`, `eng_sentences.tsv`, CC BY 2.0 FR) and writes
`examples-<level>.json`: word key -> up to three [Lao, English, romanisation,
[[start, end], ...]] rows.

A word matches only where its first and last letters fall on the sentence's
cuts (`lo.Segmenter`), so ມາ "to come" is never found inside a longer word;
a word the cut holds inside a true compound matches at the second depth,
ranked after every sentence where it stands alone.  The choice is
deterministic (own cuts first, then sentences of 10 to 40 letters, then the
shorter, then the lower id), and each sentence is used at most once per deck.

TATOEBA HAS ABOUT 230 LAO SENTENCES -- a twentieth of its Thai -- so most
words take the usage examples Wiktionary gives on its entry (CC BY-SA 4.0),
and many have none.  Wiktionary's romanisation of an example is not shown: it
is the same unreliable system `lo.py` explains, and the card's own
romanisation comes from the IPA.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lo import fold, nfc, Segmenter
from lao_level import f

csv.field_size_limit(10 ** 8)


# A Tatoeba sentence left out, with its reason.
SKIP = {}


def load():
    lao = {}
    for row in csv.reader(open('lao_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and nfc(row[2]) not in SKIP:
            lao[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('lao-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in lao:
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
            pairs.append((int(tid), lao[tid], en[0]))
    pairs.sort()
    return pairs


def segmenter(lex):
    return Segmenter(set(lex))


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
    seg = segmenter(lex)
    sents = []
    for pid, th, en in load():
        text, coarse, fine = seg.boundaries(th)
        sents.append((pid, text, en, coarse, fine))
    used, out = set(), {}
    n_tat = n_wik = 0
    for row in rows:
        w = fold(row['word'])
        cands = []
        for i, (pid, text, en, coarse, fine) in enumerate(sents):
            if w not in text:
                continue
            sp = spans_in(text, w, coarse)
            depth = 0
            if not sp:
                sp, depth = spans_in(text, w, fine), 1
            if sp:
                n = len(text)
                cands.append(((depth, 0 if 10 <= n <= 40 else 1, n, pid), i, sp))
        picked = []
        for _, i, sp in sorted(cands):
            if i in used:
                continue
            used.add(i)
            picked.append([sents[i][1], sents[i][2], '', sp])
            n_tat += 1
            if len(picked) == 3:
                break
        if len(picked) < 3:
            have = {p[0] for p in picked}
            for e in shown_entries(row, lex):
                for th, rom, en in e.get('ex', []):
                    th = fold(th)
                    if th in have or len(picked) == 3:
                        continue
                    _, coarse, fine = seg.boundaries(th)
                    sp = spans_in(th, w, coarse) or spans_in(th, w, fine) or spans_in(th, w, set(range(len(th) + 1)))
                    if not sp:
                        continue
                    have.add(th)
                    picked.append([th, en, rom, sp])
                    n_wik += 1
        out[row['key']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(sents)} Tatoeba pairs; {n_tat} Tatoeba and {n_wik} Wiktionary sentences used; '
          f'three for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
