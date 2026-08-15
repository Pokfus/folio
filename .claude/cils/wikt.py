#!/usr/bin/env python3
"""Reading a kaikki record: the two tests both `select` and `build_deck` need.

They live here rather than in either stage because they have to AGREE.  A record
that `select` declines when it picks a part of speech and `build_deck` then
picks up again when it looks for the record to build from is the shape of the
`ti` fault: the selector correctly refused the letter-name entry, the builder
took the first noun record it saw, and the card came out glossed "The name of
the Latin script letter T/t."  One definition, imported twice.
"""
import re


# **THE DICTIONARY SAYING THIS IS NOT AN EXPRESSION IS NOT A DEFINITION.**
# Wiktionary writes "Used other than figuratively or idiomatically: see in,
# mano." where a multiword entry exists only to point at its own parts, and 169
# Italian entries open on it.  Carded, it reads as the meaning: `in mano` would
# be glossed with a sentence naming two other words and defining neither.
_SEE_ALSO_RX = re.compile(r'^Used other than figuratively or idiomatically', re.I)


def real_senses(r):
    """Senses that say what the word MEANS, rather than pointing at another word."""
    return [s for s in (r.get('senses') or [])
            if s.get('glosses') and not (s.get('form_of') or s.get('alt_of'))
            and not _SEE_ALSO_RX.match(s['glosses'][0] or '')]


# **A ONE-LETTER WORD IS NOT THE NAME OF A LETTER**, and Wiktionary files that
# reading FIRST.  `e`, `a` and `o` each open with a `character` record ("The
# fifth letter of the Italian alphabet") and a noun record ("The name of the
# Latin script letter E/e"), with the conjunction or preposition -- the word
# every Italian sentence is full of -- third.  `ti` and `ci` do the same.  Taken
# in order, four of the twenty commonest words in the band came out glossed as
# letters of the alphabet, at cards 1, 8, 18 and 23.
#
# It is a RULE rather than five rows in a table because the shape recurs across
# the alphabet and the other bands will meet the rest of it.  A letter-name
# record is refused only while something else can be used, so a genuine entry
# about a letter still cards rather than coming back empty.
_LETTER_RX = re.compile(
    r'^(the (name of the|\w+ letter)|the \w+ letter of the|name of the)\b', re.I)


def letter_name(r):
    """Whether this record is the entry for a letter of the alphabet."""
    if r.get('pos') == 'character':
        return True
    gs = [(s.get('glosses') or [''])[0] for s in real_senses(r)]
    return bool(gs) and all(_LETTER_RX.match(g or '') for g in gs)


def pointer_targets(recs):
    """The lemmas these records point at, best first.

    **A POINTER'S MEANING IS AT THE OTHER END OF IT**, and in the upper bands
    that is not a corner case but the commonest shape there is.  The C1 list
    prints feminine adjectives, past participles and superlatives as headwords of
    their own -- `stupenda`, `ammesso`, `felicissimo`, `sovietica` -- and
    Wiktionary files each as nothing but "feminine singular of stupendo", with no
    gloss to read.  A hundred and twenty-four words came back with no meaning at
    all and were dropped from a deck that says it teaches 2,842.

    `sense_gloss` already recovers a meaning written AFTER the pointer ("clitic
    accusative of io. me"), which is what the lower bands needed; this is for the
    entries that carry no tail, where the only way to the meaning is to look the
    target up.  Ordered by how many senses point there, so a word pointing mostly
    at one lemma is not diverted by a stray second sense.

    **A POINTER MAY NAME MORE THAN ONE WORD IN ONE FIELD**, which is a template
    artefact rather than a lemma: C1's `fintanto` carries the single target
    `"fintantoché or finché"`, which is no word at all, so the chase found
    nothing and a common conjunction was dropped from the deck.  The whole
    string is offered FIRST -- it is what the dictionary literally wrote, and a
    lemma really containing a space (`viva voce`) must still resolve -- and the
    parts after it, so the split can only ever add a fallback.
    """
    seen = {}

    def note(w):
        if w and w not in seen:
            seen[w] = 0
        if w:
            seen[w] += 1

    for r in recs:
        for s in (r.get('senses') or []):
            for f in (s.get('form_of') or s.get('alt_of') or []):
                w = (f or {}).get('word') if isinstance(f, dict) else f
                if not w:
                    continue
                w = w.strip()
                note(w)
                parts = [p.strip() for p in _POINTER_SPLIT.split(w)]
                if len(parts) > 1:
                    for p in parts:
                        note(p)
    return [w for w, _ in sorted(seen.items(), key=lambda kv: -kv[1])]


_POINTER_SPLIT = re.compile(r'\s+(?:or|and)\s+|\s*,\s*')
