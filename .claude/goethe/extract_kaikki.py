#!/usr/bin/env python3
"""Pull the Wiktionary records for a set of German lemmas out of the kaikki dump.

One streaming pass over the 1.07 GB file; keeps every record whose `word` is
wanted, since a lemma has one record per part of speech (and sometimes per
etymology).

Every line is parsed in full, deliberately.  Reading the word out of the raw
text with a substring search is far faster and WRONG: kaikki does not fix its
key order, so the top-level "word" can be the last key on the line, while
`derived`, `related` and `hyponyms` carry nested {"word": ...} objects that come
earlier -- a scan for the first '"word"' then returns a derived term and the
real lemma is recorded as missing, which looks exactly like the dump not
carrying it.

A SECOND PASS COLLECTS THE BASES.  A German separable verb is written solid in
the infinitive (`abfahren`) and split in a finite clause (`ich fahre ab`), and
kaikki carries the whole paradigm under the solid form, so no base lookup is
needed for those.  What does need one is a word the list prints as a stem or a
phrase -- `best-` is a form of gut, `an sein` of sein -- and the reflexives,
which German Wiktionary files under the plain verb (`freuen`, never
`sich freuen`).  Both are handled by the caller asking for every candidate
lemma; this stage only has to keep whatever it is told to.
"""
import json, sys

want = set(json.load(open(sys.argv[1])))
out_fn = sys.argv[2]
dump = sys.argv[3] if len(sys.argv) > 3 else 'kaikki-de.jsonl'

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
    if w in want and r.get('lang_code') == 'de':
        kept.setdefault(w, []).append(r)

print('  lines scanned :', n, '(unparseable:', bad, ')')
print('  lemmas wanted :', len(want))
print('  lemmas found  :', len(kept))
print('  records kept  :', sum(len(v) for v in kept.values()))
missing = sorted(want - set(kept))
if missing:
    print('  not in the dump:', ', '.join(missing))
json.dump(kept, open(out_fn, 'w'), ensure_ascii=False)
