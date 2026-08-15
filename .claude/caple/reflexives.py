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
Referencial's own inventory names.  Every key below appears in that level's
Noções or Funções section; none was added because it seemed useful.

THE TABLE COVERS EVERY LEVEL AT ONCE and `select.py` offers a key only where
the level being built names it, so a reflexive cannot arrive early.  Adding a
level means reading its inventory for `-se` verbs and glossing the ones it
introduces: A2 names thirty-two of them, of which four are deliberately absent
below.  `ir-se` and `vir-se` are named only inside `ir-se/vir-se embora`, where
the unit a learner needs is the whole phrase and the bare verb would be a
headword the inventory does not have; `ver-se` and `dizer-se` mean what their
base verbs mean with a pronoun on them, which is the test in the paragraph
above and the reason this file is not simply every `-se` string in the source.

`select.py` admits a `-se` word only if it is in this table, so a reflexive can
never reach a card without a meaning on it.
"""

# key -> the meanings shown on the card.  Each key is attested in the
# Referencial at the level noted beside it, in the section named.
GLOSS = {
    'chamar-se':    ['to be called, to be named'],          # A1 Noções, Funções
    'levantar-se':  ['to get up, to stand up'],             # A1 Noções
    'sentar-se':    ['to sit down'],                        # A1 Noções
    'deitar-se':    ['to lie down, to go to bed'],          # A1 Noções
    'vestir-se':    ['to get dressed'],                     # A1 Noções
    'despir-se':    ['to get undressed'],                   # A1 Noções
    'lavar-se':     ['to wash oneself, to get washed'],     # A1 Noções
    'sentir-se':    ['to feel (well, ill, tired)'],         # A1 Noções
    'lembrar-se':   ['to remember'],                        # A1 Noções
    'apresentar-se': ['to introduce oneself'],              # A1 Funções
    'sujar-se':     ['to get dirty'],                       # A1 Noções

    # A2.  The four relationship verbs are one bullet of the A2 Noções
    # inventory (`casar-se, separar-se, divorciar-se, juntar-se, namorar`), and
    # `adiantar-se` and `atrasar-se` are written `adiantar(-se)` under the
    # headings for being early and being late -- which is where their meaning
    # comes from, the bullet above `adiantar(-se)` reading `antes da hora`.
    'casar-se':     ['to get married'],                     # A2 Noções
    'separar-se':   ['to separate, to split up'],           # A2 Noções
    'divorciar-se': ['to get divorced'],                    # A2 Noções
    'juntar-se':    ['to move in together, to join'],       # A2 Noções
    'adiantar-se':  ['to be early, to be ahead of time'],   # A2 Noções
    'atrasar-se':   ['to be late'],                         # A2 Noções
    'demorar-se':   ['to take a long time, to be delayed'],  # A2 Noções
    'divertir-se':  ['to enjoy oneself, to have fun'],      # A2 Noções
    'tornar-se':    ['to become'],                          # A2 Noções
    'dedicar-se':   ['to devote oneself'],                  # A2 Noções
    'mexer-se':     ['to move'],                            # A2 Noções
    'virar-se':     ['to turn round'],                      # A2 Noções
    'voltar-se':    ['to turn round, to turn to'],          # A2 Noções
    'secar-se':     ['to dry oneself'],                     # A2 Noções
    'molhar-se':    ['to get wet'],                         # A2 Noções
    'pentear-se':   ["to comb one's hair"],                 # A2 Noções
    'maquilhar-se': ['to put on make-up'],                  # A2 Noções
    'calar-se':     ['to be quiet, to stop talking'],       # A2 Funções
    'esquecer-se':  ['to forget'],                          # A2 Funções
    'recordar-se':  ['to remember'],                        # A2 Funções
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
    # A KEYWORD IS MATCHED AS A SUBSTRING, so `undress` covers `undressed` and
    # `wash` covers `washed` -- but an irregular verb has to be written out, and
    # `take off` alone cost this word its one good example, whose English reads
    # `took off`.
    'despir-se':    ('undress', 'take off', 'took off', 'takes off',
                     'taking off'),
    'lavar-se':     ('wash',),
    'sentir-se':    ('feel', 'felt'),
    'lembrar-se':   ('remember', 'recall'),
    'apresentar-se': ('introduce',),
    'sujar-se':     ('dirty',),
    # A2, and here every one is written rather than only the hard cases.  The
    # clitic test alone gave `voltar-se` three sentences about `voltar`: `se` is
    # both the third-person clitic and the conjunction `if`, so `se voltaria`
    # reads as proclisis and is "if I would return".  Nothing structural can
    # tell those apart -- only the English can -- so a reflexive whose base verb
    # is at all common gets a keyword.
    'tornar-se':    ('become', 'became', 'becomes', 'turn into', 'turned into'),
    'calar-se':     ('quiet', 'silent', 'shut up', 'stop talking'),
    'mexer-se':     ('move', 'moved', 'moving'),
    'dedicar-se':   ('devote', 'devoted', 'dedicate', 'dedicated'),
    'esquecer-se':  ('forget', 'forgot', 'forgotten'),
    'recordar-se':  ('remember', 'recall', 'remembered'),
    'demorar-se':   ('long', 'late', 'delay', 'delayed'),
    'atrasar-se':   ('late', 'delay', 'delayed', 'behind'),
    'adiantar-se':  ('early', 'ahead', 'fast'),
    'voltar-se':    ('turn', 'turned', 'turns'),
    'virar-se':     ('turn', 'turned', 'turns'),
    'casar-se':     ('marry', 'married', 'marries', 'wedding'),
    'divorciar-se': ('divorce', 'divorced'),
    'separar-se':   ('separat', 'split up', 'broke up', 'break up'),
    'juntar-se':    ('join', 'joined', 'together'),
    'molhar-se':    ('wet',),
    'secar-se':     ('dry', 'dried', 'dries'),
    'pentear-se':   ('comb', 'combed', 'hair'),
    'maquilhar-se': ('make-up', 'makeup', 'made up'),
    'divertir-se':  ('fun', 'enjoy', 'enjoyed', 'good time', 'amuse'),
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
