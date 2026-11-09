#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Tamil has no published graded word list for learners (see `tamil_level.py`),
so a level's CORE is written here, a topic at a time, for the scope its CEFR
descriptor sets; `select.py` resolves every word against Wiktionary (a word not
found there is reported and dropped, never given an invented meaning) and tops
the level up with the commonest remaining words.

A word may carry parts of speech after a colon (`நீ:pron`, `சரி:intj+noun`):
the card then shows ONLY those, in that order.  Tamil is full of homographs a
beginner's card should not offer -- `நீ` "you" and "to forsake", `கை` "hand"
and "to be bitter", `வரை` "until" and "to draw" -- so the inventory names the
reading it means wherever the spelling is shared.  Spellings are
Wiktionary's headwords: a VERB is cited, as Wiktionary and the Madras Tamil
Lexicon cite it, by its stem, which is also its plain imperative (`போ` "go!",
`சாப்பிடு` "eat!").  An underscore joins a multi-word entry.
"""

A1 = [
    ('pronouns', 'நான்:pron நீ:pron நீங்கள் அவன் அவள் அவர் அது இது:pron நாம் நாங்கள் அவர்கள் இவர் அவை:pron என்:pron உன் உங்கள் எங்கள் நம்'),
    ('questions', 'என்ன யார் எங்கே எப்போது ஏன் எப்படி எவ்வளவு எந்த எத்தனை'),
    ('postpositions and place', 'மேலே கீழே முன்:postp பின்:postp முன்னால் பின்னால் உள்ளே வெளியே பக்கத்தில் அருகில் வரை:postp கூட பற்றி:postp இங்கே அங்கே'),
    ('conjunctions and particles', 'மற்றும் ஆனால் அல்லது இல்லை ஆமாம் ஆம்:intj+particle சரி:intj+noun தான் மட்டும் ஏனென்றால் அதனால்:adv என்றால்'),
    ('greetings and politeness', 'வணக்கம் நன்றி தயவுசெய்து மன்னிப்பு பரவாயில்லை நல்லது'),
    ('numbers', 'ஒன்று:num இரண்டு:num மூன்று நான்கு ஐந்து ஆறு:num ஏழு எட்டு:num ஒன்பது:num பத்து:num இருபது ஐம்பது நூறு ஆயிரம் முதல்:adj பாதி:noun'),
    ('time', 'நேரம் மணி நிமிடம் நாள் இரவு:noun காலை மாலை மதியம் இன்று நேற்று நாளை இப்போது வாரம் மாதம் வருடம் சீக்கிரம் எப்போதும்'),
    ('days', 'ஞாயிறு திங்கள் செவ்வாய் புதன் வியாழன் வெள்ளி சனி:noun கிழமை'),
    ('family', 'குடும்பம் அம்மா அப்பா தாய் தந்தை அண்ணன் அக்கா தம்பி தங்கை மகன் மகள் கணவன் மனைவி தாத்தா பாட்டி குழந்தை பையன் பெண் ஆண் நண்பன்'),
    ('people and yourself', 'பெயர்:noun வயது நாடு:noun ஊர்:noun நகரம் கிராமம் மொழி:noun தமிழ்:name+adj ஆங்கிலம் இந்தியா வேலை மாணவன் ஆசிரியர் மருத்துவர் மக்கள்'),
    ('food and drink', 'சாப்பாடு உணவு தண்ணீர் தேநீர் பால் காபி சோறு அரிசி இட்லி தோசை பழம் வாழைப்பழம் மாம்பழம் முட்டை இறைச்சி மீன் உப்பு:noun சர்க்கரை காய்கறி'),
    ('shopping and money', 'பணம் ரூபாய் விலை கடை:noun சந்தை வாங்கு:verb வில்:verb'),
    ('the home', 'வீடு அறை:noun கதவு ஜன்னல் மேசை நாற்காலி படுக்கை சமையலறை புத்தகம் பேனா தொலைபேசி சாவி'),
    ('the town and getting about', 'தெரு சாலை வழி:noun கார் பேருந்து ரயில் சீட்டு நிலையம் விடுதி மருத்துவமனை பள்ளி அலுவலகம் வங்கி வலது இடது தூரம் பக்கம் நேரே'),
    ('the body and feeling ill', 'உடல் தலை:noun கண் காது:noun மூக்கு வாய்:noun கை:noun கால் வயிறு பல் வலி:noun மருந்து காய்ச்சல் நோய்'),
    ('weather', 'வானிலை மழை வெயில் காற்று குளிர்:noun+verb சூடு:noun வெப்பம்'),
    ('colours', 'நிறம் சிவப்பு நீலம் மஞ்சள் பச்சை கருப்பு வெள்ளை'),
    ('describing', 'பெரிய சிறிய புதிய பழைய அழகு நல்ல கெட்ட மகிழ்ச்சி நீண்ட எளிது கஷ்டம் நிறைய கொஞ்சம் மிகவும் எல்லாம் ஏதோ'),
    ('everyday verbs', 'இரு:verb செய்:verb போ வா சாப்பிடு குடி:verb தூங்கு எழு உட்கார் பார்:verb கேள் பேசு சொல்:verb படி:verb எழுது புரி தெரி வேண்டு முடி:verb வாழ்:verb நட நில் கொடு:verb எடு திற மூடு:verb நினை விரும்பு'),
]

INVENTORY = {'a1': A1}
