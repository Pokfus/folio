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
    # Read off the A2 ranking (2026-11-12).
    'सिकंदर': '"king, ruler"; its count is the name Sikandar (Alexander)',
    'कराहना': 'its count is the subtitles\' sound captions ("[groans]"), not speech',
    'हाँफना': 'its count is the subtitles\' sound captions ("[pants]"), not speech',
    'हाँकना': 'its count is the captions\' हांक- / हांफ- ("[panting]"), not "to drive (an animal)"',
    'गलना': '"to melt"; its count is गले / गला "neck, throat" and गली "lane", whose forms it shares',
    'सो': '"used with जो" in Wiktionary\'s one sense; its count is सो "sleep!", of सोना',
    'करनी': '"deed"; its count is करनी, the feminine infinitive of करना',
    'कोड़ी': '"a score (twenty)"; its count is कोडी, the subtitles\' "code"',
    'ज़ाती': '"innate"; its count is जाती, a form of जाना (the nukta folded)',
    'डी': 'the letter D, counted from spelt-out English',
    'हा': 'laughter, counted from subtitles',
    'हाउस': '"house" in English names (White House), not a Hindi word',
    'गुड़': '"jaggery"; its count is गुड, the subtitles\' English "good"',
    'मिस': '"pretext"; its count is the subtitles\' English "miss"',
    'इंदु': '"the moon"; its count is the given name Indu',
    'जगदीश': '"god"; its count is the given name Jagdish',
    'समीर': '"breeze"; its count is the given name Sameer',
    'प्रिया': '"darling"; its count is the given name Priya',
    'दिव्या': '"divine"; its count is the given name Divya',
    'ख़ान': '"khan"; its count is the surname Khan',
    # Read off the B1 ranking (2026-11-12).
    'दिया': '"lamp"; its count is दिया "gave", the past of देना (the A1 note on दी)',
    'हाँक': 'its count is the captions\' हांक- / हांफ- ("[panting]"), as हाँकना\'s',
    'संजय': '"victorious"; its count is the given name Sanjay',
    'शेखर': '"crest"; its count is the given name Shekhar',
    'विक्टोरिया': 'a given name',
    'सीज़र': 'the name Caesar',
    'दुर्गा': 'the goddess\'s name, counted as a word',
    'शास्त्री': '"scientist"; its count is the surname Shastri',
    'गूगल': '"the guggul tree"; its count is the subtitles\' "Google"',
    'बी': '"synonym of बीवी"; its count is the letter B',
    'चेक': '"Czech"; its count is the subtitles\' English "check"',
    'डील': '"bulk, stature"; its count is the subtitles\' English "deal"',
    'लव': '"a particle"; its count is the subtitles\' English "love"',
    'रोलना': '"to roll out"; its count is रोल, the subtitles\' English "role"',
    'लेसना': '"to plaster with dung"; its count is लेस-, from English',
    'कोर': '"blind" in Wiktionary\'s one sense; its count is the subtitles\' English "core", "corps"',
    'हनना': '"to slay", archaic; its count is the shapes it shares with commoner words',
    'चालना': '"to impel"; its count is चाल "gait" and चलना, whose forms it shares',
    'बंधा': '"levee"; its count is बंधा "tied", of बँधना',
    'धत': '"vice" in Wiktionary\'s one sense; its count is धत "get away!", the interjection',
    # Read off the B2 ranking (2026-11-12).
    'सकता': '"apoplexy"; its count is सकता, of सकना (the A1 note)',
    'उपशीर्षक': '"subtitle"; its count is the subtitle files\' own credit lines',
    'बेन': '"flute"; its count is the name Ben',
    'होम': '"homa"; its count is the subtitles\' English "home"',
    'कुक': '"a cry"; its count is the subtitles\' English "cook"',
    'चिक': '"bamboo blind"; its count is the subtitles\' English "chick"',
    'बे': 'the letter be; its count is बे "hey, you", a rude call',
    'रसना': '"tongue"; its count is रस "juice", whose forms it shares',
    'बीजना': '"hand fan"; its count is बीज "seed", whose forms it shares',
    'जुंग': '"emotion"; its count is the name Jung',
    'बोबा': '"breast"; counted from a name, not a learner\'s word',
    'पंगा': '"lame" in Wiktionary; its count is the slang पंगा "trouble", a sense the entry lacks',
    'गब्बर': '"haughty"; its count is Gabbar, the film villain',
    'क़ैसर': 'the name Caesar (Kaiser)',
    'पटेल': '"village headman"; its count is the surname Patel',
    'मीरा': '"murva fibre"; its count is the given name Meera',
    'मोहिनी': 'the given name Mohini',
    'मोहन': 'the given name Mohan',
    'माधव': 'the given name Madhav',
    'जया': 'the given name Jaya',
    'गीता': '"song"; its count is the given name Geeta (and the Gita)',
    'रहीम': 'the given name Rahim',
    'रहमान': 'the given name Rahman',
    'सविता': 'the given name Savita',
    'शंकर': 'the given name Shankar',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'साला', 'कमीना', 'हरामी', 'कुत्ती', 'चूतिया', 'भड़वा', 'गांडू', 'बकवास', 'हरामज़ादा',
          'कमबख़्त', 'साली', 'बेवकूफ़', 'उल्लू', 'कुतिया'}


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    # a lemma whose every sense is a "hyperforeign form of" note has no meaning to
    # teach (`पटाख़ा`, B2)
    return any(not g['weak'] and not g['g'].lower().startswith('hyperforeign form of')
               for g in gl)


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
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
        # a SUFFIX (-वाला) is not a word a learner meets bare (A2)
        if k.startswith('-') or k.endswith('-'):
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
