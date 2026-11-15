#!/usr/bin/env python3
"""The hand-written topic inventory of each Amharic level.

Each level is a list of (topic, words): space-separated headwords in the Ethiopic
script as English Wiktionary files them (a verb by its third-person perfective,
ሄደ "to go", Wiktionary's lemma), `_` for a space, and `:pos` where the word has
entries of several parts of speech and only one is meant.  The match is by KEY
(`am.key`), so a spelling with another of the homophone letters (ሀ ሐ ኀ, ሰ ሠ,
አ ዐ, ጸ ፀ) finds the same word.  A word not in Wiktionary is reported by
select.py and dropped -- never invented, never glossed by hand.

A1 IS SCOPED TO THE CEFR A1 DESCRIPTOR (`amharic_level.SCOPE`).  Every word
below was looked up in the extract before it was written here.  A verb with no
page of its own but an infinitive page glossed "to ..." is taught by that
infinitive (መምጣት "to come", ማወቅ "to know", መስጠት "to give").

WHAT A1 WOULD HAVE AND ENGLISH WIKTIONARY HAS NOT GOT (2026-11-15), so the deck
cannot teach it: አዎ "yes", አይ "no", እና "and", ግን "but", ለምን "why", ስንት
"how many", እዚህ / እዚያ "here / there", ምክንያቱም "because", the prepositions
written onto a word (በ- "in", ከ- "from", ለ- "for", ወደ "to"), ሄደ / መሄድ "to go",
ትምህርት "lesson, education", ትምህርት ቤት "school", ልጃገረድ "girl",
ቁልፍ "key", አውቶቡስ "bus", ባቡር "train", ቀኝ "right", ቅርብ "near", የለም "there is
not", ተቀመጠ "to sit down", ተመለሰ "to return", አገኘ "to find", አመጣ "to bring",
መድኃኒት "medicine" (filed only as "saviour, healer"), ጠራ "to call" (filed only as
"to be clear"), ተኛ "to sleep", ሰጠ "to give", መጣ "to come" (taught by their infinitives).

A2 IS SCOPED TO THE CEFR A2 DESCRIPTOR, looked up the same way (2026-11-15).
The months of the Ethiopian calendar, held back from A1's fill as a set, are
here -- eleven of the thirteen: English Wiktionary has no ጥቅምት (the second)
and no ጳጉሜ (the short thirteenth).  Nor these, which A2 would have: በጋ "the
dry season", ምሥራቅ "east", ኮት "coat", ካልሲ "sock", ሹፌር "driver", ነርስ "nurse",
ሽማግሌ "old man", አሮጊት "old woman", ሰርግ "wedding", ተስፋ "hope", ሀዘን
"sorrow", ጥማት "thirst", ሳቅ "laughter", ሆቴል "hotel", ትኬት "ticket", አድራሻ
"address", ጣቢያ "station", ብስክሌት "bicycle", ሜዳ "field", ትኩሳት "fever",
ቁስል "wound", ሳህን "plate", ብርጭቆ "glass", ማንኪያ "spoon", ምሳ "lunch", እራት
"dinner", ሳጥን "box", መብራት "lamp", ሬዲዮ "radio", ቴሌቪዥን "television",
ዩኒቨርሲቲ "university", ቢሮ "office", በዓል "holiday", ላከ "to send", ተቀበለ "to
receive", ለበሰ "to dress", ነቃ "to wake", ተራመደ "to walk", ሀብታም "rich", ጠንካራ
"strong", ንጹሕ "clean".  Left out for their glosses: ኬላ (filed as "station", a
checkpoint), ዝቅተኛ (filed only as "inferior"), ቡን (a second word for coffee,
which A1 teaches as ቡና); of the three words for forest, ደን is taught.
"""

INVENTORY = {
    'a1': [
        ('greetings and politeness',
         'ሰላም እባክህ ይቅርታ ደህና ምስጋና'),
        ('people and the family',
         'ሰው ወንድ ሴት ልጅ ሕፃን እናት አባት ወንድም እህት ባል ሚስት ቤተሰብ ጓደኛ ስም '
         'ሴት_ልጅ አያት ጎረቤት ነገር'),
        ('the pronouns and pointing words',
         'እኔ አንተ አንቺ እሱ እሷ እኛ እናንተ እነሱ እርስዎ እሳቸው ይህ ይህች ያ እነዚህ'),
        ('question words',
         'ምን ማን የት መቼ እንዴት የትኛው ምንድን'),
        ('the joining words',
         'ወይም ጋር ላይ ውስጥ ብቻ ሁሉ ሁሉም በጣም'),
        ('numbers',
         'ዜሮ አንድ ሁለት ሦስት አራት አምስት ስድስት ሰባት ስምንት ዘጠኝ ዐሥር ሀያ ሠላሳ መቶ ሺ '
         'አንደኛ ሁለተኛ'),
        ('time and the days of the week',
         'ጊዜ ሰዓት ደቂቃ ቀን ሌሊት ጧት ምሽት ሳምንት ወር ዓመት ዛሬ ነገ ትናንት አሁን ገና '
         'ሰኞ ማክሰኞ ረቡዕ ሐሙስ ዓርብ ቅዳሜ እሑድ'),
        ('food and drink',
         'ምግብ ዳቦ እንጀራ ውሃ ወተት ቡና ሻይ ሥጋ ዶሮ እንቁላል ዓሣ ፍራፍሬ ሙዝ ብርቱካን ድንች '
         'ሽንኩርት ጨው ስኳር ማር ወጥ ጠላ:noun'),
        ('money and shopping',
         'ገንዘብ ብር ዋጋ ገበያ ሱቅ ውድ'),
        ('the home',
         'ቤት ክፍል በር መስኮት አልጋ ጠረጴዛ ወንበር ግድግዳ'),
        ('the town and getting about',
         'ከተማ አገር መንደር መንገድ መኪና አውሮፕላን ሆስፒታል ደብር ሩቅ ግራ'),
        ('the body and feeling ill',
         'ራስ ዓይን ጆሮ አፍንጫ አፍ ጥርስ እጅ እግር ልብ ፀጉር ደም ሆድ ሰውነት በሽታ ሕመም ሐኪም'),
        ('the weather and the world',
         'ዝናብ ፀሐይ ጨረቃ ኮከብ ነፋስ አየር ሰማይ ደመና ሙቀት ወንዝ ባሕር ተራራ ዛፍ አበባ'),
        ('colours',
         'ቀይ ነጭ ጥቁር አረንጓዴ ብጫ ሰማያዊ ቀለም'),
        ('animals',
         'ውሻ ድመት ላም በሬ ፈረስ በግ ፍየል አህያ ወፍ አንበሳ ግመል'),
        ('school and work',
         'መምህር አስተማሪ ተማሪ መጽሐፍ ወረቀት ደብዳቤ ሥራ ገበሬ ቋንቋ አማርኛ ቃል ፊደል'),
        ('describing things',
         'ትልቅ ትንሽ ጥሩ መጥፎ አዲስ አሮጌ ረጂም አጭር ብዙ ጥቂት ቆንጆ ቀዝቃዛ ሙቅ ጣፋጭ '
         'ቀላል ከባድ ደስተኛ'),
        ('the everyday verbs',
         'ነው አይደለም አለ ሆነ መምጣት በላ ጠጣ መተኛት አየ ሰማ ተናገረ ማወቅ ፈለገ መስጠት '
         'ወሰደ ማድረግ ሠራ ነበረ መቆም ሮጠ ከፈተ ዘጋ አነበበ ጻፈ ገዛ መሸጥ ከፈለ ተማረ አስተማረ '
         'ኖረ ሞተ ወደደ ጠየቀ ደረሰ ገባ ወጣ ወረደ አሰበ ረዳ ጀመረ ጨረሰ ጠበቀ '
         'መጫወት ሳቀ ማልቀስ ዘፈነ ማጠብ አበሰለ ተረዳ'),
    ],
    'a2': [
        ('the months of the Ethiopian calendar and the seasons',
         'መስከረም ኅዳር ታህሳስ ጥር የካቲት መጋቢት ሚያዝያ ግንቦት ሰኔ ሐምሌ ነሐሴ ክረምት'),
        ('clothes',
         'ልብስ ሸሚዝ ቀሚስ ሱሪ ጫማ ቆብ ቀበቶ ጨርቅ'),
        ('work and jobs',
         'ሠራተኛ ነጋዴ ቄስ ካህን ዳኛ ጠበቃ ዶክተር ደመወዝ ክፍያ ፈተና'),
        ('relatives and the stages of life',
         'አጎት አክስት የልጅ_ልጅ ጋብቻ ሙሽራ ጎልማሳ'),
        ('feelings',
         'ደስታ ፍርሃት ፈራ ቁጣ አዘነ ራብ'),
        ('travel and getting about',
         'ተጓዘ ጉዞ ድልድይ ካርታ ጀልባ በረረ'),
        ('the countryside and the weather',
         'ገጠር ደን በረሃ ኮረብታ ሸለቆ አፈር ሣር በረዶ መብረቅ ድንጋይ'),
        ('the body and health',
         'ጤና ታመመ ወባ ጡት ከንፈር'),
        ('food and the kitchen',
         'ቍርስ መጠጥ ቅቤ ዘይት ዱቄት እህል ገብስ ስንዴ ጤፍ በቆሎ ሩዝ ጎመን ቲማቲም ሎሚ አይብ ጠጅ '
         'ድስት ቢላዋ ጽዋ ሸክላ ፈላ'),
        ('the things of a home and of the post',
         'ቦርሳ ጎጆ ስልክ ጋዜጣ ፖስታ ኮምፒውተር'),
        ('talking and deciding',
         'መናገር ተነጋገረ ማዳመጥ ወሰነ መረጠ ጣረ'),
        ('the everyday verbs of doing',
         'ተጠቀመ አነሣ ገነባ ወረወረ ሰበረ ቆረጠ ዘራ ጎዳ ዘገየ ገበየ'),
        ('describing things',
         'ፈጣን ድሀ ደካማ ቆሻሻ ርጥብ ደረቅ ባዶ መራራ አስቀያሚ ወፍራም ቀጭን ጠባብ ጥልቅ ወጣት'),
        ('feasts and faith',
         'ፋሲካ መስቀል ጾም ጸሎት መስጊድ ቅዳሴ'),
    ],
}
