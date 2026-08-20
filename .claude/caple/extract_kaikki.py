#!/usr/bin/env python3
"""Pull the Wiktionary records for a set of Portuguese lemmas out of the kaikki dump.

One streaming pass; keeps every record whose `word` is wanted, since a lemma has
one record per part of speech (and sometimes per etymology).  `a` alone has
eight: article, character, contraction, interjection, noun, preposition,
pronoun and verb.

Every line is parsed in full, deliberately.  Reading the word out of the raw text
is ~20x faster and WRONG: kaikki does not fix its key order, so the top-level
"word" can be the last key on the line, while `derived`, `related` and `hyponyms`
carry nested {"word": ...} objects that come earlier.  A scan for the first
'"word"' then returns a derived term and the real lemma is recorded as missing --
which looks exactly like the dump not carrying it.  The DELE pipeline's own
header records `hablar` and `estar` both vanishing that way.

    python3 extract_kaikki.py <wanted.json> <out.json> [dump.jsonl]
"""
import json, sys

want = set(json.load(open(sys.argv[1])))
out_fn = sys.argv[2]
dump = sys.argv[3] if len(sys.argv) > 3 else 'kaikki-pt.jsonl'

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
    if w in want and r.get('lang_code') == 'pt':
        kept.setdefault(w, []).append(r)

print('  lines scanned :', n, '(unparseable:', bad, ')')
print('  lemmas wanted :', len(want))
print('  lemmas found  :', len(kept))
print('  records kept  :', sum(len(v) for v in kept.values()))
json.dump(kept, open(out_fn, 'w'), ensure_ascii=False)
