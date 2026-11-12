#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`ron_sentences_detailed.tsv`, `ron-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Romanian, English, [matched tokens]] triples.

A sentence matches a word when one of its tokens is the word or a form in its
table (`fac`, `făcut` for `face`), compared through `ro.fold`.  A multi-word
entry (de la) matches its words in sequence.  Among the matches the choice is
deterministic: the headword's own spelling first, then sentences of four to
ten words, then the shorter, then the lower sentence id -- so a re-run is
byte-identical.  A Romanian sentence with several English translations takes the
shortest.  Each sentence is used at most once per deck, so three cards do not
share one sentence.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ro import fold, nfc, tokens
from ro_level import LEVEL, f

csv.field_size_limit(10 ** 8)


def load():
    hin = {}
    for row in csv.reader(open('ron_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            hin[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('ron-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in hin:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for hid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(hid), hin[hid], en[0]))
    pairs.sort()
    return pairs


def forms_of(row, lex):
    L = lex[row['via']] if row.get('via') else lex[row['key']]
    out = {fold(row['word'])}
    for e in L.get('entries', []):
        if row['pos'] and e['pos'] != row['pos']:
            continue
        for t in e['table']:
            fm = fold(t['f'])
            # a cell written with its particle (`să facă`, `nu face`) is matched on its verb
            out.add(fm.split(' ')[-1] if fm.split(' ')[0] in ('să', 'nu', 'a') else fm)
    return out


# THE PHRASES DECK ONLY: an expression that IS a verb is matched with its VERB in any
# form of that verb, and a reflexive clitic before it in any person -- Romanian puts
# the verb first (`face față` -> `fac față`, `își ține gura` -> `îmi țin gura`), where
# Hindi and Turkish put it last.  An expression that is not a verb is matched as
# written.  The level decks keep their exact matching, so they rebuild byte-identical.
REFL_ACC = {'mă', 'te', 'se', 'ne', 'vă'}
REFL_DAT = {'îmi', 'îți', 'își', 'ne', 'vă', 'mi', 'ți', 'și', 'i', 'le', 'îi'}


def phrase_parts(row, lex):
    """One set of accepted tokens per position of the expression."""
    words = [fold(t) for t in tokens(row['word'])]
    sets = [{w} for w in words]
    L = lex.get(row['key'], {})
    if not any(e['pos'] == 'verb' for e in L.get('entries', [])):
        return sets
    i = 0
    if words[0] in REFL_ACC:
        sets[0], i = set(REFL_ACC), 1
    elif words[0] in REFL_DAT:
        sets[0], i = set(REFL_DAT), 1
    if i < len(words):
        V = lex.get(words[i], {})
        for e in V.get('entries', []):
            if e['pos'] == 'verb':
                for t in e['table']:
                    fm = fold(t['f'])
                    if ' ' not in fm:
                        sets[i].add(fm)
    return sets


def seq_hit(ft, sets):
    n = len(sets)
    for j in range(len(ft) - n + 1):
        if all(ft[j + k] in sets[k] for k in range(n)):
            return ft[j:j + n]
    return None


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    pairs = load()
    toks = [(pid, hi, en, [fold(t) for t in tokens(hi)]) for pid, hi, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    used, out = set(), {}
    for row in rows:
        words = fold(row['word']).split()
        cands = []
        if LEVEL == 'phr' and len(words) > 1:
            sets = phrase_parts(row, lex)
            first = sets[0]
            seen = set()
            for w0 in sorted(first):
                for i in index.get(w0, []):
                    if i in seen:
                        continue
                    seen.add(i)
                    hit = seq_hit(toks[i][3], sets)
                    if hit:
                        cands.append((i, 0, hit))
        elif len(words) > 1:
            for i in index.get(words[0], []):
                ft = toks[i][3]
                for j in range(len(ft) - len(words) + 1):
                    if ft[j:j + len(words)] == words:
                        cands.append((i, 0, words))
                        break
        else:
            forms = forms_of(row, lex)
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
            _, hi, en, _ = toks[c[0]]
            picked.append([hi, en, sorted(set(c[2]))])
            if len(picked) == 3:
                break
        out[row['key']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
