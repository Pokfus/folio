#!/usr/bin/env python3
"""What each reflexive verb MEANS, and how to recognise it in a translation.

Two problems share one table.

Wiktionary files a reflexive as a form of its base verb and gives it no meaning
of its own -- `sentarse` is "infinitive of sentar combined with se" -- so the
gloss on the card has to be written here or the card carries no meaning at all.

And a reflexive's FORMS are its base verb's, so a sentence cannot be matched on
the form alone: every `llamarse` example came back as `llamar` "to phone".
Requiring an agreeing clitic fixes most of it, but not where the base verb takes
a dative in the same shape ("me llamará por teléfono") or where two verbs share
a form -- `sentarse` and `sentirse` both make "me siento", which is either "I
sit down" or "I feel".  The aligned English settles it, and the words that do
the settling are the gloss's own.

A reflexive with no entry here still works: it keeps the agreement test and
loses the English one.  `build_deck` and `examples` both say so on every run, so
a level that introduces new reflexives announces them rather than shipping a
card whose meaning reads "infinitive of ... combined with se".
"""

# word: (meaning shown on the card, English words that identify it in a translation)
REFLEXIVES = {
    # A1
    'llamarse':    ('to be called, to be named',        ('name', 'called')),
    'levantarse':  ('to get up, to stand up',           ('get up', 'gets up', 'got up', 'getting up',
                                                         'rise', 'rose', 'stand up', 'stood up')),
    'ducharse':    ('to have a shower, to shower',      ('shower',)),
    'lavarse':     ('to wash (oneself)',                ('wash', 'brush')),
    'bañarse':     ('to have a bath, to bathe',         ('bath', 'swim', 'swam')),
    'despertarse': ('to wake up',                       ('wake', 'woke', 'awake')),
    'dedicarse':   ('to work as, to devote oneself to', ('devote', 'dedicat', 'for a living', 'do you do')),
    # A2
    'quejarse':    ('to complain',                      ('complain',)),
    'irse':        ('to leave, to go away',             ('leave', 'left', 'leaving', 'go away',
                                                         'went away', 'goes away', 'gone')),
    'quedarse':    ('to stay, to remain',               ('stay', 'stayed', 'staying', 'remain')),
    'casarse':     ('to get married',                   ('marry', 'married', 'marriage', 'wedding')),
    'ponerse':     ('to put on (clothes); to become',   ('put on', 'puts on', 'putting on', 'wear',
                                                         'wore', 'became', 'become', 'becomes', 'got')),
    'preocuparse': ('to worry',                         ('worry', 'worried', 'worrying')),
    'sentarse':    ('to sit down',                      ('sit', 'sat', 'seat')),
    'sentirse':    ('to feel (a certain way)',          ('feel', 'felt', 'feeling')),
    'moverse':     ('to move (oneself)',                ('move', 'moved', 'moving')),
    'reunirse':    ('to meet, to gather',               ('meet', 'met', 'meeting', 'gather')),
    'divertirse':  ('to enjoy oneself, to have fun',    ('fun', 'enjoy', 'enjoyed', 'amuse',
                                                         'good time')),
    'encontrarse': ('to meet; to feel; to be located',  ('meet', 'met', 'feel', 'felt',
                                                         'located', 'situated')),
    'acostarse':   ('to go to bed, to lie down',        ('bed', 'lie down', 'lay down', 'lying down')),
    'quitarse':    ('to take off (clothes)',            ('take off', 'takes off', 'took off',
                                                         'taking off', 'remove')),
    'vestirse':    ('to get dressed',                   ('dress', 'dressed', 'dressing')),
    'despedirse':  ('to say goodbye',                   ('goodbye', 'good-bye', 'farewell',
                                                         'see you', 'say bye')),
    'caerse':      ('to fall down, to fall over',       ('fall', 'fell', 'fallen', 'falling')),
    'cambiarse':   ('to change (clothes); to move house', ('change', 'changed', 'changing', 'moved')),
    'separarse':   ('to separate, to split up',         ('separate', 'separated', 'split')),
    'divorciarse': ('to get divorced',                  ('divorce', 'divorced')),
    'parecerse':   ('to look alike, to resemble',       ('look like', 'looks like', 'looked like',
                                                         'resemble', 'alike', 'similar')),
    'afeitarse':   ('to shave',                         ('shave', 'shaved', 'shaving')),
    'enfadarse':   ('to get angry',                     ('angry', 'anger', 'mad at', 'annoyed', 'cross with')),
    'probarse':    ('to try on',                        ('try on', 'tries on', 'tried on', 'trying on')),
    'acordarse':   ('to remember',                      ('remember', 'remembered', 'recall')),
    'alegrarse':   ('to be glad, to cheer up',          ('glad', 'happy', 'pleased', 'cheer', 'delighted')),
    'aburrirse':   ('to get bored',                     ('bored', 'boring', 'boredom')),
    'cansarse':    ('to get tired',                     ('tired', 'tire', 'exhausted', 'worn out')),
    'peinarse':    ('to comb one’s hair',          ('comb', 'hair')),
    'cepillarse':  ('to brush (one’s teeth or hair)', ('brush', 'teeth', 'hair')),
    'apellidarse': ('to have as a surname',             ('surname', 'last name', 'family name')),
}

GLOSS = {k: [v[0]] for k, v in REFLEXIVES.items()}
KEYWORDS = {k: v[1] for k, v in REFLEXIVES.items()}


def report_missing(words, where):
    """Name any reflexive this table does not cover, on every run."""
    miss = [w for w in words
            if w.endswith(('arse', 'erse', 'irse')) and w not in REFLEXIVES]
    if miss:
        print(f'    !! {where}: {len(miss)} reflexive(s) with no authored entry '
              f'-- they lose the English check and their meaning: {", ".join(sorted(miss))}')
    return miss
