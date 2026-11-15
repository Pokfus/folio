#!/usr/bin/env python3
"""Example sentences for each word: its own Wiktionary examples, then Tatoeba's.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`amh_sentences_detailed.tsv`, `amh-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Amharic, English, [matched tokens], romanisation] rows.

THERE ARE FEW, AND THE DECK SAYS SO.  Tatoeba holds about 250 Amharic sentences
with an English translation and Wiktionary about a hundred usage examples, so
most cards have none.  Nothing is generated to fill the gap.

THE WORD'S OWN WIKTIONARY EXAMPLES COME FIRST (they illustrate the very sense
the card teaches, and carry Wiktionary's romanisation), then Tatoeba sentences in
which a token is one of the word's listed forms, or peels (`am.stems`) to one,
compared by key.  The choice is deterministic -- the shorter first, then the
lower id -- so a re-run is byte-identical, and a Tatoeba sentence is used at most
once per deck.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from am import key, nfc, tokens, stems
from amharic_level import f

csv.field_size_limit(10 ** 8)


def load():
    amh = {}
    for row in csv.reader(open('amh_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            amh[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('amh-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in amh:
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
            pairs.append((int(aid), amh[aid], en[0]))
    pairs.sort()
    return pairs


def forms_of(L):
    out = {key(s) for s in L['spellings']}
    for e in L['entries']:
        out.update(key(p) for p, _ in e['pl'])
        out.update(key(t['f']) for t in e['table'])
        out.update(key(a) for a in e['alts'])
    if L.get('inf'):
        out.add(key(L['inf'][0]))
    return {k for k in out if k}


def token_hits(tok, forms):
    k = key(tok)
    if k in forms:
        return True
    return any(s in forms and len(s) >= 3 for _, _, s in stems(k))


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))['lemmas']
    pairs = load()
    toks = [(pid, am, en, tokens(am)) for pid, am, en in pairs]
    used, out = set(), {}
    for row in rows:
        L = lex[row['key']]
        forms = forms_of(L)
        got = []
        for e in L['entries']:
            for am, en, rm in e.get('ex', []):
                hits = sorted({t for t in tokens(am) if token_hits(t, forms)})
                got.append([am, en, hits, rm])
        cands = []
        for i, (pid, am, en, tk) in enumerate(toks):
            if i in used:
                continue
            hits = sorted({t for t in tk if token_hits(t, forms)})
            if hits:
                cands.append((len(am), pid, i, hits))
        for _, _, i, hits in sorted(cands):
            if len(got) >= 3:
                break
            used.add(i)
            got.append([toks[i][1], toks[i][2], hits, ''])
        if got:
            out[row['key']] = got[:3]
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False,
              sort_keys=True)
    print(f'  sentences for {len(out)} of {len(rows)} words')


if __name__ == '__main__':
    main()
