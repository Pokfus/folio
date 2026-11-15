#!/usr/bin/env python3
"""Example sentences for each word: its own Wiktionary examples, then Tatoeba's.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json`, `kaikki-my.jsonl` (for the word cut's
dictionary) and the Tatoeba exports (`mya_sentences_detailed.tsv`,
`mya-eng_links.tsv`, `eng_sentences.tsv`, CC BY 2.0 FR) and writes
`examples-<level>.json`: word key -> up to three [Burmese, English, [matched words]].

THERE ARE FEW, AND THE DECK SAYS SO.  Tatoeba holds about 590 Burmese sentences
and English Wiktionary usage examples on about 200 Burmese entries, so many cards
have none.  Nothing is generated to fill the gap.

A SENTENCE IS CUT INTO WORDS FIRST (`my.Cutter`, the dictionary wikitext.py uses)
and matches a word only where a cut word IS that word or one of its listed
spellings -- a plain substring search would find နေ "sun" in နေကောင်းလား "how are
you?" and လာ "to come" in လား, the question particle.  The word's own Wiktionary
examples come first (they show the very sense the card teaches), then Tatoeba's,
the shorter first, then the lower id, so a re-run is byte-identical; a Tatoeba
sentence is used at most once per deck.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from my import key, norm, Cutter
from burmese_level import f
from wikitext import dictionary

csv.field_size_limit(10 ** 8)


def load():
    mya = {}
    for row in csv.reader(open('mya_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            mya[row[0]] = norm(row[2])
    links = {}
    for row in csv.reader(open('mya-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in mya:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    pairs = []
    for mid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            pairs.append((int(mid), mya[mid], en[0]))
    pairs.sort()
    return pairs


def forms_of(L):
    out = {key(L['word'])}
    for e in L['entries']:
        out.update(key(a) for a in e['alts'])
        if e.get('creaky'):
            out.add(key(e['creaky']))
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))['lemmas']
    cutter = Cutter(dictionary())
    pairs = load()
    toks = [(pid, my, en, cutter.tokens(my)) for pid, my, en in pairs]
    used, out = set(), {}
    for row in rows:
        L = lex[row['key']]
        forms = forms_of(L)
        got = []
        for e in L['entries']:
            if row['pos'] and e['pos'] not in row['pos']:
                continue
            for my, en in e.get('ex', []):
                hits = sorted({t for t in cutter.tokens(my) if t in forms})
                if hits:
                    got.append([my, en, hits])
        cands = []
        for i, (pid, my, en, tk) in enumerate(toks):
            if i in used:
                continue
            hits = sorted({t for t in tk if t in forms})
            if hits:
                cands.append((len(my), pid, i, hits))
        for _, _, i, hits in sorted(cands):
            if len(got) >= 3:
                break
            used.add(i)
            got.append([toks[i][1], toks[i][2], hits])
        if got:
            out[row['key']] = got[:3]
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False,
              sort_keys=True)
    print(f'  sentences for {len(out)} of {len(rows)} words')


if __name__ == '__main__':
    main()
