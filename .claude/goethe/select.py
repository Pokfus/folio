#!/usr/bin/env python3
"""Merge the two halves of the Wortliste, settle each word's lemma, and order it.

THE DECK TEACHES THE WHOLE LIST, so there is nothing to select in the DELE
sense: that pipeline draws 500 words out of an inventory of thousands, where the
Goethe-Institut publishes a closed list of about 650 and the deck is that list.
What this stage does is decide, for each entry, WHICH Wiktionary lemma it is,
what part of speech to treat it as, and WHERE IT COMES in the deck.

THE ORDER IS FREQUENCY, AND IT IS TAKEN OFF THE HEADWORD'S OWN SURFACE FORM.
Summing a lemma's inflected forms looks like the rigorous answer and is worse --
the DELE pipeline records why, and German is if anything a better example: `sein`
is both the verb `to be` and the possessive `his`, `war` is a form of the one and
an English word besides, and half the nouns collide with a verb form somewhere in
their paradigm.  So a word is ranked by how often its own headword form turns up
in a list built from film and television subtitles, which for a German noun means
the nominative singular and for a verb the infinitive.  A phrase cannot appear in
a segmented list at all, and giving it the rank of its rarest word is a true
ceiling and a hopeless estimate (a phrase built from very common words gets a
very low one), so the eleven phrases are COUNTED in the Tatoeba corpus and that
count is calibrated onto the frequency list's own scale through the single words
that carry both.

A WORD THE FREQUENCY LIST HAS NEVER SEEN goes to the end rather than to the
front: `der Quadratmeter` and `die Halbpension` are real A1 vocabulary and rare
in subtitles, and a missing count must not read as a count of zero.
"""
import json, math, re
from collections import Counter

from goethe_level import LEVEL, FREQ, f as lvlf, words_below

wl = json.load(open(lvlf('wortliste.json')))
wg = json.load(open(lvlf('wordgroups.json')))
W = json.load(open(lvlf('wikt.json')))

# ------------------------------------------------------------------ merge
below = words_below()
entries, seen = [], set()
dropped_below = []
for e in wl + wg:
    if e['display'] in seen:
        continue
    if e['word'] in below:
        dropped_below.append(e['display'])
        continue
    seen.add(e['display'])
    entries.append(e)
# the two causes are counted apart: a word printed in both halves of one list is
# not the same fact as a word the level below already teaches, and reporting the
# sum as "shared" hid the exclusion doing nothing at all for every noun
print('  entries after merge:', len(entries),
      f'(alphabet {len(wl)} + groups {len(wg)},'
      f' {len(wl) + len(wg) - len(entries) - len(dropped_below)} printed in both,'
      f' {len(dropped_below)} already taught below)')


# ------------------------------------------------------------------ lemma
def real_senses(r):
    """Senses that say what the word MEANS, rather than pointing at another word."""
    return [s for s in r.get('senses', [])
            if s.get('glosses') and not (s.get('form_of') or s.get('alt_of'))]


def pick_lemma(e):
    for l in e['lemmas']:
        recs = W.get(l) or []
        if any(real_senses(r) for r in recs):
            return l
    for l in e['lemmas']:
        if l in W:
            return l
    return e['lemmas'][0]


POS_ORDER = ['noun', 'verb', 'adj', 'adv', 'pron', 'det', 'prep', 'conj',
             'num', 'intj', 'particle', 'article', 'phrase', 'name']


def pos_hint(e, lemma):
    """What to treat the word as.  The PRINTED entry decides before Wiktionary
    does: an article on the headword makes it a noun whatever else the string
    can be, which is what keeps `das Essen` (the meal) from being filed as the
    verb `essen`, and `der Morgen` from being the adverb `morgen`."""
    if e['article'] or e['pluralonly']:
        return 'noun'
    if e['reflexive']:
        return 'verb'
    recs = [r for r in (W.get(lemma) or []) if real_senses(r)] or (W.get(lemma) or [])
    poss = [r.get('pos') for r in recs]
    for p in POS_ORDER:
        if p in poss:
            # a capitalised headword with a noun reading is a noun
            if p == 'noun' and not e['word'][:1].isupper():
                continue
            return p
    return poss[0] if poss else ('phrase' if ' ' in e['word'] else 'other')


for e in entries:
    e['lemma'] = pick_lemma(e)
    e['pos_hint'] = pos_hint(e, e['lemma'])
    e['key'] = e['display']
print('  parts of speech:', dict(Counter(e['pos_hint'] for e in entries).most_common()))
no_rec = [e['display'] for e in entries if not W.get(e['lemma'])]
if no_rec:
    print('  no Wiktionary record at all:', ', '.join(no_rec))

# ------------------------------------------------------------------ order
# WHICH LIST ORDERS THIS LEVEL is a level fact and lives in `goethe_level.FREQ`
# -- A1 to B1 by subtitle frequency, C1 by a newspaper corpus, for the reason
# recorded there.  The two files are shaped differently and are read to the same
# `word -> count`; a repeated word keeps its FIRST count, which is the higher,
# both files being ordered by frequency.
# THE SUBTITLE LIST IS ALL LOWER CASE AND THE LEIPZIG ONE IS NOT, which matters
# on a language that capitalises every noun: keyed only by the lowercased form,
# `Recht` and `recht` are one entry and whichever is commoner supplies the count
# for both.  So each word is stored under BOTH its own spelling and its
# lowercased one, and the lookup below tries the exact form first.  A repeated
# key keeps its FIRST count, which is the higher, both files being ordered by
# frequency.
freq_file, freq_shape = FREQ[LEVEL]
freq = {}
for line in open(freq_file, encoding='utf-8'):
    if freq_shape == 'leipzig':
        t = line.rstrip('\n').split('\t')
        if len(t) != 3:
            continue
        w, n = t[1], int(t[2])
    else:
        t = line.split()
        if len(t) != 2:
            continue
        w, n = t[0], int(t[1])
    freq.setdefault(w, n)
    freq.setdefault(w.lower(), n)
print(f'  ordering by {freq_file}')

# A phrase is counted by scanning the corpus, and the single words are counted in
# the SAME pass to calibrate it -- but by tokenising each sentence once rather
# than by running a pattern per word over it: 400 regexes against 777,000
# sentences is a quarter of a million matches a second short of finishing, where
# one tokenise and a set lookup is seconds.
phrases = [e for e in entries if ' ' in e['word'] and not e['reflexive']]
counts, scale = Counter(), 1.0
if phrases:
    # counted under the LEMMA rather than the printed form: the page writes
    # `zum Beispiel/z. B.`, and the string to look for in a corpus is the phrase
    plook = {e['lemma'].lower(): e['key'] for e in phrases}
    singles = {e['word'].lower(): e['key'] for e in entries
               if ' ' not in e['word'] and freq.get(e['word'].lower())}
    tok = re.compile(r"[a-zäöüßA-ZÄÖÜ]+")
    for line in open('deu_sentences_detailed.tsv', encoding='utf-8'):
        p = line.split('\t')
        if len(p) < 3:
            continue
        low = p[2].lower()
        for w, k in plook.items():
            if w in low:
                counts[k] += 1
        for t in set(tok.findall(low)):
            k = singles.get(t)
            if k:
                counts[k] += 1
    # calibrate: the ratio between a subtitle count and a Tatoeba count, taken
    # over the single words that carry both, is what puts a phrase on the same
    # scale as a word rather than on a scale of its own
    ratios = sorted(freq[w] / counts[k] for w, k in singles.items()
                    if counts.get(k, 0) >= 5)
    scale = ratios[len(ratios) // 2] if ratios else 1.0
    print(f'  phrases counted in Tatoeba; calibration {scale:.0f} subtitle hits per '
          f'corpus hit, from {len(ratios)} words carrying both')

for e in entries:
    # The printed headword is not always a word the list can have counted: a
    # stem is printed with a hyphen (`welch-`) and a reflexive with its pronoun
    # (`(sich) freuen`), and neither string occurs in a subtitle corpus.  So the
    # count falls back to the LEMMA -- which is the DELE pipeline's rule that a
    # reflexive is placed by the verb it is formed from, arrived at from the
    # other side.
    f = (freq.get(e['word'], 0) or freq.get(e['word'].lower(), 0)
         or freq.get(e['lemma'], 0) or freq.get(e['lemma'].lower(), 0))
    # A STEM HAS NO BARE SURFACE AT ALL: `nächst-` is printed with a hyphen
    # because the word only ever appears with an ending on it, so neither the
    # stem nor its dictionary lemma is a string a corpus can have counted.  The
    # commonest of its endings stands for it.
    if not f and e['display'].endswith('-'):
        f = max(freq.get(e['lemma'].lower() + suf, 0)
                for suf in ('', 'e', 'er', 'es', 'en', 'em'))
    if not f and ' ' in e['lemma']:
        f = counts.get(e['key'], 0) * scale
    e['freq'] = f

entries.sort(key=lambda e: (-e['freq'], e['display'].lower()))
unseen = sum(1 for e in entries if not e['freq'])
print('  ordered by frequency;', unseen, 'words the subtitle list has never seen,'
      ' which go to the end')
print('  first ten:', ', '.join(e['display'] for e in entries[:10]))
print('  last five:', ', '.join(e['display'] for e in entries[-5:]))

json.dump(entries, open(lvlf('entries.json'), 'w'), ensure_ascii=False, indent=1)
print('  words:', len(entries))
