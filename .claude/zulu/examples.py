#!/usr/bin/env python3
"""Example sentences for each word: its own Wiktionary examples, then Tatoeba's.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`zul_sentences_detailed.tsv`, `zul-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Zulu, English, [matched tokens]] triples.

THERE ARE FEW, AND THE DECK SAYS SO.  Tatoeba holds about a hundred Zulu
sentences with an English translation and Wiktionary about forty usage
examples, so most cards have none.  Nothing is generated to fill the gap.

THE WORD'S OWN WIKTIONARY EXAMPLES COME FIRST (they illustrate the very sense
the card teaches), then Tatoeba sentences in which one token is the word or a
form in its table (`ngiyahamba`, `uhambile` for `-hamba`), compared folded.
The choice is deterministic -- the shorter first, then the lower id -- so a
re-run is byte-identical, and a Tatoeba sentence is used at most once per deck.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from zu import fold, nfc, tokens
from zulu_level import f

csv.field_size_limit(10 ** 8)


def load():
    zul = {}
    for row in csv.reader(open('zul_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            zul[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('zul-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in zul:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for zid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(zid), zul[zid], en[0]))
    pairs.sort()
    return pairs


def entries(row, L):
    return [e for e in L['entries'] if not row['pos'] or e['pos'] == row['pos']] or L['entries']


def forms_of(row, L):
    out = set()
    for e in entries(row, L):
        if not e['canon'].startswith('-'):
            out.add(fold(row['word']))
        if e['pl']:
            out.add(fold(e['pl']))
        for t in e['table']:
            if not t['f'].startswith('-'):
                out.add(fold(t['f']))
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))['lemmas']
    pairs = load()
    toks = [(pid, zu, en, tokens(zu)) for pid, zu, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    used, out = set(), {}
    for row in rows:
        L = lex[row['key']]
        forms = forms_of(row, L)
        got = []
        for e in entries(row, L):
            for zu, en in e.get('ex', []):
                hits = sorted(set(tokens(zu)) & forms)
                got.append([zu, en, hits])
        cands = sorted({i for fm in forms for i in index.get(fm, []) if i not in used},
                       key=lambda i: (len(toks[i][1]), toks[i][0]))
        for i in cands:
            if len(got) >= 3:
                break
            used.add(i)
            got.append([toks[i][1], toks[i][2], sorted(set(toks[i][3]) & forms)])
        if got:
            out[row['key']] = got[:3]
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False,
              sort_keys=True)
    n = len(out)
    print(f'  sentences for {n} of {len(rows)} words')


if __name__ == '__main__':
    main()
