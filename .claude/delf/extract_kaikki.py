#!/usr/bin/env python3
"""Pull the Wiktionary records for a set of French lemmas out of the kaikki dump.

One streaming pass over the 574 MB file; keeps every record whose `word` is
wanted, since a lemma has one record per part of speech (and sometimes per
etymology -- `chat` the animal and `chat` the online conversation are two).

Every line is parsed in full, deliberately.  Reading the word out of the raw
text with a substring search is far faster and WRONG: kaikki does not fix its
key order, so the top-level "word" can be the last key on the line, while
`derived`, `related` and `synonyms` carry nested {"word": ...} objects that come
earlier -- a scan for the first '"word"' then returns a derived term and the real
lemma is recorded as missing, which looks exactly like the dump not carrying it.

A SECOND PASS FOLLOWS THE POINTERS, because a lemma whose every sense is a
pointer has no meaning of its own to card, and this list is full of them: it
prints `les`, `des`, `ces`, `mes`, `ils`, `elles`, `chaussettes`, `sandales` and
`devoirs`, every one of which Wiktionary files as "plural of X" or "feminine of
X" and glosses nowhere else.  The meaning is at the other end of the pointer, and
this is what puts it in the dump for the builder to reach.  Only the targets
nothing already wanted are fetched, and the pass is skipped when there are none.
"""
import json, sys

want = set(json.load(open(sys.argv[1])))
out_fn = sys.argv[2]
dump = sys.argv[3] if len(sys.argv) > 3 else 'kaikki-fr.jsonl'

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
    if w in want and r.get('lang_code') == 'fr':
        kept.setdefault(w, []).append(r)

print('  lines scanned :', n, '(unparseable:', bad, ')')
print('  lemmas wanted :', len(want))
print('  lemmas found  :', len(kept))
print('  records kept  :', sum(len(v) for v in kept.values()))
missing = sorted(want - set(kept))
if missing:
    print('  not in the dump:', ', '.join(missing))

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
        if w in targets and r.get('lang_code') == 'fr':
            kept.setdefault(w, []).append(r)
            n2 += 1
    print('  pointer targets:', len(targets), 'wanted,',
          len(targets & set(kept)), 'found,', n2, 'records')

json.dump(kept, open(out_fn, 'w'), ensure_ascii=False)
