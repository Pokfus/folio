#!/usr/bin/env python3
"""Reduce the 64 MB Wiktionary extraction to the fields the deck needs.

    python3 extract_kaikki.py kaikki-id.jsonl wikt.json

THE WHOLE DICTIONARY IS KEPT, not just the candidates, and that is the point of
doing it as a stage of its own.  `select.py` has to ask of any word "is the thing
this claims to be derived from itself a word?" -- and the answer for a base it
has never heard of decides whether the derived form is merged or shipped on its
own.  A candidate-only extraction cannot answer that: it would report every base
outside the candidate list as unknown, and every affixed word would then ship as
a headword of its own, which is the one failure this generator exists to avoid.

39,774 entries reduce to about a fifth of the file, which is small enough for
every later stage to load whole and fast enough that no stage needs a second
index of its own.
"""
import json, sys, collections

KEEP_SENSE = ('glosses', 'tags', 'form_of', 'raw_glosses')


def reduce_entry(e):
    senses = []
    for s in e.get('senses', []):
        r = {k: s[k] for k in KEEP_SENSE if s.get(k)}
        if r.get('form_of'):
            r['form_of'] = [x.get('word') for x in r['form_of'] if x.get('word')]
        if r:
            senses.append(r)
    if not senses:
        return None
    out = {'w': e['word'], 'pos': e.get('pos', ''), 's': senses}
    ht = (e.get('head_templates') or [{}])[0].get('args') or {}
    if ht:
        # the id-verb template's own paradigm: numbered args from 3 onward are
        # label/value pairs -- `3:base-imperative 4:kirim 5:active 6:mengirim
        # 7:passive 8:dikirim`.  Kept as pairs rather than by position, because
        # the labels vary from entry to entry (`basic-imperative-informal` on
        # `menulis`, `base-imperative` on `mengirim`) and a reader written to
        # fixed positions would file one edition's active under another's base.
        out['ht'] = ht.get('2', '')
        pairs = []
        for i in range(3, 20, 2):
            lab, val = ht.get(str(i)), ht.get(str(i + 1))
            if lab and val:
                pairs.append([str(lab), str(val)])
        if pairs:
            out['pairs'] = pairs
    if e.get('derived'):
        d = [x.get('word') for x in e['derived'] if x.get('word')]
        if d:
            out['der'] = d[:40]
    return out


def main():
    src, dst = sys.argv[1], sys.argv[2]
    out = []
    pos = collections.Counter()
    for line in open(src, encoding='utf-8'):
        e = json.loads(line)
        if e.get('lang_code') not in (None, 'id'):
            continue
        r = reduce_entry(e)
        if r:
            out.append(r)
            pos[r['pos']] += 1
    json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False)
    print(f'    dictionary: {len(out)} entries, '
          + ', '.join(f'{v} {k}' for k, v in pos.most_common(6)))


if __name__ == '__main__':
    main()
