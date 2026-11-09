#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`lat_sentences_detailed.tsv`, `lat-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Latin, English, [matched tokens]] triples.

A sentence matches a word when one of its tokens is the word or a form in its
table (`amat`, `amāvit` for `amō`), compared through `la.fold` (so macrons,
j / i and u / v do not matter).  Among the matches the choice is deterministic:
the headword's own spelling first, then sentences of four to ten words, then
the shorter, then the lower sentence id -- so a re-run is byte-identical.  A
Latin sentence with several English translations takes the shortest.  Each
sentence is used at most once per deck, so three cards do not share one.

A FORM TWO WORDS OF THE DECK SHARE PROVES NOTHING about either: `est` is `sum`
and `edō`, `vīs` is `volō` and `vīs`, `rēs` ... .  So a sentence counts as an
example of a word only through a form no OTHER word of this deck also owns --
or through the headword's own spelling.
"""
import collections, csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from la import fold, nfc, tokens, kept
from latin_level import f

csv.field_size_limit(10 ** 8)


def load():
    lat = {}
    for row in csv.reader(open('lat_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            lat[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('lat-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in lat:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for lid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(lid), lat[lid], en[0]))
    pairs.sort()
    return pairs


def forms_of(row, lex):
    out = {row['key']}
    for e in kept(row, lex[row['key']]):
        for t in e['table']:
            if ' ' not in t['f']:
                out.add(fold(t['f']))
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    pairs = load()
    toks = [(pid, la, en, [fold(t) for t in tokens(la)]) for pid, la, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    forms = {r['key']: forms_of(r, lex) for r in rows}
    owners = collections.Counter(fm for fs in forms.values() for fm in fs)
    used, out = set(), {}
    for row in rows:
        k = row['key']
        own = {fm for fm in forms[k] if owners[fm] == 1} | {k}
        cands, seen = [], set()
        for fm in own:
            for i in index.get(fm, []):
                if i in seen:
                    continue
                seen.add(i)
                hit = [t for t in toks[i][3] if t in forms[k]]
                cands.append((i, 0 if k in hit else 1, hit))

        def rank(c):
            i, first, _ = c
            n = len(toks[i][3])
            return (first, 0 if 4 <= n <= 10 else 1, len(toks[i][1]), toks[i][0])
        picked, shapes = [], set()
        for c in sorted(cands, key=rank):
            # ONE SENTENCE PER SET OF WORDS: Tatoeba holds `Te amo` and `Amo te` both,
            # and three cards' worth of one sentence in two orders teaches nothing more
            shape = tuple(sorted(toks[c[0]][3]))
            if c[0] in used or shape in shapes:
                continue
            used.add(c[0])
            shapes.add(shape)
            _, la, en, _ = toks[c[0]]
            picked.append([la, en, sorted(set(c[2]))])
            if len(picked) == 3:
                break
        out[k] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = [k for k, v in out.items() if not v]
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {len(n0)}'
          + (': ' + ' '.join(n0) if n0 else ''))


if __name__ == '__main__':
    main()
