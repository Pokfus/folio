#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`pes_sentences_detailed.tsv`, `pes-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR; `pes` is Tatoeba's code for Iranian Persian) and writes
`examples-<level>.json`: word key -> up to three [Persian, English, [matched
tokens]] triples.

A sentence matches a word when one of its tokens is the word or a form in its
table, its plural or its spoken form, compared through `fa.fold`.  Persian
writes `می` apart or joined (`می روم`, `میروم`, `می‌روم`), and the fold drops
the joiner, so a sentence's tokens are also read with a lone `می` / `نمی`
joined to the word after it.  A multi-word entry (کار کردن) matches its words
in sequence, a light verb in any of its forms.  The choice is deterministic:
the headword's own spelling first, then sentences of four to ten words, then
the shorter, then the lower sentence id -- so a re-run is byte-identical.  A
Persian sentence with several English translations takes the shortest.  Each
sentence is used at most once per deck.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fa import fold, nfc, tokens
from persian_level import f

csv.field_size_limit(10 ** 8)


def load():
    fa = {}
    for row in csv.reader(open('pes_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            fa[row[0]] = nfc(row[2]).strip()
    links = {}
    for row in csv.reader(open('pes-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in fa:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for fid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(fid), fa[fid], en[0]))
    pairs.sort()
    return pairs


def ftoks(text):
    """Folded tokens, with a lone می / نمی joined to the word after it."""
    out, ts = [], [fold(t) for t in tokens(text)]
    i = 0
    while i < len(ts):
        if ts[i] in ('می', 'نمی') and i + 1 < len(ts):
            out.append(ts[i] + ts[i + 1])
            i += 2
            continue
        out.append(ts[i])
        i += 1
    return out


def forms_of(L, pos=''):
    out = {fold(L['word'])}
    for e in L.get('entries', []):
        if pos and e['pos'] != pos:
            continue
        for t in e['table'] + e['plural'] + e['colloq']:
            if ' ' not in t['f'] and 'stem' not in t.get('t', []):
                out.add(fold(t['f']))
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    pairs = load()
    toks = [(pid, s, en, ftoks(s)) for pid, s, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    used, out = set(), {}
    for row in rows:
        L = lex[row['via']] if row.get('via') else lex[row['key']]
        words = fold(row['word']).split()
        cands = []
        if len(words) > 1:
            # a compound verb: the first words as written, the LAST (the light verb) in any form
            last = lex.get(words[-1])
            lastf = forms_of(last, 'verb') if last else {words[-1]}
            for i in index.get(words[0], []):
                ft = toks[i][3]
                n = len(words)
                for j in range(len(ft) - n + 1):
                    if ft[j:j + n - 1] == words[:-1] and ft[j + n - 1] in lastf:
                        cands.append((i, 0 if ft[j + n - 1] == words[-1] else 1, ft[j:j + n]))
                        break
        else:
            forms = forms_of(L, row['pos'])
            seen = set()
            for fm in forms:
                for i in index.get(fm, []):
                    if i in seen:
                        continue
                    seen.add(i)
                    hit = [t for t in toks[i][3] if t in forms]
                    cands.append((i, 0 if words[0] in hit else 1, hit))

        def rank(c):
            i, own, _ = c
            n = len(toks[i][3])
            return (own, 0 if 4 <= n <= 10 else 1, len(toks[i][1]), toks[i][0])
        picked = []
        for c in sorted(cands, key=rank):
            if c[0] in used:
                continue
            used.add(c[0])
            _, s, en, _ = toks[c[0]]
            picked.append([s, en, sorted(set(c[2]))])
            if len(picked) == 3:
                break
        out[row['key']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
