#!/usr/bin/env python3
"""Choose the phrases and expressions, out of Wiktionary's own multiword entries.

THE OTHER SIX DECKS TEACH WORDS AND THIS ONE TEACHES WHAT IS SAID.  A1 to B1 read
a published Wortliste and B2 to C2 take a tranche of a newspaper corpus, and both
are lists of single words -- which leaves out the part of German a learner most
obviously lacks: `Schwein haben`, `auf jeden Fall`, `es kommt darauf an`, `um die
Ecke bringen`.  None of them can be derived from the words in it, which is exactly
what makes them worth carding and what keeps them out of every list above.

WHAT COUNTS AS ONE, and it is a decision rather than a search.  A phrase here is a
WIKTIONARY ENTRY WHOSE HEADWORD HAS A SPACE IN IT.  That is the whole test, and it
is the right one because somebody has already made the judgement: an expression
earns a dictionary entry when its meaning is not the sum of its parts, so the
lexicographers' entry list IS the list of things worth learning as a unit.  The
alternative -- finding recurring word sequences in a corpus -- returns `in der
Regel` and `an dem Tag` alike, and no rule tells the two apart.

Measured over the dump: 21,289 multiword German entries, and their shape says what
the deck is made of.  16,766 are VERBS, which is the heart of it (`Schwein haben`,
`durch den Kakao ziehen`, `auf den Keks gehen`); then 2,041 nouns, 502 marked
`phrase`, 426 adverbs, 271 proverbs, 246 adjectives, 170 prepositional phrases and
125 interjections (`guten Tag`, `auf Wiedersehen`, `danke schön`).

WHAT IS LEFT OUT:

  · PROPER NAMES.  `San Marino`, `Sierra Leone`, `El Salvador` -- 675 of them,
    and a country's name is not an expression.
  · A HEADWORD WITH A PLACEHOLDER IN IT.  Wiktionary writes the frame of a
    construction with an ellipsis (`sowohl ... als auch`, `um … willen`,
    `von ... aus`).  A card cannot print that as the thing to recall, and no
    corpus can count it, since the words are not adjacent in any sentence.
  · AN ENTRY THAT IS ONLY A POINTER at another one (`auf seiten` is an
    alternative spelling of `auf Seiten`), and one with no showable meaning at
    all -- the rule `build_deck` enforces anyway by refusing a card with no gloss.
  · THE VULGAR, OBSOLETE AND ARCHAIC, on the same tags as everywhere else.
  · WHAT IS THE ENGLISH UNCHANGED.  `you name it` is a German entry because
    Germans say it, and there is nothing in it for an English speaker.
  · ANYTHING THE SIX LEVELS ALREADY TEACH.  The A1 and B1 Wortlisten print a
    handful of set phrases (`zum Beispiel`, `es gibt`), and those are carded there.

THE ORDER IS HOW OFTEN IT IS ACTUALLY SAID, counted in the Tatoeba corpus of
777,128 German sentences -- the same corpus the decks take their example
sentences from, and the right one here, because an expression belongs to speech.
A newspaper word list cannot rank a phrase at all: it is a list of single tokens,
and no segmenter it was built with has ever seen `Schwein haben` as one.

THE COUNTING IS BY N-GRAM AND NOT BY SUBSTRING SEARCH, which is the only reason
this stage finishes.  Twenty thousand candidates against 777,000 sentences is
sixteen billion substring tests; taking each sentence's own two- to six-word runs
and looking each up in a set is 777,000 x ~40 lookups, which is seconds.  It is
`select.py`'s own lesson -- that stage tokenises once rather than running a
pattern per word -- applied to a candidate list fifty times the size.

The output is `wortliste-phrases.json` in the shape `parse_goethe.py` writes, so
every stage after this one runs unchanged, and an empty `wordgroups-phrases.json`
beside it.
"""
import json, re, sys
from collections import Counter

from goethe_level import LEVEL, f as lvlf, words_below

# HOW MANY PHRASES THE DECK TAKES, and how rare the rarest may be.  The floor is
# what does the work: an entry nobody in 777,000 sentences ever says is a
# dictionary curiosity rather than an expression to learn, and the corpus is the
# only evidence available for that.  TARGET is a ceiling the floor may not reach.
TARGET = 1200
MIN_COUNT = 3

# The longest headword worth looking for.  Measured: a proverb runs to a dozen
# words (`Rom ist nicht an einem Tag erbaut worden`), and generating n-grams that
# long for every sentence costs more than the handful of proverbs is worth -- so
# the n-gram pass covers 2..6 and anything longer is counted by substring, there
# being few enough of those for it to be free.
NGRAM_MAX = 6

# a headword Wiktionary writes as a FRAME rather than as a phrase
PLACEHOLDER = re.compile(r'\.\.\.|…|—|\bjemand|\betwas\b.*\.\.\.')
# the entry kinds that are not expressions
DROP_POS = {'name', 'circumfix', 'circumpos', 'punct', 'infix', 'prefix', 'suffix'}
BAD_FLAG = {'vulgar', 'offensive', 'derogatory', 'slur', 'ethnic-slur',
            'obsolete', 'archaic'}
# a German phrase is German letters, spaces and the apostrophe (`wie geht's`)
PHRASE = re.compile(r"^[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß'’\- ]*$")
LEAD_ART = re.compile(r'^(?:a|an|the|to)\s+', re.I)
TOK = re.compile(r"[A-Za-zÄÖÜäöüß'’]+")

if LEVEL != 'phrases':
    raise SystemExit('phrase_wordlist builds the phrases deck and nothing else')

taught = {t.lower() for t in words_below()}
print('  already taught below:', len(taught))


def gloss_of(sense):
    g = sense.get('glosses') or sense.get('raw_glosses') or []
    return g[0].strip() if g else ''


def english_unchanged(w, gls):
    """Every meaning is the phrase itself.  `you name it` is a German entry and
    teaches an English speaker nothing."""
    base = w.lower()
    return bool(gls) and all(
        LEAD_ART.sub('', g.strip().rstrip('.')).strip().lower() == base for g in gls)


# ------------------------------------------------------------------ candidates
cand = {}
dropped = Counter()
for line in open('kaikki-de.jsonl', encoding='utf-8'):
    try:
        e = json.loads(line)
    except Exception:
        continue
    if e.get('lang_code') != 'de':
        continue
    w = (e.get('word') or '').strip()
    if ' ' not in w:
        continue
    pos = e.get('pos') or ''
    if pos in DROP_POS:
        dropped['a  a proper name or an affix'] += 1
        continue
    if PLACEHOLDER.search(w):
        dropped['b  a frame with a placeholder in it'] += 1
        continue
    if not PHRASE.fullmatch(w):
        dropped['c  not German letters and spaces'] += 1
        continue
    gl, tags, real = [], set(), False
    for s in e.get('senses') or []:
        tags.update(s.get('tags') or [])
        # a sense that only points at another entry carries no meaning of its own
        if s.get('form_of') or s.get('alt_of'):
            continue
        g = gloss_of(s)
        if g:
            gl.append(g)
            real = True
    if not real:
        dropped['d  no meaning of its own'] += 1
        continue
    if tags & BAD_FLAG:
        dropped['e  vulgar, obsolete or archaic'] += 1
        continue
    if 'name' in tags:
        dropped['a  a proper name or an affix'] += 1
        continue
    if english_unchanged(w, gl):
        dropped['f  the English phrase unchanged'] += 1
        continue
    if w.lower() in taught:
        dropped['g  taught by one of the six levels'] += 1
        continue
    rec = cand.setdefault(w, {'pos': set(), 'idiom': False})
    rec['pos'].add(pos)
    rec['idiom'] = rec['idiom'] or ('idiomatic' in tags)

print(f'  multiword entries kept: {len(cand)}')
for why in sorted(dropped):
    print(f'    {why:<38} {dropped[why]:>6}')

# ------------------------------------------------------- how often it is said
short = {w.lower(): w for w in cand if len(w.split()) <= NGRAM_MAX}
long_ = [w for w in cand if len(w.split()) > NGRAM_MAX]
counts = Counter()
lines = 0
for line in open('deu_sentences_detailed.tsv', encoding='utf-8'):
    p = line.split('\t')
    if len(p) < 3:
        continue
    lines += 1
    low = p[2].lower()
    toks = TOK.findall(low)
    for n in range(2, NGRAM_MAX + 1):
        for i in range(len(toks) - n + 1):
            w = short.get(' '.join(toks[i:i + n]))
            if w:
                counts[w] += 1
    for w in long_:
        if w.lower() in low:
            counts[w] += 1
print(f'  counted in {lines} Tatoeba sentences; '
      f'{sum(1 for w in cand if counts[w])} of them occur at all')

keep = sorted((w for w in cand if counts[w] >= MIN_COUNT),
              key=lambda w: (-counts[w], w.lower()))
if len(keep) < 200:
    raise SystemExit(f'only {len(keep)} phrases clear {MIN_COUNT} occurrences; '
                     'lower MIN_COUNT rather than shipping a deck of nothing')
print(f'  {len(keep)} clear {MIN_COUNT} occurrences')
keep = keep[:TARGET]
print(f'  taking {len(keep)}; floor is {counts[keep[-1]]} occurrences ({keep[-1]})')
print(f'  idiomatic: {sum(1 for w in keep if cand[w]["idiom"])}')

# ------------------------------------------------------------------ emit
# The shape `parse_goethe.py` writes.  A phrase has no article, no plural marker
# and no sub-entry level, and `build_deck` reads its part of speech off the
# Wiktionary record like any other headword.
entries = [{
    'display': w, 'article': '', 'word': w, 'plural_note': '', 'note': '',
    'pluralonly_pre': False, 'sub': False, 'page': 0, 'group': '',
    'reflexive': False, 'pluralonly': False, 'pair': '', 'speak': w,
    'lemmas': [w],
} for w in keep]

json.dump(entries, open(lvlf('wortliste.json'), 'w'), ensure_ascii=False, indent=1)
json.dump([], open(lvlf('wordgroups.json'), 'w'), ensure_ascii=False)
json.dump({'floor': counts[keep[-1]], 'word': keep[-1]},
          open(lvlf('corpus-floor.json'), 'w'), ensure_ascii=False)
print('  phrases:', len(entries))
print('  first ten:', ', '.join(keep[:10]))
