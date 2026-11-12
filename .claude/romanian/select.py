#!/usr/bin/env python3
"""The level's words: its inventory, then the commonest remaining lemmas.

    python3 select.py      (from the cache directory, by run.py)

Reads `lex.json` and `inventory.py`, writes `selected-<level>.json`: one row per
note, dealt by lemma frequency (the commonest first), each marked with where it
came from (`inventory` or `frequency`).

A WORD THE LEVELS BELOW TEACH IS NOT TAUGHT AGAIN (`ro_level.words_below`).

THE FILL'S EXCLUSIONS, each for a fault it produced on reading the ranking:
  · a lemma whose every sense is weak (rare, archaic, dialectal, poetic ...)
    -- the subtitles' count belongs to a commoner word it is spelt like;
  · a one-letter lemma that is not a word a beginner learns as one;
  · the hand list `EXCLUDE`, each line with its reason.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ro import fold
from ro_level import LEVEL, TARGET, f, words_below
from inventory import INVENTORY

# Read off the A1 ranking (2026-11-09).  Each with its reason.  Most are a
# closed-class headword whose spelling is also a commoner word's FORM, so the
# indeclinable-own-spelling rule (`extract.py`) handed it that form's count.
EXCLUDE = {
    'e': "its count is e, the short form of este 'is'; the card would open on the letter",
    'o': "its count is the article o 'a' and the pronoun o 'her', taught on un and el",
    'ai': "its count is ai 'you have', a form of avea",
    'au': "its count is au 'they have', a form of avea",
    'mă': "its count is the pronoun mă 'me', not the interjection",
    'mi': "its count is the clitic mi 'to me', not the note E",
    'ia': "its count is ia 'takes / take!', a form of lua",
    'bună': "its count is the feminine of bun 'good'; the greeting is a phrase",
    'mea': "taught on the card of meu, whose feminine it is",
    'vârtejire': "a rare noun whose generated table claims forms of vârteja",
    'ziua': "taught as zi 'day', whose definite form it is",
    'seara': "taught as seară 'evening', whose definite form it is",
    'noaptea': "taught as noapte 'night', whose definite form it is",
    'mie': "its count is the pronoun mie 'to me'; the number is the inventory's",
    'of': "an interjection the subtitles count from English lines",
    'k': "a letter, counted from text messages",
    'hei': "an interjection, counted from subtitles",
    'naiba': "the devil, in an oath (la naiba)",
    # read off the A2 ranking (2026-11-09)
    'geac': "its count is geacă 'jacket', whose forms it shares; the noun is a flag",
    'hain': "its count is haină 'coat', whose forms it shares",
    'tom': "its count is Tom, the name in every other subtitle line",
    'secund': "its count is secundă 'second (of time)', whose forms it shares",
    'mor': "its count is mor 'I die', a form of muri; the entry is a bear's growl",
    'cina': "its count is cină 'dinner', whose definite form it is",
    'câte': "a form of cât, taught in A1",
    'făcut': "the past participle of face, shown on its card",
    'revedere': "counted from la revedere, taught in A1",
    'gura': "its count is gura 'the mouth', a form of gură",
    'dimineața': "taught as dimineață 'morning', whose definite form it is",
    'uf': "an interjection, counted from subtitles",
    'ah': "an interjection, counted from subtitles",
    'adaptare': "counted from the subtitle files' own credit line (Adaptare: ...)",
    'fost': "the past participle of fi, shown on its card",
    'cui': "the dative of cine, shown on its card",
    # read off the B1 ranking (2026-11-12)
    'henry': "a name, counted from subtitles; the entry is the unit",
    'martin': "a name, counted from subtitles; the entry is a bird",
    'sir': "English 'sir', counted from subtitles",
    'team': "English 'team', counted from subtitles",
    'masa': "its count is masa 'the table', a form of masă (A1); the entry is 'to massage'",
    'modul': "its count is modul 'the way', a form of mod",
    'forma': "its count is forma 'the form', taught as formă",
    'data': "its count is data 'the date', a form of dată (A2)",
    'lumina': "its count is lumina 'the light', a form of lumină (A2)",
    'regula': "its count is regula 'the rule', a form of regulă",
    'ancheta': "its count is ancheta 'the inquiry', taught as anchetă",
    'aventura': "its count is aventura 'the adventure', a form of aventură",
    'pasa': "its count is (nu-mi) pasă, a form of păsa",
    'normală': "the feminine of normal; the entry is a teachers' college",
    'căsătoriu': "a rare entry whose count is căsătorit 'married'",
    'lis': "a rare adjective whose count is a name in the subtitles",
    'alică': "a rare noun whose count is the name Alice",
    'cec': "its card would be 'caecum'; the count is the cheque",
    'locație': "its card would be 'renting'; the count is the modern 'location'",
    'dejun': "counted from mic dejun, taught in A1",
    'ura': "its count is ura 'the hatred' (ură) and ura 'hurray'; the entry is 'to wish'; B1 teaches urî",
    'st': "an interjection, counted from subtitles",
    'trăiască': "the subjunctive of trăi, in trăiască ...! 'long live'",
    # PAST PARTICIPLES whose only card is the participle's own sense, shown on the verb's card
    'găsit': "the past participle of găsi", 'luat': "the past participle of lua",
    'judecat': "the past participle of judeca", 'prins': "the past participle of prinde",
    'ales': "the past participle of alege", 'pierdut': "the past participle of pierde",
    'unit': "the past participle of uni", 'crescut': "the past participle of crește",
    'speriat': "the past participle of speria", 'rănit': "the past participle of răni",
    'îndrăgostit': "the past participle of îndrăgosti", 'folosit': "the past participle of folosi",
    'distrus': "the past participle of distruge", 'surprins': "the past participle of surprinde",
    'implicat': "the past participle of implica", 'numit': "the past participle of numi",
    'invitat': "the past participle of invita", 'dispărut': "the past participle of dispărea",
    # read off the B2 ranking (2026-11-12)
    'susan': "a name, counted from subtitles; the entry is sesame",
    'elenă': "the name Elena; the entry is Greek",
    'dană': "the name Dana",
    'mason': "the name Mason",
    'mac': "the name Mac; the entry is the poppy",
    'mară': "the name Mara; the entry is a regional 'apple'",
    'franciscă': "the name Francisca",
    'florid': "the name Florida",
    'stană': "the name Stan",
    'maya': "the name Maya",
    'miss': "English, counted from subtitles",
    'lady': "English, counted from subtitles",
    'star': "English, counted from subtitles",
    'rock': "English, counted from subtitles",
    'show': "English, counted from subtitles",
    'house': "English, counted from subtitles",
    'green': "English, counted from subtitles",
    'inch': "English, counted from subtitles",
    'sire': "English, counted from subtitles",
    'cowboy': "English, counted from subtitles",
    'penny': "English, counted from subtitles",
    'baseball': "English, counted from subtitles",
    'cool': "English, counted from subtitles",
    'top': "English 'top', counted from subtitles; the entry is a ream",
    'for': "English 'for', counted from subtitles; the entry is a forum",
    'lux': "its count is lux 'luxury'; the entry is the unit",
    're': "a syllable counted from text; the entry is the note",
    'do': "a syllable counted from text; the entry is the note",
    'me': "an interjection, counted from subtitles",
    'ho': "an interjection, counted from subtitles",
    'ie': "counted from the clitic i-e; the entry is the embroidered blouse",
    'cală': "a rare noun counted from other forms",
    'spată': "its count is spate 'back', taught in A2",
    'colonelă': "its count is the vocative of colonel",
    'maximă': "the feminine of maxim; the entry is a maxim",
    'vara': "its count is vara 'the summer', a form of vară (A2)",
    'valea': "its count is valea 'the valley', a form of vale (A2)",
    'pasă': "its count is (nu-mi) pasă, a form of păsa",
    'panica': "its count is panica 'the panic', taught as panică",
    'lista': "its count is lista 'the list', a form of listă",
    'distanța': "its count is distanța 'the distance', a form of distanță",
    'amenda': "its count is amenda 'the fine', a form of amendă (B1)",
    'poza': "its count is poza 'the photo', a form of poză",
    'planta': "its count is planta 'the plant', a form of plantă",
    'limita': "its count is limita 'the limit', a form of limită (B1)",
    'alerta': "its count is alerta 'the alert', a form of alertă",
    'acuma': "a paragogic form of acum, taught in A1",
    'jumate': "a clipped form of jumătate, taught in A1",
    'pizză': "pizza is the standard spelling; the two would be one word on two cards",
    'sincronizare': "counted from the subtitle files' own credit line",
    'subtitrare': "counted from the subtitle files' own credit line",
    # B2's past participles whose only card is the participle's own sense
    'terminat': "the past participle of termina",
    'ascuns': "the past participle of ascunde",
    'rupt': "the past participle of rupe",
    'arestat': "the past participle of aresta",
    'născut': "the past participle of naște",
    'ras': "the past participle of rade",
    'îmbrăcat': "the past participle of îmbrăca",
    'prăjit': "the past participle of prăji",
    'convins': "the past participle of convinge",
    'drogat': "the past participle of droga",
    'ratat': "the past participle of rata",
    'răpit': "the past participle of răpi",
    'împușcat': "the past participle of împușca",
    'concediat': "the past participle of concedia",
    'tăiat': "the past participle of tăia",
    'construit': "the past participle of construi",
    'descoperit': "the past participle of descoperi",
    'creat': "the past participle of crea",
    'abandonat': "the past participle of abandona",
    'eliminat': "the past participle of elimina",
    'încuiat': "the past participle of încuia",
    'lăsat': "the past participle of lăsa",
    'ridicat': "the past participle of ridica",
    'separat': "the past participle of separa",
    'asociat': "the past participle of asocia",
    'condiționat': "the past participle of condiționa",
    'omorât': "the past participle of omorî",
    'acoperit': "the past participle of acoperi",
    'aruncat': "the past participle of arunca",
    'bătut': "the past participle of bate",
    'adus': "the past participle of aduce",
    'condus': "the past participle of conduce",
    'dus': "the past participle of duce",
    'stabilit': "the past participle of stabili", 'orbit': "the past participle of orbi",
    'mel': "the name Mel; the entry is the unit",
    # read off the C1 ranking (2026-11-12)
    'veronică': "the name Veronica; the entry is the speedwell",
    'benjamin': "the name Benjamin",
    'graham': "the name Graham",
    'superman': "a film character",
    'batman': "a film character; the entry is a batsman",
    'amelie': "the name Amélie",
    'coree': "counted from Coreea 'Korea'; the entry is chorea",
    'andrea': "the name Andrea",
    'calvin': "the name Calvin",
    'dexter': "the name Dexter",
    'get': "English 'get', counted from subtitles; the entry is a Getan",
    'grecie': "counted from Grecia 'Greece'; the entry is the Greek language",
    'pentagon': "the Pentagon",
    'cezar': "the name Caesar",
    'fox': "English, counted from subtitles",
    'phoenix': "English, counted from subtitles",
    'avenue': "English, counted from subtitles",
    'flash': "English, counted from subtitles",
    'cash': "English, counted from subtitles",
    'boom': "English, counted from subtitles",
    'gentleman': "English, counted from subtitles",
    'dog': "English, counted from subtitles",
    'porter': "English, counted from subtitles",
    'bang': "an interjection, counted from subtitles",
    'be': "an interjection, counted from subtitles",
    'bum': "an interjection, counted from subtitles",
    'tocilar': "its count is the slang 'swot'; the entry is a knife-grinder",
    'grave': "its count is the plural of grav; the entry is an adverb",
    'vece': "its count is the WC (veceu); the entry is a council",
    'scrisă': "the feminine of scris; the entry is 'fate'",
    'inițială': "one word with inițial on two cards",
    'iută': "its count is iute 'quick'; the entry is jute",
    'bănuț': "its count is the coin; the entry is the daisy",
    'rotilă': "a rare noun counted from other forms",
    'boș': "a regional word counted from other forms",
    'scurte': "a plural form of scurt (A1)",
    'țestos': "a rare adjective counted from other forms",
    # C1's past participles whose only card is the participle's own sense
    'eliberat': "the past participle of elibera",
    'impresionat': "the past participle of impresiona",
    'lipsit': "the past participle of lipsi",
    'iertat': "the past participle of ierta",
    'afectat': "the past participle of afecta",
    'uitat': "the past participle of uita",
    'considerat': "the past participle of considera",
    'rezolvat': "the past participle of rezolva",
    'realizat': "the past participle of realiza",
    'aranjat': "the past participle of aranja",
    'infectat': "the past participle of infecta",
    'salvat': "the past participle of salva",
    'atras': "the past participle of atrage",
    'petrecut': "the past participle of petrece",
    'ars': "the past participle of arde",
    'atacat': "the past participle of ataca",
    'oprit': "the past participle of opri",
    'informat': "the past participle of informa",
    'protejat': "the past participle of proteja",
    'scăzut': "the past participle of scădea",
    'îngrozit': "the past participle of îngrozi",
    'forțat': "the past participle of forța",
    'pedepsit': "the past participle of pedepsi",
    'supus': "the past participle of supune",
    'expus': "the past participle of expune",
    'întins': "the past participle of întinde",
    'otrăvit': "the past participle of otrăvi",
    'limitat': "the past participle of limita",
    'binecuvântat': "the past participle of binecuvânta",
    'jurat': "the past participle of jura",
    'anulat': "the past participle of anula",
    'epuizat': "the past participle of epuiza",
    'căzut': "the past participle of cădea",
    'suspendat': "the past participle of suspenda",
    'publicat': "the past participle of publica",
    'coordonat': "the past participle of coordona",
    'slăbit': "the past participle of slăbi",
    'îndoit': "the past participle of îndoi",
    'pornit': "the past participle of porni",
    'citit': "the past participle of citi",
    'controlat': "the past participle of controla", 'văzut': "the past participle of vedea",
    'concurent': "its one gloss is 'concurrent'; the everyday 'competitor' is not given",
    'gratie': "its count is grație 'grace' written bare; the entry is an instrument of torture",
    'dong': "a sound, counted from subtitles; the entry is the currency",
    'live': "English, counted from subtitles",
}

# Swearing and insults are never in a level deck.
SWEARS = {'rahat', 'dracu', 'drac', 'târfă', 'cur', 'nenorocit', 'idiot', 'cretin', 'tâmpit',
          'fraier', 'futu', 'pizdă', 'pulă', 'muie', 'bou', 'jigodie', 'bulangiu', 'curvă',
          'porcărie', 'afurisit', 'cățea', 'bastard', 'dobitoc', 'păsărică', 'porno',
          'țâță', 'imbecil', 'retardat', 'homo'}


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
            via = ''
            if L and 'alt_of' in L:
                # the common spelling of a word Wiktionary files under another:
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
        if len(k) < 2:
            continue
        # a CONTRACTION (n-am, s-a, i-am) is two words joined, taught by its parts
        if '-' in k:
            continue
        # a MULTI-WORD lemma (bună ziua, de la) is the inventory's to choose; the
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
