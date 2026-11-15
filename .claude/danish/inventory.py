#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

No graded Danish word list was found published (see `danish_level.py`), so a
level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never invented a meaning) and tops the
level up with the commonest remaining words.

A word may carry a part of speech after a colon (`en:article`) where the
spelling is shared and the level wants one reading first.  An underscore joins
a two-word entry (`i_dag`).  Spellings are Wiktionary's headwords: a verb by
its infinitive (`spise`), a noun in the indefinite singular (a plural-only noun
in the plural: `penge`), an adjective in its common-gender form.  Where
Wiktionary heads a word under a form a learner does not meet first, the
learner's word is written and `select.ALIAS` names the headword (`mange`,
filed under `mangen`).

Only A1 is written so far (2026-11-15); A2 to C1 are the plan's later phases.
"""

A1 = [
    ('pronouns', 'jeg du han:pron hun:pron den:pron det:pron vi I de:pron man:pron mig dig ham:pron hende os jer dem sig '
                 'min:pron din vores jeres deres sin:pron'),
    ('articles', 'en:article'),
    ('questions', 'hvad hvem hvor hvornår hvorfor hvordan hvilken'),
    ('prepositions and place words', 'i på til:prep fra med uden for:prep af:prep om:prep under over efter før hos '
                                     'ved:prep mellem foran bag:prep hjem hjemme her der ude inde op ned ud ind '
                                     'væk nær'),
    ('conjunctions and little words', 'og eller men:conj at som:pron fordi så ikke ja nej jo også bare '
                                      'meget lidt måske altid aldrig tit ofte igen nu:adv snart '
                                      'allerede'),
    ('greetings and politeness', 'hej farvel tak undskyld godmorgen godnat goddag velkommen værsgo'),
    ('numbers', 'nul to tre fire fem seks syv otte ni ti elleve tolv tyve tredive fyrre hundrede '
                'tusind første anden tredje halv'),
    ('time', 'tid time minut dag nat morgen aften eftermiddag i_dag i_morgen i_går uge måned år '
             'ur klokke tidlig sen:adj'),
    ('days', 'mandag tirsdag onsdag torsdag fredag lørdag søndag'),
    ('months', 'januar februar marts april maj juni juli august september oktober november '
               'december'),
    ('family', 'familie mor far bror søster søn datter kvinde kone mand barn dreng pige mormor '
               'farmor morfar farfar ven veninde baby forældre'),
    ('people and yourself', 'navn alder land by sprog dansk engelsk arbejde:noun job elev '
                            'studerende lærer læge menneske person'),
    ('food and drink', 'mad vand kaffe te mælk brød vin øl ost kød fisk æg frugt æble appelsin '
                       'tomat sukker salt:noun morgenmad frokost aftensmad kartoffel ris smør is'),
    ('shopping and money', 'penge krone pris butik forretning købe sælge betale koste billig dyr:adj'),
    ('the home', 'hus lejlighed værelse dør vindue bord stol seng køkken badeværelse toilet bog '
                 'kuglepen telefon nøgle'),
    ('the town and getting about', 'gade vej bil bus tog taxa billet station hotel hospital '
                                   'skole kontor bank højre venstre lufthavn hav '
                                   'restaurant apotek cykel'),
    ('the body and feeling ill', 'hoved øje øre næse mund hånd arm ben fod mave tand syg rask '
                                 'medicin feber'),
    ('weather', 'vejr varm kold regn sol vind:noun sne regne'),
    ('colours', 'farve rød blå gul grøn sort hvid brun'),
    ('describing', 'stor lille ny gammel ung fin god dårlig glad ked lang kort let svær:adj mange '
                   'alle hver ingenting træt sulten'),
    ('everyday verbs', 'være have:verb gøre gå komme spise:verb drikke sove vågne sidde se høre snakke '
                       'tale:verb sige læse skrive forstå vide kunne ville skulle måtte:verb få:verb bo:verb '
                       'hedde synes åbne lukke spørge svare tænke elske arbejde:verb lære kigge '
                       'lytte tage give køre rejse:verb hjælpe:verb finde'),
]

INVENTORY = {'a1': A1}
