#!/usr/bin/env python3
"""Pull the Wiktionary records for a set of Italian lemmas out of the kaikki dump.

One streaming pass over the 762 MB file; keeps every record whose `word` is
wanted, since a lemma has one record per part of speech (and sometimes per
etymology) -- `essere` is a verb and a noun, `bello` an adjective and a noun,
`amico` a noun and an adjective.

Every line is parsed in full, deliberately.  Reading the word out of the raw
text with a substring search is far faster and WRONG: kaikki does not fix its
key order, so the top-level "word" can be the last key on the line, while
`derived`, `related` and `synonyms` carry nested {"word": ...} objects that come
earlier -- a scan for the first '"word"' then returns a derived term and the
real lemma is recorded as missing, which looks exactly like the dump not
carrying it.  That is the Goethe extractor's finding and it is the same dump
format here.

A SECOND PASS FOLLOWS THE POINTERS, because a lemma whose every sense points at
another word has no meaning of its own to card.  Italian Wiktionary files a
great many words that way, and two shapes matter for a list of bare lower-cased
words like this one:

  · a PARTICIPLE used as an adjective -- `aperto` is filed as "past participle
    of aprire", `interessato` as one of `interessare` -- and the list prints
    dozens of them as headwords in their own right;

  · a FEMININE or PLURAL surface the list happens to print (`le`, `la`), whose
    entry is a pointer at the singular or the masculine.

`sense_gloss` in the builder already takes the tail where a meaning is written
after the pointer ("past participle of aprire: open"), and where none is, the
meaning is at the other end of the pointer -- which is what this pass puts in
the dump for the builder to reach.  Only targets nothing already wanted are
fetched, and the pass is skipped altogether when there are none.
"""
import json, sys

want = set(json.load(open(sys.argv[1])))
out_fn = sys.argv[2]
dump = sys.argv[3] if len(sys.argv) > 3 else 'kaikki-it.jsonl'

kept = {}
n = bad = 0
for line in open(dump, encoding='utf-8'):
    n += 1
    try:
        r = json.loads(line)
    except Exception:
        bad += 1
        continue
    w = r.get('word')
    if w in want and r.get('lang_code') == 'it':
        kept.setdefault(w, []).append(r)

print('  lines scanned :', n, '(unparseable:', bad, ')')
print('  lemmas wanted :', len(want))
print('  lemmas found  :', len(kept))
print('  records kept  :', sum(len(v) for v in kept.values()))
missing = sorted(want - set(kept))
if missing:
    show = ', '.join(missing[:25]) + (' …' if len(missing) > 25 else '')
    print(f'  not in the dump: {len(missing)} -- {show}')

targets = set()
for recs in kept.values():
    for r in recs:
        for s_ in r.get('senses', []):
            for k in ('form_of', 'alt_of'):
                for f_ in (s_.get(k) or []):
                    w_ = f_.get('word') if isinstance(f_, dict) else f_
                    if w_:
                        targets.add(w_.strip())
targets -= set(kept)
if targets:
    n2 = 0
    for line in open(dump, encoding='utf-8'):
        try:
            r = json.loads(line)
        except Exception:
            continue
        w = r.get('word')
        if w in targets and r.get('lang_code') == 'it':
            kept.setdefault(w, []).append(r)
            n2 += 1
    print('  pointer targets:', len(targets), 'wanted,',
          len(targets & set(kept)), 'found,', n2, 'records')

json.dump(kept, open(out_fn, 'w'), ensure_ascii=False)
