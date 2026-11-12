#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`hin_sentences_detailed.tsv`, `hin-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Hindi, English, [matched tokens]] triples.

A sentence matches a word when one of its tokens is the word or a form in its
table (`खाया`, `खाती` for `खाना`), compared through `hi.fold`.  A multi-word
entry (के लिए) matches its words in sequence.  Among the matches the choice is
deterministic: the headword's own spelling first, then sentences of four to
ten words, then the shorter, then the lower sentence id -- so a re-run is
byte-identical.  A Hindi sentence with several English translations takes the
shortest.  Each sentence is used at most once per deck, so three cards do not
share one sentence.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hi import fold, nfc, tokens
from hindi_level import LEVEL, f

csv.field_size_limit(10 ** 8)


def load():
    hin = {}
    for row in csv.reader(open('hin_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            hin[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('hin-eng_links.tsv', encoding='utf-8'), delimiter='\t',
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
            out.add(fold(t['f']))
    return out


# THE PHRASES DECK ONLY: an expression that IS a verb (`नाक में दम करना`) is matched
# with its last word in any form of that verb (`नाक में दम कर दिया`), the Turkish
# finding; an expression that only ends in a verb-shaped word is matched as written.
# The level decks keep their exact matching, so they rebuild byte-identical.
def phrase_parts(row, lex):
    words = [fold(t) for t in tokens(row['word'])]
    last = {words[-1]}
    L = lex.get(row['key'], {})
    if any(e['pos'] == 'verb' for e in L.get('entries', [])) and words[-1].endswith('ना'):
        V = lex.get(words[-1], {})
        for e in V.get('entries', []):
            if e['pos'] == 'verb':
                last |= {fold(t['f']) for t in e['table'] if ' ' not in t['f']}
    return words, last


def seq_hit(ft, words, last):
    n = len(words)
    for j in range(len(ft) - n + 1):
        if ft[j:j + n - 1] == words[:-1] and ft[j + n - 1] in last:
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
            pw, last = phrase_parts(row, lex)
            for i in index.get(pw[0], []):
                hit = seq_hit(toks[i][3], pw, last)
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
