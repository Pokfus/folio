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
import json, sys, unicodedata

from cils_level import f as lvlf
from wikt import pointer_targets

want = set(json.load(open(sys.argv[1])))
out_fn = sys.argv[2]
dump = sys.argv[3] if len(sys.argv) > 3 else 'kaikki-it.jsonl'


def destress(w):
    """Drop the stress marks the conjugation tables add, keeping a written accent.

    **WIKTIONARY'S ITALIAN FORM TABLES MARK THE STRESS** -- `crédo`, `prègo`,
    `sentìto`, `dò` -- where ordinary Italian writes the vowel bare.  Compared
    without this, half the ambiguity below is invisible: `credo` never matches
    the `crédo` in `credere`'s table, so the surface reads as unambiguous when
    it is the single most ambiguous word in the deck.
    Italian WRITES an accent only on a final syllable (`però`, `città`, `sì`), so
    the last character is left alone and everything before it is normalised.
    """
    w = w.lower()
    if not w:
        return w
    head = ''.join(c for c in unicodedata.normalize('NFD', w[:-1])
                   if not unicodedata.combining(c))
    return unicodedata.normalize('NFC', head + w[-1])


# **A SURFACE THAT IS ALSO SOME OTHER LEMMA'S INFLECTED FORM TAKES THAT LEMMA'S
# FREQUENCY, AND THEREFORE ITS PLACE IN THE DECK.**  `credo` is dealt eighth
# because Italians say it constantly meaning "I believe", and the card teaches
# the noun "creed".  Measured here rather than assumed, because it is a fact
# about the WHOLE dump (every lemma's forms, not just the wanted ones) and this
# is the only pass that reads the whole dump.  It costs one set lookup per form.
wantf = {destress(w) for w in want}
homographs = {}
kept = {}
n = bad = 0
for line in open(dump, encoding='utf-8'):
    n += 1
    try:
        r = json.loads(line)
    except Exception:
        bad += 1
        continue
    if r.get('lang_code') != 'it':
        continue
    w = r.get('word')
    if w in want:
        kept.setdefault(w, []).append(r)
    lem = (w or '').lower()
    for f in r.get('forms') or []:
        s = destress((f.get('form') or '').strip())
        if s in wantf and s != lem:
            homographs.setdefault(s, set()).add(lem)

print('  lines scanned :', n, '(unparseable:', bad, ')')
print('  lemmas wanted :', len(want))
print('  lemmas found  :', len(kept))
print('  records kept  :', sum(len(v) for v in kept.values()))
missing = sorted(want - set(kept))
if missing:
    show = ', '.join(missing[:25]) + (' …' if len(missing) > 25 else '')
    print(f'  not in the dump: {len(missing)} -- {show}')

# READ THROUGH `pointer_targets` RATHER THAN INLINE, which is the whole reason
# `wikt.py` exists: a target this pass does not fetch is one `build_deck` cannot
# follow however well it reads the pointer, and the two lists coming apart is
# invisible -- the word simply has no meaning to card.  `fintanto` is that fault:
# its pointer names two words in one field, so neither was fetched.
targets = set()
for recs in kept.values():
    targets.update(pointer_targets(recs))
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

print(f'  ambiguous surfaces: {len(homographs)} of the {len(wantf)} wanted are also '
      f'another lemma\'s inflected form')

json.dump(kept, open(out_fn, 'w'), ensure_ascii=False)
# beside the records, for the deck description to quote -- see `emit.py`.  The
# name is built from the LEVEL rather than from `out_fn`, which is a caller's
# argument: a string substitution on it would silently write nothing the day the
# caller renames its intermediate.
json.dump({k: sorted(v) for k, v in homographs.items()},
          open(lvlf('homographs.json'), 'w'), ensure_ascii=False)
