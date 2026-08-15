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


def real_senses(r):
    """Senses that say what the word MEANS, rather than pointing at another word."""
    return [s for s in (r.get('senses') or [])
            if s.get('glosses') and not (s.get('form_of') or s.get('alt_of'))]


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
