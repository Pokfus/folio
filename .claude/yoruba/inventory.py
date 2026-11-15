#!/usr/bin/env python3
"""The hand-written topic inventory of each Yoruba level.

Each level is a list of (topic, words): space-separated headwords WITH THEIR
TONES, as English Wiktionary's headword line gives them (lọ "to go", lọ̀ "to
grind" are two words), `_` for a space, and `:pos` where the spelling has entries
of several parts of speech and the card should lead with one.  The match is by
the toned spelling, then through a Wiktionary pointer (jọ̀ọ́ -> jọ̀wọ́ "please").
A word not in Wiktionary is reported by select.py and dropped -- never invented,
never glossed by hand (the Zulu and Amharic rule).

A1 IS SCOPED TO THE CEFR A1 DESCRIPTOR (`yoruba_level.SCOPE`).  Every word below
was looked up in the extract before it was written here.

WHAT A1 WOULD HAVE AND ENGLISH WIKTIONARY HAS NOT GOT (2026-11-15), so the deck
cannot teach it: ta ni "who", ibo "where" (níbo is taught), nígbà wo "when",
èló "how much", nísinsìnyí "now", ibẹ̀ / níbí / níbẹ̀ "there / here", tún
"again", má "do not", burú "to be bad", lẹ́wà "to be beautiful" (rẹwà is
taught), rọrùn "to be easy", dáhùn "to answer", ọmọbìnrin / ọmọkùnrin "daughter
/ son", ìyá àgbà / bàbá àgbà "grandmother / grandfather", ehín "tooth", òtútù
"cold", ilé ìdáná "kitchen", ọkọ̀ òfurufú "aeroplane", the greetings with ẹ kú
(ẹ kú àárọ̀ ...), and the language's own name, Yorùbá, which Wiktionary files as
a proper name.
"""

INVENTORY = {
    'a1': [
        ('greetings and politeness',
         'bẹ́ẹ̀_ni rárá:particle ẹ_ṣeun o_ṣé jọ̀wọ́ ó_dàbọ̀ káàbọ̀ dákun ṣé'),
        ('the pronouns',
         'mo mi:pron o:pron ó a:pron ẹ:pron wọ́n:pron èmi ìwọ òun àwa ẹ̀yin àwọn:pron '
         'rẹ̀ wa wọn rẹ yín'),
        ('question words and joining words',
         'kí_ni báwo mélòó èwo níbo àti:conj sì ṣùgbọ́n tàbí nítorí pé bí tí kí'),
        ('numbers',
         'ọ̀kan:num méjì mẹ́ta mẹ́rin márùn-ún mẹ́fà méje mẹ́jọ mẹ́sàn-án mẹ́wàá ogún:num '
         'ọgbọ̀n ogójì àádọ́ta ọgọ́rùn-ún:num ẹgbẹ̀rún'),
        ('people and the family',
         'bàbá ìyá ọmọ:noun ẹ̀gbọ́n àbúrò ọkọ ìyàwó aya ẹbí ìdílé ọ̀rẹ́ ènìyàn ọkùnrin obìnrin '
         'ọmọdé àgbà'),
        ('the body and feeling ill',
         'orí:noun ojú etí imú ẹnu ọwọ́ ẹsẹ̀ ara:noun irun ọrùn inú ẹ̀yìn:noun ọkàn ẹ̀jẹ̀ àìsàn '
         'dókítà oògùn ilé-ìwòsàn'),
        ('time and the days of the week',
         'ọjọ́ ọ̀sẹ̀ oṣù ọdún àkókò wákàtí ìṣẹ́jú òní ọ̀la àná ìgbà àárọ̀ ọ̀sán alẹ́ òru lónìí '
         'ọjọ́_àìkú ọjọ́_ajé ọjọ́_ìṣẹ́gun ọjọ́rú ọjọ́bọ̀ ọjọ́_ẹtì ọjọ́_àbámẹ́ta'),
        ('food and drink',
         'oúnjẹ omi ẹran ẹja ẹyin ìrẹsì iṣu ẹ̀wà búrẹ́dì ata iyọ̀ epo ọbẹ̀ èso ọsàn ọ̀gẹ̀dẹ̀ '
         'wàrà tíì kọfí ọtí àmàlà ẹ̀bà adìẹ àgbàdo ṣúgà iyán'),
        ('money and shopping',
         'owó ọjà rà:verb tà náírà san'),
        ('the home and clothes',
         'ilé yàrá ilẹ̀kùn fèrèsé àga tábìlì ibùsùn ìkòkò àwo ṣíbí ọ̀bẹ aṣọ bàtà fìlà ẹ̀wù '
         'ṣòkòtò kọ́kọ́rọ́'),
        ('the town and getting about',
         'ìlú ọ̀nà ọkọ̀ ọkọ̀_ayọ́kẹ́lẹ́ ọkọ̀_ojú_irin kẹ̀kẹ́ ilé-ìwé ilé_ìfowópamọ́ ṣọ́ọ̀ṣì '
         'mọ́ṣáláṣí abúlé odò òkun igbó òkè'),
        ('the weather and the world about us',
         'ojú_ọjọ́ òjò oòrùn afẹ́fẹ́ ọ̀run òṣùpá ìràwọ̀ igi òdòdó ewé iná ilẹ̀ òkúta'),
        ('colours',
         'àwọ̀ funfun:adj dúdú:adj pupa búlúù'),
        ('animals',
         'ajá ológbò ẹṣin màlúù ewúrẹ́ àgùtàn ẹyẹ ejò kìnìún erin ọ̀bọ eku ẹlẹ́dẹ̀'),
        ('school and work',
         'olùkọ́ akẹ́kọ̀ọ́ ìwé ẹ̀kọ́ iṣẹ́ òṣìṣẹ́ àgbẹ̀ oníṣòwò kọ̀ǹpútà fóònù lẹ́tà èdè'),
        ('the everyday verbs',
         'lọ wá:verb jẹ mu sùn jí rí:verb gbọ́ sọ ṣe ní:verb jẹ́ wà fẹ́ mọ̀ fún:verb mú gbé kà '
         'kọ kọ́ dúró jókòó rìn sáré wọlé jáde padà ṣí tì wẹ̀ fọ̀ sè gbàgbé rántí fẹ́ràn '
         'bẹ̀rẹ̀ parí pè béèrè kọrin jó ṣeré sọ̀rọ̀ wò wọ̀ kú gbà fi ṣiṣẹ́ lò ràn_lọ́wọ́ dé'),
        ('describing things',
         'dára tóbi kéré ńlá kékeré:adj gùn kúrú ga gbóná tutù tuntun:adj àtijọ́ rẹwà wúwo '
         'fúyẹ́ dùn korò púpọ̀ díẹ̀ ṣòro'),
        ('little words of place and manner',
         'ibí gan-an pẹ̀lú láti sí:prep nínú lórí lábẹ́ lẹ́gbẹ̀ẹ́ níwájú lẹ́yìn:prep kò:particle máa ń '
         'yóò ti:particle tẹ́lẹ̀ bẹ́ẹ̀ yìí náà èyí ìyẹn gbogbo nǹkan ohun kan mìíràn'),
    ],
}
