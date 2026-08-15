#!/usr/bin/env python3
"""The closed classes the Referencial names but never writes out.

The Noções inventory lists topical vocabulary and the Gramática section
DESCRIBES the grammar rather than listing its forms, so a handful of things an
A1 candidate cannot do without are named in the document and never given as
words.  Three kinds:

  · THE NUMBERS.  The Referencial writes `números cardinais: — zero — um a cem
    — quinhentos — mil — milhão`.  `um a cem` is a RANGE, and a deck cannot
    teach a range, so the numbers inside it are written out here.  This is where
    the European standard shows most sharply and where a Brazilian list would be
    wrong on four words: Portugal writes `dezasseis`, `dezassete`, `dezanove`
    and `catorze` where Brazil writes `dezesseis`, `dezessete`, `dezenove` and
    `quatorze`.

  · THE CLITIC PRONOUNS.  `me`, `te`, `se`, `nos`, `lhe`, `lhes` are inventoried
    in the Gramática section as a paradigm inside running prose, and the parser
    treats the commonest of them as scaffolding precisely so that a frame like
    `lavar-se` does not offer `se` as a word every time.  They are real A1
    vocabulary all the same -- European Portuguese hangs them off the end of the
    verb (`chamo-me`), which is the first thing a learner meets.

  · A FEW WORDS THE INVENTORY SIMPLY HAS NOT GOT.  `amigo` and `ontem` are not
    in the A1 Noções at all, which is a gap in the source rather than a decision
    -- `hoje` and `amanhã` are both there and `ontem` is not.

NOTHING HERE IS A JUDGEMENT ABOUT WHAT A1 SHOULD CONTAIN.  Every entry is
either written in the Referencial as a range or a paradigm, or is the missing
member of a set the Referencial does give.  A word that merely seems useful does
not go in this file; `select.py` will reach it on frequency if it belongs.
"""

# `um a cem`, written out.  European forms throughout -- see the header.
NUMBERS = """
zero um dois três quatro cinco seis sete oito nove dez
onze doze treze catorze quinze dezasseis dezassete dezoito dezanove vinte
trinta quarenta cinquenta sessenta setenta oitenta noventa cem
quinhentos mil milhão
""".split()

# named in the Referencial as `números ordinais: — primeiro(a) — segundo(a) —
# terceiro(a)…`, where the ellipsis is the source's own
ORDINALS = 'primeiro segundo terceiro'.split()

# inventoried in the Gramática section as a paradigm, in prose
CLITICS = 'me te se nos vos lhe lhes'.split()

# the personal pronouns, likewise a paradigm in prose.  `vós` is included
# because the verb table has a slot for it: it is archaic in Portugal outside
# the north and the liturgy, and a learner who meets `sois` needs to be able to
# look it up.
PRONOUNS = 'eu tu ele ela nós vós eles elas você vocês'.split()

# the possessives and demonstratives, same reason
POSSESSIVE = 'meu minha teu tua seu sua nosso nossa'.split()
DEMONSTRATIVE = 'este esta esse essa aquele aquela isto isso aquilo'.split()

# quantifiers the Gramática names as a class without listing them
QUANTIFIER = 'algum alguma nenhum nenhuma cada vários outro'.split()

# members missing from a set the Referencial does give
GAPS = 'ontem amigo amiga precisar'.split()

SUPPLEMENT = (NUMBERS + ORDINALS + CLITICS + PRONOUNS + POSSESSIVE
              + DEMONSTRATIVE + QUANTIFIER + GAPS)

# What must be in the deck whatever the frequency ordering says.  A 500-word A1
# list without `eu` and `tu` is not an A1 list, which is the DELE pipeline's own
# finding; these are taken first in `select.py`'s cascade.
ESSENTIAL_LIST = (PRONOUNS + CLITICS + NUMBERS[:21] + POSSESSIVE
                  + DEMONSTRATIVE + ORDINALS)

if __name__ == '__main__':
    import json
    from caple_level import f as lvlf
    out = sorted(set(SUPPLEMENT))
    json.dump(out, open(lvlf('supplement.json'), 'w'), ensure_ascii=False)
    print('  supplement   :', len(out), 'words')
    print('  essential    :', len(set(ESSENTIAL_LIST)))
