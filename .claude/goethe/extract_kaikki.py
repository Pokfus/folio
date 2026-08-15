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
import json, re, sys

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

# A THIRD PASS FOLLOWS THE POINTERS, because a lemma whose every sense is a
# pointer has no meaning of its own to card.  German Wiktionary files a great
# many of the words a Goethe list prints as inflections or variants of another:
# `Früchte` is "plural of Frucht", `ausgebildet` "past participle of ausbilden",
# `die Mail` "alternative form of E-Mail", `Bub` "alternative form of Bube",
# `Coiffeuse` "female equivalent of Coiffeur".  `sense_gloss` already takes the
# tail where one is written after a colon; where none is, the meaning is at the
# other end of the pointer, and this is what puts it in the dump for the builder
# to reach.  Only the targets nothing already wanted are fetched -- on B1 that is
# a few dozen lemmas -- and the pass is skipped altogether when there are none.
# A POINTER MAY BE PROSE RATHER THAN A FIELD, and it has to be fetched too or
# `build_deck.follow_prose_pointer` has nothing at the far end to resolve.
# Wiktionary defines a regional word by its standard twin in the gloss itself --
# "synonym of Januar", "alternative form of Bube" -- with no `form_of` on the
# sense at all, and the card then teaches a German word with another German word.
# the target may be SEVERAL words -- see the note beside `PROSE_POINTER` in
# build_deck.py; captured to the first space, every phrase target is missed
PROSE_PTR = re.compile(
    r'^(?:synonym of|alternative (?:form|spelling) of)\s+([^,;:(]+)', re.I)

# WIKTIONARY WRITES A NOUN'S GENDER AFTER IT -- "synonym of Ecke f" -- and the
# dictionary is not keyed by that
GENDER_TAIL = re.compile(r'\s+[mfn]$')


def pointer_targets(recs):
    out = set()
    for r in recs:
        for s_ in r.get('senses', []):
            for k in ('form_of', 'alt_of'):
                for f_ in (s_.get(k) or []):
                    w_ = f_.get('word') if isinstance(f_, dict) else f_
                    if w_:
                        out.add(w_.strip())
            for g_ in (s_.get('glosses') or []):
                m_ = PROSE_PTR.match((g_ or '').strip())
                if m_:
                    out.add(GENDER_TAIL.sub('', m_.group(1).strip()))
    return out


# A POINTER MAY POINT AT A POINTER, so the fetch is a bounded LOOP rather than a
# single pass: `nun ja` is a synonym of `na ja`, which is itself an alternative
# form of `naja`, and one round leaves `naja` unfetched -- after which
# `follow_prose_pointer` has nothing at the far end and the card ships reading
# "synonym of na ja".  Each round costs a scan of the dump, so the cap is low;
# in practice the second round wants a handful of words and the third none.
for _round in range(3):
    targets = set()
    for recs in kept.values():
        targets |= pointer_targets(recs)
    targets -= set(kept)
    if not targets:
        break
    n2 = 0
    for line in open(dump, encoding='utf-8'):
        try:
            r = json.loads(line)
        except Exception:
            continue
        w = r.get('word')
        if w in targets and r.get('lang_code') == 'de':
            kept.setdefault(w, []).append(r)
            n2 += 1
    print(f'  pointer targets, round {_round + 1}:', len(targets), 'wanted,',
          len(targets & set(kept)), 'found,', n2, 'records')

json.dump(kept, open(out_fn, 'w'), ensure_ascii=False)
