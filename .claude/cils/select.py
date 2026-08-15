#!/usr/bin/env python3
"""Settle each word's lemma and part of speech, and decide where it comes.

THE DECK TEACHES THE WHOLE BAND, so there is nothing to select in the DELE
sense: that pipeline draws 500 words out of an inventory of thousands, where
this list is closed and the deck is that list.  What this stage does is decide,
for each entry, WHICH Wiktionary lemma it is, what part of speech to treat it
as, and WHERE IT COMES in the deck.

**THE ORDER IS THE ONE THING THAT MAKES THIS BAND USABLE, and it is why the
stage matters more here than in either sibling.**  `cils_level` records the
measurement: this list is a written-register frequency band wearing a CEFR
label, so it carries `amministrativo` and `valutazione` and does not carry
`pane` or `madre`.  Dealt in the order it is printed -- alphabetically -- a
learner meets `accadere`, `accesso`, `accettare`, `accogliere` as their first
four Italian words.  Ordered by how common the word actually is in everyday
spoken Italian, they meet `essere`, `avere`, `fare`, `dire`, `andare` first and
`amministrativo` at card nine hundred.  The band is what it is; the order is
what a reader actually experiences.

THE COUNT IS TAKEN OFF THE HEADWORD'S OWN SURFACE FORM.  Summing a lemma's
inflected forms looks like the rigorous answer and is worse -- the DELE pipeline
records why, and Italian is a good example of the same trap: `stato` is a noun
and the participle of `essere`, `sono` is `I am` and `they are`, `la` is an
article and a pronoun and a musical note, and every regular verb's third-person
singular collides with something.  So a word is ranked by how often its own
dictionary form turns up in a list built from film and television subtitles,
which for an Italian noun means the singular and for a verb the infinitive.

A PHRASE CANNOT APPEAR IN A SEGMENTED LIST AT ALL, so the handful of them are
counted in the Tatoeba corpus and that count is calibrated onto the frequency
list's own scale through the single words that carry both -- the Goethe stage's
arrangement, and for its reason: giving a phrase the rank of its rarest word is
a true ceiling on how often it can be said and a hopeless estimate of it, since
a phrase built out of very common words gets a very low one.

A WORD THE FREQUENCY LIST HAS NEVER SEEN goes to the END rather than to the
front, since a missing count must not read as a count of zero.
"""
import json, re
from collections import Counter

from cils_level import LEVEL, f as lvlf, words_below
from italian import fold
from wikt import real_senses, letter_name

wl = json.load(open(lvlf('wordlist.json')))
W = json.load(open(lvlf('wikt.json')))

# ------------------------------------------------------------------ merge
below = words_below()
entries, dropped = [], []
for e in wl:
    if e['word'].lower() in below:
        dropped.append(e['display'])
        continue
    entries.append(e)
if dropped:
    print(f'  already taught by a lower level: {len(dropped)}')
else:
    print('  nothing to drop: no lower level shares a word with this band')


# ------------------------------------------------------------------ lemma
def pick_lemma(e):
    """The surface the dictionary actually carries.

    The list prints everything lower-cased, so a proper noun (`italia`) offers
    its capital as an alternative and is looked up under whichever form has a
    real entry.  A form with meanings of its own beats one that only points
    elsewhere, which is what keeps `italia` from resolving to nothing.
    """
    for l in e['lemmas']:
        if any(real_senses(r) for r in (W.get(l) or [])):
            return l
    for l in e['lemmas']:
        if W.get(l):
            return l
    return e['lemmas'][0]


# WHAT TO TREAT A WORD AS, where the dictionary carries it under more than one
# part of speech.  The DEFAULT is the dictionary's own order -- the first record
# with real senses -- which is Wiktionary's page order and is right far more
# often than any priority table: `essere` is a verb before it is a noun, `bello`
# an adjective before a noun, `amico` a noun before an adjective, and a fixed
# ordering cannot get all three right at once.
#
# FORCE_POS is the exception list, and every row was read before it was written.
# The shape it catches is a word whose commonest sense is not the one Wiktionary
# prints first, usually because a participle or a noun has an etymology section
# of its own ahead of the word a learner means.
FORCE_POS = {
    'stato': 'noun',       # the state; ahead of the participle of essere
    'dato': 'noun',        # datum, data
    'fatto': 'noun',       # fact; ahead of the participle of fare
    'via': 'noun',         # street
    'stesso': 'adj',       # same
    'destra': 'noun',      # the right
    'sinistra': 'noun',
    'davanti': 'adv',
    'insieme': 'adv',
    'piano': 'noun',       # floor, plan
    'capo': 'noun',
    'genere': 'noun',
    'corso': 'noun',
    'campo': 'noun',
    'posto': 'noun',
    'colpo': 'noun',
    'segno': 'noun',
    'sogno': 'noun',
    'uso': 'noun',         # use; ahead of the adjective "accustomed"
    'bene': 'adv',         # well; ahead of the adjective "upper-class, posh"
    # its pronoun senses are ALL pointers ('accusative/dative of tu; you'), so
    # nothing but a forced choice reaches them; the noun records are the letter
    # of the alphabet and the musical note
    'ti': 'pron',
}

POS_NAME = {'noun': 'noun', 'verb': 'verb', 'adj': 'adjective', 'adv': 'adverb',
            'pron': 'pronoun', 'prep': 'preposition', 'conj': 'conjunction',
            'num': 'number', 'intj': 'interjection', 'det': 'determiner',
            'article': 'article', 'particle': 'particle', 'name': 'name',
            'phrase': 'phrase', 'proverb': 'phrase', 'prep_phrase': 'phrase'}


def pick_pos(e, lemma):
    forced = FORCE_POS.get(e['word'].lower())
    recs = W.get(lemma) or []
    if forced and any(r.get('pos') == forced for r in recs):
        return forced
    real = [r for r in recs if real_senses(r)]
    for r in real:
        if not letter_name(r):
            return r.get('pos') or 'other'
    if real:
        return real[0].get('pos') or 'other'
    return (recs[0].get('pos') if recs else
            ('phrase' if e['multiword'] else 'other'))


for e in entries:
    e['lemma'] = pick_lemma(e)
    e['pos'] = pick_pos(e, e['lemma'])
    e['key'] = e['display']
    # a reflexive infinitive is its own lemma in Italian (`chiamarsi`), and the
    # base verb is what its compound tenses are built from
    e['reflexive'] = bool(re.search(r'[aei]rsi$', e['lemma']))
    e['base'] = (e['lemma'][:-2] + 'e') if e['reflexive'] else ''

print('  parts of speech:', dict(Counter(e['pos'] for e in entries).most_common()))
no_rec = [e['display'] for e in entries if not W.get(e['lemma'])]
if no_rec:
    show = ', '.join(no_rec[:20]) + (' …' if len(no_rec) > 20 else '')
    print(f'  no Wiktionary record at all: {len(no_rec)} -- {show}')

# ------------------------------------------------------------------ order
freq = {}
for line in open('it_50k.txt', encoding='utf-8'):
    t = line.split()
    if len(t) == 2 and t[0] not in freq:
        freq[t[0]] = int(t[1])

phrases = [e for e in entries if e['multiword']]
counts, scale = Counter(), 1.0
if phrases:
    plook = {e['word'].lower(): e['key'] for e in phrases}
    singles = {e['word'].lower(): e['key'] for e in entries
               if not e['multiword'] and freq.get(e['word'].lower())}
    tok = re.compile(r"[a-zàèéìíòóùú']+")
    for line in open('ita_sentences_detailed.tsv', encoding='utf-8'):
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
    ratios = sorted(freq[w] / counts[k] for w, k in singles.items()
                    if counts.get(k, 0) >= 5)
    scale = ratios[len(ratios) // 2] if ratios else 1.0
    print(f'  {len(phrases)} phrases counted in Tatoeba; calibration {scale:.0f} subtitle '
          f'hits per corpus hit, from {len(ratios)} words carrying both')

for e in entries:
    f_ = freq.get(e['word'].lower(), 0) or freq.get(e['lemma'].lower(), 0)
    if not f_ and e['multiword']:
        f_ = counts.get(e['key'], 0) * scale
    e['freq'] = f_

entries.sort(key=lambda e: (-e['freq'], e['display'].lower()))
unseen = sum(1 for e in entries if not e['freq'])
print(f'  ordered by frequency; {unseen} words the subtitle list has never seen, '
      'which go to the end')
print('  first fifteen:', ', '.join(e['display'] for e in entries[:15]))
print('  last five:', ', '.join(e['display'] for e in entries[-5:]))

# ------------------------------------------------- what kind of list this is
# A MEASUREMENT REPORTED ON EVERY RUN, not a filter.  De Mauro's *nuovo
# vocabolario di base della lingua italiana* is the standard reference for what
# the core of the language actually is -- the roughly 7,000 words an Italian
# adult uses and understands without effort.  Reporting how much of a band falls
# inside it is the cheapest honest check there is on a list that calls itself
# A1, and it is printed rather than acted on: the band is the one that was
# asked for, and the number simply says what kind of list it is.
try:
    nvdb = set(fold(w.strip()) for w in open('nvdb.words.txt', encoding='utf-8') if w.strip())
except FileNotFoundError:
    nvdb = set()
if nvdb:
    inside = [e for e in entries if fold(e['word']) in nvdb]
    top = entries[:200]
    inside_top = [e for e in top if fold(e['word']) in nvdb]
    print(f'  De Mauro basic vocabulary: {len(inside)} of {len(entries)} '
          f'({100 * len(inside) // max(1, len(entries))}%) of the band, '
          f'{len(inside_top)} of the first {len(top)} by frequency')

json.dump(entries, open(lvlf('entries.json'), 'w'), ensure_ascii=False, indent=1)
print('  words:', len(entries))
