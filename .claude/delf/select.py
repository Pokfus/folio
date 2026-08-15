#!/usr/bin/env python3
"""Settle each word's lemma and part of speech, and put the deck in order.

THE DECK TEACHES THE WHOLE LIST, so there is nothing to select in the DELE sense:
that pipeline draws 500 words out of an inventory of thousands, where this one is
handed a closed list of 384 and the deck is that list.  What this stage does is
decide, for each entry, WHICH Wiktionary lemma it is, what part of speech to
treat it as, and WHERE IT COMES in the deck.

THE ORDER IS FREQUENCY, AND IT IS TAKEN OFF THE HEADWORD'S OWN SURFACE FORM.
Summing a lemma's inflected forms looks like the rigorous answer and is worse --
the DELE pipeline records why, and French is a good example of the same trap:
`est` is a form of `être` and also the east, `a` a form of `avoir` and also the
preposition, `livre` a book, a pound and a form of `livrer`.  So a word is ranked
by how often its own headword form turns up in a list built from film and
television subtitles, which for a French noun means the singular and for a verb
the infinitive.

A PHRASE CANNOT APPEAR IN A SEGMENTED LIST AT ALL, and giving it the rank of its
rarest word is a true ceiling and a hopeless estimate -- `tout le monde` is built
from three of the commonest words in the language and would rank near the top on
that reading.  So the phrases are COUNTED in the Tatoeba corpus and that count is
calibrated onto the frequency list's own scale through the single words that
carry both, which is the German pipeline's arrangement.

A PRONOMINAL VERB IS PLACED BY THE VERB IT IS FORMED FROM.  `se lever` is not a
string a subtitle tokeniser has ever seen, because the pronoun moves and inflects
(`je me lève`); `lever` is, and the paradigm the card teaches is that verb's.

A WORD THE FREQUENCY LIST HAS NEVER SEEN goes to the END rather than to the
front: a missing count must not read as a count of zero.
"""
import json, re
from collections import Counter

from delf_level import f as lvlf, words_below

entries = json.load(open(lvlf('wordlist.json')))
W = json.load(open(lvlf('wikt.json')))

# ------------------------------------------------------------------ below
below = words_below()
if below:
    keep, dropped = [], []
    for e in entries:
        (dropped if e['word'] in below else keep).append(e)
    entries = keep
    print('  already taught by a lower level:', len(dropped))


# ------------------------------------------------------------------ lemma
def real_senses(r):
    """Senses that say what the word MEANS, rather than pointing at another."""
    return [s for s in r.get('senses', [])
            if s.get('glosses') and not (s.get('form_of') or s.get('alt_of'))]


def pick_lemma(e):
    for l in e['lemmas']:
        if any(real_senses(r) for r in (W.get(l) or [])):
            return l
    for l in e['lemmas']:
        if l in W:
            return l
    return e['lemmas'][0]


# WIKTIONARY'S OWN RECORD ORDER IS THE SIGNAL, and a preference list is not.
# The German build reaches this conclusion about SENSES -- a commoner sense is not
# a shorter one, so leave the entry in the order it was written -- and it turns
# out to hold one level up, about which PART OF SPEECH an entry leads with.
# Measured over this list: a fixed preference order (noun, then verb, then
# adjective ...) disagrees with the first record on 73 of the 379 words, and on
# reading all 73 the first record is right almost every time -- `être`, `avoir`,
# `aller`, `parler` and `dire` are verbs that happen to have a noun record;
# `grand`, `beau`, `petit`, `vieux` and `jeune` are adjectives that happen to have
# one; `merci` and `pardon` are interjections that happen to have one.  French
# nominalises so freely that a preference for `noun` makes two thirds of the deck
# a noun, which is how the first build came out with 245 of them and 35 verbs.
#
# ONLY THE NON-LEXICAL CLASSES ARE SKIPPED: kaikki files `à` first as a
# `character` (the letter with its accent), which is a fact about the alphabet
# rather than a reading of the word.
POS_SKIP = {'character', 'symbol', 'punct', 'romanization'}

# What a group says about a word's part of speech, which is the one thing the
# page itself cannot tell us.  `été` is filed by Wiktionary as the past
# participle of `être` before it is the summer, and the seasons row is what puts
# it back; the numbers and colours rows do the same job for `neuf` (nine, and
# also new) and `orange` and `rose` (a fruit and a flower before they are
# colours).
GROUP_POS = {'numbers': ('num', 'adj'), 'colours': ('adj',),
             'days': ('noun',), 'months': ('noun',), 'seasons': ('noun',)}


def pos_hint(e, lemma):
    # AN ENTRY THAT ALREADY KNOWS ITS CLASS KEEPS IT.  Only `phraselist.py`
    # writes this, and it writes the dictionary's own first record RESTRICTED to
    # the classes an expression falls into -- which is a strictly better reading
    # than `poss[0]` here, because kaikki files several of these entries under a
    # class the phrases deck deliberately excludes.  Left to the line below,
    # `en dehors` and `à peu près` would come back as NOUNS and be carded with an
    # article in front of them.
    if e.get('pos'):
        return e['pos']
    if e['reflexive']:
        return 'verb'
    recs = [r for r in (W.get(lemma) or []) if real_senses(r)] or (W.get(lemma) or [])
    poss = [r.get('pos') for r in recs if r.get('pos') not in POS_SKIP]
    for p in GROUP_POS.get(e['group'], ()):
        if p in poss:
            return p
    return poss[0] if poss else ('phrase' if ' ' in e['word'] else 'other')


for e in entries:
    e['lemma'] = pick_lemma(e)
    e['pos_hint'] = pos_hint(e, e['lemma'])
    e['key'] = e['word']
print('  parts of speech:', dict(Counter(e['pos_hint'] for e in entries).most_common()))
no_rec = [e['word'] for e in entries if not W.get(e['lemma'])]
if no_rec:
    print('  NO WIKTIONARY RECORD AT ALL:', ', '.join(no_rec))

# ------------------------------------------------------------------ order
freq = {}
for line in open('fr_50k.txt', encoding='utf-8'):
    t = line.split()
    if len(t) == 2:
        freq.setdefault(t[0], int(t[1]))

# A phrase is counted by scanning the corpus, and the single words are counted in
# the SAME pass to calibrate it -- but by tokenising each sentence once rather
# than by running a pattern per word over it, which is the difference between
# seconds and not finishing.
phrases = [e for e in entries if e['phrase']]
counts, scale = Counter(), 1.0
if phrases:
    plook = {e['word'].lower(): e['key'] for e in phrases}
    singles = {e['word'].lower(): e['key'] for e in entries
               if not e['phrase'] and freq.get(e['word'].lower())}
    tok = re.compile(r"[^\W\d_]+", re.UNICODE)
    for line in open('fra_sentences_detailed.tsv', encoding='utf-8'):
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
    print(f'  phrases counted in Tatoeba; calibration {scale:.0f} subtitle hits per '
          f'corpus hit, from {len(ratios)} words carrying both')

for e in entries:
    f = freq.get(e['word'].lower(), 0)
    if not f and e['reflexive']:
        f = freq.get(e['lemma'].lower(), 0)
    if not f and e['phrase']:
        f = counts.get(e['key'], 0) * scale
    e['freq'] = f

entries.sort(key=lambda e: (-e['freq'], e['word'].lower()))
unseen = sum(1 for e in entries if not e['freq'])
print('  ordered by frequency;', unseen, 'words the subtitle list has never seen,'
      ' which go to the end')
print('  first ten:', ', '.join(e['word'] for e in entries[:10]))
print('  last five:', ', '.join(e['word'] for e in entries[-5:]))

json.dump(entries, open(lvlf('entries.json'), 'w'), ensure_ascii=False, indent=1)
print('  words:', len(entries))
