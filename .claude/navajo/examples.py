#!/usr/bin/env python3
"""Example sentences for each word: its own Wiktionary examples, then other
Wiktionary examples that use it, then Tatoeba's.

    python3 examples.py      (from the cache directory, by run.py)

Reads `selected-<level>.json`, `lex.json`, `kaikki-nv.jsonl` and the Tatoeba
exports (`nav_sentences_detailed.tsv`, `nav-eng_links.tsv`, `eng_sentences.tsv`,
CC BY 2.0 FR) and writes `examples-<level>.json`: word key -> up to three
[Navajo, English, [matched tokens]] triples.

THREE SOURCES, IN THIS ORDER:
  1. the word's OWN Wiktionary usage examples -- they illustrate the very sense
     the card teaches;
  2. Wiktionary usage examples written under OTHER headwords in which one token
     is the word or one of its forms (`shimá` for `amá`, `yáshtiʼ` for `yáłtiʼ`),
     compared on the strict key (`nv.norm`: tone and nasal marks kept);
  3. Tatoeba's Navajo sentences (about 66) with an English translation.
A borrowed sentence (2 or 3) is used at most once per deck.  An example longer
than `MAXLEN` characters (some are whole Bible verses) is not shown, nor one
with a line break (Wiktionary's multi-line passages).  The choice is
deterministic -- the shorter first, then the text -- so a re-run is
byte-identical.  Nothing is generated to fill a gap.
"""
import csv, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nv import norm, nfc, tokens
from navajo_level import f

csv.field_size_limit(10 ** 8)
MAXLEN = 120


def tatoeba():
    nav = {}
    for row in csv.reader(open('nav_sentences_detailed.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3:
            nav[row[0]] = nfc(row[2])
    links = {}
    for row in csv.reader(open('nav-eng_links.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 2 and row[0] in nav:
            links.setdefault(row[0], []).append(row[1])
    want = {e for v in links.values() for e in v}
    eng = {}
    for row in csv.reader(open('eng_sentences.tsv', encoding='utf-8'), delimiter='\t',
                          quoting=csv.QUOTE_NONE):
        if len(row) >= 3 and row[0] in want:
            eng[row[0]] = row[2]
    out = []
    for nid, es in links.items():
        en = sorted((eng[e] for e in es if e in eng), key=lambda s: (len(s), s))
        if en:
            out.append((nav[nid], en[0]))
    return sorted(set(out), key=lambda p: (len(p[0]), p))


def wiktionary():
    """Every usable Wiktionary example, with the headword it was written under."""
    out = set()
    for line in open('kaikki-nv.jsonl', encoding='utf-8'):
        e = json.loads(line)
        for s in e.get('senses') or []:
            for x in s.get('examples') or []:
                tx, en = nfc(x.get('text', '')), (x.get('english') or x.get('translation') or '')
                en = re.sub(r'\s+', ' ', en).strip()
                if tx and en and '\n' not in tx and len(tx) <= MAXLEN:
                    out.add((tx, en, norm(e.get('word', ''))))
    return sorted(out, key=lambda p: (len(p[0]), p))


def forms_of(key, L, back):
    out = {key}
    for e in L['entries']:
        for fm in e['forms']:
            out.add(norm(fm['f']))
    out |= back.get(key, set())
    return out


def main():
    rows = json.load(open(f('selected.json'), encoding='utf-8'))
    D = json.load(open('lex.json', encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    back = {}
    for p, ps in ptr.items():
        for x in ps:
            back.setdefault(x['to'], set()).add(p)
    borrowed = [(tx, en, own, set(tokens(tx))) for tx, en, own in wiktionary()]
    borrowed += [(tx, en, None, set(tokens(tx))) for tx, en in tatoeba()]
    used, out = set(), {}
    for row in rows:
        if row['key'] not in lex:          # a Tatoeba sentence of the phrases deck: it IS the example
            continue
        k, L = row['key'], lex[row['key']]
        forms = forms_of(k, L, back)
        got, seen = [], set()
        ents = [e for e in L['entries'] if not row['pos'] or e['pos'] == row['pos']] or L['entries']
        for e in ents:
            for tx, en in sorted(e.get('ex', []), key=lambda p: (len(p[0]), p)):
                if len(tx) <= MAXLEN and tx not in seen:
                    seen.add(tx)
                    got.append([tx, en, sorted(set(tokens(tx)) & forms)])
        for i, (tx, en, own, toks) in enumerate(borrowed):
            if len(got) >= 3:
                break
            if i in used or tx in seen or own == k or not (toks & forms):
                continue
            used.add(i)
            seen.add(tx)
            got.append([tx, en, sorted(toks & forms)])
        if got:
            out[k] = got[:3]
    json.dump(out, open(f('examples.json'), 'w', encoding='utf-8'), ensure_ascii=False,
              sort_keys=True)
    print(f'  sentences for {len(out)} of {len(rows)} words, three for '
          f'{sum(1 for v in out.values() if len(v) == 3)}')


if __name__ == '__main__':
    main()
