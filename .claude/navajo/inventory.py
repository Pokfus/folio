#!/usr/bin/env python3
"""The hand-written topic inventory of each Navajo level.

Each level is a list of (topic, words): space-separated headwords as English
Wiktionary files them, `_` for a space, and `:pos` where the word has entries of
several parts of speech and only one is meant.  A word not in Wiktionary is
reported by select.py and dropped -- never invented.  A word Wiktionary has only
as a FORM of another (`shimá` "my mother") resolves to that word (`amá`).

A1 IS SCOPED TO THE CEFR A1 DESCRIPTOR (`navajo_level.SCOPE`).  Every word below
was looked up in the extract before it was written here (2026-11-16).

HOW NAVAJO FILES ITS WORDS, which the list follows:
  · A NOUN for a body part or a relative cannot stand alone: it is always
    somebody's.  Wiktionary files it under the "indefinite" a- form (`amá`
    "mother", `ajáád` "leg"), and the card prints its "my" and "his/her" forms
    (`shimá`, `bimá`).
  · A VERB is filed in the third person of the imperfective, so its English is
    "he/she is eating it" (`yiyą́`), and the card prints its "I" form where
    Wiktionary gives one.  A COLOUR or a size is a verb too (`łigai` "it is white").
  · A POSTPOSITION is filed in the third person (`bił` "with him/her"); "with me"
    is `shił`.

What A1 would have and the source does NOT (2026-11-16): a written-out "Navajo"
people name (Naabeehó), "English language" (Bilagáana bizaad), "to write", "to
learn", "to come", "window" (Wiktionary's tsésǫʼ is "mica").
"""

INVENTORY = {
    'a1': [
        ('greetings and politeness',
         'yáʼátʼééh:intj ahéheeʼ aooʼ dooda hágoóneeʼ tʼáá_shǫǫdí'),
        ('pronouns and pointing words',
         'shí ni:pron bí nihí daabí éí díí nléí ńléí kodi áadi ákǫ́ǫ́'),
        ('question words',
         'háí haʼátʼíí háadi háágóó háádę́ę́ʼ hádą́ą́ʼ haash díkwíí daʼ'),
        ('introducing yourself',
         'wolyé diné diné_bizaad bilagáana dóoneʼé kéyah saad naatʼáanii'),
        ('people and the family',
         'hastiin asdzą́ą́ asdzání ashkii atʼééd awééʼ áłchíní amá azhéʼé acheii amásání '
         'análí atsilí adeezhí hádí achʼooní akʼéí dinééh:noun chʼikę́ę́h'),
        ('numbers',
         'łáaʼii naaki tááʼ dį́į́ʼ ashdlaʼ hastą́ą́ tsostsʼid tseebíí náhástʼéí neeznáá naadiin '
         'neeznádiin mííl'),
        ('time and how often',
         'kʼad díí_jį́ yiską́o adą́ą́dą́ą́ʼ abínígo jį́ tłʼééʼ nááhai óola:noun damóo hai shį́ dą '
         'aakʼeed haigo shį́įgo ałkʼidą́ą́ʼ łahda łeh tʼáá_íídą́ą́ʼ '
         'tʼáá_ákwíí_jį́ tłʼéédą́ą́ʼ jį́įgo hoolʼáágóó tʼah:particle tʼahdii:adv nááná dííshjį́'),
        ('how: manner and amount',
         'tsį́įłgo hah tąądee hazhóʼó nizhónígo yáʼátʼéehgo tʼóó_ahayóí tsʼídá haʼátʼéego'),
        ('food and drink',
         'chʼiyáán bááh atsįʼ abeʼ gohwééh tó naadą́ą́ʼ naaʼołí nímasii ayęęzhii áshįįh '
         'áshįįh_łikan bilasáana dzidzétsoh taʼneeskʼání łeesʼáán atooʼ chʼil'),
        ('animals',
         'łééchąąʼí mósí łį́į́ʼ béégashii dibé tłʼízí naaʼahóóhai gah mąʼii shash tsídii łóóʼ '
         'tłʼiish chʼosh bįįh tązhii atsá'),
        ('the home and the town',
         'hooghan kin dáádílkał tsáskʼeh bikááʼ_adání óltaʼ atiin chidí kin_shijaaʼ kintah '
         'béeso naalyéhé_bá_hooghan chʼiyáán_bá_hooghan naaltsoos azeeʼálʼį́ azeeʼííłʼíní '
         'báʼóltaʼí ółtaʼí'),
        ('the body and feeling ill',
         'atsiiʼ atsiitsʼiin aniiʼ anááʼ ajaaʼ áchį́į́h azééʼ awooʼ akʼos awos gaan álaʼ akeeʼ ajáád '
         'abid atsʼíís dił azeeʼ diniih daatsaah'),
        ('the weather and the land',
         'níłtsą́ yas níłchʼi shá:noun ooljééʼ sǫʼ yá:noun kʼos kǫʼ deesdoi sikʼaz hoozdo dził tooh tsin '
         'tsé séí tłʼoh nahasdzáán'),
        ('clothes and things in the home',
         'ééʼ chʼah tłʼaakał tłʼaajįʼééʼ éétsoh ásaaʼ łeetsʼaaʼ bééshʼadeeʼ béésh_biiʼ_kǫʼí '
         'níłchʼi_naalkidí biłńjoobałí'),
        ('directions and places',
         'haʼaʼaahjí shádiʼááhjí eʼeʼaahjí náhookǫsjí áhání tónteel beʼekʼid tsintah ałnííʼ'),
        ('colours',
         'łigai łizhin łichííʼ dootłʼizh łitso łibá dibéłchíʼí łitsxo'),
        ('describing words',
         'nizhóní yáʼátʼééh:verb nitsaa áłtsʼíísí nineez łikan yázhí:adj ayóo hózhǫ́ ániid sání '
         'sido'),
        ('the everyday verbs',
         'yáłtiʼ naaghá yigááł yighááh yiyą́ yidlą́ ałhosh naalnish ółtaʼ yółtaʼ ííłʼį́ sidá '
         'yooʼį́ yinízin nízin naané hataał:verb nayiiłniih haniih ní:verb hólǫ́ átʼé ádin:verb '
         'ákótʼé naʼnitin:verb yicha yiłtʼees yidiitsʼaʼ adiitsʼaʼ hiná kééhatʼį́ sizį́ '
         'yíkááh yíghááh hainitá jiní hágo'),
        ('postpositions, particles and linking words',
         'bił:postp bee baa bá biih biyiʼ bikááʼ:postp yah tʼáá doo da dóó áádóó ndi háálá '
         'índa ałdóʼ łaʼ tʼáá_ałtso azhą́ lá bikʼeh:postp'),
    ],
}
