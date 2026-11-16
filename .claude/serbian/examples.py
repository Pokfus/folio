#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json`, `ijekavian-forms.json` and the
Tatoeba exports (`srp_sentences.tsv`, `srp-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Serbian, English, [matched tokens]] triples.

A sentence matches a word when one of its tokens is the word or a form in its
table (`radim`, `radi` for `raditi`), compared through `sr.fold` (Latin, no
accent marks, lower case).  A multi-word entry (laku noć) matches its words in
sequence.  The choice is deterministic -- the headword's own spelling first,
then sentences of four to ten words, then the shorter, then the lower sentence
id -- so a re-run is byte-identical.  A sentence with several English
translations takes the shortest.  Each sentence is used at most once per deck.

ONLY CYRILLIC SENTENCES ARE USED, and none that holds an Ijekavian form
(`vrijeme`, `lijepo`).  The card prints Serbian in Cyrillic; most of Tatoeba's
Serbian is Cyrillic already, and a Latin sentence filed under `srp` is as often
Croatian or Bosnian as Serbian.  The decks teach the Ekavian standard, so a
sentence in the Ijekavian pronunciation would show a learner a spelling the
card does not teach.
"""
import csv, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sr import fold, nfc, tokens, is_cyr, NOT_SR_CYR
from serbian_level import LEVEL, f

csv.field_size_limit(10 ** 8)


def load():
    ijek = set(json.load(open('ijekavian-forms.json', encoding='utf-8')))
    srp = {}
    for row in csv.reader(open('srp_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) < 3:
            continue
        s = nfc(row[2])
        if not is_cyr(s) or re.search('[a-zA-Z]', s) or NOT_SR_CYR.search(s):
            continue
        if any(fold(t) in ijek for t in tokens(s)):
            continue
        srp[row[0]] = s
    links = {}
    for row in csv.reader(open('srp-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in srp:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for uid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(uid), srp[uid], en[0]))
    pairs.sort()
    return pairs


def forms_of(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    out = {fold(row['word'])}
    for e in L.get('entries', []):
        if row['pos'] and e['pos'] != row['pos']:
            continue
        for t in e['table']:
            if ' ' not in t['f']:
                out.add(fold(t['f']))
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    pairs = load()
    toks = [(pid, s, en, [fold(t) for t in tokens(s)]) for pid, s, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    used, out = set(), {}
    for row in rows:
        words = fold(row['word']).split()
        cands = []
        if len(words) > 1:
            for i in index.get(words[0], []):
                ft = toks[i][3]
                for j in range(len(ft) - len(words) + 1):
                    if ft[j:j + len(words)] == words:
                        cands.append((i, 0, words))
                        break
        else:
            forms = forms_of(row, lex)
            seen = set()
            for fm in sorted(forms):
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
