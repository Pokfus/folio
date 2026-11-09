#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Telugu has no published graded word list (see `telugu_level.py`), so a level's
CORE is written here, a topic at a time, for the scope its CEFR descriptor
sets; `select.py` resolves every word against Wiktionary (a word not found
there is reported and dropped, never invented a meaning) and tops the level
up with the commonest remaining words.

A word may carry a part of speech after a colon (`మంచి:adj`) where the
spelling is shared and the level wants one reading first.  Spellings are
Wiktionary's headwords -- a verb by its citation form in -ు (`తిను`, `చేయు`),
the form a Telugu dictionary lists it under; matching is through `te.fold`, so
a noun's -ము or -ం written either way still resolves.  An underscore joins a
multi-word entry.
"""

A1 = [
    ('pronouns', 'ఈ ఆ నేను నువ్వు నీవు మీరు అతను ఆమె అది ఇది మేము మనము వారు అవి ఇవి నా నీ మీ మా మన తన ఆయన'),
    ('questions', 'ఏమి ఏమిటి ఎవరు ఎక్కడ ఎప్పుడు ఎందుకు ఎలా ఎంత ఏది'),
    ('postpositions and case words', 'తో కోసం గురించి మీద దగ్గర:adv వద్ద తర్వాత ముందు వెనుక పైన కింద లోపల బయట'),
    ('conjunctions and particles', 'మరియు లేదా అని కూడా మాత్రము అవును కాదు లేదు సరే ఎందుకంటే అయితే ఇంకా'),
    ('greetings and politeness', 'నమస్కారం ధన్యవాదాలు దయచేసి క్షమించు స్వాగతం బాగు మంచి:adj'),
    ('numbers', 'ఒకటి రెండు మూడు నాలుగు ఐదు ఆరు ఏడు ఎనిమిది తొమ్మిది పది ఇరవై యాభై వంద వెయ్యి మొదటి రెండవ సగం ఒక'),
    ('time', 'సమయం గంట నిమిషం రోజు రాత్రి ఉదయం సాయంత్రం మధ్యాహ్నం ఈరోజు నేడు నిన్న రేపు ఇప్పుడు వారం నెల సంవత్సరం ఎల్లప్పుడు ఎప్పుడూ త్వరగా ఆలస్యం'),
    ('days', 'సోమవారం మంగళవారం బుధవారం గురువారం శుక్రవారం శనివారం ఆదివారం'),
    ('family', 'కుటుంబం అమ్మ తల్లి నాన్న తండ్రి అన్న తమ్ముడు అక్క చెల్లెలు కొడుకు కూతురు భర్త భార్య తాత అమ్మమ్మ నాయనమ్మ బిడ్డ పిల్లవాడు అబ్బాయి అమ్మాయి మనిషి మగవాడు ఆడది స్నేహితుడు'),
    ('people and yourself', 'పేరు వయసు దేశం ఊరు నగరం గ్రామం భాష తెలుగు పని విద్యార్థి ఉపాధ్యాయుడు ప్రజలు'),
    ('food and drink', 'అన్నం నీరు టీ కాఫీ పాలు పప్పు కూర పండు మామిడి అరటి గుడ్డు మాంసం చేప ఉప్పు:noun చక్కెర పంచదార భోజనం టిఫిను తీపి:adj కారం'),
    ('shopping and money', 'డబ్బు రూపాయి ధర అంగడి దుకాణం బజారు చౌక ఖరీదు కొను అమ్ము ఇచ్చు తీసుకొను'),
    ('the home', 'ఇల్లు గది తలుపు కిటికీ బల్ల కుర్చీ మంచం వంటగది పుస్తకం కలం తాళం'),
    ('the town and getting about', 'దారి రోడ్డు వీధి బండి బస్సు రైలు ఆసుపత్రి బడి పాఠశాల కార్యాలయం బ్యాంకు కుడి ఎడమ దూరం తిన్నగా'),
    ('the body and feeling ill', 'తల కన్ను చెవి ముక్కు నోరు చేయి కాలు కడుపు పన్ను జబ్బు నొప్పి మందు జ్వరం'),
    ('weather', 'వాతావరణం ఎండ వాన వర్షం గాలి చలి వేడి వేసవి'),
    ('colours', 'రంగు ఎరుపు నీలం పసుపు ఆకుపచ్చ నలుపు తెలుపు ఎర్రని'),
    ('describing', 'పెద్ద చిన్న కొత్త పాత అందమైన చెడ్డ సంతోషం పొడవైన లావు సులభం కష్టం ఎక్కువ తక్కువ చాలా అన్ని కొంచెం ఏదో ఎవరో'),
    ('everyday verbs', 'ఉండు చేయు వెళ్లు వచ్చు తిను తాగు నిద్రపోవు లేచు కూర్చొను చూడు విను మాట్లాడు చెప్పు చదువు:verb రాయు అర్థం తెలుసుకొను కావాలి కోరు ఉండిపోవు నడుచు ఆగు తెరచు మూయు అడుగు:verb ఆలోచించు ఇష్టం'),
]

INVENTORY = {'a1': A1}
