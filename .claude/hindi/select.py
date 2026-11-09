#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`hindi_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from hi import fold
from hindi_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'सा': 'its count is a dozen shapes of से and of the suffix -सा; taught as a word it misleads',
    'ओ': 'an interjection the subtitles count from song lyrics and names',
    'आह': 'a sigh, counted from subtitles',
    'सालना': 'its count is साल "year", whose forms it shares',
    'सरना': 'its count is सर "sir" (and सरे), not the verb',
    'भाड़': 'counted from भाड़ में जाओ, an oath',
    'की': 'taught on the card of का, whose feminine it is',
    'बारा': 'its count is बारे, the oblique, which is the बारे of के बारे में "about"',
    # read off the A2 ranking (2026-11-09)
    'सो': 'its count is सो, the stem of सोना "to sleep" (सो जाओ); the pronoun is literary',
    'करनी': 'its count is करनी, the feminine infinitive of करना (बात करनी है), not the noun "deed"',
    'ज़ाती': 'its count is जाती, जाना\'s feminine habitual: the fold drops the nukta',
    'गलना': 'its count is ग़लती "mistake" (the fold drops the nukta) and गले / गली, not the verb',
    'दुखना': 'its count is दुख "sorrow" and दुखी "sad", whose forms it shares',
    'रंगना': 'its count is रंग "colour", taught in A1, whose forms it shares',
    'सीना': 'its count is सी and सीता (the name Sita); its own forms are rare',
    'छाना': 'its count is छाया "shadow", whose spelling its past shares',
    'धरना': 'its count is the forms of an archaic verb "to hold" (धरा, धरे), not the noun "sit-in"',
    'कराहना': 'counted from the subtitles\' sound captions ([कराहता है])',
    'हाँफना': 'counted from the subtitles\' sound captions ([हांफते हुए])',
    'हाँकना': 'its count is हांक, the name Hank',
    'बेलना': 'its count is बेला / बेल, names and other words, not "to roll out dough"',
    'कोड़ी': 'its count is कोडी, the name Cody (the fold drops the nukta)',
    'गुड़': 'its count is गुड, the English "good" (गुड मॉर्निंग), not "jaggery"',
    'मिस': 'its count is the English "Miss", not "pretext"',
    'हाउस': 'the English "house", counted from names (White House)',
    'डी': 'the letter D, counted from names and initials',
    'हा': 'laughter, counted from subtitles',
    '-वाला': 'a suffix, and taught as the word वाला in A1',
    'सिकंदर': 'counted as the name Sikandar (Alexander), not "king, ruler"',
    'इंदु': 'counted as the name Indu, not "the moon"',
    'जगदीश': 'counted as the name Jagdish',
    'समीर': 'counted as the name Sameer, not "breeze"',
    'प्रिया': 'counted as the name Priya',
    'दिव्या': 'counted as the name Divya',
    'ख़ान': 'counted as the surname Khan',
    'ख़्याल': 'a second spelling of ख़याल, which carries the card',
    'जन्मना': 'its count is जन्म "birth", its stem, whose forms it shares',
    'रे': 'counted from song lyrics and a clipped अरे, which A1 teaches',
    # read off the B1 ranking (2026-11-09)
    'हाँक': 'its count is हांक, the name Hank (as हाँकना\'s was)',
    'दिया': 'its count is दिया, देना\'s past, not the noun "lamp"',
    'बी': 'its count is the letter B, not "wife"',
    'डील': 'its count is the English "deal", not "bulk, stature"',
    'लव': 'its count is the English "love", not "a particle"',
    'गूगल': 'its count is Google, not the resin bdellium',
    'धत': 'its count is the oath धत् ("damn!"), not "bad habit"',
    'अल्फ़ा': 'the Greek letter, counted from names (Alpha team)',
    'रोलना': 'its count is रोल, the English "role" / "roll"',
    'लेसना': 'its count is लेसे, not the verb "to plaster with dung"',
    'जनना': 'its count is जनता "the public" and जन "people", whose spelling its forms share',
    'हनना': 'its count is हनी, the English "honey"',
    'चालना': 'its count is चाल "gait, trick", a noun of its own',
    'संजय': 'counted as the name Sanjay',
    'शेखर': 'counted as the name Shekhar',
    'शास्त्री': 'counted as the surname Shastri',
    'सीज़र': 'counted as the name Caesar',
    'विक्टोरिया': 'counted as the name Victoria',
    'दुर्गा': 'counted as the goddess and given name Durga',
    # a second spelling of a word a lower level teaches, which Wiktionary files as a
    # lemma of its own (so the alt_of rule cannot see it)
    'अमरीकी': 'a second spelling of अमेरिकी, taught in A2',
    'छुपाना': 'a second spelling of छिपाना, taught in A2',
    'छुपना': 'a second spelling of छिपना, taught in A2',
    'दवाई': 'a second form of दवा, taught in A1',
    'बाएँ': 'the oblique of बायाँ, taught in A1',
    'महाराज': 'a second form of महाराजा, which carries the card',
    'कोर': 'its one sense is "blind", which the subtitles do not mean: the count is the English "core"',
    # read off the B2 ranking (2026-11-09).  At this depth a word is counted 5 to 14 times,
    # so one name or one film is enough to put it in the deck.
    'उपशीर्षक': '"subtitle", counted from the subtitle files\' own credits',
    'कर': 'its count is कर, करना\'s stem (कर दो), not "hand; tax" (A1\'s finding)',
    'सकता': 'its count is सकता, सकना\'s habitual, not "apoplexy" (A1\'s finding)',
    'दोना': 'its count is दोनों "both" (taught in A1), the oblique plural it shares',
    'पोतना': 'its count is पोते, the plural of पोता "grandson" (A2)',
    'ढीलना': 'its count is ढीला "loose", whose forms it shares',
    'बीजना': 'its count is बीज "seed", a noun of its own',
    'सीलना': 'its count is सील, the English "seal"',
    'खींच': 'its count is खींच, the stem of खींचना (A2)',
    'मिलनी': 'its count is मिलनी, मिलना\'s feminine infinitive, as करनी\'s was करना\'s',
    'सारना': 'its count is सारा "all" (A1), whose forms it shares',
    'खेना': 'its count is खेती "farming", whose spelling its forms share',
    'गोदना': 'its count is गोद "lap" and गोदी',
    'टेरना': 'its count is टेरी, the name Terry',
    'छड़ना': 'its count is छड़ी "stick"',
    'रसना': 'its count is रस "juice", a noun of its own',
    'दोहरना': 'its count is दोहरा "double", an adjective of its own',
    'सनकना': 'its count is सनकी "eccentric", an adjective of its own',
    'रेतना': 'its count is रेत "sand", a noun of its own',
    'गुनना': 'its count is गुना "-fold", whose spelling it shares',
    'जिनमें': 'जिन + में, a pronoun and a postposition, not a lemma',
    'होम': 'its count is the English "home", not the Vedic rite',
    'कुक': 'its count is the English "cook", not "a cry"',
    'जूस': 'its count is the English "juice"; the entry\'s sense is "pea broth"',
    'पंगा': 'the subtitles\' पंगा is the slang "trouble" (पंगा लेना), which the entry ("lame") lacks',
    'बड़': 'its count is बड़ in clippings and compounds of बड़ा, not "banyan"',
    'बोबा': 'counted as a name, not "breast"',
    'जुंग': 'counted as the name Jung, not "emotion"',
    'बेन': 'counted as the name Ben, not "flute"',
    'बे': 'a letter of the Perso-Arabic alphabet',
    'मूतना': 'crude, and a level deck does not teach it',
    'मोहिनी': 'counted as the name Mohini', 'मीरा': 'counted as the name Meera',
    'नील': 'counted as the name Neil', 'पांडु': 'counted as the name Pandu',
    'मोहन': 'counted as the name Mohan', 'छोटू': 'counted as the nickname Chhotu',
    'मुन्ना': 'counted as the nickname Munna', 'सिंह': 'counted as the surname Singh',
    'गीता': 'counted as the name Geeta', 'पटेल': 'counted as the surname Patel',
    'माधव': 'counted as the name Madhav', 'माया': 'counted as the name Maya',
    'क़ैसर': 'counted as Caesar, as सीज़र was', 'जया': 'counted as the name Jaya',
    'शनि': 'counted as Shani, the god and the planet', 'अरस्तू': 'Aristotle',
    'अयोध्या': 'the city', 'गब्बर': 'counted as Gabbar, the film villain',
    'ज्योति': 'counted as the name Jyoti', 'रहीम': 'counted as the name Rahim',
    'सविता': 'counted as the name Savita', 'सायन': 'its count is the English "sign"',
    'कर्ण': 'counted as Karna, the hero', 'शंकर': 'counted as the name Shankar',
    'रहमान': 'counted as the name Rahman', 'चिक': 'its count is the English "chick"',
    # a second spelling or form of a word a lower level, or this one, teaches
    'बीयर': 'a second spelling of बियर, taught in B1',
    'डाटा': 'a second spelling of डेटा, taught in B1',
    'दाएँ': 'the oblique of दायाँ, taught in A1',
    'सुबूत': 'a second spelling of सबूत, taught in A2',
    'हिरन': 'a second spelling of हिरण, taught in A2',
    'गुना': 'a second spelling of गुणा, which carries the card',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'साला', 'कमीना', 'हरामी', 'कुत्ती', 'चूतिया', 'भड़वा', 'गांडू', 'बकवास', 'हरामज़ादा',
          'कमबख़्त', 'साली', 'बेवकूफ़', 'उल्लू', 'कुतिया'}


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    return any(not g['weak'] for g in gl)


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    # a word a lower level taught under one spelling is taught under every spelling:
    # A1's गरम is Wiktionary's alternative spelling of गर्म, which A2's fill would deal
    below |= {lex[k]['alt_of'] for k in below if k in lex and 'alt_of' in lex[k]}
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            w = w.replace('_', ' ')
            k = fold(w)
            if k in seen or k in below:
                continue
            L = lex.get(k)
            via = ''
            if L and 'alt_of' in L:
                # the common spelling of a word Wiktionary files under another (कुर्सी):
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(k)
            if via:
                seen.add(via)     # साइकिल is साइकल's: the fill must not deal साइकल again
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    swears = {fold(s) for s in SWEARS}
    excl = {fold(s) for s in EXCLUDE}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: -kv[1]['freq']):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if 'entries' not in L or L.get('formonly'):
            continue
        if k in seen or k in below or k in swears or k in excl:
            continue
        if len(k) < 2 and k not in ('न',):
            continue
        # a MULTI-WORD lemma (बात करना, के बारे में) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        seen.add(k)
        fill.append({'key': k, 'via': '', 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
