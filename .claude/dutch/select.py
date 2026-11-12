#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`dutch_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nl import fold
from dutch_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

POS_ORDER = ['verb', 'noun', 'adj', 'adv', 'pron', 'det', 'postp', 'conj', 'particle',
             'intj', 'num', 'phrase', 'prep', 'prep_phrase', 'proverb']

# Read off the A1 ranking (2026-11-09).  Each with its reason.
EXCLUDE = {
    'zeg': "an interjection 'say!'; its count is the imperative and first person of zeggen, taught there",
    'wijten': "'to blame on'; its count is weet and weten, whose spellings its past shares with weten",
    'paren': "'to mate'; its count is paren, the plural of paar, and paar 'a couple'",
    'plaatsen': "'to place'; its count is mostly the plural of plaats",
    'keren': "'to turn'; its count is keer 'time' and its plural",
    'zat': "'drunk, fed up'; its count is the past of zitten, taught there",
    'gezien': 'the past participle of zien, taught there',
    'jongens': "the plural of jongen ('guys'), taught there",
    'elke': 'a form of elk, taught there',
    'onze': 'a form of ons "our", taught there',
    'hou': "'friendly', a rare adjective; its count is hou, the imperative of houden, taught there",
    'plannen': "'to plan'; its count is mostly plannen, the plural of plan",
    'beter': "filed as 'recovered'; its count is beter, the comparative of goed, shown on goed's card",
    # Read off the A2 ranking (2026-11-12).
    'gemaakt': 'the past participle of maken, taught there',
    'gegeven': 'the past participle of geven, taught there',
    'zoek': "'lost'; its count is zoek, the imperative and first person of zoeken, taught there",
    'help': 'an interjection; its count is help, the imperative of helpen, taught there',
    'goeie': 'a colloquial form of goed, taught there',
    'mis': "'mass (service)'; its count is mis 'wrong, amiss' and the imperative of missen",
    'verhalen': "'to narrate'; its count is verhalen, the plural of verhaal",
    'moorden': "'to murder'; its count is moorden, the plural of moord",
    'zinnen': "'to contemplate'; its count is zinnen, the plural of zin",
    'koppen': "'to head (a ball)'; its count is koppen, the plural of kop",
    'rechten': "'to straighten'; its count is rechten, the plural of recht",
    'buurten': "'to visit a neighbour'; its count is buurten, the plural of buurt",
    'gassen': "'to accelerate'; its count is gassen, the plural of gas",
    'landen': "'to land'; its count is mostly landen, the plural of land",
    'wateren': "'to water'; its count is wateren, the plural of water",
    'sporen': "'to spur'; its count is sporen, the plural of spoor",
    'kaarten': "'to play cards'; its count is kaarten, the plural of kaart",
    'doelen': "'to aim'; its count is doelen, the plural of doel",
    'prijzen': "'to praise'; its count is prijzen, the plural of prijs",
    'misten': "'to fog'; its count is misten, the past of missen",
    'wonden': "'to wound'; its count is wonden, the plural of wond",
    'stemmen': "'to vote'; its count is mostly stemmen, the plural of stem",
    'zakken': "'to sink, to fail'; its count is mostly zakken, the plural of zak",
    'eren': "'to honour'; its count is mostly the ending of other words' forms",
    'gevoelen': "'to feel', literary; its count is gevoelens, the plural of gevoel",
    'schuilen': "'to shelter'; its count is school, which Wiktionary lists as its past",
    'lek': "'leaky'; its count is lekker, which Wiktionary lists as its comparative",
    'leek': "'layman'; its count is leek, the past of lijken",
    'trouw': "'loyalty'; its count is trouw, the imperative of trouwen",
    'waard': "'innkeeper'; its count is waard 'worth'",
    'pap': "'porridge'; its count is pap 'dad', a nursery word",
    'slechte': "'bad person'; its count is slechte, the inflected form of slecht, taught there",
    'miss': "'beauty queen'; its count is the English word in the subtitles",
    'frank': "'frank'; its count is the name Frank",
    'peter': "'godfather'; its count is the name Peter",
    'jack': "'jacket'; its count is the name Jack",
    'joe': "an interjection; its count is the name Joe and the English 'you'",
    'uh': 'a hesitation sound, not a word to learn',
    'jezus': 'an exclamation, kept out with the swearing',
    'betaald': 'the past participle of betalen, taught there',
    'gebieden': "'to command'; its count is gebieden, the plural of gebied",
    'iedere': 'a form of ieder, taught on the same deck',
    # Read off the B1 ranking (2026-11-12).
    'bergen': "its count is bergen, the plural of berg",
    'winden': "its count is winden, the plural of wind",
    'bommen': "its count is bommen, the plural of bom",
    'manen': "its count is manen, the plural of maan",
    'huizen': "its count is huizen, the plural of huis",
    'katten': "its count is katten, the plural of kat",
    'kanten': "its count is kanten, the plural of kant",
    'bedrijven': "its count is bedrijven, the plural of bedrijf",
    'ballen': "its count is ballen, the plural of bal",
    'vuren': "its count is vuren, the plural of vuur",
    'grenzen': "its count is grenzen, the plural of grens",
    'dingen': "its count is dingen, the plural of ding",
    'nekken': "its count is nekken, the plural of nek",
    'uren': "its count is uren, the plural of uur",
    'stranden': "its count is stranden, the plural of strand",
    'kampen': "its count is kampen, the plural of kamp",
    'papieren': "its count is papieren, the plural of papier",
    'benen': "its count is benen, the plural of been",
    'banen': "its count is banen, the plural of baan",
    'beuren': "its count is beuren, the plural of beurs",
    'stoelen': "its count is stoelen, the plural of stoel",
    'wetten': "its count is wetten, the plural of wet",
    'vloeren': "its count is vloeren, the plural of vloer",
    'stormen': "its count is stormen, the plural of storm",
    'onderwerpen': "its count is onderwerpen, the plural of onderwerp",
    'ogen': "its count is ogen, the plural of oog",
    'schaduwen': "its count is schaduwen, the plural of schaduw",
    'klokken': "its count is klokken, the plural of klok",
    'boeien': "its count is boeien, the plural of boei",
    'bezwaren': "its count is bezwaren, the plural of bezwaar",
    'verloven': "its count is verloofd and verlof",
    'helen': "its count is the name Helen",
    'bob': "its count is the name Bob",
    'hongeren': "its count is honger, which Wiktionary lists as its first person",
    'kies': "its count is kies, the imperative of kiezen",
    'lassen': "its count is las, the past of lezen",
    'brak': "its count is brak, the past of breken",
    'wezen': "its count is wezen, the noun, and the forms of zijn",
    'ijzen': "its count is ijs",
    'wellen': "its count is wel",
    'aandenken': "its count is aan denken, the verb and its particle",
    'taxiën': "its count is taxi",
    'des': "its count is des, the old genitive article",
    'gezet': 'the past participle of zetten, taught there',
    'neergeschoten': 'the past participle of neerschieten',
    'gezeten': 'the past participle of zitten, taught there',
    'genoemd': 'the past participle of noemen',
    'vernietigd': 'the past participle of vernietigen, taught on the same deck',
    'verdiend': 'the past participle of verdienen, taught there',
    'vreemde': 'a nominalised form of vreemd, taught there',
    'rare': 'a nominalised form of raar, taught there',
    'blanke': 'a nominalised form of blank',
    'amerikaanse': 'the feminine of Amerikaan, taught on the same deck',
    'franse': 'a nominalised form of Frans',
    'duitse': 'a nominalised form of Duits, taught on the same deck',
    'beiden': 'a form of beide, taught on the same deck',
    'allen': 'a form of alle, taught there',
    'sommigen': 'a form of sommige, taught there',
    'vele': 'a form of veel, taught there',
    'vanmorgen': 'Wiktionary\'s entry is only "synonym of vanochtend", which this deck teaches',
    'gelukken': 'a Belgian synonym of lukken, taught there',
    'tuurlijk': 'a clipping of natuurlijk, taught there',
    'gaande': "filed as 'amazing, lit'; its count is the present participle of gaan",
    'demon': "Wiktionary's only sense is 'genius, lar'; the everyday word is demoon",
    'vandoor': 'used only in ervandoor',
    'der': 'an archaic form, not a word to learn',
    'parijs': "filed only as an adjective; its count is the city's name",
    'sheriff': 'an American office the subtitles translate, not Dutch life',
    'san': 'the Japanese honorific in the subtitles',
    'big': "'piglet'; its count is the English word in the subtitles",
    'high': 'the English word in the subtitles',
    'eh': 'a hesitation sound, not a word to learn', 'ah': 'an interjection, not a word to learn',
    'ha': 'an interjection, not a word to learn', 'huh': 'an interjection, not a word to learn',
    'wow': 'the English interjection', 'wauw': 'the English interjection, respelt',
    'jee': 'an interjection, not a word to learn',
    'godsnaam': 'an exclamation (in godsnaam), kept out with the swearing',
    'verdorie': 'a minced oath, kept out with the swearing',
    'potten': "its count is potten, the plural of pot",
    'boeren': "its count is boeren, the plural of boer",
    'beroepen': "its count is beroepen, the plural of beroep",
    'zomeren': "its count is zomers and the plural of zomer",
    'kim': "'horizon'; its count is the name Kim",
    'rus': "'sod of turf'; its count is Rus, a Russian, and the name",
    'link': "'dangerous'; its count is mostly the English noun link",
    'oudere': 'a nominalised form of oud, taught there',
    'neen': 'the stressed form of nee, taught there',
    'um': 'a hesitation sound, not a word to learn',
    'britse': 'a nominalised form of Brits',
    'donderen': "its count is donder, the oath, kept out with the swearing",
    'hemelsnaam': 'an exclamation (in hemelsnaam), kept out with the swearing',
}
EXCLUDE = {k: v for k, v in EXCLUDE.items() if v}

# Swearing and insults are never in a level deck.
SWEARS = {'kut', 'klootzak', 'lul', 'shit', 'fuck', 'kanker', 'tering', 'tyfus', 'godverdomme',
          'verdomme', 'hoer', 'kloot', 'eikel', 'trut', 'sukkel', 'idioot', 'neuken', 'pik',
          'teef', 'flikker', 'klote', 'mietje', 'stront', 'reet', 'kont', 'sodemieter', 'donder', 'bitch'}


def gloss_sig(L):
    return tuple(sorted({g['g'] for e in L['entries'] for g in e['glosses'] if not g['weak']}))[:4]


def usable(L):
    gl = [g for e in L['entries'] for g in e['glosses']]
    return any(not g['weak'] for g in gl)


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
            if w[:1] != w[:1].lower() and '=' + w in lex:
                # a capitalised word a lower-case headword shadows (`Engels`, not `engels`)
                L = lex['=' + w]
                k = '=' + w
            via = ''
            if L and 'alt_of' in L:
                # the common spelling of a word Wiktionary files under another :
                # the card prints the spelling written here and the target's meanings
                via = L['alt_of']
                tgt = lex.get(via)
                L = dict(tgt, word=L['word'], freq=max(L['freq'], tgt['freq'])) \
                    if tgt and 'entries' in tgt else None
            if not L or (pos and not any(e['pos'] == pos for e in L['entries'])):
                missing.append(item)
                continue
            seen.add(fold(w))
            rows.append({'key': k, 'via': via, 'word': L['word'], 'freq': L['freq'], 'pos': pos or '',
                         'source': 'inventory', 'topic': topic})
    n_inv = len(rows)
    sigs = {gloss_sig(lex[r['via']] if r['via'] else lex[r['key']]) for r in rows}
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
        if len(k) < 2 and k not in ('u',):
            continue
        # a MULTI-WORD lemma (tot ziens) is the inventory's to choose; the
        # fill's ranking of one is only an estimate (`extract.py`)
        if ' ' in k:
            continue
        if not usable(L) or L['freq'] < 1:
            continue
        # a lemma whose ONLY entries are phrases or proverbs belongs to the phrases deck
        if all(e['pos'] in ('phrase', 'proverb') for e in L['entries']):
            continue
        # AN ALTERNATIVE SPELLING THE LEVEL ALREADY HAS : Wiktionary gives both full entries, glossed
        # alike, so a lemma whose glosses are those of a word already chosen is the same word.
        sig = gloss_sig(L)
        if sig in sigs:
            continue
        sigs.add(sig)
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
