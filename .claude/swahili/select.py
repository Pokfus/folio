#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`swahili_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal ...);
  · a multi-word lemma (the inventory's to choose: its rank is an estimate);
  · a lemma that is only a phrase or a proverb (the phrases deck's);
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sw import norm
from swahili_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'a': 'the genitive particle -a ("of"): its count is wa / ya / la / cha / za, taught as grammar, not as a word',
    'o-ote': 'the agreeing stem -o -ote "any, all": a grammar point, not a beginner\'s word card',
    'husu': 'its count is kuhusu "about", taught on its own card at a later level',
    'kuna': '"to scrape": its count is kuna "there is", a form of -wa na taught on that card',
    'kuwa': 'the conjunction "that", whose spelling is the infinitive of -wa "to be" (taught as kuwa); A1 teaches kwamba "that"',
    'nina': '"mother" (poetic): its count is nina "I have"',
    'wili': 'the stem -wili "two"; A1 counts with mbili, on its own card',
    'pi': 'a suffix, not a word',
    'ina': '"certainly" (rare): its count is ina "it has"',
    'ke': 'the stem -ke "female" (mke, mwanamke), not a word used alone',
    'huwa': 'the habitual of -wa ("is usually"), a verb form, not a lemma: taught on kuwa',
    'sivyo': 'a negative copula form ("that is not so"), not a verb lemma',
    'ndio': 'a variant spelling of ndiyo, which A1 teaches',
    'mwanaume': 'a variant spelling of mwanamume, which A1 teaches',
    # read off the A2 ranking (2026-11-09)
    'peke': 'Wiktionary\'s only sense is a usage note (peke yangu "alone"), not a meaning',
    'ndivyo': 'a copula form ("that is how"), not a verb lemma',
    'hidi': '"to convert": its count is -ahidi "to promise", split at the wrong letter',
    'tuna': '"to swell": its count is tuna "we have"',
    'kina': '"depth": its count is kina "it has" (class 7)',
    'ukiwa': '"solitude": its count is ukiwa "when you are"',
    'kiko': '"pipe": its count is kiko "it is there" (class 7)',
    'mpiga': 'a word-forming element (mpiga picha "photographer"), not a word',
    'ngono': 'its count is the sexual sense; a level deck leaves that out, as it does swearing',
    # read off the B1 ranking (2026-11-12)
    'do': 'the interjection "oh! damn!": its count is mostly the English "do" in the subtitles',
    'hindi': '"maize": its count is Hindi "India" (Bahari ya Hindi), and A2 teaches mahindi',
    'papa': 'its count is three words at once ("shark", "pope", "to tremble"), none of them a B1 word on that evidence',
    'lisilo': 'a negative relative form (li-si-lo, class 5), a grammar point, not a word',
    'nakupenda': '"I love you": a conjugated form of -penda (A1) that Wiktionary lists as a lemma',
    'jira': '"cumin": its count is its plural majira "season", taught on its own card',
    'kumba': '"to shove": its count is kumbe "so, behold!", read by the parser as its subjunctive',
    'endeleza': 'Wiktionary\'s only sense is "to spell", where the word is met as "to develop, to carry on"; left out rather than taught wrong',
    'mfanya': 'a word-forming element (mfanyabiashara, mfanyakazi), not a word',
    # read off the B2 ranking (2026-11-12)
    'pepe': '"astray": its count is barua pepe "email", which B1 teaches',
    'abu': '"father": its count is the Arabic name element Abu',
    'haram': '"pyramid": its count is haram "forbidden" and Boko Haram',
    'yaliyomo': 'a relative form of -wamo ("what is in it"), a grammar point, not a word',
    'li': 'a stem of -wa used only inside relative forms (kuli, alipo), a grammar point, not a word',
    'siwe': 'a negative subjunctive form ("it is not you"), not a lemma',
    'ka': 'the narrative tense marker -ka-, a grammar point, not a word',
    'koloni': '"colon" (the punctuation mark): its count is koloni "colony"',
    'ono': '"thought": its count is its plural maono "vision", taught on its own card',
    'nukato': '"scent": its count is its plural manukato "perfume", taught on its own card',
    'wia': '"to warm up": its count is -wia, the applicative of -wa ("to be for": inaniwia vigumu)',
    'pea': 'its count mixes five homographs ("to ripen", "to give to", "pair", "pear", "to sweep")',
    'aka': '"to build": a handful of tokens, credited by the parser from forms of other words',
    'sua': '"to spit": a handful of tokens, credited by the parser from forms of other words',
    'asa': '"to forbid": a handful of tokens, credited by the parser from forms of other words',
    'ree': '"ace": a single token as written',
    'umbile': 'Wiktionary\'s only sense is queried ("the nature of something?")',
    'jamiiana': '"to have sex with one another": left out, as ngono is',
    'hara': '"to defecate" (Wiktionary\'s first sense of "to have diarrhoea"): a crude word',
    'shoga': 'its count is mostly the slur sense, not "a woman\'s close friend"',
    'kilema': '"cripple": a pejorative; B1 teaches mlemavu "a person with a disability"',
    'mpigaji': 'Wiktionary\'s only sense is "synonym of mpiga", a word-forming element',
    'kifungua': 'a word-forming element (kifungua kinywa "breakfast"), not a word',
    'mshika': 'a word-forming element (mshika dau, mshika bunduki), not a word',
    'mtunza': 'a word-forming element (mtunza fedha "treasurer"), not a word',
    'mlipa': 'a word-forming element (mlipa kodi "taxpayer"), not a word',
    'mlinda': 'a word-forming element (mlinda mlango "goalkeeper"), not a word',
    'mbao': 'Wiktionary\'s lemma is the slang "twenty shillings"; planks are the plural of ubao, which A2 teaches',
}

# Swearing and insults are never in a level deck.
SWEARS = {'malaya', 'mjinga', 'mpumbavu', 'kuma', 'mshenzi', 'fala',
          'pumbavu', 'shenzi',   # the adjectives of mpumbavu, mshenzi (B1)
          'mwanaharamu', 'mpuuzi', 'zuzu', 'bwege', 'mbumbumbu', 'umalaya'}   # B2


def rank(L):
    """The frequency a lemma is dealt by.  From A2 up a multi-word lemma's own sequence
    count (`seq`, see `extract.py`); A1 was shipped on `freq` and stays on it."""
    if LEVEL != 'a1' and 'seq' in L:
        return L['seq']
    return L['freq']


def usable(L):
    return any(not g['weak'] for e in L['entries'] for g in e['glosses'])


AGREEING = ('adj', 'pron', 'det', 'num', 'particle')


def say_of(L, pos=''):
    """The headword as a card prints and speaks it."""
    ents = [e for e in L['entries'] if not pos or e['pos'] == pos] or L['entries']
    e = ents[0]
    if e['pos'] == 'verb':
        return e['inf'] or 'ku' + L['word']
    if e['canon'] and e['pos'] in AGREEING:
        return e['canon'].lstrip('-')
    return L['word']


def says_all(L):
    """Every headword a lemma could be printed as -- one per part of speech, and its bare
    spelling.  A LOWER LEVEL TAUGHT THE LEMMA if it taught any of them: A1 printed `jua`
    as `kujua` and `nani` as `nani`, and A2's fill, reading their other entries first, would
    have dealt them again as `jua` "sun" and `-a nani` "whose"."""
    return {say_of(L, e['pos']) for e in L['entries']} | {L['word'].lower()}


def main():
    lex = json.load(open('lex.json', encoding='utf-8'))
    below = words_below()
    rows, seen, said, missing = [], set(), set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            k = norm(w.replace('_', ' '))
            L = lex.get(k)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            say = say_of(L, pos)
            if k in seen or says_all(L) & below:
                continue
            seen.add(k)
            said.add(say)
            rows.append({'key': k, 'word': L['word'], 'say': say, 'freq': rank(L),
                         'pos': pos or '', 'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    swears = {norm(s) for s in SWEARS}
    fill = []
    for k, L in sorted(lex.items(), key=lambda kv: (-rank(kv[1]), kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if k in seen or k in swears or k in EXCLUDE or ' ' in k or '-' in k:
            continue
        if not usable(L) or L['freq'] <= 0:
            continue
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        say = say_of(L)
        if says_all(L) & below or say in said:
            continue
        seen.add(k)
        said.add(say)
        fill.append({'key': k, 'word': L['word'], 'say': say, 'freq': rank(L), 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN WIKTIONARY (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
