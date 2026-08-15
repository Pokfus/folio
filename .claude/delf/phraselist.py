#!/usr/bin/env python3
"""Choose the set expressions, where every other level READS a published list.

`wordlist.py` is handed a page of headwords and its whole difficulty is what the
page gets wrong.  There is no page for this deck, and that is not an oversight:
the six lists are lists of WORDS, and an expression is not a word.  `avoir` is on
the A1 page and `faim` is on the A2 page and `avoir faim` is on none of them,
because a vocabulary syllabus enumerates the vocabulary and leaves the reader to
put it together -- which for `avoir faim`, `tout de suite` and `du coup` is
precisely what cannot be done.

So the candidates come from the DICTIONARY'S OWN MULTI-WORD ENTRIES, which is the
`.claude/decks/phrasepick.js` precedent: a lexicographer has already decided that
a string is worth an entry of its own, and that decision is better evidence than
any rule about length or shape could be.  Wiktionary carries ~66,000 French
multi-word entries; what follows is how they come down to four hundred.

WHY THE PART OF SPEECH IS THE FIRST CUT, AND WHY `noun` IS OUT.  Twelve thousand
of those entries are nouns, and a French compound noun is a WORD wearing a space:
`homme d'affaires`, `pomme de terre`, `chemin de fer`, `carte bancaire`.  Teaching
those is a job for a vocabulary deck and it is the job the six levels are already
doing -- a reader meets `pomme de terre` as one thing with a gender and an
article, not as an expression to be explained.  What is left is the classes an
expression actually falls into: `adv`, `adj`, `phrase`, `intj`, `verb`, `conj`,
`prep_phrase`, `proverb`.  `name`, `pron`, `det` and `num` are out for the same
reason as `noun`.

WHY THE FILTERS RUN PER SENSE AND NOT PER ENTRY.  Wiktionary's obsolete, coarse
and regional marks sit on the SENSE, so an entry is dropped only when nothing
survives them -- and the difference is not academic.  `ça marche`, `au fond`,
`sans faute` and `péter un câble` all carry a "used other than figuratively or
idiomatically" sense beside the idiom, and testing the entry would have thrown
away four ordinary expressions to remove a sense nobody would card.  Fourteen
entries were saved by that alone.

HOW COMMON, AND THE MEASUREMENT'S KNOWN FAULT.  A phrase cannot be looked up in
the subtitle frequency list at all -- that list is segmented, so `tout de suite`
is three tokens and never one entry -- so the phrases are COUNTED in the Tatoeba
corpus, which is running text.  That count is a rough sort key and NOT a
verdict, because **substring counting over-counts a phrase that is also an
ordinary word sequence**: `pas que` scores 2,692 and is almost entirely `je ne
pense pas que`, `de par` matches `de partir` and `de parler`, `être à` matches
every `est à` in the corpus.  Hence DROP below, and hence the rule this file
shares with `pick-images.js`: the machine ranks and a reader chooses.

WHAT THE DECK GIVES UP, SAID HERE BECAUSE IT IS THE ONE REAL LIMITATION.  A
multi-word verb gets NO CONJUGATION TABLE.  Measured before the deck was built:
of the ten commonest verbal expressions here (`avoir faim`, `faire la vaisselle`,
`prendre soin`, `laisser tomber` and the rest) the dictionary carries **zero
inflected forms for every one** -- the paradigm belongs to the head verb, which
the levels already teach and card in full.  Composing one here would mean
inventing six persons across five tenses from a lemma the entry does not name,
which is exactly the kind of composition the rest of this pipeline refuses (see
`passe_compose` in build_deck.py: three forms are composed and they are the only
ones).  The deck's own description says so.
"""
import json, os, re
from collections import Counter, defaultdict

from delf_level import LEVEL, f as lvlf, words_below

CACHE = os.path.join('..', '..', '.claude', 'delf-cache')
KAIKKI = os.path.join(CACHE, 'kaikki-fr.jsonl')
TATOEBA = os.path.join(CACHE, 'fra_sentences_detailed.tsv')

# The classes an expression falls into.  See the head of this file for why
# `noun` is not among them.
WANT = {'phrase', 'intj', 'adv', 'prep_phrase', 'proverb', 'verb', 'conj', 'adj'}

# Marks that take a SENSE out.  Regional labels go because this deck teaches the
# French an exam is sat in; `rare`, `dated` and the rest go because an expression
# nobody says is not a common expression, which is what the deck claims to hold.
OUT = {'obsolete', 'archaic', 'dated', 'vulgar', 'derogatory', 'offensive',
       'slur', 'rare', 'historical', 'form-of', 'alt-of',
       'Quebec', 'Canada', 'Belgium', 'Switzerland', 'Louisiana', 'Acadia',
       'Haiti'}

# Wiktionary's own note that a string is being listed for its LITERAL reading.
# Dropping the sense keeps the idiom; dropping the entry would lose it.
NONIDIO = re.compile(r'used other than (figuratively|as an idiom)', re.I)
COARSE = re.compile(r'\b(fuck|fucking|shit|bitch|bastard|cunt|prick|dick|whore'
                    r'|slut|piss)', re.I)

# How many Tatoeba sentences an expression must appear in.  A floor rather than a
# ranking: everything above it is READ, and the sixty-three refusals below are
# what the reading came to.
MIN_HITS = 40

# ---------------------------------------------------------------- the refusals
#
# EVERY DROP CARRIES ITS REASON, so a later pass can re-argue one rather than
# rediscovering the whole list.  The four reasons are the whole test, and each is
# something that can be checked rather than felt:
#
#   sequence  -- not a unit at all.  Either the words mean exactly what they say
#                (`ouvrir la porte`, `dans le passé`) or the entry is a fragment
#                of a longer phrase that IS one (`en état` wants `en état de`,
#                `à mesure` wants `à mesure que`, `de parole` wants `homme de
#                parole`).  Most of these are also where the Tatoeba count is
#                spurious, which is how they were found.
#   gloss     -- the dictionary's FIRST sense is not the ordinary one, so the
#                card would teach the wrong meaning.  `au coin` leads with the
#                naughty step, `en garde` with fencing, `au vol` with catching
#                something in mid-air, and `bien fait` with "good-looking" for a
#                string almost always met as the participle or as "serves you
#                right".  These go because the right gloss is ARGUABLE; where it
#                is not in doubt the expression is kept and the meaning written
#                in instead -- see GLOSS below, which handles four of them.
#   duplicate -- a second person or possessive of an expression already kept
#                (`après toi` beside `après vous`, `à ton avis` beside `à mon
#                avis`), or a near-synonym glossed identically (`dans le sac`
#                beside `dans la poche`).  Two cards for one thing is two
#                schedules for one thing.
#   sentence  -- a whole sentence rather than an expression.  The set questions
#                every course teaches are kept (`quelle heure est-il`, `comment
#                allez-vous`); `je n'ai pas d'argent` is a sentence someone once
#                added to Wiktionary.
#   form      -- an inflected form or a bare lemma rather than an expression:
#                `y a-t-il` is `il y a` inverted, `y avoir` is the lemma under
#                it, `à toute` is a clipping of `à tout à l'heure`.
DROP = {
    'sequence': """
        pas que | de par | que de | sur ce | dire que | de deux | à moi
        | un coup | de quoi | être à | la faire | le chercher | se mettre
        | de un | en être | dire quelque chose | trop de | du tout | qui parle
        | ouvrir la porte | aller au lit | dire au revoir | de cette façon
        | de cette manière | de table | au four | dans le passé | en présence
        | en état | de commun | à mesure | de parole
    """,
    'gloss': """
        faire beau | au coin | au pied | du vent | au vol | en garde | au pas
        | de droit | qui vive | que tu crois | sans un | de choc | ça a été
        | dernier mot | je ne dis pas | bien fait
    """,
    'duplicate': """
        vous savez | après toi | que voulez-vous | comment vas-tu | comment cela
        | je vous aime | je t'en prie | pour autant que je sache | dans le sac
        | à ce propos | dans un coin | à ton avis
    """,
    'sentence': "je n'ai pas d'argent",
    'form': "y a-t-il | y avoir | à toute",
}

# THE GLOSS IS OVERRIDDEN RATHER THAN THE ENTRY DROPPED, for four expressions
# common enough to be worth the composition and whose right meaning is not in
# doubt.  `en dehors` leads with a sense from music, `au fait` with the English
# borrowing of it, `bien entendu` with the literal "well understood", `il
# suffit` with "enough is enough"; each is real and none is what a learner
# meets, so dropping them would lose a phrase every course teaches in order to
# remove a gloss nobody wanted.  Written here beside the fifteen refused for the
# same fault, so the two are weighed against each other rather than in different
# files.
#
# THE CLASS IS PART OF THE SAME DECISION AS THE MEANING, so it is in the same
# row.  Both come from the dictionary's own first WANTED record, and where that
# record is the wrong reading it is usually the wrong class too: `au fait` and
# `en dehors` are filed adjective-first, so the cards came out labelled
# "adjectival phrase" over a plainly adverbial meaning.  Written apart, the
# gloss would have been corrected and the label left contradicting it.
GLOSS = {
    'au fait': ('adv', ['by the way, incidentally',
                        'up to date, informed, in the know']),
    'en dehors': ('adv', ['outside, on the outside']),
    'bien entendu': ('adv', ['of course, naturally, needless to say']),
    'il suffit': ('phrase', ['it is enough',
                             'you only have to, all you have to do is']),
}


def _items(v):
    return [x.strip() for x in v.split('|') if x.strip()]


DROPPED = {w: why for why, v in DROP.items() for w in _items(v)}


def usable(sense):
    """The sense's gloss, or None where a mark takes the sense out."""
    g = (sense.get('glosses') or [''])[0]
    if not g or sense.get('form_of') or sense.get('alt_of'):
        return None
    if NONIDIO.search(g) or COARSE.search(g):
        return None
    if set(sense.get('tags') or []) & OUT:
        return None
    if set(sense.get('raw_tags') or []) & OUT:
        return None
    return g


# ------------------------------------------------------- the dictionary's own
cands, senses = {}, {}
for line in open(KAIKKI, encoding='utf-8'):
    if '"word":' not in line:
        continue
    r = json.loads(line)
    w = r.get('word', '')
    # a space is what makes it multi-word; lower case is what keeps the proper
    # nouns and the titles out, which no POS filter catches
    if ' ' not in w or w != w.lower() or r.get('pos') not in WANT:
        continue
    gs = [g for g in (usable(s) for s in r.get('senses', [])) if g]
    if not gs:
        continue
    cands.setdefault(w, r['pos'])
    # THE SURVIVING SENSES ARE KEPT, AND THAT IS NOT AN OPTIMISATION.  Filtering
    # here decided which ENTRIES to teach; `build_deck.py` then reads the record
    # again and merges whatever senses it finds, so a sense refused here reached
    # the card anyway -- `ça marche` shipped glossed "OK; see ça, marche", the
    # literal reading this file exists to drop.  It bit on every one of the ~36
    # entries a per-sense filter saved, which is to say on exactly the entries
    # the filter was written for.  Written down, the card shows the senses that
    # were actually judged usable.
    for g in gs:
        if g not in senses.setdefault(w, []):
            senses[w].append(g)
print('  multi-word entries in a wanted class, with a usable sense:', len(cands))

# ------------------------------------------------------------ how common it is
#
# Indexed on each phrase's FIRST WORD rather than swept whole: 6,000 phrases
# against 720,000 sentences is four thousand million substring tests, and the
# index takes it to one per token per sentence.
first = defaultdict(list)
for w in cands:
    first[w.split()[0]].append(w)
tok = re.compile(r'[^\W\d_]+', re.UNICODE)
hits = Counter()
for line in open(TATOEBA, encoding='utf-8'):
    p = line.split('\t')
    if len(p) < 3:
        continue
    low = p[2].lower().replace('’', "'")
    for t in set(tok.findall(low)):
        for w in first.get(t, ()):
            if w in low:
                hits[w] += 1

taught = words_below()
common = sorted((w for w in cands if hits[w] >= MIN_HITS and w not in taught),
                key=lambda w: (-hits[w], w))
print(f'  at {MIN_HITS}+ sentences and not already taught:', len(common))

# ------------------------------------------------------------------ the choice
kept, refused = [], Counter()
for w in common:
    why = DROPPED.get(w)
    if why:
        refused[why] += 1
        continue
    kept.append(w)

# A DROP THAT MATCHES NOTHING IS A DROP THAT HAS STOPPED WORKING, and it stops
# silently: the entry it names simply comes back into the deck.  That happens the
# day Wiktionary re-glosses one, re-tags a sense, or the corpus moves an entry
# under the floor -- so the unmatched ones are named rather than passed over.
stale = [w for w in DROPPED if w not in common]
if stale:
    print('  DROP NAMES ENTRIES THAT ARE NO LONGER CANDIDATES (re-read them):',
          ', '.join(sorted(stale)))
missing_gloss = [w for w in GLOSS if w not in kept]
if missing_gloss:
    print('  GLOSS NAMES ENTRIES THAT ARE NOT IN THE DECK:',
          ', '.join(sorted(missing_gloss)))

entries = []
for w in kept:
    entries.append({
        'word': w,
        'display': w,
        'speak': w,
        'lemmas': [w],
        'reflexive': False,
        'phrase': True,          # every entry here is one, by construction
        'group': '',
        'note': '',
        'merged': False,
        # what the dictionary calls it, for select.py -- overridden by GLOSS
        # where the class was settled by hand along with the meaning
        'pos': GLOSS[w][0] if w in GLOSS else cands[w],
        'hits': hits[w],         # the sort key, since no frequency list has it
    })

print('  refused:', dict(refused), '-> phrases:', len(entries))
by_pos = Counter(e['pos'] for e in entries)
print('  by class:', dict(by_pos.most_common()))

# What was refused, for the deck's own description to read back -- a reader told
# the expressions were chosen rather than published is owed the count and the
# reasons.  The shape matches `wordlist.py`'s `repairs.json` so `emit.py` reads
# one file whichever stage wrote it.
json.dump({'raw': len(common),
           'fixed': [], 'dropped': [],
           'refused': {why: sorted(w for w in _items(DROP[why]) if w in common)
                       for why in DROP},
           'added': {}},
          open(lvlf('repairs.json'), 'w'), ensure_ascii=False, indent=1)
json.dump({w: GLOSS[w][1] for w in GLOSS if w in kept},
          open(lvlf('phrase-glosses.json'), 'w'), ensure_ascii=False, indent=1)
# THE CLASS OVERRIDE HAS TO REACH `FORCE_POS` AND NOT JUST THE ENTRY, because
# `pick_pos` falls back when the dictionary has no record in the class asked
# for -- which is exactly the case here.  `au fait` HAS an adverb record and came
# out right off `pos_hint` alone; `en dehors` has none, so it fell back to the
# adjective record and went on printing "adjectival phrase" over an adverbial
# meaning.  That is the rule `pick_pos` already states for `une`: a forced class
# wins even where the dump has no record for it, and the meaning then comes from
# the authored table -- which these four have.
json.dump({w: GLOSS[w][0] for w in GLOSS if w in kept},
          open(lvlf('phrase-pos.json'), 'w'), ensure_ascii=False, indent=1)
json.dump({w: senses[w] for w in kept if w in senses},
          open(lvlf('phrase-senses.json'), 'w'), ensure_ascii=False, indent=1)
json.dump(entries, open(lvlf('wordlist.json'), 'w'), ensure_ascii=False, indent=1)
