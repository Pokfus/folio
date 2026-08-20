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

# THE DICTIONARY'S OWN USAGE EXAMPLES, WHICH IT TURNS OUT TO CARRY.  Tatoeba is
# a pair bank of everyday sentences and runs out fast on an advanced vocabulary
# -- level 6 has a sentence for 16% of its words -- and Wiktionary illustrates
# about 800 headwords itself, under the same CC BY-SA 4.0 as the definitions
# already taken from it.  Most of the file's `examples` are NOT usable and the
# filtering is done here, where the raw shape is still visible: 519 carry no
# English at all, and the array is also where the extraction files a stray
# "Near-synonyms: akselerator, pemercepat" or a bare "the".  A usable one is an
# `example` (never a `quotation`, which is a literary citation in older
# orthography), has an English, and is a sentence rather than the collocation
# form Wiktionary writes with an em-dash gloss (`buah bit ― beetroot`).
EX_MIN, EX_MAX = 12, 110


def usable_examples(s):
    out = []
    for ex in s.get('examples') or []:
        if ex.get('type') not in (None, 'example'):
            continue
        t = (ex.get('text') or '').strip()
        en = (ex.get('english') or '').strip()
        if not t or not en or '―' in t or '―' in en:
            continue
        if not (EX_MIN <= len(t) <= EX_MAX) or len(t.split()) < 3:
            continue
        out.append([t, en])
    return out


def reduce_entry(e):
    senses = []
    for s in e.get('senses', []):
        r = {k: s[k] for k in KEEP_SENSE if s.get(k)}
        if r.get('form_of'):
            r['form_of'] = [x.get('word') for x in r['form_of'] if x.get('word')]
        ex = usable_examples(s)
        if ex:
            r['ex'] = ex
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
    nex = sum(len(s['ex']) for r in out for s in r['s'] if s.get('ex'))
    print(f'    dictionary: {len(out)} entries, '
          + ', '.join(f'{v} {k}' for k, v in pos.most_common(6))
          + f'; {nex} usable usage examples')


if __name__ == '__main__':
    main()
