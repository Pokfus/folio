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

A2 IS SCOPED TO THE CEFR A2 DESCRIPTOR, looked up the same way (2026-11-16).
The ordinals A1's fill left out are here.  English Wiktionary has none of the
twelve traditional Yoruba months (Ṣẹ́rẹ́, Èrèlè ... Ọ̀pẹ̀; it files Agẹmọ only as
"chameleon"), so the months are not taught.  Nor these, which A2 would have:
ìtìjú "shame", bínú "to be angry", ronú "to think hard", yàn "to choose", tẹ̀lé
"to follow", dúpẹ́ "to thank", kún "to be full", ṣófo "to be empty", yàtọ̀ "to be
different", wúlò "to be useful", òtòṣì "poor person", ọlọ́gbọ́n "wise person",
ìjì "storm", mànàmáná "lightning", òtútù "cold", ẹ̀rùn "the dry season", awakọ̀
"driver", nọ́ọ̀sì "nurse", akọ̀wé "clerk", hòtẹ́ẹ̀lì "hotel", tíkẹ́ẹ̀tì "ticket",
rédíò "radio", Ọlọ́run "God", Kìrìsìtẹ́nì "Christian", bíbélì "Bible", lẹ́ẹ̀kan
"once", kíákíá "quickly", díẹ̀díẹ̀ "slowly", ṣáájú "before", àfi "except",
pàápàá "especially".  Left out for their glosses: ayélujára (filed first as a
colonial coin, not "the internet"), ìmọ̀ràn ("understanding of facts", not
"advice"); ìbà is "praise" there, and fever is ibà, which the fill deals.

B1 IS BUILT THE OTHER WAY ROUND (2026-11-16).  Most of a B1 topic list written
first is not in English Wiktionary (government, law, health and work: ìdìbò,
ààrẹ, adájọ́, ẹ̀sùn, ìtọ́jú, ìwádìí, àbájáde, ètò, ìyípadà ... none has an
entry), and the frequency fill alone reaches 1,000 words, down to a count of
one.  So the B1 inventory was read off the Wiktionary words the fill does NOT
reach: about 170 everyday words and compounds (household things, trades,
schooling, machines, health, time words) that the encyclopaedia rarely writes,
and that push out the fill's noisiest tail.
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
    'a2': [
        ('numbers and order',
         'kẹrin karùn-ún kẹfà keje kẹjọ kẹsàn-án kẹwàá ìdajì'),
        ('time of day and meals',
         'ìrọ̀lẹ́ kùtùkùtù oúnjẹ_àárọ̀ oúnjẹ_ọ̀sán oúnjẹ_alẹ́ aago láìpẹ́'),
        ('directions and places',
         'òsì ọ̀tún ẹ̀gbẹ́ pópó òpópónà afárá ààlà òkèèrè olú-ìlú ìjọba_ìbílẹ̀ àgbàlá ṣọ́ọ̀bù '
         'ilé-ìkàwé ilé_ẹjọ́'),
        ('clothes and things worn',
         'bùbá ìró:noun gèlè agbádá aṣọ_òkè ẹ̀gbà:noun òrùka ìlẹ̀kẹ̀ sálúbàtà'),
        ('work and jobs',
         'ọlọ́pàá agbẹjọ́rò alágbẹ̀dẹ onídìrí ọ̀mọ̀wé oníṣègùn gbẹ́nàgbẹ́nà télọ̀ ahunṣọ ọ̀gá '
         'owó_oṣù kíláàsì'),
        ('relatives and the stages of life',
         'ìyá_ìyá àna ìbejì àgbàlagbà opó ìsìnkú ìbí ọ̀gbẹ́ni oyún'),
        ('feelings',
         'ayọ̀ ìbànújẹ́ ìbínú ẹ̀rù:noun ìrètí àníyàn yọ̀:verb bẹ̀rù sunkún rẹ́rìn-ín ẹ̀rín ẹkún'),
        ('travel and visiting',
         'ìrìn_àjò àlejò takisí ọ̀kadà òfuurufú ìsinmi'),
        ('the countryside and the weather',
         'ọ̀dàn adágún òkìtì ihò erékùṣù aṣálẹ̀ ìkùukùu àrá ẹ̀fúùfù ìrì rọ̀:verb irin'),
        ('the body and health',
         'ikọ́ ọ̀fun ẹ̀dọ̀ ikùn egungun awọ ẹ̀dọ̀fóró ìfun ọmú èékánná àtàǹpàkò orúnkún '
         'ìgbọ̀nwọ́ èjìká ẹ̀rẹ̀kẹ́ ètè'),
        ('food and the kitchen',
         'ìyẹ̀fun ẹ̀fọ́ àlùbọ́sà tòmátì ẹ̀pà ànàmọ́ ẹ̀gẹ́ oyin òróró ewébẹ̀ àkàrà ọkà ìṣáná '
         'ọpọ́n ìgò ife àpò:noun agbọ̀n:noun ìgbálẹ̀ ọṣẹ'),
        ('the things of a home',
         'ògiri òrùlé dígí ẹ̀rọ_amóhùnmáwòrán ẹ̀rọ_ìbánisọ̀rọ̀ fìtílà àpótí ìrọ̀rí abẹ́rẹ́ okùn '
         'fọ́tò'),
        ('talking, learning and deciding',
         'ìdáhùn ìbéèrè òtítọ́ irọ́ ìlérí àlàyé gbólóhùn òwe àlọ́:noun ewì ìwé_ìròyìn ẹjọ́ '
         'olè rò:verb ránṣẹ́'),
        ('the everyday verbs of doing',
         'dá_dúró gé gún fà dì:verb jẹun bọ́ bọ̀ dìde dùbúlẹ̀ sinmi fò:verb jà sún_mọ́ '
         'gbẹ:verb jìnnà dọ̀tí pọ́n:verb'),
        ('describing people',
         'olówó aláìní ọlọ́rọ̀ ọ̀lẹ aláàánú'),
        ('the feasts and the faith',
         'ìjọ àdúrà gbàdúrà Kérésìmesì àjọ̀dún ìgbàgbọ́ Mùsùlùmí àlùfáà òrìṣà Ifá ààwẹ̀ '
         'àgbélébùú ọpẹ́ ijó ìlù'),
        ('little words',
         'bóyá àyàfi kódà'),
    ],
    'b1': [
        ('time and how often',
         'ọjọ́_iwájú ayé_àtijọ́ lóde_òní níjẹta lọ́tùn-ún-la àfẹ̀mọ́júmọ́ ìyálẹ̀ta ààjìn láràárọ̀ '
         'lọ́sọ̀ọ̀sán lẹ́sẹ̀kẹ́sẹ̀ ìdata ìdarin ìdámárùn-ún'),
        ('family and people',
         'ọmọ_ẹgbẹ́ ọmọ_ọ̀dọ̀ bàbá_bàbá bàbá_ìyá onísùúrù asùnta kólékólé'),
        ('work and trades',
         'kọ́lékọ́lé apòògùn ayafọ́tò akólẹ́tà oníbàtà rẹfirí dókítà_eyín tẹpá_mọ́ṣẹ́ '
         'owó_ìfẹ̀yìntì háyà'),
        ('school and knowledge',
         'ilé-ìwé_alákọ̀ọ́bẹ̀rẹ̀ ilé-ìwé_girama ọmọ_ilé_ìwé iṣẹ́_àmúrelé ìmọ̀_sáyẹ́ǹsì '
         'onímọ̀_ìjìnlẹ̀ ìmọ̀_ìṣirò ìmọ̀_ìṣègùn ìmọ̀_ètò_ọrọ̀-ajé ìmọ̀_ẹ̀rọ ẹ̀ka_èdè '
         'àkànlò_èdè báírò yíǹkì ṣọ́ọ̀kì àpòòwé féèlì ṣẹ̀dà'),
        ('machines and the media',
         'ẹ̀rọ_ayélujára ẹ̀rọ_ìtẹ̀wé ẹ̀rọ_ìṣírò ẹ̀rọ_amúlétutù ẹ̀rọ_amúnáwá ẹ̀rọ_amóhuntutù '
         'ẹ̀rọ_ìfọṣọ ẹ̀rọ_ìránṣọ jẹnẹrétọ̀ makirofóònù tẹ̀_jáde'),
        ('the home and the kitchen',
         'ibalùwẹ̀ síńkì kẹ́tùrù korobá tíréè àléré amúga kítípa aburadà pọtimáńtò ṣọ́bìrì '
         'gọ́tà owó_omi epo_pupa'),
        ('food and drink',
         'àkàrà_òyìnbó ṣokoléètì áísìkiriìmù ṣingọ́ọ̀mù wàràkàṣì yúgọ́ọ̀tì èso_àjàrà kajú apálá '
         'ayù ẹja_àrọ̀'),
        ('the body and health',
         'irun_ojú ìkasẹ̀ èyìnjìjà àtọ̀gbẹ ẹ̀jẹ̀_ríru àrùn_gágá báńdéèjì áńbúláǹsì kálòlò '
         'súkè sẹ́n'),
        ('animals and the wild',
         'àkéekèe ìbakasíẹ ògòǹgò àgbébọ̀ èrukùkù èèrà wùkúwùkú ìkòrikò ìlábùrù akika '
         'ìjàkárìwọ̀ ilé_ẹyẹ igbó_kìjikìji òwúsúwusù'),
        ('travel and the world',
         'ọkọ̀_òfuurufú pápákọ̀_òfuurufú òkè_òkun àgọ́_ọlọ́pàá epo_rọ̀bì àyípadà_ojú-ọjọ́ '
         'ilé_ìkóhun-ìṣẹ̀ǹbáyé-sí wẹdò lọọlé jápa'),
        ('society and rights',
         'ẹ̀tọ́_ọmọnìyàn ogun_abẹ́lé ọ̀run_àpáàdì èdè_àìyedè ọ̀rọ̀_ẹ̀yìn wọ́de rẹ́jẹ ṣàwáwí'),
        ('doing and thinking',
         'pọ̀_sí_i dá_padà dá_mọ̀ tì_lẹ́yìn yà_lẹ́nu pọkàn_pọ̀ gbọ́kàn_lé tànmọ́ọ̀ '
         'ìfọ̀rọ̀wérò burẹ́wà eré_ìdárayá ọwọ́_òsì ọwọ́_ọ̀tún'),
    ],
}
