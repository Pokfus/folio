#!/usr/bin/env python3
"""The hand-written inventory of each level's topics -- Folio's own list.

Hindi has no published graded word list (see `hindi_level.py`), so a level's
CORE is written here, a topic at a time, for the scope its CEFR descriptor
sets; `select.py` resolves every word against Wiktionary (a word not found
there is reported and dropped, never invented a meaning) and tops the level
up with the commonest remaining words.

A word may carry a part of speech after a colon (`खाना:verb`) where the
spelling is shared and the level wants one reading first; without one, the
word's entries are all kept and the commonest reading leads the card.
Spellings are Wiktionary's headwords; matching is through `hi.fold`, so a
nukta or a chandrabindu written either way still resolves.
"""

A1 = [
    ('pronouns', 'मैं तुम आप वह यह हम वे ये तू मेरा तुम्हारा आपका उसका इसका हमारा उनका अपना'),
    ('questions', 'क्या कौन कहाँ कब क्यों कैसे कितना कौनसा किधर'),
    ('postpositions', 'का को से में पर ने तक के_लिए के_साथ के_बाद के_पास के_बिना के_सामने के_पीछे के_ऊपर के_नीचे के_बाहर अंदर पहले'),
    ('conjunctions and particles', 'और या लेकिन पर कि तो भी ही नहीं न मत हाँ जी अगर क्योंकि इसलिए'),
    ('greetings and politeness', 'नमस्ते धन्यवाद शुक्रिया माफ़ी कृपया स्वागत अलविदा ठीक अच्छा'),
    ('numbers', 'एक दो तीन चार पाँच छह सात आठ नौ दस ग्यारह बारह बीस पचास सौ हज़ार पहला दूसरा तीसरा आधा'),
    ('time', 'समय:noun वक़्त घंटा मिनट दिन रात सुबह शाम दोपहर आज कल परसों अभी हफ़्ता महीना साल बजे जल्दी देर हमेशा कभी'),
    ('days', 'सोमवार मंगलवार बुधवार गुरुवार शुक्रवार शनिवार रविवार'),
    ('family', 'परिवार माँ पिता भाई बहन बेटा बेटी पति पत्नी दादा दादी नाना नानी चाचा बच्चा लड़का लड़की आदमी औरत दोस्त'),
    ('people and yourself', 'नाम उम्र देश शहर गाँव भाषा हिंदी अंग्रेज़ी काम छात्र अध्यापक डॉक्टर लोग'),
    ('food and drink', 'खाना:noun पानी चाय दूध कॉफ़ी रोटी चावल दाल सब्ज़ी फल आम केला सेब अंडा मांस मछली नमक चीनी मिठाई नाश्ता'),
    ('shopping and money', 'पैसा रुपया दाम दुकान बाज़ार सस्ता महँगा ख़रीदना बेचना देना लेना'),
    ('the home', 'घर कमरा दरवाज़ा खिड़की मेज़ कुर्सी बिस्तर रसोई किताब कलम फ़ोन चाबी'),
    ('the town and getting about', 'सड़क रास्ता गाड़ी बस ट्रेन टिकट स्टेशन होटल अस्पताल स्कूल दफ़्तर बैंक दायाँ बायाँ दूर पास सीधा'),
    ('the body and feeling ill', 'सिर आँख कान नाक मुँह हाथ पैर पेट दाँत बीमार दर्द दवा बुख़ार'),
    ('weather', 'मौसम गर्मी सर्दी बारिश धूप हवा ठंडा गरम'),
    ('colours', 'रंग लाल नीला पीला हरा काला सफ़ेद'),
    ('describing', 'बड़ा छोटा नया पुराना सुंदर बुरा ख़ुश लंबा मोटा आसान मुश्किल ज़्यादा कम बहुत सब कुछ कोई'),
    ('everyday verbs', 'होना करना जाना आना खाना:verb पीना सोना:verb उठना बैठना देखना सुनना बोलना कहना पढ़ना लिखना समझना जानना चाहना सकना रहना चलना मिलना रुकना खोलना बंद पूछना बताना सोचना'),
]

INVENTORY = {'a1': A1}
