#!/usr/bin/env python3
"""Folio's own glosses, for the core Somali words English Wiktionary does not have.

English Wiktionary holds about 1,000 usable Somali words (the kaikki.org
extraction, Nov 2026), the fewest of any language on the shelf, and among the
words it lacks are some of the commonest in the language: `tag` "go", `lacag`
"money", `hadda` "now", `berri` "tomorrow", `laakiin` "but", `badan` "many",
`kale` "other".  A beginner's deck without them is not a beginner's deck, so
the owner chose (2026-11-16, "a few core words hand-glossed") to gloss them by
hand and say so: this file is that hand, the Hausa arrangement.  Every meaning
here is the standard one a Somali course or dictionary gives; nothing is dealt
from it but what the inventory (`inventory.py`) names.

A HAND ENTRY CARRIES NO TONE LINE.  The card's accented second line is
Wiktionary's and nothing else -- an accent typed here from memory would be a
claim with no source -- so a hand-glossed word shows the ordinary spelling alone.
A hand entry gives a noun's GENDER only, never a plural: the gender is fixed by
the definite article every text shows (lacagta, qolka), while a plural typed
from memory could be a variant.

A row is `word: [(part of speech, 'gloss; gloss'[, gender]), ...]`; glosses are
separated by `;`.  Where Wiktionary HAS the word but files the common reading
under another spelling (`badhan` for badan), the hand row is the spelling the
Somali Wikipedia writes.
"""

HAND = {   # A1
    # yes, no, greetings
    'maya': [('particle', 'no')],
    'salaan': [('noun', 'greeting', 'f')],
    # WIKTIONARY HAS THE WORD, BUT NOT ITS EVERYDAY SENSE: the hand row leads; with
    # `build_deck.HAND_ONLY`, Wiktionary's entry is not shown at all (its sense is wrong
    # for the word, not merely rarer)
    'mar': [('noun', 'time, occasion; once')],                 # Wiktionary: only the verb "pass by"
    'maalin': [('noun', 'day', 'f')],                          # Wiktionary: only "daytime"
    'jaalle': [('adj', 'yellow')],                             # Wiktionary: only "comrade"
    'miro': [('noun', 'fruit')],                               # HAND_ONLY; Wiktionary: "nut"
    'shaati': [('noun', 'shirt', 'm')],                        # HAND_ONLY; Wiktionary: "blouse"
    'qurux': [('noun', 'beauty', 'f')],                        # HAND_ONLY; Wiktionary: "beautiful", as a noun
    'fudud': [('adj', 'light (not heavy); easy')],             # HAND_ONLY; Wiktionary: "subtle"
    'gadaal': [('adv', 'behind; at the back')],                # HAND_ONLY; Wiktionary: "back", which is dhabar
    # question words
    'maxay': [('pron', 'what?')],
    'yaa': [('pron', 'who?')],
    'xaggee': [('adv', 'where?; in which direction?')],
    'halkee': [('adv', 'where?; at which place?')],
    'goorma': [('adv', 'when?')],
    'sidee': [('adv', 'how?')],
    'imisa': [('adv', 'how many?; how much?')],
    'waayo': [('conj', 'because; why?')],
    'kee': [('det', 'which? (masculine)')],
    # joining words
    'laakiin': [('conj', 'but')],
    'markii': [('conj', 'when (in the past); at the time that')],
    # family
    'carruur': [('noun', 'children', 'f')],
    'awoowe': [('noun', 'grandfather', 'm')],
    'ayeeyo': [('noun', 'grandmother', 'f')],
    'qoys': [('noun', 'family; household', 'm')],
    'ehel': [('noun', 'relatives; kin', 'm')],
    # health
    'xanuun': [('noun', 'pain; illness', 'm')],
    'dhakhtar': [('noun', 'doctor', 'm')],
    'isbitaal': [('noun', 'hospital', 'm')],
    # time
    'saacad': [('noun', 'hour; clock, watch', 'f')],
    'daqiiqad': [('noun', 'minute', 'f')],
    'toddobaad': [('noun', 'week', 'm')],
    'bil': [('noun', 'month', 'f')],
    'waqti': [('noun', 'time', 'm')],
    'berri': [('adv', 'tomorrow')],
    'shalay': [('adv', 'yesterday')],
    'hadda': [('adv', 'now')],
    'fiid': [('noun', 'evening', 'm')],
    # food
    'kafee': [('noun', 'coffee', 'm')],
    'khudaar': [('noun', 'vegetables', 'f')],
    # money and shopping
    'lacag': [('noun', 'money', 'f')],
    'dukaan': [('noun', 'shop', 'm')],
    'shilin': [('noun', 'shilling', 'm')],
    # the home and clothes
    'qol': [('noun', 'room', 'm')],
    'albaab': [('noun', 'door', 'm')],
    'daaqad': [('noun', 'window', 'f')],
    'jiko': [('noun', 'kitchen', 'f')],
    'musqul': [('noun', 'toilet; bathroom', 'f')],
    'dhar': [('noun', 'clothes', 'm')],
    'surwaal': [('noun', 'trousers', 'm')],
    'koofiyad': [('noun', 'cap; hat', 'f')],
    'macawis': [('noun', 'sarong (the wrap worn by men)', 'm')],
    # the town and getting about
    'tuulo': [('noun', 'village', 'f')],
    'waddo': [('noun', 'road; street', 'f')],
    'baabuur': [('noun', 'car; vehicle', 'm')],
    'bas': [('noun', 'bus', 'm')],
    'tareen': [('noun', 'train', 'm')],
    'diyaarad': [('noun', 'aeroplane', 'f')],
    'iskuul': [('noun', 'school', 'm')],
    'masjid': [('noun', 'mosque', 'm')],
    # the weather and colours
    'cimilo': [('noun', 'weather; climate', 'f')],
    'bunni': [('adj', 'brown')],
    # animals
    'ari': [('noun', 'sheep and goats; small livestock', 'm')],
    'eey': [('noun', 'dog', 'm')],
    # school and work
    'arday': [('noun', 'student; pupil')],
    'macallin': [('noun', 'teacher', 'm')],
    'fasal': [('noun', 'class; classroom', 'm')],
    'xafiis': [('noun', 'office', 'm')],
    'shaqee': [('verb', 'work')],
    # the everyday verbs
    'tag': [('verb', 'go')],
    'kaalay': [('verb', 'come! (to one person)')],
    'seexo': [('verb', 'sleep')],
    'rab': [('verb', 'want')],
    'fahan': [('verb', 'understand')],
    'kari': [('verb', 'cook')],
    'dhig': [('verb', 'put down; place')],
    # describing things
    'badan': [('adj', 'many; much, a lot')],
    'dhow': [('adj', 'near, close')],
    'kale': [('adj', 'other; another; else')],
    # the little words of place and manner
    'halkan': [('adv', 'here')],
    'halkaas': [('adv', 'there')],
    'aad': [('adv', 'very')],
    'kaliya': [('adv', 'only')],
    'weli': [('adv', 'still; yet; ever')],
    'hore': [('adv', 'before, earlier; in front')],
    'kor': [('noun', 'top; upper part', 'm')],
    'sare': [('adj', 'upper; high')],
}

# A2 (2026-11-16): the words A2's inventory names that English Wiktionary lacks, or has
# only with a sense that is not the word's (those marked HAND_ONLY in build_deck).
HAND_A2 = {
    # the seasons and the directions
    'jiilaal': [('noun', 'the long dry season (December to March)', 'm')],
    'dayr': [('noun', 'the short rainy season (October and November)', 'm')],
    'koonfur': [('noun', 'south', 'f')],
    'bari': [('noun', 'east', 'm')],
    # places
    'jaamacad': [('noun', 'university', 'f')],
    'maktabad': [('noun', 'library; bookshop', 'f')],
    'garoon': [('noun', 'sports ground; airfield', 'm')],
    'dekad': [('noun', 'port, harbour', 'f')],
    'dal': [('noun', 'country', 'm')],
    'gobol': [('noun', 'region, province', 'm')],
    'degmo': [('noun', 'district', 'f')],
    'makhaayad': [('noun', 'restaurant; café', 'f')],
    'hudheel': [('noun', 'hotel', 'm')],
    # clothes
    'jaakad': [('noun', 'jacket', 'f')],
    'dirac': [('noun', "a woman's long light dress (the dirac)", 'm')],
    'shaal': [('noun', 'shawl; scarf', 'm')],
    # work
    'ganacsade': [('noun', 'trader; businessman', 'm')],
    'darawal': [('noun', 'driver', 'm')],
    'kalkaaliye': [('noun', 'assistant; nurse', 'm')],
    # the stages of life
    'aroos': [('noun', 'wedding', 'm')],
    'dhalasho': [('noun', 'birth', 'f')],
    'geeri': [('noun', 'death', 'f')],
    'nolol': [('noun', 'life', 'f')],
    # feelings
    'farxad': [('noun', 'happiness, joy', 'f')],
    'cabsi': [('noun', 'fear', 'f')],
    'walwal': [('noun', 'worry, anxiety', 'm')],
    'xiiso': [('noun', 'interest; fun', 'f')],
    # travel
    'baasaboor': [('noun', 'passport', 'm')],
    'socdaal': [('noun', 'journey', 'm')],
    'tigidh': [('noun', 'ticket', 'm')],
    # the weather and the land
    'abaar': [('noun', 'drought', 'f')],
    'kulayl': [('noun', 'heat', 'm')],
    'hawo': [('noun', 'air', 'f')],
    'ciid': [('noun', 'sand', 'f'), ('noun', 'Eid (the feast)', 'f')],
    # the body and health
    'waji': [('noun', 'face', 'm')],
    'qoor': [('noun', 'neck', 'f')],
    'garab': [('noun', 'shoulder', 'm')],
    'maskax': [('noun', 'brain; mind', 'f')],
    'caafimaad': [('noun', 'health', 'm')],
    'qandho': [('noun', 'fever', 'f')],
    'dhaawac': [('noun', 'injury, wound', 'm')],
    # food and the kitchen
    'quraac': [('noun', 'breakfast', 'f')],
    'qado': [('noun', 'lunch', 'f')],
    'casho': [('noun', 'supper, dinner', 'f')],
    'digaag': [('noun', 'chicken', 'm')],
    'basal': [('noun', 'onion', 'm')],
    'saxan': [('noun', 'plate, dish', 'm')],
    'dheri': [('noun', 'cooking pot', 'm')],
    'fargeeto': [('noun', 'fork', 'f')],
    'cabitaan': [('noun', 'a drink', 'm')],                  # HAND_ONLY; Wiktionary: "soda"
    'canjeero': [('noun', 'canjeero, a thin fermented pancake', 'f')],
    # the things of a home
    'telefoon': [('noun', 'telephone', 'm')],
    'telefishan': [('noun', 'television', 'm')],
    'raadiyo': [('noun', 'radio', 'm')],
    'kombiyuutar': [('noun', 'computer', 'm')],
    'sanduuq': [('noun', 'box; chest', 'm')],
    'furaash': [('noun', 'mattress', 'm')],
    # talking and learning
    "su'aal": [('noun', 'question', 'f')],
    'luqad': [('noun', 'language', 'f')],
    'cashar': [('noun', 'lesson', 'm')],
    'imtixaan': [('noun', 'examination, test', 'm')],
    'aqoon': [('noun', 'knowledge', 'f')],
    'qoraal': [('noun', 'writing; text', 'm')],
    'sheeko': [('noun', 'story', 'f')],                      # HAND_ONLY; Wiktionary: "conversation"
    # the verbs of doing
    'raadi': [('verb', 'look for, search for')],              # HAND_ONLY; Wiktionary: "find"
    'xasuuso': [('verb', 'remember')],
    'ooy': [('verb', 'cry, weep')],
    'nadiifi': [('verb', 'clean (something)')],
    # describing people
    'qurxoon': [('adj', 'beautiful')],
    'daallan': [('adj', 'tired')],
    'gaajaysan': [('adj', 'hungry')],
    # the faith and the feasts
    'salaad': [('noun', 'prayer (the five daily prayers)', 'f')],
    'soon': [('noun', 'fasting; a fast', 'm')],
    'ramadaan': [('noun', 'Ramadan', 'm')],
    'quraan': [('noun', 'the Quran', 'm')],
    # the ordinals
    'kowaad': [('adj', 'first')],
    'labaad': [('adj', 'second')],
    'saddexaad': [('adj', 'third')],
    'afraad': [('adj', 'fourth')],
    'shanaad': [('adj', 'fifth')],
    # joining and the little words of time
    'ilaa': [('prep', 'until; up to, as far as')],
    'sidoo kale': [('adv', 'also, too')],
    'xitaa': [('adv', 'even')],
    'had iyo jeer': [('adv', 'always')],
    'marna': [('adv', 'never (with a negative verb)')],
    'mararka qaarkood': [('adv', 'sometimes')],
    'inta badan': [('adv', 'mostly; usually')],
    'sababtoo ah': [('conj', 'because (of the fact that)')],
}

HANDS = {'a1': HAND, 'a2': HAND_A2}
