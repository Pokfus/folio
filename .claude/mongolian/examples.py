#!/usr/bin/env python3
"""Example sentences for each word: its own Wiktionary examples, then Tatoeba's.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`mon_sentences_detailed.tsv`, `mon-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Mongolian, English, [matched tokens]] rows.

THERE ARE NOT MANY.  Tatoeba holds about 2,600 Mongolian sentences with an
English translation and Wiktionary about 560 usage examples, so many cards have
none.  Nothing is generated to fill the gap.

THE WORD'S OWN WIKTIONARY EXAMPLES COME FIRST (they illustrate the very sense
the card teaches), then Tatoeba sentences in which a token is one of the word's
listed forms, or is the headword with one noun ending peeled, or a verb's stem with one
verb ending peeled (`token_hits`).
The choice is deterministic -- the shorter first, then the lower id -- so a
re-run is byte-identical, and a Tatoeba sentence is used at most once per deck.
A sentence longer than twelve words is not used: a card's example is read at a
glance.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mn import key, nfc, tokens, verb_stem, peel_one, NOUN_SUFFIXES, VERB_SUFFIXES
from mongolian_level import f

csv.field_size_limit(10 ** 8)


def load():
    mon = {}
    for row in csv.reader(open('mon_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            mon[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('mon-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in mon:
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
            pairs.append((int(aid), mon[aid], en[0]))
    pairs.sort()
    out, texts = [], set()
    for p in pairs:                      # Tatoeba holds some sentences twice, under two numbers
        if p[1] not in texts:
            texts.add(p[1])
            out.append(p)
    return out


def forms_of(L, ptr_back):
    out = {key(L['word'])}
    for e in L['entries']:
        out.update(key(t) for t in e['table'])
        out.update(key(a) for a in e['alts'])
    out |= ptr_back.get(key(L['word']), set())
    return {k for k in out if k and ' ' not in k}


def head_of(L):
    """The headword a noun ending may follow (not a verb's dictionary form)."""
    if all(e['pos'] == 'verb' for e in L['entries']) or ' ' in L['word']:
        return ''
    return key(L['word'])


def vstem_of(L):
    if any(e['pos'] == 'verb' for e in L['entries']) and ' ' not in L['word']:
        v = verb_stem(key(L['word']))
        return v if len(v) >= 2 else ''
    return ''


# A Tatoeba name spelt as a word: Том is Tom in hundreds of sentences, not "big".
NAMES = {'том': 'Tom'}


def token_hits(tok, forms, vs, head, en='', lex=()):
    """A sentence's token is the word's when it is one of the forms Wiktionary lists for it,
    or the headword with ONE noun ending peeled, or the verb's stem with ONE verb ending
    peeled.  Never two: шилдэг "best" would peel to шил "glass", хайчийг "the scissors" to
    хай-, the stem of хайх "to look for"."""
    k = key(tok)
    if k in NAMES and NAMES[k] in en:
        return False
    if k in forms:
        return True
    if k in lex:                         # эмээ is "grandmother", not эм "medicine" + -ээ
        return False
    if head and head in peel_one(k, NOUN_SUFFIXES):
        return True
    return bool(vs) and vs in peel_one(k, VERB_SUFFIXES)


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    D = json.load(open('lex.json', encoding='utf-8'))
    lex = D['lemmas']
    ptr_back = {}
    for p_, t_ in D['pointers'].items():
        ptr_back.setdefault(t_, set()).add(p_)
    pairs = load()
    toks = [(pid, am, en, tokens(am)) for pid, am, en in pairs if len(tokens(am)) <= 12]
    used, out = set(), {}
    for row in rows:
        L = lex[row['key']]
        forms = forms_of(L, ptr_back)
        vs = vstem_of(L)
        head = head_of(L)
        got = []
        for e in L['entries']:
            for am, en in e.get('ex', []):
                hits = sorted({t for t in tokens(am) if token_hits(t, forms, vs, head, en, lex)})
                if hits:
                    got.append([am, en, hits])
        cands = []
        for i, (pid, am, en, tk) in enumerate(toks):
            if i in used:
                continue
            hits = sorted({t for t in tk if token_hits(t, forms, vs, head, en, lex)})
            if hits:
                cands.append((len(am), pid, i, hits))
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
