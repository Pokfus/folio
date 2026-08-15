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
the level being built names it, so a reflexive cannot arrive early.  **Adding a
level means reading its inventory for `-se` verbs and glossing the ones it
introduces, and NOTHING WARNS**: a reflexive with no gloss is not offered, the
deck builds cleanly at exactly its target, and the level simply does not teach a
word its own inventory names.  A2 names thirty-two, of which four are absent
below; B1 names fifty-six, of which twenty-five are.

WHAT THE TWO TESTS THROW AWAY, since at B1 they throw away nearly half.  It must
be a HEADWORD -- eleven of B1's fifty-six are inflected forms lifted out of the
Referencial's own example sentences -- and it must be a DIFFERENT WORD from its
base.  `ir-se` and `vir-se` are named only inside `ir-se/vir-se embora`, where
the unit a learner needs is the whole phrase; `ver-se`, `dizer-se`,
`escrever-se`, `ouvir-se`, `poder-se` and `rir-se` mean what their base verbs
mean with a pronoun on them, which is the test in the paragraph above and the
reason this file is not simply every `-se` string in the source.

ADDING A GLOSS CAN CHANGE A LEVEL THAT HAS ALREADY SHIPPED, so check before
writing one: a key is offered wherever the level's own inventory names it, and
this table is shared.  None of B1's thirty-one appears in the A1 or A2
candidate lists -- measured before they were added, not assumed.

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

    # B1, where the reflexives stop being a handful and become a class: its
    # inventory names FIFTY-SIX `-se` strings against A2's thirty-two, and the
    # thirty-one below are what is left after the two tests this file already
    # applies.  Neither is new; what is new is how much they now throw away.
    #   · IT MUST BE A HEADWORD.  Eleven of the fifty-six are inflected forms
    #     lifted out of the Referencial's own example sentences -- `escreve-se`,
    #     `pode-se`, `sente-se`, `importava-se`, `formaram-se`, `recusando-se`
    #     and the bare `-se` itself -- and `is_reflexive_ok` refuses them
    #     anyway, their base being no infinitive.  They are not glossed here.
    #   · IT MUST BE A DIFFERENT WORD FROM ITS BASE.  `escrever-se`, `ouvir-se`
    #     and `poder-se` are the IMPERSONAL `se` (`como se escreve?`, `ouve-se
    #     bem`, `pode-se fumar?`) -- a construction rather than a verb, and one
    #     the base verb's own card already teaches.  `rir-se` fails the same
    #     test from the other side: it is the ordinary European form of `rir`
    #     and means exactly what `rir` means.
    'acalmar-se':    ['to calm down'],                      # B1 Noções
    'afastar-se':    ['to move away, to go away'],          # B1 Noções
    'alimentar-se':  ['to eat, to feed oneself'],           # B1 Noções
    'aproximar-se':  ['to approach, to get closer'],        # B1 Noções
    'assustar-se':   ['to get frightened, to be startled'],  # B1 Funções
    'avariar-se':    ['to break down, to stop working'],    # B1 Noções
    'cansar-se':     ['to get tired'],                      # B1 Noções
    'cortar-se':     ['to cut oneself'],                    # B1 Noções
    'descontrair-se': ['to relax, to unwind'],              # B1 Noções
    'desculpar-se':  ['to apologise'],                      # B1 Noções
    'despedir-se':   ['to say goodbye; to resign'],         # B1 Noções
    'encontrar-se':  ['to meet; to be located'],            # B1 Noções, Funções
    'enganar-se':    ['to be mistaken, to make a mistake'],  # B1 Noções
    'ferir-se':      ['to hurt oneself, to get injured'],   # B1 Noções
    'importar-se':   ['to mind, to care'],                  # B1 Funções
    'inscrever-se':  ['to enrol, to sign up'],              # B1 Noções
    'interessar-se': ['to take an interest'],               # B1 Funções
    'irritar-se':    ["to get annoyed, to lose one's temper"],  # B1 Funções
    'localizar-se':  ['to be located'],                     # B1 Noções
    'magoar-se':     ['to hurt oneself, to get hurt'],      # B1 Funções
    'manter-se':     ['to stay, to remain'],                # B1 Noções
    'mover-se':      ['to move'],                           # B1 Noções
    'mudar-se':      ['to move house'],                     # B1 Noções
    'parecer-se':    ['to look like, to resemble'],         # B1 Noções
    'partir-se':     ['to break, to snap'],                 # B1 Noções
    'passar-se':     ['to happen, to go on'],               # B1 Noções, Funções
    'perguntar-se':  ['to wonder'],                         # B1 Noções
    'queimar-se':    ['to burn oneself'],                   # B1 Noções
    'reformar-se':   ['to retire'],                         # B1 Noções
    'situar-se':     ['to be situated, to be located'],     # B1 Noções, Funções
    'transformar-se': ['to turn into, to become'],          # B1 Noções

    # B2, which names SEVENTY-EIGHT `-se` strings and yields forty-one.  The
    # two tests below throw away the rest, and at this level the second one has
    # a third family in it, so all three are worth naming:
    #   · not a HEADWORD -- twenty-two inflected forms out of the Referencial's
    #     own examples (`chama-se`, `vende-se`, `levantou-se`, `verificou-se`)
    #   · the IMPERSONAL `se` -- `usar-se`, `esperar-se`, `deve-se`, which is a
    #     construction the base verb's card already teaches
    #   · BOUND TO A PHRASE -- `dever-se` occurs only ever as `dever-se a`, so
    #     the bare verb is a headword the inventory does not have.  `ir-se
    #     embora` is the same case at A2.
    # `rir-se` is refused here as it was at B1, being what `rir` already means,
    # and `parece-se` is the inflected form of a B1 entry rather than a new one.
    #
    # THE CAUSATIVE/INCHOATIVE PAIRS ARE IN, and they are most of the gain:
    # `esvaziar` empties something and `esvaziar-se` empties, `manchar` stains
    # and `manchar-se` gets stained.  That is a different word by this file's
    # own test and it is how B1's `avariar-se`, `partir-se` and `transformar-se`
    # were already read, so the reading is consistent rather than new.
    'adaptar-se':     ['to adapt, to fit in'],              # B2 Noções
    'alojar-se':      ['to stay, to lodge'],                # B2 Noções
    'aperceber-se':   ['to realise, to notice'],            # B2 Noções
    'apressar-se':    ['to hurry, to rush'],                # B2 Noções
    'apropriar-se':   ['to appropriate, to take possession of'],  # B2 Noções
    'comprometer-se': ['to commit oneself, to undertake'],  # B2 Funções
    'converter-se':   ['to convert, to turn into'],         # B2 Noções
    'dar-se':         ['to get on with someone'],           # B2 Noções
    'desenvolver-se': ['to develop, to grow'],              # B2 Noções
    'despistar-se':   ['to run off the road, to crash'],    # B2 Noções
    'destinar-se':    ['to be intended for'],               # B2 Noções, Funções
    'diferenciar-se': ['to differ, to be different'],       # B2 Funções
    'dirigir-se':     ['to head for; to address someone'],  # B2 Noções, Funções
    'distanciar-se':  ['to distance oneself, to move away'],  # B2 Noções
    'distinguir-se':  ['to stand out, to distinguish oneself'],  # B2 Funções
    'embebedar-se':   ['to get drunk'],                     # B2 Noções
    'encher-se':      ['to fill up'],                       # B2 Noções
    'entreter-se':    ['to amuse oneself, to pass the time'],  # B2 Noções
    'enxugar-se':     ['to dry oneself'],                   # B2 Noções
    'esconder-se':    ['to hide'],                          # B2 Noções
    'esgotar-se':     ['to run out, to sell out'],          # B2 Noções
    'estabilizar-se': ['to stabilise, to level off'],       # B2 Noções
    'esvaziar-se':    ['to empty, to drain'],               # B2 Noções
    'extraviar-se':   ['to get lost, to go astray'],        # B2 Noções
    'fartar-se':      ['to get fed up; to have one’s fill'],  # B2 Funções
    # `fazer-se entender` and `fazer-se sócio de um clube` are the two the
    # Referencial writes out, and they are the two senses
    'fazer-se':       ['to become; to make oneself understood'],  # B2 Noções, Funções
    'formar-se':      ['to graduate; to form, to take shape'],  # B2 Noções
    'iniciar-se':     ['to begin, to start'],               # B2 Noções
    'inundar-se':     ['to flood'],                         # B2 Noções
    'manchar-se':     ['to get stained'],                   # B2 Noções
    'orgulhar-se':    ['to be proud'],                      # B2 Funções
    # listed beside `contagiar, transmitir, apanhar`, which is what settles it
    'pegar-se':       ['to be catching, to spread'],        # B2 Noções
    'pesar-se':       ['to weigh oneself'],                 # B2 Noções
    'prolongar-se':   ['to go on, to last'],                # B2 Noções
    'pôr-se':         ['to set (of the sun); to start doing'],  # B2 Noções
    'questionar-se':  ['to wonder, to question oneself'],   # B2 Noções
    'referir-se':     ['to refer to'],                      # B2 Noções
    'sair-se':        ['to do well or badly at something'],  # B2 Noções
    'sujeitar-se':    ['to submit, to put up with'],        # B2 Funções
    'tranquilizar-se': ['to calm down, to set one’s mind at rest'],  # B2 Noções
    'vacinar-se':      ['to get vaccinated'],               # B2 Noções

    # C1, which names forty-five and yields nineteen -- the lowest share yet,
    # because by this level most of what the Referencial repeats has been taught
    # below and what is left of its `-se` strings is mostly quotation.  Sixteen
    # are inflected forms out of its examples (`conclui-se`, `registou-se`,
    # `fizera-se`), `dizer-se` and `usa-se` are the impersonal, and `segurar-se`
    # is refused for a reason worth naming because it is the first of its kind:
    # it occurs ONLY inside an example sentence in the Gramática section -- `Ele
    # ia caindo, mas conseguiu segurar-se!` -- so it is a word the document uses
    # rather than a word it lists, which is the test `BLOCK` in select.py
    # applies to `situar` and `realizar`.
    'adequar-se':     ['to suit, to be appropriate'],       # C1 Noções
    'ajustar-se':     ['to adjust, to fit'],                # C1 Noções
    'arrepender-se':  ['to regret, to be sorry'],           # C1 Funções
    'ausentar-se':    ['to go away, to be absent'],         # C1 Noções
    'deformar-se':    ['to warp, to lose its shape'],       # C1 Noções
    'deslocar-se':    ['to travel, to get about'],          # C1 Noções
    'desorientar-se': ['to lose one’s bearings'],           # C1 Noções
    'distrair-se':    ['to get distracted; to take one’s mind off things'],  # C1 Noções
    'encaminhar-se':  ['to head for, to make one’s way'],   # C1 Noções
    'equivocar-se':   ['to be mistaken'],                   # C1 Noções
    'espalhar-se':    ['to spread, to scatter'],            # C1 Noções
    'extinguir-se':   ['to die out, to become extinct'],    # C1 Noções
    'mostrar-se':     ['to prove to be, to appear'],        # C1 Funções
    'obrigar-se':     ['to undertake, to bind oneself'],    # C1 Funções
    'oferecer-se':    ['to volunteer, to offer to'],        # C1 Funções
    'opor-se':        ['to oppose, to object'],             # C1 Noções, Funções
    'orientar-se':    ['to find one’s bearings'],           # C1 Noções
    'originar-se':    ['to originate, to arise'],           # C1 Noções
    'resignar-se':    ['to resign oneself'],                # C1 Funções
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
    # B1
    'acalmar-se':    ('calm',),
    'afastar-se':    ('away', 'apart', 'distance'),
    'alimentar-se':  ('eat', 'ate', 'feed', 'fed', 'diet'),
    'aproximar-se':  ('approach', 'closer', 'nearer', 'coming up'),
    'assustar-se':   ('frighten', 'scared', 'startled', 'afraid'),
    'avariar-se':    ('break down', 'broke down', 'broken down', 'out of order'),
    'cansar-se':     ('tired', 'tire', 'weary'),
    'cortar-se':     ('cut',),
    'descontrair-se': ('relax', 'unwind'),
    'desculpar-se':  ('apolog', 'sorry', 'excuse'),
    'despedir-se':   ('goodbye', 'good-bye', 'farewell', 'resign', 'quit'),
    'encontrar-se':  ('meet', 'met', 'located', 'situated'),
    'enganar-se':    ('mistaken', 'mistake', 'wrong'),
    'ferir-se':      ('hurt', 'injur', 'wound'),
    'importar-se':   ('mind', 'care'),
    'inscrever-se':  ('enrol', 'sign up', 'signed up', 'register'),
    'interessar-se': ('interest',),
    'irritar-se':    ('annoy', 'irritat', 'angry', 'mad', 'temper'),
    'localizar-se':  ('locat', 'situated'),
    'magoar-se':     ('hurt', 'get hurt'),
    'manter-se':     ('stay', 'stayed', 'remain', 'keep', 'kept'),
    'mover-se':      ('move', 'moved', 'moving'),
    'mudar-se':      ('move', 'moved', 'moving'),
    'parecer-se':    ('look like', 'looks like', 'resemble', 'similar', 'alike'),
    'partir-se':     ('break', 'broke', 'broken', 'snap'),
    'passar-se':     ('happen', 'going on', 'matter', 'wrong'),
    'perguntar-se':  ('wonder',),
    'queimar-se':    ('burn', 'burnt', 'burned'),
    'reformar-se':   ('retire', 'retired', 'retirement'),
    'situar-se':     ('situated', 'locat'),
    'transformar-se': ('turn into', 'turned into', 'become', 'became',
                       'transform'),
    # B2
    'adaptar-se':     ('adapt', 'adjust', 'fit in', 'used to'),
    'alojar-se':      ('stay', 'stayed', 'lodge', 'accommodat'),
    'aperceber-se':   ('realis', 'realiz', 'notice', 'aware'),
    'apressar-se':    ('hurry', 'hurried', 'rush', 'haste'),
    'apropriar-se':   ('appropriat', 'took possession', 'take possession',
                       'seiz'),
    'comprometer-se': ('commit', 'promis', 'undert', 'pledge'),
    'converter-se':   ('convert', 'turn into', 'turned into', 'became'),
    'dar-se':         ('get along', 'gets along', 'got along', 'get on with',
                       'gets on with', 'got on with'),
    'desenvolver-se': ('develop', 'grow', 'grew', 'grown'),
    'despistar-se':   ('off the road', 'crash', 'skid'),
    'destinar-se':    ('intended', 'meant for', 'destined'),
    'diferenciar-se': ('differ', 'different', 'distinguish'),
    'dirigir-se':     ('head', 'went to', 'go to', 'address', 'made his way',
                       'made her way'),
    'distanciar-se':  ('distance', 'away', 'apart'),
    'distinguir-se':  ('stand out', 'stood out', 'distinguish'),
    'embebedar-se':   ('drunk', 'drink', 'drank', 'intoxicat'),
    'encher-se':      ('fill', 'filled', 'full'),
    'entreter-se':    ('amuse', 'entertain', 'pass the time', 'occupied'),
    'enxugar-se':     ('dry', 'dried', 'towel'),
    'esconder-se':    ('hid', 'hide', 'hiding'),
    'esgotar-se':     ('run out', 'ran out', 'sold out', 'sell out',
                       'exhaust'),
    'estabilizar-se': ('stabilis', 'stabiliz', 'level off', 'levelled off',
                       'steady'),
    'esvaziar-se':    ('empt', 'drain'),
    'extraviar-se':   ('lost', 'astray', 'mislaid', 'missing'),
    'fartar-se':      ('fed up', 'sick of', 'tired of', 'had enough'),
    'fazer-se':       ('become', 'became', 'understood', 'make myself',
                       'make himself', 'make herself'),
    'formar-se':      ('graduat', 'form', 'formed'),
    'iniciar-se':     ('begin', 'began', 'begun', 'start'),
    'inundar-se':     ('flood',),
    'manchar-se':     ('stain', 'stained'),
    'orgulhar-se':    ('proud', 'pride'),
    'pegar-se':       ('catching', 'contagious', 'spread', 'infectious'),
    'pesar-se':       ('weigh', 'weighed'),
    'prolongar-se':   ('last', 'lasted', 'go on', 'went on', 'drag on',
                       'prolong'),
    'pôr-se':         ('set', 'sets', 'setting', 'sunset', 'began to',
                       'started to'),
    'questionar-se':  ('wonder', 'question'),
    'referir-se':     ('refer', 'referring', 'referred'),
    'sair-se':        ('did well', 'do well', 'does well', 'did badly',
                       'turned out'),
    'sujeitar-se':    ('submit', 'put up with', 'subject'),
    'tranquilizar-se': ('calm', 'relax', 'reassur'),
    'vacinar-se':     ('vaccinat', 'vaccine', 'immunis', 'immuniz',
                       'get a shot'),
    # C1
    'adequar-se':     ('suit', 'suited', 'appropriate', 'adapt'),
    'ajustar-se':     ('adjust', 'fit', 'fitted'),
    'arrepender-se':  ('regret', 'sorry', 'repent'),
    'ausentar-se':    ('away', 'absent', 'left'),
    'deformar-se':    ('warp', 'deform', 'shape', 'bent'),
    'deslocar-se':    ('travel', 'get around', 'gets around', 'got around',
                       'move', 'commut'),
    'desorientar-se': ('lost', 'disorient', 'bearings', 'confus'),
    'distrair-se':    ('distract', 'mind off', 'amuse'),
    'encaminhar-se':  ('head', 'made his way', 'made her way', 'went towards',
                       'walked towards'),
    'equivocar-se':   ('mistaken', 'mistake', 'wrong'),
    'espalhar-se':    ('spread', 'scatter'),
    'extinguir-se':   ('extinct', 'die out', 'died out', 'disappear'),
    'mostrar-se':     ('proved', 'prove to be', 'appeared', 'seemed',
                       'showed himself', 'showed herself'),
    'obrigar-se':     ('undert', 'bound', 'oblig', 'commit'),
    'oferecer-se':    ('volunteer', 'offer', 'offered'),
    'opor-se':        ('oppose', 'opposed', 'object', 'against'),
    'orientar-se':    ('bearings', 'orient', 'find his way', 'find her way'),
    'originar-se':    ('originat', 'arise', 'arose', 'come from', 'came from'),
    'resignar-se':    ('resign', 'accept', 'put up with'),
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
