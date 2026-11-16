#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining Wiktionary words.

    python3 select.py      (from the cache directory, by run.py)

Reads the level's lexicon (`somali_level.LEX`) and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by frequency (the commonest first), each marked with where it came
from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`somali_level.words_below`).
AN INVENTORY WORD NOT IN THE LEXICON BUT NAMED BY A POINTER (an alternative
spelling Wiktionary files under another page) resolves to that page.

THE FILL TAKES only Wiktionary's own entries (never a hand gloss: a hand row is
dealt only when the inventory names it), and never:
  · a lemma whose every sense is weak (rare, dialect, offensive ...);
  · a lemma of two letters or fewer (`ka`, `ku`, `u`, `oo`: the particles and
    prepositions are counted in every sentence, and they are taught where the
    inventory names them);
  · a multi-word entry, a phrase, an interjection or a numeral the inventory does
    not teach;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from so import key
from somali_level import LEVEL, LEX, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-16).  Each with its reason.
EXCLUDE = {
    'badhan': 'its count is badan "many" (Wiktionary files badan as its alternative); badan is taught',
    'jir': 'Wiktionary\'s "exist" takes the count of jira, jiray, jirta, the auxiliary of every past habitual',
    'ah': 'the copula "be": its count is ah in every relative clause (oo ah, ah "being"); not a word to drill alone',
    'waxa': 'the focus marker waxa(a), written onto the pronouns (waxaa, waxay, wuxuu); a grammar word',
    'waa': 'the topic marker of the statement; a grammar word, not a meaning',
    'sida': 'Wiktionary glosses "this"; its count is sida "like, as", which it does not have',
    'doon': 'the count is the future auxiliary doonaa; the verb doon "want" is taught by the inventory',
    'xarunta': 'a definite form (xarun + -ta) filed as its own noun, glossed "the leading figure"',
    'nidaamka': 'a definite form (nidaam + -ka) filed as its own noun',
    'qalabka': 'a definite form (qalab + -ka) filed as its own noun',
    'jirka': 'a definite form (jir + -ka) filed as its own noun; jidh "body" is taught',
    'dhaqdhaqaaqa': 'a definite form of dhaqdhaqaaq',
    'bisha': 'the definite form of bil "month" (bisha), glossed "date"; bil is taught',
    'jeer': 'Wiktionary glosses "hippopotamus"; its count is jeer "time, occasion" (mar ... jeer)',
    'doonta': 'a form of doon "want", filed as a noun',
    'bangiga': 'a definite form of banki "bank"',
    'jidka': 'a definite form of jid "road", taught',
    'calanka': 'a definite form of calan "flag"',
    'heesta': 'a definite form of hees "song"',
    'dugsi': 'Wiktionary glosses "warm" as an adjective; its count is dugsi "school" (the noun)',
    'qalab': 'filed as an adjective "tangible"; its count is qalab "equipment" (the noun)',
    'ayaan': 'Wiktionary glosses "good luck"; its count is the focus particle ayaan (ayaa + aan)',
    'waan': 'the focus particle waa + aan, written as one; a grammar word',
    'waxey': 'a spelling of waxay "they (focus)"; a grammar word',
    'ahay': 'a form of ah "be" ("am"), filed as its own verb',
    'dil': 'Wiktionary glosses "beat!"; its count is dil "kill", from the history articles',
    'gaal': 'a word for a non-Muslim that can be a slur; not a level word',
    'addoon': 'slavery vocabulary, from the history articles; not a beginner\'s word',
    'gumeys': 'from the history articles ("colonise"); not a beginner\'s word',
    'hantiwadaag': 'from the history articles ("socialism"); not a beginner\'s word',
    'guray': 'Wiktionary glosses "a left-handed person"; its count is guray, a verb form ("moved")',
    'cagaar': 'Wiktionary glosses a grass (buffelgrass); cagaaran "green" is taught',
    'male': 'its count is the English "male" of the articles and male "consideration" is rare',
    'mug': 'its count is the stray English "mug"; Wiktionary glosses "capacity"',
    'booy': 'Wiktionary glosses "cry"; its count is the English "boy" written so in names',
    'marin': 'Wiktionary glosses "to rub"; its count is mariin "time, occasion" and marin "passage"',
    'talin': 'its count is talin "advice" (the noun), glossed only as the verb "to urge"',
    'duul': 'Wiktionary glosses "band, group"; its count is the verb duul "to fly, to invade"',
    'qabo': 'a spelling of qabow "cold" or of qab "hold"; both are counted',
    'xaq': 'Wiktionary glosses "allegation"; its count is xaq "right, truth"',
    'gaar': 'Wiktionary has only the verb "to reach" (gaadh); its count is gaar ah "special, particular"',
    'iman': 'the infinitive of yimaad "to come", taught; filed as its own verb',
    'xarun': 'Wiktionary glosses only a historical state\'s government; its count is xarun "centre, headquarters"',
    'sheeko': 'Wiktionary glosses only "conversation"; its count is sheeko "story"',
    'xoog': 'filed as an adjective "strong"; its count is xoog "strength, force" (the noun)',
    'uun': 'Wiktionary glosses "create (of God)"; its count is the particle uun "only, just"',
    'baa': 'the focus marker baa; a grammar word, as waa is',
    'iska': 'the reflexive is + the preposition ka, written as one; glossed only "yourself"',
    'qoy': 'its count is qoyska "the family" (qoys + -ka), not the verb "to be wet"',
    'dusha': 'the definite form of dul "top" (dul + -sha), filed as a preposition',
    # Read off the A2 ranking (2026-11-16).
    'socod': 'the verbal noun of soco "walk", taught at A1',
    'asaga': 'a dialect form of isaga "he", taught at A1',
    'anaga': 'a dialect form of annaga "we", taught at A1',
    'ayaga': 'a dialect form of iyaga "they", taught at A1',
    'dabar': 'glossed "back", which dhabar teaches at A1',
    'imaad': 'a form of yimaad "to come", taught at A1',
    'askar': 'a variant of askari "soldier", taught at A2',
    'qorsheynta': 'a definite form (qorsheyn + -ta)',
    'magaalad': 'a variant of magaalo "city", taught at A1',
    'jaale': 'a variant of jaalle, taught at A1',
    'caro': 'Wiktionary glosses "earth"; its count is caro "anger"',
    'qoorta': 'the definite form of qoor "neck", taught at A2',
    'ayeey': 'a variant of ayeeyo "grandmother", taught at A1',
    'fadhi': 'the noun "sitting, session" filed as a verb; fadhiiso is taught',
    'can': 'glossed "buccal"; a rare word',
    'wajiga': 'the definite form of waji "face", taught at A2',
    'aar': 'a male lion; libaax is taught (the inventory leaves it out)',
    'cal': 'a rare word for "mountain"; buur is taught',
    'badhi': 'a variant of bari "east", taught at A2',
    'cayn': "a letter's name",
    'malay': 'a rarer word for "fish"; kalluun is taught',
    'tolid': 'a verbal noun filed as a verb',
    'hurdo': 'the noun "sleep" filed as a verb; seexo is taught',
    'timaha': 'the definite form of timo "hair", taught at A1',
    'tirin': 'the infinitive of tiri "count", taught at A2',
    'culeys': 'the noun "weight" filed as the adjective "heavy"; culus is taught',
    'qaraar': 'glossed as a Southern Somali form of another word',
    'fariisan': 'a form of fadhiiso "sit", taught at A1',
    'ogow': 'the imperative of og "know", taught at A1',
    'turjubaan': 'a variant of turjumaan "translator", taught at A2',
    'qeybgal': 'a variant of qaybgal',
    'sheegid': 'the verbal noun of sheeg "tell", taught at A1',
    'musqusha': 'the definite form of musqul, taught at A1',
    'kaladuwan': 'kala duwan written as one; duwan is taught',
    'jebi': 'glossed only as "transitive of jab"',
    'luqun': 'a second word for "neck"; qoor is taught',
    'iskuday': 'glossed only by a pointer ("tijaab")',
    'gadh': 'a dialect form of "buy"; iibso and gad are taught',
    'gus': 'sexual vocabulary the level does not need',
    'iloob': 'a second word for "forget"; hilmaam is taught',
    'intee': 'glossed "where"; it is "how much, how far"',
    'wiyil': 'a male rhinoceros, glossed with a vowel notation the deck does not teach',
    'dabada': 'a definite form (dabo + -da)',
    'isticmaalaha': 'a definite form (isticmaale + -ha)',
    'hey': 'a variant of hay "hold, have"',
    'samay': 'a variant of samee "make", taught at A1',
    'babuur': 'a variant of baabuur "car", taught at A1',
    'bidde': 'slavery vocabulary; not a level word',
    'xadiid': 'a third word for "iron"; bir and feero are taught',
    'kacsi': 'sexual vocabulary the level does not need',
    'kuleel': 'a variant of kulul "hot", taught at A1',
    'duun': 'a third word for "neck"; qoor is taught',
    'heesid': 'a verbal noun',
    'maxa': 'a variant of maxaa "what", taught at A1',
    'noolaan': 'the infinitive of nool "live", taught at A1',
    'dalbo': 'glossed "choose"; the word is dalbo "to order, to request"',
    'jilb': 'a variant of jilib "knee"',
    'sayn': 'a variant of dabo "tail"',
    'xirid': 'a verbal noun',
    'shaqey': 'a form of shaqee "work", taught at A1',
    'garo': 'a third word for "understand"; fahan is taught at A1',
    'qodid': 'a verbal noun',
    'qusuusi': 'a historical title, from the history articles',
    'saaxo': 'a rare word for "sleep"; seexo is taught',
    'sugto': 'a form of sug "wait", taught at A1',
    'xagee': 'a variant of xaggee "where?", taught at A1',
    'dabadhilif': 'an insult ("stooge")',
    'garac': 'a slur ("bastard")',
    'horgal': 'a political insult',
    'idoor': 'an insult for a clan',
    'diig': 'a variant of dhiig "blood", taught at A1',
    'gaarhaye': 'a historical title',
    'iidoor': 'a clan name',
    'sarreya': 'a form of sare "high", taught at A1',
    'tarbiyad': 'glossed "something usurious"; the word is tarbiyad "upbringing"',
    'shukaansi': 'courting vocabulary the level does not need',
    "faa'idooyin": 'the plural of faa\'ido "profit", taught at A2',
    'diman': 'the infinitive of dhimo "die"',
    'faasiq': 'a term of religious condemnation, from the history articles',
    'faasiqnimo': 'from the history articles',
    'jeesjeeska': 'a definite form (jeesjees + -ka)',
    'jiidid': 'a verbal noun',
    'kaley': 'a variant of kaalay "come!", taught at A1',
    'maqsinka': 'a definite form (maqsin + -ka)',
    'sahlidda': 'a definite form (sahlid + -da)',
    'sayyidka': 'a historical title',
    'shirshoore': 'a clan epithet, from the history articles',
    'tirtirid': 'a verbal noun',
    'guraac': 'a variant of quraac "breakfast", taught at A2',
    'otismo': 'medical vocabulary the level does not need',
    'rag': 'Wiktionary glosses "man"; the word is the plural "men", and nin "man" is taught',
}


def usable(L):
    return any(not g['weak'] and not e['hand'] for e in L['entries'] for g in e['glosses'])


def main():
    D = json.load(open(LEX, encoding='utf-8'))
    lex, ptr = D['lemmas'], D['pointers']
    back = {s: t for t, ss in ptr.items() for s in ss}
    below = words_below()
    rows, seen, missing = [], set(), []
    for topic, words in INVENTORY.get(LEVEL, []):
        for item in words.split():
            w, _, pos = item.partition(':')
            h = key(w.replace('_', ' '))
            if h not in lex and h in back:
                h = back[h]
            if h in seen or h in below:
                continue
            L = lex.get(h)
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(h)
            rows.append({'key': h, 'word': L['word'], 'freq': L['freq'], 'pos': pos,
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    fill = []
    for h, L in sorted(lex.items(), key=lambda kv: (-kv[1]['freq'], kv[0])):
        if len(rows) + len(fill) >= TARGET[LEVEL]:
            break
        if h in seen or h in below or h in EXCLUDE or ' ' in h or len(h) <= 2:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        if all(e['pos'] in ('phrase', 'intj', 'num') for e in L['entries'] if not e['hand']):
            continue
        seen.add(h)
        fill.append({'key': h, 'word': L['word'], 'freq': L['freq'], 'pos': '',
                     'source': 'frequency', 'topic': ''})
    rows += fill
    rows.sort(key=lambda r: (-r['freq'], r['key']))
    json.dump(rows, open(f('selected.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f'  {len(rows)} words: {n_inv} from the inventory, {len(fill)} by frequency')
    if missing:
        print('  NOT IN THE LEXICON (dropped):', ' '.join(missing))


if __name__ == '__main__':
    main()
