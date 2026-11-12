#!/usr/bin/env python3
"""Three Tatoeba sentences for each word, matched on its forms.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json` and the Tatoeba exports
(`heb_sentences_detailed.tsv`, `heb-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: row id -> up to three
[Hebrew, English, [matched tokens]] triples.

A sentence matches a word when one of its tokens is, through `he.fold`, the
word or a form of THE POINTED WORD the card teaches (its table, its head
forms) -- or such a form behind a prefix chain (`ובבית`, `שהילד`, `לבית`), but
only when the whole token is no form of any word in the dictionary, the rule
the count follows (`extract.py`).  A closed-class word takes no prefix reading
(ב + אני is not a word).  A multi-word entry matches its words in sequence.

The choice is deterministic: the headword's own spelling first, then sentences
of four to ten words, then the shorter, then the lower sentence id -- so a
re-run is byte-identical.  A Hebrew sentence with several English translations
takes the shortest.  Each sentence is used at most once per deck.
"""
import csv, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from he import fold, nfc, tokens, strips
from hebrew_level import f, LEVEL
from choose import choose, CLOSED

csv.field_size_limit(10 ** 8)

# A sentence holding one of these is not a learner's example (names read as words,
# violence), refused whatever word it would illustrate.
REFUSE_ANY = {'הרג', 'רצח', 'התאבד', 'אנס', 'זין', 'זונה'}


def load():
    he = {}
    for row in csv.reader(open('heb_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            he[row[0]] = nfc(row[2]).strip()
    links = {}
    for row in csv.reader(open('heb-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in he:
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
            pairs.append((int(hid), he[hid], en[0]))
    pairs.sort()
    return pairs


def forms_of(ents):
    out = set()
    for e in ents:
        for t in e['table'] + e['head']:
            if t['w'] and ' ' not in t['w']:
                out.add(fold(t['w']))
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    lex = json.load(open('lex.json', encoding='utf-8'))
    known = set(lex)
    for L in lex.values():
        for e in L.get('entries', []):
            for t in e['table'] + e['head']:
                if t['w']:
                    known.add(fold(t['w']))
    pairs = load()
    toks = [(pid, s, en, [fold(t) for t in tokens(s)]) for pid, s, en in pairs]
    refuse = {fold(w) for w in REFUSE_ANY}
    toks = [t for t in toks if not set(t[3]) & refuse]
    index = {}
    for i, (_, _, _, ft) in enumerate(toks):
        for t in set(ft):
            index.setdefault(t, []).append(i)
            if t not in known:
                for rest in strips(t):
                    index.setdefault('>' + rest, []).append(i)
    used, out = set(), {}
    for row in rows:
        L = lex[row['key']]
        ents = choose(L, row['pos'], row['pick'])
        words = fold(row['word']).split()
        cands = []
        if len(words) > 1 and LEVEL == 'phr':
            # the phrases deck: the expression's first word may carry a prefix chain (`ובוקר טוב`),
            # as `phrases.py` counts it; the levels keep the exact match they were built with
            for i in index.get(words[1], []):
                ft = toks[i][3]
                n = len(words)
                for j in range(len(ft) - n + 1):
                    if (ft[j] == words[0] or words[0] in strips(ft[j])) and ft[j + 1:j + n] == words[1:]:
                        cands.append((i, 0 if ft[j] == words[0] else 1, ft[j:j + n]))
                        break
        elif len(words) > 1:
            for i in index.get(words[0], []):
                ft = toks[i][3]
                n = len(words)
                for j in range(len(ft) - n + 1):
                    if ft[j:j + n] == words:
                        cands.append((i, 0, ft[j:j + n]))
                        break
        else:
            forms = forms_of(ents) | {words[0]}
            closed = all(e['pos'] in CLOSED for e in ents)
            seen = set()
            for fm in sorted(forms):
                for key in (fm,) if closed else (fm, '>' + fm):
                    for i in index.get(key, []):
                        if i in seen:
                            continue
                        seen.add(i)
                        hit = [t for t in toks[i][3] if t in forms
                               or (not closed and t not in known and set(strips(t)) & forms)]
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
        out[row['key'] + '|' + row['pick']] = picked
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    n3 = sum(1 for v in out.values() if len(v) == 3)
    n0 = sum(1 for v in out.values() if not v)
    print(f'  {len(pairs)} sentence pairs; three sentences for {n3} words, none for {n0}')


if __name__ == '__main__':
    main()
