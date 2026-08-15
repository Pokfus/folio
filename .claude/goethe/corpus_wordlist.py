#!/usr/bin/env python3
"""Choose the B2, C1 and C2 vocabulary, because nobody publishes it.

EVERY OTHER LEVEL IN THIS PIPELINE TEACHES A LIST SOMEBODY ELSE WROTE.  The
Goethe-Institut publishes a Wortliste for A1, A2 and B1, so `parse_goethe.py`
reads it off a PDF and `select.py` does no selecting at all -- its own header
says so.  The published lists STOP AT B1.  There is no B2, C1 or C2 Wortliste,
and that is the exam board's own position rather than a gap in this cache: the
C1 Prüfungsziele/Testbeschreibung says, in section 4.4,

    "Wortschatz- und Grammatikinventare zum Goethe-Zertifikat C1 gibt es aus
     folgenden Gründen nicht: Auf dieser Stufe läßt sich keine verbindliche
     Eingrenzung des Wortschatzes vornehmen, da authentische Texte verwendet
     werden."

-- no binding delimitation of the vocabulary can be made at this level, because
the exam uses authentic texts.  It goes on to say what a candidate is expected
to do instead: recognise that such texts are full of words "die sich aus bereits
bekannten Wörtern zusammensetzen, ableiten und inhaltlich erschließen lassen",
and to bring the word-formation knowledge to decode them.

SO THESE DECKS MUST NOT CLAIM TO BE GOETHE LISTS, and they do not -- each is
titled `German <level> — Vocabulary` and its description quotes the paragraph
above.  What they ARE: the words a reader who already has the levels below will
actually meet in written German, taken by frequency from a newspaper corpus.
That is as close to "authentische Texte" as a word list can honestly get, and the
exams' own reading passages are journalistic.

THE THREE OF THEM ARE ONE LADDER CUT INTO EQUAL TRANCHES.  B2 takes the 3,000
most frequent usable words beyond B1, C1 the 3,000 beyond B2, C2 the 3,000 beyond
C1 -- each excluding the ones under it through `BELOW`, which is the same
mechanism that stops A2 re-teaching A1.  So they must be BUILT IN THAT ORDER, and
each reads the SHIPPED deck files of the levels below rather than a working file.
Measured beyond B1: 10,663 usable candidates against the 9,000 the three want, so
the corpus supports the ladder and not much more.

WHY A NEWSPAPER CORPUS AND NOT THE ONE THE OTHER LEVELS USE.  A1 to B1 are
ORDERED by a subtitle frequency list, which is right for the vocabulary of
everyday life those exams test.  Here the corpus does the SELECTING, and a
subtitle corpus selects the wrong words: measured on the tail beyond B1, its most
frequent items are television dialogue -- `Mörder`, `Pistole`, `Hexe`, `Dreck`,
`verflucht` -- alongside a drift of first names.  Nothing in it resembles the
register of a C1 reading text.  The Leipzig Corpora Collection's `deu_news_2024`
is a million sentences of German news, 17.6 million tokens, and its tail beyond
B1 is `Nachhaltigkeit`, `hinsichtlich`, `Rechtsstaat`, `Zuständigkeit`.

WHAT IS TAKEN FROM THAT CORPUS IS A RANKING AND NOTHING ELSE.  No sentence of it
travels into the deck: the words come from it, the meanings and paradigms from
Wiktionary and the example sentences from Tatoeba, exactly as on the other three
levels.  It is used the way the subtitle list is used there.

THE FILTERS ARE THE WHOLE OF THE WORK, and each was written from a measured
inventory rather than from the example that prompted it.  Run with no filter at
all, the top of the list is `den`, `ist`, `dem`, `eine` -- inflected forms of
words A1 already teaches, which survive because BELOW excludes a lemma and a
corpus counts surfaces.  In order, with the counts from the B2 run (65,469 of
76,132 candidates dropped; every run prints its own):

  a  no German record in Wiktionary        30,292   `mio`, `dpa`, scanning debris
  b  no sense of its own                   21,896   `ist`, `hat`, `wurde`: the record
                                                    is a pointer at another word
  c  also a proper name                     3,480   `Bayern`, `Mercedes`, `Till`
  d  a closed word class                      137   determiners and pronouns, which
                                                    A1 to B1 already cover entirely
  e  vulgar, obsolete or archaic              497
  f  taught by a level below                2,771   the BELOW exclusion
  g  an inflected form of another word      1,176   `belegt`, `betroffen`, `Tage`
  h  hyphenated                                53   `EU-Kommission`, `Corona-Pandemie`
  i  place-derived                            262   `Berliner`, `Wiener`, `Moskauer`
  j  the English word unchanged               586   `Design`, `Top`, `Radar`: nothing
                                                    for an English speaker to learn
  k  a compound of words already known      4,319   `Bushaltestelle`, `Wahlergebnis`

RULE (k) IS THE EXAM BOARD'S OWN CRITERION, which is why it is worth having and
worth explaining.  The passage quoted above says a candidate at this level is expected to
DECODE the compounds authentic texts are full of rather than to have learnt them,
so a word that segments into parts the learner already has is not a card.
`Bushaltestelle` is Bus + Haltestelle and both are taught; `Wertschöpfung` is
Wert + Schöpfung and `Schöpfung` is not, so it stays.  Segmentation is greedy
against the vocabulary of every level plus this one, allows the Fugenelemente
(-s, -es, -n, -en, -er) and a verb stem, and requires every part to be at least
four letters and the whole word at least nine -- the guard against reading a
simple word as a compound of two accidents.

RULE (g) IS ASYMMETRIC ON PURPOSE.  A lower-case surface that is listed as a form
of some other lemma is dropped outright; a CAPITALISED one is dropped only if its
source lemma is taught.  German nominalises freely, so `die Habe` and `das Muss`
are genuine nouns that happen to be forms of `haben` and `müssen`, while `Tage`
and `Gute` are just inflections of words already on the shelf.

The output is `wortliste-<level>.json` in the shape `parse_goethe.py` writes, so
every stage after this one runs unchanged, and an empty `wordgroups-<level>.json`
beside it -- the numbers, days and months are an A1 idea and are long since
taught.
"""
import json, re, sys

from goethe_level import load_freq, LEVEL, FREQ, f as lvlf, words_below

# HOW MANY WORDS EACH LEVEL TAKES AND HOW FAR DOWN THE CORPUS IT LOOKS.  The three
# corpus levels are ONE LADDER cut into equal tranches: B2 takes the 3,000 most
# frequent words beyond B1, C1 the 3,000 beyond B2, C2 the 3,000 beyond C1, each
# excluding the ones under it through `BELOW`.
TARGET = 3000

# MIN_COUNT IS A BOUND ON THE SCAN, NOT THE DECK'S FLOOR, and confusing the two is
# how it came to be a per-level table.  What sets a level's real floor is the
# TARGET slice: B2 stops at whatever the 3,000th word happens to be, and the level
# above it starts there.  So one number does for all three, and it only has to be
# low enough that the LAST of them still finds 3,000 usable words -- 9,000 beyond
# B1 in all, which is most of what a corpus this size has above a dozen
# occurrences.  Set too high it fails loudly (the SystemExit below); set far too
# low it merely wastes a bigger dump pass.
MIN_COUNT = 8

# how far down the corpus to look before giving up.  MIN_COUNT bites first -- 8
# occurrences reaches 76,132 word-shaped surfaces against this cap -- and this
# bounds the dump scan for a level whose floor is lower still.
DEPTH = 90000
OPEN_POS = {'noun', 'verb', 'adj', 'adv', 'conj', 'prep', 'phrase'}
BAD_FLAG = {'vulgar', 'offensive', 'derogatory', 'slur', 'ethnic-slur',
            'obsolete', 'archaic'}
WORD = re.compile(r'^[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß-]*$')
# a gloss that defines the word by a place: `of or relating to Berlin`
DEMONYM = re.compile(r'\b(?:of,? or (?:pertaining|relating) to|relating to|from|'
                     r'native to|inhabitant of|resident of|denizen of)\b[^.]*\b[A-ZÄÖÜ]')
LEAD_ART = re.compile(r'^(?:a|an|the|to)\s+', re.I)
FUGEN = ('', 's', 'es', 'n', 'en', 'er')

freq_file, freq_shape = FREQ[LEVEL]
if freq_shape != 'leipzig':
    raise SystemExit(f'{LEVEL} selects from a corpus and needs a Leipzig word file')

taught = words_below()
if not taught:
    raise SystemExit(f'{LEVEL} is built on the levels below it and found none of them')
taught_lower = {t.lower() for t in taught}
print('  already taught below:', len(taught))

# ------------------------------------------------------------------ candidates
cands, counts = [], {}
for line in open(freq_file, encoding='utf-8'):
    t = line.rstrip('\n').split('\t')
    if len(t) != 3:
        continue
    w, n = t[1], int(t[2])
    if n < MIN_COUNT or len(w) < 3 or not WORD.fullmatch(w) or w in counts:
        continue
    counts[w] = n
    cands.append(w)
    if len(cands) >= DEPTH:
        break
print(f'  corpus: {len(cands)} surfaces above {MIN_COUNT} occurrences')

# ------------------------------------------------------- the blended scale
# The same measure `select.py` orders the cards by, and it has to be read here
# too because SELECTION now uses it -- see the note above `keep.sort`.  Read the
# two files to rates per million and sum them; a repeated key keeps its first
# count within a file, which is the higher, both files being rank-ordered.
# THE SCALE IS THE ONE `select.py` ORDERS BY -- see `goethe_level.load_freq`,
# which also records why a case-folded corpus and a case-sensitive one cannot
# simply be looked up `exact or folded` (every German noun under-rated) nor
# `max(exact, folded)` (every noun that is spelled like a common verb form
# pulled to the front).  Shared rather than reimplemented because here it
# decides which TRANCHE a word lands in as well as where it sits in one, so two
# copies drifting apart would move words between decks.
blend = load_freq()


# ------------------------------------------------------------ one dump pass
# What each surface IS (part of speech, whether it has a meaning of its own, its
# glosses, its register tags) AND what it is a FORM of, in a single scan: the
# dump is 1.07 GB and reading it twice to answer two questions about the same
# 60,000 words is a minute nobody needs to spend.
want = set(cands)
info, form_of = {}, {}
for line in open('kaikki-de.jsonl', encoding='utf-8'):
    try:
        r = json.loads(line)
    except Exception:
        continue
    if r.get('lang_code') != 'de':
        continue
    w = r.get('word')
    if not w:
        continue
    for fo in r.get('forms') or []:
        f_ = (fo.get('form') or '').strip()
        if f_ and f_ != w and f_ in want:
            form_of.setdefault(f_, set()).add(w)
    if w not in want:
        continue
    e = info.setdefault(w, {'pos': set(), 'real': 0, 'gl': [], 'flags': set()})
    e['pos'].add(r.get('pos'))
    for s in r.get('senses', []):
        if s.get('glosses') and not (s.get('form_of') or s.get('alt_of')):
            e['real'] += 1
            e['flags'] |= set(s.get('tags', []))
            if len(e['gl']) < 6:
                e['gl'].append(s['glosses'][0])
print(f'  wiktionary: {len(info)} of them have a German record')

# ------------------------------------------------------------------ filters
dropped = {}


def drop(why):
    dropped[why] = dropped.get(why, 0) + 1


def english_unchanged(w, gls):
    """Every meaning is the word itself.  `Design` -> design teaches nothing in a
    German-to-English deck, however good a German word it is."""
    base = w.lower().replace('-', '')
    if not gls:
        return False
    for g in gls:
        if LEAD_ART.sub('', g.strip().rstrip('.')).strip().lower().replace('-', '') != base:
            return False
    return True


pool = []
for w in cands:
    e = info.get(w)
    if not e:
        drop('a  no German record'); continue
    if not e['real']:
        drop('b  no sense of its own'); continue
    pos = {p for p in e['pos'] if p}
    if 'name' in pos:
        drop('c  also a proper name'); continue
    if not pos & OPEN_POS:
        drop('d  a closed word class'); continue
    if e['flags'] & BAD_FLAG:
        drop('e  vulgar, obsolete or archaic'); continue
    if w in taught or w.lower() in taught_lower:
        drop('f  taught by a level below'); continue
    src = form_of.get(w) or set()
    if src and (not w[:1].isupper() or src & taught):
        drop('g  an inflected form of another word'); continue
    if '-' in w:
        drop('h  hyphenated'); continue
    if any(DEMONYM.search(g) for g in e['gl']):
        drop('i  place-derived'); continue
    if english_unchanged(w, e['gl']):
        drop('j  the English word unchanged'); continue
    pool.append(w)

# The compound test runs over the WHOLE pool rather than as it is built, so that
# a compound is decodable whether or not its parts happen to be commoner than it
# is -- `Bundesregierung` is read off `Bund` and `Regierung` either way.
vocab = taught_lower | {w.lower() for w in pool}


def decodable(w, depth=0):
    lw = w.lower()
    if depth and lw in vocab:
        return True
    for i in range(4, len(lw) - 3):
        head, tail = lw[:i], lw[i:]
        for fu in FUGEN:
            if fu and not head.endswith(fu):
                continue
            stem = head[:-len(fu)] if fu else head
            if len(stem) < 4:
                continue
            # the first part of a compound may be a verb stem (`Schreibtisch`),
            # so a stem that is a word once its infinitive ending is put back
            # counts as known
            if (stem in vocab or stem + 'en' in vocab or stem + 'e' in vocab) \
                    and decodable(tail, depth + 1):
                return True
    return False


keep = []
for w in pool:
    if len(w) >= 9 and decodable(w):
        drop('k  a compound of words already known'); continue
    keep.append(w)

for why in sorted(dropped):
    print(f'    {why:<38} {dropped[why]:>6}')
print(f'  usable candidates: {len(keep)}')

if len(keep) < TARGET:
    raise SystemExit(f'{LEVEL} wants {TARGET} words and the corpus yields {len(keep)}; '
                     'widen DEPTH or lower MIN_COUNT rather than shipping a short deck')
# THE TRANCHES ARE CUT ON THE SAME SCALE THE DECKS ARE ORDERED BY (Aug 2026, on
# request).  They used to be cut on the newspaper count alone while the cards
# were ordered by it too, which was at least self-consistent; once one blended
# scale ordered all seven decks (see `goethe_level.FREQ_BLEND`) it stopped being
# so, and visibly.  B2 opened on `okay` and C1 on `umbringen, beschützen,
# erschießen, nerven` -- ordinary spoken verbs sitting at the top of an advanced
# deck because a newspaper does not use them.  Worse, the collection was no
# longer in frequency order at all: C1's first word is commoner than most of B2,
# so reading the combined file A1 to C2 you meet a rarer word before a commoner
# one every time you cross a tranche boundary.
#
# So the pool is SORTED by the blend before it is sliced.  What this does NOT
# change is where the candidates come from: they are still the newspaper corpus's
# own vocabulary, because that is the list with 743,000 words in it against the
# subtitle list's 50,000.  Measured, the subtitle words absent from the candidate
# pool are 19,108 and almost every one is something the filters below reject
# anyway -- inflected forms (`wolltest`, `vergiss`, `hörst`), transcription junk
# (`chffffff`, `lhr`) and English (`mom`, `yeah`, `colonel`).
keep.sort(key=lambda w: (-blend(w), w.lower()))
keep = keep[:TARGET]
print(f'  taking the {TARGET} most frequent on the blended scale; floor is '
      f'{blend(keep[-1]):.2f} per million ({keep[-1]}, '
      f'{counts[keep[-1]]} occurrences in the news corpus)')

# ------------------------------------------------------------------ emit
# The shape `parse_goethe.py` writes, so every later stage runs unchanged.  Almost
# every field is a fact a PRINTED list carries and a corpus does not: there is no
# article, no plural marker and no sub-entry level here, and `build_deck` fills
# the article and the plural from Wiktionary anyway -- which it already does for
# the words the Goethe lists leave unarticled.
entries = [{
    'display': w, 'article': '', 'word': w, 'plural_note': '', 'note': '',
    'pluralonly_pre': False, 'sub': False, 'page': 0, 'group': '',
    'reflexive': False, 'pluralonly': False, 'pair': '', 'speak': w,
    'lemmas': [w],
} for w in keep]

json.dump(entries, open(lvlf('wortliste.json'), 'w'), ensure_ascii=False, indent=1)
json.dump([], open(lvlf('wordgroups.json'), 'w'), ensure_ascii=False)
# The frequency FLOOR travels to the deck's own description, which tells a reader
# how far into the tail the last card sits.  Written here rather than recomputed
# there because this is the only stage that sees the corpus counts at all.
# THE LAST WORD IN ORDER IS NOT THE RAREST ONE, now that the order and the cut
# are the blended scale and this figure is a newspaper count.  The description
# says "even the rarest word here turns up N times", which is a claim about the
# MINIMUM -- so take the minimum rather than the last, or the sentence is a
# statement about one scale dressed as a statement about another.
_rare = min(keep, key=lambda w: counts[w])
json.dump({'floor': counts[_rare], 'word': _rare,
           'last': keep[-1], 'rate': round(blend(keep[-1]), 2)},
          open(lvlf('corpus-floor.json'), 'w'), ensure_ascii=False)
print('  words:', len(entries))
print('  first ten:', ', '.join(keep[:10]))
