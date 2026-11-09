#!/usr/bin/env python3
"""Up to three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`swh_sentences_detailed.tsv`, `swh-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Swahili, English, [matched tokens]] triples.

A sentence matches a word when one of its tokens is the word, one of its listed
forms (a plural, an infinitive, an adjective's agreeing form), or -- for a verb
-- a token the verb parser reads as prefix + the verb's stem (`nilisoma`,
`hatutasoma`: `sw.VerbParser`).  A multi-word entry matches its words in
sequence.  The choice is deterministic: the headword's own spelling first, then
sentences of four to ten words, then the shorter, then the lower sentence id --
so a re-run is byte-identical.  A sentence with several English translations
takes the shortest.  Each sentence is used at most once per deck.

Tatoeba holds only about 4,500 Swahili sentences, so many words get fewer than
three, and some none; the deck's description counts them.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sw import norm, tokens, VerbParser
from swahili_level import f

csv.field_size_limit(10 ** 8)


def load():
    swh = {}
    for row in csv.reader(open('swh_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            swh[row[0]] = row[2].strip()
    links = {}
    for row in csv.reader(open('swh-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in swh:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for sid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(sid), swh[sid], en[0]))
    pairs.sort()
    return pairs


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    pairs = load()
    toks = [(pid, s, en, tokens(s)) for pid, s, en in pairs]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
    used, out = set(), {}
    for row in rows:
        words = row['key'].split()
        cands = []
        if len(words) > 1:
            for i in index.get(words[0], []):
                ft = toks[i][3]
                for j in range(len(ft) - len(words) + 1):
                    if ft[j:j + len(words)] == words:
                        cands.append((i, 0, words))
                        break
        else:
            k = row['key']
            forms = {k, norm(row['say']).lstrip('-')}
            verb = False
            for e in lex[k]['entries']:
                if row['pos'] and e['pos'] != row['pos']:
                    continue
                forms.update(x for x in e['plural'] + e['agree'] + [e['inf'], e['neginf']] if x)
                verb = verb or e['pos'] == 'verb'
            parser = None
            if verb:
                parser = VerbParser()
                parser.add(k)
            seen = set()
            for t, ids in index.items():
                if t in forms or (parser and k in parser.lemmas(t)):
                    for i in ids:
                        if i in seen:
                            continue
                        seen.add(i)
                        hit = [x for x in toks[i][3] if x in forms or (parser and k in parser.lemmas(x))]
                        cands.append((i, 0 if norm(row['say']) in hit or k in hit else 1, hit))

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
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
