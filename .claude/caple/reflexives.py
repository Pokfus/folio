#!/usr/bin/env python3
"""The reflexive verbs, and what they mean.

WIKTIONARY HAS NO RECORD FOR ANY OF THEM.  Spanish files `llamarse` as a
headword of its own, so the DELE pipeline can read its gloss like any other
word's; Portuguese writes the pronoun as a separate clitic (`chamar-se`), and
`chamar-se`, `levantar-se` and `sentar-se` were each checked in the dump and are
simply absent.  So a reflexive here is the BASE verb's paradigm under a gloss
written out in this file, and there is nowhere else for that gloss to come from.

THAT IS WHY THE LIST IS SHORT AND WHY IT IS A LIST AT ALL.  A gloss written by
hand is a claim this pipeline is making rather than reading, so it is made only
where the reflexive is genuinely a different word from its base -- `chamar` is
to call and `chamar-se` is to be called -- and only for reflexives the
Referencial's own A1 inventory names.  Every key below appears in the A1 Noções
or Funções section; none was added because it seemed useful.

`select.py` admits a `-se` word only if it is in this table, so a reflexive can
never reach a card without a meaning on it.
"""

# key -> the meanings shown on the card.  Each key is attested in the A1
# Referencial; the sections it appears in are noted beside it.
GLOSS = {
    'chamar-se':    ['to be called, to be named'],          # Noções, Funções
    'levantar-se':  ['to get up, to stand up'],             # Noções
    'sentar-se':    ['to sit down'],                        # Noções
    'deitar-se':    ['to lie down, to go to bed'],          # Noções
    'vestir-se':    ['to get dressed'],                     # Noções
    'despir-se':    ['to get undressed'],                   # Noções
    'lavar-se':     ['to wash oneself, to get washed'],     # Noções
    'sentir-se':    ['to feel (well, ill, tired)'],         # Noções
    'lembrar-se':   ['to remember'],                        # Noções
    'apresentar-se': ['to introduce oneself'],              # Funções
    'sujar-se':     ['to get dirty'],                       # Noções
}

# The English a sentence must carry for it to be an example of the reflexive
# rather than of its base verb.  `chamar` is "to call" and `chamar-se` is "to be
# called": both translate a sentence containing `chama`, and only the English
# tells them apart.  Used by `examples.py` as a second test after the clitic
# agreement, for the handful where the base verb is common enough that the
# agreement rule alone still lets the wrong sentence through.
KEYWORDS = {
    'chamar-se':    ('name', 'called'),
    'levantar-se':  ('get up', 'got up', 'stand up', 'stood up', 'rise'),
    'sentar-se':    ('sit', 'sat', 'seat'),
    'deitar-se':    ('bed', 'lie down', 'lay down'),
    'vestir-se':    ('dress',),
    'despir-se':    ('undress', 'take off'),
    'lavar-se':     ('wash',),
    'sentir-se':    ('feel', 'felt'),
    'lembrar-se':   ('remember', 'recall'),
    'apresentar-se': ('introduce',),
    'sujar-se':     ('dirty',),
}


def base(k):
    """`chamar-se` -> `chamar`."""
    return k[:-3] if k.endswith('-se') else k


def report_missing(words, who):
    """Say so if a reflexive reached the word list with no gloss written for it.

    The failure this guards is silent: `build_deck.py` would fall through to
    the base verb's own meaning and ship `levantar-se` glossed "to raise, to
    lift", which is a well-formed card teaching the wrong word.
    """
    miss = [k for k in words if k.endswith('-se') and k not in GLOSS]
    if miss:
        raise SystemExit(
            f'{who}: reflexive with no gloss in reflexives.py: {", ".join(miss)}')
